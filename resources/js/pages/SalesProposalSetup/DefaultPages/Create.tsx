import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { replaceProposalShortcodes } from '@/utils/proposalShortcodes';
import { getImagePath } from '@/utils/helpers';
import MediaPicker from '@/components/MediaPicker';
import { Save, ArrowLeft, Eye, Code, PenTool, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
    settings?: { template_color?: string; background_image?: string;[key: string]: any } | null;
    nextSortOrder?: number;
    variables?: Record<string, string>;
}

const defaultProposalVariables: Record<string, string> = {
    'App Name': 'app_name',
    'Company Name': 'company_name',
    'Company Logo': 'company_logo',
    'Proposal Logo': 'proposal_logo',
    'Company Email': 'company_email',
    'Company Phone': 'company_phone',
    'Company Address': 'company_address',
    'Company Website': 'company_website',
    'Employee Name': 'employee_name',
    'Employee Email': 'employee_email',
    'Employee Phone': 'employee_phone',
    'Proposal Number': 'proposal_number',
    'Proposal Date': 'proposal_date',
    'Due Date': 'due_date',
    'Customer Name': 'customer_name',
    'Customer Email': 'customer_email',
    'Customer Phone': 'customer_phone',
    'Customer Address': 'customer_address',
    'Total Amount': 'total_amount',
    'Sub Total': 'sub_total',
    'Total Tax': 'total_tax',
    'Total Discount': 'total_discount',
};

const PROPOSAL_CONTENT_CLASSES = `
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

/**
 * Paginates rendered DOM nodes from measuring container into A4 page chunks (~820px budget per page)
 */
function paginateDomContainer(container: HTMLElement, maxPageHeight: number = 900): string[] {
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

        // Wrapper elements -> unwrap and process individual child elements
        if ((tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main') && el.children.length > 0) {
            Array.from(el.children).forEach((child) => processElement(child as HTMLElement));
            return;
        }

        // Table splitting row-by-row
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

        // List splitting item-by-item
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

        // Standard block element (p, h1-h6, blockquote, img, etc.)
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

export default function Create({ settings, nextSortOrder = 1, variables }: Props) {
    const { t } = useTranslation();
    const availableVariables = variables && Object.keys(variables).length > 0 ? variables : defaultProposalVariables;
    const templateColor = settings?.template_color || '#E9591C';
    const defaultTemplateBg = settings?.background_image || '';

    // Default mode: Text Editor
    const [editorMode, setEditorMode] = useState<'rich' | 'code' | 'preview'>('rich');
    const [editorKey, setEditorKey] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        page_type: 'general',
        background_image: '',
        sort_order: nextSortOrder,
        is_active: true,
    });

    const bgUrl = data.background_image
        ? getImagePath(data.background_image)
        : (defaultTemplateBg ? getImagePath(defaultTemplateBg) : '');

    const isLogoEnabled = settings?.show_logo !== undefined
        ? (settings.show_logo === '1' || settings.show_logo === true || settings.show_logo === 1 || settings.show_logo === 'true')
        : true;
    const rawLogo = settings?.logo_image || settings?.company_logo || '';
    const logoUrl = (isLogoEnabled && rawLogo) ? getImagePath(rawLogo) : '';

    const processedContent = useMemo(() => {
        if (!data.content) return '';
        return replaceProposalShortcodes(data.content, { settings });
    }, [data.content, settings]);

    const measureContainerRef = useRef<HTMLDivElement>(null);
    const [paginatedPreviewPages, setPaginatedPreviewPages] = useState<string[]>([]);

    useEffect(() => {
        if (!processedContent) {
            setPaginatedPreviewPages([]);
            return;
        }

        const runPagination = () => {
            if (measureContainerRef.current) {
                const chunks = paginateDomContainer(measureContainerRef.current, 900);
                setPaginatedPreviewPages(chunks);
            } else {
                setPaginatedPreviewPages([processedContent]);
            }
        };

        // Run immediately and in next animation frame to ensure DOM layout calculation
        runPagination();
        const animId = requestAnimationFrame(runPagination);
        return () => cancelAnimationFrame(animId);
    }, [processedContent, editorMode]);

    const handleSwitchMode = (mode: 'code' | 'rich' | 'preview') => {
        if (mode === 'rich') {
            setEditorKey((prev) => prev + 1);
        }
        setEditorMode(mode);
    };

    const handleCopyVariable = (variableKey: string) => {
        const textToCopy = `{${variableKey}}`;
        navigator.clipboard.writeText(textToCopy);
        toast.success(t('Variable copied: {{var}}', { var: textToCopy }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('proposal-setup.default-pages.store'), {
            onSuccess: () => {
                toast.success(t('Default page created successfully.'));
            },
            onError: (errs) => {
                if (errs.sort_order) {
                    toast.error(errs.sort_order);
                } else {
                    toast.error(t('Failed to create page. Please check errors.'));
                }
            },
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposals'), url: route('sales-proposals.index') },
                { label: t('Proposal Setup'), url: route('proposal-setup.index') },
                { label: t('Create Default Page') },
            ]}
            pageTitle={t('Create Default Page')}
            pageActions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('proposal-setup.index'))}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('Back')}
                </Button>
            }
        >
            <Head title={t('Create Default Page')} />

            {/* Hidden live measuring container in exact A4 styling to measure real browser heights */}
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

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Only the Variables Section */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader className="p-3 pb-1.5">
                            <CardTitle className="text-base font-semibold">{t('Variables')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="grid grid-cols-1 gap-1 text-xs">
                                {Object.entries(availableVariables).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between group cursor-pointer hover:bg-muted/60 py-1 px-1.5 rounded transition-colors leading-tight"
                                        onClick={() => handleCopyVariable(value)}
                                        title={t('Click to copy')}
                                    >
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span className="text-primary font-mono font-medium group-hover:underline">
                                            {`{${value}}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Form with Clean & Spacious Hierarchy */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <Card>
                        <CardContent className="space-y-6 p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Page Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="page-title" className="text-sm font-medium">{t('Page Title')}</Label>
                                    <Input
                                        id="page-title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('Enter page title')}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Background Image */}
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <Label htmlFor="bg-image" className="text-sm font-medium flex items-center gap-1.5">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            {t('Page Background Image')}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {t('Optional — leave empty to use default template background')}
                                        </span>
                                    </div>
                                    <MediaPicker
                                        id="bg-image"
                                        value={data.background_image}
                                        onChange={(url) => setData('background_image', typeof url === 'string' ? url : (url[0] || ''))}
                                        placeholder={t('Choose background image from library...')}
                                        showPreview={false}
                                    />
                                    {errors.background_image && (
                                        <p className="text-red-500 text-sm mt-1">{errors.background_image}</p>
                                    )}
                                </div>

                                {/* Page Content */}
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <Label htmlFor="page-content" className="text-sm font-medium">{t('Page Content')}</Label>

                                        {/* Editor Mode Tabs (Order: Text Editor, HTML Code, Preview) */}
                                        <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border gap-1">
                                            {/* 1. Text Editor (Default) */}
                                            <Button
                                                type="button"
                                                variant={editorMode === 'rich' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className={cn(
                                                    "h-7 px-2.5 text-xs gap-1.5 font-medium transition-all shadow-none",
                                                    editorMode === 'rich' && "bg-background shadow-xs text-foreground font-semibold"
                                                )}
                                                onClick={() => handleSwitchMode('rich')}
                                                title={t('Use WYSIWYG text toolbar')}
                                            >
                                                <PenTool className="h-3.5 w-3.5 text-blue-500" />
                                                <span>{t('Text Editor')}</span>
                                            </Button>

                                            {/* 2. HTML Code */}
                                            <Button
                                                type="button"
                                                variant={editorMode === 'code' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className={cn(
                                                    "h-7 px-2.5 text-xs gap-1.5 font-medium transition-all shadow-none",
                                                    editorMode === 'code' && "bg-background shadow-xs text-foreground font-semibold"
                                                )}
                                                onClick={() => handleSwitchMode('code')}
                                                title={t('Paste and edit raw HTML and CSS')}
                                            >
                                                <Code className="h-3.5 w-3.5 text-amber-500" />
                                                <span>{t('HTML Code')}</span>
                                            </Button>

                                            {/* 3. Preview */}
                                            <Button
                                                type="button"
                                                variant={editorMode === 'preview' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className={cn(
                                                    "h-7 px-2.5 text-xs gap-1.5 font-medium transition-all shadow-none",
                                                    editorMode === 'preview' && "bg-background shadow-xs text-foreground font-semibold"
                                                )}
                                                onClick={() => handleSwitchMode('preview')}
                                                title={t('View exact A4 HTML and CSS rendering')}
                                            >
                                                <Eye className="h-3.5 w-3.5 text-primary" />
                                                <span>{t('Preview')}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 1. HTML & CSS Source Code Editor */}
                                    {editorMode === 'code' && (
                                        <div className="space-y-1.5">
                                            <div className="border rounded-lg overflow-hidden bg-white border-slate-200 shadow-xs">
                                                <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
                                                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-semibold">
                                                        <Code className="h-3.5 w-3.5 text-amber-500" />
                                                        {t('HTML Code')}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 text-xs text-primary hover:underline"
                                                        onClick={() => handleSwitchMode('preview')}
                                                    >
                                                        {t('View Preview →')}
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    id="page-content-html"
                                                    value={data.content}
                                                    onChange={(e) => setData('content', e.target.value)}
                                                    placeholder={t('Paste or write full HTML & CSS body content here (e.g. <div style="...">...</div>)')}
                                                    rows={15}
                                                    className="font-mono text-xs leading-relaxed bg-white text-slate-900 border-none focus-visible:ring-0 focus-visible:outline-none min-h-[300px] resize-y p-4 selection:bg-primary/20 rounded-none"
                                                    spellCheck={false}
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
                                                <span>{t('Paste your HTML body content above. It will be dynamically framed in an A4 (210mm × 297mm) sheet.')}</span>
                                                <span className="font-mono text-[10px]">{t('{{count}} chars', { count: data.content.length })}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* 2. Text Editor (Rich Text WYSIWYG) */}
                                    {editorMode === 'rich' && (
                                        <div
                                            className="space-y-1"
                                            style={{ '--template-color': templateColor } as React.CSSProperties}
                                        >
                                            <RichTextEditor
                                                key={editorKey}
                                                content={data.content}
                                                onChange={(content) => setData('content', content)}
                                                placeholder={t('Enter page content with HTML and variables')}
                                                className="border rounded-lg bg-white shadow-xs overflow-hidden"
                                            />
                                            <p className="text-[11px] text-muted-foreground px-1">
                                                {t('WYSIWYG editor for formatted text, headings, and tables.')}
                                            </p>
                                        </div>
                                    )}

                                    {/* 3. Exact A4 HTML & CSS Live Preview (Scrollable internally with max-height) */}
                                    {editorMode === 'preview' && (
                                        <div
                                            className="border rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xs"
                                            style={{ '--template-color': templateColor } as React.CSSProperties}
                                        >
                                            {/* Scrollable container displaying the real A4 sheet(s) without expanding the full page */}
                                            <div className="p-4 sm:p-8 flex flex-col items-center gap-8 overflow-y-auto max-h-[820px] bg-slate-200/70 dark:bg-slate-900/60 rounded-lg shadow-inner">
                                                {paginatedPreviewPages.length > 0 ? (
                                                    paginatedPreviewPages.map((pageHtml, pageIdx) => (
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

                                                            {/* Page Body strictly conforming to padding 32mm 15mm 20mm */}
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
                                                                <p className="text-slate-400">{t('No content entered yet.')}</p>
                                                                <p className="text-xs text-slate-400">{t('Switch to "HTML Code" or "Text Editor" to add page body content.')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {errors.content && (
                                        <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                                    <div className="space-y-2">
                                        <Label htmlFor="sort-order" className="text-sm font-medium">{t('Sort Order')}</Label>
                                        <Input
                                            id="sort-order"
                                            type="number"
                                            min={1}
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 1)}
                                        />
                                        {errors.sort_order && (
                                            <p className="text-red-500 text-sm mt-1">{errors.sort_order}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 flex flex-col justify-end">
                                        <Label htmlFor="page-active" className="text-sm font-medium">{t('Status')}</Label>
                                        <div className="flex items-center h-10">
                                            <Switch
                                                id="page-active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={processing} className="min-w-24">
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? t('Saving...') : t('Create Page')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
