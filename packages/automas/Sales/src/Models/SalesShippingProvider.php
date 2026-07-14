<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalesShippingProvider extends Model
{
    use HasFactory;

    protected $table = 'sales_shipping_providers';

    protected $fillable = [
        'name',
        'website',
        'creator_id',
        'created_by',
    ];
}