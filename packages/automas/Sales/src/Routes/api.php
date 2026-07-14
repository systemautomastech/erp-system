<?php

use App\Models\Warehouse;
use Illuminate\Support\Facades\Route;
use Automas\Sales\Http\Controllers\Api\DashboardApiController;
use Automas\Sales\Http\Controllers\Api\RequestdataApiController;
use Automas\Sales\Http\Controllers\Api\SalesOpportunityApiController;
use Automas\Sales\Http\Controllers\Api\SalesQuoteApiController;
use Automas\Sales\Http\Controllers\Api\SalesOrderApiController;
use Automas\Sales\Http\Controllers\Api\SalesMeetingApiController;
use Automas\Sales\Http\Controllers\Api\WarehouseApiController;

Route::prefix('api')->middleware(['api.json'])->group(function () {
    Route::group(['middleware' => ['auth:sanctum'], 'prefix' => 'sales'], function () {

        // Dashboard API Routes
        Route::get('home', [DashboardApiController::class, 'index']);

        //  get all dropdown data
        Route::get('RequestData', [RequestdataApiController::class, 'index']);
        
        // get data sales order wise
        Route::get('sales-orders/{id}', [RequestdataApiController::class, 'getSalesOrderData']);
        // get parent records by type
        Route::post('parent-records', [RequestdataApiController::class, 'getParentRecords']);
        
        // get data quote wise
        Route::get('quotes/{id}', [RequestdataApiController::class, 'getQuoteData']);
        
        // get warehouses
        Route::get('warehouses', [WarehouseApiController::class, 'index']);
        Route::post('get-warehouse-products', [WarehouseApiController::class, 'getProducts']);

        // Opportunities API Routes
        Route::get('opportunities', [SalesOpportunityApiController::class, 'index']);
        Route::post('opportunitity/store', [SalesOpportunityApiController::class, 'store']);
        Route::post('opportunities/update/{id}', [SalesOpportunityApiController::class, 'update']);
        Route::delete('opportunities/delete/{id}', [SalesOpportunityApiController::class, 'destroy']);

        // Quotes API Routes
        Route::get('quotes', [SalesQuoteApiController::class, 'index']);
        Route::post('quotes/store', [SalesQuoteApiController::class, 'store']);
        Route::post('quotes/update/{id}', [SalesQuoteApiController::class, 'update']);
        Route::delete('quotes/destroy/{id}', [SalesQuoteApiController::class, 'destroy']);

        // Sales Orders API Routes
        Route::get('sales-orders', [SalesOrderApiController::class, 'index']);
        Route::post('sales-order/store', [SalesOrderApiController::class, 'store']);
        Route::post('sales-order/update/{id}', [SalesOrderApiController::class, 'update']);
        Route::delete('sales-order/delete/{id}', [SalesOrderApiController::class, 'destroy']);

        // Meetings API Routes
        Route::get('meetings', [SalesMeetingApiController::class, 'index']);
        Route::post('meeting/store', [SalesMeetingApiController::class, 'store']);
        Route::post('meeting/update/{id}', [SalesMeetingApiController::class, 'update']);
        Route::delete('meeting/destroy/{id}', [SalesMeetingApiController::class, 'destroy']);
    });
});
