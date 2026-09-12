import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatDate, getCompanySetting, getImagePath } from '@/utils/helpers';

interface ChallanProps {
    delivery: {
        id: number;
        delivery_number: string;
        delivery_date: string;
        notes?: string;
        status: string;
        sales_order?: any;
        items?: any[];
        creator?: { id: number; name: string };
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
    quotation?: any;
    [key: string]: any;
}

export default function Challan() {
    const { t } = useTranslation();
    const { delivery, settings = {}, quotation } = usePage<ChallanProps>().props;

    const order = delivery.sales_order || {};
    const customer = order.customer || {};

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

    const totalQuantity = (delivery.items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);

    return (
        <div className="min-h-screen bg-white">
            <Head title={t('Delivery Challan — :num', { num: delivery.delivery_number })} />

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
                            <h2 className="text-2xl font-bold mb-2">{t('DELIVERY CHALLAN')}</h2>
                            <p className="text-lg font-semibold">#{delivery.delivery_number}</p>
                            <div className="text-sm mt-2 space-y-1">
                                <p>{t('Date')}: {formatDate(delivery.delivery_date)}</p>
                                <p>{t('Sales Order')}: #{order.order_number || order.id}</p>
                                {quotation?.quotation_number && (
                                    <p>{t('Quotation Ref')}: {quotation.quotation_number}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer / Deliver To & Order References */}
                    <div className="flex justify-between mb-8">
                        <div className="w-1/2">
                            <h3 className="font-bold mb-3">{t('DELIVER TO / CONSIGNEE')}</h3>
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">{customer.name || '-'}</p>
                                {customer.email && <p>{customer.email}</p>}
                                {customer.mobile_no && <p>{t('Phone')}: {customer.mobile_no}</p>}
                                <p className="whitespace-pre-line">{order.shipping_address || order.billing_address || '-'}</p>
                                {(order.shipping_city || order.shipping_state) && (
                                    <p>{[order.shipping_city, order.shipping_state, order.shipping_postal_code].filter(Boolean).join(', ')}</p>
                                )}
                                {order.shipping_country && <p>{order.shipping_country}</p>}
                            </div>
                        </div>

                        <div className="text-right w-1/2">
                            <h3 className="font-bold mb-3">{t('ORDER REFERENCES')}</h3>
                            <div className="text-sm space-y-1">
                                <p><span className="font-semibold">{t('Order No')}:</span> #{order.order_number || order.id}</p>
                                <p><span className="font-semibold">{t('Order Date')}:</span> {formatDate(order.order_date)}</p>
                                {delivery.creator?.name && (
                                    <p><span className="font-semibold">{t('Dispatched By')}:</span> {delivery.creator.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dispatched Items Table */}
                    <div className="mb-8">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left py-3 font-bold">{t('ITEM')}</th>
                                    <th className="text-center py-3 font-bold">{t('UNIT')}</th>
                                    <th className="text-right py-3 font-bold">{t('QTY DISPATCHED')}</th>
                                    <th className="text-left py-3 font-bold pl-4">{t('REMARKS')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delivery.items && delivery.items.length > 0 ? (
                                    delivery.items.map((item: any, index: number) => {
                                        const orderItem = item.sales_order_item || {};
                                        const productName = orderItem.product?.name || item.product?.name || item.name || '';
                                        const sku = orderItem.product?.sku || item.product?.sku || '';
                                        const desc = orderItem.description || item.description || orderItem.product?.description || '';

                                        return (
                                            <tr key={index} className="page-break-inside-avoid border-b border-gray-200">
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
                                                <td className="text-center py-4">{orderItem.unit || '-'}</td>
                                                <td className="text-right py-4 font-semibold">{item.quantity}</td>
                                                <td className="text-left py-4 pl-4 text-xs text-gray-500">{item.notes || '-'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-gray-400">
                                            {t('No items listed in this challan.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Total Quantity Box */}
                    <div className="flex justify-end mb-4 page-break-inside-avoid">
                        <div className="w-80 page-break-inside-avoid">
                            <div className="border border-gray-400 p-4 page-break-inside-avoid">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>{t('TOTAL QTY')}:</span>
                                    <span>{totalQuantity}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-400 pt-4 text-center">
                        {delivery.notes && (
                            <div className="text-sm text-gray-600 mb-2">
                                <span className="font-semibold">{t('Notes')}: </span>
                                <span dangerouslySetInnerHTML={{ __html: delivery.notes }} />
                            </div>
                        )}
                        {settings.default_terms && (
                            <p className="font-semibold">{t('TERMS & CONDITIONS')}: {settings.default_terms}</p>
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
