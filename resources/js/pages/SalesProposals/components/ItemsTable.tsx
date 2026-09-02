import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalItem } from '../types';
import ProductSelector from './ProductSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface Props {
    items: ProposalItem[];
    onChange: (items: ProposalItem[]) => void;
    errors?: any;
    products?: Array<{ id: number; name: string; type?: string; description?: string; long_description?: string; sale_price: number; unit?: string; unit_name?: string; stock_quantity?: number; taxes?: Array<{ id: number; tax_name: string; rate: number }> }>;
    showAddButton?: boolean;
    invoiceType?: string;
    warehouseId?: string | number | null;
    onRefresh?: () => void | Promise<void>;
    isRefreshing?: boolean;
    isTaxEnabled?: boolean;
    defaultSection?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    onDiscountTypeChange?: (type: 'percentage' | 'fixed') => void;
    onDiscountValueChange?: (value: number) => void;
}

export default function ItemsTable({
    items,
    onChange,
    errors = {},
    products = [],
    showAddButton = true,
    invoiceType = 'product',
    warehouseId,
    onRefresh,
    isRefreshing = false,
    isTaxEnabled = true,
    defaultSection = 'otc',
    discountType = 'percentage',
    discountValue = 0,
    onDiscountTypeChange,
    onDiscountValueChange,
}: Props) {
    const { t } = useTranslation();

    const addItem = () => {
        const newItem: ProposalItem = {
            product_id: 0,
            section: defaultSection,
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

    const updateItem = (index: number, field: keyof ProposalItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        const item = newItems[index];

        if (field === 'tax_percentage' && !isTaxEnabled) {
            item.tax_percentage = 0;
            item.taxes = [];
        }

        if (field === 'unit_price' || field === 'quantity' || field === 'tax_percentage') {
            item.quantity = Math.min(Math.max(Number(item.quantity) || 0, 0), 999999);
            item.unit_price = Number(item.unit_price) || 0;
            item.tax_percentage = isTaxEnabled ? (Number(item.tax_percentage) || 0) : 0;
        }

        const lineTotal = item.quantity * item.unit_price;
        const taxAmount = isTaxEnabled ? (lineTotal * (Number(item.tax_percentage) || 0)) / 100 : 0;

        item.discount_percentage = 0;
        item.discount_amount = 0;
        item.tax_amount = taxAmount;
        item.total_amount = lineTotal + taxAmount;

        onChange(newItems);
    };

    const handleProductSelect = (index: number, productId: number, product?: any) => {
        const newItems = [...items];
        const totalTaxRate = (isTaxEnabled && product?.taxes) ? (product.taxes.reduce((sum: number, tax: any) => sum + Number(tax.rate), 0) || 0) : 0;
        const taxes = (isTaxEnabled && product?.taxes) ? (product.taxes.map((tax: any) => ({
            tax_name: tax.tax_name,
            tax_rate: tax.rate
        })) || []) : [];

        const defaultDesc = product?.long_description || product?.description || '';

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

        const lineTotal = item.quantity * item.unit_price;
        const taxAmount = isTaxEnabled ? (lineTotal * (Number(item.tax_percentage) || 0)) / 100 : 0;

        item.discount_percentage = 0;
        item.discount_amount = 0;
        item.tax_amount = taxAmount;
        item.total_amount = lineTotal + taxAmount;

        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-3 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Type')}
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                {t('Items')} <span className="text-red-500">*</span>
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
                        {items.map((item, index) => {
                            const availableTypes = Array.from(
                                new Set(
                                    products
                                        .map((p) => p.type)
                                        .filter((t): t is string => Boolean(t && t.trim() !== ''))
                                )
                            ).filter(Boolean);

                            const selectableTypes = availableTypes.length > 0
                                ? availableTypes
                                : ['product', 'service'];

                            const currentType = item.product_type || (selectableTypes.includes(invoiceType) ? invoiceType : selectableTypes[0]) || 'product';
                            const filteredProducts = products.filter(p => !p.type || p.type === currentType);

                            const formatTypeName = (typeStr: string) => {
                                if (!typeStr) return '';
                                return t(typeStr.charAt(0).toUpperCase() + typeStr.slice(1).replace(/_/g, ' '));
                            };

                            return (
                                <tr key={index} className="align-top">
                                    <td className="px-3 py-4">
                                        <div className="space-y-1.5">
                                            <Select
                                                value={currentType}
                                                onValueChange={(val) => {
                                                    const newItems = [...items];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        product_type: val,
                                                        product_id: 0,
                                                        unit_price: 0,
                                                        description: '',
                                                        tax_percentage: 0,
                                                        taxes: [],
                                                        tax_amount: 0,
                                                        discount_amount: 0,
                                                        total_amount: 0,
                                                    };
                                                    onChange(newItems);
                                                }}
                                            >
                                                <SelectTrigger className="w-24 text-xs capitalize">
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
                                                    className="h-6 px-1.5 text-[10px] text-primary hover:text-primary gap-1 border-dashed w-24 justify-start"
                                                >
                                                    <Plus className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{t('Add {{type}}', { type: formatTypeName(currentType) })}</span>
                                                </Button>

                                                {onRefresh && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRefresh()}
                                                        disabled={isRefreshing}
                                                        className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1 w-24 justify-center"
                                                        title={t('Refresh items list')}
                                                    >
                                                        <RefreshCw className={`h-2 w-2 shrink-0 ${isRefreshing ? 'animate-spin text-primary' : ''}`} style={{ height: '10px', width: '10px' }} />
                                                        <span className={isRefreshing ? 'text-primary font-medium' : ''}>{t('Refresh')}</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 min-w-[280px]">
                                        <ProductSelector
                                            products={filteredProducts}
                                            value={item.product_id}
                                            warehouseId={warehouseId}
                                            onChange={(productId, product) => handleProductSelect(index, productId, product)}
                                        />
                                        <InputError message={errors[`items.${index}.product_id`]} />

                                        {item.product_id > 0 && (
                                            <div className="mt-2 space-y-1">
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
                                    {invoiceType === 'product' && (
                                        <td className="px-4 py-4">
                                            {(() => {
                                                const product = products.find(p => p.id === item.product_id);
                                                const unitDisplay = product?.unit_name || (!isNaN(Number(product?.unit)) ? '' : (product?.unit || ''));
                                                return (
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    updateItem(index, 'quantity', Math.min(Math.max(val, 0), 999999));
                                                                }}
                                                                className="w-20 text-sm"
                                                                min="1"
                                                                max="999999"
                                                                step="1"
                                                                required
                                                            />
                                                            {unitDisplay ? (
                                                                <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/60 border border-border rounded h-9 inline-flex items-center min-w-[36px] justify-center whitespace-nowrap">
                                                                    {unitDisplay}
                                                                </span>
                                                            ) : null}
                                                        </div>
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
                                            className="w-28 text-sm"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <InputError message={errors[`items.${index}.unit_price`]} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                                            {!isTaxEnabled ? (
                                                <span className="text-xs text-muted-foreground italic px-1">{t('Tax disabled')}</span>
                                            ) : item.taxes && item.taxes.length > 0 ? (
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
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {(() => {
                const sectionSubTotal = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);
                const sectionTaxTotal = items.reduce((acc, item) => acc + (Number(item.tax_amount) || 0), 0);

                let calculatedDiscount = 0;
                const numericDiscVal = Number(discountValue) || 0;
                if (discountType === 'percentage') {
                    calculatedDiscount = (sectionSubTotal * Math.min(Math.max(numericDiscVal, 0), 100)) / 100;
                } else {
                    calculatedDiscount = Math.min(Math.max(numericDiscVal, 0), sectionSubTotal);
                }

                const sectionGrandTotal = Math.max(0, sectionSubTotal - calculatedDiscount + sectionTaxTotal);

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
                            <div className="w-full sm:w-80 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
                                {/* 1. Sub Total */}
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{t('Sub Total (৳)')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{formatCurrency(sectionSubTotal)}</span>
                                </div>

                                {/* 2. Minimal Discount Row */}
                                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            {discountType === 'percentage' && discountValue > 0
                                                ? `${t('Discount')} (${discountValue}%)`
                                                : t('Discount')}
                                        </span>

                                        {/* Minimal Type Toggle (% / ৳) */}
                                        <div className="inline-flex rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
                                            <button
                                                type="button"
                                                onClick={() => onDiscountTypeChange && onDiscountTypeChange('percentage')}
                                                className={`px-2 py-0.5 text-[10px] font-semibold rounded flex items-center gap-1 transition-all ${
                                                    discountType === 'percentage'
                                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>%</span>
                                                <span>{t('Percent')}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDiscountTypeChange && onDiscountTypeChange('fixed')}
                                                className={`px-2 py-0.5 text-[10px] font-semibold rounded flex items-center gap-1 transition-all ${
                                                    discountType === 'fixed'
                                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>৳</span>
                                                <span>{t('Fixed')}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Input & Live Result */}
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <div className="relative w-24">
                                            <Input
                                                type="number"
                                                value={discountValue === 0 ? '' : discountValue}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    if (onDiscountValueChange) {
                                                        onDiscountValueChange(Math.max(0, val));
                                                    }
                                                }}
                                                placeholder="0"
                                                className="h-7 text-xs font-semibold text-right pr-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus-visible:ring-primary"
                                                min="0"
                                                max={discountType === 'percentage' ? 100 : sectionSubTotal}
                                                step={discountType === 'percentage' ? '0.1' : '1'}
                                            />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none">
                                                {discountType === 'percentage' ? '%' : '৳'}
                                            </span>
                                        </div>

                                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                                            {calculatedDiscount > 0 ? `-${formatCurrency(calculatedDiscount)}` : formatCurrency(0)}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. VAT/Tax */}
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                                    <span className="font-medium">{t('VAT/Tax (৳)')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sectionTaxTotal)}</span>
                                </div>

                                {/* 4. Total Amount */}
                                <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>{t('Total Amount (৳)')}</span>
                                    <span className="text-primary text-base">{formatCurrency(sectionGrandTotal)}</span>
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
