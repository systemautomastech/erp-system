import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Edit,
    Phone,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import NoRecordsFound from '@/components/no-records-found';

interface ExtensionUser {
    id: number;
    name: string;
    email?: string | null;
}

interface PbxExtension {
    id: number;
    user_id: number;
    extension: string;
    caller_id?: string | null;
    is_active: boolean | number;
    created_at?: string;
    user?: ExtensionUser | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedExtensions {
    data: PbxExtension[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    meta?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        from?: number | null;
        to?: number | null;
    };
}

interface PbxSetting {
    id: number;
    max_extensions: number;
    extension_start: number;
    extension_end: number;
    is_enabled: boolean | number;
}

interface AuthUser {
    permissions?: string[];
}

interface IndexProps {
    extensions: PaginatedExtensions;
    setting: PbxSetting | null;
    canCreateExtension: boolean;
    auth?: {
        user?: AuthUser;
    };
    [key: string]: any;
}

export default function Index() {
    const { t } = useTranslation();

    const {
        extensions,
        setting,
        canCreateExtension,
        auth,
    } = usePage<IndexProps>().props;

    const permissions = auth?.user?.permissions ?? [];

    const urlParams = new URLSearchParams(window.location.search);

    const [search, setSearch] = useState(
        urlParams.get('search') ?? '',
    );

    const [perPage] = useState(
        urlParams.get('per_page') ?? '10',
    );

    const [sortField, setSortField] = useState(
        urlParams.get('sort') ?? 'created_at',
    );

    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
        urlParams.get('direction') === 'asc' ? 'asc' : 'desc',
    );

    useFlashMessages();

    const canEdit =
        permissions.includes('edit-pbx-extensions') ||
        permissions.includes('manage-pbx-extensions') ||
        permissions.length === 0;

    const canDelete =
        permissions.includes('delete-pbx-extensions') ||
        permissions.includes('manage-pbx-extensions') ||
        permissions.length === 0;

    const {
        deleteState,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    } = useDeleteHandler({
        routeName: 'pbx.extensions.destroy',
        defaultMessage: t(
            'Are you sure you want to delete this extension?',
        ),
    });

    const handleSearch = (): void => {
        router.get(
            route('pbx.extensions.index'),
            {
                search,
                per_page: perPage,
                sort: sortField,
                direction: sortDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearSearch = (): void => {
        setSearch('');

        router.get(
            route('pbx.extensions.index'),
            {
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSort = (field: string): void => {
        const direction: 'asc' | 'desc' =
            sortField === field && sortDirection === 'asc'
                ? 'desc'
                : 'asc';

        setSortField(field);
        setSortDirection(direction);

        router.get(
            route('pbx.extensions.index'),
            {
                search,
                per_page: perPage,
                sort: field,
                direction,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns = [
        {
            key: 'serial',
            header: t('SL'),
            render: (_value: unknown, _extension: PbxExtension, index: number) => {
                return (
                    (extensions.current_page - 1) *
                        extensions.per_page +
                    index +
                    1
                );
            },
        },
        {
            key: 'user',
            header: t('User'),
            render: (_value: unknown, extension: PbxExtension) => (
                <div>
                    <div className="font-medium text-foreground">
                        {extension.user?.name ?? t('Unknown User')}
                    </div>

                    {extension.user?.email && (
                        <div className="text-xs text-muted-foreground">
                            {extension.user.email}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'extension',
            header: t('Extension'),
            sortable: true,
            render: (value: string) => (
                <span className="font-semibold">
                    {value}
                </span>
            ),
        },
        {
            key: 'caller_id',
            header: t('Caller ID'),
            sortable: true,
            render: (value: string | null) => value || '—',
        },
        {
            key: 'is_active',
            header: t('Status'),
            sortable: true,
            render: (value: boolean | number) =>
                Boolean(value) ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {t('Active')}
                    </span>
                ) : (
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        {t('Inactive')}
                    </span>
                ),
        },
        ...(canEdit || canDelete
            ? [
                  {
                      key: 'actions',
                      header: t('Actions'),
                      render: (
                          _value: unknown,
                          extension: PbxExtension,
                      ) => (
                          <div className="flex items-center gap-1">
                              <TooltipProvider>
                                  {canEdit && (
                                      <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                              <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                                  onClick={() =>
                                                      router.visit(
                                                          route(
                                                              'pbx.extensions.edit',
                                                              {
                                                                  extension:
                                                                      extension.id,
                                                              },
                                                          ),
                                                      )
                                                  }
                                              >
                                                  <Edit className="h-4 w-4" />
                                              </Button>
                                          </TooltipTrigger>

                                          <TooltipContent>
                                              <p>{t('Edit')}</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  )}

                                  {canDelete && (
                                      <Tooltip delayDuration={0}>
                                          <TooltipTrigger asChild>
                                              <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                  onClick={() =>
                                                      openDeleteDialog(
                                                          extension.id,
                                                      )
                                                  }
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
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {
                    label: t('PBX'),
                },
                {
                    label: t('Extensions'),
                },
            ]}
            pageTitle={t('Manage Extensions')}
            pageActions={
                <div className="flex items-center gap-2">
                    {setting && (
                        <>
                            <span className="hidden rounded-md border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
                                {t('Range')}: {setting.extension_start}–
                                {setting.extension_end}
                            </span>

                            <span className="hidden rounded-md border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
                                {t('Used')}: {extensions.total}/
                                {setting.max_extensions}
                            </span>
                        </>
                    )}

                    {!setting && (
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    'pbx.settings.index',
                                                ),
                                            )
                                        }
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>{t('Configure PBX')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {canCreateExtension && (
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    'pbx.extensions.create',
                                                ),
                                            )
                                        }
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>{t('Create Extension')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            }
        >
            <Head title={t('Manage Extensions')} />

            {!setting && (
                <Card className="mb-4 border-amber-200 bg-amber-50">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-medium text-amber-900">
                                {t('PBX settings are not configured')}
                            </p>

                            <p className="text-sm text-amber-700">
                                {t(
                                    'Configure PBX settings before managing extensions.',
                                )}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(
                                    route('pbx.settings.index'),
                                )
                            }
                        >
                            <Settings className="h-4 w-4" />
                            {t('Configure PBX')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {setting && !canCreateExtension && (
                <Card className="mb-4 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-blue-800">
                            {t(
                                'The maximum extension limit for this workspace has been reached.',
                            )}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardContent className="border-b bg-muted/30 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="w-full max-w-md">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                onSearch={handleSearch}
                                placeholder={t(
                                    'Search by extension, caller ID or user...',
                                )}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <PerPageSelector
                                routeName="pbx.extensions.index"
                                filters={{
                                    search,
                                    sort: sortField,
                                    direction: sortDirection,
                                }}
                            />

                            {search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearSearch}
                                >
                                    {t('Clear')}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardContent className="p-0">
                    <div className="max-h-[70vh] w-full overflow-auto">
                        <div className="min-w-[750px]">
                            <DataTable
                                data={extensions.data}
                                columns={columns}
                                onSort={handleSort}
                                sortKey={sortField}
                                sortDirection={sortDirection}
                                className="rounded-none"
                                emptyState={
                                    <NoRecordsFound
                                        icon={Phone}
                                        title={t(
                                            'No extensions found',
                                        )}
                                        description={t(
                                            'Get started by creating your first PBX extension.',
                                        )}
                                        hasFilters={Boolean(search)}
                                        onClearFilters={clearSearch}
                                        onCreateClick={() =>
                                            router.visit(
                                                route(
                                                    'pbx.extensions.create',
                                                ),
                                            )
                                        }
                                        createButtonText={t(
                                            'Create Extension',
                                        )}
                                        className="h-auto"
                                    />
                                }
                            />
                        </div>
                    </div>
                </CardContent>

                <CardContent className="border-t bg-muted/20 px-4 py-2">
                    <Pagination
                        data={{
                            ...extensions,
                            ...(extensions.meta ?? {}),
                        }}
                        routeName="pbx.extensions.index"
                        filters={{
                            search,
                            per_page: perPage,
                            sort: sortField,
                            direction: sortDirection,
                        }}
                    />
                </CardContent>
            </Card>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Extension')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}