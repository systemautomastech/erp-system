import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FileText, Edit, Trash2, Eye } from 'lucide-react';
import NoRecordsFound from '@/components/no-records-found';
import { formatDate, formatCurrency } from '@/utils/helpers';

// Utility function for calculating quote amount
const calculateQuoteAmount = (quote: any): number => {
    return parseFloat(quote.amount?.toString() || quote.total_amount?.toString() || '0');
};

interface QuotesProps {
    contact: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Quotes({ contact, onRegisterAddHandler }: QuotesProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { quotes, auth } = pageProps;

    useEffect(() => {
        onRegisterAddHandler(() => {
            router.post(route('sales.quotes.create.context'), { from_contact: contact.id, from_account: contact.account_id });
        });
    }, [onRegisterAddHandler, contact.id, contact.account_id]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.quotes.destroy',
        defaultMessage: t('Are you sure you want to delete this quote?')
    });

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={quotes || []}
                        columns={[
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
                                render: (value: any) => value?.name || '-'
                            },
                            {
                                key: 'date_quoted',
                                header: t('Date Quoted'),
                                render: (value: string) => formatDate(value)
                            },
                            {
                                key: 'amount',
                                header: t('Amount'),
                                render: (value: string | number, quote: any) => {
                                    const calculatedAmount = calculateQuoteAmount(quote);
                                    return formatCurrency(calculatedAmount);
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
                                    const getQuoteStatusColor = (status: string) => {
                                        switch (status?.toLowerCase()) {
                                            case 'draft': return 'bg-yellow-100 text-yellow-800';
                                            case 'sent': return 'bg-blue-100 text-blue-700';
                                            case 'accepted': return 'bg-green-100 text-green-700';
                                            case 'declined': return 'bg-red-100 text-red-700';
                                            case 'expired': return 'bg-orange-100 text-orange-700';
                                            default: return 'bg-gray-100 text-gray-700';
                                        }
                                    };
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-sm ${getQuoteStatusColor(value)}`}>
                                            {value?.charAt(0).toUpperCase() + value?.slice(1)}
                                        </span>
                                    );
                                }
                            },
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-quotes', 'edit-sales-quotes', 'delete-sales-quotes'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-quotes') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.quotes.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('View')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-quotes') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.visit(route('sales.quotes.edit', item.id))} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{t('Edit')}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-quotes') && (
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
                                title={t('No Quotes found')}
                                description={t('Get started by creating your first Quote.')}
                                onCreateClick={() => router.post(route('sales.quotes.create.context'), { from_contact: contact.id, from_account: contact.account_id })}
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
        </>
    );
}