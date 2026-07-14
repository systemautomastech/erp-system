<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesDocument;

class CreateSalesDocument
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesDocument $salesDocument
    ) {}
}