<?php

namespace App\Services;

use App\Models\Warehouse;
use Automas\ProductService\Models\ProductServiceItem;

class WarehouseService
{
    /**
     * Get active warehouses for quotation and invoice dropdowns
     */
    public function getActiveWarehouses()
    {
        return Warehouse::where('is_active', true)
            ->select('id', 'name', 'address')
            ->where('created_by', creatorId())
            ->get();
    }

    /**
     * Get products and stocks available for the specified warehouse
     */
    public function getWarehouseProducts(?int $warehouseId = null)
    {
        $productsQuery = ProductServiceItem::with('unitRelation:id,unit_name')
            ->select('id', 'name', 'sku', 'description', 'sale_price', 'long_description', 'tax_ids', 'unit', 'type')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('created_by', creatorId())
                    ->orWhere('creator_id', creatorId());
            });

        if ($warehouseId) {
            $productsQuery->where(function ($q) use ($warehouseId) {
                $q->whereHas('warehouseStocks', function ($stockQuery) use ($warehouseId) {
                    $stockQuery->where('warehouse_id', $warehouseId)->where('quantity', '>', 0);
                })->orWhere('type', 'service')
                    ->orWhereNull('type')
                    ->orWhereDoesntHave('warehouseStocks');
            })->with([
                'warehouseStocks' => fn($q) => $q->where('warehouse_id', $warehouseId)
            ]);
        }

        return $productsQuery->get()->map(function ($product) {
            $stockQuantity = $product->relationLoaded('warehouseStocks') && $product->warehouseStocks->isNotEmpty()
                ? $product->warehouseStocks->first()->quantity
                : 0;

            $unitName = $product->unitRelation?->unit_name ?? (is_numeric($product->unit) ? '' : ($product->unit ?? ''));

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'long_description' => $product->long_description,
                'sku' => $product->sku,
                'sale_price' => $product->sale_price,
                'unit' => $product->unit,
                'unit_name' => $unitName,
                'type' => $product->type,
                'stock_quantity' => $stockQuantity,
                'taxes' => $product->taxes->map(fn($tax) => [
                    'id' => $tax->id,
                    'tax_name' => $tax->tax_name,
                    'rate' => $tax->rate
                ])
            ];
        });
    }
}
