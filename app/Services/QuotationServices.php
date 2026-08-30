<?php

namespace App\Services;

use Automas\Quotation\Models\QuotationDefaultPage;
use Automas\Quotation\Models\QuotationSetting;
use Automas\Quotation\Models\SalesQuotation;
use Automas\Quotation\Models\SalesQuotationItem;
use Automas\Quotation\Models\SalesQuotationItemTax;
use Automas\Quotation\Models\SalesQuotationContent;
use App\Models\User;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\SalesInvoiceItemTax;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class QuotationServices
{
    /**
     * Get default relations needed for quotation loading
     */
    public function getQuotationRelations(): array
    {
        $relations = ['customer', 'items.product.unitRelation', 'items.taxes', 'warehouse'];

        if (Schema::hasTable('sales_quotation_contents')) {
            $relations[] = 'contents';
        }

        return $relations;
    }

    /**
     * Get active default page templates for proposal
     */
    public function getActiveDefaultPages(int $authorId)
    {
        return QuotationDefaultPage::where('created_by', creatorId())
            ->where(function ($query) use ($authorId) {
                $query->where('creator_id', $authorId)
                    ->orWhere('creator_id', creatorId());
            })
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'background_image', 'sort_order', 'creator_id', 'created_by']);
    }

    /**
     * Get quotation settings
     */
    public function getQuotationSetting()
    {
        return QuotationSetting::getSettings(creatorId());
    }

    /**
     * Get aggregated quotation statistics in a single optimized query
     */
    public function getQuotationStatistics($quotation): array
    {
        $stats = (clone $quotation)->withoutEagerLoads()
            ->selectRaw('
                COUNT(*) as total_count,
                SUM(total_amount) as total_value,
                SUM(CASE WHEN due_date < ? AND status NOT IN ("accepted", "rejected") THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status = "accepted" AND converted_to_invoice = 0 THEN 1 ELSE 0 END) as accepted_active_count,
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
            'total_count' => (int) ($stats->total_count ?? 0),
            'total_value' => (float) ($stats->total_value ?? 0),
            'overdue_count' => (int) ($stats->overdue_count ?? 0),
            'accepted_active_count' => (int) ($stats->accepted_active_count ?? 0),
            'draft_count' => (int) ($stats->draft_count ?? 0),
            'draft_value' => (float) ($stats->draft_value ?? 0),
            'sent_count' => (int) ($stats->sent_count ?? 0),
            'sent_value' => (float) ($stats->sent_value ?? 0),
            'accepted_count' => (int) ($stats->accepted_count ?? 0),
            'accepted_value' => (float) ($stats->accepted_value ?? 0),
            'rejected_count' => (int) ($stats->rejected_count ?? 0),
            'rejected_value' => (float) ($stats->rejected_value ?? 0),
        ];
    }

    /**
     * Calculate line item amounts and grand totals
     */
    public function calculateQuotationTotals(?array $items, bool $isTaxEnabled = true): array
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
                $taxPercentage = $this->calculateEffectiveTaxRate($item, $isTaxEnabled);

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
     * Create a new sales quotation with items and contents
     */
    public function createQuotation(array $data): SalesQuotation
    {
        return DB::transaction(function () use ($data) {
            $isTaxEnabled = filter_var($data['is_tax_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $items = $data['items'] ?? [];
            $totals = $this->calculateQuotationTotals($items, $isTaxEnabled);

            $quotation = new SalesQuotation();
            $quotationDate = $data['quotation_date'] ?? $data['invoice_date'] ?? now();
            $quotation->quotation_number = SalesQuotation::generateQuotationNumber($quotationDate);
            $quotation->creator_id = Auth::id();
            $quotation->created_by = creatorId();
            $quotation->status = 'draft';

            $this->hydrateQuotationData($quotation, $data, $totals, $isTaxEnabled);
            $quotation->save();

            $this->saveQuotationItems($quotation->id, $items, $isTaxEnabled);
            $this->saveQuotationPageContents($quotation->id, $data['contents'] ?? $data['quotation_content'] ?? $data['proposal_content'] ?? []);

            return $quotation;
        });
    }

    /**
     * Update an existing sales quotation
     */
    public function updateQuotation(SalesQuotation $quotation, array $data): SalesQuotation
    {
        return DB::transaction(function () use ($quotation, $data) {
            $isTaxEnabled = filter_var($data['is_tax_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $items = $data['items'] ?? [];
            $totals = $this->calculateQuotationTotals($items, $isTaxEnabled);

            $this->hydrateQuotationData($quotation, $data, $totals, $isTaxEnabled);
            $quotation->save();

            $quotation->items()->delete();
            $this->saveQuotationItems($quotation->id, $items, $isTaxEnabled);
            $this->saveQuotationPageContents($quotation->id, $data['contents'] ?? $data['quotation_content'] ?? $data['proposal_content'] ?? []);

            return $quotation;
        });
    }

    /**
     * Convert sales quotation to a draft sales invoice
     */
    public function convertToInvoice(SalesQuotation $quotation): SalesInvoice
    {
        return DB::transaction(function () use ($quotation) {
            $invoiceData = [
                'customer_id' => $quotation->customer_id,
                'warehouse_id' => $quotation->warehouse_id ?? 1,
                'type' => 'product',
                'invoice_date' => now(),
                'due_date' => $quotation->due_date,
                'subtotal' => $quotation->subtotal,
                'tax_amount' => $quotation->tax_amount,
                'discount_amount' => $quotation->discount_amount,
                'total_amount' => $quotation->total_amount,
                'balance_amount' => $quotation->total_amount,
                'paid_amount' => 0,
                'payment_terms' => $quotation->payment_terms,
                'notes' => $quotation->notes,
                'status' => 'draft',
                'creator_id' => Auth::id(),
                'created_by' => creatorId(),
            ];

            $invoice = SalesInvoice::create($invoiceData);

            foreach ($quotation->items as $quotationItem) {
                $invoiceItemData = [
                    'invoice_id' => $invoice->id,
                    'product_id' => $quotationItem->product_id,
                    'quantity' => $quotationItem->quantity,
                    'unit_price' => $quotationItem->unit_price,
                    'discount_percentage' => $quotationItem->discount_percentage,
                    'tax_percentage' => $quotationItem->tax_percentage,
                ];

                $invoiceItem = SalesInvoiceItem::create($invoiceItemData);

                foreach ($quotationItem->taxes as $tax) {
                    SalesInvoiceItemTax::create([
                        'item_id' => $invoiceItem->id,
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->tax_rate,
                    ]);
                }
            }

            $quotation->update([
                'converted_to_invoice' => true,
                'invoice_id' => $invoice->id,
            ]);

            return $invoice;
        });
    }

    /**
     * Save line items and item taxes
     */
    public function saveQuotationItems(int $quotationId, ?array $items, bool $isTaxEnabled = true): void
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
            $taxPercentage = $this->calculateEffectiveTaxRate($itemData, $isTaxEnabled);

            $itemPayload = [
                'quotation_id' => $quotationId,
                'product_id' => $itemData['product_id'],
                'section' => $itemData['section'] ?? 'otc',
                'product_type' => $itemData['product_type'] ?? 'product',
                'description' => $itemData['description'] ?? $itemData['product_description'] ?? null,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount_percentage' => $discountPercentage,
                'tax_percentage' => $taxPercentage,
            ];

            $quotationItem = SalesQuotationItem::create($itemPayload);

            if ($isTaxEnabled && !empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $taxData) {
                    SalesQuotationItemTax::create([
                        'item_id' => $quotationItem->id,
                        'tax_name' => $taxData['tax_name'] ?? 'Tax',
                        'tax_rate' => (float) ($taxData['tax_rate'] ?? $taxData['rate'] ?? 0),
                    ]);
                }
            }
        }
    }

    /**
     * Save dynamic page sections & contents
     */
    public function saveQuotationPageContents(int $quotationId, $contentPayload): void
    {
        if (!Schema::hasTable('sales_quotation_contents')) {
            return;
        }

        try {
            SalesQuotationContent::where('quotation_id', $quotationId)->delete();
        } catch (\Throwable $th) {
            // Silently catch
        }

        if (empty($contentPayload)) {
            return;
        }

        $contentItems = is_string($contentPayload) ? json_decode($contentPayload, true) : $contentPayload;
        if (!is_array($contentItems)) {
            return;
        }

        $sequentialOrder = 1;
        foreach ($contentItems as $contentItem) {
            if (is_array($contentItem)) {
                $order = isset($contentItem['order']) ? (int) $contentItem['order'] : $sequentialOrder;
                $title = $contentItem['title'] ?? null;
                $htmlContent = $contentItem['content'] ?? null;
                $backgroundImage = $contentItem['background_image'] ?? null;
            } else {
                $order = $sequentialOrder;
                $title = null;
                $htmlContent = (string) $contentItem;
                $backgroundImage = null;
            }

            SalesQuotationContent::create([
                'quotation_id' => $quotationId,
                'title' => $title,
                'content' => $htmlContent,
                'background_image' => $backgroundImage,
                'sort_order' => $order,
                'creator_id' => Auth::id(),
            ]);
            $sequentialOrder++;
        }
    }

    /**
     * Hydrate quotation model with request payload, customer details, and calculated totals
     */
    private function hydrateQuotationData(SalesQuotation $quotation, array $data, array $totals, bool $isTaxEnabled): void
    {
        $quotation->subject = $data['subject'] ?? $quotation->subject ?? null;
        $quotation->quotation_date = $data['quotation_date'] ?? $data['invoice_date'] ?? $quotation->quotation_date ?? now();
        $quotation->due_date = $data['due_date'] ?? $quotation->due_date;
        $quotation->warehouse_id = $data['warehouse_id'] ?? $quotation->warehouse_id;
        $quotation->payment_terms = $data['payment_terms'] ?? $quotation->payment_terms;
        $quotation->notes = $data['notes'] ?? $quotation->notes;
        $quotation->is_prepaid = filter_var($data['is_prepaid'] ?? $quotation->is_prepaid ?? false, FILTER_VALIDATE_BOOLEAN);
        $quotation->is_tax_enabled = $isTaxEnabled;

        $this->assignCustomerData($quotation, $data);

        $quotation->subtotal = $totals['subtotal'];
        $quotation->tax_amount = $totals['tax_amount'];
        $quotation->discount_amount = $totals['discount_amount'];
        $quotation->total_amount = $totals['total_amount'];
    }

    /**
     * Calculate effective tax rate for a line item based on item taxes array or percentage
     */
    private function calculateEffectiveTaxRate(array $item, bool $isTaxEnabled): float
    {
        if (!$isTaxEnabled) {
            return 0.0;
        }

        $taxPercentage = (float) ($item['tax_percentage'] ?? 0);
        if (!empty($item['taxes']) && is_array($item['taxes'])) {
            $taxPercentage = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0.0);
        }

        return $taxPercentage;
    }

    /**
     * Helper to assign customer information
     */
    private function assignCustomerData(SalesQuotation $quotation, array $data): void
    {
        $customerType = $data['customer_type'] ?? $data['customer_mode'] ?? 'existing';
        $quotation->customer_type = $customerType;

        if ($customerType === 'new') {
            $quotation->customer_id = null;
            $quotation->customer_name = $data['customer_name'] ?? null;
            $quotation->customer_email = $data['customer_email'] ?? null;
            $quotation->customer_phone = $data['customer_phone'] ?? null;
            $quotation->customer_address = $data['customer_address'] ?? null;
        } else {
            $customerId = $data['customer_id'] ?? null;
            $quotation->customer_id = $customerId;
            $existingCustomer = $customerId ? User::find($customerId) : null;
            $quotation->customer_name = $existingCustomer?->name;
            $quotation->customer_email = $existingCustomer?->email;
            $quotation->customer_phone = $existingCustomer?->phone ?? $existingCustomer?->mobile_no;
            $quotation->customer_address = $existingCustomer?->address;
        }
    }
}
