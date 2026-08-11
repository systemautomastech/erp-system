<?php

namespace Automas\Pbx\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PbxCallReportService
{
    public function getCallLogs(
        object $setting,
        array $extensions,
        array $filters = []
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Validate configuration
        |--------------------------------------------------------------------------
        */

        if (empty($setting->call_report_api_url)) {
            throw new RuntimeException(
                'Call report API URL is not configured.'
            );
        }

        if (empty($setting->call_report_api_key)) {
            throw new RuntimeException(
                'Call report API key is not configured.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | No extensions
        |--------------------------------------------------------------------------
        */

        if (empty($extensions)) {
            return $this->emptyResult(
                $filters
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Build API query
        |--------------------------------------------------------------------------
        */

        $query = [
            'extensions' => implode(
                ',',
                $extensions
            ),

            'page' => max(
                (int) ($filters['page'] ?? 1),
                1
            ),

            'per_page' => min(
                max(
                    (int) ($filters['per_page'] ?? 50),
                    10
                ),
                100
            ),
        ];

        /*
        |--------------------------------------------------------------------------
        | Date filters
        |--------------------------------------------------------------------------
        */

        if (!empty($filters['from'])) {
            $query['from'] = $filters['from'];
        }

        if (!empty($filters['to'])) {
            $query['to'] = $filters['to'];
        }

        /*
        |--------------------------------------------------------------------------
        | Direction
        |--------------------------------------------------------------------------
        */

        if (
            !empty($filters['direction']) &&
            in_array(
                $filters['direction'],
                ['inbound', 'outbound'],
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

        if (!empty($filters['status'])) {
            $query['status'] =
                $filters['status'];
        }

        /*
        |--------------------------------------------------------------------------
        | Issabel endpoint
        |--------------------------------------------------------------------------
        */

        $url = rtrim(
            $setting->call_report_api_url,
            '/'
        ) . '/call-logs.php';

        /*
        |--------------------------------------------------------------------------
        | ONE API request only
        |--------------------------------------------------------------------------
        */

        $response = $this->fetchCallLogsPage(
            $url,
            $query,
            [
                'X-API-Key' =>
                $setting->call_report_api_key,

                'Accept' =>
                'application/json',
            ]
        );



        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $pagination = $response['pagination'] ?? [
            'page' => $query['page'],
            'per_page' => $query['per_page'],
            'total' => 0,
            'last_page' => 1,
        ];

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        |
        | BEST:
        | Issabel returns summary calculated with SQL.
        |
        | FALLBACK:
        | Until Issabel API is updated, calculate summary from current page.
        |
        */

        $summary = isset($response['summary'])
            && is_array($response['summary'])
            ? $this->normalizeSummary(
                $response['summary']
            )
            : $this->buildSummary(
                $response['data'] ?? []
            );

        return [
            'success' => true,

            'filters' => [
                'extensions' => $extensions,

                'from' => $filters['from']
                    ?? null,

                'to' => $filters['to']
                    ?? null,

                'direction' =>
                $filters['direction']
                    ?? null,

                'status' =>
                $filters['status']
                    ?? null,
            ],

            'data' => $response['data']
                ?? [],

            'pagination' => [
                'page' => (int) (
                    $pagination['page']
                    ?? $query['page']
                ),

                'per_page' => (int) (
                    $pagination['per_page']
                    ?? $query['per_page']
                ),

                'total' => (int) (
                    $pagination['total']
                    ?? 0
                ),

                'last_page' => max(
                    (int) (
                        $pagination['last_page']
                        ?? 1
                    ),
                    1
                ),
            ],

            'summary' => $summary,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch one page
    |--------------------------------------------------------------------------
    */

    private function fetchCallLogsPage(
        string $url,
        array $query,
        array $headers
    ): array {
        $response = Http::withHeaders(
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
        | HTTP error
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
        | Decode JSON
        |--------------------------------------------------------------------------
        */

        $data = $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Invalid JSON response from Issabel call report API.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | API error
        |--------------------------------------------------------------------------
        */

        if (!($data['success'] ?? false)) {
            throw new RuntimeException(
                $data['message']
                    ?? 'Invalid response from Issabel call report API.'
            );
        }

        return $data;
    }

    /*
    |--------------------------------------------------------------------------
    | Empty result
    |--------------------------------------------------------------------------
    */

    private function emptyResult(
        array $filters = []
    ): array {
        return [
            'success' => true,

            'filters' => [
                'extensions' => [],

                'from' => $filters['from']
                    ?? null,

                'to' => $filters['to']
                    ?? null,

                'direction' =>
                $filters['direction']
                    ?? null,

                'status' =>
                $filters['status']
                    ?? null,
            ],

            'data' => [],

            'pagination' => [
                'page' => 1,
                'per_page' => (int) (
                    $filters['per_page']
                    ?? 50
                ),
                'total' => 0,
                'last_page' => 1,
            ],

            'summary' => [
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
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize server summary
    |--------------------------------------------------------------------------
    */

    private function normalizeSummary(
        array $summary
    ): array {
        return [
            'totalCalls' => (int) (
                $summary['totalCalls']
                ?? $summary['total_calls']
                ?? 0
            ),

            'incoming' => (int) (
                $summary['incoming']
                ?? 0
            ),

            'outgoing' => (int) (
                $summary['outgoing']
                ?? 0
            ),

            'totalDuration' => (int) (
                $summary['totalDuration']
                ?? $summary['total_duration']
                ?? 0
            ),

            'totalTalkTime' => (int) (
                $summary['totalTalkTime']
                ?? $summary['total_talk_time']
                ?? 0
            ),

            'answered' => (int) (
                $summary['answered']
                ?? 0
            ),

            'noAnswer' => (int) (
                $summary['noAnswer']
                ?? $summary['no_answer']
                ?? 0
            ),

            'rejected' => (int) (
                $summary['rejected']
                ?? 0
            ),

            'otherStatuses' => (int) (
                $summary['otherStatuses']
                ?? $summary['other_statuses']
                ?? 0
            ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Current-page summary fallback
    |--------------------------------------------------------------------------
    */

    private function buildSummary(
        array $calls
    ): array {
        $summary = [
            'totalCalls' => 0,
            'incoming' => 0,
            'outgoing' => 0,
            'totalDuration' => 0,
            'totalTalkTime' => 0,
            'answered' => 0,
            'noAnswer' => 0,
            'rejected' => 0,
            'otherStatuses' => 0,
        ];

        foreach ($calls as $call) {
            if (!is_array($call)) {
                continue;
            }

            $summary['totalCalls']++;

            /*
            |--------------------------------------------------------------------------
            | Direction
            |--------------------------------------------------------------------------
            */

            $direction = strtolower(
                trim(
                    (string) (
                        $call['direction']
                        ?? ''
                    )
                )
            );

            if ($direction === 'inbound') {
                $summary['incoming']++;
            }

            if ($direction === 'outbound') {
                $summary['outgoing']++;
            }

            /*
            |--------------------------------------------------------------------------
            | Duration
            |--------------------------------------------------------------------------
            */

            $summary['totalDuration'] +=
                (int) (
                    $call['duration']
                    ?? 0
                );

            $summary['totalTalkTime'] +=
                (int) (
                    $call['talk_time']
                    ?? 0
                );

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $status = strtoupper(
                trim(
                    (string) (
                        $call['status']
                        ?? ''
                    )
                )
            );

            if ($status === 'ANSWERED') {
                $summary['answered']++;

                continue;
            }

            if (
                in_array(
                    $status,
                    [
                        'NO ANSWER',
                        'NOANSWER',
                    ],
                    true
                )
            ) {
                $summary['noAnswer']++;

                continue;
            }

            if (
                in_array(
                    $status,
                    [
                        'FAILED',
                        'BUSY',
                        'CONGESTION',
                    ],
                    true
                )
            ) {
                $summary['rejected']++;

                continue;
            }

            $summary['otherStatuses']++;
        }

        return $summary;
    }
}
