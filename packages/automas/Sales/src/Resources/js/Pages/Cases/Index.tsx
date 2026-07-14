import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate } from '@/utils/helpers';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, Edit, Trash2, Download, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { ListGridToggle } from "@/components/ui/list-grid-toggle";
import { PerPageSelector } from "@/components/ui/per-page-selector";
import { FilterButton } from '@/components/ui/filter-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NoRecordsFound from '@/components/no-records-found';
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog } from "@/components/ui/dialog";
import CreateSalesCase from './Create';
import EditSalesCase from './Edit';
import { usePageButtons } from '@/hooks/usePageButtons';

import { SalesCasesIndexProps, SalesCase, SalesCaseModalState } from './types';

interface CaseFilters {
    name: string;
    status: string;
    priority: string;
    account_id: string;
    case_type_id: string;
    assign_user_id: string;
}

export default function Index() {
    const { t } = useTranslation();
    const pageProps = usePage<SalesCasesIndexProps>().props;
    const { cases, auth, accounts, contacts, caseTypes, users, imageUrlPrefix } = pageProps;
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);

    const [filters, setFilters] = useState<CaseFilters>({
        name: urlParams.get('name') || '',
        status: urlParams.get('status') || '',
        priority: urlParams.get('priority') || '',
        account_id: urlParams.get('account_id') || '',
        case_type_id: urlParams.get('case_type_id') || '',
        assign_user_id: urlParams.get('assign_user_id') || '',
    });

    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [modalState, setModalState] = useState<SalesCaseModalState>({
        isOpen: false,
        mode: '',
        data: null
    });
    const [showFilters, setShowFilters] = useState(false);

    useFlashMessages();
    const dropboxBtn = usePageButtons('dropboxBtn', { module: 'Cases', settingKey: 'Dropbox Cases' });
    const boxBtn = usePageButtons('boxBtn', { module: 'Cases', settingKey: 'Box Cases' });
    const googleDriveButtons = usePageButtons('googleDriveBtn', { module: 'Cases', settingKey: 'GoogleDrive Cases' });
    const oneDriveButtons = usePageButtons('oneDriveBtn', { module: 'Cases', settingKey: 'OneDrive Cases' });
    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.cases.destroy',
        defaultMessage: t('Are you sure you want to delete this case?')
    });

    const handleFilter = () => {
        router.get(route('sales.cases.index'), {...filters, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        router.get(route('sales.cases.index'), {...filters, per_page: perPage, sort: field, direction, view: viewMode}, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '', priority: '', account_id: '', case_type_id: '', assign_user_id: '' });
        router.get(route('sales.cases.index'), {per_page: perPage, view: viewMode});
    };

    const openModal = (mode: 'add' | 'edit', data: SalesCase | null = null) => {
        setModalState({ isOpen: true, mode, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: '', data: null });
    };

    const getCaseStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'assigned': return 'bg-purple-100 text-purple-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'closed': return 'bg-orange-100 text-orange-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'duplicate': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getCasePriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'urgent': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const tableColumns = [
        {
            key: 'case_number',
            header: t('Case Number'),
            sortable: true,
            render: (value: string, salesCase: any) =>
                auth.user?.permissions?.includes('view-sales-cases') ? (
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.cases.show', salesCase.id))}>#{value}</span>
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
            key: 'account_id',
            header: t('Account'),
            sortable: true,
            render: (_: any, item: SalesCase) => item.account?.name || '-'
        },
        {
            key: 'priority',
            header: t('Priority'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm ${getCasePriorityColor(value)}`}>
                    {value?.charAt(0).toUpperCase() + value?.slice(1)}
                </span>
            )
        },
        {
            key: 'assign_user',
            header: t('Assigned User'),
            render: (_: any, item: SalesCase) => item.assign_user?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            sortable: false,
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm ${getCaseStatusColor(value)}`}>
                    {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-cases', 'edit-sales-cases', 'delete-sales-cases'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: SalesCase) => (
                <div className="flex gap-1">
                    <TooltipProvider>
                        {item.attachment && (
                            <>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = `${imageUrlPrefix}/${item.attachment}`;
                                                link.download = item.attachment.split('/').pop() || 'download';
                                                link.click();
                                            }}
                                            className="h-8 w-8 p-0 text-black hover:text-gray-800"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{t('Download')}</p></TooltipContent>
                                </Tooltip>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`${imageUrlPrefix}/${item.attachment}`, '_blank')}
                                            className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{t('Preview')}</p></TooltipContent>
                                </Tooltip>
                            </>
                        )}
                        {auth.user?.permissions?.includes('view-sales-cases') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.cases.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('edit-sales-cases') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('delete-sales-cases') && (
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
                    {label: t('Cases')}
                ]}
                pageTitle={t('Manage Cases')}
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
                        {auth.user?.permissions?.includes('create-sales-cases') && (
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
            <Head title="Cases" />

            <Card className="shadow-sm">
                <CardContent className="p-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                value={filters.name}
                                onChange={(value) => setFilters({...filters, name: value})}
                                onSearch={handleFilter}
                                placeholder={t('Search cases...')}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <ListGridToggle
                                currentView={viewMode}
                                routeName="sales.cases.index"
                                filters={{...filters, per_page: perPage}}
                            />
                            <PerPageSelector
                                routeName="sales.cases.index"
                                filters={{...filters, view: viewMode}}
                            />
                            <div className="relative">
                                <FilterButton
                                    showFilters={showFilters}
                                    onToggle={() => setShowFilters(!showFilters)}
                                />
                                {(() => {
                                    const activeFilters = [filters.status, filters.priority, filters.account_id, filters.case_type_id, filters.assign_user_id].filter(Boolean).length;
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
                            {accounts?.length > 0 && (
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
                            {caseTypes?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Case Type')}</label>
                                    <Select value={filters.case_type_id} onValueChange={(value) => setFilters({...filters, case_type_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Case Types')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {caseTypes?.map((caseType: any) => (
                                                <SelectItem key={caseType.id} value={caseType.id.toString()}>
                                                    {caseType.type}
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
                                        <SelectItem value="new">{t('New')}</SelectItem>
                                        <SelectItem value="assigned">{t('Assigned')}</SelectItem>
                                        <SelectItem value="pending">{t('Pending')}</SelectItem>
                                        <SelectItem value="closed">{t('Closed')}</SelectItem>
                                        <SelectItem value="rejected">{t('Rejected')}</SelectItem>
                                        <SelectItem value="duplicate">{t('Duplicate')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Priority')}</label>
                                <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Priority')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">{t('Low')}</SelectItem>
                                        <SelectItem value="medium">{t('Medium')}</SelectItem>
                                        <SelectItem value="high">{t('High')}</SelectItem>
                                        <SelectItem value="urgent">{t('Urgent')}</SelectItem>
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
                            <div className="min-w-[1000px]">
                                <DataTable
                                    data={cases?.data || []}
                                    columns={tableColumns}
                                    onSort={handleSort}
                                    sortKey={sortField}
                                    sortDirection={sortDirection as 'asc' | 'desc'}
                                    className="rounded-none"
                                    emptyState={
                                        <NoRecordsFound
                                            icon={FileText}
                                            title="No cases found"
                                            description="Get started by creating your first case."
                                            hasFilters={!!(filters.name || filters.status || filters.priority || filters.account_id || filters.case_type_id || filters.assign_user_id)}
                                            onClearFilters={clearFilters}
                                            createPermission="create-sales-cases"
                                            onCreateClick={() => openModal('add')}
                                            createButtonText="Create Case"
                                            className="h-auto"
                                        />
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[70vh] p-6">
                            {cases?.data?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                    {cases.data.map((salesCase) => (
                                        <Card key={salesCase.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                            {/* Header */}
                                            <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-sm text-gray-900">
                                                            {auth.user?.permissions?.includes('view-sales-cases') ? (
                                                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.cases.show', salesCase.id))}>#{salesCase.case_number}</span>
                                                            ) : (
                                                                `#${salesCase.case_number}`
                                                            )}
                                                        </h3>
                                                        <p className="text-xs font-medium text-gray-600">{salesCase.name}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex-1 min-h-0">
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Account')}</p>
                                                        <p className="font-medium text-xs">{salesCase.account?.name || '-'}</p>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Case Type')}</p>
                                                        <p className="font-medium text-xs">{salesCase.case_type?.type || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Priority')}</p>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCasePriorityColor(salesCase.priority)}`}>
                                                            {salesCase.priority?.charAt(0).toUpperCase() + salesCase.priority?.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                        <p className="font-medium text-xs">{salesCase.assign_user?.name || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Attachment')}</p>
                                                        {salesCase.attachment ? (
                                                            <div className="flex gap-1">
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const link = document.createElement('a');
                                                                                link.href = `${imageUrlPrefix}/${salesCase.attachment}`;
                                                                                link.download = salesCase.attachment.split('/').pop() || 'download';
                                                                                link.click();
                                                                            }}
                                                                            className="h-6 w-6 p-0 text-black hover:text-gray-800"
                                                                        >
                                                                            <Download className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent><p>{t('Download')}</p></TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => window.open(`${imageUrlPrefix}/${salesCase.attachment}`, '_blank')}
                                                                            className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700"
                                                                        >
                                                                            <ExternalLink className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent><p>{t('Preview')}</p></TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-700 text-xs">-</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs min-w-0">
                                                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                        <p className="font-medium text-xs">{formatDate(salesCase.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCaseStatusColor(salesCase.status)}`}>
                                                    {t(salesCase.status?.charAt(0).toUpperCase() + salesCase.status?.slice(1))}
                                                </span>
                                                {auth.user?.permissions?.some((p: string) => ['view-sales-cases', 'edit-sales-cases', 'delete-sales-cases'].includes(p)) && (
                                                    <div className="flex gap-1">
                                                        <TooltipProvider>
                                                            {auth.user?.permissions?.includes('view-sales-cases') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.cases.show', salesCase.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('View')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('edit-sales-cases') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openModal('edit', salesCase)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{t('Edit')}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {auth.user?.permissions?.includes('delete-sales-cases') && (
                                                                <Tooltip delayDuration={0}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(salesCase.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
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
                                    title={t('No cases found')}
                                    description={t('Get started by creating your first case.')}
                                    hasFilters={!!(filters.name || filters.status || filters.priority || filters.account_id || filters.case_type_id || filters.assign_user_id)}
                                    onClearFilters={clearFilters}
                                    createPermission="create-sales-cases"
                                    onCreateClick={() => openModal('add')}
                                    createButtonText={t('Create Case')}
                                    className="h-auto"
                                />
                            )}
                        </div>
                    )}
                </CardContent>

                <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                    <Pagination
                        data={cases}
                        routeName="sales.cases.index"
                        filters={{...filters, per_page: perPage, view: viewMode}}
                    />
                </CardContent>
            </Card>

                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Case')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />

                {/* Modals */}
                <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
                    {modalState.mode === 'add' && (
                        <CreateSalesCase
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            contacts={contacts || []}
                            caseTypes={caseTypes || []}
                            users={users || []}
                        />
                    )}
                    {modalState.mode === 'edit' && modalState.data && (
                        <EditSalesCase
                            salesCase={modalState.data}
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            contacts={contacts || []}
                            caseTypes={caseTypes || []}
                            users={users || []}
                        />
                    )}
                </Dialog>

            </AuthenticatedLayout>
        </TooltipProvider>
    );
}
