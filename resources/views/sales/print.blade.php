@php
    $companySettings = getCompanyAllSetting($invoice->created_by);
    $creatorId = $invoice->created_by ?? (function_exists('creatorId') ? creatorId() : auth()->id());
    $salesInvoiceSetting = $salesInvoiceSetting ?? \App\Models\SalesInvoiceSetup::getSettings($creatorId);

    // Data URI helper for local images
    $toDataUri = function ($fullFilePath) {
        if (!file_exists($fullFilePath) || !is_readable($fullFilePath)) {
            return null;
        }
        $mime = mime_content_type($fullFilePath) ?: 'image/jpeg';
        $data = file_get_contents($fullFilePath);
        return 'data:' . $mime . ';base64,' . base64_encode($data);
    };

    // Get absolute or data-uri path for image
    $getImagePath = function ($path) use ($toDataUri) {
        if (!$path)
            return '';

        $cleanPath = ltrim($path, '/');

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

    // Settings Flags & Assets
    $showLogo = ($salesInvoiceSetting['sales_invoice_show_logo'] ?? 'on') !== 'off';
    $customLogo = $salesInvoiceSetting['sales_invoice_logo'] ?? '';
    $companyLogo = $companySettings['company_logo'] ?? $companySettings['logo_dark'] ?? '';
    $logoToUse = $customLogo ?: $companyLogo;
    $logoUrl = ($showLogo && $logoToUse) ? $getImagePath($logoToUse) : '';

    $enableLetterhead = ($salesInvoiceSetting['sales_invoice_enable_letterhead'] ?? 'off') === 'on';
    $bgLetterhead = $salesInvoiceSetting['sales_invoice_bg_letterhead'] ?? '';
    $bgLetterheadUrl = ($enableLetterhead && $bgLetterhead) ? $getImagePath($bgLetterhead) : '';

    // Format Currency Helper
    $formatCurrency = function ($amount) use ($companySettings) {
        $num = is_numeric($amount) ? (float) $amount : 0;
        $decimalPlaces = (int) ($companySettings['decimalFormat'] ?? 2);
        $decimalSeparator = $companySettings['decimalSeparator'] ?? '.';
        $thousandsSeparator = $companySettings['thousandsSeparator'] ?? ',';
        $floatNumber = ($companySettings['floatNumber'] ?? '1') !== '0';
        $currencySymbolSpace = ($companySettings['currencySymbolSpace'] ?? '0') === '1';
        $currencySymbolPosition = $companySettings['currencySymbolPosition'] ?? 'before';

        $finalAmount = $floatNumber ? $num : floor($num);
        $formattedNumber = number_format(
            $finalAmount,
            $decimalPlaces,
            $decimalSeparator,
            $thousandsSeparator === 'none' ? '' : $thousandsSeparator
        );

        $symbol = $companySettings['currencySymbol'] ?? '$';
        $space = $currencySymbolSpace ? ' ' : '';

        return $currencySymbolPosition === 'before'
            ? "{$symbol}{$space}{$formattedNumber}"
            : "{$formattedNumber}{$space}{$symbol}";
    };

    // Format Date Helper
    $formatDate = function ($date) use ($companySettings) {
        if (!$date)
            return '';
        $format = $companySettings['dateFormat'] ?? 'Y-m-d';
        try {
            return \Carbon\Carbon::parse($date)->format($format);
        } catch (\Exception $e) {
            return (string) $date;
        }
    };
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('Invoice') }} - #{{ $invoice->invoice_number }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }

        html,
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff;
            font-family: 'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            color: #1e293b;
        }

        @page {
            size: A4 portrait;
            margin: 0;
        }

        .a4-page {
            position: relative;
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            max-height: 297mm;
            padding: 30mm 14mm 30mm 14mm;
            margin: 0 auto;
            background-color: #ffffff;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid-page;
        }

        .a4-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
        }

        .letterhead-bg-layer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
            pointer-events: none;
        }

        .a4-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
        }

        .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .rich-content ul {
            list-style-type: disc !important;
            margin-left: 1.25rem !important;
            padding-left: 0 !important;
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
        }

        .rich-content ol {
            list-style-type: decimal !important;
            margin-left: 1.25rem !important;
            padding-left: 0 !important;
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
        }

        .rich-content li {
            display: list-item !important;
            margin-top: 0.1rem !important;
            margin-bottom: 0.1rem !important;
        }

        .rich-content {
            word-wrap: break-word !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
        }

        .rich-content * {
            word-wrap: break-word !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
        }

        .rich-content p {
            margin-top: 0.15rem !important;
            margin-bottom: 0.15rem !important;
            word-wrap: break-word !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
        }

        .rich-content p:first-child {
            margin-top: 0 !important;
        }

        .rich-content p:last-child {
            margin-bottom: 0 !important;
        }

        .rich-content strong,
        .rich-content b {
            font-weight: 700 !important;
        }

        .rich-content em,
        .rich-content i {
            font-style: italic !important;
        }

        .rich-content u {
            text-decoration: underline !important;
        }

        .rich-content s,
        .rich-content strike {
            text-decoration: line-through !important;
        }

        table {
            table-layout: fixed !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
        }

        th, td {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
            box-sizing: border-box !important;
        }

        @media print {
            html,
            body {
                background: #ffffff !important;
            }

            .a4-page {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 30mm 14mm 30mm 14mm !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
            }

            .a4-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
        }
    </style>
</head>

<body>
    @php
        // Helper for estimating exact item height in millimeters (mm)
        $estimateItemHeightMm = function ($item) {
            $desc = $item->description ?? $item->product?->description ?? $item->product?->long_description ?? '';
            $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($desc)));
            $blockTags = preg_match_all('/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/i', $desc, $matches);
            // Description column is 23% width (~38mm), fits ~16 chars per line at 9px
            $textLines = ceil(strlen($plainText) / 16);
            $descLines = max($textLines, $blockTags, (!empty($plainText) ? 1 : 0));

            // Item Name column is 22% width (~36mm), fits ~15 chars per line at 10px bold
            $pName = $item->product?->name ?? '';
            $nameLines = max(ceil(strlen($pName) / 15), 1);
            
            $effectiveLines = max($descLines, $nameLines, 1);

            // Table cell padding (8px top/bottom = ~6mm) + border + lines (~4.8mm each)
            return 8 + ($effectiveLines * 4.8);
        };

        // Estimate Terms & Summary Height in millimeters accurately
        $termsText = trim(preg_replace('/\s+/', ' ', strip_tags($invoice->payment_terms ?? '')));
        $termsBlockTags = preg_match_all('/<\/p>|<br\s*\/?>|<\/li>/i', $invoice->payment_terms ?? '', $m);
        $termsLines = !empty($termsText) ? max(ceil(strlen($termsText) / 75), $termsBlockTags, 1) : 0;
        $termsHeightMm = $termsLines > 0 ? (12 + $termsLines * 5) : 0;

        $allPaymentAllocations = $invoice->paymentAllocations ?? $invoice->payment_allocations ?? collect();
        $clearedPaymentAllocations = collect($allPaymentAllocations)->filter(function ($alloc) {
            $status = $alloc->payment->status ?? $alloc->status ?? 'cleared';
            return strtolower($status) === 'cleared';
        })->values();
        $paymentCount = count($clearedPaymentAllocations);
        $paymentSummaryHeightMm = $paymentCount > 0 ? (16 + ($paymentCount * 7.5)) : 0;

        // Base Summary (Subtotal + Total + Greeting + margins) = ~34mm + (extra tax/discount/paid/balance rows * 6mm) + Payment terms + Payment Summary
        $extraSummaryRows = 1;
        if (($invoice->discount_amount ?? 0) > 0) $extraSummaryRows++;
        if (($invoice->tax_amount ?? 0) > 0) $extraSummaryRows++;
        if (($invoice->paid_amount ?? 0) > 0 && ($invoice->balance_amount ?? 0) > 0) {
            $extraSummaryRows += 2; // Paid Amount + Balance Due
        }
        
        $summaryTotalHeightMm = 34 + ($extraSummaryRows * 6) + $termsHeightMm + $paymentSummaryHeightMm;

        $rawItems = $invoice->items ? $invoice->items->all() : [];
        $chunks = [];
        $currentChunk = [];
        $currentHeightMm = 0;
        $currentStartIndex = 0;

        // A4 Height = 297mm. Padding = 30mm top + 30mm bottom = 60mm.
        // Net Printable Body = 237mm.
        $FIRST_PAGE_SOLO_HEIGHT = max(25, 147 - $summaryTotalHeightMm);  // First page with items + summary + terms
        $FIRST_PAGE_OVERFLOW_HEIGHT = 142;                               // First page without summary
        $SUBSEQUENT_REGULAR_HEIGHT = 217;                                // Intermediate page
        $SUBSEQUENT_LAST_HEIGHT = max(30, 223 - $summaryTotalHeightMm);  // Final page with summary + terms

        $totalItemsCount = count($rawItems);

        // Pre-calculate total items height
        $totalItemsHeightMm = 0;
        foreach ($rawItems as $it) {
            $totalItemsHeightMm += $estimateItemHeightMm($it);
        }

        $allFitsOnSinglePage = ($totalItemsHeightMm <= $FIRST_PAGE_SOLO_HEIGHT);

        foreach ($rawItems as $idx => $item) {
            $itemHeight = $estimateItemHeightMm($item);
            $isFirstPage = (count($chunks) === 0);
            $remainingItems = $totalItemsCount - $idx;

            if ($allFitsOnSinglePage) {
                $maxCapacityMm = $FIRST_PAGE_SOLO_HEIGHT;
            } elseif ($isFirstPage) {
                $maxCapacityMm = $FIRST_PAGE_OVERFLOW_HEIGHT;
            } else {
                $maxCapacityMm = ($remainingItems <= 2) ? $SUBSEQUENT_LAST_HEIGHT : $SUBSEQUENT_REGULAR_HEIGHT;
            }

            if (count($currentChunk) > 0 && ($currentHeightMm + $itemHeight > $maxCapacityMm)) {
                $chunks[] = [
                    'items' => $currentChunk,
                    'startIndex' => $currentStartIndex
                ];
                $currentChunk = [$item];
                $currentHeightMm = $itemHeight;
                $currentStartIndex = $idx;
            } else {
                $currentChunk[] = $item;
                $currentHeightMm += $itemHeight;
            }
        }

        if (count($currentChunk) > 0 || count($chunks) === 0) {
            $chunks[] = [
                'items' => $currentChunk,
                'startIndex' => $currentStartIndex
            ];
        }

        $totalChunks = count($chunks);

        // Calculate distinct tax breakdown for the entire invoice
        $taxBreakdown = [];
        foreach ($invoice->items ?? [] as $item) {
            if (!empty($item->taxes) && count($item->taxes) > 0) {
                $itemSubtotal = ($item->quantity * $item->unit_price) - ($item->discount_amount ?? 0);
                foreach ($item->taxes as $tax) {
                    $taxName = $tax->tax_name ?: __('Tax');
                    $taxRate = (float) $tax->tax_rate;
                    $calculatedTax = $itemSubtotal * ($taxRate / 100);
                    $key = $taxName;
                    if (!isset($taxBreakdown[$key])) {
                        $taxBreakdown[$key] = [
                            'name' => $taxName,
                            'amount' => 0
                        ];
                    }
                    $taxBreakdown[$key]['amount'] += $calculatedTax;
                }
            } elseif ((float) $item->tax_amount > 0 || (float) $item->tax_percentage > 0) {
                $key = __('Tax');
                if (!isset($taxBreakdown[$key])) {
                    $taxBreakdown[$key] = [
                        'name' => __('Tax'),
                        'amount' => 0
                    ];
                }
                $taxBreakdown[$key]['amount'] += (float) $item->tax_amount;
            }
        }
    @endphp

    @foreach($chunks as $chunkIdx => $chunk)
        @php
            $isFirstPage = ($chunkIdx === 0);
            $isLastPage = ($chunkIdx === $totalChunks - 1);
            $pageItems = $chunk['items'];
            $startIndex = $chunk['startIndex'];
        @endphp

        <div class="a4-page">
            @if($bgLetterheadUrl)
                <img src="{{ $bgLetterheadUrl }}" alt="Letterhead Background" class="letterhead-bg-layer">
            @endif

            <div class="a4-content">
                <div>
                    <!-- Header (Only Full on First Page, Minimal Header on Subsequent Pages) -->
                    @if($isFirstPage)
                        <div class="flex justify-between items-start mb-5">
                            <div class="w-1/2">
                                @if($showLogo && $logoUrl)
                                    <img src="{{ $logoUrl }}" alt="Logo" class="max-h-14 max-w-[200px] object-contain mb-3">
                                @else
                                    <h1 class="text-2xl font-bold mb-2 text-gray-900"></h1>
                                @endif
                                <div class="text-xs space-y-0.5 text-gray-600">
                                    @if(!empty($companySettings['company_address']))
                                        <p>{{ $companySettings['company_address'] }}</p>
                                    @endif
                                    @if(!empty($companySettings['company_city']) || !empty($companySettings['company_state']) || !empty($companySettings['company_zipcode']))
                                        <p>
                                             {{ $companySettings['company_city'] ?? '' }}{{ !empty($companySettings['company_state']) ? ', ' . $companySettings['company_state'] : '' }}
                                            {{ $companySettings['company_zipcode'] ?? '' }}
                                        </p>
                                    @endif
                                    @if(!empty($companySettings['company_country']))
                                        <p>{{ $companySettings['company_country'] }}</p>
                                    @endif
                                    @if(!empty($companySettings['company_telephone']))
                                        <p>{{ __('Phone') }}: {{ $companySettings['company_telephone'] }}</p>
                                    @endif
                                    @if(!empty($companySettings['company_email']))
                                        <p>{{ __('Email') }}: {{ $companySettings['company_email'] }}</p>
                                    @endif
                                    @if(!empty($companySettings['registration_number']))
                                        <p>{{ __('Registration') }}: {{ $companySettings['registration_number'] }}</p>
                                    @endif
                                </div>
                            </div>
                            <div class="text-right w-1/2">
                                <h2 class="text-2xl font-bold mb-1 text-gray-900">{{ __('INVOICE') }}</h2>
                                <p class="text-base font-semibold text-gray-800">#{{ $invoice->invoice_number }}</p>
                                <div class="text-xs mt-2 space-y-0.5 text-gray-600">
                                    <p>{{ __('Date') }}: {{ $formatDate($invoice->invoice_date) }}</p>
                                    <p>{{ __('Due') }}: {{ $formatDate($invoice->due_date) }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Information -->
                        <div class="flex justify-between mb-5 pt-3 border-t border-gray-200">
                            <div class="w-1/2">
                                <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">{{ __('BILL TO') }}</h3>
                                <div class="text-xs space-y-0.5 text-gray-700">
                                    <p class="font-semibold text-gray-900">{{ $invoice->customer->name ?? $invoice->customer_name ?? '-' }}</p>
                                    @if(!empty($invoice->customer->email ?? $invoice->customer_email))
                                        <p>{{ $invoice->customer->email ?? $invoice->customer_email }}</p>
                                    @endif
                                    @if(!empty($invoice->customer_phone))
                                        <p>{{ $invoice->customer_phone }}</p>
                                    @endif
                                    @if(!empty($invoice->customerDetails?->billing_address))
                                        <p>{{ $invoice->customerDetails->billing_address['name'] ?? '' }}</p>
                                        <p>{{ $invoice->customerDetails->billing_address['address_line_1'] ?? '' }}</p>
                                        <p>
                                            {{ $invoice->customerDetails->billing_address['city'] ?? '' }}{{ !empty($invoice->customerDetails->billing_address['state']) ? ', ' . $invoice->customerDetails->billing_address['state'] : '' }}
                                            {{ $invoice->customerDetails->billing_address['zip_code'] ?? '' }}
                                        </p>
                                    @elseif(!empty($invoice->customer_address))
                                        <p class="whitespace-pre-line">{{ $invoice->customer_address }}</p>
                                    @endif
                                </div>
                            </div>
                            <div class="text-right w-1/2">
                                <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">{{ __('SHIP TO') }}</h3>
                                <div class="text-xs space-y-0.5 text-gray-700">
                                    @if(!empty($invoice->customerDetails?->shipping_address))
                                        <p class="font-semibold text-gray-900">{{ $invoice->customerDetails->shipping_address['name'] ?? '' }}</p>
                                        <p>{{ $invoice->customerDetails->shipping_address['address_line_1'] ?? '' }}</p>
                                        <p>
                                            {{ $invoice->customerDetails->shipping_address['city'] ?? '' }}{{ !empty($invoice->customerDetails->shipping_address['state']) ? ', ' . $invoice->customerDetails->shipping_address['state'] : '' }}
                                            {{ $invoice->customerDetails->shipping_address['zip_code'] ?? '' }}
                                        </p>
                                    @else
                                        <p class="text-gray-500">{{ __('Same as billing address') }}</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @else
                        <!-- Compact Header on Page 2+ -->
                        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                            <div>
                                <span class="font-bold text-sm text-gray-900">{{ __('INVOICE') }}: #{{ $invoice->invoice_number }}</span>
                            </div>
                            <div class="text-xs text-gray-600">
                                <span>{{ __('Date') }}: {{ $formatDate($invoice->invoice_date) }}</span> | 
                                <span>{{ __('Customer') }}: {{ $invoice->customer->name ?? $invoice->customer_name ?? '' }}</span>
                            </div>
                        </div>
                    @endif

                    <!-- Items Table -->
                    <div class="mb-4">
                        <table style="width: 100%; font-size: 10px; table-layout: fixed; border-collapse: collapse; border: 1px solid #94a3b8;">
                            <thead>
                                <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700;">
                                    <th style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 5%;">{{ __('SN') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 22%;">{{ __('ITEMS') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 23%;">{{ __('DESCRIPTION') }}</th>
                                    <th style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 9%;">{{ __('QTY') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 11%;">{{ __('PRICE') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 10%;">{{ __('DISCOUNT') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 10%;">{{ __('TAX/VAT') }}</th>
                                    <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 12%;">{{ __('TOTAL') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($pageItems as $i => $item)
                                    @php
                                        $unitName = $item->product?->unitRelation?->unit_name ?? (!is_numeric($item->product?->unit) ? $item->product?->unit : '');
                                        $itemDesc = $item->description ?? $item->product?->description ?? $item->product?->long_description ?? '';
                                    @endphp
                                    <tr class="page-break-inside-avoid">
                                        <td style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #475569;">{{ $startIndex + $i + 1 }}</td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top;">
                                            <div style="font-weight: 600; color: #0f172a; line-height: 1.25; font-size: 10px;">{{ $item->product->name ?? '' }}</div>
                                        </td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #475569; font-size: 9px; line-height: 1.35;">
                                            @if(!empty($itemDesc))
                                                <div class="rich-content">{!! $itemDesc !!}</div>
                                            @else
                                                <span style="color: #94a3b8;">-</span>
                                            @endif
                                        </td>
                                        <td style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #1e293b; font-weight: 500; white-space: nowrap;">
                                            {{ $item->quantity }}@if(!empty($unitName)) <span style="font-size: 9px; color: #475569; font-weight: 400;">{{ $unitName }}</span>@endif
                                        </td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">{{ $formatCurrency($item->unit_price) }}</td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                            @if($item->discount_percentage > 0)
                                                <div>{{ (float)$item->discount_percentage }}%</div>
                                            @else
                                                <span>-</span>
                                            @endif
                                        </td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                            @if(!empty($item->taxes) && count($item->taxes) > 0)
                                                @foreach($item->taxes as $tax)
                                                    <div style="line-height: 1.25; color: #475569; font-size: 9px;">{{ $tax->tax_name }} ({{ $tax->tax_rate }}%)</div>
                                                @endforeach
                                            @elseif($item->tax_percentage > 0)
                                                <div style="color: #475569; font-size: 9px;">{{ $item->tax_percentage }}%</div>
                                            @else
                                                <span style="color: #94a3b8;">-</span>
                                            @endif
                                        </td>
                                        <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; font-weight: 600; color: #0f172a;">{{ $formatCurrency($item->total_amount) }}</td>
                                    </tr>
                                @endforeach
                            </tbody>

                            @if($isLastPage)
                                <tfoot>
                                    <tr class="page-break-inside-avoid">
                                        <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                        <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Subtotal') }}:</td>
                                        <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->subtotal) }}</td>
                                    </tr>
                                    @if($invoice->discount_amount > 0)
                                        <tr class="page-break-inside-avoid">
                                            <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                            <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Discount') }}:</td>
                                            <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #dc2626; border: 1px solid #94a3b8;">-{{ $formatCurrency($invoice->discount_amount) }}</td>
                                        </tr>
                                    @endif
                                    @if(!empty($taxBreakdown) && count($taxBreakdown) > 0)
                                        @foreach($taxBreakdown as $taxKey => $taxInfo)
                                            @if($taxInfo['amount'] > 0)
                                                <tr class="page-break-inside-avoid">
                                                    <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                    <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ $taxInfo['name'] }}:</td>
                                                    <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($taxInfo['amount']) }}</td>
                                                </tr>
                                            @endif
                                        @endforeach
                                    @elseif($invoice->tax_amount > 0)
                                        <tr class="page-break-inside-avoid">
                                            <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                            <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Tax') }}:</td>
                                            <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->tax_amount) }}</td>
                                        </tr>
                                    @endif
                                    <tr class="page-break-inside-avoid" style="font-weight: 700;">
                                        <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                        <td style="padding: 6px 8px; font-size: 11px; color: #0f172a; border: 1px solid #94a3b8; text-align: right;">{{ __('TOTAL') }}:</td>
                                        <td style="padding: 6px 8px; font-size: 11px; text-align: right; color: #0f172a; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->total_amount) }}</td>
                                    </tr>
                                    @if(($invoice->paid_amount ?? 0) > 0 && ($invoice->balance_amount ?? 0) > 0)
                                        <tr class="page-break-inside-avoid">
                                            <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                            <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Paid Amount') }}:</td>
                                            <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->paid_amount) }}</td>
                                        </tr>
                                        <tr class="page-break-inside-avoid" style="font-weight: 700;">
                                            <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                            <td style="padding: 5px 8px; font-size: 10.5px; color: #0f172a; border: 1px solid #94a3b8; text-align: right;">{{ __('Balance Due') }}:</td>
                                            <td style="padding: 5px 8px; font-size: 10.5px; text-align: right; color: #0f172a; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->balance_amount) }}</td>
                                        </tr>
                                    @endif
                                </tfoot>
                            @endif
                        </table>
                    </div>

                    @php
                        $paymentAllocations = $clearedPaymentAllocations ?? collect();
                    @endphp

                    <!-- Payment Summary Table (Exact same design as Items Table, Shown on Last Page only if cleared allocations exist) -->
                    @if($isLastPage && count($paymentAllocations) > 0)
                        <div class="mb-4 page-break-inside-avoid">
                            <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                                {{ __('Payment Summary') }}
                            </div>
                            <table style="width: 100%; font-size: 10px; table-layout: fixed; border-collapse: collapse; border: 1px solid #94a3b8;">
                                <thead>
                                    <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700;">
                                        <th style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 6%;">{{ __('SN') }}</th>
                                        <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 26%;">{{ __('Payment Date') }}</th>
                                        <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 44%;">{{ __('Payment Method') }}</th>
                                        <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 24%;">{{ __('Allocated Amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($paymentAllocations as $pIdx => $alloc)
                                        @php
                                            $pPayment = $alloc->payment ?? null;
                                            $pBankAccount = $pPayment?->bankAccount ?? $pPayment?->bank_account ?? null;
                                            $pMethod = !empty($pBankAccount?->account_name)
                                                ? ($pBankAccount->account_name . (!empty($pBankAccount->account_number) ? ' (' . $pBankAccount->account_number . ')' : ''))
                                                : ($pPayment?->payment_method ?: '-');
                                            $pDate = $pPayment?->payment_date ?: $alloc->created_at;
                                        @endphp
                                        <tr class="page-break-inside-avoid">
                                            <td style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #475569;">{{ $pIdx + 1 }}</td>
                                            <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #475569;">{{ $formatDate($pDate) }}</td>
                                            <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #0f172a; font-weight: 500;">{{ $pMethod }}</td>
                                            <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; font-weight: 600; color: #0f172a;">{{ $formatCurrency($alloc->allocated_amount ?? 0) }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>

                <!-- Footer (Payment Terms & Business Greeting on Last Page Only) -->
                @if($isLastPage)
                    <div>
                        @if($invoice->payment_terms)
                            <div class="pt-2 text-xs text-gray-600 page-break-inside-avoid">
                                <span class="font-semibold text-gray-800">{{ __('TERMS & CONDITIONS') }}:</span>
                            </div>
                             <div class="pt-2 mb-2 text-xs text-gray-600 page-break-inside-avoid">
                                <div class="rich-content text-gray-600 inline-block">{!! $invoice->payment_terms !!}</div>
                             </div>
                        @endif
                        <div class="border-t border-gray-300 pt-2 text-center text-xs text-gray-500 page-break-inside-avoid">
                            <span>{{ __('Thank you for your business!') }}</span>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    @endforeach

    @if(empty($isServerPdf))
        <div id="downloading-loader"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p class="text-lg font-semibold text-gray-700">{{ __('Generating PDF...') }}</p>
                </div>
            </div>
        </div>

        <script>
            window.addEventListener('DOMContentLoaded', () => {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('download') === 'pdf') {
                    const loader = document.getElementById('downloading-loader');
                    if (loader) loader.classList.remove('hidden');

                    setTimeout(() => {
                        window.location.href = "{{ route('sales-invoices.download-pdf', $invoice->id) }}";
                        setTimeout(() => {
                            if (loader) loader.classList.add('hidden');
                        }, 2000);
                    }, 800);
                } else {
                    setTimeout(() => window.print(), 400);
                }
            });
        </script>
    @endif
</body>

</html>
