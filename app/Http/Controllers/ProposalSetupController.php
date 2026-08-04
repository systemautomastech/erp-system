<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProposalSetupController extends Controller
{
    public function generalSettings()
    {
        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => 'general-settings',
        ]);
    }

    public function templateBranding()
    {
        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => 'template-branding',
        ]);
    }

    public function defaultTerms()
    {
        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => 'default-terms',
        ]);
    }

    public function defaultPages()
    {
        return Inertia::render('SalesProposalSetup/Index', [
            'activeTab' => 'default-pages',
        ]);
    }
}
