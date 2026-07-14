<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesShippingProvider;

class DestroySalesShippingProvider
{
    use Dispatchable;

    public function __construct(
        public SalesShippingProvider $shippingProvider
    ) {}
}