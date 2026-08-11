<?php

namespace Automas\Pbx\Http\Controllers;

use App\Http\Controllers\Controller;
use Automas\Pbx\Models\PbxExtension;
use Automas\Pbx\Models\PbxSetting;
use Automas\Pbx\Services\PbxCallReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PbxCallReportController extends Controller
{
    public function __construct(
        protected PbxCallReportService $callReportService
    ) {}

    public function index(Request $request)
    {
        $setting = PbxSetting::query()
            ->where('created_by', creatorId())
            ->where('is_enabled', true)
            ->firstOrFail();

        $extensions = PbxExtension::query()
            ->with('user:id,name')
            ->where('created_by', creatorId())
            ->where('is_active', true)
            ->get();

        $extensionNumbers = $extensions
            ->pluck('extension')
            ->filter()
            ->values()
            ->all();

        $result = $this->callReportService->getCallLogs(
            $setting,
            $extensionNumbers,
            [
                'from' => $request->input('from'),
                'to' => $request->input('to'),
                'page' => $request->integer('page', 1),
                'per_page' => $request->integer('per_page', 50),
            ]
        );

        $extensionMap = $extensions->keyBy(
            fn($extension) => (string) $extension->extension
        );

        $calls = collect($result['data'] ?? [])
            ->map(function (array $call) use ($extensionMap) {
                $extension = $extensionMap->get(
                    (string) ($call['extension'] ?? '')
                );

                return [
                    ...$call,

                    'user_id' => $extension?->user_id,

                    'user_name' => $extension?->user?->name,

                    'recording_url' => !empty($call['has_recording'])
                        ? route('pbx.call-reports.recording', [
                            'linkedid' => $call['linkedid'],
                            'extension' => $call['extension'],
                        ])
                        : null,
                ];
            })
            ->values();

        return Inertia::render('Pbx/CallReports/Index', [
            'calls' => $calls,

            'pagination' => $result['pagination'] ?? [
                'page' => 1,
                'per_page' => 50,
                'total' => 0,
                'last_page' => 1,
            ],

            'summary' => $result['summary'] ?? [
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

            'extensions' => $extensions->map(function ($extension) {
                return [
                    'id' => $extension->id,
                    'extension' => $extension->extension,
                    'user_id' => $extension->user_id,
                    'user_name' => $extension->user?->name,
                ];
            })->values(),

            'filters' => [
                'from' => $request->input('from'),
                'to' => $request->input('to'),
            ],
        ]);
    }

    public function recording(Request $request)
    {
        $request->validate([
            'linkedid' => ['required', 'string', 'max:50'],
            'extension' => ['required', 'string', 'max:20'],
        ]);

        $setting = PbxSetting::query()
            ->where('created_by', creatorId())
            ->where('is_enabled', true)
            ->firstOrFail();

        /*
    |--------------------------------------------------------------------------
    | Verify extension belongs to current company
    |--------------------------------------------------------------------------
    */

        $extension = PbxExtension::query()
            ->where('created_by', creatorId())
            ->where('extension', $request->extension)
            ->where('is_active', true)
            ->firstOrFail();

        $url = rtrim($setting->call_report_api_url, '/')
            . '/recording.php';

        $response = Http::withHeaders([
            'X-API-Key' => $setting->call_report_api_key,
            'Accept' => '*/*',
        ])
            ->connectTimeout(5)
            ->timeout(60)
            ->get($url, [
                'linkedid' => $request->linkedid,
                'extension' => $extension->extension,
            ]);

        if ($response->failed()) {
            abort(
                $response->status() === 404 ? 404 : 502,
                'Recording could not be loaded.'
            );
        }

        $contentType = $response->header('Content-Type')
            ?? 'application/octet-stream';

        return response(
            $response->body(),
            200,
            [
                'Content-Type' => $contentType,
                'Content-Length' => strlen($response->body()),
                'Content-Disposition' => 'inline',
                'Cache-Control' => 'private, no-store',
            ]
        );
    }
}
