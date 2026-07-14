<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesQuote;
use Automas\Sales\Http\Requests\StoreSalesQuoteRequest;
use Automas\Sales\Http\Requests\UpdateSalesQuoteRequest;
use Automas\Sales\Models\SalesQuoteItem;
use Automas\Sales\Models\SalesQuoteItemTax;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesShippingProvider;
use App\Models\User;
use App\Models\Warehouse;
use Automas\Account\Models\Customer;
use Automas\ProductService\Models\ProductServiceItem;
use Automas\Sales\Events\CreateSalesQuote;
use Automas\Sales\Events\UpdateSalesQuote;
use Automas\Sales\Events\DestroySalesQuote;
use Automas\Sales\Models\SalesOrder;
use Automas\Sales\Models\SalesOrderItem;
use Automas\Sales\Models\SalesOrderItemTax;
use App\Models\EmailTemplate;

class SalesQuoteController extends Controller
{
    public function index(Request $request)
    {
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

            // Apply filters
            if ($request->name) {
                $query->where(function ($q) use ($request) {
                    $q->where('sales_quotes.name', 'like', '%' . $request->name . '%')
                        ->orWhere('sales_quotes.quote_number', 'like', '%' . $request->name . '%');
                });
            }
            if ($request->quote_number) {
                $query->where('sales_quotes.quote_number', 'like', '%' . $request->quote_number . '%');
            }
            if ($request->status) {
                if ($request->status === 'expired') {
                    $query->where('expiry_date', '<', now())
                        ->whereIn('status', ['draft', 'sent'])
                        ->where('status', '!=', 'accepted');
                } else {
                    $query->where('sales_quotes.status', $request->status);
                }
            }
            if ($request->account_id) {
                $query->where('sales_quotes.account_id', $request->account_id);
            }
            if ($request->warehouse_id) {
                $query->where('sales_quotes.warehouse_id', $request->warehouse_id);
            }
            if ($request->opportunity_id) {
                $query->where('sales_quotes.opportunity_id', $request->opportunity_id);
            }
            if ($request->assign_user_id) {
                $query->where('sales_quotes.assign_user_id', $request->assign_user_id);
            }
            if ($request->date_range) {
                $dates = explode(' - ', $request->date_range);
                if (count($dates) === 2) {
                    $query->whereBetween('date_quoted', [$dates[0], $dates[1]]);
                }
            }

            // Apply sorting
            $sortField = $request->get('sort', 'created_at');
            $sortDirection = $request->get('direction', 'desc');

            // Validate sort field to prevent SQL injection
            $allowedSortFields = ['quote_number', 'name', 'date_quoted', 'expiry_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
            if (!in_array($sortField, $allowedSortFields) || empty($sortField)) {
                $sortField = 'created_at';
            }

            if ($sortField === 'account.name' || $sortField === 'account') {
                $query->join('sales_accounts', 'sales_quotes.account_id', '=', 'sales_accounts.id')
                    ->orderBy('sales_accounts.name', $sortDirection)
                    ->select('sales_quotes.*');
            } else {
                $query->orderBy($sortField, $sortDirection);
            }

            $perPage = $request->get('per_page', 10);
            $quotes = $query->paginate($perPage);

            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();

            // Add calculated total to each quote
            $quotes->getCollection()->transform(function ($quote) {
                $quote->amount = $quote->getTotal();
                return $quote;
            });

            return Inertia::render('Sales/Quotes/Index', [
                'quotes' => $quotes,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'filters' => $request->only(['name', 'quote_number', 'account_id', 'warehouse_id', 'status', 'opportunity_id', 'assign_user_id', 'date_range'])
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function create(Request $request)
    {
        if (Auth::user()->can('create-sales-quotes')) {
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();

            return Inertia::render('Sales/Quotes/Create', [
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'fromAccount' => null,
                'fromContact' => null,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function createWithContext(Request $request)
    {
        if (Auth::user()->can('create-sales-quotes')) {
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();

            return Inertia::render('Sales/Quotes/Create', [
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
                'fromAccount' => $request->from_account,
                'fromContact' => $request->from_contact,
                'fromOpportunity' => $request->from_opportunity,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesQuoteRequest $request)
    {
        if (Auth::user()->can('create-sales-quotes')) {
            $validated = $request->validated();
            $totals = $this->calculateTotals($validated['items']);

            $quote = new SalesQuote();
            $quote->quote_number = SalesQuote::generateQuoteNumber();
            $quote->name = $validated['name'];
            $quote->opportunity_id = $validated['opportunity_id'] ?? null;
            $quote->account_id = $validated['account_id'] ?? null;
            $quote->customer_id = $validated['customer_id'] ?? null;
            $quote->warehouse_id = $validated['warehouse_id'] ?? null;
            $quote->status = $validated['status'];
            $quote->date_quoted = $validated['date_quoted'];
            $quote->expiry_date = $validated['expiry_date'] ?? null;
            $quote->billing_address = $validated['billing_address'] ?? null;
            $quote->shipping_address = $validated['shipping_address'] ?? null;
            $quote->billing_city = $validated['billing_city'] ?? null;
            $quote->billing_state = $validated['billing_state'] ?? null;
            $quote->shipping_city = $validated['shipping_city'] ?? null;
            $quote->shipping_state = $validated['shipping_state'] ?? null;
            $quote->billing_country = $validated['billing_country'] ?? null;
            $quote->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $quote->shipping_country = $validated['shipping_country'] ?? null;
            $quote->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            $quote->billing_contact_id = $validated['billing_contact_id'] ?? null;
            $quote->shipping_contact_id = $validated['shipping_contact_id'] ?? null;
            $quote->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $quote->assign_user_id = Auth::id();
            } else {
                $quote->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $quote->description = $validated['description'] ?? null;
            $quote->notes = $validated['notes'] ?? null;
            $quote->subtotal = $totals['subtotal'];
            $quote->tax_amount = $totals['tax_amount'];
            $quote->discount_amount = $totals['discount_amount'];
            $quote->total_amount = $totals['total_amount'];
            $quote->creator_id = Auth::id();
            $quote->created_by = creatorId();
            $quote->save();

            $this->createQuoteItems($quote->id, $validated['items']);

            CreateSalesQuote::dispatch($request, $quote);

            if(company_setting('Create Quote') == 'on') {
                $assignedUser = User::find($quote->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $quote->load(['account', 'opportunity']);
                    $emailData = [
                        'quote_number' => $quote->quote_number ?? '',
                        'quote_name' => $quote->name ?? '',
                        'quote_amount' => number_format($quote->total_amount, 2) ?? '',
                        'quote_date' => $quote->date_quoted ? $quote->date_quoted->format('Y-m-d') : '',
                        'quote_expiry_date' => $quote->expiry_date ? $quote->expiry_date->format('Y-m-d') : '',
                        'quote_status' => ucfirst($quote->status) ?? '',
                        'quote_account' => $quote->account->name ?? '',
                        'quote_opportunity' => $quote->opportunity->name ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Create Quote', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return redirect()->route('sales.quotes.index')
                            ->with('success', __('The quote has been created successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return redirect()->route('sales.quotes.index', $quote)->with('success', __('The quote has been created successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function show(SalesQuote $quote)
    {
        if (Auth::user()->can('view-sales-quotes')) {
            if (!$this->canAccessQuote($quote)) {
                return redirect()->route('sales.quotes.index')->with('error', __('Access denied'));
            }
            $quote->load(['opportunity', 'account', 'customer', 'billingContact', 'shippingContact', 'shippingProvider', 'assignUser']);

            $items = $quote->items()->with('product', 'taxes')->get()->map(function ($item) {
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
            $quote->amount = $quote->getTotal();

            return Inertia::render('Sales/Quotes/Show', [
                'quote' => $quote,
                'quoteItems' => $items,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function edit(SalesQuote $quote)
    {
        if (Auth::user()->can('edit-sales-quotes')) {
            if (!$this->canAccessQuote($quote)) {
                return back()->with('error', __('Permission denied'));
            }

            $quote->load(['items.taxes']);
            $customers = User::where('type', 'client')->select('id', 'name', 'email')->where('created_by', creatorId())->get();
            $accounts = $this->getFilteredAccounts();
            $users = $this->getFilteredUsers();
            $opportunities = $this->getFilteredOpportunities();
            $contacts = $this->getFilteredContacts();
            $shippingProviders = $this->getFilteredShippingProviders();
            $warehouses = $this->getFilteredWarehouses();

            return Inertia::render('Sales/Quotes/Edit', [
                'quote' => $quote,
                'customers' => $customers,
                'accounts' => $accounts,
                'users' => $users,
                'opportunities' => $opportunities,
                'contacts' => $contacts,
                'shippingProviders' => $shippingProviders,
                'warehouses' => $warehouses,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesQuoteRequest $request, SalesQuote $quote)
    {
        if (Auth::user()->can('edit-sales-quotes')) {
            if (!$this->canAccessQuote($quote)) {
                return redirect()->route('sales.quotes.index')->with('error', __('Access denied'));
            }

            $validated = $request->validated();
            $totals = $this->calculateTotals($validated['items']);

            // Store old status to check if it changed
            $oldStatus = $quote->status;

            $quote->name = $validated['name'];
            $quote->opportunity_id = $validated['opportunity_id'] ?? null;
            $quote->account_id = $validated['account_id'] ?? null;
            $quote->customer_id = $validated['customer_id'] ?? null;
            $quote->warehouse_id = $validated['warehouse_id'] ?? null;
            $quote->status = $validated['status'];
            $quote->date_quoted = $validated['date_quoted'];
            $quote->expiry_date = $validated['expiry_date'] ?? null;
            $quote->billing_address = $validated['billing_address'] ?? null;
            $quote->shipping_address = $validated['shipping_address'] ?? null;
            $quote->billing_city = $validated['billing_city'] ?? null;
            $quote->billing_state = $validated['billing_state'] ?? null;
            $quote->shipping_city = $validated['shipping_city'] ?? null;
            $quote->shipping_state = $validated['shipping_state'] ?? null;
            $quote->billing_country = $validated['billing_country'] ?? null;
            $quote->billing_postal_code = $validated['billing_postal_code'] ?? null;
            $quote->shipping_country = $validated['shipping_country'] ?? null;
            $quote->shipping_postal_code = $validated['shipping_postal_code'] ?? null;
            $quote->billing_contact_id = $validated['billing_contact_id'] ?? null;
            $quote->shipping_contact_id = $validated['shipping_contact_id'] ?? null;
            $quote->shipping_provider_id = $validated['shipping_provider_id'] ?? null;
            // Auto assign to current user if staff and no user selected, otherwise use provided value or null
            if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                $quote->assign_user_id = Auth::id();
            } else {
                $quote->assign_user_id = $validated['assign_user_id'] ?? null;
            }
            $quote->description = $validated['description'] ?? null;
            $quote->notes = $validated['notes'] ?? null;
            $quote->subtotal = $totals['subtotal'];
            $quote->tax_amount = $totals['tax_amount'];
            $quote->discount_amount = $totals['discount_amount'];
            $quote->total_amount = $totals['total_amount'];
            $quote->save();

            $quote->items()->delete();
            $this->createQuoteItems($quote->id, $validated['items']);

            UpdateSalesQuote::dispatch($request, $quote);

            // Check if status changed and send email
            if($oldStatus != $quote->status && company_setting('Quote Status Update') == 'on') {
                $assignedUser = User::find($quote->assign_user_id);
                if($assignedUser && $assignedUser->id != Auth::id()) {
                    $quote->load(['account', 'opportunity']);
                    $emailData = [
                        'quote_number' => $quote->quote_number ?? '',
                        'quote_name' => $quote->name ?? '',
                        'quote_amount' => number_format($quote->total_amount, 2) ?? '',
                        'quote_date' => $quote->date_quoted ? $quote->date_quoted->format('Y-m-d') : '',
                        'quote_expiry_date' => $quote->expiry_date ? $quote->expiry_date->format('Y-m-d') : '',
                        'quote_status' => ucfirst($quote->status) ?? '',
                        'quote_old_status' => ucfirst($oldStatus) ?? '',
                        'quote_account' => $quote->account->name ?? '',
                        'quote_opportunity' => $quote->opportunity->name ?? '',
                        'assigned_user' => $assignedUser->name ?? '',
                        'created_by' => Auth::user()->name ?? '',
                    ];
                    $message = EmailTemplate::sendEmailTemplate('Quote Status Update', [$assignedUser->email], $emailData);
                    if($message['is_success'] == false && !empty($message['error'])) {
                        return redirect()->route('sales.quotes.index')
                            ->with('success', __('The quote details are updated successfully.'))
                            ->with('error', $message['error']);
                    }
                }
            }

            return redirect()->route('sales.quotes.index', $quote)->with('success', __('The quote details are updated successfully.'));
        } else {
            return redirect()->route('sales.quotes.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesQuote $quote)
    {
        if (Auth::user()->can('delete-sales-quotes')) {
            if (!$this->canAccessQuote($quote)) {
                return back()->with('error', __('Permission denied'));
            }
            DestroySalesQuote::dispatch($quote);

            $quote->delete();

            return back()->with('success', __('The quote has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function duplicate(SalesQuote $quote)
    {
        if (Auth::user()->can('create-sales-quotes')) {
            $newQuote = $quote->replicate();
            $newQuote->quote_number = SalesQuote::generateQuoteNumber();
            $newQuote->is_converted = false;
            $newQuote->creator_id = Auth::id();
            $newQuote->created_by = creatorId();
            $newQuote->save();

            // Duplicate quote items
            foreach ($quote->items as $item) {
                $newItem = $item->replicate();
                $newItem->quote_id = $newQuote->id;
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

            return back()->with('success', __('The quote has been duplicated successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function convertToSalesOrder(SalesQuote $quote)
    {
        if (Auth::user()->can('convert-sales-quotes')) {
            if (!$this->canAccessQuote($quote)) {
                return back()->with('error', __('Permission denied'));
            }

            if ($quote->is_converted) {
                return back()->with('error', __('Quote already converted to sales order.'));
            }
            if ($quote->items()->count() < 1) {
                return back()->with('error', __('The quote cannot be converted without at least one product item. Please add at least one item before convert'));
            }

            $salesOrder = new SalesOrder();
            $salesOrder->name = $quote->name;
            $salesOrder->quote_id = $quote->id;
            $salesOrder->opportunity_id = $quote->opportunity_id;
            $salesOrder->account_id = $quote->account_id;
            $salesOrder->customer_id = $quote->customer_id;
            $salesOrder->warehouse_id = $quote->warehouse_id;
            $salesOrder->order_date = now();
            $salesOrder->status = 'draft';
            $salesOrder->order_number = SalesOrder::generateOrderNumber();
            $salesOrder->assign_user_id = $quote->assign_user_id;
            $salesOrder->billing_address = $quote->billing_address;
            $salesOrder->shipping_address = $quote->shipping_address;
            $salesOrder->billing_city = $quote->billing_city;
            $salesOrder->billing_state = $quote->billing_state;
            $salesOrder->shipping_city = $quote->shipping_city;
            $salesOrder->shipping_state = $quote->shipping_state;
            $salesOrder->billing_country = $quote->billing_country;
            $salesOrder->billing_postal_code = $quote->billing_postal_code;
            $salesOrder->shipping_country = $quote->shipping_country;
            $salesOrder->shipping_postal_code = $quote->shipping_postal_code;
            $salesOrder->billing_contact_id = $quote->billing_contact_id;
            $salesOrder->shipping_contact_id = $quote->shipping_contact_id;
            $salesOrder->shipping_provider_id = $quote->shipping_provider_id;
            $salesOrder->subtotal = $quote->subtotal;
            $salesOrder->tax_amount = $quote->tax_amount;
            $salesOrder->discount_amount = $quote->discount_amount;
            $salesOrder->total_amount = $quote->total_amount;
            $salesOrder->description = $quote->description;
            $salesOrder->notes = $quote->notes;
            $salesOrder->creator_id = Auth::id();
            $salesOrder->created_by = creatorId();
            $salesOrder->save();

            foreach ($quote->items as $item) {
                $orderItem = SalesOrderItem::create([
                    'order_id' => $salesOrder->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_percentage' => $item->discount_percentage ?? 0,
                    'tax_percentage' => $item->tax_percentage ?? 0,
                    'description' => $item->description,
                    'creator_id' => Auth::id(),
                    'created_by' => creatorId(),
                ]);

                foreach ($item->taxes as $tax) {
                    SalesOrderItemTax::create([
                        'item_id' => $orderItem->id,
                        'tax_name' => $tax->tax_name,
                        'tax_rate' => $tax->tax_rate,
                    ]);
                }
            }

            $quote->is_converted = true;
            $quote->converted_salesorder_id = $salesOrder->id;
            $quote->save();

            return back()->with('success', __('The quote has been converted to sales order successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function print(SalesQuote $quote)
    {
        if (Auth::user()->can('print-sales-quotes')) {

            $quote->load(['opportunity', 'account', 'customer', 'billingContact', 'shippingContact', 'shippingProvider', 'assignUser', 'items.product', 'items.taxes', 'warehouse']);

            return Inertia::render('Sales/Quotes/Print', [
                'quote' => $quote
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function getOpportunityDetails($opportunityId)
    {
        $opportunity = SalesOpportunity::with(['account'])
            ->where('id', $opportunityId)
            ->where('created_by', creatorId())
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
            ->first();

        if (!$opportunity) {
            return response()->json(['error' => 'Opportunity not found'], 404);
        }

        return response()->json([
            'opportunity' => $opportunity,
            'account' => $opportunity->account ? [
                'id' => $opportunity->account->id,
                'name' => $opportunity->account->name,
                'billing_address' => $opportunity->account->billing_address,
                'billing_city' => $opportunity->account->billing_city,
                'billing_state' => $opportunity->account->billing_state,
                'billing_country' => $opportunity->account->billing_country,
                'billing_postal_code' => $opportunity->account->billing_postal_code,
                'shipping_address' => $opportunity->account->shipping_address,
                'shipping_city' => $opportunity->account->shipping_city,
                'shipping_state' => $opportunity->account->shipping_state,
                'shipping_country' => $opportunity->account->shipping_country,
                'shipping_postal_code' => $opportunity->account->shipping_postal_code,
            ] : null
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

    private function canAccessQuote(SalesQuote $quote)
    {
        if (Auth::user()->can('manage-any-sales-quotes')) {
            return $quote->created_by == creatorId();
        } elseif (Auth::user()->can('manage-own-sales-quotes')) {
            return $quote->creator_id == Auth::id() || $quote->assign_user_id == Auth::id();
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

    private function createQuoteItems($quoteId, $items)
    {
        foreach ($items as $itemData) {
            // Skip items without valid product_id
            if (empty($itemData['product_id'])) {
                continue;
            }

            $item = new SalesQuoteItem();
            $item->quote_id = $quoteId;
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
                    $quoteItemTax = new SalesQuoteItemTax();
                    $quoteItemTax->item_id = $item->id;
                    $quoteItemTax->tax_name = $tax['tax_name'];
                    $quoteItemTax->tax_rate = $tax['tax_rate'] ?? $tax['rate'] ?? 0;
                    $quoteItemTax->save();
                }
            }
        }
    }

    public function getCustomerDetails($customerId)
    {
        if (Auth::user()->can('create-sales-quotes') || Auth::user()->can('edit-sales-quotes')) {
            $customer = Customer::where('user_id', $customerId)
                ->where('created_by', creatorId())
                ->first();

            if (!$customer) {
                return response()->json(['error' => 'Customer not found'], 404);
            }

            \Log::info('Customer details fetched', [
                'customer_id' => $customer->id,
                'billing_address' => $customer->billing_address,
                'shipping_address' => $customer->shipping_address
            ]);

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
        if (Auth::user()->can('create-sales-quotes') || Auth::user()->can('edit-sales-quotes')) {
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
}
