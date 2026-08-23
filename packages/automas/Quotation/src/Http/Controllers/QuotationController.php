<?php

namespace Automas\Quotation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\QuotationServices;
use App\Services\CustomerService;
use App\Services\WarehouseService;
use App\Services\PermissionService;
use Automas\Quotation\Models\SalesQuotation;
use Automas\Quotation\Http\Requests\SalesQuotation\StoreSalesQuotationRequest;
use Automas\Quotation\Http\Requests\SalesQuotation\UpdateSalesQuotationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $quotation = SalesQuotation::with(['customer', 'items'])
            ->where(function ($query) use ($user) {
                if ($user->type === 'superadmin' || $user->type === 'company' || $user->can('manage-any-quotations')) {
                    $query->where('creator_id', creatorId())
                        ->orWhere('created_by', creatorId());
                } elseif ($user->can('manage-own-quotations')) {
                    $query->where(function ($q) use ($user) {
                        $q->where('creator_id', creatorId())
                            ->orWhere('created_by', creatorId());
                    })->where(function ($q) use ($user) {
                        $q->where('created_by', $user->id)
                            ->orWhere('customer_id', $user->id);
                    });
                    if ($user->type === 'client') {
                        $query->where('status', '!=', 'draft');
                    }
                } else {
                    $query->whereRaw('1 = 0');
                }
            });

        if ($request->filled('customer_id')) {
            $quotation->where('customer_id', $request->customer_id);
        }

        if ($request->filled('search')) {
            $searchKeyword = $request->search;
            $quotation->where(function ($query) use ($searchKeyword) {
                $query->where('quotation_number', 'like', "%{$searchKeyword}%")
                    ->orWhere('customer_name', 'like', "%{$searchKeyword}%");
            });
        }

        if ($request->filled('date_range')) {
            $dates = explode(' - ', $request->date_range);
            if (count($dates) === 2) {
                $quotation->whereBetween('quotation_date', [$dates[0], $dates[1]]);
            }
        }

        // statistics
        $stats = $this->quotationServices->getQuotationStatistics($quotation);

        $filteredQuotations = clone $quotation;
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $filteredQuotations->where('due_date', '<', now())->whereNotIn('status', ['accepted', 'rejected']);
            } else {
                $filteredQuotations->where('status', $request->status);
            }
        }

        $allowedSortFields = ['quotation_number', 'quotation_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'created_at'];
        $sortField = in_array($request->input('sort'), $allowedSortFields) ? $request->input('sort') : 'created_at';
        $sortDirection = $request->input('direction', 'desc');

        $quotations = $filteredQuotations->orderBy($sortField, $sortDirection)->paginate($request->input('per_page', 10));

        $customers = $this->customerService->getCompactCustomers();

        $boardData = null;
        if ($request->input('view', 'board') !== 'list') {
            $boardData = [];
            foreach (['draft', 'sent', 'accepted', 'rejected'] as $boardStatus) {
                $boardStatusQuery = (clone $quotation)->where('status', $boardStatus);
                if ($boardStatus === 'accepted') {
                    $boardStatusQuery->where('converted_to_invoice', false);
                }
                $boardData[$boardStatus] = $boardStatusQuery->orderBy('created_at', 'desc')->limit(8)->get();
            }
        }

        return Inertia::render('Quotation/Quotations/Index', [
            'quotations' => $quotations,
            'customers' => $customers,
            'stats' => $stats,
            'boardData' => $boardData,
            'filters' => $request->only(['customer_id', 'status', 'search', 'date_range'])
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
        $quotationSetting = $this->quotationServices->getQuotationSetting();

        return Inertia::render('Quotation/Quotations/Create', [
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'defaultTerms' => $quotationSetting['default_terms'] ?? null,
            'quotationSetting' => $quotationSetting,
        ]);
    }

    public function store(StoreSalesQuotationRequest $request)
    {
        if (!$this->permissionService->canAccessQuotation('create-quotations')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        try {
            $validatedData = $request->validated();
            $quotation = $this->quotationServices->createQuotation($validatedData);
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

        return Inertia::render('Quotation/Quotations/View', [
            'quotation' => $quotation
        ]);
    }

    public function edit(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('edit-quotations', $quotation)) {
            return redirect()->route('quotations.index')
                ->with('error', __('Permission denied'));
        }

        if ($quotation->converted_to_invoice) {
            return redirect()->route('quotations.index')
                ->with('error', __('Cannot update converted quotation.'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());

        $customers = $this->customerService->getCustomers();
        $warehouses = $this->warehouseService->getActiveWarehouses();
        $quotationSetting = $this->quotationServices->getQuotationSetting();
        $defaultPages = $this->quotationServices->getActiveDefaultPages(Auth::id());

        return Inertia::render('Quotation/Quotations/Edit', [
            'quotation' => $quotation,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'defaultPages' => $defaultPages,
            'quotationSetting' => $quotationSetting,
        ]);
    }

    public function update(UpdateSalesQuotationRequest $request, SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('edit-quotations', $quotation)) {
            return redirect()->route('quotations.index')
                ->with('error', __('Permission denied'));
        }

        if ($quotation->converted_to_invoice) {
            return redirect()->route('quotations.index')
                ->with('error', __('Cannot update converted quotation.'));
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
        $quotationAuthorId = $quotation->created_by ?? Auth::id();
        $defaultPages = $this->quotationServices->getActiveDefaultPages($quotationAuthorId);
        $quotationSetting = $this->quotationServices->getQuotationSetting();

        return view('sales-quotations.print', [
            'quotation' => $quotation,
            'defaultPages' => $defaultPages,
            'quotationSetting' => $quotationSetting,
        ]);
    }

    public function downloadPdf(SalesQuotation $quotation)
    {
        if (!$this->permissionService->canAccessQuotation('print-quotations', $quotation)) {
            return back()->with('error', __('Permission denied'));
        }

        $quotation->load($this->quotationServices->getQuotationRelations());
        $quotationAuthorId = $quotation->created_by ?? Auth::id();
        $defaultPages = $this->quotationServices->getActiveDefaultPages($quotationAuthorId);
        $quotationSetting = $this->quotationServices->getQuotationSetting();

        $companyName = $quotationSetting['company_name'] ?? config('app.name', 'Automas');
        $sanitizedCompanyName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($companyName)));
        $sanitizedQuotationNumber = strtolower(preg_replace('/[^a-z0-9-]+/i', '_', trim($quotation->quotation_number)));
        $filename = "quotation_{$sanitizedCompanyName}_{$sanitizedQuotationNumber}.pdf";

        return Pdf::view('sales-quotations.print', [
            'quotation' => $quotation,
            'defaultPages' => $defaultPages,
            'quotationSetting' => $quotationSetting,
            'isServerPdf' => true,
        ])
            ->format('a4')
            ->margins(0, 0, 0, 0)
            ->download($filename);
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
}
