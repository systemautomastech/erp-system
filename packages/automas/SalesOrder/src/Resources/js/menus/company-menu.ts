import { ShoppingCart } from 'lucide-react';

declare global {
    function route(name: string, params?: any): string;
}

export const salesOrderCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('Sales Orders'),
        icon: ShoppingCart,
        permission: 'manage-sales-orders',
        parent: '',
        order: 35,
        children: [
            {
                title: t('Sales Orders'),
                href: route('salesorder.orders.index'),
                permission: 'manage-sales-orders',
            },
            {
                title: t('System Setup'),
                href: route('salesorder.settings.show'),
                permission: 'manage-sales-order-settings',
            },
        ],
    },
];