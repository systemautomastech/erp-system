<?php

namespace Automas\Pbx\Http\Controllers;

use Automas\Pbx\Models\PbxSetting;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class PbxSettingsController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isAbleTo('pbx manage settings')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();
        $setting = PbxSetting::forCreator($creatorId)->first();

        return view('pbx::settings.index', compact('setting'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAbleTo('pbx manage settings')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        $validated = $this->validateRequest($request);
        $validated['created_by'] = $creatorId;
        $validated['created_by'] = creatorId();
        $validated['is_enabled'] = $request->boolean('is_enabled');

        if (empty($validated['ami_password'])) {
            unset($validated['ami_password']);
        }

        PbxSetting::updateOrCreate(
            ['created_by' => $creatorId],
            $validated
        );

        return redirect()->route('pbx.settings.index')->with('success', __('PBX settings saved successfully.'));
    }

    public function update(Request $request)
    {
        return $this->store($request);
    }

    protected function validateRequest(Request $request): array
    {
        $rules = [
            'pbx_name' => 'required|string|max:191',
            'pbx_host' => 'nullable|string|max:191',
            'ami_host' => 'required|string|max:191',
            'ami_port' => 'required|integer|min:1|max:65535',
            'ami_username' => 'required|string|max:191',
            'sip_domain' => 'required|string|max:191',
            'websocket_url' => 'required|string|max:500',
            'stun_server' => 'nullable|string|max:500',
            'sip_trunk_name' => 'nullable|string|max:191',
            'extension_start' => 'required|integer|min:1',
            'extension_end' => 'required|integer|gte:extension_start',
            'max_extensions' => 'required|integer|min:1',
            'is_enabled' => 'nullable|boolean',
        ];

        if ($request->filled('ami_password')) {
            $rules['ami_password'] = 'required|string|max:500';
        } else {
            $rules['ami_password'] = 'nullable|string|max:500';
        }

        return $request->validate($rules);
    }
}
