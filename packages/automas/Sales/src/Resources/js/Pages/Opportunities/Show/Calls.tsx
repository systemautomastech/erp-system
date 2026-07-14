import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Phone, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import NoRecordsFound from '@/components/no-records-found';
import CreateSalesCall from '../../Calls/Create';
import EditSalesCall from '../../Calls/Edit';

interface CallsProps {
    opportunity: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Calls({ opportunity, onRegisterAddHandler }: CallsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { calls, users, accounts, auth } = pageProps;
    const [callModal, setCallModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openCallModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.calls.destroy',
        defaultMessage: t('Are you sure you want to delete this call?')
    });

    const openCallModal = (mode: string, data: any = null) => {
        setCallModal({ isOpen: true, mode, data });
    };

    const closeCallModal = () => {
        setCallModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={calls || []}
                        columns={[
                            {
                                key: 'name',
                                header: t('Name'),
                                render: (value: string, call: any) =>
                                    auth.user?.permissions?.includes('view-sales-calls') ? (
                                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.calls.show', call.id))}>{value}</span>
                                    ) : (
                                        value
                                    )
                            },
                            {
                                key: 'direction',
                                header: t('Direction'),
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
                                render: (value: string) => formatDate(value)
                            },
                            {
                                key: 'assigned_user',
                                header: t('Assigned User'),
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'status',
                                header: t('Status'),
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
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-calls') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.calls.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('View')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-calls') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openCallModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Edit')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-calls') && (
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
                                icon={Phone}
                                title={t('No Calls found')}
                                description={t('Get started by creating your first Call.')}
                                onCreateClick={() => openCallModal('add')}
                                createButtonText={t('Create Call')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={callModal.isOpen} onOpenChange={closeCallModal}>
                {callModal.mode === 'add' && (
                    <CreateSalesCall
                        onSuccess={closeCallModal}
                        users={users || []}
                        accounts={accounts || []}
                        defaultParentType="opportunity"
                        defaultParentId={opportunity.id}
                        defaultAccountId={opportunity.account_id}
                    />
                )}
                {callModal.mode === 'edit' && callModal.data && (
                    <EditSalesCall
                        salesCall={callModal.data}
                        onSuccess={closeCallModal}
                        users={users || []}
                        accounts={accounts || []}
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
        </>
    );
}