<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesDocument;

class DestroySalesDocument
{
    use Dispatchable;

    public function __construct(
        public SalesDocument $salesDocument
    ) {}
}