<?php

namespace App\Http\Controllers;

use App\Events\AcceptSalesProposal;
use App\Events\ConvertSalesProposal;
use App\Events\CreateSalesProposal;
use App\Events\DestroySalesProposal;
use App\Events\RejectSalesProposal;
use App\Events\SentSalesProposal;
use App\Events\UpdateSalesProposal;
use App\Http\Requests\StoreSalesProposalRequest;
use App\Http\Requests\UpdateSalesProposalRequest;
use App\Models\EmailTemplate;
use App\Models\ProposalDefaultPage;
use App\Models\ProposalSetting;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\SalesInvoiceItemTax;
use App\Models\SalesProposal;
use App\Models\SalesProposalContent;
use App\Models\SalesProposalItem;
use App\Models\SalesProposalItemTax;
<<<<<<< HEAD
use App\Models\SalesProposalTariff;
=======
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
use App\Models\User;
use App\Models\Warehouse;
use Automas\ProductService\Models\ProductServiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class SalesProposalController extends Controller
{
    /**
     * Get common relationships loaded for proposal views and exports.
     */
    private function getProposalRelations(): array
<<<<<<< HEAD
    {
        $relations = ['customer', 'author', 'items.product', 'items.taxes', 'warehouse'];

        if (Schema::hasTable('sales_proposal_tariffs')) {
            $relations[] = 'tariffs';
        }
        if (Schema::hasTable('sales_proposal_contents')) {
            $relations[] = 'contents';
        }

        return $relations;
    }

    /**
     * Check if the authenticated user has access to view or modify the proposal.
     */
    private function checkProposalAccess(SalesProposal $salesProposal): bool
    {
        if (Auth::user()->can('manage-any-sales-proposals')) {
            return true;
        }

        if (Auth::user()->can('manage-own-sales-proposals')) {
            if ($salesProposal->created_by != Auth::id() && $salesProposal->customer_id != Auth::id()) {
                return false;
            }
            if ($salesProposal->created_by != Auth::id() && Auth::user()->type === 'client' && $salesProposal->status === 'draft') {
                return false;
            }
            return true;
        }

=======
    {
        $relations = ['customer', 'items.product.unitRelation', 'items.taxes', 'warehouse'];

        if (Schema::hasTable('sales_proposal_contents')) {
            $relations[] = 'contents';
        }

        return $relations;
    }

    /**
     * Check if the authenticated user has access to view or modify the proposal.
     */
    private function hasProposalAccess(SalesProposal $proposal): bool
    {
        $user = Auth::user();

        if ($proposal->creator_id != creatorId()) {
            return false;
        }

        // Company/Superadmin or users with manage-any-sales-proposals permission can access all proposals in the workspace
        if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-sales-proposals')) {
            return true;
        }

        // Users with manage-own-sales-proposals can only access their own created proposals (or assigned client proposals)
        if ($user->can('manage-own-sales-proposals')) {
            $isOwnerOrCustomer = ($proposal->created_by == $user->id || $proposal->customer_id == $user->id);
            if (!$isOwnerOrCustomer) {
                return false;
            }

            if ($proposal->created_by != $user->id && $user->type === 'client' && $proposal->status === 'draft') {
                return false;
            }

            return true;
        }

>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        return false;
    }

    /**
<<<<<<< HEAD
=======
     * Fetch the default proposal pages for rendering.
     */
    private function getActiveDefaultPages(int $authorId)
    {
        $proposal = ProposalDefaultPage::where('creator_id', creatorId())
            ->where(function ($query) use ($authorId) {
                $query->where('created_by', $authorId)
                    ->orWhere('created_by', creatorId());
            })
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order', 'created_by', 'creator_id']);

        return $proposal;
    }

    /**
     * Send email notifications on proposal status changes.
     */
    private function notifyCustomerOnStatusChange(SalesProposal $proposal, string $templateName, ?string $statusLabel = null): ?array
    {
        $emailRecipient = null;

        if ($templateName === 'Proposal Sent') {
            $emailRecipient = $proposal->customer?->email;
        } elseif ($templateName === 'Proposal Approved') {
            $author = User::find($proposal->created_by);
            $emailRecipient = company_setting('company_email', $proposal->creator_id) ?: $author?->email;
        }

        if (empty($emailRecipient) || company_setting($templateName) !== 'on') {
            return null; // Skip if disabled or no email available
        }

        $emailData = [
            'proposal_number' => $proposal->proposal_number ?? null,
            'sales_customer_name' => $proposal->customer?->name ?? null,
            'total_amount' => $proposal->total_amount ?? null,
            'discount_amount' => $proposal->discount_amount ?? null,
        ];

        if ($statusLabel) {
            $emailData['status'] = $statusLabel;
        }

        return EmailTemplate::sendEmailTemplate($templateName, [$emailRecipient], $emailData);
    }

    /**
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
     * Display proposal list & board view.
     */
    public function index(Request $request)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('manage-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $baseQuery = SalesProposal::with(['customer', 'items'])
            ->where(function ($query) {
                if (Auth::user()->can('manage-any-sales-proposals')) {
                    $query->where('creator_id', creatorId());
                } elseif (Auth::user()->can('manage-own-sales-proposals')) {
                    $query->where('created_by', Auth::id())->orWhere('customer_id', Auth::id());
                    if (Auth::user()->type === 'client') {
=======
        $user = Auth::user();

        if (!$user->can('manage-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $proposalQuery = SalesProposal::with(['customer', 'items'])
            ->where(function ($query) use ($user) {
                if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-sales-proposals')) {
                    $query->where('creator_id', creatorId());
                } elseif ($user->can('manage-own-sales-proposals')) {
                    $query->where('creator_id', creatorId())
                        ->where(function ($q) use ($user) {
                            $q->where('created_by', $user->id)
                                ->orWhere('customer_id', $user->id);
                        });
                    if ($user->type === 'client') {
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
                        $query->where('status', '!=', 'draft');
                    }
                } else {
                    $query->whereRaw('1 = 0');
                }
            });

        if ($request->filled('customer_id')) {
<<<<<<< HEAD
            $baseQuery->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $baseQuery->where(function ($query) use ($search) {
                $query->where('proposal_number', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
=======
            $proposalQuery->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $searchKeyword = $request->search;
            $proposalQuery->where(function ($query) use ($searchKeyword) {
                $query->where('proposal_number', 'like', "%{$searchKeyword}%")
                    ->orWhere('reference', 'like', "%{$searchKeyword}%")
                    ->orWhere('subject', 'like', "%{$searchKeyword}%");
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            });
        }

        if ($request->filled('date_range')) {
            $dates = explode(' - ', $request->date_range);
            if (count($dates) === 2) {
<<<<<<< HEAD
                $baseQuery->whereBetween('proposal_date', [$dates[0], $dates[1]]);
            }
        }

        // Status & Value Breakdown for stats cards
        $statusBreakdown = (clone $baseQuery)
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $stats = [
            'total_count' => (clone $baseQuery)->count(),
            'total_value' => (clone $baseQuery)->sum('total_amount'),
            'overdue_count' => (clone $baseQuery)->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected'])->count(),
            'accepted_active_count' => (clone $baseQuery)->where('status', 'accepted')->whereNull('converted_to_invoice')->count(),
        ];

        foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
            $stats["{$status}_count"] = (int) ($statusBreakdown[$status]->count ?? 0);
            $stats["{$status}_value"] = (float) ($statusBreakdown[$status]->total ?? 0);
        }

        $query = clone $baseQuery;
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $query->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected']);
            } else {
                $query->where('status', $request->status);
=======
                $proposalQuery->whereBetween('proposal_date', [$dates[0], $dates[1]]);
            }
        }

        // statistics
        $aggregatedStats = (clone $proposalQuery)->withoutEagerLoads()
            ->selectRaw('
                COUNT(*) as total_count,
                SUM(total_amount) as total_value,
                SUM(CASE WHEN due_date < ? AND status NOT IN ("accepted", "rejected") THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status = "accepted" AND converted_to_invoice IS NULL THEN 1 ELSE 0 END) as accepted_active_count,
                SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft_count,
                SUM(CASE WHEN status = "draft" THEN total_amount ELSE 0 END) as draft_value,
                SUM(CASE WHEN status = "sent" THEN 1 ELSE 0 END) as sent_count,
                SUM(CASE WHEN status = "sent" THEN total_amount ELSE 0 END) as sent_value,
                SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted_count,
                SUM(CASE WHEN status = "accepted" THEN total_amount ELSE 0 END) as accepted_value,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_count,
                SUM(CASE WHEN status = "rejected" THEN total_amount ELSE 0 END) as rejected_value
            ', [now()])
            ->first();

        $stats = [
            'total_count' => (int) ($aggregatedStats->total_count ?? 0),
            'total_value' => (float) ($aggregatedStats->total_value ?? 0),
            'overdue_count' => (int) ($aggregatedStats->overdue_count ?? 0),
            'accepted_active_count' => (int) ($aggregatedStats->accepted_active_count ?? 0),
            'draft_count' => (int) ($aggregatedStats->draft_count ?? 0),
            'draft_value' => (float) ($aggregatedStats->draft_value ?? 0),
            'sent_count' => (int) ($aggregatedStats->sent_count ?? 0),
            'sent_value' => (float) ($aggregatedStats->sent_value ?? 0),
            'accepted_count' => (int) ($aggregatedStats->accepted_count ?? 0),
            'accepted_value' => (float) ($aggregatedStats->accepted_value ?? 0),
            'rejected_count' => (int) ($aggregatedStats->rejected_count ?? 0),
            'rejected_value' => (float) ($aggregatedStats->rejected_value ?? 0),
        ];

        $filteredQuery = clone $proposalQuery;
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $filteredQuery->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected']);
            } else {
                $filteredQuery->where('status', $request->status);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            }
        }

        $allowedSortFields = ['proposal_number', 'reference', 'subject', 'proposal_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
<<<<<<< HEAD
        $sortField = in_array($request->get('sort'), $allowedSortFields) ? $request->get('sort') : 'created_at';
        $sortDirection = $request->get('direction', 'desc');

        $proposals = $query->orderBy($sortField, $sortDirection)->paginate($request->get('per_page', 10));
        $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('creator_id', creatorId())->get();

        $boardData = null;
        if ($request->get('view', 'board') !== 'list') {
            $boardData = [];
            foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
                $columnQuery = (clone $baseQuery)->where('status', $status);
                if ($status === 'accepted') {
                    $columnQuery->whereNull('converted_to_invoice');
                }
                $boardData[$status] = $columnQuery->orderBy('created_at', 'desc')->limit(8)->get();
            }
        }

        return Inertia::render('SalesProposals/Index', [
=======
        $sortField = in_array($request->input('sort'), $allowedSortFields) ? $request->input('sort') : 'created_at';
        $sortDirection = $request->input('direction', 'desc');

        $proposals = $filteredQuery->orderBy($sortField, $sortDirection)->paginate($request->input('per_page', 10));
        $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('creator_id', creatorId())->get();

        $boardData = null;
        if ($request->input('view', 'board') !== 'list') {
            $boardData = [];
            foreach (['draft', 'sent', 'accepted', 'rejected'] as $boardStatus) {
                $boardStatusQuery = (clone $proposalQuery)->where('status', $boardStatus);
                if ($boardStatus === 'accepted') {
                    $boardStatusQuery->whereNull('converted_to_invoice');
                }
                $boardData[$boardStatus] = $boardStatusQuery->orderBy('created_at', 'desc')->limit(8)->get();
            }
        }

        $proposalData = [
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            'proposals' => $proposals,
            'customers' => $customers,
            'stats' => $stats,
            'boardData' => $boardData,
            'filters' => $request->only(['customer_id', 'status', 'search', 'date_range'])
<<<<<<< HEAD
        ]);
=======
        ];

        return Inertia::render('SalesProposals/Index', $proposalData);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    }

    /**
     * Show create proposal form.
     */
    public function create()
    {
        if (!Auth::user()->can('create-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $customers = User::where('type', 'client')->where('creator_id', creatorId())->get();
<<<<<<< HEAD
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('creator_id', creatorId())->get();
        $defaultPages = ProposalDefaultPage::where('creator_id', creatorId())
            ->where('created_by', Auth::id())
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        return Inertia::render('SalesProposals/Create', [
=======
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')
            ->where('creator_id', creatorId())->get();
        $defaultPages = $this->getActiveDefaultPages(Auth::id());
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        $proposalData = [
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'defaultTerms' => $proposalSetting['default_terms'] ?? null,
            'proposalSetting' => $proposalSetting,
<<<<<<< HEAD
        ]);
=======
        ];

        return Inertia::render('SalesProposals/Create', $proposalData);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    }

    /**
     * Store newly created proposal.
     */
    public function store(StoreSalesProposalRequest $request)
    {
        if (!Auth::user()->can('create-sales-proposals')) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        $proposal = DB::transaction(function () use ($request) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
<<<<<<< HEAD
            $totals = $this->calculateTotals($request->items, $isTaxEnabled);

            $hasRecurringItems = $this->hasMrcItems($request->items);
            $isRecurring = $hasRecurringItems ? 1 : 0;
            $isPrepaid = ($hasRecurringItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;
=======
            $totals = $this->calculateProposalTotals($request->items, $isTaxEnabled);

            $containsSubscriptionItems = $this->hasRecurringBillingItems($request->items);
            $isRecurring = $containsSubscriptionItems ? 1 : 0;
            $isPrepaid = ($containsSubscriptionItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda

            $proposal = new SalesProposal();
            $proposal->proposal_number = SalesProposal::generateProposalNumber($request->invoice_date ?? $request->proposal_date);
            $proposal->reference = $request->reference;
            $proposal->subject = $request->subject;
            $proposal->proposal_date = $request->invoice_date ?? $request->proposal_date;
            $proposal->due_date = $request->due_date;
<<<<<<< HEAD
            $proposal->customer_id = $request->customer_id;
=======
            $customerMode = $request->input('customer_mode', 'existing');
            if ($customerMode === 'new') {
                $proposal->customer_id = null;
                $proposal->customer_name = $request->customer_name;
                $proposal->customer_email = $request->customer_email;
                $proposal->customer_phone = $request->customer_phone;
                $proposal->customer_address = $request->customer_address;
            } else {
                $proposal->customer_id = $request->customer_id;
                $existingCustomer = $request->customer_id ? User::find($request->customer_id) : null;
                $proposal->customer_name = $existingCustomer?->name;
                $proposal->customer_email = $existingCustomer?->email;
                $proposal->customer_phone = $existingCustomer?->phone ?? $existingCustomer?->mobile_no;
                $proposal->customer_address = $existingCustomer?->address;
            }
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            $proposal->warehouse_id = $request->type === 'product' ? $request->warehouse_id : null;
            $proposal->type = $request->type ?? 'product';
            $proposal->is_recurring = $isRecurring;
            $proposal->is_prepaid = $isPrepaid;
            $proposal->is_tax_enabled = $isTaxEnabled ? 1 : 0;
            $proposal->payment_terms = $request->payment_terms;
            $proposal->notes = $request->notes;
            $proposal->subtotal = $totals['subtotal'];
            $proposal->tax_amount = $totals['tax_amount'];
            $proposal->discount_amount = $totals['discount_amount'];
            $proposal->total_amount = $totals['total_amount'];
            $proposal->creator_id = creatorId();
            $proposal->created_by = Auth::id();
            $proposal->save();

<<<<<<< HEAD
            $this->createProposalItems($proposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalTariffs($proposal->id, $request->tariffs);
            $this->saveProposalContents($proposal->id, $request->proposal_content);
=======
            $this->saveProposalItems($proposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalPageContents($proposal->id, $request->proposal_content);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda

            return $proposal;
        });

        try {
            CreateSalesProposal::dispatch($request, $proposal);
        } catch (\Throwable $th) {
<<<<<<< HEAD
=======
            // Silently catch event dispatcher exceptions
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been created successfully.'));
    }

    /**
     * Show single proposal view.
     */
    public function show(SalesProposal $salesProposal)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('view-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if (!$this->checkProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

=======
        if (!Auth::user()->can('view-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        $salesProposal->load($this->getProposalRelations());

        return Inertia::render('SalesProposals/View', [
            'proposal' => $salesProposal
        ]);
    }

    /**
     * Show edit proposal form.
     */
    public function edit(SalesProposal $salesProposal)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('edit-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if (!$this->checkProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

=======
        if (!Auth::user()->can('edit-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        $salesProposal->load($this->getProposalRelations());
<<<<<<< HEAD
        $customers = User::where('type', 'client')->where('creator_id', creatorId())->get();
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('creator_id', creatorId())->get();
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        $defaultPages = ProposalDefaultPage::where('creator_id', creatorId())
            ->where('created_by', Auth::id())
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);

        return Inertia::render('SalesProposals/Edit', [
=======

        $customers = User::where('type', 'client')->where('creator_id', creatorId())->get();
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('creator_id', creatorId())->get();
        $proposalSetting = ProposalSetting::getSettings(creatorId());
        $defaultPages = $this->getActiveDefaultPages(Auth::id());

        $porposalData = [
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            'proposal' => $salesProposal,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
<<<<<<< HEAD
        ]);
=======
        ];

        return Inertia::render('SalesProposals/Edit', $porposalData);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    }

    /**
     * Update proposal details.
     */
    public function update(UpdateSalesProposalRequest $request, SalesProposal $salesProposal)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('edit-sales-proposals') || $salesProposal->creator_id != creatorId()) {
=======
        if (!Auth::user()->can('edit-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        DB::transaction(function () use ($request, $salesProposal) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
<<<<<<< HEAD
            $totals = $this->calculateTotals($request->items, $isTaxEnabled);

            $hasRecurringItems = $this->hasMrcItems($request->items);
            $isRecurring = $hasRecurringItems ? 1 : 0;
            $isPrepaid = ($hasRecurringItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $salesProposal->proposal_date = $request->invoice_date;
            $salesProposal->due_date = $request->due_date;
            $salesProposal->customer_id = $request->customer_id;
=======
            $totals = $this->calculateProposalTotals($request->items, $isTaxEnabled);

            $containsSubscriptionItems = $this->hasRecurringBillingItems($request->items);
            $isRecurring = $containsSubscriptionItems ? 1 : 0;
            $isPrepaid = ($containsSubscriptionItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $salesProposal->proposal_date = $request->invoice_date;
            $salesProposal->due_date = $request->due_date;
            $customerMode = $request->input('customer_mode', 'existing');
            if ($customerMode === 'new') {
                $salesProposal->customer_id = null;
                $salesProposal->customer_name = $request->customer_name;
                $salesProposal->customer_email = $request->customer_email;
                $salesProposal->customer_phone = $request->customer_phone;
                $salesProposal->customer_address = $request->customer_address;
            } else {
                $salesProposal->customer_id = $request->customer_id;
                $existingCustomer = $request->customer_id ? User::find($request->customer_id) : null;
                $salesProposal->customer_name = $existingCustomer?->name;
                $salesProposal->customer_email = $existingCustomer?->email;
                $salesProposal->customer_phone = $existingCustomer?->phone ?? $existingCustomer?->mobile_no;
                $salesProposal->customer_address = $existingCustomer?->address;
            }
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            $salesProposal->warehouse_id = $salesProposal->type === 'product' ? $request->warehouse_id : null;
            $salesProposal->is_recurring = $isRecurring;
            $salesProposal->is_prepaid = $isPrepaid;
            $salesProposal->is_tax_enabled = $isTaxEnabled ? 1 : 0;
            $salesProposal->payment_terms = $request->payment_terms;
            $salesProposal->notes = $request->notes;
            $salesProposal->subtotal = $totals['subtotal'];
            $salesProposal->tax_amount = $totals['tax_amount'];
            $salesProposal->discount_amount = $totals['discount_amount'];
            $salesProposal->total_amount = $totals['total_amount'];
            $salesProposal->save();

            $salesProposal->items()->delete();
<<<<<<< HEAD
            $this->createProposalItems($salesProposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalTariffs($salesProposal->id, $request->tariffs);
            $this->saveProposalContents($salesProposal->id, $request->proposal_content);
=======
            $this->saveProposalItems($salesProposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalPageContents($salesProposal->id, $request->proposal_content);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        });

        try {
            UpdateSalesProposal::dispatch($request, $salesProposal);
        } catch (\Throwable $th) {
<<<<<<< HEAD
=======
            // Silently catch event dispatcher exceptions
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal details are updated successfully.'));
    }

    /**
     * Delete proposal.
     */
    public function destroy(SalesProposal $salesProposal)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('delete-sales-proposals')) {
=======
        if (!Auth::user()->can('delete-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return back()->withErrors(['error' => __('Cannot delete converted proposal.')]);
        }

        DestroySalesProposal::dispatch($salesProposal);
        $salesProposal->delete();

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been deleted.'));
    }

    /**
     * Convert accepted proposal to invoice.
     */
    public function convertToInvoice(SalesProposal $salesProposal)
    {
<<<<<<< HEAD
        if (!Auth::user()->can('convert-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return back()->with('error', __('Permission denied'));
=======
        if (!Auth::user()->can('convert-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'accepted') {
            return back()->with('error', __('Only accepted proposals can be converted to invoice.'));
        }

        if ($salesProposal->converted_to_invoice) {
            return back()->with('error', __('Proposal already converted to invoice.'));
        }

        try {
            DB::transaction(function () use ($salesProposal, &$invoice) {
                $invoice = new SalesInvoice();
                $invoice->customer_id = $salesProposal->customer_id;
                $invoice->warehouse_id = $salesProposal->warehouse_id ?? 1;
                $invoice->type = $salesProposal->type ?? 'product';
                $invoice->invoice_date = now();
                $invoice->due_date = $salesProposal->due_date;
                $invoice->subtotal = $salesProposal->subtotal;
                $invoice->tax_amount = $salesProposal->tax_amount;
                $invoice->discount_amount = $salesProposal->discount_amount;
                $invoice->total_amount = $salesProposal->total_amount;
                $invoice->balance_amount = $salesProposal->total_amount;
                $invoice->paid_amount = 0;
                $invoice->payment_terms = $salesProposal->payment_terms;
                $invoice->notes = $salesProposal->notes;
                $invoice->status = 'draft';
                $invoice->creator_id = creatorId();
                $invoice->created_by = Auth::id();
                $invoice->save();

                foreach ($salesProposal->items as $proposalItem) {
                    $invoiceItem = new SalesInvoiceItem();
                    $invoiceItem->invoice_id = $invoice->id;
                    $invoiceItem->product_id = $proposalItem->product_id;
                    $invoiceItem->quantity = $proposalItem->quantity;
                    $invoiceItem->unit_price = $proposalItem->unit_price;
                    $invoiceItem->discount_percentage = $proposalItem->discount_percentage;
                    $invoiceItem->tax_percentage = $proposalItem->tax_percentage;
                    $invoiceItem->save();

                    foreach ($proposalItem->taxes as $tax) {
                        $invoiceTax = new SalesInvoiceItemTax();
                        $invoiceTax->item_id = $invoiceItem->id;
                        $invoiceTax->tax_name = $tax->tax_name;
                        $invoiceTax->tax_rate = $tax->tax_rate;
                        $invoiceTax->save();
                    }
                }

                $salesProposal->update([
                    'converted_to_invoice' => true,
                    'invoice_id' => $invoice->id
                ]);
            });

            try {
                ConvertSalesProposal::dispatch($salesProposal, $invoice);
            } catch (\Throwable $th) {
                return back()->with('error', $th->getMessage());
            }

            return back()->with('success', __('Proposal converted to invoice successfully.'));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        }

        if ($salesProposal->status !== 'accepted') {
            return back()->with('error', __('Only accepted proposals can be converted to invoice.'));
        }

        if ($salesProposal->converted_to_invoice) {
            return back()->with('error', __('Proposal already converted to invoice.'));
        }

        try {
            $invoice = new SalesInvoice();
            $invoice->customer_id = $salesProposal->customer_id;
            $invoice->warehouse_id = $salesProposal->warehouse_id ?? 1;
            $invoice->type = $salesProposal->type ?? 'product';
            $invoice->invoice_date = now();
            $invoice->due_date = $salesProposal->due_date;
            $invoice->subtotal = $salesProposal->subtotal;
            $invoice->tax_amount = $salesProposal->tax_amount;
            $invoice->discount_amount = $salesProposal->discount_amount;
            $invoice->total_amount = $salesProposal->total_amount;
            $invoice->balance_amount = $salesProposal->total_amount;
            $invoice->paid_amount = 0;
            $invoice->payment_terms = $salesProposal->payment_terms;
            $invoice->notes = $salesProposal->notes;
            $invoice->status = 'draft';
            $invoice->creator_id = creatorId();
            $invoice->created_by = Auth::id();
            $invoice->save();

            foreach ($salesProposal->items as $proposalItem) {
                $invoiceItem = new SalesInvoiceItem();
                $invoiceItem->invoice_id = $invoice->id;
                $invoiceItem->product_id = $proposalItem->product_id;
                $invoiceItem->quantity = $proposalItem->quantity;
                $invoiceItem->unit_price = $proposalItem->unit_price;
                $invoiceItem->discount_percentage = $proposalItem->discount_percentage;
                $invoiceItem->tax_percentage = $proposalItem->tax_percentage;
                $invoiceItem->save();

                foreach ($proposalItem->taxes as $tax) {
                    $invoiceTax = new SalesInvoiceItemTax();
                    $invoiceTax->item_id = $invoiceItem->id;
                    $invoiceTax->tax_name = $tax->tax_name;
                    $invoiceTax->tax_rate = $tax->tax_rate;
                    $invoiceTax->save();
                }
            }

            $salesProposal->update([
                'converted_to_invoice' => true,
                'invoice_id' => $invoice->id
            ]);

            try {
                ConvertSalesProposal::dispatch($salesProposal, $invoice);
            } catch (\Throwable $th) {
                return back()->with('error', $th->getMessage());
            }

            return back()->with('success', __('Proposal converted to invoice successfully.'));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Mark proposal as sent and notify customer.
     */
    public function sent(SalesProposal $salesProposal)
<<<<<<< HEAD
    {
        if (!Auth::user()->can('sent-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'draft') {
            return back()->with('error', __('Only draft proposals can be sent.'));
        }

        SentSalesProposal::dispatch($salesProposal);

        if (company_setting('Proposal Sent') === 'on' && $salesProposal->customer?->email) {
            $emailData = [
                'proposal_number' => $salesProposal->proposal_number ?? null,
                'sales_customer_name' => $salesProposal->customer->name ?? null,
                'total_amount' => $salesProposal->total_amount ?? null,
                'discount_amount' => $salesProposal->discount_amount ?? null,
            ];
            $message = EmailTemplate::sendEmailTemplate('Proposal Sent', [$salesProposal->customer->email], $emailData);
            if ($message['is_success'] === false && !empty($message['error'])) {
                return back()
                    ->with('success', __('Proposal sent successfully.'))
                    ->with('error', $message['error']);
            }
        }

        $salesProposal->update(['status' => 'sent']);

        return back()->with('success', __('Proposal sent successfully.'));
    }

    /**
     * Mark proposal as accepted.
     */
    public function accept(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('accept-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'sent') {
            return back()->with('error', __('Only sent proposals can be accepted.'));
        }

        AcceptSalesProposal::dispatch($salesProposal);

        if (company_setting('Proposal Approved') === 'on') {
            $author = User::find($salesProposal->created_by);
            $companyEmail = company_setting('company_email', $salesProposal->creator_id) ?: $author?->email;

            if ($companyEmail) {
                $emailData = [
                    'proposal_number' => $salesProposal->proposal_number ?? null,
                    'sales_customer_name' => $salesProposal->customer->name ?? null,
                    'total_amount' => $salesProposal->total_amount ?? null,
                    'discount_amount' => $salesProposal->discount_amount ?? null,
                    'status' => 'Accepted',
                ];
                $message = EmailTemplate::sendEmailTemplate('Proposal Approved', [$companyEmail], $emailData);
                if ($message['is_success'] === false && !empty($message['error'])) {
                    return back()
                        ->with('success', __('Proposal accepted successfully.'))
                        ->with('error', $message['error']);
                }
            }
        }

        $salesProposal->update(['status' => 'accepted']);

        return back()->with('success', __('Proposal accepted successfully.'));
    }

    /**
     * Mark proposal as rejected.
     */
    public function reject(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('reject-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'sent') {
            return back()->with('error', __('Only sent proposals can be rejected.'));
        }

        RejectSalesProposal::dispatch($salesProposal);

        if (company_setting('Proposal Approved') === 'on') {
            $author = User::find($salesProposal->created_by);
            $companyEmail = company_setting('company_email', $salesProposal->creator_id) ?: $author?->email;

            if ($companyEmail) {
                $emailData = [
                    'proposal_number' => $salesProposal->proposal_number ?? null,
                    'sales_customer_name' => $salesProposal->customer->name ?? null,
                    'total_amount' => $salesProposal->total_amount ?? null,
                    'discount_amount' => $salesProposal->discount_amount ?? null,
                    'status' => 'Rejected',
                ];
                $message = EmailTemplate::sendEmailTemplate('Proposal Approved', [$companyEmail], $emailData);
                if ($message['is_success'] === false && !empty($message['error'])) {
                    return back()
                        ->with('success', __('Proposal rejected successfully.'))
                        ->with('error', $message['error']);
                }
            }
        }

        $salesProposal->update(['status' => 'rejected']);

        return back()->with('success', __('Proposal rejected successfully.'));
    }

    /**
     * Print proposal view.
     */
    public function print(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('print-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $salesProposal->load($this->getProposalRelations());
        $proposalAuthorId = $salesProposal->created_by ?? Auth::id();
        $defaultPages = ProposalDefaultPage::where('creator_id', creatorId())
            ->where('created_by', $proposalAuthorId)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        return view('sales-proposals.print', [
            'proposal' => $salesProposal,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
        ]);
    }

    /**
     * Download PDF version of proposal.
     */
    public function downloadPdf(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('print-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $salesProposal->load($this->getProposalRelations());
        $proposalAuthorId = $salesProposal->created_by ?? Auth::id();
        $defaultPages = ProposalDefaultPage::where('creator_id', creatorId())
            ->where('created_by', $proposalAuthorId)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        $companyName = $proposalSetting['company_name'] ?? config('app.name', 'Automas');
        $sanitizedCompanyName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($companyName)));
        $sanitizedProposalNumber = strtolower(preg_replace('/[^a-z0-9-]+/i', '_', trim($salesProposal->proposal_number)));
        $filename = "quotation_{$sanitizedCompanyName}_{$sanitizedProposalNumber}.pdf";

        return Pdf::view('sales-proposals.print', [
            'proposal' => $salesProposal,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
            'isServerPdf' => true,
        ])
            ->format('a4')
            ->margins(0, 0, 0, 0)
            ->download($filename);
    }

    /**
     * AJAX endpoint for warehouse products.
     */
    public function getWarehouseProducts(Request $request)
    {
        if (!Auth::user()->can('create-sales-proposals') && !Auth::user()->can('edit-sales-proposals')) {
            return response()->json([], 403);
        }

        $warehouseId = $request->warehouse_id;
        $query = ProductServiceItem::select('id', 'name', 'sku', 'description', 'sale_price', 'long_description', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where('creator_id', creatorId());

        if ($warehouseId) {
            $query->where(function ($q) use ($warehouseId) {
                $q->whereHas('warehouseStocks', function ($stockQuery) use ($warehouseId) {
                    $stockQuery->where('warehouse_id', $warehouseId)->where('quantity', '>', 0);
                })->orWhere('type', 'service')
                    ->orWhereNull('type')
                    ->orWhereDoesntHave('warehouseStocks');
            })->with([
                'warehouseStocks' => fn($q) => $q->where('warehouse_id', $warehouseId)
            ]);
        }

        $products = $query->get()->map(function ($product) {
            $stock = $product->relationLoaded('warehouseStocks') ? $product->warehouseStocks->first() : null;
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'long_description' => $product->long_description,
                'sku' => $product->sku,
                'sale_price' => $product->sale_price,
                'unit' => $product->unit,
                'type' => $product->type,
                'stock_quantity' => $stock ? $stock->quantity : 0,
                'taxes' => $product->taxes->map(fn($tax) => [
                    'id' => $tax->id,
                    'tax_name' => $tax->tax_name,
                    'rate' => $tax->rate
                ])
            ];
        });

        return response()->json($products);
    }

    /**
     * AJAX endpoint for services.
     */
    public function getServices(Request $request)
    {
        if (!Auth::user()->can('create-sales-proposals') && !Auth::user()->can('edit-sales-proposals')) {
            return response()->json([], 403);
        }

        $services = ProductServiceItem::select('id', 'name', 'sku', 'description', 'long_description', 'sale_price', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where('type', 'service')
            ->where('creator_id', creatorId())
            ->get()
            ->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'long_description' => $service->long_description,
                'sku' => $service->sku,
                'sale_price' => $service->sale_price,
                'unit' => $service->unit,
                'type' => $service->type,
                'taxes' => $service->taxes->map(fn($tax) => [
                    'id' => $tax->id,
                    'tax_name' => $tax->tax_name,
                    'rate' => $tax->rate
                ])
            ]);

        return response()->json($services);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Helper Methods                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Determine if items array contains monthly recurring charge items.
     */
    private function hasMrcItems($items): bool
    {
        if (!is_array($items)) {
            return false;
        }

        foreach ($items as $item) {
            if (($item['section'] ?? '') === 'mrc' && !empty($item['product_id'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate line item totals, taxes, and discounts.
     */
    private function calculateTotals($items, bool $isTaxEnabled = true): array
=======
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    {
        if (!Auth::user()->can('sent-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'draft') {
            return back()->with('error', __('Only draft proposals can be sent.'));
        }

        SentSalesProposal::dispatch($salesProposal);

        $notificationResult = $this->notifyCustomerOnStatusChange($salesProposal, 'Proposal Sent');

        if (isset($notificationResult) && $notificationResult['is_success'] === false && !empty($notificationResult['error'])) {
            $salesProposal->update(['status' => 'sent']);
            return back()
                ->with('success', __('Proposal sent successfully.'))
                ->with('error', $notificationResult['error']);
        }

        $salesProposal->update(['status' => 'sent']);

        return back()->with('success', __('Proposal sent successfully.'));
    }

    /**
     * Mark proposal as accepted.
     */
    public function accept(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('accept-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'sent') {
            return back()->with('error', __('Only sent proposals can be accepted.'));
        }

        AcceptSalesProposal::dispatch($salesProposal);

        $notificationResult = $this->notifyCustomerOnStatusChange($salesProposal, 'Proposal Approved', 'Accepted');

        if (isset($notificationResult) && $notificationResult['is_success'] === false && !empty($notificationResult['error'])) {
            $salesProposal->update(['status' => 'accepted']);
            return back()
                ->with('success', __('Proposal accepted successfully.'))
                ->with('error', $notificationResult['error']);
        }

        $salesProposal->update(['status' => 'accepted']);

        return back()->with('success', __('Proposal accepted successfully.'));
    }

    /**
     * Mark proposal as rejected.
     */
    public function reject(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('reject-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesProposal->status !== 'sent') {
            return back()->with('error', __('Only sent proposals can be rejected.'));
        }

        RejectSalesProposal::dispatch($salesProposal);

        $notificationResult = $this->notifyCustomerOnStatusChange($salesProposal, 'Proposal Approved', 'Rejected');

        if (isset($notificationResult) && $notificationResult['is_success'] === false && !empty($notificationResult['error'])) {
            $salesProposal->update(['status' => 'rejected']);
            return back()
                ->with('success', __('Proposal rejected successfully.'))
                ->with('error', $notificationResult['error']);
        }

        $salesProposal->update(['status' => 'rejected']);

        return back()->with('success', __('Proposal rejected successfully.'));
    }

    /**
     * Print proposal view.
     */
    public function print(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('print-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        $salesProposal->load($this->getProposalRelations());
        $proposalAuthorId = $salesProposal->created_by ?? Auth::id();
        $defaultPages = $this->getActiveDefaultPages($proposalAuthorId);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        return view('sales-proposals.print', [
            'proposal' => $salesProposal,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
        ]);
    }

    /**
     * Download PDF version of proposal.
     */
    public function downloadPdf(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('print-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return back()->with('error', __('Permission denied'));
        }

        $salesProposal->load($this->getProposalRelations());
        $proposalAuthorId = $salesProposal->created_by ?? Auth::id();
        $defaultPages = $this->getActiveDefaultPages($proposalAuthorId);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        $companyName = $proposalSetting['company_name'] ?? config('app.name', 'Automas');
        $sanitizedCompanyName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($companyName)));
        $sanitizedProposalNumber = strtolower(preg_replace('/[^a-z0-9-]+/i', '_', trim($salesProposal->proposal_number)));
        $filename = "quotation_{$sanitizedCompanyName}_{$sanitizedProposalNumber}.pdf";

        return Pdf::view('sales-proposals.print', [
            'proposal' => $salesProposal,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
            'isServerPdf' => true,
        ])
            ->format('a4')
            ->margins(0, 0, 0, 0)
            ->download($filename);
    }

    /**
     * AJAX endpoint for warehouse products.
     */
    public function getWarehouseProducts(Request $request)
    {
        if (!Auth::user()->can('create-sales-proposals') && !Auth::user()->can('edit-sales-proposals')) {
            return response()->json([], 403);
        }

        $warehouseId = $request->warehouse_id;
        $productsQuery = ProductServiceItem::with('unitRelation:id,unit_name')
            ->select('id', 'name', 'sku', 'description', 'sale_price', 'long_description', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('created_by', creatorId())
                    ->orWhere('creator_id', creatorId());
            });

        if ($warehouseId) {
            $productsQuery->where(function ($q) use ($warehouseId) {
                $q->whereHas('warehouseStocks', function ($stockQuery) use ($warehouseId) {
                    $stockQuery->where('warehouse_id', $warehouseId)->where('quantity', '>', 0);
                })->orWhere('type', 'service')
                    ->orWhereNull('type')
                    ->orWhereDoesntHave('warehouseStocks');
            })->with([
                'warehouseStocks' => fn($q) => $q->where('warehouse_id', $warehouseId)
            ]);
        }

        $products = $productsQuery->get()->map(function ($product) {
            $stockQuantity = $product->relationLoaded('warehouseStocks') && $product->warehouseStocks->isNotEmpty()
                ? $product->warehouseStocks->first()->quantity
                : 0;

            $unitName = $product->unitRelation?->unit_name ?? (is_numeric($product->unit) ? '' : ($product->unit ?? ''));

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'long_description' => $product->long_description,
                'sku' => $product->sku,
                'sale_price' => $product->sale_price,
                'unit' => $product->unit,
                'unit_name' => $unitName,
                'type' => $product->type,
                'stock_quantity' => $stockQuantity,
                'taxes' => $product->taxes->map(fn($tax) => [
                    'id' => $tax->id,
                    'tax_name' => $tax->tax_name,
                    'rate' => $tax->rate
                ])
            ];
        });

        return response()->json($products);
    }

    /**
     * AJAX endpoint for services.
     */
    public function getServices(Request $request)
    {
        if (!Auth::user()->can('create-sales-proposals') && !Auth::user()->can('edit-sales-proposals')) {
            return response()->json([], 403);
        }

        $services = ProductServiceItem::with('unitRelation:id,unit_name')
            ->select('id', 'name', 'sku', 'description', 'long_description', 'sale_price', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where('type', 'service')
            ->where(function ($q) {
                $q->where('created_by', creatorId())
                    ->orWhere('creator_id', creatorId());
            })
            ->get()
            ->map(function ($service) {
                $unitName = $service->unitRelation?->unit_name ?? (is_numeric($service->unit) ? '' : ($service->unit ?? ''));

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'long_description' => $service->long_description,
                    'sku' => $service->sku,
                    'sale_price' => $service->sale_price,
                    'unit' => $service->unit,
                    'unit_name' => $unitName,
                    'type' => $service->type,
                    'taxes' => $service->taxes->map(fn($tax) => [
                        'id' => $tax->id,
                        'tax_name' => $tax->tax_name,
                        'rate' => $tax->rate
                    ])
                ];
            });

        return response()->json($services);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Helper Methods                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Determine if items array contains monthly recurring charge items.
     */
    private function hasRecurringBillingItems(?array $items): bool
    {
        if (empty($items)) {
            return false;
        }

        foreach ($items as $item) {
            if (($item['section'] ?? '') === 'mrc' && !empty($item['product_id'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate line item totals, taxes, and discounts.
     */
    private function calculateProposalTotals(?array $items, bool $isTaxEnabled = true): array
    {
        $subtotal = 0.0;
        $totalTax = 0.0;
        $totalDiscount = 0.0;

        if (!empty($items)) {
            foreach ($items as $item) {
                if (empty($item['product_id']) || (int) $item['product_id'] <= 0) {
                    continue;
                }

                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $unitPrice = max(0, (float) ($item['unit_price'] ?? 0));
                $discountPercentage = max(0, min(100, (float) ($item['discount_percentage'] ?? 0)));

                $taxPercentage = 0.0;
                if ($isTaxEnabled) {
<<<<<<< HEAD
                    $taxPct = (float) ($item['tax_percentage'] ?? 0);
                    if (!empty($item['taxes']) && is_array($item['taxes'])) {
                        $taxPct = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0);
=======
                    $taxPercentage = (float) ($item['tax_percentage'] ?? 0);
                    if (!empty($item['taxes']) && is_array($item['taxes'])) {
                        $taxPercentage = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0.0);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
                    }
                }

                $lineTotal = $quantity * $unitPrice;
                $discountAmount = ($lineTotal * $discountPercentage) / 100;
                $priceAfterDiscount = $lineTotal - $discountAmount;
                $taxAmount = ($priceAfterDiscount * $taxPercentage) / 100;

                $subtotal += $lineTotal;
                $totalDiscount += $discountAmount;
                $totalTax += $taxAmount;
            }
        }

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($totalTax, 2),
            'discount_amount' => round($totalDiscount, 2),
            'total_amount' => round($subtotal + $totalTax - $totalDiscount, 2)
        ];
    }

    /**
<<<<<<< HEAD
     * Save line items and item taxes for a proposal.
     */
    private function createProposalItems($proposalId, $items, bool $isTaxEnabled = true): void
=======
     * Save items and item taxes for a proposal.
     */
    private function saveProposalItems(int $proposalId, ?array $items, bool $isTaxEnabled = true): void
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    {
        if (empty($items)) {
            return;
        }

        foreach ($items as $itemData) {
            if (empty($itemData['product_id']) || (int) $itemData['product_id'] <= 0) {
                continue;
            }

            $quantity = max(1, (int) ($itemData['quantity'] ?? 1));
            $unitPrice = max(0, (float) ($itemData['unit_price'] ?? 0));
            $discountPercentage = max(0, min(100, (float) ($itemData['discount_percentage'] ?? 0)));

            $taxPercentage = 0.0;
            if ($isTaxEnabled) {
<<<<<<< HEAD
                $taxPct = (float) ($itemData['tax_percentage'] ?? 0);
                if (!empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                    $taxPct = array_reduce($itemData['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0);
                }
            }

            $item = new SalesProposalItem();
            $item->proposal_id = $proposalId;
            $item->product_id = $itemData['product_id'];
            $item->section = $itemData['section'] ?? 'otc';
            $item->product_type = $itemData['product_type'] ?? 'product';
            $item->description = $itemData['description'] ?? $itemData['product_description'] ?? null;
            $item->quantity = $quantity;
            $item->unit_price = $unitPrice;
            $item->discount_percentage = $discountPct;
            $item->tax_percentage = $taxPct;
            $item->save();

            if ($isTaxEnabled && !empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $tax) {
=======
                $taxPercentage = (float) ($itemData['tax_percentage'] ?? 0);
                if (!empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                    $taxPercentage = array_reduce($itemData['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0.0);
                }
            }

            $proposalItem = new SalesProposalItem();
            $proposalItem->proposal_id = $proposalId;
            $proposalItem->product_id = $itemData['product_id'];
            $proposalItem->section = $itemData['section'] ?? 'otc';
            $proposalItem->product_type = $itemData['product_type'] ?? 'product';
            $proposalItem->description = $itemData['description'] ?? $itemData['product_description'] ?? null;
            $proposalItem->quantity = $quantity;
            $proposalItem->unit_price = $unitPrice;
            $proposalItem->discount_percentage = $discountPercentage;
            $proposalItem->tax_percentage = $taxPercentage;
            $proposalItem->save();

            if ($isTaxEnabled && !empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $taxData) {
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
                    $proposalItemTax = new SalesProposalItemTax();
                    $proposalItemTax->item_id = $proposalItem->id;
                    $proposalItemTax->tax_name = $taxData['tax_name'] ?? 'Tax';
                    $proposalItemTax->tax_rate = (float) ($taxData['tax_rate'] ?? $taxData['rate'] ?? 0);
                    $proposalItemTax->save();
                }
            }
        }
    }

    /**
<<<<<<< HEAD
     * Save proposal tariffs.
     */
    private function saveProposalTariffs($proposalId, $tariffs): void
    {
        if (!Schema::hasTable('sales_proposal_tariffs')) {
            return;
        }

        SalesProposalTariff::where('proposal_id', $proposalId)->delete();
        if (is_array($tariffs)) {
            foreach ($tariffs as $index => $tariffData) {
                if (!empty($tariffData['particulars']) || !empty($tariffData['brand'])) {
                    SalesProposalTariff::create([
                        'proposal_id' => $proposalId,
                        'particulars' => $tariffData['particulars'] ?? null,
                        'tariff_per_min' => $tariffData['tariff_per_min'] ?? 0,
                        'brand' => $tariffData['brand'] ?? null,
                        'qty' => $tariffData['qty'] ?? 1,
                        'pulse_per_min' => $tariffData['pulse_per_min'] ?? null,
                        'sort_order' => $tariffData['sort_order'] ?? ($index + 1),
                    ]);
                }
            }
        }
    }

    /**
     * Save proposal contents.
     */
    private function saveProposalContents($proposalId, $proposalContent): void
=======
     * Save proposal contents.
     */
    private function saveProposalPageContents(int $proposalId, $proposalContentPayload): void
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
    {
        if (!Schema::hasTable('sales_proposal_contents')) {
            return;
        }

        try {
            if (Schema::hasColumn('sales_proposal_contents', 'proposal_id')) {
                SalesProposalContent::where('proposal_id', $proposalId)->delete();
            }
        } catch (\Throwable $th) {
            // Silently catch schema/delete errors if table is not strictly fully migrated
        }

        if (empty($proposalContentPayload)) {
            return;
        }

        $contentItems = is_string($proposalContentPayload) ? json_decode($proposalContentPayload, true) : $proposalContentPayload;
        if (!is_array($contentItems)) {
            return;
        }

<<<<<<< HEAD
        $savedOrder = 1;
        foreach ($items as $item) {
            if (is_array($item)) {
                $pageType = $item['page_type'] ?? 'content';

                // Do not add items pages (otc, mrc) into contents table as they have their own items table
                if (in_array($pageType, ['otc', 'mrc'])) {
                    continue;
                }

                $order = isset($item['order']) && (int) $item['order'] > 0 ? (int) $item['order'] : $savedOrder;
                $title = $item['title'] ?? null;
                $htmlContent = $item['content'] ?? null;
                $bgImage = $item['background_image'] ?? null;
                $jsonContent = json_encode($item);
=======
        $sequentialOrder = 1;
        foreach ($contentItems as $contentItem) {
            if (is_array($contentItem)) {
                $pageType = $contentItem['page_type'] ?? 'content';
                $order = isset($contentItem['order']) ? (int) $contentItem['order'] : $sequentialOrder;
                $title = $contentItem['title'] ?? null;
                $htmlContent = $contentItem['content'] ?? null;
                $backgroundImage = $contentItem['background_image'] ?? null;
                $jsonSerializedContent = json_encode($contentItem);
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
            } else {
                $order = $sequentialOrder;
                $title = null;
                $htmlContent = (string) $contentItem;
                $pageType = 'content';
                $backgroundImage = null;
                $jsonSerializedContent = (string) $contentItem;
            }

            SalesProposalContent::create([
                'proposal_id' => $proposalId,
                'title' => $title,
                'content' => $htmlContent,
                'page_type' => $pageType,
                'background_image' => $backgroundImage,
                'proposal_content' => $htmlContent ?? $jsonSerializedContent,
                'order' => $order,
            ]);
<<<<<<< HEAD
            $savedOrder = max($savedOrder + 1, $order + 1);
=======
            $sequentialOrder++;
>>>>>>> 89160eb208d713f7b346ef21a2341adfaa0c5bda
        }
    }
}