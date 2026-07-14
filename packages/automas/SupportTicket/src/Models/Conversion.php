<?php

namespace Automas\SupportTicket\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Conversion extends Model
{
    protected $table = 'support_ticket_conversions';
    
    protected $fillable = [
        'ticket_id',
        'sender',
        'description',
        'attachments',
        'creator_id',
        'created_by'
    ];

    protected $casts = [
        'attachments' => 'json'
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function replyBy()
    {
        if ($this->sender === 'admin') {
            $user = $this->creator ?: $this->createdBy;
            return $user ?: (object)['name' => 'Admin'];
        } else {
            return $this->ticket ? (object)['name' => $this->ticket->name] : (object)['name' => 'User'];
        }
    }

    public function getFormattedAttachmentsAttribute()
    {
        if (is_string($this->attributes['attachments'])) {
            $decoded = json_decode($this->attributes['attachments'], true);
            return is_array($decoded) ? $decoded : [];
        }
        return is_array($this->attachments) ? $this->attachments : [];
    }
}