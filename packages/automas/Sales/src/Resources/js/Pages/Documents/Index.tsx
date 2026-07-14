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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import NoRecordsFound from '@/components/no-records-found';
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import Create from './Create';
import EditDocument from './Edit';
import { DocumentsIndexProps, SalesDocument } from './types';
import { usePageButtons } from '@/hooks/usePageButtons';

interface DocumentFilters {
    name: string;
    status: string;
    account_id: string;
    folder_id: string;
    type_id: string;
    assign_user_id: string;
    date_range: string;
}

export default function Index() {
    const { t } = useTranslation();
    const pageProps = usePage<DocumentsIndexProps>().props;
    const { documents, auth, accounts, folders, types, opportunities, users, imageUrlPrefix } = pageProps;
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);

    const [filters, setFilters] = useState<DocumentFilters>({
        name: urlParams.get('name') || '',
        status: urlParams.get('status') || '',
        account_id: urlParams.get('account_id') || '',
        folder_id: urlParams.get('folder_id') || '',
        type_id: urlParams.get('type_id') || '',
        assign_user_id: urlParams.get('assign_user_id') || '',
        date_range: (() => {
            const dateFrom = urlParams.get('date_from');
            const dateTo = urlParams.get('date_to');
            return (dateFrom && dateTo) ? `${dateFrom} - ${dateTo}` : '';
        })()
    });

    const [perPage] = useState(urlParams.get('per_page') || '10');
    const [sortField, setSortField] = useState(urlParams.get('sort') || '');
    const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
    const [showFilters, setShowFilters] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: '',
        data: null as SalesDocument | null
    });

    useFlashMessages();
    const dropboxBtn = usePageButtons('dropboxBtn', { module: 'Sales Document', settingKey: 'Dropbox Sales Document' });
    const boxBtn = usePageButtons('boxBtn', { module: 'Sales Document', settingKey: 'Box Sales Document' });
    const googleDriveButtons = usePageButtons('googleDriveBtn', { module: 'Sales Document', settingKey: 'GoogleDrive Sales Document' });
    const oneDriveButtons = usePageButtons('oneDriveBtn', { module: 'Sales Document', settingKey: 'OneDrive Sales Document' });

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.documents.destroy',
        defaultMessage: t('Are you sure you want to delete this document?')
    });

    const handleFilter = () => {
        const filterParams: any = {};

        // Copy non-date filters
        Object.keys(filters).forEach(key => {
            if (key !== 'date_range' && filters[key as keyof DocumentFilters]) {
                filterParams[key] = filters[key as keyof DocumentFilters];
            }
        });

        // Convert date_range to date_from and date_to for backend
        if (filters.date_range) {
            const [dateFrom, dateTo] = filters.date_range.split(' - ');
            filterParams.date_from = dateFrom;
            filterParams.date_to = dateTo;
        }

        router.get(route('sales.documents.index'), { ...filterParams, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSort = (field: string) => {
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);

        const filterParams: any = {};
        Object.keys(filters).forEach(key => {
            if (key !== 'date_range' && filters[key as keyof DocumentFilters]) {
                filterParams[key] = filters[key as keyof DocumentFilters];
            }
        });

        if (filters.date_range) {
            const [dateFrom, dateTo] = filters.date_range.split(' - ');
            filterParams.date_from = dateFrom;
            filterParams.date_to = dateTo;
        }

        router.get(route('sales.documents.index'), { ...filterParams, per_page: perPage, sort: field, direction, view: viewMode }, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '', account_id: '', folder_id: '', type_id: '', assign_user_id: '', date_range: '' });
        setSortField('');
        setSortDirection('asc');
        router.get(route('sales.documents.index'), { per_page: perPage, view: viewMode });
    };

    const openModal = (mode: 'add' | 'edit', data: SalesDocument | null = null) => {
        setModalState({ isOpen: true, mode, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: '', data: null });
    };

    const tableColumns = [
        {
            key: 'name',
            header: t('Name'),
            sortable: true
        },

        {
            key: 'account.name',
            header: t('Account'),
            sortable: true,
            render: (_: any, item: SalesDocument) => item.account?.name || '-'
        },
        {
            key: 'folder.name',
            header: t('Folder'),
            render: (_: any, item: SalesDocument) => item.folder?.name || '-'
        },
        {
            key: 'publish_date',
            header: t('Publish Date'),
            sortable: true,
            render: (value: string) => value ? formatDate(value) : '-'
        },
        {
            key: 'expiration_date',
            header: t('Expiration Date'),
            sortable: true,
            render: (value: string) => value ? formatDate(value) : '-'
        },
        {
            key: 'assign_user_id',
            header: t('Assigned User'),
            render: (_: any, item: SalesDocument) => item.assignUser?.name || item.assign_user?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            sortable: true,
            render: (value: string) => {
                const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                        case 'active': return 'bg-green-100 text-green-800';
                        case 'draft': return 'bg-yellow-100 text-yellow-800';
                        case 'expired': return 'bg-red-100 text-red-800';
                        case 'cancelled': return 'bg-orange-100 text-orange-800';
                        default: return 'bg-gray-100 text-gray-800';
                    }
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(value)}`}>
                        {value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase()}
                    </span>
                );
            }
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-documents', 'edit-sales-documents', 'delete-sales-documents'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: SalesDocument) => (
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
                        {auth.user?.permissions?.includes('view-sales-documents') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.documents.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('edit-sales-documents') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('delete-sales-documents') && (
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
                    { label: t('Documents') }
                ]}
                pageTitle={t('Manage Documents')}
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
                        {auth.user?.permissions?.includes('create-sales-documents') && (
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
                <Head title="Documents" />

                <Card className="shadow-sm">
                    <CardContent className="p-6 border-b bg-gray-50/50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <SearchInput
                                    value={filters.name}
                                    onChange={(value) => setFilters({ ...filters, name: value })}
                                    onSearch={handleFilter}
                                    placeholder={t('Search documents...')}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <ListGridToggle
                                    currentView={viewMode}
                                    routeName="sales.documents.index"
                                    filters={{ ...filters, per_page: perPage }}
                                />
                                <PerPageSelector
                                    routeName="sales.documents.index"
                                    filters={{ ...filters, view: viewMode }}
                                />
                                <div className="relative">
                                    <FilterButton
                                        showFilters={showFilters}
                                        onToggle={() => setShowFilters(!showFilters)}
                                    />
                                    {(() => {
                                        const activeFilters = [filters.status, filters.account_id, filters.folder_id, filters.type_id, filters.assign_user_id, filters.date_range].filter(Boolean).length;
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
                                {auth.user?.permissions?.includes('manage-any-sales-accounts') && accounts?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('Account')}</label>
                                        <Select value={filters.account_id} onValueChange={(value) => setFilters({ ...filters, account_id: value })}>
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
                                {folders?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('Folder')}</label>
                                        <Select value={filters.folder_id} onValueChange={(value) => setFilters({ ...filters, folder_id: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('All Folders')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {folders?.map((folder: any) => (
                                                    <SelectItem key={folder.id} value={folder.id.toString()}>
                                                        {folder.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {types?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('Type')}</label>
                                        <Select value={filters.type_id} onValueChange={(value) => setFilters({ ...filters, type_id: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('All Types')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types?.map((type: any) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {auth.user?.permissions?.includes('manage-users') && users?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('Assigned User')}</label>
                                        <Select value={filters.assign_user_id} onValueChange={(value) => setFilters({ ...filters, assign_user_id: value })}>
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
                                        onChange={(value) => setFilters({ ...filters, date_range: value })}
                                        placeholder={t('Select date range')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('All Status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">{t('Active')}</SelectItem>
                                            <SelectItem value="draft">{t('Draft')}</SelectItem>
                                            <SelectItem value="expired">{t('Expired')}</SelectItem>
                                            <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
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
                                        data={documents?.data || []}
                                        columns={tableColumns}
                                        onSort={handleSort}
                                        sortKey={sortField}
                                        sortDirection={sortDirection as 'asc' | 'desc'}
                                        className="rounded-none"
                                        emptyState={
                                            <NoRecordsFound
                                                icon={FileText}
                                                title={t('No documents found')}
                                                description={t('Get started by creating your first document.')}
                                                hasFilters={!!(filters.name || filters.status || filters.account_id || filters.folder_id || filters.type_id || filters.assign_user_id || filters.date_range)}
                                                onClearFilters={clearFilters}
                                                createPermission="create-sales-documents"
                                                onCreateClick={() => openModal('add')}
                                                createButtonText={t('Create Document')}
                                                className="h-auto"
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-auto max-h-[70vh] p-6">
                                {documents?.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {documents.data.map((document) => (
                                            <Card key={document.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                                                {/* Header */}
                                                <div className="p-4 bg-gradient-to-r from-gray-50 to-transparent border-b flex-shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-semibold text-sm text-gray-900">
                                                                {auth.user?.permissions?.includes('view-sales-documents') ? (
                                                                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.documents.show', document.id))}>{document.name}</span>
                                                                ) : (
                                                                    document.name
                                                                )}
                                                            </h3>
                                                            <p className="text-xs font-medium text-gray-600">{document.account?.name || t('No Account')}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="p-4 flex-1 min-h-0">

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Folder')}</p>
                                                            <p className="font-medium text-xs">{document.folder?.name || '-'}</p>
                                                        </div>
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Type')}</p>
                                                            <p className="font-medium text-xs">{document.type?.name || '-'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Published')}</p>
                                                            <p className="font-medium text-xs">{document.publish_date ? formatDate(document.publish_date) : '-'}</p>
                                                        </div>
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Expires')}</p>
                                                            <p className="font-medium text-xs">{document.expiration_date ? formatDate(document.expiration_date) : '-'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Assigned User')}</p>
                                                            <p className="font-medium text-xs">{document.assignUser?.name || document.assign_user?.name || '-'}</p>
                                                        </div>
                                                        <div className="text-xs min-w-0">
                                                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                                                            <p className="font-medium text-xs">{formatDate(document.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        document.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                                                        document.status?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                        document.status?.toLowerCase() === 'expired' ? 'bg-red-100 text-red-800' :
                                                        document.status?.toLowerCase() === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {document.status?.charAt(0).toUpperCase() + document.status?.slice(1).toLowerCase()}
                                                    </span>
                                                    {auth.user?.permissions?.some((p: string) => ['view-sales-documents', 'edit-sales-documents', 'delete-sales-documents'].includes(p)) && (
                                                        <div className="flex gap-1">
                                                            <TooltipProvider>
                                                                {auth.user?.permissions?.includes('view-sales-documents') && (
                                                                    <Tooltip delayDuration={0}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.documents.show', document.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{t('View')}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {auth.user?.permissions?.includes('edit-sales-documents') && (
                                                                    <Tooltip delayDuration={0}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" onClick={() => openModal('edit', document)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{t('Edit')}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                {auth.user?.permissions?.includes('delete-sales-documents') && (
                                                                    <Tooltip delayDuration={0}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(document.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
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
                                        title={t('No documents found')}
                                        description={t('Get started by creating your first document.')}
                                        hasFilters={!!(filters.name || filters.status || filters.account_id || filters.folder_id || filters.type_id || filters.assign_user_id || filters.date_range)}
                                        onClearFilters={clearFilters}
                                        createPermission="create-sales-documents"
                                        onCreateClick={() => openModal('add')}
                                        createButtonText={t('Create Document')}
                                        className="h-auto"
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>

                    <CardContent className="px-4 py-2 border-t bg-gray-50/30">
                        <Pagination
                            data={documents}
                            routeName="sales.documents.index"
                            filters={{ ...filters, per_page: perPage, view: viewMode }}
                        />
                    </CardContent>
                </Card>

                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Document')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />

                {/* Document Modal */}
                <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
                    {modalState.mode === 'add' && (
                        <Create
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            folders={folders || []}
                            types={types || []}
                            opportunities={opportunities || []}
                            users={users || []}
                        />
                    )}
                    {modalState.mode === 'edit' && modalState.data && (
                        <EditDocument
                            document={modalState.data}
                            onSuccess={closeModal}
                            accounts={accounts || []}
                            folders={folders || []}
                            types={types || []}
                            opportunities={opportunities || []}
                            users={users || []}
                        />
                    )}
                </Dialog>
            </AuthenticatedLayout>
        </TooltipProvider>
    );
}
