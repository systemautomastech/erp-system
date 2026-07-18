<?php

use Automas\Pbx\Http\Controllers\PbxCallLogController;
use Automas\Pbx\Http\Controllers\PbxExtensionController;
use Automas\Pbx\Http\Controllers\PbxSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware([
    'web',
    'auth',
    'verified',
    'PlanModuleCheck:Pbx',
])->prefix('pbx')->name('pbx.')->group(function () {
    Route::get('settings', [PbxSettingsController::class, 'index'])
        ->name('settings.index');

    Route::post('settings', [PbxSettingsController::class, 'store'])
        ->name('settings.store');

    Route::resource('extensions', PbxExtensionController::class)->names([
        'index' => 'extensions.index',
        'create' => 'extensions.create',
        'store' => 'extensions.store',
        'show' => 'extensions.show',
        'edit' => 'extensions.edit',
        'update' => 'extensions.update',
        'destroy' => 'extensions.destroy',
    ]);

    Route::get('call-logs', [PbxCallLogController::class, 'index'])
        ->name('call-logs.index');

    Route::post('call-events', [PbxCallLogController::class, 'storeEvent'])
        ->name('call-events.store');
});

Route::get('/pbx/ringtone', [PbxSettingsController::class, 'ringtone'])
    ->middleware(['auth'])
    ->name('pbx.ringtone');
