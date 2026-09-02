import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    sale_price: number;
    unit?: string;
    taxes?: Array<{ id: number; tax_name: string; rate: number }>;
}

interface Props {
    products: Product[];
    value: number;
    warehouseId?: string | number | null;
    onChange: (productId: number, product?: Product) => void;
}

export default function ProductSelector({ products, value, warehouseId, onChange }: Props) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const hasWarehouse = Boolean(warehouseId && String(warehouseId).trim() !== '' && String(warehouseId) !== '0');

    const handleChange = (productId: string) => {
        const id = parseInt(productId);
        const product = products.find(p => p.id === id);
        onChange(id, product);
    };

    const handleOpenChange = (open: boolean) => {
        if (open) {
            if (!hasWarehouse) {
                toast.warning(t('Please select a warehouse first'), { id: 'warehouse-warning' });
                setIsOpen(false);
                return;
            }
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    return (
        <Select
            open={isOpen}
            value={value ? value.toString() : ''}
            onValueChange={handleChange}
            onOpenChange={handleOpenChange}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={t('Select Product')} />
            </SelectTrigger>
            <SelectContent searchable>
                {products.length === 0 ? (
                    <div className="py-3 px-2 text-xs text-center text-muted-foreground">
                        {t('No products found')}
                    </div>
                ) : (
                    products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}
