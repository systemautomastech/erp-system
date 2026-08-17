import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Code } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';
import { replaceProposalShortcodes } from '@/utils/proposalShortcodes';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const PROPOSAL_CONTENT_CLASSES = `
    text-slate-800 text-sm leading-normal
    [&>p]:mb-2 [&>p:last-child]:mb-0
    [&_p:empty]:min-h-[1.15em] [&_p:empty]:mb-0 [&_p:empty]:before:content-['\\00a0']
    [&_p:has(>br:only-child)]:min-h-[1.15em] [&_p:has(>br:only-child)]:mb-0
    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3
    [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3
    [&_li]:my-1
    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:my-3
    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:my-2.5
    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:my-2
    [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-slate-900 [&_h4]:my-1.5
    [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--template-color,#E9591C)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-slate-600
    [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-800
    [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-slate-300 [&_table]:rounded-sm [&_table]:overflow-hidden
    [&_thead]:bg-[var(--template-color,#E9591C)] [&_thead]:text-white
    [&_th]:border [&_th]:border-slate-300 [&_th]:bg-[var(--template-color,#E9591C)] [&_th]:text-white [&_th]:font-semibold [&_th]:py-2 [&_th]:px-3 [&_th]:text-left
    [&_td]:border [&_td]:border-slate-200 [&_td]:py-2 [&_td]:px-3 [&_td]:text-slate-700 [&_td]:text-xs
    [&_tr:first-child_th]:bg-[var(--template-color,#E9591C)] [&_tr:first-child_th]:text-white
    [&_tr:first-child_td]:bg-[var(--template-color,#E9591C)] [&_tr:first-child_td]:text-white [&_tr:first-child_td]:font-semibold
    [&_tr:not(:first-child):hover]:bg-slate-50/60
`;

export function paginateDomContainer(container: HTMLElement, maxPageHeight: number = 900): string[] {
    const pages: string[] = [];
    let currentPageHtml: string[] = [];
    let currentPageAccumulatedHeight = 0;

    const startNewPage = () => {
        if (currentPageHtml.length > 0) {
            pages.push(currentPageHtml.join(''));
            currentPageHtml = [];
            currentPageAccumulatedHeight = 0;
        }
    };

    const processElement = (el: HTMLElement) => {
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

        if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main') && el.children.length > 0) {
            Array.from(el.children).forEach((child) => processElement(child as HTMLElement));
            return;
        }

        if (tag === 'table') {
            const tableHeight = el.offsetHeight || 50;
            if (currentPageAccumulatedHeight + tableHeight > maxPageHeight) {
                const thead = el.querySelector('thead');
                const theadHtml = thead ? thead.outerHTML : '';
                const rows = Array.from(el.querySelectorAll('tbody > tr, tr'));
                const tableClasses = el.getAttribute('class') || '';
                const tableStyle = el.getAttribute('style') || '';

                if (rows.length > 1) {
                    let currentTableRows: string[] = [];
                    let currentTableChunkHeight = thead ? (thead as HTMLElement).offsetHeight : 0;

                    for (const row of rows) {
                        if (row.parentElement?.tagName.toLowerCase() === 'thead') continue;

                        const rowHeight = (row as HTMLElement).offsetHeight || 28;

                        if (currentPageAccumulatedHeight + currentTableChunkHeight + rowHeight > maxPageHeight && (currentPageHtml.length > 0 || currentTableRows.length > 0)) {
                            if (currentTableRows.length > 0) {
                                currentPageHtml.push(`<table class="${tableClasses}" style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody></table>`);
                                currentPageAccumulatedHeight += currentTableChunkHeight;
                            }
                            startNewPage();
                            currentTableRows = [];
                            currentTableChunkHeight = thead ? (thead as HTMLElement).offsetHeight : 0;
                        }

                        currentTableRows.push(row.outerHTML);
                        currentTableChunkHeight += rowHeight;
                    }

                    if (currentTableRows.length > 0) {
                        currentPageHtml.push(`<table class="${tableClasses}" style="${tableStyle}">${theadHtml}<tbody>${currentTableRows.join('')}</tbody></table>`);
                        currentPageAccumulatedHeight += currentTableChunkHeight;
                    }
                    return;
                }
            }
        }

        if (tag === 'ul' || tag === 'ol') {
            const listHeight = el.offsetHeight || 40;
            if (currentPageAccumulatedHeight + listHeight > maxPageHeight) {
                const items = Array.from(el.querySelectorAll(':scope > li'));
                if (items.length > 1) {
                    const listClasses = el.getAttribute('class') || '';
                    const listStyle = el.getAttribute('style') || '';
                    let currentListItems: string[] = [];
                    let currentListChunkHeight = 0;

                    for (const li of items) {
                        const liHeight = (li as HTMLElement).offsetHeight || 22;

                        if (currentPageAccumulatedHeight + currentListChunkHeight + liHeight > maxPageHeight && (currentPageHtml.length > 0 || currentListItems.length > 0)) {
                            if (currentListItems.length > 0) {
                                currentPageHtml.push(`<${tag} class="${listClasses}" style="${listStyle}">${currentListItems.join('')}</${tag}>`);
                                currentPageAccumulatedHeight += currentListChunkHeight;
                            }
                            startNewPage();
                            currentListItems = [];
                            currentListChunkHeight = 0;
                        }

                        currentListItems.push(li.outerHTML);
                        currentListChunkHeight += liHeight;
                    }

                    if (currentListItems.length > 0) {
                        currentPageHtml.push(`<${tag} class="${listClasses}" style="${listStyle}">${currentListItems.join('')}</${tag}>`);
                        currentPageAccumulatedHeight += currentListChunkHeight;
                    }
                    return;
                }
            }
        }

        const elHeight = el.offsetHeight || 25;
        const computedStyle = window.getComputedStyle(el);
        const margin = (parseFloat(computedStyle.marginTop) || 0) + (parseFloat(computedStyle.marginBottom) || 0);
        const totalElHeight = elHeight + margin;

        if (currentPageAccumulatedHeight + totalElHeight > maxPageHeight && currentPageHtml.length > 0) {
            startNewPage();
        }

        currentPageHtml.push(el.outerHTML);
        currentPageAccumulatedHeight += totalElHeight;
    };

    Array.from(container.children).forEach((child) => processElement(child as HTMLElement));

    if (currentPageHtml.length > 0) {
        pages.push(currentPageHtml.join(''));
    }

    return pages.length > 0 ? pages : [container.innerHTML];
}

export interface ProposalPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    pageType?: string;
    content?: string;
    backgroundImage?: string;
    settings?: { template_color?: string; background_image?: string;[key: string]: any } | null;
}

export default function ProposalPreviewModal({
    open,
    onOpenChange,
    title = '',
    pageType = 'general',
    content = '',
    backgroundImage = '',
    settings,
}: ProposalPreviewModalProps) {
    const { t } = useTranslation();
    const templateColor = settings?.template_color || '#E9591C';
    const defaultTemplateBg = settings?.background_image || '';

    const bgUrl = backgroundImage
        ? getImagePath(backgroundImage)
        : (defaultTemplateBg ? getImagePath(defaultTemplateBg) : '');

    const isLogoEnabled = settings?.show_logo !== undefined
        ? (settings.show_logo === '1' || settings.show_logo === true || settings.show_logo === 1 || settings.show_logo === 'true')
        : true;
    const rawLogo = settings?.logo_image || settings?.company_logo || '';
    const logoUrl = (isLogoEnabled && rawLogo) ? getImagePath(rawLogo) : '';

    const processedContent = useMemo(() => {
        if (!content) return '';
        return replaceProposalShortcodes(content, { settings });
    }, [content, settings]);

    const measureContainerRef = useRef<HTMLDivElement>(null);
    const [paginatedPages, setPaginatedPages] = useState<string[]>([]);

    useEffect(() => {
        if (!processedContent || !open) {
            setPaginatedPages([]);
            return;
        }

        const runPagination = () => {
            if (measureContainerRef.current) {
                const chunks = paginateDomContainer(measureContainerRef.current, 900);
                setPaginatedPages(chunks);
            } else {
                setPaginatedPages([processedContent]);
            }
        };

        runPagination();
        const animId = requestAnimationFrame(runPagination);
        return () => cancelAnimationFrame(animId);
    }, [processedContent, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Hidden measuring container in exact A4 styling */}
            <div
                ref={measureContainerRef}
                style={{
                    position: 'absolute',
                    top: '-99999px',
                    left: '-99999px',
                    width: '180mm',

                    
                    visibility: 'hidden',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                    '--template-color': templateColor,
                } as React.CSSProperties}
                className={PROPOSAL_CONTENT_CLASSES}
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            <DialogContent className="max-w-5xl max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl rounded-xl">
                <DialogHeader className="px-6 py-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>{t('Preview')}: <span className="font-normal text-muted-foreground">{title || t('Untitled Page')}</span></span>
                    </DialogTitle>
                </DialogHeader>

                <div
                    className="flex-1 overflow-hidden"
                    style={{ '--template-color': templateColor } as React.CSSProperties}
                >
                    {/* Scrollable multi-page A4 canvas */}
                    <div className="p-6 sm:p-10 flex flex-col items-center gap-8 overflow-y-auto max-h-[76vh] bg-slate-200/80 dark:bg-slate-900/80">
                        {paginatedPages.length > 0 ? (
                            paginatedPages.map((pageHtml, pageIdx) => (
                                <div
                                    key={pageIdx}
                                    style={{
                                        width: '210mm',
                                        height: '297mm',
                                        minHeight: '297mm',
                                        maxHeight: '297mm',
                                        boxSizing: 'border-box',
                                        ...(bgUrl ? {
                                            backgroundImage: `url(${bgUrl})`,
                                            backgroundSize: '100% 100%',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        } : {})
                                    }}
                                    className="proposal-preview-sheet quotation-cover__sheet bg-white text-slate-900 max-w-full shadow-2xl rounded-sm text-sm font-sans border border-slate-300 dark:border-slate-800 shrink-0 relative overflow-hidden"
                                >
                                    {/* Top Right Header Logo */}
                                    {logoUrl && (
                                        <div
                                            className="absolute top-[8mm] right-[15mm] z-20 pointer-events-none flex items-center justify-end"
                                            style={{ maxHeight: '20mm', maxWidth: '60mm' }}
                                        >
                                            <img
                                                src={logoUrl}
                                                alt="Header Logo"
                                                className="max-h-[16mm] max-w-[55mm] object-contain"
                                            />
                                        </div>
                                    )}

                                    <div
                                        className="quotation-page__body"
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            padding: '32mm 15mm 20mm',
                                            height: '297mm',
                                            maxHeight: '297mm',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <div
                                            className={cn("html-preview-container", PROPOSAL_CONTENT_CLASSES)}
                                            dangerouslySetInnerHTML={{ __html: pageHtml }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    width: '210mm',
                                    height: '297mm',
                                    minHeight: '297mm',
                                    maxHeight: '297mm',
                                    boxSizing: 'border-box',
                                    ...(bgUrl ? {
                                        backgroundImage: `url(${bgUrl})`,
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                    } : {})
                                }}
                                className="proposal-preview-sheet quotation-cover__sheet bg-white text-slate-900 max-w-full shadow-2xl rounded-sm text-sm font-sans border border-slate-300 dark:border-slate-800 shrink-0 relative overflow-hidden"
                            >
                                {/* Top Right Header Logo */}
                                {logoUrl && (
                                    <div
                                        className="absolute top-[8mm] right-[15mm] z-20 pointer-events-none flex items-center justify-end"
                                        style={{ maxHeight: '20mm', maxWidth: '60mm' }}
                                    >
                                        <img
                                            src={logoUrl}
                                            alt="Header Logo"
                                            className="max-h-[16mm] max-w-[55mm] object-contain"
                                        />
                                    </div>
                                )}

                                <div
                                    className="quotation-page__body"
                                    style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        padding: '32mm 15mm 20mm',
                                        height: '297mm',
                                        maxHeight: '297mm',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground text-sm italic">
                                        <Code className="h-8 w-8 mb-2 opacity-30 text-slate-400" />
                                        <p className="text-slate-400">{t('No content available for this page.')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-3 bg-muted/20 border-t border-border flex items-center justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        {t('Close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
