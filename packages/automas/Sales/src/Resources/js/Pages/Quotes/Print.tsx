import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js';
import { formatCurrency, formatDate, getCompanySetting } from '@/utils/helpers';
import { useFormFields } from '@/hooks/useFormFields';

interface PrintProps {
    quote: any;
    [key: string]: any;
}

export default function Print() {
    const { t } = useTranslation();
    const { quote } = usePage<PrintProps>().props;
    const [isDownloading, setIsDownloading] = useState(false);
    const [fieldsLoaded, setFieldsLoaded] = useState(false);

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...quote, module: 'Sales', sub_module: 'Quotes', id: quote.id }, () => { }, {}, 'view', t);

    useEffect(() => {
            // Set fields loaded when custom fields are available
            if (customFields && customFields.length >= 0) {
                setFieldsLoaded(true);
            }
        }, [customFields]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('download') === 'pdf') {
            setTimeout(() => downloadPDF(), 2000);
        }
    }, []);

    const downloadPDF = async () => {
        setIsDownloading(true);

        const printContent = document.querySelector('.quote-container');
        if (printContent) {
            const opt = {
                margin: 0.25,
                filename: `sales-quote-${quote.quote_number}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };

            try {
                await html2pdf().set(opt).from(printContent as HTMLElement).save();
                setTimeout(() => window.close(), 1000);
            } catch (error) {
                console.error('PDF generation failed:', error);
            }
        }

        setIsDownloading(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title={t('Sales Quote')} />

            {isDownloading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-lg font-semibold text-gray-700">{t('Generating PDF...')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="quote-container bg-white max-w-4xl mx-auto p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-1/2">
                        <h1 className="text-2xl font-bold mb-4">{getCompanySetting('company_name') || 'YOUR COMPANY'}</h1>
                        <div className="text-sm space-y-1">
                            {getCompanySetting('company_address') && <p>{getCompanySetting('company_address')}</p>}
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
                        <h2 className="text-2xl font-bold mb-2">{t('SALES QUOTE')}</h2>
                        <p className="text-lg font-semibold">#{quote.quote_number}</p>
                        <div className="text-sm mt-2 space-y-1">
                            <p>{t('Date')}: {formatDate(quote.date_quoted)}</p>
                            {quote.expiry_date && <p>{t('Valid Until')}: {formatDate(quote.expiry_date)}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mb-8">
                    <div className="w-1/2">
                        <h3 className="font-bold mb-3">{t('QUOTE TO')}</h3>
                        <div className="text-sm space-y-1">
                            {quote.account && <p className="font-semibold">{quote.account.name}</p>}
                            {quote.billing_contact && <p>{quote.billing_contact.name}</p>}
                            {quote.billing_address && (
                                <>
                                    <p>{quote.billing_address}</p>
                                    <p>{quote.billing_city}, {quote.billing_state} {quote.billing_postal_code}</p>
                                    {quote.billing_country && <p>{quote.billing_country}</p>}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-right w-1/2">
                        <h3 className="font-bold mb-3">{t('SHIP TO')}</h3>
                        <div className="text-sm space-y-1">
                            {quote.shipping_address ? (
                                <>
                                    {quote.shipping_contact && <p className="font-semibold">{quote.shipping_contact.name}</p>}
                                    <p>{quote.shipping_address}</p>
                                    <p>{quote.shipping_city}, {quote.shipping_state} {quote.shipping_postal_code}</p>
                                    {quote.shipping_country && <p>{quote.shipping_country}</p>}
                                </>
                            ) : (
                                <p className="text-gray-500">{t('Same as billing address')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Custom Fields Display */}
                {customFields && customFields.length > 0 && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {customFields.map((field) => (
                                <div key={field.id} className="space-y-1">
                                    <div className="font-semibold text-gray-700">{(field as any).name || (field as any).label || ''}:</div>
                                    <div className="text-gray-900">{field.component}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            {quote.items?.map((item: any, index: number) => {
                                const lineTotal = item.quantity * item.unit_price;
                                const discountAmount = (lineTotal * (item.discount_percentage || 0)) / 100;
                                const afterDiscount = lineTotal - discountAmount;
                                const taxAmount = (afterDiscount * (item.tax_percentage || 0)) / 100;
                                const totalAmount = afterDiscount + taxAmount;

                                return (
                                    <tr key={index} className="page-break-inside-avoid">
                                        <td className="py-4">
                                            <div className="font-semibold">{item.product?.name}</div>
                                            {item.product?.sku && (
                                                <div className="text-xs text-gray-500">{t('SKU')}: {item.product.sku}</div>
                                            )}
                                        </td>
                                        <td className="text-center py-4">{item.quantity}</td>
                                        <td className="text-right py-4">{formatCurrency(item.unit_price)}</td>
                                        <td className="text-right py-4">
                                            {item.discount_percentage > 0 ? (
                                                <>
                                                    <div className="text-sm">{item.discount_percentage}%</div>
                                                    <div className="text-sm font-medium">-{formatCurrency(discountAmount)}</div>
                                                </>
                                            ) : (
                                                <div className="text-sm">0%</div>
                                            )}
                                        </td>
                                        <td className="text-right py-4">
                                            {item.taxes && item.taxes.length > 0 ? (
                                                <>
                                                    {item.taxes.map((tax: any, taxIndex: number) => (
                                                        <div key={taxIndex} className="text-sm">{tax.tax_name} ({tax.tax_rate}%)</div>
                                                    ))}
                                                    <div className="text-sm font-medium">{formatCurrency(taxAmount)}</div>
                                                </>
                                            ) : item.tax_percentage > 0 ? (
                                                <>
                                                    <div className="text-sm">{item.tax_percentage}%</div>
                                                    <div className="text-sm font-medium">{formatCurrency(taxAmount)}</div>
                                                </>
                                            ) : (
                                                <div className="text-sm">0%</div>
                                            )}
                                        </td>
                                        <td className="text-right py-4 font-semibold">{formatCurrency(totalAmount)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mb-4 page-break-inside-avoid">
                    <div className="w-80 page-break-inside-avoid">
                        <div className="border border-gray-400 p-4 page-break-inside-avoid">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>{t('Subtotal')}:</span>
                                    <span>{formatCurrency(quote.subtotal)}</span>
                                </div>
                                {quote.discount_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>{t('Discount')}:</span>
                                        <span>-{formatCurrency(quote.discount_amount)}</span>
                                    </div>
                                )}
                                {quote.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>{t('Tax')}:</span>
                                        <span>{formatCurrency(quote.tax_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-400 pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{t('TOTAL')}:</span>
                                        <span>{formatCurrency(quote.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {quote.notes && (
                    <div className="border-t border-gray-400 pt-4 mb-4">
                        <h3 className="font-bold mb-2">{t('Notes')}:</h3>
                        <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                )}

                <div className="border-t border-gray-400 pt-4 text-center">
                    <p className="text-sm mt-2">{t('Thank you for your business!')}</p>
                    {quote.expiry_date && (
                        <p className="text-sm text-gray-600 mt-2">{t('This quote is valid until')} {formatDate(quote.expiry_date)}</p>
                    )}
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

                .quote-container {
                    max-width: 100%;
                    margin: 0;
                    box-shadow: none;
                }

                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                @media print {
                    body {
                        background: white;
                    }

                    .quote-container {
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}
