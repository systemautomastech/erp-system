import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit, Trash2, Folder, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import Create from './Create';
import EditSalesDocumentFolder from './Edit';
import ViewSalesDocumentFolder from './Show';
import NoRecordsFound from '@/components/no-records-found';
import { SalesDocumentFolder, SalesDocumentFoldersIndexProps, SalesDocumentFolderModalState } from './types';
import SystemSetupSidebar from "../SystemSetupSidebar";
import { formatDate, formatTime, formatDateTime, formatCurrency, getImagePath } from '@/utils/helpers';

export default function Index() {
    const { t } = useTranslation();
    const { salesdocumentfolders, auth, parentFolders } = usePage<SalesDocumentFoldersIndexProps>().props;

    const [modalState, setModalState] = useState<SalesDocumentFolderModalState>({
        isOpen: false,
        mode: '',
        data: null
    });

    useFlashMessages();

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.sales-document-folders.destroy',
        defaultMessage: t('Are you sure you want to delete this Document Folder?')
    });

    const openModal = (mode: 'add' | 'edit' | 'view', data: SalesDocumentFolder | null = null) => {
        setModalState({ isOpen: true, mode, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: '', data: null });
    };

    const tableColumns = [
        {
            key: 'name',
            header: t('Name')
        },
        {
            key: 'parent',
            header: t('Parent'),
            sortable: false,
            render: (value: string, row: any) => {
                const modelData = parentFolders?.find(item => item.id.toString() === value?.toString());
                return modelData?.name || '-';
            }
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-document-folders', 'edit-sales-document-folders', 'delete-sales-document-folders'].includes(p)) ? [{
            key: 'actions',
            header: t('Action'),
            render: (_: any, salesdocumentfolder: SalesDocumentFolder) => (
                <div className="flex gap-1">
                    {auth.user?.permissions?.includes('view-sales-document-folders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openModal('view', salesdocumentfolder)} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('View')}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('edit-sales-document-folders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openModal('edit', salesdocumentfolder)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('Edit')}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('delete-sales-document-folders') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(salesdocumentfolder.id)}
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
                </div>
            )
        }] : [])
    ];

    return (
        <TooltipProvider>
            <AuthenticatedLayout
                breadcrumbs={[
                    {label: t('Sales'), url: route('sales.index')},
                    {label: t('System Setup')},
                    {label: t('Document Folders')}
                ]}
                pageTitle={t('System Setup')}
            >
                <Head title={t('Document Folders')} />

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-64 flex-shrink-0">
                        <SystemSetupSidebar activeItem="sales-document-folders" />
                    </div>

                    <div className="flex-1">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-medium">{t('Document Folders')}</h3>
                                    {auth.user?.permissions?.includes('create-sales-document-folders') && (
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <Button size="sm" onClick={() => openModal('add')}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{t('Create')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                                    <div className="min-w-[600px]">
                                        <DataTable
                                            data={salesdocumentfolders}
                                            columns={tableColumns}
                                            className="rounded-none"
                                            emptyState={
                                                <NoRecordsFound
                                                    icon={Folder}
                                                    title={t('No Document Folders found')}
                                                    description={t('Get started by creating your first Document Folder.')}
                                                    createPermission="create-sales-document-folders"
                                                    onCreateClick={() => openModal('add')}
                                                    createButtonText={t('Create Document Folder')}
                                                    className="h-auto"
                                                />
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
                    {modalState.mode === 'add' && (
                        <Create onSuccess={closeModal} parentFolders={parentFolders} />
                    )}
                    {modalState.mode === 'view' && modalState.data && (
                        <ViewSalesDocumentFolder
                            salesdocumentfolder={modalState.data}
                            onClose={closeModal}
                            parentFolders={parentFolders}
                        />
                    )}
                    {modalState.mode === 'edit' && modalState.data && (
                        <EditSalesDocumentFolder
                            salesdocumentfolder={modalState.data}
                            onSuccess={closeModal} parentFolders={parentFolders}
                        />
                    )}
                </Dialog>

                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Document Folder')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />
            </AuthenticatedLayout>
        </TooltipProvider>
    );
}