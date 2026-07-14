<?php

namespace Automas\Sales\Http\Controllers;

use Automas\Sales\Http\Requests\StoreSalesDocumentFolderRequest;
use Automas\Sales\Http\Requests\UpdateSalesDocumentFolderRequest;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesDocumentFolder;

class SalesDocumentFolderController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-document-folders')){
            $salesdocumentfolders = SalesDocumentFolder::select('id', 'name', 'parent', 'description', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-document-folders')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-document-folders')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Sales/SystemSetup/SalesDocumentFolders/Index', [
                'salesdocumentfolders' => $salesdocumentfolders,
                'parentFolders' => $this->getFilteredParentFolders(),
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSalesDocumentFolderRequest $request)
    {
        if(Auth::user()->can('create-sales-document-folders')){
            $validated = $request->validated();



            $salesdocumentfolder = new SalesDocumentFolder();
            $salesdocumentfolder->name = $validated['name'];
            $salesdocumentfolder->parent = $validated['parent'];
            $salesdocumentfolder->description = $validated['description'];

            $salesdocumentfolder->creator_id = Auth::id();
            $salesdocumentfolder->created_by = creatorId();
            $salesdocumentfolder->save();

            return redirect()->route('sales.sales-document-folders.index')->with('success', __('The document folder has been created successfully.'));
        }
        else{
            return redirect()->route('sales.sales-document-folders.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateSalesDocumentFolderRequest $request, SalesDocumentFolder $salesdocumentfolder)
    {
        if(Auth::user()->can('edit-sales-document-folders')){
            $validated = $request->validated();



            $salesdocumentfolder->name = $validated['name'];
            $salesdocumentfolder->parent = $validated['parent'];
            $salesdocumentfolder->description = $validated['description'];

            $salesdocumentfolder->save();

            return redirect()->route('sales.sales-document-folders.index')->with('success', __('The document folder details are updated successfully.'));
        }
        else{
            return redirect()->route('sales.sales-document-folders.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesDocumentFolder $salesdocumentfolder)
    {
        if(Auth::user()->can('delete-sales-document-folders')){
            $salesdocumentfolder->delete();

            return redirect()->route('sales.sales-document-folders.index')->with('success', __('The document folder has been deleted.'));
        }
        else{
            return redirect()->route('sales.sales-document-folders.index')->with('error', __('Permission denied'));
        }
    }

    private function getFilteredParentFolders()
    {
        return SalesDocumentFolder::where('created_by', creatorId())
            ->when(!Auth::user()->can('manage-any-sales-document-folders'), function ($q) {
                if (Auth::user()->can('manage-own-sales-document-folders')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })
            ->select('id', 'name')->get();
    }
}