<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesCaseType;

class DestroySalesCaseType
{
    use Dispatchable;

    public function __construct(
        public SalesCaseType $salesCaseType
    ) {}
}