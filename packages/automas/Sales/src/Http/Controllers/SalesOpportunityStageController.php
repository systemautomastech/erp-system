<?php

namespace Automas\Sales\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Sales\Models\SalesOpportunityStage;
use Automas\Sales\Events\CreateSalesOpportunityStage;
use Automas\Sales\Events\UpdateSalesOpportunityStage;
use Automas\Sales\Events\DestroySalesOpportunityStage;

class SalesOpportunityStageController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-sales-opportunity-stages')){
            $stages = SalesOpportunityStage::select('id', 'name', 'description', 'order', 'color', 'is_active', 'created_at')
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-sales-opportunity-stages')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-sales-opportunity-stages')) {
                        $q->where('created_by', creatorId())
                          ->where('creator_id', Auth::id());
                    } else {
                        $q->where('created_by', creatorId());
                    }
                })
                ->orderBy('order')
                ->get();

            return Inertia::render('Sales/SystemSetup/OpportunityStages/Index', [
                'stages' => $stages,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(Request $request)
    {
        if(Auth::user()->can('create-sales-opportunity-stages')){
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'order' => 'nullable|integer|min:0',
                'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $stage = new SalesOpportunityStage();
            $stage->name = $validated['name'];
            $stage->description = $validated['description'];
            $stage->order = $validated['order'] ?? 0;
            $stage->color = $validated['color'] ?? '#3b82f6';
            $stage->is_active = $validated['is_active'];
            $stage->creator_id = Auth::id();
            $stage->created_by = creatorId();
            $stage->save();

            CreateSalesOpportunityStage::dispatch($request, $stage);

            return redirect()->route('sales.opportunity-stages.index')->with('success', __('The opportunity stage has been created successfully.'));
        } else {
            return redirect()->route('sales.opportunity-stages.index')->with('error', __('Permission denied'));
        }
    }

    public function update(Request $request, SalesOpportunityStage $opportunityStage)
    {
        if(Auth::user()->can('edit-sales-opportunity-stages')){
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'order' => 'nullable|integer|min:0',
                'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
                'is_active' => 'boolean',
            ]);

            $validated['is_active'] = $request->boolean('is_active', true);

            $opportunityStage->name = $validated['name'];
            $opportunityStage->description = $validated['description'];
            $opportunityStage->order = $validated['order'] ?? 0;
            $opportunityStage->color = $validated['color'] ?? '#3b82f6';
            $opportunityStage->is_active = $validated['is_active'];
            $opportunityStage->save();

            UpdateSalesOpportunityStage::dispatch($request, $opportunityStage);

            return redirect()->route('sales.opportunity-stages.index')->with('success', __('The opportunity stage details are updated successfully.'));
        } else {
            return redirect()->route('sales.opportunity-stages.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(SalesOpportunityStage $opportunityStage)
    {
        if(Auth::user()->can('delete-sales-opportunity-stages')){
            DestroySalesOpportunityStage::dispatch($opportunityStage);

            $opportunityStage->delete();

            return redirect()->route('sales.opportunity-stages.index')->with('success', __('The opportunity stage has been deleted.'));
        } else {
            return redirect()->route('sales.opportunity-stages.index')->with('error', __('Permission denied'));
        }
    }
}