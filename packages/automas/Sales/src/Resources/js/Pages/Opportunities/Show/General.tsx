import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { useFormFields } from '@/hooks/useFormFields';

interface GeneralProps {
    opportunity: any;
}

export default function General({ opportunity }: GeneralProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { quotes, orders, documents } = pageProps;

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...opportunity, module: 'Sales', sub_module: 'Opportunity', id: opportunity.id }, () => { }, {}, 'view', t);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">{opportunity.name}</h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(opportunity.amount || 0)}</div>
                    <div className="text-sm text-gray-500">{t('Amount')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(opportunity.expected_amount || 0)}</div>
                    <div className="text-sm text-gray-500">{t('Expected Amount')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{quotes?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Quotes')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600">{orders?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Sales Orders')}</div>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Basic Information')}</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Name')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Status')}</label>
                                        <div className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                opportunity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {opportunity.is_active ? t('Active') : t('Inactive')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Stage')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.stage?.name || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Probability')}</label>
                                    <div className="mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${opportunity.probability || 0}%` }} />
                                            </div>
                                            <span className="text-sm font-medium">{opportunity.probability || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Lead Source')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.lead_source || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Next Step')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.next_step || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Lost Reason')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.lost_reason || '-'}</p>
                                </div>
                                {/* Custom Fields */}
                                {customFields && customFields.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {customFields.map((field, index) => (
                                            <div key={index} className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</label>
                                                <div className="text-sm font-medium text-gray-900 mt-1">
                                                    {field.component}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>


                </div>

                {/* Right Column - Related Information */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Related Information')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Account')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.account?.name || t('No account assigned')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Contact')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.contact?.name || t('No contact assigned')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Assigned User')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.assign_user?.name || t('Unassigned')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Timeline - Full Width */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Timeline')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Created Date')}</label>
                            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(opportunity.created_at, pageProps)}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Close Date')}</label>
                            <p className="text-sm font-medium text-gray-900 mt-1">{opportunity.close_date ? formatDate(opportunity.close_date, pageProps) : t('Not specified')}</p>
                        </div>
                        {opportunity.next_followup_date && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Next Followup Date')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(opportunity.next_followup_date, pageProps)}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Description */}
            {opportunity.description && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Description')}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}