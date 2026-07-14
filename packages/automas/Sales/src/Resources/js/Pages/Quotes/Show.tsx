import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatCurrency } from '@/utils/helpers';
import { SalesQuote } from './types';
import { FileText, Download } from 'lucide-react';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { router } from '@inertiajs/react';
import { useFormFields } from '@/hooks/useFormFields';

interface ShowQuoteProps {
    quote: SalesQuote;
    auth: any;
    publicUrl: string;
    quoteItems?: any[];
}

export default function Show() {
    const { t } = useTranslation();
    const { quote, quoteItems, auth } = usePage<ShowQuoteProps>().props;

    // Custom fields hook
const customFields = useFormFields('getCustomFields', { ...quote, module: 'Sales', sub_module: 'Quotes', id: quote.id }, () => { }, {}, 'view', t);

    useFlashMessages();

    const downloadPDF = () => {
        const printUrl = route('sales.quotes.print', quote.id) + '?download=pdf';
        window.open(printUrl, '_blank');
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                { label: t('Quotes'), url: route('sales.quotes.index') },
                { label: t('View') }
            ]}
            pageTitle={t('Quote Details')}
        >
            <Head title={t('Quote Details')} />

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-lg text-muted-foreground">#{quote.quote_number}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                    quote.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                    quote.status?.toLowerCase() === 'sent' ? 'bg-blue-100 text-blue-800' :
                                    quote.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800' :
                                    quote.status?.toLowerCase() === 'declined' ? 'bg-red-100 text-red-800' :
                                    quote.status?.toLowerCase() === 'expired' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {quote.status}
                                </span>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatCurrency(
                                        (() => {
                                            const subtotal = quoteItems?.reduce((total, item) => total + (item.quantity * (item.unit_price || item.price)), 0) || 0;
                                            const totalDiscount = quoteItems?.reduce((total, item) => total + (parseFloat(item.discount_amount || item.discount) || 0), 0) || 0;
                                            const totalTax = quoteItems?.reduce((total, item) => {
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
                                            <div className="font-medium">{quote.customer?.name || quote.account?.name}</div>
                                            <div className="text-muted-foreground">{quote.customer?.email || quote.account?.email}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">{t('CONTACTS')}</h3>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Billing Contact</span> <span>{quote.billing_contact?.name || quote.billingContact?.name || '-'}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Shipping Contact</span> <span>{quote.shipping_contact?.name || quote.shippingContact?.name || '-'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">{t('DETAILS')}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Quote Date</span> <span>{formatDate(quote.date_quoted)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Valid Until</span> <span>{quote.valid_until ? formatDate(quote.valid_until) : t('Not specified')}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Assigned User</span> <span>{quote.assign_user?.name || t('Unassigned')}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Opportunity</span> <span>{quote.opportunity?.name || '-'}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {quote.billing_address && (
                                <div>
                                    <h3 className="font-semibold mb-2">{t('BILLING ADDRESS')}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>{quote.billing_address}</div>
                                        <div>{quote.billing_city}, {quote.billing_state} {quote.billing_postal_code}</div>
                                        <div>{quote.billing_country}</div>
                                    </div>
                                </div>
                            )}

                            {quote.shipping_address && (
                                <div>
                                    <h3 className="font-semibold mb-2">{t('SHIPPING ADDRESS')}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>{quote.shipping_address}</div>
                                        <div>{quote.shipping_city}, {quote.shipping_state} {quote.shipping_postal_code}</div>
                                        <div>{quote.shipping_country}</div>
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-blue-50 rounded h-full flex items-center">
                                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {auth.user?.permissions?.includes('print-sales-quotes') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={downloadPDF}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                {t('Download PDF')}
                                            </Button>
                                        )}
                                        {!quote.is_converted && auth.user?.permissions?.includes('convert-sales-quotes') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => router.post(route('sales.quotes.convert', quote.id), {}, {
                                                                onSuccess: () => {
                                                                    router.reload();
                                                                }
                                                            })}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            {t('Convert to Order')}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Convert quote to sales order')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-600">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                quote.is_converted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {quote.is_converted ? t('Converted') : t('Pending')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{t('Conversion Status')}</div>
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

                        {(quote.description || quote.notes) && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {quote.description && (
                                        <div>
                                            <span className="font-medium text-sm">{t('Description')}:</span>
                                            <span className="text-sm text-muted-foreground ml-2">{quote.description}</span>
                                        </div>
                                    )}
                                    {quote.notes && (
                                        <div>
                                            <span className="font-medium text-sm">{t('Notes')}:</span>
                                            <span className="text-sm text-muted-foreground ml-2">{quote.notes}</span>
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
                            {t('Quote Items')}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        {quoteItems?.length > 0 ? (
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
                                        {quoteItems.map((item, index) => (
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
                                                                    item.product_taxes?.reduce((sum: number, tax: any) => {
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

                                            quoteItems.forEach(item => {
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
                                <p>{t('No items added to this quote yet.')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
