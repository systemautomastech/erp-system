<?php

namespace Automas\Pbx\Http\Controllers;

use App\Models\User;
use Automas\Pbx\Models\PbxExtension;
use Automas\Pbx\Models\PbxSetting;
use Automas\Pbx\Rules\ValidPbxExtension;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PbxExtensionController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        $setting = PbxSetting::query()
            ->forCreator($creatorId)
            ->first();

        $extensions = PbxExtension::query()
            ->forCreator($creatorId)
            ->with([
                'user:id,name,email',
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Pbx/Pages/extensions/Index', [
            'extensions' => $extensions,
            'setting' => $setting,
            'canCreateExtension' => $setting
                ? $extensions->total() < (int) $setting->max_extensions
                : false,
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        $setting = PbxSetting::query()
            ->forCreator($creatorId)
            ->first();

        if (!$setting) {
            return redirect()
                ->route('pbx.settings.index')
                ->with(
                    'error',
                    __('Configure PBX settings before managing extensions.')
                );
        }

        if (!$this->canAddExtension($creatorId)) {
            return redirect()
                ->route('pbx.extensions.index')
                ->with(
                    'error',
                    __('Maximum extensions limit reached for this workspace.')
                );
        }

        return Inertia::render('Pbx/Pages/extensions/Create', [
            'users' => $this->getAvailableUsers($creatorId),
            'setting' => $setting,
            'assignedUserIds' => $this->getAssignedUserIds($creatorId),
            'assignedExtensions' => $this->getAssignedExtensions($creatorId),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        if (!$this->canAddExtension($creatorId)) {
            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'error',
                    __('Maximum extensions limit reached for this workspace.')
                );
        }

        $validated = $this->validateExtension(
            $request,
            $creatorId
        );

        PbxExtension::query()->create([
            'created_by' => $creatorId,
            'user_id' => $validated['user_id'],
            'extension' => $validated['extension'],
            'sip_secret' => !empty($validated['sip_secret'])
                ? $validated['sip_secret']
                : Str::random(16),
            'caller_id' => $validated['caller_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('pbx.extensions.index')
            ->with(
                'success',
                __('Extension created successfully.')
            );
    }

    public function edit(
        PbxExtension $extension
    ): Response|RedirectResponse {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);

        $creatorId = (int) creatorId();

        $setting = PbxSetting::query()
            ->forCreator($creatorId)
            ->first();

        if (!$setting) {
            return redirect()
                ->route('pbx.settings.index')
                ->with(
                    'error',
                    __('Configure PBX settings before managing extensions.')
                );
        }

        $extension->load([
            'user:id,name,email',
        ]);

        return Inertia::render('Pbx/Pages/extensions/Edit', [
            'extension' => $extension,
            'users' => $this->getAvailableUsers(
                $creatorId,
                $extension->user_id
            ),
            'setting' => $setting,
            'assignedUserIds' => $this->getAssignedUserIds(
                $creatorId,
                $extension->id
            ),
            'assignedExtensions' => $this->getAssignedExtensions(
                $creatorId,
                $extension->id
            ),
        ]);
    }

    public function update(
        Request $request,
        PbxExtension $extension
    ): RedirectResponse {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);

        $creatorId = (int) creatorId();

        $validated = $this->validateExtension(
            $request,
            $creatorId,
            $extension->id
        );

        $data = [
            'user_id' => $validated['user_id'],
            'extension' => $validated['extension'],
            'caller_id' => $validated['caller_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (!empty($validated['sip_secret'])) {
            $data['sip_secret'] = $validated['sip_secret'];
        }

        $extension->update($data);

        return redirect()
            ->route('pbx.extensions.index')
            ->with(
                'success',
                __('Extension updated successfully.')
            );
    }

    public function destroy(
        PbxExtension $extension
    ): RedirectResponse {
        if (!Auth::user()->isAbleTo('pbx manage extensions')) {
            return redirect()
                ->back()
                ->with('error', __('Permission denied.'));
        }

        $this->authorizeWorkspace($extension);

        $extension->delete();

        return redirect()
            ->route('pbx.extensions.index')
            ->with(
                'success',
                __('Extension deleted successfully.')
            );
    }

    protected function validateExtension(
        Request $request,
        int $creatorId,
        ?int $ignoreId = null
    ): array {
        return $request->validate([
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where(function ($query) use ($creatorId) {
                        $query
                            ->where('created_by', $creatorId)
                            ->where('status', 'active');
                    }),
                Rule::unique('pbx_extensions', 'user_id')
                    ->where(function ($query) use ($creatorId) {
                        $query->where('created_by', $creatorId);
                    })
                    ->ignore($ignoreId),
            ],

            'extension' => [
                'required',
                'string',
                'max:20',
                new ValidPbxExtension(
                    $creatorId,
                    $ignoreId
                ),
            ],

            'sip_secret' => [
                'nullable',
                'string',
                'min:6',
                'max:100',
            ],

            'caller_id' => [
                'nullable',
                'string',
                'max:50',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);
    }

    protected function canAddExtension(
        int $creatorId
    ): bool {
        $setting = PbxSetting::query()
            ->forCreator($creatorId)
            ->first();

        if (!$setting) {
            return false;
        }

        $extensionCount = PbxExtension::query()
            ->forCreator($creatorId)
            ->count();

        return $extensionCount < (int) $setting->max_extensions;
    }

    protected function authorizeWorkspace(
        PbxExtension $extension
    ): void {
        if (
            (int) $extension->created_by !==
            (int) creatorId()
        ) {
            abort(403, __('Permission denied.'));
        }
    }

    protected function getAvailableUsers(
        int $creatorId,
        ?int $currentUserId = null
    ) {
        $assignedUserIds = PbxExtension::query()
            ->forCreator($creatorId)
            ->when(
                $currentUserId,
                fn($query) => $query->where(
                    'user_id',
                    '!=',
                    $currentUserId
                )
            )
            ->pluck('user_id');

        return User::query()
            ->select([
                'id',
                'name',
                'email',
            ])
            ->where('created_by', $creatorId)
            ->where('status', 'active')
            ->where(function ($query) use (
                $assignedUserIds,
                $currentUserId
            ) {
                $query->whereNotIn('id', $assignedUserIds);

                if ($currentUserId) {
                    $query->orWhere('id', $currentUserId);
                }
            })
            ->orderBy('name')
            ->get();
    }

    protected function getAssignedUserIds(
        int $creatorId,
        ?int $ignoreExtensionId = null
    ): array {
        return PbxExtension::query()
            ->forCreator($creatorId)
            ->when(
                $ignoreExtensionId,
                fn($query) => $query->where(
                    'id',
                    '!=',
                    $ignoreExtensionId
                )
            )
            ->pluck('user_id')
            ->map(fn($id) => (int) $id)
            ->values()
            ->all();
    }

    protected function getAssignedExtensions(
        int $creatorId,
        ?int $ignoreExtensionId = null
    ): array {
        return PbxExtension::query()
            ->forCreator($creatorId)
            ->when(
                $ignoreExtensionId,
                fn($query) => $query->where(
                    'id',
                    '!=',
                    $ignoreExtensionId
                )
            )
            ->pluck('extension')
            ->map(fn($extension) => (string) $extension)
            ->values()
            ->all();
    }
}
