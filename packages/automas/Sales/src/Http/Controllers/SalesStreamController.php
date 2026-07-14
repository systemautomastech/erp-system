<?php

namespace Automas\Sales\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Automas\Sales\Models\SalesStream;
use Automas\Sales\Http\Requests\StoreSalesStreamRequest;
use Automas\Sales\Http\Requests\UpdateSalesStreamRequest;
use Inertia\Inertia;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesCase;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunity;

class SalesStreamController extends Controller
{
    public function index()
    {
        if (Auth::user()->can('manage-sales-streams')) {
            $streams = SalesStream::with(['creator'])
                ->where('created_by', creatorId())
                ->latest()
                ->get()
                ->map(function ($stream) {
                    $moduleName = '';
                    switch ($stream->module_type) {
                        case 'account':
                            $account = SalesAccount::find($stream->module_id);
                            $moduleName = $account ? $account->name : 'Unknown Account';
                            break;
                        case 'contact':
                            $contact = SalesContact::find($stream->module_id);
                            $moduleName = $contact ? $contact->name : 'Unknown Contact';
                            break;
                        case 'opportunity':
                            $opportunity = SalesOpportunity::find($stream->module_id);
                            $moduleName = $opportunity ? $opportunity->name : 'Unknown Opportunity';
                            break;
                        case 'case':
                            $case = SalesCase::find($stream->module_id);
                            $moduleName = $case ? $case->name : 'Unknown Case';
                            break;
                    }
                    $stream->module_name = $moduleName;
                    return $stream;
                });

            $paginatedStreams = new \Illuminate\Pagination\LengthAwarePaginator(
                $streams->forPage(request('page', 1), 20),
                $streams->count(),
                20,
                request('page', 1),
                ['path' => request()->url(), 'pageName' => 'page']
            );

            $streamsArray = $paginatedStreams->toArray();
            $streamsArray['meta'] = [
                'total' => $streams->count(),
                'per_page' => 10,
                'current_page' => request('page', 1),
                'last_page' => ceil($streams->count() / 20)
            ];

            return Inertia::render('Sales/Streams/Index', [
                'streams' => $streamsArray,
            ]);
        }

        return back()->with('error', __('Permission denied.'));
    }

    public function store(StoreSalesStreamRequest $request, $type, $name, $id)
    {
        $permission = $this->getPermissionForType($type);
        if (Auth::user()->can($permission)) {
            $validated = $request->validated();

            $attachment = null;
            if ($request->hasFile('attachment')) {
                $filenameWithExt = $request->file('attachment')->getClientOriginalName();
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                $extension = $request->file('attachment')->getClientOriginalExtension();
                $fileNameToStore = $filename . '_' . time() . '.' . $extension;

                $upload = upload_file($request, 'attachment', $fileNameToStore, 'sales/streams');
                if ($upload['flag'] == 1) {
                    $attachment = $upload['url'];
                } else {
                    return redirect()->back()->with('error', $upload['msg']);
                }
            }

            $stream = new SalesStream();
            $stream->user_id = Auth::id();
            $stream->log_type = $validated['log_type'] ?? null;
            $stream->file_upload = $attachment;
            $stream->remark = $validated['stream_comment'];
            $stream->module_type = $type;
            $stream->module_id = $id;
            $stream->creator_id = Auth::id();
            $stream->created_by = creatorId();
            $stream->save();

            return redirect()->back()->with('success', __('The stream has been created successfully.'));
        }

        return redirect()->back()->with('error', __('Permission denied.'));
    }

    public function update(UpdateSalesStreamRequest $request, SalesStream $stream)
    {
        $user = Auth::user();
        $permission = $this->getPermissionForType($stream->module_type);
        $canEdit = $user->can($permission) &&
            ($user->type === 'company' || $stream->creator_id == $user->id);

        if ($canEdit) {
            $validated = $request->validated();

            $stream->remark = $validated['stream_comment'];
            $stream->save();

            return back()->with('success', __('The stream details are updated successfully.'));
        }

        return back()->with('error', __('Permission denied.'));
    }

    public function destroy(SalesStream $stream)
    {
        $user = Auth::user();
        $permission = $this->getPermissionForType($stream->module_type);
        $canDelete = $user->can($permission) &&
            ($user->type === 'company' || $stream->creator_id == $user->id);

        if ($canDelete) {
            // Delete attached file if exists
            if ($stream->file_upload) {
                delete_file($stream->file_upload);
            }
            
            $stream->delete();
            return back()->with('success', __('The stream has been deleted.'));
        }

        return back()->with('error', __('Permission denied.'));
    }

    private function getPermissionForType($type)
    {
        switch ($type) {
            case 'account':
                return 'manage-sales-accounts';
            case 'contact':
                return 'manage-sales-contacts';
            case 'opportunity':
                return 'manage-sales-opportunities';
            case 'case':
                return 'manage-sales-cases';
            default:
                return 'manage-sales-cases';
        }
    }
}