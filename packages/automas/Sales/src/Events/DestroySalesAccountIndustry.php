<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesAccountIndustry;

class DestroySalesAccountIndustry
{
    use Dispatchable;

    public function __construct(
        public SalesAccountIndustry $accountIndustry
    ) {}
}