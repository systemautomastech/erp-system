import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { formatDate, getImagePath } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

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
    settings?: Record<string, any>;
    quotation?: any;
    autoPrint?: boolean;
}

export default function Challan({ delivery, settings = {}, quotation, autoPrint = false }: ChallanProps) {
    const { t } = useTranslation();
    const order = delivery.sales_order || {};
    const customer = order.customer || {};

    useEffect(() => {
        if (autoPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);

    const totalQuantity = (delivery.items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
    const brandColor = settings.template_color || '#2563EB';

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
            <Head title={t('Delivery Challan — :num', { num: delivery.delivery_number })} />

            {/* Print Action Bar (Hidden when printing) */}
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
                        {t('Print Challan')}
                    </Button>
                </div>
            </div>

            {/* Challan Sheet (A4 size format) */}
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
                            {t('DELIVERY CHALLAN')}
                        </span>
                        <div className="pt-2 text-sm">
                            <span className="font-semibold text-slate-700">{t('Challan No')}: </span>
                            <span className="font-bold text-slate-900">{delivery.delivery_number}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-slate-500">{t('Date')}: </span>
                            <span className="text-slate-700">{formatDate(delivery.delivery_date)}</span>
                        </div>
                    </div>
                </div>

                {/* ─── Meta & Addresses ─── */}
                <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-sm">
                    {/* Consignee / Delivery To */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            {t('DELIVER TO / CONSIGNEE')}
                        </h4>
                        <p className="font-bold text-slate-800 text-base">{customer.name || '-'}</p>
                        {customer.mobile_no && (
                            <p className="text-slate-600">{t('Phone')}: {customer.mobile_no}</p>
                        )}
                        {customer.email && (
                            <p className="text-slate-600">{t('Email')}: {customer.email}</p>
                        )}
                        <div className="pt-1 text-slate-600 text-xs leading-relaxed">
                            <p className="font-semibold text-slate-700">{t('Shipping Address')}:</p>
                            <p>{order.shipping_address || order.billing_address || t('Same as billing address')}</p>
                            {(order.shipping_city || order.shipping_state) && (
                                <p>{[order.shipping_city, order.shipping_state, order.shipping_postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {order.shipping_country && <p>{order.shipping_country}</p>}
                        </div>
                    </div>

                    {/* Order Reference Details */}
                    <div className="space-y-1.5 pl-6 border-l border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            {t('ORDER REFERENCES')}
                        </h4>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">{t('Sales Order No')}:</span>
                            <span className="font-semibold text-slate-800">{order.order_number || `#${order.id}`}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">{t('Order Date')}:</span>
                            <span className="text-slate-700">{formatDate(order.order_date)}</span>
                        </div>
                        {quotation?.quotation_number && (
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">{t('Quotation Ref')}:</span>
                                <span className="text-slate-700">{quotation.quotation_number}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">{t('Dispatched By')}:</span>
                            <span className="text-slate-700">{delivery.creator?.name || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* ─── Dispatched Items Table ─── */}
                <div className="py-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-xs uppercase font-bold text-slate-800">
                                <th className="py-2.5 px-3 text-left w-12">#</th>
                                <th className="py-2.5 px-3 text-left">{t('Description of Goods')}</th>
                                <th className="py-2.5 px-3 text-center w-24">{t('Unit')}</th>
                                <th className="py-2.5 px-3 text-right w-32">{t('Qty Dispatched')}</th>
                                <th className="py-2.5 px-3 text-left w-40">{t('Remarks')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {delivery.items && delivery.items.length > 0 ? (
                                delivery.items.map((item: any, idx: number) => {
                                    const orderItem = item.sales_order_item || {};
                                    return (
                                        <tr key={item.id || idx}>
                                            <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                                            <td className="py-3 px-3">
                                                <p className="font-semibold text-slate-800">
                                                    {orderItem.description || `Item #${item.product_id || item.id}`}
                                                </p>
                                            </td>
                                            <td className="py-3 px-3 text-center text-slate-600">
                                                {orderItem.unit || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-slate-900 text-base">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 px-3 text-xs text-slate-500">
                                                {item.notes || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-400">
                                        {t('No items listed in this challan.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-800 font-bold text-slate-900">
                                <td colSpan={3} className="py-3 px-3 text-right uppercase text-xs">
                                    {t('Total Quantity Dispatched')}:
                                </td>
                                <td className="py-3 px-3 text-right text-base">
                                    {totalQuantity}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* ─── Notes / Terms ─── */}
                <div className="py-4 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                    {delivery.notes && (
                        <div>
                            <span className="font-bold text-slate-700">{t('Special Instructions')}: </span>
                            <span>{delivery.notes}</span>
                        </div>
                    )}
                    {settings.default_terms && (
                        <div>
                            <span className="font-bold text-slate-700">{t('Terms & Conditions')}: </span>
                            <span className="whitespace-pre-wrap">{settings.default_terms}</span>
                        </div>
                    )}
                </div>

                {/* ─── Signatures Block ─── */}
                <div className="grid grid-cols-3 gap-8 pt-16 mt-8 border-t border-slate-200 text-center text-xs text-slate-600">
                    <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="font-bold text-slate-800">{delivery.creator?.name || t('Warehouse Officer')}</p>
                        <p className="text-slate-400">{t('Prepared & Dispatched By')}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="font-bold text-slate-800">&nbsp;</p>
                        <p className="text-slate-400">{t('Delivered By / Transporter')}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="font-bold text-slate-800">&nbsp;</p>
                        <p className="text-slate-400">{t('Received in Good Condition By')}</p>
                        <p className="text-[10px] text-slate-400">{t('(Signature & Stamp)')}</p>
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
