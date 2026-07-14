import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit, Trash2, Eye, Headphones, Grid3X3, List } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilterButton } from '@/components/ui/filter-button';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { ListGridToggle } from '@/components/ui/list-grid-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NoRecordsFound from '@/components/no-records-found';
import { formatDate } from '@/utils/helpers';
import { usePageButtons } from '@/hooks/usePageButtons';

interface Ticket {
  id: number;
  encrypted_id: string;
  ticket_id: string;
  name: string;
  email: string;
  account_type: string;
  subject: string;
  status: string;
  category: {
    name: string;
    color: string;
  };
  user_slug: string;
  created_at: string;
}

interface TicketsIndexProps {
  tickets: {
    data: Ticket[];
    links: any[];
    meta: any;
  };
  auth: {
    user: {
      permissions: string[];
      slug: string;
    };
  };
}

interface TicketFilters {
  search: string;
  status: string;
}

interface TicketModalState {
  isOpen: boolean;
  mode: string;
  data: any;
}

export default function Index() {
  const { t } = useTranslation();
  const { tickets, auth } = usePage<TicketsIndexProps>().props;
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const pageButtons = usePageButtons('videoHubBtn', { addonModule: 'SupportTicket', fallbackName: 'Support Ticket' });

  const [filters, setFilters] = useState<TicketFilters>({
    search: urlParams.get('search') || '',
    status: urlParams.get('status') || '',
  });

  const [perPage, setPerPage] = useState(urlParams.get('per_page') || '10');
  const [sortField, setSortField] = useState(urlParams.get('sort') || '');
  const [sortDirection, setSortDirection] = useState(urlParams.get('direction') || 'asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(urlParams.get('view') as 'list' | 'grid' || 'list');
  const [modalState, setModalState] = useState<TicketModalState>({
    isOpen: false,
    mode: '',
    data: null
  });

  const [showFilters, setShowFilters] = useState(false);

  useFlashMessages();
  const zendeskButtons = usePageButtons('zendeskSyncBtn',{ module: 'ticket', settingKey: 'zendesk_is_on' });
  const googleDriveButtons = usePageButtons('googleDriveBtn', { module: 'Tickets', settingKey: 'GoogleDrive Tickets' });
  const oneDriveButtons = usePageButtons('oneDriveBtn', { module: 'Tickets', settingKey: 'OneDrive Tickets' });
  const dropboxBtn = usePageButtons('dropboxBtn', { module: 'Tickets', settingKey: 'Dropbox Tickets' });
  const boxBtn = usePageButtons('boxBtn', { module: 'Tickets', settingKey: 'Box Tickets' });

  const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
    routeName: 'support-tickets.destroy',
    defaultMessage: t('Are you sure you want to delete this ticket?')
  });

  const handleFilter = () => {
    router.get(route('support-tickets.index'), {...filters, per_page: perPage, sort: sortField, direction: sortDirection, view: viewMode}, {
      preserveState: true,
      replace: true
    });
  };

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(newPerPage);
    router.get(route('support-tickets.index'), {...filters, per_page: newPerPage, sort: sortField, direction: sortDirection, view: viewMode}, {
      preserveState: true,
      replace: true
    });
  };

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    router.get(route('support-tickets.index'), {...filters, per_page: perPage, sort: field, direction, view: viewMode}, {
      preserveState: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
    });
    router.get(route('support-tickets.index'), {per_page: perPage, view: viewMode});
  };

  const openModal = (mode: 'add' | 'edit', data: Ticket | null = null) => {
    setModalState({ isOpen: true, mode, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'bg-green-100 text-green-800',
      'Open': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'closed': 'bg-red-100 text-red-800',
      'Closed': 'bg-red-100 text-red-800',
      'On Hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const tableColumns = [
    {
      key: 'ticket_id',
      header: t('Ticket ID'),
      sortable: true,
      render: (value: string, ticket: Ticket) =>
        auth.user?.permissions?.includes('view-support-tickets') ? (
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('support-ticket.show.ticket', [ticket.user_slug, ticket.encrypted_id]))}>{value}</span>
        ) : (
          value
        )
    },
    {
      key: 'account_type',
      header: t('Account Type'),
      render: (value: string) => (
        <span>{value || '-'}</span>
      )
    },
    {
      key: 'name',
      header: t('Name'),
      sortable: true
    },
    {
      key: 'email',
      header: t('Email'),
      sortable: true
    },
    {
      key: 'subject',
      header: t('Subject'),
      sortable: true
    },
    {
      key: 'category',
      header: t('Category'),
      render: (value: any, row: Ticket) => (
        <span>{row.category?.name || '-'}</span>
      )
    },
    {
      key: 'status',
      header: t('Status'),
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
          getStatusColor(value)
        }`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'created_at',
      header: t('Created'),
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    ...(auth.user?.permissions?.some((p: string) => ['edit-support-tickets', 'delete-support-tickets'].includes(p)) ? [{
      key: 'actions',
      header: t('Actions'),
      render: (_: any, ticket: Ticket) => (
        <div className="flex gap-1">
          <TooltipProvider>
            {auth.user?.permissions?.includes('view-support-tickets') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                    <Link href={route('support-ticket.show.ticket', [ticket.user_slug, ticket.encrypted_id])}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('View')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {auth.user?.permissions?.includes('edit-support-tickets') && (
                <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                    <Link href = {route('support-tickets.edit', ticket.id)}>
                    <Edit className="h-4 w-4" />
                  </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('Edit & Replay')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {auth.user?.permissions?.includes('delete-support-tickets') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(ticket.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
      )
    }] : [])
  ];

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        {label: t('Support Tickets'), url: route('support-ticket.dashboard')},
        {label: t('Tickets')}
      ]}
      pageTitle={t('Manage Tickets')}
      pageActions={
        <div className="flex items-center gap-2">
            {zendeskButtons.map((button) => (
                <div key={button.id}>{button.component}</div>
            ))}
            {googleDriveButtons.map((button) => (
                <div key={button.id}>{button.component}</div>
            ))}
            {oneDriveButtons.map((button) => (
                <div key={button.id}>{button.component}</div>
            ))}
            {dropboxBtn.map((button) => (
                <div key={button.id}>{button.component}</div>
            ))}
            {boxBtn.map((button) => (
                <div key={button.id}>{button.component}</div>
            ))}
          <TooltipProvider>
            {pageButtons.map((button: any) => (
              <div key={button.id}>{button.component}</div>
            ))}
            {auth.user?.permissions?.includes('create-support-tickets') && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button size="sm" asChild>
                    <Link href={route('support-tickets.create')}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('Create')}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      }
    >
      <Head title={t('Support Tickets')} />

      <Card className="shadow-sm">
        <CardContent className="p-6 border-b bg-gray-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={filters.search}
                onChange={(value) => setFilters({...filters, search: value})}
                onSearch={handleFilter}
                placeholder={t('Search tickets...')}
              />
            </div>
            <div className="flex items-center gap-3">
              <ListGridToggle
                currentView={viewMode}
                routeName="support-tickets.index"
                filters={{...filters, per_page: perPage}}
              />
              <PerPageSelector
                routeName="support-tickets.index"
                filters={{...filters, view: viewMode}}
                currentPerPage={perPage}
                onPerPageChange={handlePerPageChange}
              />
              <div className="relative">
                <FilterButton
                  showFilters={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
                {(() => {
                  const activeFilters = [filters.status].filter(f => f !== '' && f !== null && f !== undefined).length;
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Status')}</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Filter by Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">{t('In Progress')}</SelectItem>
                    <SelectItem value="On Hold">{t('On Hold')}</SelectItem>
                    <SelectItem value="Closed">{t('Closed')}</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="min-w-[800px]">
              <DataTable
                data={tickets?.data || []}
                columns={tableColumns}
                onSort={handleSort}
                sortKey={sortField}
                sortDirection={sortDirection as 'asc' | 'desc'}
                className="rounded-none"
                emptyState={
                  <NoRecordsFound
                    icon={Headphones}
                    title={t('No Tickets found')}
                    description={t('Get started by creating your first Ticket.')}
                    hasFilters={!!(filters.search || filters.status)}
                    onClearFilters={clearFilters}
                    createPermission="create-support-tickets"
                    onCreateClick={() => window.location.href = route('support-tickets.create')}
                    createButtonText={t('Create Ticket')}
                    className="h-auto"
                  />
                }
              />
            </div>
          ) : (
            <div className="overflow-auto max-h-[70vh] p-6">
              {tickets?.data?.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                  {tickets.data.map((ticket) => (
                    <Card key={ticket.id} className="p-0 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col h-full min-w-0">
                      {/* Header */}
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-b flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Headphones className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 leading-tight break-words">{ticket.subject}</h3>
                            <p className="text-xs font-medium text-primary cursor-pointer" onClick={() => router.get(route('support-ticket.show.ticket', [ticket.user_slug, ticket.encrypted_id]))}>#{ticket.ticket_id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex-1 min-h-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-xs min-w-0">
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Name')}</p>
                            <p className="font-medium text-xs truncate">{ticket.name}</p>
                          </div>
                          <div className="text-xs min-w-0">
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Category')}</p>
                            <p className="font-medium text-xs">{ticket.category?.name || '-'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div className="text-xs min-w-0">
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Email')}</p>
                            <p className="font-medium text-xs break-all">{ticket.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-xs min-w-0">
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Account Type')}</p>
                            <p className="font-medium text-xs">{ticket.account_type || '-'}</p>
                          </div>
                          <div className="text-xs min-w-0">
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wide">{t('Created')}</p>
                            <p className="font-medium text-xs">{formatDate(ticket.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center p-3 border-t bg-gray-50/50 flex-shrink-0 mt-auto">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            {auth.user?.permissions?.includes('view-support-tickets') && (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => router.get(route('support-ticket.show.ticket', [ticket.user_slug, ticket.encrypted_id]))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('View')}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {auth.user?.permissions?.includes('edit-support-tickets') && (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => router.get(route('support-tickets.edit', ticket.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('Edit & Reply')}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {auth.user?.permissions?.includes('delete-support-tickets') && (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(ticket.id)}
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
                  icon={Headphones}
                  title={t('No Tickets found')}
                  description={t('Get started by creating your first Ticket.')}
                  hasFilters={!!(filters.search || filters.status)}
                  onClearFilters={clearFilters}
                  createPermission="create-support-tickets"
                  onCreateClick={() => window.location.href = route('support-tickets.create')}
                  createButtonText={t('Create Ticket')}
                  className="h-auto"
                />
              )}
            </div>
          )}
        </CardContent>

        <CardContent className="px-4 py-2 border-t bg-gray-50/30">
          <Pagination
            data={tickets}
            routeName="support-tickets.index"
            filters={{...filters, per_page: perPage, view: viewMode}}
          />
        </CardContent>
      </Card>



      <ConfirmationDialog
        open={deleteState.isOpen}
        onOpenChange={closeDeleteDialog}
        title={t('Delete Ticket')}
        message={deleteState.message}
        confirmText={t('Delete')}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AuthenticatedLayout>
  );
}
