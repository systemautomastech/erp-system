<?php

namespace Automas\SupportTicket\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\EmailTemplate;
use Automas\SupportTicket\Events\CreateTicket;
use Automas\SupportTicket\Events\CreateTicketConversion;
use Automas\SupportTicket\Events\DestroyTicket;
use Automas\SupportTicket\Events\UpdateTicket;
use Automas\SupportTicket\Http\Requests\StoreSupportTicketRequest;
use Automas\SupportTicket\Http\Requests\UpdateSupportTicketRequest;
use Automas\SupportTicket\Http\Requests\StoreConversionRequest;
use Automas\SupportTicket\Models\Ticket;
use Automas\SupportTicket\Models\TicketCategory;
use Automas\SupportTicket\Models\Conversion;
use Automas\SupportTicket\Models\TicketField;


class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->can('manage-support-tickets')) {
            $query = Ticket::with(['tcategory']);

            // Company admin or other roles
            $query->where(function ($q) {
                if (Auth::user()->can('manage-any-support-tickets')) {
                    $q->where('created_by', creatorId());
                } elseif (Auth::user()->can('manage-own-support-tickets')) {
                    $q->where(function ($q) {
                        $q->where('user_id', Auth::id())
                            ->orWhere('creator_id', Auth::id());
                    });
                } else {
                    $q->whereRaw('1 = 0');
                }
            });

            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('ticket_id', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->get('status'));
            }

            if ($request->filled('category')) {
                $query->where('category', $request->get('category'));
            }

            if ($request->filled('account_type')) {
                $query->where('account_type', $request->get('account_type'));
            }

            if ($request->filled('sort')) {
                $sortField = $request->get('sort');
                $sortDirection = $request->get('direction', 'asc');

                $allowedSortFields = ['ticket_id', 'name', 'email', 'subject', 'status', 'created_at'];
                if (in_array($sortField, $allowedSortFields)) {
                    $query->orderBy($sortField, $sortDirection);
                }
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $perPage = $request->get('per_page', 10);
            $tickets = $query->paginate($perPage);

            $tickets->getCollection()->transform(function ($ticket) {
                $user = User::find($ticket->created_by);
                return [
                    'id' => $ticket->id,
                    'encrypted_id' => Crypt::encrypt($ticket->id),
                    'ticket_id' => $ticket->ticket_id,
                    'name' => $ticket->name,
                    'email' => $ticket->email,
                    'account_type' => $ticket->account_type,
                    'subject' => $ticket->subject,
                    'status' => $ticket->status,
                    'category' => [
                        'name' => $ticket->tcategory->name ?? 'No Category',
                        'color' => $ticket->tcategory->color ?? '#6B7280'
                    ],
                    'user_slug' => $user ? $user->slug : null,
                    'created_at' => $ticket->created_at->toISOString(),
                    'updated_at' => $ticket->updated_at->toISOString(),
                    'formatted_created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
                ];
            });

            $categories = TicketCategory::where(function ($q) {
                if (Auth::user()->can('manage-any-ticket-categories')) {
                    $q->where('created_by', creatorId());
                } elseif (Auth::user()->can('manage-own-ticket-categories')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })->get();

            return Inertia::render('SupportTicket/Tickets/Index', [
                'tickets' => $tickets,
                'categories' => $categories,
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function create()
    {
        if (Auth::user()->can('create-support-tickets')) {
            $categories = TicketCategory::where(function ($q) {
                if (Auth::user()->can('manage-any-ticket-categories')) {
                    $q->where('created_by', creatorId());
                } elseif (Auth::user()->can('manage-own-ticket-categories')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })->get();
            $staff = User::where('created_by', creatorId())
                ->where('type', 'staff')
                ->select('id', 'name', 'email')
                ->get();
            $clients = User::where('created_by', creatorId())
                ->where('type', 'client')
                ->select('id', 'name', 'email')
                ->get();
            $vendors = User::where('created_by', creatorId())
                ->where('type', 'vendor')
                ->select('id', 'name', 'email')
                ->get();

            // Get all fields (default + custom) ordered by 'order' field
            $allFields = TicketField::where('created_by', creatorId())
                ->where('status', true)
                ->orderBy('order')
                ->get();

            if ($allFields->count() < 1) {
                $allFields = TicketField::where('created_by', creatorId())
                    ->where('status', true)
                    ->orderBy('order')
                    ->get();
            }

            // Get custom fields (custom_id > 6) ordered by 'order' field
            $customFields = TicketField::where('created_by', creatorId())
                ->where('custom_id', '>', '6')
                ->where('status', true)
                ->orderBy('order')
                ->get();

            return Inertia::render('SupportTicket/Tickets/Create', [
                'categories' => $categories,
                'staff' => $staff,
                'clients' => $clients,
                'vendors' => $vendors,
                'allFields' => $allFields,
                'customFields' => $customFields
            ]);
        } else {
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreSupportTicketRequest $request)
    {
        if (Auth::user()->can('create-support-tickets')) {
            $validated = $request->validated();

            $ticket = new Ticket();
            $ticket->ticket_id = time();
            $ticket->name = $validated['name'] ?? '';
            $ticket->email = $validated['email'] ?? '';
            $ticket->user_id = $validated['user_id'] ?? null;
            $ticket->account_type = $validated['account_type'] ?? 'custom';
            $ticket->category = $validated['category'] ?? null;
            $ticket->subject = $validated['subject'] ?? '';
            $ticket->status = $validated['status'] ?? 'In Progress';
            $ticket->description = $validated['description'] ?? '';
            $ticket->note = $validated['note'] ?? null;
            $ticket->creator_id = Auth::id();
            $ticket->created_by = creatorId();

            if ($validated['account_type'] == 'staff' || $validated['account_type'] == 'client' || $validated['account_type'] == 'vendor') {
                $user = User::find($validated['user_id']);
                if ($user) {
                    $ticket->name = $user->name;
                    $ticket->email = $user->email;
                } else {
                    return redirect()->back()->with('error', __('User not found'));
                }
            }

            if (!empty($validated['attachments'])) {
                $attachmentPaths = is_array($validated['attachments']) ? $validated['attachments'] : json_decode($validated['attachments'], true);
                if (is_array($attachmentPaths)) {
                    $attachments = [];
                    foreach ($attachmentPaths as $filePath) {
                        if (!empty($filePath) && $filePath !== 'logo_dark' && $filePath !== 'favicon') {
                            $filename = basename($filePath);
                            $attachments[] = [
                                'name' => $filename,
                                'path' => $filename
                            ];
                        }
                    }
                    $ticket->attachments = json_encode($attachments);
                } else {
                    $ticket->attachments = '[]';
                }
            } else {
                $ticket->attachments = '[]';
            }

            $ticket->save();

            // Save custom field data
            if ($request->has('fields') && !empty($request->fields)) {
                TicketField::saveData($ticket, $request->fields);
            }

            CreateTicket::dispatch($request, $ticket);

            // Send email notification for new ticket
            if (!empty(company_setting('New Ticket')) && company_setting('New Ticket') == true) {
                $uArr = [
                    'ticket_name' => $ticket->name,
                    'email' => $ticket->email,
                    'ticket_id' => $ticket->ticket_id,
                    'ticket_url' => route('support-ticket.show', [Auth::user()->slug, Crypt::encrypt($ticket->id)])
                ];
                try {
                    EmailTemplate::sendEmailTemplate('New Ticket', [$ticket->email], $uArr);
                } catch (\Exception $e) {
                    return redirect()->back()->with('error', __('Ticket not found'));
                }
            }

            return redirect()->route('support-tickets.index')
                ->with('success', __('The ticket has been created successfully.'));
        } else {
            return redirect()->route('support-tickets.index')->with('error', __('Permission denied'));
        }
    }

    public function edit($id)
    {
        if (Auth::user()->can('edit-support-tickets')) {
            $ticket = Ticket::with(['tcategory', 'conversions'])->find($id);

            if (!$ticket) {
                return redirect()->route('support-tickets.index')->with('error', __('Ticket not found'));
            }

            $categories = TicketCategory::where(function ($q) {
                if (Auth::user()->can('manage-any-ticket-categories')) {
                    $q->where('created_by', creatorId());
                } elseif (Auth::user()->can('manage-own-ticket-categories')) {
                    $q->where('creator_id', Auth::id());
                } else {
                    $q->whereRaw('1 = 0');
                }
            })->get();
            $staff = User::where('created_by', creatorId())
                ->where('type', 'staff')
                ->select('id', 'name', 'email')
                ->get();
            $clients = User::where('created_by', creatorId())
                ->where('type', 'client')
                ->select('id', 'name', 'email')
                ->get();
            $vendors = User::where('created_by', creatorId())
                ->where('type', 'vendor')
                ->select('id', 'name', 'email')
                ->get();

            // Get all fields (default + custom) ordered by 'order' field
            $allFields = TicketField::where('created_by', creatorId())
                ->where('status', true)
                ->orderBy('order')
                ->get();

            if ($allFields->count() < 1) {
                $allFields = TicketField::where('created_by', creatorId())
                    ->where('status', true)
                    ->orderBy('order')
                    ->get();
            }

            // Get custom fields (custom_id > 6) ordered by 'order' field
            $customFields = TicketField::where('created_by', creatorId())
                ->where('custom_id', '>', '6')
                ->where('status', true)
                ->orderBy('order')
                ->get();

            // Get existing field data
            $existingFieldData = TicketField::getData($ticket);

            // Process ticket attachments
            $ticketAttachments = [];
            if ($ticket->attachments) {
                $decoded = is_string($ticket->attachments) ? json_decode($ticket->attachments, true) : $ticket->attachments;
                $ticketAttachments = is_array($decoded) ? $decoded : [];
            }

            $ticketData = [
                'id' => $ticket->id,
                'ticket_id' => $ticket->ticket_id,
                'name' => $ticket->name,
                'email' => $ticket->email,
                'user_id' => $ticket->user_id,
                'account_type' => $ticket->account_type ?: 'custom',
                'category' => $ticket->category,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'description' => $ticket->description,
                'note' => $ticket->note,
                'attachments' => $ticketAttachments,
                'fields' => $existingFieldData,
                'category_info' => $ticket->tcategory ? [
                    'id' => $ticket->tcategory->id,
                    'name' => $ticket->tcategory->name,
                    'color' => $ticket->tcategory->color
                ] : null,
                'conversions' => $ticket->conversions->map(function ($conversation) {
                    // Process conversation attachments
                    $conversationAttachments = [];
                    if ($conversation->attachments) {
                        $decoded = is_string($conversation->attachments) ? json_decode($conversation->attachments, true) : $conversation->attachments;
                        $conversationAttachments = is_array($decoded) ? $decoded : [];
                    }

                    return [
                        'id' => $conversation->id,
                        'ticket_id' => $conversation->ticket_id,
                        'description' => $conversation->description,
                        'sender' => $conversation->sender,
                        'attachments' => $conversationAttachments,
                        'created_at' => $conversation->created_at ? $conversation->created_at->toISOString() : null,
                        'replyBy' => ['name' => $conversation->replyBy()->name ?? 'User'],
                    ];
                }),
                'created_at' => $ticket->created_at ? $ticket->created_at->toISOString() : null,
                'updated_at' => $ticket->updated_at ? $ticket->updated_at->toISOString() : null,
            ];

            return Inertia::render('SupportTicket/Tickets/EditReply', [
                'ticket' => $ticketData,
                'categories' => $categories,
                'staff' => $staff,
                'clients' => $clients,
                'vendors' => $vendors,
                'allFields' => $allFields,
                'customFields' => $customFields,
                'slug' => Auth::user()->slug
            ]);
        }
        return redirect()->route('support-tickets.index')->with('error', __('Permission denied'));
    }

    public function update(UpdateSupportTicketRequest $request, $id)
    {
        if (Auth::user()->can('edit-support-tickets')) {
            $ticket = Ticket::find($id);

            if (!$ticket) {
                return redirect()->route('support-tickets.index')->with('error', __('Ticket not found'));
            }

            $validated = $request->validated();

            $ticket->name = $validated['name'] ?? '';
            $ticket->email = $validated['email'] ?? '';
            $ticket->account_type = $validated['account_type'] ?? 'custom';
            $ticket->category = $validated['category'] ?? null;
            $ticket->subject = $validated['subject'] ?? '';
            $ticket->status = $validated['status'] ?? 'In Progress';
            $ticket->description = $validated['description'] ?? '';
            $ticket->note = $validated['note'] ?? null;
            $ticket->user_id = null;

            if (isset($validated['account_type']) && $validated['account_type'] !== 'custom' && !empty($validated['user_id'])) {
                $user = User::find($validated['user_id']);
                if ($user) {
                    $ticket->name = $user->name;
                    $ticket->email = $user->email;
                    $ticket->user_id = $user->id;
                }
            }

            if (isset($validated['attachments']) && !empty($validated['attachments'])) {
                $attachmentPaths = json_decode($validated['attachments'], true);
                if (is_array($attachmentPaths)) {
                    $attachments = [];
                    foreach ($attachmentPaths as $filePath) {
                        if (!empty($filePath)) {
                            $filename = basename($filePath);
                            $attachments[] = [
                                'name' => $filename,
                                'path' => $filename
                            ];
                        }
                    }
                    $ticket->attachments = json_encode($attachments);
                }
            }

            $ticket->save();

            // Save custom field data
            if ($request->has('fields') && !empty($request->fields)) {
                TicketField::saveData($ticket, $request->fields);
            }

            UpdateTicket::dispatch($request, $ticket);

            return redirect()->back()->with('success', __('The ticket details are updated successfully.'));
        }
        return redirect()->route('support-tickets.index')->with('error', __('Permission denied'));
    }

    public function destroy($id)
    {
        if (Auth::user()->can('delete-support-tickets')) {
            $ticket = Ticket::find($id);

            if (!$ticket) {
                return redirect()->route('support-tickets.index')->with('error', __('Ticket not found'));
            }

            Conversion::where('ticket_id', $ticket->id)->delete();

            delete_folder('support-ticket/' . $ticket->ticket_id);

            DestroyTicket::dispatch($ticket);

            $ticket->delete();

            return back()->with('success', __('The ticket has been deleted.'));
        }
        return back()->with('error', __('Permission denied'));
    }

    public function storeNote(Request $request, $id)
    {
        if (Auth::user()->can('edit-support-tickets')) {
            $request->validate([
                'note' => 'required|string'
            ]);

            $ticket = Ticket::find($id);

            if (!$ticket) {
                return back()->with('error', __('Ticket not found'));
            }

            $ticket->note = $request->note;
            $ticket->save();

            return redirect()->back()->with('success', __('Note saved successfully'));
        }

        return back()->with('error', __('Permission denied'));
    }

    public function storeconverison(StoreConversionRequest $request, $ticketId)
    {
        if (Auth::user()->can('reply-support-tickets')) {
            $ticket = Ticket::find($ticketId);

            if (!$ticket) {
                return redirect()->back()->with('error', __('Ticket not found'));
            }

            $validated = $request->validated();
            $attachments = [];
            if (!empty($validated['attachments'])) {
                $attachmentPaths = is_array($validated['attachments']) ? $validated['attachments'] : json_decode($validated['attachments'], true);
                if (is_array($attachmentPaths)) {
                    foreach ($attachmentPaths as $filePath) {
                        if (!empty($filePath) && $filePath !== 'logo_dark' && $filePath !== 'favicon') {
                            $filename = basename($filePath);
                            $attachments[] = [
                                'name' => $filename,
                                'path' => $filename
                            ];
                        }
                    }
                }
            }

            $conversion = new Conversion();
            $conversion->ticket_id = $ticket->id;
            $conversion->description = $validated['description'];
            $conversion->sender = 'admin';
            $conversion->attachments = $attachments;
            $conversion->creator_id = Auth::id();
            $conversion->created_by = creatorId();
            $conversion->save();

            if ($request->has('status') && in_array($request->status, ['open', 'In Progress', 'Closed', 'On Hold'])) {
                $ticket->status = $request->status;
                $ticket->save();
            }

            CreateTicketConversion::dispatch($request, $ticket, $conversion);

            // Send email notification for reply
            if (!empty(company_setting('New Ticket Reply')) && company_setting('New Ticket Reply') == true) {
                $uArr = [
                    'ticket_name' => $ticket->name,
                    'ticket_id' => $ticket->ticket_id,
                    'email' => $ticket->email,
                    'reply_description' => $request->description,
                ];
                try {
                    EmailTemplate::sendEmailTemplate('New Ticket Reply', [$ticket->email], $uArr);
                } catch (\Exception $e) {
                    // Log error but don't fail the reply
                }
            }

            return redirect()->back()->with('success', __('Reply added successfully'));
        }

        return redirect()->back()->with('error', __('Permission denied'));
    }
}
