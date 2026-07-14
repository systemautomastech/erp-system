<?php

namespace Automas\Pbx\Console\Commands;

use Automas\Pbx\Models\PbxSetting;
use Automas\Pbx\Services\AmiConnectionService;
use Automas\Pbx\Services\CallLogService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AmiListenCommand extends Command
{
    protected $signature = 'pbx:ami-listen {--Creator= : Limit listener to a single Creator ID}';

    protected $description = 'Listen to Asterisk AMI events and sync PBX call logs';

    public function __construct(
        protected AmiConnectionService $amiConnection,
        protected CallLogService $callLogService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting PBX AMI listener...');

        while (true) {
            $settings = $this->getEnabledSettings();

            if ($settings->isEmpty()) {
                $this->warn('No enabled PBX Creators found. Retrying in 10 seconds...');
                sleep(10);
                continue;
            }

            foreach ($settings as $setting) {
                try {
                    $this->listenCreator($setting);
                } catch (\Throwable $e) {
                    $message = "Creator {$setting->created_by} AMI error: {$e->getMessage()}";
                    $this->error($message);
                    Log::error($message, ['trace' => $e->getTraceAsString()]);
                    sleep(3);
                }
            }
        }
    }

    protected function listenCreator(PbxSetting $setting): void
    {
        $socket = null;

        try {
            $this->info("Connecting AMI for Creator {$setting->created_by}...");
            $socket = $this->amiConnection->connect($setting);
            $this->info("Listening on Creator {$setting->created_by}...");

            while (!feof($socket)) {
                $event = $this->amiConnection->readEvent($socket);

                if (!$event || empty($event['Event'])) {
                    continue;
                }

                if (in_array($event['Event'], ['Newchannel', 'DialBegin', 'DialEnd', 'BridgeEnter', 'Hangup'], true)) {
                    try {
                        $this->callLogService->handleAmiEvent((int) $setting->created_by, $event);
                    } catch (\Throwable $e) {
                        Log::error('PBX call log sync failed', [
                            'created_by' => $setting->created_by,
                            'event' => $event['Event'] ?? null,
                            'message' => $e->getMessage(),
                        ]);
                    }
                }
            }
        } finally {
            if (is_resource($socket)) {
                fclose($socket);
            }
        }

        throw new \RuntimeException("AMI socket disconnected for Creator {$setting->created_by}");
    }

    protected function getEnabledSettings()
    {
        $query = PbxSetting::enabled()
            ->whereNotNull('ami_host')
            ->whereNotNull('ami_username')
            ->whereNotNull('ami_password');

        if ($creatorId = $this->option('Creator')) {
            $query->where('created_by', (int) $creatorId);
        }

        return $query->get();
    }
}
