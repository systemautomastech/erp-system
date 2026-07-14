import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Package, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateOpportunity from '../../Opportunities/Create';
import EditOpportunity from '../../Opportunities/Edit';
import { formatCurrency } from '@/utils/helpers';

interface OpportunitiesProps {
    account: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Opportunities({ account, onRegisterAddHandler }: OpportunitiesProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { opportunities, users, accounts, contacts, stages, auth, allContacts } = pageProps;
    const [opportunityModal, setOpportunityModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openOpportunityModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.opportunities.destroy',
        defaultMessage: t('Are you sure you want to delete this opportunity?')
    });

    const openOpportunityModal = (mode: string, data: any = null) => {
        setOpportunityModal({ isOpen: true, mode, data });
    };

    const closeOpportunityModal = () => {
        setOpportunityModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={opportunities || []}
                        columns={[
                            {
                                key: 'name',
                                header: t('Name'),
                            },
                            {
                                key: 'amount',
                                header: t('Amount'),
                                render: (value: number) => formatCurrency(value || 0)
                            },
                            {
                                key: 'probability',
                                header: t('Probability'),
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
                                key: 'stage',
                                header: t('Stage'),
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'assign_user',
                                header: t('Assigned User'),
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'is_active',
                                header: t('Status'),
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
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.opportunities.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('View')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-opportunities') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openOpportunityModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Edit')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-opportunities') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Delete')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                )
                            }] : [])
                        ]}
                        className="rounded-none"
                        emptyState={
                            <NoRecordsFound
                                icon={Package}
                                title={t('No Opportunities found')}
                                description={t('Get started by creating your first Opportunity.')}
                                onCreateClick={() => openOpportunityModal('add')}
                                createButtonText={t('Create Opportunity')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={opportunityModal.isOpen} onOpenChange={closeOpportunityModal}>
                {opportunityModal.mode === 'add' && (
                    <CreateOpportunity
                        onSuccess={closeOpportunityModal}
                        users={users || []}
                        accounts={accounts || []}
                        contacts={contacts || []}
                        stages={stages || []}
                        defaultAccountId={account.id}
                    />
                )}
                {opportunityModal.mode === 'edit' && opportunityModal.data && (
                    <EditOpportunity
                        opportunity={opportunityModal.data}
                        onSuccess={closeOpportunityModal}
                        users={users || []}
                        accounts={accounts || []}
                        contacts={allContacts || []}
                        stages={stages || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Opportunity')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}