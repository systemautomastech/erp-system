<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'account_id',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'assign_user_id',
        'description',
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

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(SalesOpportunity::class, 'contact_id');
    }

    public function streams(): HasMany
    {
        return $this->hasMany(SalesStream::class, 'module_id')
            ->where('module_type', 'contact')
            ->with('creator')
            ->latest();
    }
}
