<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Http\Requests\StoreSalesCallRequest;
use Automas\Sales\Http\Requests\UpdateSalesCallRequest;
use Automas\Sales\Events\CreateSalesCall;
use Automas\Sales\Events\UpdateSalesCall;
use Automas\Sales\Events\DestroySalesCall;
use App\Models\User;

class SalesCallController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-calls')) {
            $salesCalls = SalesCall::with(['account', 'assignedUser'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-calls')) {
                        $q->where('sales_calls.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-calls')) {
                        $q->where(function ($query) {
                            $query->where('sales_calls.creator_id', Auth::id())
                                ->orWhere('sales_calls.assigned_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where('sales_calls.name', 'like', '%' . request('name') . '%'))
                ->when(request('status'), fn($q) => $q->where('sales_calls.status', request('status')))
                ->when(request('direction'), fn($q) => $q->where('sales_calls.direction', request('direction')))
                ->when(request('account_id'), fn($q) => $q->where('sales_calls.account_id', request('account_id')))
                ->when(request('assigned_user_id'), fn($q) => $q->where('sales_calls.assigned_user_id', request('assigned_user_id')))
                ->when(request('parent_type'), fn($q) => $q->where('sales_calls.parent_type', request('parent_type')))
                ->when(request('date_from'), fn($q) => $q->whereDate('sales_calls.start_date', '>=', request('date_from')))
                ->when(request('date_to'), fn($q) => $q->whereDate('sales_calls.start_date', '<=', request('date_to')))
                ->when(request('end_date_from'), fn($q) => $q->whereDate('sales_calls.end_date', '>=', request('end_date_from')))
                ->when(request('end_date_to'), fn($q) => $q->whereDate('sales_calls.end_date', '<=', request('end_date_to')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $sortDirection = request('sort_direction', 'asc');
                    
                    // Validate sort direction
                    $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';
                    
                    // Define allowed sort fields
                    $allowedSorts = ['name', 'start_date', 'account'];
                    
                    if (!in_array($sort, $allowedSorts)) {
                        return $q->latest();
                    }

                    if ($sort === 'account') {
                        return $q->leftJoin('sales_accounts', 'sales_calls.account_id', '=', 'sales_accounts.id')
                            ->orderBy('sales_accounts.name', $sortDirection)
                            ->select('sales_calls.*');
                    }

                    return $q->orderBy($sort, $sortDirection);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Calls/Index', [
                'salesCalls' => $salesCalls,
                'accounts' => $accounts,
                'users' => $users,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesCallRequest $request)
    {
        if (Auth::user()->can('create-sales-calls')) {
            $validated = $request->validated();

            $salesCall = new SalesCall();
            $salesCall->name = $validated['name'];
            $salesCall->status = $validated['status'];
            $salesCall->start_date = $validated['start_date'];
            $salesCall->end_date = $validated['end_date'];
            $salesCall->direction = $validated['direction'];
            $salesCall->parent_type = $validated['parent_type'];
            $salesCall->parent_id = $validated['parent_id'];
            $salesCall->account_id = $validated['account_id'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                $salesCall->assigned_user_id = Auth::id();
            } else {
                $salesCall->assigned_user_id = $validated['assigned_user_id'] ?? null;
            }
            $salesCall->description = $validated['description'];
            $salesCall->attendees_users = $validated['attendees_users'];
            $salesCall->attendees_contacts = $validated['attendees_contacts'];
            $salesCall->creator_id = Auth::id();
            $salesCall->created_by = creatorId();
            $salesCall->save();

            CreateSalesCall::dispatch($request, $salesCall);

            return back()->with('success', __('The call has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesCall $salesCall)
    {
        if (Auth::user()->can('view-sales-calls')) {
            if (!$this->canAccessCall($salesCall)) {
                return redirect()->route('sales.calls.index')->with('error', __('Access denied'));
            }
            $salesCall->load(['account', 'assignedUser', 'creator']);

            // Load parent based on type
            $parent = null;
            if ($salesCall->parent_type && $salesCall->parent_id) {
                switch ($salesCall->parent_type) {
                    case 'account':
                        $parent = SalesAccount::find($salesCall->parent_id);
                        break;
                    case 'contact':
                        $parent = SalesContact::find($salesCall->parent_id);
                        break;
                    case 'opportunity':
                        $parent = SalesOpportunity::find($salesCall->parent_id);
                        break;
                    case 'case':
                        $parent = SalesCase::find($salesCall->parent_id);
                        break;
                }
            }

            // Load attendee users and contacts with names
            $attendeeUsers = [];
            $attendeeContacts = [];

            if ($salesCall->attendees_users && is_array($salesCall->attendees_users)) {
                $attendeeUsers = User::whereIn('id', $salesCall->attendees_users)
                    ->select('id', 'name')
                    ->get();
            }

            if ($salesCall->attendees_contacts && is_array($salesCall->attendees_contacts)) {
                $attendeeContacts = SalesContact::whereIn('id', $salesCall->attendees_contacts)
                    ->select('id', 'name')
                    ->get();
            }

            return Inertia::render('Sales/Calls/Show', [
                'salesCall' => $salesCall,
                'parent' => $parent,
                'attendeeUsers' => $attendeeUsers,
                'attendeeContacts' => $attendeeContacts,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesCallRequest $request, SalesCall $salesCall)
    {
        if (Auth::user()->can('edit-sales-calls')) {
            $validated = $request->validated();

            $salesCall->name = $validated['name'];
            $salesCall->status = $validated['status'];
            $salesCall->start_date = $validated['start_date'];
            $salesCall->end_date = $validated['end_date'];
            $salesCall->direction = $validated['direction'];
            $salesCall->parent_type = $validated['parent_type'];
            $salesCall->parent_id = $validated['parent_id'];
            $salesCall->account_id = $validated['account_id'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                $salesCall->assigned_user_id = Auth::id();
            } else {
                $salesCall->assigned_user_id = $validated['assigned_user_id'] ?? null;
            }
            $salesCall->description = $validated['description'];
            $salesCall->attendees_users = $validated['attendees_users'];
            $salesCall->attendees_contacts = $validated['attendees_contacts'];
            $salesCall->save();

            UpdateSalesCall::dispatch($request, $salesCall);

            return back()->with('success', __('The call details are updated successfully.'));
        } else {
            return redirect()->route('sales.calls.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesCall $salesCall)
    {
        if (Auth::user()->can('delete-sales-calls')) {
            DestroySalesCall::dispatch($salesCall);
            $salesCall->delete();

            return back()->with('success', __('The call has been deleted.'));
        } else {
            return redirect()->route('sales.calls.index')->with('error', __('Permission denied'));
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

    private function canAccessCall(SalesCall $salesCall)
    {
        if (Auth::user()->can('manage-any-sales-calls')) {
            return $salesCall->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-calls')) {
            return $salesCall->creator_id == Auth::id() || $salesCall->assigned_user_id == Auth::id();
        } else {
            return false;
        }
    }
}
