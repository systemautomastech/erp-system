<?php

namespace Automas\Pbx\Http\Controllers;

use Automas\Pbx\Models\PbxSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PbxSettingsController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        if (!Auth::user()->isAbleTo('pbx manage settings')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        $setting = PbxSetting::query()
            ->forCreator($creatorId)
            ->first();

        return Inertia::render('Pbx/Pages/settings/Index', [
            'setting' => $setting,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (!Auth::user()->isAbleTo('pbx manage settings')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        $validated = $this->validateRequest($request);

        $validated['created_by'] = $creatorId;
        $validated['is_enabled'] = $request->boolean('is_enabled');

        /*
         * When editing, an empty password means:
         * keep the existing AMI password.
         */
        if (empty($validated['ami_password'])) {
            unset($validated['ami_password']);
        }

        PbxSetting::query()->updateOrCreate(
            [
                'created_by' => $creatorId,
            ],
            $validated
        );

        return redirect()
            ->route('pbx.settings.index')
            ->with('success', __('PBX settings saved successfully.'));
    }

    public function update(Request $request): RedirectResponse
    {
        return $this->store($request);
    }

    protected function validateRequest(Request $request): array
    {
        return $request->validate([
            'pbx_name' => ['required', 'string', 'max:191'],
            'pbx_host' => ['nullable', 'string', 'max:191'],

            'ami_host' => ['required', 'string', 'max:191'],
            'ami_port' => ['required', 'integer', 'min:1', 'max:65535'],
            'ami_username' => ['required', 'string', 'max:191'],
            'ami_password' => ['nullable', 'string', 'max:500'],

            'sip_domain' => ['required', 'string', 'max:191'],
            'websocket_url' => ['required', 'string', 'max:500'],
            'stun_server' => ['nullable', 'string', 'max:500'],
            'sip_trunk_name' => ['nullable', 'string', 'max:191'],

            'extension_start' => ['required', 'integer', 'min:1'],
            'extension_end' => [
                'required',
                'integer',
                'gte:extension_start',
            ],
            'max_extensions' => ['required', 'integer', 'min:1'],

            'is_enabled' => ['nullable', 'boolean'],
        ]);
    }
}
