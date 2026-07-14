import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

import AuthenticatedLayout from '@/layouts/authenticated-layout';
import DocumentSidebar from './DocumentSidebar';
import General from './General';
import Accounts from './Accounts';

export default function Show() {
    const { salesDocument } = usePage().props as any;
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('general');
    
    useFlashMessages();

    const renderSectionHeader = () => {
        const headers = {
            general: t('General'),
            accounts: t('Manage Accounts')
        };

        const showAddButton = ['accounts'].includes(activeSection);

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
                return <General salesDocument={salesDocument} />;
            case 'accounts':
                return <Accounts salesDocument={salesDocument} onRegisterAddHandler={(handler) => setAddHandlers(prev => ({...prev, accounts: handler}))} />;
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
                {label: t('Documents'), url: route('sales.documents.index')},
                {label: salesDocument.name}
            ]}
            pageTitle={
                <div className="flex items-center justify-between">
                    <span>{t('Document Details')}</span>
                </div>
            }
        >
            <Head title={`${salesDocument.name} - ${t('Document Details')}`} />

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-56 flex-shrink-0">
                    <DocumentSidebar activeItem={activeSection} onSectionChange={setActiveSection} />
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