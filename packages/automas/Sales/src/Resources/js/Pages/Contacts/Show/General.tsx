import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { useFormFields } from '@/hooks/useFormFields';

interface GeneralProps {
    contact: any;
}

export default function General({ contact }: GeneralProps) {
    const { t } = useTranslation();
    const pageProps = usePage().props as any;
    const { opportunities, quotes, salesOrders, cases } = pageProps;

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...contact, module: 'Sales', sub_module: 'Contact', id: contact.id }, () => { }, {}, 'view', t);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{opportunities?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Opportunities')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{quotes?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Quotes')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600">{salesOrders?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Sales Orders')}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{cases?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('Cases')}</div>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Basic Information')}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Name')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Status')}</label>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                            contact.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {contact.is_active ? t('Active') : t('Inactive')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Job Title')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.job_title || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Department')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.department || t('Not specified')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Email')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.email || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Phone')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.phone || t('Not specified')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Lead Source')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.lead_source || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Preferred Contact Method')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.preferred_contact_method || t('Not specified')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Tags')}</label>
                                    {contact.tags ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {JSON.parse(contact.tags).map((tag: string, index: number) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 mt-1">{t('Not specified')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Created Date')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(contact.created_at, pageProps)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Social Media URL')}</label>
                                {contact.social_media_urls ? (
                                    <p className="text-sm font-medium text-blue-600 mt-1">
                                        <a href={contact.social_media_urls} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {contact.social_media_urls}
                                        </a>
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900 mt-1">{t('Not specified')}</p>
                                )}
                            </div>
                            {/* Custom Fields */}
                            {customFields && customFields.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
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

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Address & Related Information')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Street Address')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{contact.address || t('Not specified')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('City')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.city || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('State')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.state || t('Not specified')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Postal Code')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.postal_code || t('Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Country')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.country || t('Not specified')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Account')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.account?.name || t('No account assigned')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Assigned User')}</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contact.assign_user?.name || t('Unassigned')}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Description')}</label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{contact.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}