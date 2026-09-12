import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency, getImagePath } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { SalesOrder } from './types';

interface PrintProps {
    salesOrder: SalesOrder & {
        customer?: any;
        warehouse?: any;
        items?: any[];
    };
    settings?: Record<string, any>;
    autoPrint?: boolean;
}

export default function Print({ salesOrder, settings = {}, autoPrint = false }: PrintProps) {
    const { t } = useTranslation();
    const customer = salesOrder.customer || {};
    const items = salesOrder.items || [];
    const brandColor = settings.template_color || '#2563EB';

    useEffect(() => {
        if (autoPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
            <Head title={t('Sales Order — :num', { num: salesOrder.order_number })} />

            {/* Print Action Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="bg-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('Back')}
                </Button>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        {t('Print Sales Order')}
                    </Button>
                </div>
            </div>

            {/* Print Sheet (A4 size format) */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-10 shadow-sm print:shadow-none print:border-none print:p-8 print:max-w-none">
                {/* ─── Header ─── */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                    <div className="space-y-1">
                        {settings.show_logo !== 'off' && settings.logo_image ? (
                            <img
                                src={getImagePath(settings.logo_image)}
                                alt="Company Logo"
                                className="h-14 max-w-[200px] object-contain mb-2"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold tracking-tight" style={{ color: brandColor }}>
                                {settings.company_name || 'AutomasERP'}
                            </h2>
                        )}
                        <p className="text-xs text-slate-500 max-w-xs">
                            {settings.company_address || ''}
                        </p>
                    </div>

                    <div className="text-right space-y-1">
                        <span
                            className="inline-block px-3 py-1 text-sm font-bold uppercase tracking-wider rounded text-white"
                            style={{ backgroundColor: brandColor }}
                        >
                            {t('SALES ORDER')}
                        </span>
                        <div className="pt-2 text-sm">
                            <span className="font-semibold text-slate-700">{t('Order No')}: </span>
                            <span className="font-bold text-slate-900">#{salesOrder.order_number}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">{t('Date')}: </span>
                            <span className="text-slate-700">{formatDate(salesOrder.order_date)}</span>
                        </div>
                        {salesOrder.expected_delivery_date && (
                            <div className="text-sm">
                                <span className="text-slate-500">{t('Expected Delivery')}: </span>
                                <span className="text-slate-700">{formatDate(salesOrder.expected_delivery_date)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Customer & Addresses ─── */}
                <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-sm">
                    {/* Bill To */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            {t('CUSTOMER / BILL TO')}
                        </h4>
                        <p className="font-bold text-slate-800 text-base">{customer.name || '-'}</p>
                        {customer.mobile_no && (
                            <p className="text-slate-600">{t('Phone')}: {customer.mobile_no}</p>
                        )}
                        {customer.email && (
                            <p className="text-slate-600">{t('Email')}: {customer.email}</p>
                        )}
                        <div className="pt-1 text-slate-600 text-xs leading-relaxed">
                            <p className="font-semibold text-slate-700">{t('Billing Address')}:</p>
                            <p>{salesOrder.billing_address || '-'}</p>
                            {(salesOrder.billing_city || salesOrder.billing_state) && (
                                <p>{[salesOrder.billing_city, salesOrder.billing_state, salesOrder.billing_postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {salesOrder.billing_country && <p>{salesOrder.billing_country}</p>}
                        </div>
                    </div>

                    {/* Ship To */}
                    <div className="space-y-1 pl-6 border-l border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            {t('SHIP TO')}
                        </h4>
                        <p className="font-bold text-slate-800 text-base">{customer.name || '-'}</p>
                        <div className="pt-1 text-slate-600 text-xs leading-relaxed">
                            <p className="font-semibold text-slate-700">{t('Shipping Address')}:</p>
                            <p>{salesOrder.shipping_address || salesOrder.billing_address || t('Same as billing address')}</p>
                            {(salesOrder.shipping_city || salesOrder.shipping_state) && (
                                <p>{[salesOrder.shipping_city, salesOrder.shipping_state, salesOrder.shipping_postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {salesOrder.shipping_country && <p>{salesOrder.shipping_country}</p>}
                        </div>
                    </div>
                </div>

                {/* ─── Order Items Table ─── */}
                <div className="py-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-xs uppercase font-bold text-slate-800">
                                <th className="py-2.5 px-3 text-left w-10">#</th>
                                <th className="py-2.5 px-3 text-left">{t('Item & Description')}</th>
                                <th className="py-2.5 px-3 text-right w-16">{t('Qty')}</th>
                                <th className="py-2.5 px-3 text-right w-24">{t('Unit Price')}</th>
                                <th className="py-2.5 px-3 text-right w-20">{t('Disc %')}</th>
                                <th className="py-2.5 px-3 text-right w-28">{t('Total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.length > 0 ? (
                                items.map((item: any, idx: number) => {
                                    const lineTotal = (item.quantity || 0) * (item.unit_price || item.price || 0);
                                    const disc = (lineTotal * (item.discount_percentage || 0)) / 100;
                                    const afterDisc = lineTotal - disc;
                                    const tax = (afterDisc * (item.tax_percentage || 0)) / 100;
                                    const total = item.final_price ?? (afterDisc + tax);

                                    return (
                                        <tr key={item.id || idx}>
                                            <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                                            <td className="py-3 px-3">
                                                <p className="font-semibold text-slate-800">
                                                    {item.description || `Item #${item.product_id || item.id}`}
                                                </p>
                                                {item.unit && (
                                                    <span className="text-xs text-slate-400">{t('Unit')}: {item.unit}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right font-medium text-slate-800">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 px-3 text-right text-slate-600">
                                                {formatCurrency(item.unit_price || item.price)}
                                            </td>
                                            <td className="py-3 px-3 text-right text-slate-600">
                                                {item.discount_percentage ? `${item.discount_percentage}%` : '-'}
                                            </td>
                                            <td className="py-3 px-3 text-right font-semibold text-slate-900">
                                                {formatCurrency(total)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-slate-400">
                                        {t('No items in this order.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Totals & Notes ─── */}
                <div className="grid grid-cols-2 gap-8 py-4 border-t border-slate-200">
                    <div className="text-xs text-slate-600 space-y-3">
                        {salesOrder.notes && (
                            <div>
                                <span className="font-bold text-slate-700">{t('Order Notes')}:</span>
                                <p className="mt-1 whitespace-pre-wrap">{salesOrder.notes}</p>
                            </div>
                        )}
                        {settings.default_terms && (
                            <div>
                                <span className="font-bold text-slate-700">{t('Terms & Conditions')}:</span>
                                <p className="mt-1 whitespace-pre-wrap">{settings.default_terms}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">{t('Subtotal')}:</span>
                            <span className="font-medium text-slate-800">{formatCurrency(salesOrder.subtotal ?? 0)}</span>
                        </div>
                        {(salesOrder.discount_amount ?? 0) > 0 && (
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">{t('Discount')}:</span>
                                <span className="font-medium text-red-600">-{formatCurrency(salesOrder.discount_amount)}</span>
                            </div>
                        )}
                        {(salesOrder.tax_amount ?? 0) > 0 && (
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">{t('Tax')}:</span>
                                <span className="font-medium text-slate-800">{formatCurrency(salesOrder.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 border-t-2 border-slate-800 text-base font-bold text-slate-900">
                            <span>{t('Total Amount')}:</span>
                            <span style={{ color: brandColor }}>{formatCurrency(salesOrder.total_amount ?? 0)}</span>
                        </div>
                    </div>
                </div>

                {/* ─── Signatures Block ─── */}
                <div className="grid grid-cols-2 gap-16 pt-16 mt-8 border-t border-slate-200 text-center text-xs text-slate-600">
                    <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="font-bold text-slate-800">{customer.name || t('Customer')}</p>
                        <p className="text-slate-400">{t('Customer Acceptance & Signature')}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="font-bold text-slate-800">{settings.company_name || 'AutomasERP'}</p>
                        <p className="text-slate-400">{t('Authorized Signature')}</p>
                    </div>
                </div>

                {/* Footer Note */}
                {settings.footer_note && (
                    <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
                        {settings.footer_note}
                    </div>
                )}
            </div>
        </div>
    );
}
