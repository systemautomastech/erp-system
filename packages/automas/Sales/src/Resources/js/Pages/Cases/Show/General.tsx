import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { useFormFields } from '@/hooks/useFormFields';

interface GeneralProps {
    salesCase: any;
}

export default function General({ salesCase }: GeneralProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { imageUrlPrefix } = pageProps;

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...salesCase, module: 'Sales', sub_module: 'Case', id: salesCase.id }, () => { }, {}, 'view', t);

    const getCaseStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700';
            case 'assigned': return 'px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-700';
            case 'pending': return 'px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700';
            case 'closed': return 'px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-700';
            case 'rejected': return 'px-2 py-1 rounded-full text-sm bg-red-100 text-red-700';
            default: return 'px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700';
        }
    };

    const getCasePriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'low': return 'px-2 py-1 rounded-full text-sm bg-green-100 text-green-700';
            case 'medium': return 'px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700';
            case 'high': return 'px-2 py-1 rounded-full text-sm bg-orange-100 text-orange-700';
            case 'urgent': return 'px-2 py-1 rounded-full text-sm bg-red-100 text-red-700';
            default: return 'px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">{salesCase.name}</h1>
                    </div>
                </div>
            </div>



            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Basic Information')}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Name')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Number')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.case_number}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Status')}</label>
                                    <div className="mt-1">
                                        <span className={getCaseStatusColor(salesCase.status)}>
                                            {salesCase.status?.charAt(0).toUpperCase() + salesCase.status?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Priority')}</label>
                                    <div className="mt-1">
                                        <span className={getCasePriorityColor(salesCase.priority)}>
                                            {salesCase.priority?.charAt(0).toUpperCase() + salesCase.priority?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Case Type')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.case_type?.type || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Assigned User')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.assign_user?.name || t('Unassigned')}</p>
                                </div>
                            </div>

                            {/* Custom Fields */}
                            {customFields && customFields.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {customFields.map((field, index) => (
                                        <div key={index}>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</label>
                                            <div className="text-sm font-medium text-gray-900 mt-1">
                                                {field.component}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {salesCase.attachment && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Attachment')}</label>
                                    <div className="mt-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <span className="flex-1 text-sm text-gray-700">
                                            {salesCase.attachment.split('/').pop()}
                                        </span>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={`${imageUrlPrefix}/${salesCase.attachment}`} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Information & Timeline */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Related Information & Timeline')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Account')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.account?.name || t('Not specified')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Contact')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{salesCase.contact?.name || t('Not specified')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Created Date')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(salesCase.created_at, pageProps)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {salesCase.description && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Description')}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{salesCase.description}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}