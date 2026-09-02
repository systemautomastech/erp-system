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
use Automas\Quotation\Models\QuotationDefaultPage;
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

    public function getProposalRelations(): array
    {
        $relations = ['customer', 'items.product.unitRelation', 'items.taxes', 'warehouse'];

        if (Schema::hasTable('sales_proposal_contents')) {
            $relations[] = 'contents';
        }

        return $relations;
    }

    public function hasProposalAccess(SalesProposal $proposal): bool
    {
        if ($proposal->created_by != creatorId()) {
            return false;
        }

        $user = Auth::user();

        if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-sales-proposals')) {
            return true;
        }

        if ($user->can('manage-own-sales-proposals')) {
            if ($proposal->creator_id != $user->id && $proposal->customer_id != $user->id) {
                return false;
            }

            if ($proposal->creator_id != $user->id && $user->type === 'client' && $proposal->status === 'draft') {
                return false;
            }

            return true;
        }

        return false;
    }

    public function getActiveDefaultPages(int $authorId)
    {
        return ProposalDefaultPage::where('created_by', creatorId())
            ->where(function ($query) use ($authorId) {
                $query->where('creator_id', $authorId)
                    ->orWhere('creator_id', creatorId());
            })
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order', 'creator_id', 'created_by']);
    }

    public function notifyCustomerOnStatusChange(SalesProposal $proposal, string $templateName, ?string $statusLabel = null): ?array
    {
        $recipient = null;

        if ($templateName === 'Proposal Sent') {
            $recipient = $proposal->customer?->email ?: $proposal->customer_email;
        } elseif ($templateName === 'Proposal Approved') {
            $author = User::find($proposal->creator_id);
            $recipient = company_setting('company_email', $proposal->created_by) ?: $author?->email;
        }

        if (empty($recipient) || company_setting($templateName) !== 'on') {
            return null;
        }

        $data = [
            'proposal_number' => $proposal->proposal_number ?? null,
            'sales_customer_name' => $proposal->customer?->name ?: $proposal->customer_name ?: 'Customer',
            'total_amount' => $proposal->total_amount ?? null,
            'discount_amount' => $proposal->discount_amount ?? null,
        ];

        if ($statusLabel) {
            $data['status'] = $statusLabel;
        }

        return EmailTemplate::sendEmailTemplate($templateName, [$recipient], $data);
    }

    public function getProposalsQuery($user)
    {
        return SalesProposal::with(['customer', 'items'])
            ->where(function ($query) use ($user) {
                if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-sales-proposals')) {
                    $query->where('created_by', creatorId());
                } elseif ($user->can('manage-own-sales-proposals')) {
                    $query->where('created_by', creatorId())
                        ->where(function ($q) use ($user) {
                            $q->where('creator_id', $user->id)
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

    public function getAggregatedStats($baseQuery): array
    {
        $stats = (clone $baseQuery)->withoutEagerLoads()
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

    public function getBoardData($baseQuery): array
    {
        $boardData = [];
        foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
            $query = (clone $baseQuery)->where('status', $status);
            if ($status === 'accepted') {
                $query->whereNull('converted_to_invoice');
            }
            $boardData[$status] = $query->orderBy('created_at', 'desc')->limit(8)->get();
        }
        return $boardData;
    }

    public function getFormattedWarehouseProducts(?int $warehouseId = null)
    {
        $query = ProductServiceItem::with('unitRelation:id,unit_name')
            ->select('id', 'name', 'sku', 'description', 'sale_price', 'long_description', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('created_by', creatorId())
                    ->orWhere('creator_id', creatorId());
            });

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

        $allTaxes = ProductServiceTax::select('id', 'tax_name', 'rate')
            ->where('created_by', creatorId())
            ->orWhere('creator_id', creatorId())
            ->get()
            ->keyBy('id');

        return $query->get()->map(function ($product) use ($allTaxes) {
            $stock = $product->relationLoaded('warehouseStocks') && $product->warehouseStocks->isNotEmpty()
                ? $product->warehouseStocks->first()->quantity
                : 0;

            $unit = $product->unitRelation?->unit_name ?? (is_numeric($product->unit) ? '' : ($product->unit ?? ''));

            $taxIds = $product->tax_ids;
            if (is_string($taxIds)) {
                $taxIds = json_decode($taxIds, true);
            }
            $taxes = [];
            if (is_array($taxIds) && !empty($taxIds)) {
                foreach ($taxIds as $id) {
                    if (isset($allTaxes[$id])) {
                        $taxes[] = [
                            'id' => $allTaxes[$id]->id,
                            'tax_name' => $allTaxes[$id]->tax_name,
                            'rate' => $allTaxes[$id]->rate,
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
                'unit_name' => $unit,
                'type' => $product->type,
                'stock_quantity' => $stock,
                'taxes' => $taxes,
            ];
        });
    }

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

    public function calculateProposalTotals(?array $items, bool $isTaxEnabled = true): array
    {
        $subtotal = 0.0;
        $tax = 0.0;
        $discount = 0.0;

        if (!empty($items)) {
            foreach ($items as $item) {
                if (empty($item['product_id']) || (int) $item['product_id'] <= 0) {
                    continue;
                }

                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $price = max(0, (float) ($item['unit_price'] ?? 0));
                $discRate = max(0, min(100, (float) ($item['discount_percentage'] ?? 0)));

                $taxRate = 0.0;
                if ($isTaxEnabled) {
                    $taxRate = (float) ($item['tax_percentage'] ?? 0);
                    if (!empty($item['taxes']) && is_array($item['taxes'])) {
                        $taxRate = array_reduce($item['taxes'], fn($sum, $t) => $sum + (float) ($t['tax_rate'] ?? $t['rate'] ?? 0), 0.0);
                    }
                }

                $lineTotal = $qty * $price;
                $discAmount = ($lineTotal * $discRate) / 100;
                $netTotal = $lineTotal - $discAmount;
                $taxAmount = ($netTotal * $taxRate) / 100;

                $subtotal += $lineTotal;
                $discount += $discAmount;
                $tax += $taxAmount;
            }
        }

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($tax, 2),
            'discount_amount' => round($discount, 2),
            'total_amount' => round($subtotal + $tax - $discount, 2)
        ];
    }

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

            $mode = $request->input('customer_mode', 'existing');
            if ($mode === 'new') {
                $proposal->customer_id = null;
                $proposal->customer_name = $request->customer_name;
                $proposal->customer_email = $request->customer_email;
                $proposal->customer_phone = $request->customer_phone;
                $proposal->customer_address = $request->customer_address;
            } else {
                $proposal->customer_id = $request->customer_id;
                $customer = $request->customer_id ? User::find($request->customer_id) : null;
                $proposal->customer_name = $customer?->name;
                $proposal->customer_email = $customer?->email;
                $proposal->customer_phone = $customer?->phone ?? $customer?->mobile_no;
                $proposal->customer_address = $customer?->address;
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
            $proposal->creator_id = Auth::id();
            $proposal->created_by = creatorId();
            $proposal->save();

            $this->saveProposalItems($proposal->id, $request->items, $isTaxEnabled);
            $this->saveProposalPageContents($proposal->id, $request->proposal_content);

            return $proposal;
        });
    }

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

            $mode = $request->input('customer_mode', 'existing');
            if ($mode === 'new') {
                $salesProposal->customer_id = null;
                $salesProposal->customer_name = $request->customer_name;
                $salesProposal->customer_email = $request->customer_email;
                $salesProposal->customer_phone = $request->customer_phone;
                $salesProposal->customer_address = $request->customer_address;
            } else {
                $salesProposal->customer_id = $request->customer_id;
                $customer = $request->customer_id ? User::find($request->customer_id) : null;
                $salesProposal->customer_name = $customer?->name;
                $salesProposal->customer_email = $customer?->email;
                $salesProposal->customer_phone = $customer?->phone ?? $customer?->mobile_no;
                $salesProposal->customer_address = $customer?->address;
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

    public function convertProposalToQuotation(SalesProposal $salesProposal): SalesQuotation
    {
        return DB::transaction(function () use ($salesProposal) {
            $isNew = empty($salesProposal->customer_id) && (!empty($salesProposal->customer_name) || !empty($salesProposal->customer_email));
            $customerType = $isNew ? 'new' : 'existing';

            $quotation = new SalesQuotation();
            $quotation->parent_quotation_id = $salesProposal->id;
            $quotation->subject = $salesProposal->subject;
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
            $quotation->creator_id = Auth::id();
            $quotation->created_by = creatorId();
            $quotation->save();

            foreach ($salesProposal->items as $item) {
                $quotationItem = new SalesQuotationItem();
                $quotationItem->quotation_id = $quotation->id;
                $quotationItem->product_id = $item->product_id;
                $quotationItem->section = $item->section ?? 'general';
                $quotationItem->item_type = $item->product_type ?? 'product';
                $quotationItem->description = $item->description;
                $quotationItem->quantity = $item->quantity ?? 1;
                $quotationItem->unit_price = $item->unit_price ?? 0;
                $quotationItem->discount_percentage = $item->discount_percentage ?? 0;
                $quotationItem->discount_amount = $item->discount_amount ?? 0;
                $quotationItem->tax_percentage = $item->tax_percentage ?? 0;
                $quotationItem->tax_amount = $item->tax_amount ?? 0;
                $quotationItem->total_amount = $item->total_amount ?? 0;
                $quotationItem->save();

                foreach ($item->taxes as $tax) {
                    $quotationTax = new SalesQuotationItemTax();
                    $quotationTax->item_id = $quotationItem->id;
                    $quotationTax->tax_name = $tax->tax_name;
                    $quotationTax->tax_rate = $tax->tax_rate;
                    $quotationTax->save();
                }
            }

            $hasOtc = $salesProposal->items->contains(function ($i) {
                return ($i->section === 'otc' || $i->section === 'general' || empty($i->section)) &&
                    ((int) $i->product_id > 0 || (float) $i->unit_price > 0 || !empty($i->description));
            });

            $hasMrc = $salesProposal->items->contains(function ($i) {
                return $i->section === 'mrc' &&
                    ((int) $i->product_id > 0 || (float) $i->unit_price > 0 || !empty($i->description));
            });

            $targetCreatorId = $quotation->created_by ?: ($salesProposal->created_by ?: creatorId());
            $targetAuthorId = $quotation->creator_id ?: ($salesProposal->creator_id ?: Auth::id());

            $defaultPages = QuotationDefaultPage::where('created_by', $targetCreatorId)
                ->where(function ($query) use ($targetAuthorId, $targetCreatorId) {
                    $query->where('creator_id', $targetAuthorId)
                        ->orWhere('creator_id', $targetCreatorId);
                })
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();
            $pages = [];

            if ($defaultPages && $defaultPages->count() > 0) {
                foreach ($defaultPages as $page) {
                    $pageType = $page->page_type ?? 'general';

                    if ($pageType === 'otc' && !$hasOtc) {
                        continue;
                    }

                    if ($pageType === 'mrc' && !$hasMrc) {
                        continue;
                    }

                    $content = $page->content;
                    if ($pageType === 'otc' && (empty($content) || trim($content) === '')) {
                        $content = '[OTC_CHARGES_TABLE]';
                    } elseif ($pageType === 'mrc' && (empty($content) || trim($content) === '')) {
                        $content = '[MRC_CHARGES_TABLE]';
                    }

                    $pages[] = [
                        'title' => $page->title,
                        'content' => $content,
                        'page_type' => $pageType,
                        'background_image' => $page->background_image ?? '',
                        'sort_order' => $page->sort_order ?? (count($pages) + 1),
                    ];
                }
            } else {
                $orderIndex = 1;
                if ($hasOtc) {
                    $pages[] = [
                        'title' => 'One-Time Charges (OTC)',
                        'content' => '[OTC_CHARGES_TABLE]',
                        'page_type' => 'otc',
                        'background_image' => '',
                        'order' => $orderIndex++,
                    ];
                }
                if ($hasMrc) {
                    $pages[] = [
                        'title' => 'Monthly Recurring Charges (MRC)',
                        'content' => '[MRC_CHARGES_TABLE]',
                        'page_type' => 'mrc',
                        'background_image' => '',
                        'order' => $orderIndex++,
                    ];
                }
            }

            if (!empty($pages)) {
                $this->quotationService->saveQuotationPageContents($quotation->id, $pages);
            }

            $salesProposal->update([
                'converted_to_quotation' => true,
                'quotation_id' => $quotation->id,
            ]);

            return $quotation;
        });
    }

    public function saveProposalItems(int $proposalId, ?array $items, bool $isTaxEnabled = true): void
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

            $taxRate = 0.0;
            if ($isTaxEnabled) {
                $taxRate = (float) ($item['tax_percentage'] ?? 0);
                if (!empty($item['taxes']) && is_array($item['taxes'])) {
                    $taxRate = array_reduce($item['taxes'], fn($sum, $t) => $sum + (float) ($t['tax_rate'] ?? $t['rate'] ?? 0), 0.0);
                }
            }

            $proposalItem = new SalesProposalItem();
            $proposalItem->proposal_id = $proposalId;
            $proposalItem->product_id = $item['product_id'];
            $proposalItem->section = $item['section'] ?? 'otc';
            $proposalItem->product_type = $item['product_type'] ?? 'product';
            $proposalItem->description = $item['description'] ?? $item['product_description'] ?? null;
            $proposalItem->quantity = $qty;
            $proposalItem->unit_price = $price;
            $proposalItem->discount_percentage = $discRate;
            $proposalItem->tax_percentage = $taxRate;
            $proposalItem->save();

            if ($isTaxEnabled && !empty($item['taxes']) && is_array($item['taxes'])) {
                foreach ($item['taxes'] as $tax) {
                    $itemTax = new SalesProposalItemTax();
                    $itemTax->item_id = $proposalItem->id;
                    $itemTax->tax_name = $tax['tax_name'] ?? 'Tax';
                    $itemTax->tax_rate = (float) ($tax['tax_rate'] ?? $tax['rate'] ?? 0);
                    $itemTax->save();
                }
            }
        }
    }

    public function saveProposalPageContents(int $proposalId, $contents): void
    {
        if (!Schema::hasTable('sales_proposal_contents')) {
            return;
        }

        try {
            if (Schema::hasColumn('sales_proposal_contents', 'proposal_id')) {
                SalesProposalContent::where('proposal_id', $proposalId)->delete();
            }
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
                $pageType = $item['page_type'] ?? 'content';
                $order = isset($item['order']) ? (int) $item['order'] : $index;
                $title = $item['title'] ?? null;
                $html = $item['content'] ?? null;
                $bg = $item['background_image'] ?? null;
                $serialized = json_encode($item);
            } else {
                $order = $index;
                $title = null;
                $html = (string) $item;
                $pageType = 'content';
                $bg = null;
                $serialized = (string) $item;
            }

            SalesProposalContent::create([
                'proposal_id' => $proposalId,
                'title' => $title,
                'content' => null,
                'page_type' => $pageType,
                'background_image' => $bg,
                'proposal_content' => $html ?? $serialized,
                'order' => $order,
            ]);
            $index++;
        }
    }
}
