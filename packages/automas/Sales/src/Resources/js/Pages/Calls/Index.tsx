import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';

import { formatDate } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Phone } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";
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
import CreateSalesCall from './Create';
import EditSalesCall from './Edit';
import { SalesCallsIndexProps, SalesCallModalState, SalesCall } from './types';

interface SalesCallFilters {
    name: string;
    status: string;
    direction: string;
    parent_type: string;
    account_id: string;
    assigned_user_id: string;
    date_range: string;
}

export default function Index() {
    const { t } = useTranslation();
    const { salesCalls, auth, accounts, users } = usePage<SalesCallsIndexProps>().props;
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
    
    const [filters, setFilters] = useState<SalesCallFilters>({
        name: urlParams.get('name') || '',
        status: urlParams.get('status') || '',
        direction: urlParams.get('direction') || '',
        parent_type: urlParams.get('parent_type') || '',
        account_id: urlParams.get('account_id') || '',
        assigned_user_id: urlParams.get('assigned_user_id') || '',
        date_range: (() => {
            const fromDate = urlParams.get('date_from');
            const toDate = urlParams.get('date_to');
            return (fromDate && toDate) ? `${fromDate} - ${toDate}` : '';
        })()
    });
    
    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('sort_direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [modalState, setModalState] = useState<SalesCallModalState>({
        isOpen: false,
        mode: '',
        data: null
    });
    const [showFilters, setShowFilters] = useState(false);

    useFlashMessages();
    

    
    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.calls.destroy',
        defaultMessage: t('Are you sure you want to delete this call?')
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
        
        router.get(route('sales.calls.index'), {...filterParams, per_page: perPage, sort: sortField, sort_direction: sortDirection, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(route('sales.calls.index'), {...filters, per_page: perPage, sort: field, sort_direction: direction, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '', direction: '', parent_type: '', account_id: '', assigned_user_id: '', date_range: '' });
        router.get(route('sales.calls.index'), {per_page: perPage, view: viewMode});
    };

    const openModal = (mode: 'add' | 'edit', data: SalesCall | null = null) => {
        setModalState({ isOpen: true, mode, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: '', data: null });
    };

    const tableColumns = [
        {
            key: 'name',
            header: t('Name'),
            sortable: true,
            render: (value: string) => value
        },
        {
            key: 'parent_type',
            header: t('Parent'),
            sortable: false,
            render: (value: string) => (
                <span className="capitalize">{value || '-'}</span>
            )
        },
        {
            key: 'account',
            header: t('Account'),
            sortable: true,
            render: (_: any, item: SalesCall) => item.account?.name || '-'
        },
        {
            key: 'direction',
            header: t('Direction'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                    value?.toLowerCase() === 'inbound' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'start_date',
            header: t('Start Date'),
            sortable: true,
            render: (value: string) => formatDate(value)
        },
        {
            key: 'assigned_user',
            header: t('Assigned User'),
            sortable: false,
            render: (value: any) => value?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                    value?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    value?.toLowerCase() === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    value?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    value?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {value?.replace('_', ' ')}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-calls', 'edit-sales-calls', 'delete-sales-calls'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: SalesCall) => (
                <div className="flex gap-1">
                    <TooltipProvider>
                        {auth.user?.permissions?.includes('view-sales-calls') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.calls.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('edit-sales-calls') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('delete-sales-calls') && (
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
                    {label: t('Calls')}
                ]}
                pageTitle={t('Manage Calls')}
                pageActions={
                    <div className="flex gap-2">
                        {auth.user?.permissions?.includes('create-sales-calls') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button size="sm" onClick={() => openModal('add')}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Create')}</p></TooltipContent>
                            </Tooltip>
                        )}

                    </div>
                }
        >
            <Head title={t('Calls')} />

            <Card className="shadow-sm">
                <CardContent className="p-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                value={filters.name}
                                onChange={(value) => setFilters({...filters, name: value})}
                                onSearch={handleFilter}
                                placeholder={t('Search calls...')}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <ListGridToggle
                                currentView={viewMode}
                                routeName="sales.calls.index"
                                filters={{...filters, per_page: perPage}}
                            />
                            <PerPageSelector
                                routeName="sales.calls.index"
                                filters={{...filters, view: viewMode}}
                            />
                            <div className="relative">
                                <FilterButton 
                                    showFilters={showFilters}
                                    onToggle={() => setShowFilters(!showFilters)}
                                />
                                {(() => {
                                    const activeFilters = [filters.status, filters.direction, filters.parent_type, filters.account_id, filters.assigned_user_id, filters.date_range].filter(Boolean).length;
                                    return activeFilters > 0 ? (
                                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {activeFilters}
                                        </span>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>
                </CardContent>

                {showFilters && (
                    <CardContent className="p-6 bg-blue-50/30 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">{t('Scheduled')}</SelectItem>
                                        <SelectItem value="in_progress">{t('In Progress')}</SelectItem>
                                        <SelectItem value="completed">{t('Completed')}</SelectItem>
                                        <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Direction')}</label>
                                <Select value={filters.direction} onValueChange={(value) => setFilters({...filters, direction: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Directions')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inbound">{t('Inbound')}</SelectItem>
                                        <SelectItem value="outbound">{t('Outbound')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Parent Type')}</label>
                                <Select value={filters.parent_type} onValueChange={(value) => setFilters({...filters, parent_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Types')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="account">{t('Account')}</SelectItem>
                                        <SelectItem value="contact">{t('Contact')}</SelectItem>
                                        <SelectItem value="opportunity">{t('Opportunity')}</SelectItem>
                                        <SelectItem value="case">{t('Case')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                            {auth.user?.permissions?.includes('manage-users') && users?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Assigned User')}</label>
                                    <Select value={filters.assigned_user_id} onValueChange={(value) => setFilters({...filters, assigned_user_id: value})}>
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
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter} size="sm">{t('Apply')}</Button>
                                <Button variant="outline" onClick={clearFilters} size="sm">{t('Clear')}</Button>
                            </div>

                        </div>
                    </CardContent>
                )}

                <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[70vh] rounded-none w-full">
                            <div className="min-w-[800px]">
                                <DataTable
                                    data={salesCalls?.data || []}
                                    columns={tableColumns}
                                    onSort={handleSort}
                                    sortKey={sortField}
                                    sortDirection={sortDirection as 'asc' | 'desc'}
                                    className="rounded-none"
                                    emptyState={
                                        <NoRecordsFound
                                            icon={Phone}
                                            title={t('No calls found')}
                                            description={t('Get started by creating your first call.')}
                                            hasFilters={!!(filters.name || filters.status || filters.direction || filters.parent_type || filters.account_id || filters.assigned_user_id || filters.date_range)}
                                            onClearFilters={clearFilters}
                                            createPermission="create-sales-calls"
                                            onCreateClick={() => openModal('add')}
                                            createButtonText={t('Create Call')}
                                            className="h-auto"
                                        />
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[70vh] p-6">
                            {salesCalls?.data?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {salesCalls.data.map((call) => (
                                        <Card key={call.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                            {/* Header */}
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Phone className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-sm text-gray-900">{call.name}</h3>
                                                        <p className="text-xs font-medium text-gray-600">{call.account?.name || t('No Account')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex-1 min-h-0">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Direction')}</p>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                                            call.direction?.toLowerCase() === 'inbound' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {call.direction}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Parent')}</p>
                                                        <p className="font-medium text-xs capitalize">{call.parent_type || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Start Date')}</p>
                                                        <p className="font-medium text-xs">{formatDate(call.start_date)}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('End Date')}</p>
                                                        <p className="font-medium text-xs">{formatDate(call.end_date)}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                        <p className="font-medium text-xs">{call.assigned_user?.name || '-'}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                        <p className="font-medium text-xs">{formatDate(call.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                                    call.status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    call.status?.toLowerCase() === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    call.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                                    call.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {call.status?.replace('_', ' ')}
                                                </span>
                                                {auth.user?.permissions?.some((p: string) => ['view-sales-calls', 'edit-sales-calls', 'delete-sales-calls'].includes(p)) && (
                                                    <div className="flex gap-1">
                                                        <TooltipProvider>
                                                            {auth.user?.permissions?.includes('view-sales-calls') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.calls.show', call.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('View')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('edit-sales-calls') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openModal('edit', call)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Edit')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('delete-sales-calls') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(call.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
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
                                    icon={Phone}
                                    title={t('No calls found')}
                                    description={t('Get started by creating your first call.')}
                                    hasFilters={!!(filters.name || filters.status || filters.direction || filters.parent_type || filters.account_id || filters.assigned_user_id || filters.date_range)}
                                    onClearFilters={clearFilters}
                                    createPermission="create-sales-calls"
                                    onCreateClick={() => openModal('add')}
                                    createButtonText={t('Create Call')}
                                    className="h-auto"
                                />
                            )}
                        </div>
                    )}
                </CardContent>

                <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                    <Pagination
                        data={salesCalls}
                        routeName="sales.calls.index"
                        filters={{...filters, per_page: perPage, view: viewMode}}
                    />
                </CardContent>
            </Card>

            <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
                {modalState.mode === 'add' && (
                    <CreateSalesCall onSuccess={closeModal} users={users} accounts={accounts} />
                )}
                {modalState.mode === 'edit' && modalState.data && (
                    <EditSalesCall
                        salesCall={modalState.data}
                        onSuccess={closeModal}
                        users={users}
                        accounts={accounts}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Call')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </AuthenticatedLayout>
        </TooltipProvider>
    );
}