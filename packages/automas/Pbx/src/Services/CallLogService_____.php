<?php

namespace Automas\Pbx\Services;

use Automas\Lead\Entities\Deal;
use Automas\Lead\Entities\DealCall;
use Automas\Lead\Entities\Lead;
use Automas\Lead\Entities\LeadCall;
use Automas\Pbx\Entities\PbxCallLog;
use Automas\Pbx\Entities\PbxExtension;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CallLogService
{
    public function handleAmiEvent(int $creatorId, array $event): void
    {
        $eventName = $event['Event'] ?? '';

        match ($eventName) {
            'Newchannel' => $this->handleNewChannel($creatorId, $event),
            'DialBegin' => $this->handleDialBegin($creatorId, $event),
            'DialEnd' => $this->handleDialEnd($creatorId, $event),
            'BridgeEnter' => $this->handleBridgeEnter($creatorId, $event),
            'Hangup' => $this->handleHangup($creatorId, $event),
            default => null,
        };
    }

    public function handleNewChannel(int $creatorId, array $event): void
    {
        $uniqueid = $event['Uniqueid'] ?? null;

        if (!$uniqueid) {
            return;
        }

        $extension = $this->resolveExtension($creatorId, $event);
        $log = $this->findOrCreate($creatorId, $uniqueid, $event['Linkedid'] ?? null, $event);

        $log->fill([
            'extension' => $extension,
            'user_id' => $this->resolveUserId($creatorId, $extension),
            'direction' => $this->resolveDirection($event),
            'from_number' => $event['CallerIDNum'] ?? null,
            'to_number' => $event['Exten'] ?? $event['ConnectedLineNum'] ?? null,
            'status' => 'initiated',
            'linkedid' => $event['Linkedid'] ?? $log->linkedid,
            'started_at' => $log->started_at ?? now(),
            'raw_payload' => array_merge($log->raw_payload ?? [], ['Newchannel' => $event]),
        ]);

        // Only save if we have minimum required fields
        if ($log->created_by && $log->uniqueid && $log->started_at) {
            $log->save();
        }
    }

    public function handleDialBegin(int $creatorId, array $event): void
    {
        $uniqueid = $event['DestUniqueid'] ?? $event['Uniqueid'] ?? null;

        if (!$uniqueid) {
            return;
        }

        $log = $this->findOrCreate($creatorId, $uniqueid, $event['Linkedid'] ?? null, $event);
        $extension = $log->extension ?? $this->resolveExtension($creatorId, $event);

        $log->fill([
            'status' => 'ringing',
            'from_number' => $event['CallerIDNum'] ?? $log->from_number,
            'to_number' => $event['DialString'] ?? $event['DestExten'] ?? $log->to_number,
            'extension' => $extension,
            'user_id' => $log->user_id ?? $this->resolveUserId($creatorId, $extension),
            'raw_payload' => array_merge($log->raw_payload ?? [], ['DialBegin' => $event]),
        ]);

        $log->save();
    }

    public function handleDialEnd(int $creatorId, array $event): void
    {
        $uniqueid = $event['DestUniqueid'] ?? $event['Uniqueid'] ?? null;

        if (!$uniqueid) {
            return;
        }

        $log = $this->findOrCreate($creatorId, $uniqueid, $event['Linkedid'] ?? null, $event);
        $dialStatus = $event['DialStatus'] ?? 'unknown';

        // Map dial status to call status
        $status = $this->mapDialStatus($dialStatus);

        $log->fill([
            'status' => $status,
            'raw_payload' => array_merge($log->raw_payload ?? [], ['DialEnd' => $event]),
        ]);

        // If DialEnd represents a terminal state (including answered), set ended_at and duration
        $terminalDialStatuses = ['noanswer', 'no answer', 'failed', 'busy', 'congestion', 'cancel', 'cancelled', 'chanunavail', 'answered', 'answer'];

        if (in_array(strtolower($dialStatus), $terminalDialStatuses, true)) {
            $endedAt = now();
            $duration = 0;
            if ($log->started_at) {
                $duration = max(0, $log->started_at->diffInSeconds($endedAt));
            }

            $log->ended_at = $log->ended_at ?? $endedAt;
            $log->duration = $log->duration ?? $duration;
        }

        $log->save();

        Log::info('PBX DialEnd processed', [
            'workspace' => $creatorId,
            'uniqueid' => $uniqueid,
            'dial_status' => $dialStatus,
            'log_id' => $log->id ?? null,
            'ended_at' => $log->ended_at?->toDateTimeString() ?? null,
            'duration' => $log->duration ?? null,
        ]);
    }

    public function handleBridgeEnter(int $creatorId, array $event): void
    {
        $uniqueid = $event['Uniqueid'] ?? null;

        if (!$uniqueid) {
            return;
        }

        $log = $this->findOrCreate($creatorId, $uniqueid, $event['Linkedid'] ?? null, $event);

        $log->fill([
            'status' => 'answered',
            'raw_payload' => array_merge($log->raw_payload ?? [], ['BridgeEnter' => $event]),
        ]);

        $log->save();

        Log::info('PBX BridgeEnter processed', [
            'workspace' => $creatorId,
            'uniqueid' => $uniqueid,
            'log_id' => $log->id ?? null,
        ]);
    }

    public function handleHangup(int $creatorId, array $event): void
    {
        $uniqueid = $event['Uniqueid'] ?? null;

        if (!$uniqueid) {
            return;
        }

        $log = PbxCallLog::forCreator($creatorId)
            ->where('uniqueid', $uniqueid)
            ->first();

        if (!$log) {
            $log = $this->findOrCreate($creatorId, $uniqueid, $event['Linkedid'] ?? null, $event);
        }

        DB::transaction(function () use ($creatorId, $event, $log) {
            $endedAt = now();
            $duration = 0;

            if ($log->started_at && $endedAt) {
                $duration = max(0, $log->started_at->diffInSeconds($endedAt));
            }

            $finalStatus = $this->resolveUnansweredStatus($log->status);
            $cause = $event['Cause-txt'] ?? $event['Cause'] ?? 'hangup';

            $log->fill([
                'status' => $finalStatus,
                'ended_at' => $endedAt,
                'duration' => $duration,
                'raw_payload' => array_merge($log->raw_payload ?? [], ['Hangup' => $event, 'hangup_cause' => $cause]),
            ]);

            $log->save();

            Log::info('PBX Hangup processed', [
                'workspace' => $creatorId,
                'uniqueid' => $uniqueid,
                'log_id' => $log->id ?? null,
                'ended_at' => $log->ended_at?->toDateTimeString() ?? null,
                'duration' => $log->duration ?? null,
            ]);

            if (!$this->hasSyncedRelatedCalls($log)) {
                $this->syncRelatedCalls($creatorId, $log, $cause);

                $log->raw_payload = array_merge($log->raw_payload ?? [], ['related_calls_synced' => true]);
                $log->save();
            }
        });
    }

    protected function findOrCreate(int $creatorId, string $uniqueid, ?string $linkedid = null, ?array $event = null): PbxCallLog
    {
        $log = PbxCallLog::forCreator($creatorId)
            ->where('uniqueid', $uniqueid)
            ->first();

        if ($log) {
            return $log;
        }

        if ($linkedid) {
            $log = PbxCallLog::forCreator($creatorId)
                ->where('linkedid', $linkedid)
                ->whereNull('ended_at')
                ->latest('id')
                ->first();

            if ($log) {
                return $log;
            }
        }

        $fallbackLog = null;

        if ($event) {
            $numbers = array_values(array_unique(array_filter([
                $event['CallerIDNum'] ?? null,
                $event['Exten'] ?? null,
                $event['ConnectedLineNum'] ?? null,
                $event['DialString'] ?? null,
                $event['DestExten'] ?? null,
            ])));

            if (!empty($numbers)) {
                $fallbackLog = PbxCallLog::forCreator($creatorId)
                    ->whereNull('ended_at')
                    ->whereIn('status', ['initiated', 'ringing'])
                    ->where(function ($query) use ($numbers) {
                        foreach ($numbers as $number) {
                            $normalized = $this->normalizeDigits($number);
                            if ($normalized === '') {
                                continue;
                            }

                            $last10 = strlen($normalized) > 10 ? substr($normalized, -10) : $normalized;

                            $query->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(from_number, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                                ->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(to_number, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                                ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(from_number, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10])
                                ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(to_number, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                        }
                    })
                    ->latest('id')
                    ->first();
            }
        }

        if ($fallbackLog) {
            return $fallbackLog;
        }

        return new PbxCallLog([
            'created_by' => $creatorId,
            'uniqueid' => $uniqueid,
            'linkedid' => $linkedid,
            'started_at' => now(),
            'status' => 'initiated',
            'raw_payload' => [],
        ]);
    }

    protected function resolveExtension(int $creatorId, array $event): ?string
    {
        $candidates = [
            $event['CallerIDNum'] ?? null,
            $event['Exten'] ?? null,
            $event['ConnectedLineNum'] ?? null,
            $event['DestExten'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (!$candidate || !ctype_digit((string) $candidate)) {
                continue;
            }

            $exists = PbxExtension::forCreator($creatorId)
                ->where('extension', $candidate)
                ->exists();

            if ($exists) {
                return (string) $candidate;
            }
        }

        return null;
    }

    protected function resolveUserId(int $creatorId, ?string $extension): ?int
    {
        if (!$extension) {
            return null;
        }

        return PbxExtension::forCreator($creatorId)
            ->where('extension', $extension)
            ->value('user_id');
    }

    protected function resolveDirection(array $event): string
    {
        $context = strtolower($event['Context'] ?? '');
        $channel = strtolower($event['Channel'] ?? '');

        if (str_contains($context, 'from-trunk') || str_contains($channel, 'sip/out-')) {
            return 'inbound';
        }

        if (str_contains($context, 'from-internal') || str_contains($channel, 'sip/')) {
            return 'outbound';
        }

        return 'unknown';
    }

    protected function mapDialStatus(string $dialStatus): string
    {
        $status = strtolower($dialStatus);
        $statusMap = [
            'answer' => 'answered',
            'answered' => 'answered',
            'noanswer' => 'no answer',
            'no answer' => 'no answer',
            'busy' => 'busy',
            'congestion' => 'busy',
            'failed' => 'failed',
            'cancel' => 'cancelled',
            'cancelled' => 'cancelled',
            'chanunavail' => 'failed',
        ];

        return $statusMap[$status] ?? $status;
    }

    protected function resolveUnansweredStatus(?string $status): string
    {
        $normalized = strtolower(trim((string) $status));

        return match ($normalized) {
            'answered' => 'answered',
            'no answer', 'noanswer', 'missed' => 'no answer',
            'busy' => 'busy',
            'failed', 'chanunavail' => 'failed',
            'cancelled', 'cancel' => 'cancelled',
            default => 'no answer',
        };
    }

    protected function hasSyncedRelatedCalls(PbxCallLog $log): bool
    {
        return (bool) ($log->raw_payload['related_calls_synced'] ?? false);
    }

    protected function syncRelatedCalls(int $creatorId, PbxCallLog $log, ?string $cause = null): void
    {
        $matchNumbers = array_values(array_unique(array_filter([
            $log->from_number,
            $log->to_number,
        ])));

        if (empty($matchNumbers)) {
            return;
        }

        $subject = $this->buildCallSubject($log);
        $duration = gmdate('H:i:s', max(0, (int) $log->duration));
        $callResult = $this->buildCallResult($log, $cause);
        $description = $this->buildCallDescription($log, $cause);

        $leadIds = Lead::query()
            ->where('created_by', $creatorId)
            ->where(function ($query) use ($matchNumbers) {
                foreach ($matchNumbers as $number) {
                    $normalized = $this->normalizeDigits($number);
                    if ($normalized === '') {
                        continue;
                    }

                    $last10 = strlen($normalized) > 10 ? substr($normalized, -10) : $normalized;

                    $query->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                        ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                }
            })
            ->pluck('id')
            ->values();

        foreach ($leadIds as $leadId) {
            $lead = Lead::find($leadId);
            if (!$lead) {
                continue;
            }

            LeadCall::create([
                'lead_id' => $lead->id,
                'subject' => $subject,
                'call_type' => $this->resolveRelatedCallType($log, $lead->phone),
                'duration' => $duration,
                'user_id' => $this->resolveRelatedUserId($log, $lead->created_by),
                'description' => $description,
                'call_result' => $callResult,
            ]);
        }

        $dealIds = Deal::query()
            ->where('created_by', $creatorId)
            ->where(function ($query) use ($matchNumbers) {
                foreach ($matchNumbers as $number) {
                    $normalized = $this->normalizeDigits($number);
                    if ($normalized === '') {
                        continue;
                    }

                    $last10 = strlen($normalized) > 10 ? substr($normalized, -10) : $normalized;

                    $query->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?", [$normalized])
                        ->orWhereRaw("RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), 10) = ?", [$last10]);
                }
            })
            ->pluck('id')
            ->values();

        foreach ($dealIds as $dealId) {
            $deal = Deal::find($dealId);
            if (!$deal) {
                continue;
            }

            DealCall::create([
                'deal_id' => $deal->id,
                'subject' => $subject,
                'call_type' => $this->resolveRelatedCallType($log, $deal->phone),
                'duration' => $duration,
                'user_id' => $this->resolveRelatedUserId($log, $deal->created_by),
                'description' => $description,
                'call_result' => $callResult,
            ]);
        }
    }

    protected function buildCallSubject(PbxCallLog $log): string
    {
        $number = $log->direction === 'outbound'
            ? ($log->to_number ?: $log->from_number)
            : ($log->from_number ?: $log->to_number);

        return 'PBX Call - ' . ($number ?: $log->uniqueid);
    }

    protected function buildCallDescription(PbxCallLog $log, ?string $cause = null): string
    {
        return sprintf(
            'Auto-synced from PBX call log #%s. From: %s, To: %s, Status: %s, Cause: %s, Direction: %s.',
            $log->id,
            $log->from_number ?: '-',
            $log->to_number ?: '-',
            $log->status ?: '-',
            $cause ?: '-',
            $log->direction ?: '-'
        );
    }

    protected function buildCallResult(PbxCallLog $log, ?string $cause = null): string
    {
        $parts = array_filter([
            ucfirst(str_replace('_', ' ', (string) $log->status)),
            $cause,
        ]);

        return implode(' | ', $parts);
    }

    protected function resolveRelatedCallType(PbxCallLog $log, ?string $matchedPhone = null): string
    {
        if ($log->direction === 'inbound') {
            return 'inbound';
        }

        if ($log->direction === 'outbound') {
            return 'outbound';
        }

        $normalizedMatched = $this->normalizeDigits($matchedPhone);
        $fromNumber = $this->normalizeDigits($log->from_number);
        $toNumber = $this->normalizeDigits($log->to_number);

        if ($normalizedMatched && $normalizedMatched === $fromNumber) {
            return 'inbound';
        }

        if ($normalizedMatched && $normalizedMatched === $toNumber) {
            return 'outbound';
        }

        return 'outbound';
    }

    protected function resolveRelatedUserId(PbxCallLog $log, ?int $fallbackUserId = null): int
    {
        return (int) ($log->user_id ?: $fallbackUserId ?: creatorId() ?: 1);
    }

    protected function normalizeDigits(?string $value): string
    {
        return preg_replace('/[^0-9]/', '', (string) $value) ?: '';
    }
}