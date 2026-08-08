<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalSetting extends Model
{
    protected $fillable = [
        'proposal_prefix',
        'proposal_starting_number',
        'default_validity_days',
        'logo_image',
        'background_image',
        'default_terms',
        'creator_id',
        'created_by',
    ];
}
