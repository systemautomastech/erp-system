import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { SalesInvoice } from './types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { getStatusBadgeClasses } from './utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePageButtons } from '@/hooks/usePageButtons';
import { useFormFields } from '@/hooks/useFormFields';

interface ViewProps {
    invoice: SalesInvoice;
    auth: any;
    [key: string]: any;
}

export default function View() {
    const { t } = useTranslation();
    const { invoice, auth } = usePage<ViewProps>().props;

    useFlashMessages();
    const pageButtons = usePageButtons('zatcaQRCodeBtn', invoice);

    const customFields = useFormFields('getCustomFields', { ...invoice, module: 'General', sub_module: 'Sales Invoice', id: invoice.id }, () => {}, {}, 'view', t);

    const signatureStatusButtons = usePageButtons('signatureViewBtn', {
        invoice: invoice,
        invoiceType: 'sales'
    });

    const downloadPDF = () => {
        const printUrl = route('sales-invoices.print', invoice.id) + '?download=pdf';
        window.open(printUrl, '_blank');
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Invoice'), url: route('sales-invoices.index')},
                {label: t('Invoice Details')}
            ]}
            pageTitle={`${t('Invoice')} #${invoice.invoice_number}`}
            pageActions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('sales-invoices.index'))}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('Back')}
                </Button>
            }
        >
            <Head title={`${t('Invoice')} #${invoice.invoice_number}`} />

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-lg text-muted-foreground">#{invoice.invoice_number}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={getStatusBadgeClasses(invoice.status)}>
                                    {t(invoice.status.toUpperCase())}
                                </span>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatCurrency(invoice.total_amount)}</div>
                                    <div className="text-sm text-muted-foreground">{t('Total Amount')}</div>
                                </div>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 gap-6 ${pageButtons.length > 0 ? (invoice.customer_details?.billing_address || invoice.customer_details?.shipping_address ? 'md:grid-cols-4' : 'md:grid-cols-3') : (invoice.customer_details?.billing_address || invoice.customer_details?.shipping_address ? 'md:grid-cols-3' : 'md:grid-cols-2')}`}>
                            <div>
                                <h3 className="font-semibold mb-2">{t('CUSTOMER')}</h3>
                                <div className="text-sm space-y-1">
                                    <div className="font-medium">{invoice.customer?.name || invoice.customer_name || '-'}</div>
                                    <div className="text-muted-foreground">{invoice.customer?.email || invoice.customer_email || ''}</div>
                                    {invoice.customer_phone && (
                                        <div className="text-muted-foreground">{invoice.customer_phone}</div>
                                    )}
                                    {invoice.customer_address && (
                                        <div className="text-muted-foreground text-xs whitespace-pre-line mt-1">{invoice.customer_address}</div>
                                    )}
                                </div>
                                {invoice.customer_details?.billing_address && (
                                    <div className="mt-3">
                                        <div className="font-medium text-sm mb-1">{t('Billing Address')}</div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>{invoice.customer_details.billing_address.name}</div>
                                            <div>{invoice.customer_details.billing_address.address_line_1}</div>
                                            <div>{invoice.customer_details.billing_address.city}, {invoice.customer_details.billing_address.state} {invoice.customer_details.billing_address.zip_code}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {invoice.customer_details?.shipping_address && (
                                <div>
                                    <h3 className="font-semibold mb-2">{t('SHIPPING ADDRESS')}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>{invoice.customer_details.shipping_address.name}</div>
                                        <div>{invoice.customer_details.shipping_address.address_line_1}</div>
                                        <div>{invoice.customer_details.shipping_address.city}, {invoice.customer_details.shipping_address.state} {invoice.customer_details.shipping_address.zip_code}</div>
                                    </div>
                                </div>
                            )}
                            {pageButtons.length > 0 && pageButtons.map((button, index) => (
                                <div key={`${button.id}-${index}`}>{button.component}</div>
                            ))}
                            <div>
                                <h3 className="font-semibold mb-2">{t('DETAILS')}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('Invoice Date')}</span>
                                        <span>{formatDate(invoice.invoice_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('Due Date')}</span>
                                        <span className={new Date(invoice.due_date) < new Date() ? 'text-red-600' : ''}>
                                            {formatDate(invoice.due_date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('Warehouse')}</span>
                                        <span>{invoice.warehouse?.name || '-'}</span>
                                    </div>
                                    {invoice.payment_terms && (
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground shrink-0">{t('Terms')}:</span>
                                            <div
                                                className="text-right text-xs prose prose-xs max-w-none text-slate-700 dark:text-slate-300"
                                                dangerouslySetInnerHTML={{ __html: invoice.payment_terms }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                        <div className="flex flex-wrap gap-2">
                                            {auth.user?.permissions?.includes('print-sales-invoices') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={downloadPDF}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t('Download PDF')}
                                                </Button>
                                            )}
                                            {invoice.status === 'draft' && auth.user?.permissions?.includes('post-sales-invoices') && (
                                                <TooltipProvider>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => router.post(route('sales-invoices.post', invoice.id), {}, {
                                                                    onSuccess: () => {
                                                                        router.reload();
                                                                    }
                                                                })}
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                {t('Post Invoice')}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('Post this invoice to finalize it and update inventory')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="text-right sm:text-right">
                                            <div className="text-lg sm:text-xl font-bold text-blue-600">{formatCurrency(invoice.balance_amount)}</div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">{t('Balance Due')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">{t('NOTES')}</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Signature Status */}
                        {signatureStatusButtons.length > 0 && signatureStatusButtons.map((button) => (
                                <div key={button.id}>{button.component}</div>
                        ))}
                        {/* Custom Fields View */}
                        {customFields && customFields.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold mb-4">{t('Additional Information')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customFields.map((field: any) => (
                                        <div key={field.id} className="flex flex-col">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {field.label}:
                                            </span>
                                            <div className="text-sm text-muted-foreground ml-2">
                                                {field.component}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            {t('Invoice Items')}
                        </h3>
                    </CardHeader>
                    <CardContent>
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
                                    {invoice.items?.map((item, index) => {
                                        const unitDisplay = item.product?.unit_relation?.unit_name || item.product?.unit_name || (!isNaN(Number(item.product?.unit)) ? '' : (item.product?.unit || ''));
                                        const desc = item.description || item.product?.description || item.product?.long_description || '';
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground">{item.product?.name}</span>
                                                        {(item.product_type || item.product?.type) && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground capitalize border border-border">
                                                                {item.product_type || item.product?.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.product?.sku && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">SKU: {item.product.sku}</div>
                                                    )}
                                                    {desc && (
                                                        <div
                                                            className="text-xs text-muted-foreground mt-1.5 prose prose-xs max-w-none dark:prose-invert"
                                                            dangerouslySetInnerHTML={{ __html: desc }}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                    <span className="font-medium">{item.quantity}</span>
                                                    {unitDisplay && (
                                                        <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                                                            {unitDisplay}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {item.discount_percentage > 0 ? (
                                                        <div>
                                                            <div>{item.discount_percentage}%</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                -{formatCurrency(item.discount_amount)}
                                                            </div>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {item.taxes && item.taxes.length > 0 ? (
                                                        <div>
                                                            {item.taxes.map((tax, taxIndex) => (
                                                                <div key={taxIndex} className="text-sm">{tax.tax_name} ({tax.tax_rate}%)</div>
                                                            ))}
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatCurrency(item.tax_amount)}
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
                                                    {formatCurrency(item.total_amount)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <div className="w-80 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('Subtotal')}</span>
                                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('Discount')}</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(invoice.discount_amount)}</span>
                                    </div>
                                )}
                                {invoice.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('Tax')}</span>
                                        <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{t('Total Amount')}</span>
                                        <span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                </div>
                                {invoice.paid_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('Paid Amount')}</span>
                                        <span className="font-medium text-green-600">{formatCurrency(invoice.paid_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-semibold">{t('Balance Due')}</span>
                                    <span className="font-bold text-lg">{formatCurrency(invoice.balance_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
