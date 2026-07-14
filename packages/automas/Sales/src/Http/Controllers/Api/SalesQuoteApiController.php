<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesQuoteItem;
use Automas\Sales\Models\SalesQuoteItemTax;
use Automas\Account\Models\Customer;
use Automas\ProductService\Models\ProductServiceItem;

class SalesQuoteApiController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        try {
            if (Auth::user()->can('manage-sales-quotes')) {
                $query = SalesQuote::with(['account', 'assignUser', 'items', 'warehouse'])
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-quotes')) {
                            $q->where('sales_quotes.created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-quotes')) {
                            $q->where(function ($query) {
                                $query->where('sales_quotes.creator_id', Auth::id())
                                    ->orWhere('sales_quotes.assign_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    });

                $quotes = $query->latest()
                    ->paginate(request('per_page', 10))
                    ->withQueryString();

                $quotes->getCollection()->transform(function ($quote) {
                    return [
                        'id'             => $quote->id,
                        'quote_number'   => $quote->quote_number,
                        'name'           => $quote->name,
                        'expiry_date'    => $quote->expiry_date?->format('Y-m-d'),
                        'account'        => $quote->account?->name,
                        'opportunity'    => $quote->opportunity?->name,
                        'amount'         => (int) $quote->getTotal(),
                        'date_quoted'    => $quote->date_quoted?->format('Y-m-d'),
                        'status'         => $quote->status,
                        'assign_user'    => $quote->assignUser?->name,
                        'opportunity_id' => $quote->opportunity_id,
                        'account_id'     => $quote->account_id,
                        'assign_user_id' => $quote->assign_user_id,
                    ];
                });

                return $this->paginatedResponse($quotes, 'Quotes retrieved successfully');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function store(Request $request)
    {
        try {
            if (Auth::user()->can('create-sales-quotes')) {
                $validator = Validator::make($request->all(), [
                    'name'                        => 'required|string|max:255',
                    'opportunity_id'              => 'nullable|exists:sales_opportunities,id',
                    'account_id'                  => 'nullable|exists:sales_accounts,id',
                    'customer_id'                 => 'required|exists:users,id',
                    'warehouse_id'                => 'required|exists:warehouses,id',
                    'status'                      => 'required|string|max:255',
                    'date_quoted'                 => 'required|date',
                    'expiry_date'                 => 'nullable|date|after:date_quoted',
                    'billing_contact_id'          => 'nullable|exists:sales_contacts,id',
                    'shipping_contact_id'         => 'nullable|exists:sales_contacts,id',
                    'shipping_provider_id'        => 'nullable|exists:sales_shipping_providers,id',
                    'assign_user_id'              => 'nullable|exists:users,id',
                    'description'                 => 'nullable|string',
                    'notes'                       => 'nullable|string',
                    'items'                       => 'required|array',
                    'items.*.product_id'          => 'required|exists:product_service_items,id',
                    'items.*.quantity'            => 'required|numeric',
                    'items.*.unit_price'          => 'required|numeric|min:0',
                    'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();
                $totals    = $this->calculateTotals($validated['items']);

                $customer = Customer::where('user_id', $validated['customer_id'])->first();
                $billingAddr = $customer?->billing_address;
                $shippingAddr = $customer?->shipping_address;

                $quote                       = new SalesQuote();
                $quote->quote_number         = SalesQuote::generateQuoteNumber();
                $quote->name                 = $validated['name'];
                $quote->opportunity_id       = $validated['opportunity_id'] ?? null;
                $quote->account_id           = $validated['account_id'] ?? null;
                $quote->customer_id          = $validated['customer_id'] ?? null;
                $quote->warehouse_id         = $validated['warehouse_id'] ?? null;
                $quote->status               = $validated['status'];
                $quote->date_quoted          = $validated['date_quoted'];
                $quote->expiry_date          = $validated['expiry_date'] ?? null;
                $quote->billing_address      = $billingAddr ? trim(($billingAddr['address_line_1'] ?? '') . ' ' . ($billingAddr['address_line_2'] ?? '')) : null;
                $quote->shipping_address     = $shippingAddr ? trim(($shippingAddr['address_line_1'] ?? '') . ' ' . ($shippingAddr['address_line_2'] ?? '')) : null;
                $quote->billing_city         = $billingAddr['city'] ?? null;
                $quote->billing_state        = $billingAddr['state'] ?? null;
                $quote->shipping_city        = $shippingAddr['city'] ?? null;
                $quote->shipping_state       = $shippingAddr['state'] ?? null;
                $quote->billing_country      = $billingAddr['country'] ?? null;
                $quote->billing_postal_code  = $billingAddr['zip_code'] ?? null;
                $quote->shipping_country     = $shippingAddr['country'] ?? null;
                $quote->shipping_postal_code = $shippingAddr['zip_code'] ?? null;
                $quote->billing_contact_id   = $validated['billing_contact_id'] ?? null;
                $quote->shipping_contact_id  = $validated['shipping_contact_id'] ?? null;
                $quote->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $quote->assign_user_id = Auth::id();
                } else {
                    $quote->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $quote->description     = $validated['description'] ?? null;
                $quote->notes           = $validated['notes'] ?? null;
                $quote->subtotal        = $totals['subtotal'];
                $quote->tax_amount      = $totals['tax_amount'];
                $quote->discount_amount = $totals['discount_amount'];
                $quote->total_amount    = $totals['total_amount'];
                $quote->creator_id      = Auth::id();
                $quote->created_by      = creatorId();
                $quote->save();

                $this->createQuoteItems($quote->id, $validated['items']);

                $quote->load(['account', 'opportunity', 'assignUser']);

                $data = [
                    'id'             => $quote->id,
                    'quote_number'   => $quote->quote_number,
                    'name'           => $quote->name,
                    'account'        => $quote->account?->name,
                    'opportunity'    => $quote->opportunity?->name,
                    'amount'         => $quote->getTotal(),
                    'date_quoted'    => $quote->date_quoted?->format('Y-m-d'),
                    'status'         => $quote->status,
                    'assign_user'    => $quote->assignUser?->name,
                    'opportunity_id' => $quote->opportunity_id,
                    'account_id'     => $quote->account_id,
                    'assign_user_id' => $quote->assign_user_id,
                ];

                return $this->successResponse($data, 'The quote has been created successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (Auth::user()->can('edit-sales-quotes')) {
                $quote = SalesQuote::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$quote) {
                    return $this->errorResponse('Quote not found', null, 404);
                }

                $validator = Validator::make($request->all(), [
                    'name'                        => 'required|string|max:255',
                    'opportunity_id'              => 'nullable|exists:sales_opportunities,id',
                    'account_id'                  => 'nullable|exists:sales_accounts,id',
                    'customer_id'                 => 'required|exists:users,id',
                    'warehouse_id'                => 'required|exists:warehouses,id',
                    'status'                      => 'required|string|max:255',
                    'date_quoted'                 => 'required|date',
                    'expiry_date'                 => 'nullable|date|after:date_quoted',
                    'billing_contact_id'          => 'nullable|exists:sales_contacts,id',
                    'shipping_contact_id'         => 'nullable|exists:sales_contacts,id',
                    'shipping_provider_id'        => 'nullable|exists:sales_shipping_providers,id',
                    'assign_user_id'              => 'nullable|exists:users,id',
                    'description'                 => 'nullable|string',
                    'notes'                       => 'nullable|string',
                    'items'                       => 'required|array',
                    'items.*.product_id'          => 'required|exists:product_service_items,id',
                    'items.*.quantity'            => 'required|numeric',
                    'items.*.unit_price'          => 'required|numeric|min:0',
                    'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();
                $totals    = $this->calculateTotals($validated['items']);

                $customer = Customer::where('user_id', $validated['customer_id'])->first();
                $billingAddr = $customer?->billing_address;
                $shippingAddr = $customer?->shipping_address;

                $quote->name                 = $validated['name'];
                $quote->opportunity_id       = $validated['opportunity_id'] ?? null;
                $quote->account_id           = $validated['account_id'] ?? null;
                $quote->customer_id          = $validated['customer_id'] ?? null;
                $quote->warehouse_id         = $validated['warehouse_id'] ?? null;
                $quote->status               = $validated['status'];
                $quote->date_quoted          = $validated['date_quoted'];
                $quote->expiry_date          = $validated['expiry_date'] ?? null;
                $quote->billing_address      = $billingAddr ? trim(($billingAddr['address_line_1'] ?? '') . ' ' . ($billingAddr['address_line_2'] ?? '')) : null;
                $quote->shipping_address     = $shippingAddr ? trim(($shippingAddr['address_line_1'] ?? '') . ' ' . ($shippingAddr['address_line_2'] ?? '')) : null;
                $quote->billing_city         = $billingAddr['city'] ?? null;
                $quote->billing_state        = $billingAddr['state'] ?? null;
                $quote->shipping_city        = $shippingAddr['city'] ?? null;
                $quote->shipping_state       = $shippingAddr['state'] ?? null;
                $quote->billing_country      = $billingAddr['country'] ?? null;
                $quote->billing_postal_code  = $billingAddr['zip_code'] ?? null;
                $quote->shipping_country     = $shippingAddr['country'] ?? null;
                $quote->shipping_postal_code = $shippingAddr['zip_code'] ?? null;
                $quote->billing_contact_id   = $validated['billing_contact_id'] ?? null;
                $quote->shipping_contact_id  = $validated['shipping_contact_id'] ?? null;
                $quote->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
                // Auto assign to current user if staff and no user selected, otherwise use provided value or null
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $quote->assign_user_id = Auth::id();
                } else {
                    $quote->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $quote->description     = $validated['description'] ?? null;
                $quote->notes           = $validated['notes'] ?? null;
                $quote->subtotal        = $totals['subtotal'];
                $quote->tax_amount      = $totals['tax_amount'];
                $quote->discount_amount = $totals['discount_amount'];
                $quote->total_amount    = $totals['total_amount'];
                $quote->save();

                $quote->items()->delete();
                $this->createQuoteItems($quote->id, $validated['items']);

                $quote->load(['account', 'opportunity', 'assignUser']);

                $data = [
                    'id'             => $quote->id,
                    'quote_number'   => $quote->quote_number,
                    'name'           => $quote->name,
                    'account'        => $quote->account?->name,
                    'opportunity'    => $quote->opportunity?->name,
                    'amount'         => $quote->getTotal(),
                    'date_quoted'    => $quote->date_quoted?->format('Y-m-d'),
                    'status'         => $quote->status,
                    'assign_user'    => $quote->assignUser?->name,
                    'opportunity_id' => $quote->opportunity_id,
                    'account_id'     => $quote->account_id,
                    'assign_user_id' => $quote->assign_user_id,
                ];

                return $this->successResponse($data, 'The quote details are updated successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function destroy($id)
    {
        try {
            if (Auth::user()->can('delete-sales-quotes')) {
                $quote = SalesQuote::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$quote) {
                    return $this->errorResponse('Quote not found', null, 404);
                }
                $quote->delete();

                return $this->successResponse(null, 'The quote has been deleted.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    private function calculateTotals($items)
    {
        $subtotal      = 0;
        $totalTax      = 0;
        $totalDiscount = 0;

        foreach ($items as $item) {
            $lineTotal      = $item['quantity'] * $item['unit_price'];
            $discountAmount = ($lineTotal * ($item['discount_percentage'] ?? 0)) / 100;
            $afterDiscount  = $lineTotal - $discountAmount;
            $taxPercentage = $item['tax_percentage'] ?? 0;
            if (isset($item['product_id'])) {
                $product = ProductServiceItem::find($item['product_id']);
                if ($product && $product->taxes->isNotEmpty()) {
                    $taxPercentage = $product->taxes->sum('rate');
                }
            }

            $taxAmount = ($afterDiscount * $taxPercentage) / 100;

            $subtotal      += $lineTotal;
            $totalDiscount += $discountAmount;
            $totalTax      += $taxAmount;
        }

        return [
            'subtotal'        => $subtotal,
            'tax_amount'      => $totalTax,
            'discount_amount' => $totalDiscount,
            'total_amount'    => $subtotal + $totalTax - $totalDiscount
        ];
    }

    private function createQuoteItems($quoteId, $items)
    {
        foreach ($items as $itemData) {
            if (empty($itemData['product_id'])) {
                continue;
            }
            $taxPercentage = 0;
            $product = ProductServiceItem::find($itemData['product_id']);
            if ($product && $product->taxes->isNotEmpty()) {
                $taxPercentage = $product->taxes->sum('rate');
            }
            $item                      = new SalesQuoteItem();
            $item->quote_id            = $quoteId;
            $item->product_id          = $itemData['product_id'];
            $item->quantity            = $itemData['quantity'];
            $item->unit_price          = $itemData['unit_price'];
            $item->discount_percentage = $itemData['discount_percentage'] ?? 0;
            $item->tax_percentage      = $taxPercentage;
            $item->creator_id          = Auth::id();
            $item->created_by          = creatorId();
            $item->save();

            if ($product && $product->taxes->isNotEmpty()) {
                foreach ($product->taxes as $tax) {
                    $quoteItemTax           = new SalesQuoteItemTax();
                    $quoteItemTax->item_id  = $item->id;
                    $quoteItemTax->tax_name = $tax->tax_name;
                    $quoteItemTax->tax_rate = $tax->rate;
                    $quoteItemTax->save();
                }
            }
        }
    }
}
