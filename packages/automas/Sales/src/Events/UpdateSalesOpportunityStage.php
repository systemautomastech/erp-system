<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesOpportunityStage;

class UpdateSalesOpportunityStage
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesOpportunityStage $opportunityStage
    ) {}
}