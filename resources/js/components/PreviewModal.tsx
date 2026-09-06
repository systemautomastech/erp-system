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
    showPrintButton?: boolean;

    // Direct Page / Inline Render Mode (e.g. SalesProposals/Print.tsx)
    inline?: boolean;
    autoPrint?: boolean;
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

    .proposal-cover {
        margin: 0 auto; width: 210mm; min-height: 297mm; position: relative; font-family: "Open Sans", sans-serif !important;
    }
    .proposal-cover__sheet, .proposal-preview-sheet {
        width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; position: relative !important; overflow: hidden !important; box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.08); page-break-after: always; font-family: "Open Sans", sans-serif !important;
    }
    .proposal-cover__topbar {
        position: absolute !important; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, #E9591C, #fffb00); z-index: 1;
    }
    .proposal-cover__body {
        padding: 10mm 20mm; position: relative !important; z-index: 2; min-height: calc(297mm - 10px); display: flex; flex-direction: column;
    }
    .proposal-page__body {
        position: relative !important; z-index: 1; padding: 32mm 15mm 20mm; min-height: calc(297mm - 20mm); box-sizing: border-box;
    }
    .logo-container { margin-bottom: 20mm; text-align: right; }
    .proposal-cover__logo { max-height: 70px; object-fit: contain; }
    .proposal-cover__label { letter-spacing: .18em; font-size: .8rem; color: #E9591C !important; font-weight: 700; text-transform: uppercase; }
    .proposal-cover__title { font-size: 2.2rem; line-height: 1.15; max-width: 75%; color: #111827; font-weight: 700; }
    .proposal-cover__line { width: 90px; height: 4px; border-radius: 999px; background: #E9591C; }
    .proposal-cover__date { display: inline-block; border: 1px solid #E9591C; padding: .4rem .85rem; font-size: .8rem; font-weight: 600; letter-spacing: .04em; color: #111827; background: #ffffff; border-radius: 0.25rem; }
    .proposal-cover__box { border: 1px solid #dee2e6; border-radius: .25rem; background: #ffffff00; }
    .proposal-cover__submitted { position: relative !important; padding: 40px 25px; overflow: hidden !important; border: 1px solid #e5e7eb; background: linear-gradient(135deg, #f9fafb, #eef2f7); border-radius: .25rem; }
    .proposal-cover__prepared { padding: 1.5rem; }
    .proposal-cover__watermark, .proposal-cover__shape { position: absolute !important; pointer-events: none !important; z-index: 1; }
    .proposal-cover__shape--top { position: absolute !important; top: -46px !important; left: -46px !important; width: 240px !important; opacity: 1 !important; }
    .proposal-cover__shape--bottom { position: absolute !important; right: -30px !important; bottom: -30px !important; width: 240px !important; transform: rotate(180deg) !important; opacity: .5 !important; }
    .proposal-cover__watermark { position: absolute !important; right: 22mm !important; top: 76mm !important; width: 150px !important; height: 150px !important; opacity: .05 !important; }
    .proposal-cover__watermark_bottom { position: absolute !important; left: 0.5rem !important; bottom: 7.5rem !important; width: 150px !important; height: 150px !important; opacity: .08 !important; pointer-events: none !important; z-index: 1 !important; }
    .proposal-cover__footer { margin-top: auto; padding-top: .875rem; border-top: 1px solid #dee2e6; font-size: .875rem; }

    .proposal-preview-sheet table thead, .proposal-preview-sheet table thead tr, .proposal-preview-sheet table thead th, .proposal-preview-sheet table th,
    .proposal-page__body table thead, .proposal-page__body table thead tr, .proposal-page__body table thead th, .proposal-page__body table th,
    .quotation-page__body table thead, .quotation-page__body table thead tr, .quotation-page__body table thead th, .quotation-page__body table th,
    .html-preview-container table thead, .html-preview-container table thead tr, .html-preview-container table thead th, .html-preview-container table th,
    .prose table thead, .prose table thead tr, .prose table thead th, .prose table th { background-color: var(--template-color, #E9591C) !important; color: #ffffff !important; }

    .proposal-preview-sheet table thead th, .proposal-preview-sheet table th, .proposal-page__body table thead th, .proposal-page__body table th,
    .quotation-page__body table thead th, .quotation-page__body table th, .html-preview-container table thead th, .html-preview-container table th,
    .prose table thead th, .prose table th { color: #ffffff !important; font-weight: 600 !important; }

    .html-preview-container { font-size: 14px; line-height: 1.5; color: #1e293b; width: 100%; font-family: "Open Sans", sans-serif; }
    .html-preview-container h1 { font-size: 24px; font-weight: 700; margin: 8px 0; }
    .html-preview-container h2 { font-size: 20px; font-weight: 700; margin: 8px 0; }
    .html-preview-container h3 { font-size: 18px; font-weight: 600; margin: 6px 0; }
    .html-preview-container h4 { font-size: 16px; font-weight: 600; margin: 4px 0; }
    .html-preview-container h1:not([style*="color"]), .html-preview-container h2:not([style*="color"]), .html-preview-container h3:not([style*="color"]), .html-preview-container h4:not([style*="color"]) { color: #0f172a; }
    .html-preview-container p { margin: 4px 0; }
    .html-preview-container > p:first-child { margin-top: 0; }
    .html-preview-container > p:last-child { margin-bottom: 0; }
    .html-preview-container p:empty { min-height: 1.15em; margin: 0; }
    .html-preview-container p:empty::before { content: "\\00a0"; }
    .html-preview-container p:has(> br:only-child) { min-height: 1.15em; margin: 0; }
    .html-preview-container ul, .proposal-preview-sheet ul, .proposal-page__body ul, .prose ul { list-style-type: disc !important; padding-left: 24px !important; margin-left: 0 !important; margin-top: 8px !important; margin-bottom: 8px !important; }
    .html-preview-container ol, .proposal-preview-sheet ol, .proposal-page__body ol, .prose ol { list-style-type: decimal !important; padding-left: 24px !important; margin-left: 0 !important; margin-top: 8px !important; margin-bottom: 8px !important; }
    .html-preview-container li, .proposal-preview-sheet li, .proposal-page__body li, .prose li { display: list-item !important; list-style-type: inherit !important; margin-top: 3px !important; margin-bottom: 3px !important; }
    .html-preview-container li p, .proposal-preview-sheet li p, .proposal-page__body li p, .prose li p { display: inline !important; margin: 0 !important; }
    .html-preview-container blockquote { border-left: 4px solid #cbd5e1; padding-left: 16px; font-style: italic; margin: 8px 0; }
    .html-preview-container img { display: inline-block; vertical-align: middle; }
    .html-preview-container a { color: #2563eb; text-decoration: underline; }
    .html-preview-container a:hover { color: #1d4ed8; }

    .proposal-preview-sheet table:not(.charges-table), .proposal-page__body table:not(.proposal-table), .quotation-page__body table:not(.quotation-table),
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table), .prose table, .ProseMirror table {
        width: 100% !important; border-collapse: collapse !important; border: 1px solid #cbd5e1 !important; font-size: 10px !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; margin-top: 8px !important; margin-bottom: 8px !important; color: #293240 !important;
    }
    .proposal-preview-sheet table:not(.charges-table) thead tr, .proposal-page__body table:not(.proposal-table) thead tr, .quotation-page__body table:not(.quotation-table) thead tr,
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) thead tr, .prose table thead tr, .ProseMirror table thead tr {
        background-color: var(--template-color, #E9591C) !important; color: #ffffff !important; text-align: left !important; font-weight: 600 !important;
    }
    .proposal-preview-sheet table:not(.charges-table) thead th, .proposal-preview-sheet table:not(.charges-table) th, .proposal-page__body table:not(.proposal-table) thead th, .proposal-page__body table:not(.proposal-table) th,
    .quotation-page__body table:not(.quotation-table) thead th, .quotation-page__body table:not(.quotation-table) th, .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) thead th, .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) th,
    .prose table thead th, .prose table th, .ProseMirror table thead th, .ProseMirror table th {
        padding: 6px 8px !important; font-size: 10px !important; font-weight: 600 !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; border: 1px solid #cbd5e1 !important; box-sizing: border-box !important; vertical-align: middle !important; background-color: var(--template-color, #E9591C) !important; color: #ffffff !important; text-align: left !important;
    }
    .proposal-preview-sheet table:not(.charges-table) th *, .proposal-page__body table:not(.proposal-table) th *, .quotation-page__body table:not(.quotation-table) th *,
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) th *, .prose table th *, .ProseMirror table th * {
        margin: 0 !important; padding: 0 !important; font-size: 10px !important; font-weight: 600 !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; color: #ffffff !important;
    }
    .proposal-preview-sheet table:not(.charges-table) tbody td, .proposal-preview-sheet table:not(.charges-table) td, .proposal-page__body table:not(.proposal-table) tbody td, .proposal-page__body table:not(.proposal-table) td,
    .quotation-page__body table:not(.quotation-table) tbody td, .quotation-page__body table:not(.quotation-table) td, .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) tbody td, .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) td,
    .prose table tbody td, .prose table td, .ProseMirror table tbody td, .ProseMirror table td {
        padding: 6px 8px !important; font-size: 10px !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; border: 1px solid #cbd5e1 !important; box-sizing: border-box !important; vertical-align: middle !important; color: #293240 !important; word-break: break-word !important;
    }
    .proposal-preview-sheet table:not(.charges-table) td *:not([style*="color"]), .proposal-page__body table:not(.proposal-table) td *:not([style*="color"]), .quotation-page__body table:not(.quotation-table) td *:not([style*="color"]),
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) td *:not([style*="color"]), .prose table td *:not([style*="color"]), .ProseMirror table td *:not([style*="color"]) {
        margin: 0 !important; padding: 0 !important; font-size: 10px !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; color: inherit !important;
    }
    .proposal-preview-sheet table:not(.charges-table) td p + p, .proposal-page__body table:not(.proposal-table) td p + p, .quotation-page__body table:not(.quotation-table) td p + p,
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) td p + p, .prose table td p + p, .ProseMirror table td p + p { margin-top: 3px !important; }
    .proposal-preview-sheet table:not(.charges-table) tr, .proposal-page__body table:not(.proposal-table) tr, .quotation-page__body table:not(.quotation-table) tr,
    .html-preview-container table:not(.charges-table):not(.proposal-table):not(.quotation-table) tr, .prose table tr, .ProseMirror table tr { min-height: auto !important; border-bottom: 1px solid #cbd5e1 !important; }

    .proposal-preview-sheet img, .proposal-page__body img, .prose img, img.proposal-logo, .proposal-logo { display: inline-block !important; vertical-align: middle; }
    .proposal-preview-sheet [style*="text-align: center"] img, .proposal-preview-sheet [style*="text-align:center"] img, .proposal-page__body [style*="text-align: center"] img, .proposal-page__body [style*="text-align:center"] img, .prose [style*="text-align: center"] img, .prose [style*="text-align:center"] img, .text-center img { display: inline-block !important; margin-left: auto !important; margin-right: auto !important; }
    .proposal-preview-sheet [style*="text-align: right"] img, .proposal-preview-sheet [style*="text-align:right"] img, .proposal-page__body [style*="text-align: right"] img, .proposal-page__body [style*="text-align:right"] img, .prose [style*="text-align: right"] img, .prose [style*="text-align:right"] img, .text-right img { display: inline-block !important; margin-left: auto !important; margin-right: 0 !important; }
    .proposal-preview-sheet [style*="text-align: left"] img, .proposal-preview-sheet [style*="text-align:left"] img, .proposal-page__body [style*="text-align: left"] img, .proposal-page__body [style*="text-align:left"] img, .prose [style*="text-align: left"] img, .prose [style*="text-align:left"] img, .text-left img { display: inline-block !important; margin-right: auto !important; margin-left: 0 !important; }

    @media print {
        @page { size: 210mm 297mm; margin: 0; }
        html, body {
            width: 210mm !important; margin: 0 !important; padding: 0 !important;
            background: white !important;
            font-family: "Open Sans", sans-serif !important;
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
            font-family: "Open Sans", sans-serif !important;
        }
        .proposal-page__body {
            position: relative !important; z-index: 1 !important;
            padding: 32mm 15mm 20mm !important;
            min-height: calc(297mm - 20mm) !important;
            box-sizing: border-box !important;
            display: flex !important; flex-direction: column !important;
            justify-content: flex-start !important;
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
                    justifyContent: 'flex-start',
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
    showPrintButton = true,
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
                if (scrollH <= 980) {
                    setPaginatedFullProposalPages([fullProposalHtml]);
                } else {
                    const chunks = paginateDomContainer(measureContainerRef.current, 980);
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
                        <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
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

                            {showPrintButton && (
                                <div className="flex items-center gap-2 pr-6">
                                    <Button variant="default" size="sm" onClick={handlePrint} className="gap-2 text-xs h-8">
                                        <Printer className="h-3.5 w-3.5" />
                                        {t('Print')}
                                    </Button>
                                </div>
                            )}
                        </DialogHeader>

                        {/* Modal Body / Scrollable Canvas */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
                            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
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
