<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesCaseType;
use App\Models\User;
use Automas\Sales\Http\Requests\StoreSalesCaseRequest;
use Automas\Sales\Http\Requests\UpdateSalesCaseRequest;
use Automas\Sales\Events\CreateSalesCase;
use Automas\Sales\Events\UpdateSalesCase;
use Automas\Sales\Events\DestroySalesCase;
use Automas\Sales\Models\SalesCall;
use Automas\Sales\Models\SalesMeeting;

class SalesCaseController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-cases')){
            $cases = SalesCase::query()
                ->with(['account', 'assignUser', 'caseType'])
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-cases')) {
                        $q->where('sales_cases.created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-cases')) {
                        $q->where(function ($query) {
                            $query->where('creator_id', Auth::id())
                                ->orWhere('assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where(function($query) {
                    $searchTerm = request('name');
                    $query->where('sales_cases.name', 'like', '%' . $searchTerm . '%')
                          ->orWhere('sales_cases.case_number', 'like', '%' . $searchTerm . '%');
                }))
                ->when(request('status'), fn($q) => $q->where('status', request('status')))
                ->when(request('priority'), fn($q) => $q->where('priority', request('priority')))
                ->when(request('account_id'), fn($q) => $q->where('account_id', request('account_id')))
                ->when(request('case_type_id'), fn($q) => $q->where('case_type_id', request('case_type_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('assign_user_id', request('assign_user_id')))
                ->when(request('sort'), function($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');
                    
                    if ($sort === 'account_id') {
                        return $q->leftJoin('sales_accounts', 'sales_cases.account_id', '=', 'sales_accounts.id')
                                 ->orderBy('sales_accounts.name', $direction)
                                 ->select('sales_cases.*');
                    }
                    
                    return $q->orderBy('sales_cases.' . $sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accounts = $this->getFilteredAccounts();
            $contacts = $this->getFilteredContacts();
            $caseTypes = $this->getFilteredCaseTypes();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Cases/Index', [
                'cases' => $cases,
                'accounts' => $accounts,
                'contacts' => $contacts,
                'caseTypes' => $caseTypes,
                'users' => $users,
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesCaseRequest $request)
    {
        if(Auth::user()->can('create-sales-cases')){
            $validated = $request->validated();
            
            $attachment = null;
            
            if ($request->hasFile('attachment')) {
                $filenameWithExt = $request->file('attachment')->getClientOriginalName();
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                $extension = $request->file('attachment')->getClientOriginalExtension();
                $fileNameToStore = $filename . '_' . time() . '.' . $extension;
                
                $upload = upload_file($request, 'attachment', $fileNameToStore, 'sales/cases');
                
                if ($upload['flag'] == 1) {
                    $attachment = $upload['url'];
                } else {
                    return back()->with('error', $upload['msg']);
                }
            }

            // Handle null values properly
            $validated['account_id'] = ($validated['account_id'] === 'null' || empty($validated['account_id'])) ? null : $validated['account_id'];
            $validated['contact_id'] = ($validated['contact_id'] === 'null' || empty($validated['contact_id'])) ? null : $validated['contact_id'];
            $validated['case_type_id'] = ($validated['case_type_id'] === 'null' || empty($validated['case_type_id'])) ? null : $validated['case_type_id'];
            $validated['assign_user_id'] = ($validated['assign_user_id'] === 'null' || empty($validated['assign_user_id'])) ? null : $validated['assign_user_id'];
            
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $validated['assign_user_id'] = Auth::id();
            } elseif (!empty($validated['assign_user_id']) && !Auth::user()->can('manage-any-users')) {
                $allowedUsers = $this->getFilteredUsers()->pluck('id')->toArray();
                if (!in_array($validated['assign_user_id'], $allowedUsers)) {
                    $validated['assign_user_id'] = Auth::id();
                }
            }
            
            $salesCase = new SalesCase();
            foreach ($validated as $key => $value) {
                $salesCase->$key = $value;
            }
            $salesCase->case_number = SalesCase::generateCaseNumber();
            $salesCase->attachment = $attachment;
            $salesCase->creator_id = Auth::id();
            $salesCase->created_by = creatorId();
            $salesCase->save();

            CreateSalesCase::dispatch($request, $salesCase);

            return back()->with('success', __('The case has been created successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesCase $case)
    {
        if(Auth::user()->can('view-sales-cases')){
            if (!$this->canAccessCase($case)) {
                return redirect()->route('sales.cases.index')->with('error', __('Access denied'));
            }
            $case->load(['account', 'contact', 'caseType', 'assignUser', 'streams']);
            
            // Filter calls based on permissions - parent relationship
            $calls = SalesCall::with('assignedUser')
                ->where('parent_type', 'case')
                ->where('parent_id', $case->id)
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
                ->where('parent_type', 'case')
                ->where('parent_id', $case->id)
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
            
            return Inertia::render('Sales/Cases/Show', [
                'case' => $case,
                'streams' => $case->streams,
                'calls' => $calls,
                'meetings' => $meetings,
                'users' => $users,
                'accounts' => $accounts,
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesCaseRequest $request, SalesCase $case)
    {
        if(Auth::user()->can('edit-sales-cases')){
            if (!$this->canAccessCase($case)) {
                return back()->with('error', __('Permission denied'));
            }
            $validated = $request->validated();
            
            $attachment = $case->attachment;
            
            if ($request->hasFile('attachment')) {
                $filenameWithExt = $request->file('attachment')->getClientOriginalName();
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                $extension = $request->file('attachment')->getClientOriginalExtension();
                $fileNameToStore = $filename . '_' . time() . '.' . $extension;
                
                $upload = upload_file($request, 'attachment', $fileNameToStore, 'sales/cases');
                
                if ($upload['flag'] == 1) {
                    if (!empty($attachment)) {
                        delete_file($attachment);
                    }
                    $attachment = $upload['url'];
                } else {
                    return back()->with('error', $upload['msg']);
                }
            }

            // Handle null values properly
            $validated['account_id'] = ($validated['account_id'] === 'null' || empty($validated['account_id'])) ? null : $validated['account_id'];
            $validated['contact_id'] = ($validated['contact_id'] === 'null' || empty($validated['contact_id'])) ? null : $validated['contact_id'];
            $validated['case_type_id'] = ($validated['case_type_id'] === 'null' || empty($validated['case_type_id'])) ? null : $validated['case_type_id'];
            $validated['assign_user_id'] = ($validated['assign_user_id'] === 'null' || empty($validated['assign_user_id'])) ? null : $validated['assign_user_id'];
            
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $validated['assign_user_id'] = Auth::id();
            } elseif (!empty($validated['assign_user_id']) && !Auth::user()->can('manage-any-users')) {
                $allowedUsers = $this->getFilteredUsers()->pluck('id')->toArray();
                if (!in_array($validated['assign_user_id'], $allowedUsers)) {
                    $validated['assign_user_id'] = Auth::id();
                }
            }
            
            $validated['attachment'] = $attachment;
            
            $case->fill($validated);
            $case->save();

            UpdateSalesCase::dispatch($request, $case);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return back()->with('success', __('The case details are updated successfully.'));
            }
            
            return back()->with('success', __('The case details are updated successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesCase $case)
    {
        if(Auth::user()->can('delete-sales-cases')){
            if (!$this->canAccessCase($case)) {
                return back()->with('error', __('Permission denied'));
            }
            if ($case->attachment) {
                delete_file($case->attachment);
            }

            DestroySalesCase::dispatch($case);

            $case->delete();

           return back()->with('success', __('The case has been deleted.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    private function canAccessCase(SalesCase $case)
    {
        if (Auth::user()->can('manage-any-sales-cases')) {
            return $case->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-cases')) {
            return $case->creator_id == Auth::id() || $case->assign_user_id == Auth::id();
        } else {
            return false;
        }
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
            ->select('id', 'name', 'account_id')
            ->with('account:id,name')
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
}