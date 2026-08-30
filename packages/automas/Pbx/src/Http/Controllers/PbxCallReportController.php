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
        | Permissions
        |--------------------------------------------------------------------------
        */

        $canViewAll = $user->can('view all call logs');
        $canViewOwn = $user->can('view own call logs');

        abort_unless(
            $canViewAll || $canViewOwn,
            403,
            'You do not have permission to view call logs.'
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
        | Accessible Extensions
        |--------------------------------------------------------------------------
        |
        | view all call logs:
        |     All active company extensions.
        |
        | view own call logs:
        |     Only extension(s) assigned to current user.
        |
        */

        $extensionsQuery = PbxExtension::query()
            ->with('user:id,name')
            ->where('created_by', creatorId())
            ->where(function ($q) {
                $q->where('is_active', true)
                    ->orWhere('is_active', 1)
                    ->orWhereNull('is_active');
            });

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

        $search = trim(
            (string) $request->input('search', '')
        );

        $selectedExtension = trim(
            (string) $request->input('extension', '')
        );
        if (strtolower($selectedExtension) === 'all') {
            $selectedExtension = '';
        }

        $direction = trim(
            (string) $request->input('call_direction', $request->input('direction', ''))
        );
        if (strtolower($direction) === 'all') {
            $direction = '';
        }

        $status = trim(
            (string) $request->input('status', '')
        );
        if (strtolower($status) === 'all') {
            $status = '';
        }

        /*
        |--------------------------------------------------------------------------
        | Date Range
        |--------------------------------------------------------------------------
        |
        | Supports:
        |
        | ?date_range=2026-08-01 - 2026-08-12
        |
        | Also supports old parameters:
        |
        | ?from=...
        | ?to=...
        |
        */

        $from = $request->input('from');
        $to = $request->input('to');

        $dateRange = trim(
            (string) $request->input('date_range', '')
        );

        if ($dateRange !== '') {
            $parts = preg_split(
                '/\s+-\s+/',
                $dateRange
            );

            if (
                is_array($parts)
                && count($parts) === 2
            ) {
                $from = trim($parts[0]);
                $to = trim($parts[1]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Selected Extension
        |--------------------------------------------------------------------------
        |
        | Never trust extension coming from query string.
        |
        */

        if ($selectedExtension !== '') {
            $extensionAllowed = $extensions->contains(
                fn($extension) =>
                (string) $extension->extension ===
                    $selectedExtension
            );

            abort_unless(
                $extensionAllowed,
                403,
                'You do not have permission to view this extension.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Extensions Sent To PBX
        |--------------------------------------------------------------------------
        */

        if ($selectedExtension !== '') {
            $extensionNumbers = [
                $selectedExtension,
            ];
        } else {
            $extensionNumbers = $extensions
                ->pluck('extension')
                ->filter()
                ->map(
                    fn($extension) =>
                    (string) $extension
                )
                ->values()
                ->all();
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $page = max(
            $request->integer('page', 1),
            1
        );

        $perPage = min(
            max(
                $request->integer('per_page', 10),
                10
            ),
            100
        );

        /*
        |--------------------------------------------------------------------------
        | Fetch PBX Report
        |--------------------------------------------------------------------------
        */

        $result = $this->callReportService
            ->getCallLogs(
                $setting,
                $extensionNumbers,
                [
                    'search' => $search ?: null,

                    'from' => $from,
                    'to' => $to,

                    'direction' =>
                    $direction ?: null,

                    'status' =>
                    $status ?: null,

                    'page' => $page,
                    'per_page' => $perPage,
                ],
                false
            );

        /*
        |--------------------------------------------------------------------------
        | Extension => ERP User Map
        |--------------------------------------------------------------------------
        */

        $extensionMap = $extensions->keyBy(
            fn($extension) =>
            (string) $extension->extension
        );

        /*
        |--------------------------------------------------------------------------
        | Format Current Page
        |--------------------------------------------------------------------------
        */

        $callRows = collect(
            $result['data'] ?? []
        )
            ->map(
                function (array $call) use (
                    $extensionMap
                ) {
                    $extensionNumber =
                        (string) (
                            $call['extension']
                            ?? ''
                        );

                    $extension =
                        $extensionMap->get(
                            $extensionNumber
                        );

                    $linkedId =
                        $call['linkedid']
                        ?? null;

                    $hasRecording =
                        (bool) (
                            $call['has_recording'] ?? false
                        );

                    return [
                        ...$call,

                        'extension' =>
                        $extensionNumber,

                        'user_id' =>
                        $extension?->user_id,

                        'user_name' =>
                        $extension
                            ?->user
                            ?->name,

                        'recording_url' => null,
                    ];
                }
            )
            ->values()
            ->all();

        /*
        |--------------------------------------------------------------------------
        | Fallback In-Memory Filtering (Safeguard for remote API endpoints)
        |--------------------------------------------------------------------------
        */

        if ($direction !== '') {
            $callRows = array_values(array_filter($callRows, function ($call) use ($direction) {
                return strtolower($call['direction'] ?? '') === strtolower($direction);
            }));
        }

        if ($status !== '') {
            $callRows = array_values(array_filter($callRows, function ($call) use ($status) {
                $rowStatus = strtoupper(trim($call['status'] ?? ''));
                $targetStatus = strtoupper(trim($status));
                if ($targetStatus === 'NO ANSWER' || $targetStatus === 'NOANSWER' || $targetStatus === 'MISSED') {
                    return in_array($rowStatus, ['NO ANSWER', 'NOANSWER', 'MISSED'], true);
                }
                return $rowStatus === $targetStatus;
            }));
        }

        if ($search !== '') {
            $callRows = array_values(array_filter($callRows, function ($call) use ($search) {
                $needle = strtolower($search);
                return str_contains(strtolower((string)($call['number'] ?? '')), $needle)
                    || str_contains(strtolower((string)($call['extension'] ?? '')), $needle)
                    || str_contains(strtolower((string)($call['did'] ?? '')), $needle)
                    || str_contains(strtolower((string)($call['user_name'] ?? '')), $needle);
            }));
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination Information From PBX
        |--------------------------------------------------------------------------
        */

        $remotePagination =
            $result['pagination'] ?? [];

        $currentPage = max(
            (int) (
                $remotePagination['page']
                ?? $page
            ),
            1
        );

        $currentPerPage = max(
            (int) (
                $remotePagination['per_page']
                ?? $perPage
            ),
            1
        );

        $total = max(
            (int) (
                $remotePagination['total']
                ?? 0
            ),
            0
        );

        $lastPage = max(
            (int) (
                $remotePagination['last_page']
                ?? 1
            ),
            1
        );

        /*
        |--------------------------------------------------------------------------
        | WorkDo-Compatible Paginator
        |--------------------------------------------------------------------------
        |
        | We provide both Laravel-style top-level pagination properties and
        | meta so the shared Pagination component has everything it may need.
        |
        */

        $calls = $this->buildPaginatorPayload(
            $callRows,
            $currentPage,
            $currentPerPage,
            $total,
            $lastPage,
            $request
        );

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Pbx/CallReports/Index',
            [
                'calls' => $calls,

                'summary' =>
                $result['summary']
                    ?? $this->emptySummary(),

                'extensions' =>
                $extensions
                    ->map(
                        fn($extension) => [
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
                        ]
                    )
                    ->values(),

                'filters' => [
                    'search' =>
                    $search,

                    'extension' =>
                    $selectedExtension,

                    'call_direction' =>
                    $direction,

                    'status' =>
                    $status,

                    'date_range' =>
                    $from && $to
                        ? "{$from} - {$to}"
                        : '',
                ],

                'callReportPermissions' => [
                    'view_all' =>
                    $canViewAll,

                    'view_own' =>
                    $canViewOwn,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Call Summary & Analytics Dashboard
    |--------------------------------------------------------------------------
    */

    public function summary(Request $request)
    {
        $user = Auth::user();

        $canViewAll = $user->can('view all call logs');
        $canViewOwn = $user->can('view own call logs');

        abort_unless(
            $canViewAll || $canViewOwn,
            403,
            'You do not have permission to view call reports.'
        );

        $setting = PbxSetting::query()
            ->where('created_by', creatorId())
            ->where('is_enabled', true)
            ->firstOrFail();

        $extensionsQuery = PbxExtension::query()
            ->with('user:id,name')
            ->where('created_by', creatorId())
            ->where(function ($q) {
                $q->where('is_active', true)
                    ->orWhere('is_active', 1)
                    ->orWhereNull('is_active');
            });

        if (!$canViewAll) {
            $extensionsQuery->where('user_id', $user->id);
        }

        $extensions = $extensionsQuery
            ->orderBy('extension')
            ->get();

        $selectedExtension = trim((string) $request->input('extension', ''));
        $dateRange = trim((string) $request->input('date_range', ''));
        $from = $request->input('from');
        $to = $request->input('to');
        $period = trim((string) $request->input('period', ''));

        if ($dateRange !== '') {
            $parts = preg_split('/(?:\s+-\s+|\s+to\s+)/i', $dateRange);
            if (is_array($parts) && count($parts) === 2) {
                $from = trim($parts[0]);
                $to = trim($parts[1]);
                $period = 'custom';
            }
        } elseif ($from || $to) {
            $period = 'custom';
            $dateRange = "{$from} - {$to}";
        } elseif ($period === 'this_week') {
            $from = \Illuminate\Support\Carbon::now()->startOfWeek()->format('Y-m-d');
            $to = \Illuminate\Support\Carbon::today()->format('Y-m-d');
            $dateRange = "{$from} - {$to}";
        } elseif ($period === 'this_month') {
            $from = \Illuminate\Support\Carbon::now()->startOfMonth()->format('Y-m-d');
            $to = \Illuminate\Support\Carbon::today()->format('Y-m-d');
            $dateRange = "{$from} - {$to}";
        } elseif ($period === 'all_time') {
            $from = '2000-01-01';
            $to = \Illuminate\Support\Carbon::today()->format('Y-m-d');
            $dateRange = 'All Time';
        } else {
            $period = 'today';
            $from = \Illuminate\Support\Carbon::today()->format('Y-m-d');
            $to = \Illuminate\Support\Carbon::today()->format('Y-m-d');
            $dateRange = "{$from} - {$to}";
        }

        if ($selectedExtension !== '') {
            $extensionAllowed = $extensions->contains(
                fn($extension) => (string) $extension->extension === $selectedExtension
            );

            abort_unless(
                $extensionAllowed,
                403,
                'You do not have permission to view this extension.'
            );

            $extensionNumbers = [$selectedExtension];
        } else {
            $extensionNumbers = $extensions
                ->pluck('extension')
                ->filter()
                ->map(fn($extension) => (string) $extension)
                ->values()
                ->all();
        }

        $result = $this->callReportService->getCallSummary(
            $setting,
            $extensionNumbers,
            [
                'from' => $from,
                'to' => $to,
                'extension' => $selectedExtension,
            ]
        );

        $summary = $result['summary'] ?? $this->callReportService->emptySummary();
        $charts = $this->callReportService->buildChartsDataFromSummary($result, $extensions->loadMissing('user')->all());

        return Inertia::render(
            'Pbx/CallReports/Summary',
            [
                'summary' => $summary,
                'charts' => $charts,
                'extensions' => $extensions
                    ->map(
                        fn($extension) => [
                            'id' => $extension->id,
                            'extension' => (string) $extension->extension,
                            'user_id' => $extension->user_id,
                            'user_name' => $extension?->user?->name,
                        ]
                    )
                    ->values(),
                'filters' => [
                    'extension' => $selectedExtension,
                    'period' => $period,
                    'date_range' => $from && $to ? "{$from} - {$to}" : '',
                ],
                'callReportPermissions' => [
                    'view_all' => $canViewAll,
                    'view_own' => $canViewOwn,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Recording
    |--------------------------------------------------------------------------
    */

    public function recording(Request $request)
    {
        $user = Auth::user();

        $canViewAll =
            $user->can(
                'view all call logs'
            );

        $canViewOwn =
            $user->can(
                'view own call logs'
            );

        abort_unless(
            $canViewAll || $canViewOwn,
            403,
            'You do not have permission to access call recordings.'
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

        /*
        |--------------------------------------------------------------------------
        | PBX Setting
        |--------------------------------------------------------------------------
        */

        $setting = PbxSetting::query()
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
        | Verify Extension Access
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
                $validated['extension']
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
        | Configuration
        |--------------------------------------------------------------------------
        */

        abort_if(
            empty($setting
                ->call_report_api_url),
            500,
            'Call report API URL is not configured.'
        );

        abort_if(
            empty($setting
                ->call_report_api_key),
            500,
            'Call report API key is not configured.'
        );

        /*
        |--------------------------------------------------------------------------
        | Recording API
        |--------------------------------------------------------------------------
        */

        $url = rtrim(
            $setting
                ->call_report_api_url,
            '/'
        ) . '/recording.php';

        $response = Http::withHeaders([
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
                    $validated['linkedid'],

                    'extension' =>
                    $extension->extension,
                ]
            );

        if ($response->failed()) {
            abort(
                $response->status() === 404
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
                'private, no-store, no-cache, must-revalidate',
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | WorkDo Paginator Payload
    |--------------------------------------------------------------------------
    */

    private function buildPaginatorPayload(
        array $data,
        int $page,
        int $perPage,
        int $total,
        int $lastPage,
        Request $request
    ): array {
        $from = $total > 0
            ? (($page - 1) * $perPage) + 1
            : null;

        $to = $total > 0
            ? min(
                $page * $perPage,
                $total
            )
            : null;

        $links = [];

        $links[] = [
            'url' =>
            $page > 1
                ? $this->pageUrl(
                    $request,
                    $page - 1
                )
                : null,

            'label' => '&laquo; Previous',

            'active' => false,
        ];

        /*
         * Keep pagination compact.
         */

        $startPage = max(
            1,
            $page - 2
        );

        $endPage = min(
            $lastPage,
            $page + 2
        );

        if ($startPage > 1) {
            $links[] = [
                'url' =>
                $this->pageUrl(
                    $request,
                    1
                ),

                'label' => '1',

                'active' =>
                $page === 1,
            ];

            if ($startPage > 2) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
        }

        for (
            $number = $startPage;
            $number <= $endPage;
            $number++
        ) {
            $links[] = [
                'url' =>
                $this->pageUrl(
                    $request,
                    $number
                ),

                'label' =>
                (string) $number,

                'active' =>
                $number === $page,
            ];
        }

        if ($endPage < $lastPage) {
            if (
                $endPage
                < $lastPage - 1
            ) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }

            $links[] = [
                'url' =>
                $this->pageUrl(
                    $request,
                    $lastPage
                ),

                'label' =>
                (string) $lastPage,

                'active' =>
                $page === $lastPage,
            ];
        }

        $links[] = [
            'url' =>
            $page < $lastPage
                ? $this->pageUrl(
                    $request,
                    $page + 1
                )
                : null,

            'label' => 'Next &raquo;',

            'active' => false,
        ];

        return [
            'data' => $data,

            'current_page' =>
            $page,

            'first_page_url' =>
            $this->pageUrl(
                $request,
                1
            ),

            'from' => $from,

            'last_page' =>
            $lastPage,

            'last_page_url' =>
            $this->pageUrl(
                $request,
                $lastPage
            ),

            'links' => $links,

            'next_page_url' =>
            $page < $lastPage
                ? $this->pageUrl(
                    $request,
                    $page + 1
                )
                : null,

            'path' =>
            $request->url(),

            'per_page' =>
            $perPage,

            'prev_page_url' =>
            $page > 1
                ? $this->pageUrl(
                    $request,
                    $page - 1
                )
                : null,

            'to' => $to,

            'total' => $total,

            /*
             * Also provide meta for components
             * using API Resource paginator format.
             */
            'meta' => [
                'current_page' =>
                $page,

                'from' =>
                $from,

                'last_page' =>
                $lastPage,

                'links' =>
                $links,

                'path' =>
                $request->url(),

                'per_page' =>
                $perPage,

                'to' =>
                $to,

                'total' =>
                $total,
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Page URL
    |--------------------------------------------------------------------------
    */

    private function pageUrl(
        Request $request,
        int $page
    ): string {
        $query = $request->query();

        $query['page'] = $page;

        return $request->url()
            . '?'
            . http_build_query($query);
    }

    /*
    |--------------------------------------------------------------------------
    | Empty Summary
    |--------------------------------------------------------------------------
    */

    private function emptySummary(): array
    {
        return [
            'totalCalls' => 0,
            'incoming' => 0,
            'outgoing' => 0,
            'totalDuration' => 0,
            'totalTalkTime' => 0,
            'answered' => 0,
            'noAnswer' => 0,
            'rejected' => 0,
            'otherStatuses' => 0,
            'avgDuration' => 0,
            'avgTalkTime' => 0,
            'answerRate' => 0.0,
        ];
    }
}
