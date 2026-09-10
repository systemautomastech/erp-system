import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Package, AlertCircle } from "lucide-react";
import { SalesOrder, SalesOrderItem } from './types';

interface DeliverProps {
    salesOrder: SalesOrder;
    items: Array<SalesOrderItem & {
        remaining_quantity: number;
        delivered_quantity: number;
    }>;
}

export default function Deliver({ salesOrder, items }: DeliverProps) {
    const { t } = useTranslation();
    useFlashMessages();

    const initialItems = items.map(item => ({
        sales_order_item_id: item.id!,
        quantity:            item.remaining_quantity,
        notes:               '',
        max:                 item.remaining_quantity,
        product_id:          item.product_id,
        unit:                item.unit,
        description:         item.description,
        ordered:             item.quantity,
        delivered:           item.delivered_quantity,
    }));

    const [deliveryItems, setDeliveryItems] = useState(initialItems);

    const { data, setData, post, processing, errors } = useForm({
        delivery_date: new Date().toISOString().split('T')[0],
        notes:         '',
        items:         initialItems.map(i => ({
            sales_order_item_id: i.sales_order_item_id,
            quantity:            i.quantity,
            notes:               i.notes,
        })),
    });

    const updateItemQuantity = (index: number, qty: number) => {
        const clamped = Math.min(Math.max(0, qty), deliveryItems[index].max);
        const updated = [...deliveryItems];
        updated[index] = { ...updated[index], quantity: clamped };
        setDeliveryItems(updated);
        setData('items', updated.map(i => ({
            sales_order_item_id: i.sales_order_item_id,
            quantity:            i.quantity,
            notes:               i.notes,
        })));
    };

    const updateItemNotes = (index: number, notes: string) => {
        const updated = [...deliveryItems];
        updated[index] = { ...updated[index], notes };
        setDeliveryItems(updated);
        setData('items', updated.map(i => ({
            sales_order_item_id: i.sales_order_item_id,
            quantity:            i.quantity,
            notes:               i.notes,
        })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('salesorder.orders.deliveries.store', salesOrder.id));
    };

    const totalDelivering = deliveryItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <AuthenticatedLayout>
            <Head title={t('Create Delivery — :num', { num: salesOrder.order_number })} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {t('Create Delivery')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('Sales Order')}: <span className="font-medium text-gray-700 dark:text-gray-300">{salesOrder.order_number}</span>
                            {salesOrder.customer && (
                                <> &mdash; {salesOrder.customer.name}</>
                            )}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Delivery Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('Delivery Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="delivery_date">{t('Delivery Date')} <span className="text-red-500">*</span></Label>
                                <Input
                                    id="delivery_date"
                                    type="date"
                                    value={data.delivery_date}
                                    onChange={e => setData('delivery_date', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {errors.delivery_date && <p className="text-sm text-red-500 mt-1">{errors.delivery_date}</p>}
                            </div>
                            <div>
                                <Label htmlFor="notes">{t('Delivery Notes')}</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder={t('Optional delivery notes...')}
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="h-4 w-4" />
                                {t('Items to Deliver')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                                            <th className="pb-3 pr-4">{t('Item')}</th>
                                            <th className="pb-3 pr-4 text-center">{t('Ordered')}</th>
                                            <th className="pb-3 pr-4 text-center">{t('Already Delivered')}</th>
                                            <th className="pb-3 pr-4 text-center">{t('Remaining')}</th>
                                            <th className="pb-3 pr-4 text-center">{t('Deliver Now')}</th>
                                            <th className="pb-3">{t('Notes')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {deliveryItems.map((item, index) => (
                                            <tr key={item.sales_order_item_id} className="py-2">
                                                <td className="py-3 pr-4">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                        {item.description || `Product #${item.product_id ?? '—'}`}
                                                    </div>
                                                    {item.unit && <div className="text-xs text-gray-400">{item.unit}</div>}
                                                </td>
                                                <td className="py-3 pr-4 text-center text-gray-600 dark:text-gray-400">
                                                    {item.ordered}
                                                </td>
                                                <td className="py-3 pr-4 text-center text-orange-600 dark:text-orange-400 font-medium">
                                                    {item.delivered}
                                                </td>
                                                <td className="py-3 pr-4 text-center text-blue-600 dark:text-blue-400 font-semibold">
                                                    {item.max}
                                                </td>
                                                <td className="py-3 pr-4 text-center">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={item.max}
                                                        value={item.quantity}
                                                        onChange={e => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                                                        className="w-24 text-center mx-auto"
                                                    />
                                                </td>
                                                <td className="py-3">
                                                    <Input
                                                        value={item.notes}
                                                        onChange={e => updateItemNotes(index, e.target.value)}
                                                        placeholder={t('Optional...')}
                                                        className="w-full"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            {totalDelivering === 0 && (
                                <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm">{t('Please enter at least one item quantity to deliver.')}</p>
                                </div>
                            )}

                            {errors.items && (
                                <p className="text-sm text-red-500 mt-2">{errors.items}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || totalDelivering === 0}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Truck className="h-4 w-4 mr-2" />
                            {processing ? t('Creating...') : t('Create Delivery Challan')}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
