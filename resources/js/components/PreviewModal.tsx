import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Eye } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';
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
    showPrintButton?: boolean;

    // Direct Page / Inline Render Mode
    inline?: boolean;
    autoPrint?: boolean;
    hideHeaderBar?: boolean;
}

// =============================================================================
// CONSTANTS & STYLES
// =============================================================================

export const DEFAULT_TEMPLATE_COLOR = '#E9591C';
export const FALLBACK_LOGO = 'uploads/logo/logo_dark.png';
export const PROPOSAL_CONTENT_CLASSES = 'html-preview-container';

export const PRINT_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }

    .proposal-cover__sheet, .proposal-preview-sheet {
        width: 210mm; min-height: 297mm; height: 297mm; max-height: 297mm; margin: 0 auto; background: #fff; position: relative !important; overflow: hidden !important; box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.08); page-break-after: always; font-family: "Open Sans", sans-serif !important;
    }
    .proposal-page__body {
        position: relative !important; z-index: 1; padding: 32mm 15mm 20mm; height: calc(297mm - 52mm); min-height: calc(297mm - 52mm); max-height: calc(297mm - 52mm); box-sizing: border-box; display: flex !important; flex-direction: column !important;
    }

    /* Table Styles */
    .proposal-preview-sheet table, .proposal-page__body table, .html-preview-container table, .prose table {
        width: 100% !important; border-collapse: collapse !important; border: 1px solid #cbd5e1 !important; font-size: 10px !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; margin: 8px 0 !important; color: #293240 !important;
    }
    .proposal-preview-sheet table th, .proposal-page__body table th, .html-preview-container table th, .prose table th {
        padding: 7.5px 8px !important; font-size: 10px !important; font-weight: 600 !important; border: 1px solid #cbd5e1 !important; vertical-align: middle !important; background-color: var(--template-color, #E9591C) !important; color: #ffffff !important; line-height: 1.2 !important;
    }
    .proposal-preview-sheet table th *, .proposal-page__body table th *, .html-preview-container table th *, .prose table th * {
        color: #ffffff !important; font-size: 10px !important; font-weight: 600 !important; margin: 0 !important; padding: 0 !important; line-height: 1.2 !important;
    }
    .proposal-preview-sheet table td, .proposal-page__body table td, .html-preview-container table td, .prose table td {
        padding: 6.5px 8px !important; font-size: 10px !important; border: 1px solid #cbd5e1 !important; vertical-align: middle !important; color: #293240 !important; word-break: break-word !important; line-height: 1.35 !important; background-color: transparent;
    }
    .proposal-preview-sheet table td > p, .proposal-page__body table td > p, .html-preview-container table td > p, .prose table td > p {
        margin: 0 !important; padding: 0 !important; line-height: 1.35 !important; font-size: 10px !important;
    }
    .proposal-preview-sheet table td p + p, .proposal-page__body table td p + p, .html-preview-container table td p + p, .prose table td p + p { margin-top: 3px !important; }

    /* Content Typography */
    .html-preview-container { font-size: 14px; line-height: 1.5; color: #1e293b; width: 100%; font-family: "Open Sans", sans-serif; display: flex !important; flex-direction: column !important; flex: 1 !important; height: 100% !important; }
    .html-preview-container h1 { font-size: 24px; font-weight: 700; margin: 8px 0; color: #0f172a; }
    .html-preview-container h2 { font-size: 20px; font-weight: 700; margin: 8px 0; color: #0f172a; }
    .html-preview-container h3 { font-size: 18px; font-weight: 600; margin: 6px 0; color: #0f172a; }
    .html-preview-container h4 { font-size: 16px; font-weight: 600; margin: 4px 0; color: #0f172a; }
    .html-preview-container p { margin: 4px 0; }
    .html-preview-container p:empty::before { content: "\\00a0"; }
    .html-preview-container ul, .proposal-page__body ul, .prose ul { list-style-type: disc !important; list-style-position: outside !important; padding-left: 20px !important; margin: 6px 0 !important; }
    .html-preview-container ol, .proposal-page__body ol, .prose ol { list-style-type: decimal !important; list-style-position: outside !important; padding-left: 20px !important; margin: 6px 0 !important; }
    .html-preview-container li, .proposal-page__body li, .prose li { display: list-item !important; margin: 3px 0 !important; line-height: 1.45 !important; }
    .html-preview-container li p, .proposal-page__body li p, .prose li p { display: inline !important; margin: 0 !important; }

    /* Tables Inner Lists Formatting */
    table td ul, .html-preview-container table td ul { list-style-type: disc !important; list-style-position: outside !important; padding-left: 14px !important; margin: 3px 0 3px 2px !important; }
    table td ol, .html-preview-container table td ol { list-style-type: decimal !important; list-style-position: outside !important; padding-left: 14px !important; margin: 3px 0 3px 2px !important; }
    table td li, .html-preview-container table td li { display: list-item !important; margin: 2px 0 !important; font-size: 10px !important; line-height: 1.35 !important; color: #293240 !important; }
    table td li p, .html-preview-container table td li p { display: inline !important; margin: 0 !important; }
    .html-preview-container blockquote { border-left: 4px solid #cbd5e1; padding-left: 16px; font-style: italic; margin: 8px 0; }
    .html-preview-container img, .proposal-page__body img, .prose img, img.proposal-logo { display: inline-block !important; vertical-align: middle; }
    .html-preview-container a { color: #2563eb; text-decoration: underline; }

    @media print {
        @page { size: 210mm 297mm; margin: 0; }
        html, body { width: 210mm !important; margin: 0 !important; padding: 0 !important; background: white !important; font-family: "Open Sans", sans-serif !important; }
        .print-wrapper { width: 210mm !important; margin: 0 !important; padding: 0 !important; }
        .proposal-preview-sheet, .proposal-cover__sheet { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important; page-break-after: always !important; break-after: page !important; page-break-inside: avoid !important; break-inside: avoid-page !important; overflow: hidden !important; }
        .proposal-page__body { position: relative !important; z-index: 1 !important; padding: 32mm 15mm 20mm !important; height: calc(297mm - 52mm) !important; min-height: calc(297mm - 52mm) !important; max-height: calc(297mm - 52mm) !important; box-sizing: border-box !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; }
        .proposal-preview-sheet:last-child, .proposal-cover__sheet:last-child { page-break-after: auto !important; break-after: auto !important; }
    }
`;

// =============================================================================
// DOM PAGINATOR UTILITY
// =============================================================================

const DEFAULT_A4_CONTENT_HEIGHT_PX = 850;

function getA4ContentHeightPx(): number {
    if (typeof document === 'undefined') return DEFAULT_A4_CONTENT_HEIGHT_PX;

    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:245mm;width:1px;';
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();

    return height || DEFAULT_A4_CONTENT_HEIGHT_PX;
}

export function paginateDomContainer(container: HTMLElement, maxPageHeight: number = DEFAULT_A4_CONTENT_HEIGHT_PX): string[] {
    const effectiveMaxHeight = maxPageHeight - 20;
    const styleTags = Array.from(container.querySelectorAll('style')).map(s => s.outerHTML).join('\n');

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

    const processElement = (el: HTMLElement, inheritedSectionIndex?: string) => {
        const sectionIndex = el.getAttribute('data-proposal-section-index') || inheritedSectionIndex;
        const addSectionMarker = (html: string): string => {
            if (sectionIndex === undefined || /data-proposal-section-index=/.test(html)) return html;
            return html.replace(/^<(\w+)(\s|>)/, `<$1 data-proposal-section-index=\"${sectionIndex}\"$2`);
        };
        if (el.tagName.toLowerCase() === 'style' || el.tagName.toLowerCase() === 'script') return;

        if (
            el.classList?.contains('page-break') ||
            el.style?.pageBreakAfter === 'always' ||
            el.style?.pageBreakBefore === 'always' ||
            el.style?.breakAfter === 'page' ||
            el.style?.breakBefore === 'page'
        ) {
            startNewPage();
            currentPageHtml.push(addSectionMarker(el.outerHTML));
            currentPageAccumulatedHeight = el.offsetHeight || 25;
            startNewPage();
            return;
        }

        const tag = el.tagName.toLowerCase();

        // Unwrap block container divs or lists (ul/ol) if they contain multiple children so individual elements fill page 1 first
        if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main' || tag === 'ul' || tag === 'ol') && el.children.length > 0 && !el.classList.contains('page-break')) {
            const elHeight = el.offsetHeight || 25;
            const computedStyle = window.getComputedStyle(el);
            const margin = (parseFloat(computedStyle.marginTop) || 0) + (parseFloat(computedStyle.marginBottom) || 0);
            const totalElHeight = elHeight + margin;

            // If the list/div fits entirely on current page, keep it as a single block
            if (currentPageAccumulatedHeight + totalElHeight <= effectiveMaxHeight) {
                currentPageHtml.push(addSectionMarker(el.outerHTML));
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }

            // Otherwise, unwrap its children (items or elements) item by item
            if (tag === 'ul' || tag === 'ol') {
                const listClasses = el.getAttribute('class') || '';
                const listStyle = el.getAttribute('style') || '';
                const items = Array.from(el.children);
                let currentListItems: string[] = [];

                for (let i = 0; i < items.length; i++) {
                    const itemEl = items[i] as HTMLElement;
                    const itemHeight = itemEl.offsetHeight || 25;
                    if (currentPageAccumulatedHeight + itemHeight > effectiveMaxHeight && currentListItems.length > 0) {
                        currentPageHtml.push(addSectionMarker(`<${tag} class="${listClasses}" style="${listStyle}">${currentListItems.join('')}</${tag}>`));
                        startNewPage();
                        currentListItems = [addSectionMarker(itemEl.outerHTML)];
                        currentPageAccumulatedHeight = itemHeight;
                    } else {
                        currentListItems.push(addSectionMarker(itemEl.outerHTML));
                        currentPageAccumulatedHeight += itemHeight;
                    }
                }
                if (currentListItems.length > 0) {
                    currentPageHtml.push(addSectionMarker(`<${tag} class="${listClasses}" style="${listStyle}">${currentListItems.join('')}</${tag}>`));
                }
                return;
            }

            const children = Array.from(el.children);
            for (let i = 0; i < children.length; i++) {
                processElement(children[i] as HTMLElement, sectionIndex);
            }
            return;
        }

        const elHeight = el.offsetHeight || 25;
        const computedStyle = window.getComputedStyle(el);
        const margin = (parseFloat(computedStyle.marginTop) || 0) + (parseFloat(computedStyle.marginBottom) || 0);
        const totalElHeight = elHeight + margin;

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
            const tableSectionMarker = sectionIndex !== undefined ? ` data-proposal-section-index=\"${sectionIndex}\"` : '';

            if (currentPageAccumulatedHeight + totalElHeight <= effectiveMaxHeight) {
                currentPageHtml.push(addSectionMarker(el.outerHTML));
                currentPageAccumulatedHeight += totalElHeight;
                return;
            }

            if (bodyRows.length > 0) {
                let currentTableRows: string[] = [];
                let currentTableChunkHeight = theadHeight;
                let isFirstTableChunk = true;

                for (let rIdx = 0; rIdx < bodyRows.length; rIdx++) {
                    const row = bodyRows[rIdx] as HTMLElement;
                    const rowHeight = row.offsetHeight || 30;
                    const isLastRow = (rIdx === bodyRows.length - 1);
                    const neededRowHeight = rowHeight + (isLastRow ? tfootHeight : 0);

                    if (currentPageAccumulatedHeight + currentTableChunkHeight + neededRowHeight > effectiveMaxHeight && currentTableRows.length > 0) {
                        const tableHtml = `<table class="${tableClasses}"${tableSectionMarker} style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody></table>`;
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
                    const tableHtml = `<table class="${tableClasses}"${tableSectionMarker} style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody>${tfootHtml}</table>`;
                    currentPageHtml.push(tableHtml);
                    currentPageAccumulatedHeight += currentTableChunkHeight + tfootHeight;
                }
                return;
            }
        }

        if (currentPageAccumulatedHeight + totalElHeight > effectiveMaxHeight && currentPageHtml.length > 0) {
            startNewPage();
        }

        currentPageHtml.push(addSectionMarker(el.outerHTML));
        currentPageAccumulatedHeight += totalElHeight;
    };

    Array.from(container.children).forEach((child) => processElement(child as HTMLElement));

    if (currentPageHtml.length > 0) {
        pages.push((styleTags ? styleTags + '\n' : '') + currentPageHtml.join(''));
    }

    return pages.length > 0 ? pages : [container.innerHTML];
}

const formatAmountOnly = (val: number | string): string => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            {bgUrl && (
                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                    <img src={bgUrl} alt="Page Background" className="w-full h-full object-fill block" />
                </div>
            )}

            {logoUrl && (
                <div className="absolute z-20 pointer-events-none flex items-center" style={getLogoContainerStyle()}>
                    <img src={logoUrl} alt="Header Logo" className="max-h-[16mm] max-w-[55mm] object-contain" />
                </div>
            )}

            <div
                className="proposal-page__body"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '32mm 15mm 20mm',
                    height: 'calc(297mm - 52mm)',
                    minHeight: 'calc(297mm - 52mm)',
                    maxHeight: 'calc(297mm - 52mm)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                }}
            >
                {children ? (
                    children
                ) : content ? (
                    <div
                        className={cn("html-preview-container flex-1 flex flex-col", PROPOSAL_CONTENT_CLASSES)}
                        style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : null}
            </div>
        </div>
    );
});
ProposalPreviewSheet.displayName = 'ProposalPreviewSheet';

// =============================================================================
// MAIN UNIFIED PREVIEW MODAL COMPONENT
// =============================================================================

export default function PreviewModal({
    isOpen,
    open,
    onClose,
    onOpenChange,
    formData,
    sections = [],
    customers = [],
    availableProducts = [],
    proposalSetting,
    totals,
    other_details,
    title,
    pageTitle,
    content,
    backgroundImage,
    settings,
    isDefaultPageSetup,
    showPrintButton = true,
    inline = false,
    autoPrint = false,
    hideHeaderBar = false,
}: PreviewModalProps) {
    const { t } = useTranslation();
    const isModalOpen = Boolean(isOpen ?? open);

    useEffect(() => {
        if (inline && autoPrint) {
            const timer = setTimeout(() => window.print(), 600);
            return () => clearTimeout(timer);
        }
    }, [inline, autoPrint]);

    const handleClose = useCallback(() => {
        if (onClose) onClose();
        if (onOpenChange) onOpenChange(false);
    }, [onClose, onOpenChange]);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const measureContainerRef = useRef<HTMLDivElement>(null);

    const activeSettings = proposalSetting || settings || null;
    const templateColor = activeSettings?.template_color || DEFAULT_TEMPLATE_COLOR;
    const isLogoEnabled = activeSettings?.show_logo !== undefined
        ? (activeSettings.show_logo === '1' || activeSettings.show_logo === true || activeSettings.show_logo === 1 || activeSettings.show_logo === 'true')
        : true;
    const rawLogo = activeSettings?.logo_image || activeSettings?.company_logo || '';
    const headerLogo = (isLogoEnabled && rawLogo) ? rawLogo : '';
    const headerLogoAlign = activeSettings?.header_logo_align || 'right';
    const defaultBgImage = activeSettings?.background_image || '';

    const isSinglePageMode = Boolean(!formData && (content !== undefined || title !== undefined || pageTitle !== undefined));

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
            if (measureContainerRef.current) {
                const chunks = paginateDomContainer(measureContainerRef.current, getA4ContentHeightPx());
                setPaginatedSinglePages(chunks);
            } else {
                setPaginatedSinglePages([singleProcessedContent]);
            }
        };

        let cancelled = false;

        const start = async () => {
            if (document.fonts?.ready) await document.fonts.ready;
            if (!cancelled) runPagination();
        };

        start();
        return () => { cancelled = true; };
    }, [isSinglePageMode, singleProcessedContent, isModalOpen, inline]);

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
    }, [customers, formData?.customer_id, (formData as any)?.customer_mode, (formData as any)?.customer_name, (formData as any)?.customer_email, (formData as any)?.customer_phone, (formData as any)?.customer_address]);

    const [paginatedFullProposalPages, setPaginatedFullProposalPages] = useState<string[]>([]);
    const [paginatedFullProposalBackgrounds, setPaginatedFullProposalBackgrounds] = useState<string[]>([]);

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

        const secSubtotalOtc = otcItems.reduce((sum, item) => sum + (Number(item.quantity ?? 1) * Number(item.unit_price || 0)), 0);
        let secDiscountOtc = 0;
        if ((formData as any).otc_discount_value > 0) {
            const discVal = Number((formData as any).otc_discount_value) || 0;
            if ((formData as any).otc_discount_type === 'percentage') {
                secDiscountOtc = (secSubtotalOtc * Math.min(Math.max(discVal, 0), 100)) / 100;
            } else {
                secDiscountOtc = Math.min(Math.max(discVal, 0), secSubtotalOtc);
            }
        }
        const secTaxOtc = otcItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
        const secTotalOtc = Math.max(0, secSubtotalOtc - secDiscountOtc + secTaxOtc);

        const secSubtotalMrc = mrcItems.reduce((sum, item) => sum + (Number(item.quantity ?? 1) * Number(item.unit_price || 0)), 0);
        let secDiscountMrc = 0;
        if ((formData as any).mrc_discount_value > 0) {
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

        sections.forEach((sec, sectionIndex) => {
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
                    const qty = Number(item.quantity ?? 1);
                    const unit = getItemUnit(item);
                    const price = Number(item.unit_price) || 0;
                    const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                    const desc = getItemDesc(item);
                    const taxAmt = Number(item.tax_amount) || 0;

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
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${taxAmt > 0 ? formatAmountOnly(taxAmt) : '-'}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(lineTotal)}</td>
                        </tr>
                    `;
                });

                htmlParts.push(`
                    <div class="proposal-section-block otc-charges-block" data-proposal-section-index="${sectionIndex}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${title}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${templateColor}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${t('S/N')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${t('Item / Service')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${t('Description')}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${t('Qty.')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Price (BDT)')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Tax / VAT')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Total (BDT)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Subtotal')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${formatAmountOnly(secSubtotalOtc)}</td>
                                </tr>
                                ${(secDiscountOtc > 0) ? `
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Discount')}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${formatAmountOnly(secDiscountOtc)}</td>
                                </tr>` : ''}
                                ${(secTaxOtc > 0) ? `
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Tax / VAT')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${formatAmountOnly(secTaxOtc)}</td>
                                </tr>` : ''}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
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
                    const qty = Number(item.quantity ?? 1);
                    const unit = getItemUnit(item);
                    const price = Number(item.unit_price) || 0;
                    const lineTotal = item.total_amount !== undefined ? Number(item.total_amount) : qty * price;
                    const desc = getItemDesc(item);
                    const taxAmt = Number(item.tax_amount) || 0;

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
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${taxAmt > 0 ? formatAmountOnly(taxAmt) : '-'}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${formatAmountOnly(lineTotal)}</td>
                        </tr>
                    `;
                });

                htmlParts.push(`
                    <div class="proposal-section-block mrc-charges-block" data-proposal-section-index="${sectionIndex}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${title}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${templateColor}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${t('S/N')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${t('Item / Service')}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${t('Description')}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${t('Qty.')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Price (BDT)')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Tax / VAT')}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${t('Total (BDT)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Subtotal')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${formatAmountOnly(secSubtotalMrc)}</td>
                                </tr>
                                ${(secDiscountMrc > 0) ? `
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Discount')}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${formatAmountOnly(secDiscountMrc)}</td>
                                </tr>` : ''}
                                ${(secTaxMrc > 0) ? `
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${t('Tax / VAT')}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${formatAmountOnly(secTaxMrc)}</td>
                                </tr>` : ''}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
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
                    <div class="proposal-section-block other-details-block mb-6" data-proposal-section-index="${sectionIndex}">
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
                    <div class="proposal-section-block content-block mb-6 page-break" data-proposal-section-index="${sectionIndex}">
                        ${processed}
                    </div>
                `);
            }
        });

        return htmlParts.join('\n');
    }, [isSinglePageMode, formData, sections, other_details, activeSettings, isDefaultPageSetup, customer, totals, templateColor, getItemDesc, getItemName, getItemUnit, t]);

    useEffect(() => {
        if (isSinglePageMode) return;
        if (!fullProposalHtml) {
            setPaginatedFullProposalPages([]);
            setPaginatedFullProposalBackgrounds([]);
            return;
        }

        const runPagination = () => {
            if (measureContainerRef.current) {
                const chunks = paginateDomContainer(measureContainerRef.current, getA4ContentHeightPx());
                const backgrounds = chunks.map((pageHtml) => {
                    const match = pageHtml.match(/data-proposal-section-index=\"(\d+)\"/);
                    const sectionIndex = match ? Number(match[1]) : -1;
                    const specificBg = sectionIndex >= 0 ? sections[sectionIndex]?.background_image : '';
                    return specificBg && String(specificBg).trim() !== '' ? String(specificBg) : defaultBgImage;
                });
                setPaginatedFullProposalPages(chunks);
                setPaginatedFullProposalBackgrounds(backgrounds);
            } else {
                setPaginatedFullProposalPages([fullProposalHtml]);
                const firstSectionBg = sections[0]?.background_image;
                setPaginatedFullProposalBackgrounds([firstSectionBg && String(firstSectionBg).trim() !== '' ? String(firstSectionBg) : defaultBgImage]);
            }
        };

        let cancelled = false;

        const start = async () => {
            if (document.fonts?.ready) await document.fonts.ready;
            if (!cancelled) runPagination();
        };

        start();
        return () => { cancelled = true; };
    }, [isSinglePageMode, fullProposalHtml, isModalOpen, inline]);

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

        const printWhenReady = async () => {
            try {
                await printWindow.document.fonts?.ready;

                const images = Array.from(printWindow.document.images);
                await Promise.all(
                    images.map((img) => {
                        if (img.complete) return Promise.resolve();
                        return new Promise<void>((resolve) => {
                            img.onload = () => resolve();
                            img.onerror = () => resolve();
                        });
                    })
                );
            } catch {
                // Continue printing even if some external assets fail to load.
            }

            printWindow.focus();
            printWindow.onafterprint = () => printWindow.close();
            printWindow.print();
        };

        printWhenReady();
    }, [t]);

    const modalTitleText = title || pageTitle || (formData?.subject ? `${t('Proposal Preview')}: ${formData.subject}` : t('Proposal Preview'));

    const renderSheetsContent = () => (
        <div ref={previewContainerRef} className="flex flex-col gap-6 items-center w-full print:gap-0 print:block">
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
                paginatedFullProposalPages.length > 0 ? (
                    paginatedFullProposalPages.map((pageHtml, pIdx) => (
                        <ProposalPreviewSheet
                            key={`proposal-page-${pIdx}`}
                            pageKey={`proposal-page-${pIdx}`}
                            backgroundImage={paginatedFullProposalBackgrounds[pIdx] || defaultBgImage}
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
                <div className={cn("min-h-screen bg-slate-100 dark:bg-slate-950 px-4 print:p-0 print:bg-white flex flex-col items-center", hideHeaderBar ? "py-0" : "py-8")}>
                    {!hideHeaderBar && (
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
                    )}

                    <div className="w-full flex justify-center">
                        <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
                        {renderSheetsContent()}
                    </div>
                </div>
            ) : (
                <Dialog open={isModalOpen} onOpenChange={(openVal) => !openVal && handleClose()}>
                    <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-xl !rounded-md [&>div]:p-0 [&>div]:max-h-[92vh] [&>div]:flex [&>div]:flex-col [&>button]:top-2.5 [&>button]:right-3">
                        <DialogHeader className="!py-3 !px-5 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                            <div className="flex items-center gap-2.5 pr-8">
                                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                    <Eye className="h-4 w-4" />
                                </div>
                                <DialogTitle className="text-sm font-semibold">{modalTitleText}</DialogTitle>
                            </div>

                            {showPrintButton && (
                                <div className="flex items-center gap-2 pr-6">
                                    <Button variant="default" size="sm" onClick={handlePrint} className="gap-2 text-xs h-8">
                                        <Printer className="h-3.5 w-3.5" />
                                        {t('Print')}
                                    </Button>
                                </div>
                            )}
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-900 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
                            {renderSheetsContent()}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
