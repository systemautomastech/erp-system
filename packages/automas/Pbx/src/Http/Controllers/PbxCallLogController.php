<?php

namespace Automas\Pbx\Http\Controllers;

use Automas\Pbx\DataTables\PbxCallLogDataTable;
use Automas\Pbx\Models\PbxCallLog;
use Automas\Pbx\Models\PbxExtension;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class PbxCallLogController extends Controller
{
    public function index(PbxCallLogDataTable $dataTable, Request $request)
    {
        if (!Auth::user()->isAbleTo('pbx view call logs')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $creatorId = (int) creatorId();

        // Get filter options
        $extensions = PbxExtension::forCreator($creatorId)->orderBy('extension')->pluck('extension', 'extension');
        $directions = ['inbound', 'outbound', 'internal', 'unknown'];
        $statuses = PbxCallLog::forCreator($creatorId)
            ->distinct()
            ->whereNotNull('status')
            ->pluck('status')
            ->unique()
            ->sort()
            ->values();

        // Get call statistics
        $totalCalls = PbxCallLog::forCreator($creatorId)->count();
        $answeredCalls = PbxCallLog::forCreator($creatorId)
            ->where('status', 'answered')
            ->count();
        $totalDuration = PbxCallLog::forCreator($creatorId)
            ->whereNotNull('duration')
            ->sum('duration');

        $stats = [
            'total_calls' => $totalCalls,
            'answered_calls' => $answeredCalls,
            'missed_calls' => $totalCalls - $answeredCalls,
            'total_duration' => $totalDuration,
            'avg_duration' => $answeredCalls > 0 ? intdiv($totalDuration, $answeredCalls) : 0,
        ];

        return $dataTable->render('pbx::call-logs.index', compact('extensions', 'directions', 'statuses', 'stats'));
    }

    public function storeEvent(Request $request)
    {
        if (!Auth::user()->isAbleTo('pbx use softphone')) {
            return response()->json([
                'success' => false,
                'message' => __('Permission denied.'),
            ], 403);
        }

        $data = $request->validate([
            'number' => 'nullable|string|max:50',
            'extension' => 'nullable|string|max:50',
            'direction' => 'nullable|in:inbound,outbound,internal,unknown',
            'status' => 'required|string|max:50',
            'uniqueid' => 'required|string|max:100',
            'linkedid' => 'nullable|string|max:100',
            'call_started_at' => 'nullable|date',
            'call_ended_at' => 'nullable|date',
            'duration' => 'nullable|integer|min:0',
        ]);

        $creatorId = (int) creatorId();
        $userId = Auth::id();

        $extension = $data['extension'] ?? null;
        $number = $data['number'] ?? null;
        $direction = $data['direction'] ?? 'unknown';

        $log = PbxCallLog::where('created_by', $creatorId)
            ->where('uniqueid', $data['uniqueid'])
            ->first();

        if (!$log && !empty($data['linkedid'])) {
            $log = PbxCallLog::where('created_by', $creatorId)
                ->where('linkedid', $data['linkedid'])
                ->latest('id')
                ->first();
        }

        if (!$log) {
            $log = new PbxCallLog();
            $log->created_by = $creatorId;
            $log->user_id = $userId;
            $log->uniqueid = $data['uniqueid'];
            $log->linkedid = $data['linkedid'] ?? $data['uniqueid'];
            $log->started_at = !empty($data['call_started_at'])
                ? $data['call_started_at']
                : now();
        }

        $log->user_id = $log->user_id ?: $userId;
        $log->extension = $extension ?: $log->extension;
        $log->direction = $direction;
        $log->status = $data['status'];

        if ($direction === 'inbound') {
            $log->from_number = $number ?: $log->from_number;
            $log->to_number = $extension ?: $log->to_number;
        } else {
            $log->from_number = $extension ?: $log->from_number;
            $log->to_number = $number ?: $log->to_number;
        }

        if (!empty($data['call_started_at'])) {
            $log->started_at = $data['call_started_at'];
        }

        if (!empty($data['call_ended_at'])) {
            $log->ended_at = $data['call_ended_at'];
        }

        if (isset($data['duration'])) {
            $log->duration = $data['duration'];
        }

        $log->raw_payload = array_merge(
            $log->raw_payload ?? [],
            $request->all()
        );

        $log->save();

        return response()->json([
            'success' => true,
            'log_id' => $log->id,
        ]);
    }
}
