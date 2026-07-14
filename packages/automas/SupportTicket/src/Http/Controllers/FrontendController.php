<?php

namespace Automas\SupportTicket\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Automas\SupportTicket\Http\Requests\StoreFrontendTicketRequest;
use Automas\SupportTicket\Http\Requests\StoreFrontendContactRequest;
use Automas\SupportTicket\Http\Requests\StoreTicketReplyRequest;
use Automas\SupportTicket\Events\CreateTicket;
use Automas\SupportTicket\Events\ReplyTicket;
use Inertia\Inertia;
use Automas\SupportTicket\Models\Contact;
use Automas\SupportTicket\Models\Conversion;
use Automas\SupportTicket\Models\Faq;
use Automas\SupportTicket\Models\KnowledgeBase;
use Automas\SupportTicket\Models\KnowledgeBaseCategory;
use Automas\SupportTicket\Models\SupportTicketCustomPage;
use Automas\SupportTicket\Models\TicketCategory;
use Automas\SupportTicket\Models\Ticket;
use Automas\SupportTicket\Models\QuickLink;
use Automas\SupportTicket\Models\TicketField;

class FrontendController extends Controller
{
    private function getUserIdFromRequest(Request $request)
    {
        $userSlug = $request->route('slug');
        if ($userSlug) {
            $user = User::where('slug', $userSlug)->first();
            if ($user) {
                return $user->id;
            }
        }
        abort(404, 'Support ticket page not found');
    }

    private function getQuickLinks($userId): array
    {
        try {
            return QuickLink::where('created_by', $userId)
                ->orderBy('order')
                ->get(['title', 'icon', 'link'])
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTicketCategories($userId): array
    {
        try {
            return TicketCategory::where('created_by', $userId)->get()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTicketFields($userId): array
    {
        try {
            $allFields = TicketField::where('created_by', $userId)
                ->where('status', true)
                ->orderBy('order')
                ->get();

            // Ensure default fields exist
            if ($allFields->count() < 1) {
                $allFields = TicketField::where('created_by', $userId)
                    ->where('status', true)
                    ->orderBy('order')
                    ->get();
            }

            return [
                'all_fields' => $allFields->toArray(),
                'custom_fields' => $allFields->where('custom_id', '>', '6')->values()->toArray()
            ];
        } catch (\Exception $e) {
            return ['all_fields' => [], 'custom_fields' => []];
        }
    }

    public function index(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');
        $categories = $this->getTicketCategories($userId);
        $ticketFields = $this->getTicketFields($userId);
        $quickLinks = $this->getQuickLinks($userId);

        return Inertia::render('SupportTicket/Frontend/CreateTicket', [
            'title' => "Create Support Ticket | {$userSlug} | Support Center",
            'categories' => $categories,
            'allFields' => $ticketFields['all_fields'],
            'customFields' => $ticketFields['custom_fields'],
            'quickLinks' => $quickLinks,
        ]);
    }

    public function store(StoreFrontendTicketRequest $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        try {
            $validated = $request->validated();
            $ticketId = time();
            $ticket = new Ticket();
            $ticket->ticket_id = $ticketId;
            $ticket->name = $validated['name'];
            $ticket->email = $validated['email'];
            $ticket->category = $validated['category'];
            $ticket->subject = $validated['subject'];
            $ticket->description = $validated['description'];
            $ticket->status = $validated['status'] ?? 'In Progress';
            $ticket->account_type = 'custom';
            $ticket->creator_id = $userId;
            $ticket->created_by = $userId;
            $ticket->save();

            $attachments = [];
            if ($request->hasFile('attachments')) {
                try {
                    foreach ($request->file('attachments') as $index => $file) {
                        $filenameWithExt = $file->getClientOriginalName();
                        $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                        $extension = $file->getClientOriginalExtension();
                        $fileNameToStore = $filename . '_' . uniqid() . '.' . $extension;

                        // Create a temporary request with single file
                        $tempRequest = new Request();
                        $tempRequest->files->set('attachment', $file);

                        $upload = upload_file($tempRequest, 'attachment', $fileNameToStore, 'support-ticket/' . $ticket->ticket_id);

                        if ($upload['flag'] == 1) {
                            $attachments[] = [
                                'name' => $filenameWithExt,
                                'path' => $upload['url']
                            ];
                        } else {
                            return back()->with('error', $upload['msg']);
                        }
                    }
                } catch (\Exception $e) {
                    return back()->with('error', __('Failed to upload attachments. Please try again.'));
                }
            }

            $ticket->attachments = json_encode($attachments);
            $ticket->save();
            // Save custom field data
            if ($request->has('fields') && !empty($request->fields)) {
                TicketField::saveData($ticket, $request->fields);
            }

            $encryptedId = Crypt::encrypt($ticket->id);

            // Send email notification for new ticket
            if (!empty(company_setting('New Ticket', $userId)) && company_setting('New Ticket', $userId) == true) {
                $user = User::find($userId);
                $uArr = [
                    'ticket_name' => $ticket->name,
                    'email' => $ticket->email,
                    'ticket_id' => $ticket->ticket_id,
                    'ticket_url' => route('support-ticket.show.ticket', [$userSlug, $encryptedId])
                ];
                EmailTemplate::sendEmailTemplate('New Ticket', [$user->email], $uArr, $userId);
            }

            // Dispatch event
            CreateTicket::dispatch($request, $ticket);

            $ticketLink = route('support-ticket.show.ticket', [$userSlug, $encryptedId]);
            return redirect()->route('support-ticket.index', $userSlug)
                ->with('success', __('The Ticket has been created successfully') . ' <a href="' . $ticketLink . '"><b>' . __('Your unique ticket link is this.') . '</b></a>');
        } catch (\Exception $e) {
            return back()->with('error', __('Failed to create ticket. Please try again.'));
        }
    }

    public function search(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        return Inertia::render('SupportTicket/Frontend/SearchTicket', [
            'title' => "Search Ticket | {$userSlug} | Support Center",
        ]);
    }

    public function searchTicket(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');
        try {
            if ($request->filled('ticket_id') && $request->filled('email')) {
                $ticket = Ticket::where('ticket_id', $request->ticket_id)
                    ->where('email', $request->email)
                    ->where('created_by', $userId)
                    ->first();

                if (!$ticket) {
                    return redirect()->back()->with('error', __('Ticket not found.'));
                }

                $encryptedId = Crypt::encrypt($ticket->id);
                return redirect()->route('support-ticket.show.ticket', [htmlspecialchars($userSlug, ENT_QUOTES, 'UTF-8'), $encryptedId]);
            }

            return back()->with('error', __('Please provide both ticket ID and email.'));
        } catch (\Exception $e) {
            return back()->with('error', __('Failed to search ticket. Please try again.'));
        }
    }

    public function knowledge(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        try {
            $categories = KnowledgeBaseCategory::where('created_by', $userId)->get();
            $knowledgeItems = KnowledgeBase::with('category')
                ->where('created_by', $userId)
                ->get();
        } catch (\Exception $e) {
            $knowledgeItems = collect();
            $categories = collect();
        }

        return Inertia::render('SupportTicket/Frontend/Knowledge', [
            'title' => "Knowledge Base | {$userSlug} | Support Center",
            'knowledgeItems' => $knowledgeItems,
            'categories' => $categories,
        ]);
    }

    public function faq(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        try {
            $faqs = Faq::where('created_by', $userId)->get();
        } catch (\Exception $e) {
            $faqs = collect();
        }

        return Inertia::render('SupportTicket/Frontend/Faq', [
            'title' => "FAQ | {$userSlug} | Support Center",
            'faqs' => $faqs,
        ]);
    }

    public function knowledgeArticle(Request $request, $userSlug, $id)
    {
        $userId = $this->getUserIdFromRequest($request);

        try {
            $article = KnowledgeBase::with('category')
                ->where('id', $id)
                ->where('created_by', $userId)
                ->firstOrFail();

            $relatedArticles = KnowledgeBase::where('created_by', $userId)
                ->where('id', '!=', $id)
                ->when($article->category_id, function ($query) use ($article) {
                    $query->where('category_id', $article->category_id);
                })
                ->limit(3)
                ->get(['id', 'title', 'description', 'created_at']);

            if ($relatedArticles->count() < 3) {
                $additionalArticles = KnowledgeBase::where('created_by', $userId)
                    ->where('id', '!=', $id)
                    ->when($article->category_id, function ($query) use ($article) {
                        $query->where('category_id', '!=', $article->category_id);
                    })
                    ->limit(3 - $relatedArticles->count())
                    ->get(['id', 'title', 'description', 'created_at']);

                $relatedArticles = $relatedArticles->merge($additionalArticles);
            }

            return Inertia::render('SupportTicket/Frontend/KnowledgeArticle', [
                'title' => "{$article->title} | {$userSlug} | Support Center",
                'article' => $article,
                'relatedArticles' => $relatedArticles,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('support-ticket.knowledge', htmlspecialchars($userSlug, ENT_QUOTES, 'UTF-8'))->with('error', __('Article not found.'));
        }
    }

    public function contact(Request $request)
    {
        $userSlug = $request->route('slug');

        return Inertia::render('SupportTicket/Frontend/Contact', [
            'title' => "Contact Us | {$userSlug} | Support Center",
        ]);
    }

    public function storeContact(StoreFrontendContactRequest $request)
    {
        $userId = $this->getUserIdFromRequest($request);

        try {
            $validated = $request->validated();

            $contact = new Contact();
            $contact->first_name = $validated['firstName'];
            $contact->last_name = $validated['lastName'];
            $contact->email = $validated['email'];
            $contact->subject = $validated['subject'];
            $contact->message = $validated['message'];
            $contact->creator_id = $userId;
            $contact->created_by = $userId;
            $contact->save();

            return back()->with('success', __('The contact has been added successfully.'));
        } catch (\Exception $e) {
            return back()->with('error', __('Failed to send message. Please try again.'));
        }
    }

    public function showByTicketId($slug, $ticket_id)
    {
        $user = User::where('slug', $slug)->first();
        if (!$user) {
            abort(404, 'Support ticket page not found');
        }
        $userId = $user->id;

        try {
            $decrypted_id = Crypt::decrypt($ticket_id);
            $ticket = Ticket::where('id', $decrypted_id)
                ->where('created_by', $userId)
                ->with([
                    'conversions' => function ($query) {
                        $query->orderBy('created_at', 'asc');
                    }
                ])
                ->firstOrFail();

            if ($ticket->attachments) {
                $ticket->attachments = json_decode($ticket->attachments, true) ?: [];
            }

            if ($ticket->conversions) {
                $ticket->conversions->each(function ($conversion) {
                    if ($conversion->attachments) {
                        $conversion->attachments = is_string($conversion->attachments)
                            ? json_decode($conversion->attachments, true) ?: []
                            : (is_array($conversion->attachments) ? $conversion->attachments : []);
                    } else {
                        $conversion->attachments = [];
                    }
                });
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', __('Ticket not found'));
        }

        $ticketData = [
            'id' => $ticket->id,
            'ticket_id' => $ticket->ticket_id,
            'name' => $ticket->name,
            'email' => $ticket->email,
            'subject' => $ticket->subject,
            'status' => $ticket->status,
            'description' => $ticket->description,
            'created_at' => $ticket->created_at->toISOString(),
            'attachments' => $ticket->formatted_attachments,
            'conversions' => $ticket->conversions ? $ticket->conversions->map(function ($conversation) use ($ticket, $userId) {
                $replyByName = 'User';
                if ($conversation->sender === 'admin') {
                    $companyName = company_setting('company_name', $userId);
                    $replyByName = $companyName ?: 'Admin';
                } else {
                    $replyByName = $ticket->name;
                }

                return [
                    'id' => $conversation->id,
                    'description' => html_entity_decode($conversation->description),
                    'sender' => $conversation->sender,
                    'created_at' => $conversation->created_at ? $conversation->created_at->toISOString() : null,
                    'attachments' => $conversation->formatted_attachments,
                    'replyBy' => ['name' => $replyByName],
                ];
            }) : []
        ];

        return Inertia::render('SupportTicket/Frontend/Show', [
            'title' => "Ticket #{$ticket->ticket_id} | {$slug} | Support Center",
            'ticket' => $ticketData,
        ]);
    }

    public function customPage(Request $request, $userSlug, $pageSlug)
    {
        $userId = $this->getUserIdFromRequest($request);

        $customPage = SupportTicketCustomPage::where('slug', $pageSlug)
            ->where('created_by', $userId)
            ->firstOrFail();

        return Inertia::render('SupportTicket/Frontend/CustomPage', [
            'title' => "{$customPage->title} | {$userSlug} | Support Center",
            'customPage' => $customPage
        ]);
    }

    public function privacyPolicy(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        $privacyPage = SupportTicketCustomPage::where('slug', 'privacy-policy')
            ->where('created_by', $userId)
            ->first();

        return Inertia::render('SupportTicket/Frontend/PrivacyPolicy', [
            'title' => "Privacy Policy | {$userSlug} | Support Center",
            'privacyPolicy' => $privacyPage ? ['content' => $privacyPage->contents, 'enabled' => $privacyPage->enable_page_footer === 'on'] : null,
        ]);
    }

    public function termsConditions(Request $request)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        $termsPage = SupportTicketCustomPage::where('slug', 'terms-conditions')
            ->where('created_by', $userId)
            ->first();

        return Inertia::render('SupportTicket/Frontend/TermsConditions', [
            'title' => "Terms & Conditions | {$userSlug} | Support Center",
            'termsConditions' => $termsPage ? ['content' => $termsPage->contents, 'enabled' => $termsPage->enable_page_footer === 'on'] : null,
        ]);
    }

    public function storeReply(StoreTicketReplyRequest $request, $slug, $ticketId)
    {
        $userId = $this->getUserIdFromRequest($request);
        try {
            $decrypted_id = Crypt::decrypt($ticketId);
            $ticket = Ticket::where('id', $decrypted_id)
                ->where('created_by', $userId)
                ->firstOrFail();
        } catch (\Exception $e) {
            return back()->with('error', __('Ticket not found'));
        }

        // Handle file attachments
        $attachments = [];
        if ($request->hasFile('attachments')) {
            try {
                foreach ($request->file('attachments') as $file) {
                    $filenameWithExt = $file->getClientOriginalName();
                    $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $fileNameToStore = $filename . '_' . uniqid() . '.' . $extension;

                    $tempRequest = new Request();
                    $tempRequest->files->set('attachment', $file);

                    $upload = upload_file($tempRequest, 'attachment', $fileNameToStore, 'support-ticket/' . $ticket->ticket_id);

                    if ($upload['flag'] == 1) {
                        $attachments[] = [
                            'name' => $filenameWithExt,
                            'path' => $upload['url']
                        ];
                    } else {
                        return back()->with('error', $upload['msg']);
                    }
                }
            } catch (\Exception $e) {
                return back()->with('error', __('Failed to upload attachments. Please try again.'));
            }
        }

        // Create conversation
        $conversion = new Conversion();
        $conversion->ticket_id = $ticket->id;
        $conversion->description = $request->description;
        $conversion->sender = 'user';
        $conversion->attachments = $attachments;
        $conversion->creator_id = $userId;
        $conversion->created_by = $userId;
        $conversion->save();

        // Dispatch reply event
        ReplyTicket::dispatch($request, $conversion, $ticket);

        // Send email notification if enabled
        if (!empty(company_setting('New Ticket Reply', $userId)) && company_setting('New Ticket Reply', $userId) == true) {
            $user = User::find($userId);

            $uArr = [
                'ticket_name' => $ticket->name,
                'ticket_id' => $ticket->ticket_id,
                'email' => $ticket->email,
                'reply_description' => $request->description,
            ];
            try {
                EmailTemplate::sendEmailTemplate('New Ticket Reply', [$user->email], $uArr, $userId);
            } catch (\Exception $e) {
                return redirect()->back()->with('error', __('Ticket not found'));
            }
        }

        return back()->with('success', __('The reply has been added successfully'));
    }

    public function show(Request $request, $id)
    {
        $userId = $this->getUserIdFromRequest($request);
        $userSlug = $request->route('slug');

        try {
            if ($id) {
                $decryptedId = Crypt::decrypt($id);
                $ticket = Ticket::find($decryptedId);
            } else {
                return redirect()->route('support-tickets.index')->with('error', __('Invalid ticket ID'));
            }
        } catch (\Exception $e) {
            $ticket = null;
        }

        if (!$ticket) {
            return redirect()->route('support-tickets.index')->with('error', __('Ticket not found'));
        }

        // Load relationships separately to avoid conflicts
        $ticket->load(['conversions']);
        $category = null;
        if ($ticket->category) {
            $category = TicketCategory::find($ticket->category);
        }

        $ticketData = [
            'id' => $ticket->id,
            'ticket_id' => $ticket->ticket_id,
            'name' => $ticket->name,
            'email' => $ticket->email,
            'user_id' => $ticket->user_id,
            'account_type' => $ticket->account_type,
            'category' => $ticket->category,
            'subject' => $ticket->subject,
            'status' => $ticket->status,
            'description' => $ticket->description,
            'note' => $ticket->note,
            'attachments' => $ticket->formatted_attachments,

            'category_info' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color ?? '#000000'
            ] : null,
            'conversions' => $ticket->conversions->map(function ($conversation) use ($ticket, $userId) {
                $replyByName = 'User';
                if ($conversation->sender === 'admin') {
                    $companyName = company_setting('company_name', $userId);
                    $replyByName = $companyName ?: 'Admin';
                } else {
                    $replyByName = $ticket->name;
                }

                return [
                    'id' => $conversation->id,
                    'ticket_id' => $conversation->ticket_id,
                    'description' => html_entity_decode($conversation->description),
                    'sender' => $conversation->sender,
                    'attachments' => $conversation->formatted_attachments,
                    'created_at' => $conversation->created_at ? $conversation->created_at->toISOString() : null,
                    'replyBy' => ['name' => $replyByName],
                ];
            }),
            'created_at' => $ticket->created_at ? $ticket->created_at->toISOString() : null,
            'updated_at' => $ticket->updated_at ? $ticket->updated_at->toISOString() : null,
        ];

        return Inertia::render('SupportTicket/Frontend/Show', [
            'title' => "Ticket #{$ticket->ticket_id} | {$userSlug} | Support Center",
            'ticket' => $ticketData,
        ]);
    }
}
