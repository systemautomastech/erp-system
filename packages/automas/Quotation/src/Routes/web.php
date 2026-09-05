<?php

use Illuminate\Support\Facades\Route;
use Automas\Quotation\Http\Controllers\QuotationController;
use Automas\Quotation\Http\Controllers\QuotationSettingController;
use Automas\Quotation\Http\Controllers\QuotationDefaultPageController;

Route::middleware(['web', 'auth', 'verified', 'PlanModuleCheck:Quotation'])->group(function () {
    // Quotation Setup Routes
    Route::get('sales-quotation/settings', [QuotationSettingController::class, 'index'])->name('quotation-setup.index');
    Route::post('sales-quotation/settings', [QuotationSettingController::class, 'store'])->name('quotation-setup.store');
    Route::post('sales-quotation/settings/update', [QuotationSettingController::class, 'update'])->name('quotation-setup.update');

    // Quotation Default Pages
    Route::post('sales-quotation/default-pages/reorder', [QuotationDefaultPageController::class, 'reorder'])->name('quotation-setup.default-pages.reorder');
    Route::resource('sales-quotation/default-pages', QuotationDefaultPageController::class)
        ->names([
            'create' => 'quotation-setup.default-pages.create',
            'store' => 'quotation-setup.default-pages.store',
            'edit' => 'quotation-setup.default-pages.edit',
            'update' => 'quotation-setup.default-pages.update',
            'destroy' => 'quotation-setup.default-pages.destroy',
        ])
        ->except(['index', 'show']);

    Route::resource('quotations', QuotationController::class);
    Route::get('quotations/{quotation}/print', [QuotationController::class, 'print'])->name('quotations.print');
    Route::get('quotations/{quotation}/download-pdf', [QuotationController::class, 'downloadPdf'])->name('quotations.download-pdf');
    Route::post('quotations/{quotation}/sent', [QuotationController::class, 'sent'])->name('quotations.sent');
    Route::post('quotations/{quotation}/approve', [QuotationController::class, 'approve'])->name('quotations.approve');
    Route::post('quotations/{quotation}/reject', [QuotationController::class, 'reject'])->name('quotations.reject');
    Route::post('quotations/{quotation}/convert-to-invoice', [QuotationController::class, 'convertToInvoice'])->name('quotations.convert-to-invoice');
    Route::post('quotations/{quotation}/create-revision', [QuotationController::class, 'createRevision'])->name('quotations.create-revision');
    Route::post('quotations/{quotation}/duplicate', [QuotationController::class, 'duplicate'])->name('quotations.duplicate');
    Route::get('sales-quotations/warehouse/products', [QuotationController::class, 'warehouseProducts'])->name('quotations.warehouse.products');
});
