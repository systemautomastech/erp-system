import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';
import OpportunitySidebar from './OpportunitySidebar';
import General from './General';
import Streams from './Streams';
import Quotes from './Quotes';
import SalesOrders from './SalesOrders';

import Calls from './Calls';
import Meetings from './Meetings';
import Documents from './Documents';

export default function Show() {
    const { opportunity } = usePage().props as any;
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('general');
    
    useFlashMessages();

    const renderSectionHeader = () => {
        const headers = {
            general: t('General'),
            streams: t('Manage Streams'),
            quotes: t('Manage Quotes'),
            'sales-orders': t('Manage Sales Orders'),

            calls: t('Manage Calls'),
            meetings: t('Manage Meetings'),
            documents: t('Manage Documents')
        };

        const showAddButton = ['quotes', 'sales-orders', 'calls', 'meetings', 'documents'].includes(activeSection);

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
                return <General opportunity={opportunity} />;
            case 'streams':
                return <Streams opportunity={opportunity} />;
            case 'quotes':
                return <Quotes opportunity={opportunity} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, quotes: handler}))} />;
            case 'sales-orders':
                return <SalesOrders opportunity={opportunity} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, 'sales-orders': handler}))} />;

            case 'calls':
                return <Calls opportunity={opportunity} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, calls: handler}))} />;
            case 'meetings':
                return <Meetings opportunity={opportunity} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, meetings: handler}))} />;
            case 'documents':
                return <Documents opportunity={opportunity} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, documents: handler}))} />;
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
                {label: t('Opportunities'), url: route('sales.opportunities.index')},
                {label: opportunity.name}
            ]}
            pageTitle={
                <div className="flex items-center justify-between">
                    <span>{t('Opportunity Details')}</span>
                </div>
            }
        >
            <Head title={`${opportunity.name} - ${t('Opportunity Details')}`} />

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-56 flex-shrink-0">
                    <OpportunitySidebar activeItem={activeSection} onSectionChange={setActiveSection} />
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