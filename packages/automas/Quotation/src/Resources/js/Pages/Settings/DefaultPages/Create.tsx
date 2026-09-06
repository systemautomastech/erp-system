import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { replaceQuotationShortcodes } from '../../Quotations/utils/quotationShortcodes';
import { getImagePath } from '@/utils/helpers';
import MediaPicker from '@/components/MediaPicker';
import {
    ProposalPreviewSheet,
    paginateDomContainer,
    PROPOSAL_CONTENT_CLASSES,
} from '@/components/PreviewModal';
import {
    Save,
    ArrowLeft,
    Eye,
    Code,
    PenTool,
    Image as ImageIcon,
    Settings,
    Info,
    Copy,
    Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
    settings?: { template_color?: string; background_image?: string; [key: string]: any } | null;
    nextSortOrder?: number;
    variables?: Record<string, string>;
}

export interface VariableGroup {
    title: string;
    items: { label: string; key: string }[];
}

export const defaultQuotationVariableGroups: VariableGroup[] = [
    {
        title: 'Quotation',
        items: [
            { label: 'Subject', key: 'quotation_subject' },
            { label: 'Quotation Number', key: 'quotation_number' },
            { label: 'Quotation Date', key: 'quotation_date' },
            { label: 'Quotation Due Date', key: 'due_date' },
        ],
    },
    {
        title: 'Company',
        items: [
            { label: 'Company Name', key: 'company_name' },
            { label: 'Company Logo', key: 'company_logo' },
            { label: 'Quotation Logo', key: 'quotation_logo' },
            { label: 'Company Email', key: 'company_email' },
            { label: 'Company Phone', key: 'company_phone' },
            { label: 'Company Address', key: 'company_address' },
            { label: 'Company Website', key: 'company_website' },
        ],
    },
    {
        title: 'User',
        items: [
            { label: 'User Name', key: 'user_name' },
            { label: 'User Email', key: 'user_email' },
            { label: 'User Phone', key: 'user_phone' },
        ],
    },
    {
        title: 'Customer',
        items: [
            { label: 'Customer Name', key: 'customer_name' },
            { label: 'Customer Email', key: 'customer_email' },
            { label: 'Customer Phone', key: 'customer_phone' },
            { label: 'Customer Address', key: 'customer_address' },
        ],
    },
];

interface LiveA4EditorProps {
    content: string;
    onChange: (val: string) => void;
    className?: string;
}

const LiveA4Editor: React.FC<LiveA4EditorProps> = ({
    content,
    onChange,
    className,
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isFocusedRef = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isFocusedRef.current) {
            if (editorRef.current.innerHTML !== (content || '')) {
                editorRef.current.innerHTML = content || '';
            }
        }
    }, [content]);

    const syncChanges = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
        }
    };

    const handleFocus = () => {
        isFocusedRef.current = true;
    };

    const handleBlur = () => {
        syncChanges();
        isFocusedRef.current = false;
    };

    const handleInput = () => {
        syncChanges();
    };

    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={handleFocus}
            onInput={handleInput}
            onBlur={handleBlur}
            className={cn("outline-none w-full min-h-[400px] cursor-text", className)}
            style={{ marginTop: '2rem' }}
        />
    );
};

export default function Create({ settings, nextSortOrder = 1 }: Props) {
    const { t } = useTranslation();
    const templateColor = settings?.template_color || '#E9591C';
    const defaultTemplateBg = settings?.background_image || '';

    const [editorMode, setEditorMode] = useState<'rich' | 'code' | 'preview'>('rich');
    const [editorKey, setEditorKey] = useState(0);
    const [useCustomBg, setUseCustomBg] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: nextSortOrder ? `Page ${nextSortOrder}` : 'Page 1',
        content: '',
        background_image: '',
        sort_order: nextSortOrder,
        is_active: true,
    });

    const isLogoEnabled = settings?.show_logo !== undefined
        ? (settings.show_logo === '1' || settings.show_logo === true || settings.show_logo === 1 || settings.show_logo === 'true')
        : true;
    const rawLogo = settings?.logo_image || settings?.company_logo || '';
    const logoUrl = (isLogoEnabled && rawLogo) ? getImagePath(rawLogo) : '';
    const headerLogoAlign = settings?.header_logo_align || 'right';

    const processedContent = useMemo(() => {
        if (!data.content) return '';
        return replaceQuotationShortcodes(data.content, { settings, isDefaultPageSetup: true });
    }, [data.content, settings]);

    const measureContainerRef = useRef<HTMLDivElement>(null);
    const [paginatedPreviewPages, setPaginatedPreviewPages] = useState<string[]>([]);


    useEffect(() => {
        if (!processedContent) {
            setPaginatedPreviewPages([]);
            return;
        }

        const runPagination = () => {
            const hasExplicitBreak = /class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(processedContent);

            if (measureContainerRef.current) {
                const scrollH = measureContainerRef.current.scrollHeight;
                if (!hasExplicitBreak && scrollH <= 980) {
                    setPaginatedPreviewPages([processedContent]);
                } else {
                    const chunks = paginateDomContainer(measureContainerRef.current, 980);
                    setPaginatedPreviewPages(chunks);
                }
            } else {
                setPaginatedPreviewPages([processedContent]);
            }
        };

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
        setCopiedKey(variableKey);
        setTimeout(() => setCopiedKey(null), 1500);
        toast.success(t('Variable copied: {{var}}', { var: textToCopy }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('quotation-setup.default-pages.store'), {
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
                { label: t('Quotations'), url: route('quotations.index') },
                { label: t('Quotation Setup'), url: route('quotation-setup.index') },
                { label: t('Create Default Page') },
            ]}
            pageTitle={t('Create Default Page')}
            pageActions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('quotation-setup.index'))}
                >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    {t('Back')}
                </Button>
            }
        >
            <Head title={t('Create Default Page')} />

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

            <div className="grid grid-cols-12 gap-6 items-start">
                {/* Left Column: Grouped Variables (Clean Sticky Card) */}
                <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-4 space-y-4">
                    <Card className="border-border/70 shadow-xs">
                        <CardHeader className="p-3.5 pb-2.5 border-b bg-muted/20">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>{t('Available Variables')}</span>
                                <span className="text-[10px] text-muted-foreground font-normal lowercase">{t('click to copy')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1.5">
                            {defaultQuotationVariableGroups.map((group) => (
                                <div key={group.title} className="space-y-1">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                                        {t(group.title)}
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.items.map(({ label, key }) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between group cursor-pointer hover:bg-muted/70 py-1.5 px-2 rounded-md transition-colors leading-tight text-xs"
                                                onClick={() => handleCopyVariable(key)}
                                                title={t('Click to copy')}
                                            >
                                                <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[130px]">{t(label)}:</span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-primary font-mono text-[11px] font-medium group-hover:underline">
                                                        {`{${key}}`}
                                                    </span>
                                                    {copiedKey === key ? (
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Clean Form Layout */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <Card className="border-border/70 shadow-xs">
                        <CardContent className="p-5 sm:p-6">
                            <form id="create-default-page-form" onSubmit={handleSubmit} className="space-y-5">
                                {/* Page Title & Status Row */}
                                <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
                                    <div className="flex-1 space-y-1.5 min-w-0">
                                        <Label htmlFor="page-title" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {t('Page Title')}
                                        </Label>
                                        <Input
                                            id="page-title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder={t('e.g. Terms & Conditions, Company Profile...')}
                                            className="h-10 text-sm"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Sort Order (Ultra Compact fixed width) */}
                                    <div className="w-20 shrink-0 space-y-1.5">
                                        <Label htmlFor="sort-order" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('Order')}
                                        </Label>
                                        <Input
                                            id="sort-order"
                                            type="number"
                                            min={1}
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 1)}
                                            className="h-10 text-sm text-center px-2"
                                        />
                                        {errors.sort_order && (
                                            <p className="text-red-500 text-xs mt-1">{errors.sort_order}</p>
                                        )}
                                    </div>

                                    {/* Status Switch (Compact) */}
                                    <div className="shrink-0 flex items-center justify-between gap-2.5 h-10 px-3 rounded-lg border bg-muted/30">
                                        <Label htmlFor="page-active" className="text-xs font-medium cursor-pointer">
                                            {data.is_active ? t('Active') : t('Disabled')}
                                        </Label>
                                        <Switch
                                            id="page-active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </div>

                                {/* Background Selection Row (Minimal & Slim) */}
                                <div className="px-3.5 py-2 rounded-lg border border-border/80 bg-muted/10 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('Page Background')}:</span>
                                            <span className="text-xs text-muted-foreground">
                                                {useCustomBg ? t('Custom Image') : t('Quotation Default Background')}
                                            </span>
                                            {!useCustomBg && (
                                                <a
                                                    href={route('quotation-setup.index')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline ml-1"
                                                    title={t('Edit default background in settings')}
                                                >
                                                    <Settings className="h-3 w-3" />
                                                    {t('Settings')}
                                                </a>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs font-medium"
                                            onClick={() => {
                                                const next = !useCustomBg;
                                                setUseCustomBg(next);
                                                if (!next) setData('background_image', '');
                                            }}
                                        >
                                            {useCustomBg ? t('Use Default Background') : t('Upload Custom Background')}
                                        </Button>
                                    </div>

                                    {useCustomBg && (
                                        <div className="pt-2 border-t space-y-2 animate-in fade-in-50 duration-200">
                                            <MediaPicker
                                                id="bg-image"
                                                value={data.background_image}
                                                onChange={(url) => setData('background_image', typeof url === 'string' ? url : (url[0] || ''))}
                                                placeholder={t('Choose background image from library...')}
                                                showPreview={true}
                                            />
                                            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                                                <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                <span>{t('Recommended size: A4 210mm × 297mm (JPG, PNG, WebP).')}</span>
                                            </div>
                                            {errors.background_image && (
                                                <p className="text-red-500 text-xs mt-1">{errors.background_image}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Page Content & Editor */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label htmlFor="page-content" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {t('Page Content')}
                                        </Label>

                                        {/* Editor Mode Tabs (Text Editor, HTML Code, Preview) */}
                                        <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border gap-1">
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
                                                <Textarea
                                                    id="page-content-html"
                                                    value={data.content}
                                                    onChange={(e) => setData('content', e.target.value)}
                                                    placeholder={t('Paste or write full HTML & CSS body content here (e.g. <div style="...">...</div>)')}
                                                    rows={15}
                                                    className="font-mono text-xs leading-relaxed bg-white text-slate-900 border-none focus-visible:ring-0 focus-visible:outline-none min-h-[320px] resize-y p-4 selection:bg-primary/20 rounded-none"
                                                    spellCheck={false}
                                                />
                                            </div>
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
                                                className="border rounded-lg bg-white shadow-xs overflow-hidden min-h-[320px]"
                                            />
                                        </div>
                                    )}

                                    {/* 3. A4 Live Editable Preview */}
                                    {editorMode === 'preview' && (
                                        <div
                                            className="border rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xs"
                                            style={{ '--template-color': templateColor } as React.CSSProperties}
                                        >
                                            <div className="p-4 sm:p-8 flex flex-col items-center gap-8 overflow-y-auto max-h-[820px] bg-slate-200/70 dark:bg-slate-900/60 shadow-inner">
                                                {paginatedPreviewPages.length > 0 ? (
                                                    paginatedPreviewPages.map((pageHtml, pageIdx) => (
                                                        <ProposalPreviewSheet
                                                            key={`create-preview-${pageIdx}`}
                                                            pageKey={`create-preview-${pageIdx}`}
                                                            backgroundImage={data.background_image}
                                                            defaultBg={defaultTemplateBg}
                                                            templateColor={templateColor}
                                                            headerLogo={logoUrl}
                                                            headerLogoAlign={headerLogoAlign}
                                                        >
                                                            <LiveA4Editor
                                                                content={pageHtml}
                                                                onChange={(newHtml) => {
                                                                    setData('content', newHtml);
                                                                }}
                                                                className={cn("html-preview-container", PROPOSAL_CONTENT_CLASSES)}
                                                            />
                                                        </ProposalPreviewSheet>
                                                    ))
                                                ) : (
                                                    <ProposalPreviewSheet
                                                        key="create-preview-0"
                                                        pageKey="create-preview-0"
                                                        backgroundImage={data.background_image}
                                                        defaultBg={defaultTemplateBg}
                                                        templateColor={templateColor}
                                                        headerLogo={logoUrl}
                                                        headerLogoAlign={headerLogoAlign}
                                                    >
                                                        <LiveA4Editor
                                                            content={processedContent}
                                                            onChange={(newHtml) => {
                                                                setData('content', newHtml);
                                                            }}
                                                            className={cn("html-preview-container", PROPOSAL_CONTENT_CLASSES)}
                                                        />
                                                    </ProposalPreviewSheet>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {errors.content && (
                                        <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                                    )}
                                </div>

                                {/* Save Button Bar */}
                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={processing} className="min-w-28 gap-2">
                                        <Save className="h-4 w-4" />
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
