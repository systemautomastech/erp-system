import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { SalesQuoteItem } from '../types';

interface QuoteItemsTableProps {
    items: SalesQuoteItem[];
    onChange: (items: SalesQuoteItem[]) => void;
    errors: any;
    products: any[];
    showAddButton?: boolean;
}

export default function QuoteItemsTable({ items, onChange, errors, products, showAddButton = true }: QuoteItemsTableProps) {
    const { t } = useTranslation();

    const updateItem = (index: number, field: keyof SalesQuoteItem, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Auto-calculate amounts when relevant fields change
        if (['quantity', 'unit_price', 'discount_percentage', 'tax_percentage'].includes(field)) {
            const item = updatedItems[index];
            const lineTotal = item.quantity * item.unit_price;
            const discountAmount = (lineTotal * (item.discount_percentage || 0)) / 100;
            const afterDiscount = lineTotal - discountAmount;
            const taxAmount = (afterDiscount * (item.tax_percentage || 0)) / 100;
            
            updatedItems[index] = {
                ...item,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total_amount: afterDiscount + taxAmount
            };
        }

        // Auto-fill product details when product is selected
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                const totalTaxRate = product.taxes?.reduce((sum: number, tax: any) => sum + Number(tax.rate), 0) || 0;
                const taxes = product.taxes?.map((tax: any) => ({
                    tax_name: tax.tax_name,
                    tax_rate: tax.rate
                })) || [];
                
                updatedItems[index] = {
                    ...updatedItems[index],
                    unit_price: product.sale_price || 0,
                    tax_percentage: totalTaxRate,
                    taxes: taxes
                };
                
                // Recalculate with new price
                const item = updatedItems[index];
                const lineTotal = item.quantity * item.unit_price;
                const discountAmount = (lineTotal * (item.discount_percentage || 0)) / 100;
                const afterDiscount = lineTotal - discountAmount;
                const taxAmount = (afterDiscount * (item.tax_percentage || 0)) / 100;
                
                updatedItems[index] = {
                    ...item,
                    discount_amount: discountAmount,
                    tax_amount: taxAmount,
                    total_amount: afterDiscount + taxAmount
                };
            }
        }

        onChange(updatedItems);
    };

    const removeItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        onChange(updatedItems);
    };

    const addItem = () => {
        const newItem: SalesQuoteItem = {
            product_id: 0,
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0
        };
        onChange([...items, newItem]);
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
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Qty')} <span className="text-red-500">*</span>
                            </th>
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
                            <tr key={index}>
                                <td className="px-4 py-4">
                                    <Select
                                        value={item.product_id?.toString() || ''}
                                        onValueChange={(value) => updateItem(index, 'product_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Product')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors[`items.${index}.product_id`] && (
                                        <div className="text-red-500 text-xs mt-1">{errors[`items.${index}.product_id`]}</div>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="w-20 text-sm"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </td>
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
                                    {item.taxes && item.taxes.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {item.taxes.map((tax, taxIndex) => (
                                                <span key={taxIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {tax.tax_name} ({tax.tax_rate}%)
                                                </span>
                                            ))}
                                        </div>
                                    ) : item.tax_percentage > 0 ? (
                                        <span className="text-sm text-blue-800">{t('Tax')} ({item.tax_percentage}%)</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{t('No tax')}</span>
                                    )}
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

            {showAddButton && (
                <div className="flex justify-start">
                    <Button
                        type="button"
                        onClick={addItem}
                        variant="default"
                        size="sm"
                    >
                        + {t('Add Item')}
                    </Button>
                </div>
            )}
        </div>
    );
}