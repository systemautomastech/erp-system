<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesShippingProvider;
use Automas\Sales\Http\Requests\StoreSalesShippingProviderRequest;
use Automas\Sales\Http\Requests\UpdateSalesShippingProviderRequest;
use Automas\Sales\Events\CreateSalesShippingProvider;
use Automas\Sales\Events\UpdateSalesShippingProvider;
use Automas\Sales\Events\DestroySalesShippingProvider;

class SalesShippingProviderController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-shipping-providers')){
            $shippingProviders = SalesShippingProvider::select('id', 'name', 'website', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-shipping-providers')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-shipping-providers')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/ShippingProviders/Index', [
                'shippingProviders' => $shippingProviders,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesShippingProviderRequest $request)
    {
        if(Auth::user()->can('create-shipping-providers')){
            $validated = $request->validated();

            $shippingProvider = new SalesShippingProvider();
            $shippingProvider->name = $validated['name'];
            $shippingProvider->website = $validated['website'] ?? null;
            $shippingProvider->creator_id = Auth::id();
            $shippingProvider->created_by = creatorId();
            $shippingProvider->save();

            CreateSalesShippingProvider::dispatch($request, $shippingProvider);

            return redirect()->route('sales.shipping-providers.index')->with('success', __('The sales shipping provider has been created successfully.'));
        } else {
            return redirect()->route('sales.shipping-providers.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesShippingProviderRequest $request, SalesShippingProvider $shippingProvider)
    {
        if(Auth::user()->can('edit-shipping-providers')){
            $validated = $request->validated();

            $shippingProvider->name = $validated['name'];
            $shippingProvider->website = $validated['website'] ?? null;
            $shippingProvider->save();

            UpdateSalesShippingProvider::dispatch($request, $shippingProvider);

            return redirect()->route('sales.shipping-providers.index')->with('success', __('The sales shipping provider details are updated successfully.'));
        } else {
            return redirect()->route('sales.shipping-providers.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesShippingProvider $shippingProvider)
    {
        if(Auth::user()->can('delete-shipping-providers')){
            DestroySalesShippingProvider::dispatch($shippingProvider);

            $shippingProvider->delete();

            return redirect()->route('sales.shipping-providers.index')->with('success', __('The sales shipping provider has been deleted.'));
        } else {
            return redirect()->route('sales.shipping-providers.index')->with('error', __('Permission denied'));
        }
    }
}