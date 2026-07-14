import { HandCoins, Tag, Phone, Calendar } from 'lucide-react';

declare global {
    function route(name: string): string;
}

export const salesCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('Sales Dashboard'),
        href: route('sales.index'),
        permission: 'manage-sales-dashboard',
        parent: 'dashboard',
        order: 60,
    },
    {
        title: t('Sales'),
        icon: HandCoins,
        permission: 'manage-sales',
        parent: '',
        order: 525,
        children: [
            {
                title: t('Accounts'),
                href: route('sales.accounts.index'),
                permission: 'manage-sales-accounts',
            },
            {
                title: t('Contacts'),
                href: route('sales.contacts.index'),
                permission: 'manage-sales-contacts',
            },
            {
                title: t('Opportunities'),
                href: route('sales.opportunities.index'),
                permission: 'manage-sales-opportunities',
            },
            {
                title: t('Quotes'),
                href: route('sales.quotes.index'),
                permission: 'manage-sales-quotes',
            },
            {
                title: t('Sales Orders'),
                href: route('sales.orders.index'),
                permission: 'manage-sales-orders',
            },
            {
                title: t('Cases'),
                href: route('sales.cases.index'),
                permission: 'manage-sales-cases',
            },
            {
                title: t('Calls'),
                href: route('sales.calls.index'),
                permission: 'manage-sales-calls',
            },
            {
                title: t('Meetings'),
                href: route('sales.meetings.index'),
                permission: 'manage-sales-meetings',
            },
            {
                title: t('Documents'),
                href: route('sales.documents.index'),
                permission: 'manage-sales-documents',
            },
            {
                title: t('Streams'),
                href: route('sales.streams.index'),
                permission: 'manage-sales-streams',
            },
            {
                title: t('Reports'),
                permission: 'manage-sales-reports',
                children: [
                    {
                        title: t('Quote Reports'),
                        href: route('sales.reports.quotes'),
                        permission: 'view-sales-reports',
                    },
                    {
                        title: t('Sales Order Reports'),
                        href: route('sales.reports.orders'),
                        permission: 'view-sales-reports',
                    },
                    {
                        title: t('Opportunity Reports'),
                        href: route('sales.reports.opportunities'),
                        permission: 'view-sales-reports',
                    },
                ]
            },
            {
                title: t('System Setup'),
                href: route('sales.account-types.index'),
                permission: 'manage-sales-system-setup',
            },
        ],
    },
];