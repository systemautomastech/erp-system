import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate, getCompanySetting, getImagePath } from '@/utils/helpers';
import { SalesOrder } from './types';

interface PrintProps {
    salesOrder: SalesOrder & {
        customer?: any;
        warehouse?: any;
        items?: any[];
    };
    settings?: {
        logo_image?: string;
        show_logo?: string;
        bg_letterhead?: string;
        enable_letterhead?: string;
        template_color?: string;
        default_terms?: string;
        default_notes?: string;
        footer_note?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export default function Print() {
    const { t } = useTranslation();
    const { salesOrder, settings = {} } = usePage<PrintProps>().props;

    const customer = salesOrder.customer || {};
    const items = salesOrder.items || [];

    const showLogo = settings.show_logo !== 'off';
    const logoUrl = showLogo && settings.logo_image ? getImagePath(settings.logo_image) : null;

    const enableLetterhead = settings.enable_letterhead === 'on';
    const bgLetterheadUrl = enableLetterhead && settings.bg_letterhead ? getImagePath(settings.bg_letterhead) : null;

    useEffect(() => {
        const handleAfterPrint = () => {
            window.close();
        };
        window.addEventListener('afterprint', handleAfterPrint);

        const timer = setTimeout(() => {
            window.print();
        }, 300);

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Head title={t('Sales Order — :num', { num: salesOrder.order_number })} />

            <div className="invoice-container bg-white max-w-4xl mx-auto p-8 relative overflow-hidden">
                {/* Background Letterhead Image */}
                {bgLetterheadUrl && (
                    <img
                        src={bgLetterheadUrl}
                        alt="Letterhead Background"
                        className="letterhead-bg-layer absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                    />
                )}

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-1/2">
                            {logoUrl ? (
                                <div className="mb-4">
                                    <img
                                        src={logoUrl}
                                        alt="Company Logo"
                                        className="max-h-16 max-w-[200px] object-contain"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-2xl font-bold mb-4">
                                    {getCompanySetting('company_name') || settings.company_name || 'YOUR COMPANY'}
                                </h1>
                            )}
                            <div className="text-sm space-y-1">
                                {(getCompanySetting('company_address') || settings.company_address) && (
                                    <p>{getCompanySetting('company_address') || settings.company_address}</p>
                                )}
                                {(getCompanySetting('company_city') || getCompanySetting('company_state') || getCompanySetting('company_zipcode')) && (
                                    <p>
                                        {getCompanySetting('company_city')}{getCompanySetting('company_state') && `, ${getCompanySetting('company_state')}`} {getCompanySetting('company_zipcode')}
                                    </p>
                                )}
                                {getCompanySetting('company_country') && <p>{getCompanySetting('company_country')}</p>}
                                {getCompanySetting('company_telephone') && <p>{t('Phone')}: {getCompanySetting('company_telephone')}</p>}
                                {getCompanySetting('company_email') && <p>{t('Email')}: {getCompanySetting('company_email')}</p>}
                                {getCompanySetting('registration_number') && <p>{t('Registration')}: {getCompanySetting('registration_number')}</p>}
                            </div>
                        </div>

                        <div className="text-right w-1/2">
                            <h2 className="text-2xl font-bold mb-2">{t('SALES ORDER')}</h2>
                            <p className="text-lg font-semibold">#{salesOrder.order_number}</p>
                            <div className="text-sm mt-2 space-y-1">
                                <p>{t('Date')}: {formatDate(salesOrder.order_date)}</p>
                                {salesOrder.expected_delivery_date && (
                                    <p>{t('Expected Delivery')}: {formatDate(salesOrder.expected_delivery_date)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer / Bill To & Ship To */}
                    <div className="flex justify-between mb-8">
                        <div className="w-1/2">
                            <h3 className="font-bold mb-3">{t('BILL TO')}</h3>
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">{customer.name || salesOrder.billing_address || '-'}</p>
                                {customer.email && <p>{customer.email}</p>}
                                {customer.mobile_no && <p>{t('Phone')}: {customer.mobile_no}</p>}
                                {salesOrder.billing_address && <p className="whitespace-pre-line">{salesOrder.billing_address}</p>}
                                {(salesOrder.billing_city || salesOrder.billing_state) && (
                                    <p>{[salesOrder.billing_city, salesOrder.billing_state, salesOrder.billing_postal_code].filter(Boolean).join(', ')}</p>
                                )}
                                {salesOrder.billing_country && <p>{salesOrder.billing_country}</p>}
                            </div>
                        </div>

                        <div className="text-right w-1/2">
                            <h3 className="font-bold mb-3">{t('SHIP TO')}</h3>
                            <div className="text-sm space-y-1">
                                {salesOrder.shipping_address ? (
                                    <>
                                        <p className="font-semibold">{customer.name || '-'}</p>
                                        <p className="whitespace-pre-line">{salesOrder.shipping_address}</p>
                                        {(salesOrder.shipping_city || salesOrder.shipping_state) && (
                                            <p>{[salesOrder.shipping_city, salesOrder.shipping_state, salesOrder.shipping_postal_code].filter(Boolean).join(', ')}</p>
                                        )}
                                        {salesOrder.shipping_country && <p>{salesOrder.shipping_country}</p>}
                                    </>
                                ) : (
                                    <p className="text-gray-500">{t('Same as billing address')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left py-3 font-bold">{t('ITEM')}</th>
                                    <th className="text-center py-3 font-bold">{t('QTY')}</th>
                                    <th className="text-right py-3 font-bold">{t('PRICE')}</th>
                                    <th className="text-right py-3 font-bold">{t('DISCOUNT')}</th>
                                    <th className="text-right py-3 font-bold">{t('TAX')}</th>
                                    <th className="text-right py-3 font-bold">{t('TOTAL')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, index: number) => {
                                    const productName = item.product?.name || item.name || '';
                                    const sku = item.product?.sku || item.sku || '';
                                    const desc = item.description || item.product?.description || item.product?.long_description || '';
                                    const lineTotal = (item.quantity || 0) * (item.unit_price || item.price || 0);
                                    const discAmt = item.discount_amount ?? ((lineTotal * (item.discount_percentage || 0)) / 100);
                                    const afterDisc = lineTotal - discAmt;
                                    const taxAmt = item.tax_amount ?? ((afterDisc * (item.tax_percentage || 0)) / 100);
                                    const itemTotal = item.total_amount ?? item.final_price ?? (afterDisc + taxAmt);

                                    return (
                                        <tr key={index} className="page-break-inside-avoid">
                                            <td className="py-4">
                                                <div className="font-semibold">{productName}</div>
                                                {sku && (
                                                    <div className="text-xs text-gray-500">{t('SKU')}: {sku}</div>
                                                )}
                                                {desc && (
                                                    <div
                                                        className="text-xs text-gray-600 mt-1 prose prose-xs max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: desc }}
                                                    />
                                                )}
                                            </td>
                                            <td className="text-center py-4">{item.quantity}</td>
                                            <td className="text-right py-4">{formatCurrency(item.unit_price || item.price)}</td>
                                            <td className="text-right py-4">
                                                {item.discount_type === 'fixed' ? (
                                                    discAmt > 0 ? (
                                                        <div className="text-sm font-medium">-{formatCurrency(discAmt)}</div>
                                                    ) : (
                                                        <div className="text-sm">-</div>
                                                    )
                                                ) : (
                                                    (item.discount_percentage || 0) > 0 ? (
                                                        <>
                                                            <div className="text-sm">{item.discount_percentage}%</div>
                                                            <div className="text-sm font-medium text-gray-500">-{formatCurrency(discAmt)}</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm">0%</div>
                                                    )
                                                )}
                                            </td>
                                            <td className="text-right py-4">
                                                {item.taxes && item.taxes.length > 0 ? (
                                                    <>
                                                        {item.taxes.map((tax: any, taxIndex: number) => (
                                                            <div key={taxIndex} className="text-sm">{tax.tax_name} ({tax.tax_rate}%)</div>
                                                        ))}
                                                        <div className="text-sm font-medium">{formatCurrency(taxAmt)}</div>
                                                    </>
                                                ) : (item.tax_percentage || 0) > 0 ? (
                                                    <>
                                                        <div className="text-sm">{item.tax_percentage}%</div>
                                                        <div className="text-sm font-medium">{formatCurrency(taxAmt)}</div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm">0%</div>
                                                )}
                                            </td>
                                            <td className="text-right py-4 font-semibold">{formatCurrency(itemTotal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Totals Box */}
                    <div className="flex justify-end mb-4 page-break-inside-avoid">
                        <div className="w-80 page-break-inside-avoid">
                            <div className="border border-gray-400 p-4 page-break-inside-avoid">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>{t('Subtotal')}:</span>
                                        <span>{formatCurrency(salesOrder.subtotal ?? 0)}</span>
                                    </div>
                                    {(salesOrder.discount_amount ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span>{t('Discount')}:</span>
                                            <span>-{formatCurrency(salesOrder.discount_amount)}</span>
                                        </div>
                                    )}
                                    {(salesOrder.tax_amount ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span>{t('Tax')}:</span>
                                            <span>{formatCurrency(salesOrder.tax_amount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-400 pt-2 mt-2">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>{t('TOTAL')}:</span>
                                            <span>{formatCurrency(salesOrder.total_amount ?? 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-400 pt-4 text-center">
                        {salesOrder.notes && (
                            <div className="text-sm text-gray-600 mb-2">
                                <span className="font-semibold">{t('Notes')}: </span>
                                <span dangerouslySetInnerHTML={{ __html: salesOrder.notes }} />
                            </div>
                        )}
                        {settings.default_terms && (
                            <p className="font-semibold">{t('PAYMENT TERMS')}: {settings.default_terms}</p>
                        )}
                        <p className="text-sm mt-2">{t('Thank you for your business!')}</p>
                    </div>
                </div>
            </div>

            <style>{`
                body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    font-family: Arial, sans-serif;
                }

                @page {
                    margin: 0.5in;
                    size: A4;
                }

                .invoice-container {
                    max-width: 100%;
                    margin: 0;
                    box-shadow: none;
                }

                .letterhead-bg-layer {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 0;
                    pointer-events: none;
                }

                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                @media print {
                    body {
                        background: white;
                    }

                    .invoice-container {
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}

