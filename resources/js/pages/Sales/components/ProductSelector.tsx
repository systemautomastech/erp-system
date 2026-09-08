import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
    id: number;
    name: string;
    sale_price: number;
    description?: string;
    long_description?: string;
    unit?: string;
    unit_name?: string;
    type?: string;
    taxes?: Array<{ id: number; tax_name: string; rate: number }>;
}

interface Props {
    products: Product[];
    value: number;
    onChange: (productId: number, product?: Product) => void;
    placeholder?: string;
    warehouseId?: string | number;
    disabled?: boolean;
}

export default function ProductSelector({ products, value, onChange, placeholder, warehouseId, disabled }: Props) {
    const { t } = useTranslation();

    const isWarehouseMissing = warehouseId !== undefined && (!warehouseId || String(warehouseId).trim() === '' || String(warehouseId) === '0');

    const handleChange = (productId: string) => {
        const id = parseInt(productId);
        const product = products.find(p => p.id === id);
        onChange(id, product);
    };

    let displayPlaceholder = placeholder || t('Select Item');
    if (isWarehouseMissing) {
        displayPlaceholder = t('Select Warehouse First');
    } else if (products.length === 0) {
        displayPlaceholder = t('No items found');
    }

    const isDisabled = disabled || isWarehouseMissing || products.length === 0;

    return (
        <Select value={value ? value.toString() : ''} onValueChange={handleChange} disabled={isDisabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={displayPlaceholder} />
            </SelectTrigger>
            {!isDisabled && products.length > 0 && (
                <SelectContent searchable>
                    {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            )}
        </Select>
    );
}