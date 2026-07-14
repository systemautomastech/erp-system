import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate, formatCurrency } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit, Trash2, Eye, Target, DollarSign, Kanban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterButton } from '@/components/ui/filter-button';
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { ListGridToggle } from '@/components/ui/list-grid-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import NoRecordsFound from '@/components/no-records-found';
import Create from './Create';
import EditOpportunity from './Edit';
import { OpportunityModalState, OpportunityFilters } from './types';
import { usePageButtons } from '@/hooks/usePageButtons';

export default function Index() {
    const { t } = useTranslation();
    const { opportunities, auth, accounts, stages, users, contacts } = usePage().props as any;
    const [urlParams] = useState(() => new URLSearchParams(window.location.search));




    const [filters, setFilters] = useState({
        name: urlParams.get('name') || '',
        account_id: urlParams.get('account_id') || '',
        stage_id: urlParams.get('stage_id') || '',
        assign_user_id: urlParams.get('assign_user_id') || '',
        is_active: urlParams.get('is_active') || ''
    });

    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState<OpportunityModalState>({
        isOpen: false,
        mode: '',
        data: null
    });


    useFlashMessages();
    const dropboxBtn = usePageButtons('dropboxBtn', { module: 'Opportunities', settingKey: 'Dropbox Opportunities' });
    const boxBtn = usePageButtons('boxBtn', { module: 'Opportunities', settingKey: 'Box Opportunities' });
    const googleDriveButtons = usePageButtons('googleDriveBtn', { module: 'Opportunities', settingKey: 'GoogleDrive Opportunities' });
    const oneDriveButtons = usePageButtons('oneDriveBtn', { module: 'Opportunities', settingKey: 'OneDrive Opportunities' });

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.opportunities.destroy',
        defaultMessage: t('Are you sure you want to delete this opportunity?')
    });

    const handleFilter = () => {
        router.get(route('sales.opportunities.index'), {...filters, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(route('sales.opportunities.index'), {...filters, per_page: perPage, sort: field, direction, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', account_id: '', stage_id: '', assign_user_id: '', is_active: '' });
        router.get(route('sales.opportunities.index'), {per_page: perPage, view: viewMode});
    };

    const openModal = (mode: 'add' | 'edit', data: any = null) => {
        setModalState({
            isOpen: true,
            mode,
            data
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: '',
            data: null
        });
    };



    const tableColumns = [
        {
            key: 'name',
            header: t('Name'),
            sortable: true
        },
        {
            key: 'account',
            header: t('Account'),
            sortable: true,
            render: (value: any, item: any) => item.account?.name || '-'
        },
        {
            key: 'stage',
            header: t('Stage'),
            render: (value: any, item: any) => {
                if (!item.stage?.name) return '-';
                return (
                    <span
                        className="px-2 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: `${item.stage.color || '#6b7280'}20`,
                            color: item.stage.color || '#6b7280'
                        }}
                    >
                        {item.stage.name}
                    </span>
                );
            }
        },
        {
            key: 'amount',
            header: t('Amount'),
            sortable: true,
            render: (value: number) => formatCurrency(value || 0)
        },
        {
            key: 'probability',
            header: t('Probability'),
            sortable: true,
            render: (value: number) => {
                if (!value) return '-';
                return (
                    <div className="flex items-center gap-2 min-w-24">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${value}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-8">{value}%</span>
                    </div>
                );
            }
        },
        {
            key: 'close_date',
            header: t('Close Date'),
            sortable: true,
            render: (value: string) => value ? formatDate(value) : '-'
        },
        {
            key: 'assign_user',
            header: t('Assigned User'),
            render: (value: any) => value?.name || '-'
        },
        {
            key: 'is_active',
            header: t('Status'),
            sortable: false,
            render: (value: boolean) => (
                <span className={`px-2 py-1 rounded-full text-sm ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {value ? t('Active') : t('Inactive')}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-opportunities', 'edit-sales-opportunities', 'delete-sales-opportunities'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: any) => (
                <div className="flex gap-1">
                    {auth.user?.permissions?.includes('view-sales-opportunities') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.opportunities.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('View')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('edit-sales-opportunities') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('delete-sales-opportunities') && (
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
                    {label: t('Opportunities')}
                ]}
                pageTitle={t('Manage Opportunities')}
                pageActions={
                    <div className="flex gap-2">
                        {dropboxBtn.map((button) => (
                            <div key={button.id}>{button.component}</div>
                        ))}
                        {boxBtn.map((button) => (
                            <div key={button.id}>{button.component}</div>
                        ))}
                        {googleDriveButtons.map((button) => (
                            <div key={button.id}>{button.component}</div>
                        ))}
                        {oneDriveButtons.map((button) => (
                            <div key={button.id}>{button.component}</div>
                        ))}
                        {auth.user?.permissions?.includes('manage-sales-opportunities') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => router.get(route('sales.opportunities.kanban'))}>
                                        <Kanban className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Kanban View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('create-sales-opportunities') && (
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
                <Head title={t('Opportunities')} />

                <Card className="shadow-sm">
                    <CardContent className="p-6 border-b bg-gray-50/50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <SearchInput
                                    value={filters.name}
                                    onChange={(value) => setFilters({...filters, name: value})}
                                    onSearch={handleFilter}
                                    placeholder={t('Search opportunities...')}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <ListGridToggle
                                    currentView={viewMode}
                                    routeName="sales.opportunities.index"
                                    filters={{...filters, per_page: perPage}}
                                />
                                <PerPageSelector
                                    routeName="sales.opportunities.index"
                                    filters={{...filters, view: viewMode}}
                                />
                                <div className="relative">
                                    <FilterButton
                                        showFilters={showFilters}
                                        onToggle={() => setShowFilters(!showFilters)}
                                    />
                                    {(() => {
                                        const activeFilters = [filters.account_id, filters.stage_id, filters.assign_user_id, filters.is_active].filter(Boolean).length;
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
                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${users?.length > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Account')}</label>
                                    <Select value={filters.account_id} onValueChange={(value) => setFilters({...filters, account_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Accounts')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts?.map((account: any) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Stage')}</label>
                                    <Select value={filters.stage_id} onValueChange={(value) => setFilters({...filters, stage_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Stages')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stages?.map((stage: any) => (
                                                <SelectItem key={stage.id} value={stage.id.toString()}>
                                                    {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                                    <Select value={filters.is_active} onValueChange={(value) => setFilters({...filters, is_active: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">{t('Active')}</SelectItem>
                                            <SelectItem value="0">{t('Inactive')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {users?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('Assigned User')}</label>
                                        <Select value={filters.assign_user_id} onValueChange={(value) => setFilters({...filters, assign_user_id: value})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('All Users')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users?.map((user: any) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
                                        data={opportunities?.data || []}
                                        columns={tableColumns}
                                        onSort={handleSort}
                                        sortKey={sortField}
                                        sortDirection={sortDirection as 'asc' | 'desc'}
                                        className="rounded-none"
                                        emptyState={
                                            <NoRecordsFound
                                                icon={Target}
                                                title={t('No opportunities found')}
                                                description={t('Get started by creating your first opportunity.')}
                                                hasFilters={!!(filters.name || filters.account_id || filters.stage_id || filters.assign_user_id || filters.is_active)}
                                                onClearFilters={clearFilters}
                                                createPermission="create-sales-opportunities"
                                                onCreateClick={() => openModal('add')}
                                                createButtonText={t('Create Opportunity')}
                                                className="h-auto"
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-auto max-h-[70vh] p-6">
                                {opportunities?.data?.length > 0 ? (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                                        {opportunities.data.map((opportunity: any) => (
                                            <Card key={opportunity.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                                {/* Header */}
                                                <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <Target className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-semibold text-sm text-gray-900">{opportunity.name}</h3>
                                                            <p className="text-xs font-medium text-gray-600">{opportunity.account?.name || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="p-4 flex-1 min-h-0">
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Amount')}</p>
                                                            <p className="font-medium text-xs">{formatCurrency(opportunity.amount || 0)}</p>
                                                        </div>
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Stage')}</p>
                                                            {opportunity.stage?.name ? (
                                                                <span
                                                                    className="px-2 py-1 rounded-full text-sm font-medium inline-block"
                                                                    style={{
                                                                        backgroundColor: `${opportunity.stage.color || '#6b7280'}20`,
                                                                        color: opportunity.stage.color || '#6b7280'
                                                                    }}
                                                                >
                                                                    {opportunity.stage.name}
                                                                </span>
                                                            ) : (
                                                                <p className="font-medium text-xs">-</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {opportunity.probability && (
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-muted-foreground text-xs uppercase tracking-wide">{t('Probability')}</p>
                                                                <span className="text-xs font-medium text-gray-600">{opportunity.probability}%</span>
                                                            </div>
                                                            <div className="bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${opportunity.probability}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Close Date')}</p>
                                                            <p className="font-medium text-xs">{opportunity.close_date ? formatDate(opportunity.close_date) : '-'}</p>
                                                        </div>
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                            <p className="font-medium text-xs">{opportunity.assign_user?.name || '-'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                            <p className="font-medium text-xs">{formatDate(opportunity.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${opportunity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {opportunity.is_active ? t('Active') : t('Inactive')}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <TooltipProvider>
                                                            {auth.user?.permissions?.includes('view-sales-opportunities') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.opportunities.show', opportunity.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('View')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('edit-sales-opportunities') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openModal('edit', opportunity)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Edit')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('delete-sales-opportunities') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => openDeleteDialog(opportunity.id)}
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
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <NoRecordsFound
                                        icon={Target}
                                        title={t('No opportunities found')}
                                        description={t('Get started by creating your first opportunity.')}
                                        hasFilters={!!(filters.name || filters.account_id || filters.stage_id || filters.assign_user_id || filters.is_active)}
                                        onClearFilters={clearFilters}
                                        createPermission="create-sales-opportunities"
                                        onCreateClick={() => openModal('add')}
                                        createButtonText={t('Create Opportunity')}
                                        className="h-auto"
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>

                    <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                        <Pagination
                            data={opportunities}
                            routeName="sales.opportunities.index"
                            filters={{...filters, per_page: perPage, view: viewMode}}
                        />
                    </CardContent>
                </Card>



                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Opportunity')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />

                <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
                    {modalState.mode === 'add' && (
                        <Create
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            contacts={contacts || []}
                            stages={stages || []}
                            users={users || []}
                        />
                    )}
                    {modalState.mode === 'edit' && modalState.data && (
                        <EditOpportunity
                            opportunity={modalState.data}
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            contacts={contacts || []}
                            stages={stages || []}
                            users={users || []}
                        />
                    )}
                </Dialog>
            </AuthenticatedLayout>
        </TooltipProvider>
    );
}
