@php
    $creatorId = $quotation->created_by ?? $quotation->creator_id ?? (auth()->check() ? auth()->id() : 1);
    $quotationSetting = $quotationSetting ?? (\Automas\Quotation\Models\QuotationSetting::getSettings($creatorId) ?? []);
    $templateColor = $quotationSetting['template_color'] ?? '#E9591C';

    $toDataUri = function ($fullFilePath) {
        if (!file_exists($fullFilePath) || !is_readable($fullFilePath)) {
            return null;
        }
        $mime = mime_content_type($fullFilePath) ?: 'image/jpeg';
        $data = file_get_contents($fullFilePath);
        return 'data:' . $mime . ';base64,' . base64_encode($data);
    };

    $getImagePath = function ($path) use ($toDataUri) {
        if (!$path)
            return '';

        $cleanPath = ltrim($path, '/');

        // Check local storage files first to convert to base64 (avoids HTTP deadlock during PDF rendering)
        $possibleLocalPaths = [
            storage_path('app/public/media/' . basename($cleanPath)),
            storage_path('app/public/' . $cleanPath),
            public_path('storage/media/' . basename($cleanPath)),
            public_path('storage/' . $cleanPath),
            public_path($cleanPath),
            public_path('uploads/' . $cleanPath),
        ];

        foreach ($possibleLocalPaths as $localPath) {
            if (file_exists($localPath) && is_file($localPath)) {
                $dataUri = $toDataUri($localPath);
                if ($dataUri) {
                    return $dataUri;
                }
            }
        }

        if (str_starts_with($cleanPath, 'http://') || str_starts_with($cleanPath, 'https://')) {
            return $cleanPath;
        }

        if (function_exists('getImageUrlPrefix')) {
            $prefix = getImageUrlPrefix();
            if ($prefix) {
                return rtrim($prefix, '/') . '/' . basename($cleanPath);
            }
        }

        return \Illuminate\Support\Facades\Storage::url($cleanPath);
    };

    $showLogo = isset($quotationSetting['show_logo']) 
        ? in_array($quotationSetting['show_logo'], [1, '1', true, 'true'], true)
        : true;
    $rawLogo = $quotationSetting['logo_image'] ?? $quotationSetting['company_logo'] ?? '';
    $logoImage = $rawLogo ? $getImagePath($rawLogo) : asset('uploads/logo/logo_dark.png');
    $headerLogoUrl = ($showLogo && $rawLogo) ? $getImagePath($rawLogo) : '';
    $headerLogoAlign = $quotationSetting['header_logo_align'] ?? 'right';
    $headerLogoStyle = match ($headerLogoAlign) {
        'left' => 'left: 15mm; right: auto; justify-content: flex-start;',
        'center', 'middle' => 'left: 50%; right: auto; transform: translateX(-50%); justify-content: center;',
        default => 'right: 15mm; left: auto; justify-content: flex-end;',
    };

    $defaultBgImage = $quotationSetting['background_image'] ?? '';
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

    $companyName = $quotationSetting['company_name'] ?? company_setting('company_name', $creatorId) ?? '';
    $quotationNumber = $quotation->quotation_number;
    $pdfFilename = "{$companyName}_Sales Quotation_#{$quotationNumber}.pdf";

    $replaceQuotationShortcodes = function ($content) use ($quotation, $quotationSetting, $getImagePath, $logoImage, $templateColor, $creatorId) {
        if (empty($content)) return '';
        $customer = $quotation->customer ?? null;
        $dateFormat = $quotationSetting['dateFormat'] ?? 'Y-m-d';

        $rawCompanyLogo = company_setting('logo_dark', $creatorId)
            ?? company_setting('logo_light', $creatorId)
            ?? company_setting('company_logo', $creatorId)
            ?? company_setting('logo', $creatorId)
            ?? admin_setting('logo_dark')
            ?? admin_setting('logo_light')
            ?? admin_setting('logo')
            ?? 'uploads/logo/logo_dark.png';
        $companyLogoUrl = $getImagePath($rawCompanyLogo) ?: asset('uploads/logo/logo_dark.png');
        $rawProposalLogo = $quotationSetting['logo_image'] ?? $rawCompanyLogo;
        $proposalLogoUrl = $getImagePath($rawProposalLogo) ?: $logoImage;

        $authorUser = \App\Models\User::with('employee')->find($creatorId);
        $employeeRecord = $authorUser?->employee;
        $compPhone = $quotationSetting['company_telephone'] 
            ?? $quotationSetting['company_phone'] 
            ?? company_setting('company_telephone', $creatorId) 
            ?? company_setting('company_phone', $creatorId) 
            ?? '';

        $custAddr = $customer->address ?? '';
        if (empty($custAddr) && !empty($customer->billing_address)) {
            if (is_array($customer->billing_address)) {
                $custAddr = trim(($customer->billing_address['address_line_1'] ?? '') . ' ' . ($customer->billing_address['city'] ?? '') . ' ' . ($customer->billing_address['state'] ?? '') . ' ' . ($customer->billing_address['zip_code'] ?? ''));
            } else {
                $custAddr = (string) $customer->billing_address;
            }
        }

        $authorName = $authorUser?->name ?? 'Administrator';
        $authorDesignation = $employeeRecord?->designation?->name ?? $authorUser?->designation ?? 'Sales Representative';
        $authorEmail = $authorUser?->email ?? '';
        $authorPhone = $employeeRecord?->emergency_contact_number ?? $authorUser?->mobile_no ?? $authorUser?->phone ?? '';
        $authorId = $employeeRecord?->employee_id ?? ($authorUser?->id ?? '');

        $rawDate = $quotation->quotation_date ?? $quotation->invoice_date ?? null;
        $rawDueDate = $quotation->due_date ?? null;
        $quotationDateFormatted = $rawDate ? \Carbon\Carbon::parse($rawDate)->format('j F Y') : '';
        $quotationDueDateFormatted = $rawDueDate ? \Carbon\Carbon::parse($rawDueDate)->format('j F Y') : '';

        $values = [
            'company_name' => $quotationSetting['company_name'] ?? company_setting('company_name', $quotation->creator_id ?? $quotation->created_by) ?? config('app.name', 'Automas'),
            'company_email' => $quotationSetting['company_email'] ?? company_setting('company_email', $quotation->creator_id ?? $quotation->created_by) ?? '',
            'company_phone' => $compPhone,
            'company_telephone' => $compPhone,
            'company_address' => $quotationSetting['company_address'] ?? company_setting('company_address', $quotation->creator_id ?? $quotation->created_by) ?? '',
            'company_website' => $quotationSetting['company_website'] ?? company_setting('company_website', $quotation->creator_id ?? $quotation->created_by) ?? '',
            'quotation_number' => $quotation->quotation_number,
            'proposal_number' => $quotation->quotation_number,
            'quotation_subject' => $quotation->subject ?? $quotation->notes ?? '',
            'proposal_subject' => $quotation->subject ?? $quotation->notes ?? '',
            'subject' => $quotation->subject ?? $quotation->notes ?? '',
            'quotation_date' => $quotationDateFormatted,
            'proposal_date' => $quotationDateFormatted,
            'date' => $quotationDateFormatted,
            'invoice_date' => $quotationDateFormatted,
            'quotation_due_date' => $quotationDueDateFormatted,
            'proposal_due_date' => $quotationDueDateFormatted,
            'due_date' => $quotationDueDateFormatted,
            'valid_until' => $quotationDueDateFormatted,
            'customer_name' => $customer->name ?? $quotation->customer_name ?? '',
            'customer_email' => $customer->email ?? $quotation->customer_email ?? '',
            'customer_phone' => $customer->mobile_no ?? $customer->phone ?? $quotation->customer_phone ?? '',
            'customer_address' => !empty($custAddr) ? $custAddr : ($quotation->customer_address ?? ''),
            'user_id' => $authorId,
            'user_name' => $authorName,
            'user_email' => $authorEmail,
            'user_phone' => $authorPhone,
            'creator_name' => $authorName,
            'creator_designation' => $authorDesignation,
            'creator_email' => $authorEmail,
            'creator_phone' => $authorPhone,
            'quotation_validity' => $quotation->payment_terms ?? '',
            'proposal_validity' => $quotation->payment_terms ?? '',
            'payment_terms' => $quotation->payment_terms ?? '',
            'terms' => $quotation->payment_terms ?? '',
            'subtotal' => !empty($quotation->subtotal) ? number_format((float) $quotation->subtotal, 2) : '',
            'sub_total' => !empty($quotation->subtotal) ? number_format((float) $quotation->subtotal, 2) : '',
            'tax_amount' => !empty($quotation->tax_amount) ? number_format((float) $quotation->tax_amount, 2) : '',
            'total_tax' => !empty($quotation->tax_amount) ? number_format((float) $quotation->tax_amount, 2) : '',
            'discount_amount' => !empty($quotation->discount_amount) ? number_format((float) $quotation->discount_amount, 2) : '',
            'total_discount' => !empty($quotation->discount_amount) ? number_format((float) $quotation->discount_amount, 2) : '',
            'total_amount' => !empty($quotation->total_amount) ? number_format((float) $quotation->total_amount, 2) : '',
            'total' => !empty($quotation->total_amount) ? number_format((float) $quotation->total_amount, 2) : '',
        ];

        $res = $content;

        // Ensure any embedded CSS variables match template color
        $res = preg_replace('/--sp-accent-color:\s*#[a-f0-9]{3,8}/i', '--sp-accent-color: ' . $templateColor, $res);

        // Handle attributes
        $res = preg_replace('/src=(["\'])\s*\{\s*company_logo\s*\}\s*\1/i', 'src=$1' . $companyLogoUrl . '$1', $res);
        $res = preg_replace('/src=(["\'])\s*\{\s*proposal_logo\s*\}\s*\1/i', 'src=$1' . $proposalLogoUrl . '$1', $res);
        $res = preg_replace('/src=(["\'])\s*\{\s*quotation_logo\s*\}\s*\1/i', 'src=$1' . $proposalLogoUrl . '$1', $res);

        // Handle standalone tags
        if ($companyLogoUrl) {
            $res = preg_replace('/\{\s*company_logo\s*\}/i', '<img src="' . $companyLogoUrl . '" alt="Company Logo" class="proposal-logo" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
        } else {
            $res = preg_replace('/\{\s*company_logo\s*\}/i', '', $res);
        }

        if ($proposalLogoUrl) {
            $res = preg_replace('/\{\s*proposal_logo\s*\}/i', '<img src="' . $proposalLogoUrl . '" alt="Proposal Logo" class="proposal-logo" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
            $res = preg_replace('/\{\s*quotation_logo\s*\}/i', '<img src="' . $proposalLogoUrl . '" alt="Quotation Logo" class="proposal-logo" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />', $res);
        } else {
            $res = preg_replace('/\{\s*proposal_logo\s*\}/i', '', $res);
            $res = preg_replace('/\{\s*quotation_logo\s*\}/i', '', $res);
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
    <title>Sales Quotation #{{ $quotation->quotation_number }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
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
            font-family: "Open Sans", sans-serif !important;
            color: #1e293b;
        }

        .print-container {
            width: 210mm;
            margin: 0 auto;
            padding: 0;
            background-color: #ffffff;
            font-family: "Open Sans", sans-serif !important;
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

        /* HTML Preview Container Typography matching Unified Preview Modal */
        .html-preview-container {
            font-size: 14px;
            line-height: 1.5;
            color: #1e293b;
            width: 100%;
        }

        .html-preview-container h1 { font-size: 24px; font-weight: 700; margin: 8px 0; color: #0f172a; }
        .html-preview-container h2 { font-size: 20px; font-weight: 700; margin: 8px 0; color: #0f172a; }
        .html-preview-container h3 { font-size: 18px; font-weight: 600; margin: 6px 0; color: #0f172a; }
        .html-preview-container h4 { font-size: 16px; font-weight: 600; margin: 4px 0; color: #0f172a; }
        .html-preview-container p { margin: 4px 0; }
        .html-preview-container > p:first-child { margin-top: 0; }
        .html-preview-container > p:last-child { margin-bottom: 0; }
        .html-preview-container p:empty { min-height: 1.15em; margin: 0; }
        .html-preview-container p:empty::before { content: "\00a0"; }
        .html-preview-container ul { list-style-type: disc; margin-left: 24px; margin-top: 8px; margin-bottom: 8px; }
        .html-preview-container ol { list-style-type: decimal; margin-left: 24px; margin-top: 8px; margin-bottom: 8px; }
        .html-preview-container li { margin-top: 2px; margin-bottom: 2px; }
        .html-preview-container blockquote { border-left: 4px solid #cbd5e1; padding-left: 16px; font-style: italic; margin: 8px 0; }
        .html-preview-container a { color: #2563eb; text-decoration: underline; }
        .html-preview-container table { width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1; }
        .html-preview-container th { border: 1px solid #cbd5e1; padding: 8px 10px; font-weight: 600; text-align: left; }
        .html-preview-container td { border: 1px solid #cbd5e1; padding: 8px 10px; color: #1e293b; }

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
        $items = $quotation->items ?? collect();
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

        // Build Sections Source for this individual quotation
        $customContentPages = [];
        if (isset($quotation->contents) && count($quotation->contents) > 0) {
            $customContentPages = $quotation->contents->map(function ($c) {
                $decoded = is_string($c->quotation_content ?? $c->content) ? json_decode($c->quotation_content ?? $c->content, true) : null;
                return is_array($decoded) ? $decoded : [
                    'title' => $c->title ?? '',
                    'content' => $c->content ?? $c->quotation_content ?? '',
                    'background_image' => $c->background_image ?? null,
                    'order' => $c->sort_order ?? $c->order ?? 1,
                ];
            })->toArray();
        }

        if (empty($customContentPages)) {
            $rawContent = $quotation->quotation_content ?? ($quotation->others ?? null);
            if (is_string($rawContent)) {
                $customContentPages = json_decode($rawContent, true) ?: [];
            } elseif (is_array($rawContent)) {
                $customContentPages = $rawContent;
            }
        }

        if (empty($customContentPages) && !empty($defaultPages)) {
            $customContentPages = collect($defaultPages)->map(function ($p, $idx) {
                return [
                    'title' => $p->title ?? '',
                    'content' => $p->content ?? '',
                    'background_image' => $p->background_image ?? null,
                    'order' => $p->sort_order ?? $idx + 1,
                ];
            })->toArray();
        }

        if (empty($customContentPages) || !is_array($customContentPages)) {
            $customContentPages = [];
        }

        $sectionsSource = $customContentPages;

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

        // Calculate total weight of OTC and MRC to check if they can fit together on one page
        $totalOtcWeight = 0;
        foreach ($otcItems as $item) {
            $totalOtcWeight += $estimateItemWeight($item);
        }
        $totalMrcWeight = 0;
        foreach ($mrcItems as $item) {
            $totalMrcWeight += $estimateItemWeight($item);
        }

        // A single page has capacity of ~22 weight units for combined tables including headings and summary rows
        $COMBINED_PAGE_CAPACITY = 20;
        $canCombineCharges = (count($otcItems) > 0 && count($mrcItems) > 0 && ($totalOtcWeight + $totalMrcWeight) <= $COMBINED_PAGE_CAPACITY);
        $chargesCombinedRendered = false;

        // Build Renderable Pages Array matching exact user section order
        $renderablePages = [];
        foreach ($sectionsSource as $sIdx => $sec) {
            $sec = (array) $sec;
            $rawContent = trim((string)($sec['content'] ?? ''));
            $title = $sec['title'] ?? '';
            $isOtc = $rawContent === '[OTC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'one-time charges') !== false);
            $isMrc = $rawContent === '[MRC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'monthly recurring charges') !== false);
            $isOther = $rawContent === '[OTHER_DETAILS_CONTENT]' || (!empty($title) && stripos($title, 'other details') !== false);

            if ($isOtc || $isMrc) {
                if ($canCombineCharges) {
                    if (!$chargesCombinedRendered) {
                        $renderablePages[] = [
                            'key' => "combined-charges-{$sIdx}",
                            'type' => 'combined-charges',
                            'otcTitle' => 'One-Time Charges (OTC)',
                            'mrcTitle' => 'Monthly Recurring Charges (MRC)',
                            'background_image' => $sec['background_image'] ?? null,
                            'otcItems' => $otcItems,
                            'mrcItems' => $mrcItems,
                            'otcSubtotal' => $otcSubtotal,
                            'otcDiscount' => $otcDiscount,
                            'otcTax' => $otcTax,
                            'otcTotal' => $otcTotal,
                            'mrcSubtotal' => $mrcSubtotal,
                            'mrcDiscount' => $mrcDiscount,
                            'mrcTax' => $mrcTax,
                            'mrcTotal' => $mrcTotal,
                        ];
                        $chargesCombinedRendered = true;
                    }
                    continue;
                }
            }

            if ($isOtc) {
                if (count($otcItems) > 0) {
                    $itemChunks = $chunkItemsDynamic($otcItems);
                    $totalChunks = count($itemChunks);

                    foreach ($itemChunks as $cIdx => $chk) {
                        $renderablePages[] = [
                            'key' => "otc-chunk-{$cIdx}-{$sIdx}",
                            'type' => 'otc',
                            'title' => !empty($title) ? $title : 'One-Time Charges (OTC)',
                            'background_image' => $sec['background_image'] ?? null,
                            'items' => $chk['items'],
                            'startIndex' => $chk['startIndex'],
                            'isLastChunk' => ($cIdx === $totalChunks - 1),
                            'subtotal' => $otcSubtotal,
                            'discount' => $otcDiscount,
                            'tax' => $otcTax,
                            'total' => $otcTotal,
                        ];
                    }
                }
                continue;
            }

            if ($isMrc) {
                if (count($mrcItems) > 0) {
                    $itemChunks = $chunkItemsDynamic($mrcItems);
                    $totalChunks = count($itemChunks);

                    foreach ($itemChunks as $cIdx => $chk) {
                        $renderablePages[] = [
                            'key' => "mrc-chunk-{$cIdx}-{$sIdx}",
                            'type' => 'mrc',
                            'title' => !empty($title) ? $title : 'Monthly Recurring Charges (MRC)',
                            'background_image' => $sec['background_image'] ?? null,
                            'items' => $chk['items'],
                            'startIndex' => $chk['startIndex'],
                            'isLastChunk' => ($cIdx === $totalChunks - 1),
                            'subtotal' => $mrcSubtotal,
                            'discount' => $mrcDiscount,
                            'tax' => $mrcTax,
                            'total' => $mrcTotal,
                        ];
                    }
                }
                continue;
            }

            if ($isOther) {
                if (!empty($quotation->other_details) && trim($quotation->other_details) !== '' && $quotation->other_details !== '<p></p>') {
                    $renderablePages[] = [
                        'key' => "other-details-{$sIdx}",
                        'type' => 'other-details',
                        'title' => !empty($title) ? $title : 'OTHER DETAILS',
                        'content' => $quotation->other_details,
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                }
                continue;
            }

            // Normal Content Page
            $renderablePages[] = [
                'key' => "content-{$sIdx}",
                'type' => 'content',
                'title' => $title,
                'content' => $sec['content'] ?? '',
                'background_image' => $sec['background_image'] ?? null,
            ];
        }
        $totalPages = count($renderablePages);
    @endphp

    <div class="print-container" id="boxes">
        @foreach($renderablePages as $pIdx => $page)
            @php
                $pageNum = $pIdx + 1;
                $sheetBgUrl = $getPageBgUrl($page['background_image'] ?? null);
            @endphp

            {{-- 0. COMBINED CHARGES SHEET (OTC + MRC on Same Page) --}}
            @if($page['type'] === 'combined-charges')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; {{ $headerLogoStyle }} z-index: 20; pointer-events: none; display: flex; align-items: center; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 28mm 15mm 18mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="margin-top:1.5rem">
                            {{-- OTC Table --}}
                            <div style="font-weight: 700; margin-bottom: 6px; font-size: 13px; color: #293240;">
                                {{ $page['otcTitle'] }}
                            </div>
                            <table
                                style="width: 100%; font-size: 11px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                                <thead>
                                    <tr style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">S/N</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">Item / Service</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">Description</th>
                                        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">Qty.</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Price (BDT)</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($page['otcItems'] as $index => $item)
                                        @php
                                            $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                            $pDesc = $item->description ?? $item->product_description ?? $item->product->description ?? '';
                                            $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
                                            $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                        @endphp
                                        <tr>
                                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">{{ $index + 1 }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">{{ $pName }}</td>
                                            <td class="proposal-item-desc" style="padding: 4px 6px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word;">{!! $pDesc !!}</td>
                                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">{{ $item->quantity }}{{ $pUnit ? ' ' . $pUnit : '' }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($item->unit_price, 2) }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($lTotal, 2) }}</td>
                                        </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                        <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; font-size: 10px; white-space: nowrap;">Total (BDT):</td>
                                        <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">{{ number_format($page['otcSubtotal'], 2) }}</td>
                                    </tr>
                                    @if($page['otcDiscount'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; font-size: 10px; white-space: nowrap;">Discount:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">-{{ number_format($page['otcDiscount'], 2) }}</td>
                                        </tr>
                                    @endif
                                    @if($page['otcTax'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; font-size: 10px; white-space: nowrap;">VAT/Tax:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; font-size: 10px; white-space: nowrap;">+{{ number_format($page['otcTax'], 2) }}</td>
                                        </tr>
                                    @endif
                                    @if($page['otcDiscount'] > 0 || $page['otcTax'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">Grand Total:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">{{ number_format($page['otcTotal'], 2) }}</td>
                                        </tr>
                                    @endif
                                </tbody>
                            </table>

                            {{-- MRC Table --}}
                            <div style="font-weight: 700; margin-top: 28px; margin-bottom: 8px; font-size: 13px; color: #293240;">
                                {{ $page['mrcTitle'] }}
                            </div>
                            <table
                                style="width: 100%; font-size: 11px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1;">
                                <thead>
                                    <tr style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">S/N</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">Item / Service</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">Description</th>
                                        <th style="padding: 6px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">Qty.</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Price (BDT)</th>
                                        <th style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($page['mrcItems'] as $index => $item)
                                        @php
                                            $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                            $pDesc = $item->description ?? $item->product_description ?? $item->product->description ?? '';
                                            $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
                                            $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                        @endphp
                                        <tr>
                                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">{{ $index + 1 }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">{{ $pName }}</td>
                                            <td class="proposal-item-desc" style="padding: 4px 6px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word;">{!! $pDesc !!}</td>
                                            <td style="padding: 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">{{ $item->quantity }}{{ $pUnit ? ' ' . $pUnit : '' }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($item->unit_price, 2) }}</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($lTotal, 2) }}</td>
                                        </tr>
                                    @endforeach
                                    <tr>
                                        <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                        <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; font-size: 10px; white-space: nowrap;">Total (BDT):</td>
                                        <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">{{ number_format($page['mrcSubtotal'], 2) }}</td>
                                    </tr>
                                    @if($page['mrcDiscount'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; font-size: 10px; white-space: nowrap;">Discount:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">-{{ number_format($page['mrcDiscount'], 2) }}</td>
                                        </tr>
                                    @endif
                                    @if($page['mrcTax'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; font-size: 10px; white-space: nowrap;">VAT/Tax:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; font-size: 10px; white-space: nowrap;">+{{ number_format($page['mrcTax'], 2) }}</td>
                                        </tr>
                                    @endif
                                    @if($page['mrcDiscount'] > 0 || $page['mrcTax'] > 0)
                                        <tr>
                                            <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">Grand Total:</td>
                                            <td style="padding: 4px 6px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; font-size: 10px; white-space: nowrap;">{{ number_format($page['mrcTotal'], 2) }}</td>
                                        </tr>
                                    @endif
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            {{-- 1. OTC CHARGES SHEET --}}
            @elseif($page['type'] === 'otc')
                <div class="proposal-preview-sheet"
                    style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; {{ !$loop->last ? 'page-break-after: always; break-after: page;' : 'page-break-after: avoid; break-after: avoid;' }} position: relative; overflow: hidden; --template-color: {{ $templateColor }}; --sp-accent-color: {{ $templateColor }};">
                    @if(!empty($sheetBgUrl))
                        <div style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden;">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" style="width: 100%; height: 100%; object-fit: fill; display: block;" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div style="position: absolute; top: 8mm; {{ $headerLogoStyle }} z-index: 20; pointer-events: none; display: flex; align-items: center; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="margin-top:2rem">
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
                                                $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
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
                                                    {{ $item->quantity }}{{ $pUnit ? ' ' . $pUnit : '' }}</td>
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
                        <div style="position: absolute; top: 8mm; {{ $headerLogoStyle }} z-index: 20; pointer-events: none; display: flex; align-items: center; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="margin-top:2rem">
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
                                                 $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
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
                                                    {{ $item->quantity }}{{ $pUnit ? ' ' . $pUnit : '' }}</td>
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
                        <div style="position: absolute; top: 8mm; {{ $headerLogoStyle }} z-index: 20; pointer-events: none; display: flex; align-items: center; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="html-preview-container" style="margin-top:2rem">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">
                                {{ $replaceQuotationShortcodes($page['title']) }}</h3>
                            {!! $replaceQuotationShortcodes($page['content']) !!}
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
                        <div style="position: absolute; top: 8mm; {{ $headerLogoStyle }} z-index: 20; pointer-events: none; display: flex; align-items: center; max-height: 20mm; max-width: 60mm;">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" style="max-height: 16mm; max-width: 55mm; object-fit: contain;" />
                        </div>
                    @endif
                    <div class="proposal-page__body"
                        style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; height: 297mm; max-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="html-preview-container" style="margin-top:2rem">
                            {!! $replaceQuotationShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>

    @if(empty($isServerPdf))
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
    @endif
</body>

</html>
