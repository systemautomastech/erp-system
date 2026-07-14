<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunityStage;
use App\Models\User;
use Automas\Sales\Http\Requests\StoreSalesOpportunityRequest;
use Automas\Sales\Http\Requests\UpdateSalesOpportunityRequest;
use Automas\Sales\Events\CreateSalesOpportunity;
use Automas\Sales\Events\UpdateSalesOpportunity;
use Automas\Sales\Events\DestroySalesOpportunity;
use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;
use Automas\Sales\Models\SalesCaseType;
use Automas\Sales\Models\SalesDocumentFolder;
use Automas\Sales\Models\SalesDocumentType;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesShippingProvider;

class SalesOpportunityController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-opportunities')) {
            $opportunities = SalesOpportunity::query()
                ->with(['account', 'contact', 'stage', 'assignUser'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-opportunities')) {
                        $q->where('sales_opportunities.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
                        $q->where(function ($query) {
                            $query->where('sales_opportunities.creator_id', Auth::id())
                                ->orWhere('sales_opportunities.assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where('sales_opportunities.name', 'like', '%' . request('name') . '%'))
                ->when(request('account_id'), fn($q) => $q->where('sales_opportunities.account_id', request('account_id')))
                ->when(request('stage_id'), fn($q) => $q->where('sales_opportunities.stage_id', request('stage_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('sales_opportunities.assign_user_id', request('assign_user_id')))
                ->when(request('is_active') !== null, fn($q) => $q->where('sales_opportunities.is_active', request('is_active')))
                ->when(request('sort'), function($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');
                    
                    if ($sort === 'account') {
                        return $q->join('sales_accounts', 'sales_opportunities.account_id', '=', 'sales_accounts.id')
                                 ->orderBy('sales_accounts.name', $direction)
                                 ->select('sales_opportunities.*');
                    }
                    
                    return $q->orderBy($sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accounts = $this->getFilteredAccounts();
            $contacts = $this->getFilteredContacts();
            $stages = $this->getFilteredStages();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Opportunities/Index', [
                'opportunities' => $opportunities,
                'accounts' => $accounts,
                'contacts' => $contacts,
                'stages' => $stages,
                'users' => $users,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function kanban()
    {
        if (Auth::user()->can('manage-sales-opportunities')) {
            $stages = $this->getFilteredStages();
            $opportunities = SalesOpportunity::query()
                ->with(['account', 'contact', 'stage', 'assignUser'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-opportunities')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->where('is_active', true)
                ->get()
                ->groupBy('stage_id');

            $kanbanData = [];
            foreach ($stages as $stage) {
                $kanbanData[$stage->id] = $opportunities->get($stage->id, collect())->map(function ($opportunity) {
                    return [
                        'id' => $opportunity->id,
                        'title' => $opportunity->name,
                        'description' => $opportunity->description,
                        'amount' => $opportunity->amount,
                        'probability' => $opportunity->probability,
                        'close_date' => $opportunity->close_date?->format('Y-m-d'),
                        'account' => $opportunity->account?->name,
                        'account_id' => $opportunity->account_id,
                        'contact' => $opportunity->contact?->name,
                        'contact_id' => $opportunity->contact_id,
                        'assignUser' => $opportunity->assignUser?->name,
                        'assign_user_id' => $opportunity->assign_user_id,
                        'stage_id' => $opportunity->stage_id,
                        'lead_source' => $opportunity->lead_source,
                        'is_active' => $opportunity->is_active,
                    ];
                })->values();
            }

            $columns = $stages->map(function ($stage) {
                return [
                    'id' => $stage->id,
                    'title' => $stage->name,
                    'color' => $stage->color ?? '#3B82F6'
                ];
            });

            $accounts = $this->getFilteredAccounts();
            $contacts = $this->getFilteredContacts();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Opportunities/Kanban', [
                'stages' => $columns,
                'opportunities' => $kanbanData,
                'accounts' => $accounts,
                'contacts' => $contacts,
                'users' => $users,
                'stagesData' => $stages, // Add raw stages data for modals
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function updateStage(Request $request, SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('edit-sales-opportunities')) {
            // Check if user can access this specific opportunity
            if (!$this->canAccessOpportunity($opportunity)) {
                return back()->with('error', __('Permission denied'));
            }

            $validated = $request->validate([
                'stage_id' => 'required|exists:sales_opportunity_stages,id'
            ]);

            $allowedStages = $this->getFilteredStages()->pluck('id')->toArray();
            if (!in_array($validated['stage_id'], $allowedStages)) {
                return back()->with('error', __('Invalid stage'));
            }

            $oldStage = $opportunity->stage;
            $newStage = SalesOpportunityStage::find($validated['stage_id']);

            $opportunity->update(['stage_id' => $validated['stage_id']]);

            if ($oldStage && $newStage && $oldStage->id != $newStage->id && company_setting('Opportunity Move') == 'on') {
                $opportunity->load(['account', 'contact', 'assignUser']);
                $emailData = [
                    'opportunity_name' => $opportunity->name,
                    'opportunity_amount' => $opportunity->amount ?? '',
                    'opportunity_account' => $opportunity->account->name ?? '',
                    'opportunity_contact' => $opportunity->contact->name ?? '',
                    'opportunity_stage' => $oldStage->name,
                    'opportunity_new_stage' => $newStage->name,
                ];
                $recipients = [];
                if ($opportunity->assignUser) {
                    $recipients[$opportunity->assignUser->id] = $opportunity->assignUser->email;
                }
                if (!empty($recipients)) {
                    $message = EmailTemplate::sendEmailTemplate('Opportunity Move', $recipients, $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return back()
                            ->with('success', __('Opportunity has been moved successfully'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return back()->with('success', __('Opportunity has been moved successfully'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesOpportunityRequest $request)
    {
        if (Auth::user()->can('create-sales-opportunities')) {
            $validated = $request->validated();

            $opportunity = new SalesOpportunity();
            $opportunity->name = $validated['name'];
            $opportunity->account_id = $validated['account_id'] ?? null;
            $opportunity->contact_id = $validated['contact_id'] ?? null;
            $opportunity->stage_id = $validated['stage_id'] ?? null;
            $opportunity->amount = $validated['amount'];
            $opportunity->expected_amount = $validated['expected_amount'] ?? null;
            $opportunity->lead_source = $validated['lead_source'] ?? null;
            $opportunity->probability = is_array($validated['probability']) ? (int)($validated['probability'][0] ?? 0) : (int)$validated['probability'];
            $opportunity->close_date = $validated['close_date'];
            $opportunity->next_followup_date = $validated['next_followup_date'] ?? null;
            $opportunity->next_step = $validated['next_step'] ?? null;
            $opportunity->lost_reason = $validated['lost_reason'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $opportunity->assign_user_id = Auth::id();
            } else {
                $opportunity->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $opportunity->description = $validated['description'] ?? null;
            $opportunity->is_active = $validated['is_active'] ?? true;
            $opportunity->creator_id = Auth::id();
            $opportunity->created_by = creatorId();
            $opportunity->save();

            CreateSalesOpportunity::dispatch($request, $opportunity);

            if(company_setting('Create Opportunity') == 'on') {
                
                $assignedUser = User::find($opportunity->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $opportunity->load(['account', 'contact', 'stage']);
                    $emailData = [
                        'opportunity_name' => $opportunity->name ?? '',
                        'opportunity_amount' => $opportunity->amount ?? '',
                        'opportunity_expected_amount' => $opportunity->expected_amount ?? '',
                        'opportunity_probability' => $opportunity->probability ?? '',
                        'opportunity_close_date' => $opportunity->close_date ? $opportunity->close_date->format('Y-m-d') : '',
                        'opportunity_next_followup_date' => $opportunity->next_followup_date ? $opportunity->next_followup_date->format('Y-m-d') : '',
                        'opportunity_lead_source' => $opportunity->lead_source ?? '',
                        'opportunity_next_step' => $opportunity->next_step ?? '',
                        'opportunity_description' => $opportunity->description ?? '',
                        'opportunity_account' => $opportunity->account->name ?? '',
                        'opportunity_contact' => $opportunity->contact->name ?? '',
                        'opportunity_stage' => $opportunity->stage->name ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Create Opportunity', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return back()
                            ->with('success', __('The opportunity has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return back()->with('success', __('The opportunity has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('view-sales-opportunities')) {
            // Check if user can access this specific opportunity
            if (!$this->canAccessOpportunity($opportunity)) {
                return redirect()->route('sales.opportunities.index')->with('error', __('Access denied'));
            }

            $opportunity->load(['account', 'contact', 'stage', 'assignUser', 'streams']);
            
            // Ensure account relationship is available for frontend
            if ($opportunity->account) {
                $opportunity->account_id = $opportunity->account->id;
            }

            // Filter documents based on permissions
            $documents = $opportunity->documents()->with(['folder', 'type', 'assignUser'])
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

            // Get opportunity-specific quotes for display
            $quotes = $opportunity->quotes()->with(['assignUser'])
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
            $orders = $opportunity->orders()->with(['assignUser'])
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


            // Filter calls based on permissions - parent relationship
            $calls = SalesCall::with('assignedUser')
                ->where('parent_type', 'opportunity')
                ->where('parent_id', $opportunity->id)
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

            // Filter meetings based on permissions - parent relationship
            $meetings = SalesMeeting::with('assignedUser')
                ->where('parent_type', 'opportunity')
                ->where('parent_id', $opportunity->id)
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

            $users = $this->getFilteredUsers();
            $accounts = $this->getFilteredAccounts();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $folders = $this->getFilteredDocumentFolders();
            $types = $this->getFilteredDocumentTypes();
            $allOpportunities = $this->getFilteredOpportunities();
            $allQuotes = $this->getFilteredQuotes();

            // Ensure opportunity has account_id for frontend
            $opportunityData = $opportunity->toArray();
            if ($opportunity->account) {
                $opportunityData['account_id'] = $opportunity->account->id;
            }

            return Inertia::render('Sales/Opportunities/Show', [
                'opportunity' => $opportunityData,
                'streams' => $opportunity->streams,
                'documents' => $documents,
                'allQuotes' => $allQuotes, // All quotes for forms
                'quotes' => $quotes, // Opportunity-specific quotes for display
                'orders' => $orders, // Opportunity-specific orders for display

                'calls' => $calls,
                'meetings' => $meetings,
                'users' => $users,
                'accounts' => $accounts,
                'contacts' => $contacts,
                'allOpportunities' => $allOpportunities,
                'shippingProviders' => $shippingProviders,
                'folders' => $folders,
                'types' => $types,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesOpportunityRequest $request, SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('edit-sales-opportunities')) {
            if (!$this->canAccessOpportunity($opportunity)) {
                return redirect()->route('sales.opportunities.index')->with('error', __('Access denied'));
            }

            $validated = $request->validated();

            $opportunity->name = $validated['name'];
            $opportunity->account_id = $validated['account_id'] ?? null;
            $opportunity->contact_id = $validated['contact_id'] ?? null;
            $opportunity->stage_id = $validated['stage_id'] ?? null;
            $opportunity->amount = $validated['amount'];
            $opportunity->expected_amount = $validated['expected_amount'] ?? null;
            $opportunity->lead_source = $validated['lead_source'] ?? null;
            $opportunity->probability = is_array($validated['probability']) ? (int)($validated['probability'][0] ?? 0) : (int)$validated['probability'];
            $opportunity->close_date = $validated['close_date'];
            $opportunity->next_followup_date = $validated['next_followup_date'] ?? null;
            $opportunity->next_step = $validated['next_step'] ?? null;
            $opportunity->lost_reason = $validated['lost_reason'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $opportunity->assign_user_id = Auth::id();
            } else {
                $opportunity->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $opportunity->description = $validated['description'] ?? null;
            $opportunity->is_active = $validated['is_active'] ?? true;
            $opportunity->save();

            UpdateSalesOpportunity::dispatch($request, $opportunity);

            return back()->with('success', __('The opportunity details are updated successfully.'));
        } else {
            return redirect()->route('sales.opportunities.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('delete-sales-opportunities')) {
            // Check if user can access this specific opportunity
            if (!$this->canAccessOpportunity($opportunity)) {
                return back()->with('error', __('Permission denied'));
            }

            DestroySalesOpportunity::dispatch($opportunity);

            $opportunity->delete();

            return back()->with('success', __('The opportunity has been deleted.'));
        } else {
            
            return back()->with('error', __('Permission denied'));
        }
    }

    public function opportunityDetails(SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('view-sales-opportunities')) {
            if (!$this->canAccessOpportunity($opportunity)) {
                return response()->json(['error' => 'Permission denied'], 403);
            }

            $opportunity->load(['account']);
            
            return response()->json([
                'id' => $opportunity->id,
                'name' => htmlspecialchars($opportunity->name, ENT_QUOTES, 'UTF-8'),
                'account_id' => $opportunity->account_id,
                'account' => $opportunity->account ? [
                    'id' => $opportunity->account->id, 
                    'name' => htmlspecialchars($opportunity->account->name, ENT_QUOTES, 'UTF-8')
                ] : null
            ]);
        }
        
        return response()->json(['error' => 'Permission denied'], 403);
    }

    private function canAccessOpportunity(SalesOpportunity $opportunity)
    {
        if (Auth::user()->can('manage-any-sales-opportunities')) {
            return $opportunity->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
            return $opportunity->creator_id == Auth::id() || $opportunity->assign_user_id == Auth::id();
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
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredAccounts()
    {
        return SalesAccount::where('created_by', creatorId())
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
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();
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
            ->where('is_active', true)
            ->select('id', 'name', 'account_id')
            ->with('account:id,name')
            ->get();
    }

    private function getFilteredStages()
    {
        return SalesOpportunityStage::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-opportunity-stages'), function ($q) {
                if (Auth::user()->can('manage-own-sales-opportunity-stages')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->where('is_active', true)
            ->orderBy('order')
            ->select('id', 'name', 'color')
            ->get();
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
            ->select('id', 'name', 'quote_number', 'opportunity_id', 'account_id')
            ->with('opportunity:id,name,account_id')
            ->get();
    }
}
