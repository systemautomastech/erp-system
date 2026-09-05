import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from "@/components/ui/card";
import SetupSidebar from './Sidebar';
import GeneralSettings from './GeneralSettings/Index';
import LogoTemplates from './LogoTemplates/Index';
import DefaultPages from './DefaultPages/Index';
import Subjects, { ProposalSubjectItem } from './Subjects/Index';

interface Props {
    settings?: Record<string, any> | null;
    defaultPages?: any[];
    subjects?: ProposalSubjectItem[];
}

export default function Index({ settings, defaultPages = [], subjects = [] }: Props) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('general-settings');

    const isClickScrollingRef = React.useRef(false);

    const handleNavClick = (id: string) => {
        setActiveSection(id);
        isClickScrollingRef.current = true;
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                isClickScrollingRef.current = false;
            }, 800);
        } else {
            isClickScrollingRef.current = false;
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (isClickScrollingRef.current) return;

            // If user scrolled close to the bottom of the page, activate the last section
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
            if (isBottom) {
                setActiveSection('subjects');
                return;
            }

            const sections = ['general-settings', 'logo-template', 'default-pages', 'subjects'];
            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 200 && rect.bottom > 100) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
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

            <div className="flex flex-col md:flex-row gap-8 pb-32">
                <SetupSidebar activeSection={activeSection} onNavClick={handleNavClick} />

                <div className="flex-1 space-y-8">
                    {/* 1. General Settings Section */}
                    <section id="general-settings" className="scroll-mt-6">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <GeneralSettings settings={settings} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* 2. Logo & Template Section */}
                    <section id="logo-template" className="scroll-mt-6">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <LogoTemplates settings={settings} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* 3. Default Pages Section */}
                    <section id="default-pages" className="scroll-mt-6">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <DefaultPages defaultPages={defaultPages} settings={settings || {}} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* 4. Subjects Section */}
                    <section id="subjects" className="scroll-mt-6">
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <Subjects subjects={subjects} />
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
