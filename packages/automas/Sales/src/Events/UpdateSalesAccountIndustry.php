<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Automas\Sales\Models\SalesAccountIndustry;

class UpdateSalesAccountIndustry
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public SalesAccountIndustry $accountIndustry
    ) {}
}