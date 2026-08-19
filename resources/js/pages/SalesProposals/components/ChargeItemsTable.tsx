import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalItem } from '../types';
import ProductSelector from '@/pages/Sales/components/ProductSelector';
import { calculateLineItemAmounts } from '@/pages/Sales/components/TaxCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface Props {
    sectionType: 'otc' | 'mrc';
    title: string;
    items: ProposalItem[];
    allItems: ProposalItem[];
    onAllItemsChange: (items: ProposalItem[]) => void;
    products?: Array<{
        id: number;
        name: string;
        sale_price: number;
        unit?: string;
        type?: string;
        stock_quantity?: number;
        taxes?: Array<{ id: number; tax_name: string; rate: number }>;
    }>;
    errors?: any;
    invoiceType?: 'product' | 'service';
    onRefresh?: () => void | Promise<void>;
    isRefreshing?: boolean;
    isTaxEnabled?: boolean;
}

export default function ChargeItemsTable({
    sectionType,
    title,
    items,
    allItems,
    onAllItemsChange,
    products = [],
    errors = {},
    invoiceType = 'product',
    onRefresh,
    isRefreshing = false,
    isTaxEnabled = true
}: Props) {
    const { t } = useTranslation();

    const addChargeItem = () => {
        const newItem: ProposalItem = {
            product_id: 0,
            section: sectionType,
            product_type: invoiceType || 'product',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0,
            taxes: []
        };
        onAllItemsChange([...allItems, newItem]);
    };

    const removeChargeItem = (targetItemIndex: number) => {
        // Find index of item in allItems
        const sectionItems = allItems.filter(i => i.section === sectionType);
        const targetItem = sectionItems[targetItemIndex];
        if (!targetItem) return;

        const updatedAll = allItems.filter(i => i !== targetItem);
        onAllItemsChange(updatedAll);
    };

    const updateChargeItem = (targetItemIndex: number, field: keyof ProposalItem, value: any) => {
        const sectionItems = allItems.filter(i => i.section === sectionType);
        const targetItem = sectionItems[targetItemIndex];
        if (!targetItem) return;

        const itemIndexInAll = allItems.indexOf(targetItem);
        if (itemIndexInAll === -1) return;

        const updatedAll = [...allItems];
        const item = { ...updatedAll[itemIndexInAll], [field]: value };

        if (field === 'tax_percentage' && !isTaxEnabled) {
            item.tax_percentage = 0;
            item.taxes = [];
        }

        if (field === 'unit_price' || field === 'quantity' || field === 'discount_percentage' || field === 'tax_percentage') {
            item.quantity = Number(item.quantity) || 0;
            item.unit_price = Number(item.unit_price) || 0;
            item.discount_percentage = Number(item.discount_percentage) || 0;
            item.tax_percentage = isTaxEnabled ? (Number(item.tax_percentage) || 0) : 0;
        }

        const calculations = calculateLineItemAmounts(
            item.quantity,
            item.unit_price,
            item.discount_percentage,
            isTaxEnabled ? item.tax_percentage : 0
        );

        item.discount_amount = calculations.discountAmount;
        item.tax_amount = isTaxEnabled ? calculations.taxAmount : 0;
        item.total_amount = calculations.totalAmount;

        updatedAll[itemIndexInAll] = item;
        onAllItemsChange(updatedAll);
    };

    const handleProductSelect = (targetItemIndex: number, productId: number, product?: any) => {
        const sectionItems = allItems.filter(i => i.section === sectionType);
        const targetItem = sectionItems[targetItemIndex];
        if (!targetItem) return;

        const itemIndexInAll = allItems.indexOf(targetItem);
        if (itemIndexInAll === -1) return;

        const updatedAll = [...allItems];
        const totalTaxRate = (isTaxEnabled && product?.taxes) ? (product.taxes.reduce((sum: number, tax: any) => sum + Number(tax.rate), 0) || 0) : 0;
        const taxes = (isTaxEnabled && product?.taxes) ? (product.taxes.map((tax: any) => ({
            tax_name: tax.tax_name,
            tax_rate: tax.rate
        })) || []) : [];

        const item = {
            ...updatedAll[itemIndexInAll],
            product_id: productId,
            unit_price: Number(product?.sale_price) || 0,
            tax_percentage: Number(totalTaxRate) || 0,
            taxes: taxes
        };

        item.quantity = Number(item.quantity) || 1;
        item.discount_percentage = Number(item.discount_percentage) || 0;

        const calculations = calculateLineItemAmounts(
            item.quantity,
            item.unit_price,
            item.discount_percentage,
            isTaxEnabled ? item.tax_percentage : 0
        );

        item.discount_amount = Number(calculations.discountAmount) || 0;
        item.tax_amount = isTaxEnabled ? (Number(calculations.taxAmount) || 0) : 0;
        item.total_amount = Number(calculations.totalAmount) || 0;

        updatedAll[itemIndexInAll] = item;
        onAllItemsChange(updatedAll);
    };

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                            <th className="px-3 py-2.5 text-left">{t('Type')}</th>
                            <th className="px-4 py-2.5 text-left">{t('Items')} <span className="text-red-500">*</span></th>
                            <th className="px-3 py-2.5 text-center">{t('Qty')} <span className="text-red-500">*</span></th>
                            <th className="px-3 py-2.5 text-right">{t('Unit Price')} <span className="text-red-500">*</span></th>
                            <th className="px-3 py-2.5 text-right">{t('Discount %')}</th>
                            <th className="px-3 py-2.5 text-right">{t('Tax %')}</th>
                            <th className="px-4 py-2.5 text-right">{t('Total')}</th>
                            <th className="px-3 py-2.5 text-center">{t('Action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.length > 0 ? (
                            items.map((item, index) => {
                                const availableTypes = Array.from(
                                    new Set(
                                        products
                                            .map((p) => p.type)
                                            .filter((t): t is string => Boolean(t && t.trim() !== ''))
                                    )
                                );

                                const selectableTypes = availableTypes.length > 0
                                    ? availableTypes
                                    : ['product', 'service'];

                                const currentType = item.product_type || (selectableTypes.includes(invoiceType || '') ? invoiceType : selectableTypes[0]) || 'product';
                                const filteredProducts = products.filter(p => !p.type || p.type === currentType);

                                const formatTypeName = (typeStr: string) => {
                                    if (!typeStr) return '';
                                    return t(typeStr.charAt(0).toUpperCase() + typeStr.slice(1).replace(/_/g, ' '));
                                };

                                return (
                                    <tr key={index} className="hover:bg-muted/20">
                                        <td className="p-2">
                                            <div className="space-y-1">
                                                <Select
                                                    value={currentType}
                                                    onValueChange={(val) => {
                                                        const sectionItems = allItems.filter(i => i.section === sectionType);
                                                        const targetItem = sectionItems[index];
                                                        const itemIndexInAll = allItems.findIndex(i => i === targetItem);
                                                        if (itemIndexInAll !== -1) {
                                                            const updatedAll = [...allItems];
                                                            updatedAll[itemIndexInAll] = {
                                                                ...updatedAll[itemIndexInAll],
                                                                product_type: val,
                                                                product_id: 0,
                                                                unit_price: 0,
                                                                tax_percentage: 0,
                                                                taxes: [],
                                                                tax_amount: 0,
                                                                discount_amount: 0,
                                                                total_amount: 0,
                                                            };
                                                            onAllItemsChange(updatedAll);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-24 h-8 text-xs capitalize">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectableTypes.map((typeOption) => (
                                                            <SelectItem key={typeOption} value={typeOption} className="capitalize">
                                                                {formatTypeName(typeOption)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            try {
                                                                window.open(route('product-service.items.create'), '_blank');
                                                            } catch (e) {
                                                                window.open('/product-service/items/create', '_blank');
                                                            }
                                                        }}
                                                        className="h-5 px-1.5 text-[10px] text-primary hover:text-primary gap-1 border-dashed w-24 justify-start"
                                                    >
                                                        <Plus className="h-2.5 w-2.5 shrink-0" />
                                                        <span className="truncate">{t('Add {{type}}', { type: formatTypeName(currentType) })}</span>
                                                    </Button>

                                                    {onRefresh && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onRefresh()}
                                                            disabled={isRefreshing}
                                                            className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1 w-24 justify-start"
                                                            title={t('Refresh items list')}
                                                        >
                                                            <RefreshCw className={`h-2.5 w-2.5 shrink-0 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                                                            <span className={isRefreshing ? 'text-primary font-medium' : ''}>{t('Refresh')}</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 min-w-[220px]">
                                            <ProductSelector
                                                products={filteredProducts}
                                                value={item.product_id}
                                                onChange={(productId, product) => handleProductSelect(index, productId, product)}
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateChargeItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-16 h-8 text-xs text-center"
                                                min="1"
                                                step="1"
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateChargeItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-24 h-8 text-xs text-right"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={item.discount_percentage}
                                                onChange={(e) => updateChargeItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                                className="w-16 h-8 text-xs text-right"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={isTaxEnabled ? item.tax_percentage : 0}
                                                onChange={(e) => updateChargeItem(index, 'tax_percentage', parseFloat(e.target.value) || 0)}
                                                className="w-16 h-8 text-xs text-right disabled:opacity-50 disabled:bg-muted"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                disabled={!isTaxEnabled}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold text-foreground">
                                            {formatCurrency(item.total_amount || (item.quantity * item.unit_price))}
                                        </td>
                                        <td className="p-2 text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeChargeItem(index)}
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-4 text-center text-muted-foreground text-xs italic">
                                    {t('No {{title}} items added.', { title })}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChargeItem}
                className="gap-2 h-8 text-xs"
            >
                <Plus className="h-3.5 w-3.5" />
                {t('Add {{title}} Item', { title })}
            </Button>
        </div>
    );
}
