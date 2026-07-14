<?php

use Illuminate\Support\Facades\Route;
use Automas\Pbx\Http\Controllers\WebRtcConfigController;
use Automas\Pbx\Http\Controllers\ClickToCallController;
use Automas\Pbx\Http\Controllers\CallerLookupController;

Route::middleware(['web', 'auth:sanctum', 'verified', 'PlanModuleCheck:Pbx'])
    ->group(function () {
        Route::get('/pbx/webrtc-config', [WebRtcConfigController::class, 'index'])
            ->name('api.pbx.webrtc-config');

        Route::post('/pbx/click-to-call', [ClickToCallController::class, 'call'])
            ->name('api.pbx.click-to-call');

        Route::get('/pbx/caller-lookup', [CallerLookupController::class, 'lookup'])
            ->name('api.pbx.caller-lookup');
    });
