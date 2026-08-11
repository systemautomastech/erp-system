import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, PlayCircle, ShieldCheck, CreditCard, Zap, TrendingUp, Users } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';

interface HeroProps {
    settings?: any;
}

export default function Hero({ settings }: HeroProps) {
    const { t } = useTranslation();
    const sectionData = settings?.config_sections?.sections?.hero || {};

    const heroImage = sectionData.image || '/packages/automas/LandingPage/src/marketplace/hero.png';
    const heroImageUrl = heroImage ? getImagePath(heroImage) : null;

    const colors = settings?.config_sections?.colors || {
        primary: 'var(--color-primary, #130774)',
        secondary: 'var(--color-secondary, #0b55b7)',
        accent: 'var(--color-accent, #130674)'
    };
    const primaryColor = colors.primary || 'var(--color-primary)';
    const secondaryColor = colors.secondary || 'var(--color-secondary)';
    const accentColor = colors.accent || 'var(--color-accent)';

    const rawTitle = sectionData.title || 'Transform Your Business with Automas ERP';
    const subtitle = sectionData.subtitle || 'An all-in-one SaaS and ERP platform built to simplify operations, boost productivity, and support business growth at every stage.';

    const primaryButtonText = sectionData.primary_button_text || 'Start Free Trial';
    const primaryButtonLink = sectionData.primary_button_link || route('register');
    const secondaryButtonText = sectionData.secondary_button_text || 'Watch Demo';
    const secondaryButtonLink = sectionData.secondary_button_link || '#demo';

    // Text items that change one by one automatically
    const rotatingTexts = sectionData.rotating_texts || [
        'Automas ERP',
        'Project Management',
        'Accounting System',
        'HRM & Payroll',
        'CRM Platform',
        'POS & Inventory',
    ];

    const [textIndex, setTextIndex] = useState(0);
    const [fadeState, setFadeState] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFadeState(false);
            setTimeout(() => {
                setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
                setFadeState(true);
            }, 300);
        }, 2800);

        return () => clearInterval(interval);
    }, [rotatingTexts.length]);

    const renderTitle = () => {
        const titlePrefix = sectionData.title_prefix || 'Transform Your Business with';
        return (
            <h1 className="gsap-hero-title font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-5xl font-bold leading-[1.15] mb-6 tracking-tight">
                <span style={{ color: primaryColor }}>
                    {t(titlePrefix)}{' '}
                </span>
                <span
                    style={{ color: accentColor }}
                    className={`inline-block transition-all duration-500 ml-2 transform ${fadeState ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
                        }`}
                >
                    {t(rotatingTexts[textIndex])}
                </span>
            </h1>
        );
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-slate-50">
            {/* Background Orbs & Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/50 via-slate-50 to-slate-50" />
            <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl top-10 -left-32 pointer-events-none" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
            <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl bottom-10 -right-20 pointer-events-none" style={{ backgroundColor: secondaryColor, opacity: 0.15 }} />

            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-10 items-center">

                    {/* Left Column Content */}
                    <div className="text-center lg:text-left">

                        {/* Rotating Title */}
                        {renderTitle()}

                        {/* Subtitle from settings */}
                        <p className="gsap-hero-subtitle text-base sm:text-lg text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-normal -ml-20">
                            {t(subtitle)}
                        </p>

                        {/* CTA Buttons from settings */}
                        <div className="gsap-hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <a
                                href={primaryButtonLink}
                                style={{ backgroundColor: primaryColor }}
                                className="px-8 py-4 rounded-full text-base font-semibold text-white inline-flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 hover:opacity-90"
                            >
                                <span>{t(primaryButtonText)}</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>

                            <a
                                href={secondaryButtonLink}
                                className="px-8 py-4 rounded-full text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
                            >
                                <PlayCircle className="w-5 h-5" style={{ color: primaryColor }} />
                                <span>{t(secondaryButtonText)}</span>
                            </a>
                        </div>

                    </div>

                    {/* Right Column Dashboard Visual & Floating Cards */}
                    <div className="gsap-hero-stage relative hidden lg:block">
                        <div className="relative z-10">

                            {/* Main Dashboard Card */}
                            <div className="bg-white rounded-2xl p-4 shadow-2xl shadow-slate-300/50 border border-slate-100">
                                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">

                                    {/* Browser Chrome Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="bg-slate-100 rounded-md px-3 py-1 text-xs text-slate-400 text-center font-mono">
                                                app.automas-erp.com
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Image or Content */}
                                    {heroImageUrl ? (
                                        <div className="relative overflow-hidden bg-slate-100">
                                            <img
                                                src={heroImageUrl}
                                                alt={t('Automas ERP Dashboard')}
                                                className="w-full h-auto object-cover max-h-[480px] rounded-b-xl shadow-inner transition-transform duration-500 hover:scale-[1.01]"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-6 grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1 bg-white rounded-lg p-4 border border-slate-100 shadow-xs">
                                                        <div className="text-xs text-slate-400 mb-1">{t('Revenue')}</div>
                                                        <div className="text-xl font-bold text-slate-900">$142.8K</div>
                                                        <div className="text-xs text-emerald-500 mt-1 font-semibold">+18%</div>
                                                    </div>
                                                    <div className="flex-1 bg-white rounded-lg p-4 border border-slate-100 shadow-xs">
                                                        <div className="text-xs text-slate-400 mb-1">{t('Active Users')}</div>
                                                        <div className="text-xl font-bold text-slate-900">4,291</div>
                                                        <div className="text-xs text-emerald-500 mt-1 font-semibold">+12%</div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 h-32 flex items-end gap-2 border border-slate-100 shadow-xs">
                                                    <div className="flex-1 bg-slate-200 rounded-t h-[40%]" />
                                                    <div className="flex-1 bg-slate-200 rounded-t h-[70%]" />
                                                    <div className="flex-1 bg-slate-200 rounded-t h-[55%]" />
                                                    <div className="flex-1 rounded-t h-[85%]" style={{ backgroundColor: primaryColor }} />
                                                    <div className="flex-1 bg-slate-200 rounded-t h-[60%]" />
                                                    <div className="flex-1 bg-slate-200 rounded-t h-[75%]" />
                                                    <div className="flex-1 rounded-t h-[95%]" style={{ backgroundColor: secondaryColor }} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-white rounded-lg p-4 text-center border border-slate-100 shadow-xs">
                                                    <div className="text-2xl font-bold text-slate-900">99.9%</div>
                                                    <div className="text-xs text-slate-400">{t('Uptime')}</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-xs">
                                                    <div className="text-xs text-slate-400 mb-2">{t('Tasks Done')}</div>
                                                    <div className="text-lg font-bold text-slate-900">1,847</div>
                                                    <div className="text-xs text-slate-400">{t('This week')}</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 flex items-center gap-2 border border-slate-100 shadow-xs">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>JP</div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white -ml-2" style={{ backgroundColor: secondaryColor }}>KS</div>
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white -ml-2">+9</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Floating Card Top Right */}
                            <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">{t('Growth')}</div>
                                        <div className="text-sm font-bold text-slate-900">+24.5%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card Bottom Left */}
                            <div className="absolute -bottom-4 -left-6 bg-white rounded-xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                        <Users className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">{t('New Users')}</div>
                                        <div className="text-sm font-bold text-slate-900">+128 today</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
