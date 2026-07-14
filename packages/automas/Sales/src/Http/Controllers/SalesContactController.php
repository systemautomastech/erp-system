<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesOrder;

use Automas\Sales\Models\SalesCase;
use Automas\Sales\Models\SalesCaseType;
use Automas\Sales\Models\SalesShippingProvider;
use Automas\Sales\Http\Requests\StoreSalesContactRequest;
use Automas\Sales\Http\Requests\UpdateSalesContactRequest;
use App\Models\User;
use Automas\Sales\Events\CreateSalesContact;
use Automas\Sales\Events\UpdateSalesContact;
use Automas\Sales\Events\DestroySalesContact;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;
use Automas\Sales\Models\SalesOpportunity;
use App\Models\EmailTemplate;

class SalesContactController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-contacts')) {
            $contacts = SalesContact::with(['assignUser', 'account'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-contacts')) {
                        $q->where('sales_contacts.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-contacts')) {
                        $q->where(function ($query) {
                            $query->where('sales_contacts.creator_id', Auth::id())
                                ->orWhere('sales_contacts.assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where(function ($query) {
                    $query->where('sales_contacts.name', 'like', '%' . request('name') . '%')
                        ->orWhere('sales_contacts.email', 'like', '%' . request('name') . '%');
                }))
                ->when(request('account_id'), fn($q) => $q->where('sales_contacts.account_id', request('account_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('sales_contacts.assign_user_id', request('assign_user_id')))
                ->when(request('is_active') !== null, fn($q) => $q->where('sales_contacts.is_active', request('is_active')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');

                    if ($sort === 'account') {
                        return $q->join('sales_accounts', 'sales_contacts.account_id', '=', 'sales_accounts.id')
                            ->orderBy('sales_accounts.name', $direction)
                            ->select('sales_contacts.*');
                    }

                    return $q->orderBy($sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accounts = $this->getFilteredAccounts();

            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Contacts/Index', [
                'contacts' => $contacts,
                'accounts' => $accounts,
                'users' => $users,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesContactRequest $request)
    {
        if (Auth::user()->can('create-sales-contacts')) {
            $validated = $request->validated();

            $contact = new SalesContact();
            $contact->name = $validated['name'];
            $contact->account_id = $validated['account_id'] ?? null;
            $contact->email = $validated['email'];
            $contact->phone = $validated['phone'];
            $contact->address = $validated['address'];
            $contact->city = $validated['city'];
            $contact->state = $validated['state'];
            $contact->postal_code = $validated['postal_code'];
            $contact->country = $validated['country'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $contact->assign_user_id = Auth::id();
            } else {
                $contact->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $contact->description = $validated['description'] ?? null;
            $contact->is_active = $validated['is_active'] ?? true;
            $contact->job_title = $validated['job_title'] ?? null;
            $contact->lead_source = $validated['lead_source'] ?? null;
            $contact->department = $validated['department'] ?? null;
            $contact->tags = !empty($validated['tags']) ? json_encode($validated['tags']) : null;
            $contact->social_media_urls = $validated['social_media_urls'] ?? null;
            $contact->preferred_contact_method = $validated['preferred_contact_method'] ?? null;
            $contact->creator_id = Auth::id();
            $contact->created_by = creatorId();
            $contact->save();

            CreateSalesContact::dispatch($request, $contact);

            if(company_setting('Create Contact') == 'on') {
                $assignedUser = User::find($contact->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $contact->load(['account']);
                    $emailData = [
                        'contact_name' => $contact->name ?? '',
                        'contact_email' => $contact->email ?? '',
                        'contact_phone' => $contact->phone ?? '',
                        'job_title' => $contact->job_title ?? '',
                        'contact_department' => $contact->department ?? '',
                        'contact_account' => $contact->account->name ?? '',
                        'contact_address' => $contact->address ?? '',
                        'contact_city' => $contact->city ?? '',
                        'contact_state' => $contact->state ?? '',
                        'contact_country' => $contact->country ?? '',
                        'contact_postal_code' => $contact->postal_code ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Create Contact', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return back()
                            ->with('success', __('The contact has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return back()->with('success', __('The contact has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesContact $contact)
    {
        if (Auth::user()->can('view-sales-contacts')) {
            if (!$this->canAccessContact($contact)) {
                return redirect()->route('sales.contacts.index')->with('error', __('Access denied'));
            }

            $contact->load(['assignUser', 'account', 'streams']);

            // Filter opportunities based on permissions
            $opportunities = $contact->opportunities()->with(['assignUser', 'stage', 'account'])
                ->when(!Auth::user()->can('manage-any-sales-opportunities'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-opportunities')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Filter quotes based on permissions
            $quotes = SalesQuote::with(['assignUser', 'account'])
                ->where(function ($q) use ($contact) {
                    $q->where('billing_contact_id', $contact->id)
                        ->orWhere('shipping_contact_id', $contact->id);
                })
                ->when(!Auth::user()->can('manage-any-sales-quotes'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-quotes')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Filter sales orders based on permissions
            $salesOrders = SalesOrder::with(['assignUser', 'account'])
                ->where(function ($q) use ($contact) {
                    $q->where('billing_contact_id', $contact->id)
                        ->orWhere('shipping_contact_id', $contact->id);
                })
                ->when(!Auth::user()->can('manage-any-sales-orders'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-orders')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();


            // Filter cases based on permissions
            $cases = SalesCase::with(['account', 'contact', 'caseType', 'assignUser'])
                ->where('contact_id', $contact->id)
                ->when(!Auth::user()->can('manage-any-sales-cases'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-cases')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Filter calls based on permissions - both attendees and parent relationship
            $calls = SalesCall::with('assignedUser')
                ->where(function ($q) use ($contact) {
                    $q->whereJsonContains('attendees_contacts', $contact->id)
                        ->orWhere(function ($query) use ($contact) {
                            $query->where('parent_type', 'contact')
                                ->where('parent_id', $contact->id);
                        });
                })
                ->when(!Auth::user()->can('manage-any-sales-calls'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-calls')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assigned_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Filter meetings based on permissions - both attendees and parent relationship
            $meetings = SalesMeeting::with('assignedUser')
                ->where(function ($q) use ($contact) {
                    $q->whereJsonContains('attendees_contacts', $contact->id)
                        ->orWhere(function ($query) use ($contact) {
                            $query->where('parent_type', 'contact')
                                ->where('parent_id', $contact->id);
                        });
                })
                ->when(!Auth::user()->can('manage-any-sales-meetings'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-meetings')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assigned_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Get case types
            $caseTypes = $this->getFilteredCaseTypes();

            // Get users for opportunity assignment
            $users = $this->getFilteredUsers();

            // Get accounts for opportunity creation
            $accounts = $this->getFilteredAccounts();

            // Get opportunity stages
            $stages = $this->getFilteredStages();

            // Get shipping providers for quotes
            $shippingProviders = $this->getFilteredShippingProviders();

            // Get all contacts for quote creation
            $contacts = $this->getFilteredContacts();

            // Get all opportunities for quote creation
            $allOpportunities = $this->getFilteredAllOpportunities();
            $allQuotes = $this->getFilteredAllQuotes();
            $allSalesOrders = $this->getFilteredAllSalesOrders();

            return Inertia::render('Sales/Contacts/Show', [
                'contact' => $contact,
                'streams' => $contact->streams,
                'opportunities' => $opportunities,
                'quotes' => $quotes,
                'salesOrders' => $salesOrders,

                'cases' => $cases,
                'calls' => $calls,
                'meetings' => $meetings,
                'users' => $users,
                'accounts' => $accounts,
                'contacts' => $contacts,
                'allOpportunities' => $allOpportunities,
                'allQuotes' => $allQuotes,
                'allSalesOrders' => $allSalesOrders,
                'stages' => $stages,
                'caseTypes' => $caseTypes,
                'shippingProviders' => $shippingProviders,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesContactRequest $request, SalesContact $contact)
    {
        if (Auth::user()->can('edit-sales-contacts')) {
            if (!$this->canAccessContact($contact)) {
                return redirect()->route('sales.contacts.index')->with('error', __('Access denied'));
            }

            $validated = $request->validated();

            $contact->name = $validated['name'];
            $contact->account_id = $validated['account_id'] ?? null;
            $contact->email = $validated['email'];
            $contact->phone = $validated['phone'];
            $contact->address = $validated['address'];
            $contact->city = $validated['city'];
            $contact->state = $validated['state'];
            $contact->postal_code = $validated['postal_code'];
            $contact->country = $validated['country'];
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $contact->assign_user_id = Auth::id();
            } else {
                $contact->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $contact->description = $validated['description'] ?? null;
            $contact->is_active = $validated['is_active'] ?? true;
            $contact->job_title = $validated['job_title'] ?? null;
            $contact->lead_source = $validated['lead_source'] ?? null;
            $contact->department = $validated['department'] ?? null;
            $contact->tags = !empty($validated['tags']) ? json_encode($validated['tags']) : null;
            $contact->social_media_urls = $validated['social_media_urls'] ?? null;
            $contact->preferred_contact_method = $validated['preferred_contact_method'] ?? null;
            $contact->save();

            UpdateSalesContact::dispatch($request, $contact);

            return back()->with('success', __('The contact details are updated successfully.'));
        } else {
            return redirect()->route('sales.contacts.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesContact $contact)
    {
        if (Auth::user()->can('delete-sales-contacts')) {
            if (!$this->canAccessContact($contact)) {
                return back()->with('error', __('Permission denied'));
            }

            DestroySalesContact::dispatch($contact);

            $contact->delete();

            return back()->with('success', __('The contact has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }



    private function canAccessContact(SalesContact $contact)
    {
        if (Auth::user()->can('manage-any-sales-contacts')) {
            return $contact->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-contacts')) {
            return $contact->creator_id == Auth::id() || $contact->assign_user_id == Auth::id();
        }
        return false;
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
            ->where('is_active', true)
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
            ->select('id', 'name', 'account_id')->get();
    }

    private function getFilteredCaseTypes()
    {
        return SalesCaseType::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-case-types'), function ($q) {
                if (Auth::user()->can('manage-own-sales-case-types')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'type')->get();
    }

    private function getFilteredStages()
    {
        return SalesOpportunityStage::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-opportunity-stages'), function ($q) {
                if (Auth::user()->can('manage-own-sales-opportunity-stages')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->orderBy('order')
            ->select('id', 'name', 'color')
            ->get();
    }

    private function getFilteredShippingProviders()
    {
        return SalesShippingProvider::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-shipping-providers'), function ($q) {
                if (Auth::user()->can('manage-own-shipping-providers')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')
            ->get();
    }

    private function getFilteredAllOpportunities()
    {
        return SalesOpportunity::where('created_by', creatorId())
            ->where('is_active', true)
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
            ->select('id', 'name', 'account_id')->get();
    }

    private function getFilteredAllQuotes()
    {
        return SalesQuote::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-quotes'), function ($q) {
                if (Auth::user()->can('manage-own-sales-quotes')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name', 'quote_number', 'account_id')->get();
    }

    private function getFilteredAllSalesOrders()
    {
        return SalesOrder::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-orders'), function ($q) {
                if (Auth::user()->can('manage-own-sales-orders')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name', 'order_number', 'account_id')->get();
    }
}
