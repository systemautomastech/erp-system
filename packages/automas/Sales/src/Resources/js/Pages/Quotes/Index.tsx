import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate, formatCurrency } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Copy, Eye, Edit, Trash2, RotateCcw, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { ListGridToggle } from "@/components/ui/list-grid-toggle";
import { PerPageSelector } from "@/components/ui/per-page-selector";
import { FilterButton } from '@/components/ui/filter-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import NoRecordsFound from '@/components/no-records-found';
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

import { QuotesIndexProps, SalesQuote } from './types';

// Utility function for status colors
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'draft': return 'bg-yellow-100 text-yellow-800';
        case 'sent': return 'bg-blue-100 text-blue-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'declined': return 'bg-red-100 text-red-800';
        case 'expired': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

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

// Utility function for calculating quote amount
const calculateQuoteAmount = (quote: SalesQuote): number => {
    return parseFloat(quote.amount?.toString() || '0');
};

interface QuoteFilters {
    name: string;
    status: string;
    account_id: string;
    assign_user_id: string;
    date_range: string;
    opportunity_id: string;
}

export default function Index() {
    const { t } = useTranslation();
    const { quotes, auth, accounts, users, opportunities, contacts, shippingProviders } = usePage<QuotesIndexProps>().props;
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
    
    // Memoize quote amounts for grid view performance
    const quotesWithCalculatedAmounts = useMemo(() => {
        return quotes?.data?.map(quote => ({
            ...quote,
            calculatedAmount: calculateQuoteAmount(quote)
        })) || [];
    }, [quotes?.data]);
    
    // Calculate date range outside of useState to avoid hooks rule violation
    const initialDateRange = useMemo(() => {
        const fromDate = urlParams.get('date_from');
        const toDate = urlParams.get('date_to');
        return (fromDate && toDate) ? `${fromDate} - ${toDate}` : '';
    }, [urlParams]);
    
    const [filters, setFilters] = useState<QuoteFilters>({
        name: urlParams.get('name') || '',
        status: urlParams.get('status') || '',
        account_id: urlParams.get('account_id') || '',
        assign_user_id: urlParams.get('assign_user_id') || '',
        date_range: initialDateRange,
        opportunity_id: urlParams.get('opportunity_id') || ''
    });

    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [showFilters, setShowFilters] = useState(false);
    const [duplicateState, setDuplicateState] = useState({ isOpen: false, quoteId: null as number | null });
    const [convertState, setConvertState] = useState({ isOpen: false, quoteId: null as number | null });


    useFlashMessages();

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.quotes.destroy',
        defaultMessage: t('Are you sure you want to delete this quote?')
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
        
        router.get(route('sales.quotes.index'), {...filterParams, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(route('sales.quotes.index'), {...filters, per_page: perPage, sort: field, direction, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '', account_id: '', assign_user_id: '', date_range: '', opportunity_id: '' });
        router.get(route('sales.quotes.index'), {per_page: perPage, view: viewMode});
    };

    const openDuplicateDialog = (quoteId: number) => {
        setDuplicateState({ isOpen: true, quoteId });
    };

    const closeDuplicateDialog = () => {
        setDuplicateState({ isOpen: false, quoteId: null });
    };

    const confirmDuplicate = () => {
        if (duplicateState.quoteId) {
            router.post(route('sales.quotes.duplicate', duplicateState.quoteId));
            closeDuplicateDialog();
        }
    };

    const openConvertDialog = (quoteId: number) => {
        setConvertState({ isOpen: true, quoteId });
    };

    const closeConvertDialog = () => {
        setConvertState({ isOpen: false, quoteId: null });
    };

    const confirmConvert = () => {
        if (convertState.quoteId) {
            router.post(route('sales.quotes.convert', convertState.quoteId));
            closeConvertDialog();
        }
    };
    


    const tableColumns = [
        {
            key: 'quote_number',
            header: t('Quote Number'),
            sortable: true,
            render: (value: string, quote: any) =>
                auth.user?.permissions?.includes('view-sales-quotes') ? (
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.quotes.show', quote.id))}>#{value}</span>
                ) : (
                    `#${value}`
                )
        },
        {
            key: 'name',
            header: t('Name'),
            sortable: true
        },
        {
            key: 'account.name',
            header: t('Account'),
            sortable: true,
            render: (_: any, item: SalesQuote) => item.account?.name || '-'
        },
        {
            key: 'date_quoted',
            header: t('Date Quoted'),
            sortable: true,
            render: (value: string) => formatDate(value)
        },
        {
            key: 'amount',
            header: t('Amount'),
            sortable: true,
            render: (value: string | number, quote: SalesQuote) => {
                const calculatedAmount = calculateQuoteAmount(quote);
                return formatCurrency(calculatedAmount);
            }
        },
        {
            key: 'assign_user_id',
            header: t('Assigned User'),
            render: (_: any, item: SalesQuote) => item.assignUser?.name || item.assign_user?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(value)}`}>
                    {value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase()}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-quotes', 'edit-sales-quotes', 'delete-sales-quotes','convert-sales-quotes'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: SalesQuote) => (
                <div className="flex gap-1">
                    <TooltipProvider>
                        {auth.user?.permissions?.includes('print-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => window.open(route('sales.quotes.print', item.id) + '?download=pdf', '_blank')} className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Download PDF')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('create-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openDuplicateDialog(item.id)} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Duplicate')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        
                        {auth.user?.permissions?.includes('convert-sales-quotes') && !item.is_converted ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openConvertDialog(item.id)} className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Convert To Sale Order')}</p></TooltipContent>
                            </Tooltip>
                        ) : item.is_converted ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', item.converted_salesorder_id))} className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Sales Order Details')}</p></TooltipContent>
                            </Tooltip>
                        ) : null}

                        {auth.user?.permissions?.includes('view-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('edit-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.edit', item.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('delete-sales-quotes') && (
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
                    </TooltipProvider>
                </div>
            )
        }] : [])
    ];

    return (
        <TooltipProvider>
            <AuthenticatedLayout
                breadcrumbs={[
                    {label: t('Sales'), url: route('sales.index')},
                    {label: t('Quotes')}
                ]}
                pageTitle={t('Manage Quotes')}
                pageActions={
                    <div className="flex gap-2">
                        {auth.user?.permissions?.includes('create-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button size="sm" onClick={() => router.visit(route('sales.quotes.create'))}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Create')}</p></TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                }
        >
            <Head title={t('Quotes')} />

            <Card className="shadow-sm">
                <CardContent className="p-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                value={filters.name}
                                onChange={(value) => setFilters({...filters, name: value})}
                                onSearch={handleFilter}
                                placeholder={t('Search quotes...')}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <ListGridToggle
                                currentView={viewMode}
                                routeName="sales.quotes.index"
                                filters={{...filters, per_page: perPage}}
                            />
                            <PerPageSelector
                                routeName="sales.quotes.index"
                                filters={{...filters, view: viewMode}}
                            />
                            <div className="relative">
                                <FilterButton 
                                    showFilters={showFilters}
                                    onToggle={() => setShowFilters(!showFilters)}
                                />
                                {(() => {
                                    const activeFilters = [filters.status, filters.account_id, filters.assign_user_id, filters.opportunity_id, filters.date_range].filter(Boolean).length;
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
                                    <Select value={filters.account_id} onValueChange={(value) => setFilters({...filters, account_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Accounts')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts?.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.name}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Date Range')}</label>
                                <DateRangePicker
                                    value={filters.date_range}
                                    onChange={(value) => setFilters({...filters, date_range: value})}
                                    placeholder={t('Select date range')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">{t('Draft')}</SelectItem>
                                        <SelectItem value="Sent">{t('Sent')}</SelectItem>
                                        <SelectItem value="Accepted">{t('Accepted')}</SelectItem>
                                        <SelectItem value="Declined">{t('Declined')}</SelectItem>
                                        <SelectItem value="Expired">{t('Expired')}</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <div className="min-w-[1000px]">
                                <DataTable
                                    data={quotes?.data || []}
                                    columns={tableColumns}
                                    onSort={handleSort}
                                    sortKey={sortField}
                                    sortDirection={sortDirection as 'asc' | 'desc'}
                                    className="rounded-none"
                                    emptyState={
                                        <NoRecordsFound
                                            icon={FileText}
                                            title={t('No quotes found')}
                                            description={t('Get started by creating your first quote.')}
                                            hasFilters={!!(filters.name || filters.status || filters.account_id || filters.assign_user_id || filters.opportunity_id || filters.date_range)}
                                            onClearFilters={clearFilters}
                                            createPermission="create-sales-quotes"
                                            onCreateClick={() => router.visit(route('sales.quotes.create'))}
                                            createButtonText={t('Create Quote')}
                                            className="h-auto"
                                        />
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[70vh] p-6">
                            {quotes?.data?.length > 0 ? (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                                    {quotesWithCalculatedAmounts.map((quote) => (
                                        <Card key={quote.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                            {/* Header */}
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-sm text-gray-900">
                                                            {auth.user?.permissions?.includes('view-sales-quotes') ? (
                                                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.quotes.show', quote.id))}>#{quote.quote_number}</span>
                                                            ) : (
                                                                `#${quote.quote_number}`
                                                            )}
                                                        </h3>
                                                        <p className="text-xs font-medium text-gray-600">{quote.name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex-1 min-h-0">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Amount')}</p>
                                                        <p className="font-medium text-xs">{formatCurrency(quote.calculatedAmount)}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Account')}</p>
                                                        <p className="font-medium text-xs">{quote.account?.name || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Date Quoted')}</p>
                                                        <p className="font-medium text-xs">{formatDate(quote.date_quoted)}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Opportunity')}</p>
                                                        <p className="font-medium text-xs">{quote.opportunity?.name || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                        <p className="font-medium text-xs">{quote.assignUser?.name || quote.assign_user?.name || '-'}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                        <p className="font-medium text-xs">{formatDate(quote.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                                                    {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1).toLowerCase()}
                                                </span>
                                                {auth.user?.permissions?.some((p: string) => ['view-sales-quotes', 'edit-sales-quotes', 'delete-sales-quotes','convert-sales-quotes','create-sales-quotes'].includes(p)) && (
                                                    <div className="flex gap-1">
                                                        <TooltipProvider>
                                                            {auth.user?.permissions?.includes('print-sales-quotes') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => window.open(route('sales.quotes.print', quote.id) + '?download=pdf', '_blank')} className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700">
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Download PDF')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('create-sales-quotes') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openDuplicateDialog(quote.id)} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700">
                                                                            <Copy className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Duplicate')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            
                                                            {auth.user?.permissions?.includes('convert-sales-quotes') && !quote.is_converted ? (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openConvertDialog(quote.id)} className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700">
                                                                            <RotateCcw className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Convert To Sale Order')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ) : quote.is_converted ? (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', quote.converted_salesorder_id))} className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700">
                                                                            <FileText className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Sales Order Details')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ) : null}

                                                            {auth.user?.permissions?.includes('view-sales-quotes') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.show', quote.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('View')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('edit-sales-quotes') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.edit', quote.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Edit')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('delete-sales-quotes') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => openDeleteDialog(quote.id)}
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
                                                        </TooltipProvider>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <NoRecordsFound
                                    icon={FileText}
                                    title={t('No quotes found')}
                                    description={t('Get started by creating your first quote.')}
                                    hasFilters={!!(filters.name || filters.status || filters.account_id || filters.assign_user_id || filters.opportunity_id || filters.date_range)}
                                    onClearFilters={clearFilters}
                                    createPermission="create-sales-quotes"
                                    onCreateClick={() => router.visit(route('sales.quotes.create'))}
                                    createButtonText={t('Create Quote')}
                                    className="h-auto"
                                />
                            )}
                        </div>
                    )}
                </CardContent>

                <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                    <Pagination
                        data={quotes}
                        routeName="sales.quotes.index"
                        filters={{...filters, per_page: perPage, view: viewMode}}
                    />
                </CardContent>
            </Card>

                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Quote')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />

                <ConfirmationDialog
                    open={duplicateState.isOpen}
                    onOpenChange={closeDuplicateDialog}
                    title={t('Duplicate Quote')}
                    message={t('Are you sure you want to duplicate this quote?')}
                    confirmText={t('Yes')}
                    onConfirm={confirmDuplicate}
                />

                <ConfirmationDialog
                    open={convertState.isOpen}
                    onOpenChange={closeConvertDialog}
                    title={t('Convert to Sales Order')}
                    message={t('Are you sure you want to convert this quote to a sales order?')}
                    confirmText={t('Convert')}
                    onConfirm={confirmConvert}
                />


            </AuthenticatedLayout>
        </TooltipProvider>
    );
}