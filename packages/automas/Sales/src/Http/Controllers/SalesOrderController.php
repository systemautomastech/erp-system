<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\SalesInvoiceItemTax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOrderItem;
use Automas\Sales\Models\SalesOrderItemTax;
use Automas\Sales\Models\SalesShippingProvider;
use Automas\Sales\Http\Requests\StoreSalesOrderRequest;
use Automas\Sales\Http\Requests\UpdateSalesOrderRequest;
use Automas\Sales\Events\CreateSalesOrder;
use Automas\Sales\Events\UpdateSalesOrder;
use Automas\Sales\Events\DestroySalesOrder;
use App\Models\User;
use App\Models\Warehouse;
use Automas\Account\Models\Customer;
use Automas\ProductService\Models\ProductServiceItem;
use App\Models\EmailTemplate;


class SalesOrderController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-orders')) {
            $salesOrders = SalesOrder::with(['account', 'assignUser', 'items', 'quote'])
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
                })
                ->when(request('name'), fn($q) => $q->where(function ($query) {
                    $searchTerm = request('name');
                    $query->where('sales_orders.name', 'like', '%' . $searchTerm . '%')
                        ->orWhere('sales_orders.order_number', 'like', '%' . $searchTerm . '%');
                }))

                ->when(request('status'), fn($q) => $q->where('sales_orders.status', request('status')))
                ->when(request('account'), fn($q) => $q->whereHas('account', fn($sq) => $sq->where('name', 'like', '%' . request('account') . '%')))
                ->when(request('opportunity_id'), fn($q) => $q->where('sales_orders.opportunity_id', request('opportunity_id')))
                ->when(request('quote_id'), fn($q) => $q->where('sales_orders.quote_id', request('quote_id')))
                ->when(request('assign_user_id'), fn($q) => $q->where('sales_orders.assign_user_id', request('assign_user_id')))
                ->when(request('date_from'), fn($q) => $q->whereDate('sales_orders.order_date', '>=', request('date_from')))
                ->when(request('date_to'), fn($q) => $q->whereDate('sales_orders.order_date', '<=', request('date_to')))
                ->when(request('sort'), function ($q) {
                    $sort = request('sort');
                    $direction = request('direction', 'asc');

                    if ($sort === 'account') {
                        return $q->join('sales_accounts', 'sales_orders.account_id', '=', 'sales_accounts.id')
                            ->orderBy('sales_accounts.name', $direction)
                            ->select('sales_orders.*');
                    }

                    // Handle amount sorting with subquery for calculated totals
                    if ($sort === 'amount') {
                        return $q->leftJoin('sales_order_items', 'sales_orders.id', '=', 'sales_order_items.order_id')
                            ->selectRaw('sales_orders.*, COALESCE(SUM(sales_order_items.final_price), 0) as calculated_amount')
                            ->groupBy('sales_orders.id')
                            ->orderBy('calculated_amount', $direction);
                    }

                    return $q->orderBy($sort, $direction);
                }, fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();

            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $quotes = $this->getFilteredQuotes();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();

            // Add calculated total to each sales order
            $salesOrders->getCollection()->transform(function ($order) {
                $order->amount = $order->getTotal();
                return $order;
            });

            return Inertia::render('Sales/SalesOrders/Index', [
                'salesOrders' => $salesOrders,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'quotes' => $quotes,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function create()
    {
        if (Auth::user()->can('create-sales-orders')) {
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();
            $quotes = $this->getFilteredQuotes();

            return Inertia::render('Sales/SalesOrders/Create', [
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'quotes' => $quotes,
                'fromAccount' => null,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function createWithContext(Request $request)
    {
        if (Auth::user()->can('create-sales-orders')) {
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();
            $quotes = $this->getFilteredQuotes();

            return Inertia::render('Sales/SalesOrders/Create', [
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'quotes' => $quotes,
                'fromAccount' => $request->from_account,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesOrderRequest $request)
    {
        if (Auth::user()->can('create-sales-orders')) {
            $validated = $request->validated();
            $totals = $this->calculateTotals($validated['items']);

            $salesOrder = new SalesOrder();
            $salesOrder->order_number = SalesOrder::generateOrderNumber();
            $salesOrder->name = $validated['name'];
            $salesOrder->quote_id = $validated['quote_id'] ?? null;
            $salesOrder->opportunity_id = $validated['opportunity_id'] ?? null;
            $salesOrder->account_id = $validated['account_id'] ?? null;
            $salesOrder->customer_id = $validated['customer_id'];
            $salesOrder->warehouse_id = $validated['warehouse_id'] ?? null;
            $salesOrder->status = $validated['status'];
            $salesOrder->order_date = $validated['order_date'];
            $salesOrder->billing_address = $validated['billing_address'] ?? null;
            $salesOrder->shipping_address = $validated['shipping_address'] ?? null;
            $salesOrder->billing_city = $validated['billing_city'] ?? null;
            $salesOrder->billing_state = $validated['billing_state'] ?? null;
            $salesOrder->shipping_city = $validated['shipping_city'] ?? null;
            $salesOrder->shipping_state = $validated['shipping_state'] ?? null;
            $salesOrder->billing_country = $validated['billing_country'] ?? null;
            $salesOrder->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $salesOrder->shipping_country = $validated['shipping_country'] ?? null;
            $salesOrder->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            $salesOrder->billing_contact_id = $validated['billing_contact_id'] ?? null;
            $salesOrder->shipping_contact_id = $validated['shipping_contact_id'] ?? null;
            $salesOrder->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $salesOrder->assign_user_id = Auth::id();
            } else {
                $salesOrder->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $salesOrder->description = $validated['description'] ?? null;
            $salesOrder->notes = $validated['notes'] ?? null;
            $salesOrder->subtotal = $totals['subtotal'];
            $salesOrder->tax_amount = $totals['tax_amount'];
            $salesOrder->discount_amount = $totals['discount_amount'];
            $salesOrder->total_amount = $totals['total_amount'];
            $salesOrder->creator_id = Auth::id();
            $salesOrder->created_by = creatorId();
            $salesOrder->save();

            $this->createOrderItems($salesOrder->id, $validated['items']);

            CreateSalesOrder::dispatch($request, $salesOrder);

            if(company_setting('Create Sales Order') == 'on') {
                $assignedUser = User::find($salesOrder->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $salesOrder->load(['account', 'opportunity', 'quote']);
                    $emailData = [
                        'order_number' => $salesOrder->order_number ?? '',
                        'order_name' => $salesOrder->name ?? '',
                        'order_amount' => number_format($salesOrder->total_amount, 2) ?? '',
                        'order_date' => $salesOrder->order_date ? $salesOrder->order_date->format('Y-m-d') : '',
                        'order_status' => ucfirst($salesOrder->status) ?? '',
                        'order_account' => $salesOrder->account->name ?? '',
                        'order_opportunity' => $salesOrder->opportunity->name ?? '',
                        'order_quote' => $salesOrder->quote->name ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Create Sales Order', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return redirect()->route('sales.orders.index')
                            ->with('success', __('The sales order has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return redirect()->route('sales.orders.index', $salesOrder)->with('success', __('The sales order has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('view-sales-orders')) {
            if (!$this->canAccessOrder($salesOrder)) {
                return redirect()->route('sales.orders.index')->with('error', __('Access denied'));
            }
            $salesOrder->load(['quote', 'opportunity', 'account', 'customer', 'billingContact', 'shippingContact', 'shippingProvider', 'assignUser']);

            $items = $salesOrder->items()->with('product', 'taxes')->get()->map(function ($item) {
                $lineTotal = $item->quantity * $item->unit_price;
                $discountAmount = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage ?? 0,
                    'discount_amount' => $discountAmount,
                    'tax_percentage' => $item->tax_percentage ?? 0,
                    'product_name' => $item->product->name ?? null,
                    'product_sku' => $item->product->sku ?? null,
                    'product_description' => $item->product->description ?? null,
                    'taxes' => $item->taxes->map(function ($tax) {
                        return [
                            'tax_name' => $tax->tax_name,
                            'tax_rate' => (float) $tax->tax_rate,
                            'rate' => (float) $tax->tax_rate
                        ];
                    })->toArray(),
                    'product_taxes' => $item->taxes->map(function ($tax) {
                        return [
                            'tax_name' => $tax->tax_name,
                            'tax_rate' => (float) $tax->tax_rate,
                            'rate' => (float) $tax->tax_rate
                        ];
                    })->toArray()
                ];
            });

            // Calculate totals using total_amount or final_price for backward compatibility
            $salesOrder->amount = $salesOrder->getTotal();

            return Inertia::render('Sales/SalesOrders/Show', [
                'salesOrder' => $salesOrder,
                'orderItems' => $items,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function edit(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('edit-sales-orders')) {
            if (!$this->canAccessOrder($salesOrder)) {
                return back()->with('error', __('Permission denied'));
            }

            $salesOrder->load(['items.taxes']);

            // Transform items to match frontend structure
            $salesOrder->items->transform(function ($item) {
                $lineTotal = $item->quantity * $item->unit_price;
                $discountAmount = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;
                $afterDiscount = $lineTotal - $discountAmount;
                $taxAmount = ($afterDiscount * ($item->tax_percentage ?? 0)) / 100;

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage ?? 0,
                    'discount_amount' => $discountAmount,
                    'tax_percentage' => $item->tax_percentage ?? 0,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $afterDiscount + $taxAmount,
                    'taxes' => $item->taxes->map(function ($tax) {
                        return [
                            'tax_name' => $tax->tax_name,
                            'tax_rate' => $tax->tax_rate
                        ];
                    })->toArray()
                ];
            });

            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();
            $quotes = $this->getFilteredQuotes();

            return Inertia::render('Sales/SalesOrders/Edit', [
                'order' => $salesOrder,
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'quotes' => $quotes,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder)
    {
        if (Auth::user()->can('edit-sales-orders')) {
            if (!$this->canAccessOrder($salesOrder)) {
                return redirect()->route('sales.orders.index')->with('error', __('Access denied'));
            }

            $validated = $request->validated();
            $totals = $this->calculateTotals($validated['items']);

            // Store old status to check if it changed
            $oldStatus = $salesOrder->status;

            $salesOrder->name = $validated['name'];
            $salesOrder->quote_id = $validated['quote_id'] ?? null;
            $salesOrder->opportunity_id = $validated['opportunity_id'] ?? null;
            $salesOrder->account_id = $validated['account_id'] ?? null;
            $salesOrder->customer_id = $validated['customer_id'] ?? null;
            $salesOrder->warehouse_id = $validated['warehouse_id'] ?? null;
            $salesOrder->status = $validated['status'];
            $salesOrder->order_date = $validated['order_date'];
            $salesOrder->billing_address = $validated['billing_address'] ?? null;
            $salesOrder->shipping_address = $validated['shipping_address'] ?? null;
            $salesOrder->billing_city = $validated['billing_city'] ?? null;
            $salesOrder->billing_state = $validated['billing_state'] ?? null;
            $salesOrder->shipping_city = $validated['shipping_city'] ?? null;
            $salesOrder->shipping_state = $validated['shipping_state'] ?? null;
            $salesOrder->billing_country = $validated['billing_country'] ?? null;
            $salesOrder->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $salesOrder->shipping_country = $validated['shipping_country'] ?? null;
            $salesOrder->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            $salesOrder->billing_contact_id = $validated['billing_contact_id'] ?? null;
            $salesOrder->shipping_contact_id = $validated['shipping_contact_id'] ?? null;
            $salesOrder->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $salesOrder->assign_user_id = Auth::id();
            } else {
                $salesOrder->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $salesOrder->description = $validated['description'] ?? null;
            $salesOrder->notes = $validated['notes'] ?? null;
            $salesOrder->subtotal = $totals['subtotal'];
            $salesOrder->tax_amount = $totals['tax_amount'];
            $salesOrder->discount_amount = $totals['discount_amount'];
            $salesOrder->total_amount = $totals['total_amount'];
            $salesOrder->save();

            $salesOrder->items()->delete();
            $this->createOrderItems($salesOrder->id, $validated['items']);

            UpdateSalesOrder::dispatch($request, $salesOrder);

            // Check if status changed and send email
            if($oldStatus != $salesOrder->status && company_setting('Sales Order Status Update') == 'on') {
                $assignedUser = User::find($salesOrder->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $salesOrder->load(['account', 'opportunity', 'quote']);
                    $emailData = [
                        'order_number' => $salesOrder->order_number ?? '',
                        'order_name' => $salesOrder->name ?? '',
                        'order_amount' => number_format($salesOrder->total_amount, 2) ?? '',
                        'order_date' => $salesOrder->order_date ? $salesOrder->order_date->format('Y-m-d') : '',
                        'order_status' => ucfirst($salesOrder->status) ?? '',
                        'order_old_status' => ucfirst($oldStatus) ?? '',
                        'order_account' => $salesOrder->account->name ?? '',
                        'order_opportunity' => $salesOrder->opportunity->name ?? '',
                        'order_quote' => $salesOrder->quote->name ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Sales Order Status Update', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return redirect()->route('sales.orders.index')
                            ->with('success', __('The sales order details are updated successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return redirect()->route('sales.orders.index', $salesOrder)->with('success', __('The sales order details are updated successfully.'));
        } else {
            return redirect()->route('sales.orders.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('delete-sales-orders')) {
            if (!$this->canAccessOrder($salesOrder)) {
                return redirect()->route('sales.orders.index')->with('error', __('Permission denied'));
            }
            DestroySalesOrder::dispatch($salesOrder);

            $salesOrder->delete();

            return back()->with('success', __('The sales order has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function duplicate(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('create-sales-orders')) {
            $newSalesOrder = $salesOrder->replicate();
            $newSalesOrder->order_number = SalesOrder::generateOrderNumber();
            $newSalesOrder->is_invoiced = false;
            $newSalesOrder->invoice_id = null;
            $newSalesOrder->creator_id = Auth::id();
            $newSalesOrder->created_by = creatorId();
            $newSalesOrder->save();

            // Duplicate items
            foreach ($salesOrder->items as $item) {
                $newItem = $item->replicate();
                $newItem->order_id = $newSalesOrder->id;
                $newItem->creator_id = Auth::id();
                $newItem->created_by = creatorId();
                $newItem->save();

                // Duplicate item taxes
                foreach ($item->taxes as $tax) {
                    $newTax = $tax->replicate();
                    $newTax->item_id = $newItem->id;
                    $newTax->save();
                }
            }

            return back()->with('success', __('The sales order has been duplicated successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }



    public function getOpportunityDetails(SalesOpportunity $opportunity)
    {
        $opportunity->load(['account']);

        return response()->json([
            'account_id' => $opportunity->account_id,
            'account_name' => $opportunity->account?->name,
            'billing_address' => $opportunity->account?->billing_address,
            'shipping_address' => $opportunity->account?->shipping_address,
            'billing_city' => $opportunity->account?->billing_city,
            'billing_state' => $opportunity->account?->billing_state,
            'shipping_city' => $opportunity->account?->shipping_city,
            'shipping_state' => $opportunity->account?->shipping_state,
            'billing_country' => $opportunity->account?->billing_country,
            'billing_postal_code' => $opportunity->account?->billing_postal_code,
            'shipping_country' => $opportunity->account?->shipping_country,
            'shipping_postal_code' => $opportunity->account?->shipping_postal_code,
        ]);
    }

    public function getQuoteDetails(SalesQuote $quote)
    {
        $quote->load(['opportunity.account', 'account', 'items.product', 'items.taxes']);

        $items = $quote->items->map(function ($item) {
            $lineTotal = $item->quantity * $item->unit_price;
            $discountAmount = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;
            $afterDiscount = $lineTotal - $discountAmount;
            $taxAmount = ($afterDiscount * ($item->tax_percentage ?? 0)) / 100;
            
            return [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'discount_percentage' => $item->discount_percentage ?? 0,
                'discount_amount' => $discountAmount,
                'tax_percentage' => $item->tax_percentage ?? 0,
                'tax_amount' => $taxAmount,
                'total_amount' => $afterDiscount + $taxAmount,
                'taxes' => $item->taxes->map(function ($tax) {
                    return [
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->tax_rate,
                        'rate' => $tax->tax_rate
                    ];
                })->toArray()
            ];
        });

        // Get account from opportunity or direct account relationship
        $account = $quote->opportunity?->account ?? $quote->account;

        return response()->json([
            'opportunity_id' => $quote->opportunity_id,
            'opportunity_name' => $quote->opportunity?->name,
            'account_id' => $quote->opportunity?->account_id ?? $quote->account_id,
            'account_name' => $account?->name,
            'warehouse_id' => $quote->warehouse_id,
            'customer_id' => $quote->customer_id,
            'billing_address' => $quote->billing_address ?: $account?->billing_address,
            'shipping_address' => $quote->shipping_address ?: $account?->shipping_address,
            'billing_city' => $quote->billing_city ?: $account?->billing_city,
            'billing_state' => $quote->billing_state ?: $account?->billing_state,
            'shipping_city' => $quote->shipping_city ?: $account?->shipping_city,
            'shipping_state' => $quote->shipping_state ?: $account?->shipping_state,
            'billing_country' => $quote->billing_country ?: $account?->billing_country,
            'billing_postal_code' => $quote->billing_postal_code ?: $account?->billing_postal_code,
            'shipping_country' => $quote->shipping_country ?: $account?->shipping_country,
            'shipping_postal_code' => $quote->shipping_postal_code ?: $account?->shipping_postal_code,
            'billing_contact_id' => $quote->billing_contact_id,
            'shipping_contact_id' => $quote->shipping_contact_id,
            'shipping_provider_id' => $quote->shipping_provider_id,
            'total_amount' => $quote->getTotal(),
            'items' => $items,
        ]);
    }

    private function getFilteredUsers()
    {
        return User::emp()->where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-users'), function ($q) {
                if (Auth::user()->can('manage-own-users')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredAccounts()
    {
        return SalesAccount::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-accounts'), function ($q) {
                if (Auth::user()->can('manage-own-sales-accounts')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function canAccessOrder(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('manage-any-sales-orders')) {
            return $salesOrder->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-orders')) {
            return $salesOrder->creator_id == Auth::id() || $salesOrder->assign_user_id == Auth::id();
        } else {
            return false;
        }
    }

    private function getFilteredOpportunities()
    {
        return SalesOpportunity::with('account:id,name')
            ->where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-opportunities'), function ($q) {
                if (Auth::user()->can('manage-own-sales-opportunities')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name', 'account_id')->get();
    }

    private function getFilteredContacts()
    {
        return SalesContact::where('created_by', creatorId())
            ->where('is_active', true)
            ->when(!Auth::user()->can('manage-any-sales-contacts'), function ($q) {
                if (Auth::user()->can('manage-own-sales-contacts')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name', 'account_id')->get();
    }

    private function getFilteredQuotes()
    {
        return SalesQuote::with('opportunity:id,name,account_id')
            ->where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-quotes'), function ($q) {
                if (Auth::user()->can('manage-own-sales-quotes')) {
                    $q->where(function ($query) {
                        $query->where('creator_id', Auth::id())
                            ->orWhere('assign_user_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name', 'opportunity_id')
            ->get()
            ->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'name' => $quote->name,
                    'opportunity_id' => $quote->opportunity_id,
                    'account_id' => $quote->opportunity?->account_id
                ];
            });
    }

    private function calculateTotals($items)
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;

        foreach ($items as $item) {
            $lineTotal = $item['quantity'] * $item['unit_price'];
            $discountAmount = ($lineTotal * ($item['discount_percentage'] ?? 0)) / 100;
            $afterDiscount = $lineTotal - $discountAmount;
            $taxAmount = ($afterDiscount * ($item['tax_percentage'] ?? 0)) / 100;

            $subtotal += $lineTotal;
            $totalDiscount += $discountAmount;
            $totalTax += $taxAmount;
        }

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $totalTax,
            'discount_amount' => $totalDiscount,
            'total_amount' => $subtotal + $totalTax - $totalDiscount
        ];
    }

    private function createOrderItems($orderId, $items)
    {
        foreach ($items as $itemData) {
            // Skip items without valid product_id
            if (empty($itemData['product_id'])) {
                continue;
            }

            $item = new SalesOrderItem();
            $item->order_id = $orderId;
            $item->product_id = $itemData['product_id'];
            $item->quantity = $itemData['quantity'];
            $item->unit_price = $itemData['unit_price'];
            $item->discount_percentage = $itemData['discount_percentage'] ?? 0;
            $item->tax_percentage = $itemData['tax_percentage'] ?? 0;
            $item->creator_id = Auth::id();
            $item->created_by = creatorId();
            $item->save();

            // Store individual taxes
            if (isset($itemData['taxes']) && is_array($itemData['taxes'])) {
                foreach ($itemData['taxes'] as $tax) {
                    $orderItemTax = new SalesOrderItemTax();
                    $orderItemTax->item_id = $item->id;
                    $orderItemTax->tax_name = $tax['tax_name'];
                    $orderItemTax->tax_rate = $tax['tax_rate'] ?? $tax['rate'] ?? 0;
                    $orderItemTax->save();
                }
            }
        }
    }

    private function getFilteredShippingProviders()
    {
        return SalesShippingProvider::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-shipping-providers'), function ($q) {
                if (Auth::user()->can('manage-own-shipping-providers')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }

    private function getFilteredWarehouses()
    {
        return Warehouse::where('is_active', true)
            ->where('created_by', creatorId())
            ->select('id', 'name', 'address')->get();
    }

    public function getCustomerDetails($customerId)
    {
        if (Auth::user()->can('create-sales-orders') || Auth::user()->can('edit-sales-orders')) {
            $customer = Customer::where('user_id', $customerId)
                ->where('created_by', creatorId())
                ->first();

            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            return response()->json([
                'customer' => [
                    'id' => $customer->id,
                    'company_name' => $customer->company_name,
                    'contact_person_name' => $customer->contact_person_name,
                    'contact_person_email' => $customer->contact_person_email,
                    'billing_address' => $customer->billing_address,
                    'shipping_address' => $customer->shipping_address,
                    'same_as_billing' => $customer->same_as_billing
                ]
            ]);
        } else {
            return response()->json(['error' => 'Permission denied'], 403);
        }
    }

    public function getWarehouseProducts(Request $request)
    {
        if (Auth::user()->can('create-sales-orders') || Auth::user()->can('edit-sales-orders')) {
            $warehouseId = $request->warehouse_id;

            if (!$warehouseId) {
                return response()->json([]);
            }

            $products = ProductServiceItem::select('id', 'name', 'sku', 'sale_price', 'tax_ids', 'unit', 'type')
                ->where('is_active', true)
                ->where('created_by', creatorId())
                ->whereHas('warehouseStocks', function ($q) use ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId)
                        ->where('quantity', '>', 0);
                })
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'sale_price' => $product->sale_price,
                        'unit' => $product->unit,
                        'type' => $product->type,
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

    public function convertToInvoice(SalesOrder $salesOrder)
    {
        if (Auth::user()->can('convert-sales-orders')) {
            if (!$this->canAccessOrder($salesOrder)) {
                return back()->with('error', __('Permission denied'));
            }

            if ($salesOrder->is_invoiced) {
                return back()->with('error', __('Sales order already converted to invoice.'));
            }

            if ($salesOrder->items()->count() < 1) {
                return back()->with('error', __('The sales order cannot be converted without at least one product item.'));
            }

            $salesOrder->load('items.taxes');

            $invoice = new SalesInvoice();
            $invoice->invoice_date = now();
            $invoice->due_date = now()->addDays(30);
            $invoice->customer_id = $salesOrder->customer_id;
            $invoice->warehouse_id = $salesOrder->warehouse_id;
            $invoice->subtotal = $salesOrder->subtotal;
            $invoice->tax_amount = $salesOrder->tax_amount;
            $invoice->discount_amount = $salesOrder->discount_amount;
            $invoice->total_amount = $salesOrder->total_amount;
            $invoice->paid_amount = 0;
            $invoice->balance_amount = $salesOrder->total_amount;
            $invoice->status = 'draft';
            $invoice->notes = $salesOrder->notes;
            $invoice->creator_id = Auth::id();
            $invoice->created_by = creatorId();
            $invoice->save();

            foreach ($salesOrder->items as $item) {
                $invoiceItem = SalesInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage ?? 0,
                    'tax_percentage' => $item->tax_percentage ?? 0,
                ]);

                foreach ($item->taxes as $tax) {
                    SalesInvoiceItemTax::create([
                        'item_id' => $invoiceItem->id,
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->tax_rate,
                    ]);
                }
            }

            $salesOrder->is_invoiced = true;
            $salesOrder->invoice_id = $invoice->id;
            $salesOrder->save();

            return back()->with('success', __('The sales order has been converted to invoice successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }
}
