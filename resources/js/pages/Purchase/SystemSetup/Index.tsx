import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import PurchaseSetupSidebar from "./PurchaseSetupSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, FileText, Image as ImageIcon, Building, CreditCard } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { getImagePath } from '@/utils/helpers';

interface PurchaseInvoiceSettingsProps {
    settings?: {
        purchase_invoice_logo?: string;
        purchase_invoice_show_logo?: string;
        purchase_invoice_bg_letterhead?: string;
        purchase_invoice_enable_letterhead?: string;
        purchase_invoice_default_payment_terms?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export default function Index() {
    const { t } = useTranslation();
    const { settings } = usePage<PurchaseInvoiceSettingsProps>().props;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        purchase_invoice_logo: settings?.purchase_invoice_logo || '',
        purchase_invoice_show_logo: settings?.purchase_invoice_show_logo !== 'off',
        purchase_invoice_bg_letterhead: settings?.purchase_invoice_bg_letterhead || '',
        purchase_invoice_enable_letterhead: settings?.purchase_invoice_enable_letterhead === 'on',
        purchase_invoice_default_payment_terms: settings?.purchase_invoice_default_payment_terms ?? '<p>Payment due within 30 days of invoice date.</p>',
    });

    useFlashMessages();

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            settings: {
                ...formData,
                purchase_invoice_show_logo: formData.purchase_invoice_show_logo ? 'on' : 'off',
                purchase_invoice_enable_letterhead: formData.purchase_invoice_enable_letterhead ? 'on' : 'off',
            }
        };

        router.post(route('purchase-invoice-setup.update'), payload, {
            preserveScroll: true,
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Purchase'), url: route('purchase-invoices.index') },
                { label: t('System Setup') },
                { label: t('Purchase Invoice Setup') }
            ]}
            pageTitle={t('Purchase Invoice Setup')}
        >
            <Head title={t('Purchase Invoice Setup')} />

            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-64 flex-shrink-0">
                    <PurchaseSetupSidebar activeItem="purchase-invoice-settings" />
                </div>

                <div className="flex-1 space-y-6">
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-xs border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                        <FileText className="h-5 w-5 text-slate-700" />
                                        {t('Purchase Invoice Design & Setup')}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500 mt-1">
                                        {t('Configure custom logo, background letterhead image, and default payment terms for purchase invoices.')}
                                    </CardDescription>
                                </div>
                                <Button type="submit" disabled={isLoading} size="sm" className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {isLoading ? t('Saving...') : t('Save Settings')}
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                {/* SECTION 1: PURCHASE INVOICE LOGO OPTION WITH TOGGLE */}
                                <div className="space-y-4 border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-200 text-slate-700 rounded-md">
                                                <Building className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">{t('Purchase Invoice Custom Logo')}</h3>
                                                <p className="text-xs text-slate-500">
                                                    {t('Upload a custom logo or toggle off if your letterhead paper already contains a printed logo.')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="show-logo" className="cursor-pointer text-xs font-medium text-slate-700">
                                                {formData.purchase_invoice_show_logo ? t('Logo: ON') : t('Logo: OFF')}
                                            </Label>
                                            <Switch
                                                id="show-logo"
                                                checked={formData.purchase_invoice_show_logo}
                                                onCheckedChange={(checked) => handleChange('purchase_invoice_show_logo', checked)}
                                            />
                                        </div>
                                    </div>

                                    {formData.purchase_invoice_show_logo && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('Select / Upload Purchase Invoice Logo')}</Label>
                                                <MediaPicker
                                                    value={formData.purchase_invoice_logo}
                                                    onChange={(url) => handleChange('purchase_invoice_logo', Array.isArray(url) ? url[0] : url)}
                                                    placeholder={t('Choose purchase invoice logo image...')}
                                                    showPreview={false}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs">{t('Logo Preview')}</Label>
                                                <div className="border border-slate-200 rounded-md p-3 h-16 bg-white flex items-center justify-center">
                                                    {formData.purchase_invoice_logo ? (
                                                        <img
                                                            src={getImagePath(formData.purchase_invoice_logo)}
                                                            alt="Purchase Invoice Logo"
                                                            className="max-h-12 max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">
                                                            {t('Using default company logo')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: BACKGROUND LETTERHEAD */}
                                <div className="space-y-4 border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-200 text-slate-700 rounded-md">
                                                <ImageIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">{t('Background Letterhead Image')}</h3>
                                                <p className="text-xs text-slate-500">
                                                    {t('Upload an optional background graphic to be used behind printed A4 purchase invoices')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="enable-letterhead" className="cursor-pointer text-xs font-medium text-slate-700">
                                                {formData.purchase_invoice_enable_letterhead ? t('Letterhead: ON') : t('Letterhead: OFF')}
                                            </Label>
                                            <Switch
                                                id="enable-letterhead"
                                                checked={formData.purchase_invoice_enable_letterhead}
                                                onCheckedChange={(checked) => handleChange('purchase_invoice_enable_letterhead', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                                        <div className="space-y-2">
                                            <Label className="text-xs">{t('Select / Upload Background Image')}</Label>
                                            <MediaPicker
                                                value={formData.purchase_invoice_bg_letterhead}
                                                onChange={(url) => handleChange('purchase_invoice_bg_letterhead', Array.isArray(url) ? url[0] : url)}
                                                placeholder={t('Choose background letterhead...')}
                                                showPreview={false}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs">{t('Background Preview')}</Label>
                                            <div className="border border-slate-200 rounded-md h-24 bg-white relative overflow-hidden flex items-center justify-center">
                                                {formData.purchase_invoice_bg_letterhead ? (
                                                    <img
                                                        src={getImagePath(formData.purchase_invoice_bg_letterhead)}
                                                        alt="Letterhead Preview"
                                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">{t('No background image selected')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: DEFAULT PAYMENT TERMS */}
                                <div className="space-y-4 border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                                        <div className="p-2 bg-slate-200 text-slate-700 rounded-md">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">{t('Default Payment Terms')}</h3>
                                            <p className="text-xs text-slate-500">
                                                {t('Apply to new purchase invoices and prints.')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <RichTextEditor
                                            content={formData.purchase_invoice_default_payment_terms}
                                            onChange={(val) => handleChange('purchase_invoice_default_payment_terms', val)}
                                            placeholder={t('Enter default payment terms...')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
