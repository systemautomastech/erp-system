<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesAccount extends Model
{
    use HasFactory;

    protected $table = 'sales_accounts';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'website',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_country',
        'billing_postal_code',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_country',
        'shipping_postal_code',
        'assign_user_id',
        'type_id',
        'industry_id',
        'sales_document_id',
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

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function accountType(): BelongsTo
    {
        return $this->belongsTo(SalesAccountType::class, 'type_id');
    }

    public function accountIndustry(): BelongsTo
    {
        return $this->belongsTo(SalesAccountIndustry::class, 'industry_id');
    }


    public function contacts(): HasMany
    {
        return $this->hasMany(SalesContact::class, 'account_id');
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(SalesOpportunity::class, 'account_id');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(SalesCase::class, 'account_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(SalesQuote::class, 'account_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(SalesOrder::class, 'account_id');
    }



    public function calls(): HasMany
    {
        return $this->hasMany(SalesCall::class, 'account_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(SalesDocument::class, 'account_id');
    }

    public function salesDocument(): BelongsTo
    {
        return $this->belongsTo(SalesDocument::class, 'sales_document_id');
    }

    public function streams(): HasMany
    {
        return $this->hasMany(SalesStream::class, 'module_id')
            ->where('module_type', 'account')
            ->with('creator')
            ->latest();
    }
}
