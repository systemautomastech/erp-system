<?php

namespace Automas\Pbx\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PbxCallReportService
{
    public function getCallLogs(
        object $setting,
        array $extensions,
        array $filters = [],
        bool $includeSummary = false
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Configuration
        |--------------------------------------------------------------------------
        */

        if (
            empty($setting
                ->call_report_api_url)
        ) {
            throw new RuntimeException(
                'Call report API URL is not configured.'
            );
        }

        if (
            empty($setting
                ->call_report_api_key)
        ) {
            throw new RuntimeException(
                'Call report API key is not configured.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | No Accessible Extensions
        |--------------------------------------------------------------------------
        */

        if (empty($extensions)) {
            return $this->emptyResult(
                $filters
            );
        }

        /*
        |--------------------------------------------------------------------------
        | API Query
        |--------------------------------------------------------------------------
        */

        $query = [
            'extensions' =>
            implode(
                ',',
                $extensions
            ),

            'summary' => 1,
            'with_summary' => 1,
            'get_summary' => 1,

            'page' =>
            max(
                (int) (
                    $filters['page']
                    ?? 1
                ),
                1
            ),

            'per_page' =>
            min(
                max(
                    (int) (
                        $filters['per_page']
                        ?? 10
                    ),
                    10
                ),
                100
            ),
        ];

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (
            !empty($filters['search'])
        ) {
            $query['search'] =
                trim(
                    (string)
                    $filters['search']
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Date
        |--------------------------------------------------------------------------
        */

        if (
            !empty($filters['from'])
        ) {
            $query['from'] =
                $filters['from'];
        }

        if (
            !empty($filters['to'])
        ) {
            $query['to'] =
                $filters['to'];
        }

        /*
        |--------------------------------------------------------------------------
        | Direction
        |--------------------------------------------------------------------------
        */

        if (
            !empty($filters['direction'])
            && in_array(
                $filters['direction'],
                [
                    'inbound',
                    'outbound',
                ],
                true
            )
        ) {
            $query['direction'] =
                $filters['direction'];
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (
            !empty($filters['status'])
        ) {
            $query['status'] =
                trim(
                    (string)
                    $filters['status']
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Endpoint
        |--------------------------------------------------------------------------
        */

        $url = rtrim(
            $setting
                ->call_report_api_url,
            '/'
        ) . '/call-logs.php';

        /*
        |--------------------------------------------------------------------------
        | Fetch One Page
        |--------------------------------------------------------------------------
        */

        $response =
            $this->fetchCallLogsPage(
                $url,
                $query,
                [
                    'X-API-Key' =>
                    $setting
                        ->call_report_api_key,

                    'Accept' =>
                    'application/json',
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $pagination =
            $response['pagination'] ?? [];

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | This summary is calculated by Issabel across ALL matching records
        | (all calls matching filtered extension(s), date range, status, direction),
        | NOT only the current page ($response['data']).
        |
        | If the user has permission to view own call logs only, $extensionNumbers
        | contains only their assigned extension(s), ensuring extension-wise reporting.
        |
        */

        if ($includeSummary) {
            if (
                isset($response['summary'])
                && is_array($response['summary'])
                && !empty($response['summary'])
            ) {
                $summary = $this->normalizeSummary($response['summary']);
            } else {
                $summary = $this->fetchOverallSummary(
                    $url,
                    $query,
                    [
                        'X-API-Key' => $setting->call_report_api_key,
                        'Accept' => 'application/json',
                    ],
                    is_array($response['data'] ?? null)
                        ? $response['data']
                        : [],
                    (int) ($pagination['total'] ?? 0)
                );
            }
        } else {
            $summary = $this->emptySummary();
        }

        return [
            'success' => true,

            'data' =>
            is_array(
                $response['data']
                    ?? null
            )
                ? $response['data']
                : [],

            'pagination' => [
                'page' =>
                max(
                    (int) (
                        $pagination['page']
                        ?? $query['page']
                    ),
                    1
                ),

                'per_page' =>
                max(
                    (int) (
                        $pagination['per_page']
                        ?? $query['per_page']
                    ),
                    1
                ),

                'total' =>
                max(
                    (int) (
                        $pagination['total']
                        ?? 0
                    ),
                    0
                ),

                'last_page' =>
                max(
                    (int) (
                        $pagination['last_page']
                        ?? 1
                    ),
                    1
                ),
            ],

            'summary' =>
            $summary,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | API Request
    |--------------------------------------------------------------------------
    */

    private function fetchCallLogsPage(
        string $url,
        array $query,
        array $headers
    ): array {
        $response =
            Http::withHeaders(
                $headers
            )
            ->connectTimeout(5)
            ->timeout(20)
            ->retry(
                1,
                200
            )
            ->get(
                $url,
                $query
            );

        /*
        |--------------------------------------------------------------------------
        | HTTP Failure
        |--------------------------------------------------------------------------
        */

        if ($response->failed()) {
            throw new RuntimeException(
                'Issabel call report API failed with HTTP '
                    . $response->status()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | JSON
        |--------------------------------------------------------------------------
        */

        $data =
            $response->json();

        if (
            !is_array($data)
        ) {
            throw new RuntimeException(
                'Invalid JSON response from Issabel call report API.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | API Failure
        |--------------------------------------------------------------------------
        */

        if (
            !(
                $data['success']
                ?? false
            )
        ) {
            throw new RuntimeException(
                $data['message']
                    ?? 'Invalid response from Issabel call report API.'
            );
        }

        return $data;
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize PBX Summary
    |--------------------------------------------------------------------------
    */

    private function normalizeSummary(
        array $summary
    ): array {
        $totalCalls = (int) (
            $summary['totalCalls']
            ?? $summary['total_calls']
            ?? $summary['total']
            ?? $summary['calls']
            ?? 0
        );

        $incoming = (int) (
            $summary['incoming']
            ?? $summary['inbound']
            ?? $summary['incoming_calls']
            ?? $summary['inbound_calls']
            ?? 0
        );

        $outgoing = (int) (
            $summary['outgoing']
            ?? $summary['outbound']
            ?? $summary['outgoing_calls']
            ?? $summary['outbound_calls']
            ?? 0
        );

        $answered = (int) (
            $summary['answered']
            ?? $summary['answered_calls']
            ?? $summary['answer']
            ?? 0
        );

        $noAnswer = (int) (
            $summary['noAnswer']
            ?? $summary['no_answer']
            ?? $summary['noanswer']
            ?? $summary['missed']
            ?? $summary['unanswered']
            ?? 0
        );

        $rejected = (int) (
            $summary['rejected']
            ?? $summary['failed']
            ?? $summary['busy']
            ?? $summary['congestion']
            ?? $summary['rejected_calls']
            ?? 0
        );

        $otherStatuses = (int) (
            $summary['otherStatuses']
            ?? $summary['other_statuses']
            ?? 0
        );

        $totalDuration = (int) (
            $summary['totalDuration']
            ?? $summary['total_duration']
            ?? $summary['duration']
            ?? $summary['total_duration_sec']
            ?? 0
        );

        $totalTalkTime = (int) (
            $summary['totalTalkTime']
            ?? $summary['total_talk_time']
            ?? $summary['talk_time']
            ?? $summary['total_billsec']
            ?? $summary['billsec']
            ?? 0
        );

        if ($totalCalls === 0) {
            $totalCalls = max($incoming + $outgoing, $answered + $noAnswer + $rejected + $otherStatuses);
        }

        $answerRate = isset($summary['answerRate'])
            ? (float) $summary['answerRate']
            : (isset($summary['answer_rate'])
                ? (float) $summary['answer_rate']
                : ($totalCalls > 0 ? round(($answered / $totalCalls) * 100, 1) : 0.0));

        $avgDuration = isset($summary['avgDuration'])
            ? (int) $summary['avgDuration']
            : (isset($summary['avg_duration'])
                ? (int) $summary['avg_duration']
                : ($totalCalls > 0 ? (int) round($totalDuration / $totalCalls) : 0));

        $avgTalkTime = isset($summary['avgTalkTime'])
            ? (int) $summary['avgTalkTime']
            : (isset($summary['avg_talk_time'])
                ? (int) $summary['avg_talk_time']
                : ($answered > 0 ? (int) round($totalTalkTime / $answered) : ($totalCalls > 0 ? (int) round($totalTalkTime / $totalCalls) : 0)));

        return [
            'totalCalls' => $totalCalls,
            'incoming' => $incoming,
            'outgoing' => $outgoing,
            'totalDuration' => $totalDuration,
            'totalTalkTime' => $totalTalkTime,
            'answered' => $answered,
            'noAnswer' => $noAnswer,
            'rejected' => $rejected,
            'otherStatuses' => $otherStatuses,
            'avgDuration' => $avgDuration,
            'avgTalkTime' => $avgTalkTime,
            'answerRate' => $answerRate,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Fallback Summary Calculation
    |--------------------------------------------------------------------------
    */

    private function buildFallbackSummary(array $data, int $totalCalls): array
    {
        $incoming = 0;
        $outgoing = 0;
        $answered = 0;
        $noAnswer = 0;
        $rejected = 0;
        $otherStatuses = 0;
        $totalDuration = 0;
        $totalTalkTime = 0;

        foreach ($data as $call) {
            $direction = strtolower((string) ($call['direction'] ?? ''));
            if ($direction === 'inbound' || $direction === 'incoming') {
                $incoming++;
            } elseif ($direction === 'outbound' || $direction === 'outgoing') {
                $outgoing++;
            }

            $status = strtoupper(trim((string) ($call['status'] ?? '')));
            switch ($status) {
                case 'ANSWERED':
                case 'ANSWER':
                    $answered++;
                    break;
                case 'NO ANSWER':
                case 'NOANSWER':
                case 'MISSED':
                    $noAnswer++;
                    break;
                case 'BUSY':
                case 'FAILED':
                case 'CONGESTION':
                case 'REJECTED':
                case 'CANCELLED':
                case 'CANCEL':
                    $rejected++;
                    break;
                default:
                    $otherStatuses++;
                    break;
            }

            $totalDuration += (int) ($call['duration'] ?? 0);
            $totalTalkTime += (int) ($call['talk_time'] ?? $call['billsec'] ?? 0);
        }

        $effectiveTotalCalls = max($totalCalls, count($data));

        $answerRate = $effectiveTotalCalls > 0
            ? round(($answered / $effectiveTotalCalls) * 100, 1)
            : 0.0;

        $countData = max(count($data), 1);

        $avgDuration = $effectiveTotalCalls > 0
            ? (int) round($totalDuration / $countData)
            : 0;

        $avgTalkTime = $answered > 0
            ? (int) round($totalTalkTime / $answered)
            : ($effectiveTotalCalls > 0 ? (int) round($totalTalkTime / $countData) : 0);

        return [
            'totalCalls' => $effectiveTotalCalls,
            'incoming' => $incoming,
            'outgoing' => $outgoing,
            'totalDuration' => $totalDuration,
            'totalTalkTime' => $totalTalkTime,
            'answered' => $answered,
            'noAnswer' => $noAnswer,
            'rejected' => $rejected,
            'otherStatuses' => $otherStatuses,
            'avgDuration' => $avgDuration,
            'avgTalkTime' => $avgTalkTime,
            'answerRate' => $answerRate,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Overall Summary Calculation Across All Matching Calls
    |--------------------------------------------------------------------------
    */

    private function fetchOverallSummary(
        string $url,
        array $query,
        array $headers,
        array $pageData,
        int $totalRecords
    ): array {
        if ($totalRecords <= count($pageData)) {
            return $this->buildFallbackSummary($pageData, $totalRecords);
        }

        try {
            $allCalls = [];
            $perPage = 100;
            $lastPage = (int) ceil($totalRecords / $perPage);
            $maxPages = min($lastPage, 50);

            for ($p = 1; $p <= $maxPages; $p++) {
                $bulkQuery = array_merge($query, [
                    'page' => $p,
                    'per_page' => $perPage,
                ]);

                $bulkResponse = Http::withHeaders($headers)
                    ->connectTimeout(3)
                    ->timeout(10)
                    ->get($url, $bulkQuery);

                if (!$bulkResponse->successful()) {
                    break;
                }

                $bulkJson = $bulkResponse->json();

                if (isset($bulkJson['summary']) && is_array($bulkJson['summary']) && !empty($bulkJson['summary'])) {
                    return $this->normalizeSummary($bulkJson['summary']);
                }

                $items = $bulkJson['data'] ?? [];
                if (!is_array($items) || empty($items)) {
                    break;
                }

                foreach ($items as $item) {
                    $allCalls[] = $item;
                }

                if (count($allCalls) >= $totalRecords) {
                    break;
                }
            }

            if (!empty($allCalls)) {
                return $this->buildFallbackSummary($allCalls, $totalRecords);
            }
        } catch (\Throwable $e) {
            // Fallback gracefully on network error
        }

        return $this->buildFallbackSummary($pageData, $totalRecords);
    }

    /*
    |--------------------------------------------------------------------------
    | Empty Result
    |--------------------------------------------------------------------------
    */

    private function emptyResult(
        array $filters = []
    ): array {
        return [
            'success' => true,

            'data' => [],

            'pagination' => [
                'page' => 1,

                'per_page' =>
                (int) (
                    $filters['per_page']
                    ?? 10
                ),

                'total' => 0,

                'last_page' => 1,
            ],

            'summary' =>
            $this->emptySummary(),
        ];
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

    /*
    |--------------------------------------------------------------------------
    | Chart Visualization Aggregation
    |--------------------------------------------------------------------------
    */

    public function buildChartsData(array $summary, array $callLogs): array
    {
        // 1. Call Direction Breakdown
        $directionChart = [
            [
                'name' => 'Inbound',
                'value' => (int) ($summary['incoming'] ?? 0),
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Outbound',
                'value' => (int) ($summary['outgoing'] ?? 0),
                'color' => '#8b5cf6',
            ],
        ];

        // 2. Call Status / Disposition Breakdown
        $statusChart = [
            [
                'name' => 'Answered',
                'value' => (int) ($summary['answered'] ?? 0),
                'color' => '#10b981',
            ],
            [
                'name' => 'No Answer',
                'value' => (int) ($summary['noAnswer'] ?? 0),
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Rejected / Failed',
                'value' => (int) ($summary['rejected'] ?? 0),
                'color' => '#f43f5e',
            ],
        ];

        if (!empty($summary['otherStatuses'])) {
            $statusChart[] = [
                'name' => 'Other',
                'value' => (int) $summary['otherStatuses'],
                'color' => '#6b7280',
            ];
        }

        // 3. Top Extensions Activity
        $extensionCounts = [];
        foreach ($callLogs as $call) {
            $ext = trim((string) ($call['extension'] ?? $call['src'] ?? $call['dst'] ?? ''));
            if ($ext !== '' && strtolower($ext) !== 'unknown') {
                if (!isset($extensionCounts[$ext])) {
                    $extensionCounts[$ext] = [
                        'extension' => 'Ext ' . $ext,
                        'total' => 0,
                        'answered' => 0,
                        'duration' => 0,
                    ];
                }
                $extensionCounts[$ext]['total']++;
                $status = strtoupper(trim((string) ($call['status'] ?? '')));
                if ($status === 'ANSWERED' || $status === 'ANSWER') {
                    $extensionCounts[$ext]['answered']++;
                }
                $extensionCounts[$ext]['duration'] += (int) ($call['duration'] ?? 0);
            }
        }

        usort($extensionCounts, fn($a, $b) => $b['total'] <=> $a['total']);
        $topExtensions = array_values(array_slice($extensionCounts, 0, 8));

        // 4. Daily / Hourly Call Trends
        $trendMap = [];
        foreach ($callLogs as $call) {
            $rawDate = $call['calldate'] ?? $call['created_at'] ?? $call['start_time'] ?? null;
            if ($rawDate) {
                $dateKey = date('M d', strtotime($rawDate));
            } else {
                $dateKey = date('M d');
            }

            if (!isset($trendMap[$dateKey])) {
                $trendMap[$dateKey] = [
                    'date' => $dateKey,
                    'total' => 0,
                    'answered' => 0,
                    'missed' => 0,
                ];
            }
            $trendMap[$dateKey]['total']++;
            $status = strtoupper(trim((string) ($call['status'] ?? '')));
            if ($status === 'ANSWERED' || $status === 'ANSWER') {
                $trendMap[$dateKey]['answered']++;
            } else {
                $trendMap[$dateKey]['missed']++;
            }
        }

        $trendData = array_values($trendMap);

        return [
            'direction' => $directionChart,
            'status' => $statusChart,
            'extensions' => $topExtensions,
            'trend' => $trendData,
        ];
    }
}
