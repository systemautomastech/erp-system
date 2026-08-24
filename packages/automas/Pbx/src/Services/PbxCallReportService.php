<?php

namespace Automas\Pbx\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PbxCallReportService
{
    /*
    |--------------------------------------------------------------------------
    | Fetch Call Summary Endpoint (Native Server-side SQL Aggregation)
    |--------------------------------------------------------------------------
    */

    public function getCallSummary(
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

        $cleanExtensions = array_values(array_unique(array_filter(array_map(
            fn($e) => trim((string) $e),
            $extensions
        ))));

        if (empty($cleanExtensions)) {
            return [
                'success' => true,
                'summary' => $this->emptySummary(),
                'status_breakdown' => [],
                'direction_breakdown' => [],
                'daily' => [],
                'hourly' => [],
                'extensions' => [],
            ];
        }

        $query = [
            'extensions' => implode(',', $cleanExtensions),
        ];

        /*
        |--------------------------------------------------------------------------
        | Date Normalization (Strictly YYYY-MM-DD for API stability)
        |--------------------------------------------------------------------------
        */

        if (!empty($filters['from'])) {
            try {
                $query['from'] = Carbon::parse($filters['from'])->format('Y-m-d');
            } catch (\Throwable $e) {
                // Ignore invalid date string
            }
        }

        if (!empty($filters['to'])) {
            try {
                $query['to'] = Carbon::parse($filters['to'])->format('Y-m-d');
            } catch (\Throwable $e) {
                // Ignore invalid date string
            }
        }

        if (!empty($filters['direction'])) {
            $query['direction'] = trim((string) $filters['direction']);
        }

        if (!empty($filters['status'])) {
            $query['status'] = trim((string) $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query['search'] = trim((string) $filters['search']);
        }

        $url = rtrim($setting->call_report_api_url, '/') . '/call-summary.php';

        $startTime = microtime(true);

        Log::info('Issabel call summary request', [
            'url' => $url,
            'extensions' => $query['extensions'],
            'from' => $query['from'] ?? null,
            'to' => $query['to'] ?? null,
        ]);

        $response = Http::withHeaders([
            'X-API-Key' => $setting->call_report_api_key,
            'Accept' => 'application/json',
        ])
            ->connectTimeout(5)
            ->timeout(20)
            ->retry(1, 200)
            ->get($url, $query);

        $durationMs = round((microtime(true) - $startTime) * 1000, 2);

        if ($response->failed()) {
            Log::error('Issabel call summary API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'duration_ms' => $durationMs,
            ]);

            throw new RuntimeException(
                'Issabel call summary API failed with HTTP ' . $response->status() . ': ' . $response->body()
            );
        }

        $data = $response->json();

        if (!is_array($data) || !($data['success'] ?? false)) {
            throw new RuntimeException(
                $data['message'] ?? 'Invalid response from Issabel call summary API.'
            );
        }

        return $data;
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Paginated Call Logs (Server-side Paginated)
    |--------------------------------------------------------------------------
    */

    public function getCallLogs(
        object $setting,
        array $extensions,
        array $filters = [],
        bool $includeSummary = false
    ): array {
        if (empty($setting->call_report_api_url)) {
            throw new RuntimeException('Call report API URL is not configured.');
        }

        if (empty($setting->call_report_api_key)) {
            throw new RuntimeException('Call report API key is not configured.');
        }

        $cleanExtensions = array_values(array_unique(array_filter(array_map(
            fn($e) => trim((string) $e),
            $extensions
        ))));

        if (empty($cleanExtensions)) {
            return $this->emptyResult($filters);
        }

        $query = [
            'extensions' => implode(',', $cleanExtensions),
            'page' => max((int) ($filters['page'] ?? 1), 1),
            'per_page' => min(max((int) ($filters['per_page'] ?? 10), 10), 100),
        ];

        if (!empty($filters['search'])) {
            $query['search'] = trim((string) $filters['search']);
        }

        /*
        |--------------------------------------------------------------------------
        | Date Normalization (Strictly YYYY-MM-DD)
        |--------------------------------------------------------------------------
        */

        if (!empty($filters['from'])) {
            try {
                $query['from'] = Carbon::parse($filters['from'])->format('Y-m-d');
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        if (!empty($filters['to'])) {
            try {
                $query['to'] = Carbon::parse($filters['to'])->format('Y-m-d');
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        if (!empty($filters['direction']) && in_array($filters['direction'], ['inbound', 'outbound'], true)) {
            $query['direction'] = $filters['direction'];
        }

        if (!empty($filters['status'])) {
            $query['status'] = trim((string) $filters['status']);
        }

        $url = rtrim($setting->call_report_api_url, '/') . '/call-logs.php';

        $response = $this->fetchCallLogsPage(
            $url,
            $query,
            [
                'X-API-Key' => $setting->call_report_api_key,
                'Accept' => 'application/json',
            ]
        );

        $pagination = $response['pagination'] ?? [];

        return [
            'success' => true,
            'data' => is_array($response['data'] ?? null) ? $response['data'] : [],
            'pagination' => [
                'page' => max((int) ($pagination['page'] ?? $query['page']), 1),
                'per_page' => max((int) ($pagination['per_page'] ?? $query['per_page']), 1),
                'total' => max((int) ($pagination['total'] ?? 0), 0),
                'last_page' => max((int) ($pagination['last_page'] ?? 1), 1),
            ],
            'summary' => $this->emptySummary(),
        ];
    }

    private function fetchCallLogsPage(
        string $url,
        array $query,
        array $headers
    ): array {
        Log::info('Issabel call report request', [
            'extensions' => $query['extensions'] ?? null,
            'from' => $query['from'] ?? null,
            'to' => $query['to'] ?? null,
            'page' => $query['page'] ?? null,
            'per_page' => $query['per_page'] ?? null,
        ]);

        $response = Http::withHeaders($headers)
            ->connectTimeout(5)
            ->timeout(20)
            ->retry(1, 200)
            ->get($url, $query);

        if ($response->failed()) {
            Log::error('Issabel call report API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'request_params' => $query,
                'url' => $url,
            ]);

            throw new RuntimeException(
                'Issabel call report API failed with HTTP ' . $response->status() . ': ' . $response->body()
            );
        }

        $data = $response->json();

        if (!is_array($data)) {
            throw new RuntimeException('Invalid JSON response from Issabel call report API.');
        }

        if (!($data['success'] ?? false)) {
            throw new RuntimeException($data['message'] ?? 'Invalid response from Issabel call report API.');
        }

        return $data;
    }

    public function emptyResult(array $filters = []): array
    {
        return [
            'success' => true,
            'data' => [],
            'pagination' => [
                'page' => 1,
                'per_page' => (int) ($filters['per_page'] ?? 10),
                'total' => 0,
                'last_page' => 1,
            ],
            'summary' => $this->emptySummary(),
        ];
    }

    public function emptySummary(): array
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

            // Snake case parameters for new UI:
            'total_calls' => 0,
            'inbound_calls' => 0,
            'outbound_calls' => 0,
            'answered_calls' => 0,
            'missed_calls' => 0,
            'no_answer_calls' => 0,
            'busy_calls' => 0,
            'failed_calls' => 0,
            'congestion_calls' => 0,
            'inbound_answered' => 0,
            'inbound_missed' => 0,
            'outbound_answered' => 0,
            'outbound_unanswered' => 0,
            'total_duration' => 0,
            'total_talk_time' => 0,
            'average_duration' => 0,
            'average_talk_time' => 0,
            'answer_rate' => 0.0,
            'miss_rate' => 0.0,
            'recording_count' => 0,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Chart Visualization Aggregation from call-summary.php Response
    |--------------------------------------------------------------------------
    */

    public function buildChartsDataFromSummary(array $summaryResult, array $extensionsList = []): array
    {
        $summary = $summaryResult['summary'] ?? [];
        $daily = $summaryResult['daily'] ?? [];
        $hourly = $summaryResult['hourly'] ?? [];
        $extBreakdown = $summaryResult['extensions'] ?? [];

        // Index system extensions by extension number
        $knownExtensions = [];
        foreach ($extensionsList as $extObj) {
            $extNum = is_array($extObj) ? ($extObj['extension'] ?? '') : (string) ($extObj->extension ?? '');
            if ($extNum !== '') {
                $knownExtensions[(string)$extNum] = $extObj;
            }
        }

        // 1. Call Direction Breakdown
        $directionChart = [
            [
                'name' => 'Inbound',
                'value' => (int) ($summary['inbound_calls'] ?? $summary['incoming'] ?? 0),
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Outbound',
                'value' => (int) ($summary['outbound_calls'] ?? $summary['outgoing'] ?? 0),
                'color' => '#8b5cf6',
            ],
        ];

        // 2. Call Status / Disposition Breakdown
        $statusChart = [
            [
                'name' => 'Answered',
                'value' => (int) ($summary['answered_calls'] ?? $summary['answered'] ?? 0),
                'color' => '#10b981',
            ],
            [
                'name' => 'No Answer',
                'value' => (int) ($summary['no_answer_calls'] ?? $summary['noAnswer'] ?? 0),
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Failed / Busy',
                'value' => (int) ($summary['busy_calls'] ?? 0) + (int) ($summary['failed_calls'] ?? 0) + (int) ($summary['congestion_calls'] ?? 0) + (int) ($summary['rejected'] ?? 0),
                'color' => '#f43f5e',
            ],
        ];

        // 3. Extension Aggregations & Performance
        $extDataMap = [];
        foreach ($extBreakdown as $e) {
            $extNum = (string) $e['extension'];
            $extDataMap[$extNum] = $e;
        }

        $allExtNums = array_unique(array_merge(array_keys($knownExtensions), array_keys($extDataMap)));

        $topExtensionsList = [];
        $extensionPerformanceList = [];
        $onlineCount = 0;

        foreach ($allExtNums as $extNum) {
            $extInfo = $extDataMap[$extNum] ?? [
                'extension' => $extNum,
                'total' => 0,
                'answered' => 0,
                'missed' => 0,
                'inbound' => 0,
                'outbound' => 0,
                'talk_time' => 0,
            ];

            $extData = $knownExtensions[$extNum] ?? null;
            $uName = is_array($extData) ? ($extData['user_name'] ?? "Extension {$extNum}") : ($extData->user?->name ?? "Extension {$extNum}");
            $uAvatar = is_array($extData) ? ($extData['avatar'] ?? '') : ($extData->user?->avatar ?? '');

            $totalCalls = (int) ($extInfo['total'] ?? 0);
            $answeredCalls = (int) ($extInfo['answered'] ?? 0);
            $missed = (int) ($extInfo['missed'] ?? 0);
            $talkTime = (int) ($extInfo['talk_time'] ?? 0);
            $failed = max(0, $totalCalls - $answeredCalls - $missed);

            $ansRate = $totalCalls > 0 ? round(($answeredCalls / $totalCalls) * 100, 1) : 0;
            $avgTalk = $answeredCalls > 0 ? round($talkTime / $answeredCalls) : 0;
            $missedPct = $totalCalls > 0 ? round(($missed / $totalCalls) * 100, 1) : 0;
            $failedPct = $totalCalls > 0 ? round(($failed / $totalCalls) * 100, 1) : 0;

            $topExtensionsList[] = [
                'extension' => 'Ext ' . $extNum,
                'total' => $totalCalls,
                'answered' => $answeredCalls,
                'duration' => $talkTime,
            ];

            $extensionPerformanceList[] = [
                'extension' => $extNum,
                'user_name' => $uName,
                'avatar' => $uAvatar,
                'department' => 'PBX Extension',
                'totalCalls' => $totalCalls,
                'answeredCalls' => $answeredCalls,
                'answerRate' => $ansRate,
                'avgTalkTime' => (int) $avgTalk,
                'missed' => $missed,
                'missedPercent' => $missedPct,
                'failed' => $failed,
                'failedPercent' => $failedPct,
                'status' => 'online',
            ];

            $onlineCount++;
        }

        usort($topExtensionsList, fn($a, $b) => $b['total'] <=> $a['total']);
        $topExtensions = array_values(array_slice($topExtensionsList, 0, 8));

        usort($extensionPerformanceList, fn($a, $b) => $b['totalCalls'] <=> $a['totalCalls']);

        // 4. Daily Trends & Day-of-Week Peak Calculations
        $trendData = [];
        $dayOfWeekStats = [
            'Mon' => ['day' => 'Monday', 'short' => 'Mon', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Tue' => ['day' => 'Tuesday', 'short' => 'Tue', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Wed' => ['day' => 'Wednesday', 'short' => 'Wed', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Thu' => ['day' => 'Thursday', 'short' => 'Thu', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Fri' => ['day' => 'Friday', 'short' => 'Fri', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Sat' => ['day' => 'Saturday', 'short' => 'Sat', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
            'Sun' => ['day' => 'Sunday', 'short' => 'Sun', 'total' => 0, 'answered' => 0, 'answerRate' => 0],
        ];

        $maxDailyTotal = 0;
        $maxDailyAnswerRate = 0.0;

        foreach ($daily as $d) {
            $timestamp = strtotime($d['date']);
            $formattedDate = date('M d', $timestamp);
            $dayOfWeekKey = date('D', $timestamp);
            $dayFullName = date('l', $timestamp);
            $tot = (int) ($d['total'] ?? 0);
            $ans = (int) ($d['answered'] ?? 0);
            $miss = (int) ($d['missed'] ?? 0);
            $ansRate = $tot > 0 ? round(($ans / $tot) * 100, 1) : 0;

            if ($tot > $maxDailyTotal) {
                $maxDailyTotal = $tot;
            }
            if ($tot >= 3 && $ansRate > $maxDailyAnswerRate) {
                $maxDailyAnswerRate = $ansRate;
            }

            if (isset($dayOfWeekStats[$dayOfWeekKey])) {
                $dayOfWeekStats[$dayOfWeekKey]['total'] += $tot;
                $dayOfWeekStats[$dayOfWeekKey]['answered'] += $ans;
            }

            $trendData[] = [
                'fullDate' => $d['date'],
                'date' => $formattedDate,
                'dayOfWeek' => $dayOfWeekKey,
                'dayFullName' => $dayFullName,
                'total' => $tot,
                'answered' => $ans,
                'missed' => $miss,
                'answerRate' => $ansRate,
                'isPeak' => false,
                'isPeakAnswer' => false,
            ];
        }

        // Calculate answer rates for day of week stats
        $maxDayOfWeekTotal = 0;
        $maxDayOfWeekAnswerRate = 0.0;
        $peakDayOfWeek = null;
        $peakAnswerDayOfWeek = null;

        foreach ($dayOfWeekStats as &$dow) {
            $dow['answerRate'] = $dow['total'] > 0 ? round(($dow['answered'] / $dow['total']) * 100, 1) : 0;
            if ($dow['total'] > $maxDayOfWeekTotal) {
                $maxDayOfWeekTotal = $dow['total'];
                $peakDayOfWeek = $dow['day'];
            }
            if ($dow['total'] > 0 && $dow['answerRate'] > $maxDayOfWeekAnswerRate) {
                $maxDayOfWeekAnswerRate = $dow['answerRate'];
                $peakAnswerDayOfWeek = $dow['day'];
            }
        }
        unset($dow);

        // Mark peak days in daily trend array
        foreach ($trendData as &$td) {
            if ($maxDailyTotal > 0 && $td['total'] === $maxDailyTotal) {
                $td['isPeak'] = true;
            }
            if ($maxDailyAnswerRate > 0 && $td['answerRate'] === $maxDailyAnswerRate && $td['total'] > 0) {
                $td['isPeakAnswer'] = true;
            }
        }
        unset($td);

        $dayOfWeekList = array_values($dayOfWeekStats);

        // 5. Hourly Trends (Full 24 Hours: 12 AM to 11 PM)
        $hourlyMap = [];
        for ($h = 0; $h < 24; $h++) {
            $timeLabel = date('g A', strtotime("{$h}:00"));
            $hourlyMap[$h] = [
                'hour' => $h,
                'time' => $timeLabel,
                'total' => 0,
                'answered' => 0,
                'answerRate' => 0,
                'isPeak' => false,
                'isPeakAnswer' => false,
            ];
        }

        foreach ($hourly as $hItem) {
            $hourNum = (int) ($hItem['hour'] ?? 0);
            if (isset($hourlyMap[$hourNum])) {
                $hourlyMap[$hourNum]['total'] += (int) ($hItem['total'] ?? 0);
                $hourlyMap[$hourNum]['answered'] += (int) ($hItem['answered'] ?? 0);
            }
        }

        $maxHourlyTotal = 0;
        $maxHourlyAnswerRate = 0.0;

        foreach ($hourlyMap as &$item) {
            $item['answerRate'] = $item['total'] > 0 ? round(($item['answered'] / $item['total']) * 100, 1) : 0;
            if ($item['total'] > $maxHourlyTotal) {
                $maxHourlyTotal = $item['total'];
            }
            if ($item['total'] >= 3 && $item['answerRate'] > $maxHourlyAnswerRate) {
                $maxHourlyAnswerRate = $item['answerRate'];
            }
        }
        unset($item);

        if ($maxHourlyAnswerRate === 0.0) {
            foreach ($hourlyMap as $item) {
                if ($item['total'] > 0 && $item['answerRate'] > $maxHourlyAnswerRate) {
                    $maxHourlyAnswerRate = $item['answerRate'];
                }
            }
        }

        $peakHourLabel = null;
        $peakAnswerHourLabel = null;

        foreach ($hourlyMap as &$item) {
            if ($maxHourlyTotal > 0 && $item['total'] === $maxHourlyTotal) {
                $item['isPeak'] = true;
                $peakHourLabel = $item['time'];
            }
            if ($maxHourlyAnswerRate > 0 && $item['answerRate'] === $maxHourlyAnswerRate && $item['total'] > 0) {
                $item['isPeakAnswer'] = true;
                $peakAnswerHourLabel = $item['time'];
            }
        }
        unset($item);

        $hourlyTrendData = array_values($hourlyMap);

        // 6. Live Status Aggregations
        $totalExtCount = max(count($allExtNums), 1);
        $liveStatus = [
            'online' => $onlineCount,
            'onlinePercent' => 100.0,
            'onCall' => 0,
            'onCallPercent' => 0.0,
            'ringing' => 0,
            'ringingPercent' => 0.0,
            'offline' => 0,
            'offlinePercent' => 0.0,
            'activeExtensions' => $onlineCount,
            'totalExtensions' => $totalExtCount,
            'utilizationPercent' => 100.0,
        ];

        return [
            'direction' => $directionChart,
            'status' => $statusChart,
            'extensions' => $topExtensions,
            'trend' => $trendData,
            'hourlyTrend' => $hourlyTrendData,
            'dayOfWeekTrend' => $dayOfWeekList,
            'extensionPerformance' => $extensionPerformanceList,
            'liveStatus' => $liveStatus,
            'peaks' => [
                'peakHour' => $peakHourLabel,
                'peakHourVolume' => $maxHourlyTotal,
                'peakAnswerHour' => $peakAnswerHourLabel,
                'peakHourAnswerRate' => $maxHourlyAnswerRate,
                'peakDayOfWeek' => $peakDayOfWeek,
                'peakDayVolume' => $maxDayOfWeekTotal,
                'peakAnswerDayOfWeek' => $peakAnswerDayOfWeek,
                'peakDayAnswerRate' => $maxDayOfWeekAnswerRate,
            ],
        ];
    }
}
