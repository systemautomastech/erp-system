<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Proposal #{{ $proposal->proposal_number }}</title>
    @vite(['resources/css/app.css'])
    <style>
        * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        html,
        body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .print-container {
            width: 210mm;
            margin: 0 auto;
            padding: 0;
            background-color: #ffffff;
        }

        .proposal-preview-sheet,
        .quotation-cover__sheet {
            width: 210mm;
            min-height: 297mm;
            height: 297mm;
            background-color: #ffffff;
            margin: 0 auto;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
        }

        .quotation-cover__submitted {
            position: relative !important;
            border: 1px solid #e5e7eb;
            padding: 25px;
            background: linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(238, 242, 247, 0.9));
            border-radius: .25rem;
            text-align: center;
            margin-bottom: 16px;
            overflow: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .quotation-cover__submitted::before {
            content: "";
            position: absolute !important;
            top: -60px;
            left: -15%;
            width: 130%;
            height: 180px;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%239ca3af' stroke-width='1'%3E%3Cpath d='M0,150 C250,20 950,280 1200,120' opacity='0.5'/%3E%3Cpath d='M0,170 C300,40 900,300 1200,140' opacity='0.4'/%3E%3Cpath d='M0,190 C350,60 850,320 1200,160' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E");
            transform: scaleY(-1);
            background-size: cover;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .quotation-cover__submitted > * {
            position: relative;
            z-index: 1;
        }

        svg {
            display: inline-block;
            shape-rendering: geometricPrecision !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .quotation-cover__watermark circle,
        .quotation-cover__watermark_bottom circle,
        .quotation-cover__shape circle {
            vector-effect: non-scaling-stroke;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }

            html,
            body,
            .print-container {
                width: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background-color: #ffffff !important;
            }
        }
    </style>
</head>

<body>
    @php
        $proposalSetting = $proposalSetting ?? \App\Models\ProposalSetting::getSettings($proposal->created_by);
        $templateColor = $proposalSetting['template_color'] ?? '#E9591C';

        $getImagePath = function ($path) {
            if (!$path)
                return '';
            $cleanPath = ltrim($path, '/');
            if (str_starts_with($cleanPath, 'http://') || str_starts_with($cleanPath, 'https://')) {
                return $cleanPath;
            }
            if (str_starts_with($cleanPath, 'storage/')) {
                return asset($cleanPath);
            }
            if (str_starts_with($cleanPath, 'uploads/')) {
                return asset($cleanPath);
            }
            // Check if file exists in media or general storage
            if (file_exists(public_path('storage/media/' . $cleanPath))) {
                return asset('storage/media/' . $cleanPath);
            }
            if (file_exists(public_path('storage/' . $cleanPath))) {
                return asset('storage/' . $cleanPath);
            }
            return asset('storage/' . $cleanPath);
        };

        $rawLogo = $proposalSetting['logo_image'] ?? '';
        $logoImage = $rawLogo ? $getImagePath($rawLogo) : asset('uploads/logo/logo_dark.png');

        $defaultBgImage = $proposalSetting['background_image'] ?? '';
        $getPageBgStyle = function ($customBg = null, $isFrontPage = false) use ($getImagePath, $defaultBgImage) {
            $activeBg = !empty($customBg) ? $customBg : (!$isFrontPage ? $defaultBgImage : null);
            if ($activeBg) {
                $url = $getImagePath($activeBg);
                return "background-image: url('{$url}') !important; background-size: 100% 100% !important; background-position: center !important; background-repeat: no-repeat !important;";
            }
            return '';
        };

        $companyName = \App\Models\ProposalSetting::getSettings($proposal->created_by)['company_name'] ?? config('app.name', 'Automas');
        $cleanCompName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($companyName)));
        $cleanPropNum = strtolower(preg_replace('/[^a-z0-9-]+/i', '_', trim($proposal->proposal_number)));
        $pdfFilename = "quotation_{$cleanCompName}_{$cleanPropNum}.pdf";

        $replaceProposalShortcodes = function ($content) use ($proposal, $proposalSetting, $getImagePath, $logoImage) {
            if (empty($content)) return '';
            $customer = $proposal->customer ?? null;
            $dateFormat = $proposalSetting['dateFormat'] ?? 'Y-m-d';

            $rawCompanyLogo = company_setting('logo_dark', $proposal->created_by)
                ?? company_setting('logo_light', $proposal->created_by)
                ?? company_setting('company_logo', $proposal->created_by)
                ?? company_setting('logo', $proposal->created_by)
                ?? admin_setting('logo_dark')
                ?? admin_setting('logo_light')
                ?? admin_setting('logo')
                ?? 'uploads/logo/logo_dark.png';
            $companyLogoUrl = $getImagePath($rawCompanyLogo) ?: asset('uploads/logo/logo_dark.png');
            $rawProposalLogo = $proposalSetting['logo_image'] ?? $rawCompanyLogo;
            $proposalLogoUrl = $getImagePath($rawProposalLogo) ?: $logoImage;

            $creatorUser = \App\Models\User::find($proposal->creator_id ?? $proposal->created_by);

            $values = [
                'app_name' => $proposalSetting['company_name'] ?? config('app.name', 'Automas'),
                'company_name' => $proposalSetting['company_name'] ?? config('app.name', 'Automas'),
                'company_email' => $proposalSetting['company_email'] ?? '',
                'company_phone' => $proposalSetting['company_phone'] ?? '',
                'company_address' => $proposalSetting['company_address'] ?? '',
                'company_website' => $proposalSetting['company_website'] ?? '',
                'employee_name' => $creatorUser->name ?? '',
                'employee_email' => $creatorUser->email ?? '',
                'employee_phone' => $creatorUser->phone ?? $creatorUser->mobile ?? '',
                'proposal_number' => $proposal->proposal_number ?? '',
                'proposal_date' => !empty($proposal->proposal_date) ? \Carbon\Carbon::parse($proposal->proposal_date)->format($dateFormat) : '',
                'due_date' => !empty($proposal->due_date) ? \Carbon\Carbon::parse($proposal->due_date)->format($dateFormat) : '',
                'proposal_validity' => $proposal->payment_terms ?? '',
                'customer_name' => $customer->name ?? '',
                'customer_email' => $customer->email ?? '',
                'customer_phone' => $customer->phone ?? $customer->mobile ?? '',
                'customer_address' => $customer->address ?? $customer->billing_address ?? '',
                'total_amount' => !empty($proposal->total_amount) ? number_format((float) $proposal->total_amount, 2) : '',
                'sub_total' => !empty($proposal->subtotal) ? number_format((float) $proposal->subtotal, 2) : '',
                'total_tax' => !empty($proposal->tax_amount) ? number_format((float) $proposal->tax_amount, 2) : '',
                'total_discount' => !empty($proposal->discount_amount) ? number_format((float) $proposal->discount_amount, 2) : '',
            ];

            $res = $content;

            // Handle src="{company_logo}" and src="{proposal_logo}"
            $res = preg_replace('/src=(["\'])\s*\{\s*company_logo\s*\}\s*\1/i', 'src=$1' . $companyLogoUrl . '$1', $res);
            $res = preg_replace('/src=(["\'])\s*\{\s*proposal_logo\s*\}\s*\1/i', 'src=$1' . $proposalLogoUrl . '$1', $res);

            // Handle standalone tags
            $res = preg_replace('/\{\s*company_logo\s*\}/i', '<img src="' . $companyLogoUrl . '" alt="Company Logo" class="proposal-logo" style="max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
            $res = preg_replace('/\{\s*proposal_logo\s*\}/i', '<img src="' . $proposalLogoUrl . '" alt="Proposal Logo" class="proposal-logo" style="max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);

            foreach ($values as $k => $v) {
                $res = preg_replace('/\{\s*' . preg_quote($k, '/') . '\s*\}/i', (string) $v, $res);
            }
            // Any unresolved or empty shortcodes become empty string
            $res = preg_replace('/\{[a-zA-Z0-9_\-\s]+\}/', '', $res);
            return $res;
        };

        $items = $proposal->items ?? collect();
        $otcItems = $items->filter(function ($i) {
            return ($i->section === 'otc' || $i->section === 'general' || !$i->section) && ((float) $i->unit_price > 0 || (int) $i->product_id > 0 || !empty($i->product_description));
        })->values();

        $otcSubtotal = $otcItems->sum(fn($i) => (float) ($i->total_amount ?? ($i->quantity * $i->unit_price)));
        $otcDiscount = $otcItems->sum(fn($i) => (float) ($i->discount_amount ?? 0));
        $otcTax = $otcItems->sum(fn($i) => (float) ($i->tax_amount ?? 0));
        $otcTotal = $otcSubtotal - $otcDiscount + $otcTax;

        $mrcItems = $items->filter(function ($i) {
            return $i->section === 'mrc' && ((float) $i->unit_price > 0 || (int) $i->product_id > 0 || !empty($i->product_description));
        })->values();

        $mrcSubtotal = $mrcItems->sum(fn($i) => (float) ($i->total_amount ?? ($i->quantity * $i->unit_price)));
        $mrcDiscount = $mrcItems->sum(fn($i) => (float) ($i->discount_amount ?? 0));
        $mrcTax = $mrcItems->sum(fn($i) => (float) ($i->tax_amount ?? 0));
        $mrcTotal = $mrcSubtotal - $mrcDiscount + $mrcTax;

        // Build Sections Source for this individual proposal
        $customContentPages = [];
        if (isset($proposal->contents) && count($proposal->contents) > 0) {
            $customContentPages = $proposal->contents->map(function ($c) {
                $decoded = is_string($c->proposal_content) ? json_decode($c->proposal_content, true) : null;
                return is_array($decoded) ? $decoded : [
                    'title' => $c->title ?? '',
                    'content' => $c->content ?? $c->proposal_content ?? '',
                    'page_type' => $c->page_type ?? 'content',
                    'background_image' => $c->background_image ?? null,
                    'order' => $c->order ?? 1,
                ];
            })->toArray();
        } elseif (\Illuminate\Support\Facades\Schema::hasTable('sales_proposal_contents')) {
            $dbContents = \App\Models\SalesProposalContent::where('proposal_id', $proposal->id)->orderBy('order')->get();
            if ($dbContents && $dbContents->count() > 0) {
                $customContentPages = $dbContents->map(function ($c) {
                    $decoded = is_string($c->proposal_content) ? json_decode($c->proposal_content, true) : null;
                    return is_array($decoded) ? $decoded : [
                        'title' => $c->title ?? '',
                        'content' => $c->content ?? $c->proposal_content ?? '',
                        'page_type' => $c->page_type ?? 'content',
                        'background_image' => $c->background_image ?? null,
                        'order' => $c->order ?? 1,
                    ];
                })->toArray();
            }
        }

        if (empty($customContentPages)) {
            $rawContent = $proposal->proposal_content ?? ($proposal->others ?? null);
            if (is_string($rawContent)) {
                $customContentPages = json_decode($rawContent, true) ?: [];
            } elseif (is_array($rawContent)) {
                $customContentPages = $rawContent;
            }
        }

        // Check if OTC / MRC / Terms exist
        $hasOtcInContent = collect($customContentPages)->contains(fn($p) => in_array($p['page_type'] ?? '', ['otc']));
        $hasMrcInContent = collect($customContentPages)->contains(fn($p) => in_array($p['page_type'] ?? '', ['mrc']));
        $hasFrontInContent = collect($customContentPages)->contains(fn($p) => in_array($p['page_type'] ?? '', ['front-page']) || str_contains(strtolower($p['title'] ?? ''), 'front') || str_contains(strtolower($p['title'] ?? ''), 'cover'));

        $sectionsSource = $customContentPages;

        if (!$hasFrontInContent) {
            array_unshift($sectionsSource, ['id' => 'fp', 'title' => 'Front Page', 'page_type' => 'front-page', 'order' => 0]);
        }

        if (!$hasOtcInContent && count($otcItems) > 0) {
            $sectionsSource[] = ['id' => 'otc', 'title' => 'One-Time Charges (OTC)', 'page_type' => 'otc', 'order' => 100];
        }

        if (!$hasMrcInContent && count($mrcItems) > 0) {
            $sectionsSource[] = ['id' => 'mrc', 'title' => 'Monthly Recurring Charges (MRC)', 'page_type' => 'mrc', 'order' => 101];
        }

        if (!empty($proposal->other_details) && trim($proposal->other_details) !== '' && $proposal->other_details !== '<p></p>') {
            $hasOtherInContent = collect($sectionsSource)->contains(fn($p) => ($p['page_type'] ?? '') === 'other-details');
            if (!$hasOtherInContent) {
                $sectionsSource[] = ['id' => 'other', 'title' => 'OTHER DETAILS', 'page_type' => 'other-details', 'order' => 102];
            }
        }

        // Sort sections by order
        usort($sectionsSource, function ($a, $b) {
            return ($a['order'] ?? 0) <=> ($b['order'] ?? 0);
        });

        // Helper for estimating item weight in blade
        $estimateItemWeight = function ($item) {
            $desc = $item->product->description ?? $item->product_description ?? '';
            $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($desc)));
            $blockTags = preg_match_all('/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/i', $desc, $matches);
            $textLines = ceil(strlen($plainText) / 48);
            $descLines = max($textLines, $blockTags, (!empty($desc) ? 1 : 0));

            $pName = $item->product->name ?? $item->product_name ?? '';
            $nameLines = max(ceil(strlen($pName) / 28), 1);
            $effectiveLines = max($descLines, $nameLines);

            return 1 + ($effectiveLines - 1) * 0.7;
        };

        // Helper for chunking items dynamically in blade
        $chunkItemsDynamic = function ($itemsList) use ($estimateItemWeight) {
            if (count($itemsList) === 0)
                return [];
            $chunks = [];
            $currentChunk = [];
            $currentWeight = 0;
            $currentStartIndex = 0;

            $REGULAR_PAGE_CAPACITY = 26;
            $LAST_PAGE_CAPACITY = 25;
            $totalCount = count($itemsList);

            foreach ($itemsList as $idx => $item) {
                $itemWeight = $estimateItemWeight($item);
                $remainingItems = $totalCount - $idx;
                $capacity = ($remainingItems <= 5) ? $LAST_PAGE_CAPACITY : $REGULAR_PAGE_CAPACITY;

                if (count($currentChunk) > 0 && ($currentWeight + $itemWeight > $capacity)) {
                    $chunks[] = ['items' => $currentChunk, 'startIndex' => $currentStartIndex];
                    $currentChunk = [$item];
                    $currentWeight = $itemWeight;
                    $currentStartIndex = $idx;
                } else {
                    $currentChunk[] = $item;
                    $currentWeight += $itemWeight;
                }
            }

            if (count($currentChunk) > 0) {
                $chunks[] = ['items' => $currentChunk, 'startIndex' => $currentStartIndex];
            }

            return $chunks;
        };

        // Build Renderable Pages Array matching ProposalPreviewModal
        $renderablePages = [];
        foreach ($sectionsSource as $sIdx => $sec) {
            $sec = (array) $sec;
            $pageType = $sec['page_type'] ?? '';
            $isFront = $pageType === 'front-page' || !empty($sec['is_front_page']) || str_contains(strtolower($sec['title'] ?? ''), 'front') || str_contains(strtolower($sec['title'] ?? ''), 'cover');

            if ($isFront) {
                if (!empty($sec['content']) && trim(strip_tags($sec['content'])) !== '') {
                    $renderablePages[] = [
                        'key' => "content-{$sIdx}",
                        'type' => 'content',
                        'title' => $sec['title'] ?? 'Front Page',
                        'content' => $sec['content'],
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                } else {
                    $renderablePages[] = [
                        'key' => "front-{$sIdx}",
                        'type' => 'front-page',
                        'title' => $sec['title'] ?? 'Front Page',
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                }
            } elseif ($pageType === 'otc' || $pageType === 'mrc') {
                $isOtc = ($pageType === 'otc');
                $targetItems = $isOtc ? $otcItems : $mrcItems;
                $targetSubtotal = $isOtc ? $otcSubtotal : $mrcSubtotal;
                $targetDiscount = $isOtc ? $otcDiscount : $mrcDiscount;
                $targetTax = $isOtc ? $otcTax : $mrcTax;
                $targetTotal = $isOtc ? $otcTotal : $mrcTotal;
                $title = $isOtc ? 'One-Time Charges (OTC)' : 'Monthly Recurring Charges (MRC)';

                if (count($targetItems) === 0) {
                    $renderablePages[] = [
                        'key' => "{$pageType}-empty-{$sIdx}",
                        'type' => $pageType,
                        'title' => $title,
                        'background_image' => $sec['background_image'] ?? null,
                        'items' => [],
                        'startIndex' => 0,
                        'isLastChunk' => true,
                        'subtotal' => 0,
                        'discount' => 0,    
                        'tax' => 0,
                        'total' => 0,
                    ];
                } else {
                    $itemChunks = $chunkItemsDynamic($targetItems);
                    $totalChunks = count($itemChunks);

                    foreach ($itemChunks as $cIdx => $chk) {
                        $renderablePages[] = [
                            'key' => "{$pageType}-chunk-{$cIdx}-{$sIdx}",
                            'type' => $pageType,
                            'title' => $title,
                            'background_image' => $sec['background_image'] ?? null,
                            'items' => $chk['items'],
                            'startIndex' => $chk['startIndex'],
                            'isLastChunk' => ($cIdx === $totalChunks - 1),
                            'subtotal' => $targetSubtotal,
                            'discount' => $targetDiscount,
                            'tax' => $targetTax,
                            'total' => $targetTotal,
                        ];
                    }
                }
            } elseif ($pageType === 'other-details') {
                $renderablePages[] = [
                    'key' => "other-{$sIdx}",
                    'type' => 'other-details',
                    'title' => 'OTHER DETAILS',
                    'content' => $proposal->other_details ?? '',
                    'background_image' => $sec['background_image'] ?? null,
                ];
            } else {
                $renderablePages[] = [
                    'key' => "content-{$sIdx}",
                    'type' => 'content',
                    'title' => $sec['title'] ?? '',
                    'content' => $sec['content'] ?? '',
                    'background_image' => $sec['background_image'] ?? null,
                ];
            }
        }
        $totalPages = count($renderablePages);
    @endphp

    <div class="print-container" id="boxes">
        @foreach($renderablePages as $pIdx => $page)
            @php
                $pageNum = $pIdx + 1;
                $isFrontPage = ($page['type'] === 'front-page');
                $pageBgStyle = $getPageBgStyle($page['background_image'], $isFrontPage);
                $hasCustomFrontBg = !empty($page['background_image']);
            @endphp

            {{-- 1. COVER PAGE --}}
            @if($isFrontPage)
                <div class="quotation-cover__sheet"
                    style="width: 210mm; min-height: 297mm; height: 297mm; background-color: #ffffff; position: relative; overflow: hidden; page-break-after: always; box-sizing: border-box; {{ $pageBgStyle }}">
                    @if(!$hasCustomFrontBg)
                        <div class="quotation-cover__topbar"
                            style="position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, {{ $templateColor }}, #fffb00); z-index: 1; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
                        </div>

                        <svg class="quotation-cover__shape quotation-cover__shape--top"
                            width="240" height="240"
                            style="position: absolute; top: -46px; left: -46px; width: 240px; height: 240px; z-index: 1; pointer-events: none;"
                            viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="180" stroke="{{ $templateColor }}" stroke-width="28" fill="none"></circle>
                            <circle cx="80" cy="80" r="120" stroke="#111827" stroke-width="14" fill="none"></circle>
                            <circle cx="110" cy="110" r="70" stroke="{{ $templateColor }}" stroke-width="10" fill="none"></circle>
                        </svg>

                        <svg class="quotation-cover__shape quotation-cover__shape--bottom"
                            width="240" height="240"
                            style="position: absolute; right: -30px; bottom: -30px; width: 240px; height: 240px; transform: rotate(180deg); opacity: 0.5; z-index: 1; pointer-events: none;"
                            viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="180" stroke="{{ $templateColor }}" stroke-width="28" fill="none"></circle>
                            <circle cx="80" cy="80" r="120" stroke="#111827" stroke-width="14" fill="none"></circle>
                            <circle cx="110" cy="110" r="70" stroke="{{ $templateColor }}" stroke-width="10" fill="none"></circle>
                        </svg>

                        <svg class="quotation-cover__watermark"
                            width="150" height="150"
                            style="position: absolute; right: 22mm; top: 76mm; width: 150px; height: 150px; opacity: 0.15; z-index: 1; pointer-events: none;"
                            viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="72" stroke="{{ $templateColor }}" stroke-width="16" fill="none"></circle>
                            <circle cx="100" cy="100" r="42" stroke="#111827" stroke-width="10" fill="none"></circle>
                        </svg>

                        <svg class="quotation-cover__watermark_bottom"
                            width="150" height="150"
                            style="position: absolute; left: 0.5rem; bottom: 7.5rem; width: 150px; height: 150px; opacity: 0.18; z-index: 1; pointer-events: none;"
                            viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="72" stroke="{{ $templateColor }}" stroke-width="16" fill="none"></circle>
                            <circle cx="100" cy="100" r="42" stroke="#111827" stroke-width="10" fill="none"></circle>
                        </svg>
                    @endif

                    <div class="quotation-cover__body"
                        style="padding: 10mm 20mm; position: relative; z-index: 2; min-height: calc(297mm - 10px); display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: transparent;">
                        <div style="text-align: right; margin-bottom: 15mm;">
                            <img src="{{ $logoImage }}" alt="Company Logo"
                                style="max-height: 60px; object-fit: contain; margin-left: auto;">
                        </div>

                        <div style="position: relative;">
                            <div
                                style="letter-spacing: .18em; font-size: .8rem; color: {{ $templateColor }}; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                                Financial Proposal
                            </div>

                            <h1
                                style="font-size: 2.2rem; line-height: 1.15; color: #111827; font-weight: 700; margin: 0 0 8px 0;">
                                {{ $proposal->subject ?? 'Subject' }}
                            </h1>

                            <div style="font-size: 1.1rem; color: #64748b; font-weight: 600; margin-bottom: 16px;">
                                Quotation & Commercial Proposal
                            </div>

                            <div
                                style="width: 90px; height: 4px; border-radius: 999px; background: {{ $templateColor }}; margin-bottom: 24px;">
                            </div>

                            <div style="margin-bottom: 30px;">
                                <span
                                    style="display: inline-block; border: 1px solid {{ $templateColor }}; padding: .4rem .85rem; font-size: .8rem; font-weight: 600; color: {{ $templateColor }}; background: #ffffff; border-radius: 0.25rem;">
                                    {{ $proposal->proposal_date ? date('M d, Y', strtotime($proposal->proposal_date)) : date('M d, Y') }}
                                </span>
                            </div>

                            <div class="quotation-cover__submitted"
                                style="border: 1px solid #e5e7eb; padding: 25px; background: linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(238, 242, 247, 0.9)); border-radius: .25rem; text-align: center; margin-bottom: 16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
                                <div
                                    style="text-transform: uppercase; color: #64748b; font-weight: 700; font-size: 12px; margin-bottom: 8px; text-decoration: underline;">
                                    Submitted To
                                </div>
                                <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
                                    {{ $proposal->customer->name ?? 'Client Name' }}
                                </h2>
                                <p style="color: #475569; font-size: 12px; margin: 0;">
                                    {{ $proposal->customer->address ?? $proposal->customer->email ?? 'Client Address' }}
                                </p>
                            </div>

                            <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: .25rem; text-align: center; margin-bottom: 16px;">
                                <div
                                    style="text-transform: uppercase; color: #64748b; font-weight: 700; font-size: 12px; margin-bottom: 10px; text-decoration: underline;">
                                    Prepared By
                                </div>
                                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                                    {{ $companyName }}
                                </div>
                                <div style="font-size: 12px; color: #334155; line-height: 1.5;">
                                    <div style="margin-bottom: 4px;">
                                        <strong>Corporate Office:</strong>
                                        {{ company_setting('company_address', $proposal->created_by) ?? 'Company Address' }}
                                    </div>
                                    <div style="margin-bottom: 4px;">
                                        <span>
                                            <strong>Web:</strong> {{ company_setting('company_website', $proposal->created_by) ?? 'www.example.com' }}
                                        </span>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <span>
                                            <strong>Email:</strong> {{ company_setting('company_email', $proposal->created_by) ?? 'info@example.com' }}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Phone:</strong> {{ company_setting('company_telephone', $proposal->created_by) ?? (company_setting('company_phone', $proposal->created_by) ?? 'Company Phone') }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style="margin-top: auto; padding-top: 14px; border-top: 1px solid #dee2e6; font-size: 13px; display: flex; justify-content: space-between; color: #475569;">
                            <div><strong>Prepared by:</strong> {{ $companyName }}</div>
                            <div><strong>Subject:</strong> {{ $proposal->subject ?? 'Subject' }}</div>
                        </div>
                    </div>
                </div>

                {{-- 2. OTC CHARGES SHEET --}}
            @elseif($page['type'] === 'otc')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #293240;">
                                {{ $page['title'] }}
                            </div>

                            <table
                                style="width: 100%; font-size: 12px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px;">
                                <thead>
                                    <tr
                                        style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th
                                            style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">
                                            S/N</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">
                                            Item / Service</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">
                                            Description</th>
                                        <th
                                            style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">
                                            Qty.</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">
                                            Price (BDT)</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">
                                            Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if(count($page['items']) === 0)
                                        <tr>
                                            <td colSpan="6"
                                                style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
                                                No items in this charge section.
                                            </td>
                                        </tr>
                                    @else
                                        @php
                                            $startIdx = $page['startIndex'] ?? 0;
                                        @endphp
                                        @foreach($page['items'] as $index => $item)
                                            @php
                                                $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                                $pDesc = $item->product->description ?? $item->product_description ?? '';
                                                $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            @endphp
                                            <tr>
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">
                                                    {{ $startIdx + $index + 1 }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">
                                                    {{ $pName }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word; font-size: 11px;">
                                                    {!! $pDesc !!}</td>
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ $item->quantity }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ number_format($item->unit_price, 2) }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ number_format($lTotal, 2) }}</td>
                                            </tr>
                                        @endforeach

                                        @if(!empty($page['isLastChunk']))
                                            <tr>
                                                <td colspan="4"
                                                    style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #64748b; font-style: italic; vertical-align: middle; word-break: break-word;">
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                    Total (BDT):
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['subtotal'], 2) }}
                                                </td>
                                            </tr>
                                            @if($page['discount'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        Discount:
                                                    </td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        -{{ number_format($page['discount'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($page['tax'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        VAT/Tax:
                                                    </td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        +{{ number_format($page['tax'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    Grand Total:
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['total'], 2) }}
                                                </td>
                                            </tr>
                                        @endif
                                    @endif
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {{-- 3. MRC CHARGES SHEET --}}
            @elseif($page['type'] === 'mrc')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #293240;">
                                {{ $page['title'] }}
                            </div>

                            <table
                                style="width: 100%; font-size: 12px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px;">
                                <thead>
                                    <tr
                                        style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th
                                            style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">
                                            S/N</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">
                                            Item / Service</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">
                                            Description</th>
                                        <th
                                            style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">
                                            Qty.</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">
                                            Price (BDT)</th>
                                        <th
                                            style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">
                                            Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if(count($page['items']) === 0)
                                        <tr>
                                            <td colSpan="6"
                                                style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
                                                No items in this charge section.
                                            </td>
                                        </tr>
                                    @else
                                        @php
                                            $startIdx = $page['startIndex'] ?? 0;
                                        @endphp
                                        @foreach($page['items'] as $index => $item)
                                            @php
                                                $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                                $pDesc = $item->product->description ?? $item->product_description ?? '';
                                                $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            @endphp
                                            <tr>
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">
                                                    {{ $startIdx + $index + 1 }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">
                                                    {{ $pName }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word; font-size: 11px;">
                                                    {!! $pDesc !!}</td>
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ $item->quantity }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ number_format($item->unit_price, 2) }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">
                                                    {{ number_format($lTotal, 2) }}</td>
                                            </tr>
                                        @endforeach

                                        @if(!empty($page['isLastChunk']))
                                            <tr>
                                                <td colspan="4"
                                                    style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #64748b; font-style: italic; vertical-align: middle; word-break: break-word;">
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                    Total (BDT):
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['subtotal'], 2) }}
                                                </td>
                                            </tr>
                                            @if($page['discount'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        Discount:
                                                    </td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        -{{ number_format($page['discount'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($page['tax'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        VAT/Tax:
                                                    </td>
                                                    <td
                                                        style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        +{{ number_format($page['tax'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    Grand Total:
                                                </td>
                                                <td
                                                    style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['total'], 2) }}
                                                </td>
                                            </tr>
                                        @endif
                                    @endif
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>

                {{-- 4. OTHER DETAILS SHEET --}}
            @elseif($page['type'] === 'other-details')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">
                                {{ $replaceProposalShortcodes($page['title']) }}</h3>
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                     
                    </div>
                </div>

                {{-- 5. CONTENT / DEFAULT PAGES --}}
            @else
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>
</body>

</html>