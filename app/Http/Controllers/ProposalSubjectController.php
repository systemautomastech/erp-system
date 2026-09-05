<?php

namespace App\Http\Controllers;

use App\Models\ProposalSubject;
use App\Http\Requests\StoreProposalSubjectRequest;
use App\Http\Requests\UpdateProposalSubjectRequest;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Automas\Proposal\Events\CreateProposalSubject;
use Automas\Proposal\Events\UpdateProposalSubject;
use Automas\Proposal\Events\DestroyProposalSubject;

class ProposalSubjectController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-subjects')) {
            $subjects = ProposalSubject::select('id', 'name', 'created_at')
                ->where(function ($q) {
                    if (Auth::user()->can('manage-any-subjects')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-subjects')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->where('created_by', creatorId());
                    }
                })
                ->latest()
                ->get();

            return Inertia::render('Proposal/SystemSetup/Subjects/Index', [
                'subjects' => $subjects,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreProposalSubjectRequest $request)
    {
        if (Auth::user()->can('create-subjects')) {
            $validated = $request->validated();

            $subject             = new ProposalSubject();
            $subject->name       = $validated['name'];
            $subject->creator_id = Auth::id();
            $subject->created_by = creatorId();
            $subject->save();

            CreateProposalSubject::dispatch($request, $subject);

            return redirect()->route('proposal.subjects.index')->with('success', __('The subject has been created successfully.'));
        } else {
            return redirect()->route('proposal.subjects.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateProposalSubjectRequest $request, ProposalSubject $subject)
    {
        if (Auth::user()->can('edit-subjects')) {
            $validated = $request->validated();

            $subject->name = $validated['name'];
            $subject->save();

            UpdateProposalSubject::dispatch($request, $subject);

            return back()->with('success', __('The subject details are updated successfully.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function destroy(ProposalSubject $subject)
    {
        if (Auth::user()->can('delete-subjects')) {
            DestroyProposalSubject::dispatch($subject);
            $subject->delete();

            return back()->with('success', __('The subject has been deleted.'));
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }
}
