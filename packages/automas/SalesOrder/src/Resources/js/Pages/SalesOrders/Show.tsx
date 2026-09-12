import { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatCurrency } from '@/utils/helpers';
import { FileText, Users, UserCheck, Lock, RotateCcw, ArrowRight, Truck, AlertCircle, Printer, Edit, CheckCircle, Package } from 'lucide-react';
import { useFormFields } from '@/hooks/useFormFields';

interface ShowSalesOrderProps {
    salesOrder: any;
    orderItems?: any[];
    quotation?: any;
    auth: any;
    userGroups?: Array<{ id: number; name: string; users_count: number }>;
    deliveries?: any[];
    canConfirm?: boolean;
    canCancel?: boolean;
    canDeliver?: boolean;
    canAssignGroup?: boolean;
    canAcquire?: boolean;
    canRelease?: boolean;
    canReassign?: boolean;
}

// ─── Assignment Status Badge ──────────────────────────────────────────────────

function AssignmentBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    if (status === 'acquired') {
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Lock className="w-3 h-3 mr-1" />{t('Acquired')}</Badge>;
    }
    if (status === 'group_assigned') {
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Users className="w-3 h-3 mr-1" />{t('Group Assigned')}</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />{t('Unassigned')}</Badge>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Show() {
    const { t } = useTranslation();
    const {
        salesOrder,
        orderItems = [],
        quotation,
        auth,
        userGroups = [],
        deliveries = [],
        canConfirm,
        canCancel,
        canDeliver,
        canAssignGroup,
        canAcquire,
        canRelease,
        canReassign,
    } = usePage<ShowSalesOrderProps>().props;

    const [assignGroupDialog, setAssignGroupDialog] = useState(false);
    const [reassignDialog, setReassignDialog] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...salesOrder, module: 'Sales', sub_module: 'Sales Orders', id: salesOrder.id }, () => { }, {}, 'view', t);

    useFlashMessages();

    const handleAssignGroup = () => {
        if (!selectedGroupId) return;
        router.post(route('salesorder.orders.assign-group', salesOrder.id), { assigned_group_id: parseInt(selectedGroupId) }, {
            onSuccess: () => { setAssignGroupDialog(false); setSelectedGroupId(''); }
        });
    };

    const handleReassign = () => {
        if (!selectedGroupId) return;
        router.post(route('salesorder.orders.reassign', salesOrder.id), { assigned_group_id: parseInt(selectedGroupId) }, {
            onSuccess: () => { setReassignDialog(false); setSelectedGroupId(''); }
        });
    };

    const handleAcquire = () => {
        router.post(route('salesorder.orders.acquire', salesOrder.id));
    };

    const handleRelease = () => {
        router.post(route('salesorder.orders.release', salesOrder.id));
    };

    const totalOrdered = orderItems?.reduce((total: number, item: any) => total + (Number(item.quantity) || 0), 0) || 0;
    const totalDelivered = orderItems?.reduce((total: number, item: any) => total + (Number(item.delivered_quantity) || 0), 0) || 0;
    const deliveryPercentage = totalOrdered > 0 ? Math.min(100, Math.round((totalDelivered / totalOrdered) * 100)) : 0;

    const handleConfirm = () => {
        router.post(route('salesorder.orders.confirm', salesOrder.id));
    };

    const handleCancelOrder = () => {
        router.post(route('salesorder.orders.cancel', salesOrder.id));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Orders'), url: route('salesorder.orders.index') },
                { label: salesOrder.order_number || t('Details') }
            ]}
            pageTitle={t('Order Details')}
        >
            <Head title={t('Sales Order — :num', { num: salesOrder.order_number })} />

            <div className="space-y-6">
                {/* ─── Action Bar ─── */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(route('salesorder.orders.index'))}
                        >
                            <ArrowRight className="h-4 w-4 mr-1.5 rotate-180" />
                            {t('Back to List')}
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('salesorder.orders.print', salesOrder.id), '_blank')}
                        >
                            <Printer className="h-4 w-4 mr-1.5" />
                            {t('Print')}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('salesorder.orders.pdf', salesOrder.id), '_blank')}
                        >
                            <FileText className="h-4 w-4 mr-1.5" />
                            {t('PDF')}
                        </Button>

                        {auth.user?.permissions?.includes('edit-sales-orders') && salesOrder.status !== 'cancelled' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('salesorder.orders.edit', salesOrder.id))}
                            >
                                <Edit className="h-4 w-4 mr-1.5" />
                                {t('Edit')}
                            </Button>
                        )}

                        {canAcquire && (
                            <Button
                                size="sm"
                                onClick={handleAcquire}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Lock className="h-4 w-4 mr-1.5" />
                                {t('Acquire Order')}
                            </Button>
                        )}

                        {canDeliver && (
                            <Button
                                size="sm"
                                onClick={() => router.visit(route('salesorder.orders.deliveries.create', salesOrder.id))}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Truck className="h-4 w-4 mr-1.5" />
                                {t('Create Delivery Challan')}
                            </Button>
                        )}

                        {canConfirm && (
                            <Button
                                size="sm"
                                onClick={handleConfirm}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                {t('Confirm Order')}
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleCancelOrder}
                            >
                                {t('Cancel Order')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* ─── Order Header Card ─────────────────────────────────────────── */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold tracking-tight">#{salesOrder.order_number}</h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                        salesOrder.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                        salesOrder.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        salesOrder.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {salesOrder.status}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                        salesOrder.delivery_status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        salesOrder.delivery_status === 'partial' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                        'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                        <Truck className="h-3 w-3 inline mr-1" />
                                        {t(salesOrder.delivery_status || 'pending')}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{salesOrder.name}</p>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {formatCurrency(salesOrder.total_amount ?? 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">{t('Total Order Value')}</div>
                            </div>
                        </div>

                        {/* ─── Delivery Progress Bar ─── */}
                        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5 text-primary" />
                                    {t('Fulfillment & Delivery Progress')}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                    {deliveryPercentage}% ({totalDelivered} / {totalOrdered} {t('items dispatched')})
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                        deliveryPercentage >= 100 ? 'bg-emerald-600' : deliveryPercentage > 0 ? 'bg-blue-600' : 'bg-slate-300'
                                    }`}
                                    style={{ width: `${deliveryPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div>
                                    <h3 className="font-semibold mb-2">{t('CUSTOMER')}</h3>
                                    <div className="text-sm space-y-1">
                                        <div className="font-medium text-base">{salesOrder.customer?.name || '-'}</div>
                                        <div className="text-muted-foreground">{salesOrder.customer?.email || ''}</div>
                                        {salesOrder.customer?.mobile_no && (
                                            <div className="text-muted-foreground">{salesOrder.customer.mobile_no}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">{t('DETAILS')}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">{t('Order Date')}</span> <span>{formatDate(salesOrder.order_date)}</span></div>
                                    {salesOrder.expected_delivery_date && (
                                        <div className="flex justify-between"><span className="text-muted-foreground">{t('Expected Delivery')}</span> <span>{formatDate(salesOrder.expected_delivery_date)}</span></div>
                                    )}
                                    {salesOrder.quote_id && (
                                        <div className="flex justify-between"><span className="text-muted-foreground">{t('Quote')}</span> <span>{quotation?.quotation_number || `#${salesOrder.quote_id}`}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(salesOrder.billing_address || salesOrder.shipping_address) && (
                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {salesOrder.billing_address && (
                                    <div>
                                        <h3 className="font-semibold mb-2">{t('BILLING ADDRESS')}</h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>{salesOrder.billing_address}</div>
                                            <div>{salesOrder.billing_city}, {salesOrder.billing_state} {salesOrder.billing_postal_code}</div>
                                            <div>{salesOrder.billing_country}</div>
                                        </div>
                                    </div>
                                )}
                                {salesOrder.shipping_address && (
                                    <div>
                                        <h3 className="font-semibold mb-2">{t('SHIPPING ADDRESS')}</h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>{salesOrder.shipping_address}</div>
                                            <div>{salesOrder.shipping_city}, {salesOrder.shipping_state} {salesOrder.shipping_postal_code}</div>
                                            <div>{salesOrder.shipping_country}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3 bg-blue-50 rounded h-full flex items-center">
                                    <div className="flex justify-between items-center w-full">
                                        {!salesOrder.is_invoiced && auth.user?.permissions?.includes('convert-sales-orders') && (
                                            <Button size="sm" onClick={() => router.post(route('salesorder.orders.convert', salesOrder.id), {}, { onSuccess: () => router.reload() })}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                {t('Convert to Invoice')}
                                            </Button>
                                        )}
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-600">
                                                <span className={`px-2 py-1 rounded-full text-sm capitalize ${salesOrder.is_invoiced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {salesOrder.is_invoiced ? t('Invoiced') : t('Pending')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{t('Invoice Status')}</div>
                                            {salesOrder.is_invoiced && salesOrder.invoice_id && (
                                                <Button size="sm" variant="outline" className="mt-2" onClick={() => router.visit(route('sales-invoices.show', salesOrder.invoice_id))}>
                                                    {t('View Invoice')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Custom Fields */}
                        {customFields.length > 0 && (
                            <div className="mt-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customFields.map((field, index) => (
                                        <div key={index} className="space-y-2">
                                            <label className="font-medium text-sm">{(field as any).name || (field as any).label || 'Custom Field'}</label>
                                            <div className="text-sm text-muted-foreground ml-2">{field.component}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(salesOrder.description || salesOrder.notes) && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {salesOrder.description && (
                                        <div>
                                            <span className="font-medium text-sm">{t('Description')}:</span>
                                            <span className="text-sm text-muted-foreground ml-2">{salesOrder.description}</span>
                                        </div>
                                    )}
                                    {salesOrder.notes && (
                                        <div>
                                            <span className="font-medium text-sm">{t('Notes')}:</span>
                                            <span className="text-sm text-muted-foreground ml-2">{salesOrder.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ─── Assignment & Acquisition Panel ───────────────────────────── */}
                {salesOrder.status === 'confirmed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {t('Assignment & Delivery Workflow')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Assignment Status */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground font-medium">{t('Assignment Status')}</span>
                                        <AssignmentBadge status={salesOrder.assignment_status || 'unassigned'} />
                                    </div>

                                    {salesOrder.assigned_group && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Assigned Group')}</span>
                                            <span className="font-medium">{salesOrder.assigned_group.name}</span>
                                        </div>
                                    )}

                                    {salesOrder.assignment_status === 'acquired' && salesOrder.acquired_by_user && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Acquired By')}</span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <UserCheck className="w-3.5 h-3.5 text-green-600" />
                                                {salesOrder.acquired_by_user.name}
                                            </span>
                                        </div>
                                    )}

                                    {salesOrder.acquired_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Acquired At')}</span>
                                            <span>{formatDate(salesOrder.acquired_at)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 min-w-[180px]">
                                    {/* Assign to Group */}
                                    {canAssignGroup && salesOrder.assignment_status !== 'acquired' && (
                                        <Button
                                            size="sm"
                                            variant={salesOrder.assignment_status === 'group_assigned' ? 'outline' : 'default'}
                                            onClick={() => { setSelectedGroupId(''); setAssignGroupDialog(true); }}
                                            className="justify-start"
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            {salesOrder.assignment_status === 'group_assigned' ? t('Change Group') : t('Assign to Group')}
                                        </Button>
                                    )}

                                    {/* Acquire */}
                                    {canAcquire && (
                                        <Button size="sm" onClick={handleAcquire} className="justify-start bg-green-600 hover:bg-green-700">
                                            <Lock className="w-4 h-4 mr-2" />
                                            {t('Acquire Order')}
                                        </Button>
                                    )}

                                    {/* Release */}
                                    {canRelease && (
                                        <Button size="sm" variant="outline" onClick={handleRelease} className="justify-start text-orange-600 border-orange-300 hover:bg-orange-50">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            {t('Release Order')}
                                        </Button>
                                    )}

                                    {/* Reassign (manager only) */}
                                    {canReassign && (
                                        <Button size="sm" variant="outline" onClick={() => { setSelectedGroupId(''); setReassignDialog(true); }} className="justify-start">
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            {t('Reassign')}
                                        </Button>
                                    )}

                                    {/* Create Delivery */}
                                    {canDeliver && (
                                        <Button size="sm" onClick={() => router.visit(route('salesorder.orders.deliveries.create', salesOrder.id))} className="justify-start bg-blue-600 hover:bg-blue-700">
                                            <Truck className="w-4 h-4 mr-2" />
                                            {t('Create Delivery')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Workflow steps indicator */}
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex items-center gap-1 text-xs">
                                    {[
                                        { label: t('Confirmed'), done: true },
                                        { label: t('Group Assigned'), done: ['group_assigned', 'acquired'].includes(salesOrder.assignment_status) },
                                        { label: t('Acquired'), done: salesOrder.assignment_status === 'acquired' },
                                        { label: t('Delivered'), done: salesOrder.delivery_status === 'delivered' },
                                    ].map((step, i, arr) => (
                                        <div key={i} className="flex items-center gap-1">
                                            <div className={`px-2 py-0.5 rounded text-xs font-medium ${step.done ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                                {step.label}
                                            </div>
                                            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ─── Order Items ────────────────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">{t('Order Items')}</h3>
                    </CardHeader>
                    <CardContent>
                        {orderItems?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">{t('Product')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Qty')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Delivered')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Remaining')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Unit Price')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orderItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">{item.product?.name || item.product_name || `Product #${item.product_id || item.id}`}</div>
                                                    {item.description && (
                                                        <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right text-green-700">{item.delivered_quantity ?? 0}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={(item.remaining_quantity ?? item.quantity) > 0 ? 'text-orange-600' : 'text-muted-foreground'}>
                                                        {item.remaining_quantity ?? item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price || item.price)}</td>
                                                <td className="px-4 py-4 text-right font-semibold">{formatCurrency(item.total_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-6 flex justify-end">
                                    <div className="w-72 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">{t('Subtotal')}</span><span>{formatCurrency(salesOrder.subtotal ?? 0)}</span></div>
                                        {(salesOrder.discount_amount ?? 0) > 0 && (
                                            <div className="flex justify-between"><span className="text-muted-foreground">{t('Discount')}</span><span className="text-red-600">-{formatCurrency(salesOrder.discount_amount)}</span></div>
                                        )}
                                        {(salesOrder.tax_amount ?? 0) > 0 && (
                                            <div className="flex justify-between"><span className="text-muted-foreground">{t('Tax')}</span><span>{formatCurrency(salesOrder.tax_amount)}</span></div>
                                        )}
                                        <div className="border-t pt-2 flex justify-between font-semibold text-base">
                                            <span>{t('Total')}</span>
                                            <span>{formatCurrency(salesOrder.total_amount ?? 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>{t('No items added to this order yet.')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ─── Deliveries ─────────────────────────────────────────────────── */}
                {deliveries.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                {t('Deliveries')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {deliveries.map((delivery: any) => (
                                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div>
                                            <div className="font-medium text-sm">{delivery.delivery_number}</div>
                                            <div className="text-xs text-muted-foreground">{formatDate(delivery.delivery_date)} &bull; {delivery.creator?.name}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {delivery.status}
                                            </span>
                                            <Button size="sm" variant="ghost" onClick={() => router.visit(route('salesorder.deliveries.show', delivery.id))}>
                                                {t('View')}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => window.open(route('salesorder.deliveries.challan', delivery.id), '_blank')}>
                                                <Printer className="h-3.5 w-3.5 mr-1" />
                                                {t('Challan')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ─── Assign Group Dialog ─────────────────────────────────────────── */}
            <Dialog open={assignGroupDialog} onOpenChange={setAssignGroupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Assign Group to Sales Order')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <Label>{t('Select a User Group')}</Label>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Choose a group...')} />
                            </SelectTrigger>
                            <SelectContent>
                                {userGroups.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                        {g.name} ({g.users_count} {t('members')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t('All active members of this group will be able to acquire and process this order.')}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignGroupDialog(false)}>{t('Cancel')}</Button>
                        <Button disabled={!selectedGroupId} onClick={handleAssignGroup}>{t('Assign Group')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Reassign Dialog ─────────────────────────────────────────────── */}
            <Dialog open={reassignDialog} onOpenChange={setReassignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Reassign Sales Order')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-sm text-muted-foreground">{t('Reassigning will release the order from the current acquirer and move it to the new group queue.')}</p>
                        <Label>{t('Select a User Group')}</Label>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Choose a group...')} />
                            </SelectTrigger>
                            <SelectContent>
                                {userGroups.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                        {g.name} ({g.users_count} {t('members')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReassignDialog(false)}>{t('Cancel')}</Button>
                        <Button disabled={!selectedGroupId} onClick={handleReassign}>{t('Reassign')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
