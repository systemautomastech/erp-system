<?php

namespace Automas\Quotation\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Services\QuotationServices;
use App\Services\CustomerService;
use App\Services\WarehouseService;
use App\Services\PermissionService;
use Automas\Quotation\Models\QuotationSubject;
use Automas\Quotation\Models\SalesQuotation;
use Automas\Quotation\Http\Requests\SalesQuotation\StoreSalesQuotationRequest;
use Automas\Quotation\Http\Requests\SalesQuotation\UpdateSalesQuotationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Automas\Quotation\Events\AcceptSalesQuotation;
use Automas\Quotation\Events\ConvertSalesQuotation;
use Automas\Quotation\Events\CreateQuotation;
use Automas\Quotation\Events\UpdateQuotation;
use Automas\Quotation\Events\DestroyQuotation;
use Automas\Quotation\Events\RejectSalesQuotation;
use Automas\Quotation\Events\SentSalesQuotation;
use Spatie\LaravelPdf\Facades\Pdf;

class QuotationController extends Controller
{
    public function __construct(
        protected QuotationServices $quotationServices,
        protected CustomerService $customerService,
        protected WarehouseService $warehouseService,
        protected PermissionService $permissionService
    ) {
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$this->permissionService->canAccessQuotation('manage-quotations')) {
            return back()->with('error', __('Permission denied'));
        }

        $query = SalesQuotation::with(['customer', 'author', 'items'])
            ->where(function ($q) use ($user) {
                if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-quotations')) {
                    $q->where('created_by', creatorId());
                } elseif ($user->can('manage-own-quotations')) {
                    $q->where('created_by', creatorId())
                        ->where(function ($sub) use ($user) {
                            $sub->where('creator_id', $user->id)
                                ->orWhere('customer_id', $user->id);
                        });
                    if ($user->type === 'client') {
                        $q->where('status', '!=', 'draft');
                    }
                } else {
                    $q->whereRaw('1 = 0');
                }
            });

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_range')) {
            $dates = explode(' - ', $request->date_range);
            if (count($dates) === 2) {
                $query->whereBetween('quotation_date', [$dates[0], $dates[1]]);
            }
        }

        $stats = $this->quotationServices->getQuotationStatistics($query);

        $filtered = clone $query;
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $filtered->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected']);
            } else {
                $filtered->where('status', $request->status);
            }
        }

        $sortFields = ['quotation_number', 'quotation_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
        $sort = in_array($request->input('sort'), $sortFields) ? $request->input('sort') : 'created_at';
        $direction = $request->input('direction', 'desc');

        $quotations = $filtered->orderBy($sort, $direction)->paginate($request->input('per_page', 10));
        $customers = $this->customerService->getCustomers(['id', 'name', 'email']);

        $boardData = null;
        if ($request->input('view', 'board') !== 'list') {
            $boardData = [];
            foreach (['draft', 'sent', 'accepted', 'rejected'] as $status) {
                $statusQuery = (clone $query)->where('status', $status);
                if ($status === 'accepted') {
                    $statusQuery->where('converted_to_invoice', false);
                }
                $boardData[$status] = $statusQuery->orderBy('created_at', 'desc')->limit(8)->get();
            }
        }

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();
        $isSalesOrderActive = class_exists(\Automas\SalesOrder\Models\SalesOrder::class) && module_is_active('SalesOrder', $creatorId);
        $users = User::where('created_by', $creatorId)->emp()->select('id', 'name', 'email')->get();
        $userGroups = \App\Models\UserGroup::where('created_by', $creatorId)->active()->select('id', 'name')->get();

        return Inertia::render('Quotation/Quotations/Index', [
            'quotations'         => $quotations,
            'customers'          => $customers,
            'users'              => $users,
            'userGroups'         => $userGroups,
            'isSalesOrderActive' => $isSalesOrderActive,
            'stats'              => $stats,
            'boardData'          => $boardData,
            'filters'            => $request->only(['customer_id', 'status', 'search', 'date_range'])
        ]);
    }

    public function create()
    {
        if (!$this->permissionService->canAccessQuotation('create-quotations')) {
            return back()->with('error', __('Permission denied'));
        }

        $customers = $this->customerService->getCustomers();
        $warehouses = $this->warehouseService->getActiveWarehouses();
        $defaultPages = $this->quotationServices->getActiveDefaultPages(Auth::id());
        $settings = $this->quotationServices->getQuotationSetting();
        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();
        $subjects = QuotationSubject::where('created_by', $creatorId)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Quotation/Quotations/Create', [
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'subjects' => $subjects,
            'defaultTerms' => $settings['default_terms'] ?? null,
            'quotationSetting' => $settings,
        ]);
    }

    public function store(StoreSalesQuotationRequest $request)
    {
        if (!$this->permissionService->canAccessQuotation('create-quotations')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        try {
            $data = $request->validated();
            $quotation = $this->quotationServices->createQuotation($data);
            CreateQuotation::dispatch($request, $quotation);

            return redirect()->route('quotations.index')
                ->with('success', __('The quotation has been created successfully.'));
        } catch (\Throwable $th) {
            return back()
                ->with('error', __('Failed to create quotation: ') . $th->getMessage());
        }
    }

    public function show(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('view-quotations', $quotation)) {
            return redirect()->route('quotations.index')
                ->with('error', __('Permission denied'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();
        $isSalesOrderActive = class_exists(\Automas\SalesOrder\Models\SalesOrder::class) && module_is_active('SalesOrder', $creatorId);
        $customers = $this->customerService->getCustomers(['id', 'name', 'email']);
        $users = User::where('created_by', $creatorId)->emp()->select('id', 'name', 'email')->get();
        $userGroups = \App\Models\UserGroup::where('created_by', $creatorId)->active()->select('id', 'name')->get();

        return Inertia::render('Quotation/Quotations/View', [
            'quotation'          => $quotation,
            'isSalesOrderActive' => $isSalesOrderActive,
            'customers'          => $customers,
            'users'              => $users,
            'userGroups'         => $userGroups,
        ]);
    }

    public function edit(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('edit-quotations', $quotation)) {
            return redirect()->route('quotations.index')
                ->with('error', __('Permission denied'));
        }

        if ($quotation->status === 'accepted' || $quotation->converted_to_invoice) {
            return redirect()->route('quotations.index')
                ->with('error', __('Cannot edit an accepted or converted quotation.'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());

        $customers = $this->customerService->getCustomers();
        $warehouses = $this->warehouseService->getActiveWarehouses();
        $settings = $this->quotationServices->getQuotationSetting();
        $defaultPages = $this->quotationServices->getActiveDefaultPages(Auth::id());
        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();
        $subjects = \Automas\Quotation\Models\QuotationSubject::where('created_by', $creatorId)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Quotation/Quotations/Edit', [
            'quotation' => $quotation,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'subjects' => $subjects,
            'quotationSetting' => $settings,
        ]);
    }

    public function update(UpdateSalesQuotationRequest $request, SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('edit-quotations', $quotation)) {
            return redirect()->route('quotations.index')
                ->with('error', __('Permission denied'));
        }

        if ($quotation->status === 'accepted' || $quotation->converted_to_invoice) {
            return redirect()->route('quotations.index')
                ->with('error', __('Cannot update an accepted or converted quotation.'));
        }

        try {
            $this->quotationServices->updateQuotation($quotation, $request->validated());
            UpdateQuotation::dispatch($request, $quotation);

            return redirect()->route('quotations.index')
                ->with('success', __('The quotation details are updated successfully.'));

        } catch (\Throwable $th) {
            return back()->with('error', __('Failed to update quotation: ') . $th->getMessage());
        }
    }

    public function destroy(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('delete-quotations', $quotation)) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        if ($quotation->converted_to_invoice) {
            return back()->withErrors(['error' => __('Cannot delete converted quotation.')]);
        }

        DestroyQuotation::dispatch($quotation);
        $quotation->delete();

        return redirect()->route('quotations.index')->with('success', __('The quotation has been deleted.'));
    }

    public function convertToInvoice(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation(['convert-quotations', 'edit-quotations'])) {
            return back()->with('error', __('Permission denied'));
        }

        if ($quotation->status !== 'accepted') {
            return back()->with('error', __('Only accepted quotations can be converted to invoice.'));
        }

        if ($quotation->converted_to_invoice) {
            return back()->with('error', __('Quotation already converted to invoice.'));
        }

        try {
            $invoice = $this->quotationServices->convertToInvoice($quotation);
            ConvertSalesQuotation::dispatch($quotation, $invoice);

            return back()->with('success', __('Quotation converted to invoice successfully.'));
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function sent(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation(['sent-quotations', 'edit-quotations'])) {
            return back()->with('error', __('Permission denied'));
        }

        if ($quotation->status !== 'draft') {
            return back()->with('error', __('Only draft quotations can be sent.'));
        }

        SentSalesQuotation::dispatch($quotation);
        $quotation->update(['status' => 'sent']);

        return back()->with('success', __('Quotation sent successfully.'));
    }

    public function approve(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation(['approve-quotations', 'edit-quotations'])) {
            return back()->with('error', __('Permission denied'));
        }

        if ($quotation->status !== 'sent') {
            return back()->with('error', __('Only sent quotations can be accepted.'));
        }

        AcceptSalesQuotation::dispatch($quotation);
        $quotation->update(['status' => 'accepted']);

        return back()->with('success', __('Quotation accepted successfully.'));
    }

    public function reject(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation(['reject-quotations', 'edit-quotations'])) {
            return back()->with('error', __('Permission denied'));
        }

        if ($quotation->status !== 'sent') {
            return back()->with('error', __('Only sent quotations can be rejected.'));
        }

        RejectSalesQuotation::dispatch($quotation);
        $quotation->update(['status' => 'rejected']);

        return back()->with('success', __('Quotation rejected successfully.'));
    }

    public function print(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('print-quotations', $quotation)) {
            return back()->with('error', __('Permission denied'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());
        $authorId = $quotation->creator_id ?? Auth::id();
        $pages = $this->quotationServices->getActiveDefaultPages($authorId);
        $settings = $this->quotationServices->getQuotationSetting();

        return Inertia::render('Quotation/Quotations/Print', [
            'quotation' => $quotation,
            'defaultPages' => $pages,
            'quotationSetting' => $settings,
        ]);
    }

    public function downloadPdf(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('print-quotations', $quotation)) {
            return back()->with('error', __('Permission denied'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());
        $authorId = $quotation->creator_id ?? Auth::id();
        $pages = $this->quotationServices->getActiveDefaultPages($authorId);
        $settings = $this->quotationServices->getQuotationSetting();

        return Inertia::render('Quotation/Quotations/Print', [
            'quotation' => $quotation,
            'defaultPages' => $pages,
            'quotationSetting' => $settings,
            'autoPrint' => true,
        ]);
    }

    public function warehouseProducts(Request $request)
    {
        if (!$this->permissionService->canAccessQuotation(['create-quotations', 'edit-quotations'])) {
            return response()->json([], 403);
        }

        $warehouseId = $request->warehouse_id ? (int) $request->warehouse_id : null;
        $products = $this->warehouseService->getWarehouseProducts($warehouseId);

        return response()->json($products);
    }

    public function convertToSalesOrder(Request $request, SalesQuotation $quotation)
    {
        if (!Auth::user()->can('convert-quotation-to-sales-order') && !Auth::user()->can('edit-quotations') && !Auth::user()->can('create-sales-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        if ($quotation->status !== 'accepted') {
            return back()->with('error', __('Only accepted quotations can be converted to a Sales Order.'));
        }

        if ($quotation->sales_order_id) {
            return back()->with('error', __('This quotation has already been converted to a Sales Order.'));
        }

        if (!class_exists(\Automas\SalesOrder\Models\SalesOrder::class)) {
            return back()->with('error', __('Sales Order module is not active.'));
        }

        $quotation->load(['items.taxes', 'customer']);

        try {
            $salesOrder = DB::transaction(function () use ($quotation, $request) {
                // 1. Resolve Customer (Existing or New)
                $customerId = $quotation->customer_id;
                if ($request->input('customer_type') === 'new' && $request->filled('customer_name')) {
                    $existingUser = User::where('email', $request->input('customer_email'))
                        ->where('created_by', creatorId())
                        ->first();
                    if ($existingUser) {
                        $customerId = $existingUser->id;
                    } else {
                        $newCustUser = User::create([
                            'name'       => $request->input('customer_name'),
                            'email'      => $request->input('customer_email') ?: 'customer_' . time() . '@automas.com',
                            'mobile_no'  => $request->input('customer_phone') ?? null,
                            'type'       => 'client',
                            'password'   => Hash::make('12345678'),
                            'created_by' => creatorId(),
                        ]);
                        $customerId = $newCustUser->id;
                    }
                } elseif ($request->input('customer_type') === 'existing' && $request->filled('customer_id')) {
                    $customerId = (int) $request->input('customer_id');
                }

                // 2. Calculate Item Totals
                $subtotal      = 0;
                $totalTax      = 0;
                $totalDiscount = 0;

                foreach ($quotation->items as $item) {
                    $lineTotal     = $item->quantity * $item->unit_price;
                    $discountAmt   = ($lineTotal * ($item->discount_percentage ?? 0)) / 100;
                    $afterDiscount = $lineTotal - $discountAmt;
                    $taxAmt        = ($afterDiscount * ($item->tax_percentage ?? 0)) / 100;

                    $subtotal      += $lineTotal;
                    $totalDiscount += $discountAmt;
                    $totalTax      += $taxAmt;
                }

                // 3. Determine Assignment
                $assignedGroupId = null;
                $assignmentStatus = \Automas\SalesOrder\Models\SalesOrder::ASSIGNMENT_UNASSIGNED;
                if ($request->filled('assigned_group_id')) {
                    $assignedGroupId = (int) $request->input('assigned_group_id');
                    $assignmentStatus = \Automas\SalesOrder\Models\SalesOrder::ASSIGNMENT_GROUP_ASSIGNED;
                }

                // 4. Create Sales Order
                $salesOrder = \Automas\SalesOrder\Models\SalesOrder::create([
                    'name'                   => $quotation->subject ?: ($quotation->quotation_number ?? 'Quotation Conversion'),
                    'quote_id'               => $quotation->id,
                    'status'                 => \Automas\SalesOrder\Models\SalesOrder::STATUS_CONFIRMED,
                    'delivery_status'        => \Automas\SalesOrder\Models\SalesOrder::DELIVERY_STATUS_PENDING,
                    'assignment_status'      => $assignmentStatus,
                    'assigned_group_id'      => $assignedGroupId,
                    'customer_id'            => $customerId,
                    'warehouse_id'           => $quotation->warehouse_id,
                    'order_date'             => now()->toDateString(),
                    'billing_address'        => $quotation->customer_address,
                    'notes'                  => $quotation->notes,
                    'subtotal'               => $subtotal,
                    'tax_amount'             => $totalTax,
                    'discount_amount'        => $totalDiscount,
                    'total_amount'           => $subtotal + $totalTax - $totalDiscount,
                    'creator_id'             => Auth::id(),
                    'created_by'             => creatorId(),
                ]);

                // 5. Create Order Items & Item Taxes
                foreach ($quotation->items as $item) {
                    $orderItem = \Automas\SalesOrder\Models\SalesOrderItem::create([
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

                    if (!empty($item->taxes)) {
                        foreach ($item->taxes as $tax) {
                            \Automas\SalesOrder\Models\SalesOrderItemTax::create([
                                'item_id'  => $orderItem->id,
                                'tax_name' => $tax->tax_name ?? 'Tax',
                                'tax_rate' => $tax->tax_rate ?? 0,
                            ]);
                        }
                    }
                }

                // 6. Assign Users if provided
                if ($request->has('assigned_user_ids') && is_array($request->input('assigned_user_ids'))) {
                    $salesOrder->assignedUsers()->sync($request->input('assigned_user_ids'));
                } elseif ($request->filled('assigned_user_id')) {
                    $salesOrder->assignedUsers()->sync([(int)$request->input('assigned_user_id')]);
                }

                // 7. Link Sales Order to Quotation
                $quotation->update(['sales_order_id' => $salesOrder->id]);

                return $salesOrder;
            });

            if (\Route::has('salesorder.orders.show')) {
                return redirect()->route('salesorder.orders.show', $salesOrder->id)
                    ->with('success', __('Quotation converted to Sales Order successfully.'));
            }

            return back()->with('success', __('Quotation converted to Sales Order successfully.'));
        } catch (\Throwable $th) {
            return back()->with('error', __('Failed to convert quotation to sales order: ') . $th->getMessage());
        }
    }
}

