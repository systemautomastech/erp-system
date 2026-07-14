<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesAccountIndustry;
use Automas\Sales\Events\CreateSalesAccountIndustry;
use Automas\Sales\Events\UpdateSalesAccountIndustry;
use Automas\Sales\Events\DestroySalesAccountIndustry;

class AccountIndustryController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-account-industries')) {
            $accountIndustries = SalesAccountIndustry::select('id', 'name', 'is_active', 'created_at')
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-sales-account-industries')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-sales-account-industries')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/AccountIndustries/Index', [
                'accountIndustries' => $accountIndustries,
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(Request $request)
    {
        if (Auth::user()->can('create-sales-account-industries')) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $accountIndustry = new SalesAccountIndustry();
            $accountIndustry->name = $validated['name'];
            $accountIndustry->is_active = $validated['is_active'];
            $accountIndustry->creator_id = Auth::id();
            $accountIndustry->created_by = creatorId();
            $accountIndustry->save();

            CreateSalesAccountIndustry::dispatch($request, $accountIndustry);

            return back()->with('success', __('The account industry has been created successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(Request $request, SalesAccountIndustry $accountIndustry)
    {
        if (Auth::user()->can('edit-sales-account-industries')) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $accountIndustry->name = $validated['name'];
            $accountIndustry->is_active = $validated['is_active'];
            $accountIndustry->save();

            UpdateSalesAccountIndustry::dispatch($request, $accountIndustry);

            return back()->with('success', __('The account industry details are updated successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesAccountIndustry $accountIndustry)
    {
        if (Auth::user()->can('delete-sales-account-industries')) {
            DestroySalesAccountIndustry::dispatch($accountIndustry);

            $accountIndustry->delete();

            return back()->with('success', __('The account industry has been deleted.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }
}
