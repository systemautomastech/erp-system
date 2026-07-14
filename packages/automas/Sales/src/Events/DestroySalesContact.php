<?php

namespace Automas\Sales\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Automas\Sales\Models\SalesContact;

class DestroySalesContact
{
    use Dispatchable;

    public function __construct(
        public SalesContact $contact
    ) {}
}