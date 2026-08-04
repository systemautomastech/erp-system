import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import SetupSidebar, { SetupTabKey } from './Sidebar';
import GeneralSettings from './GeneralSettings/Index';
import LogoTemplates from './LogoTemplates/Index';
import DefaultTermConditions from './DefaultTermConditions/Index';
import DefaultPages from './DefaultPages/Index';

interface Props {
    activeTab: SetupTabKey;
}

export default function Index({ activeTab }: Props) {
    const { t } = useTranslation();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(t('Proposal System Setup saved successfully'));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general-settings':
                return <GeneralSettings />;
            case 'template-branding':
                return <LogoTemplates />;
            case 'default-terms':
                return <DefaultTermConditions />;
            case 'default-pages':
                return <DefaultPages />;
            default:
                return null;
        }
    };

    const showSaveButton = activeTab !== 'default-pages';

    // Dynamic breadcrumbs based on active tab
    const getBreadcrumbLabel = () => {
        switch (activeTab) {
            case 'general-settings':
                return t('General Settings');
            case 'template-branding':
                return t('Logo & Template BG');
            case 'default-terms':
                return t('Default Terms & Conditions');
            case 'default-pages':
                return t('Default Pages');
            default:
                return t('System Setup');
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposals'), href: route('sales-proposals.index') },
                { label: getBreadcrumbLabel() },
            ]}
            pageTitle={t('System Setup')}
        >
            <Head title={`${t('Proposal System Setup')} - ${getBreadcrumbLabel()}`} />

            <div className="flex flex-col md:flex-row gap-8">
                <SetupSidebar activeTab={activeTab} />

                <div className="flex-1">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                {renderTabContent()}

                                {showSaveButton && (
                                    <div className="flex justify-end pt-4 border-t">
                                        <Button type="submit" size="sm" className="gap-2">
                                            <Save className="h-4 w-4" />
                                            {t('Save Settings')}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
