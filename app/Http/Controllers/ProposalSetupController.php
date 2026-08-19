<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProposalDefaultPage\StoreDefaultPageRequest;
use App\Http\Requests\ProposalDefaultPage\UpdateDefaultPageRequest;
use App\Models\ProposalDefaultPage;
use App\Models\ProposalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProposalSetupController extends Controller
{
    public function index()
    {
        $settings = ProposalSetting::getSettings(creatorId());

        $defaultPages = ProposalDefaultPage::with('creatorUser:id,name,email')
            ->where('creator_id', creatorId())
            ->where('created_by', Auth::id())
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('SalesProposalSetup/Index', [
            'settings' => $settings,
            'defaultPages' => $defaultPages,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $settingsData = $request->input('settings', $request->except(['_token', '_method']));

        ProposalSetting::setSettings($settingsData, creatorId());

        return redirect()->back()->with('success', __('Settings saved successfully.'));
    }

    private function getProposalVariables(): array
    {
        return [
            'App Name' => 'app_name',
            'Company Name' => 'company_name',
            'Company Logo' => 'company_logo',
            'Proposal Logo' => 'proposal_logo',
            'Company Email' => 'company_email',
            'Company Phone' => 'company_phone',
            'Company Address' => 'company_address',
            'Company Website' => 'company_website',
            'User Name' => 'user_name',
            'User Email' => 'user_email',
            'User Phone' => 'user_phone',
            'Proposal Number' => 'proposal_number',
            'Proposal Date' => 'proposal_date',
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

    public function createDefaultPage()
    {
        $settings = ProposalSetting::getSettings(creatorId());
        $maxSortOrder = ProposalDefaultPage::where('creator_id', creatorId())->max('sort_order') ?? 0;

        return Inertia::render('SalesProposalSetup/DefaultPages/Create', [
            'settings' => $settings,
            'nextSortOrder' => $maxSortOrder + 1,
            'variables' => $this->getProposalVariables(),
        ]);
    }

    public function storeDefaultPage(StoreDefaultPageRequest $request)
    {
        $validated = $request->validated();
        ProposalDefaultPage::create(array_merge($validated, [
            'creator_id' => creatorId(),
            'created_by' => Auth::id(),
            'page_type' => $request->input('page_type', 'general'),
            'content' => $request->input('content', ''),
            'background_image' => $request->input('background_image'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 1),
        ]));

        return redirect()->route('proposal-setup.index')->with('success', __('Default page created successfully.'));
    }

    private function authorizePage(ProposalDefaultPage $defaultPage): bool
    {
        return $defaultPage->creator_id == creatorId() && $defaultPage->created_by == Auth::id();
    }

    public function editDefaultPage(ProposalDefaultPage $defaultPage)
    {
        if (!$this->authorizePage($defaultPage)) {
            return redirect()->route('proposal-setup.index')->with('error', __('Unauthorized access.'));
        }

        $settings = ProposalSetting::getSettings(creatorId());

        return Inertia::render('SalesProposalSetup/DefaultPages/Edit', [
            'settings' => $settings,
            'defaultPage' => $defaultPage,
            'variables' => $this->getProposalVariables(),
        ]);
    }

    public function updateDefaultPage(UpdateDefaultPageRequest $request, ProposalDefaultPage $defaultPage)
    {
        if (!$this->authorizePage($defaultPage)) {
            return redirect()->route('proposal-setup.index')->with('error', __('Unauthorized access.'));
        }

        $validated = $request->validated();
        $defaultPage->update(array_merge($validated, [
            'creator_id' => creatorId(),
            'created_by' => Auth::id(),
            'page_type' => $request->input('page_type', $defaultPage->page_type),
            'content' => $request->has('content') ? $request->input('content', '') : $defaultPage->content,
            'background_image' => $request->has('background_image') ? $request->input('background_image') : $defaultPage->background_image,
            'sort_order' => $request->input('sort_order', $defaultPage->sort_order),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $defaultPage->is_active,
        ]));

        return redirect()->route('proposal-setup.index')->with('success', __('Default page updated successfully.'));
    }

    public function destroyDefaultPage(ProposalDefaultPage $defaultPage)
    {
        if (!$this->authorizePage($defaultPage)) {
            return redirect()->back()->with('error', __('Unauthorized access.'));
        }

        $defaultPage->delete();

        return redirect()->back()->with('success', __('Default page deleted successfully.'));
    }
}
