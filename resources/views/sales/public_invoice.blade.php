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

    // Get absolute or web path for image
    $getImagePath = function ($path) use ($toDataUri) {
        if (!$path)
            return '';

        $cleanPath = ltrim($path, '/');

        if (str_starts_with($cleanPath, 'http://') || str_starts_with($cleanPath, 'https://') || str_starts_with($cleanPath, 'data:')) {
            return $cleanPath;
        }

        $possibleLocalPaths = [
            storage_path('app/public/' . $cleanPath),
            storage_path('app/public/media/' . basename($cleanPath)),
            public_path('storage/' . $cleanPath),
            public_path('storage/media/' . basename($cleanPath)),
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

        if (function_exists('getImageUrlPrefix')) {
            $prefix = getImageUrlPrefix();
            if ($prefix) {
                return rtrim($prefix, '/') . '/' . basename($cleanPath);
            }
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($cleanPath)) {
            return \Illuminate\Support\Facades\Storage::url($cleanPath);
        }

        return asset($cleanPath);
    };

    // Settings Flags & Assets
    $showLogo = ($salesInvoiceSetting['sales_invoice_show_logo'] ?? 'on') !== 'off';
    $customLogo = $salesInvoiceSetting['sales_invoice_logo'] ?? '';
    $companyLogo = $companySettings['company_logo'] ?? $companySettings['logo_dark'] ?? $companySettings['logo_light'] ?? '';
    $logoToUse = $customLogo ?: $companyLogo;
    $logoUrl = ($showLogo && $logoToUse) ? $getImagePath($logoToUse) : ($showLogo ? asset('uploads/logo/logo_dark.png') : '');

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

    // Determine Payment Status Badge
    $paidAmt = (float) ($invoice->paid_amount ?? 0);
    $totalAmt = (float) ($invoice->total_amount ?? 0);
    $statusText = strtolower($invoice->status ?? '');

    if ($statusText === 'paid' || ($totalAmt > 0 && $paidAmt >= $totalAmt)) {
        $badgeLabel = __('Paid');
        $badgeClasses = 'bg-emerald-100/90 text-emerald-800 border-emerald-300 shadow-sm';
        $stampText = 'PAID';
        $stampColor = '#16a34a'; // Green
        $stampBorder = '8px solid #16a34a';
        $stampFontSize = '68px';
    } elseif ($statusText === 'partial' || ($paidAmt > 0 && $paidAmt < $totalAmt)) {
        $badgeLabel = __('Partial Payment');
        $badgeClasses = 'bg-amber-100/90 text-amber-800 border-amber-300 shadow-sm';
        $stampText = 'PARTIALLY PAID';
        $stampColor = '#ca8a04'; // Yellow / Amber
        $stampBorder = '8px solid #ca8a04';
        $stampFontSize = '46px';
    } else {
        $badgeLabel = __('Due');
        $badgeClasses = 'bg-rose-100/90 text-rose-800 border-rose-300 shadow-sm';
        $stampText = 'DUE';
        $stampColor = '#dc2626'; // Red
        $stampBorder = '8px solid #dc2626';
        $stampFontSize = '72px';
    }

    // Generate QR Code SVG Helper (Always Encrypted Client URL)
    $qrCodeSvg = '';
    try {
        $encryptedToken = \Illuminate\Support\Facades\Crypt::encryptString($invoice->id);
        $qrUrl = route('sales-invoice.client.view', $encryptedToken);
        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(70, 0),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        );
        $writer = new \BaconQrCode\Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrUrl);
    } catch (\Exception $e) {
        $qrCodeSvg = '';
    }
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('Invoice') }} - #{{ $invoice->invoice_number }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
        rel="stylesheet">
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
            background-color: #f1f5f9;
            font-family: 'Open Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            color: #1e293b;
        }

        @page {
            size: A4 portrait;
            margin: 0;
        }

        .invoice-viewer-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 70px 16px 40px 16px;
            box-sizing: border-box;
            min-height: 100vh;
        }

        .a4-page {
            position: relative;
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            max-height: 297mm;
            padding: 30mm 14mm 30mm 14mm;
            margin: 0 auto 28px auto;
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
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04);
            border-radius: 4px;
        }

        .a4-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
            margin-bottom: 0;
        }

        .table-responsive-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .a4-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
        }

        /* Responsive View Switcher */
        .mobile-invoice-view {
            display: none;
        }

        .desktop-invoice-view {
            display: block;
        }

        @media screen and (max-width: 768px) {
            .invoice-viewer-wrapper {
                padding: 68px 10px 30px 10px !important;
            }

            .desktop-invoice-view {
                display: none !important;
            }

            .mobile-invoice-view {
                display: block !important;
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
            }
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

        th,
        td {
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

            .mobile-invoice-view {
                display: none !important;
            }

            .desktop-invoice-view {
                display: block !important;
            }

            .invoice-viewer-wrapper {
                padding: 0 !important;
                display: block !important;
            }

            .a4-page {
                width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding: 30mm 14mm 30mm 14mm !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                page-break-after: always;
                break-after: page;
            }

            .a4-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
                margin-bottom: 0 !important;
            }

            .table-responsive-container {
                overflow: visible !important;
            }

            .table-responsive-container table {
                min-width: 100% !important;
            }
        }
    </style>
</head>

<body>
    <!-- Sleek Centered Floating Action Pill Dock -->
    <header class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-3.5 py-2 print:hidden bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md rounded-full shadow-lg border border-slate-700/60 transition-all duration-200">
        <div class="flex items-center gap-2 pl-1 pr-1.5 border-r border-slate-700/80">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold text-white tracking-tight">#{{ $invoice->invoice_number }}</span>
        </div>
        <div class="flex items-center gap-1.5">
            <button onclick="window.print()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span class="hidden sm:inline">{{ __('Print') }}</span>
            </button>
            <a href="?download=pdf"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-sm transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ __('PDF') }}</span>
            </a>
        </div>
    </header>

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
        if (($invoice->discount_amount ?? 0) > 0)
            $extraSummaryRows++;
        if (($invoice->tax_amount ?? 0) > 0)
            $extraSummaryRows++;
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

    <main class="invoice-viewer-wrapper">
        <!-- Desktop / Tablet A4 Print-Preview Pages -->
        <div class="desktop-invoice-view">
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
                                <div class="header-flex-container flex justify-between items-start mb-5">
                                    <!-- Left Column: Company Logo, Name & Information -->
                                    <div class="w-1/2 relative">
                                        @if($showLogo && $logoUrl)
                                            <div class="mb-2" style="position: absolute; top: -75px; left: 0;">
                                                <img src="{{ $logoUrl }}" alt="Logo" class="max-h-14 max-w-[200px] object-contain">
                                            </div>
                                        @endif
                                        @if(!empty($salesInvoiceSetting['company_name']) || !empty($companySettings['company_name']))
                                            <h1 class="text-xl sm:text-2xl font-bold mb-1.5 text-gray-900 leading-tight">{{ $salesInvoiceSetting['company_name'] ?? $companySettings['company_name'] }}</h1>
                                        @endif
                                        <div class="text-xs space-y-0.5 text-gray-600">
                                            @if(!empty($companySettings['company_address']))
                                                <p>{{ $companySettings['company_address'] }}</p>
                                            @endif
                                            @if(!empty($companySettings['company_city']) || !empty($companySettings['company_state']) || !empty($companySettings['company_zipcode']))
                                                <p>
                                                     {{ $companySettings['company_city'] ?? '' }}{{ !empty($companySettings['company_state']) ? ', ' . $companySettings['company_state'] : '' }}
                                                    {{ $companySettings['company_zipcode'] ?? '' }}{{ !empty($companySettings['company_country']) ? ', ' . $companySettings['company_country'] : '' }}
                                                </p>
                                            @endif
                                            
                                            @if(!empty($companySettings['company_telephone']))
                                                <p>{{ __('Phone') }}: {{ $companySettings['company_telephone'] }}</p>
                                            @endif
                                            @if(!empty($companySettings['company_email']))
                                                <p>{{ __('Email') }}: {{ $companySettings['company_email'] }}</p>
                                            @endif
                                           
                                        </div>
                                    </div>

                                    <!-- Right Column: Invoice Details on Left of QR, and QR Code on Far Right -->
                                    <div class="w-1/2 flex items-start justify-end gap-4 text-right">
                                         @if(!empty($qrCodeSvg))
                                            <div class="shrink-0 p-1.5 bg-white border border-slate-300 rounded shadow-sm inline-block self-center">
                                                <div class="w-24 h-24 [&>svg]:w-full [&>svg]:h-full">
                                                    {!! $qrCodeSvg !!}
                                                </div>
                                            </div>
                                        @endif
                                        <div>
                                            <div class="flex items-center justify-end gap-2.5 mb-1">
                                                <h2 class="text-xl sm:text-xl font-bold mb-1.5 text-gray-900 leading-tight">{{ __('INVOICE') }}</h2>
                                            </div>
                                            <p class="text-sm font-semibold text-gray-800">#{{ $invoice->invoice_number }}</p>
                                            <div class="text-xs mt-2 space-y-0.5 text-gray-600">
                                                <p><span class="font-medium text-gray-700">{{ __('Date') }}:</span> {{ $formatDate($invoice->invoice_date) }}</p>
                                                <p><span class="font-medium text-gray-700">{{ __('Due') }}:</span> {{ $formatDate($invoice->due_date) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Customer Information -->
                                <div class="header-flex-container flex justify-between mb-5 pt-3 border-t border-gray-200">
                                    <div class="w-1/2">
                                        <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">
                                            {{ __('BILL TO') }}</h3>
                                        <div class="text-xs space-y-0.5 text-gray-700">
                                            <p class="font-semibold text-gray-900">
                                                {{ $invoice->customer->name ?? $invoice->customer_name ?? '-' }}</p>
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
                                        <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">
                                            {{ __('SHIP TO') }}</h3>
                                        <div class="text-xs space-y-0.5 text-gray-700">
                                            @if(!empty($invoice->customerDetails?->shipping_address))
                                                <p class="font-semibold text-gray-900">
                                                    {{ $invoice->customerDetails->shipping_address['name'] ?? '' }}</p>
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
                                <div
                                    class="header-flex-container flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                    <div>
                                        <span class="font-bold text-sm text-gray-900">{{ __('INVOICE') }}:
                                            #{{ $invoice->invoice_number }}</span>
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        <span>{{ __('Date') }}: {{ $formatDate($invoice->invoice_date) }}</span> |
                                        <span>{{ __('Customer') }}:
                                            {{ $invoice->customer->name ?? $invoice->customer_name ?? '' }}</span>
                                    </div>
                                </div>
                            @endif

                            <!-- Items Table -->
                            <div class="mb-4 table-responsive-container">
                                <table
                                    style="width: 100%; font-size: 10px; table-layout: fixed; border-collapse: collapse; border: 1px solid #94a3b8;">
                                    <thead>
                                        <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700;">
                                            <th
                                                style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 5%;">
                                                {{ __('SN') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 22%;">
                                                {{ __('ITEMS') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 23%;">
                                                {{ __('DESCRIPTION') }}</th>
                                            <th
                                                style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 9%;">
                                                {{ __('QTY') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 11%;">
                                                {{ __('PRICE') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 10%;">
                                                {{ __('DISCOUNT') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 10%;">
                                                {{ __('TAX/VAT') }}</th>
                                            <th
                                                style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 12%;">
                                                {{ __('TOTAL') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($pageItems as $i => $item)
                                            @php
                                                $unitName = $item->product?->unitRelation?->unit_name ?? (!is_numeric($item->product?->unit) ? $item->product?->unit : '');
                                                $itemDesc = $item->description ?? $item->product?->description ?? $item->product?->long_description ?? '';
                                            @endphp
                                            <tr class="page-break-inside-avoid">
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #475569;">
                                                    {{ $startIndex + $i + 1 }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top;">
                                                    <div
                                                        style="font-weight: 600; color: #0f172a; line-height: 1.25; font-size: 10px;">
                                                        {{ $item->product->name ?? '' }}</div>
                                                </td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #475569; font-size: 9px; line-height: 1.35;">
                                                    @if(!empty($itemDesc))
                                                        <div class="rich-content">{!! $itemDesc !!}</div>
                                                    @else
                                                        <span style="color: #94a3b8;">-</span>
                                                    @endif
                                                </td>
                                                <td
                                                    style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #1e293b; font-weight: 500;">
                                                    {{ $item->quantity }}@if(!empty($unitName)) <span
                                                    style="font-size: 9px; color: #475569; font-weight: 400;">{{ $unitName }}</span>@endif
                                                </td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                                    {{ $formatCurrency($item->unit_price) }}</td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                                    @if($item->discount_percentage > 0)
                                                        <div>{{ (float) $item->discount_percentage }}%</div>
                                                    @else
                                                        <span>-</span>
                                                    @endif
                                                </td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                                    @if(!empty($item->taxes) && count($item->taxes) > 0)
                                                        @foreach($item->taxes as $tax)
                                                            <div style="line-height: 1.25; color: #475569; font-size: 9px;">
                                                                {{ $tax->tax_name }} ({{ $tax->tax_rate }}%)</div>
                                                        @endforeach
                                                    @elseif($item->tax_percentage > 0)
                                                        <div style="color: #475569; font-size: 9px;">{{ $item->tax_percentage }}%
                                                        </div>
                                                    @else
                                                        <span style="color: #94a3b8;">-</span>
                                                    @endif
                                                </td>
                                                <td
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; font-weight: 600; color: #0f172a;">
                                                    {{ $formatCurrency($item->total_amount) }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>

                                    @if($isLastPage)
                                        <tfoot>
                                            <tr class="page-break-inside-avoid">
                                                <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                <td
                                                    style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">
                                                    {{ __('Subtotal') }}:</td>
                                                <td
                                                    style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">
                                                    {{ $formatCurrency($invoice->subtotal) }}</td>
                                            </tr>
                                            @if($invoice->discount_amount > 0)
                                                <tr class="page-break-inside-avoid">
                                                    <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                    <td
                                                        style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">
                                                        {{ __('Discount') }}:</td>
                                                    <td
                                                        style="padding: 5px 8px; text-align: right; font-weight: 600; color: #dc2626; border: 1px solid #94a3b8;">
                                                        -{{ $formatCurrency($invoice->discount_amount) }}</td>
                                                </tr>
                                            @endif
                                            @if(!empty($taxBreakdown) && count($taxBreakdown) > 0)
                                                @foreach($taxBreakdown as $taxKey => $taxInfo)
                                                    @if($taxInfo['amount'] > 0)
                                                        <tr class="page-break-inside-avoid">
                                                            <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                            <td
                                                                style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">
                                                                {{ $taxInfo['name'] }}:</td>
                                                            <td
                                                                style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">
                                                                {{ $formatCurrency($taxInfo['amount']) }}</td>
                                                        </tr>
                                                    @endif
                                                @endforeach
                                            @elseif($invoice->tax_amount > 0)
                                                <tr class="page-break-inside-avoid">
                                                    <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                    <td
                                                        style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">
                                                        {{ __('Tax') }}:</td>
                                                    <td
                                                        style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">
                                                        {{ $formatCurrency($invoice->tax_amount) }}</td>
                                                </tr>
                                            @endif
                                            <tr class="page-break-inside-avoid" style="font-weight: 700;">
                                                <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                <td
                                                    style="padding: 6px 8px; font-size: 11px; color: #0f172a; border: 1px solid #94a3b8; text-align: right;">
                                                    {{ __('TOTAL') }}:</td>
                                                <td
                                                    style="padding: 6px 8px; font-size: 11px; text-align: right; color: #0f172a; border: 1px solid #94a3b8;">
                                                    {{ $formatCurrency($invoice->total_amount) }}</td>
                                            </tr>
                                            @if(($invoice->paid_amount ?? 0) > 0 && ($invoice->balance_amount ?? 0) > 0)
                                                <tr class="page-break-inside-avoid">
                                                    <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                    <td
                                                        style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">
                                                        {{ __('Paid Amount') }}:</td>
                                                    <td
                                                        style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">
                                                        {{ $formatCurrency($invoice->paid_amount) }}</td>
                                                </tr>
                                                <tr class="page-break-inside-avoid" style="font-weight: 700;">
                                                    <td colspan="6" style="border: 1px solid #94a3b8;"></td>
                                                    <td
                                                        style="padding: 5px 8px; font-size: 10.5px; color: #0f172a; border: 1px solid #94a3b8; text-align: right;">
                                                        {{ __('Balance Due') }}:</td>
                                                    <td
                                                        style="padding: 5px 8px; font-size: 10.5px; text-align: right; color: #0f172a; border: 1px solid #94a3b8;">
                                                        {{ $formatCurrency($invoice->balance_amount) }}</td>
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
                                <div class="mb-4 page-break-inside-avoid table-responsive-container">
                                    <div
                                        style="font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                                        {{ __('Payment Summary') }}
                                    </div>
                                    <table
                                        style="width: 100%; font-size: 10px; table-layout: fixed; border-collapse: collapse; border: 1px solid #94a3b8;">
                                        <thead>
                                            <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700;">
                                                <th
                                                    style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 6%;">
                                                    {{ __('SN') }}</th>
                                                <th
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 26%;">
                                                    {{ __('Payment Date') }}</th>
                                                <th
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 44%;">
                                                    {{ __('Payment Method') }}</th>
                                                <th
                                                    style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 24%;">
                                                    {{ __('Allocated Amount') }}</th>
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
                                                    <td
                                                        style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #475569;">
                                                        {{ $pIdx + 1 }}</td>
                                                    <td
                                                        style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #475569;">
                                                        {{ $formatDate($pDate) }}</td>
                                                    <td
                                                        style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top; color: #0f172a; font-weight: 500;">
                                                        {{ $pMethod }}</td>
                                                    <td
                                                        style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; font-weight: 600; color: #0f172a;">
                                                        {{ $formatCurrency($alloc->allocated_amount ?? 0) }}</td>
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
                                <div
                                    class="border-t border-gray-300 pt-2 text-center text-xs text-gray-500 page-break-inside-avoid">
                                    <span>{{ __('Thank you for your business!') }}</span>
                                </div>
                            </div>
                        @endif
                    </div>
                    <div style="font-size: {{ $stampFontSize }}; color: {{ $stampColor }}; position: absolute; bottom: 25%; left: 50%; transform: translateX(-50%) rotate(-25deg); opacity: 0.22; text-transform: uppercase; border: {{ $stampBorder }}; padding: 0px 24px; font-weight: 800; letter-spacing: 3px; pointer-events: none; z-index: 10; white-space: nowrap; user-select: none; font-family: 'Open Sans', sans-serif;">
                        {{ $stampText }}
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Dedicated Mobile Clean Single-Sheet Invoice View (Screen Only) -->
        <div class="mobile-invoice-view">
            <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
                <!-- Mobile Header: Company Info Left, Invoice Details & QR Right -->
                <div class="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
                    <!-- Left: Company Info / Name & Logo -->
                    <div class="space-y-1">
                        @if($showLogo && $logoUrl)
                            <div class="mb-1.5">
                                <img src="{{ $logoUrl }}" alt="Logo" class="max-h-11 max-w-[130px] object-contain">
                            </div>
                        @endif
                        @if(!empty($salesInvoiceSetting['company_name']) || !empty($companySettings['company_name']))
                            <h1 class="text-base font-bold text-slate-900 leading-snug">{{ $salesInvoiceSetting['company_name'] ?? $companySettings['company_name'] }}</h1>
                        @endif
                        @if(!empty($companySettings['company_address']))
                            <p class="text-[11px] text-slate-500 max-w-[160px] leading-tight">{{ $companySettings['company_address'] }}</p>
                        @endif
                        @if(!empty($companySettings['company_telephone']))
                            <p class="text-[11px] text-slate-500">{{ __('Phone') }}: {{ $companySettings['company_telephone'] }}</p>
                        @endif
                    </div>

                    <!-- Right: Invoice Details & QR Code -->
                    <div class="flex items-start gap-2.5 text-right">
                        <div>
                            <div class="flex items-center justify-end gap-1.5 mb-0.5">
                                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ __('Invoice') }}</span>
                                <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border {{ $badgeClasses }}">
                                    {{ $badgeLabel }}
                                </span>
                            </div>
                            <span class="text-sm font-bold text-slate-900 block mb-1">#{{ $invoice->invoice_number }}</span>
                            <div class="text-[11px] text-slate-600 space-y-0.5">
                                <p><span class="font-medium text-slate-400">{{ __('Date') }}:</span> {{ $formatDate($invoice->invoice_date) }}</p>
                                <p><span class="font-medium text-slate-400">{{ __('Due') }}:</span> {{ $formatDate($invoice->due_date) }}</p>
                            </div>
                        </div>
                        @if(!empty($qrCodeSvg))
                            <div class="shrink-0 p-1 bg-white border border-slate-300 rounded-lg shadow-sm inline-block self-center">
                                <div class="w-14 h-14 [&>svg]:w-full [&>svg]:h-full">
                                    {!! $qrCodeSvg !!}
                                </div>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Customer Details -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-200 text-xs">
                    <div>
                        <h3 class="font-bold text-slate-400 uppercase tracking-wider mb-1">{{ __('BILL TO') }}</h3>
                        <p class="font-bold text-slate-900 text-sm mb-0.5">
                            {{ $invoice->customer->name ?? $invoice->customer_name ?? '-' }}</p>
                        @if(!empty($invoice->customer->email ?? $invoice->customer_email))
                            <p class="text-slate-600">{{ $invoice->customer->email ?? $invoice->customer_email }}</p>
                        @endif
                        @if(!empty($invoice->customer_phone))
                            <p class="text-slate-600">{{ $invoice->customer_phone }}</p>
                        @endif
                        @if(!empty($invoice->customerDetails?->billing_address))
                            <p class="text-slate-600 mt-1">
                                {{ $invoice->customerDetails->billing_address['address_line_1'] ?? '' }}
                                {{ $invoice->customerDetails->billing_address['city'] ?? '' }}
                            </p>
                        @elseif(!empty($invoice->customer_address))
                            <p class="text-slate-600 mt-1">{{ $invoice->customer_address }}</p>
                        @endif
                    </div>
                    @if(!empty($invoice->customerDetails?->shipping_address))
                        <div>
                            <h3 class="font-bold text-slate-400 uppercase tracking-wider mb-1">{{ __('SHIP TO') }}</h3>
                            <p class="font-semibold text-slate-800">
                                {{ $invoice->customerDetails->shipping_address['name'] ?? '' }}</p>
                            <p class="text-slate-600">
                                {{ $invoice->customerDetails->shipping_address['address_line_1'] ?? '' }}</p>
                            <p class="text-slate-600">{{ $invoice->customerDetails->shipping_address['city'] ?? '' }}</p>
                        </div>
                    @endif
                </div>

                <!-- Line Items Table -->
                <div class="pb-2">
                    <h3 class="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3">{{ __('ITEMS') }}</h3>
                    <div class="divide-y divide-slate-100">
                        @foreach($rawItems as $mIdx => $mItem)
                            @php
                                $mUnit = $mItem->product?->unitRelation?->unit_name ?? (!is_numeric($mItem->product?->unit) ? $mItem->product?->unit : '');
                                $mDesc = $mItem->description ?? $mItem->product?->description ?? $mItem->product?->long_description ?? '';
                            @endphp
                            <div class="py-3 first:pt-0 last:pb-0">
                                <div class="flex justify-between items-start gap-2">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900">
                                            {{ $mItem->product->name ?? ('Item #' . ($mIdx + 1)) }}</p>
                                        @if(!empty($mDesc))
                                            <div class="text-xs text-slate-500 rich-content mt-0.5">{!! $mDesc !!}</div>
                                        @endif
                                        <p class="text-xs text-slate-500 mt-1">
                                            {{ $mItem->quantity }}{{ $mUnit ? ' ' . $mUnit : '' }} &times;
                                            {{ $formatCurrency($mItem->unit_price) }}
                                            @if($mItem->discount_percentage > 0)
                                                <span class="text-amber-600 ml-1">({{ (float) $mItem->discount_percentage }}%
                                                    off)</span>
                                            @endif
                                        </p>
                                    </div>
                                    <span
                                        class="text-sm font-bold text-slate-900 shrink-0">{{ $formatCurrency($mItem->total_amount) }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Totals Breakdown -->
                <div class="pt-4 border-t border-slate-200">
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between text-slate-600">
                            <span>{{ __('Subtotal') }}</span>
                            <span class="font-semibold text-slate-800">{{ $formatCurrency($invoice->subtotal) }}</span>
                        </div>
                        @if($invoice->discount_amount > 0)
                            <div class="flex justify-between text-red-600">
                                <span>{{ __('Discount') }}</span>
                                <span class="font-semibold">-{{ $formatCurrency($invoice->discount_amount) }}</span>
                            </div>
                        @endif
                        @if(!empty($taxBreakdown) && count($taxBreakdown) > 0)
                            @foreach($taxBreakdown as $taxKey => $taxInfo)
                                @if($taxInfo['amount'] > 0)
                                    <div class="flex justify-between text-slate-600">
                                        <span>{{ $taxInfo['name'] }}</span>
                                        <span class="font-semibold text-slate-800">{{ $formatCurrency($taxInfo['amount']) }}</span>
                                    </div>
                                @endif
                            @endforeach
                        @elseif($invoice->tax_amount > 0)
                            <div class="flex justify-between text-slate-600">
                                <span>{{ __('Tax') }}</span>
                                <span
                                    class="font-semibold text-slate-800">{{ $formatCurrency($invoice->tax_amount) }}</span>
                            </div>
                        @endif
                        <div
                            class="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                            <span>{{ __('Total') }}</span>
                            <span class="text-slate-900">{{ $formatCurrency($invoice->total_amount) }}</span>
                        </div>
                        @if(($invoice->paid_amount ?? 0) > 0 && ($invoice->balance_amount ?? 0) > 0)
                            <div class="flex justify-between text-emerald-600 font-semibold pt-1">
                                <span>{{ __('Paid Amount') }}</span>
                                <span>{{ $formatCurrency($invoice->paid_amount) }}</span>
                            </div>
                            <div
                                class="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                                <span>{{ __('Balance Due') }}</span>
                                <span class="text-amber-700">{{ $formatCurrency($invoice->balance_amount) }}</span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Payment History (If Available) -->
                @php
                    $mobilePayments = $clearedPaymentAllocations ?? collect();
                @endphp
                @if(count($mobilePayments) > 0)
                    <div class="pt-4 border-t border-slate-200">
                        <h3 class="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2.5">
                            {{ __('Payment Summary') }}</h3>
                        <div class="bg-slate-50 rounded-lg p-3 divide-y divide-slate-200/60">
                            @foreach($mobilePayments as $mAlloc)
                                @php
                                    $mPayment = $mAlloc->payment ?? null;
                                    $mBankAccount = $mPayment?->bankAccount ?? $mPayment?->bank_account ?? null;
                                    $mMethod = !empty($mBankAccount?->account_name)
                                        ? ($mBankAccount->account_name . (!empty($mBankAccount->account_number) ? ' (' . $mBankAccount->account_number . ')' : ''))
                                        : ($mPayment?->payment_method ?: '-');
                                    $mDate = $mPayment?->payment_date ?: $mAlloc->created_at;
                                @endphp
                                <div class="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                    <div>
                                        <p class="font-semibold text-slate-800">{{ $mMethod }}</p>
                                        <p class="text-slate-400 text-[11px]">{{ $formatDate($mDate) }}</p>
                                    </div>
                                    <span
                                        class="font-bold text-slate-800">{{ $formatCurrency($mAlloc->allocated_amount ?? 0) }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Terms & Business Greeting -->
                @if($invoice->payment_terms)
                    <div class="pt-4 border-t border-slate-200 text-xs text-slate-600">
                        <span class="font-semibold text-slate-800 block mb-1">{{ __('TERMS & CONDITIONS') }}:</span>
                        <div class="rich-content leading-relaxed text-slate-500">{!! $invoice->payment_terms !!}</div>
                    </div>
                @endif

                <div class="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
                    <span>{{ __('Thank you for your business!') }}</span>
                </div>

                <div style="font-size: 38px; color: {{ $stampColor }}; position: absolute; bottom: 18%; left: 50%; transform: translateX(-50%) rotate(-25deg); opacity: 0.16; text-transform: uppercase; border: {{ $stampBorder }}; padding: 0px 16px; font-weight: 800; letter-spacing: 2px; pointer-events: none; z-index: 10; white-space: nowrap; user-select: none; font-family: 'Open Sans', sans-serif;">
                    {{ $stampText }}
                </div>
            </div>
        </div>
    </main>

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
            }
        });
    </script>
</body>

</html>