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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuotationDefaultPageItem {
    id: number;
    title: string;
    content: string;
    page_type: string;
    background_image?: string;
    sort_order: number;
    is_active: boolean;
}

interface EditProps {
    settings?: { template_color?: string; background_image?: string; [key: string]: any } | null;
    defaultPage: QuotationDefaultPageItem;
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

export default function Edit({ settings, defaultPage }: EditProps) {
    const { t } = useTranslation();
    const templateColor = settings?.template_color || '#E9591C';
    const defaultTemplateBg = settings?.background_image || '';

    const [editorMode, setEditorMode] = useState<'rich' | 'code' | 'preview'>('rich');
    const [editorKey, setEditorKey] = useState(0);
    const hasInitialCustomBg = Boolean(defaultPage?.background_image && String(defaultPage.background_image).trim() !== '');
    const [bgType, setBgType] = useState<'default' | 'custom'>(hasInitialCustomBg ? 'custom' : 'default');

    useEffect(() => {
        if (defaultPage?.background_image && String(defaultPage.background_image).trim() !== '') {
            setBgType('custom');
        }
    }, [defaultPage?.background_image]);

    const { data, setData, put, processing, errors } = useForm({
        title: defaultPage.title || '',
        content: defaultPage.content || '',
        page_type: defaultPage.page_type || 'general',
        background_image: defaultPage.background_image || '',
        sort_order: defaultPage.sort_order || 1,
        is_active: Boolean(defaultPage.is_active),
    });

    const isFixedPage = defaultPage.page_type === 'otc' || defaultPage.page_type === 'mrc';

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

    // Detect if content has raw/custom HTML code
    const hasRawHtml = useMemo(() => {
        if (!data.content) return false;
        return /<(?:div|style|section|article|main|iframe|script|table|thead|tbody|tfoot|tr|th|td)\b|style=["'][^"']*["']/i.test(data.content);
    }, [data.content]);

    useEffect(() => {
        if (hasRawHtml && editorMode === 'rich') {
            setEditorMode('code');
        }
    }, [hasRawHtml, editorMode]);

    useEffect(() => {
        if (!processedContent) {
            setPaginatedPreviewPages([]);
            return;
        }

        const runPagination = () => {
            const hasExplicitBreak = /class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(processedContent);

            if (measureContainerRef.current) {
                const scrollH = measureContainerRef.current.scrollHeight;
                if (!hasExplicitBreak && scrollH <= 880) {
                    setPaginatedPreviewPages([processedContent]);
                } else {
                    const chunks = paginateDomContainer(measureContainerRef.current, 880);
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
        if (mode === 'rich' && hasRawHtml) {
            toast.error(t('Text Editor is disabled because this page contains custom HTML & CSS code. Please use HTML Code or Preview editor.'));
            return;
        }
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
        put(route('quotation-setup.default-pages.update', defaultPage.id), {
            onSuccess: () => {
                toast.success(t('Default page updated successfully.'));
            },
            onError: (errs) => {
                if (errs.sort_order) {
                    toast.error(errs.sort_order);
                } else {
                    toast.error(t('Failed to update page. Please check errors.'));
                }
            },
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Quotation'), url: route('quotations.index') },
                { label: t('Quotation Setup'), url: route('quotation-setup.index') },
                { label: t('Edit Default Page') },
            ]}
            pageTitle={`${t('Edit Default Page')} : ${data.title || defaultPage.title}`}
            pageActions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route('quotation-setup.index'))}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('Back')}
                </Button>
            }
        >
            <Head title={`${t('Edit Default Page')} : ${data.title || defaultPage.title}`} />

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
                {/* Left Column: Grouped Variables Section or Fixed Page Info Card */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    {isFixedPage ? (
                        <Card className="border-amber-500/30 bg-amber-500/[0.03]">
                            <CardHeader className="p-3 pb-2 border-b border-amber-500/20">
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                    <Info className="h-4 w-4 text-amber-600" />
                                    {t('System Fixed Page')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <p>
                                    {defaultPage.page_type === 'otc'
                                        ? t('This is the One-Time Charges (OTC) system section. When one-time products/services are added to a quotation, this section is automatically generated with its pricing table.')
                                        : t('This is the Monthly Recurring Charges (MRC) system section. When recurring products/services are added to a quotation, this section is automatically generated with its pricing table.')
                                    }
                                </p>
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] font-medium">
                                    {t('You can configure its default sort order below so it automatically appears in your desired position when creating quotations.')}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="p-3 pb-2 border-b">
                                <CardTitle className="text-sm font-semibold">{t('Variables')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-4">
                                {defaultQuotationVariableGroups.map((group) => (
                                    <div key={group.title} className="space-y-1.5">
                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                                            {t(group.title)}
                                        </div>
                                        <div className="space-y-0.5">
                                            {group.items.map(({ label, key }) => (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between group cursor-pointer hover:bg-muted/70 py-1 px-1.5 rounded transition-colors leading-tight text-xs"
                                                    onClick={() => handleCopyVariable(key)}
                                                    title={t('Click to copy')}
                                                >
                                                    <span className="text-slate-600 dark:text-slate-400">{t(label)}:</span>
                                                    <span className="text-primary font-mono font-medium group-hover:underline">
                                                        {`{${key}}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Form */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <Card>
                        <CardContent className="space-y-6 p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="page-title" className="text-sm font-medium">{t('Page Title')}</Label>
                                    <Input
                                        id="page-title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('Enter page title')}
                                        disabled={isFixedPage}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                    {isFixedPage && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('The title for fixed system sections is predefined.')}
                                        </p>
                                    )}
                                </div>

                                {!isFixedPage && (
                                    <>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium flex items-center gap-1.5">
                                                <ImageIcon className="h-4 w-4 text-primary" />
                                                {t('Page Background')}
                                            </Label>

                                            <RadioGroup
                                                value={bgType}
                                                onValueChange={(val: 'default' | 'custom') => {
                                                    setBgType(val);
                                                    if (val === 'default') {
                                                        setData('background_image', '');
                                                    }
                                                }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                            >
                                                <label
                                                    htmlFor="bg-type-default"
                                                    className={cn(
                                                        "relative flex items-center justify-between gap-3 p-3.5 rounded-md border transition-all cursor-pointer select-none",
                                                        bgType === 'default'
                                                            ? "border-primary bg-primary/[0.03] ring-1 ring-primary/30 shadow-2xs"
                                                            : "border-border hover:border-border/80 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <RadioGroupItem value="default" id="bg-type-default" className="shrink-0" />
                                                        <div className="text-sm font-medium text-foreground truncate">
                                                            {t('Default Background Image')}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={route('quotation-setup.index')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                                                        title={t('Change default background image in settings')}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </a>
                                                </label>

                                                <label
                                                    htmlFor="bg-type-custom"
                                                    className={cn(
                                                        "relative flex items-center gap-3 px-3 py-2 rounded-md border transition-all cursor-pointer select-none",
                                                        bgType === 'custom'
                                                            ? "border-primary bg-primary/[0.03] ring-1 ring-primary/30 shadow-2xs"
                                                            : "border-border hover:border-border/80 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <RadioGroupItem value="custom" id="bg-type-custom" className="shrink-0" />
                                                    <div className="text-sm font-medium text-foreground truncate">
                                                        {t('Custom Background Image')}
                                                    </div>
                                                </label>
                                            </RadioGroup>

                                            {bgType === 'custom' && (
                                                <div className="px-3 py-2 rounded-xl border border-dashed border-primary/40 bg-card space-y-2 animate-in fade-in-50 duration-200">
                                                    <MediaPicker
                                                        id="bg-image"
                                                        value={data.background_image}
                                                        onChange={(url) => setData('background_image', typeof url === 'string' ? url : (url[0] || ''))}
                                                        placeholder={t('Choose background image from library...')}
                                                        showPreview={true}
                                                    />
                                                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                                                        <Info className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                                        <span>{t('Up to 2MB (JPG, PNG, WebP). Recommended A4 size: 210mm × 297mm.')}</span>
                                                    </div>
                                                    {errors.background_image && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.background_image}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Label htmlFor="page-content" className="text-sm font-medium">{t('Page Content')}</Label>

                                                <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border gap-1">
                                                    <Button
                                                        type="button"
                                                        variant={editorMode === 'rich' ? 'secondary' : 'ghost'}
                                                        size="sm"
                                                        disabled={hasRawHtml}
                                                        className={cn(
                                                            "h-7 px-2.5 text-xs gap-1.5 font-medium transition-all shadow-none",
                                                            editorMode === 'rich' && "bg-background shadow-xs text-foreground font-semibold",
                                                            hasRawHtml && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        onClick={() => handleSwitchMode('rich')}
                                                        title={hasRawHtml ? t('Text Editor disabled for raw HTML') : t('Use WYSIWYG text toolbar')}
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

                                            {editorMode === 'code' && (
                                                <div className="space-y-1.5">
                                                    <div className="border rounded-lg overflow-hidden bg-white border-slate-200 shadow-xs">
                                                        <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
                                                            <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-semibold">
                                                                <Code className="h-3.5 w-3.5 text-amber-500" />
                                                                {t('HTML Code')}
                                                            </span>
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
                                                </div>
                                            )}

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
                                                </div>
                                            )}

                                            {editorMode === 'preview' && (
                                                <div
                                                    className="border rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xs"
                                                    style={{ '--template-color': templateColor } as React.CSSProperties}
                                                >
                                                    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                                                            <PenTool className="h-3.5 w-3.5 text-primary shrink-0" />
                                                            <span>{t('Live Visual Editor: Click anywhere on the text below to edit it directly. Changes sync automatically with HTML Code.')}</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSwitchMode('code')}
                                                            className="h-6 text-[11px] gap-1 px-2 text-primary hover:text-primary hover:bg-primary/15"
                                                        >
                                                            <Code className="h-3 w-3" />
                                                            {t('View HTML Code')}
                                                        </Button>
                                                    </div>
                                                    <div className="p-4 sm:p-8 flex flex-col items-center gap-8 overflow-y-auto max-h-[820px] bg-slate-200/70 dark:bg-slate-900/60 shadow-inner">
                                                        {paginatedPreviewPages.length > 0 ? (
                                                            paginatedPreviewPages.map((pageHtml, pageIdx) => (
                                                                <ProposalPreviewSheet
                                                                    key={pageIdx}
                                                                    pageKey={`edit-preview-${pageIdx}`}
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
                                                                key="edit-preview-0"
                                                                pageKey="edit-preview-0"
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
                                                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                                            )}
                                        </div>
                                    </>
                                )}

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
                                                disabled={isFixedPage}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                                className={isFixedPage ? "opacity-50 cursor-not-allowed" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={processing} className="min-w-24">
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? t('Saving...') : t('Save Changes')}
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
