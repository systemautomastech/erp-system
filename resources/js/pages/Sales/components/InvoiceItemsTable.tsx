import React from 'react';
import { useTranslation } from 'react-i18next';
import { SalesInvoiceItem } from '../types';
import ProductSelector from './ProductSelector';
import { calculateLineItemAmounts } from './TaxCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import RichTextEditor from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';

interface Props {
    items: SalesInvoiceItem[];
    onChange: (items: SalesInvoiceItem[]) => void;
    errors?: any;
    products?: Array<{ id: number; name: string; description?: string; long_description?: string; sale_price: number; unit?: string; stock_quantity?: number; taxes?: Array<{ id: number; tax_name: string; rate: number }> }>;
    showAddButton?: boolean;
    invoiceType?: string;
}

export default function InvoiceItemsTable({ items, onChange, errors = {}, products = [], showAddButton = true, invoiceType = 'product' }: Props) {
    const { t } = useTranslation();

    const addItem = () => {
        const newItem: SalesInvoiceItem = {
            product_id: 0,
            section: 'otc',
            product_type: invoiceType || 'product',
            description: '',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0,
            taxes: []
        };
        onChange([...items, newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const updateItem = (index: number, field: keyof SalesInvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        const item = newItems[index];

        if (item.tax_percentage === 0 && item.product_id > 0) {
            const product = products.find(p => p.id === item.product_id);
            if (product?.taxes?.length) {
                item.tax_percentage = product.taxes.reduce((sum, tax) => sum + tax.rate, 0);
            }
        }

        const calculations = calculateLineItemAmounts(
            item.quantity,
            item.unit_price,
            item.discount_percentage,
            item.tax_percentage
        );

        item.discount_amount = calculations.discountAmount;
        item.tax_amount = calculations.taxAmount;
        item.total_amount = calculations.totalAmount;

        onChange(newItems);
    };

    const handleProductSelect = (index: number, productId: number, product?: any) => {
        const newItems = [...items];
        const totalTaxRate = product?.taxes?.reduce((sum: number, tax: any) => sum + Number(tax.rate), 0) || 0;
        const taxes = product?.taxes?.map((tax: any) => ({
            tax_name: tax.tax_name,
            tax_rate: tax.rate
        })) || [];

        const defaultDesc = product?.description || product?.long_description || '';

        newItems[index] = {
            ...newItems[index],
            product_id: productId,
            unit_price: Number(product?.sale_price) || 0,
            tax_percentage: Number(totalTaxRate) || 0,
            taxes: taxes,
            description: defaultDesc,
        };

        const item = newItems[index];
        item.quantity = Number(item.quantity) || 1;
        item.discount_percentage = Number(item.discount_percentage) || 0;

        const calculations = calculateLineItemAmounts(
            item.quantity,
            item.unit_price,
            item.discount_percentage,
            item.tax_percentage
        );

        item.discount_amount = Number(calculations.discountAmount) || 0;
        item.tax_amount = Number(calculations.taxAmount) || 0;
        item.total_amount = Number(calculations.totalAmount) || 0;

        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Product')} <span className="text-red-500">*</span>
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Type')}
                            </th>
                            {invoiceType === 'product' && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                    {t('Qty')} <span className="text-red-500">*</span>
                                </th>
                            )}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Unit Price')} <span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Discount')} %
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Tax')}
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Total')}
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                                {t('Action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item, index) => (
                            <tr key={index} className="align-top">
                                <td className="px-4 py-4 min-w-[280px]">
                                    <ProductSelector
                                        products={products}
                                        value={item.product_id}
                                        onChange={(productId, product) => handleProductSelect(index, productId, product)}
                                    />
                                    <InputError message={errors[`items.${index}.product_id`]} />

                                    {item.product_id > 0 && (
                                        <div className="mt-3 space-y-1">
                                            <Label className="text-[11px] font-semibold text-slate-500">{t('Product Description')}</Label>
                                            <RichTextEditor
                                                content={item.description || ''}
                                                onChange={(desc) => {
                                                    const newItems = [...items];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        description: desc,
                                                    };
                                                    onChange(newItems);
                                                }}
                                                placeholder={t('Enter or edit product description...')}
                                                minimal={true}
                                            />
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-4">
                                    <Select
                                        value={item.product_type || invoiceType || 'product'}
                                        onValueChange={(val) => updateItem(index, 'product_type', val)}
                                    >
                                        <SelectTrigger className="w-24 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">{t('Product')}</SelectItem>
                                            <SelectItem value="service">{t('Service')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                {invoiceType === 'product' && (
                                    <td className="px-4 py-4">
                                        {(() => {
                                            const product = products.find(p => p.id === item.product_id);
                                            const maxQty = product?.stock_quantity || 999999;
                                            return (
                                                <div>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-20 text-sm"
                                                        min="1"
                                                        max={maxQty}
                                                        step="1"
                                                        required
                                                    />
                                                    {product && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {t('Stock')}: {product.stock_quantity || 0}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        <InputError message={errors[`items.${index}.quantity`]} />
                                    </td>
                                )}
                                <td className="px-4 py-4">
                                    <Input
                                        type="number"
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        className="w-24 text-sm"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <InputError message={errors[`items.${index}.unit_price`]} />
                                </td>
                                <td className="px-4 py-4">
                                    <Input
                                        type="number"
                                        value={item.discount_percentage}
                                        onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                        className="w-20 text-sm"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                                        {item.taxes && item.taxes.length > 0 ? (
                                            item.taxes.map((tax, taxIndex) => (
                                                <span key={taxIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap">
                                                    {tax.tax_name} ({tax.tax_rate}%)
                                                </span>
                                            ))
                                        ) : Number(item.tax_percentage) > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap">
                                                {t('Tax')} ({Number(item.tax_percentage).toFixed(2)}%)
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic px-1">{t('No tax')}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                        {formatCurrency(item.total_amount)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(() => {
                const sectionSubTotal = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);
                const sectionDiscountTotal = items.reduce((acc, item) => acc + (Number(item.discount_amount) || 0), 0);
                const sectionTaxTotal = items.reduce((acc, item) => acc + (Number(item.tax_amount) || 0), 0);
                const sectionGrandTotal = items.reduce((acc, item) => acc + (Number(item.total_amount) || 0), 0);

                return (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div>
                            {showAddButton && (
                                <Button
                                    type="button"
                                    onClick={addItem}
                                    variant="default"
                                    size="sm"
                                >
                                    + {t('Add Item')}
                                </Button>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="w-full sm:w-72 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{t('Sub Total (৳)')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sectionSubTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{t('Discount (৳)')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{sectionDiscountTotal > 0 ? `-${formatCurrency(sectionDiscountTotal)}` : formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{t('VAT/Tax (৳)')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sectionTaxTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>{t('Total Amount (৳)')}</span>
                                    <span className="text-primary">{formatCurrency(sectionGrandTotal)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            <InputError message={errors.items} />
        </div>
    );
}