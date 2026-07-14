<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesAccountType;
use Automas\Sales\Models\SalesAccountIndustry;
use Automas\Sales\Models\SalesDocumentType;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Models\SalesCaseType;
use Automas\Sales\Models\SalesShippingProvider;
use Automas\Sales\Http\Requests\StoreSalesAccountRequest;
use Automas\Sales\Http\Requests\UpdateSalesAccountRequest;
use App\Models\User;
use Automas\Sales\Events\CreateSalesAccount;
use Automas\Sales\Events\UpdateSalesAccount;
use Automas\Sales\Events\DestroySalesAccount;
use App\Models\EmailTemplate;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesDocumentFolder;
use Automas\Sales\Models\SalesDocument;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesQuote;
use App\Models\Warehouse;


class SalesAccountController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-accounts')) {
            $accounts = SalesAccount::with(['assignUser', 'accountType', 'accountIndustry'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-accounts')) {
                        $q->where('sales_accounts.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-accounts')) {
                        $q->where(function ($query) {
                            $query->where('sales_accounts.creator_id', Auth::id())
                                ->orWhere('sales_accounts.assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where(function($query) {
                    $query->where('sales_accounts.name', 'like', '%' . request('name') . '%')
                          ->orWhere('sales_accounts.email', 'like', '%' . request('name') . '%');
                }))
                ->when(request('type_id'), fn($q) => $q->where('sales_accounts.type_id', request('type_id')))
                ->when(request('industry_id'), fn($q) => $q->where('sales_accounts.industry_id', request('industry_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('sales_accounts.assign_user_id', request('assign_user_id')))
                ->when(request('is_active') !== null, fn($q) => $q->where('sales_accounts.is_active', request('is_active')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');
                    return $q->orderBy($sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accountTypes = $this->getFilteredAccountTypes();
            $accountIndustries = $this->getFilteredAccountIndustries();
            $users = $this->getFilteredUsers();
            $documents = $this->getFilteredDocuments();

            return Inertia::render('Sales/Accounts/Index', [
                'accounts' => $accounts,
                'accountTypes' => $accountTypes,
                'accountIndustries' => $accountIndustries,
                'users' => $users,
                'documents' => $documents,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesAccountRequest $request)
    {
        if (Auth::user()->can('create-sales-accounts')) {
            $validated = $request->validated();

            $account = new SalesAccount();
            $account->name = $validated['name'];
            $account->email = $validated['email'];
            $account->phone = $validated['phone'];
            $account->website = $validated['website'] ?? null;
            $account->billing_address = $validated['billing_address'] ?? null;
            $account->billing_city = $validated['billing_city'] ?? null;
            $account->billing_state = $validated['billing_state'] ?? null;
            $account->billing_country = $validated['billing_country'] ?? null;
            $account->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $account->shipping_address = $validated['shipping_address'] ?? null;
            $account->shipping_city = $validated['shipping_city'] ?? null;
            $account->shipping_state = $validated['shipping_state'] ?? null;
            $account->shipping_country = $validated['shipping_country'] ?? null;
            $account->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $account->assign_user_id = Auth::id();
            } else {
                $account->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $account->type_id = $validated['type_id'] ?? null;
            $account->industry_id = $validated['industry_id'] ?? null;
            $account->sales_document_id = $validated['sales_document_id'] ?? null;
            $account->description = $validated['description'] ?? null;
            $account->is_active = $validated['is_active'] ?? true;
            $account->creator_id = Auth::id();
            $account->created_by = creatorId();
            $account->save();

            CreateSalesAccount::dispatch($request, $account);
            
            if(company_setting('Create Account') == 'on' && !empty($account->assign_user_id)) {
                $assignedUser = User::find($account->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $account->load(['accountType', 'accountIndustry']);
                    $emailData = [
                        'account_name' => $account->name ?? '',
                        'account_email' => $account->email ?? '',
                        'account_phone' => $account->phone ?? '',
                        'account_website' => $account->website ?? '',
                        'account_type' => $account->accountType->name ?? '',
                        'account_industry' => $account->accountIndustry->name ?? '',
                        'billing_address' => $account->billing_address ?? '',
                        'billing_city' => $account->billing_city ?? '',
                        'billing_state' => $account->billing_state ?? '',
                        'billing_country' => $account->billing_country ?? '',
                        'billing_postal_code' => $account->billing_postal_code ?? '',
                        'account_description' => $account->description ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Create Account', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return back()
                            ->with('success', __('The account has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return back()->with('success', __('The account has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesAccount $account)
    {
        if (Auth::user()->can('view-sales-accounts')) {
            // Check if user can access this specific account
            if (!$this->canAccessAccount($account)) {
                return redirect()->route('sales.accounts.index')->with('error', __('Access denied'));
            }

            $account->load(['assignUser', 'accountType', 'accountIndustry', 'salesDocument', 'streams']);

            // Filter contacts based on permissions
            $contacts = $account->contacts()->with('assignUser')
                ->when(!Auth::user()->can('manage-any-sales-contacts'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-contacts')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            // Filter opportunities based on permissions
            $opportunities = $account->opportunities()->with(['assignUser', 'stage'])
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

            // Filter cases based on permissions
            $cases = $account->cases()->with(['assignUser', 'caseType'])
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

            // Filter quotes based on permissions
            $quotes = $account->quotes()->with(['assignUser', 'opportunity'])
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

            // Filter orders based on permissions
            $orders = $account->orders()->with(['assignUser', 'opportunity'])
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


            // Filter calls based on permissions - both account_id and parent relationship
            $calls = SalesCall::with('assignedUser')
                ->where(function ($q) use ($account) {
                    $q->where('account_id', $account->id)
                      ->orWhere(function ($query) use ($account) {
                          $query->where('parent_type', 'account')
                                ->where('parent_id', $account->id);
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

            // Filter meetings based on permissions - both account_id and parent relationship
            $meetings = SalesMeeting::with('assignedUser')
                ->where(function ($q) use ($account) {
                    $q->where('account_id', $account->id)
                      ->orWhere(function ($query) use ($account) {
                          $query->where('parent_type', 'account')
                                ->where('parent_id', $account->id);
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

            // Filter documents based on permissions
            $documents = $account->documents()->with(['folder', 'type', 'assignUser'])
                ->when(!Auth::user()->can('manage-any-sales-documents'), function ($q) {
                    if (Auth::user()->can('manage-own-sales-documents')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })->orderBy('created_at', 'desc')->get();

            $users = $this->getFilteredUsers();
            $accounts = SalesAccount::where('created_by', creatorId())->select('id', 'name')->get();
            $allContacts = $this->getFilteredContacts();
            $allOpportunities = $this->getFilteredOpportunities();
            $allQuotes = $this->getFilteredQuotes();
            $allSalesOrders = $this->getFilteredSalesOrders();
            $stages = $this->getFilteredOpportunityStages();
            $caseTypes = $this->getFilteredCaseTypes();
            $shippingProviders = $this->getFilteredShippingProviders();
            $folders = $this->getFilteredDocumentFolders();
            $types = $this->getFilteredDocumentTypes();
            $warehouses = $this->getFilteredWarehouses();

            return Inertia::render('Sales/Accounts/Show', [
                'account' => $account,
                'streams' => $account->streams,
                'contacts' => $contacts,
                'opportunities' => $opportunities,
                'cases' => $cases,
                'quotes' => $quotes,
                'orders' => $orders,

                'calls' => $calls,
                'meetings' => $meetings,
                'users' => $users,
                'accounts' => $accounts,
                'allContacts' => $allContacts,
                'allOpportunities' => $allOpportunities,
                'allQuotes' => $allQuotes,
                'allSalesOrders' => $allSalesOrders,

                'stages' => $stages,
                'caseTypes' => $caseTypes,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'documents' => $documents,
                'folders' => $folders,
                'types' => $types,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesAccountRequest $request, SalesAccount $account)
    {
        if (Auth::user()->can('edit-sales-accounts')) {
            if (!$this->canAccessAccount($account)) {
                return redirect()->route('sales.accounts.index')->with('error', __('Access denied'));
            }

            $validated = $request->validated();

            $account->name = $validated['name'];
            $account->email = $validated['email'];
            $account->phone = $validated['phone'];
            $account->website = $validated['website'] ?? null;
            $account->billing_address = $validated['billing_address'] ?? null;
            $account->billing_city = $validated['billing_city'] ?? null;
            $account->billing_state = $validated['billing_state'] ?? null;
            $account->billing_country = $validated['billing_country'] ?? null;
            $account->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $account->shipping_address = $validated['shipping_address'] ?? null;
            $account->shipping_city = $validated['shipping_city'] ?? null;
            $account->shipping_state = $validated['shipping_state'] ?? null;
            $account->shipping_country = $validated['shipping_country'] ?? null;
            $account->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $account->assign_user_id = Auth::id();
            } else {
                $account->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $account->type_id = $validated['type_id'] ?? null;
            $account->industry_id = $validated['industry_id'] ?? null;
            $account->sales_document_id = $validated['sales_document_id'] ?? null;
            $account->description = $validated['description'] ?? null;
            $account->is_active = $validated['is_active'] ?? true;
            $account->save();

            UpdateSalesAccount::dispatch($request, $account);

            return back()->with('success', __('The account details are updated successfully.'));
        } else {
            return redirect()->route('sales.accounts.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesAccount $account)
    {
        if (Auth::user()->can('delete-sales-accounts')) {
            // Check if user can access this specific account
            if (!$this->canAccessAccount($account)) {
                return back()->with('error', __('Permission denied'));
            }

            // Unassign document if any
            if ($account->sales_document_id) {
                SalesDocument::where('id', $account->sales_document_id)
                    ->where('account_id', $account->id)
                    ->update(['account_id' => null]);
            }

            DestroySalesAccount::dispatch($account);

            $account->delete();

            return back()->with('success', __('The account has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }



    private function canAccessAccount(SalesAccount $account)
    {
        if (Auth::user()->can('manage-any-sales-accounts')) {
            return $account->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-accounts')) {
            return $account->creator_id == Auth::id() || $account->assign_user_id == Auth::id();
        } else {
            return false;
        }
    }

    private function getFilteredUsers()
    {
        return User::emp()->where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-users'), function ($q) {
                if (Auth::user()->can('manage-own-users')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->where('id', '=', 0); // No users if no permission
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredAccountTypes()
    {
        return SalesAccountType::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-account-types'), function ($q) {
                if (Auth::user()->can('manage-own-sales-account-types')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredAccountIndustries()
    {
        return SalesAccountIndustry::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-account-industries'), function ($q) {
                if (Auth::user()->can('manage-own-sales-account-industries')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredOpportunityStages()
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
            ->select('id', 'name')->get();
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
            ->select('id', 'name')->get();
    }

    private function getFilteredDocumentFolders()
    {
        return SalesDocumentFolder::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-document-folders'), function ($q) {
                if (Auth::user()->can('manage-own-sales-document-folders')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredDocumentTypes()
    {
        return SalesDocumentType::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-document-types'), function ($q) {
                if (Auth::user()->can('manage-own-sales-document-types')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredDocuments()
    {
        return SalesDocument::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-documents'), function ($q) {
                if (Auth::user()->can('manage-own-sales-documents')) {
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

    private function getFilteredOpportunities()
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

    private function getFilteredQuotes()
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

    private function getFilteredSalesOrders()
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

    private function getFilteredWarehouses()
    {
        return Warehouse::where('is_active', true)
            ->where('created_by', creatorId())
            ->select('id', 'name', 'address')->get();
    }

}
