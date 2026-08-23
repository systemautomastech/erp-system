
@php
    $companySettings = getCompanyAllSetting($invoice->created_by);
    $creatorId = $invoice->created_by ?? (function_exists('creatorId') ? creatorId() : auth()->id());
    $purchaseInvoiceSetting = $purchaseInvoiceSetting ?? \App\Models\PurchaseInvoiceSetup::getSettings($creatorId);

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
    $showLogo = ($purchaseInvoiceSetting['purchase_invoice_show_logo'] ?? 'on') !== 'off';
    $customLogo = $purchaseInvoiceSetting['purchase_invoice_logo'] ?? '';
    $companyLogo = $companySettings['company_logo'] ?? $companySettings['logo_dark'] ?? '';
    $logoToUse = $customLogo ?: $companyLogo;
    $logoUrl = ($showLogo && $logoToUse) ? $getImagePath($logoToUse) : '';

    $enableLetterhead = ($purchaseInvoiceSetting['purchase_invoice_enable_letterhead'] ?? 'off') === 'on';
    $bgLetterhead = $purchaseInvoiceSetting['purchase_invoice_bg_letterhead'] ?? '';
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
    <title>{{ __('Purchase Invoice') }} - #{{ $invoice->invoice_number }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        html,
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
            padding: 16mm 14mm 14mm 14mm;
            margin: 0 auto;
            background-color: #ffffff;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
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

        @media print {

            html,
            body {
                background: #ffffff !important;
            }

            .a4-page {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 16mm 14mm 14mm 14mm !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
            }
        }
    </style>
</head>

<body>

    <div class="a4-page">
        @if($bgLetterheadUrl)
            <img src="{{ $bgLetterheadUrl }}" alt="Letterhead Background" class="letterhead-bg-layer">
        @endif

        <div class="a4-content">
            <div>
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
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
                        <h2 class="text-2xl font-bold mb-1 text-gray-900">{{ __('PURCHASE INVOICE') }}</h2>
                        <p class="text-base font-semibold text-gray-800">#{{ $invoice->invoice_number }}</p>
                        <div class="text-xs mt-2 space-y-0.5 text-gray-600">
                            <p>{{ __('Date') }}: {{ $formatDate($invoice->invoice_date) }}</p>
                            <p>{{ __('Due') }}: {{ $formatDate($invoice->due_date) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Vendor Information -->
                <div class="flex justify-between mb-6 pt-3 border-t border-gray-200">
                    <div class="w-1/2">
                        <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">{{ __('VENDOR') }}
                        </h3>
                        <div class="text-xs space-y-0.5 text-gray-700">
                            <p class="font-semibold text-gray-900">{{ $invoice->vendor->name ?? '' }}</p>
                            <p>{{ $invoice->vendor->email ?? '' }}</p>
                            @if(!empty($invoice->vendorDetails?->billing_address))
                                <p>{{ $invoice->vendorDetails->billing_address['name'] ?? '' }}</p>
                                <p>{{ $invoice->vendorDetails->billing_address['address_line_1'] ?? '' }}</p>
                                <p>
                                    {{ $invoice->vendorDetails->billing_address['city'] ?? '' }}{{ !empty($invoice->vendorDetails->billing_address['state']) ? ', ' . $invoice->vendorDetails->billing_address['state'] : '' }}
                                    {{ $invoice->vendorDetails->billing_address['zip_code'] ?? '' }}
                                </p>
                            @endif
                        </div>
                    </div>
                    <div class="text-right w-1/2">
                        <h3 class="font-bold text-xs uppercase mb-1.5 text-gray-900 tracking-wider">{{ __('SHIP TO') }}
                        </h3>
                        <div class="text-xs space-y-0.5 text-gray-700">
                            @if(!empty($invoice->vendorDetails?->shipping_address))
                                <p class="font-semibold text-gray-900">
                                    {{ $invoice->vendorDetails->shipping_address['name'] ?? '' }}</p>
                                <p>{{ $invoice->vendorDetails->shipping_address['address_line_1'] ?? '' }}</p>
                                <p>
                                    {{ $invoice->vendorDetails->shipping_address['city'] ?? '' }}{{ !empty($invoice->vendorDetails->shipping_address['state']) ? ', ' . $invoice->vendorDetails->shipping_address['state'] : '' }}
                                    {{ $invoice->vendorDetails->shipping_address['zip_code'] ?? '' }}
                                </p>
                            @else
                                <p class="text-gray-500">{{ __('Same as vendor address') }}</p>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Items Table with Integrated Summary -->
                <div class="mb-4">
                    <table style="width: 100%; font-size: 10px; table-layout: fixed; border-collapse: collapse; border: 1px solid #94a3b8;">
                        <thead>
                            <tr style="background-color: #e2e8f0; color: #0f172a; font-weight: 700;">
                                <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; font-size: 9.5px; width: 38%;">{{ __('ITEM / DESCRIPTION') }}</th>
                                <th style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; font-size: 9.5px; width: 10%;">{{ __('QTY') }}</th>
                                <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 13%;">{{ __('PRICE') }}</th>
                                <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 12%;">{{ __('DISCOUNT') }}</th>
                                <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 13%;">{{ __('TAX') }}</th>
                                <th style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; font-size: 9.5px; width: 14%;">{{ __('TOTAL') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($invoice->items ?? [] as $index => $item)
                                <tr class="page-break-inside-avoid">
                                    <td style="padding: 6px 8px; border: 1px solid #94a3b8; vertical-align: top;">
                                        <div style="font-weight: 600; color: #0f172a; line-height: 1.25; font-size: 10.5px;">{{ $item->product->name ?? '' }}</div>
                                        @if(!empty($item->product?->sku))
                                            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">{{ __('SKU') }}: {{ $item->product->sku }}</div>
                                        @endif
                                    </td>
                                    <td style="padding: 6px 4px; border: 1px solid #94a3b8; text-align: center; vertical-align: top; color: #1e293b; font-weight: 500;">{{ $item->quantity }}</td>
                                    <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">{{ $formatCurrency($item->unit_price) }}</td>
                                    <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                        @if($item->discount_percentage > 0)
                                            <div>{{ $item->discount_percentage }}%</div>
                                            <div style="font-size: 9px; color: #dc2626; font-weight: 500;">-{{ $formatCurrency($item->discount_amount) }}</div>
                                        @else
                                            <span style="color: #94a3b8;">-</span>
                                        @endif
                                    </td>
                                    <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; color: #1e293b;">
                                        @if(!empty($item->taxes) && count($item->taxes) > 0)
                                            @foreach($item->taxes as $tax)
                                                <div style="line-height: 1.2; color: #475569;">{{ $tax->tax_name }} ({{ $tax->tax_rate }}%)</div>
                                            @endforeach
                                            <div style="font-size: 9px; color: #1e293b; font-weight: 600; margin-top: 2px;">{{ $formatCurrency($item->tax_amount) }}</div>
                                        @elseif($item->tax_percentage > 0)
                                            <div style="color: #475569;">{{ $item->tax_percentage }}%</div>
                                            <div style="font-size: 9px; color: #1e293b; font-weight: 600; margin-top: 2px;">{{ $formatCurrency($item->tax_amount) }}</div>
                                        @else
                                            <span style="color: #94a3b8;">-</span>
                                        @endif
                                    </td>
                                    <td style="padding: 6px 8px; border: 1px solid #94a3b8; text-align: right; vertical-align: top; font-weight: 700; color: #0f172a;">
                                        {{ $formatCurrency($item->total_amount) }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot>
                            <tr class="page-break-inside-avoid">
                                <td colspan="4" style="border: 1px solid #94a3b8;"></td>
                                <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Subtotal') }}:</td>
                                <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->subtotal) }}</td>
                            </tr>
                            @if($invoice->discount_amount > 0)
                                <tr class="page-break-inside-avoid">
                                    <td colspan="4" style="border: 1px solid #94a3b8;"></td>
                                    <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Discount') }}:</td>
                                    <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #dc2626; border: 1px solid #94a3b8;">-{{ $formatCurrency($invoice->discount_amount) }}</td>
                                </tr>
                            @endif
                            @if($invoice->tax_amount > 0)
                                <tr class="page-break-inside-avoid">
                                    <td colspan="4" style="border: 1px solid #94a3b8;"></td>
                                    <td style="padding: 5px 8px; font-weight: 600; color: #475569; border: 1px solid #94a3b8; text-align: right;">{{ __('Tax') }}:</td>
                                    <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #1e293b; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->tax_amount) }}</td>
                                </tr>
                            @endif
                            <tr class="page-break-inside-avoid" style="font-weight: 700;">
                                <td colspan="4" style="border: 1px solid #94a3b8;"></td>
                                <td style="padding: 6px 8px; font-size: 11px; color: #0f172a; border: 1px solid #94a3b8; text-align: right;">{{ __('TOTAL') }}:</td>
                                <td style="padding: 6px 8px; font-size: 11px; text-align: right; color: #0f172a; border: 1px solid #94a3b8;">{{ $formatCurrency($invoice->total_amount) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
              
            </div>
              <!-- Footer -->
                <div class="border-t border-gray-300 pt-3 text-center text-xs text-gray-600 page-break-inside-avoid" style="margin-bottom: 16mm;">
                    @if($invoice->payment_terms)
                        <p class="font-semibold">{{ __('PAYMENT TERMS') }}
                        {!! $invoice->payment_terms !!}
                        </p>
                    @endif
                    <p class="text-[11px] mt-1">{{ __('Thank you for your business!') }}</p>
                </div>
        </div>
    </div>

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
                        window.location.href = "{{ route('purchase-invoices.download-pdf', $invoice->id) }}";
                        setTimeout(() => {
                            if (loader) loader.classList.add('hidden');
                        }, 2000);
                    }, 800);
                } else if (urlParams.get('print') === '1' || urlParams.has('print')) {
                    setTimeout(() => window.print(), 400);
                }
            });
        </script>
    @endif
</body>

</html>