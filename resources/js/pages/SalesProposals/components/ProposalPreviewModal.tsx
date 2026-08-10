import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X, FileText } from 'lucide-react';
import { formatCurrency, formatDate, getCompanySetting, getImagePath } from '@/utils/helpers';
import html2pdf from 'html2pdf.js';

interface ProposalPreviewSection {
    id?: string;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    is_front_page?: boolean;
    order?: number;
}

interface ProposalPreviewItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
    discount_amount?: number;
    tax_percentage?: number;
    tax_amount?: number;
    total_amount?: number;
    product?: {
        id?: number;
        name: string;
        sku?: string;
    };
    taxes?: Array<{
        id?: number;
        tax_name: string;
        tax_rate: number;
    }>;
}

interface ProposalPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        proposal_number?: string;
        invoice_date?: string;
        due_date?: string;
        customer_id?: string | number;
        warehouse_id?: string | number;
        type?: string;
        payment_terms?: string;
        notes?: string;
        items: any[];
    };
    sections?: ProposalPreviewSection[];
    termSections?: ProposalPreviewSection[];
    customers?: Array<{ id: number; name: string; email: string }>;
    warehouses?: Array<{ id: number; name: string; address?: string }>;
    availableProducts?: Array<{ id: number; name: string; sku?: string; sale_price?: number }>;
    proposalSetting?: { logo_image?: string; background_image?: string } | null;
    tariffs?: Array<{
        id?: number;
        particulars: string;
        tariff_per_min: number | string;
        brand: string;
        qty: number | string;
        pulse_per_min: string;
        sort_order?: number;
    }>;
    totals: {
        subtotal: number;
        tax_amount?: number;
        taxAmount?: number;
        discount_amount?: number;
        discountAmount?: number;
        total_amount?: number;
        total?: number;
    };
}

export default function ProposalPreviewModal({
    isOpen,
    onClose,
    formData,
    sections = [],
    termSections = [],
    customers = [],
    warehouses = [],
    availableProducts = [],
    proposalSetting,
    tariffs = [],
    totals,
}: ProposalPreviewModalProps) {
    const { t } = useTranslation();
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const logoImage = proposalSetting?.logo_image || getCompanySetting('company_logo') || getCompanySetting('company_dark_logo') || getCompanySetting('logo');
    const bgImage = proposalSetting?.background_image;
    const bgStyle: React.CSSProperties = bgImage
        ? {
            backgroundImage: `url(${getImagePath(bgImage)})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
        : {};

    const templateColor = (proposalSetting as any)?.template_color || '#E9591C';

    const customer = customers.find((c) => c.id.toString() === formData.customer_id?.toString());
    const warehouse = warehouses.find((w) => w.id.toString() === formData.warehouse_id?.toString());

    const subtotal = totals.subtotal || 0;
    const discountAmount = totals.discount_amount ?? totals.discountAmount ?? 0;
    const taxAmount = totals.tax_amount ?? totals.taxAmount ?? 0;
    const totalAmount = totals.total_amount ?? totals.total ?? 0;

    const getItemProductName = (item: any) => {
        if (item.name) return item.name;
        if (item.product?.name) return item.product.name;
        const found = availableProducts.find((p) => String(p.id) === String(item.product_id));
        if (found?.name) return found.name;
        return item.product_name || (item.product_id ? `Product #${item.product_id}` : 'Item');
    };

    const getItemProductSku = (item: any) => {
        if (item.sku) return item.sku;
        if (item.product?.sku) return item.product.sku;
        const found = availableProducts.find((p) => String(p.id) === String(item.product_id));
        return found?.sku || '';
    };

    const frontPageSection = sections.find(
        (s) => s.page_type === 'front-page' || s.is_front_page || s.title?.toLowerCase().includes('front') || s.title?.toLowerCase().includes('cover')
    );
    const bodySections = frontPageSection ? sections.filter((s) => s !== frontPageSection) : sections;

    const handlePrint = () => {
        if (!previewContainerRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const stylesHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((node) => node.outerHTML)
            .join('\n');

        const elementHtml = previewContainerRef.current.outerHTML;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${t('Sales Proposal Preview')}</title>
                    ${stylesHtml}
                    <style>
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        @media print {
                            @page { size: A4 portrait; margin: 0; }
                            body { margin: 0 !important; }
                            .proposal-preview-sheet {
                                width: 210mm !important;
                                min-height: 297mm !important;
                                padding: 32mm 15mm 20mm !important;
                                margin: 0 !important;
                                page-break-after: always !important;
                                break-after: page !important;
                            }
                            .proposal-preview-sheet:last-child {
                                page-break-after: auto !important;
                                break-after: auto !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-wrapper">
                        ${elementHtml}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleDownloadPdf = async () => {
        if (!previewContainerRef.current) return;
        const element = previewContainerRef.current;
        const opt = {
            margin: 0,
            filename: `proposal-preview-${formData.proposal_number || 'draft'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        };
        try {
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Failed to download PDF preview:', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-900/40 backdrop-blur-md border-slate-700">
                {/* Modal Header */}
                <DialogHeader className="p-4 sm:px-6 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold">
                                {t('Proposal Preview')}
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pr-6">
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2 text-xs h-8">
                            <Download className="h-3.5 w-3.5" />
                            {t('Download')}
                        </Button>
                        <Button variant="default" size="sm" onClick={handlePrint} className="gap-2 text-xs h-8">
                            <Printer className="h-3.5 w-3.5" />
                            {t('Print')}
                        </Button>
                    </div>
                </DialogHeader>

                {/* Modal Body - Scrollable Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
                    <div ref={previewContainerRef} className="space-y-8 flex flex-col items-center w-full">

                        {/* 1. FRONT COVER PAGE */}
                        {frontPageSection && (
                            <div
                                style={{
                                    ...(frontPageSection.background_image
                                        ? {
                                            backgroundImage: `url(${getImagePath(frontPageSection.background_image)})`,
                                            backgroundSize: '100% 100%',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }
                                        : {})
                                }}
                                className="quotation-cover__sheet shadow-2xl rounded-sm shrink-0 border border-slate-200 dark:border-slate-800"
                            >
                                {!frontPageSection.background_image && (
                                    <>
                                        <div className="quotation-cover__topbar" style={{ background: `linear-gradient(90deg, ${templateColor}, #fffb00)` }}></div>

                                        <svg className="absolute quotation-cover__shape quotation-cover__shape--top pointer-events-none" style={{ position: 'absolute', top: '-46px', left: '-46px', width: '240px', zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28"></circle>
                                            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                            <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__shape quotation-cover__shape--bottom pointer-events-none" style={{ position: 'absolute', right: '-30px', bottom: '-30px', width: '240px', transform: 'rotate(180deg)', opacity: 0.5, zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28"></circle>
                                            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                            <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__watermark pointer-events-none" style={{ position: 'absolute', right: '22mm', top: '76mm', width: '150px', height: '150px', opacity: 0.05, zIndex: 1, color: templateColor }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none"></circle>
                                            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__watermark_bottom pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '0.5rem', bottom: '7.5rem', width: '150px', height: '150px', opacity: 0.08, pointerEvents: 'none', zIndex: 1, color: templateColor }}>
                                            <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none"></circle>
                                            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                        </svg>
                                    </>
                                )}

                                <div className="quotation-cover__body">
                                    <div className="text-end logo-container">
                                        <img
                                            src={getImagePath(logoImage || 'uploads/logo/logo_dark.png')}
                                            alt="Company Logo"
                                            className="quotation-cover__logo max-h-16 max-w-[240px] object-contain ml-auto"
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="quotation-cover__label mb-2" style={{ color: templateColor }}>
                                            {t('Financial Proposal')}
                                        </div>

                                        <h1 className="quotation-cover__title mb-2">
                                            {(formData as any).subject || 'Subject'}
                                        </h1>

                                        <div className="text-lg text-slate-500 font-semibold mb-3">
                                            {t('Quotation & Commercial Proposal')}
                                        </div>

                                        <div className="quotation-cover__line mb-5" style={{ backgroundColor: templateColor }}></div>

                                        <div className="mb-12">
                                            <span className="quotation-cover__date rounded-lg" style={{ borderColor: templateColor, color: templateColor }}>
                                                {formData.invoice_date ? formatDate(formData.invoice_date) : formatDate(new Date().toISOString())}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="quotation-cover__box quotation-cover__submitted text-center">
                                                <div className="uppercase text-slate-500 font-bold text-xs mb-2 underline" style={{ textDecoration: 'underline' }}>
                                                    {t('Submitted To')}
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-1">
                                                    {customer?.name || t('Client Name')}
                                                </h2>
                                                <p className="text-slate-600 text-xs mb-0">
                                                    {(customer as any)?.address || customer?.email || t('Client Address')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="quotation-cover__box quotation-cover__prepared text-center mb-4">
                                            <div className="uppercase text-slate-500 font-bold text-xs mb-3 underline" style={{ textDecoration: 'underline' }}>
                                                {t('Prepared By')}
                                            </div>

                                            <div className="text-xl font-bold text-slate-900 mb-1">
                                                {getCompanySetting('company_name') || t('Company Name')}
                                            </div>

                                            <div className="text-sm text-slate-500 mb-3 font-medium">
                                                {getCompanySetting('company_tagline') || t('Company Information')}
                                            </div>

                                            <div className="text-xs text-slate-700 space-y-1">
                                                <div className="mb-1">
                                                    <strong>{t('Corporate Office')}:</strong>{' '}
                                                    {getCompanySetting('company_address') || t('Company Address')}
                                                </div>
                                                <div className="mb-1 flex flex-wrap justify-center gap-x-4">
                                                    <span><strong>{t('Web')}:</strong> {getCompanySetting('company_website') || 'www.example.com'}</span>
                                                    <span><strong>{t('Email')}:</strong> {getCompanySetting('company_email') || 'info@example.com'}</span>
                                                </div>
                                                <div>
                                                    <strong>{t('Phone')}:</strong> {getCompanySetting('company_phone') || t('Company Phone')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="quotation-cover__footer flex justify-between items-end gap-3 text-slate-600">
                                        <div>
                                            <strong className="text-slate-900">{t('Prepared by')}:</strong>{' '}
                                            {(formData as any).creator_name || getCompanySetting('company_name') || t('Creator Name')}
                                        </div>
                                        <div className="text-right">
                                            <strong className="text-slate-900">{t('Subject')}:</strong>{' '}
                                            {(formData as any).subject || t('Subject')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. INDIVIDUAL DEFAULT PAGE SECTIONS (Each default page section takes a single full A4 page sheet) */}
                        {bodySections.length > 0 &&
                            bodySections.map((section, idx) => (
                                <div
                                    key={section.id || idx}
                                    style={{
                                        '--template-color': templateColor,
                                        padding: '32mm 15mm 20mm',
                                        ...(section.background_image
                                            ? {
                                                backgroundImage: `url(${getImagePath(section.background_image)})`,
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                            }
                                            : bgStyle)
                                    } as React.CSSProperties}
                                    className="proposal-preview-sheet bg-white text-slate-900 w-[210mm] min-h-[297mm] max-w-full shadow-2xl rounded-sm space-y-6 text-sm font-sans border border-slate-200 dark:border-slate-800 shrink-0 flex flex-col justify-between"
                                >
                                    <div className="space-y-6">
                                        {section.title && (
                                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight border-b border-slate-200 pb-4">
                                                {section.title}
                                            </h2>
                                        )}
                                        {section.content ? (
                                            <div
                                                className="text-slate-700 text-sm sm:text-base leading-relaxed prose max-w-none [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-400 italic py-8 text-center">{t('Empty section content...')}</p>
                                        )}
                                    </div>
                                    <div className="border-t border-slate-200/60 pt-3 text-right text-[11px] text-slate-400">
                                        <span>{t('Page')} {frontPageSection ? idx + 2 : idx + 1}</span>
                                    </div>
                                </div>
                            ))}

                        {/* 3. PROPOSAL FINANCIAL DETAILS & TABLES SHEET */}
                        <div
                            style={{
                                '--template-color': templateColor,
                                padding: '32mm 15mm 20mm',
                                ...bgStyle
                            } as React.CSSProperties}
                            className="proposal-preview-sheet bg-white text-slate-900 w-[210mm] min-h-[297mm] max-w-full shadow-2xl rounded-sm space-y-8 text-sm font-sans border border-slate-200 dark:border-slate-800 shrink-0"
                        >
                            {/* Company Header & Document Meta */}
                            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                                <div className="w-1/2 space-y-2">
                                    {logoImage ? (
                                        <div className="mb-2">
                                            <img
                                                src={getImagePath(logoImage)}
                                                alt="Company Logo"
                                                className="max-h-16 max-w-[220px] object-contain"
                                            />
                                        </div>
                                    ) : null}
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                        {getCompanySetting('company_name') || t('YOUR COMPANY')}
                                    </h1>
                                    <div className="text-xs text-slate-600 space-y-0.5">
                                        {getCompanySetting('company_address') && <p>{getCompanySetting('company_address')}</p>}
                                        {(getCompanySetting('company_city') || getCompanySetting('company_state') || getCompanySetting('company_zipcode')) && (
                                            <p>
                                                {getCompanySetting('company_city')}{getCompanySetting('company_state') && `, ${getCompanySetting('company_state')}`} {getCompanySetting('company_zipcode')}
                                            </p>
                                        )}
                                        {getCompanySetting('company_country') && <p>{getCompanySetting('company_country')}</p>}
                                        {getCompanySetting('company_telephone') && <p>{t('Phone')}: {getCompanySetting('company_telephone')}</p>}
                                        {getCompanySetting('company_email') && <p>{t('Email')}: {getCompanySetting('company_email')}</p>}
                                    </div>
                                </div>

                                <div className="text-right w-1/2 space-y-1">
                                    <div className="inline-flex items-center gap-2">
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-wider">{t('SALES PROPOSAL')}</h2>
                                    </div>
                                    <p className="text-base font-semibold text-slate-700">
                                        #{(formData as any).proposal_id || formData.proposal_number || 'DRAFT'}
                                    </p>
                                    <div className="text-xs text-slate-600 pt-2 space-y-1">
                                        <p><span className="font-semibold text-slate-700">{t('Date')}:</span> {formData.invoice_date ? formatDate(formData.invoice_date) : '-'}</p>
                                        <p><span className="font-semibold text-slate-700">{t('Due Date')}:</span> {formData.due_date ? formatDate(formData.due_date) : '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Warehouse Section */}
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('PROPOSAL TO')}</h3>
                                    {customer ? (
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-900">{customer.name}</p>
                                            <p className="text-xs text-slate-600">{customer.email}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">{t('No customer selected yet')}</p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t('DETAILS')}</h3>
                                    <div className="text-xs text-slate-600 space-y-0.5">
                                        {formData.type && (
                                            <p><span className="font-medium">{t('Type')}:</span> {formData.type === 'service' ? t('Service Wise') : t('Product Wise')}</p>
                                        )}
                                        {formData.type === 'product' && (
                                            <p><span className="font-medium">{t('Warehouse')}:</span> {warehouse?.name || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Proposal Items Grouped by Section (OTC, MRC, General) */}
                            {(() => {
                                const validItems = formData.items ? formData.items.filter((i) => i.product_id > 0) : [];
                                const otcItems = validItems.filter((i) => i.section === 'otc');
                                const mrcItems = validItems.filter((i) => i.section === 'mrc');
                                const generalItems = validItems.filter((i) => i.section !== 'otc' && i.section !== 'mrc');

                                const renderItemsTable = (itemsList: any[], title: string, badgeBg: string) => (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
                                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${badgeBg}`}>
                                                {itemsList.length} {t('Items')}
                                            </span>
                                        </div>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr style={{ backgroundColor: templateColor, color: '#ffffff' }} className="border-b border-slate-200 font-semibold text-white">
                                                        <th className="py-2.5 px-4 text-white">{t('ITEM')}</th>
                                                        <th className="py-2.5 px-3 text-center text-white">{t('QTY')}</th>
                                                        <th className="py-2.5 px-3 text-right text-white">{t('PRICE')}</th>
                                                        <th className="py-2.5 px-3 text-right text-white">{t('DISCOUNT')}</th>
                                                        <th className="py-2.5 px-3 text-right text-white">{t('TAX')}</th>
                                                        <th className="py-2.5 px-4 text-right text-white">{t('TOTAL')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {itemsList.map((item, index) => {
                                                        const itemName = getItemProductName(item);
                                                        const itemSku = getItemProductSku(item);
                                                        const lineTotal = item.total_amount || (item.quantity * item.unit_price);
                                                        return (
                                                            <tr key={index} className="hover:bg-slate-50/50">
                                                                <td className="py-2.5 px-4">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-semibold text-slate-900">{itemName}</span>
                                                                        {item.product_type && (
                                                                            <span className="text-[10px] font-medium capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                                                {item.product_type}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {itemSku && (
                                                                        <div className="text-[11px] text-slate-400">{t('SKU')}: {itemSku}</div>
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-center text-slate-800 font-medium">{item.quantity}</td>
                                                                <td className="py-2.5 px-3 text-right text-slate-800">{formatCurrency(item.unit_price)}</td>
                                                                <td className="py-2.5 px-3 text-right text-slate-600">
                                                                    {item.discount_percentage && item.discount_percentage > 0 ? (
                                                                        <div>
                                                                            <div>{item.discount_percentage}%</div>
                                                                            <div className="text-[11px] text-slate-400">-{formatCurrency(item.discount_amount || 0)}</div>
                                                                        </div>
                                                                    ) : (
                                                                        '0%'
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right text-slate-600">
                                                                    {item.tax_percentage && item.tax_percentage > 0 ? (
                                                                        <div>
                                                                            <div>{item.tax_percentage}%</div>
                                                                            <div className="text-[11px] text-slate-400">{formatCurrency(item.tax_amount || 0)}</div>
                                                                        </div>
                                                                    ) : (
                                                                        '0%'
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(lineTotal)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="space-y-4">
                                        {/* 1. One-Time Charge (OTC) Section */}
                                        {otcItems.length > 0 && renderItemsTable(otcItems, t('ONE-TIME CHARGES (OTC)'), 'bg-purple-100 text-purple-700')}

                                        {/* 2. Monthly Recurring Charge (MRC) Section */}
                                        {mrcItems.length > 0 && renderItemsTable(mrcItems, t('MONTHLY RECURRING CHARGES (MRC)'), 'bg-emerald-100 text-emerald-700')}

                                        {/* 3. General Proposal Items Section */}
                                        {(generalItems.length > 0 || (otcItems.length === 0 && mrcItems.length === 0)) &&
                                            renderItemsTable(
                                                generalItems.length > 0 ? generalItems : validItems,
                                                t('PRODUCTS/SERVICES'),
                                                'bg-blue-100 text-blue-700'
                                            )}
                                    </div>
                                );
                            })()}

                            {/* Tariff Details Table */}
                            {(() => {
                                const activeTariffs = (tariffs && tariffs.length > 0 ? tariffs : (formData as any).tariffs) || [];
                                if (!activeTariffs || activeTariffs.length === 0) return null;
                                return (
                                    <div className="space-y-3 pt-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('TARIFF DETAILS')}</h3>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr style={{ backgroundColor: templateColor, color: '#ffffff' }} className="border-b border-slate-200 font-semibold text-white">
                                                        <th className="py-2.5 px-4 text-white">{t('PARTICULARS')}</th>
                                                        <th className="py-2.5 px-3 text-right text-white">{t('TARIFF / MIN')}</th>
                                                        <th className="py-2.5 px-3 text-white">{t('BRAND')}</th>
                                                        <th className="py-2.5 px-3 text-center text-white">{t('QTY')}</th>
                                                        <th className="py-2.5 px-4 text-white">{t('PULSE / MIN')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {activeTariffs.map((tRow: any, tIdx: number) => (
                                                        <tr key={tIdx} className="hover:bg-slate-50/50">
                                                            <td className="py-2.5 px-4 font-semibold text-slate-900">{tRow.particulars || '-'}</td>
                                                            <td className="py-2.5 px-3 text-right text-slate-800">{tRow.tariff_per_min || '0.0000'}</td>
                                                            <td className="py-2.5 px-3 text-slate-700">{tRow.brand || '-'}</td>
                                                            <td className="py-2.5 px-3 text-center text-slate-800">{tRow.qty || '1'}</td>
                                                            <td className="py-2.5 px-4 text-slate-700">{tRow.pulse_per_min || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Summary / Totals Box */}
                            <div className="flex justify-end pt-2">
                                <div className="w-80 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                                    {(() => {
                                        const validItems = formData.items ? formData.items.filter((i) => i.product_id > 0) : [];
                                        const otcTotal = validItems.filter((i) => i.section === 'otc').reduce((acc, i) => acc + (i.total_amount || (i.quantity * i.unit_price) || 0), 0);
                                        const mrcTotal = validItems.filter((i) => i.section === 'mrc').reduce((acc, i) => acc + (i.total_amount || (i.quantity * i.unit_price) || 0), 0);
                                        return (
                                            <>
                                                {otcTotal > 0 && (
                                                    <div className="flex justify-between text-purple-700 font-medium">
                                                        <span>{t('Total OTC (One-Time)')}:</span>
                                                        <span>{formatCurrency(otcTotal)}</span>
                                                    </div>
                                                )}
                                                {mrcTotal > 0 && (
                                                    <div className="flex justify-between text-emerald-700 font-medium">
                                                        <span>{t('Total MRC (Monthly)')}:</span>
                                                        <span>{formatCurrency(mrcTotal)}</span>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                    <div className="flex justify-between text-slate-600">
                                        <span>{t('Subtotal')}:</span>
                                        <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-rose-600">
                                            <span>{t('Discount')}:</span>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    {taxAmount > 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>{t('Tax')}:</span>
                                            <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                                        <span>{t('TOTAL')}:</span>
                                        <span className="text-base text-primary">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Conditions Section */}
                            {termSections.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-4">
                                        {termSections.map((term, idx) => (
                                            <div key={term.id || idx} className="space-y-1">
                                                {term.content && (
                                                    <div
                                                        className="text-xs text-slate-600 leading-relaxed [&>p]:mb-1"
                                                        dangerouslySetInnerHTML={{ __html: term.content }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            {formData.notes && (
                                <div className="space-y-1.5 pt-4 border-t border-slate-200">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('NOTES')}</h3>
                                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed whitespace-pre-wrap">
                                        {formData.notes}
                                    </p>
                                </div>
                            )}

                            {/* Footer Payment Terms */}
                            {formData.payment_terms && (
                                <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
                                    <p><span className="font-semibold">{t('Payment Terms')}:</span> {formData.payment_terms}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
