<?php

namespace Automas\Quotation\Http\Controllers;

use App\Http\Controllers\Controller;
use Automas\Quotation\Http\Requests\QuotationDefaultPage\StoreQuotationDefaultPageRequest;
use Automas\Quotation\Http\Requests\QuotationDefaultPage\UpdateQuotationDefaultPageRequest;
use Automas\Quotation\Models\QuotationDefaultPage;
use Automas\Quotation\Models\QuotationSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuotationDefaultPageController extends Controller
{
    private function getQuotationVariables(): array
    {
        return [
            'App Name' => 'app_name',
            'Company Name' => 'company_name',
            'Company Logo' => 'company_logo',
            'Quotation Logo' => 'quotation_logo',
            'Company Email' => 'company_email',
            'Company Phone' => 'company_phone',
            'Company Address' => 'company_address',
            'Company Website' => 'company_website',
            'User Name' => 'user_name',
            'User Email' => 'user_email',
            'User Phone' => 'user_phone',
            'Quotation Number' => 'quotation_number',
            'Quotation Date' => 'quotation_date',
            'Due Date' => 'due_date',
            'Customer Name' => 'customer_name',
            'Customer Email' => 'customer_email',
            'Customer Phone' => 'customer_phone',
            'Customer Address' => 'customer_address',
            'Total Amount' => 'total_amount',
            'Sub Total' => 'sub_total',
            'Total Tax' => 'total_tax',
            'Total Discount' => 'total_discount',
        ];
    }

    private function authorizePage(QuotationDefaultPage $defaultPage): bool
    {
        $creatorId = creatorId() ?? Auth::id();
        return $defaultPage->created_by == $creatorId && ($defaultPage->creator_id == Auth::id() || $defaultPage->creator_id == $creatorId);
    }

    public function create()
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        $creatorId = creatorId() ?? Auth::id();
        $settings = QuotationSetting::getSettings($creatorId);
        $maxSortOrder = QuotationDefaultPage::where('created_by', $creatorId)->max('sort_order') ?? 0;

        return Inertia::render('Quotation/Settings/DefaultPages/Create', [
            'settings' => $settings,
            'nextSortOrder' => $maxSortOrder + 1,
            'variables' => $this->getQuotationVariables(),
        ]);
    }

    public function store(StoreQuotationDefaultPageRequest $request)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        $creatorId = creatorId() ?? Auth::id();
        $validated = $request->validated();

        QuotationDefaultPage::create(array_merge($validated, [
            'created_by' => $creatorId,
            'creator_id' => Auth::id(),
            'content' => $request->input('content', ''),
            'background_image' => $request->input('background_image'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 1),
        ]));

        return redirect()->route('quotation-setup.index')->with('success', __('Default page created successfully.'));
    }

    public function edit(QuotationDefaultPage $defaultPage)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        if (!$this->authorizePage($defaultPage)) {
            return redirect()->route('quotation-setup.index')->with('error', __('Unauthorized access.'));
        }

        $creatorId = creatorId() ?? Auth::id();
        $settings = QuotationSetting::getSettings($creatorId);

        return Inertia::render('Quotation/Settings/DefaultPages/Edit', [
            'settings' => $settings,
            'defaultPage' => $defaultPage,
            'variables' => $this->getQuotationVariables(),
        ]);
    }

    public function update(UpdateQuotationDefaultPageRequest $request, QuotationDefaultPage $defaultPage)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return redirect()->route('quotations.index')->with('error', __('Permission denied'));
        }

        if (!$this->authorizePage($defaultPage)) {
            return redirect()->route('quotation-setup.index')->with('error', __('Unauthorized access.'));
        }

        $creatorId = creatorId() ?? Auth::id();
        $validated = $request->validated();

        $defaultPage->update(array_merge($validated, [
            'created_by' => $creatorId,
            'creator_id' => Auth::id(),
            'content' => $request->has('content') ? $request->input('content', '') : $defaultPage->content,
            'background_image' => $request->has('background_image') ? $request->input('background_image') : $defaultPage->background_image,
            'sort_order' => $request->input('sort_order', $defaultPage->sort_order),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $defaultPage->is_active,
        ]));

        return redirect()->route('quotation-setup.index')->with('success', __('Default page updated successfully.'));
    }

    public function destroy(QuotationDefaultPage $defaultPage)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return back()->with('error', __('Permission denied'));
        }

        if (!$this->authorizePage($defaultPage)) {
            return redirect()->back()->with('error', __('Unauthorized access.'));
        }

        $defaultPage->delete();

        return redirect()->back()->with('success', __('Default page deleted successfully.'));
    }
}
