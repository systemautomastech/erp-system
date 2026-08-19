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

        return false;
    }

    /**
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
     * Display proposal list & board view.
     */
    public function index(Request $request)
    {
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
                        $query->where('status', '!=', 'draft');
                    }
                } else {
                    $query->whereRaw('1 = 0');
                }
            });

        if ($request->filled('customer_id')) {
            $proposalQuery->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $searchKeyword = $request->search;
            $proposalQuery->where(function ($query) use ($searchKeyword) {
                $query->where('proposal_number', 'like', "%{$searchKeyword}%")
                    ->orWhere('reference', 'like', "%{$searchKeyword}%")
                    ->orWhere('subject', 'like', "%{$searchKeyword}%");
            });
        }

        if ($request->filled('date_range')) {
            $dates = explode(' - ', $request->date_range);
            if (count($dates) === 2) {
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
            }
        }

        $allowedSortFields = ['proposal_number', 'reference', 'subject', 'proposal_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
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
            'proposals' => $proposals,
            'customers' => $customers,
            'stats' => $stats,
            'boardData' => $boardData,
            'filters' => $request->only(['customer_id', 'status', 'search', 'date_range'])
        ];

        return Inertia::render('SalesProposals/Index', $proposalData);
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
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')
            ->where('creator_id', creatorId())->get();
        $defaultPages = $this->getActiveDefaultPages(Auth::id());
        $proposalSetting = ProposalSetting::getSettings(creatorId());

        $proposalData = [
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'defaultTerms' => $proposalSetting['default_terms'] ?? null,
            'proposalSetting' => $proposalSetting,
        ];

        return Inertia::render('SalesProposals/Create', $proposalData);
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
            $totals = $this->calculateProposalTotals($request->items, $isTaxEnabled);

            $containsSubscriptionItems = $this->hasRecurringBillingItems($request->items);
            $isRecurring = $containsSubscriptionItems ? 1 : 0;
            $isPrepaid = ($containsSubscriptionItems && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $proposal = new SalesProposal();
            $proposal->proposal_number = SalesProposal::generateProposalNumber($request->invoice_date ?? $request->proposal_date);
            $proposal->reference = $request->reference;
            $proposal->subject = $request->subject;
            $proposal->proposal_date = $request->invoice_date ?? $request->proposal_date;
            $proposal->due_date = $request->due_date;
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

            $this->saveProposalItems($proposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalPageContents($proposal->id, $request->proposal_content);

            return $proposal;
        });

        try {
            CreateSalesProposal::dispatch($request, $proposal);
        } catch (\Throwable $th) {
            // Silently catch event dispatcher exceptions
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been created successfully.'));
    }

    /**
     * Show single proposal view.
     */
    public function show(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('view-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
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
        if (!Auth::user()->can('edit-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        $salesProposal->load($this->getProposalRelations());

        $customers = User::where('type', 'client')->where('creator_id', creatorId())->get();
        $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('creator_id', creatorId())->get();
        $proposalSetting = ProposalSetting::getSettings(creatorId());
        $defaultPages = $this->getActiveDefaultPages(Auth::id());

        $porposalData = [
            'proposal' => $salesProposal,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'proposalSetting' => $proposalSetting,
        ];

        return Inertia::render('SalesProposals/Edit', $porposalData);
    }

    /**
     * Update proposal details.
     */
    public function update(UpdateSalesProposalRequest $request, SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('edit-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }

        if ($salesProposal->converted_to_invoice) {
            return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
        }

        DB::transaction(function () use ($request, $salesProposal) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
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
            $this->saveProposalItems($salesProposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalPageContents($salesProposal->id, $request->proposal_content);
        });

        try {
            UpdateSalesProposal::dispatch($request, $salesProposal);
        } catch (\Throwable $th) {
            // Silently catch event dispatcher exceptions
        }

        return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal details are updated successfully.'));
    }

    /**
     * Delete proposal.
     */
    public function destroy(SalesProposal $salesProposal)
    {
        if (!Auth::user()->can('delete-sales-proposals') || !$this->hasProposalAccess($salesProposal)) {
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
        }
    }

    /**
     * Mark proposal as sent and notify customer.
     */
    public function sent(SalesProposal $salesProposal)
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
                    $taxPercentage = (float) ($item['tax_percentage'] ?? 0);
                    if (!empty($item['taxes']) && is_array($item['taxes'])) {
                        $taxPercentage = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0.0);
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
     * Save items and item taxes for a proposal.
     */
    private function saveProposalItems(int $proposalId, ?array $items, bool $isTaxEnabled = true): void
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
     * Save proposal contents.
     */
    private function saveProposalPageContents(int $proposalId, $proposalContentPayload): void
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

        $sequentialOrder = 1;
        foreach ($contentItems as $contentItem) {
            if (is_array($contentItem)) {
                $pageType = $contentItem['page_type'] ?? 'content';
                $order = isset($contentItem['order']) ? (int) $contentItem['order'] : $sequentialOrder;
                $title = $contentItem['title'] ?? null;
                $htmlContent = $contentItem['content'] ?? null;
                $backgroundImage = $contentItem['background_image'] ?? null;
                $jsonSerializedContent = json_encode($contentItem);
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
            $sequentialOrder++;
        }
    }
}