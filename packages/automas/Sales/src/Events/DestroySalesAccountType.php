<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesAccountType;

class DestroySalesAccountType
{
    use Dispatchable;

    public function __construct(
        public SalesAccountType $accountType
    ) {}
}