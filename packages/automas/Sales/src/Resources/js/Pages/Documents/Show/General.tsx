import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Download, FileText, Calendar, User, Building, Folder, Tag } from 'lucide-react';

interface GeneralProps {
    salesDocument: any;
}

export default function General({ salesDocument }: GeneralProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { accounts } = pageProps;

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
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">{salesDocument.name}</h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-gray-900">{accounts?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Accounts')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-blue-600">{salesDocument.type?.name || t('-')}</div>
                    <div className="text-sm text-gray-500">{t('Type')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-green-600">{salesDocument.folder?.name || t('-')}</div>
                    <div className="text-sm text-gray-500">{t('Folder')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl font-bold text-indigo-600">{salesDocument.assign_user?.name || t('-')}</div>
                    <div className="text-sm text-gray-500">{t('Assigned To')}</div>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information & Important Dates */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Basic Information & Important Dates')}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Name')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{salesDocument.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Status')}</label>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(salesDocument.status)}`}>
                                            {salesDocument.status?.charAt(0).toUpperCase() + salesDocument.status?.slice(1).toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Created Date')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(salesDocument.created_at, pageProps)}</p>
                                </div>
                                {salesDocument.publish_date && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Publish Date')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(salesDocument.publish_date, pageProps)}</p>
                                    </div>
                                )}
                            </div>
                            {salesDocument.expiration_date && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Expiration Date')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(salesDocument.expiration_date, pageProps)}</p>
                                    </div>
                                </div>
                            )}
                            {salesDocument.attachment && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Attachment')}</label>
                                    <div className="mt-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <span className="flex-1 text-sm text-gray-700">
                                            {salesDocument.attachment.split('/').pop()}
                                        </span>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={`/storage/${salesDocument.attachment}`} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Related Information')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Account')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{salesDocument.account?.name || t('Not specified')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Opportunity')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{salesDocument.opportunity?.name || t('Not specified')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Assigned User')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{salesDocument.assign_user?.name || t('Unassigned')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {salesDocument.description && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Description')}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{salesDocument.description}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}