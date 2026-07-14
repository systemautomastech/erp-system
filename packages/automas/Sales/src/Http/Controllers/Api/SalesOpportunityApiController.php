<?php

namespace Automas\Sales\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Automas\Sales\Models\SalesOpportunity;
use Automas\Sales\Models\SalesAccount;
use Automas\Sales\Models\SalesContact;
use Automas\Sales\Models\SalesOpportunityStage;
use App\Models\User;
use Automas\Sales\Events\CreateSalesOpportunity;
use Automas\Sales\Events\UpdateSalesOpportunity;
use Automas\Sales\Events\DestroySalesOpportunity;

class SalesOpportunityApiController extends Controller
{
    use ApiResponseTrait;
    public function index(Request $request)
    {
        try {
            if (Auth::user()->can('manage-sales-opportunities')) {
                $opportunities = SalesOpportunity::query()
                    ->with(['account', 'contact', 'stage', 'assignUser'])
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-opportunities')) {
                            $q->where('created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
                            $q->where(function ($query) {
                                $query->where('creator_id', Auth::id())
                                    ->orWhere('assign_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    })
                    ->latest()
                    ->paginate(request('per_page', 10))
                    ->withQueryString();

                $opportunities->getCollection()->transform(function ($opportunity) {
                    return [
                        'id'             => $opportunity->id,
                        'name'           => $opportunity->name,
                        'account'        => $opportunity->account?->name,
                        'stage'          => $opportunity->stage?->name,
                        'amount'         => $opportunity->amount,
                        'probability'    => $opportunity->probability,
                        'close_date'     => $opportunity->close_date?->format('Y-m-d'),
                        'contact'        => $opportunity->contact?->name,
                        'description'    => $opportunity->description,
                        'assign_user'    => $opportunity->assignUser?->name,
                        'account_id'     => $opportunity->account_id,
                        'contact_id'     => $opportunity->contact_id,
                        'stage_id'       => $opportunity->stage_id,
                        'assign_user_id' => $opportunity->assign_user_id,
                        'is_active'      => $opportunity->is_active,
                    ];
                });

                return $this->paginatedResponse($opportunities, 'Opportunities retrieved successfully');
            } else {
                return $this->errorResponse('Permission denied', null, 403);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function store(Request $request)
    {
        try {
            if (Auth::user()->can('create-sales-opportunities')) {
                $validator = Validator::make($request->all(), [
                    'name'           => 'required|max:120',
                    'amount'         => 'required|numeric|min:0',
                    'probability'    => 'required|integer|min:0|max:100',
                    'close_date'     => 'required|date',
                    'account_id'     => 'nullable|exists:sales_accounts,id',
                    'contact_id'     => 'nullable|exists:sales_contacts,id',
                    'stage_id'       => 'nullable|exists:sales_opportunity_stages,id',
                    'assign_user_id' => 'nullable|exists:users,id',
                    'description'    => 'nullable|string',
                    'is_active'      => 'boolean',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();

                $opportunity              = new SalesOpportunity();
                $opportunity->name        = $validated['name'];
                $opportunity->account_id  = $validated['account_id'] ?? null;
                $opportunity->contact_id  = $validated['contact_id'] ?? null;
                $opportunity->stage_id    = $validated['stage_id'] ?? null;
                $opportunity->amount      = $validated['amount'];
                $opportunity->probability = is_array($validated['probability']) ? (int)($validated['probability'][0] ?? 0) : (int)$validated['probability'];
                $opportunity->close_date  = $validated['close_date'];
                // Auto assign to current user if staff and no user selected, otherwise use provided value or null
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $opportunity->assign_user_id = Auth::id();
                } else {
                    $opportunity->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $opportunity->description = $validated['description'] ?? null;
                $opportunity->is_active   = $validated['is_active'] ?? true;
                $opportunity->creator_id  = Auth::id();
                $opportunity->created_by  = creatorId();
                $opportunity->save();

                CreateSalesOpportunity::dispatch($request, $opportunity);

                $opportunity->load(['account', 'contact', 'stage', 'assignUser']);

                $data = [
                    'id'             => $opportunity->id,
                    'name'           => $opportunity->name,
                    'account'        => $opportunity->account?->name,
                    'stage'          => $opportunity->stage?->name,
                    'amount'         => $opportunity->amount,
                    'probability'    => $opportunity->probability,
                    'close_date'     => $opportunity->close_date?->format('Y-m-d'),
                    'contact'        => $opportunity->contact?->name,
                    'description'    => $opportunity->description,
                    'assign_user'    => $opportunity->assignUser?->name,
                    'account_id'     => $opportunity->account_id,
                    'contact_id'     => $opportunity->contact_id,
                    'stage_id'       => $opportunity->stage_id,
                    'assign_user_id' => $opportunity->assign_user_id,
                    'is_active'      => $opportunity->is_active,
                ];

                return $this->successResponse($data, 'The opportunity has been created successfully.');
            } else {
                return $this->errorResponse('Permission denied', null, 403);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
    public function update(Request $request, $id)
    {
        try {
            if (Auth::user()->can('edit-sales-opportunities')) {
                $opportunity = SalesOpportunity::where('id', $id)
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-opportunities')) {
                            $q->where('created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
                            $q->where(function ($query) {
                                $query->where('creator_id', Auth::id())
                                    ->orWhere('assign_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    })
                    ->first();

                if (!$opportunity) {
                    return $this->errorResponse('Opportunity not found', null, 404);
                }

                $validator = Validator::make($request->all(), [
                    'name'           => 'required|max:120',
                    'amount'         => 'required|numeric|min:0',
                    'probability'    => 'required|integer|min:0|max:100',
                    'close_date'     => 'required|date',
                    'account_id'     => 'nullable|exists:sales_accounts,id',
                    'contact_id'     => 'nullable|exists:sales_contacts,id',
                    'stage_id'       => 'nullable|exists:sales_opportunity_stages,id',
                    'assign_user_id' => 'nullable|exists:users,id',
                    'description'    => 'nullable|string',
                    'is_active'      => 'boolean',
                ]);

                if ($validator->fails()) {
                    return $this->validationErrorResponse($validator->errors());
                }

                $validated = $validator->validated();

                $opportunity->name        = $validated['name'];
                $opportunity->account_id  = $validated['account_id'] ?? null;
                $opportunity->contact_id  = $validated['contact_id'] ?? null;
                $opportunity->stage_id    = $validated['stage_id'] ?? null;
                $opportunity->amount      = $validated['amount'];
                $opportunity->probability = is_array($validated['probability']) ? (int)($validated['probability'][0] ?? 0) : (int)$validated['probability'];
                $opportunity->close_date  = $validated['close_date'];
                // Auto assign to current user if staff and no user selected, otherwise use provided value or null
                if (empty($validated['assign_user_id']) && Auth::user()->type !== 'company') {
                    $opportunity->assign_user_id = Auth::id();
                } else {
                    $opportunity->assign_user_id = $validated['assign_user_id'] ?? null;
                }
                $opportunity->description = $validated['description'] ?? null;
                $opportunity->is_active   = $validated['is_active'] ?? true;
                $opportunity->save();

                UpdateSalesOpportunity::dispatch($request, $opportunity);

                $opportunity->load(['account', 'contact', 'stage', 'assignUser']);

                $data = [
                    'id'             => $opportunity->id,
                    'name'           => $opportunity->name,
                    'account'        => $opportunity->account?->name,
                    'stage'          => $opportunity->stage?->name,
                    'amount'         => $opportunity->amount,
                    'probability'    => $opportunity->probability,
                    'close_date'     => $opportunity->close_date?->format('Y-m-d'),
                    'contact'        => $opportunity->contact?->name,
                    'description'    => $opportunity->description,
                    'assign_user'    => $opportunity->assignUser?->name,
                    'account_id'     => $opportunity->account_id,
                    'contact_id'     => $opportunity->contact_id,
                    'stage_id'       => $opportunity->stage_id,
                    'assign_user_id' => $opportunity->assign_user_id,
                    'is_active'      => $opportunity->is_active,
                ];

                return $this->successResponse($data, 'The opportunity details are updated successfully.');
            } else {
                return $this->errorResponse('Permission denied', null, 403);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }

    public function destroy($id)
    {
        try {
            if (Auth::user()->can('delete-sales-opportunities')) {
                $opportunity = SalesOpportunity::where('id', $id)
                    ->where(function ($q) {
                        if (Auth::user()->can('manage-any-sales-opportunities')) {
                            $q->where('created_by', creatorId());
                        } elseif (Auth::user()->can('manage-own-sales-opportunities')) {
                            $q->where(function ($query) {
                                $query->where('creator_id', Auth::id())
                                    ->orWhere('assign_user_id', Auth::id());
                            });
                        } else {
                            $q->whereRaw('1 = 0');
                        }
                    })
                    ->first();

                if (!$opportunity) {
                    return $this->errorResponse('Opportunity not found', null, 404);
                }
                $opportunity->delete();

                return $this->successResponse(null, 'The opportunity has been deleted.');
            } else {
                return $this->errorResponse('Permission denied', null, 403);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Something went wrong');
        }
    }
}
