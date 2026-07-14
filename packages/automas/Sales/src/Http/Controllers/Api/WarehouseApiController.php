<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Automas\ProductService\Models\ProductServiceItem;
use Illuminate\Support\Facades\Validator;

class WarehouseApiController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        try {
            $warehouses = Warehouse::where('is_active', true)
                ->where('created_by', creatorId())
                ->select(
                    'id',
                    'name',
                    'address',
                    'city'
                )->get();

            return $this->successResponse($warehouses, 'Products retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
    public function getProducts(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'warehouse_id' => 'required|exists:warehouses,id',

            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }
            $warehouseId = $request->warehouse_id;

            $products = ProductServiceItem::select('id', 'name', 'sku', 'sale_price', 'tax_ids', 'unit', 'type')
                ->where('is_active', true)
                ->where('created_by', creatorId())
                ->whereHas('warehouseStocks', function ($q) use ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId)
                        ->where('quantity', '>', 0);
                })
                ->get()
                ->map(function ($product) {
                    return [
                        'id'         => $product->id,
                        'name'       => $product->name,
                        'sku'        => $product->sku,
                        'sale_price' => $product->sale_price,
                        'unit'       => $product->unit,
                        'type'       => $product->type,
                        'taxes'      => $product->taxes->map(function ($tax) {
                            return [
                                'id'       => $tax->id,
                                'tax_name' => $tax->tax_name,
                                'tax_rate'     => $tax->rate
                            ];
                        })
                    ];
                });
            return $this->successResponse($products, 'Products retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
}
