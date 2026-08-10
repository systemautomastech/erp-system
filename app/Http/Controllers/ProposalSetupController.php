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
        // Ensure a fixed Front Page exists for creator with page_type = 'front-page'
        $frontPage = ProposalDefaultPage::where('creator_id', Auth::id())
            ->where('page_type', 'front-page')
            ->first();

        if (!$frontPage) {
            ProposalDefaultPage::create([
                'title' => 'Front Page',
                'content' => '<h1>Sales Proposal Cover Page</h1><p>Welcome to our proposal. Prepared specifically for your business.</p>',
                'page_type' => 'front-page',
                'is_active' => true,
                'sort_order' => 1,
                'creator_id' => Auth::id(),
            ]);
        }

        $defaultPages = ProposalDefaultPage::where('creator_id', Auth::id())
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
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
            'template_color' => $existing?->template_color ?? '#E9591C',
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
            'page_type' => $request->input('page_type', 'general'),
            'content' => $request->input('content', ''),
            'background_image' => $request->input('background_image'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 1),
        ]));

        return redirect()->back()->with('success', __('Default page created successfully.'));
    }

    public function updateDefaultPage(UpdateDefaultPageRequest $request, ProposalDefaultPage $defaultPage)
    {
        $validated = $request->validated();
        $defaultPage->update(array_merge($validated, [
            'page_type' => $request->input('page_type', $defaultPage->page_type),
            'content' => $request->has('content') ? $request->input('content', '') : $defaultPage->content,
            'background_image' => $request->has('background_image') ? $request->input('background_image') : $defaultPage->background_image,
            'sort_order' => $request->input('sort_order', $defaultPage->sort_order),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $defaultPage->is_active,
        ]));

        return redirect()->back()->with('success', __('Default page updated successfully.'));
    }

    public function destroyDefaultPage(ProposalDefaultPage $defaultPage)
    {
        if ($defaultPage->page_type === 'front-page') {
            return redirect()->back()->with('error', __('The Front Page is fixed and cannot be deleted.'));
        }

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
