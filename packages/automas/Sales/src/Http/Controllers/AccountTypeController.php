<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesAccountType;
use Automas\Sales\Events\CreateSalesAccountType;
use Automas\Sales\Events\UpdateSalesAccountType;
use Automas\Sales\Events\DestroySalesAccountType;

class AccountTypeController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-account-types')){
            $accountTypes = SalesAccountType::select('id', 'name', 'is_active', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-account-types')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-account-types')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/AccountTypes/Index', [
                'accountTypes' => $accountTypes,
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(Request $request)
    {
        if(Auth::user()->can('create-sales-account-types')){
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $accountType = new SalesAccountType();
            $accountType->name = $validated['name'];
            $accountType->is_active = $validated['is_active'];
            $accountType->creator_id = Auth::id();
            $accountType->created_by = creatorId();
            $accountType->save();

            CreateSalesAccountType::dispatch($request, $accountType);

            return back()->with('success', __('The account type has been created successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function update(Request $request, SalesAccountType $accountType)
    {
        if(Auth::user()->can('edit-sales-account-types')){
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $accountType->name = $validated['name'];
            $accountType->is_active = $validated['is_active'];
            $accountType->save();

            UpdateSalesAccountType::dispatch($request, $accountType);

            return back()->with('success', __('The account type details are updated successfully.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesAccountType $accountType)
    {
        if(Auth::user()->can('delete-sales-account-types')){
            DestroySalesAccountType::dispatch($accountType);

            $accountType->delete();

            return back()->with('success', __('The account type has been deleted.'));
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }
}