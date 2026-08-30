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
}

export default function ProductSelector({ products, value, onChange, placeholder }: Props) {
    const { t } = useTranslation();

    const handleChange = (productId: string) => {
        const id = parseInt(productId);
        const product = products.find(p => p.id === id);
        onChange(id, product);
    };

    const displayPlaceholder = placeholder || t('Select Item');

    return (
        <Select value={value ? value.toString() : ''} onValueChange={handleChange} disabled={products.length === 0}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={products.length === 0 ? t('No items found') : displayPlaceholder} />
            </SelectTrigger>
            {products.length > 0 && (
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