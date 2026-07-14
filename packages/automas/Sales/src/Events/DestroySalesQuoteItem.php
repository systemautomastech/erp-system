<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesQuoteItem;

class DestroySalesQuoteItem
{
    use Dispatchable;

    public function __construct(public SalesQuoteItem $quoteItem)
    {
    }
}