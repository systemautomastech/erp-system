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
import { FileText, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateDocument from '../../Documents/Create';
import EditDocument from '../../Documents/Edit';

interface DocumentsProps {
    account: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Documents({ account, onRegisterAddHandler }: DocumentsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { documents, users, accounts, folders, types, opportunities, auth, allOpportunities } = pageProps;
    const [documentModal, setDocumentModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openDocumentModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.documents.destroy',
        defaultMessage: t('Are you sure you want to delete this document?')
    });

    const openDocumentModal = (mode: string, data: any = null) => {
        setDocumentModal({ isOpen: true, mode, data });
    };

    const closeDocumentModal = () => {
        setDocumentModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={documents || []}
                        columns={[
                            {
                                key: 'name',
                                header: t('Name'),
                            },
                            {
                                key: 'type',
                                header: t('Type'),
                                render: (value: any) => value?.name || t('Not specified')
                            },
                            {
                                key: 'folder',
                                header: t('Folder'),
                                render: (value: any) => value?.name || t('Not specified')
                            },
                            {
                                key: 'assign_user',
                                header: t('Assigned User'),
                                render: (value: any) => value?.name || t('Not specified')
                            },
                            {
                                key: 'status',
                                header: t('Status'),
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
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-documents') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.documents.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('View')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-documents') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openDocumentModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-documents') && (
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
                                icon={FileText}
                                title={t('No Documents found')}
                                description={t('Get started by creating your first Document.')}
                                onCreateClick={() => openDocumentModal('add')}
                                createButtonText={t('Create Document')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={documentModal.isOpen} onOpenChange={closeDocumentModal}>
                {documentModal.mode === 'add' && (
                    <CreateDocument
                        onSuccess={closeDocumentModal}
                        accounts={accounts || []}
                        folders={folders || []}
                        types={types || []}
                        opportunities={opportunities || []}
                        users={users || []}
                        defaultAccountId={account.id}
                    />
                )}
                {documentModal.mode === 'edit' && documentModal.data && (
                    <EditDocument
                        document={documentModal.data}
                        onSuccess={closeDocumentModal}
                        accounts={accounts || []}
                        folders={folders || []}
                        types={types || []}
                        opportunities={allOpportunities || []}
                        users={users || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Document')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}