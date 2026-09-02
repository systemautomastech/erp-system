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
    public function getQuotationRelations(): array
    {
        $relations = ['customer', 'items.product.unitRelation', 'items.taxes', 'warehouse'];

        if (Schema::hasTable('sales_quotation_contents')) {
            $relations[] = 'contents';
        }

        return $relations;
    }

    public function getActiveDefaultPages(int $authorId)
    {
        return QuotationDefaultPage::where('created_by', creatorId())
            ->where(function ($query) use ($authorId) {
                $query->where('creator_id', $authorId)
                    ->orWhere('creator_id', creatorId());
            })
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order', 'creator_id', 'created_by']);
    }

    public function getQuotationSetting()
    {
        return QuotationSetting::getSettings(creatorId());
    }

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

    public function calculateQuotationTotals(?array $items, bool $isTaxEnabled = true, array $options = []): array
    {
        $subtotal = 0.0;
        $tax = 0.0;
        $itemDiscountTotal = 0.0;

        $otcSubtotal = 0.0;
        $mrcSubtotal = 0.0;

        if (!empty($items)) {
            foreach ($items as $item) {
                if (empty($item['product_id']) || (int) $item['product_id'] <= 0) {
                    continue;
                }

                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $price = max(0, (float) ($item['unit_price'] ?? 0));
                $section = $item['section'] ?? 'otc';
                $discRate = max(0, min(100, (float) ($item['discount_percentage'] ?? 0)));
                $taxRate = $this->calculateEffectiveTaxRate($item, $isTaxEnabled);

                $lineTotal = $qty * $price;
                $discAmount = ($lineTotal * $discRate) / 100;
                $netTotal = $lineTotal - $discAmount;
                $taxAmount = ($lineTotal * $taxRate) / 100;

                $subtotal += $lineTotal;
                $itemDiscountTotal += $discAmount;
                $tax += $taxAmount;

                if ($section === 'mrc') {
                    $mrcSubtotal += $lineTotal;
                } else {
                    $otcSubtotal += $lineTotal;
                }
            }
        }

        // Section level discount calculations if provided
        $otcDiscount = 0.0;
        $otcDiscType = $options['otc_discount_type'] ?? 'percentage';
        $otcDiscVal = max(0, (float) ($options['otc_discount_value'] ?? 0));
        if ($otcDiscVal > 0) {
            $otcDiscount = $otcDiscType === 'percentage'
                ? ($otcSubtotal * min(100, $otcDiscVal)) / 100
                : min($otcSubtotal, $otcDiscVal);
        }

        $mrcDiscount = 0.0;
        $mrcDiscType = $options['mrc_discount_type'] ?? 'percentage';
        $mrcDiscVal = max(0, (float) ($options['mrc_discount_value'] ?? 0));
        if ($mrcDiscVal > 0) {
            $mrcDiscount = $mrcDiscType === 'percentage'
                ? ($mrcSubtotal * min(100, $mrcDiscVal)) / 100
                : min($mrcSubtotal, $mrcDiscVal);
        }

        $sectionDiscountTotal = $otcDiscount + $mrcDiscount;
        $finalDiscount = $sectionDiscountTotal > 0 ? $sectionDiscountTotal : $itemDiscountTotal;

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($tax, 2),
            'discount_amount' => round($finalDiscount, 2),
            'total_amount' => round(max(0, $subtotal + $tax - $finalDiscount), 2)
        ];
    }

    public function createQuotation(array $data): SalesQuotation
    {
        return DB::transaction(function () use ($data) {
            $isTaxEnabled = filter_var($data['is_tax_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $items = $data['items'] ?? [];
            $totals = $this->calculateQuotationTotals($items, $isTaxEnabled, $data);

            $quotation = new SalesQuotation();
            $date = $data['quotation_date'] ?? $data['invoice_date'] ?? now();
            $quotation->quotation_number = SalesQuotation::generateQuotationNumber($date);
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

    public function updateQuotation(SalesQuotation $quotation, array $data): SalesQuotation
    {
        return DB::transaction(function () use ($quotation, $data) {
            $isTaxEnabled = filter_var($data['is_tax_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $items = $data['items'] ?? [];
            $totals = $this->calculateQuotationTotals($items, $isTaxEnabled, $data);

            $this->hydrateQuotationData($quotation, $data, $totals, $isTaxEnabled);
            $quotation->save();

            $quotation->items()->delete();
            $this->saveQuotationItems($quotation->id, $items, $isTaxEnabled);
            $this->saveQuotationPageContents($quotation->id, $data['contents'] ?? $data['quotation_content'] ?? $data['proposal_content'] ?? []);

            return $quotation;
        });
    }

    public function convertToInvoice(SalesQuotation $quotation): SalesInvoice
    {
        return DB::transaction(function () use ($quotation) {
            $invoice = SalesInvoice::create([
                'customer_id' => $quotation->customer_id,
                'warehouse_id' => $quotation->warehouse_id ?? 1,
                'type' => 'product',
                'invoice_date' => now(),
                'due_date' => $quotation->due_date ?? now(),
                'subtotal' => $quotation->subtotal ?? 0,
                'tax_amount' => $quotation->tax_amount ?? 0,
                'discount_amount' => $quotation->discount_amount ?? 0,
                'total_amount' => $quotation->total_amount ?? 0,
                'balance_amount' => $quotation->total_amount ?? 0,
                'paid_amount' => 0,
                'payment_terms' => $quotation->payment_terms,
                'notes' => $quotation->notes,
                'status' => 'draft',
                'creator_id' => Auth::id(),
                'created_by' => creatorId(),
            ]);

            foreach ($quotation->items as $item) {
                $invoiceItem = SalesInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage,
                    'tax_percentage' => $item->tax_percentage,
                ]);

                foreach ($item->taxes as $tax) {
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

    public function saveQuotationItems(int $quotationId, ?array $items, bool $isTaxEnabled = true): void
    {
        if (empty($items)) {
            return;
        }

        foreach ($items as $item) {
            if (empty($item['product_id']) || (int) $item['product_id'] <= 0) {
                continue;
            }

            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $price = max(0, (float) ($item['unit_price'] ?? 0));
            $discRate = max(0, min(100, (float) ($item['discount_percentage'] ?? 0)));
            $taxRate = $this->calculateEffectiveTaxRate($item, $isTaxEnabled);

            $quotationItem = SalesQuotationItem::create([
                'quotation_id' => $quotationId,
                'product_id' => $item['product_id'],
                'section' => $item['section'] ?? 'otc',
                'item_type' => $item['product_type'] ?? 'product',
                'description' => $item['description'] ?? $item['product_description'] ?? null,
                'quantity' => $qty,
                'unit_price' => $price,
                'discount_percentage' => $discRate,
                'tax_percentage' => $taxRate,
            ]);

            if ($isTaxEnabled && !empty($item['taxes']) && is_array($item['taxes'])) {
                foreach ($item['taxes'] as $tax) {
                    SalesQuotationItemTax::create([
                        'item_id' => $quotationItem->id,
                        'tax_name' => $tax['tax_name'] ?? 'Tax',
                        'tax_rate' => (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0),
                    ]);
                }
            }
        }
    }

    public function saveQuotationPageContents(int $quotationId, $contents): void
    {
        if (!Schema::hasTable('sales_quotation_contents')) {
            return;
        }

        try {
            SalesQuotationContent::where('quotation_id', $quotationId)->delete();
        } catch (\Throwable $th) {
            // Silently catch
        }

        if (empty($contents)) {
            return;
        }

        $items = is_string($contents) ? json_decode($contents, true) : $contents;
        if (!is_array($items)) {
            return;
        }

        $index = 1;
        foreach ($items as $item) {
            if (is_array($item)) {
                $order = isset($item['sort_order']) ? (int) $item['sort_order'] : (isset($item['order']) ? (int) $item['order'] : $index);
                $title = $item['title'] ?? null;
                $html = $item['content'] ?? null;
                $bg = $item['background_image'] ?? null;
            } else {
                $order = $index;
                $title = null;
                $html = (string) $item;
                $bg = null;
            }

            SalesQuotationContent::create([
                'quotation_id' => $quotationId,
                'title' => $title,
                'content' => $html,
                'background_image' => $bg,
                'sort_order' => $order,
                'creator_id' => Auth::id(),
            ]);
            $index++;
        }
    }

    private function hydrateQuotationData(SalesQuotation $quotation, array $data, array $totals, bool $isTaxEnabled): void
    {
        $quotationDate = $data['quotation_date'] ?? $data['invoice_date'] ?? $quotation->quotation_date ?? now();
        $quotation->subject = $data['subject'] ?? $quotation->subject ?? null;
        $quotation->quotation_date = $quotationDate;
        $quotation->due_date = $data['due_date'] ?? $quotation->due_date ?? $quotationDate;
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

    private function calculateEffectiveTaxRate(array $item, bool $isTaxEnabled): float
    {
        if (!$isTaxEnabled) {
            return 0.0;
        }

        $taxRate = (float) ($item['tax_percentage'] ?? 0);
        if (!empty($item['taxes']) && is_array($item['taxes'])) {
            $taxRate = array_reduce($item['taxes'], fn($sum, $tax) => $sum + (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0), 0.0);
        }

        return $taxRate;
    }

    private function assignCustomerData(SalesQuotation $quotation, array $data): void
    {
        $type = $data['customer_type'] ?? $data['customer_mode'] ?? 'existing';
        $quotation->customer_type = $type;

        if ($type === 'new') {
            $quotation->customer_id = null;
            $quotation->customer_name = $data['customer_name'] ?? null;
            $quotation->customer_email = $data['customer_email'] ?? null;
            $quotation->customer_phone = $data['customer_phone'] ?? null;
            $quotation->customer_address = $data['customer_address'] ?? null;
        } else {
            $customerId = $data['customer_id'] ?? null;
            $quotation->customer_id = $customerId;
            $customer = $customerId ? User::find($customerId) : null;
            $quotation->customer_name = $customer?->name;
            $quotation->customer_email = $customer?->email;
            $quotation->customer_phone = $customer?->phone ?? $customer?->mobile_no;
            $quotation->customer_address = $customer?->address;
        }
    }
}
