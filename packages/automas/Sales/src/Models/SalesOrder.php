<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class SalesOrder extends Model
{
    use HasFactory;

    protected $table = 'sales_orders';

    protected $fillable = [
        'order_number',
        'name',
        'quote_id',
        'opportunity_id',
        'status',
        'account_id',
        'customer_id',
        'warehouse_id',
        'order_date',
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
        'is_invoiced',
        'invoice_id',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'is_invoiced' => 'boolean',
        ];
    }

    public static function generateOrderNumber($user_id=null)
    {
        $prefix = company_setting('order_prefix', $user_id ?? creatorId()) ?: 'ORD';

        // Get the last order number with this prefix
        $lastOrder = self::where('created_by', $user_id ?? creatorId())
            ->where('order_number', 'LIKE', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();
        
        if ($lastOrder) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastOrder->order_number, strlen($prefix));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        // Format with leading zeros (7 digits)
        return $prefix . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(SalesQuote::class, 'quote_id');
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(SalesOpportunity::class, 'opportunity_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
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

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class, 'order_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Warehouse::class, 'warehouse_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'customer_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(\App\Models\SalesInvoice::class, 'invoice_id');
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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber($order->created_by);
            }
        });
    }
}