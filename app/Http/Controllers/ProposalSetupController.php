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
        $settings = ProposalSetting::getSettings(Auth::id());

        // Ensure fixed Front Page exists for creator
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

        // Ensure fixed Terms & Conditions page exists for creator
        $termsPage = ProposalDefaultPage::where('creator_id', Auth::id())
            ->where(function ($q) {
                $q->where('page_type', 'terms-conditions')
                  ->orWhere('title', 'Terms & Conditions');
            })
            ->first();

        if (!$termsPage) {
            ProposalDefaultPage::create([
                'title' => 'Terms & Conditions',
                'content' => '<h2>Terms & Conditions</h2><p>1. Proposal is valid for 30 days from issuance.<br/>2. Payment terms: 50% deposit upon acceptance, 50% on project completion.</p>',
                'page_type' => 'terms-conditions',
                'is_active' => true,
                'sort_order' => 99,
                'creator_id' => Auth::id(),
            ]);
        }

        $defaultPages = ProposalDefaultPage::where('creator_id', Auth::id())
            ->orderByRaw("CASE WHEN page_type = 'front-page' THEN 0 WHEN page_type = 'terms-conditions' THEN 2 ELSE 1 END")
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

        ProposalSetting::setSettings($settingsData, Auth::id());

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
        if ($defaultPage->page_type === 'front-page' || $defaultPage->page_type === 'terms-conditions') {
            return redirect()->back()->with('error', __('This fixed default page cannot be deleted.'));
        }

        $defaultPage->delete();

        return redirect()->back()->with('success', __('Default page deleted successfully.'));
    }
}
