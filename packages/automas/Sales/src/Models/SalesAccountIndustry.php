<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalesAccountIndustry extends Model
{
    use HasFactory;

    protected $table = 'sales_account_industries';

    protected $fillable = [
        'name',
        'is_active',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}