import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';

interface GeneralProps {
    account: any;
}

export default function General({ account }: GeneralProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { contacts, opportunities, quotes, orders, cases, documents } = pageProps;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">{account.name}</h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{contacts?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Contacts')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{opportunities?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Opportunities')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{quotes?.length || 0}</div>
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
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Status')}</label>
                                        <div className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {account.is_active ? t('Active') : t('Inactive')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Email')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.email || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Phone')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.phone || t('Not specified')}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Website')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {account.website ? (
                                            <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {account.website}
                                            </a>
                                        ) : t('Not specified')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Billing Address')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Street Address')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{account.billing_address || t('Not specified')}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('City')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.billing_city || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('State')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.billing_state || t('Not specified')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Postal Code')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.billing_postal_code || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Country')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.billing_country || t('Not specified')}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Business Information */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Business Information')}</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Account Type')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.account_type?.name || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Industry')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.account_industry?.name || t('Not specified')}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Document')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{account.sales_document?.name || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Assigned User')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{account.assign_user?.name || t('Unassigned')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Shipping Address')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Street Address')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{account.shipping_address || t('Not specified')}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('City')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.shipping_city || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('State')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.shipping_state || t('Not specified')}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Postal Code')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.shipping_postal_code || t('Not specified')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Country')}</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{account.shipping_country || t('Not specified')}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Timeline */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Timeline')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Created Date')}</label>
                            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(account.created_at, pageProps)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Description */}
            {account.description && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Description')}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{account.description}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}