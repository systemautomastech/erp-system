<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesQuoteItem extends Model
{
    use HasFactory;

    protected $table = 'sales_quote_items';

    protected $fillable = [
        'quote_id',
        'product_id',
        'quantity',
        'unit_price',
        'discount_percentage',
        'discount',
        'tax_percentage',
        'tax_amount',
        'description',
        'total_price',
        'final_price',
        'total_amount',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax_percentage' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'final_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(SalesQuote::class, 'quote_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\Automas\ProductService\Models\ProductServiceItem::class, 'product_id');
    }

    public function taxes(): HasMany
    {
        return $this->hasMany(SalesQuoteItemTax::class, 'item_id');
    }

    public function calculateAmounts()
    {
        $lineTotal = $this->quantity * $this->unit_price;
        $this->discount = ($lineTotal * $this->discount_percentage) / 100;
        $afterDiscount = $lineTotal - $this->discount;
        $this->tax_amount = ($afterDiscount * $this->tax_percentage) / 100;
        $this->total_amount = $afterDiscount + $this->tax_amount;
        $this->final_price = $this->total_amount; // For backward compatibility
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->calculateAmounts();
        });
    }
}