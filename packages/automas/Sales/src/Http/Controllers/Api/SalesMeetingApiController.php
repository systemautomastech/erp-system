<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Automas\Sales\Models\SalesMeeting;

class SalesMeetingApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (Auth::user()->can('manage-sales-meetings')) {
                $query = SalesMeeting::with(['account', 'assignedUser'])
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-meetings')) {
                            $q->where('sales_meetings.created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-meetings')) {
                            $q->where(function ($query) {
                                $query->where('sales_meetings.creator_id', Auth::id())
                                    ->orWhere('sales_meetings.assigned_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    });

                $meetings = $query->latest()
                    ->paginate(request('per_page', 10))
                    ->withQueryString();

                $meetings->getCollection()->transform(function ($meeting) {
                    return [
                        'id'                  => $meeting->id,
                        'name'                => $meeting->name,
                        'status'              => $meeting->status,
                        'description'         => $meeting->description,
                        'meeting_type'        => $meeting->meeting_type,
                        'start_date'          => $meeting->start_date?->format('Y-m-d H:i:s'),
                        'end_date'            => $meeting->end_date?->format('Y-m-d H:i:s'),
                        'parent_type'         => $meeting->parent_type,
                        'parent_id'           => $meeting->parent_id,
                        'account'             => $meeting->account?->name,
                        'assigned_user'       => $meeting->assignedUser?->name,
                        'account_id'          => $meeting->account_id,
                        'assigned_user_id'    => $meeting->assigned_user_id,
                        'attendees_users'     => $meeting->attendees_users,
                        'attendees_contacts'  => $meeting->attendees_contacts,
                    ];
                });

                return $this->paginatedResponse($meetings, 'Meetings retrieved successfully');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }


    public function store(Request $request)
    {
        try {
            if (Auth::user()->can('create-sales-meetings')) {
                $validator = Validator::make($request->all(), [
                    'name'                 => 'required|string|max:255',
                    'status'               => 'required|string|in:scheduled,in_progress,completed,cancelled',
                    'meeting_type'         => 'required|string|in:online,in_person',
                    'start_date'           => 'required|date',
                    'end_date'             => 'required|date|after:start_date',
                    'parent_type'          => 'nullable|string|in:account,contact,opportunity,case',
                    'parent_id'            => 'nullable|integer',
                    'account_id'           => 'nullable|exists:sales_accounts,id',
                    'assigned_user_id'     => 'nullable|exists:users,id',
                    'description'          => 'nullable|string',
                    'attendees_users'      => 'nullable|array',
                    'attendees_users.*'    => 'exists:users,id',
                    'attendees_contacts'   => 'nullable|array',
                    'attendees_contacts.*' => 'exists:sales_contacts,id',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();

                $meeting               = new SalesMeeting();
                $meeting->name         = $validated['name'];
                $meeting->status       = $validated['status'];
                $meeting->meeting_type = $validated['meeting_type'];
                $meeting->start_date   = $validated['start_date'];
                $meeting->end_date     = $validated['end_date'];
                $meeting->parent_type  = $validated['parent_type'] ?? null;
                $meeting->parent_id    = $validated['parent_id'] ?? null;
                $meeting->account_id   = $validated['account_id'] ?? null;
                if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                    $meeting->assigned_user_id = Auth::id();
                } else {
                    $meeting->assigned_user_id = $validated['assigned_user_id'] ?? null;
                }
                $meeting->description        = $validated['description'] ?? null;
                $meeting->attendees_users    = $validated['attendees_users'] ?? null;
                $meeting->attendees_contacts = $validated['attendees_contacts'] ?? null;
                $meeting->creator_id         = Auth::id();
                $meeting->created_by         = creatorId();
                $meeting->save();

                $meeting->load(['account', 'assignedUser']);

                $data = [
                    'id'               => $meeting->id,
                    'name'             => $meeting->name,
                    'status'           => $meeting->status,
                    'meeting_type'     => $meeting->meeting_type,
                    'start_date'       => $meeting->start_date?->format('Y-m-d H:i:s'),
                    'end_date'         => $meeting->end_date?->format('Y-m-d H:i:s'),
                    'parent_type'      => $meeting->parent_type,
                    'parent_id'        => $meeting->parent_id,
                    'account'          => $meeting->account?->name,
                    'assigned_user'    => $meeting->assignedUser?->name,
                    'account_id'       => $meeting->account_id,
                    'assigned_user_id' => $meeting->assigned_user_id,
                ];

                return $this->successResponse($data, 'The meeting has been created successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (Auth::user()->can('edit-sales-meetings')) {
                $meeting = SalesMeeting::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$meeting) {
                    return $this->errorResponse('Meeting not found', null, 404);
                }

                $validator = Validator::make($request->all(), [
                    'name'                 => 'required|string|max:255',
                    'status'               => 'required|string|in:scheduled,in_progress,completed,cancelled',
                    'meeting_type'         => 'required|string|in:online,in_person',
                    'start_date'           => 'required|date',
                    'end_date'             => 'required|date|after:start_date',
                    'parent_type'          => 'nullable|string|in:account,contact,opportunity,case',
                    'parent_id'            => 'nullable|integer',
                    'account_id'           => 'nullable|exists:sales_accounts,id',
                    'assigned_user_id'     => 'nullable|exists:users,id',
                    'description'          => 'nullable|string',
                    'attendees_users'      => 'nullable|array',
                    'attendees_users.*'    => 'exists:users,id',
                    'attendees_contacts'   => 'nullable|array',
                    'attendees_contacts.*' => 'exists:sales_contacts,id',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();

                $meeting->name         = $validated['name'];
                $meeting->status       = $validated['status'];
                $meeting->meeting_type = $validated['meeting_type'];
                $meeting->start_date   = $validated['start_date'];
                $meeting->end_date     = $validated['end_date'];
                $meeting->parent_type  = $validated['parent_type'] ?? null;
                $meeting->parent_id    = $validated['parent_id'] ?? null;
                $meeting->account_id   = $validated['account_id'] ?? null;
                if (empty($validated['assigned_user_id']) && Auth::user()->type !== 'company') {
                    $meeting->assigned_user_id = Auth::id();
                } else {
                    $meeting->assigned_user_id = $validated['assigned_user_id'] ?? null;
                }
                $meeting->description        = $validated['description'] ?? null;
                $meeting->attendees_users    = $validated['attendees_users'] ?? null;
                $meeting->attendees_contacts = $validated['attendees_contacts'] ?? null;
                $meeting->save();

                $meeting->load(['account', 'assignedUser']);

                $data = [
                    'id'               => $meeting->id,
                    'name'             => $meeting->name,
                    'status'           => $meeting->status,
                    'meeting_type'     => $meeting->meeting_type,
                    'start_date'       => $meeting->start_date?->format('Y-m-d H:i:s'),
                    'end_date'         => $meeting->end_date?->format('Y-m-d H:i:s'),
                    'parent_type'      => $meeting->parent_type,
                    'parent_id'        => $meeting->parent_id,
                    'account'          => $meeting->account?->name,
                    'assigned_user'    => $meeting->assignedUser?->name,
                    'account_id'       => $meeting->account_id,
                    'assigned_user_id' => $meeting->assigned_user_id,
                ];

                return $this->successResponse($data, 'The meeting details are updated successfully.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function destroy($id)
    {
        try {
            if (Auth::user()->can('delete-sales-meetings')) {
                $meeting = SalesMeeting::where('id', $id)
                    ->where('created_by', creatorId())
                    ->first();

                if (!$meeting) {
                    return $this->errorResponse('Meeting not found', null, 404);
                }

                $meeting->delete();

                return $this->successResponse(null, 'The meeting has been deleted.');
            }
            return $this->errorResponse('Permission denied', null, 403);
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
}
