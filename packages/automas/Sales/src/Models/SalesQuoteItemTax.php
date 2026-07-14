<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesQuoteItemTax extends Model
{
    use HasFactory;

    protected $table = 'sales_quote_item_taxes';

    protected $fillable = [
        'item_id',
        'tax_name',
        'tax_rate',
    ];

    protected function casts(): array
    {
        return [
            'tax_rate' => 'decimal:2',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(SalesQuoteItem::class, 'item_id');
    }
}