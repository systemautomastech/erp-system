import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ShoppingCart, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import CreateSalesOrder from '../../SalesOrders/Create';
import EditSalesOrder from '../../SalesOrders/Edit';
import { formatDate } from '@/utils/helpers';

interface SalesOrdersProps {
    opportunity: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function SalesOrders({ opportunity, onRegisterAddHandler }: SalesOrdersProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { orders, users, accounts, contacts, quotes, shippingProviders, auth, allOpportunities } = pageProps;
    const [orderModal, setOrderModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openOrderModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.orders.destroy',
        defaultMessage: t('Are you sure you want to delete this sales order?')
    });

    const openOrderModal = (mode: string, data: any = null) => {
        setOrderModal({ isOpen: true, mode, data });
    };

    const closeOrderModal = () => {
        setOrderModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={orders || []}
                        columns={[
                            {
                                key: 'id',
                                header: t('Order Number'),
                                render: (value: string, order: any) =>
                                    auth.user?.permissions?.includes('view-sales-orders') ? (
                                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.orders.show', order.id))}>#{order.order_number || order.order_number || value}</span>
                                    ) : (
                                        `#${order.order_number || value}`
                                    )
                            },
                            {
                                key: 'name',
                                header: t('Name'),
                            },
                            {
                                key: 'order_date',
                                header: t('Order Date'),
                                render: (value: string) => formatDate(value)
                            },
                            {
                                key: 'assign_user',
                                header: t('Assigned User'),
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'status',
                                header: t('Status'),
                                render: (value: string) => (
                                    <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                        value?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        value?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        value?.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                        value?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                        value?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        value?.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {value}
                                    </span>
                                )
                            },
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-orders', 'edit-sales-orders', 'delete-sales-orders'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-orders') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('View')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-orders') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openOrderModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-orders') && (
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
                                icon={ShoppingCart}
                                title={t('No Sales Orders found')}
                                description={t('Get started by creating your first Sales Order.')}
                                onCreateClick={() => openOrderModal('add')}
                                createButtonText={t('Create Sales Order')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={orderModal.isOpen} onOpenChange={closeOrderModal}>
                {orderModal.mode === 'add' && (
                    <CreateSalesOrder
                        onSuccess={closeOrderModal}
                        quotes={quotes || []}
                        opportunities={allOpportunities || []}
                        accounts={accounts || []}
                        contacts={contacts || []}
                        shippingProviders={shippingProviders || []}
                        users={users || []}
                        defaultOpportunityId={opportunity.id}
                        defaultAccountId={opportunity.account?.id}
                    />
                )}
                {orderModal.mode === 'edit' && orderModal.data && (
                    <EditSalesOrder
                        salesOrder={orderModal.data}
                        onSuccess={closeOrderModal}
                        quotes={quotes || []}
                        opportunities={allOpportunities || []}
                        accounts={accounts || []}
                        contacts={contacts || []}
                        shippingProviders={shippingProviders || []}
                        users={users || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Sales Order')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}