<?php

namespace Automas\Pbx\Http\Controllers;

use App\Models\User;
use Automas\Lead\Models\Agent;
use Automas\Pbx\DataTables\PbxExtensionDataTable;
use Automas\Pbx\Models\PbxExtension;
use Automas\Pbx\Models\PbxSetting;
use Automas\Pbx\Rules\ValidPbxExtension;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PbxExtensionController extends Controller
{
    public function index(PbxExtensionDataTable $dataTable)
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        return $dataTable->render('pbx::extensions.index');
    }

    public function create()
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();
        $setting = PbxSetting::forCreator($creatorId)->first();

        if (!$setting) {
            return redirect()->route('pbx.settings.index')->with('error', __('Configure PBX settings before managing extensions.'));
        }

        $users = Agent::with('user')->where('created_by', $creatorId)->where('status', 'active')->get()
            ->pluck('user.name', 'user.id');

        $assignedUserIds = PbxExtension::forCreator($creatorId)->pluck('user_id')->toArray();

        $assignedExtensions = PbxExtension::forCreator($creatorId)->pluck('extension')->toArray();

        return view('pbx::extensions.create', compact('users', 'setting', 'assignedUserIds', 'assignedExtensions'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        if (!$this->canAddExtension($creatorId)) {
            return redirect()->back()->withInput()->with('error', __('Maximum extensions limit reached for this workspace.'));
        }

        $validated = $this->validateExtension($request, $creatorId);

        PbxExtension::create([
            'created_by' => $creatorId,
            'user_id' => $validated['user_id'],
            'extension' => $validated['extension'],
            'sip_secret' => $validated['sip_secret'] ?? Str::random(16),
            'caller_id' => $validated['caller_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'created_by' => creatorId(),
        ]);

        return redirect()->route('pbx.extensions.index')->with('success', __('Extension created successfully.'));
    }

    public function edit(PbxExtension $extension)
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);

        $creatorId = (int) creatorId();
        $setting = PbxSetting::forCreator($creatorId)->first();

        $users = Agent::with('user')->where('created_by', $creatorId)->where('status', 'active')->get()
            ->pluck('user.name', 'user.id');


        $assignedUserIds = PbxExtension::forCreator($creatorId)->where('id', '!=', $extension->id)
            ->pluck('user_id')

            ->toArray();
        $assignedExtensions = PbxExtension::forCreator($creatorId)->where('id', '!=', $extension->id)
            ->pluck('extension')
            ->toArray();


        return view('pbx::extensions.edit', compact('extension', 'users', 'setting', 'assignedUserIds', 'assignedExtensions'));
    }

    public function update(Request $request, PbxExtension $extension)
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);

        $creatorId = (int) creatorId();
        $validated = $this->validateExtension($request, $creatorId, $extension->id);

        $extension->update([
            'user_id' => $validated['user_id'],
            'extension' => $validated['extension'],
            'caller_id' => $validated['caller_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        if (!empty($validated['sip_secret'])) {
            $extension->update(['sip_secret' => $validated['sip_secret']]);
        }

        return redirect()->route('pbx.extensions.index')->with('success', __('Extension updated successfully.'));
    }

    public function destroy(PbxExtension $extension)
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);
        $extension->delete();

        return redirect()->route('pbx.extensions.index')->with('success', __('Extension deleted successfully.'));
    }

    protected function validateExtension(Request $request, int $creatorId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'user_id' => [
                'required',
                'integer',
                Rule::unique('pbx_extensions', 'user_id')
                    ->where(fn($query) => $query->where('created_by', $creatorId))
                    ->ignore($ignoreId),
            ],
            'extension' => [
                'required',
                'string',
                'max:20',
                new ValidPbxExtension($creatorId, $ignoreId),
            ],
            'sip_secret' => [$ignoreId ? 'nullable' : 'nullable', 'string', 'min:6', 'max:100'],
            'caller_id' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);
    }

    protected function canAddExtension(int $creatorId): bool
    {
        $setting = PbxSetting::forCreator($creatorId)->first();

        if (!$setting) {
            return false;
        }

        $count = PbxExtension::forCreator($creatorId)->count();

        return $count < $setting->max_extensions;
    }

    protected function authorizeWorkspace(PbxExtension $extension): void
    {
        if ((int) $extension->created_by !== (int) creatorId()) {
            abort(403, __('Permission denied.'));
        }
    }
}
