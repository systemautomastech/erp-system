<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesMeeting;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Http\Requests\StoreSalesMeetingRequest;
use Automas\Sales\Http\Requests\UpdateSalesMeetingRequest;
use Automas\Sales\Events\CreateSalesMeeting;
use Automas\Sales\Events\UpdateSalesMeeting;
use Automas\Sales\Events\DestroySalesMeeting;
use App\Models\User;
use App\Models\EmailTemplate;

class SalesMeetingController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-meetings')) {
            $salesMeetings = SalesMeeting::with(['account', 'assignedUser'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-meetings')) {
                        $q->where('sales_meetings.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-meetings')) {
                        $q->where(function ($query) {
                            $query->where('sales_meetings.creator_id', Auth::id())
                                ->orWhere('sales_meetings.assigned_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where('sales_meetings.name', 'like', '%' . request('name') . '%'))
                ->when(request('status'), fn($q) => $q->where('sales_meetings.status', request('status')))
                ->when(request('account_id'), fn($q) => $q->where('sales_meetings.account_id', request('account_id')))
                ->when(request('assigned_user_id'), fn($q) => $q->where('sales_meetings.assigned_user_id', request('assigned_user_id')))
                ->when(request('parent_type'), fn($q) => $q->where('sales_meetings.parent_type', request('parent_type')))
                ->when(request('date_from'), fn($q) => $q->whereDate('sales_meetings.start_date', '>=', request('date_from')))
                ->when(request('date_to'), fn($q) => $q->whereDate('sales_meetings.start_date', '<=', request('date_to')))
                ->when(request('end_date_from'), fn($q) => $q->whereDate('sales_meetings.end_date', '>=', request('end_date_from')))
                ->when(request('end_date_to'), fn($q) => $q->whereDate('sales_meetings.end_date', '<=', request('end_date_to')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $sortDirection = request('sort_direction', 'asc');

                    // Validate sort direction
                    $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';

                    // Define allowed sort fields
                    $allowedSorts = ['name', 'status', 'parent_type', 'start_date', 'account', 'assigned_user'];

                    if (!in_array($sort, $allowedSorts)) {
                        return $q->latest();
                    }

                    if ($sort === 'account') {
                        return $q->leftJoin('sales_accounts', 'sales_meetings.account_id', '=', 'sales_accounts.id')
                            ->orderBy('sales_accounts.name', $sortDirection)
                            ->select('sales_meetings.*');
                    }

                    if ($sort === 'assigned_user') {
                        return $q->leftJoin('users', 'sales_meetings.assigned_user_id', '=', 'users.id')
                            ->orderBy('users.name', $sortDirection)
                            ->select('sales_meetings.*');
                    }

                    return $q->orderBy('sales_meetings.' . $sort, $sortDirection);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Meetings/Index', [
                'salesMeetings' => $salesMeetings,
                'accounts' => $accounts,
                'users' => $users,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesMeetingRequest $request)
    {
        if (Auth::user()->can('create-sales-meetings')) {
            $validated = $request->validated();

            $salesMeeting = new SalesMeeting();
            $salesMeeting->name = $validated['name'];
            $salesMeeting->status = $validated['status'];
            $salesMeeting->meeting_type = $validated['meeting_type'];
            $salesMeeting->start_date = $validated['start_date'];
            $salesMeeting->end_date = $validated['end_date'];
            $salesMeeting->parent_type = $validated['parent_type'];
            $salesMeeting->parent_id = $validated['parent_id'];
            $salesMeeting->account_id = $validated['account_id'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                $salesMeeting->assigned_user_id = Auth::id();
            } else {
                $salesMeeting->assigned_user_id = $validated['assigned_user_id'] ?? null;
            }
            $salesMeeting->description = $validated['description'];
            $salesMeeting->attendees_users = $validated['attendees_users'];
            $salesMeeting->attendees_contacts = $validated['attendees_contacts'];
            $salesMeeting->creator_id = Auth::id();
            $salesMeeting->created_by = creatorId();
            $salesMeeting->save();

            CreateSalesMeeting::dispatch($request, $salesMeeting);

            if(company_setting('Create Meeting') == 'on' && (!empty($salesMeeting->attendees_users) || !empty($salesMeeting->attendees_contacts))) {
                $attendeeUsers = User::whereIn('id', $salesMeeting->attendees_users ?? [])->get();
                $attendeeContacts = SalesContact::whereIn('id', $salesMeeting->attendees_contacts ?? [])->get();
                
                $attendeesList = $attendeeUsers->pluck('name')->merge($attendeeContacts->pluck('name'))->implode(', ');
                $meetingDate = \Carbon\Carbon::parse($salesMeeting->start_date)->format('d M, Y');
                $meetingTime = \Carbon\Carbon::parse($salesMeeting->start_date)->format('h:i A') . ' - ' . \Carbon\Carbon::parse($salesMeeting->end_date)->format('h:i A');
                
                $emailData = [
                    'meeting_title' => $salesMeeting->name ?? '',
                    'meeting_date' => $meetingDate,
                    'meeting_time' => $meetingTime,
                    'meeting_location' => $salesMeeting->meeting_type ?? 'Online',
                    'meeting_description' => $salesMeeting->description ?? '',
                    'organizer_name' => Auth::user()->name ?? '',
                    'attendees_list' => $attendeesList ?: 'No attendees',
                ];
                
                $memberEmails = $attendeeUsers->pluck('email')->merge($attendeeContacts->pluck('email')->filter())->toArray();
                if(!empty($memberEmails)) {
                    $message = EmailTemplate::sendEmailTemplate('Create Meeting', $memberEmails, $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return back()
                            ->with('success', __('The meeting has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }
            return back()->with('success', __('The meeting has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesMeeting $salesMeeting)
    {
        if (Auth::user()->can('view-sales-meetings')) {
            if (!$this->canAccessMeeting($salesMeeting)) {
                return redirect()->route('sales.meetings.index')->with('error', __('Access denied'));
            }
            $salesMeeting->load(['account', 'assignedUser', 'creator']);

            // Load parent based on type
            $parent = null;
            if ($salesMeeting->parent_type && $salesMeeting->parent_id) {
                switch ($salesMeeting->parent_type) {
                    case 'account':
                        $parent = SalesAccount::find($salesMeeting->parent_id);
                        break;
                    case 'contact':
                        $parent = SalesContact::find($salesMeeting->parent_id);
                        break;
                    case 'opportunity':
                        $parent = SalesOpportunity::find($salesMeeting->parent_id);
                        break;
                    case 'case':
                        $parent = SalesCase::find($salesMeeting->parent_id);
                        break;
                }
            }

            // Load attendee users and contacts with names
            $attendeeUsers = [];
            $attendeeContacts = [];

            if ($salesMeeting->attendees_users && is_array($salesMeeting->attendees_users)) {
                $attendeeUsers = User::whereIn('id', $salesMeeting->attendees_users)
                    ->select('id', 'name')
                    ->get();
            }

            if ($salesMeeting->attendees_contacts && is_array($salesMeeting->attendees_contacts)) {
                $attendeeContacts = SalesContact::whereIn('id', $salesMeeting->attendees_contacts)
                    ->select('id', 'name')
                    ->get();
            }
            return Inertia::render('Sales/Meetings/Show', [
                'salesMeeting' => $salesMeeting,
                'parent' => $parent,
                'attendeeUsers' => $attendeeUsers,
                'attendeeContacts' => $attendeeContacts,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesMeetingRequest $request, SalesMeeting $salesMeeting)
    {
        if (Auth::user()->can('edit-sales-meetings')) {
            $validated = $request->validated();

            $salesMeeting->name = $validated['name'];
            $salesMeeting->status = $validated['status'];
            $salesMeeting->meeting_type = $validated['meeting_type'];
            $salesMeeting->start_date = $validated['start_date'];
            $salesMeeting->end_date = $validated['end_date'];
            $salesMeeting->parent_type = $validated['parent_type'];
            $salesMeeting->parent_id = $validated['parent_id'];
            $salesMeeting->account_id = $validated['account_id'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                $salesMeeting->assigned_user_id = Auth::id();
            } else {
                $salesMeeting->assigned_user_id = $validated['assigned_user_id'] ?? null;
            }
            $salesMeeting->description = $validated['description'];
            $salesMeeting->attendees_users = $validated['attendees_users'];
            $salesMeeting->attendees_contacts = $validated['attendees_contacts'];
            $salesMeeting->save();

            UpdateSalesMeeting::dispatch($request, $salesMeeting);

            return back()->with('success', __('The meeting details are updated successfully.'));
        } else {
            return redirect()->route('sales.meetings.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesMeeting $salesMeeting)
    {
        if (Auth::user()->can('delete-sales-meetings')) {
            DestroySalesMeeting::dispatch($salesMeeting);
            $salesMeeting->delete();

            return back()->with('success', __('The meeting has been deleted.'));
        } else {
            return redirect()->route('sales.meetings.index')->with('error', __('Permission denied'));
        }
    }

    public function getParentUsers()
    {
        $parentType = request('parent_type');
        $records = collect();

        if ($parentType) {
            switch ($parentType) {
                case 'account':
                    $records = $this->getFilteredAccounts();
                    break;
                case 'contact':
                    $records = $this->getFilteredContacts();
                    break;
                case 'opportunity':
                    $records = $this->getFilteredOpportunities();
                    break;
                case 'case':
                    $records = $this->getFilteredCases();
                    break;
            }
        }

        return response()->json($records);
    }

    public function getUsers()
    {
        return response()->json($this->getFilteredUsers());
    }

    public function getParentOptions()
    {
        $options = [
            ['type' => 'account', 'name' => 'Account'],
            ['type' => 'contact', 'name' => 'Contact'],
            ['type' => 'opportunity', 'name' => 'Opportunity'],
            ['type' => 'case', 'name' => 'Case']
        ];

        return response()->json($options);
    }

    private function getFilteredUsers()
    {
        return User::emp()->where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-users'), function ($q) {
                if (Auth::user()->can('manage-own-users')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredAccounts()
    {
        return SalesAccount::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-accounts'), function ($q) {
                if (Auth::user()->can('manage-own-sales-accounts')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredContacts()
    {
        return SalesContact::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-contacts'), function ($q) {
                if (Auth::user()->can('manage-own-sales-contacts')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredOpportunities()
    {
        return SalesOpportunity::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-opportunities'), function ($q) {
                if (Auth::user()->can('manage-own-sales-opportunities')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredCases()
    {
        return SalesCase::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-cases'), function ($q) {
                if (Auth::user()->can('manage-own-sales-cases')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function canAccessMeeting(SalesMeeting $salesMeeting)
    {
        if (Auth::user()->can('manage-any-sales-meetings')) {
            return $salesMeeting->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-meetings')) {
            return $salesMeeting->creator_id == Auth::id() || $salesMeeting->assigned_user_id == Auth::id();
        } else {
            return false;
        }
    }
}
