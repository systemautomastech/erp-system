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
        | Configuration
        |--------------------------------------------------------------------------
        */

        if (
            empty(
                $setting
                    ->call_report_api_url
            )
        ) {
            throw new RuntimeException(
                'Call report API URL is not configured.'
            );
        }

        if (
            empty(
                $setting
                    ->call_report_api_key
            )
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
                            $filters[
                                'per_page'
                            ]
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
            !empty(
                $filters['search']
            )
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
            !empty(
                $filters['from']
            )
        ) {
            $query['from'] =
                $filters['from'];
        }

        if (
            !empty(
                $filters['to']
            )
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
            !empty(
                $filters['direction']
            )
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
            !empty(
                $filters['status']
            )
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
            $response[
                'pagination'
            ] ?? [];

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | This summary should be calculated by Issabel across ALL matching
        | records, not only $response['data'].
        |
        */

        if (
            isset(
                $response['summary']
            )
            && is_array(
                $response['summary']
            )
        ) {
            $summary =
                $this->normalizeSummary(
                    $response['summary']
                );
        } else {
            /*
             * Do NOT calculate it from current page because that would
             * incorrectly make summary cards represent only page 1/page 2.
             *
             * We can still safely know total calls from pagination.
             */
            $summary =
                $this->emptySummary();

            $summary['totalCalls'] =
                (int) (
                    $pagination['total']
                    ?? 0
                );
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
                            $pagination[
                                'per_page'
                            ]
                            ?? $query[
                                'per_page'
                            ]
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
                            $pagination[
                                'last_page'
                            ]
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
        return [
            'totalCalls' =>
                (int) (
                    $summary[
                        'totalCalls'
                    ]
                    ?? $summary[
                        'total_calls'
                    ]
                    ?? 0
                ),

            'incoming' =>
                (int) (
                    $summary[
                        'incoming'
                    ]
                    ?? 0
                ),

            'outgoing' =>
                (int) (
                    $summary[
                        'outgoing'
                    ]
                    ?? 0
                ),

            'totalDuration' =>
                (int) (
                    $summary[
                        'totalDuration'
                    ]
                    ?? $summary[
                        'total_duration'
                    ]
                    ?? 0
                ),

            'totalTalkTime' =>
                (int) (
                    $summary[
                        'totalTalkTime'
                    ]
                    ?? $summary[
                        'total_talk_time'
                    ]
                    ?? 0
                ),

            'answered' =>
                (int) (
                    $summary[
                        'answered'
                    ]
                    ?? 0
                ),

            'noAnswer' =>
                (int) (
                    $summary[
                        'noAnswer'
                    ]
                    ?? $summary[
                        'no_answer'
                    ]
                    ?? 0
                ),

            'rejected' =>
                (int) (
                    $summary[
                        'rejected'
                    ]
                    ?? 0
                ),

            'otherStatuses' =>
                (int) (
                    $summary[
                        'otherStatuses'
                    ]
                    ?? $summary[
                        'other_statuses'
                    ]
                    ?? 0
                ),
        ];
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
                        $filters[
                            'per_page'
                        ]
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
        ];
    }
}