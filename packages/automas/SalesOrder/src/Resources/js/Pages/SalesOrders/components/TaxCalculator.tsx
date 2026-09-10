import { useMemo } from 'react';
import { SalesOrderItem } from '../types';

export function useTaxCalculator(items: SalesOrderItem[]) {
    return useMemo(() => {
        let subtotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;

        items.forEach(item => {
            const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
            const itemDiscount = (lineTotal * (item.discount_percentage || 0)) / 100;
            const afterDiscount = lineTotal - itemDiscount;
            const itemTax = (afterDiscount * (item.tax_percentage || 0)) / 100;

            subtotal += lineTotal;
            discountAmount += itemDiscount;
            taxAmount += itemTax;
        });

        const total = subtotal - discountAmount + taxAmount;

        return {
            subtotal,
            discountAmount,
            taxAmount,
            total
        };
    }, [items]);
}
