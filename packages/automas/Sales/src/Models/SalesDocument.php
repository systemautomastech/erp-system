<?php

namespace Automas\Sales\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class SalesDocument extends Model
{
    use HasFactory;

    protected $table = 'sales_documents';

    protected $fillable = [
        'name',
        'account_id',
        'folder_id',
        'type_id',
        'opportunity_id',
        'status',
        'publish_date',
        'expiration_date',
        'attachment',
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
            'publish_date' => 'date',
            'expiration_date' => 'date',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(SalesAccount::class, 'account_id');
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(SalesDocumentFolder::class, 'folder_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(SalesDocumentType::class, 'type_id');
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(SalesOpportunity::class, 'opportunity_id');
    }

    public function assignUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assign_user_id');
    }

    public function streams()
    {
        return $this->hasMany(SalesStream::class, 'module_id')
                    ->where('module_type', 'document')
                    ->with('creator')
                    ->latest();
    }

    public function accounts()
    {
        return $this->hasMany(SalesAccount::class, 'sales_document_id');
    }
}