import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';
import AccountSidebar from './AccountSidebar';
import General from './General';
import Streams from './Streams';
import Contacts from './Contacts';
import Opportunities from './Opportunities';
import Cases from './Cases';
import Quotes from './Quotes';
import SalesOrders from './SalesOrders';
import Documents from './Documents';
import { ShowAccountProps } from '../types';

import Calls from './Calls';
import Meetings from './Meetings';

export default function Show() {
    const { account, auth } = usePage<ShowAccountProps>().props;
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('general');
    
    useFlashMessages();

    const renderSectionHeader = () => {
        const headers = {
            general: t('General'),
            streams: t('Manage Streams'),
            contacts: t('Manage Contacts'),
            opportunities: t('Manage Opportunities'),
            cases: t('Manage Cases'),
            quotes: t('Manage Quotes'),
            'sales-orders': t('Manage Sales Orders'),

            calls: t('Manage Calls'),
            meetings: t('Manage Meetings'),
            documents: t('Manage Documents')
        };

        const sectionPermissions = {
            'contacts': 'create-sales-contacts',
            'opportunities': 'create-sales-opportunities',
            'cases': 'create-sales-cases',
            'quotes': 'create-sales-quotes',
            'sales-orders': 'create-sales-orders',

            'calls': 'create-sales-calls',
            'meetings': 'create-sales-meetings',
            'documents': 'create-sales-documents'
        };
        
        const showAddButton = ['contacts', 'opportunities', 'cases', 'quotes', 'sales-orders', 'calls', 'meetings', 'documents'].includes(activeSection) && 
                             (!sectionPermissions[activeSection] || auth.user?.permissions?.includes(sectionPermissions[activeSection]));

        return (
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{headers[activeSection] || ''}</h3>
                {showAddButton && (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button size="sm" onClick={() => {
                                    if (addHandlers[activeSection]) {
                                        addHandlers[activeSection]();
                                    }
                                }}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t(`Add ${headers[activeSection]}`)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        );
    };

    const [addHandlers, setAddHandlers] = useState({});

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'general':
                return <General account={account} />;
            case 'streams':
                return <Streams account={account} />;
            case 'contacts':
                return <Contacts account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, contacts: handler}))} />;
            case 'opportunities':
                return <Opportunities account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, opportunities: handler}))} />;
            case 'cases':
                return <Cases account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, cases: handler}))} />;
            case 'quotes':
                return <Quotes account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, quotes: handler}))} />;
            case 'sales-orders':
                return <SalesOrders account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, 'sales-orders': handler}))} />;

            case 'calls':
                return <Calls account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, calls: handler}))} />;
            case 'meetings':
                return <Meetings account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, meetings: handler}))} />;
            case 'documents':
                return <Documents account={account} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, documents: handler}))} />;
            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        {t('This section is under development')}
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                {label: t('Sales'), url: route('sales.index')},
                {label: t('Accounts'), url: route('sales.accounts.index')},
                {label: account.name}
            ]}
            pageTitle={
                <div className="flex items-center justify-between">
                    <span>{t('Account Details')}</span>
                </div>
            }
        >
            <Head title={`${account.name} - ${t('Account Details')}`} />

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-56 flex-shrink-0">
                    <AccountSidebar activeItem={activeSection} onSectionChange={setActiveSection} auth={auth} />
                </div>

                <div className="flex-1">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            {activeSection !== 'general' && renderSectionHeader()}
                            {renderSectionContent()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}