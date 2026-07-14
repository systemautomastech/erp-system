<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class SalesStream extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'log_type',
        'file_upload',
        'remark',
        'module_type',
        'module_id',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'remark' => 'json',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}