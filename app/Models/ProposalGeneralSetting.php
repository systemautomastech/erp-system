<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalGeneralSetting extends Model
{
     protected $fillable = [
        'proposal_number_prefix',
        'next_starting_number',
        'validity_period_days',
    ];
}
