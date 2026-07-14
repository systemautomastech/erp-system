<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class SalesOpportunity extends Model
{
    use HasFactory;

    protected $table = 'sales_opportunities';

    protected $fillable = [
        'name',
        'account_id',
        'contact_id',
        'stage_id',
        'amount',
        'expected_amount',
        'lead_source',
        'probability',
        'close_date',
        'next_followup_date',
        'next_step',
        'lost_reason',
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
            'amount' => 'decimal:2',
            'expected_amount' => 'decimal:2',
            'probability' => 'integer',
            'close_date' => 'date',
            'next_followup_date' => 'date',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(SalesContact::class, 'contact_id');
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(SalesOpportunityStage::class, 'stage_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function documents()
    {
        return $this->hasMany(SalesDocument::class, 'opportunity_id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(SalesQuote::class, 'opportunity_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(SalesOrder::class, 'opportunity_id');
    }



    public function streams()
    {
        return $this->hasMany(SalesStream::class, 'module_id')
                    ->where('module_type', 'opportunity')
                    ->with('creator')
                    ->latest();
    }
}