<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\ProposalDefaultPage;
use App\Models\ProposalSetting;
use App\Models\SalesProposal;
use App\Models\SalesProposalContent;
use App\Models\SalesProposalItem;
use App\Models\SalesProposalItemTax;
use App\Models\User;
use Automas\ProductService\Models\ProductServiceItem;
use Automas\ProductService\Models\ProductServiceTax;
use Automas\Quotation\Models\SalesQuotation;
use Automas\Quotation\Models\SalesQuotationItem;
use Automas\Quotation\Models\SalesQuotationItemTax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProposalService
{
    public function __construct(
        protected QuotationServices $quotationService
    ) {
    }

    /**
     * Get common relationships loaded for proposal views and exports.
     */
    public function getProposalRelations(): array
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
    public function hasProposalAccess(SalesProposal $proposal): bool
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
     * Fetch active default proposal pages.
     */
    public function getActiveDefaultPages(int $authorId)
    {
        return ProposalDefaultPage::where('creator_id', creatorId())
            ->where(function ($query) use ($authorId) {
                $query->where('created_by', $authorId)
                    ->orWhere('created_by', creatorId());
            })
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'background_image', 'sort_order', 'created_by', 'creator_id']);
    }

    /**
     * Send email notifications on proposal status changes.
     */
    public function notifyCustomerOnStatusChange(SalesProposal $proposal, string $templateName, ?string $statusLabel = null): ?array
    {
        $emailRecipient = null;

        if ($templateName === 'Proposal Sent') {
            $emailRecipient = $proposal->customer?->email;
        } elseif ($templateName === 'Proposal Approved') {
            $author = User::find($proposal->created_by);
            $emailRecipient = company_setting('company_email', $proposal->creator_id) ?: $author?->email;
        }

        if (empty($emailRecipient) || company_setting($templateName) !== 'on') {
            return null;
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
     * Build base query for proposals based on user role and permissions.
     */
    public function getProposalsQuery($user)
    {
        return SalesProposal::with(['customer', 'items'])
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
    }

    /**
     * Get aggregated proposal statistics in a single query.
     */
    public function getAggregatedStats($baseQuery): array
    {
        $aggregatedStats = (clone $baseQuery)->withoutEagerLoads()
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

        return [
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
    }

    /**
     * Get board data grouped by status.
     */
    public function getBoardData($baseQuery): array
    {
        $boardData = [];
        foreach (['draft', 'sent', 'accepted', 'rejected'] as $boardStatus) {
            $boardStatusQuery = (clone $baseQuery)->where('status', $boardStatus);
            if ($boardStatus === 'accepted') {
                $boardStatusQuery->whereNull('converted_to_invoice');
            }
            $boardData[$boardStatus] = $boardStatusQuery->orderBy('created_at', 'desc')->limit(8)->get();
        }
        return $boardData;
    }

    /**
     * Get formatted warehouse products list with stock and tax information.
     */
    public function getFormattedWarehouseProducts(?int $warehouseId = null)
    {
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

        $allTaxes = ProductServiceTax::select('id', 'tax_name', 'rate')
            ->where('created_by', creatorId())
            ->orWhere('creator_id', creatorId())
            ->get()
            ->keyBy('id');

        return $productsQuery->get()->map(function ($product) use ($allTaxes) {
            $stockQuantity = $product->relationLoaded('warehouseStocks') && $product->warehouseStocks->isNotEmpty()
                ? $product->warehouseStocks->first()->quantity
                : 0;

            $unitName = $product->unitRelation?->unit_name ?? (is_numeric($product->unit) ? '' : ($product->unit ?? ''));

            $taxIds = $product->tax_ids;
            if (is_string($taxIds)) {
                $taxIds = json_decode($taxIds, true);
            }
            $productTaxes = [];
            if (is_array($taxIds) && !empty($taxIds)) {
                foreach ($taxIds as $tId) {
                    if (isset($allTaxes[$tId])) {
                        $productTaxes[] = [
                            'id' => $allTaxes[$tId]->id,
                            'tax_name' => $allTaxes[$tId]->tax_name,
                            'rate' => $allTaxes[$tId]->rate,
                        ];
                    }
                }
            }

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
                'taxes' => $productTaxes,
            ];
        });
    }

    /**
     * Determine if items array contains monthly recurring charge items.
     */
    public function hasRecurringBillingItems(?array $items): bool
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
    public function calculateProposalTotals(?array $items, bool $isTaxEnabled = true): array
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
     * Create or update proposal record with items and contents.
     */
    public function createProposal(Request $request): SalesProposal
    {
        return DB::transaction(function () use ($request) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
            $totals = $this->calculateProposalTotals($request->items, $isTaxEnabled);

            $hasRecurring = $this->hasRecurringBillingItems($request->items);
            $isRecurring = $hasRecurring ? 1 : 0;
            $isPrepaid = ($hasRecurring && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $proposal = new SalesProposal();
            $proposal->proposal_number = SalesProposal::generateProposalNumber($request->invoice_date ?? $request->proposal_date);
            $proposal->reference = $request->reference;
            $proposal->subject = $request->subject;
            $proposal->proposal_date = $request->invoice_date ?? $request->proposal_date;
            $proposal->due_date = $request->due_date ?? $proposal->proposal_date;
            $proposal->status = 'draft';

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
    }

    /**
     * Update existing proposal record with items and contents.
     */
    public function updateProposal(SalesProposal $salesProposal, Request $request): SalesProposal
    {
        return DB::transaction(function () use ($salesProposal, $request) {
            $isTaxEnabled = filter_var($request->input('is_tax_enabled', true), FILTER_VALIDATE_BOOLEAN);
            $totals = $this->calculateProposalTotals($request->items, $isTaxEnabled);

            $hasRecurring = $this->hasRecurringBillingItems($request->items);
            $isRecurring = $hasRecurring ? 1 : 0;
            $isPrepaid = ($hasRecurring && filter_var($request->input('is_prepaid', false), FILTER_VALIDATE_BOOLEAN)) ? 1 : 0;

            $salesProposal->subject = $request->subject;
            $salesProposal->reference = $request->reference;
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

            return $salesProposal;
        });
    }

    /**
     * Convert proposal into quotation.
     */
    public function convertProposalToQuotation(SalesProposal $salesProposal): SalesQuotation
    {
        return DB::transaction(function () use ($salesProposal) {
            $isNewCustomer = empty($salesProposal->customer_id) && (!empty($salesProposal->customer_name) || !empty($salesProposal->customer_email));
            $customerType = $isNewCustomer ? 'new' : 'existing';

            $quotation = new SalesQuotation();
            $quotation->parent_quotation_id = $salesProposal->id;
            $quotation->customer_type = $customerType;
            $quotation->customer_id = $salesProposal->customer_id;
            $quotation->customer_name = $salesProposal->customer_name;
            $quotation->customer_email = $salesProposal->customer_email;
            $quotation->customer_phone = $salesProposal->customer_phone;
            $quotation->customer_address = $salesProposal->customer_address;
            $quotation->warehouse_id = $salesProposal->warehouse_id;
            $quotation->quotation_date = now()->format('Y-m-d');
            $quotation->due_date = $salesProposal->due_date ? $salesProposal->due_date->format('Y-m-d') : null;
            $quotation->is_recurring = (bool) ($salesProposal->is_recurring ?? false);
            $quotation->is_prepaid = (bool) ($salesProposal->is_prepaid ?? false);
            $quotation->is_tax_enabled = (bool) ($salesProposal->is_tax_enabled ?? true);
            $quotation->payment_terms = $salesProposal->payment_terms;
            $quotation->notes = $salesProposal->notes;
            $quotation->subtotal = $salesProposal->subtotal ?? 0;
            $quotation->tax_amount = $salesProposal->tax_amount ?? 0;
            $quotation->discount_amount = $salesProposal->discount_amount ?? 0;
            $quotation->total_amount = $salesProposal->total_amount ?? 0;
            $quotation->status = 'draft';
            $quotation->creator_id = creatorId();
            $quotation->created_by = Auth::id();
            $quotation->save();

            // Save items exactly from proposal items (including OTC/MRC sections and item taxes)
            foreach ($salesProposal->items as $proposalItem) {
                $quotationItem = new SalesQuotationItem();
                $quotationItem->quotation_id = $quotation->id;
                $quotationItem->product_id = $proposalItem->product_id;
                $quotationItem->section = $proposalItem->section ?? 'general';
                $quotationItem->item_type = $proposalItem->product_type ?? 'product';
                $quotationItem->description = $proposalItem->description;
                $quotationItem->quantity = $proposalItem->quantity ?? 1;
                $quotationItem->unit_price = $proposalItem->unit_price ?? 0;
                $quotationItem->discount_percentage = $proposalItem->discount_percentage ?? 0;
                $quotationItem->discount_amount = $proposalItem->discount_amount ?? 0;
                $quotationItem->tax_percentage = $proposalItem->tax_percentage ?? 0;
                $quotationItem->tax_amount = $proposalItem->tax_amount ?? 0;
                $quotationItem->total_amount = $proposalItem->total_amount ?? 0;
                $quotationItem->save();

                foreach ($proposalItem->taxes as $tax) {
                    $quotationTax = new SalesQuotationItemTax();
                    $quotationTax->item_id = $quotationItem->id;
                    $quotationTax->tax_name = $tax->tax_name;
                    $quotationTax->tax_rate = $tax->tax_rate;
                    $quotationTax->save();
                }
            }

            // If default pages exist for quotation with background image, save quotation default pages
            $defaultPages = $this->quotationService->getActiveDefaultPages(Auth::id());
            if ($defaultPages && $defaultPages->count() > 0) {
                $contentsPayload = $defaultPages->map(function ($page, $index) {
                    return [
                        'title' => $page->title,
                        'content' => $page->content ?? '',
                        'page_type' => $page->page_type ?? 'content',
                        'background_image' => $page->background_image ?? '',
                        'order' => $page->sort_order ?? $index + 1,
                    ];
                })->toArray();
                $this->quotationService->saveQuotationPageContents($quotation->id, $contentsPayload);
            }

            $salesProposal->update([
                'converted_to_quotation' => true,
                'quotation_id' => $quotation->id,
            ]);

            return $quotation;
        });
    }

    /**
     * Save items and item taxes for a proposal.
     */
    public function saveProposalItems(int $proposalId, ?array $items, bool $isTaxEnabled = true): void
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
    public function saveProposalPageContents(int $proposalId, $proposalContentPayload): void
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

        $index = 1;
        foreach ($contentItems as $item) {
            if (is_array($item)) {
                $pageType = $item['page_type'] ?? 'content';
                $order = isset($item['order']) ? (int) $item['order'] : $index;
                $title = $item['title'] ?? null;
                $htmlContent = $item['content'] ?? null;
                $backgroundImage = $item['background_image'] ?? null;
                $serialized = json_encode($item);
            } else {
                $order = $index;
                $title = null;
                $htmlContent = (string) $item;
                $pageType = 'content';
                $backgroundImage = null;
                $serialized = (string) $item;
            }

            SalesProposalContent::create([
                'proposal_id' => $proposalId,
                'title' => $title,
                'content' => null,
                'page_type' => $pageType,
                'background_image' => $backgroundImage,
                'proposal_content' => $htmlContent ?? $serialized,
                'order' => $order,
            ]);
            $index++;
        }
    }
}
