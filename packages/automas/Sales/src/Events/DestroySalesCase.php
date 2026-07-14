<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesCase;

class DestroySalesCase
{
    use Dispatchable;

    public function __construct(
        public SalesCase $salesCase,
    ) {}
}