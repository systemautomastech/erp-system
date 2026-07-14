<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesOpportunity;

class DestroySalesOpportunity
{
    use Dispatchable;

    public function __construct(
        public SalesOpportunity $opportunity
    ) {}
}