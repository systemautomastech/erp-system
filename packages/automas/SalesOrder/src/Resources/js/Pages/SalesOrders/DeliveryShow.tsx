import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatDate } from '@/utils/helpers';
import { Truck, Printer, FileText, Ban, ArrowLeft, Building, User, Calendar, CheckCircle2 } from "lucide-react";
import { SalesOrderDelivery } from './types';

interface DeliveryShowProps {
    delivery: SalesOrderDelivery & {
        sales_order?: any;
        items?: any[];
        creator?: { id: number; name: string };
    };
    settings?: Record<string, any>;
}

export default function DeliveryShow({ delivery, settings }: DeliveryShowProps) {
    const { t } = useTranslation();
    useFlashMessages();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const order = delivery.sales_order || {};
    const customer = order.customer || {};

    const handleCancel = () => {
        router.post(route('salesorder.deliveries.cancel', delivery.id), {}, {
            onSuccess: () => setCancelDialogOpen(false)
        });
    };

    const isCancelled = delivery.status === 'cancelled';

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Orders'), url: route('salesorder.orders.index') },
                { label: order.order_number || `#${order.id}`, url: route('salesorder.orders.show', order.id) },
                { label: delivery.delivery_number || t('Delivery') }
            ]}
            pageTitle={t('Delivery Details')}
        >
            <Head title={t('Delivery — :num', { num: delivery.delivery_number })} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* ─── Header & Actions ─── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${isCancelled ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            <Truck className={`h-6 w-6 ${isCancelled ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {delivery.delivery_number}
                                </h1>
                                <Badge className={isCancelled ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}>
                                    {isCancelled ? t('Cancelled') : t('Delivered')}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('Dispatched on :date by :user', {
                                    date: formatDate(delivery.delivery_date),
                                    user: delivery.creator?.name || t('System')
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(route('salesorder.orders.show', order.id))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            {t('Back to Order')}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('salesorder.deliveries.challan', delivery.id), '_blank')}
                        >
                            <Printer className="h-4 w-4 mr-1.5" />
                            {t('Print Challan')}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('salesorder.deliveries.challan.pdf', delivery.id), '_blank')}
                        >
                            <FileText className="h-4 w-4 mr-1.5" />
                            {t('Download PDF')}
                        </Button>

                        {!isCancelled && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setCancelDialogOpen(true)}
                            >
                                <Ban className="h-4 w-4 mr-1.5" />
                                {t('Cancel Delivery')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* ─── Summary Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Order Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                {t('Sales Order')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Order Number')}:</span>
                                <span className="font-medium text-primary hover:underline cursor-pointer" onClick={() => router.visit(route('salesorder.orders.show', order.id))}>
                                    {order.order_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Order Date')}:</span>
                                <span>{formatDate(order.order_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Commercial Status')}:</span>
                                <span className="capitalize font-medium">{order.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Overall Delivery Status')}:</span>
                                <span className="capitalize font-medium">{order.delivery_status}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer & Destination Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Building className="h-4 w-4 text-primary" />
                                {t('Customer & Destination')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Customer')}:</span>
                                <span className="font-medium">{customer.name || '-'}</span>
                            </div>
                            {customer.email && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Email')}:</span>
                                    <span>{customer.email}</span>
                                </div>
                            )}
                            {customer.mobile_no && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('Phone')}:</span>
                                    <span>{customer.mobile_no}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Shipping Address')}:</span>
                                <span className="text-right max-w-xs text-xs">{order.shipping_address || order.billing_address || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Delivered Items Table ─── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            {t('Delivered Items in this Dispatch')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-y text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4 text-left">#</th>
                                        <th className="py-3 px-4 text-left">{t('Product / Description')}</th>
                                        <th className="py-3 px-4 text-center">{t('Unit')}</th>
                                        <th className="py-3 px-4 text-right">{t('Ordered Qty')}</th>
                                        <th className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">{t('Dispatched Qty')}</th>
                                        <th className="py-3 px-4 text-left">{t('Item Notes')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {delivery.items && delivery.items.length > 0 ? (
                                        delivery.items.map((item: any, idx: number) => {
                                            const orderItem = item.sales_order_item || {};
                                            return (
                                                <tr key={item.id || idx} className="hover:bg-muted/30">
                                                    <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {orderItem.description || `Product #${item.product_id}`}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-muted-foreground">
                                                        {orderItem.unit || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-muted-foreground">
                                                        {orderItem.quantity ?? '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-muted-foreground">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                {t('No items recorded in this delivery.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Notes ─── */}
                {delivery.notes && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">{t('Delivery Notes')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{delivery.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <ConfirmationDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                title={t('Cancel Delivery')}
                message={t('Are you sure you want to cancel delivery :num? This will restore the dispatched quantities back to the order balance and update order delivery status.', { num: delivery.delivery_number })}
                confirmText={t('Yes, Cancel Delivery')}
                cancelText={t('Keep Delivery')}
                onConfirm={handleCancel}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
