<?php

namespace Automas\Sales\Http\Controllers;

use Automas\Sales\Models\SalesDocumentType;
use Automas\Sales\Http\Requests\StoreSalesDocumentTypeRequest;
use Automas\Sales\Http\Requests\UpdateSalesDocumentTypeRequest;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class SalesDocumentTypeController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-document-types')){
            $salesdocumenttypes = SalesDocumentType::select('id', 'name', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-document-types')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-document-types')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/SalesDocumentTypes/Index', [
                'salesdocumenttypes' => $salesdocumenttypes,

            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesDocumentTypeRequest $request)
    {
        if(Auth::user()->can('create-sales-document-types')){
            $validated = $request->validated();



            $salesdocumenttype = new SalesDocumentType();
            $salesdocumenttype->name = $validated['name'];

            $salesdocumenttype->creator_id = Auth::id();
            $salesdocumenttype->created_by = creatorId();
            $salesdocumenttype->save();

            return redirect()->route('sales.sales-document-types.index')->with('success', __('The document type has been created successfully.'));
        }
        else{
            return redirect()->route('sales.sales-document-types.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesDocumentTypeRequest $request, SalesDocumentType $salesdocumenttype)
    {
        if(Auth::user()->can('edit-sales-document-types')){
            $validated = $request->validated();



            $salesdocumenttype->name = $validated['name'];

            $salesdocumenttype->save();

            return redirect()->route('sales.sales-document-types.index')->with('success', __('The document type details are updated successfully.'));
        }
        else{
            return redirect()->route('sales.sales-document-types.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesDocumentType $salesdocumenttype)
    {
        if(Auth::user()->can('delete-sales-document-types')){
            $salesdocumenttype->delete();

            return redirect()->route('sales.sales-document-types.index')->with('success', __('The document type has been deleted.'));
        }
        else{
            return redirect()->route('sales.sales-document-types.index')->with('error', __('Permission denied'));
        }
    }


}