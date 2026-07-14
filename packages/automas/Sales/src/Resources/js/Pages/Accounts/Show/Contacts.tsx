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
import { UserCheck, Edit, Trash2, Eye, Plus } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateContact from '../../Contacts/Create';
import EditContact from '../../Contacts/Edit';

interface ContactsProps {
    account: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Contacts({ account, onRegisterAddHandler }: ContactsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { contacts, users, accounts, auth } = pageProps;
    const [contactModal, setContactModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        if (auth.user?.permissions?.includes('create-sales-contacts')) {
            onRegisterAddHandler(() => openContactModal('add'));
        }
    }, [onRegisterAddHandler, auth]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.contacts.destroy',
        defaultMessage: t('Are you sure you want to delete this contact?')
    });

    const openContactModal = (mode: string, data: any = null) => {
        setContactModal({ isOpen: true, mode, data });
    };

    const closeContactModal = () => {
        setContactModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={contacts || []}
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
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-contacts', 'edit-sales-contacts', 'delete-sales-contacts'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-contacts') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.contacts.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('View')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-contacts') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openContactModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Edit')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-contacts') && (
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
                                icon={UserCheck}
                                title={t('No Contacts found')}
                                description={t('Get started by creating your first Contact.')}
                                createPermission="create-sales-contacts"
                                onCreateClick={() => openContactModal('add')}
                                createButtonText={t('Create Contact')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={contactModal.isOpen} onOpenChange={closeContactModal}>
                {contactModal.mode === 'add' && (
                    <CreateContact
                        onSuccess={closeContactModal}
                        users={users || []}
                        accounts={accounts || []}
                        defaultAccountId={account.id}
                    />
                )}
                {contactModal.mode === 'edit' && contactModal.data && (
                    <EditContact
                        contact={contactModal.data}
                        onSuccess={closeContactModal}
                        users={users || []}
                        accounts={accounts || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Contact')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}