<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Automas\ProductService\Models\ProductServiceItem;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesOrderItem;
use Automas\Sales\Models\SalesOrderItemTax;
use Automas\Sales\Models\SalesQuote;

class SalesOrderApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (Auth::user()->can('manage-sales-orders')) {
                $query = SalesOrder::with(['account', 'assignUser', 'items', 'warehouse'])
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-orders')) {
                            $q->where('sales_orders.created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-orders')) {
                            $q->where(function ($query) {
                                $query->where('sales_orders.creator_id', Auth::id())
                                    ->orWhere('sales_orders.assign_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    });

                $orders = $query->latest()
                    ->paginate(request('per_page', 10))
                    ->withQueryString();

                $orders->getCollection()->transform(function ($order) {
                    return [
                        'id'             => $order->id,
                        'order_number'   => $order->order_number,
                        'name'           => $order->name,
                        'account'        => $order->account?->name,
                        'opportunity'    => $order->opportunity?->name,
                        'amount'         => $order->getTotal(),
                        'order_date'     => $order->order_date?->format('Y-m-d'),
                        'status'         => $order->status,
                        'assign_user'    => $order->assignUser?->name,
                        'opportunity_id' => $order->opportunity_id,
                        'account_id'     => $order->account_id,
                        'assign_user_id' => $order->assign_user_id,
                    ];
                });

                return $this->paginatedResponse($orders, 'Orders retrieved successfully');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }


    public function store(Request $request)
    {
        try {
            if (Auth::user()->can('create-sales-orders')) {
                $validator = Validator::make($request->all(), [
                    'name'                        => 'required|string|max:255',
                    'quote_id'                    => 'nullable|exists:sales_quotes,id',
                    'opportunity_id'              => 'nullable|exists:sales_opportunities,id',
                    'account_id'                  => 'nullable|exists:sales_accounts,id',
                    'customer_id'                 => 'required|exists:users,id',
                    'warehouse_id'                => 'required|exists:warehouses,id',
                    'status'                      => 'required|string|max:255',
                    'order_date'                  => 'required|date',
                    'billing_contact_id'          => 'nullable|exists:sales_contacts,id',
                    'shipping_contact_id'         => 'nullable|exists:sales_contacts,id',
                    'shipping_provider_id'        => 'nullable|exists:sales_shipping_providers,id',
                    'assign_user_id'              => 'nullable|exists:users,id',
                    'description'                 => 'nullable|string',
                    'notes'                       => 'nullable|string',
                    'items'                       => 'required|array',
                    'items.*.product_id'          => 'nullable|integer',
                    'items.*.quantity'            => 'required|integer',
                    'items.*.unit_price'          => 'required|numeric|min:0',
                    'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();
                $totals    = $this->calculateTotals($validated['items']);
                $quote     = SalesQuote::where('id', $validated['quote_id'])->first();

                $order                       = new SalesOrder();
                $order->order_number         = SalesOrder::generateOrderNumber();
                $order->name                 = $validated['name'];
                $order->quote_id             = $validated['quote_id'] ?? null;
                $order->opportunity_id       = $validated['opportunity_id'] ?? null;
                $order->account_id           = $validated['account_id'] ?? null;
                $order->customer_id          = $validated['customer_id'] ?? null;
                $order->warehouse_id         = $validated['warehouse_id'] ?? null;
                $order->status               = $validated['status'];
                $order->order_date           = $validated['order_date'];
                $order->billing_address      = $quote->billing_address ?? null;
                $order->shipping_address     = $quote->shipping_address ?? null;
                $order->billing_city         = $quote->billing_city ?? null;
                $order->billing_state        = $quote->billing_state ?? null;
                $order->shipping_city        = $quote->shipping_city ?? null;
                $order->shipping_state       = $quote->shipping_state ?? null;
                $order->billing_country      = $quote->billing_country ?? null;
                $order->billing_postal_code  = $quote->billing_postal_code ?? null;
                $order->shipping_country     = $quote->shipping_country ?? null;
                $order->shipping_postal_code = $quote->shipping_postal_code ?? null;
                $order->billing_contact_id   = $validated['billing_contact_id'] ?? null;
                $order->shipping_contact_id  = $validated['shipping_contact_id'] ?? null;
                $order->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $order->assign_user_id = Auth::id();
                } else {
                    $order->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $order->description     = $validated['description'] ?? null;
                $order->notes           = $validated['notes'] ?? null;
                $order->subtotal        = $totals['subtotal'];
                $order->tax_amount      = $totals['tax_amount'];
                $order->discount_amount = $totals['discount_amount'];
                $order->total_amount    = $totals['total_amount'];
                $order->creator_id      = Auth::id();
                $order->created_by      = creatorId();
                $order->save();

                $this->createOrderItems($order->id, $validated['items']);

                $order->load(['account', 'opportunity', 'assignUser']);

                $data = [
                    'id'             => $order->id,
                    'order_number'   => $order->order_number,
                    'name'           => $order->name,
                    'account'        => $order->account?->name,
                    'opportunity'    => $order->opportunity?->name,
                    'amount'         => $order->getTotal(),
                    'order_date'     => $order->order_date?->format('Y-m-d'),
                    'status'         => $order->status,
                    'assign_user'    => $order->assignUser?->name,
                    'opportunity_id' => $order->opportunity_id,
                    'account_id'     => $order->account_id,
                    'assign_user_id' => $order->assign_user_id,
                ];

                return $this->successResponse($data, 'The sales order has been created successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (Auth::user()->can('edit-sales-orders')) {
                $order = SalesOrder::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$order) {
                    return $this->errorResponse('Order not found', null, 404);
                }

                $validator = Validator::make($request->all(), [
                    'name'                        => 'required|string|max:255',
                    'quote_id'                    => 'nullable|exists:sales_quotes,id',
                    'opportunity_id'              => 'nullable|exists:sales_opportunities,id',
                    'account_id'                  => 'nullable|exists:sales_accounts,id',
                    'customer_id'                 => 'required|exists:users,id',
                    'warehouse_id'                => 'required|exists:warehouses,id',
                    'status'                      => 'required|string|max:255',
                    'order_date'                  => 'required|date',
                    'billing_contact_id'          => 'nullable|exists:sales_contacts,id',
                    'shipping_contact_id'         => 'nullable|exists:sales_contacts,id',
                    'shipping_provider_id'        => 'nullable|exists:sales_shipping_providers,id',
                    'assign_user_id'              => 'nullable|exists:users,id',
                    'description'                 => 'nullable|string',
                    'notes'                       => 'nullable|string',
                    'items'                       => 'required|array',
                    'items.*.product_id'          => 'nullable|integer',
                    'items.*.quantity'            => 'required|integer',
                    'items.*.unit_price'          => 'required|numeric|min:0',
                    'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();
                $totals    = $this->calculateTotals($validated['items']);
                
                $quote     = SalesQuote::where('id', $validated['quote_id'])->first();
                
                $order->name                 = $validated['name'];
                $order->quote_id             = $validated['quote_id'] ?? null;
                $order->opportunity_id       = $validated['opportunity_id'] ?? null;
                $order->account_id           = $validated['account_id'] ?? null;
                $order->customer_id          = $validated['customer_id'] ?? null;
                $order->warehouse_id         = $validated['warehouse_id'] ?? null;
                $order->status               = $validated['status'];
                $order->order_date           = $validated['order_date'];
                $order->billing_address      = $quote->billing_address ?? null;
                $order->shipping_address     = $quote->shipping_address ?? null;
                $order->billing_city         = $quote->billing_city ?? null;
                $order->billing_state        = $quote->billing_state ?? null;
                $order->shipping_city        = $quote->shipping_city ?? null;
                $order->shipping_state       = $quote->shipping_state ?? null;
                $order->billing_country      = $quote->billing_country ?? null;
                $order->billing_postal_code  = $quote->billing_postal_code ?? null;
                $order->shipping_country     = $quote->shipping_country ?? null;
                $order->shipping_postal_code = $quote->shipping_postal_code ?? null;
                $order->billing_contact_id   = $validated['billing_contact_id'] ?? null;
                $order->shipping_contact_id  = $validated['shipping_contact_id'] ?? null;
                $order->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
                // Auto assign to current user if staff and no user selected, otherwise use provided value or null
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $order->assign_user_id = Auth::id();
                } else {
                    $order->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $order->description     = $validated['description'] ?? null;
                $order->notes           = $validated['notes'] ?? null;
                $order->subtotal        = $totals['subtotal'];
                $order->tax_amount      = $totals['tax_amount'];
                $order->discount_amount = $totals['discount_amount'];
                $order->total_amount    = $totals['total_amount'];
                $order->save();

                $order->items()->delete();
                $this->createOrderItems($order->id, $validated['items']);

                $order->load(['account', 'opportunity', 'assignUser']);

                $data = [
                    'id'             => $order->id,
                    'order_number'   => $order->order_number,
                    'name'           => $order->name,
                    'account'        => $order->account?->name,
                    'opportunity'    => $order->opportunity?->name,
                    'amount'         => $order->getTotal(),
                    'order_date'     => $order->order_date?->format('Y-m-d'),
                    'status'         => $order->status,
                    'assign_user'    => $order->assignUser?->name,
                    'opportunity_id' => $order->opportunity_id,
                    'account_id'     => $order->account_id,
                    'assign_user_id' => $order->assign_user_id,
                ];

                return $this->successResponse($data, 'The sales order details are updated successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function destroy($id)
    {
        try {
            if (Auth::user()->can('delete-sales-orders')) {
                $order = SalesOrder::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$order) {
                    return $this->errorResponse('Order not found', null, 404);
                }
                $order->delete();

                return $this->successResponse(null, 'The sales order has been deleted.');
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

    private function createOrderItems($orderId, $items)
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

            $item                      = new SalesOrderItem();
            $item->order_id            = $orderId;
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
                    $orderItemTax           = new SalesOrderItemTax();
                    $orderItemTax->item_id  = $item->id;
                    $orderItemTax->tax_name = $tax->tax_name;
                    $orderItemTax->tax_rate = $tax->rate;
                    $orderItemTax->save();
                }
            }
        }
    }
}
