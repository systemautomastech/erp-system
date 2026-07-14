<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class SalesCall extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'start_date',
        'end_date',
        'direction',
        'parent_type',
        'parent_id',
        'account_id',
        'assigned_user_id',
        'description',
        'attendees_users',
        'attendees_contacts',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'attendees_users' => 'array',
            'attendees_contacts' => 'array',
        ];
    }

    public function account()
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function assignUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parent()
    {
        return $this->morphTo();
    }
}