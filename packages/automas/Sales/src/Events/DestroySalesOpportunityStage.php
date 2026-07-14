<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesOpportunityStage;

class DestroySalesOpportunityStage
{
    use Dispatchable;

    public function __construct(
        public SalesOpportunityStage $opportunityStage
    ) {}
}