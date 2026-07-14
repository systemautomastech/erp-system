import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FileText, Edit, Trash2, Eye, Copy, RotateCcw } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';

interface QuotesProps {
    account: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

// Utility function for status colors
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'draft': return 'bg-yellow-100 text-yellow-800';
        case 'sent': return 'bg-blue-100 text-blue-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'declined': return 'bg-red-100 text-red-800';
        case 'expired': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Utility function for calculating quote amount
const calculateQuoteAmount = (quote: any): number => {
    return parseFloat(quote.amount?.toString() || quote.total_amount?.toString() || '0');
};

export default function Quotes({ account, onRegisterAddHandler }: QuotesProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { quotes, auth } = pageProps;
    const [duplicateState, setDuplicateState] = useState({ isOpen: false, quoteId: null as number | null });
    const [convertState, setConvertState] = useState({ isOpen: false, quoteId: null as number | null });

    // Memoize quote amounts for performance
    const quotesWithCalculatedAmounts = useMemo(() => {
        return quotes?.map(quote => ({
            ...quote,
            calculatedAmount: calculateQuoteAmount(quote)
        })) || [];
    }, [quotes]);

    useEffect(() => {
        if (auth.user?.permissions?.includes('create-sales-quotes')) {
            onRegisterAddHandler(() => {
                router.post(route('sales.quotes.create.context'), { from_account: account.id });
            });
        }
    }, [onRegisterAddHandler, auth, account.id]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.quotes.destroy',
        defaultMessage: t('Are you sure you want to delete this quote?')
    });



    const openDuplicateDialog = (quoteId: number) => {
        setDuplicateState({ isOpen: true, quoteId });
    };

    const closeDuplicateDialog = () => {
        setDuplicateState({ isOpen: false, quoteId: null });
    };

    const confirmDuplicate = () => {
        if (duplicateState.quoteId) {
            router.post(route('sales.quotes.duplicate', duplicateState.quoteId));
            closeDuplicateDialog();
        }
    };

    const openConvertDialog = (quoteId: number) => {
        setConvertState({ isOpen: true, quoteId });
    };

    const closeConvertDialog = () => {
        setConvertState({ isOpen: false, quoteId: null });
    };

    const confirmConvert = () => {
        if (convertState.quoteId) {
            router.post(route('sales.quotes.convert', convertState.quoteId));
            closeConvertDialog();
        }
    };

    const tableColumns = [
        {
            key: 'quote_number',
            header: t('Quote Number'),
            render: (value: string, quote: any) =>
                auth.user?.permissions?.includes('view-sales-quotes') ? (
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.quotes.show', quote.id))}>#{value}</span>
                ) : (
                    `#${value}`
                )
        },
        {
            key: 'name',
            header: t('Name'),
        },
        {
            key: 'opportunity',
            header: t('Opportunity'),
            render: (_: any, item: any) => item.opportunity?.name || '-'
        },
        {
            key: 'date_quoted',
            header: t('Date Quoted'),
            render: (value: string) => formatDate(value, pageProps)
        },
        {
            key: 'amount',
            header: t('Amount'),
            render: (value: string | number, quote: any) => {
                const calculatedAmount = calculateQuoteAmount(quote);
                return formatCurrency(calculatedAmount, pageProps);
            }
        },
        {
            key: 'assign_user',
            header: t('Assigned User'),
            render: (_: any, item: any) => item.assign_user?.name || '-'
        },
        {
            key: 'status',
            header: t('Status'),
            render: (value: string) => (
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(value)}`}>
                    {value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase()}
                </span>
            )
        },
        ...(auth.user?.permissions?.some((p: string) => ['view-sales-quotes', 'edit-sales-quotes', 'delete-sales-quotes','convert-sales-quotes'].includes(p)) ? [{
            key: 'actions',
            header: t('Actions'),
            render: (_: any, item: any) => (
                <div className="flex gap-1">
                    <TooltipProvider>
                        {auth.user?.permissions?.includes('create-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openDuplicateDialog(item.id)} className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Duplicate')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        
                        {auth.user?.permissions?.includes('convert-sales-quotes') && !item.is_converted ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openConvertDialog(item.id)} className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Convert To Sale Order')}</p></TooltipContent>
                            </Tooltip>
                        ) : item.is_converted ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.orders.show', item.converted_salesorder_id))} className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Sales Order Details')}</p></TooltipContent>
                            </Tooltip>
                        ) : null}

                        {auth.user?.permissions?.includes('view-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('View')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('edit-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.edit', { quote: item.id, from_account: account.id }))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                            </Tooltip>
                        )}
                        {auth.user?.permissions?.includes('delete-sales-quotes') && (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{t('Delete')}</p></TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>
            )
        }] : [])
    ];

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[800px]">
                    <DataTable
                        data={quotes || []}
                        columns={tableColumns}
                        className="rounded-none"
                        emptyState={
                            <NoRecordsFound
                                icon={FileText}
                                title={t('No Quotes found')}
                                description={t('Get started by creating your first Quote.')}
                                createPermission="create-sales-quotes"
                                onCreateClick={() => router.post(route('sales.quotes.create.context'), { from_account: account.id })}
                                createButtonText={t('Create Quote')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>



            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Quote')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />

            <ConfirmationDialog
                open={duplicateState.isOpen}
                onOpenChange={closeDuplicateDialog}
                title={t('Duplicate Quote')}
                message={t('Are you sure you want to duplicate this quote?')}
                confirmText={t('Yes')}
                onConfirm={confirmDuplicate}
            />

            <ConfirmationDialog
                open={convertState.isOpen}
                onOpenChange={closeConvertDialog}
                title={t('Convert to Sales Order')}
                message={t('Are you sure you want to convert this quote to a sales order?')}
                confirmText={t('Convert')}
                onConfirm={confirmConvert}
            />
        </>
    );
}