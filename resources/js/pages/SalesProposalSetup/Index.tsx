import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from "@/components/ui/card";
import SetupSidebar from './Sidebar';
import GeneralSettings from './GeneralSettings/Index';
import LogoTemplates from './LogoTemplates/Index';
import DefaultPages from './DefaultPages/Index';

interface Props {
    settings?: Record<string, any> | null;
    defaultPages?: any[];
}

export default function Index({ settings, defaultPages = [] }: Props) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('general-settings');

    const handleNavClick = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['general-settings', 'logo-template', 'default-pages'];
            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposals'), url: route('sales-proposals.index') },
                { label: t('System Setup') },
            ]}
            pageTitle={t('System Setup')}
        >
            <Head title={t('Proposal System Setup')} />

            <div className="flex flex-col md:flex-row gap-8">
                <SetupSidebar activeSection={activeSection} onNavClick={handleNavClick} />

                <div className="flex-1 space-y-8">
                    {/* 1. General Settings Section */}
                    <section id="general-settings">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <GeneralSettings settings={settings} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* 2. Logo & Template Section */}
                    <section id="logo-template">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <LogoTemplates settings={settings} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* 3. Default Pages Section */}
                    <section id="default-pages">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <DefaultPages defaultPages={defaultPages} />
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
