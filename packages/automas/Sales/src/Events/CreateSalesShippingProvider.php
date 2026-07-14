<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesShippingProvider;

class CreateSalesShippingProvider
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesShippingProvider $shippingProvider
    ) {}
}