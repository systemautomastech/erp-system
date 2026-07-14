<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesAccountType;

class UpdateSalesAccountType
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesAccountType $accountType
    ) {}
}