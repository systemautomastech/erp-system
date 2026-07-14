<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class SalesCase extends Model
{
    use HasFactory;

    protected $table = 'sales_cases';

    protected $fillable = [
        'case_number',
        'name',
        'status',
        'priority',
        'description',
        'attachment',
        'account_id',
        'contact_id',
        'case_type_id',
        'assign_user_id',
        'creator_id',
        'created_by',
    ];

    public static function generateCaseNumber($user_id=null)
    {
        $prefix = company_setting('case_prefix', $user_id ?? creatorId()) ?: 'CASE';

        // Get the last case number with this prefix
        $lastCase = self::where('created_by', $user_id ?? creatorId())
            ->where('case_number', 'LIKE', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastCase) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastCase->case_number, strlen($prefix));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        // Format with leading zeros (7 digits)
        return $prefix . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(SalesContact::class, 'contact_id');
    }

    public function caseType(): BelongsTo
    {
        return $this->belongsTo(SalesCaseType::class, 'case_type_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function streams(): HasMany
    {
        return $this->hasMany(SalesStream::class, 'module_id')
                    ->where('module_type', 'case')
                    ->with('creator')
                    ->latest();
    }
}