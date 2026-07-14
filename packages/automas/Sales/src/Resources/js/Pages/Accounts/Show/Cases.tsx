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
import { Briefcase, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateCase from '../../Cases/Create';
import EditCase from '../../Cases/Edit';

interface CasesProps {
    account: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Cases({ account, onRegisterAddHandler }: CasesProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { cases, users, accounts, contacts, caseTypes, auth, allContacts } = pageProps;
    const [caseModal, setCaseModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openCaseModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.cases.destroy',
        defaultMessage: t('Are you sure you want to delete this case?')
    });

    const openCaseModal = (mode: string, data: any = null) => {
        setCaseModal({ isOpen: true, mode, data });
    };

    const closeCaseModal = () => {
        setCaseModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={cases || []}
                        columns={[
                            {
                                key: 'case_number',
                                header: t('Case Number'),
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
                            },
                            {
                                key: 'priority',
                                header: t('Priority'),
                                render: (value: string) => {
                                    const getPriorityColor = (priority: string) => {
                                        switch (priority?.toLowerCase()) {
                                            case 'low': return 'bg-green-100 text-green-700';
                                            case 'medium': return 'bg-yellow-100 text-yellow-700';
                                            case 'high': return 'bg-orange-100 text-orange-700';
                                            case 'urgent': return 'bg-red-100 text-red-700';
                                            default: return 'bg-gray-100 text-gray-700';
                                        }
                                    };
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(value)}`}>
                                            {value?.charAt(0).toUpperCase() + value?.slice(1)}
                                        </span>
                                    );
                                }
                            },
                            {
                                key: 'assign_user',
                                header: t('Assigned User'),
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'status',
                                header: t('Status'),
                                render: (value: string) => {
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
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-sm ${getCaseStatusColor(value)}`}>
                                            {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                                        </span>
                                    );
                                }
                            },
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-cases', 'edit-sales-cases', 'delete-sales-cases'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-cases') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.cases.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('View')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-cases') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openCaseModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-cases') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('Delete')}</p></TooltipContent>
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
                                icon={Briefcase}
                                title={t('No Cases found')}
                                description={t('Get started by creating your first Case.')}
                                onCreateClick={() => openCaseModal('add')}
                                createButtonText={t('Create Case')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={caseModal.isOpen} onOpenChange={closeCaseModal}>
                {caseModal.mode === 'add' && (
                    <CreateCase
                        onSuccess={closeCaseModal}
                        users={users || []}
                        accounts={accounts || []}
                        contacts={contacts || []}
                        caseTypes={caseTypes || []}
                        defaultAccountId={account.id}
                    />
                )}
                {caseModal.mode === 'edit' && caseModal.data && (
                    <EditCase
                        salesCase={caseModal.data}
                        onSuccess={closeCaseModal}
                        users={users || []}
                        accounts={accounts || []}
                        contacts={allContacts || []}
                        caseTypes={caseTypes || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Case')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}