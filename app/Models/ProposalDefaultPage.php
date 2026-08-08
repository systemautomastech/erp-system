<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalDefaultPage extends Model
{
    protected $fillable = [
        'title',
        'content',
        'is_active',
        'order',
        'creator_id',
    ];
}
