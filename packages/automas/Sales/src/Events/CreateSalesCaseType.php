<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesCaseType;

class CreateSalesCaseType
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesCaseType $salesCaseType
    ) {}
}