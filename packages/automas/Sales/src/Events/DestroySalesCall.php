<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesCall;

class DestroySalesCall
{
    use Dispatchable;

    public function __construct(
        public SalesCall $salesCall
    ) {}
}