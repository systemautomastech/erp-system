import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Landmark, UserCog, Contact, MonitorSmartphone, Shield, Eye, Maximize2, X, Plus } from 'lucide-react';

interface BenefitsProps {
    settings?: any;
}

export default function Benefits({ settings }: BenefitsProps) {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const sectionData = settings?.config_sections?.sections?.benefits || {};
    const galleryData = settings?.config_sections?.sections?.gallery || {};
    const colors = settings?.config_sections?.colors || {
        primary: 'var(--color-primary, #130774)',
        secondary: 'var(--color-secondary, #0b55b7)',
        accent: 'var(--color-accent, #130674)'
    };
    const primaryColor = colors.primary || 'var(--color-primary)';
    const secondaryColor = colors.secondary || 'var(--color-secondary)';

    const sectionTitle = sectionData.title || 'Why Choose Automas ERP?';
    const sectionSubtitle = sectionData.subtitle || 'Built for modern enterprises that demand reliability, scalability, and seamless integration.';

    const defaultWhyChooseUs = [
        { icon: ClipboardList, cardBg: '#F5F2FF', iconBg: '#7C5CFF', title: 'Complete Project Management', desc: 'End-to-end project tracking with Gantt charts, Kanban boards, and team collaboration tools.' },
        { icon: Landmark, cardBg: '#EAF1FE', iconBg: '#2F6FED', title: 'Integrated Financial System', desc: 'Comprehensive accounting, invoicing, expense tracking, and real-time financial reporting.' },
        { icon: UserCog, cardBg: '#FFF6E5', iconBg: '#F5A524', title: 'Efficient HR Management', desc: 'Streamlined employee records, attendance, payroll, and performance tracking.' },
        { icon: Contact, cardBg: '#FDEEF3', iconBg: '#EC4899', title: 'Powerful CRM Tools', desc: 'Manage leads, track pipelines, and close deals faster with intelligent automation.' },
        { icon: MonitorSmartphone, cardBg: '#E5FAFD', iconBg: '#06B6D4', title: 'Modern POS Solution', desc: 'Fast transactions, real-time inventory, and multi-payment support for retail.' },
        { icon: Shield, cardBg: '#EAFBF0', iconBg: '#16A34A', title: 'Scalable & Secure', desc: 'Enterprise-grade security with 99.9% uptime. Scales with your business growth.' },
    ];

    const icons = [ClipboardList, Landmark, UserCog, Contact, MonitorSmartphone, Shield];

    const whyChooseUs = (sectionData.benefits && sectionData.benefits.length > 0)
        ? sectionData.benefits.map((b: any, idx: number) => {
            const fallback = defaultWhyChooseUs[idx % defaultWhyChooseUs.length];
            return {
                icon: icons[idx % icons.length],
                cardBg: b.bg || b.card_bg || fallback.cardBg,
                iconBg: b.color || b.icon_bg || fallback.iconBg,
                title: b.title,
                desc: b.description || b.desc
            };
        })
        : defaultWhyChooseUs;

    const galleryTitle = galleryData.title || 'See Automas ERP in Action';
    const gallerySubtitle = galleryData.subtitle || 'Explore our intuitive interface and powerful features through real screenshots of our platform.';

    const screenshots = [
        { title: 'Dashboard Overview', code: 'automas / screenshot-1' },
        { title: 'Project Management', code: 'automas / screenshot-2' },
        { title: 'Module Grid', code: 'automas / screenshot-3' },
        { title: 'Financial Analytics', code: 'automas / screenshot-4' },
    ];

    const faqs = [
        { q: 'What is Automas ERP?', a: 'An all-in-one platform combining project management, accounting, HR, CRM, POS, and inventory in one connected system.' },
        { q: 'How does multitenancy work?', a: 'Each business gets its own isolated database and workspace, so your data never mixes with anyone else\'s.' },
        { q: 'What hosting is required?', a: 'None — Automas is fully cloud-hosted, so there\'s nothing to install or maintain on your end.' },
        { q: 'How customizable is this platform?', a: 'Modules, roles, and workflows can all be configured per business, with custom subdomains available on the Pro plan.' },
        { q: 'Can I integrate third-party tools?', a: 'Yes — payment gateways, and other business tools connect through the built-in integrations panel.' },
    ];

    return (
        <>
            {/* Why Choose Automas ERP */}
            <section className="relative py-28 border-y border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
                            {t(sectionTitle)}
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
                            {t(sectionSubtitle)}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {whyChooseUs.map((item: any, idx: number) => {
                            const fallback = defaultWhyChooseUs[idx % defaultWhyChooseUs.length];
                            const cardBg = item.cardBg || fallback.cardBg;
                            const iconBg = item.iconBg || fallback.iconBg;
                            const IconComponent = item.icon;

                            return (
                                <div
                                    key={idx}
                                    style={{ backgroundColor: cardBg }}
                                    className="rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
                                >
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md text-white group-hover:scale-110 transition-transform duration-300"
                                        style={{ backgroundColor: iconBg }}
                                    >
                                        <IconComponent className="w-6 h-6 stroke-[2]" />
                                    </div>
                                    <h3 className="text-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-slate-900 mb-3">
                                        {t(item.title)}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                        {t(item.desc)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Visual Tour Screenshots */}
            <section id="demo" className="relative py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-xs border border-slate-200 mb-6">
                            <Eye className="w-4 h-4" style={{ color: primaryColor }} />
                            <span className="text-xs font-semibold text-slate-600">{t('Visual Tour')}</span>
                        </div>
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            {t(galleryTitle)}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            {t(gallerySubtitle)}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {screenshots.map((shot, idx) => (
                            <div
                                key={idx}
                                onClick={() => setLightboxIndex(idx)}
                                className="group relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-slate-900"
                            >
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
                                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="ml-2 text-xs font-mono text-slate-400">{shot.code}</span>
                                </div>
                                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
                                    <div className="text-center space-y-2 group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                            <Maximize2 className="w-7 h-7" />
                                        </div>
                                        <p className="text-sm font-semibold text-white">{shot.title}</p>
                                        <span className="text-xs text-slate-400 font-mono">Click to expand screenshot</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <span className="text-sm font-semibold text-white">{screenshots[lightboxIndex].title}</span>
                            <button
                                onClick={() => setLightboxIndex(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="aspect-[16/10] bg-slate-950 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <Eye className="w-16 h-16 stroke-[1.5] mb-4 text-slate-600" />
                            <p className="text-lg font-semibold text-white mb-1">{screenshots[lightboxIndex].title}</p>
                            <p className="text-xs font-mono text-slate-500">High-resolution interactive preview available on live demo</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            <section className="relative py-28 bg-slate-50 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span 
                            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200 mb-3 shadow-2xs"
                            style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                        >
                            {t('Got Questions?')}
                        </span>
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                            {t('Frequently Asked Questions')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-slate-900 text-base sm:text-lg"
                                    >
                                        <span>{t(faq.q)}</span>
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <Plus className="w-4 h-4" />
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4">
                                            {t(faq.a)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}