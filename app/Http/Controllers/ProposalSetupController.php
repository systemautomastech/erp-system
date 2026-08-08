<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProposalDefaultPage\StoreDefaultPageRequest;
use App\Http\Requests\ProposalGeneralSetting\StoreGeneralSettingRequest;
use App\Http\Requests\ProposalGeneralSetting\UpdateGeneralSettingRequest;
use App\Models\ProposalDefaultPage;
use App\Models\ProposalSetting;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Requests\ProposalDefaultPage\UpdateDefaultPageRequest;

class ProposalSetupController extends Controller
{
    public function generalSettings()
    {
        return $this->renderSetupTab('general-settings');
    }

    public function logoTemplate()
    {
        return $this->renderSetupTab('logo-template');
    }

    public function defaultTerms()
    {
        return $this->renderSetupTab('default-terms');
    }

    public function defaultPages()
    {
        $defaultPages = ProposalDefaultPage::where('creator_id', Auth::id())
            ->orderBy('order')
            ->get();

        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => 'default-pages',
            'settings' => ProposalSetting::where('creator_id', Auth::id())->first(),
            'defaultPages' => $defaultPages,
        ]);
    }

    public function storeGeneralSettings(StoreGeneralSettingRequest $request)
    {
        return $this->saveSettings($request->validated());
    }

    public function updateGeneralSettings(UpdateGeneralSettingRequest $request)
    {
        return $this->saveSettings($request->validated());
    }

    private function saveSettings(array $validatedData)
    {
        $existing = ProposalSetting::where('creator_id', Auth::id())->first();

        $dataToSave = array_merge([
            'proposal_prefix' => $existing?->proposal_prefix ?? 'PRO',
            'proposal_starting_number' => $existing?->proposal_starting_number ?? 1,
            'default_validity_days' => $existing?->default_validity_days ?? 30,
        ], $validatedData);

        ProposalSetting::updateOrCreate(
            ['creator_id' => Auth::id()],
            $dataToSave
        );

        return redirect()->back()->with('success', __('Settings saved successfully.'));
    }

    public function storeDefaultPage(StoreDefaultPageRequest $request)
    {
        $validated = $request->validated();
        ProposalDefaultPage::create(array_merge($validated, [
            'creator_id' => Auth::id(),
            'is_active' => $request->boolean('is_active', true),
            'order' => $request->input('order', 1),
        ]));

        return redirect()->back()->with('success', __('Default page created successfully.'));
    }

    public function updateDefaultPage(UpdateDefaultPageRequest $request, ProposalDefaultPage $defaultPage)
    {
        $validated = $request->validated();
        $defaultPage->update(array_merge($validated, [
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $defaultPage->is_active,
        ]));

        return redirect()->back()->with('success', __('Default page updated successfully.'));
    }

    public function destroyDefaultPage(ProposalDefaultPage $defaultPage)
    {
        $defaultPage->delete();

        return redirect()->back()->with('success', __('Default page deleted successfully.'));
    }

    private function renderSetupTab(string $activeTab)
    {
        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => $activeTab,
            'settings' => ProposalSetting::where('creator_id', Auth::id())->first(),
        ]);
    }
}
