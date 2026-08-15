<?php

namespace App\Http\Controllers;

use App\Events\AcceptSalesProposal;
use App\Events\ConvertSalesProposal;
use App\Events\CreateSalesProposal;
use App\Events\DestroySalesProposal;
use App\Events\RejectSalesProposal;
use App\Events\SentSalesProposal;
use App\Events\UpdateSalesProposal;
use App\Models\ProposalDefaultPage;
use App\Models\ProposalSetting;
use App\Models\SalesProposal;
use App\Models\SalesProposalContent;
use App\Models\SalesProposalItem;
use App\Models\SalesProposalItemTax;
use App\Models\SalesProposalTariff;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\SalesInvoiceItemTax;
use App\Models\User;
use App\Models\Warehouse;
use App\Http\Requests\StoreSalesProposalRequest;
use App\Http\Requests\UpdateSalesProposalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Automas\ProductService\Models\ProductServiceItem;
use App\Models\EmailTemplate;
use Spatie\LaravelPdf\Facades\Pdf;

class SalesProposalController extends Controller
{
    private function checkProposalAccess(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('manage-any-sales-proposals')) {
            return true;
        } elseif (Auth::user()->can('manage-own-sales-proposals')) {
            if ($salesProposal->creator_id != Auth::id() && $salesProposal->customer_id != Auth::id()) {
                return false;
            }
            if ($salesProposal->creator_id != Auth::id() && Auth::user()->type == 'client' && $salesProposal->status == 'draft') {
                return false;
            }
            return true;
        }
        return false;
    }
    public function index(Request $request)
    {
        if (Auth::user()->can('manage-sales-proposals')) {
            $baseQuery = SalesProposal::with(['customer', 'items'])
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-proposals')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-proposals')) {
                        $q->where('creator_id', Auth::id())->orWhere('customer_id', Auth::id());
                        if (Auth::user()->type == 'client') {
                            $q->where('status', '!=', 'draft');
                        }
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                });
            // Filters that apply to both the list and the status/value breakdown
            if ($request->customer_id) {
                $baseQuery->where('customer_id', $request->customer_id);
            }
            if ($request->search) {
                $baseQuery->where(function ($q) use ($request) {
                    $q->where('proposal_number', 'like', '%' . $request->search . '%')
                        ->orWhere('reference', 'like', '%' . $request->search . '%')
                        ->orWhere('subject', 'like', '%' . $request->search . '%');
                });
            }
            if ($request->date_range) {
                $dates = explode(' - ', $request->date_range);
                if (count($dates) === 2) {
                    $baseQuery->whereBetween('proposal_date', [$dates[0], $dates[1]]);
                }
            }

            // Breakdown by status (ignores the status filter itself so the cards stay usable as quick filters)
            $statusBreakdown = (clone $baseQuery)
                ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            $stats = [
                'total_count' => (clone $baseQuery)->count(),
                'total_value' => (clone $baseQuery)->sum('total_amount'),
                'overdue_count' => (clone $baseQuery)->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected'])->count(),
            ];
            foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
                $stats["{$status}_count"] = (int) ($statusBreakdown[$status]->count ?? 0);
                $stats["{$status}_value"] = $statusBreakdown[$status]->total ?? 0;
            }
            // Accepted proposals already converted to an invoice are a closed loop, not pending work,
            // so the board column tracks only the ones still awaiting conversion.
            $stats['accepted_active_count'] = (clone $baseQuery)->where('status', 'accepted')->whereNull('converted_to_invoice')->count();

            $query = clone $baseQuery;
            if ($request->status) {
                if ($request->status === 'expired') {
                    $query->where('due_date', '<', now())
                        ->whereNotIn('status', ['accepted', 'rejected']);
                } else {
                    $query->where('status', $request->status);
                }
            }

            $sortField = $request->get('sort', 'created_at');
            $sortDirection = $request->get('direction', 'desc');
            $allowedSortFields = ['proposal_number', 'reference', 'subject', 'proposal_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
            if (!in_array($sortField, $allowedSortFields)) {
                $sortField = 'created_at';
            }

            $query->orderBy($sortField, $sortDirection);

            $perPage = $request->get('per_page', 10);
            $proposals = $query->paginate($perPage);
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();

            // Board view shows a bounded "recent" sample per status, independent of list pagination,
            // since slicing one paginated page across 4 status columns breaks down as data grows.
            $boardData = null;
            if ($request->get('view', 'board') !== 'list') {
                $boardData = [];
                foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
                    $columnQuery = (clone $baseQuery)->where('status', $status);
                    if ($status === 'accepted') {
                        $columnQuery->whereNull('converted_to_invoice');
                    }
                    $boardData[$status] = $columnQuery
                        ->orderBy('created_at', 'desc')
                        ->limit(8)
                        ->get();
                }
            }

            return Inertia::render('SalesProposals/Index', [
                'proposals' => $proposals,
                'customers' => $customers,
                'stats' => $stats,
                'boardData' => $boardData,
                'filters' => $request->only(['customer_id', 'status', 'search', 'date_range'])
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function create()
    {
        if (Auth::user()->can('create-sales-proposals')) {
            $customers = User::where('type', 'client')->where('created_by', creatorId())->get();
            $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('created_by', creatorId())->get();
            $defaultPages = ProposalDefaultPage::whereIn('creator_id', array_unique([Auth::id(), creatorId()]))
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
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesProposalRequest $request)
    {
        if (Auth::user()->can('create-sales-proposals')) {
            try {
                $proposal = DB::transaction(function () use ($request) {
                    $totals = $this->calculateTotals($request->items);

                    $proposal = new SalesProposal();
                    $proposal->proposal_number = SalesProposal::generateProposalNumber($request->invoice_date ?? $request->proposal_date);
                    $proposal->reference = $request->reference;
                    $proposal->subject = $request->subject;
                    $proposal->proposal_date = $request->invoice_date ?? $request->proposal_date;
                    $proposal->due_date = $request->due_date;
                    $proposal->customer_id = $request->customer_id;
                    $proposal->warehouse_id = $request->type === 'product' ? $request->warehouse_id : null;
                    $proposal->type = $request->type ?? 'product';
                    $proposal->payment_terms = $request->payment_terms;
                    $proposal->notes = $request->notes;
                    $proposal->subtotal = $totals['subtotal'];
                    $proposal->tax_amount = $totals['tax_amount'];
                    $proposal->discount_amount = $totals['discount_amount'];
                    $proposal->total_amount = $totals['total_amount'];
                    $proposal->creator_id = Auth::id();
                    $proposal->created_by = creatorId();
                    $proposal->save();

                    $this->createProposalItems($proposal->id, $request->items);
                    $this->saveProposalTariffs($proposal->id, $request->tariffs);
                    $this->saveProposalContents($proposal->id, $request->proposal_content);

                    return $proposal;
                });

                try {
                    CreateSalesProposal::dispatch($request, $proposal);
                } catch (\Throwable $th) {}

                return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been created successfully.'));
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        } else {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }
    }

    public function show(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('view-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if (!$this->checkProposalAccess($salesProposal)) {
                return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
            }

            $relations = ['customer', 'items.product', 'items.taxes', 'warehouse'];
            if (Schema::hasTable('sales_proposal_tariffs')) {
                $relations[] = 'tariffs';
            }
            if (Schema::hasTable('sales_proposal_contents')) {
                $relations[] = 'contents';
            }
            $salesProposal->load($relations);

            return Inertia::render('SalesProposals/View', [
                'proposal' => $salesProposal
            ]);
        } else {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }
    }

    public function edit(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('edit-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if (!$this->checkProposalAccess($salesProposal)) {
                return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
            }

            if ($salesProposal->converted_to_invoice) {
                return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
            }

            $editRelations = ['items.taxes'];
            if (Schema::hasTable('sales_proposal_tariffs')) {
                $editRelations[] = 'tariffs';
            }
            if (Schema::hasTable('sales_proposal_contents')) {
                $editRelations[] = 'contents';
            }
            $salesProposal->load($editRelations);
            $customers = User::where('type', 'client')->where('created_by', creatorId())->get();
            $warehouses = Warehouse::where('is_active', true)->select('id', 'name', 'address')->where('created_by', creatorId())->get();

            $proposalSetting = ProposalSetting::getSettings(creatorId());

            $defaultPages = ProposalDefaultPage::whereIn('creator_id', array_unique([Auth::id(), creatorId()]))
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
        } else {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesProposalRequest $request, SalesProposal $salesProposal)
    {
        if (Auth::user()->can('edit-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if ($salesProposal->converted_to_invoice) {
                return redirect()->route('sales-proposals.index')->with('error', __('Cannot update converted proposal.'));
            }

            try {
                DB::transaction(function () use ($request, $salesProposal) {
                    $totals = $this->calculateTotals($request->items);

                    $salesProposal->proposal_date = $request->invoice_date;
                    $salesProposal->due_date = $request->due_date;
                    $salesProposal->customer_id = $request->customer_id;
                    $salesProposal->warehouse_id = $salesProposal->type === 'product' ? $request->warehouse_id : null;
                    $salesProposal->payment_terms = $request->payment_terms;
                    $salesProposal->notes = $request->notes;
                    $salesProposal->subtotal = $totals['subtotal'];
                    $salesProposal->tax_amount = $totals['tax_amount'];
                    $salesProposal->discount_amount = $totals['discount_amount'];
                    $salesProposal->total_amount = $totals['total_amount'];
                    $salesProposal->save();

                    $salesProposal->items()->delete();
                    $this->createProposalItems($salesProposal->id, $request->items);
                    $this->saveProposalTariffs($salesProposal->id, $request->tariffs);
                    $this->saveProposalContents($salesProposal->id, $request->proposal_content);
                });

                // Dispatch event for packages to handle their fields
                try {
                    UpdateSalesProposal::dispatch($request, $salesProposal);
                } catch (\Throwable $th) {}

                return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal details are updated successfully.'));
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        } else {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('delete-sales-proposals')) {
            if ($salesProposal->converted_to_invoice) {
                return back()->withErrors(['error' => __('Cannot delete converted proposal.')]);
            }

            // Dispatch event before deletion
            DestroySalesProposal::dispatch($salesProposal);

            $salesProposal->delete();

            return redirect()->route('sales-proposals.index')->with('success', __('The sales proposal has been deleted.'));
        } else {
            return redirect()->route('sales-proposals.index')->with('error', __('Permission denied'));
        }
    }

    public function convertToInvoice(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('convert-sales-proposals') && $salesProposal->created_by == creatorId()) {
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
                $invoice->creator_id = Auth::id();
                $invoice->created_by = creatorId();
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
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    private function calculateTotals($items)
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

                $taxPct = (float) ($item['tax_percentage'] ?? 0);
                if (isset($item['taxes']) && is_array($item['taxes']) && count($item['taxes']) > 0) {
                    $taxPct = array_reduce($item['taxes'], function ($sum, $t) {
                        return $sum + (float) ($t['tax_rate'] ?? $t['rate'] ?? 0);
                    }, 0);
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

    private function createProposalItems($proposalId, $items)
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

            $taxPct = (float) ($itemData['tax_percentage'] ?? 0);
            if (isset($itemData['taxes']) && is_array($itemData['taxes']) && count($itemData['taxes']) > 0) {
                $taxPct = array_reduce($itemData['taxes'], function ($sum, $t) {
                    return $sum + (float) ($t['tax_rate'] ?? $t['rate'] ?? 0);
                }, 0);
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
            $item->save(); // Automatically triggers SalesProposalItem::calculateAmounts() in Eloquent saving listener!

            if (isset($itemData['taxes']) && is_array($itemData['taxes'])) {
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

    private function saveProposalTariffs($proposalId, $tariffs)
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

    private function saveProposalContents($proposalId, $proposalContent)
    {
        if (!Schema::hasTable('sales_proposal_contents')) {
            return;
        }

        try {
            if (Schema::hasColumn('sales_proposal_contents', 'proposal_id')) {
                SalesProposalContent::where('proposal_id', $proposalId)->delete();
            }
        } catch (\Throwable $th) {}

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

                $order = isset($item['order']) ? (int)$item['order'] : $savedOrder;
                $title = $item['title'] ?? null;
                $htmlContent = $item['content'] ?? null;
                $bgImage = $item['background_image'] ?? null;
                $jsonContent = json_encode($item);
            } else {
                $order = $savedOrder;
                $title = null;
                $htmlContent = (string)$item;
                $pageType = 'content';
                $bgImage = null;
                $jsonContent = (string)$item;
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

    public function getWarehouseProducts(Request $request)
    {
        if (Auth::user()->can('create-sales-proposals') || Auth::user()->can('edit-sales-proposals')) {
            $warehouseId = $request->warehouse_id;

            if (!$warehouseId) {
                return response()->json([]);
            }
            $products = ProductServiceItem::select('id', 'name', 'sku', 'description', 'sale_price', 'long_description', 'tax_ids', 'unit', 'type')
                ->where('is_active', true)
                ->where('created_by', creatorId())
                ->whereHas('warehouseStocks', function ($q) use ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId)
                        ->where('quantity', '>', 0);
                })
                ->with([
                    'warehouseStocks' => function ($q) use ($warehouseId) {
                        $q->where('warehouse_id', $warehouseId);
                    }
                ])
                ->get()
                ->map(function ($product) {
                    $stock = $product->warehouseStocks->first();
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
                        'taxes' => $product->taxes->map(function ($tax) {
                            return [
                                'id' => $tax->id,
                                'tax_name' => $tax->tax_name,
                                'rate' => $tax->rate
                            ];
                        })
                    ];
                });
            return response()->json($products);
        } else {
            return response()->json([], 403);
        }
    }

    public function getServices(Request $request)
    {
        if (Auth::user()->can('create-sales-proposals') || Auth::user()->can('edit-sales-proposals')) {
            $services = ProductServiceItem::select('id', 'name', 'sku', 'description', 'long_description', 'sale_price', 'tax_ids', 'unit', 'type')
                ->where('is_active', true)
                ->where('type', 'service')
                ->where('created_by', creatorId())
                ->get()
                ->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'description' => $service->description,
                        'long_description' => $service->long_description,
                        'sku' => $service->sku,
                        'sale_price' => $service->sale_price,
                        'unit' => $service->unit,
                        'type' => $service->type,
                        'taxes' => $service->taxes->map(function ($tax) {
                            return [
                                'id' => $tax->id,
                                'tax_name' => $tax->tax_name,
                                'rate' => $tax->rate
                            ];
                        })
                    ];
                });
            return response()->json($services);
        } else {
            return response()->json([], 403);
        }
    }

    public function print(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('print-sales-proposals')) {
            $relations = ['customer', 'items.product', 'items.taxes', 'warehouse'];
            if (Schema::hasTable('sales_proposal_tariffs')) {
                $relations[] = 'tariffs';
            }
            if (Schema::hasTable('sales_proposal_contents')) {
                $relations[] = 'contents';
            }
            $salesProposal->load($relations);

            $defaultPages = ProposalDefaultPage::whereIn('creator_id', array_unique([Auth::id(), creatorId()]))
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
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function downloadPdf(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('print-sales-proposals')) {
            $relations = ['customer', 'items.product', 'items.taxes', 'warehouse'];
            if (Schema::hasTable('sales_proposal_tariffs')) {
                $relations[] = 'tariffs';
            }
            if (Schema::hasTable('sales_proposal_contents')) {
                $relations[] = 'contents';
            }
            $salesProposal->load($relations);

            $defaultPages = ProposalDefaultPage::whereIn('creator_id', array_unique([Auth::id(), creatorId()]))
                ->where('is_active', true)
                ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
                ->orderBy('sort_order')
                ->get(['id', 'title', 'content', 'page_type', 'background_image', 'sort_order']);

            $proposalSetting = ProposalSetting::getSettings(creatorId());

            $companyName = $proposalSetting['company_name'] ?? config('app.name', 'Automas');
            $cleanCompName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($companyName)));
            $cleanPropNum = strtolower(preg_replace('/[^a-z0-9-]+/i', '_', trim($salesProposal->proposal_number)));
            $pdfFilename = "quotation_{$cleanCompName}_{$cleanPropNum}.pdf";

            return Pdf::view('sales-proposals.print', [
                'proposal' => $salesProposal,
                'defaultPages' => $defaultPages,
                'proposalSetting' => $proposalSetting,
                'isServerPdf' => true,
            ])
                ->format('a4')
                ->margins(0, 0, 0, 0)
                ->download($pdfFilename);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function sent(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('sent-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if ($salesProposal->status !== 'draft') {
                return back()->with('error', __('Only draft proposals can be sent.'));
            }

            SentSalesProposal::dispatch($salesProposal);

            if (company_setting('Proposal Sent') == 'on') {
                $emailData = [
                    'proposal_number' => $salesProposal->proposal_number ?? null,
                    'sales_customer_name' => $salesProposal->customer->name ?? null,
                    'total_amount' => $salesProposal->total_amount ?? null,
                    'discount_amount' => $salesProposal->discount_amount ?? null,
                ];
                $message = EmailTemplate::sendEmailTemplate('Proposal Sent', [$salesProposal->customer->email], $emailData);
                if ($message['is_success'] == false && !empty($message['error'])) {
                    return back()
                        ->with('success', __('Proposal sent successfully.'))
                        ->with('error', $message['error']);
                }
            }

            $salesProposal->update(['status' => 'sent']);

            return back()->with('success', __('Proposal sent successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function accept(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('accept-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if ($salesProposal->status !== 'sent') {
                return back()->with('error', __('Only sent proposals can be accepted.'));
            }
            AcceptSalesProposal::dispatch($salesProposal);

            if (company_setting('Proposal Approved') == 'on') {

                $companyEmail = company_setting('company_email', $salesProposal->created_by) ?: $proposalCreator?->email;
                $emailData = [
                    'proposal_number' => $salesProposal->proposal_number ?? null,
                    'sales_customer_name' => $salesProposal->customer->name ?? null,
                    'total_amount' => $salesProposal->total_amount ?? null,
                    'discount_amount' => $salesProposal->discount_amount ?? null,
                    'status' => 'Accepted',
                ];
                $message = EmailTemplate::sendEmailTemplate('Proposal Approved', [$companyEmail], $emailData);
                if ($message['is_success'] == false && !empty($message['error'])) {
                    return back()
                        ->with('success', __('Proposal accepted successfully.'))
                        ->with('error', $message['error']);
                }
            }

            $salesProposal->update(['status' => 'accepted']);

            return back()->with('success', __('Proposal accepted successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function reject(SalesProposal $salesProposal)
    {
        if (Auth::user()->can('reject-sales-proposals') && $salesProposal->created_by == creatorId()) {
            if ($salesProposal->status !== 'sent') {
                return back()->with('error', __('Only sent proposals can be rejected.'));
            }

            RejectSalesProposal::dispatch($salesProposal);

            if (company_setting('Proposal Approved') == 'on') {

                $companyEmail = company_setting('company_email', $salesProposal->created_by) ?: $proposalCreator?->email;

                $emailData = [
                    'proposal_number' => $salesProposal->proposal_number ?? null,
                    'sales_customer_name' => $salesProposal->customer->name ?? null,
                    'total_amount' => $salesProposal->total_amount ?? null,
                    'discount_amount' => $salesProposal->discount_amount ?? null,
                    'status' => 'Rejected',
                ];
                $message = EmailTemplate::sendEmailTemplate('Proposal Approved', [$companyEmail], $emailData);
                if ($message['is_success'] == false && !empty($message['error'])) {
                    return back()
                        ->with('success', __('Proposal rejected successfully.'))
                        ->with('error', $message['error']);
                }
            }

            $salesProposal->update(['status' => 'rejected']);

            return back()->with('success', __('Proposal rejected successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }
}
