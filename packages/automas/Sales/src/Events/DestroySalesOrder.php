<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesOrder;

class DestroySalesOrder
{
    use Dispatchable;

    public function __construct(
        public SalesOrder $salesOrder,
    ) {}
}