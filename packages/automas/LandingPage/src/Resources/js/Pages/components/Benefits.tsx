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
        { icon: ClipboardList, bg: 'bg-blue-50', color: 'text-[#1565C0]', title: 'Complete Project Management', desc: 'End-to-end project tracking with Gantt charts, Kanban boards, and team collaboration tools.' },
        { icon: Landmark, bg: 'bg-indigo-50', color: 'text-indigo-600', title: 'Integrated Financial System', desc: 'Comprehensive accounting, invoicing, expense tracking, and real-time financial reporting.' },
        { icon: UserCog, bg: 'bg-purple-50', color: 'text-purple-600', title: 'Efficient HR Management', desc: 'Streamlined employee records, attendance, payroll, and performance tracking.' },
        { icon: Contact, bg: 'bg-pink-50', color: 'text-pink-600', title: 'Powerful CRM Tools', desc: 'Manage leads, track pipelines, and close deals faster with intelligent automation.' },
        { icon: MonitorSmartphone, bg: 'bg-emerald-50', color: 'text-emerald-600', title: 'Modern POS Solution', desc: 'Fast transactions, real-time inventory, and multi-payment support for retail.' },
        { icon: Shield, bg: 'bg-amber-50', color: 'text-amber-600', title: 'Scalable & Secure', desc: 'Enterprise-grade security with 99.9% uptime. Scales with your business growth.' },
    ];

    const icons = [ClipboardList, Landmark, UserCog, Contact, MonitorSmartphone, Shield];

    const whyChooseUs = (sectionData.benefits && sectionData.benefits.length > 0)
        ? sectionData.benefits.map((b: any, idx: number) => ({
            icon: icons[idx % icons.length],
            bg: defaultWhyChooseUs[idx % defaultWhyChooseUs.length].bg,
            color: defaultWhyChooseUs[idx % defaultWhyChooseUs.length].color,
            title: b.title,
            desc: b.description || b.desc
        }))
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
            <section className="relative py-32 border-y border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            {t(sectionTitle)}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            {t(sectionSubtitle)}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {whyChooseUs.map((item: any, idx: number) => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xs hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-6`}>
                                        <IconComponent className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-lg font-['Plus_Jakarta_Sans',sans-serif] font-bold text-slate-900 mb-3">
                                        {t(item.title)}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
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

                    <div className="grid md:grid-cols-2 gap-6">
                        {screenshots.map((screen, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                                onClick={() => setLightboxIndex(idx)}
                            >
                                <div className="relative">
                                    <div className="bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 h-44 flex items-end gap-2 border border-slate-100 shadow-xs">
                                            <div className="flex-1 bg-slate-200 rounded-t h-[30%]" />
                                            <div className="flex-1 bg-slate-200 rounded-t h-[60%]" />
                                            <div className="flex-1 bg-slate-200 rounded-t h-[45%]" />
                                            <div className="flex-1 rounded-t h-[80%]" style={{ backgroundColor: primaryColor }} />
                                            <div className="flex-1 bg-slate-200 rounded-t h-[55%]" />
                                            <div className="flex-1 rounded-t h-[90%]" style={{ backgroundColor: secondaryColor }} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                            <Maximize2 className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <div className="text-sm font-semibold text-slate-900">{t(screen.title)}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-1">{screen.code}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending FAQs */}
            <section className="relative py-32 bg-slate-50 border-t border-slate-100" id="faq">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                            {t('Frequently Asked Questions')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full text-left p-6 flex items-center justify-between font-bold text-slate-900 text-base sm:text-lg"
                                    >
                                        <span>{t(faq.q)}</span>
                                        <Plus className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-45' : ''}`} style={{ color: primaryColor }} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                                            {t(faq.a)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                    <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                            <h3 className="font-bold text-lg text-slate-900">{t(screenshots[lightboxIndex].title)}</h3>
                            <button onClick={() => setLightboxIndex(null)} className="p-2 text-slate-400 hover:text-slate-900">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center text-slate-400 font-mono">
                            {screenshots[lightboxIndex].code}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}