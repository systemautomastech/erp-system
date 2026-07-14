<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesQuote;

class DestroySalesQuote
{
    use Dispatchable;

    public function __construct(
        public SalesQuote $quote
    ) {}
}