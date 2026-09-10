<?php

namespace Automas\SalesOrder\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;

class SalesOrder extends Model
{
    use HasFactory;

    protected $table = 'sales_orders';

    // Delivery status constants
    const DELIVERY_STATUS_PENDING  = 'pending';
    const DELIVERY_STATUS_PARTIAL  = 'partial';
    const DELIVERY_STATUS_FULL     = 'delivered';

    // Commercial status constants
    const STATUS_DRAFT      = 'draft';
    const STATUS_CONFIRMED  = 'confirmed';
    const STATUS_CANCELLED  = 'cancelled';

    protected $fillable = [
        'order_number',
        'name',
        'quote_id',           // references sales_quotations.id (no FK constraint)
        'status',
        'delivery_status',
        'customer_id',
        'warehouse_id',
        'order_date',
        'expected_delivery_date',
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
        'description',
        'notes',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'is_invoiced',
        'invoice_id',
        'confirmed_at',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'order_date'             => 'date',
            'expected_delivery_date' => 'date',
            'confirmed_at'           => 'datetime',
            'subtotal'               => 'decimal:2',
            'tax_amount'             => 'decimal:2',
            'discount_amount'        => 'decimal:2',
            'total_amount'           => 'decimal:2',
            'is_invoiced'            => 'boolean',
        ];
    }

    // ─── Number Generation ──────────────────────────────────────────────────

    public static function generateOrderNumber($createdBy = null): string
    {
        $createdBy = $createdBy ?? creatorId();

        return DB::transaction(function () use ($createdBy) {
            $settings = SalesOrderSetting::getSettings($createdBy);
            $prefix   = $settings['so_prefix'] ?? 'SO';
            $next     = (int) ($settings['so_starting_number'] ?? 1);

            // Atomically bump the number
            SalesOrderSetting::setSettings(
                ['so_starting_number' => (string) ($next + 1)],
                $createdBy
            );

            return $prefix . str_pad($next, 5, '0', STR_PAD_LEFT);
        });
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────

    /**
     * Scope records visible to the current auth user.
     * Mirrors the WorkDo pattern: manage-any = all workspace records,
     * manage-own = own + assigned, otherwise nothing.
     */
    public function scopeAccessible($query)
    {
        $user = auth()->user();

        if ($user->can('manage-any-sales-orders')) {
            // All records in this workspace
            return $query->where('sales_orders.created_by', creatorId());
        }

        if ($user->can('manage-own-sales-orders')) {
            // Records created by or assigned to the user
            return $query->where('sales_orders.created_by', creatorId())
                ->where(function ($q) use ($user) {
                    $q->where('sales_orders.creator_id', $user->id)
                      ->orWhereHas('assignedUsers', fn($sq) => $sq->where('users.id', $user->id));
                });
        }

        // No access
        return $query->whereRaw('1 = 0');
    }

    // ─── Relationships ───────────────────────────────────────────────────────

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class, 'order_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(SalesOrderDelivery::class, 'sales_order_id')
                    ->where('status', '!=', 'cancelled');
    }

    public function allDeliveries(): HasMany
    {
        return $this->hasMany(SalesOrderDelivery::class, 'sales_order_id');
    }

    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'sales_order_users', 'sales_order_id', 'user_id')
                    ->withTimestamps();
    }

    // Loose reference — no FK enforced
    public function quotation()
    {
        // Use class string so this addon doesn't hard-depend on Quotation addon
        if (class_exists(\Automas\Quotation\Models\SalesQuotation::class)) {
            return $this->belongsTo(\Automas\Quotation\Models\SalesQuotation::class, 'quote_id');
        }
        return null;
    }

    // ─── Computed Helpers ────────────────────────────────────────────────────

    public function getTotal(): float
    {
        if ($this->total_amount > 0) {
            return (float) $this->total_amount;
        }
        if (!$this->relationLoaded('items')) {
            $this->load('items');
        }
        return (float) $this->items->sum('final_price');
    }

    /**
     * Recalculate delivery status based on actual delivery quantities.
     * Called after every delivery create/cancel.
     */
    public function recalculateDeliveryStatus(): void
    {
        $items = $this->items()->with([
            'deliveryItems' => fn($q) => $q->whereHas(
                'delivery',
                fn($dq) => $dq->where('status', '!=', 'cancelled')
            )
        ])->get();

        $totalOrdered  = $items->sum('quantity');
        $totalDelivered = $items->sum(fn($item) => $item->deliveryItems->sum('quantity'));

        if ($totalDelivered <= 0) {
            $deliveryStatus = self::DELIVERY_STATUS_PENDING;
        } elseif ($totalDelivered >= $totalOrdered) {
            $deliveryStatus = self::DELIVERY_STATUS_FULL;
        } else {
            $deliveryStatus = self::DELIVERY_STATUS_PARTIAL;
        }

        $this->update(['delivery_status' => $deliveryStatus]);
    }

    // ─── Lifecycle Hooks ────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber($order->created_by);
            }
            if (empty($order->delivery_status)) {
                $order->delivery_status = self::DELIVERY_STATUS_PENDING;
            }
        });
    }
}