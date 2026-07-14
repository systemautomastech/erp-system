<?php


use Illuminate\Support\Facades\Route;
use Automas\Sales\Http\Controllers\DashboardController;
use Automas\Sales\Http\Controllers\AccountTypeController;
use Automas\Sales\Http\Controllers\AccountIndustryController;
use Automas\Sales\Http\Controllers\SalesOpportunityStageController;
use Automas\Sales\Http\Controllers\SalesAccountController;
use Automas\Sales\Http\Controllers\SalesCaseTypeController;
use Automas\Sales\Http\Controllers\SalesContactController;
use Automas\Sales\Http\Controllers\SalesOpportunityController;
use Automas\Sales\Http\Controllers\SalesShippingProviderController;
use Automas\Sales\Http\Controllers\SalesQuoteController;
use Automas\Sales\Http\Controllers\SalesOrderController;

use Automas\Sales\Http\Controllers\SalesCaseController;
use Automas\Sales\Http\Controllers\SalesStreamController;
use Automas\Sales\Http\Controllers\SalesDocumentFolderController;
use Automas\Sales\Http\Controllers\SalesDocumentTypeController;
use Automas\Sales\Http\Controllers\SalesDocumentController;
use Automas\Sales\Http\Controllers\SalesCallController;
use Automas\Sales\Http\Controllers\SalesMeetingController;
use Automas\Sales\Http\Controllers\ReportController;
use Automas\Sales\Http\Controllers\SalesSettingsController;

// Public routes
Route::middleware('web')->get('/public/quote/{id}', [SalesQuoteController::class, 'publicShow'])->name('sales.quotes.public');



Route::middleware(['web', 'auth', 'verified', 'PlanModuleCheck:Sales'])->group(function () {
    Route::get('/sales', [DashboardController::class, 'index'])->name('sales.index');

    Route::post('/sales/settings/update', [SalesSettingsController::class, 'update'])->name('sales.settings.update');

    Route::prefix('sales/account-types')->name('sales.account-types.')->group(function () {
        Route::get('/', [AccountTypeController::class, 'index'])->name('index');
        Route::post('/', [AccountTypeController::class, 'store'])->name('store');
        Route::put('/{accountType}', [AccountTypeController::class, 'update'])->name('update');
        Route::delete('/{accountType}', [AccountTypeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/account-industries')->name('sales.account-industries.')->group(function () {
        Route::get('/', [AccountIndustryController::class, 'index'])->name('index');
        Route::post('/', [AccountIndustryController::class, 'store'])->name('store');
        Route::put('/{accountIndustry}', [AccountIndustryController::class, 'update'])->name('update');
        Route::delete('/{accountIndustry}', [AccountIndustryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/accounts')->name('sales.accounts.')->group(function () {
        Route::get('/', [SalesAccountController::class, 'index'])->name('index');
        Route::post('/', [SalesAccountController::class, 'store'])->name('store');

        Route::get('/{account}', [SalesAccountController::class, 'show'])->name('show');
        Route::put('/{account}', [SalesAccountController::class, 'update'])->name('update');
        Route::delete('/{account}', [SalesAccountController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/contacts')->name('sales.contacts.')->group(function () {
        Route::get('/', [SalesContactController::class, 'index'])->name('index');
        Route::post('/', [SalesContactController::class, 'store'])->name('store');
        Route::get('/{contact}', [SalesContactController::class, 'show'])->name('show');
        Route::put('/{contact}', [SalesContactController::class, 'update'])->name('update');
        Route::delete('/{contact}', [SalesContactController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/opportunity-stages')->name('sales.opportunity-stages.')->group(function () {
        Route::get('/', [SalesOpportunityStageController::class, 'index'])->name('index');
        Route::post('/', [SalesOpportunityStageController::class, 'store'])->name('store');
        Route::put('/{opportunityStage}', [SalesOpportunityStageController::class, 'update'])->name('update');
        Route::delete('/{opportunityStage}', [SalesOpportunityStageController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/opportunities')->name('sales.opportunities.')->group(function () {
        Route::get('/', [SalesOpportunityController::class, 'index'])->name('index');
        Route::get('/kanban', [SalesOpportunityController::class, 'kanban'])->name('kanban');
        Route::post('/', [SalesOpportunityController::class, 'store'])->name('store');
        Route::patch('/{opportunity}/stage', [SalesOpportunityController::class, 'updateStage'])->name('update-stage');
        Route::get('/{opportunity}', [SalesOpportunityController::class, 'show'])->name('show');
        Route::put('/{opportunity}', [SalesOpportunityController::class, 'update'])->name('update');
        Route::delete('/{opportunity}', [SalesOpportunityController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/shipping-providers')->name('sales.shipping-providers.')->group(function () {
        Route::get('/', [SalesShippingProviderController::class, 'index'])->name('index');
        Route::post('/', [SalesShippingProviderController::class, 'store'])->name('store');
        Route::put('/{shippingProvider}', [SalesShippingProviderController::class, 'update'])->name('update');
        Route::delete('/{shippingProvider}', [SalesShippingProviderController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/quotes')->name('sales.quotes.')->group(function () {
        Route::get('/', [SalesQuoteController::class, 'index'])->name('index');
        Route::get('/create', [SalesQuoteController::class, 'create'])->name('create');
        Route::post('/create', [SalesQuoteController::class, 'createWithContext'])->name('create.context');
        Route::post('/', [SalesQuoteController::class, 'store'])->name('store');
        Route::get('/warehouse/products', [SalesQuoteController::class, 'getWarehouseProducts'])->name('warehouse.products');
        Route::get('/customer/{customer}/details', [SalesQuoteController::class, 'getCustomerDetails'])->name('customer-details');
        Route::get('/opportunity/{opportunity}/details', [SalesQuoteController::class, 'getOpportunityDetails'])->name('opportunity-details');
        Route::get('/{quote}', [SalesQuoteController::class, 'show'])->name('show');
        Route::get('/{quote}/edit', [SalesQuoteController::class, 'edit'])->name('edit');
        Route::get('/{quote}/print', [SalesQuoteController::class, 'print'])->name('print');
        Route::put('/{quote}', [SalesQuoteController::class, 'update'])->name('update');
        Route::delete('/{quote}', [SalesQuoteController::class, 'destroy'])->name('destroy');
        Route::post('/{quote}/duplicate', [SalesQuoteController::class, 'duplicate'])->name('duplicate');
        Route::post('/{quote}/convert', [SalesQuoteController::class, 'convertToSalesOrder'])->name('convert');
    });

    Route::prefix('sales/orders')->name('sales.orders.')->group(function () {
        Route::get('/', [SalesOrderController::class, 'index'])->name('index');
        Route::get('/create', [SalesOrderController::class, 'create'])->name('create');
        Route::post('/create', [SalesOrderController::class, 'createWithContext'])->name('create.context');
        Route::post('/', [SalesOrderController::class, 'store'])->name('store');
        Route::get('/warehouse/products', [SalesOrderController::class, 'getWarehouseProducts'])->name('warehouse.products');
        Route::get('/customer/{customer}/details', [SalesOrderController::class, 'getCustomerDetails'])->name('customer-details');
        Route::get('/opportunity/{opportunity}/details', [SalesOrderController::class, 'getOpportunityDetails'])->name('opportunity-details');
        Route::get('/quote/{quote}/details', [SalesOrderController::class, 'getQuoteDetails'])->name('quote-details');
        Route::get('/{salesOrder}', [SalesOrderController::class, 'show'])->name('show');
        Route::get('/{salesOrder}/edit', [SalesOrderController::class, 'edit'])->name('edit');
        Route::put('/{salesOrder}', [SalesOrderController::class, 'update'])->name('update');
        Route::delete('/{salesOrder}', [SalesOrderController::class, 'destroy'])->name('destroy');
        Route::post('/{salesOrder}/duplicate', [SalesOrderController::class, 'duplicate'])->name('duplicate');
        Route::post('/{salesOrder}/convert', [SalesOrderController::class, 'convertToInvoice'])->name('convert');
    });



    Route::prefix('sales/case-types')->name('sales.case-types.')->group(function () {
        Route::get('/', [SalesCaseTypeController::class, 'index'])->name('index');
        Route::post('/', [SalesCaseTypeController::class, 'store'])->name('store');
        Route::put('/{casetype}', [SalesCaseTypeController::class, 'update'])->name('update');
        Route::delete('/{casetype}', [SalesCaseTypeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/cases')->name('sales.cases.')->group(function () {
        Route::get('/', [SalesCaseController::class, 'index'])->name('index');
        Route::post('/', [SalesCaseController::class, 'store'])->name('store');
        Route::get('/{case}', [SalesCaseController::class, 'show'])->name('show');
        Route::put('/{case}', [SalesCaseController::class, 'update'])->name('update');
        Route::delete('/{case}', [SalesCaseController::class, 'destroy'])->name('destroy');
    });

    // Streams Routes
    Route::get('sales/streams', [SalesStreamController::class, 'index'])->name('sales.streams.index');
    Route::post('sales/streamstore/{type}/{name}/{id}', [SalesStreamController::class, 'store'])->name('sales.streamstore');
    Route::put('sales/stream/{stream}', [SalesStreamController::class, 'update'])->name('sales.streamupdate');
    Route::delete('sales/stream/{stream}', [SalesStreamController::class, 'destroy'])->name('sales.streamdelete');

    Route::prefix('sales/sales-document-types')->name('sales.sales-document-types.')->group(function () {
        Route::get('/', [SalesDocumentTypeController::class, 'index'])->name('index');
        Route::post('/', [SalesDocumentTypeController::class, 'store'])->name('store');
        Route::put('/{salesdocumenttype}', [SalesDocumentTypeController::class, 'update'])->name('update');
        Route::delete('/{salesdocumenttype}', [SalesDocumentTypeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/sales-document-folders')->name('sales.sales-document-folders.')->group(function () {
        Route::get('/', [SalesDocumentFolderController::class, 'index'])->name('index');
        Route::post('/', [SalesDocumentFolderController::class, 'store'])->name('store');
        Route::put('/{salesdocumentfolder}', [SalesDocumentFolderController::class, 'update'])->name('update');
        Route::delete('/{salesdocumentfolder}', [SalesDocumentFolderController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/documents')->name('sales.documents.')->group(function () {
        Route::get('/', [SalesDocumentController::class, 'index'])->name('index');
        Route::post('/', [SalesDocumentController::class, 'store'])->name('store');
        Route::get('/opportunity/{opportunity}/details', [SalesOpportunityController::class, 'opportunityDetails'])->name('opportunity-details');
        Route::get('/{salesDocument}', [SalesDocumentController::class, 'show'])->name('show');
        Route::put('/{salesDocument}', [SalesDocumentController::class, 'update'])->name('update');
        Route::delete('/{salesDocument}', [SalesDocumentController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/calls')->name('sales.calls.')->group(function () {
        Route::get('/', [SalesCallController::class, 'index'])->name('index');
        Route::post('/', [SalesCallController::class, 'store'])->name('store');
        Route::get('/parent-users', [SalesCallController::class, 'getParentUsers'])->name('parent-users');
        Route::get('/parent-options', [SalesCallController::class, 'getParentOptions'])->name('parent-options');
        Route::get('/users', [SalesCallController::class, 'getUsers'])->name('users');
        Route::get('/{salesCall}', [SalesCallController::class, 'show'])->name('show');
        Route::put('/{salesCall}', [SalesCallController::class, 'update'])->name('update');
        Route::delete('/{salesCall}', [SalesCallController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/meetings')->name('sales.meetings.')->group(function () {
        Route::get('/', [SalesMeetingController::class, 'index'])->name('index');
        Route::post('/', [SalesMeetingController::class, 'store'])->name('store');
        Route::get('/parent-users', [SalesMeetingController::class, 'getParentUsers'])->name('parent-users');
        Route::get('/parent-options', [SalesMeetingController::class, 'getParentOptions'])->name('parent-options');
        Route::get('/users', [SalesMeetingController::class, 'getUsers'])->name('users');
        Route::get('/{salesMeeting}', [SalesMeetingController::class, 'show'])->name('show');
        Route::put('/{salesMeeting}', [SalesMeetingController::class, 'update'])->name('update');
        Route::delete('/{salesMeeting}', [SalesMeetingController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('sales/reports')->name('sales.reports.')->group(function () {
        Route::get('/quotes', [ReportController::class, 'quoteReports'])->name('quotes');
        Route::get('/orders', [ReportController::class, 'orderReports'])->name('orders');
        Route::get('/opportunities', [ReportController::class, 'opportunityReports'])->name('opportunities');
    });
});