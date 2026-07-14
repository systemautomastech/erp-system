<?php

namespace Automas\SupportTicket\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;
    protected $fillable = [
        'ticket_id',
        'name',
        'email',
        'user_id',
        'account_type',
        'category',
        'subject',
        'status',
        'description',
        'attachments',
        'note',
        'creator_id',
        'created_by'
    ];

    protected $casts = [
        'attachments' => 'json'
    ];

    public function getFormattedAttachmentsAttribute()
    {
        if (is_string($this->attributes['attachments'])) {
            $decoded = json_decode($this->attributes['attachments'], true);
            return is_array($decoded) ? $decoded : [];
        }
        return is_array($this->attachments) ? $this->attachments : [];
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(Conversion::class, 'ticket_id')->orderBy('id');
    }

    public function tcategory(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}