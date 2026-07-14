<?php

namespace Automas\Sales\Http\Controllers;

use Automas\Sales\Models\SalesCaseType;
use Automas\Sales\Http\Requests\StoreCaseTypeRequest;
use Automas\Sales\Http\Requests\UpdateCaseTypeRequest;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Events\CreateSalesCaseType;
use Automas\Sales\Events\UpdateSalesCaseType;
use Automas\Sales\Events\DestroySalesCaseType;


class SalesCaseTypeController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-case-types')){
            $casetypes = SalesCaseType::select('id', 'type', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-case-types')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-case-types')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/CaseTypes/Index', [
                'casetypes' => $casetypes,

            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreCaseTypeRequest $request)
    {
        if(Auth::user()->can('create-sales-case-types')){
            $validated = $request->validated();



            $casetype = new SalesCaseType();
            $casetype->type = $validated['type'];
            $casetype->creator_id = Auth::id();
            $casetype->created_by = creatorId();
            $casetype->save();

            CreateSalesCaseType::dispatch($request, $casetype);

            return redirect()->route('sales.case-types.index')->with('success', __('The case type has been created successfully.'));
        }
        else{
            return redirect()->route('sales.case-types.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateCaseTypeRequest $request, SalesCaseType $casetype)
    {
        if(Auth::user()->can('edit-sales-case-types')){
            $validated = $request->validated();



            $casetype->type = $validated['type'];
            $casetype->save();

            UpdateSalesCaseType::dispatch($request, $casetype);

            return redirect()->route('sales.case-types.index')->with('success', __('The case type details are updated successfully.'));
        }
        else{
            return redirect()->route('sales.case-types.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesCaseType $casetype)
    {
        if(Auth::user()->can('delete-sales-case-types')){
            DestroySalesCaseType::dispatch($casetype);
            
            $casetype->delete();

            return redirect()->route('sales.case-types.index')->with('success', __('The case type has been deleted.'));
        }
        else{
            return redirect()->route('sales.case-types.index')->with('error', __('Permission denied'));
        }
    }


}