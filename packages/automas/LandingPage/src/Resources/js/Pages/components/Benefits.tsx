import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Landmark, UserCog, Contact, MonitorSmartphone, Shield, Eye, Maximize2, X, Plus, ArrowUpRight } from 'lucide-react';

interface BenefitsProps {
    settings?: any;
}

export default function Benefits({ settings }: BenefitsProps) {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeShot, setActiveShot] = useState<number>(0);

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
            <section className="relative py-6 lg:py-24 bg-transparent">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
                            {t(sectionTitle)}
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
                            {t(sectionSubtitle)}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                        {whyChooseUs.map((item: any, idx: number) => {
                            const fallback = defaultWhyChooseUs[idx % defaultWhyChooseUs.length];
                            const cardBg = item.cardBg || fallback.cardBg;
                            const iconBg = item.iconBg || fallback.iconBg;
                            const IconComponent = item.icon;

                            return (
                                <div
                                    key={idx}
                                    style={{ backgroundColor: cardBg }}
                                    className="rounded-xl sm:rounded-2xl p-3.5 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between h-full min-h-[160px] sm:min-h-[220px]"
                                >
                                    <div>
                                        <div
                                            className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-6 shadow-md text-white group-hover:scale-110 transition-transform duration-300"
                                            style={{ backgroundColor: iconBg }}
                                        >
                                            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2]" />
                                        </div>
                                        <h3 className="text-sm sm:text-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-slate-900 mb-1.5 sm:mb-3 line-clamp-2">
                                            {t(item.title)}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3 sm:line-clamp-none">
                                            {t(item.desc)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Visual Tour — tabbed viewer */}
            <section id="demo" className="relative py-16 lg:py-20 bg-transparent">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.05] max-w-xl">
                            {t(galleryTitle)}
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 max-w-sm lg:text-right leading-relaxed">
                            {t(gallerySubtitle)}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-0 border border-slate-200 rounded-2xl overflow-hidden">
                        {/* tab list */}
                        <div className="lg:border-r border-slate-200 bg-slate-50/60 flex lg:flex-col overflow-x-auto lg:overflow-visible">
                            {screenshots.map((shot, idx) => {
                                const isActive = activeShot === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveShot(idx)}
                                        className={`relative shrink-0 w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4 border-b border-slate-200 last:border-b-0 transition-colors ${isActive ? 'bg-white' : 'hover:bg-white/60'}`}
                                    >
                                        <span
                                            className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity"
                                            style={{ backgroundColor: primaryColor, opacity: isActive ? 1 : 0 }}
                                        />
                                        <span className={`font-mono text-[11px] ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className={`text-[13.5px] font-semibold whitespace-nowrap ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {shot.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* preview panel */}
                        <div
                            onClick={() => setLightboxIndex(activeShot)}
                            className="group relative cursor-pointer bg-slate-950 min-h-[320px] sm:min-h-[420px] flex items-center justify-center"
                        >
                            <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-5 py-3.5 bg-slate-950/80 border-b border-white/10">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                <span className="ml-2 text-[11px] font-mono text-slate-400">{screenshots[activeShot].code}</span>
                                <span className="ml-auto flex items-center gap-1 text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    expand <ArrowUpRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="text-center space-y-3 group-hover:scale-[1.03] transition-transform duration-500">
                                <div className="w-14 h-14 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                    <Maximize2 className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-semibold text-white/90">{screenshots[activeShot].title}</p>
                                <span className="text-xs text-slate-500 font-mono">click to expand screenshot</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-6 lg:py-24 bg-transparent">
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