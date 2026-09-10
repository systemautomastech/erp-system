import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Building2, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateAccount from '../../Accounts/Create';
import EditAccount from '../../Accounts/Edit';

interface AccountsProps {
    salesDocument: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Accounts({ salesDocument, onRegisterAddHandler }: AccountsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { accounts, users, accountTypes, accountIndustries, documents, auth } = pageProps;
    const [accountModal, setAccountModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openAccountModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.accounts.destroy',
        defaultMessage: t('Are you sure you want to delete this account?')
    });

    const openAccountModal = (mode: string, data: any = null) => {
        setAccountModal({ isOpen: true, mode, data });
    };

    const closeAccountModal = () => {
        setAccountModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={accounts || []}
                        columns={[
                            {
                                key: 'name',
                                header: t('Name'),
                            },
                            {
                                key: 'email',
                                header: t('Email'),
                            },
                            {
                                key: 'phone',
                                header: t('Phone'),
                            },
                            {
                                key: 'assign_user',
                                header: t('Assigned User'),
                                render: (value: any, item: any) => item.assign_user?.name || item.assignUser?.name || '-'
                            },
                            {
                                key: 'is_active',
                                header: t('Status'),
                                render: (value: boolean) => (
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {value ? t('Active') : t('Inactive')}
                                    </span>
                                )
                            },
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-accounts', 'edit-sales-accounts', 'delete-sales-accounts'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-accounts') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.accounts.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('View')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-accounts') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openAccountModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Edit')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-accounts') && (
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
                                icon={Building2}
                                title={t('No Accounts found')}
                                description={t('No accounts have been created using this document yet.')}
                                onCreateClick={() => openAccountModal('add')}
                                createButtonText={t('Create Account')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={accountModal.isOpen} onOpenChange={closeAccountModal}>
                {accountModal.mode === 'add' && (
                    <CreateAccount
                        onSuccess={closeAccountModal}
                        users={users || []}
                        accountTypes={accountTypes || []}
                        accountIndustries={accountIndustries || []}
                        documents={documents || []}
                        defaultDocumentId={salesDocument.id}
                    />
                )}
                {accountModal.mode === 'edit' && accountModal.data && (
                    <EditAccount
                        account={accountModal.data}
                        onSuccess={closeAccountModal}
                        users={users || []}
                        accountTypes={accountTypes || []}
                        accountIndustries={accountIndustries || []}
                        documents={documents || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Account')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}