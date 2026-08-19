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
use App\Models\SalesProposalTariff;
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
    {
        $relations = ['customer', 'items.product', 'items.taxes', 'warehouse'];

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

        return false;
    }

    /**
     * Display proposal list & board view.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user->can('manage-sales-proposals')) {
            return back()->with('error', __('Permission denied'));
        }

        $baseQuery = SalesProposal::with(['customer', 'items'])
            ->where(function ($query) use ($user) {
                if ($user->can('manage-any-sales-proposals')) {
                    $query->where('creator_id', creatorId());
                } elseif ($user->can('manage-own-sales-proposals')) {
                    $query->where('created_by', Auth::id())->orWhere('customer_id', Auth::id());
                    if ($user->type === 'client') {
                        $query->where('status', '!=', 'draft');
                    }
                } else {
                    $query->whereRaw('1 = 0');
                }
            });

        if ($request->filled('customer_id')) {
            $baseQuery->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $baseQuery->where(function ($query) use ($search) {
                $query->where('proposal_number', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_range')) {
            $dates = explode(' - ', $request->date_range);
            if (count($dates) === 2) {
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
            }
        }

        $allowedSortFields = ['proposal_number', 'reference', 'subject', 'proposal_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
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
            'proposals' => $proposals,
            'customers' => $customers,
            'stats' => $stats,
            'boardData' => $boardData,
            'filters' => $request->only(['customer_id', 'status', 'search', 'date_range'])
        ]);
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
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('creator_id', creatorId())->get();
        $defaultPages = ProposalDefaultPage::where('creator_id', creatorId())
            ->where('created_by', Auth::id())
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        return Inertia::render('SalesProposals/Create', [
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'defaultTerms' => $proposalSetting['default_terms'] ?? null,
            'proposalSetting' => $proposalSetting,
        ]);
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
            $totals = $this->calculateTotals($request->items, $isTaxEnabled);

            $hasRecurringItems = $this->hasMrcItems($request->items);
            $isRecurring = $hasRecurringItems ? 1 : 0;
            $isPrepaid = ($hasRecurringItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $proposal = new SalesProposal();
            $proposal->proposal_number = SalesProposal::generateProposalNumber($request->invoice_date ?? $request->proposal_date);
            $proposal->reference = $request->reference;
            $proposal->subject = $request->subject;
            $proposal->proposal_date = $request->invoice_date ?? $request->proposal_date;
            $proposal->due_date = $request->due_date;
            $proposal->customer_id = $request->customer_id;
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

            $this->createProposalItems($proposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalTariffs($proposal->id, $request->tariffs);
            $this->saveProposalContents($proposal->id, $request->proposal_content);

            return $proposal;
        });

        try {
            CreateSalesProposal::dispatch($request, $proposal);
        } catch (\Throwable $th) {
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been created successfully.'));
    }

    /**
     * Show single proposal view.
     */
    public function show(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('view-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if (!$this->checkProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

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
        if (!Auth::user()->can('edit-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if (!$this->checkProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        $salesProposal->load($this->getProposalRelations());
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
            'proposal' => $salesProposal,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
        ]);
    }

    /**
     * Update proposal details.
     */
    public function update(UpdateSalesProposalRequest $request, SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('edit-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        DB::transaction(function () use ($request, $salesProposal) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
            $totals = $this->calculateTotals($request->items, $isTaxEnabled);

            $hasRecurringItems = $this->hasMrcItems($request->items);
            $isRecurring = $hasRecurringItems ? 1 : 0;
            $isPrepaid = ($hasRecurringItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $salesProposal->proposal_date = $request->invoice_date;
            $salesProposal->due_date = $request->due_date;
            $salesProposal->customer_id = $request->customer_id;
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
            $this->createProposalItems($salesProposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalTariffs($salesProposal->id, $request->tariffs);
            $this->saveProposalContents($salesProposal->id, $request->proposal_content);
        });

        try {
            UpdateSalesProposal::dispatch($request, $salesProposal);
        } catch (\Throwable $th) {
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal details are updated successfully.'));
    }

    /**
     * Delete proposal.
     */
    public function destroy(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('delete-sales-proposals')) {
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
        if (!Auth::user()->can('convert-sales-proposals') || $salesProposal->creator_id != creatorId()) {
            return back()->with('error', __('Permission denied'));
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
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;

        if (is_array($items)) {
            foreach ($items as $item) {
                if (empty($item['product_id']) || (int) $item['product_id'] <= 0) {
                    continue;
                }

                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $unitPrice = max(0, (float) ($item['unit_price'] ?? 0));
                $discountPct = max(0, min(100, (float) ($item['discount_percentage'] ?? 0)));

                $taxPct = 0;
                if ($isTaxEnabled) {
                    $taxPct = (float) ($item['tax_percentage'] ?? 0);
                    if (!empty($item['taxes']) && is_array($item['taxes'])) {
                        $taxPct = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0);
                    }
                }

                $lineTotal = $quantity * $unitPrice;
                $discountAmount = ($lineTotal * $discountPct) / 100;
                $afterDiscount = $lineTotal - $discountAmount;
                $taxAmount = ($afterDiscount * $taxPct) / 100;

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
     * Save line items and item taxes for a proposal.
     */
    private function createProposalItems($proposalId, $items, bool $isTaxEnabled = true): void
    {
        if (!is_array($items)) {
            return;
        }

        foreach ($items as $itemData) {
            if (empty($itemData['product_id']) || (int) $itemData['product_id'] <= 0) {
                continue;
            }

            $quantity = max(1, (int) ($itemData['quantity'] ?? 1));
            $unitPrice = max(0, (float) ($itemData['unit_price'] ?? 0));
            $discountPct = max(0, min(100, (float) ($itemData['discount_percentage'] ?? 0)));

            $taxPct = 0;
            if ($isTaxEnabled) {
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
                    $proposalItemTax = new SalesProposalItemTax();
                    $proposalItemTax->item_id = $item->id;
                    $proposalItemTax->tax_name = $tax['tax_name'] ?? 'Tax';
                    $proposalItemTax->tax_rate = (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0);
                    $proposalItemTax->save();
                }
            }
        }
    }

    /**
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
    {
        if (!Schema::hasTable('sales_proposal_contents')) {
            return;
        }

        try {
            if (Schema::hasColumn('sales_proposal_contents', 'proposal_id')) {
                SalesProposalContent::where('proposal_id', $proposalId)->delete();
            }
        } catch (\Throwable $th) {
        }

        if (empty($proposalContent)) {
            return;
        }

        $items = is_string($proposalContent) ? json_decode($proposalContent, true) : $proposalContent;
        if (!is_array($items)) {
            return;
        }

        $savedOrder = 1;
        foreach ($items as $item) {
            if (is_array($item)) {
                $pageType = $item['page_type'] ?? 'content';

                // Do not add items pages (otc, mrc) into contents table as they have their own items table
                if (in_array($pageType, ['otc', 'mrc'])) {
                    continue;
                }

                $order = isset($item['order']) ? (int) $item['order'] : $savedOrder;
                $title = $item['title'] ?? null;
                $htmlContent = $item['content'] ?? null;
                $bgImage = $item['background_image'] ?? null;
                $jsonContent = json_encode($item);
            } else {
                $order = $savedOrder;
                $title = null;
                $htmlContent = (string) $item;
                $pageType = 'content';
                $bgImage = null;
                $jsonContent = (string) $item;
            }

            SalesProposalContent::create([
                'proposal_id' => $proposalId,
                'title' => $title,
                'content' => $htmlContent,
                'page_type' => $pageType,
                'background_image' => $bgImage,
                'proposal_content' => $htmlContent ?? $jsonContent,
                'order' => $order,
            ]);
            $savedOrder++;
        }
    }
}