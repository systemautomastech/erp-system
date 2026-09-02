@php
    $creatorId = $proposal->created_by ?? $proposal->creator_id ?? auth()->id();
    $proposalSetting = $proposalSetting ?? \App\Models\ProposalSetting::getSettings($creatorId);
    $templateColor = $proposalSetting['template_color'] ?? '#E9591C';

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

    $showLogo = isset($proposalSetting['show_logo'])
        ? in_array($proposalSetting['show_logo'], [1, '1', true, 'true'], true)
        : true;
    $rawLogo = $proposalSetting['logo_image'] ?? $proposalSetting['company_logo'] ?? '';
    $logoImage = $rawLogo ? $getImagePath($rawLogo) : asset('uploads/logo/logo_dark.png');
    $headerLogoUrl = ($showLogo && $rawLogo) ? $getImagePath($rawLogo) : '';
    $headerLogoAlign = $proposalSetting['header_logo_align'] ?? 'right';
    $headerLogoStyle = match ($headerLogoAlign) {
        'left' => 'left: 15mm; right: auto; justify-content: flex-start;',
        'center', 'middle' => 'left: 50%; right: auto; transform: translateX(-50%); justify-content: center;',
        default => 'right: 15mm; left: auto; justify-content: flex-end;',
    };

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

    $companyName = $proposalSetting['company_name'] ?? company_setting('company_name', $creatorId) ?? '';
    $proposalNumber = $proposal->proposal_number;
    $pdfFilename = "{$companyName}_Sales Proposal_#{$proposalNumber}.pdf";

    $replaceProposalShortcodes = function ($content) use ($proposal, $proposalSetting, $getImagePath, $logoImage, $templateColor, $creatorId) {
        if (empty($content))
            return '';
        $customer = $proposal->customer ?? null;
        $dateFormat = $proposalSetting['dateFormat'] ?? 'Y-m-d';

        $rawCompanyLogo = company_setting('logo_dark', $creatorId)
            ?? company_setting('logo_light', $creatorId)
            ?? company_setting('company_logo', $creatorId)
            ?? company_setting('logo', $creatorId)
            ?? admin_setting('logo_dark')
            ?? admin_setting('logo_light')
            ?? admin_setting('logo')
            ?? 'uploads/logo/logo_dark.png';
        $companyLogoUrl = $getImagePath($rawCompanyLogo) ?: asset('uploads/logo/logo_dark.png');
        $rawProposalLogo = $proposalSetting['logo_image'] ?? $rawCompanyLogo;
        $proposalLogoUrl = $getImagePath($rawProposalLogo) ?: $logoImage;

        $authorUser = \App\Models\User::with('employee')->find($creatorId);
        $employeeRecord = $authorUser?->employee;
        $compPhone = $proposalSetting['company_telephone']
            ?? $proposalSetting['company_phone']
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

        $rawDate = $proposal->proposal_date ?? $proposal->invoice_date ?? null;
        $rawDueDate = $proposal->due_date ?? null;
        $proposalDateFormatted = $rawDate ? \Carbon\Carbon::parse($rawDate)->format('j F Y') : '';
        $proposalDueDateFormatted = $rawDueDate ? \Carbon\Carbon::parse($rawDueDate)->format('j F Y') : '';

        $values = [
            'company_name' => $proposalSetting['company_name'] ?? company_setting('company_name', $proposal->creator_id ?? $proposal->created_by) ?? config('app.name', 'Automas'),
            'company_email' => $proposalSetting['company_email'] ?? company_setting('company_email', $proposal->creator_id ?? $proposal->created_by) ?? '',
            'company_phone' => $compPhone,
            'company_telephone' => $compPhone,
            'company_address' => $proposalSetting['company_address'] ?? company_setting('company_address', $proposal->creator_id ?? $proposal->created_by) ?? '',
            'company_website' => $proposalSetting['company_website'] ?? company_setting('company_website', $proposal->creator_id ?? $proposal->created_by) ?? '',
            'proposal_number' => $proposal->proposal_number,
            'proposal_subject' => $proposal->subject,
            'subject' => $proposal->subject,
            'proposal_date' => $proposalDateFormatted,
            'date' => $proposalDateFormatted,
            'invoice_date' => $proposalDateFormatted,
            'proposal_due_date' => $proposalDueDateFormatted,
            'due_date' => $proposalDueDateFormatted,
            'valid_until' => $proposalDueDateFormatted,
            'customer_name' => $customer->name ?? $proposal->customer_name ?? '',
            'customer_email' => $customer->email ?? $proposal->customer_email ?? '',
            'customer_phone' => $customer->mobile_no ?? $customer->phone ?? $proposal->customer_phone ?? '',
            'customer_address' => !empty($custAddr) ? $custAddr : ($proposal->customer_address ?? ''),
            'user_id' => $authorId,
            'user_name' => $authorName,
            'user_email' => $authorEmail,
            'user_phone' => $authorPhone,
            'creator_name' => $authorName,
            'creator_designation' => $authorDesignation,
            'creator_email' => $authorEmail,
            'creator_phone' => $authorPhone,
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
        rel="stylesheet">
    <style>
        :root {
            --template-color:
                {{ $templateColor }}
                !important;
            --sp-accent-color:
                {{ $templateColor }}
                !important;
            --sp-text-title: #111827;
            --sp-text-sub: #64748b;
            --sp-text-body: #334155;
            --sp-border: #cbd5e1;
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
            min-height: 297mm;
            height: 297mm;
            max-height: 297mm;
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
            --template-color:
                {{ $templateColor }}
                !important;
            --sp-accent-color:
                {{ $templateColor }}
                !important;
        }

        .proposal-preview-sheet:last-child,
        .proposal-cover__sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
        }

        .proposal-bg-layer {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
        }

        .proposal-bg-layer img {
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
        }

        .proposal-header-logo-container {
            position: absolute;
            top: 8mm;
            z-index: 20;
            pointer-events: none;
            display: flex;
            align-items: center;
            max-height: 20mm;
            max-width: 60mm;
        }

        .proposal-header-logo-container img {
            max-height: 16mm;
            max-width: 55mm;
            object-fit: contain;
        }

        .proposal-page__body {
            position: relative !important;
            z-index: 1 !important;
            padding: 32mm 15mm 20mm !important;
            min-height: 297mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
        }

        .proposal-page__body.body-combined {
            padding: 28mm 15mm 18mm !important;
        }

        .proposal-section-title {
            font-weight: 700;
            margin-top: 12px;
            margin-bottom: 6px;
            font-size: 13px;
            color: #293240;
        }

        .proposal-page__body > :first-child .proposal-section-title,
        .proposal-charges-wrapper:first-child .proposal-section-title {
            margin-top: 0;
        }

        /* Proposal Table System */
        .proposal-table {
            width: 100% !important;
            font-size: 10px !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            border: 1px solid #cbd5e1 !important;
            margin-bottom: 8px !important;
        }

        .proposal-table thead tr {
            background-color:
                {{ $templateColor }}
                !important;
            color: #ffffff !important;
            text-align: center;
            font-weight: 600;
        }

        .proposal-table thead th {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            color: #ffffff !important;
            font-size: 10px;
            font-weight: 600;
            background-color:
                {{ $templateColor }}
                !important;
            box-sizing: border-box;
        }

        .proposal-table th.col-sn {
            width: 5%;
            text-align: center;
            padding: 6px 4px;
        }

        .proposal-table th.col-item {
            width: 16%;
            text-align: left;
        }

        .proposal-table th.col-desc {
            width: 33%;
            text-align: left;
        }

        .proposal-table th.col-qty {
            width: 7%;
            text-align: center;
            padding: 6px 4px;
        }

        .proposal-table th.col-price {
            width: 12%;
            text-align: right;
        }

        .proposal-table th.col-tax {
            width: 14%;
            text-align: right;
        }

        .proposal-table th.col-total {
            width: 13%;
            text-align: right;
        }

        .proposal-table tbody td {
            border: 1px solid #cbd5e1;
            color: #293240;
            vertical-align: middle;
            box-sizing: border-box;
            word-break: break-word;
            overflow-wrap: anywhere;
            font-size: 10px;
        }

        .proposal-td-sn {
            padding: 4px;
            text-align: center;
        }

        .proposal-td-item {
            padding: 4px 6px;
            font-weight: 500;
        }

        .proposal-td-qty {
            padding: 4px;
            text-align: center;
        }

        .proposal-td-price {
            padding: 4px 6px;
            text-align: right;
        }

        .proposal-td-tax {
            padding: 4px 6px;
            text-align: right;
        }

        .proposal-td-total {
            padding: 4px 6px;
            text-align: right;
            font-weight: 700;
        }

        .proposal-no-items {
            padding: 16px;
            text-align: center;
            color: #94a3b8;
            font-style: italic;
        }

        .proposal-summary-label {
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            text-align: right;
            font-weight: 700;
            color: #1e293b;
            font-size: 10px;
            white-space: nowrap;
            vertical-align: middle;
        }

        .proposal-summary-value {
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            text-align: right;
            font-weight: 700;
            color: #0f172a;
            font-size: 10px;
            white-space: nowrap;
            vertical-align: middle;
        }

        /* Description HTML Typography */
        .proposal-item-desc {
            padding: 4px 6px;
            text-align: left;
            font-size: 10px;
            line-height: 1.35;
            color: #293240;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        .proposal-item-desc p {
            margin: 0 0 2px 0 !important;
            padding: 0 !important;
            line-height: 1.35 !important;
        }

        .proposal-item-desc p:last-child {
            margin-bottom: 0 !important;
        }

        .proposal-item-desc ul,
        .proposal-item-desc ol {
            margin: 0 0 2px 0 !important;
            padding-left: 14px !important;
            list-style-position: outside !important;
        }

        .proposal-item-desc li {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.35 !important;
        }

        .proposal-item-desc li p {
            display: inline !important;
            margin: 0 !important;
        }

        /* Content / Other Details Typography */
        .html-preview-container {
            font-size: 14px;
            line-height: 1.5;
            color: #1e293b;
            width: 100%;
        }

        .html-preview-container h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 8px 0;
            color: #0f172a;
        }

        .html-preview-container h2 {
            font-size: 20px;
            font-weight: 700;
            margin: 8px 0;
            color: #0f172a;
        }

        .html-preview-container h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 6px 0;
            color: #0f172a;
        }

        .html-preview-container h4 {
            font-size: 16px;
            font-weight: 600;
            margin: 4px 0;
            color: #0f172a;
        }

        .html-preview-container p {
            margin: 4px 0;
        }

        .html-preview-container>p:first-child {
            margin-top: 0;
        }

        .html-preview-container>p:last-child {
            margin-bottom: 0;
        }

        .html-preview-container p:empty {
            min-height: 1.15em;
            margin: 0;
        }

        .html-preview-container p:empty::before {
            content: "\00a0";
        }

        .html-preview-container ul {
            list-style-type: disc;
            margin-left: 24px;
            margin-top: 8px;
            margin-bottom: 8px;
        }

        .html-preview-container ol {
            list-style-type: decimal;
            margin-left: 24px;
            margin-top: 8px;
            margin-bottom: 8px;
        }

        .html-preview-container li {
            margin-top: 2px;
            margin-bottom: 2px;
        }

        .html-preview-container blockquote {
            border-left: 4px solid #cbd5e1;
            padding-left: 16px;
            font-style: italic;
            margin: 8px 0;
        }

        .html-preview-container a {
            color: #2563eb;
            text-decoration: underline;
        }

        .html-preview-container table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            border: 1px solid #cbd5e1;
        }

        .html-preview-container th {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            font-weight: 600;
            text-align: left;
            background-color:
                {{ $templateColor }}
                !important;
            color: #ffffff !important;
        }

        .html-preview-container table td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            color: #1e293b;
        }

        /* Accent & Badge Dynamic Coloring */
        .sp-doc-badge-label {
            color:
                {{ $templateColor }}
                !important;
        }

        .sp-doc-accent-line {
            background-color:
                {{ $templateColor }}
                !important;
            background:
                {{ $templateColor }}
                !important;
        }

        .sp-doc-date-tag {
            border-color:
                {{ $templateColor }}
                !important;
            color:
                {{ $templateColor }}
                !important;
        }

        /* Logo alignments */
        .proposal-preview-sheet img,
        .proposal-page__body img,
        img.proposal-logo,
        .proposal-logo {
            display: inline-block !important;
            vertical-align: middle;
        }

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
                justify-content: flex-start !important;
            }

            .proposal-page__body.body-combined {
                padding: 28mm 15mm 18mm !important;
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
            return ($i->section === 'otc' || $i->section === 'general' || !$i->section) && ((float) $i->unit_price > 0 || (int) $i->product_id > 0 || !empty($i->description) || !empty($i->product_description));
        })->values();

        $otcSubtotal = $otcItems->sum(fn($i) => (float) ($i->quantity * $i->unit_price));
        $otcDiscount = $otcItems->sum(fn($i) => (float) ($i->discount_amount ?? 0));
        $otcTax = $otcItems->sum(fn($i) => (float) ($i->tax_amount ?? 0));

        $mrcItems = $items->filter(function ($i) {
            return $i->section === 'mrc' && ((float) $i->unit_price > 0 || (int) $i->product_id > 0 || !empty($i->description) || !empty($i->product_description));
        })->values();

        $mrcSubtotal = $mrcItems->sum(fn($i) => (float) ($i->quantity * $i->unit_price));
        $mrcDiscount = $mrcItems->sum(fn($i) => (float) ($i->discount_amount ?? 0));
        $mrcTax = $mrcItems->sum(fn($i) => (float) ($i->tax_amount ?? 0));

        // If overall proposal has discount_amount but items discount sum is 0
        if (($otcDiscount + $mrcDiscount) == 0 && (float) ($proposal->discount_amount ?? 0) > 0) {
            $overallDisc = (float) $proposal->discount_amount;
            $allSubtotal = $otcSubtotal + $mrcSubtotal;
            if ($allSubtotal > 0) {
                $otcDiscount = ($otcSubtotal / $allSubtotal) * $overallDisc;
                $mrcDiscount = ($mrcSubtotal / $allSubtotal) * $overallDisc;
            }
        }

        $otcTotal = max(0, $otcSubtotal - $otcDiscount + $otcTax);
        $mrcTotal = max(0, $mrcSubtotal - $mrcDiscount + $mrcTax);

        // Helper to format discount label with percentage if applicable
        $getDiscountLabel = function ($discountAmount, $subtotal, $items) {
            if ($discountAmount <= 0) {
                return 'Discount:';
            }
            // Check if items have uniform percentage
            $discountedItems = $items->filter(fn($i) => (float) ($i->discount_amount ?? 0) > 0);
            if ($discountedItems->count() > 0) {
                $percentages = $discountedItems->map(fn($i) => (float) ($i->discount_percentage ?? 0))->unique();
                if ($percentages->count() === 1 && $percentages->first() > 0) {
                    $pct = $percentages->first();
                    $pctStr = ($pct == (int) $pct) ? (int) $pct : rtrim(rtrim(number_format($pct, 2), '0'), '.');
                    return "Discount ({$pctStr}%):";
                }
            }
            // Fallback: If section subtotal and discount yield a clean percentage
            if ($subtotal > 0 && $discountAmount > 0) {
                $calcPct = ($discountAmount / $subtotal) * 100;
                $roundedPct = round($calcPct, 2);
                $diff = abs($discountAmount - (($subtotal * $roundedPct) / 100));
                if ($diff < 0.05) {
                    $pctStr = ($roundedPct == (int) $roundedPct) ? (int) $roundedPct : rtrim(rtrim(number_format($roundedPct, 2), '0'), '.');
                    return "Discount ({$pctStr}%):";
                }
            }
            return 'Discount:';
        };

        $otcDiscountLabel = $getDiscountLabel($otcDiscount, $otcSubtotal, $otcItems);
        $mrcDiscountLabel = $getDiscountLabel($mrcDiscount, $mrcSubtotal, $mrcItems);

        // Build Sections Source for this individual proposal
        $customContentPages = [];
        if (isset($proposal->contents) && count($proposal->contents) > 0) {
            $customContentPages = $proposal->contents->map(function ($c) {
                $decoded = is_string($c->proposal_content) ? json_decode($c->proposal_content, true) : null;
                if (is_array($decoded)) {
                    return [
                        'title' => $decoded['title'] ?? $c->title ?? '',
                        'content' => $decoded['content'] ?? $c->proposal_content ?? '',
                        'page_type' => $decoded['page_type'] ?? $c->page_type ?? 'content',
                        'background_image' => $decoded['background_image'] ?? $c->background_image ?? null,
                        'order' => $c->order ?? 1,
                    ];
                }
                return [
                    'title' => $c->title ?? '',
                    'content' => $c->proposal_content ?? '',
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
                    if (is_array($decoded)) {
                        return [
                            'title' => $decoded['title'] ?? $c->title ?? '',
                            'content' => $decoded['content'] ?? $c->proposal_content ?? '',
                            'page_type' => $decoded['page_type'] ?? $c->page_type ?? 'content',
                            'background_image' => $decoded['background_image'] ?? $c->background_image ?? null,
                            'order' => $c->order ?? 1,
                        ];
                    }
                    return [
                        'title' => $c->title ?? '',
                        'content' => $c->proposal_content ?? '',
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

        if (empty($customContentPages)) {
            $creatorId = $proposal->created_by ?? null;
            $defaultPages = \App\Models\ProposalDefaultPage::where('created_by', $creatorId)
                ->where('is_active', 1)
                ->orderBy('sort_order')
                ->get();

            if ($defaultPages->isEmpty()) {
                $defaultPages = \App\Models\ProposalDefaultPage::where('is_active', 1)
                    ->orderBy('sort_order')
                    ->get();
            }

            $customContentPages = $defaultPages->map(function ($p) {
                return [
                    'title' => $p->title,
                    'content' => $p->content,
                    'page_type' => $p->page_type ?? 'content',
                    'background_image' => $p->background_image ?? null,
                    'order' => $p->sort_order,
                ];
            })->toArray();
        }

        $sectionsSource = $customContentPages;
        if (empty($sectionsSource)) {
            $sectionsSource = [
                ['title' => 'One-Time Charges (OTC)', 'content' => '[OTC_CHARGES_TABLE]', 'page_type' => 'otc', 'order' => 1],
                ['title' => 'Monthly Recurring Charges (MRC)', 'content' => '[MRC_CHARGES_TABLE]', 'page_type' => 'mrc', 'order' => 2],
            ];
        }

        // Sort sections by order
        usort($sectionsSource, function ($a, $b) {
            $orderA = $a['order'] ?? 999;
            $orderB = $b['order'] ?? 999;
            return $orderA <=> $orderB;
        });

        // Prepare Section Pages
        // In this clean architecture, each section is rendered in full into a page template container.
        // If OTC and MRC are adjacent or fit together, client-side pagination keeps them on the same sheet.
        $hasOtcInSource = false;
        $hasMrcInSource = false;
        $hasOtherInSource = false;
        foreach ($sectionsSource as $sec) {
            $sec = (array) $sec;
            $rawContent = trim((string) ($sec['content'] ?? ''));
            $title = $sec['title'] ?? '';
            if ($rawContent === '[OTC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'one-time charges') !== false)) {
                $hasOtcInSource = true;
            }
            if ($rawContent === '[MRC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'monthly recurring charges') !== false)) {
                $hasMrcInSource = true;
            }
            if ($rawContent === '[OTHER_DETAILS_CONTENT]' || (!empty($title) && stripos($title, 'other details') !== false)) {
                $hasOtherInSource = true;
            }
        }

        if (count($otcItems) > 0 && !$hasOtcInSource) {
            $sectionsSource[] = [
                'title' => 'One-Time Charges (OTC)',
                'content' => '[OTC_CHARGES_TABLE]',
                'page_type' => 'otc',
                'order' => count($sectionsSource) + 1,
            ];
        }
        if (count($mrcItems) > 0 && !$hasMrcInSource) {
            $sectionsSource[] = [
                'title' => 'Monthly Recurring Charges (MRC)',
                'content' => '[MRC_CHARGES_TABLE]',
                'page_type' => 'mrc',
                'order' => count($sectionsSource) + 1,
            ];
        }
        if (!empty($proposal->other_details) && trim($proposal->other_details) !== '' && $proposal->other_details !== '<p></p>' && !$hasOtherInSource) {
            $sectionsSource[] = [
                'title' => 'Other Details',
                'content' => '[OTHER_DETAILS_CONTENT]',
                'page_type' => 'other-details',
                'order' => count($sectionsSource) + 1,
            ];
        }

        // Build Renderable Page Blocks matching section order
        $renderableSections = [];
        $otcRendered = false;
        $mrcRendered = false;
        $otherRendered = false;

        foreach ($sectionsSource as $sIdx => $sec) {
            $sec = (array) $sec;
            $rawContent = trim((string) ($sec['content'] ?? ''));
            $title = $sec['title'] ?? '';
            $pageType = $sec['page_type'] ?? '';
            $isOtc = $pageType === 'otc' || $rawContent === '[OTC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'one-time charges') !== false);
            $isMrc = $pageType === 'mrc' || $rawContent === '[MRC_CHARGES_TABLE]' || (!empty($title) && stripos($title, 'monthly recurring charges') !== false);
            $isOther = $pageType === 'other-details' || $rawContent === '[OTHER_DETAILS_CONTENT]' || (!empty($title) && stripos($title, 'other details') !== false);

            if ($isOtc && !$otcRendered) {
                if (count($otcItems) > 0) {
                    $renderableSections[] = [
                        'id' => "otc-section-{$sIdx}",
                        'type' => 'otc',
                        'title' => !empty($title) ? $title : 'One-Time Charges (OTC)',
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                    $otcRendered = true;
                }
                continue;
            }

            if ($isMrc && !$mrcRendered) {
                if (count($mrcItems) > 0) {
                    $renderableSections[] = [
                        'id' => "mrc-section-{$sIdx}",
                        'type' => 'mrc',
                        'title' => !empty($title) ? $title : 'Monthly Recurring Charges (MRC)',
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                    $mrcRendered = true;
                }
                continue;
            }

            if ($isOther && !$otherRendered) {
                if (!empty($proposal->other_details) && trim($proposal->other_details) !== '' && $proposal->other_details !== '<p></p>') {
                    $renderableSections[] = [
                        'id' => "other-section-{$sIdx}",
                        'type' => 'other-details',
                        'title' => !empty($title) ? $title : 'OTHER DETAILS',
                        'content' => $proposal->other_details,
                        'background_image' => $sec['background_image'] ?? null,
                    ];
                    $otherRendered = true;
                }
                continue;
            }

            // Normal Custom / Default Content Page
            $renderableSections[] = [
                'id' => "content-section-{$sIdx}",
                'type' => 'content',
                'title' => $title,
                'content' => $sec['content'] ?? '',
                'background_image' => $sec['background_image'] ?? null,
            ];
        }
    @endphp

    {{-- SECTIONS CONTAINER --}}
    <div class="print-container" id="boxes">
        @foreach($renderableSections as $pIdx => $page)
            @php
                $sheetBgUrl = $getPageBgUrl($page['background_image'] ?? null);
            @endphp

            {{-- 1. OTC CHARGES SECTION --}}
            @if($page['type'] === 'otc')
                <div class="proposal-preview-sheet otc-paginated-page" id="{{ $page['id'] }}" data-page-type="otc">
                    @if(!empty($sheetBgUrl))
                        <div class="proposal-bg-layer">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div class="proposal-header-logo-container" style="{{ $headerLogoStyle }}">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" />
                        </div>
                    @endif
                    <div class="proposal-page__body">
                        <div class="proposal-charges-wrapper">
                            <div class="proposal-section-title">
                                {{ $page['title'] }}
                            </div>

                            <table class="proposal-table">
                                <thead>
                                    <tr>
                                        <th class="col-sn">S/N</th>
                                        <th class="col-item">Item / Service</th>
                                        <th class="col-desc">Description</th>
                                        <th class="col-qty">Qty.</th>
                                        <th class="col-price">Price (BDT)</th>
                                        <th class="col-tax">Tax / VAT</th>
                                        <th class="col-total">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($otcItems as $index => $item)
                                        @php
                                            $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                            $pDesc = $item->description ?? $item->product_description ?? $item->product->description ?? '';
                                            $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
                                            $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            $displayQty = ((float) $item->quantity == (int) $item->quantity) ? (int) $item->quantity : (float) $item->quantity;
                                        @endphp
                                        <tr>
                                            <td class="proposal-td-sn">{{ $index + 1 }}</td>
                                            <td class="proposal-td-item">{{ $pName }}</td>
                                            <td class="proposal-item-desc">{!! $pDesc !!}</td>
                                            <td class="proposal-td-qty">
                                                {{ $displayQty . ($pUnit ? ' ' . $pUnit : '') }}
                                            </td>
                                            <td class="proposal-td-price">{{ number_format($item->unit_price, 2) }}</td>
                                            <td class="proposal-td-tax">
                                                @if(!empty($item->taxes) && count($item->taxes) > 0)
                                                    @foreach($item->taxes as $tItem)
                                                        <div>{{ $tItem->tax_name }} ({{ (float) $tItem->tax_rate }}%)</div>
                                                    @endforeach
                                                @elseif((float) ($item->tax_percentage ?? 0) > 0)
                                                    <div>{{ (float) $item->tax_percentage }}%</div>
                                                @elseif((float) ($item->tax_amount ?? 0) > 0)
                                                    <div>{{ number_format($item->tax_amount, 2) }}</div>
                                                @else
                                                    <span style="color: #94a3b8;">-</span>
                                                @endif
                                            </td>
                                            <td class="proposal-td-total">{{ number_format($lTotal, 2) }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="7" class="proposal-no-items">No OTC items added.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                                <tfoot>
                                    @if(count($otcItems) > 0)
                                        <tr>
                                            <td colspan="5"></td>
                                            <td class="proposal-summary-label">Total (BDT):</td>
                                            <td class="proposal-summary-value">{{ number_format($otcSubtotal, 2) }}</td>
                                        </tr>
                                        @if($otcDiscount > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">{{ $otcDiscountLabel ?? 'Discount:' }}</td>
                                                <td class="proposal-summary-value">-{{ number_format($otcDiscount, 2) }}</td>
                                            </tr>
                                        @endif
                                        @if($otcTax > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">VAT/Tax:</td>
                                                <td class="proposal-summary-value">+{{ number_format($otcTax, 2) }}</td>
                                            </tr>
                                        @endif
                                        @if($otcDiscount > 0 || $otcTax > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">Grand Total:</td>
                                                <td class="proposal-summary-value">{{ number_format($otcTotal, 2) }}</td>
                                            </tr>
                                        @endif
                                    @endif
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

            {{-- 2. MRC CHARGES SECTION --}}
            @elseif($page['type'] === 'mrc')
                <div class="proposal-preview-sheet mrc-paginated-page" id="{{ $page['id'] }}" data-page-type="mrc">
                    @if(!empty($sheetBgUrl))
                        <div class="proposal-bg-layer">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div class="proposal-header-logo-container" style="{{ $headerLogoStyle }}">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" />
                        </div>
                    @endif
                    <div class="proposal-page__body">
                        <div class="proposal-charges-wrapper">
                            <div class="proposal-section-title title-mrc">
                                {{ $page['title'] }}
                            </div>

                            <table class="proposal-table">
                                <thead>
                                    <tr>
                                        <th class="col-sn">S/N</th>
                                        <th class="col-item">Item / Service</th>
                                        <th class="col-desc">Description</th>
                                        <th class="col-qty">Qty.</th>
                                        <th class="col-price">Price (BDT)</th>
                                        <th class="col-tax">Tax / VAT</th>
                                        <th class="col-total">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($mrcItems as $index => $item)
                                        @php
                                            $pName = $item->product->name ?? $item->product_name ?? 'Item';
                                            $pDesc = $item->description ?? $item->product_description ?? $item->product->description ?? '';
                                            $pUnit = $item->product->unitRelation->unit_name ?? (!is_numeric($item->product->unit ?? '') ? ($item->product->unit ?? '') : '');
                                            $lTotal = (float) ($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            $displayQty = ((float) $item->quantity == (int) $item->quantity) ? (int) $item->quantity : (float) $item->quantity;
                                        @endphp
                                        <tr>
                                            <td class="proposal-td-sn">{{ $index + 1 }}</td>
                                            <td class="proposal-td-item">{{ $pName }}</td>
                                            <td class="proposal-item-desc">{!! $pDesc !!}</td>
                                            <td class="proposal-td-qty">
                                                {{ $displayQty . ($pUnit ? ' ' . $pUnit : '') }}
                                            </td>
                                            <td class="proposal-td-price">{{ number_format($item->unit_price, 2) }}</td>
                                            <td class="proposal-td-tax">
                                                @if(!empty($item->taxes) && count($item->taxes) > 0)
                                                    @foreach($item->taxes as $tItem)
                                                        <div>{{ $tItem->tax_name }} ({{ (float) $tItem->tax_rate }}%)</div>
                                                    @endforeach
                                                @elseif((float) ($item->tax_percentage ?? 0) > 0)
                                                    <div>{{ (float) $item->tax_percentage }}%</div>
                                                @elseif((float) ($item->tax_amount ?? 0) > 0)
                                                    <div>{{ number_format($item->tax_amount, 2) }}</div>
                                                @else
                                                    <span style="color: #94a3b8;">-</span>
                                                @endif
                                            </td>
                                            <td class="proposal-td-total">{{ number_format($lTotal, 2) }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="7" class="proposal-no-items">No MRC items added.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                                <tfoot>
                                    @if(count($mrcItems) > 0)
                                        <tr>
                                            <td colspan="5"></td>
                                            <td class="proposal-summary-label">Total (BDT):</td>
                                            <td class="proposal-summary-value">{{ number_format($mrcSubtotal, 2) }}</td>
                                        </tr>
                                        @if($mrcDiscount > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">{{ $mrcDiscountLabel ?? 'Discount:' }}</td>
                                                <td class="proposal-summary-value">-{{ number_format($mrcDiscount, 2) }}</td>
                                            </tr>
                                        @endif
                                        @if($mrcTax > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">VAT/Tax:</td>
                                                <td class="proposal-summary-value">+{{ number_format($mrcTax, 2) }}</td>
                                            </tr>
                                        @endif
                                        @if($mrcDiscount > 0 || $mrcTax > 0)
                                            <tr>
                                                <td colspan="5"></td>
                                                <td class="proposal-summary-label">Grand Total:</td>
                                                <td class="proposal-summary-value">{{ number_format($mrcTotal, 2) }}</td>
                                            </tr>
                                        @endif
                                    @endif
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

            {{-- 3. OTHER DETAILS SECTION --}}
            @elseif($page['type'] === 'other-details')
                <div class="proposal-preview-sheet proposal-cover__sheet other-details-page" id="{{ $page['id'] }}">
                    @if(!empty($sheetBgUrl))
                        <div class="proposal-bg-layer">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div class="proposal-header-logo-container" style="{{ $headerLogoStyle }}">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" />
                        </div>
                    @endif
                    <div class="proposal-page__body">
                        <div class="html-preview-container">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">
                                {{ $replaceProposalShortcodes($page['title']) }}
                            </h3>
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>

            {{-- 4. CONTENT / DEFAULT PAGES --}}
            @else
                <div class="proposal-preview-sheet proposal-cover__sheet content-page" id="{{ $page['id'] }}">
                    @if(!empty($sheetBgUrl))
                        <div class="proposal-bg-layer">
                            <img src="{{ $sheetBgUrl }}" alt="Sheet Background" />
                        </div>
                    @endif
                    @if(!empty($headerLogoUrl))
                        <div class="proposal-header-logo-container" style="{{ $headerLogoStyle }}">
                            <img src="{{ $headerLogoUrl }}" alt="Header Logo" />
                        </div>
                    @endif
                    <div class="proposal-page__body">
                        <div class="html-preview-container">
                            {!! $replaceProposalShortcodes($page['content']) !!}
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>

    {{-- CLIENT-SIDE DYNAMIC PAGINATION ENGINE --}}
    <script>
        function getBodyContentHeight(body) {
            if (!body) return 0;
            let total = 0;
            Array.from(body.children).forEach(child => {
                total += (child.offsetHeight || child.scrollHeight || 0);
            });
            return total;
        }

        function paginateTablePage(pageElement, maxContentHeight = 905) {
            if (!pageElement) return;

            let body = pageElement.querySelector(".proposal-page__body");
            let wrapper = pageElement.querySelector(".proposal-charges-wrapper");
            if (!body || !wrapper) return;

            let table = wrapper.querySelector("table");
            if (!table) return;

            let tbody = table.querySelector("tbody");
            let tfoot = table.querySelector("tfoot");
            let rows = Array.from(tbody.querySelectorAll("tr"));

            if (rows.length === 0) return;

            // Only paginate if rows cause actual overflow
            let initialHeight = getBodyContentHeight(body);
            if (initialHeight <= maxContentHeight) {
                return;
            }

            let currentPage = pageElement;
            let currentBody = body;
            let currentWrapper = wrapper;
            let currentTbody = tbody;
            let currentTable = table;

            let tfootClone = tfoot ? tfoot.cloneNode(true) : null;
            if (tfoot) {
                tfoot.remove();
            }

            currentTbody.innerHTML = "";

            rows.forEach((row) => {
                currentTbody.appendChild(row);
                let height = getBodyContentHeight(currentBody);

                if (height > maxContentHeight && currentTbody.children.length > 1) {
                    currentTbody.removeChild(row);

                    let newPage = pageElement.cloneNode(true);
                    newPage.removeAttribute("id");
                    let newBody = newPage.querySelector(".proposal-page__body");
                    let newWrapper = newPage.querySelector(".proposal-charges-wrapper");
                    let newTable = newWrapper.querySelector("table");
                    let newTbody = newTable.querySelector("tbody");
                    let newTfoot = newTable.querySelector("tfoot");
                    if (newTfoot) newTfoot.remove();

                    newTbody.innerHTML = "";
                    newTbody.appendChild(row);

                    currentPage.after(newPage);

                    currentPage = newPage;
                    currentBody = newBody;
                    currentWrapper = newWrapper;
                    currentTbody = newTbody;
                    currentTable = newTable;
                }
            });

            if (tfootClone) {
                currentTable.appendChild(tfootClone);

                if (getBodyContentHeight(currentBody) > maxContentHeight && currentTbody.children.length > 1) {
                    let lastRow = currentTbody.lastElementChild;
                    currentTbody.removeChild(lastRow);

                    let newPage = pageElement.cloneNode(true);
                    newPage.removeAttribute("id");
                    let newWrapper = newPage.querySelector(".proposal-charges-wrapper");
                    let newTable = newWrapper.querySelector("table");
                    let newTbody = newTable.querySelector("tbody");
                    newTbody.innerHTML = "";
                    newTbody.appendChild(lastRow);
                    newTable.appendChild(tfootClone);

                    currentPage.after(newPage);
                }
            }
        }

        // Dynamic Charges Pagination: Paginates OTC and MRC together seamlessly
        function runDynamicChargesPagination(maxContentHeight = 905) {
            // 1. First paginate OTC
            let otcPages = Array.from(document.querySelectorAll(".otc-paginated-page"));
            otcPages.forEach(page => paginateTablePage(page, maxContentHeight));

            // 2. Find the last page of OTC
            let allOtcPages = Array.from(document.querySelectorAll(".otc-paginated-page"));
            let lastOtcPage = allOtcPages.length > 0 ? allOtcPages[allOtcPages.length - 1] : null;

            let mrcPage = document.querySelector(".mrc-paginated-page");
            if (!mrcPage) return;

            // If there is an OTC page right before MRC, try flowing MRC directly into the last OTC page
            if (lastOtcPage && lastOtcPage.nextElementSibling === mrcPage) {
                let mrcWrapper = mrcPage.querySelector(".proposal-charges-wrapper");
                let mrcTable = mrcWrapper ? mrcWrapper.querySelector("table") : null;

                if (mrcWrapper && mrcTable) {
                    let otcBody = lastOtcPage.querySelector(".proposal-page__body");
                    let mrcCloneWrapper = mrcWrapper.cloneNode(true);
                    let mrcCloneTable = mrcCloneWrapper.querySelector("table");
                    let mrcCloneTbody = mrcCloneTable.querySelector("tbody");
                    let mrcCloneTfoot = mrcCloneTable.querySelector("tfoot");
                    let mrcRows = Array.from(mrcCloneTbody.querySelectorAll("tr"));

                    let tfootClone = mrcCloneTfoot ? mrcCloneTfoot.cloneNode(true) : null;
                    if (mrcCloneTfoot) mrcCloneTfoot.remove();

                    mrcCloneTbody.innerHTML = "";
                    otcBody.appendChild(mrcCloneWrapper);

                    let currentPage = lastOtcPage;
                    let currentBody = otcBody;
                    let currentMrcWrapper = mrcCloneWrapper;
                    let currentMrcTable = mrcCloneTable;
                    let currentMrcTbody = mrcCloneTbody;

                    mrcRows.forEach((row) => {
                        currentMrcTbody.appendChild(row);
                        let height = getBodyContentHeight(currentBody);

                        if (height > maxContentHeight) {
                            currentMrcTbody.removeChild(row);

                            // If not even 1 row fit on this page, remove the orphan header completely from this page
                            if (currentMrcTbody.children.length === 0) {
                                currentBody.removeChild(currentMrcWrapper);
                            }

                            // Spawn new page
                            let newPage = mrcPage.cloneNode(true);
                            newPage.removeAttribute("id");
                            let newBody = newPage.querySelector(".proposal-page__body");
                            let newWrapper = newPage.querySelector(".proposal-charges-wrapper");
                            let newTable = newWrapper.querySelector("table");
                            let newTbody = newTable.querySelector("tbody");
                            let newTfoot = newTable.querySelector("tfoot");
                            if (newTfoot) newTfoot.remove();

                            newTbody.innerHTML = "";
                            newTbody.appendChild(row);

                            currentPage.after(newPage);

                            currentPage = newPage;
                            currentBody = newBody;
                            currentMrcWrapper = newWrapper;
                            currentMrcTable = newTable;
                            currentMrcTbody = newTbody;
                        }
                    });

                    // Append MRC footer
                    if (tfootClone) {
                        currentMrcTable.appendChild(tfootClone);
                        let height = getBodyContentHeight(currentBody);

                        if (height > maxContentHeight && currentMrcTbody.children.length > 1) {
                            let lastRow = currentMrcTbody.lastElementChild;
                            currentMrcTbody.removeChild(lastRow);

                            let newPage = mrcPage.cloneNode(true);
                            newPage.removeAttribute("id");
                            let newWrapper = newPage.querySelector(".proposal-charges-wrapper");
                            let newTable = newWrapper.querySelector("table");
                            let newTbody = newTable.querySelector("tbody");
                            newTbody.innerHTML = "";
                            newTbody.appendChild(lastRow);
                            newTable.appendChild(tfootClone);

                            currentPage.after(newPage);
                        }
                    }

                    // Remove original template MRC page since we flowed its rows
                    mrcPage.remove();
                    return;
                }
            }

            // Fallback: paginate MRC normally if not adjacent to OTC
            paginateTablePage(mrcPage, maxContentHeight);
        }

        function runDynamicPagination() {
            runDynamicChargesPagination(905);
        }

        window.addEventListener('DOMContentLoaded', function () {
            runDynamicPagination();

            @if(empty($isServerPdf))
                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('print') === '1' || urlParams.has('print')) {
                    setTimeout(function () {
                        window.print();
                    }, 400);
                }
            @endif
        });
    </script>
</body>

</html>