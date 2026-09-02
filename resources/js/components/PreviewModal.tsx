import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';
import {
    getImagePath,
} from '@/utils/helpers';
import { replaceProposalShortcodes } from '@/pages/SalesProposals/utils/proposalShortcodes';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ProposalPreviewSection {
    id?: string;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
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
    unit?: string;
    unit_name?: string;
    unit_price?: number;
    total_amount?: number;
    discount_amount?: number;
    tax_amount?: number;
    section?: string;
    product?: {
        name?: string;
        description?: string;
        unit?: string;
        unit_name?: string;
        unit_relation?: {
            id?: number;
            unit_name?: string;
        };
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
    items?: ProposalItem[];
    creator_name?: string;
}

export interface ProposalSettingsConfig {
    logo_image?: string;
    company_logo?: string;
    show_logo?: boolean | string | number;
    background_image?: string;
    template_color?: string;
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_telephone?: string;
    company_address?: string;
    company_website?: string;
    [key: string]: any;
}

export interface PreviewModalProps {
    isOpen?: boolean;
    open?: boolean;
    onClose?: () => void;
    onOpenChange?: (open: boolean) => void;

    // Full Proposal Mode Props
    formData?: ProposalFormData;
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
    proposalSetting?: ProposalSettingsConfig | null;
    totals?: ProposalTotals;
    other_details?: string;

    // Single Page / Default Page Mode Props
    title?: string;
    pageTitle?: string;
    content?: string;
    backgroundImage?: string;
    settings?: ProposalSettingsConfig | null;
    isDefaultPageSetup?: boolean;

    // Direct Page / Inline Render Mode (e.g. SalesProposals/Print.tsx)
    inline?: boolean;
    autoPrint?: boolean;
}

export interface RenderablePage {
    key: string;
    type: 'otc' | 'mrc' | 'combined-charges' | 'other-details' | 'content';
    title?: string;
    otcTitle?: string;
    mrcTitle?: string;
    content?: string;
    background_image?: string;
    chunkItems?: ProposalItem[];
    otcItems?: ProposalItem[];
    mrcItems?: ProposalItem[];
    chunkIndex?: number;
    totalChunks?: number;
    startIndex?: number;
    isLastChunk?: boolean;
    secSubtotal?: number;
    secDiscount?: number;
    secTax?: number;
    secTotal?: number;
    otcSubtotal?: number;
    otcDiscount?: number;
    otcTax?: number;
    otcTotal?: number;
    mrcSubtotal?: number;
    mrcDiscount?: number;
    mrcTax?: number;
    mrcTotal?: number;
}

// =============================================================================
// CONSTANTS & STYLES
// =============================================================================

export const DEFAULT_TEMPLATE_COLOR = '#E9591C';
export const FALLBACK_LOGO = 'uploads/logo/logo_dark.png';

export const PROPOSAL_CONTENT_CLASSES = `
    text-slate-800 text-sm leading-normal
    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h1]:text-slate-900
    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-slate-900
    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1 [&_h3]:text-slate-900
    [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-1 [&_h4]:text-slate-900
    [&_p]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0
    [&_p:empty]:min-h-[1.15em] [&_p:empty]:my-0 [&_p:empty]:before:content-['\\00a0']
    [&_p:has(>br:only-child)]:min-h-[1.15em] [&_p:has(>br:only-child)]:my-0
    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
    [&_li]:my-0.5
    [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2
    [&_table:not(.charges-table)]:w-full [&_table:not(.charges-table)]:table-auto [&_table:not(.charges-table)]:border-collapse [&_table:not(.charges-table)]:my-4 [&_table:not(.charges-table)]:border [&_table:not(.charges-table)]:border-slate-300
    [&_thead:not(.charges-thead)]:bg-[var(--template-color,#E9591C)] [&_thead:not(.charges-thead)]:text-white
    [&_thead_tr:not(.charges-thead_tr)]:bg-[var(--template-color,#E9591C)] [&_thead_tr:not(.charges-thead_tr)]:text-white
    [&_table:not(.charges-table)_th]:border [&_table:not(.charges-table)_th]:border-slate-300 [&_table:not(.charges-table)_th]:bg-[var(--template-color,#E9591C)] [&_table:not(.charges-table)_th]:text-white [&_table:not(.charges-table)_th]:font-bold [&_table:not(.charges-table)_th]:p-2.5 [&_table:not(.charges-table)_th]:text-left
    [&_table:not(.charges-table)_td]:border [&_table:not(.charges-table)_td]:border-slate-300 [&_table:not(.charges-table)_td]:p-2.5 [&_table:not(.charges-table)_td]:text-slate-800
    [&_img]:inline-block [&_img]:align-middle [&_[style*="text-align:_center"]_img]:mx-auto [&_[style*="text-align:center"]_img]:mx-auto [&_.text-center_img]:mx-auto
    [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
`;

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
        .proposal-cover__sheet {
            width: 210mm !important; height: 297mm !important;
            min-height: 297mm !important; max-height: 297mm !important;
            padding: 0 !important; margin: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important; break-after: page !important;
            page-break-inside: avoid !important; break-inside: avoid-page !important;
            overflow: hidden !important;
        }
        .proposal-page__body {
            position: relative !important; z-index: 1 !important;
            padding: 32mm 15mm 20mm !important;
            min-height: calc(297mm - 20mm) !important;
            box-sizing: border-box !important;
            display: flex !important; flex-direction: column !important;
            justify-content: space-between !important;
        }
        .proposal-preview-sheet:last-child,
        .proposal-cover__sheet:last-child {
            page-break-after: auto !important; break-after: auto !important;
        }
    }
`;

// =============================================================================
// DOM PAGINATOR UTILITY
// =============================================================================

export function paginateDomContainer(container: HTMLElement, maxPageHeight: number = 880): string[] {
    const hasExplicitBreak = container.querySelector('.page-break, [style*="page-break"], [style*="break-after"], [style*="break-before"]');

    // Extract any <style> tags so they apply across pages
    const styleTags = Array.from(container.querySelectorAll('style')).map(s => s.outerHTML).join('\n');

    // If single page content and fits in 1 page, return intact
    if (!hasExplicitBreak && container.scrollHeight <= maxPageHeight) {
        return [container.innerHTML];
    }

    const pages: string[] = [];
    let currentPageHtml: string[] = [];
    let currentPageAccumulatedHeight = 0;

    const startNewPage = () => {
        if (currentPageHtml.length > 0) {
            pages.push((styleTags ? styleTags + '\n' : '') + currentPageHtml.join(''));
            currentPageHtml = [];
            currentPageAccumulatedHeight = 0;
        }
    };

    const processElement = (el: HTMLElement) => {
        if (el.tagName.toLowerCase() === 'style' || el.tagName.toLowerCase() === 'script') {
            return;
        }

        if (
            el.classList?.contains('page-break') ||
            el.style?.pageBreakAfter === 'always' ||
            el.style?.pageBreakBefore === 'always' ||
            el.style?.breakAfter === 'page' ||
            el.style?.breakBefore === 'page'
        ) {
            startNewPage();
            return;
        }

        const tag = el.tagName.toLowerCase();
        const elHeight = el.offsetHeight || 25;
        const computedStyle = window.getComputedStyle(el);
        const margin = (parseFloat(computedStyle.marginTop) || 0) + (parseFloat(computedStyle.marginBottom) || 0);
        const totalElHeight = elHeight + margin;

        // Check if element is a Table or a Block containing a Table
        const tableInside = tag === 'table' ? el : el.querySelector('table');
        if (tableInside) {
            const tableEl = tableInside as HTMLElement;
            const thead = tableEl.querySelector('thead');
            const theadHtml = thead ? thead.outerHTML : '';
            const theadHeight = thead ? ((thead as HTMLElement).offsetHeight || 32) : 0;

            const tfoot = tableEl.querySelector('tfoot');
            const tfootHtml = tfoot ? tfoot.outerHTML : '';
            const tfootHeight = tfoot ? ((tfoot as HTMLElement).offsetHeight || 80) : 0;

            const bodyRows = Array.from(tableEl.querySelectorAll('tbody > tr'));
            const tableClasses = tableEl.getAttribute('class') || '';
            const tableStyle = tableEl.getAttribute('style') || '';

            // If whole element (section block with title + table + tfoot) fits on current page
            if (currentPageAccumulatedHeight + totalElHeight <= maxPageHeight) {
                currentPageHtml.push(el.outerHTML);
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }

            // If whole element doesn't fit on current page BUT fits on a fresh new page -> SHIFT TO NEW PAGE!
            if (totalElHeight <= maxPageHeight && currentPageHtml.length > 0) {
                startNewPage();
                currentPageHtml.push(el.outerHTML);
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }

            // Otherwise, table is too large for a single page and MUST be split row-by-row
            const titleEl = tag !== 'table' ? el.querySelector('.font-bold, h1, h2, h3, h4, h5, h6') : null;
            const titleHtml = titleEl ? titleEl.outerHTML : '';

            if (bodyRows.length > 0) {
                let currentTableRows: string[] = [];
                let currentTableChunkHeight = theadHeight;
                let isFirstTableChunk = true;

                for (let rIdx = 0; rIdx < bodyRows.length; rIdx++) {
                    const row = bodyRows[rIdx] as HTMLElement;
                    const rowHeight = row.offsetHeight || 30;
                    const isLastRow = (rIdx === bodyRows.length - 1);
                    const neededRowHeight = rowHeight + (isLastRow ? tfootHeight : 0);

                    if (currentPageAccumulatedHeight + currentTableChunkHeight + neededRowHeight > maxPageHeight && currentTableRows.length > 0) {
                        const tableHtml = `<table class="${tableClasses}" style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody></table>`;
                        if (isFirstTableChunk && titleHtml) {
                            currentPageHtml.push(titleHtml);
                        }
                        currentPageHtml.push(tableHtml);
                        startNewPage();
                        isFirstTableChunk = false;
                        currentTableRows = [row.outerHTML];
                        currentTableChunkHeight = theadHeight + rowHeight;
                    } else {
                        currentTableRows.push(row.outerHTML);
                        currentTableChunkHeight += rowHeight;
                    }
                }

                if (currentTableRows.length > 0) {
                    const tableHtml = `<table class="${tableClasses}" style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody>${tfootHtml}</table>`;
                    if (isFirstTableChunk && titleHtml) {
                        currentPageHtml.push(titleHtml);
                    }
                    currentPageHtml.push(tableHtml);
                    currentPageAccumulatedHeight += currentTableChunkHeight + tfootHeight;
                }
                return;
            }
        }

        if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main') && el.children.length > 0) {
            if (currentPageAccumulatedHeight + totalElHeight <= maxPageHeight) {
                currentPageHtml.push(el.outerHTML);
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }
            if (totalElHeight <= maxPageHeight && currentPageHtml.length > 0) {
                startNewPage();
                currentPageHtml.push(el.outerHTML);
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }
            Array.from(el.children).forEach((child) => processElement(child as HTMLElement));
            return;
        }

        if (currentPageAccumulatedHeight + totalElHeight > maxPageHeight && currentPageHtml.length > 0) {
            startNewPage();
        }

        currentPageHtml.push(el.outerHTML);
        currentPageAccumulatedHeight += totalElHeight;
    };

    Array.from(container.children).forEach((child) => processElement(child as HTMLElement));

    if (currentPageHtml.length > 0) {
        pages.push((styleTags ? styleTags + '\n' : '') + currentPageHtml.join(''));
    }

    return pages.length > 0 ? pages : [container.innerHTML];
}

// =============================================================================
// PURE UTILITIES
// =============================================================================

const formatAmountOnly = (val: number | string): string => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getPageBgStyle = (
    customBg?: string,
    defaultBg?: string
): React.CSSProperties => {
    const bg = (customBg && String(customBg).trim() !== '') ? customBg : defaultBg;
    if (!bg || typeof bg !== 'string' || bg.trim() === '') return {};
    const imgUrl = getImagePath(bg);
    if (!imgUrl) return {};
    return {
        backgroundImage: `url("${imgUrl}")`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };
};

const estimateItemWeight = (item: ProposalItem, getDesc: (i: ProposalItem) => string): number => {
    const desc = getDesc(item) || '';
    const plainText = desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const blockTags = (desc.match(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/gi) || []).length;
    const textLines = Math.ceil(plainText.length / 48);
    const descLines = Math.max(textLines, blockTags, desc ? 1 : 0);

    const pName = (item as any)?.product?.name || (item as any)?.name || (item as any)?.product_name || '';
    const nameLines = Math.max(1, Math.ceil(pName.length / 28));
    const effectiveLines = Math.max(descLines, nameLines);

    return 1 + (effectiveLines - 1) * 0.7;
};

const chunkItemsByWeight = (
    items: ProposalItem[],
    getDesc: (i: ProposalItem) => string,
    maxWeight = 30
): Array<{ items: ProposalItem[]; startIndex: number }> => {
    const chunks: Array<{ items: ProposalItem[]; startIndex: number }> = [];
    let currentChunk: ProposalItem[] = [];
    let currentWeight = 0;
    let chunkStartIndex = 0;

    items.forEach((item, index) => {
        const itemWeight = estimateItemWeight(item, getDesc);
        if (currentChunk.length > 0 && currentWeight + itemWeight > maxWeight) {
            chunks.push({ items: currentChunk, startIndex: chunkStartIndex });
            currentChunk = [item];
            currentWeight = itemWeight;
            chunkStartIndex = index;
        } else {
            currentChunk.push(item);
            currentWeight += itemWeight;
        }
    });

    if (currentChunk.length > 0) {
        chunks.push({ items: currentChunk, startIndex: chunkStartIndex });
    }

    return chunks;
};

// =============================================================================
// REUSABLE PAGE COMPONENTS
// =============================================================================

export interface ProposalPreviewSheetProps {
    children?: React.ReactNode;
    content?: string;
    backgroundImage?: string;
    defaultBg?: string;
    templateColor?: string;
    headerLogo?: string;
    headerLogoAlign?: 'left' | 'center' | 'right' | string;
    pageKey?: string;
    className?: string;
}

export const ProposalPreviewSheet = React.memo<ProposalPreviewSheetProps>(({
    children,
    content,
    backgroundImage,
    defaultBg,
    templateColor = DEFAULT_TEMPLATE_COLOR,
    headerLogo,
    headerLogoAlign = 'right',
    pageKey,
    className = '',
}) => {
    const rawBg = (backgroundImage && String(backgroundImage).trim() !== '') ? backgroundImage : defaultBg;
    const bgUrl = rawBg ? getImagePath(rawBg) : '';
    const logoUrl = headerLogo ? getImagePath(headerLogo) : '';

    const getLogoContainerStyle = (): React.CSSProperties => {
        const align = headerLogoAlign || 'right';
        if (align === 'left') {
            return { top: '8mm', left: '15mm', right: 'auto', justifyContent: 'flex-start', maxHeight: '20mm', maxWidth: '60mm' };
        }
        if (align === 'center' || align === 'middle') {
            return { top: '8mm', left: '50%', right: 'auto', transform: 'translateX(-50%)', justifyContent: 'center', maxHeight: '20mm', maxWidth: '60mm' };
        }
        return { top: '8mm', right: '15mm', left: 'auto', justifyContent: 'flex-end', maxHeight: '20mm', maxWidth: '60mm' };
    };

    return (
        <div
            key={pageKey}
            style={{
                width: '210mm',
                height: '297mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                boxSizing: 'border-box',
                pageBreakAfter: 'always',
                breakAfter: 'page',
                pageBreakInside: 'avoid',
                breakInside: 'avoid-page',
                fontFamily: '"Open Sans", sans-serif',
                '--template-color': templateColor,
            } as React.CSSProperties}
            className={cn(
                "proposal-preview-sheet proposal-cover__sheet bg-white text-slate-900 w-[210mm] h-[297mm] max-w-full shadow-2xl rounded-sm text-sm border border-slate-300 dark:border-slate-800 shrink-0 overflow-hidden relative",
                className
            )}
        >
            {/* Background Image Layer */}
            {bgUrl && (
                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                    <img
                        src={bgUrl}
                        alt="Page Background"
                        className="w-full h-full object-fill block"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (rawBg && !target.src.includes('/storage/media/')) {
                                target.src = `/storage/media/${rawBg.split('/').pop()}`;
                            }
                        }}
                    />
                </div>
            )}

            {/* Top Header Logo */}
            {logoUrl && (
                <div
                    className="absolute z-20 pointer-events-none flex items-center"
                    style={getLogoContainerStyle()}
                >
                    <img
                        src={logoUrl}
                        alt="Header Logo"
                        className="max-h-[16mm] max-w-[55mm] object-contain"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (headerLogo && !target.src.includes('/storage/media/')) {
                                target.src = `/storage/media/${headerLogo.split('/').pop()}`;
                            }
                        }}
                    />
                </div>
            )}

            {/* Page Body strictly adhering to standard 32mm 15mm 20mm padding */}
            <div
                className="proposal-page__body"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32mm 15mm 20mm',
                    height: '297mm',
                    maxHeight: '297mm',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {children ? (
                    children
                ) : content ? (
                    <div
                        className={cn("html-preview-container", PROPOSAL_CONTENT_CLASSES)}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : null}
            </div>
        </div>
    );
});
ProposalPreviewSheet.displayName = 'ProposalPreviewSheet';

// ---------------------------------------------------------------------------
// Charges Page Component (OTC / MRC)
// ---------------------------------------------------------------------------
interface ChargesPageProps {
    page: RenderablePage;
    templateColor: string;
    defaultBg?: string;
    headerLogo?: string;
    headerLogoAlign?: string;
    getItemName: (item: ProposalItem) => string;
    getItemDesc: (item: ProposalItem) => string;
    getItemUnit: (item: ProposalItem) => string;
    t: (key: string) => string;
}

const ChargesPage = React.memo<ChargesPageProps>(
    ({ page, templateColor, defaultBg, headerLogo, headerLogoAlign, getItemName, getItemDesc, getItemUnit, t }) => {
        const chunkItems = page.chunkItems || [];
        const startIdx = page.startIndex || 0;

        return (
            <ProposalPreviewSheet
                pageKey={page.key}
                backgroundImage={page.background_image}
                defaultBg={defaultBg}
                templateColor={templateColor}
                headerLogo={headerLogo}
                headerLogoAlign={headerLogoAlign}
            >
                <div style={{ marginTop: '2rem' }}>
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
                                <th className="py-2 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '36%' }}>
                                    {t('Description')}
                                </th>
                                <th className="py-2 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '9%', whiteSpace: 'nowrap' }}>
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
                            {chunkItems.map((item, idx) => {
                                const qty = Number(item.quantity) || 1;
                                const unit = getItemUnit(item);
                                const price = Number(item.unit_price) || 0;
                                const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                                const desc = getItemDesc(item);

                                return (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                                        <td className="py-2 px-1 text-center font-medium border border-slate-200" style={{ fontSize: '10px' }}>
                                            {startIdx + idx + 1}
                                        </td>
                                        <td className="py-2 px-2 font-semibold text-slate-900 border border-slate-200 align-top" style={{ fontSize: '11px' }}>
                                            {getItemName(item)}
                                        </td>
                                        <td className="py-2 px-2 text-slate-600 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            <div
                                                className="leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                                                dangerouslySetInnerHTML={{ __html: desc || '-' }}
                                            />
                                        </td>
                                        <td className="py-2 px-1 text-center border border-slate-200 align-top whitespace-nowrap" style={{ fontSize: '10px' }}>
                                            {qty}{unit ? ` ${unit}` : ''}
                                        </td>
                                        <td className="py-2 px-2 text-right border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(price)}
                                        </td>
                                        <td className="py-2 px-2 text-right font-medium text-slate-900 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(lineTotal)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Totals Box on Last Chunk */}
                    {page.isLastChunk && (
                        <div className="flex justify-end mt-2">
                            <table className="w-64 text-xs border border-slate-300 border-collapse">
                                <tbody>
                                    <tr className="border-b border-slate-200">
                                        <td className="py-1 px-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">{t('Subtotal')}:</td>
                                        <td className="py-1 px-2 text-right text-slate-900 font-semibold">{formatAmountOnly(page.secSubtotal || 0)}</td>
                                    </tr>
                                    {(page.secDiscount || 0) > 0 && (
                                        <tr className="border-b border-slate-200">
                                            <td className="py-1 px-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">{t('Discount')}:</td>
                                            <td className="py-1 px-2 text-right text-rose-600 font-semibold">-{formatAmountOnly(page.secDiscount || 0)}</td>
                                        </tr>
                                    )}
                                    {(page.secTax || 0) > 0 && (
                                        <tr className="border-b border-slate-200">
                                            <td className="py-1 px-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200">{t('Tax / VAT')}:</td>
                                            <td className="py-1 px-2 text-right text-slate-900 font-semibold">+{formatAmountOnly(page.secTax || 0)}</td>
                                        </tr>
                                    )}
                                    <tr style={{ backgroundColor: templateColor, color: '#ffffff' }}>
                                        <td className="py-1.5 px-2 font-bold text-white border-r border-white/20">{t('Total')}:</td>
                                        <td className="py-1.5 px-2 text-right font-bold text-white">{formatAmountOnly(page.secTotal || 0)} BDT</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </ProposalPreviewSheet >
        );
    }
);
ChargesPage.displayName = 'ChargesPage';

// ---------------------------------------------------------------------------
// Combined Charges Page Component (OTC + MRC on Same Page)
// ---------------------------------------------------------------------------
interface CombinedChargesPageProps {
    page: RenderablePage;
    templateColor: string;
    defaultBg?: string;
    headerLogo?: string;
    headerLogoAlign?: string;
    getItemName: (item: ProposalItem) => string;
    getItemDesc: (item: ProposalItem) => string;
    getItemUnit: (item: ProposalItem) => string;
    t: (key: string) => string;
}

const CombinedChargesPage = React.memo<CombinedChargesPageProps>(
    ({ page, templateColor, defaultBg, headerLogo, headerLogoAlign, getItemName, getItemDesc, getItemUnit, t }) => {
        const otcItems = page.otcItems || [];
        const mrcItems = page.mrcItems || [];

        return (
            <ProposalPreviewSheet
                pageKey={page.key}
                backgroundImage={page.background_image}
                defaultBg={defaultBg}
                templateColor={templateColor}
                headerLogo={headerLogo}
                headerLogoAlign={headerLogoAlign}
            >
                <div style={{ marginTop: '1.5rem' }}>
                    {/* OTC Table */}
                    <div className="font-bold mb-1.5 text-[#293240] text-xs">{page.otcTitle || t('ONE-TIME CHARGES (OTC)')}</div>
                    <table
                        className="w-full text-xs mb-2 border-collapse border border-slate-300"
                        style={{ fontSize: '11px', width: '100%', tableLayout: 'fixed' }}
                    >
                        <thead>
                            <tr
                                className="text-center font-semibold"
                                style={{ backgroundColor: templateColor, color: '#ffffff' }}
                            >
                                <th className="py-1.5 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '5%', whiteSpace: 'nowrap' }}>
                                    {t('S/N')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '22%' }}>
                                    {t('Item / Service')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '38%' }}>
                                    {t('Description')}
                                </th>
                                <th className="py-1.5 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '7%', whiteSpace: 'nowrap' }}>
                                    {t('Qty.')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                    {t('Price (BDT)')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                    {t('Total (BDT)')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {otcItems.map((item, idx) => {
                                const qty = Number(item.quantity) || 1;
                                const unit = getItemUnit(item);
                                const price = Number(item.unit_price) || 0;
                                const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                                const desc = getItemDesc(item);

                                return (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                                        <td className="py-1 px-1 text-center font-medium border border-slate-200" style={{ fontSize: '10px' }}>
                                            {idx + 1}
                                        </td>
                                        <td className="py-1 px-2 font-semibold text-slate-900 border border-slate-200 align-top" style={{ fontSize: '11px' }}>
                                            {getItemName(item)}
                                        </td>
                                        <td className="py-1 px-2 text-slate-600 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            <div
                                                className="leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                                                dangerouslySetInnerHTML={{ __html: desc || '-' }}
                                            />
                                        </td>
                                        <td className="py-1 px-1 text-center border border-slate-200 align-top whitespace-nowrap" style={{ fontSize: '10px' }}>
                                            {qty}{unit ? ` ${unit}` : ''}
                                        </td>
                                        <td className="py-1 px-2 text-right border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(price)}
                                        </td>
                                        <td className="py-1 px-2 text-right font-medium text-slate-900 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(lineTotal)}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-slate-50/60 font-semibold">
                                <td colSpan={4} className="border border-slate-200"></td>
                                <td className="py-1 px-2 text-right border border-slate-200 text-slate-800" style={{ fontSize: '10px' }}>
                                    {t('Total')}:
                                </td>
                                <td className="py-1 px-2 text-right font-bold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                    {formatAmountOnly(page.otcSubtotal || 0)}
                                </td>
                            </tr>
                            {(page.otcDiscount || 0) > 0 && (
                                <tr className="bg-slate-50/40">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 font-semibold text-slate-800" style={{ fontSize: '10px' }}>
                                        {t('Discount')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-semibold border border-slate-200 text-rose-600" style={{ fontSize: '10px' }}>
                                        -{formatAmountOnly(page.otcDiscount || 0)}
                                    </td>
                                </tr>
                            )}
                            {(page.otcTax || 0) > 0 && (
                                <tr className="bg-slate-50/40">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 font-semibold text-slate-800" style={{ fontSize: '10px' }}>
                                        {t('VAT/Tax')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-semibold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        +{formatAmountOnly(page.otcTax || 0)}
                                    </td>
                                </tr>
                            )}
                            {((page.otcDiscount || 0) > 0 || (page.otcTax || 0) > 0) && (
                                <tr className="bg-slate-100 font-bold">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        {t('Grand Total')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-bold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        {formatAmountOnly(page.otcTotal || 0)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* MRC Table */}
                    <div className="font-bold mt-7 mb-2 text-[#293240] text-xs">{page.mrcTitle || t('MONTHLY RECURRING CHARGES (MRC)')}</div>
                    <table
                        className="w-full text-xs border-collapse border border-slate-300"
                        style={{ fontSize: '11px', width: '100%', tableLayout: 'fixed' }}
                    >
                        <thead>
                            <tr
                                className="text-center font-semibold"
                                style={{ backgroundColor: templateColor, color: '#ffffff' }}
                            >
                                <th className="py-1.5 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '5%', whiteSpace: 'nowrap' }}>
                                    {t('S/N')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '22%' }}>
                                    {t('Item / Service')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-left" style={{ fontSize: '10px', width: '38%' }}>
                                    {t('Description')}
                                </th>
                                <th className="py-1.5 px-1 border border-slate-300 text-white text-center" style={{ fontSize: '10px', width: '7%', whiteSpace: 'nowrap' }}>
                                    {t('Qty.')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                    {t('Price (BDT)')}
                                </th>
                                <th className="py-1.5 px-2 border border-slate-300 text-white text-right" style={{ fontSize: '10px', width: '14%', whiteSpace: 'nowrap' }}>
                                    {t('Total (BDT)')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mrcItems.map((item, idx) => {
                                const qty = Number(item.quantity) || 1;
                                const unit = getItemUnit(item);
                                const price = Number(item.unit_price) || 0;
                                const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                                const desc = getItemDesc(item);

                                return (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                                        <td className="py-1 px-1 text-center font-medium border border-slate-200" style={{ fontSize: '10px' }}>
                                            {idx + 1}
                                        </td>
                                        <td className="py-1 px-2 font-semibold text-slate-900 border border-slate-200 align-top" style={{ fontSize: '11px' }}>
                                            {getItemName(item)}
                                        </td>
                                        <td className="py-1 px-2 text-slate-600 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            <div
                                                className="leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                                                dangerouslySetInnerHTML={{ __html: desc || '-' }}
                                            />
                                        </td>
                                        <td className="py-1 px-1 text-center border border-slate-200 align-top whitespace-nowrap" style={{ fontSize: '10px' }}>
                                            {qty}{unit ? ` ${unit}` : ''}
                                        </td>
                                        <td className="py-1 px-2 text-right border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(price)}
                                        </td>
                                        <td className="py-1 px-2 text-right font-medium text-slate-900 border border-slate-200 align-top" style={{ fontSize: '10px' }}>
                                            {formatAmountOnly(lineTotal)}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-slate-50/60 font-semibold">
                                <td colSpan={4} className="border border-slate-200"></td>
                                <td className="py-1 px-2 text-right border border-slate-200 text-slate-800" style={{ fontSize: '10px' }}>
                                    {t('Total')}:
                                </td>
                                <td className="py-1 px-2 text-right font-bold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                    {formatAmountOnly(page.mrcSubtotal || 0)}
                                </td>
                            </tr>
                            {(page.mrcDiscount || 0) > 0 && (
                                <tr className="bg-slate-50/40">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 font-semibold text-slate-800" style={{ fontSize: '10px' }}>
                                        {t('Discount')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-semibold border border-slate-200 text-rose-600" style={{ fontSize: '10px' }}>
                                        -{formatAmountOnly(page.mrcDiscount || 0)}
                                    </td>
                                </tr>
                            )}
                            {(page.mrcTax || 0) > 0 && (
                                <tr className="bg-slate-50/40">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 font-semibold text-slate-800" style={{ fontSize: '10px' }}>
                                        {t('VAT/Tax')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-semibold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        +{formatAmountOnly(page.mrcTax || 0)}
                                    </td>
                                </tr>
                            )}
                            {((page.mrcDiscount || 0) > 0 || (page.mrcTax || 0) > 0) && (
                                <tr className="bg-slate-100 font-bold">
                                    <td colSpan={4} className="border border-slate-200"></td>
                                    <td className="py-1 px-2 text-right border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        {t('Grand Total')}:
                                    </td>
                                    <td className="py-1 px-2 text-right font-bold border border-slate-200 text-slate-900" style={{ fontSize: '10px' }}>
                                        {formatAmountOnly(page.mrcTotal || 0)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ProposalPreviewSheet>
        );
    }
);
CombinedChargesPage.displayName = 'CombinedChargesPage';

// ---------------------------------------------------------------------------
// Content Page Component
// ---------------------------------------------------------------------------
interface ContentPageProps {
    page: RenderablePage;
    templateColor: string;
    defaultBg?: string;
    headerLogo?: string;
    headerLogoAlign?: string;
    formData?: ProposalFormData;
    customer?: any;
    totals?: ProposalTotals;
    proposalSetting?: any;
    isDefaultPageSetup?: boolean;
    t: (key: string) => string;
}

const ContentPage = React.memo<ContentPageProps>(
    ({ page, templateColor, defaultBg, headerLogo, headerLogoAlign, formData, customer, totals, proposalSetting, isDefaultPageSetup, t }) => {
        const emptyMessage =
            page.type === 'other-details'
                ? t('Empty Other Details content...')
                : t('Empty section content...');

        const processedContent = replaceProposalShortcodes(page.content, {
            formData,
            customer,
            totals,
            proposalSetting,
            isDefaultPageSetup,
        });

        return (
            <ProposalPreviewSheet
                pageKey={page.key}
                backgroundImage={page.background_image}
                defaultBg={defaultBg}
                templateColor={templateColor}
                headerLogo={headerLogo}
                headerLogoAlign={headerLogoAlign}
                content={processedContent || undefined}
            >
                {!processedContent && (
                    <p className="text-sm text-slate-400 italic py-8 text-center">{emptyMessage}</p>
                )}
            </ProposalPreviewSheet>
        );
    }
);
ContentPage.displayName = 'ContentPage';

// =============================================================================
// MAIN UNIFIED PREVIEW MODAL COMPONENT
// =============================================================================

export default function PreviewModal({
    isOpen,
    open,
    onClose,
    onOpenChange,
    // Full Proposal Props
    formData,
    sections = [],
    customers = [],
    warehouses = [],
    availableProducts = [],
    proposalSetting,
    totals,
    other_details,
    // Single Page / Default Page Props
    title,
    pageTitle,
    content,
    backgroundImage,
    settings,
    isDefaultPageSetup,
    // Direct Page / Inline Render Mode
    inline = false,
    autoPrint = false,
}: PreviewModalProps) {
    const { t } = useTranslation();
    const isModalOpen = Boolean(isOpen ?? open);

    useEffect(() => {
        if (inline && autoPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [inline, autoPrint]);

    const handleClose = useCallback(() => {
        if (onClose) onClose();
        if (onOpenChange) onOpenChange(false);
    }, [onClose, onOpenChange]);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const measureContainerRef = useRef<HTMLDivElement>(null);

    // Merge settings
    const activeSettings = proposalSetting || settings || null;
    const templateColor = activeSettings?.template_color || DEFAULT_TEMPLATE_COLOR;
    const isLogoEnabled = activeSettings?.show_logo !== undefined
        ? (activeSettings.show_logo === '1' || activeSettings.show_logo === true || activeSettings.show_logo === 1 || activeSettings.show_logo === 'true')
        : true;
    const rawLogo = activeSettings?.logo_image || activeSettings?.company_logo || '';
    const headerLogo = (isLogoEnabled && rawLogo) ? rawLogo : '';
    const headerLogoAlign = activeSettings?.header_logo_align || 'right';
    const defaultBgImage = activeSettings?.background_image || '';

    // Check if Single Page Mode (e.g. from Default Pages Setup Preview)
    const isSinglePageMode = Boolean(!formData && (content !== undefined || title !== undefined || pageTitle !== undefined));

    // Single page processed content & pagination
    const singleProcessedContent = useMemo(() => {
        if (!isSinglePageMode || !content) return '';
        return replaceProposalShortcodes(content, {
            settings: activeSettings,
            isDefaultPageSetup: isDefaultPageSetup ?? true,
        });
    }, [isSinglePageMode, content, activeSettings, isDefaultPageSetup]);

    const [paginatedSinglePages, setPaginatedSinglePages] = useState<string[]>([]);

    useEffect(() => {
        if (!isSinglePageMode) return;
        if (!singleProcessedContent) {
            setPaginatedSinglePages([]);
            return;
        }

        const runPagination = () => {
            // Check for explicit page break in the content
            const hasExplicitBreak = /class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(singleProcessedContent);

            if (measureContainerRef.current) {
                // A4 page body is 297mm - 52mm (top/bottom padding) = 245mm (~925px to 960px).
                // If there is no explicit page-break and the content easily fits in one standard A4, keep as single page.
                const scrollH = measureContainerRef.current.scrollHeight;
                if (!hasExplicitBreak && scrollH <= 980) {
                    setPaginatedSinglePages([singleProcessedContent]);
                } else {
                    const chunks = paginateDomContainer(measureContainerRef.current, 980);
                    setPaginatedSinglePages(chunks);
                }
            } else {
                setPaginatedSinglePages([singleProcessedContent]);
            }
        };

        const timer = setTimeout(runPagination, 60);
        return () => clearTimeout(timer);
    }, [isSinglePageMode, singleProcessedContent]);

    // Full proposal items helpers
    const getItemName = useCallback(
        (item: ProposalItem): string => {
            if (item.product_name) return item.product_name;
            if (item.name) return item.name;
            if (item.product?.name) return item.product.name;
            if (item.product_id && availableProducts.length > 0) {
                const found = availableProducts.find((p) => String(p.id) === String(item.product_id));
                if (found?.name) return found.name;
            }
            return item.product_description || item.description || t('Item / Service');
        },
        [availableProducts, t]
    );

    const getItemDesc = useCallback(
        (item: ProposalItem): string => {
            if (item.product_description) return item.product_description;
            if (item.description) return item.description;
            if (item.product?.description) return item.product.description;
            if (item.product_id && availableProducts.length > 0) {
                const found = availableProducts.find((p) => String(p.id) === String(item.product_id));
                if (found?.description) return found.description;
            }
            return '';
        },
        [availableProducts]
    );

    const getItemUnit = useCallback(
        (item: ProposalItem): string => {
            if (item.unit_name) return item.unit_name;
            if (item.unit && isNaN(Number(item.unit))) return item.unit;
            if (item.product?.unit_relation?.unit_name) return item.product.unit_relation.unit_name;
            if (item.product?.unit_name) return item.product.unit_name;
            if (item.product?.unit && isNaN(Number(item.product.unit))) return item.product.unit;
            if (item.product_id && availableProducts.length > 0) {
                const found: any = availableProducts.find((p) => String(p.id) === String(item.product_id));
                if (found?.unit_name) return found.unit_name;
                if (found?.unit && isNaN(Number(found.unit))) return found.unit;
            }
            return '';
        },
        [availableProducts]
    );

    const customer = useMemo(() => {
        if ((formData as any)?.customer_mode === 'new') {
            return {
                id: 0,
                name: (formData as any)?.customer_name || '',
                email: (formData as any)?.customer_email || '',
                mobile_no: (formData as any)?.customer_phone || '',
                phone: (formData as any)?.customer_phone || '',
                address: (formData as any)?.customer_address || '',
                type: (formData as any)?.customer_type || 'Individual',
            };
        }
        return customers.find((c) => String(c.id) === String(formData?.customer_id));
    }, [
        customers,
        formData?.customer_id,
        (formData as any)?.customer_mode,
        (formData as any)?.customer_name,
        (formData as any)?.customer_email,
        (formData as any)?.customer_phone,
        (formData as any)?.customer_address,
    ]);

    const [paginatedFullProposalPages, setPaginatedFullProposalPages] = useState<string[]>([]);

    // Assemble unified HTML for continuous flowing proposal
    const fullProposalHtml = useMemo(() => {
        if (isSinglePageMode || !formData) return '';

        const items = formData.items || [];
        const otcItems = items.filter(
            (i) => (i.section === 'otc' || i.section === 'general' || !i.section) &&
                (Number(i.product_id) > 0 || Number(i.unit_price) > 0 || Boolean(i.product_description))
        );
        const mrcItems = items.filter(
            (i) => i.section === 'mrc' &&
                (Number(i.product_id) > 0 || Number(i.unit_price) > 0 || Boolean(i.product_description))
        );

        const secSubtotalOtc = otcItems.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unit_price || 0)), 0);
        let secDiscountOtc = otcItems.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);
        if (secDiscountOtc === 0 && (formData as any).otc_discount_value > 0) {
            const discVal = Number((formData as any).otc_discount_value) || 0;
            if ((formData as any).otc_discount_type === 'percentage') {
                secDiscountOtc = (secSubtotalOtc * Math.min(Math.max(discVal, 0), 100)) / 100;
            } else {
                secDiscountOtc = Math.min(Math.max(discVal, 0), secSubtotalOtc);
            }
        }
        const secTaxOtc = otcItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
        const secTotalOtc = Math.max(0, secSubtotalOtc - secDiscountOtc + secTaxOtc);

        const secSubtotalMrc = mrcItems.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unit_price || 0)), 0);
        let secDiscountMrc = mrcItems.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);
        if (secDiscountMrc === 0 && (formData as any).mrc_discount_value > 0) {
            const discVal = Number((formData as any).mrc_discount_value) || 0;
            if ((formData as any).mrc_discount_type === 'percentage') {
                secDiscountMrc = (secSubtotalMrc * Math.min(Math.max(discVal, 0), 100)) / 100;
            } else {
                secDiscountMrc = Math.min(Math.max(discVal, 0), secSubtotalMrc);
            }
        }
        const secTaxMrc = mrcItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
        const secTotalMrc = Math.max(0, secSubtotalMrc - secDiscountMrc + secTaxMrc);

        const htmlParts: string[] = [];

        sections.forEach((sec) => {
            const rawContent = (sec.content || '').trim();
            const pageType = (sec.page_type || '').toLowerCase();
            const isOtc = pageType === 'otc' || rawContent === '[OTC_CHARGES_TABLE]' || (sec.title && sec.title.toLowerCase().includes('one-time charges'));
            const isMrc = pageType === 'mrc' || rawContent === '[MRC_CHARGES_TABLE]' || (sec.title && sec.title.toLowerCase().includes('monthly recurring charges'));
            const isOther = pageType === 'other-details' || rawContent === '[OTHER_DETAILS_CONTENT]' || (sec.title && sec.title.toLowerCase().includes('other details'));

            if (isOtc) {
                if (otcItems.length === 0) return;
                const title = sec.title || t('ONE-TIME CHARGES (OTC)');
                let rowsHtml = '';
                otcItems.forEach((item, idx) => {
                    const qty = Number(item.quantity) || 1;
                    const unit = getItemUnit(item);
                    const price = Number(item.unit_price) || 0;
                    const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                    const desc = getItemDesc(item);

                    rowsHtml += `
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${idx + 1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${getItemName(item)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${desc || '-'}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${qty}${unit ? ` ${unit}` : ''}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(price)}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(lineTotal)}</td>
                        </tr>
                    `;
                });

                htmlParts.push(`
                    <div class="proposal-section-block otc-charges-block" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${title}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${templateColor}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${t('S/N')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 22%; padding: 7.5px 8px !important;">${t('Item / Service')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 36%; padding: 7.5px 8px !important;">${t('Description')}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 9%; white-space: nowrap; padding: 7.5px 4px !important;">${t('Qty.')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Price (BDT)')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Total (BDT)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Subtotal')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${formatAmountOnly(secSubtotalOtc)}</td>
                                </tr>
                                ${(secDiscountOtc > 0) ? `
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Discount')}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${formatAmountOnly(secDiscountOtc)}</td>
                                </tr>` : ''}
                                ${(secTaxOtc > 0) ? `
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Tax / VAT')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${formatAmountOnly(secTaxOtc)}</td>
                                </tr>` : ''}
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${t('Total')}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${formatAmountOnly(secTotalOtc)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);
                return;
            }

            if (isMrc) {
                if (mrcItems.length === 0) return;
                const title = sec.title || t('MONTHLY RECURRING CHARGES (MRC)');
                let rowsHtml = '';
                mrcItems.forEach((item, idx) => {
                    const qty = Number(item.quantity) || 1;
                    const unit = getItemUnit(item);
                    const price = Number(item.unit_price) || 0;
                    const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                    const desc = getItemDesc(item);

                    rowsHtml += `
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${idx + 1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${getItemName(item)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${desc || '-'}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${qty}${unit ? ` ${unit}` : ''}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(price)}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(lineTotal)}</td>
                        </tr>
                    `;
                });

                htmlParts.push(`
                    <div class="proposal-section-block mrc-charges-block" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${title}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${templateColor}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${t('S/N')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 22%; padding: 7.5px 8px !important;">${t('Item / Service')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 36%; padding: 7.5px 8px !important;">${t('Description')}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 9%; white-space: nowrap; padding: 7.5px 4px !important;">${t('Qty.')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Price (BDT)')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Total (BDT)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Subtotal')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${formatAmountOnly(secSubtotalMrc)}</td>
                                </tr>
                                ${(secDiscountMrc > 0) ? `
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Discount')}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${formatAmountOnly(secDiscountMrc)}</td>
                                </tr>` : ''}
                                ${(secTaxMrc > 0) ? `
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Tax / VAT')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${formatAmountOnly(secTaxMrc)}</td>
                                </tr>` : ''}
                                <tr>
                                    <td colspan="4" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${t('Total')}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${formatAmountOnly(secTotalMrc)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);
                return;
            }

            if (isOther) {
                const otherVal = formData.other_details || other_details;
                if (!otherVal || otherVal.trim() === '' || otherVal === '<p></p>') return;
                const processed = replaceProposalShortcodes(otherVal, {
                    formData,
                    customer,
                    totals,
                    proposalSetting: activeSettings,
                    isDefaultPageSetup,
                });
                htmlParts.push(`
                    <div class="proposal-section-block other-details-block mb-6">
                        ${sec.title ? `<div class="font-bold mb-2 text-[#293240] text-sm">${sec.title}</div>` : ''}
                        <div>${processed}</div>
                    </div>
                `);
                return;
            }

            if (sec.content && sec.content.trim() !== '') {
                const processed = replaceProposalShortcodes(sec.content, {
                    formData,
                    customer,
                    totals,
                    proposalSetting: activeSettings,
                    isDefaultPageSetup,
                });
                htmlParts.push(`
                    <div class="proposal-section-block content-block mb-6">
                        ${processed}
                    </div>
                `);
            }
        });

        return htmlParts.join('\n');
    }, [isSinglePageMode, formData, sections, other_details, activeSettings, isDefaultPageSetup, customer, totals, templateColor, getItemDesc, getItemName, getItemUnit, t]);

    // Paginate Full Proposal HTML continuously
    useEffect(() => {
        if (isSinglePageMode) return;
        if (!fullProposalHtml) {
            setPaginatedFullProposalPages([]);
            return;
        }

        const runPagination = () => {
            if (measureContainerRef.current) {
                const scrollH = measureContainerRef.current.scrollHeight;
                if (scrollH <= 880) {
                    setPaginatedFullProposalPages([fullProposalHtml]);
                } else {
                    const chunks = paginateDomContainer(measureContainerRef.current, 880);
                    setPaginatedFullProposalPages(chunks);
                }
            } else {
                setPaginatedFullProposalPages([fullProposalHtml]);
            }
        };

        const timer = setTimeout(runPagination, 80);
        return () => clearTimeout(timer);
    }, [isSinglePageMode, fullProposalHtml]);

    // Print Action
    const handlePrint = useCallback(() => {
        if (!previewContainerRef.current) return;
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
                    <div class="print-wrapper">${previewContainerRef.current.outerHTML}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }, [t]);

    const modalTitleText = isSinglePageMode
        ? (title || pageTitle || t('Page Preview'))
        : t('Proposal Preview');

    const renderSheetsContent = () => (
        <div
            ref={previewContainerRef}
            className="space-y-8 flex flex-col items-center w-full print:space-y-0 print:gap-0"
            style={{ '--template-color': templateColor } as React.CSSProperties}
        >
            {/* Mode A: Single Page / Default Page Mode */}
            {isSinglePageMode ? (
                paginatedSinglePages.length > 0 ? (
                    paginatedSinglePages.map((pageHtml, pIdx) => (
                        <ProposalPreviewSheet
                            key={`single-page-${pIdx}`}
                            pageKey={`single-page-${pIdx}`}
                            backgroundImage={backgroundImage}
                            defaultBg={defaultBgImage}
                            templateColor={templateColor}
                            headerLogo={headerLogo}
                            headerLogoAlign={headerLogoAlign}
                            content={pageHtml}
                        />
                    ))
                ) : (
                    <ProposalPreviewSheet
                        key="single-page-0"
                        pageKey="single-page-0"
                        backgroundImage={backgroundImage}
                        defaultBg={defaultBgImage}
                        templateColor={templateColor}
                        headerLogo={headerLogo}
                        headerLogoAlign={headerLogoAlign}
                        content={singleProcessedContent}
                    />
                )
            ) : (
                /* Mode B: Full Continuous Flow Proposal Mode */
                paginatedFullProposalPages.length > 0 ? (
                    paginatedFullProposalPages.map((pageHtml, pIdx) => (
                        <ProposalPreviewSheet
                            key={`proposal-page-${pIdx}`}
                            pageKey={`proposal-page-${pIdx}`}
                            backgroundImage={sections[pIdx]?.background_image || defaultBgImage}
                            defaultBg={defaultBgImage}
                            templateColor={templateColor}
                            headerLogo={headerLogo}
                            headerLogoAlign={headerLogoAlign}
                            content={pageHtml}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        {t('No pages configured in Page Order.')}
                    </div>
                )
            )}
        </div>
    );

    return (
        <>
            {/* Hidden Offscreen Container for Accurate HTML Height Pagination Measurement */}
            <div
                ref={measureContainerRef}
                className={cn("html-preview-container", PROPOSAL_CONTENT_CLASSES)}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    width: '180mm',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
                dangerouslySetInnerHTML={{ __html: isSinglePageMode ? singleProcessedContent : fullProposalHtml }}
            />

            {inline ? (
                <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 print:p-0 print:bg-white flex flex-col items-center">
                    {/* Print Action Bar (Hidden when printed) */}
                    <div className="w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                                    {formData?.proposal_number || modalTitleText}
                                </h1>
                                {formData?.subject && (
                                    <p className="text-xs text-slate-500">{formData.subject}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="default" size="sm" onClick={() => window.print()} className="gap-2">
                                <Printer className="h-4 w-4" />
                                {t('Print / Save PDF')}
                            </Button>
                        </div>
                    </div>

                    {/* Printable Canvas */}
                    <div className="w-full flex justify-center">
                        {renderSheetsContent()}
                    </div>
                </div>
            ) : (
                <Dialog open={isModalOpen} onOpenChange={(openVal) => !openVal && handleClose()}>
                    <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-900/40 backdrop-blur-md border-slate-700">
                        {/* Modal Header */}
                        <DialogHeader className="p-4 sm:px-6 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-base font-semibold">{modalTitleText}</DialogTitle>
                            </div>

                            <div className="flex items-center gap-2 pr-6">
                                <Button variant="default" size="sm" onClick={handlePrint} className="gap-2 text-xs h-8">
                                    <Printer className="h-3.5 w-3.5" />
                                    {t('Print')}
                                </Button>
                            </div>
                        </DialogHeader>

                        {/* Modal Body / Scrollable Canvas */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
                            {renderSheetsContent()}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

// Re-export as ProposalPreviewModal for backwards compatibility
export { PreviewModal as ProposalPreviewModal };
