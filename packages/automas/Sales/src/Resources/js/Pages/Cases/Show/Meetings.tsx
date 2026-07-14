import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import NoRecordsFound from '@/components/no-records-found';
import CreateSalesMeeting from '../../Meetings/Create';
import EditSalesMeeting from '../../Meetings/Edit';

interface MeetingsProps {
    case: any;
    onRegisterAddHandler: (handler: () => void) => void;
}

export default function Meetings({ case: caseData, onRegisterAddHandler }: MeetingsProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { meetings, users, accounts, auth } = pageProps;
    const [meetingModal, setMeetingModal] = useState({ isOpen: false, mode: '', data: null });

    useEffect(() => {
        onRegisterAddHandler(() => openMeetingModal('add'));
    }, [onRegisterAddHandler]);

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'sales.meetings.destroy',
        defaultMessage: t('Are you sure you want to delete this meeting?')
    });

    const openMeetingModal = (mode: string, data: any = null) => {
        setMeetingModal({ isOpen: true, mode, data });
    };

    const closeMeetingModal = () => {
        setMeetingModal({ isOpen: false, mode: '', data: null });
    };

    return (
        <>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[75vh] rounded-none w-full">
                <div className="min-w-[600px]">
                    <DataTable
                        data={meetings || []}
                        columns={[
                            {
                                key: 'name',
                                header: t('Name'),
                                render: (value: string, meeting: any) =>
                                    auth.user?.permissions?.includes('view-sales-meetings') ? (
                                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.get(route('sales.meetings.show', meeting.id))}>{value}</span>
                                    ) : (
                                        value
                                    )
                            },
                            {
                                key: 'meeting_type',
                                header: t('Type'),
                                render: (value: string) => (
                                    <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                        value?.toLowerCase() === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {value?.replace('_', ' ')}
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
                            ...(auth.user?.permissions?.some((p: string) => ['view-sales-meetings', 'edit-sales-meetings', 'delete-sales-meetings'].includes(p)) ? [{
                                key: 'actions',
                                header: t('Actions'),
                                render: (_: any, item: any) => (
                                    <div className="flex gap-1">
                                        {auth.user?.permissions?.includes('view-sales-meetings') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => router.get(route('sales.meetings.show', item.id))} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('View')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('edit-sales-meetings') && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => openMeetingModal('edit', item)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t('Edit')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {auth.user?.permissions?.includes('delete-sales-meetings') && (
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
                                icon={Calendar}
                                title={t('No Meetings found')}
                                description={t('Get started by creating your first Meeting.')}
                                onCreateClick={() => openMeetingModal('add')}
                                createButtonText={t('Create Meeting')}
                                className="h-auto"
                            />
                        }
                    />
                </div>
            </div>

            <Dialog open={meetingModal.isOpen} onOpenChange={closeMeetingModal}>
                {meetingModal.mode === 'add' && (
                    <CreateSalesMeeting
                        onSuccess={closeMeetingModal}
                        users={users || []}
                        accounts={accounts || []}
                        defaultParentType="case"
                        defaultParentId={caseData.id}
                        defaultAccountId={caseData.account_id}
                    />
                )}
                {meetingModal.mode === 'edit' && meetingModal.data && (
                    <EditSalesMeeting
                        salesMeeting={meetingModal.data}
                        onSuccess={closeMeetingModal}
                        users={users || []}
                        accounts={accounts || []}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={deleteState.isOpen}
                onOpenChange={closeDeleteDialog}
                title={t('Delete Meeting')}
                message={deleteState.message}
                confirmText={t('Delete')}
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </>
    );
}