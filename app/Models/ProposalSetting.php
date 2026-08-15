<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalSetting extends Model
{
    protected $fillable = [
        'option',
        'value',
        'creator_id',
    ];

    public static function getSettings($creatorId = null)
    {
        $creatorId = $creatorId ?? auth()->id();

        $defaults = [
            'proposal_prefix' => 'PRO',
            'proposal_starting_number' => '1',
            'default_validity_days' => '30',
            'logo_image' => '',
            'background_image' => '',
            'template_color' => '#E9591C',
            'default_terms' => '<h2>Terms & Conditions</h2><p>1. Proposal is valid for 30 days from issuance.<br/>2. Payment terms: 50% deposit upon acceptance, 50% on project completion.</p>',
        ];

        if (!$creatorId) {
            return $defaults;
        }

        $dbSettings = static::where('creator_id', $creatorId)
            ->pluck('value', 'option')
            ->toArray();

        return array_merge($defaults, $dbSettings);
    }

    public static function setSettings(array $settings, $creatorId = null)
    {
        $creatorId = $creatorId ?? auth()->id();

        if (!$creatorId) {
            return;
        }

        foreach ($settings as $option => $value) {
            static::updateOrCreate(
                [
                    'creator_id' => $creatorId,
                    'option' => $option,
                ],
                [
                    'value' => is_array($value) ? json_encode($value) : (string) ($value ?? ''),
                ]
            );
        }
    }
}
