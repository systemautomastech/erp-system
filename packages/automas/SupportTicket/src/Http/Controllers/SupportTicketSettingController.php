<?php

namespace Automas\SupportTicket\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\SupportTicket\Models\SupportTicketSetting;
use Automas\SupportTicket\Http\Requests\StoreBrandSettingsRequest;
use Automas\SupportTicket\Events\UpdateBrandSettings;

class SupportTicketSettingController extends Controller
{
    public function brandSettings()
    {
        if (Auth::user()->can('manage-support-ticket-brand-settings')) {
            $supportTicketSettings = SupportTicketSetting::where('created_by', creatorId())
                ->pluck('value', 'key')
                ->toArray();

            return Inertia::render('SupportTicket/SystemSetup/BrandSettings/Index', [
                'settings' => $supportTicketSettings
            ]);
        }
        return back()->with('error', __('Permission denied'));
    }

    public function updateBrandSettings(StoreBrandSettingsRequest $request)
    {
        if (Auth::user()->can('edit-support-ticket-brand-settings')) {
            $settings = $request->all();

            if (isset($settings['logo_dark'])) {
                $settings['logo_dark'] = basename($settings['logo_dark']);
            }

            if (isset($settings['favicon'])) {
                $settings['favicon'] = basename($settings['favicon']);
            }

            foreach ($settings as $key => $value) {
                SupportTicketSetting::updateOrCreate(
                    ['key' => $key, 'created_by' => creatorId()],
                    ['value' => $value]
                );
            }

            UpdateBrandSettings::dispatch($request, $settings);

            return redirect()->back()->with('success', __('The brand setting details are saved successfully.'));
        } else {
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }
}
