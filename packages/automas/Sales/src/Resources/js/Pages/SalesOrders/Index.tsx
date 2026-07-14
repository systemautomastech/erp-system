import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate, formatCurrency } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Copy, FileText, Eye, ShoppingCart, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/search-input";
import { ListGridToggle } from "@/components/ui/list-grid-toggle";
import { PerPageSelector } from "@/components/ui/per-page-selector";
import { FilterButton } from "@/components/ui/filter-button";
import { DataTable } from "@/components/ui/data-table";
import NoRecordsFound from "@/components/no-records-found";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesOrdersIndexProps, SalesOrder } from './types';

// Utility function for calculating amount from items
const calculateItemsAmount = (items: any[]): number => {
    if (!items || items.length === 0) return 0;
    
    const subtotal = items.reduce((total, item) => total + (item.quantity * item.price), 0);
    const totalDiscount = items.reduce((total, item) => total + (parseFloat(item.discount) || 0), 0);
    const totalTax = items.reduce((total, item) => {
        const afterDiscount = (item.quantity * item.price) - (parseFloat(item.discount) || 0);
        return total + (item.product_taxes?.reduce((sum, tax) => sum + (afterDiscount * (parseFloat(tax.rate) || 0) / 100), 0) || 0);
    }, 0);
    
    return subtotal - totalDiscount + totalTax;
};

// Utility function for calculating sales order amount
const calculateSalesOrderAmount = (order: SalesOrder): number => {
    return parseFloat(order.amount?.toString() || '0');
};

interface SalesOrderFilters {
    name: string;
    status: string;
    account: string;
    order_id: string;
    quote_id: string;
    opportunity_id: string;
    assign_user_id: string;
    date_range: string;
}

export default function Index() {
    const { t } = useTranslation();
    const { salesOrders, auth, quotes, opportunities, accounts, contacts, shippingProviders, users } = usePage<SalesOrdersIndexProps>().props;
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
    
    const [filters, setFilters] = useState<SalesOrderFilters>({
        name: urlParams.get('name') || '',
        status: urlParams.get('status') || '',
        account: urlParams.get('account') || '',
        order_id: urlParams.get('order_id') || '',
        quote_id: urlParams.get('quote_id') || '',
        opportunity_id: urlParams.get('opportunity_id') || '',
        assign_user_id: urlParams.get('assign_user_id') || '',
        date_range: (() => {
            const fromDate = urlParams.get('date_from');
            const toDate = urlParams.get('date_to');
            return (fromDate && toDate) ? `${fromDate} - ${toDate}` : '';
        })(),
    });
    
    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [showFilters, setShowFilters] = useState(false);
    const [duplicateState, setDuplicateState] = useState({ isOpen: false, orderId: null as number | null });
    const [convertState, setConvertState] = useState({ isOpen: false, salesOrder: null as SalesOrder | null });

    useFlashMessages();
    
    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.orders.destroy',
        defaultMessage: t('Are you sure you want to delete this sales order?')
    });

    const handleFilter = () => {
        const filterParams = { ...filters };
        
        // Convert date_range to date_from and date_to for backend
        if (filters.date_range) {
            const [fromDate, toDate] = filters.date_range.split(' - ');
            filterParams.date_from = fromDate;
            filterParams.date_to = toDate;
        }
        delete filterParams.date_range;
        
        router.get(route('sales.orders.index'), {...filterParams, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(route('sales.orders.index'), {...filters, per_page: perPage, sort: field, direction, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '', account: '', order_id: '', quote_id: '', opportunity_id: '', assign_user_id: '', date_range: '' });
        router.get(route('sales.orders.index'), {per_page: perPage, view: viewMode});
    };

    const openDuplicateDialog = (orderId: number) => {
        setDuplicateState({ isOpen: true, orderId });
    };

    const closeDuplicateDialog = () => {
        setDuplicateState({ isOpen: false, orderId: null });
    };

    const confirmDuplicate = () => {
        if (duplicateState.orderId) {
            router.post(route('sales.orders.duplicate', duplicateState.orderId));
            closeDuplicateDialog();
        }
    };

    const openConvertDialog = (salesOrder: SalesOrder) => {
        setConvertState({ isOpen: true, salesOrder });
    };

    const closeConvertDialog = () => {
        setConvertState({ isOpen: false, salesOrder: null });
    };

    const confirmConvert = () => {
        if (convertState.salesOrder) {
            router.post(route('sales.orders.convert', convertState.salesOrder.id));
            closeConvertDialog();
        }
    };

    const tableColumns = [
        {
            key: 'id',
            header: t('Order Number'),
            sortable: true,
            render: (value: string, order: any) =>
                auth.user?.permissions?.includes('view-sales-orders') ? (
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.orders.show', order.id))}>#{order.order_number || order.order_number || value}</span>
                ) : (
                    `#${order.order_number || value}`
                )
        },
        {
            key: 'name',
            header: t('Name'),
            sortable: true
        },
        {
            key: 'account',
            header: t('Account'),
            sortable: true,
            render: (_: any, item: SalesOrder) => item.account?.name || '-'
        },
        {
            key: 'order_date',
            header: t('Order Date'),
            sortable: true,
            render: (value: string) => formatDate(value)
        },
        {
            key: 'amount',
            header: t('Amount'),
            sortable: true,
            render: (value: any, order: SalesOrder) => {
                const calculatedAmount = calculateSalesOrderAmount(order);
                return formatCurrency(calculatedAmount);
            }
        },
        {
            key: 'assign_user',
            header: t('Assigned User'),
            sortable: false,
            render: (_: any, item: SalesOrder) => item.assign_user?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                    value?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                    value?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                    value?.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    value?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                    value?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                    value?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {value}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-orders', 'edit-sales-orders', 'delete-sales-orders','convert-sales-orders'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: SalesOrder) => (
                <div className="flex gap-1">
                    {auth.user?.permissions?.includes('create-sales-orders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openDuplicateDialog(item.id)} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Duplicate')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    
                    {auth.user?.permissions?.includes('convert-sales-orders') && !item.is_invoiced ? (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openConvertDialog(item)} className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Convert To Sales Invoice')}</p></TooltipContent>
                        </Tooltip>
                    ) : item.is_invoiced ? (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => router.get(route('sales-invoices.show', item.invoice_id))} className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700">
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Invoice Details')}</p></TooltipContent>
                        </Tooltip>
                    ) : null}

                    {auth.user?.permissions?.includes('view-sales-orders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('View')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('edit-sales-orders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.edit', item.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('delete-sales-orders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(item.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Delete')}</p></TooltipContent>
                        </Tooltip>
                    )}
                </div>
            )
        }] : [])
    ];

    return (
        <TooltipProvider>
            <AuthenticatedLayout
                breadcrumbs={[
                    {label: t('Sales'), url: route('sales.index')},
                    {label: t('Sales Orders')}
                ]}
                pageTitle={t('Manage Sales Orders')}
                pageActions={
                    <div className="flex gap-2">
                        {auth.user?.permissions?.includes('create-sales-orders') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button size="sm" onClick={() => router.get(route('sales.orders.create'))}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Create')}</p></TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                }
        >
            <Head title={t('Sales Orders')} />

            <Card className="shadow-sm">
                <CardContent className="p-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                value={filters.name}
                                onChange={(value) => setFilters({...filters, name: value})}
                                onSearch={handleFilter}
                                placeholder={t('Search sales orders...')}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <ListGridToggle
                                currentView={viewMode}
                                routeName="sales.orders.index"
                                filters={{...filters, per_page: perPage}}
                            />
                            <PerPageSelector
                                routeName="sales.orders.index"
                                filters={{...filters, view: viewMode}}
                            />
                            <div className="relative">
                                <FilterButton 
                                    showFilters={showFilters}
                                    onToggle={() => setShowFilters(!showFilters)}
                                />
                                {(() => {
                                    const activeFilters = [filters.status, filters.account, filters.assign_user_id, filters.order_id, filters.quote_id, filters.opportunity_id, filters.date_range].filter(Boolean).length;
                                    return activeFilters > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                            {activeFilters}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </CardContent>

                {showFilters && (
                    <CardContent className="p-6 bg-blue-50/30 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-4">

                            {auth.user?.permissions?.includes('manage-sales-accounts') && accounts?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Account')}</label>
                                    <Select value={filters.account} onValueChange={(value) => setFilters({...filters, account: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Accounts')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts?.map((account) => (
                                                <SelectItem key={account.id} value={account.name}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {auth.user?.permissions?.includes('manage-sales-quotes') && quotes?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Quote')}</label>
                                    <Select value={filters.quote_id} onValueChange={(value) => setFilters({...filters, quote_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Quotes')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {quotes?.map((quote: any) => (
                                                <SelectItem key={quote.id} value={quote.id.toString()}>
                                                    {quote.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {auth.user?.permissions?.includes('manage-sales-opportunities') && opportunities?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Opportunity')}</label>
                                    <Select value={filters.opportunity_id} onValueChange={(value) => setFilters({...filters, opportunity_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Opportunities')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {opportunities?.map((opportunity: any) => (
                                                <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                                                    {opportunity.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {auth.user?.permissions?.includes('manage-users') && users?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Assigned User')}</label>
                                    <Select value={filters.assign_user_id} onValueChange={(value) => setFilters({...filters, assign_user_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Users')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">{t('Draft')}</SelectItem>
                                        <SelectItem value="Confirmed">{t('Confirmed')}</SelectItem>
                                        <SelectItem value="Processing">{t('Processing')}</SelectItem>
                                        <SelectItem value="Shipped">{t('Shipped')}</SelectItem>
                                        <SelectItem value="Delivered">{t('Delivered')}</SelectItem>
                                        <SelectItem value="Cancelled">{t('Cancelled')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Date Range')}</label>
                                <DateRangePicker
                                    value={filters.date_range}
                                    onChange={(value) => setFilters({...filters, date_range: value})}
                                    placeholder={t('Select date range')}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} size="sm">{t('Apply')}</Button>
                                <Button variant="outline" onClick={clearFilters} size="sm">{t('Clear')}</Button>
                            </div>
                            {filters.date_range && (
                                <div className="col-span-full">
                                    <div className="text-sm text-gray-600">
                                        <span>{t('Date Range')}: {filters.date_range}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}

                <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[70vh] rounded-none w-full">
                            <div className="min-w-[800px]">
                                <DataTable
                                    data={salesOrders?.data || []}
                                    columns={tableColumns}
                                    onSort={handleSort}
                                    sortKey={sortField}
                                    sortDirection={sortDirection as 'asc' | 'desc'}
                                    className="rounded-none"
                                    emptyState={
                                        <NoRecordsFound
                                            icon={ShoppingCart}
                                            title={t('No sales orders found')}
                                            description={t('Get started by creating your first sales order.')}
                                            hasFilters={!!(filters.name || filters.status || filters.account || filters.order_id || filters.quote_id || filters.opportunity_id || filters.assign_user_id || filters.date_range)}
                                            onClearFilters={clearFilters}
                                            createPermission="create-sales-orders"
                                            onCreateClick={() => router.get(route('sales.orders.create'))}
                                            createButtonText={t('Create Sales Order')}
                                            className="h-auto"
                                        />
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[70vh] p-6">
                            {salesOrders?.data?.length > 0 ? (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                                    {salesOrders.data.map((order) => (
                                        <Card key={order.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                            {/* Header */}
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-sm text-gray-900">
                                                            {auth.user?.permissions?.includes('view-sales-orders') ? (
                                                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.orders.show', order.id))}>#{order.order_number || order.id}</span>
                                                            ) : (
                                                                `#${order.order_number || order.id}`
                                                            )}
                                                        </h3>
                                                        <p className="text-xs font-medium text-gray-600">{order.name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex-1 min-h-0">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Amount')}</p>
                                                        <p className="font-medium text-xs">{formatCurrency(calculateSalesOrderAmount(order))}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Account')}</p>
                                                        <p className="font-medium text-xs">{order.account?.name || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Order Date')}</p>
                                                        <p className="font-medium text-xs">{formatDate(order.order_date)}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Quote')}</p>
                                                        <p className="font-medium text-xs">{order.quote?.name || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                        <p className="font-medium text-xs">{order.assign_user?.name || '-'}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                        <p className="font-medium text-xs">{formatDate(order.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                                    order.status?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    order.status?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status?.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                    order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    order.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                {auth.user?.permissions?.some((p: string) => ['view-sales-orders', 'edit-sales-orders', 'delete-sales-orders','convert-sales-orders','create-sales-orders'].includes(p)) && (
                                                    <div className="flex gap-1">
                                                        {auth.user?.permissions?.includes('create-sales-orders') && (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" onClick={() => openDuplicateDialog(order.id)} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700">
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Duplicate')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        
                                                        {auth.user?.permissions?.includes('convert-sales-orders') && !order.is_invoiced ? (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" onClick={() => openConvertDialog(order)} className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700">
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Convert To Sales Invoice')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : order.is_invoiced ? (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales-invoices.show', order.invoice_id))} className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700">
                                                                        <FileText className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Invoice Details')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : null}

                                                        {auth.user?.permissions?.includes('view-sales-orders') && (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', order.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('View')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {auth.user?.permissions?.includes('edit-sales-orders') && (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.edit', order.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Edit')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {auth.user?.permissions?.includes('delete-sales-orders') && (
                                                            <Tooltip delayDuration={0}>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => openDeleteDialog(order.id)}
                                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Delete')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <NoRecordsFound
                                    icon={ShoppingCart}
                                    title={t('No sales orders found')}
                                    description={t('Get started by creating your first sales order.')}
                                    hasFilters={!!(filters.name || filters.status || filters.account || filters.order_id || filters.quote_id || filters.opportunity_id || filters.assign_user_id || filters.date_range)}
                                    onClearFilters={clearFilters}
                                    createPermission="create-sales-orders"
                                    onCreateClick={() => router.get(route('sales.orders.create'))}
                                    createButtonText={t('Create Sales Order')}
                                    className="h-auto"
                                />
                            )}
                        </div>
                    )}
                </CardContent>

                <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                    <Pagination
                        data={salesOrders}
                        routeName="sales.orders.index"
                        filters={{...filters, per_page: perPage, view: viewMode}}
                    />
                </CardContent>
            </Card>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Sales Order')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />

            <ConfirmationDialog
                open={duplicateState.isOpen}
                onOpenChange={closeDuplicateDialog}
                title={t('Duplicate Sales Order')}
                message={t('Are you sure you want to duplicate this sales order?')}
                confirmText={t('Yes')}
                onConfirm={confirmDuplicate}
            />

            <ConfirmationDialog
                open={convertState.isOpen}
                onOpenChange={closeConvertDialog}
                title={t('Convert to Sales Invoice')}
                message={t('Are you sure you want to convert this sales order to an sales invoice?')}
                confirmText={t('Convert')}
                onConfirm={confirmConvert}
            />
        </AuthenticatedLayout>
        </TooltipProvider>
    );
}