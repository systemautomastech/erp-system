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

interface ProposalSettingData {
    id?: number;
    proposal_prefix?: string;
    proposal_starting_number?: number | string;
    default_validity_days?: number | string;
    logo_image?: string;
    background_image?: string;
    default_terms?: string;
}

interface Props {
    activeTab: SetupTabKey;
    settings?: ProposalSettingData | null;
    defaultPages?: any[];
}

export default function Index({ activeTab, settings, defaultPages = [] }: Props) {
    const { t } = useTranslation();

    const tabComponents: Record<SetupTabKey, React.ReactNode> = {
        'general-settings': <GeneralSettings settings={settings} />,
        'logo-template': <LogoTemplates settings={settings} />,
        'default-terms': <DefaultTermConditions settings={settings} />,
        'default-pages': <DefaultPages defaultPages={defaultPages} />,
    };

    // Dynamic breadcrumbs based on active tab
    const getBreadcrumbLabel = () => {
        switch (activeTab) {
            case 'general-settings':
                return t('General Settings');
            case 'logo-template':
                return t('Logo & Template');
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
                { label: t('Sales Proposals'), url: route('sales-proposals.index') },
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
                            {tabComponents[activeTab]}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
