<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesQuoteItem;

class CreateSalesQuoteItem
{
    use Dispatchable;

    public function __construct(public SalesQuoteItem $quoteItem, public Request $request)
    {
    }
}