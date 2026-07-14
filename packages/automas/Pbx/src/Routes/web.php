<?php

use Illuminate\Support\Facades\Route;
use Automas\Pbx\Http\Controllers\PbxSettingsController;
use Automas\Pbx\Http\Controllers\PbxExtensionController;
use Automas\Pbx\Http\Controllers\PbxCallLogController;
use Automas\Pbx\Http\Controllers\WebRtcConfigController;
use Automas\Pbx\Http\Controllers\ClickToCallController;

Route::group(['middleware' => ['web', 'auth', 'verified', 'PlanModuleCheck:Pbx']], function () {
    Route::prefix('pbx')->name('pbx.')->group(function () {
        Route::get('settings', [PbxSettingsController::class, 'index'])->name('settings.index');
        Route::post('settings', [PbxSettingsController::class, 'store'])->name('settings.store');
        Route::put('settings', [PbxSettingsController::class, 'update'])->name('settings.update');

        Route::resource('extensions', PbxExtensionController::class)->except(['show']);

        Route::get('call-logs', [PbxCallLogController::class, 'index'])->name('call-logs.index');
        Route::post('call-events', [PbxCallLogController::class, 'storeEvent'])
            ->name('call-events');
            
        Route::get('webrtc-config', [WebRtcConfigController::class, 'show'])->name('webrtc-config');
        Route::post('click-to-call', [ClickToCallController::class, 'call'])->name('click-to-call');

    });
});
