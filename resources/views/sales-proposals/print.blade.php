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

    $showLogo = isset($proposalSetting['show_logo']) 
        ? in_array($proposalSetting['show_logo'], [1, '1', true, 'true'], true)
        : true;
    $rawLogo = $proposalSetting['logo_image'] ?? $proposalSetting['company_logo'] ?? '';
    $logoImage = $rawLogo ? $getImagePath($rawLogo) : asset('uploads/logo/logo_dark.png');
    $headerLogoUrl = ($showLogo && $rawLogo) ? $getImagePath($rawLogo) : '';

    $defaultBgImage = $proposalSetting['background_image'] ?? '';
    $getPageBgUrl = function ($customBg = null) use ($getImagePath, $defaultBgImage) {
        $activeBg = !empty($customBg) ? $customBg : $defaultBgImage;
        if ($activeBg) {
            return $getImagePath($activeBg);
        }
        return '';
    };
    $getPageBgStyle = function ($customBg = null) use ($getImagePath, $defaultBgImage) {
        $activeBg = !empty($customBg) ? $customBg : $defaultBgImage;
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

    $replaceProposalShortcodes = function ($content) use ($proposal, $proposalSetting, $getImagePath, $logoImage, $templateColor) {
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
        $compPhone = $proposalSetting['company_telephone'] 
            ?? $proposalSetting['company_phone'] 
            ?? company_setting('company_telephone', $proposal->created_by) 
            ?? company_setting('company_phone', $proposal->created_by) 
            ?? '';

        $custAddr = $customer->address ?? '';
        if (empty($custAddr) && !empty($customer->billing_address)) {
            if (is_array($customer->billing_address)) {
                $custAddr = trim(($customer->billing_address['address_line_1'] ?? '') . ' ' . ($customer->billing_address['city'] ?? '') . ' ' . ($customer->billing_address['state'] ?? '') . ' ' . ($customer->billing_address['zip_code'] ?? ''));
            } else {
                $custAddr = (string) $customer->billing_address;
            }
        }

        $creatorName = $creatorUser?->name ?? 'Administrator';
        $creatorDesignation = $creatorUser?->designation ?? 'Sales Representative';
        $creatorEmail = $creatorUser?->email ?? '';
        $creatorPhone = $creatorUser?->phone ?? '';

        $rawDate = $proposal->proposal_date ?? $proposal->invoice_date ?? null;
        $rawDueDate = $proposal->due_date ?? null;
        $proposalDateFormatted = $rawDate ? \Carbon\Carbon::parse($rawDate)->format('j F Y') : '';
        $proposalDueDateFormatted = $rawDueDate ? \Carbon\Carbon::parse($rawDueDate)->format('j F Y') : '';

        $values = [
            'company_name' => $proposalSetting['company_name'] ?? company_setting('company_name', $proposal->created_by) ?? config('app.name', 'Automas'),
            'company_email' => $proposalSetting['company_email'] ?? company_setting('company_email', $proposal->created_by) ?? '',
            'company_phone' => $compPhone,
            'company_telephone' => $compPhone,
            'company_address' => $proposalSetting['company_address'] ?? company_setting('company_address', $proposal->created_by) ?? '',
            'company_website' => $proposalSetting['company_website'] ?? company_setting('company_website', $proposal->created_by) ?? '',
            'proposal_number' => $proposal->proposal_number,
            'proposal_subject' => $proposal->subject,
            'subject' => $proposal->subject,
            'proposal_date' => $proposalDateFormatted,
            'date' => $proposalDateFormatted,
            'invoice_date' => $proposalDateFormatted,
            'proposal_due_date' => $proposalDueDateFormatted,
            'due_date' => $proposalDueDateFormatted,
            'valid_until' => $proposalDueDateFormatted,
            'customer_name' => $customer->name ?? '',
            'customer_email' => $customer->email ?? '',
            'customer_phone' => $customer->mobile_no ?? $customer->phone ?? '',
            'customer_address' => $custAddr,
            'creator_name' => $creatorName,
            'creator_designation' => $creatorDesignation,
            'creator_email' => $creatorEmail,
            'creator_phone' => $creatorPhone,
            'proposal_validity' => $proposal->payment_terms ?? '',
            'payment_terms' => $proposal->payment_terms ?? '',
            'terms' => $proposal->payment_terms ?? '',
            'subtotal' => !empty($proposal->subtotal) ? number_format((float) $proposal->subtotal, 2) : '',
            'sub_total' => !empty($proposal->subtotal) ? number_format((float) $proposal->subtotal, 2) : '',
            'tax_amount' => !empty($proposal->tax_amount) ? number_format((float) $proposal->tax_amount, 2) : '',
            'total_tax' => !empty($proposal->tax_amount) ? number_format((float) $proposal->tax_amount, 2) : '',
            'discount_amount' => !empty($proposal->discount_amount) ? number_format((float) $proposal->discount_amount, 2) : '',
            'total_discount' => !empty($proposal->discount_amount) ? number_format((float) $proposal->discount_amount, 2) : '',
            'total_amount' => !empty($proposal->total_amount) ? number_format((float) $proposal->total_amount, 2) : '',
            'total' => !empty($proposal->total_amount) ? number_format((float) $proposal->total_amount, 2) : '',
        ];

        $res = $content;

        // Ensure any embedded CSS variables match template color
        $res = preg_replace('/--sp-accent-color:\s*#[a-f0-9]{3,8}/i', '--sp-accent-color: ' . $templateColor, $res);

        // Handle attributes
        $res = preg_replace('/src=(["\'])\s*\{\s*company_logo\s*\}\s*\1/i', 'src=$1' . $companyLogoUrl . '$1', $res);
        $res = preg_replace('/src=(["\'])\s*\{\s*proposal_logo\s*\}\s*\1/i', 'src=$1' . $proposalLogoUrl . '$1', $res);

        // Handle standalone tags
        if ($companyLogoUrl) {
            $res = preg_replace('/\{\s*company_logo\s*\}/i', '<img src="' . $companyLogoUrl . '" alt="Company Logo" class="proposal-logo" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
        } else {
            $res = preg_replace('/\{\s*company_logo\s*\}/i', '', $res);
        }

        if ($proposalLogoUrl) {
            $res = preg_replace('/\{\s*proposal_logo\s*\}/i', '<img src="' . $proposalLogoUrl . '" alt="Proposal Logo" class="proposal-logo" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
        } else {
            $res = preg_replace('/\{\s*proposal_logo\s*\}/i', '', $res);
        }

        foreach ($values as $k => $v) {
            $valStr = ($v !== null && $v !== '') ? (string) $v : '';
            $res = preg_replace('/\{\s*' . preg_quote($k, '/') . '\s*\}/i', $valStr, $res);
        }
        return $res;
    };
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Proposal #{{ $proposal->proposal_number }}</title>
    @vite(['resources/css/app.css'])
    <style>
        :root {
            --template-color: {{ $templateColor }} !important;
            --sp-accent-color: {{ $templateColor }} !important;
            --sp-text-title: #111827;
            --sp-text-sub: #64748b;
            --sp-text-body: #334155;
            --sp-border: #e5e7eb;
            --sp-bg-light-1: #f9fafb;
            --sp-bg-light-2: #eef2f7;
        }

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
            color: #1e293b;
        }

        .print-container {
            width: 210mm;
            margin: 0 auto;
            padding: 0;
            background-color: #ffffff;
        }

        .proposal-preview-sheet,
        .proposal-cover__sheet {
            width: 210mm;
            min-height: 296mm;
            height: 296mm;
            max-height: 296mm;
            background-color: #ffffff;
            margin: 0 auto;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid-page;
            box-shadow: none !important;
            border: none !important;
            position: relative !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            --template-color: {{ $templateColor }} !important;
            --sp-accent-color: {{ $templateColor }} !important;
        }

        .proposal-page__body {
            position: relative !important;
            z-index: 1 !important;
            padding: 32mm 15mm 20mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
        }

        .proposal-preview-sheet:last-child,
        .proposal-cover__sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
        }

        /* Dynamic Table Header Coloring */
        .proposal-preview-sheet table thead,
        .proposal-preview-sheet table thead tr,
        .proposal-preview-sheet table thead th,
        .proposal-preview-sheet table th,
        .proposal-page__body table thead,
        .proposal-page__body table thead tr,
        .proposal-page__body table thead th,
        .proposal-page__body table th,
        .html-preview-container table thead,
        .html-preview-container table thead tr,
        .html-preview-container table thead th,
        .html-preview-container table th {
            background-color: {{ $templateColor }} !important;
            color: #ffffff !important;
        }

        .proposal-preview-sheet table thead th,
        .proposal-preview-sheet table th,
        .proposal-page__body table thead th,
        .proposal-page__body table th,
        .html-preview-container table thead th,
        .html-preview-container table th {
            color: #ffffff !important;
            font-weight: 600;
        }

        /* Accent & Badge Dynamic Coloring */
        .sp-doc-badge-label {
            color: {{ $templateColor }} !important;
        }

        .sp-doc-accent-line {
            background-color: {{ $templateColor }} !important;
            background: {{ $templateColor }} !important;
        }

        .sp-doc-date-tag {
            border-color: {{ $templateColor }} !important;
            color: {{ $templateColor }} !important;
        }

        /* Ensure images and logos respect parent text alignment (center/left/right) */
        .proposal-preview-sheet img,
        .proposal-page__body img,
        img.proposal-logo,
        .proposal-logo {
            display: inline-block !important;
            vertical-align: middle;
        }

        .proposal-preview-sheet [style*="text-align: center"] img,
        .proposal-preview-sheet [style*="text-align:center"] img,
        .proposal-page__body [style*="text-align: center"] img,
        .proposal-page__body [style*="text-align:center"] img,
        .text-center img {
            display: inline-block !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        .proposal-preview-sheet [style*="text-align: right"] img,
        .proposal-preview-sheet [style*="text-align:right"] img,
        .proposal-page__body [style*="text-align: right"] img,
        .proposal-page__body [style*="text-align:right"] img,
        .text-right img {
            display: inline-block !important;
            margin-left: auto !important;
            margin-right: 0 !important;
        }

        .proposal-preview-sheet [style*="text-align: left"] img,
        .proposal-preview-sheet [style*="text-align:left"] img,
        .proposal-page__body [style*="text-align: left"] img,
        .proposal-page__body [style*="text-align:left"] img,
        .text-left img {
            display: inline-block !important;
            margin-right: auto !important;
            margin-left: 0 !important;
        }

        /* HTML Preview Container Typography */
        .html-preview-container {
            font-size: 14px;
            line-height: 1.5;
            color: #1e293b;
            width: 100%;
        }

        .html-preview-container > p { margin-bottom: 0.5rem; }
        .html-preview-container > p:last-child { margin-bottom: 0; }
        .html-preview-container p:empty { min-height: 1.15em; margin-bottom: 0; }
        .html-preview-container p:empty::before { content: "\00a0"; }

        @media print {
            @page {
                size: 210mm 297mm;
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

            .proposal-preview-sheet,
            .proposal-cover__sheet {
                width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                padding: 0 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid-page !important;
                overflow: hidden !important;
            }

            .proposal-page__body {
                position: relative !important;
                z-index: 1 !important;
                padding: 32mm 15mm 20mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
            }

            .proposal-preview-sheet:last-child,
            .proposal-cover__sheet:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }
        }
    </style>
</head>

<body>
    @php
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

        if (empty($customContentPages) || !is_array($customContentPages)) {
            $customContentPages = [];
        }
        // Filter out placeholder charges tokens from customContentPages
        $customContentPages = array_values(array_filter($customContentPages, function ($p) {
            $content = trim((string)($p['content'] ?? ''));
            $pageType = $p['page_type'] ?? '';
            $title = trim((string)($p['title'] ?? ''));
            if (in_array($pageType, ['otc', 'mrc', 'other-details'])) {
                return false;
            }
            if (in_array($content, ['[OTC_CHARGES_TABLE]', '[MRC_CHARGES_TABLE]', '[OTHER_DETAILS_CONTENT]'])) {
                return false;
            }
            if (in_array($title, ['One-Time Charges (OTC)', 'Monthly Recurring Charges (MRC)', 'Other Details', 'OTHER DETAILS']) && in_array($content, ['[OTC_CHARGES_TABLE]', '[MRC_CHARGES_TABLE]', '[OTHER_DETAILS_CONTENT]', ''])) {
                return false;
            }
            return true;
        }));

        // Check if OTC / MRC / Terms exist
        $hasOtcInContent = collect($customContentPages)->contains(fn($p) => in_array($p['page_type'] ?? '', ['otc']));
        $hasMrcInContent = collect($customContentPages)->contains(fn($p) => in_array($p['page_type'] ?? '', ['mrc']));

        $sectionsSource = $customContentPages;

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

            if ($pageType === 'otc' || $pageType === 'mrc') {
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
                $sheetBgUrl = $getPageBgUrl($page['background_image'] ?? null);
            @endphp

            {{-- 1. OTC CHARGES SHEET --}}
            @if($page['type'] === 'otc')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; right: 15mm; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: flex-end; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
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
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; right: 15mm; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: flex-end; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
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
                <div class="proposal-preview-sheet proposal-cover__sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; right: 15mm; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: flex-end; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="html-preview-container">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">
                                {{ $replaceProposalShortcodes($page['title']) }}</h3>
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>

                {{-- 5. CONTENT / DEFAULT PAGES --}}
            @else
                <div class="proposal-preview-sheet proposal-cover__sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; right: 15mm; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: flex-end; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="html-preview-container">
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>

    <script>
        window.addEventListener('DOMContentLoaded', function () {
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === '1' || urlParams.has('print')) {
                setTimeout(function () {
                    window.print();
                }, 400);
            }
        });
    </script>
</body>

</html>