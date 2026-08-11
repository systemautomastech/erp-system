import { Menu, X, ShieldCheck, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { getAdminSetting, getImagePath } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';

interface HeaderProps {
    settings?: any;
}

export default function Header({ settings }: HeaderProps) {
    const sectionData = settings?.config_sections?.sections?.header || {};
    const colors = settings?.config_sections?.colors || {
        primary: 'var(--color-primary, #130774)',
        secondary: 'var(--color-secondary, #0b55b7)',
        accent: 'var(--color-accent, #130674)'
    };
    const primaryColor = colors.primary || 'var(--color-primary)';
    const { t } = useTranslation();

    const companyName = sectionData.company_name || settings?.company_name || 'Automas';
    const ctaText = sectionData.cta_text || 'Start Free Trial';
    const isAuthenticated = settings?.is_authenticated;

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logoKey = 'logo_dark';
    const logoPath = getAdminSetting(logoKey);
    const logoUrl = logoPath ? getImagePath(logoPath) : null;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigationItems = sectionData.navigation_items || [
        { text: 'Features', href: '#features' },
        { text: 'Modules', href: '#modules' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Demo', href: '#demo' },
        { text: 'About', href: '#about' },
    ];

    const renderNavItems = (isMobile = false) => {
        return navigationItems.map((item: any, idx: number) => {
            const href = item.href?.startsWith('/page/') 
                ? route('custom-page.show', item.href.replace('/page/', '')) 
                : item.href;

            const className = isMobile
                ? 'block py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors'
                : 'text-sm font-medium text-slate-600 hover:text-primary transition-colors';

            return item.target === '_blank' ? (
                <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                    {t(item.text)}
                </a>
            ) : (
                <Link key={idx} href={href} className={className} onClick={() => isMobile && setMobileMenuOpen(false)}>
                    {t(item.text)}
                </Link>
            );
        });
    };

    return (
        <nav id="navbar" className={`absolute md:fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled ? 'bg-white/80 md:backdrop-blur-xl border-b border-slate-200/80 shadow-xs' : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    {/* Logo */}
                    <Link href={route('landing.page')} className="flex items-center gap-3 group">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="h-10 w-auto max-w-40 object-contain" />
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300" style={{ backgroundColor: primaryColor }}>
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-slate-900 tracking-tight">
                                    {companyName}
                                </span>
                            </>
                        )}
                    </Link>

                    {/* Navigation Links from settings */}
                    <div className="hidden md:flex items-center gap-8">
                        {renderNavItems()}

                        {sectionData?.enable_addon_link !== false && (
                            <Link href={route('addons.page')} className="text-sm font-medium text-slate-600 hover:opacity-80 transition-colors">
                                {t('Add-Ons')}
                            </Link>
                        )}

                        {sectionData?.enable_pricing_link !== false && (
                            <Link href={route('pricing.page')} className="text-sm font-medium text-slate-600 hover:opacity-80 transition-colors">
                                {t('Pricing')}
                            </Link>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => router.visit(route('dashboard'))}
                                style={{ backgroundColor: primaryColor }}
                                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-md flex items-center gap-2 hover:opacity-90"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                {t('Dashboard')}
                            </button>
                        ) : (
                            <>
                                <a href={route('login')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                    {t('Login')}
                                </a>
                                <a href={route('register')} style={{ backgroundColor: primaryColor }} className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-md hover:opacity-90">
                                    {t(ctaText)}
                                </a>
                            </>
                        )}
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-xl px-6 py-5 space-y-3">
                    {renderNavItems(true)}
                    <div className="pt-3 border-t border-slate-200 flex flex-col gap-3">
                        <a href={route('login')} className="text-slate-600 font-medium py-2">
                            {t('Login')}
                        </a>
                        <a href={route('register')} style={{ backgroundColor: primaryColor }} className="px-5 py-2.5 rounded-full text-sm font-semibold text-white text-center shadow-md">
                            {t(ctaText)}
                        </a>
                        <div className="pt-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{t('Language')}</span>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
