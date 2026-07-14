import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatCurrency } from '@/utils/helpers';
import { FileText } from 'lucide-react';
import { useFormFields } from '@/hooks/useFormFields';

interface ShowSalesOrderProps {
    salesOrder: any;
    orderItems?: any[];
    auth: any;
}

export default function Show() {
    const { t } = useTranslation();
    const { salesOrder, orderItems = [], auth } = usePage<ShowSalesOrderProps>().props;

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...salesOrder, module: 'Sales', sub_module: 'Sales Orders', id: salesOrder.id }, () => { }, {}, 'view', t);

    useFlashMessages();

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                {label: t('Sales Orders'), url: route('sales.orders.index')},
                {label: t('View')}
            ]}
            pageTitle={t('Order Details')}

        >
            <Head title={t('Order Details')} />

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-lg text-muted-foreground">#{salesOrder.order_number}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                    salesOrder.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                    salesOrder.status?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    salesOrder.status?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    salesOrder.status?.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                    salesOrder.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                    salesOrder.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {salesOrder.status}
                                </span>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatCurrency(
                                        (() => {
                                            const subtotal = orderItems?.reduce((total, item) => total + (item.quantity * (item.unit_price || item.price)), 0) || 0;
                                            const totalDiscount = orderItems?.reduce((total, item) => total + (parseFloat(item.discount_amount || item.discount) || 0), 0) || 0;
                                            const totalTax = orderItems?.reduce((total, item) => {
                                                const afterDiscount = (item.quantity * (item.unit_price || item.price)) - (parseFloat(item.discount_amount || item.discount) || 0);
                                                const taxArray = item.taxes || item.product_taxes;
                                                return total + (taxArray?.reduce((sum, tax) => sum + (afterDiscount * (parseFloat(tax.tax_rate || tax.rate) || 0) / 100), 0) || 0);
                                            }, 0) || 0;
                                            return subtotal - totalDiscount + totalTax;
                                        })()
                                    )}</div>
                                    <div className="text-sm text-muted-foreground">{t('Total Amount')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">{t('CUSTOMER')}</h3>
                                        <div className="text-sm space-y-1">
                                            <div className="font-medium">{salesOrder.customer?.name || salesOrder.account?.name}</div>
                                            <div className="text-muted-foreground">{salesOrder.customer?.email || salesOrder.account?.email}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">{t('CONTACTS')}</h3>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Billing Contact</span> <span>{salesOrder.billing_contact?.name || salesOrder.billingContact?.name || '-'}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Shipping Contact</span> <span>{salesOrder.shipping_contact?.name || salesOrder.shippingContact?.name || '-'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">{t('DETAILS')}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span> <span>{formatDate(salesOrder.order_date)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Assigned User</span> <span>{salesOrder.assign_user?.name || t('Unassigned')}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Opportunity</span> <span>{salesOrder.opportunity?.name || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Quote</span> <span>{salesOrder.quote?.name || '-'}</span></div>
                                </div>
                            </div>
                        </div>

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
                                        <TooltipProvider>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => router.post(route('sales.orders.convert', salesOrder.id), {}, {
                                                            onSuccess: () => {
                                                                router.reload();
                                                            }
                                                        })}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        {t('Convert to Invoice')}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('Convert order to invoice')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-600">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                salesOrder.is_invoiced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
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

                        {/* Custom Fields */}
                        {customFields.length > 0 && (
                            <div className="mt-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customFields.map((field, index) => (
                                        <div key={index} className="space-y-2">
                                            <label className="font-medium text-sm">{(field as any).name || (field as any).label || 'Custom Field'}</label>
                                            <div className="text-sm text-muted-foreground ml-2">
                                                {field.component}
                                            </div>
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

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            {t('Order Items')}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        {orderItems?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">{t('Product')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Qty')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Unit Price')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Discount')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Tax')}</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">{t('Total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orderItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">{item.product?.name || item.product_name || `Product #${item.product_id || item.id}`}</div>
                                                    {(item.product?.sku || item.product_sku) && (
                                                        <div className="text-sm text-muted-foreground">SKU: {item.product?.sku || item.product_sku}</div>
                                                    )}
                                                    {(item.product?.description || item.product_description || item.description) && (
                                                        <div className="text-sm text-muted-foreground mt-1">{item.product?.description || item.product_description || item.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price || item.price)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {(item.discount_percentage > 0 || item.discount > 0) ? (
                                                        <div>
                                                            {item.discount_percentage && <div>{item.discount_percentage}%</div>}
                                                            <div className="text-sm text-muted-foreground">
                                                                -{formatCurrency(item.discount_amount || item.discount)}
                                                            </div>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {(item.taxes && item.taxes.length > 0) || (item.product_taxes && item.product_taxes.length > 0) ? (
                                                        <div>
                                                            {(item.taxes || item.product_taxes)?.map((tax: any, taxIndex: number) => (
                                                                <div key={taxIndex} className="text-sm">{tax.tax_name} ({tax.tax_rate || tax.rate}%)</div>
                                                            ))}
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatCurrency(item.tax_amount || (
                                                                    (item.taxes || item.product_taxes)?.reduce((sum: number, tax: any) => {
                                                                        const afterDiscount = (item.quantity * (item.unit_price || item.price)) - (parseFloat(item.discount_amount || item.discount) || 0);
                                                                        return sum + (afterDiscount * (parseFloat(tax.tax_rate || tax.rate) || 0) / 100);
                                                                    }, 0) || 0
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : item.tax_percentage > 0 ? (
                                                        <div>
                                                            <div>{item.tax_percentage}%</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatCurrency(item.tax_amount)}
                                                            </div>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right font-semibold">
                                                    {formatCurrency(item.total_amount || (() => {
                                                        const subtotal = item.quantity * (item.unit_price || item.price);
                                                        const afterDiscount = subtotal - (parseFloat(item.discount_amount || item.discount) || 0);
                                                        const totalTax = (item.taxes || item.product_taxes) && (item.taxes || item.product_taxes).length > 0
                                                            ? (item.taxes || item.product_taxes).reduce((sum: number, tax: any) => sum + (afterDiscount * (parseFloat(tax.tax_rate || tax.rate) || 0) / 100), 0)
                                                            : 0;
                                                        return afterDiscount + totalTax;
                                                    })())}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-6 flex justify-end">
                                    <div className="w-80 space-y-3">
                                        {(() => {
                                            let subtotal = 0;
                                            let totalDiscount = 0;
                                            const taxTotals = {};
                                            let grandTotal = 0;

                                            orderItems.forEach(item => {
                                                const itemSubtotal = item.quantity * (item.unit_price || item.price);
                                                subtotal += itemSubtotal;
                                                totalDiscount += parseFloat(item.discount_amount || item.discount) || 0;

                                                const afterDiscount = itemSubtotal - (parseFloat(item.discount_amount || item.discount) || 0);
                                                const taxArray = item.taxes || item.product_taxes;
                                                if (taxArray && taxArray.length > 0) {
                                                    taxArray.forEach(tax => {
                                                        const taxAmount = (afterDiscount * (parseFloat(tax.tax_rate || tax.rate) || 0)) / 100;
                                                        const taxName = tax.tax_name || tax.name;
                                                        if (!taxTotals[taxName]) {
                                                            taxTotals[taxName] = 0;
                                                        }
                                                        taxTotals[taxName] += taxAmount;
                                                    });
                                                }
                                            });

                                            const afterDiscountTotal = subtotal - totalDiscount;
                                            const totalTaxAmount = Object.values(taxTotals).reduce((sum, amount) => sum + amount, 0);
                                            grandTotal = afterDiscountTotal + totalTaxAmount;

                                            return (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{t('Subtotal')}</span>
                                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    {totalDiscount > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">{t('Discount')}</span>
                                                            <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
                                                        </div>
                                                    )}
                                                    {Object.entries(taxTotals).map(([taxName, amount]) => (
                                                        <div key={taxName} className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">{taxName}</span>
                                                            <span className="font-medium">{formatCurrency(amount)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="border-t pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">{t('Total Amount')}</span>
                                                            <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
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
            </div>


        </AuthenticatedLayout>
    );
}
