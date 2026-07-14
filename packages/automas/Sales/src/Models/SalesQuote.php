<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Warehouse;

class SalesQuote extends Model
{
    use HasFactory;

    protected $table = 'sales_quotes';

    protected $fillable = [
        'quote_number',
        'name',
        'opportunity_id',
        'status',
        'account_id',
        'customer_id',
        'warehouse_id',
        'date_quoted',
        'expiry_date',
        'billing_address',
        'shipping_address',
        'billing_city',
        'billing_state',
        'shipping_city',
        'shipping_state',
        'billing_country',
        'billing_postal_code',
        'shipping_country',
        'shipping_postal_code',
        'billing_contact_id',
        'shipping_contact_id',
        'shipping_provider_id',
        'assign_user_id',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'description',
        'notes',
        'is_converted',
        'converted_salesorder_id',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date_quoted' => 'date',
            'expiry_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'is_converted' => 'boolean',
        ];
    }

    public static function generateQuoteNumber($user_id=null)
    {
        $prefix = company_setting('quote_prefix', $user_id ?? creatorId()) ?: 'QUO';

        // Get the last quote number with this prefix
        $lastQuote = self::where('created_by', $user_id ?? creatorId())
            ->where('quote_number', 'LIKE', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastQuote) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastQuote->quote_number, strlen($prefix));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        // Format with leading zeros (7 digits)
        return $prefix . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(SalesOpportunity::class, 'opportunity_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function billingContact(): BelongsTo
    {
        return $this->belongsTo(SalesContact::class, 'billing_contact_id');
    }

    public function shippingContact(): BelongsTo
    {
        return $this->belongsTo(SalesContact::class, 'shipping_contact_id');
    }

    public function shippingProvider(): BelongsTo
    {
        return $this->belongsTo(SalesShippingProvider::class, 'shipping_provider_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesQuoteItem::class, 'quote_id');
    }

    public function convertedSalesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'converted_salesorder_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Warehouse::class, 'warehouse_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'customer_id');
    }

    public function getTotal()
    {
        // Use calculated total_amount if available, otherwise sum items
        if ($this->total_amount > 0) {
            return $this->total_amount;
        }
        
        // Fallback to items sum for backward compatibility
        if (!$this->relationLoaded('items')) {
            $this->load('items');
        }
        return $this->items->sum('final_price');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now() && $this->status !== 'accepted';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quote) {
            if (empty($quote->quote_number)) {
                $quote->quote_number = static::generateQuoteNumber($quote->created_by);
            }
        });
    }
}