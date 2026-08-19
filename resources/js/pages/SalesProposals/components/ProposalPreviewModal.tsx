import React, { useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import {
    formatDate,
    getCompanySetting,
    getImagePath,
} from '@/utils/helpers';

// =============================================================================
// TYPES
// =============================================================================

export interface ProposalPreviewSection {
    id?: string;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    is_front_page?: boolean;
    order?: number;
}

export interface ProposalItem {
    id?: string | number;
    name?: string;
    product_id?: string | number;
    product_name?: string;
    description?: string;
    product_description?: string;
    quantity?: number;
    unit_price?: number;
    total_amount?: number;
    discount_amount?: number;
    tax_amount?: number;
    section?: string;
    product?: {
        name?: string;
        description?: string;
    };
}

export interface ProposalTotals {
    subtotal: number;
    tax_amount?: number;
    taxAmount?: number;
    discount_amount?: number;
    discountAmount?: number;
    total_amount?: number;
    total?: number;
}

export interface ProposalFormData {
    id?: string | number;
    proposal_id?: string | number;
    proposal_number?: string;
    invoice_date?: string;
    due_date?: string;
    customer_id?: string | number;
    warehouse_id?: string | number;
    type?: string;
    payment_terms?: string;
    notes?: string;
    subject?: string;
    other_details?: string;
    items: ProposalItem[];
    creator_name?: string;
}

export interface ProposalPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: ProposalFormData;
    sections?: ProposalPreviewSection[];
    customers?: Array<{ id: number; name: string; email: string; address?: string }>;
    warehouses?: Array<{ id: number; name: string; address?: string }>;
    availableProducts?: Array<{
        id: number;
        name: string;
        sku?: string;
        sale_price?: number;
        description?: string;
    }>;
    proposalSetting?: {
        logo_image?: string;
        background_image?: string;
        template_color?: string;
    } | null;
    other_details?: string;
    totals: ProposalTotals;
}

export interface RenderablePage {
    key: string;
    type: 'front-page' | 'otc' | 'mrc' | 'other-details' | 'content';
    title?: string;
    content?: string;
    background_image?: string;
    chunkItems?: ProposalItem[];
    chunkIndex?: number;
    totalChunks?: number;
    startIndex?: number;
    isLastChunk?: boolean;
    secSubtotal?: number;
    secDiscount?: number;
    secTax?: number;
    secTotal?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MAX_PAGE_WEIGHT = 30;
const DEFAULT_TEMPLATE_COLOR = '#E9591C';
const FALLBACK_LOGO = 'uploads/logo/logo_dark.png';

const PRINT_STYLES = `
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }
    @media print {
        @page { size: 210mm 297mm; margin: 0; }
        html, body {
            width: 210mm !important; margin: 0 !important; padding: 0 !important;
            background: white !important;
        }
        .print-wrapper {
            width: 210mm !important; margin: 0 !important; padding: 0 !important;
        }
        .proposal-preview-sheet,
        .quotation-cover__sheet {
            width: 210mm !important; height: 297mm !important;
            min-height: 297mm !important; max-height: 297mm !important;
            padding: 0 !important; margin: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important; break-after: page !important;
            page-break-inside: avoid !important; break-inside: avoid-page !important;
            overflow: hidden !important;
        }
        .quotation-page__body {
            position: relative !important; z-index: 1 !important;
            padding: 32mm 15mm 20mm !important;
            min-height: calc(297mm - 20mm) !important;
            box-sizing: border-box !important;
            display: flex !important; flex-direction: column !important;
            justify-content: space-between !important;
        }
        .proposal-preview-sheet:last-child,
        .quotation-cover__sheet:last-child {
            page-break-after: auto !important; break-after: auto !important;
        }
    }
`;

// =============================================================================
// PURE UTILITIES (Not exported to allow Vite Fast Refresh)
// =============================================================================

const formatAmountOnly = (val: number | string): string => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getPageBgStyle = (
    customBg?: string,
    defaultBg?: string,
    isFrontPage = false
): React.CSSProperties => {
    const bg = customBg || (!isFrontPage ? defaultBg : undefined);
    if (!bg) return {};
    return {
        backgroundImage: `url(${getImagePath(bg)})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };
};

const estimateItemWeight = (item: ProposalItem, getDesc: (i: ProposalItem) => string): number => {
    const desc = getDesc(item) || '';
    // Strip HTML tags and normalize text
    const plainText = desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    // Count explicit line breaks and block tags
    const blockTags = (desc.match(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/gi) || []).length;
    // Description text wrapping in the 38% width column (~48 chars per line at 11px)
    const textLines = Math.ceil(plainText.length / 48);
    const descLines = Math.max(textLines, blockTags, desc ? 1 : 0);

    // Item name text wrapping in the 22% column (~28 chars per line)
    const itemName = item.name || item.product?.name || item.product_name || '';
    const nameLines = Math.max(Math.ceil(itemName.length / 28), 1);

    const effectiveLines = Math.max(descLines, nameLines);

    // 1 base row = 1 unit. Each additional line of wrapped text adds 0.7 units.
    return 1 + (effectiveLines - 1) * 0.7;
};

const chunkItemsDynamic = (
    items: ProposalItem[],
    getDesc: (i: ProposalItem) => string
): Array<{ items: ProposalItem[]; startIndex: number }> => {
    if (items.length === 0) return [];

    const chunks: Array<{ items: ProposalItem[]; startIndex: number }> = [];
    let currentChunk: ProposalItem[] = [];
    let currentWeight = 0;
    let currentStartIndex = 0;

    // Available table height budget scaled to fit more items:
    // Regular page capacity (without summary rows): 26 units.
    // Last page capacity (with summary rows and totals): 25 units.
    const REGULAR_PAGE_CAPACITY = 26;
    const LAST_PAGE_CAPACITY = 25;

    for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const itemWeight = estimateItemWeight(item, getDesc);
        const remainingItems = items.length - idx;

        // Use LAST_PAGE_CAPACITY if this chunk could hold the rest of the items (so summary rows fit)
        const capacity = remainingItems <= 5 ? LAST_PAGE_CAPACITY : REGULAR_PAGE_CAPACITY;

        if (currentChunk.length > 0 && (currentWeight + itemWeight > capacity)) {
            chunks.push({ items: currentChunk, startIndex: currentStartIndex });
            currentChunk = [item];
            currentWeight = itemWeight;
            currentStartIndex = idx;
        } else {
            currentChunk.push(item);
            currentWeight += itemWeight;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push({ items: currentChunk, startIndex: currentStartIndex });
    }

    return chunks;
};

const convertSvgsToImages = (element: HTMLElement): (() => void) => {
    const svgs = Array.from(element.querySelectorAll('svg'));
    const replacements: Array<{ svg: SVGElement; img: HTMLImageElement }> = [];

    svgs.forEach((svg) => {
        try {
            const svgString = new XMLSerializer().serializeToString(svg);
            const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
            const computed = window.getComputedStyle(svg);

            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.cssText = `
                position: ${computed.position || 'absolute'};
                top: ${computed.top}; left: ${computed.left};
                right: ${computed.right}; bottom: ${computed.bottom};
                width: ${computed.width}; height: ${computed.height};
                transform: ${computed.transform}; opacity: ${computed.opacity};
                z-index: ${computed.zIndex}; pointer-events: none;
            `;

            if (svg.parentNode) {
                svg.parentNode.insertBefore(img, svg);
                svg.style.display = 'none';
                replacements.push({ svg, img });
            }
        } catch (e) {
            console.error('Error rasterizing SVG for canvas capture:', e);
        }
    });

    return () => {
        replacements.forEach(({ svg, img }) => {
            svg.style.display = '';
            img.parentNode?.removeChild(img);
        });
    };
};

// =============================================================================
// DATA RESOLVERS
// =============================================================================

const resolveCustomer = (
    customers: ProposalPreviewModalProps['customers'],
    customerId?: string | number
) => customers?.find((c) => c.id.toString() === customerId?.toString());

const resolveItemProductName = (
    item: ProposalItem,
    availableProducts: ProposalPreviewModalProps['availableProducts']
): string => {
    if (item.name) return item.name;
    if (item.product?.name) return item.product.name;
    const found = availableProducts?.find((p) => String(p.id) === String(item.product_id));
    if (found?.name) return found.name;
    return item.product_name || (item.product_id ? `Product #${item.product_id}` : 'Item');
};

const resolveItemDescription = (
    item: ProposalItem,
    availableProducts: ProposalPreviewModalProps['availableProducts']
): string => {
    if (item.description) return item.description;
    if (item.product_description) return item.product_description;
    if (item.product?.description) return item.product.description;
    const found = availableProducts?.find((p) => String(p.id) === String(item.product_id));
    return found?.description || '';
};

const resolveLogo = (proposalSetting?: ProposalPreviewModalProps['proposalSetting']): string =>
    proposalSetting?.logo_image ||
    getCompanySetting('company_logo') ||
    getCompanySetting('company_dark_logo') ||
    getCompanySetting('logo') ||
    FALLBACK_LOGO;

// =============================================================================
// PAGE BUILDER
// =============================================================================

const buildRenderablePages = (
    sections: ProposalPreviewSection[],
    formData: ProposalFormData,
    otherDetails: string | undefined,
    t: (key: string) => string,
    getDesc: (item: ProposalItem) => string
): RenderablePage[] => {
    const pages: RenderablePage[] = [];

    sections.forEach((sec, sIdx) => {
        const isFront =
            sec.page_type === 'front-page' ||
            sec.is_front_page ||
            sec.title?.toLowerCase().includes('front') ||
            sec.title?.toLowerCase().includes('cover');

        if (isFront) {
            pages.push({
                key: `front-${sec.id || sIdx}`,
                type: 'front-page',
                title: sec.title,
                background_image: sec.background_image,
            });
            return;
        }

        if (sec.page_type === 'otc' || sec.page_type === 'mrc') {
            const isOtc = sec.page_type === 'otc';
            const rawItems = formData.items || [];
            const filtered = rawItems.filter((i) => {
                const hasData =
                    Number(i.product_id) > 0 ||
                    Number(i.unit_price) > 0 ||
                    Boolean(i.product_description);
                if (isOtc) {
                    return (i.section === 'otc' || i.section === 'general' || !i.section) && hasData;
                }
                return i.section === 'mrc' && hasData;
            });

            const secSubtotal = filtered.reduce(
                (acc, item) =>
                    acc +
                    (Number(item.total_amount) ||
                        Number(item.quantity || 1) * Number(item.unit_price || 0)),
                0
            );
            const secDiscount = filtered.reduce((acc, item) => acc + (Number(item.discount_amount) || 0), 0);
            const secTax = filtered.reduce((acc, item) => acc + (Number(item.tax_amount) || 0), 0);
            const secTotal = secSubtotal - secDiscount + secTax;

            const title = isOtc ? t('One-Time Charges (OTC)') : t('Monthly Recurring Charges (MRC)');

            if (filtered.length === 0) {
                pages.push({
                    key: `${sec.page_type}-empty-${sec.id || sIdx}`,
                    type: sec.page_type as 'otc' | 'mrc',
                    title,
                    background_image: sec.background_image,
                    chunkItems: [],
                    chunkIndex: 0,
                    totalChunks: 1,
                    startIndex: 0,
                    isLastChunk: true,
                    secSubtotal: 0,
                    secDiscount: 0,
                    secTax: 0,
                    secTotal: 0,
                });
                return;
            }

            const itemChunks = chunkItemsDynamic(filtered, getDesc);
            const totalChunks = itemChunks.length;

            itemChunks.forEach((chk, cIdx) => {
                pages.push({
                    key: `${sec.page_type}-chunk-${cIdx}-${sec.id || sIdx}`,
                    type: sec.page_type as 'otc' | 'mrc',
                    title,
                    background_image: sec.background_image,
                    chunkItems: chk.items,
                    chunkIndex: cIdx,
                    totalChunks,
                    startIndex: chk.startIndex,
                    isLastChunk: cIdx === totalChunks - 1,
                    secSubtotal,
                    secDiscount,
                    secTax,
                    secTotal,
                });
            });
            return;
        }

        if (sec.page_type === 'other-details') {
            pages.push({
                key: `other-details-${sec.id || sIdx}`,
                type: 'other-details',
                title: t('OTHER DETAILS'),
                content: formData.other_details || otherDetails || '',
                background_image: sec.background_image,
            });
            return;
        }

        pages.push({
            key: `content-${sec.id || sIdx}`,
            type: 'content',
            title: sec.title,
            content: sec.content,
            background_image: sec.background_image,
        });
    });

    return pages;
};

// =============================================================================
// HOOKS
// =============================================================================

const usePrintHandler = (previewRef: React.RefObject<HTMLDivElement | null>, t: (key: string) => string) => {
    return useCallback(() => {
        if (!previewRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const stylesHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((node) => node.outerHTML)
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${t('Sales Proposal Preview')}</title>
                    ${stylesHtml}
                    <style>${PRINT_STYLES}</style>
                </head>
                <body>
                    <div class="print-wrapper">${previewRef.current.outerHTML}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }, [previewRef, t]);
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface PageShellProps {
    pageKey: string;
    backgroundImage?: string;
    defaultBg?: string;
    isFrontPage?: boolean;
    templateColor: string;
    children: React.ReactNode;
    className?: string;
}

const PageShell = React.memo<PageShellProps>(
    ({ pageKey, backgroundImage, defaultBg, isFrontPage = false, templateColor, children, className = '' }) => (
        <div
            key={pageKey}
            style={{
                pageBreakAfter: 'always',
                breakAfter: 'page',
                pageBreakInside: 'avoid',
                breakInside: 'avoid-page',
                '--template-color': templateColor,
                ...getPageBgStyle(backgroundImage, defaultBg, isFrontPage),
            } as React.CSSProperties}
            className={`proposal-preview-sheet bg-white text-slate-900 w-[210mm] h-[297mm] max-w-full shadow-2xl rounded-sm text-sm font-sans border border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden relative ${className}`}
        >
            {children}
        </div>
    )
);
PageShell.displayName = 'PageShell';

const PageBody = React.memo<{ children: React.ReactNode }>(({ children }) => (
    <div
        className="quotation-page__body flex flex-col justify-between"
        style={{
            position: 'relative',
            zIndex: 1,
            padding: '32mm 15mm 20mm',
            minHeight: 'calc(297mm - 20mm)',
            boxSizing: 'border-box',
        }}
    >
        {children}
    </div>
));
PageBody.displayName = 'PageBody';

const PageFooter = React.memo<{ pageNum: number; totalPages: number; t: (k: string) => string }>(
    ({ pageNum, totalPages, t }) => (
        <div className="border-t border-slate-200/60 pt-3 text-right text-[11px] text-slate-400">
            <span>
                {t('Page')} {pageNum} {t('of')} {totalPages}
            </span>
        </div>
    )
);
PageFooter.displayName = 'PageFooter';

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------
interface CoverPageProps {
    page: RenderablePage;
    templateColor: string;
    logoImage: string;
    formData: ProposalFormData;
    customer?: NonNullable<ProposalPreviewModalProps['customers']>[number];
    t: (key: string) => string;
}

const CoverPage = React.memo<CoverPageProps>(({ page, templateColor, logoImage, formData, customer, t }) => {
    const hasCustomBg = Boolean(page.background_image);

    return (
        <PageShell
            pageKey={page.key}
            backgroundImage={page.background_image}
            isFrontPage
            templateColor={templateColor}
            className="quotation-cover__sheet"
        >
            {!hasCustomBg && (
                <>
                    <div
                        className="quotation-cover__topbar"
                        style={{ background: `linear-gradient(90deg, ${templateColor}, #fffb00)` }}
                    />
                    <CoverDecoration templateColor={templateColor} />
                </>
            )}

            <div className="quotation-cover__body">
                <div className="text-end logo-container">
                    <img
                        src={getImagePath(logoImage)}
                        alt="Company Logo"
                        className="quotation-cover__logo max-h-16 max-w-[240px] object-contain ml-auto"
                    />
                </div>

                <div className="relative">
                    <div className="quotation-cover__label mb-2" style={{ color: templateColor }}>
                        {t('Financial Proposal')}
                    </div>

                    <h1 className="quotation-cover__title mb-2">{formData.subject || 'Subject'}</h1>

                    <div className="text-lg text-slate-500 font-semibold mb-3">
                        {t('Quotation & Commercial Proposal')}
                    </div>

                    <div className="quotation-cover__line mb-5" style={{ backgroundColor: templateColor }} />

                    <div className="mb-12">
                        <span
                            className="quotation-cover__date rounded-lg"
                            style={{ borderColor: templateColor, color: templateColor }}
                        >
                            {formData.invoice_date ? formatDate(formData.invoice_date) : formatDate(new Date().toISOString())}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="quotation-cover__box quotation-cover__submitted text-center">
                            <div
                                className="uppercase text-slate-500 font-bold text-xs mb-2"
                                style={{ textDecoration: 'underline' }}
                            >
                                {t('Submitted To')}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">
                                {customer?.name || t('Client Name')}
                            </h2>
                            <p className="text-slate-600 text-xs mb-0">
                                {customer?.address || customer?.email || t('Client Address')}
                            </p>
                        </div>
                    </div>

                    <div className="quotation-cover__box quotation-cover__prepared text-center mb-4">
                        <div
                            className="uppercase text-slate-500 font-bold text-xs mb-3"
                            style={{ textDecoration: 'underline' }}
                        >
                            {t('Prepared By')}
                        </div>

                        <div className="text-xl font-bold text-slate-900 mb-1">
                            {getCompanySetting('company_name') || t('Company Name')}
                        </div>

                        <div className="text-xs text-slate-700 space-y-1">
                            <div className="mb-1">
                                <strong>{t('Corporate Office')}:</strong>{' '}
                                {getCompanySetting('company_address') || t('Company Address')}
                            </div>
                            <div className="mb-1 flex flex-wrap justify-center gap-x-4">
                                <span>
                                    <strong>{t('Web')}:</strong>{' '}
                                    {getCompanySetting('company_website') || 'www.example.com'}
                                </span>
                                <span>
                                    <strong>{t('Email')}:</strong>{' '}
                                    {getCompanySetting('company_email') || 'info@example.com'}
                                </span>
                            </div>
                            <div>
                                <strong>{t('Phone')}:</strong>{' '}
                                {getCompanySetting('company_phone') || t('Company Phone')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="quotation-cover__footer flex justify-between items-end gap-3 text-slate-600">
                    <div>
                        <strong className="text-slate-900">{t('Prepared by')}:</strong>{' '}
                        {formData.creator_name || formData.user_name || pageProps?.auth?.user?.name || getCompanySetting('company_name') || t('Creator Name')}
                    </div>
                    <div className="text-right">
                        <strong className="text-slate-900">{t('Subject')}:</strong>{' '}
                        {formData.subject || t('Subject')}
                    </div>
                </div>
            </div>
        </PageShell>
    );
});
CoverPage.displayName = 'CoverPage';

const CoverDecoration = React.memo<{ templateColor: string }>(({ templateColor }) => (
    <>
        <svg
            className="absolute quotation-cover__shape quotation-cover__shape--top pointer-events-none"
            style={{ position: 'absolute', top: '-46px', left: '-46px', width: '240px', zIndex: 1 }}
            viewBox="0 0 300 300"
            fill="none"
        >
            <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28" />
            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14" />
            <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10" />
        </svg>

        <svg
            className="absolute quotation-cover__shape quotation-cover__shape--bottom pointer-events-none"
            style={{
                position: 'absolute',
                right: '-30px',
                bottom: '-30px',
                width: '240px',
                transform: 'rotate(180deg)',
                opacity: 0.5,
                zIndex: 1,
            }}
            viewBox="0 0 300 300"
            fill="none"
        >
            <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28" />
            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14" />
            <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10" />
        </svg>

        <svg
            className="absolute quotation-cover__watermark pointer-events-none"
            style={{
                position: 'absolute',
                right: '22mm',
                top: '76mm',
                width: '150px',
                height: '150px',
                opacity: 0.05,
                zIndex: 1,
                color: templateColor,
            }}
            viewBox="0 0 200 200"
        >
            <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none" />
            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none" />
        </svg>

        <svg
            className="absolute quotation-cover__watermark_bottom pointer-events-none"
            viewBox="0 0 200 200"
            style={{
                position: 'absolute',
                left: '0.5rem',
                bottom: '7.5rem',
                width: '150px',
                height: '150px',
                opacity: 0.08,
                pointerEvents: 'none',
                zIndex: 1,
                color: templateColor,
            }}
        >
            <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none" />
            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none" />
        </svg>
    </>
));
CoverDecoration.displayName = 'CoverDecoration';

// ---------------------------------------------------------------------------
// Charges Page (OTC / MRC)
// ---------------------------------------------------------------------------
interface ChargesPageProps {
    page: RenderablePage;
    templateColor: string;
    defaultBg?: string;
    getItemName: (item: ProposalItem) => string;
    getItemDesc: (item: ProposalItem) => string;
    t: (key: string) => string;
}

const ChargesPage = React.memo<ChargesPageProps>(
    ({ page, templateColor, defaultBg, getItemName, getItemDesc, t }) => {
        const chunkItems = page.chunkItems || [];
        const startIdx = page.startIndex || 0;

        return (
            <PageShell
                pageKey={page.key}
                backgroundImage={page.background_image}
                defaultBg={defaultBg}
                templateColor={templateColor}
            >
                <PageBody>
                    <div>
                        <div className="font-bold mb-2 text-[#293240] text-sm">{page.title}</div>

                        <table
                            className="w-full text-xs mb-3 border-collapse border border-slate-300"
                            style={{ fontSize: '12px', width: '100%', tableLayout: 'fixed' }}
                        >
                            <thead>
                                <tr
                                    className="text-center font-semibold"
                                    style={{ backgroundColor: templateColor, color: '#ffffff' }}
                                >
                                    <th className="py-2 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '5%', whiteSpace: 'nowrap' }}>
                                        {t('S/N')}
                                    </th>
                                    <th className="py-2 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '22%' }}>
                                        {t('Item / Service')}
                                    </th>
                                    <th className="py-2 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '38%' }}>
                                        {t('Description')}
                                    </th>
                                    <th className="py-2 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '7%', whiteSpace: 'nowrap' }}>
                                        {t('Qty.')}
                                    </th>
                                    <th className="py-2 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                        {t('Price (BDT)')}
                                    </th>
                                    <th className="py-2 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                        {t('Total (BDT)')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {chunkItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center text-slate-400 italic border border-slate-200">
                                            {t('No items in this charge section.')}
                                        </td>
                                    </tr>
                                ) : (
                                    chunkItems.map((item, idx) => {
                                        const lineTotal =
                                            Number(item.total_amount) ||
                                            Number(item.quantity || 1) * Number(item.unit_price || 0);
                                        return (
                                            <tr key={idx}>
                                                <td className="py-1.5 px-1 border border-slate-300 text-center align-middle" style={{ whiteSpace: 'nowrap' }}>
                                                    {startIdx + idx + 1}
                                                </td>
                                                <td className="py-1.5 px-2 border border-slate-300 align-middle font-medium text-[#293240]" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                    {getItemName(item)}
                                                </td>
                                                <td className="py-1.5 px-2 border border-slate-300 align-middle text-left text-[#293240]" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                    <div
                                                        className="prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:my-1 [&>ol]:list-decimal [&>ol]:pl-4 [&>p]:my-0.5 text-xs"
                                                        dangerouslySetInnerHTML={{ __html: getItemDesc(item) || '' }}
                                                    />
                                                </td>
                                                <td className="py-1.5 px-1 border border-slate-300 text-center align-middle text-[#293240]" style={{ whiteSpace: 'nowrap' }}>
                                                    {item.quantity || 1}
                                                </td>
                                                <td className="py-1.5 px-2 border border-slate-300 text-right align-middle text-[#293240]" style={{ whiteSpace: 'nowrap' }}>
                                                    {formatAmountOnly(item.unit_price || 0)}
                                                </td>
                                                <td className="py-1.5 px-2 border border-slate-300 text-right font-bold align-middle text-[#293240]" style={{ whiteSpace: 'nowrap' }}>
                                                    {formatAmountOnly(lineTotal)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                {page.isLastChunk && (page.chunkItems?.length || 0) > 0 && (
                                    <>
                                        <SummaryRow
                                            label={`${t('Total (BDT)')}:`}
                                            value={page.secSubtotal || 0}
                                            colSpan={4}
                                        />
                                        {(page.secDiscount || 0) > 0 && (
                                            <SummaryRow
                                                label={`${t('Discount')}:`}
                                                value={-(page.secDiscount || 0)}
                                                colSpan={4}
                                                prefix="-"
                                            />
                                        )}
                                        {(page.secTax || 0) > 0 && (
                                            <SummaryRow
                                                label={`${t('VAT/Tax')}:`}
                                                value={page.secTax || 0}
                                                colSpan={4}
                                                prefix="+"
                                                isSemiBold
                                            />
                                        )}
                                        <SummaryRow
                                            label={`${t('Grand Total')}:`}
                                            value={page.secTotal || 0}
                                            colSpan={4}
                                        />
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </PageBody>
            </PageShell>
        );
    }
);
ChargesPage.displayName = 'ChargesPage';

const SummaryRow = React.memo<{
    label: string;
    value: number;
    colSpan: number;
    prefix?: string;
    isSemiBold?: boolean;
}>(({ label, value, colSpan, prefix = '', isSemiBold }) => (
    <tr>
        <td colSpan={colSpan} className="p-2 border border-slate-300 text-xs text-slate-500 italic align-middle" style={{ fontSize: '11px', whiteSpace: 'normal', wordBreak: 'break-word' }} />
        <td className="p-2 border border-slate-300 font-bold text-right align-middle text-slate-800" style={{ whiteSpace: 'nowrap' }}>
            {label}
        </td>
        <td
            className={`p-2 border border-slate-300 text-right align-middle text-slate-900 ${isSemiBold ? 'font-semibold' : 'font-bold'}`}
            style={{ whiteSpace: 'nowrap' }}
        >
            {prefix}{formatAmountOnly(value)}
        </td>
    </tr>
));
SummaryRow.displayName = 'SummaryRow';

// ---------------------------------------------------------------------------
// Content Page (shared for content & other-details)
// ---------------------------------------------------------------------------
interface ContentPageProps {
    page: RenderablePage;
    templateColor: string;
    defaultBg?: string;
    pageNum: number;
    totalPages: number;
    t: (key: string) => string;
}

const CONTENT_PROSE_CLASSES = `
    text-slate-700 text-sm leading-relaxed prose max-w-none
    [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5
    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2
    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2
    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1
    [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-1
    [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:my-4
    [&_table]:border [&_table]:border-slate-300
    [&_th]:border [&_th]:border-slate-300 [&_th]:py-2 [&_th]:px-3 [&_th]:text-left [&_th]:font-semibold
    [&_th]:bg-[var(--template-color)] [&_th]:text-white
    [&_td]:border [&_td]:border-slate-200 [&_td]:py-2 [&_td]:px-3 [&_td]:text-slate-700 [&_td]:text-xs
    [&_tr:first-child_td]:bg-[var(--template-color)] [&_tr:first-child_td]:text-white [&_tr:first-child_td]:font-semibold
    [&_tr:not(:first-child):hover]:bg-slate-50/50
`;

const ContentPage = React.memo<ContentPageProps>(
    ({ page, templateColor, defaultBg, pageNum, totalPages, t }) => {
        const emptyMessage =
            page.type === 'other-details'
                ? t('Empty Other Details content...')
                : t('Empty section content...');

        return (
            <PageShell
                pageKey={page.key}
                backgroundImage={page.background_image}
                defaultBg={defaultBg}
                templateColor={templateColor}
            >
                <PageBody>
                    <div>
                        {page.content ? (
                            <div
                                className={CONTENT_PROSE_CLASSES}
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        ) : (
                            <p className="text-sm text-slate-400 italic py-8 text-center">{emptyMessage}</p>
                        )}
                    </div>
                </PageBody>
            </PageShell>
        );
    }
);
ContentPage.displayName = 'ContentPage';

// =============================================================================
// MAIN COMPONENT
export default function ProposalPreviewModal({
    isOpen,
    onClose,
    formData,
    sections = [],
    customers = [],
    warehouses = [],
    availableProducts = [],
    proposalSetting,
    other_details,
    totals,
}: ProposalPreviewModalProps) {
    const { t } = useTranslation();
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // -------------------------------------------------------------------------
    // Memoized derived state
    // -------------------------------------------------------------------------
    const templateColor = useMemo(
        () => proposalSetting?.template_color || DEFAULT_TEMPLATE_COLOR,
        [proposalSetting?.template_color]
    );

    const logoImage = useMemo(() => resolveLogo(proposalSetting), [proposalSetting]);
    const defaultBgImage = proposalSetting?.background_image;

    const customer = useMemo(
        () => resolveCustomer(customers, formData.customer_id),
        [customers, formData.customer_id]
    );

    const getItemName = useCallback(
        (item: ProposalItem) => resolveItemProductName(item, availableProducts),
        [availableProducts]
    );

    const getItemDesc = useCallback(
        (item: ProposalItem) => resolveItemDescription(item, availableProducts),
        [availableProducts]
    );

    const renderablePages = useMemo(
        () => buildRenderablePages(sections, formData, other_details, t, getItemDesc),
        [sections, formData, other_details, t, getItemDesc]
    );

    const totalPages = renderablePages.length;

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------
    const handlePrint = usePrintHandler(previewContainerRef, t);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-900/40 backdrop-blur-md border-slate-700">
                {/* Header */}
                <DialogHeader className="p-4 sm:px-6 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-base font-semibold">{t('Proposal Preview')}</DialogTitle>
                    </div>

                    <div className="flex items-center gap-2 pr-6">
                        <Button variant="default" size="sm" onClick={handlePrint} className="gap-2 text-xs h-8">
                            <Printer className="h-3.5 w-3.5" />
                            {t('Print')}
                        </Button>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
                    <div ref={previewContainerRef} className="space-y-8 flex flex-col items-center w-full">
                        {totalPages > 0 ? (
                            renderablePages.map((page, pageIdx) => {
                                const pageNum = pageIdx + 1;

                                if (page.type === 'front-page') {
                                    return (
                                        <CoverPage
                                            key={page.key}
                                            page={page}
                                            templateColor={templateColor}
                                            logoImage={logoImage}
                                            formData={formData}
                                            customer={customer}
                                            t={t}
                                        />
                                    );
                                }

                                if (page.type === 'otc' || page.type === 'mrc') {
                                    return (
                                        <ChargesPage
                                            key={page.key}
                                            page={page}
                                            templateColor={templateColor}
                                            defaultBg={defaultBgImage}
                                            getItemName={getItemName}
                                            getItemDesc={getItemDesc}
                                            t={t}
                                        />
                                    );
                                }

                                return (
                                    <ContentPage
                                        key={page.key}
                                        page={page}
                                        templateColor={templateColor}
                                        defaultBg={defaultBgImage}
                                        pageNum={pageNum}
                                        totalPages={totalPages}
                                        t={t}
                                    />
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                {t('No pages configured in Page Order.')}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}