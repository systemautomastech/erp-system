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
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NoRecordsFound from '@/components/no-records-found';
import SystemSetupSidebar from '../SystemSetupSidebar';
import Create from './Create';
import EditSalesShippingProvider from './Edit';
import { ShippingProvider } from './types';

interface ShippingProviderModalState {
    isOpen: boolean;
    mode: string;
    data: ShippingProvider | null;
}

interface ShippingProvidersIndexProps {
    shippingProviders: ShippingProvider[];
    auth: any;
}

export default function Index() {
    const { t } = useTranslation();
    const { shippingProviders, auth } = usePage<ShippingProvidersIndexProps>().props;
    
    const [modalState, setModalState] = useState<ShippingProviderModalState>({
        isOpen: false,
        mode: '',
        data: null
    });

    useFlashMessages();

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.shipping-providers.destroy',
        defaultMessage: t('Are you sure you want to delete this shipping provider?')
    });

    const openModal = (mode: 'add' | 'edit', data: ShippingProvider | null = null) => {
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
            key: 'website',
            header: t('Website'),
            render: (value: string) => value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    {value}
                </a>
            ) : '-'
        },
        ...(auth.user?.permissions?.some((p: string) => ['edit-shipping-providers', 'delete-shipping-providers'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: ShippingProvider) => (
                <div className="flex gap-1">
                    {auth.user?.permissions?.includes('edit-shipping-providers') && (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => openModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                        </Tooltip>
                    )}
                    {auth.user?.permissions?.includes('delete-shipping-providers') && (
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
                    {label: t('Shipping Providers')}
                ]}
                pageTitle={t('System Setup')}
            >
                <Head title={t('Shipping Providers')} />

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-64 flex-shrink-0">
                        <SystemSetupSidebar activeItem="shipping-providers" />
                    </div>

                    <div className="flex-1">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-medium">{t('Shipping Providers')}</h3>
                                    {auth.user?.permissions?.includes('create-shipping-providers') && (
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
                                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[60vh] rounded-none w-full">
                                    <div className="min-w-[600px]">
                                        <DataTable
                                            data={shippingProviders}
                                            columns={tableColumns}
                                            className="rounded-none"
                                            emptyState={
                                                <NoRecordsFound
                                                    icon={Truck}
                                                    title={t('No shipping providers found')}
                                                    description={t('Get started by creating your first shipping provider.')}
                                                    createPermission="create-shipping-providers"
                                                    onCreateClick={() => openModal('add')}
                                                    createButtonText={t('Create Shipping Provider')}
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
                        <Create onSuccess={closeModal} />
                    )}
                    {modalState.mode === 'edit' && modalState.data && (
                        <EditSalesShippingProvider shippingProvider={modalState.data} onSuccess={closeModal} />
                    )}
                </Dialog>

                <ConfirmationDialog
                    open={deleteState.isOpen}
                    onOpenChange={closeDeleteDialog}
                    title={t('Delete Shipping Provider')}
                    message={deleteState.message}
                    confirmText={t('Delete')}
                    onConfirm={confirmDelete}
                    variant="destructive"
                />
            </AuthenticatedLayout>
        </TooltipProvider>
    );
}