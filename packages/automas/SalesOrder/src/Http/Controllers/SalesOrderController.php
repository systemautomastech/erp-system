<?php

namespace Automas\SalesOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Automas\SalesOrder\Models\SalesOrder;
use Automas\SalesOrder\Models\SalesOrderItem;
use Automas\SalesOrder\Models\SalesOrderItemTax;
use Automas\SalesOrder\Models\SalesOrderSetting;
use Automas\SalesOrder\Http\Requests\StoreSalesOrderRequest;
use Automas\SalesOrder\Http\Requests\UpdateSalesOrderRequest;
use Automas\SalesOrder\Events\CreateSalesOrder;
use Automas\SalesOrder\Events\UpdateSalesOrder;
use Automas\SalesOrder\Events\DestroySalesOrder;
use App\Models\User;
use App\Models\Warehouse;

class SalesOrderController extends Controller
{
    // ─── Index ───────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        if (!Auth::user()->can('manage-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        $salesOrders = SalesOrder::with(['customer', 'assignedUsers', 'items', 'assignedGroup', 'acquiredByUser'])
            ->accessible()
            ->when($request->name, fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('name', 'like', '%' . $request->name . '%')
                   ->orWhere('order_number', 'like', '%' . $request->name . '%');
            }))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->delivery_status, fn($q) => $q->where('delivery_status', $request->delivery_status))
            ->when($request->assignment_status, fn($q) => $q->where('assignment_status', $request->assignment_status))
            ->when($request->assigned_group_id, fn($q) => $q->where('assigned_group_id', $request->assigned_group_id))
            ->when($request->my_acquired, fn($q) => $q->where('acquired_by', Auth::id()))
            ->when($request->available_to_me, function ($q) {
                // Orders that are group_assigned AND current user is member of assigned group
                $q->where('assignment_status', SalesOrder::ASSIGNMENT_GROUP_ASSIGNED)
                  ->whereHas('assignedGroup', fn($sq) => $sq->whereHas('users', fn($uq) => $uq->where('users.id', Auth::id())));
            })
            ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->assigned_user_id, fn($q) => $q->whereHas('assignedUsers', fn($sq) => $sq->where('users.id', $request->assigned_user_id)))
            ->when($request->date_from, fn($q) => $q->whereDate('order_date', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('order_date', '<=', $request->date_to))
            ->when($request->sort, function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                if ($request->sort === 'amount') {
                    return $q->orderBy('total_amount', $direction);
                }
                return $q->orderBy($request->sort, $direction);
            }, fn($q) => $q->latest())
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        $authUser = Auth::user();
        $isCompanyOrAdmin = in_array($authUser->type, ['company', 'superadmin', 'admin']);
        $userGroupIds = \App\Models\UserGroup::where('is_active', true)
            ->whereHas('users', fn($q) => $q->where('users.id', $authUser->id))
            ->pluck('id')
            ->toArray();

        $salesOrders->getCollection()->transform(function ($order) use ($authUser, $isCompanyOrAdmin, $userGroupIds) {
            $order->amount = $order->getTotal();
            $isGroupMember = $order->assigned_group_id && in_array($order->assigned_group_id, $userGroupIds);
            $isAssignedUser = $order->assignedUsers->contains('id', $authUser->id);

            $order->can_deliver = $order->status === SalesOrder::STATUS_CONFIRMED
                && $order->delivery_status !== SalesOrder::DELIVERY_STATUS_FULL
                && (
                    $isCompanyOrAdmin
                    || $authUser->can('create-sales-order-deliveries')
                    || $authUser->can('manage-sales-order-deliveries')
                    || ($order->assignment_status === SalesOrder::ASSIGNMENT_ACQUIRED && $order->acquired_by === $authUser->id)
                    || $isAssignedUser
                    || $order->creator_id === $authUser->id
                );

            $order->can_acquire = $order->delivery_status !== SalesOrder::DELIVERY_STATUS_FULL
                && $order->assignment_status !== SalesOrder::ASSIGNMENT_ACQUIRED
                && (
                    $isCompanyOrAdmin
                    || ($order->assignment_status === SalesOrder::ASSIGNMENT_GROUP_ASSIGNED && $isGroupMember)
                    || ($order->assignment_status === SalesOrder::ASSIGNMENT_UNASSIGNED)
                    || $authUser->can('acquire-sales-orders')
                );

            return $order;
        });

        $customers  = $this->getCustomers();
        $users      = $this->getWorkspaceUsers();
        $settings   = SalesOrderSetting::getSettings();
        $userGroups = \App\Models\UserGroup::where('created_by', creatorId())
            ->active()
            ->select('id', 'name')
            ->get();

        return Inertia::render('SalesOrder/SalesOrders/Index', [
            'salesOrders' => $salesOrders,
            'customers'   => $customers,
            'users'       => $users,
            'userGroups'  => $userGroups,
            'settings'    => $settings,
            'filters'     => $request->only(['name', 'status', 'delivery_status', 'assignment_status', 'assigned_group_id', 'customer_id', 'assigned_user_id', 'date_from', 'date_to', 'my_acquired', 'available_to_me']),
        ]);
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    public function create(Request $request)
    {
        if (!Auth::user()->can('create-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        $settings = SalesOrderSetting::getSettings();

        return Inertia::render('SalesOrder/SalesOrders/Create', [
            'customers'  => $this->getCustomers(),
            'users'      => $this->getWorkspaceUsers(),
            'warehouses' => $this->getWarehouses(),
            'settings'   => $settings,
            'fromQuote'  => $request->quote_id ? $this->getQuoteData($request->quote_id) : null,
        ]);
    }

    // ─── Store ───────────────────────────────────────────────────────────────

    public function store(StoreSalesOrderRequest $request)
    {
        if (!Auth::user()->can('create-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        $validated = $request->validated();

        $salesOrder = DB::transaction(function () use ($validated, $request) {
            $customerId = $this->resolveCustomer($validated, $request);
            $totals = $this->calculateTotals($validated['items']);

            $salesOrder = SalesOrder::create([
                'name'                   => $validated['name'],
                'quote_id'               => $validated['quote_id'] ?? null,
                'status'                 => $validated['status'] ?? SalesOrder::STATUS_DRAFT,
                'delivery_status'        => SalesOrder::DELIVERY_STATUS_PENDING,
                'customer_id'            => $customerId,
                'warehouse_id'           => $validated['warehouse_id'] ?? null,
                'order_date'             => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'billing_address'        => $validated['billing_address'] ?? null,
                'shipping_address'       => $validated['shipping_address'] ?? null,
                'billing_city'           => $validated['billing_city'] ?? null,
                'billing_state'          => $validated['billing_state'] ?? null,
                'shipping_city'          => $validated['shipping_city'] ?? null,
                'shipping_state'         => $validated['shipping_state'] ?? null,
                'billing_country'        => $validated['billing_country'] ?? null,
                'billing_postal_code'    => $validated['billing_postal_code'] ?? null,
                'shipping_country'       => $validated['shipping_country'] ?? null,
                'shipping_postal_code'   => $validated['shipping_postal_code'] ?? null,
                'description'            => $validated['description'] ?? null,
                'notes'                  => $validated['notes'] ?? null,
                'subtotal'               => $totals['subtotal'],
                'tax_amount'             => $totals['tax_amount'],
                'discount_amount'        => $totals['discount_amount'],
                'total_amount'           => $totals['total_amount'],
                'creator_id'             => Auth::id(),
                'created_by'             => creatorId(),
            ]);

            $this->createOrderItems($salesOrder->id, $validated['items']);

            // Sync assigned users (must belong to workspace)
            if (!empty($validated['assigned_user_ids'])) {
                $validUserIds = $this->validateWorkspaceUsers($validated['assigned_user_ids']);
                $salesOrder->assignedUsers()->sync($validUserIds);
            }

            return $salesOrder;
        });

        CreateSalesOrder::dispatch($request, $salesOrder);

        return redirect()
            ->route('salesorder.orders.show', $salesOrder)
            ->with('success', __('The sales order has been created successfully.'));
    }

    // ─── Show ────────────────────────────────────────────────────────────────

    public function show(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('view-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return redirect()->route('salesorder.orders.index')->with('error', __('Access denied'));
        }

        $salesOrder->load(['customer', 'warehouse', 'assignedUsers', 'allDeliveries.items.salesOrderItem', 'assignedGroup', 'acquiredByUser']);

        $items = $salesOrder->items()->with(['taxes', 'deliveryItems' => function ($q) {
            $q->whereHas('delivery', fn($dq) => $dq->where('status', '!=', 'cancelled'));
        }])->get()->map(function ($item) {
            $lineTotal      = $item->quantity * $item->unit_price;
            $discountAmt    = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;
            $afterDiscount  = $lineTotal - $discountAmt;
            $taxAmt         = ($afterDiscount * ($item->tax_percentage ?? 0)) / 100;
            $delivered      = $item->deliveryItems->sum('quantity');
            $remaining      = max(0, $item->quantity - $delivered);

            return [
                'id'                  => $item->id,
                'product_id'          => $item->product_id,
                'quantity'            => $item->quantity,
                'unit_price'          => $item->unit_price,
                'discount_percentage' => $item->discount_percentage ?? 0,
                'discount_amount'     => $discountAmt,
                'tax_percentage'      => $item->tax_percentage ?? 0,
                'tax_amount'          => $taxAmt,
                'total_amount'        => $afterDiscount + $taxAmt,
                'delivered_quantity'  => $delivered,
                'remaining_quantity'  => $remaining,
                'unit'                => $item->unit,
                'description'         => $item->description,
                'taxes'               => $item->taxes->map(fn($t) => ['tax_name' => $t->tax_name, 'tax_rate' => (float) $t->tax_rate])->toArray(),
            ];
        });

        $salesOrder->amount = $salesOrder->getTotal();

        // Load quotation if Quotation addon is active
        $quotation = null;
        if ($salesOrder->quote_id && class_exists(\Automas\Quotation\Models\SalesQuotation::class)) {
            $quotation = \Automas\Quotation\Models\SalesQuotation::find($salesOrder->quote_id);
        }

        $settings = SalesOrderSetting::getSettings();

        $authUser = Auth::user();
        $userGroups = \App\Models\UserGroup::where('created_by', creatorId())
            ->active()
            ->select('id', 'name')
            ->withCount('users')
            ->get();

        // Determine if current user is a member of the assigned group
        $isGroupMember = $salesOrder->assigned_group_id
            ? \App\Models\UserGroup::where('id', $salesOrder->assigned_group_id)
                ->where('is_active', true)
                ->whereHas('users', fn($q) => $q->where('users.id', $authUser->id))
                ->exists()
            : false;

        $isCompanyOrAdmin = in_array($authUser->type, ['company', 'superadmin', 'admin']);
        $isAssignedUser = $salesOrder->assignedUsers->contains('id', $authUser->id);

        return Inertia::render('SalesOrder/SalesOrders/Show', [
            'salesOrder'      => $salesOrder,
            'orderItems'      => $items,
            'quotation'       => $quotation,
            'deliveries'      => $salesOrder->allDeliveries->load(['items.salesOrderItem', 'creator']),
            'settings'        => $settings,
            'userGroups'      => $userGroups,
            'canConfirm'      => $salesOrder->status === SalesOrder::STATUS_DRAFT,
            'canCancel'       => in_array($salesOrder->status, [SalesOrder::STATUS_DRAFT, SalesOrder::STATUS_CONFIRMED]),
            'canDeliver'      => in_array($salesOrder->status, [SalesOrder::STATUS_CONFIRMED, SalesOrder::STATUS_DRAFT])
                              && $salesOrder->delivery_status !== SalesOrder::DELIVERY_STATUS_FULL
                              && (
                                  $isCompanyOrAdmin
                                  || $authUser->can('create-sales-order-deliveries')
                                  || $authUser->can('manage-sales-order-deliveries')
                                  || ($salesOrder->assignment_status === SalesOrder::ASSIGNMENT_ACQUIRED && $salesOrder->acquired_by === $authUser->id)
                                  || $isAssignedUser
                                  || $salesOrder->creator_id === $authUser->id
                              ),
            'canAssignGroup'  => ($authUser->can('assign-group-sales-orders') || $authUser->can('reassign-sales-orders') || $authUser->can('edit-sales-orders') || $isCompanyOrAdmin),
            'canAcquire'      => $salesOrder->delivery_status !== SalesOrder::DELIVERY_STATUS_FULL
                              && $salesOrder->assignment_status !== SalesOrder::ASSIGNMENT_ACQUIRED
                              && (
                                  $isCompanyOrAdmin
                                  || ($salesOrder->assignment_status === SalesOrder::ASSIGNMENT_GROUP_ASSIGNED && $isGroupMember)
                                  || ($salesOrder->assignment_status === SalesOrder::ASSIGNMENT_UNASSIGNED)
                                  || $authUser->can('acquire-sales-orders')
                              ),
            'canRelease'      => $authUser->can('release-sales-orders')
                              && $salesOrder->assignment_status === SalesOrder::ASSIGNMENT_ACQUIRED
                              && ($salesOrder->acquired_by === $authUser->id || $authUser->can('reassign-sales-orders') || $isCompanyOrAdmin),
            'canReassign'     => ($authUser->can('reassign-sales-orders') || $authUser->can('assign-group-sales-orders') || $isCompanyOrAdmin)
                              && $salesOrder->status === SalesOrder::STATUS_CONFIRMED,
        ]);
    }

    // ─── Edit ────────────────────────────────────────────────────────────────

    public function edit(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('edit-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->is_invoiced) {
            return back()->with('error', __('Cannot edit a Sales Order that has already been converted to an invoice.'));
        }
        if ($salesOrder->delivery_status === SalesOrder::DELIVERY_STATUS_FULL) {
            return back()->with('error', __('Cannot edit a Sales Order after all deliveries are completed.'));
        }
        if ($salesOrder->status === SalesOrder::STATUS_CANCELLED) {
            return back()->with('error', __('Cannot edit a cancelled Sales Order.'));
        }

        $salesOrder->load(['items.taxes', 'assignedUsers']);
        $salesOrder->items->transform(function ($item) {
            $lineTotal     = $item->quantity * $item->unit_price;
            $discountAmt   = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;
            $afterDiscount = $lineTotal - $discountAmt;
            $taxAmt        = ($afterDiscount * ($item->tax_percentage ?? 0)) / 100;
            return [
                'id'                  => $item->id,
                'product_id'          => $item->product_id,
                'quantity'            => $item->quantity,
                'unit_price'          => $item->unit_price,
                'discount_percentage' => $item->discount_percentage ?? 0,
                'discount_amount'     => $discountAmt,
                'tax_percentage'      => $item->tax_percentage ?? 0,
                'tax_amount'          => $taxAmt,
                'total_amount'        => $afterDiscount + $taxAmt,
                'unit'                => $item->unit,
                'description'         => $item->description,
                'taxes'               => $item->taxes->map(fn($t) => ['tax_name' => $t->tax_name, 'tax_rate' => $t->tax_rate])->toArray(),
            ];
        });

        return Inertia::render('SalesOrder/SalesOrders/Edit', [
            'order'      => $salesOrder,
            'customers'  => $this->getCustomers(),
            'users'      => $this->getWorkspaceUsers(),
            'warehouses' => $this->getWarehouses(),
            'settings'   => SalesOrderSetting::getSettings(),
        ]);
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('edit-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return redirect()->route('salesorder.orders.index')->with('error', __('Access denied'));
        }
        if ($salesOrder->is_invoiced) {
            return back()->with('error', __('Cannot edit a Sales Order that has already been converted to an invoice.'));
        }
        if ($salesOrder->delivery_status === SalesOrder::DELIVERY_STATUS_FULL) {
            return back()->with('error', __('Cannot edit a Sales Order after all deliveries are completed.'));
        }
        if ($salesOrder->status === SalesOrder::STATUS_CANCELLED) {
            return back()->with('error', __('Cannot edit a cancelled Sales Order.'));
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $salesOrder, $request) {
            $customerId = $this->resolveCustomer($validated, $request, $salesOrder->customer_id);
            $totals = $this->calculateTotals($validated['items']);

            $salesOrder->update([
                'name'                   => $validated['name'],
                'quote_id'               => $validated['quote_id'] ?? null,
                'customer_id'            => $customerId,
                'warehouse_id'           => $validated['warehouse_id'] ?? null,
                'order_date'             => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'billing_address'        => $validated['billing_address'] ?? null,
                'shipping_address'       => $validated['shipping_address'] ?? null,
                'billing_city'           => $validated['billing_city'] ?? null,
                'billing_state'          => $validated['billing_state'] ?? null,
                'shipping_city'          => $validated['shipping_city'] ?? null,
                'shipping_state'         => $validated['shipping_state'] ?? null,
                'billing_country'        => $validated['billing_country'] ?? null,
                'billing_postal_code'    => $validated['billing_postal_code'] ?? null,
                'shipping_country'       => $validated['shipping_country'] ?? null,
                'shipping_postal_code'   => $validated['shipping_postal_code'] ?? null,
                'description'            => $validated['description'] ?? null,
                'notes'                  => $validated['notes'] ?? null,
                'subtotal'               => $totals['subtotal'],
                'tax_amount'             => $totals['tax_amount'],
                'discount_amount'        => $totals['discount_amount'],
                'total_amount'           => $totals['total_amount'],
            ]);

            // Re-create items (safe as long as no deliveries reference them)
            $salesOrder->items()->delete();
            $this->createOrderItems($salesOrder->id, $validated['items']);

            // Sync assigned users
            if (array_key_exists('assigned_user_ids', $validated)) {
                $validIds = $this->validateWorkspaceUsers($validated['assigned_user_ids'] ?? []);
                $salesOrder->assignedUsers()->sync($validIds);
            }

            UpdateSalesOrder::dispatch($request, $salesOrder);
        });

        return redirect()
            ->route('salesorder.orders.show', $salesOrder)
            ->with('success', __('The sales order has been updated successfully.'));
    }

    // ─── Destroy ─────────────────────────────────────────────────────────────

    public function destroy(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('delete-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->delivery_status !== SalesOrder::DELIVERY_STATUS_PENDING) {
            return back()->with('error', __('Cannot delete a Sales Order with deliveries.'));
        }

        DestroySalesOrder::dispatch($salesOrder);
        DB::transaction(function () use ($salesOrder) {
            $salesOrder->assignedUsers()->detach();
            $salesOrder->delete();
        });

        return redirect()->route('salesorder.orders.index')
            ->with('success', __('The sales order has been deleted.'));
    }

    // ─── Confirm ─────────────────────────────────────────────────────────────

    public function confirm(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('edit-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->status !== SalesOrder::STATUS_DRAFT) {
            return back()->with('error', __('Only draft Sales Orders can be confirmed.'));
        }

        $salesOrder->update([
            'status'       => SalesOrder::STATUS_CONFIRMED,
            'confirmed_at' => now(),
        ]);

        return back()->with('success', __('Sales Order confirmed successfully.'));
    }

    // ─── Cancel ──────────────────────────────────────────────────────────────

    public function cancel(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('edit-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if (!in_array($salesOrder->status, [SalesOrder::STATUS_DRAFT, SalesOrder::STATUS_CONFIRMED])) {
            return back()->with('error', __('This Sales Order cannot be cancelled.'));
        }
        if ($salesOrder->delivery_status !== SalesOrder::DELIVERY_STATUS_PENDING) {
            return back()->with('error', __('Cannot cancel a Sales Order with active deliveries.'));
        }

        $salesOrder->update(['status' => SalesOrder::STATUS_CANCELLED]);

        return back()->with('success', __('Sales Order cancelled.'));
    }

    // ─── Assign Group ─────────────────────────────────────────────────────────

    public function assignGroup(Request $request, SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('assign-group-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->status !== SalesOrder::STATUS_CONFIRMED) {
            return back()->with('error', __('Only confirmed Sales Orders can be group-assigned.'));
        }
        if ($salesOrder->assignment_status === SalesOrder::ASSIGNMENT_ACQUIRED) {
            return back()->with('error', __('Order is already acquired. Release it before reassigning to a group.'));
        }

        $request->validate([
            'assigned_group_id' => 'required|integer|exists:user_groups,id',
        ]);

        // Verify group belongs to this workspace
        $group = \App\Models\UserGroup::where('id', $request->assigned_group_id)
            ->where('created_by', creatorId())
            ->where('is_active', true)
            ->first();

        if (!$group) {
            return back()->with('error', __('Invalid or inactive user group.'));
        }

        $salesOrder->update([
            'assigned_group_id' => $group->id,
            'assignment_status' => SalesOrder::ASSIGNMENT_GROUP_ASSIGNED,
        ]);

        return back()->with('success', __('Sales Order assigned to group ":group".', ['group' => $group->name]));
    }

    // ─── Acquire ──────────────────────────────────────────────────────────────

    /**
     * Atomic acquisition — only one user can acquire an order at a time.
     * Uses DB lockForUpdate() to prevent race conditions.
     */
    public function acquire(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('acquire-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        $user = Auth::user();

        try {
            DB::transaction(function () use ($salesOrder, $user) {
                // Re-fetch with row lock to prevent race condition
                $locked = SalesOrder::lockForUpdate()->findOrFail($salesOrder->id);

                if ($locked->created_by != creatorId()) {
                    throw new \InvalidArgumentException(__('Access denied'));
                }
                if (!in_array($locked->assignment_status, [SalesOrder::ASSIGNMENT_GROUP_ASSIGNED, SalesOrder::ASSIGNMENT_UNASSIGNED])) {
                    throw new \InvalidArgumentException(__('This order is not available for acquisition.'));
                }
                if ($locked->status !== SalesOrder::STATUS_CONFIRMED) {
                    throw new \InvalidArgumentException(__('Only confirmed orders can be acquired.'));
                }

                // If group-assigned, verify user is an active member or admin/company
                if ($locked->assignment_status === SalesOrder::ASSIGNMENT_GROUP_ASSIGNED && !in_array($user->type, ['company', 'superadmin', 'admin'])) {
                    $isMember = \App\Models\UserGroup::where('id', $locked->assigned_group_id)
                        ->where('is_active', true)
                        ->whereHas('users', fn($q) => $q->where('users.id', $user->id))
                        ->exists();

                    if (!$isMember) {
                        throw new \InvalidArgumentException(__('You are not an active member of the assigned group.'));
                    }
                }

                $locked->update([
                    'assignment_status' => SalesOrder::ASSIGNMENT_ACQUIRED,
                    'acquired_by'       => $user->id,
                    'acquired_at'       => now(),
                ]);
            });
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', __('You have acquired this Sales Order.'));
    }

    // ─── Release ──────────────────────────────────────────────────────────────

    public function release(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('release-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }
        if ($salesOrder->assignment_status !== SalesOrder::ASSIGNMENT_ACQUIRED) {
            return back()->with('error', __('This order is not currently acquired.'));
        }

        $user = Auth::user();
        // Only the acquirer or a manager can release
        if ($salesOrder->acquired_by !== $user->id && !$user->can('reassign-sales-orders')) {
            return back()->with('error', __('Only the acquirer or a manager can release this order.'));
        }

        $salesOrder->update([
            'assignment_status' => SalesOrder::ASSIGNMENT_GROUP_ASSIGNED,
            'acquired_by'       => null,
            'acquired_at'       => null,
        ]);

        return back()->with('success', __('Sales Order released back to the group queue.'));
    }

    // ─── Reassign ─────────────────────────────────────────────────────────────

    public function reassign(Request $request, SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('reassign-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }

        $request->validate([
            'assigned_group_id' => 'required|integer|exists:user_groups,id',
        ]);

        $group = \App\Models\UserGroup::where('id', $request->assigned_group_id)
            ->where('created_by', creatorId())
            ->where('is_active', true)
            ->first();

        if (!$group) {
            return back()->with('error', __('Invalid or inactive user group.'));
        }

        $salesOrder->update([
            'assigned_group_id' => $group->id,
            'assignment_status' => SalesOrder::ASSIGNMENT_GROUP_ASSIGNED,
            'acquired_by'       => null,
            'acquired_at'       => null,
        ]);

        return back()->with('success', __('Sales Order reassigned to group ":group".', ['group' => $group->name]));
    }

    // ─── Duplicate ───────────────────────────────────────────────────────────

    public function duplicate(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('create-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }

        DB::transaction(function () use ($salesOrder) {
            $newOrder = $salesOrder->replicate();
            $newOrder->order_number      = null; // will auto-generate in boot
            $newOrder->status            = SalesOrder::STATUS_DRAFT;
            $newOrder->delivery_status   = SalesOrder::DELIVERY_STATUS_PENDING;
            $newOrder->confirmed_at      = null;
            $newOrder->is_invoiced       = false;
            $newOrder->invoice_id        = null;
            $newOrder->assigned_group_id = null;
            $newOrder->assignment_status = SalesOrder::ASSIGNMENT_UNASSIGNED;
            $newOrder->acquired_by       = null;
            $newOrder->acquired_at       = null;
            $newOrder->creator_id        = Auth::id();
            $newOrder->created_by        = creatorId();
            $newOrder->save();

            foreach ($salesOrder->items as $item) {
                $newItem          = $item->replicate();
                $newItem->order_id = $newOrder->id;
                $newItem->save();
                foreach ($item->taxes as $tax) {
                    $newTax          = $tax->replicate();
                    $newTax->item_id = $newItem->id;
                    $newTax->save();
                }
            }
        });

        return back()->with('success', __('Sales Order duplicated successfully.'));
    }

    // ─── Print / PDF ─────────────────────────────────────────────────────────

    public function print(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('print-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }

        $salesOrder->load(['customer', 'warehouse', 'assignedUsers', 'items.taxes', 'items.product']);
        $settings = SalesOrderSetting::getSettings();

        return Inertia::render('SalesOrder/SalesOrders/Print', [
            'salesOrder' => $salesOrder,
            'settings'   => $settings,
            'autoPrint'  => false,
        ]);
    }

    public function pdf(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('print-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$this->canAccess($salesOrder)) {
            return back()->with('error', __('Access denied'));
        }

        $salesOrder->load(['customer', 'warehouse', 'assignedUsers', 'items.taxes', 'items.product']);
        $settings = SalesOrderSetting::getSettings();

        return Inertia::render('SalesOrder/SalesOrders/Print', [
            'salesOrder' => $salesOrder,
            'settings'   => $settings,
            'autoPrint'  => true,
        ]);
    }

    // ─── Convert from Quotation ──────────────────────────────────────────────

    public function convertFromQuotation(Request $request)
    {
        if (!Auth::user()->can('convert-quotation-to-sales-order')) {
            return back()->with('error', __('Permission denied'));
        }

        $request->validate(['quotation_id' => 'required|integer']);

        if (!class_exists(\Automas\Quotation\Models\SalesQuotation::class)) {
            return back()->with('error', __('Quotation module is not active.'));
        }

        $quotation = \Automas\Quotation\Models\SalesQuotation::where('created_by', creatorId())
            ->findOrFail($request->quotation_id);

        if ($quotation->sales_order_id) {
            return back()->with('error', __('This quotation has already been converted to a Sales Order.'));
        }

        $salesOrder = DB::transaction(function () use ($quotation) {
            $items = $quotation->items()->with('taxes')->get();
            $totals = $this->calculateTotals($items->map(fn($i) => [
                'quantity'            => $i->quantity,
                'unit_price'          => $i->unit_price,
                'discount_percentage' => $i->discount_percentage ?? 0,
                'tax_percentage'      => $i->tax_percentage ?? 0,
                'taxes'               => $i->taxes->map(fn($t) => ['tax_name' => $t->tax_name, 'tax_rate' => $t->tax_rate])->toArray(),
            ])->toArray());

            $salesOrder = SalesOrder::create([
                'name'                   => $quotation->quotation_number ?? 'From Quotation',
                'quote_id'               => $quotation->id,
                'status'                 => SalesOrder::STATUS_DRAFT,
                'delivery_status'        => SalesOrder::DELIVERY_STATUS_PENDING,
                'customer_id'            => $quotation->customer_id,
                'warehouse_id'           => $quotation->warehouse_id,
                'order_date'             => now()->toDateString(),
                'billing_address'        => $quotation->customer_address ?? null,
                'notes'                  => $quotation->notes ?? null,
                'subtotal'               => $totals['subtotal'],
                'tax_amount'             => $totals['tax_amount'],
                'discount_amount'        => $totals['discount_amount'],
                'total_amount'           => $totals['total_amount'],
                'creator_id'             => Auth::id(),
                'created_by'             => creatorId(),
            ]);

            foreach ($items as $item) {
                $newItem = SalesOrderItem::create([
                    'order_id'            => $salesOrder->id,
                    'product_id'          => $item->product_id,
                    'quantity'            => $item->quantity,
                    'unit_price'          => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage ?? 0,
                    'tax_percentage'      => $item->tax_percentage ?? 0,
                    'unit'                => $item->unit ?? null,
                    'description'         => $item->description ?? null,
                    'creator_id'          => Auth::id(),
                    'created_by'          => creatorId(),
                ]);
                foreach ($item->taxes as $tax) {
                    SalesOrderItemTax::create([
                        'item_id'  => $newItem->id,
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->tax_rate,
                    ]);
                }
            }

            // Mark quotation as converted
            $quotation->update(['sales_order_id' => $salesOrder->id]);

            return $salesOrder;
        });

        return redirect()
            ->route('salesorder.orders.show', $salesOrder)
            ->with('success', __('Quotation converted to Sales Order successfully.'));
    }

    // ─── Convert to Sales Invoice ─────────────────────────────────────────────

    public function convertToSalesInvoice(SalesOrder $salesOrder)
    {
        if (!Auth::user()->can('convert-sales-orders') && !Auth::user()->can('create-sales-invoices') && !Auth::user()->can('create-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        if ($salesOrder->is_invoiced) {
            return back()->with('error', __('This Sales Order has already been converted to an invoice.'));
        }

        if (!class_exists(\App\Models\SalesInvoice::class)) {
            return back()->with('error', __('Sales Invoice module is not available.'));
        }

        $salesOrder->load(['customer', 'items.taxes', 'warehouse']);

        try {
            $invoice = DB::transaction(function () use ($salesOrder) {
                $customer = $salesOrder->customer;

                $invoice = new \App\Models\SalesInvoice();
                $invoice->invoice_date     = now()->toDateString();
                $invoice->due_date         = $salesOrder->expected_delivery_date
                    ? $salesOrder->expected_delivery_date->toDateString()
                    : now()->addDays(30)->toDateString();
                $invoice->customer_id      = $salesOrder->customer_id;
                $invoice->customer_name    = $customer?->name;
                $invoice->customer_email   = $customer?->email;
                $invoice->customer_phone   = $customer?->mobile_no ?? $customer?->phone;
                $invoice->customer_address = $salesOrder->billing_address;
                $invoice->warehouse_id     = $salesOrder->warehouse_id ?? 1;
                $invoice->type             = 'product';
                $invoice->notes            = $salesOrder->notes;
                $invoice->subtotal         = $salesOrder->subtotal ?? 0;
                $invoice->tax_amount       = $salesOrder->tax_amount ?? 0;
                $invoice->discount_amount  = $salesOrder->discount_amount ?? 0;
                $invoice->total_amount     = $salesOrder->total_amount ?? 0;
                $invoice->paid_amount      = 0;
                $invoice->balance_amount   = $salesOrder->total_amount ?? 0;
                $invoice->status           = 'draft';
                $invoice->creator_id       = Auth::id();
                $invoice->created_by       = creatorId();
                $invoice->save();

                foreach ($salesOrder->items as $item) {
                    $invoiceItem = new \App\Models\SalesInvoiceItem();
                    $invoiceItem->invoice_id          = $invoice->id;
                    $invoiceItem->product_id          = $item->product_id;
                    $invoiceItem->description         = $item->description;
                    $invoiceItem->product_type        = 'product';
                    $invoiceItem->quantity            = $item->quantity;
                    $invoiceItem->unit_price          = $item->unit_price;
                    $invoiceItem->discount_percentage = $item->discount_percentage ?? 0;
                    $invoiceItem->tax_percentage      = $item->tax_percentage ?? 0;
                    $invoiceItem->save();

                    if (!empty($item->taxes)) {
                        foreach ($item->taxes as $tax) {
                            $invoiceTax = new \App\Models\SalesInvoiceItemTax();
                            $invoiceTax->item_id  = $invoiceItem->id;
                            $invoiceTax->tax_name = $tax->tax_name;
                            $invoiceTax->tax_rate = $tax->tax_rate ?? 0;
                            $invoiceTax->save();
                        }
                    }
                }

                $salesOrder->update([
                    'is_invoiced' => true,
                    'invoice_id'  => $invoice->id,
                ]);

                return $invoice;
            });

            if (\Route::has('sales-invoices.show')) {
                return redirect()->route('sales-invoices.show', $invoice->id)
                    ->with('success', __('Sales Order converted to invoice successfully.'));
            }

            return back()->with('success', __('Sales Order converted to invoice successfully.'));
        } catch (\Throwable $th) {
            return back()->with('error', __('Failed to convert Sales Order to invoice: ') . $th->getMessage());
        }
    }

    // ─── AJAX Helpers ────────────────────────────────────────────────────────

    public function getCustomerDetails(int $customerId)
    {
        if (!Auth::user()->can('create-sales-orders') && !Auth::user()->can('edit-sales-orders')) {
            return response()->json(['error' => 'Permission denied'], 403);
        }

        $customer = User::where('id', $customerId)
            ->where(fn($q) => $q->where('created_by', creatorId())->orWhere('id', $customerId))
            ->where('type', 'client')
            ->first();

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        // Try Account addon customer details
        $details = null;
        if (class_exists(\Automas\Account\Models\Customer::class)) {
            $details = \Automas\Account\Models\Customer::where('user_id', $customerId)
                ->where('created_by', creatorId())
                ->first();
        }

        return response()->json([
            'customer' => [
                'id'               => $customer->id,
                'name'             => $customer->name,
                'email'            => $customer->email,
                'mobile_no'        => $customer->mobile_no ?? ($details?->contact_person_mobile),
                'billing_address'  => $details?->billing_address ?? null,
                'shipping_address' => $details?->shipping_address ?? null,
            ],
        ]);
    }

    public function getWarehouseProducts(Request $request)
    {
        if (!Auth::user()->can('create-sales-orders') && !Auth::user()->can('edit-sales-orders')) {
            return response()->json([], 403);
        }

        $warehouseId = $request->warehouse_id;
        if (!$warehouseId) {
            // Return all active products if no warehouse filter
            if (class_exists(\Automas\ProductService\Models\ProductServiceItem::class)) {
                return response()->json(
                    \Automas\ProductService\Models\ProductServiceItem::select('id', 'name', 'sku', 'sale_price', 'unit', 'type')
                        ->where('is_active', true)
                        ->where('created_by', creatorId())
                        ->get()
                        ->map(fn($p) => [
                            'id'         => $p->id,
                            'name'       => $p->name,
                            'sku'        => $p->sku ?? '',
                            'sale_price' => $p->sale_price ?? 0,
                            'unit'       => $p->unit ?? '',
                        ])
                );
            }
            return response()->json([]);
        }

        if (!class_exists(\Automas\ProductService\Models\ProductServiceItem::class)) {
            return response()->json([]);
        }

        return response()->json(
            \Automas\ProductService\Models\ProductServiceItem::select('id', 'name', 'sku', 'sale_price', 'unit', 'type')
                ->where('is_active', true)
                ->where('created_by', creatorId())
                ->whereHas('warehouseStocks', fn($q) => $q->where('warehouse_id', $warehouseId)->where('quantity', '>', 0))
                ->get()
                ->map(fn($p) => [
                    'id'         => $p->id,
                    'name'       => $p->name,
                    'sku'        => $p->sku ?? '',
                    'sale_price' => $p->sale_price ?? 0,
                    'unit'       => $p->unit ?? '',
                ])
        );
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function resolveCustomer(array $validated, Request $request, ?int $defaultCustomerId = null): ?int
    {
        $customerType = $validated['customer_type'] ?? 'existing';

        if ($customerType === 'new') {
            $user = new User();
            $user->name = $validated['customer_name'];
            $user->email = $validated['customer_email'];
            $user->mobile_no = $validated['customer_phone'] ?? null;
            $user->password = \Illuminate\Support\Facades\Hash::make('12345678');
            $user->type = 'client';
            $user->is_enable_login = true;
            $user->email_verified_at = now();
            $user->creator_id = Auth::id();
            $user->created_by = creatorId();
            $user->save();

            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                try {
                    $role = \Spatie\Permission\Models\Role::where('name', 'client')->first();
                    if ($role) {
                        $user->assignRole($role);
                    }
                } catch (\Throwable $e) {
                }
            }

            if (class_exists(\Automas\Account\Models\Customer::class) && module_is_active('Account')) {
                try {
                    $billing = [
                        'name'           => $validated['customer_name'],
                        'address_line_1' => $validated['billing_address'] ?? ($validated['customer_address'] ?? ''),
                        'address_line_2' => '',
                        'city'           => $validated['billing_city'] ?? '',
                        'state'          => $validated['billing_state'] ?? '',
                        'country'        => $validated['billing_country'] ?? '',
                        'zip_code'       => $validated['billing_postal_code'] ?? '',
                    ];
                    $shipping = [
                        'name'           => $validated['customer_name'],
                        'address_line_1' => $validated['shipping_address'] ?? ($validated['customer_address'] ?? ''),
                        'address_line_2' => '',
                        'city'           => $validated['shipping_city'] ?? '',
                        'state'          => $validated['shipping_state'] ?? '',
                        'country'        => $validated['shipping_country'] ?? '',
                        'zip_code'       => $validated['shipping_postal_code'] ?? '',
                    ];
                    \Automas\Account\Models\Customer::create([
                        'user_id'               => $user->id,
                        'company_name'          => $validated['customer_name'],
                        'contact_person_name'   => $validated['customer_name'],
                        'contact_person_email'  => $validated['customer_email'],
                        'contact_person_mobile' => $validated['customer_phone'] ?? null,
                        'billing_address'       => $billing,
                        'shipping_address'      => $shipping,
                        'same_as_billing'       => false,
                        'creator_id'            => Auth::id(),
                        'created_by'            => creatorId(),
                    ]);
                } catch (\Throwable $e) {
                }
            }

            return $user->id;
        }

        return !empty($validated['customer_id']) ? (int) $validated['customer_id'] : $defaultCustomerId;
    }

    private function canAccess(SalesOrder $salesOrder): bool
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

    private function getCustomers()
    {
        if (class_exists(\App\Services\CustomerService::class)) {
            return app(\App\Services\CustomerService::class)->getCustomers();
        }

        return User::where('type', 'client')
            ->where('created_by', creatorId())
            ->select('id', 'name', 'email', 'mobile_no')
            ->get();
    }

    private function getWorkspaceUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::emp()
            ->where('created_by', creatorId())
            ->select('id', 'name')
            ->get();
    }

    private function getWarehouses(): \Illuminate\Database\Eloquent\Collection
    {
        return Warehouse::where('is_active', true)
            ->where('created_by', creatorId())
            ->select('id', 'name', 'address')
            ->get();
    }

    private function validateWorkspaceUsers(array $userIds): array
    {
        return User::whereIn('id', $userIds)
            ->where('created_by', creatorId())
            ->pluck('id')
            ->toArray();
    }

    private function calculateTotals(array $items): array
    {
        $subtotal      = 0;
        $totalTax      = 0;
        $totalDiscount = 0;

        foreach ($items as $item) {
            $lineTotal     = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
            $discountAmt   = ($lineTotal * ($item['discount_percentage'] ?? 0)) / 100;
            $afterDiscount = $lineTotal - $discountAmt;
            $taxAmt        = ($afterDiscount * ($item['tax_percentage'] ?? 0)) / 100;

            $subtotal      += $lineTotal;
            $totalDiscount += $discountAmt;
            $totalTax      += $taxAmt;
        }

        return [
            'subtotal'        => $subtotal,
            'tax_amount'      => $totalTax,
            'discount_amount' => $totalDiscount,
            'total_amount'    => $subtotal + $totalTax - $totalDiscount,
        ];
    }

    private function createOrderItems(int $orderId, array $items): void
    {
        foreach ($items as $itemData) {
            if (empty($itemData['product_id']) && empty($itemData['quantity'])) {
                continue;
            }

            $item = SalesOrderItem::create([
                'order_id'            => $orderId,
                'product_id'          => $itemData['product_id'] ?? null,
                'quantity'            => $itemData['quantity'],
                'unit_price'          => $itemData['unit_price'],
                'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                'tax_percentage'      => $itemData['tax_percentage'] ?? 0,
                'unit'                => $itemData['unit'] ?? null,
                'description'         => $itemData['description'] ?? null,
                'creator_id'          => Auth::id(),
                'created_by'          => creatorId(),
            ]);

            if (!empty($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $tax) {
                    SalesOrderItemTax::create([
                        'item_id'  => $item->id,
                        'tax_name' => $tax['tax_name'],
                        'tax_rate' => $tax['tax_rate'] ?? $tax['rate'] ?? 0,
                    ]);
                }
            }
        }
    }

    private function getQuoteData(?int $quoteId): ?array
    {
        if (!$quoteId || !class_exists(\Automas\Quotation\Models\SalesQuotation::class)) {
            return null;
        }
        $q = \Automas\Quotation\Models\SalesQuotation::with(['items.taxes'])
            ->where('created_by', creatorId())
            ->find($quoteId);
        if (!$q) return null;

        return [
            'id'               => $q->id,
            'quotation_number' => $q->quotation_number,
            'customer_id'      => $q->customer_id,
            'warehouse_id'     => $q->warehouse_id,
            'notes'            => $q->notes,
            'items'            => $q->items->map(fn($i) => [
                'product_id'          => $i->product_id,
                'quantity'            => $i->quantity,
                'unit_price'          => $i->unit_price,
                'discount_percentage' => $i->discount_percentage ?? 0,
                'tax_percentage'      => $i->tax_percentage ?? 0,
                'taxes'               => $i->taxes->map(fn($t) => ['tax_name' => $t->tax_name, 'tax_rate' => $t->tax_rate])->toArray(),
            ])->toArray(),
        ];
    }
}
