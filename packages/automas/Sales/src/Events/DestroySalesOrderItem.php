<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesOrderItem;

class DestroySalesOrderItem
{
    use Dispatchable;

    public function __construct(
        public SalesOrderItem $salesOrderItem,
    ) {}
}