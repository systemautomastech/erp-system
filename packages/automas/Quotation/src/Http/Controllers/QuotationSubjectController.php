<?php

namespace Automas\Quotation\Http\Controllers;

use App\Http\Controllers\Controller;
use Automas\Quotation\Models\QuotationSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuotationSubjectController extends Controller
{
    public function index()
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            return redirect()->route('dashboard')->with('error', __('Permission denied'));
        }

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();
        $subjects = QuotationSubject::where('created_by', $creatorId)
            ->latest()
            ->get();

        if (request()->wantsJson()) {
            return response()->json(['subjects' => $subjects]);
        }

        return redirect()->route('quotation-setup.index');
    }

    public function store(Request $request)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            if ($request->wantsJson()) {
                return response()->json(['error' => __('Permission denied')], 403);
            }
            return back()->with('error', __('Permission denied'));
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();

        $subject = QuotationSubject::create([
            'name' => $validated['name'],
            'creator_id' => Auth::id(),
            'created_by' => $creatorId,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => __('Subject created successfully.'),
                'subject' => $subject,
            ]);
        }

        return back()->with('success', __('Subject created successfully.'));
    }

    public function update(Request $request, QuotationSubject $subject)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            if ($request->wantsJson()) {
                return response()->json(['error' => __('Permission denied')], 403);
            }
            return back()->with('error', __('Permission denied'));
        }

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();

        if ($subject->created_by != $creatorId) {
            if ($request->wantsJson()) {
                return response()->json(['error' => __('Unauthorized access.')], 403);
            }
            return back()->with('error', __('Unauthorized access.'));
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $subject->update(['name' => $validated['name']]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => __('Subject updated successfully.'),
                'subject' => $subject,
            ]);
        }

        return back()->with('success', __('Subject updated successfully.'));
    }

    public function destroy(QuotationSubject $subject)
    {
        if (!Auth::user()->can('manage-quotation-system-setup')) {
            if (request()->wantsJson()) {
                return response()->json(['error' => __('Permission denied')], 403);
            }
            return back()->with('error', __('Permission denied'));
        }

        $creatorId = function_exists('creatorId') ? creatorId() : Auth::id();

        if ($subject->created_by != $creatorId) {
            if (request()->wantsJson()) {
                return response()->json(['error' => __('Unauthorized access.')], 403);
            }
            return back()->with('error', __('Unauthorized access.'));
        }

        $subject->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => __('Subject deleted successfully.'),
            ]);
        }

        return back()->with('success', __('Subject deleted successfully.'));
    }
}
