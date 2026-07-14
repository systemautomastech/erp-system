import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useMemo } from 'react';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate, formatDateTime } from '@/utils/helpers';
import { SalesMeeting } from './types';

interface ShowProps {
    salesMeeting: SalesMeeting;
    parent: {id: number, name: string} | null;
    auth: any;
    attendeeUsers: Array<{id: number, name: string}>;
    attendeeContacts: Array<{id: number, name: string}>;
}

export default function Show() {
    const { t } = useTranslation();
    const { salesMeeting, parent, auth, attendeeUsers, attendeeContacts } = usePage<ShowProps>().props;

    useFlashMessages();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'scheduled': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getMeetingTypeColor = (type: string) => {
        return type?.toLowerCase() === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    };

    const duration = useMemo(() => {
        const start = new Date(salesMeeting.start_date);
        const end = new Date(salesMeeting.end_date);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours}h ${diffMinutes}m`;
    }, [salesMeeting.start_date, salesMeeting.end_date]);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                { label: t('Meetings'), url: route('sales.meetings.index') },
                { label: t('View') }
            ]}
            pageTitle={`${t('Meeting')}: ${salesMeeting.name}`}

        >
            <Head title={`${t('Meeting')}: ${salesMeeting.name}`} />

            <div className="space-y-6">
                <Card id="printTable" className="w-full">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold">{t('Meeting Details')}</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Basic Info Card */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-sm mb-3 text-gray-800">{t('Basic Information')}</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">{t('Status')}</span>
                                                <div className="mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                        salesMeeting.status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        salesMeeting.status?.toLowerCase() === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        salesMeeting.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                                        salesMeeting.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {salesMeeting.status?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('Meeting Type')}</span>
                                                <div className="mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                        salesMeeting.meeting_type?.toLowerCase() === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {salesMeeting.meeting_type?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('Parent Type')}</span>
                                                <p className="mt-1 font-medium capitalize">{salesMeeting.parent_type || t('Not specified')}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('Parent Record')}</span>
                                                <p className="mt-1 font-medium">{parent?.name || t('Not specified')}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Schedule & Assignment */}
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Schedule Information */}
                                            <div>
                                                <h3 className="font-semibold text-sm mb-3 text-gray-800">{t('Schedule Information')}</h3>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">{t('Start Date & Time')}</span>
                                                        <p className="mt-1 font-medium">{formatDateTime(salesMeeting.start_date)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">{t('End Date & Time')}</span>
                                                        <p className="mt-1 font-medium">{formatDateTime(salesMeeting.end_date)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">{t('Duration')}</span>
                                                        <p className="mt-1 font-medium">{duration}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Account & Assignment */}
                                            <div>
                                                <h3 className="font-semibold text-sm mb-3 text-gray-800">{t('Account & Assignment')}</h3>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">{t('Account')}</span>
                                                        <p className="mt-1 font-medium">{salesMeeting.account?.name || t('No account assigned')}</p>
                                                        {salesMeeting.account?.email && (
                                                            <p className="text-xs text-gray-600">{salesMeeting.account.email}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">{t('Assigned User')}</span>
                                                        <p className="mt-1 font-medium">{salesMeeting.assigned_user?.name || t('Unassigned')}</p>
                                                        {salesMeeting.assigned_user?.email && (
                                                            <p className="text-xs text-gray-600">{salesMeeting.assigned_user.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Attendees */}
                                {(attendeeUsers?.length || attendeeContacts?.length) ? (
                                    <Card>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-sm mb-3 text-gray-800">{t('Attendees')}</h3>
                                            <div className="space-y-3 text-sm">
                                                {attendeeUsers?.length > 0 && (
                                                    <div>
                                                        <span className="text-gray-500">{t('Users')} ({attendeeUsers.length})</span>
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {attendeeUsers.map((user) => (
                                                                <Badge key={user.id} variant="secondary" className="text-xs">
                                                                    {user.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {attendeeContacts?.length > 0 && (
                                                    <div>
                                                        <span className="text-gray-500">{t('Contacts')} ({attendeeContacts.length})</span>
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {attendeeContacts.map((contact) => (
                                                                <Badge key={contact.id} variant="secondary" className="text-xs">
                                                                    {contact.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : null}
                                
                                {/* Timeline */}
                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-sm mb-3 text-gray-800">{t('Timeline')}</h3>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">{t('Created Date')}</span>
                                                <p className="mt-1 font-medium">{formatDate(salesMeeting.created_at)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('Created By')}</span>
                                                <p className="mt-1 font-medium">{salesMeeting.creator?.name || t('Unknown')}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('Last Updated')}</span>
                                                <p className="mt-1 font-medium">{formatDate(salesMeeting.updated_at)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Description */}
                        {salesMeeting.description && (
                            <Card className="mt-4">
                                <CardContent className="p-4">
                                    <div>
                                        <span className="text-gray-500 text-sm font-semibold">{t('Description')}</span>
                                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{salesMeeting.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}


                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}