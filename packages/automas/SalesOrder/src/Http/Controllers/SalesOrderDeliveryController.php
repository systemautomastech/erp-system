<?php

namespace Automas\SalesOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Automas\SalesOrder\Models\SalesOrder;
use Automas\SalesOrder\Models\SalesOrderDelivery;
use Automas\SalesOrder\Models\SalesOrderDeliveryItem;
use Automas\SalesOrder\Models\SalesOrderSetting;
use Automas\SalesOrder\Events\CreateSalesOrderDelivery;
use Automas\SalesOrder\Events\CancelSalesOrderDelivery;
use Automas\SalesOrder\Http\Requests\StoreSalesOrderDeliveryRequest;

class SalesOrderDeliveryController extends Controller
{
    // ─── Create Delivery Form ────────────────────────────────────────────────

    public function create(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('create-sales-order-deliveries')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessOrder($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->status !== SalesOrder::STATUS_CONFIRMED) {
            return back()->with('error', __('Only confirmed Sales Orders can receive deliveries.'));
        }
        if ($salesOrder->delivery_status === SalesOrder::DELIVERY_STATUS_FULL) {
            return back()->with('error', __('This Sales Order is already fully delivered.'));
        }

        // Load items with delivered quantities
        $items = $salesOrder->items()->with(['taxes', 'deliveryItems' => function ($q) {
            $q->whereHas('delivery', fn($dq) => $dq->where('status', '!=', 'cancelled'));
        }])->get()->map(function ($item) {
            $delivered = $item->deliveryItems->sum('quantity');
            $remaining = max(0, $item->quantity - $delivered);
            return [
                'id'                 => $item->id,
                'product_id'         => $item->product_id,
                'quantity'           => $item->quantity,
                'delivered_quantity' => $delivered,
                'remaining_quantity' => $remaining,
                'unit'               => $item->unit,
                'description'        => $item->description,
            ];
        })->filter(fn($i) => $i['remaining_quantity'] > 0)->values();

        if ($items->isEmpty()) {
            return back()->with('error', __('All items are already fully delivered.'));
        }

        return Inertia::render('SalesOrder/SalesOrders/Deliver', [
            'salesOrder' => $salesOrder->load('customer'),
            'items'      => $items,
        ]);
    }

    // ─── Store Delivery ──────────────────────────────────────────────────────

    public function store(StoreSalesOrderDeliveryRequest $request, SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('create-sales-order-deliveries')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessOrder($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->status !== SalesOrder::STATUS_CONFIRMED) {
            return back()->with('error', __('Only confirmed Sales Orders can receive deliveries.'));
        }
        if ($salesOrder->delivery_status === SalesOrder::DELIVERY_STATUS_FULL) {
            return back()->with('error', __('This Sales Order is already fully delivered.'));
        }

        $delivery = DB::transaction(function () use ($request, $salesOrder) {
            // Validate quantities against remaining with row locking
            $orderItems = $salesOrder->items()
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($request->items as $deliveryItemData) {
                $itemId    = $deliveryItemData['sales_order_item_id'];
                $orderItem = $orderItems->get($itemId);

                if (!$orderItem || $orderItem->order_id !== $salesOrder->id) {
                    throw new \InvalidArgumentException(__('Invalid order item.'));
                }

                $delivered = SalesOrderDeliveryItem::whereHas(
                    'delivery',
                    fn($q) => $q->where('sales_order_id', $salesOrder->id)->where('status', '!=', 'cancelled')
                )->where('sales_order_item_id', $itemId)->sum('quantity');

                $remaining = $orderItem->quantity - $delivered;

                if ($deliveryItemData['quantity'] > $remaining) {
                    throw new \InvalidArgumentException(
                        __('Delivery quantity (:qty) exceeds remaining quantity (:rem) for item :id.', [
                            'qty' => $deliveryItemData['quantity'],
                            'rem' => $remaining,
                            'id'  => $itemId,
                        ])
                    );
                }
                if ($deliveryItemData['quantity'] <= 0) {
                    throw new \InvalidArgumentException(__('Delivery quantity must be greater than 0.'));
                }
            }

            // Create delivery record
            $delivery = SalesOrderDelivery::create([
                'sales_order_id' => $salesOrder->id,
                'delivery_date'  => $request->delivery_date,
                'notes'          => $request->notes ?? null,
                'status'         => SalesOrderDelivery::STATUS_DELIVERED,
                'creator_id'     => Auth::id(),
                'created_by'     => creatorId(),
            ]);

            // Create delivery items
            foreach ($request->items as $deliveryItemData) {
                $orderItem = $orderItems->get($deliveryItemData['sales_order_item_id']);
                SalesOrderDeliveryItem::create([
                    'delivery_id'          => $delivery->id,
                    'sales_order_item_id'  => $deliveryItemData['sales_order_item_id'],
                    'product_id'           => $orderItem->product_id,
                    'quantity'             => $deliveryItemData['quantity'],
                    'notes'                => $deliveryItemData['notes'] ?? null,
                ]);
            }

            // Recalculate Sales Order delivery status
            $salesOrder->refresh();
            $salesOrder->recalculateDeliveryStatus();

            return $delivery;
        });

        CreateSalesOrderDelivery::dispatch($delivery);

        return redirect()
            ->route('salesorder.orders.show', $salesOrder)
            ->with('success', __('Delivery :num created successfully.', ['num' => $delivery->delivery_number]));
    }

    // ─── Show Delivery ───────────────────────────────────────────────────────

    public function show(SalesOrderDelivery $delivery)
    {
        if (!Auth::user()->can('view-sales-order-deliveries')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessDelivery($delivery)) {
            return back()->with('error', __('Access denied'));
        }

        $delivery->load(['salesOrder.customer', 'items.salesOrderItem', 'creator']);

        return Inertia::render('SalesOrder/SalesOrders/DeliveryShow', [
            'delivery' => $delivery,
            'settings' => SalesOrderSetting::getSettings(),
        ]);
    }

    // ─── Cancel Delivery ─────────────────────────────────────────────────────

    public function cancel(SalesOrderDelivery $delivery)
    {
        if (!Auth::user()->can('cancel-sales-order-deliveries')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessDelivery($delivery)) {
            return back()->with('error', __('Access denied'));
        }
        if ($delivery->status === SalesOrderDelivery::STATUS_CANCELLED) {
            return back()->with('error', __('Delivery is already cancelled.'));
        }

        DB::transaction(function () use ($delivery) {
            $delivery->update(['status' => SalesOrderDelivery::STATUS_CANCELLED]);
            $delivery->salesOrder->recalculateDeliveryStatus();
        });

        CancelSalesOrderDelivery::dispatch($delivery);

        return back()->with('success', __('Delivery cancelled. Quantities have been restored.'));
    }

    // ─── Delivery Challan ────────────────────────────────────────────────────

    public function challan(SalesOrderDelivery $delivery)
    {
        if (!Auth::user()->can('print-delivery-challans')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessDelivery($delivery)) {
            return back()->with('error', __('Access denied'));
        }

        $delivery->load(['salesOrder.customer', 'items.salesOrderItem', 'creator']);
        $settings = SalesOrderSetting::getSettings();

        $quotation = null;
        if ($delivery->salesOrder?->quote_id && class_exists(\Automas\Quotation\Models\SalesQuotation::class)) {
            $quotation = \Automas\Quotation\Models\SalesQuotation::find($delivery->salesOrder->quote_id);
        }

        return Inertia::render('SalesOrder/SalesOrders/Challan', [
            'delivery'  => $delivery,
            'settings'  => $settings,
            'quotation' => $quotation,
            'autoPrint' => false,
        ]);
    }

    public function challanPdf(SalesOrderDelivery $delivery)
    {
        if (!Auth::user()->can('print-delivery-challans')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccessDelivery($delivery)) {
            return back()->with('error', __('Access denied'));
        }

        $delivery->load(['salesOrder.customer', 'items.salesOrderItem', 'creator']);
        $settings = SalesOrderSetting::getSettings();

        return Inertia::render('SalesOrder/SalesOrders/Challan', [
            'delivery'  => $delivery,
            'settings'  => $settings,
            'quotation' => null,
            'autoPrint' => true,
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function canAccessOrder(SalesOrder $salesOrder): bool
    {
        $user = Auth::user();
        if ($user->can('manage-any-sales-orders')) {
            return $salesOrder->created_by == creatorId();
        }
        if ($user->can('manage-own-sales-orders')) {
            return $salesOrder->created_by == creatorId()
                && ($salesOrder->creator_id == $user->id
                    || $salesOrder->assignedUsers()->where('users.id', $user->id)->exists());
        }
        return false;
    }

    private function canAccessDelivery(SalesOrderDelivery $delivery): bool
    {
        return $delivery->created_by == creatorId();
    }
}
