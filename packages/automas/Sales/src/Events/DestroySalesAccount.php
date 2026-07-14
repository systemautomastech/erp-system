<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesAccount;

class DestroySalesAccount
{
    use Dispatchable;

    public function __construct(
        public SalesAccount $account
    ) {}
}