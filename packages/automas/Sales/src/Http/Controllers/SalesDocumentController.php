<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesDocument;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesDocumentFolder;
use Automas\Sales\Models\SalesDocumentType;
use Automas\Sales\Models\SalesOpportunity;
use App\Models\User;
use Automas\Sales\Http\Requests\StoreSalesDocumentRequest;
use Automas\Sales\Http\Requests\UpdateSalesDocumentRequest;
use Automas\Sales\Events\CreateSalesDocument;
use Automas\Sales\Events\UpdateSalesDocument;
use Automas\Sales\Events\DestroySalesDocument;
use Automas\Sales\Models\SalesAccountIndustry;
use Automas\Sales\Models\SalesAccountType;

class SalesDocumentController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-documents')) {
            $documents = SalesDocument::with(['account', 'folder', 'type', 'opportunity', 'assignUser'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-documents')) {
                        $q->where('sales_documents.created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-documents')) {
                        $q->where(function ($query) {
                            $query->where('sales_documents.creator_id', Auth::id())
                                ->orWhere('sales_documents.assign_user_id', Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('name'), fn($q) => $q->where('sales_documents.name', 'like', '%' . request('name') . '%'))
                ->when(request('status'), fn($q) => $q->where('sales_documents.status', request('status')))
                ->when(request('account_id'), fn($q) => $q->where('sales_documents.account_id', request('account_id')))
                ->when(request('folder_id'), fn($q) => $q->where('sales_documents.folder_id', request('folder_id')))
                ->when(request('type_id'), fn($q) => $q->where('sales_documents.type_id', request('type_id')))
                ->when(request('opportunity_id'), fn($q) => $q->where('sales_documents.opportunity_id', request('opportunity_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('sales_documents.assign_user_id', request('assign_user_id')))
                ->when(request('date_from'), fn($q) => $q->whereDate('sales_documents.publish_date', '>=', request('date_from')))
                ->when(request('date_to'), fn($q) => $q->whereDate('sales_documents.publish_date', '<=', request('date_to')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');

                    if ($sort === 'account.name' || $sort === 'account') {
                        return $q->join('sales_accounts', 'sales_documents.account_id', '=', 'sales_accounts.id')
                            ->orderBy('sales_accounts.name', $direction)
                            ->select('sales_documents.*');
                    }

                    if ($sort === 'folder.name' || $sort === 'folder') {
                        return $q->join('sales_document_folders', 'sales_documents.folder_id', '=', 'sales_document_folders.id')
                            ->orderBy('sales_document_folders.name', $direction)
                            ->select('sales_documents.*');
                    }

                    if ($sort === 'type.name' || $sort === 'type') {
                        return $q->join('sales_document_types', 'sales_documents.type_id', '=', 'sales_document_types.id')
                            ->orderBy('sales_document_types.name', $direction)
                            ->select('sales_documents.*');
                    }

                    return $q->orderBy($sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accounts = $this->getFilteredAccounts();
            $folders = $this->getFilteredFolders();
            $types = $this->getFilteredTypes();
            $opportunities = $this->getFilteredOpportunities();
            $users = $this->getFilteredUsers();

            return Inertia::render('Sales/Documents/Index', [
                'documents' => $documents,
                'accounts' => $accounts,
                'folders' => $folders,
                'types' => $types,
                'opportunities' => $opportunities,
                'users' => $users
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesDocumentRequest $request)
    {
        if (Auth::user()->can('create-sales-documents')) {
            $validated = $request->validated();

            $attachment = null;

            if ($request->hasFile('attachment')) {
                $filenameWithExt = $request->file('attachment')->getClientOriginalName();
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                $extension = $request->file('attachment')->getClientOriginalExtension();
                $fileNameToStore = $filename . '_' . time() . '.' . $extension;

                $upload = upload_file($request, 'attachment', $fileNameToStore, 'sales/documents');

                if ($upload['flag'] == 1) {
                    $attachment = $upload['url'];
                } else {
                    return back()->with('error', $upload['msg']);
                }
            }

            $validated['attachment'] = $attachment;

            $document = new SalesDocument();
            foreach ($validated as $key => $value) {
                if ($key !== 'attachment' || isset($validated['attachment'])) {
                    $document->$key = $value;
                }
            }
            $document->creator_id = Auth::id();
            $document->created_by = creatorId();

            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $document->assign_user_id = Auth::id();
            } elseif (!empty($validated['assign_user_id']) && !Auth::user()->can('manage-any-users')) {
                $allowedUsers = $this->getFilteredUsers()->pluck('id')->toArray();
                if (!in_array($validated['assign_user_id'], $allowedUsers)) {
                    $document->assign_user_id = Auth::id();
                }
            }

            $document->save();

            CreateSalesDocument::dispatch($request, $document);

            return back()->with('success', __('The document has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesDocument $salesDocument)
    {
        if (Auth::user()->can('view-sales-documents')) {
            if (!$this->canAccessDocument($salesDocument)) {
                return redirect()->route('sales.documents.index')->with('error', __('Access denied'));
            }
            $salesDocument->load(['account', 'folder', 'type', 'opportunity', 'assignUser']);
            
            // Filter accounts created using this document based on permissions
            $accounts = SalesAccount::with('assignUser')
                ->where('sales_document_id', $salesDocument->id)
                ->where('created_by', creatorId())
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
                ->orderBy('created_at', 'desc')
                ->get();

            $users = $this->getFilteredUsers();
            $accountTypes = $this->getFilteredAccountTypes();
            $accountIndustries = $this->getFilteredAccountIndustries();
            $allDocuments = $this->getFilteredDocuments();

            return Inertia::render('Sales/Documents/Show', [
                'salesDocument' => $salesDocument,
                'accounts' => $accounts,
                'users' => $users,
                'accountTypes' => $accountTypes,
                'accountIndustries' => $accountIndustries,
                'documents' => $allDocuments,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesDocumentRequest $request, SalesDocument $salesDocument)
    {
        if (Auth::user()->can('edit-sales-documents')) {
            if (!$this->canAccessDocument($salesDocument)) {
                return back()->with('error', __('Permission denied'));
            }
            $validated = $request->validated();

            $attachment = $salesDocument->attachment;

            if ($request->hasFile('attachment')) {
                $filenameWithExt = $request->file('attachment')->getClientOriginalName();
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                $extension = $request->file('attachment')->getClientOriginalExtension();
                $fileNameToStore = $filename . '_' . time() . '.' . $extension;

                $upload = upload_file($request, 'attachment', $fileNameToStore, 'sales/documents');

                if ($upload['flag'] == 1) {
                    if (!empty($attachment)) {
                        delete_file($attachment);
                    }
                    $attachment = $upload['url'];
                } else {
                    return back()->with('error', $upload['msg']);
                }
            }

            $validated['attachment'] = $attachment;

            foreach ($validated as $key => $value) {
                if ($key !== 'attachment' || isset($validated['attachment'])) {
                    $salesDocument->$key = $value;
                }
            }
            $salesDocument->save();

            UpdateSalesDocument::dispatch($request, $salesDocument);

            return back()->with('success', __('The document details are updated successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesDocument $salesDocument)
    {
        if (Auth::user()->can('delete-sales-documents')) {
            if (!$this->canAccessDocument($salesDocument)) {
                return back()->with('error', __('Permission denied'));
            }
            DestroySalesDocument::dispatch($salesDocument);

            if ($salesDocument->attachment) {
                delete_file($salesDocument->attachment);
            }

            $salesDocument->delete();

            return back()->with('success', __('The document has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
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
            ->select('id', 'name')->get();
    }

    private function getFilteredFolders()
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

    private function getFilteredTypes()
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

    private function getFilteredOpportunities()
    {
        return SalesOpportunity::with('account:id,name')
            ->where('created_by', creatorId())
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

    private function canAccessDocument(SalesDocument $document)
    {
        if (Auth::user()->can('manage-any-sales-documents')) {
            return $document->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-documents')) {
            return $document->creator_id == Auth::id() || $document->assign_user_id == Auth::id();
        } else {
            return false;
        }
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
}
