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
        if (empty($setting->call_report_api_url)) {
            throw new RuntimeException('Call report API URL is not configured.');
        }

        if (empty($setting->call_report_api_key)) {
            throw new RuntimeException('Call report API key is not configured.');
        }

        if (empty($extensions)) {
            return [
                'success' => true,
                'filters' => [
                    'extensions' => [],
                ],
                'data' => [],
                'pagination' => [
                    'page' => 1,
                    'per_page' => 50,
                    'total' => 0,
                    'last_page' => 1,
                ],
            ];
        }

        $query = [
            'extensions' => implode(',', $extensions),
            'page' => $filters['page'] ?? 1,
            'per_page' => $filters['per_page'] ?? 50,
        ];

        if (!empty($filters['from'])) {
            $query['from'] = $filters['from'];
        }

        if (!empty($filters['to'])) {
            $query['to'] = $filters['to'];
        }

        $url = rtrim($setting->call_report_api_url, '/')
            . '/call-logs.php';

        $response = $this->fetchCallLogsPage($url, $query, [
            'X-API-Key' => $setting->call_report_api_key,
            'Accept' => 'application/json',
        ]);

        $pagination = $response['pagination'] ?? [
            'page' => 1,
            'per_page' => 50,
            'total' => 0,
            'last_page' => 1,
        ];

        $summaryData = $response['data'] ?? [];
        $currentPage = $query['page'];

        if (!empty($pagination['last_page']) && $pagination['last_page'] > 1) {
            for ($page = 1; $page <= $pagination['last_page']; $page++) {
                if ($page === $currentPage) {
                    continue;
                }

                $pageResponse = $this->fetchCallLogsPage(
                    $url,
                    array_merge($query, ['page' => $page]),
                    [
                        'X-API-Key' => $setting->call_report_api_key,
                        'Accept' => 'application/json',
                    ]
                );

                $summaryData = array_merge($summaryData, $pageResponse['data'] ?? []);
            }
        }

        return [
            'success' => true,
            'filters' => [
                'extensions' => $extensions,
            ],
            'data' => $response['data'] ?? [],
            'pagination' => $pagination,
            'summary' => $this->buildSummary($summaryData),
        ];
    }

    private function fetchCallLogsPage(string $url, array $query, array $headers): array
    {
        $response = Http::withHeaders($headers)
            ->connectTimeout(5)
            ->timeout(20)
            ->get($url, $query);

        if ($response->failed()) {
            throw new RuntimeException(
                'Issabel call report API failed with HTTP '
                . $response->status()
            );
        }

        $data = $response->json();

        if (!is_array($data) || !($data['success'] ?? false)) {
            throw new RuntimeException(
                $data['message'] ?? 'Invalid response from Issabel call report API.'
            );
        }

        return $data;
    }

    private function buildSummary(array $calls): array
    {
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

            $direction = $call['direction'] ?? null;
            $status = strtoupper((string) ($call['status'] ?? ''));
            $duration = (int) ($call['duration'] ?? 0);
            $talkTime = (int) ($call['talk_time'] ?? 0);

            if ($direction === 'inbound') {
                $summary['incoming']++;
            }

            if ($direction === 'outbound') {
                $summary['outgoing']++;
            }

            $summary['totalDuration'] += $duration;
            $summary['totalTalkTime'] += $talkTime;

            if ($status === 'ANSWERED') {
                $summary['answered']++;
            } elseif ($status === 'NO ANSWER') {
                $summary['noAnswer']++;
            } elseif (in_array($status, ['FAILED', 'BUSY', 'CONGESTION'], true)) {
                $summary['rejected']++;
            }
        }

        $summary['otherStatuses'] = max(
            $summary['totalCalls']
            - $summary['answered']
            - $summary['noAnswer']
            - $summary['rejected'],
            0,
        );

        return $summary;
    }
}