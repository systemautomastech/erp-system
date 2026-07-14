<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class SalesDocumentFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent',
        'description',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'parent' => 'integer'
        ];
    }




}