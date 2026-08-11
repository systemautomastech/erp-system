<?php

namespace Automas\Pbx\Http\Controllers;

use App\Http\Controllers\Controller;
use Automas\Pbx\Models\PbxExtension;
use Automas\Pbx\Models\PbxSetting;
use Automas\Pbx\Services\PbxCallReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PbxCallReportController extends Controller
{
    public function __construct(
        protected PbxCallReportService $callReportService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Permission
        |--------------------------------------------------------------------------
        */

        $canViewAll = $user->can('view all call logs');
        $canViewOwn = $user->can('view own call logs');

        abort_unless(
            $canViewAll || $canViewOwn,
            403,
            'You do not have permission to view call reports.'
        );

        /*
        |--------------------------------------------------------------------------
        | PBX Setting
        |--------------------------------------------------------------------------
        */

        $setting = PbxSetting::query()
            ->where('created_by', creatorId())
            ->where('is_enabled', true)
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Allowed Extensions
        |--------------------------------------------------------------------------
        |
        | view-all-call-logs:
        |     all company extensions
        |
        | view-own-call-logs:
        |     only extensions assigned to logged-in user
        |
        */

        $extensionsQuery = PbxExtension::query()
            ->with('user:id,name')
            ->where('created_by', creatorId())
            ->where('is_active', true);

        if (!$canViewAll) {
            $extensionsQuery->where(
                'user_id',
                $user->id
            );
        }

        $extensions = $extensionsQuery
            ->orderBy('extension')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $from = $request->input('from');
        $to = $request->input('to');

        $selectedExtension = $request->input(
            'extension'
        );

        $direction = $request->input(
            'direction'
        );

        $status = $request->input(
            'status'
        );

        /*
        |--------------------------------------------------------------------------
        | Prevent users filtering another user's extension
        |--------------------------------------------------------------------------
        */

        if (!empty($selectedExtension)) {
            $allowed = $extensions->contains(
                fn ($item) =>
                    (string) $item->extension ===
                    (string) $selectedExtension
            );

            abort_unless(
                $allowed,
                403,
                'You do not have permission to view this extension.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Extensions sent to Issabel
        |--------------------------------------------------------------------------
        */

        if (!empty($selectedExtension)) {
            $extensionNumbers = [
                (string) $selectedExtension,
            ];
        } else {
            $extensionNumbers = $extensions
                ->pluck('extension')
                ->filter()
                ->map(
                    fn ($extension) =>
                        (string) $extension
                )
                ->values()
                ->all();
        }

        /*
        |--------------------------------------------------------------------------
        | Call Report API
        |--------------------------------------------------------------------------
        */

        $result = $this->callReportService
            ->getCallLogs(
                $setting,
                $extensionNumbers,
                [
                    'from' => $from,
                    'to' => $to,
                    'direction' => $direction,
                    'status' => $status,

                    'page' => max(
                        $request->integer(
                            'page',
                            1
                        ),
                        1
                    ),

                    'per_page' => min(
                        max(
                            $request->integer(
                                'per_page',
                                50
                            ),
                            10
                        ),
                        100
                    ),
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | Extension/User map
        |--------------------------------------------------------------------------
        */

        $extensionMap = $extensions->keyBy(
            fn ($extension) =>
                (string) $extension->extension
        );

        /*
        |--------------------------------------------------------------------------
        | Current Page Calls
        |--------------------------------------------------------------------------
        */

        $calls = collect(
            $result['data'] ?? []
        )
            ->map(
                function (
                    array $call
                ) use ($extensionMap) {

                    $extensionNumber =
                        (string) (
                            $call['extension']
                            ?? ''
                        );

                    $extension =
                        $extensionMap->get(
                            $extensionNumber
                        );

                    $hasRecording =
                        (bool) (
                            $call[
                                'has_recording'
                            ] ?? false
                        );

                    $linkedId =
                        $call['linkedid']
                        ?? null;

                    return [
                        ...$call,

                        'user_id' =>
                            $extension?->user_id,

                        'user_name' =>
                            $extension
                                ?->user
                                ?->name,

                        'recording_url' =>
                            (
                                $hasRecording &&
                                $linkedId &&
                                $extensionNumber
                            )
                                ? route(
                                    'pbx.call-reports.recording',
                                    [
                                        'linkedid' =>
                                            $linkedId,

                                        'extension' =>
                                            $extensionNumber,
                                    ]
                                )
                                : null,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Return
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Pbx/CallReports/Index',
            [
                /*
                 * Current page only.
                 */
                'calls' => $calls,

                /*
                 * Pagination represents ALL matching rows.
                 */
                'pagination' =>
                    $result['pagination']
                    ?? [
                        'page' => 1,
                        'per_page' => 50,
                        'total' => 0,
                        'last_page' => 1,
                    ],

                /*
                 * Summary MUST be returned by Issabel
                 * for all filtered records.
                 */
                'summary' =>
                    $result['summary']
                    ?? [
                        'totalCalls' => 0,
                        'incoming' => 0,
                        'outgoing' => 0,
                        'totalDuration' => 0,
                        'totalTalkTime' => 0,
                        'answered' => 0,
                        'noAnswer' => 0,
                        'rejected' => 0,
                        'otherStatuses' => 0,
                    ],

                /*
                 * User can only see extension choices
                 * he has permission to access.
                 */
                'extensions' =>
                    $extensions
                        ->map(
                            function (
                                $extension
                            ) {
                                return [
                                    'id' =>
                                        $extension->id,

                                    'extension' =>
                                        (string)
                                        $extension->extension,

                                    'user_id' =>
                                        $extension->user_id,

                                    'user_name' =>
                                        $extension
                                            ?->user
                                            ?->name,
                                ];
                            }
                        )
                        ->values(),

                'filters' => [
                    'from' => $from,
                    'to' => $to,

                    'extension' =>
                        $selectedExtension
                        ?: null,

                    'direction' =>
                        $direction
                        ?: null,

                    'status' =>
                        $status
                        ?: null,
                ],

                'permissions' => [
                    'view_all' =>
                        $canViewAll,

                    'view_own' =>
                        $canViewOwn,
                ],
            ]
        );
    }

    public function recording(
        Request $request
    ) {
        $user = Auth::user();

        $canViewAll =
            $user->can(
                'view-all-call-logs'
            );

        $canViewOwn =
            $user->can(
                'view-own-call-logs'
            );

        abort_unless(
            $canViewAll ||
            $canViewOwn,
            403
        );

        $validated =
            $request->validate([
                'linkedid' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'extension' => [
                    'required',
                    'string',
                    'max:20',
                ],
            ]);

        $setting =
            PbxSetting::query()
                ->where(
                    'created_by',
                    creatorId()
                )
                ->where(
                    'is_enabled',
                    true
                )
                ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Recording permission
        |--------------------------------------------------------------------------
        */

        $extensionQuery =
            PbxExtension::query()
                ->where(
                    'created_by',
                    creatorId()
                )
                ->where(
                    'extension',
                    $validated[
                        'extension'
                    ]
                )
                ->where(
                    'is_active',
                    true
                );

        if (!$canViewAll) {
            $extensionQuery->where(
                'user_id',
                $user->id
            );
        }

        $extension =
            $extensionQuery
                ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Issabel Recording API
        |--------------------------------------------------------------------------
        */

        $url =
            rtrim(
                $setting
                    ->call_report_api_url,
                '/'
            )
            . '/recording.php';

        $response =
            Http::withHeaders([
                'X-API-Key' =>
                    $setting
                        ->call_report_api_key,

                'Accept' => '*/*',
            ])
                ->connectTimeout(5)
                ->timeout(60)
                ->get(
                    $url,
                    [
                        'linkedid' =>
                            $validated[
                                'linkedid'
                            ],

                        'extension' =>
                            $extension
                                ->extension,
                    ]
                );

        if ($response->failed()) {
            abort(
                $response->status()
                    === 404
                    ? 404
                    : 502,

                'Recording could not be loaded.'
            );
        }

        $body =
            $response->body();

        $contentType =
            $response->header(
                'Content-Type'
            )
            ?? 'application/octet-stream';

        return response(
            $body,
            200,
            [
                'Content-Type' =>
                    $contentType,

                'Content-Length' =>
                    strlen($body),

                'Content-Disposition' =>
                    'inline',

                'Cache-Control' =>
                    'private, no-store',
            ]
        );
    }
}