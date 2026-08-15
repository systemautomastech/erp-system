<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Proposal #{{ $proposal->proposal_number }}</title>
    @vite(['resources/css/app.css'])
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        html, body {
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
        .proposal-preview-sheet, .quotation-cover__sheet {
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
        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            html, body, .print-container {
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
        
        $getImagePath = function($path) {
            if (!$path) return '';
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
        $getPageBgStyle = function($customBg = null, $isFrontPage = false) use ($getImagePath, $defaultBgImage) {
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

        $items = $proposal->items ?? collect();
        $otcItems = $items->filter(function($i) {
            return ($i->section === 'otc' || $i->section === 'general' || !$i->section) && ((float)$i->unit_price > 0 || (int)$i->product_id > 0 || !empty($i->product_description));
        })->values();

        $otcSubtotal = $otcItems->sum(fn($i) => (float)($i->total_amount ?? ($i->quantity * $i->unit_price)));
        $otcDiscount = $otcItems->sum(fn($i) => (float)($i->discount_amount ?? 0));
        $otcTax = $otcItems->sum(fn($i) => (float)($i->tax_amount ?? 0));
        $otcTotal = $otcSubtotal - $otcDiscount + $otcTax;

        $mrcItems = $items->filter(function($i) {
            return $i->section === 'mrc' && ((float)$i->unit_price > 0 || (int)$i->product_id > 0 || !empty($i->product_description));
        })->values();

        $mrcSubtotal = $mrcItems->sum(fn($i) => (float)($i->total_amount ?? ($i->quantity * $i->unit_price)));
        $mrcDiscount = $mrcItems->sum(fn($i) => (float)($i->discount_amount ?? 0));
        $mrcTax = $mrcItems->sum(fn($i) => (float)($i->tax_amount ?? 0));
        $mrcTotal = $mrcSubtotal - $mrcDiscount + $mrcTax;

        // Build Sections Source for this individual proposal
        $sectionsSource = [];
        $rawContent = $proposal->proposal_content ?? null;
        if (is_string($rawContent)) {
            $sectionsSource = json_decode($rawContent, true) ?: [];
        } elseif (is_array($rawContent)) {
            $sectionsSource = $rawContent;
        }

        // If no custom pages defined in proposal, only render the essential individual proposal pages:
        // 1. Front Cover Page
        // 2. OTC Charge Page (if has OTC items)
        // 3. MRC Charge Page (if has MRC items)
        // 4. Other Details / Terms Page (if has other_details)
        if (empty($sectionsSource)) {
            $sectionsSource = [
                ['id' => 'fp', 'title' => 'Front Page', 'page_type' => 'front-page']
            ];

            if (count($otcItems) > 0) {
                $sectionsSource[] = ['id' => 'otc', 'title' => 'One-Time Charges (OTC)', 'page_type' => 'otc'];
            }
            if (count($mrcItems) > 0) {
                $sectionsSource[] = ['id' => 'mrc', 'title' => 'Monthly Recurring Charges (MRC)', 'page_type' => 'mrc'];
            }
            if (!empty($proposal->other_details) && trim($proposal->other_details) !== '' && $proposal->other_details !== '<p></p>') {
                $sectionsSource[] = ['id' => 'other', 'title' => 'OTHER DETAILS', 'page_type' => 'other-details'];
            }
        }

        // Helper for estimating item weight in blade
        $estimateItemWeight = function($item) {
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
        $chunkItemsDynamic = function($itemsList) use ($estimateItemWeight) {
            if (count($itemsList) === 0) return [];
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
            $sec = (array)$sec;
            $pageType = $sec['page_type'] ?? '';
            $isFront = $pageType === 'front-page' || !empty($sec['is_front_page']) || str_contains(strtolower($sec['title'] ?? ''), 'front') || str_contains(strtolower($sec['title'] ?? ''), 'cover');

            if ($isFront) {
                $renderablePages[] = [
                    'key' => "front-{$sIdx}",
                    'type' => 'front-page',
                    'title' => $sec['title'] ?? 'Front Page',
                    'background_image' => $sec['background_image'] ?? null,
                ];
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

    <div class="print-container" id="proposal-document">
        @foreach($renderablePages as $pIdx => $page)
            @php
                $pageNum = $pIdx + 1;
                $isFrontPage = ($page['type'] === 'front-page');
                $pageBgStyle = $getPageBgStyle($page['background_image'], $isFrontPage);
                $hasCustomFrontBg = !empty($page['background_image']);
            @endphp

            {{-- 1. COVER PAGE --}}
            @if($isFrontPage)
                <div class="quotation-cover__sheet" style="width: 210mm; min-height: 297mm; height: 297mm; background-color: #ffffff; position: relative; overflow: hidden; page-break-after: always; box-sizing: border-box; {{ $pageBgStyle }}">
                    @if(!$hasCustomFrontBg)
                        <div class="quotation-cover__topbar" style="position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, {{ $templateColor }}, #fffb00); z-index: 1;"></div>

                        <svg class="quotation-cover__shape quotation-cover__shape--top" style="position: absolute; top: -46px; left: -46px; width: 240px; z-index: 1; pointer-events: none;" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="180" stroke="{{ $templateColor }}" stroke-width="28"></circle>
                            <circle cx="80" cy="80" r="120" stroke="#111827" stroke-width="14"></circle>
                            <circle cx="110" cy="110" r="70" stroke="{{ $templateColor }}" stroke-width="10"></circle>
                        </svg>

                        <svg class="quotation-cover__shape quotation-cover__shape--bottom" style="position: absolute; right: -30px; bottom: -30px; width: 240px; transform: rotate(180deg); opacity: 0.5; z-index: 1; pointer-events: none;" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="180" stroke="{{ $templateColor }}" stroke-width="28"></circle>
                            <circle cx="80" cy="80" r="120" stroke="#111827" stroke-width="14"></circle>
                            <circle cx="110" cy="110" r="70" stroke="{{ $templateColor }}" stroke-width="10"></circle>
                        </svg>

                        <svg class="quotation-cover__watermark" style="position: absolute; right: 22mm; top: 76mm; width: 150px; height: 150px; opacity: 0.05; z-index: 1; color: {{ $templateColor }}; pointer-events: none;" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="72" stroke="{{ $templateColor }}" stroke-width="16" fill="none"></circle>
                            <circle cx="100" cy="100" r="42" stroke="#111827" stroke-width="10" fill="none"></circle>
                        </svg>

                        <svg class="quotation-cover__watermark_bottom" style="position: absolute; left: 0.5rem; bottom: 7.5rem; width: 150px; height: 150px; opacity: 0.08; z-index: 1; color: {{ $templateColor }}; pointer-events: none;" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="72" stroke="{{ $templateColor }}" stroke-width="16" fill="none"></circle>
                            <circle cx="100" cy="100" r="42" stroke="#111827" stroke-width="10" fill="none"></circle>
                        </svg>
                    @endif

                    <div class="quotation-cover__body" style="padding: 10mm 20mm; position: relative; z-index: 2; min-height: calc(297mm - 10px); display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                        <div style="text-align: right; margin-bottom: 15mm;">
                            <img src="{{ $logoImage }}" alt="Company Logo" style="max-height: 60px; object-fit: contain; margin-left: auto;">
                        </div>

                        <div style="position: relative;">
                            <div style="letter-spacing: .18em; font-size: .8rem; color: {{ $templateColor }}; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                                Financial Proposal
                            </div>

                            <h1 style="font-size: 2.2rem; line-height: 1.15; color: #111827; font-weight: 700; margin: 0 0 8px 0;">
                                {{ $proposal->subject ?? 'Subject' }}
                            </h1>

                            <div style="font-size: 1.1rem; color: #64748b; font-weight: 600; margin-bottom: 16px;">
                                Quotation & Commercial Proposal
                            </div>

                            <div style="width: 90px; height: 4px; border-radius: 999px; background: {{ $templateColor }}; margin-bottom: 24px;"></div>

                            <div style="margin-bottom: 30px;">
                                <span style="display: inline-block; border: 1px solid {{ $templateColor }}; padding: .4rem .85rem; font-size: .8rem; font-weight: 600; color: {{ $templateColor }}; background: #ffffff; border-radius: 0.25rem;">
                                    {{ $proposal->proposal_date ? date('M d, Y', strtotime($proposal->proposal_date)) : date('M d, Y') }}
                                </span>
                            </div>

                            <div style="border: 1px solid #e5e7eb; padding: 25px; background: linear-gradient(135deg, #f9fafb, #eef2f7); border-radius: .25rem; text-align: center; margin-bottom: 16px;">
                                <div style="text-transform: uppercase; color: #64748b; font-weight: 700; font-size: 12px; margin-bottom: 8px; text-decoration: underline;">
                                    Submitted To
                                </div>
                                <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
                                    {{ $proposal->customer->name ?? 'Client Name' }}
                                </h2>
                                <p style="color: #475569; font-size: 12px; margin: 0;">
                                    {{ $proposal->customer->address ?? $proposal->customer->email ?? 'Client Address' }}
                                </p>
                            </div>

                            <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: .25rem; text-align: center;">
                                <div style="text-transform: uppercase; color: #64748b; font-weight: 700; font-size: 12px; margin-bottom: 10px; text-decoration: underline;">
                                    Prepared By
                                </div>
                                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                                    {{ $companyName }}
                                </div>
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; font-weight: 500;">
                                    Company Information
                                </div>
                            </div>
                        </div>

                        <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #dee2e6; font-size: 13px; display: flex; justify-content: space-between; color: #475569;">
                            <div><strong>Prepared by:</strong> {{ $companyName }}</div>
                            <div><strong>Subject:</strong> {{ $proposal->subject ?? 'Subject' }}</div>
                        </div>
                    </div>
                </div>

            {{-- 2. OTC CHARGES SHEET --}}
            @elseif($page['type'] === 'otc')
                <div class="proposal-preview-sheet" style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body" style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #293240;">
                                {{ $page['title'] }}
                            </div>

                            <table style="width: 100%; font-size: 12px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px;">
                                <thead>
                                    <tr style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">S/N</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">Item / Service</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">Description</th>
                                        <th style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">Qty.</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Price (BDT)</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if(count($page['items']) === 0)
                                        <tr>
                                            <td colSpan="6" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
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
                                                $lTotal = (float)($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            @endphp
                                            <tr>
                                                <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">{{ $startIdx + $index + 1 }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">{{ $pName }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word; font-size: 11px;">{!! $pDesc !!}</td>
                                                <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">{{ $item->quantity }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($item->unit_price, 2) }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($lTotal, 2) }}</td>
                                            </tr>
                                        @endforeach

                                        @if(!empty($page['isLastChunk']))
                                            <tr>
                                                <td colspan="4" style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #64748b; font-style: italic; vertical-align: middle; word-break: break-word;">
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                    Total (BDT):
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['subtotal'], 2) }}
                                                </td>
                                            </tr>
                                            @if($page['discount'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        Discount:
                                                    </td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        -{{ number_format($page['discount'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($page['tax'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        VAT/Tax:
                                                    </td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        +{{ number_format($page['tax'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    Grand Total:
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
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
                <div class="proposal-preview-sheet" style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body" style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 700; margin-bottom: 8px; font-size: 14px; color: #293240;">
                                {{ $page['title'] }}
                            </div>

                            <table style="width: 100%; font-size: 12px; table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px;">
                                <thead>
                                    <tr style="background-color: {{ $templateColor }}; color: #ffffff; text-align: center; font-weight: 600;">
                                        <th style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 5%; white-space: nowrap;">S/N</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 22%; text-align: left;">Item / Service</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 38%; text-align: left;">Description</th>
                                        <th style="padding: 8px 4px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 7%; text-align: center; white-space: nowrap;">Qty.</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Price (BDT)</th>
                                        <th style="padding: 8px; border: 1px solid #cbd5e1; color: #ffffff; font-size: 10px; width: 14%; text-align: right; white-space: nowrap;">Total (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if(count($page['items']) === 0)
                                        <tr>
                                            <td colSpan="6" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
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
                                                $lTotal = (float)($item->total_amount ?? ($item->quantity * $item->unit_price));
                                            @endphp
                                            <tr>
                                                <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; white-space: nowrap;">{{ $startIdx + $index + 1 }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; font-weight: 500; color: #293240; word-break: break-word;">{{ $pName }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; text-align: left; color: #293240; word-break: break-word; font-size: 11px;">{!! $pDesc !!}</td>
                                                <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; color: #293240; white-space: nowrap;">{{ $item->quantity }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($item->unit_price, 2) }}</td>
                                                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; vertical-align: middle; color: #293240; white-space: nowrap;">{{ number_format($lTotal, 2) }}</td>
                                            </tr>
                                        @endforeach

                                        @if(!empty($page['isLastChunk']))
                                            <tr>
                                                <td colspan="4" style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #64748b; font-style: italic; vertical-align: middle; word-break: break-word;">
                                                    Prices are subject to change based on customer requirements.<br>
                                                    Any additional modifications requested after confirmation will incur applicable customization charges.
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                    Total (BDT):
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['subtotal'], 2) }}
                                                </td>
                                            </tr>
                                            @if($page['discount'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        Discount:
                                                    </td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        -{{ number_format($page['discount'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($page['tax'] > 0)
                                                <tr>
                                                    <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #1e293b; vertical-align: middle; white-space: nowrap;">
                                                        VAT/Tax:
                                                    </td>
                                                    <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                        +{{ number_format($page['tax'], 2) }}
                                                    </td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td colspan="4" style="border: 1px solid #cbd5e1;"></td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    Grand Total:
                                                </td>
                                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a; vertical-align: middle; white-space: nowrap;">
                                                    {{ number_format($page['total'], 2) }}
                                                </td>
                                            </tr>
                                        @endif
                                    @endif
                                </tbody>
                            </table>

                            @if(!empty($page['isLastChunk']))
                                <div id="mrc-notes" style="margin-top: 12px;">
                                    <div style="text-align: left; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">
                                        <strong style="font-weight: 700; color: #0f172a;">Note :</strong> Monthly charges are billed in advance per billing cycle.
                                    </div>
                                    <div style="text-align: left; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 12px;">
                                        <strong style="font-weight: 700; color: #0f172a;">Note :</strong> All MRC (prices) exclude VAT &amp; AIT.
                                    </div>
                                </div>
                            @endif
                        </div>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right; font-size: 11px; color: #94a3b8;">
                            Page {{ $pageNum }} of {{ $totalPages }}
                        </div>
                    </div>
                </div>

            {{-- 4. OTHER DETAILS SHEET --}}
            @elseif($page['type'] === 'other-details')
                <div class="proposal-preview-sheet" style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body" style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">{{ $page['title'] }}</h3>
                            {!! $page['content'] !!}
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right; font-size: 11px; color: #94a3b8;">
                            Page {{ $pageNum }} of {{ $totalPages }}
                        </div>
                    </div>
                </div>

            {{-- 5. CONTENT / DEFAULT PAGES --}}
            @else
                <div class="proposal-preview-sheet" style="width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; background-color: #ffffff; padding: 0; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; {{ $pageBgStyle }}">
                    <div class="quotation-page__body" style="position: relative; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 52mm); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                            <h3 style="font-size: 14px; font-weight: 700; color: #293240; margin-bottom: 12px;">{{ $page['title'] }}</h3>
                            {!! $page['content'] !!}
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: right; font-size: 11px; color: #94a3b8;">
                            Page {{ $pageNum }} of {{ $totalPages }}
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>

    <script>
        const convertSvgsToImages = (element) => {
            const svgs = Array.from(element.querySelectorAll('svg'));
            const replacements = [];

            svgs.forEach((svg) => {
                try {
                    const svgString = new XMLSerializer().serializeToString(svg);
                    const encodedSvg = encodeURIComponent(svgString);
                    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

                    const img = document.createElement('img');
                    img.src = dataUrl;

                    const computed = window.getComputedStyle(svg);
                    img.style.position = computed.position || 'absolute';
                    img.style.top = computed.top;
                    img.style.left = computed.left;
                    img.style.right = computed.right;
                    img.style.bottom = computed.bottom;
                    img.style.width = computed.width;
                    img.style.height = computed.height;
                    img.style.transform = computed.transform;
                    img.style.opacity = computed.opacity;
                    img.style.zIndex = computed.zIndex;
                    img.style.pointerEvents = 'none';

                    if (svg.parentNode) {
                        svg.parentNode.insertBefore(img, svg);
                        svg.style.display = 'none';
                        replacements.push({ svg, img });
                    }
                } catch (e) {
                    console.error('Error rasterizing SVG:', e);
                }
            });

            return () => {
                replacements.forEach(({ svg, img }) => {
                    svg.style.display = '';
                    if (img.parentNode) {
                        img.parentNode.removeChild(img);
                    }
                });
            };
        };

        async function downloadPDF() {
            const container = document.getElementById('proposal-document');
            if (!container) return;

            const sheets = container.querySelectorAll('.proposal-preview-sheet, .quotation-cover__sheet');
            if (sheets.length === 0) return;

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true,
            });

            for (let i = 0; i < sheets.length; i++) {
                const sheet = sheets[i];
                const restoreSvgs = convertSvgsToImages(sheet);

                const canvas = await html2canvas(sheet, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                });

                restoreSvgs();

                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }

            pdf.save('{{ $pdfFilename }}');
        }

        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('download') === 'pdf') {
                setTimeout(() => downloadPDF(), 800);
            }
        });
    </script>
</body>
</html>
