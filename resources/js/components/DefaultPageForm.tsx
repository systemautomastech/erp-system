import React, { useState, useMemo, useRef, useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { getImagePath } from "@/utils/helpers";
import MediaPicker from "@/components/MediaPicker";
import PreviewModal, {
    ProposalPreviewSheet,
    paginateDomContainer,
    PROPOSAL_CONTENT_CLASSES,
    PRINT_STYLES,
} from "@/components/PreviewModal";
import {
    Save,
    ArrowLeft,
    Eye,
    Image as ImageIcon,
    Settings,
    Info,
    Copy,
    Check,
    Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface VariableGroup {
    title: string;
    items: {
        label: string;
        key: string;
    }[];
}

export interface DefaultPageData {
    id?: number | string;
    title?: string;
    content?: string;
    background_image?: string;
    sort_order?: number;
    is_active?: boolean | number;
    page_type?: string;
}

export interface DefaultPageFormProps {
    mode: "create" | "edit";
    moduleType?: "quotation" | "proposal";
    defaultPage?: DefaultPageData;
    settings?: {
        template_color?: string;
        background_image?: string;
        logo_image?: string;
        company_logo?: string;
        show_logo?: boolean | string | number;
        header_logo_align?: string;
        [key: string]: any;
    } | null;
    nextSortOrder?: number;
    variableGroups: VariableGroup[];
    replaceShortcodes: (
        content: string,
        context: { settings?: any; isDefaultPageSetup?: boolean },
    ) => string;
    storeRoute?: string;
    updateRoute?: string;
    backRoute: string;
    breadcrumbs: { label: string; url?: string }[];
    pageTitle: string;
}

interface LiveA4EditorProps {
    content: string;
    onChange: (value: string) => void;
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
            if (editorRef.current.innerHTML !== (content || "")) {
                editorRef.current.innerHTML = content || "";
            }
        }
    }, [content]);

    const syncChanges = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
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
            className={cn(
                "outline-none w-full cursor-text min-h-[400px]",
                className,
            )}
        />
    );
};

export default function DefaultPageForm({
    mode,
    moduleType = "quotation",
    defaultPage,
    settings,
    nextSortOrder,
    variableGroups,
    replaceShortcodes,
    storeRoute,
    updateRoute,
    backRoute,
    breadcrumbs,
    pageTitle,
}: DefaultPageFormProps) {
    const { t } = useTranslation();

    const templateColor = settings?.template_color || "#E9591C";
    const defaultTemplateBg = settings?.background_image || "";

    const initialContent = defaultPage?.content || "";
    const initialIsRawHtml = /<!doctype|<html|<head|<body|<style|<table[\s>]|<div[\s>]class=|<div[\s>]style=/i.test(
        initialContent,
    );

    const [contentEditorType, setContentEditorType] = useState<"text" | "html">(
        initialIsRawHtml ? "html" : "text",
    );

    const [textContent, setTextContent] = useState<string>(() =>
        initialIsRawHtml ? "" : initialContent,
    );
    const [htmlContent, setHtmlContent] = useState<string>(() =>
        initialIsRawHtml ? initialContent : "",
    );

    const activeContent =
        contentEditorType === "html" ? htmlContent : textContent;

    const [showPreview, setShowPreview] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const hasInitialCustomBg = Boolean(
        defaultPage?.background_image &&
        String(defaultPage.background_image).trim() !== "",
    );
    const [useCustomBg, setUseCustomBg] = useState(hasInitialCustomBg);

    useEffect(() => {
        if (
            defaultPage?.background_image &&
            String(defaultPage.background_image).trim() !== ""
        ) {
            setUseCustomBg(true);
        }
    }, [defaultPage?.background_image]);

    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data, setData, post, put, processing, errors, transform } =
        useForm({
            title:
                defaultPage?.title ||
                (nextSortOrder ? `Page ${nextSortOrder}` : "Page 1"),
            content: defaultPage?.content || "",
            page_type: defaultPage?.page_type || "general",
            background_image: defaultPage?.background_image || "",
            sort_order: defaultPage?.sort_order || nextSortOrder || 1,
            is_active:
                defaultPage?.is_active !== undefined
                    ? Boolean(defaultPage.is_active)
                    : true,
        });

    const isFixedPage =
        defaultPage?.page_type === "otc" || defaultPage?.page_type === "mrc";

    const isLogoEnabled =
        settings?.show_logo !== undefined
            ? settings.show_logo === "1" ||
            settings.show_logo === true ||
            settings.show_logo === 1 ||
            settings.show_logo === "true"
            : true;

    const rawLogo = settings?.logo_image || settings?.company_logo || "";
    const logoUrl = isLogoEnabled && rawLogo ? getImagePath(rawLogo) : "";
    const headerLogoAlign = settings?.header_logo_align || "right";

    const processedContent = useMemo(() => {
        if (!activeContent) {
            return "";
        }

        return replaceShortcodes(activeContent, {
            settings,
            isDefaultPageSetup: true,
        });
    }, [activeContent, settings, replaceShortcodes]);

    const measureContainerRef = useRef<HTMLDivElement>(null);
    const [paginatedPreviewPages, setPaginatedPreviewPages] = useState<string[]>(
        [],
    );

    useEffect(() => {
        if (!processedContent) {
            setPaginatedPreviewPages([]);
            return;
        }

        if (contentEditorType === "html") {
            const hasExplicitBreak =
                /class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(
                    processedContent,
                );

            if (hasExplicitBreak && measureContainerRef.current) {
                const chunks = paginateDomContainer(
                    measureContainerRef.current,
                    980,
                );
                setPaginatedPreviewPages(chunks);
            } else {
                setPaginatedPreviewPages([processedContent]);
            }
            return;
        }

        const runPagination = () => {
            const hasExplicitBreak =
                /class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(
                    processedContent,
                );

            const container = measureContainerRef.current;
            if (!container) {
                setPaginatedPreviewPages([processedContent]);
                return;
            }

            const scrollHeight = container.scrollHeight;
            if (!hasExplicitBreak && scrollHeight <= 980) {
                setPaginatedPreviewPages([processedContent]);
                return;
            }

            const chunks = paginateDomContainer(container, 980);
            setPaginatedPreviewPages(chunks);
        };

        const timer = window.setTimeout(runPagination, 0);
        return () => window.clearTimeout(timer);
    }, [processedContent, contentEditorType]);

    const handleEditorTypeChange = (type: "text" | "html") => {
        setContentEditorType(type);
        setShowPreview(false);

        if (type === "text") {
            setEditorKey((prev) => prev + 1);
        }
    };

    const handlePreview = () => {
        setIsPreviewOpen(true);
    };

    const handleBackToEditor = () => {
        setShowPreview(false);
    };

    const handleCopyVariable = (variableKey: string) => {
        const textToCopy = `{${variableKey}}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedKey(variableKey);
        setTimeout(() => setCopiedKey(null), 1500);

        toast.success(
            t("Variable copied: {{var}}", {
                var: textToCopy,
            }),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((currentData) => ({
            ...currentData,
            content: activeContent || "",
            page_type: currentData.page_type || defaultPage?.page_type || "general",
            background_image: useCustomBg ? (currentData.background_image || "") : "",
        }));

        const submitOptions = {
            onSuccess: () => {
                toast.success(
                    mode === "create"
                        ? t("Default page created successfully.")
                        : t("Default page updated successfully."),
                );
            },
            onError: (errs: any) => {
                if (errs?.sort_order) {
                    toast.error(errs.sort_order);
                } else if (errs?.title) {
                    toast.error(errs.title);
                } else {
                    toast.error(
                        mode === "create"
                            ? t("Failed to create page. Please check errors.")
                            : t("Failed to update page. Please check errors."),
                    );
                }
            },
        };

        if (mode === "create" && storeRoute) {
            post(storeRoute, submitOptions);
        } else if (mode === "edit" && updateRoute) {
            put(updateRoute, submitOptions);
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={breadcrumbs}
            pageTitle={pageTitle}
            pageActions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(backRoute)}
                >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    {t("Back")}
                </Button>
            }
        >
            <Head title={pageTitle} />
            <div
                ref={measureContainerRef}
                style={
                    {
                        position: "fixed",
                        left: "-9999px",
                        top: 0,
                        width: "180mm",
                        visibility: "hidden",
                        pointerEvents: "none",
                        "--template-color": templateColor,
                    } as React.CSSProperties
                }
                className={PROPOSAL_CONTENT_CLASSES}
                dangerouslySetInnerHTML={{
                    __html: processedContent,
                }}
            />

            <div className="grid grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: VARIABLES */}
                <div className="col-span-12 lg:col-span-3 lg:sticky lg:top-4 space-y-4">
                    <Card className="border-border/70 shadow-xs">
                        <CardHeader className="p-3.5 pb-2.5 border-b bg-muted/20">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>{t("Available Variables")}</span>
                                <span className="text-[10px] text-muted-foreground font-normal lowercase">
                                    {t("click to copy")}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1.5">
                            {variableGroups.map((group) => (
                                <div key={group.title} className="space-y-1">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                                        {t(group.title)}
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.items.map(({ label, key }) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between group cursor-pointer hover:bg-muted/70 py-1.5 px-2 rounded-md transition-colors leading-tight text-xs"
                                                onClick={() =>
                                                    handleCopyVariable(key)
                                                }
                                                title={t("Click to copy")}
                                            >
                                                <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[130px]">
                                                    {t(label)}:
                                                </span>
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

                {/* RIGHT COLUMN: FORM & PREVIEW */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <Card className="border-border/70 shadow-xs">
                        <CardContent className="p-5 sm:p-6">
                            <form
                                id={`${mode}-default-page-form`}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="page-title"
                                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        {t("Page Title")}{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="page-title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        placeholder={t(
                                            "e.g. Terms & Conditions",
                                        )}
                                        disabled={isFixedPage}
                                        className={
                                            errors.title
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page-sort-order"
                                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                        >
                                            {t("Sort Order")}{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="page-sort-order"
                                            type="number"
                                            min={1}
                                            value={data.sort_order}
                                            onChange={(e) =>
                                                setData(
                                                    "sort_order",
                                                    parseInt(e.target.value) ||
                                                    1,
                                                )
                                            }
                                            className={
                                                errors.sort_order
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {errors.sort_order && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.sort_order}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between px-3 py-2 rounded-md border border-input bg-muted/20 h-10">
                                        <Label
                                            htmlFor="page-is-active"
                                            className="text-xs font-semibold cursor-pointer select-none"
                                        >
                                            {t("Active")}
                                        </Label>
                                        <Switch
                                            id="page-is-active"
                                            checked={Boolean(data.is_active)}
                                            onCheckedChange={(checked) =>
                                                setData("is_active", checked)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* BACKGROUND SETTINGS */}
                                <div className="border rounded-lg p-3.5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {t("Page Background Image")}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                if (useCustomBg) {
                                                    setUseCustomBg(false);
                                                    setData(
                                                        "background_image",
                                                        "",
                                                    );
                                                } else {
                                                    setUseCustomBg(true);
                                                    setData(
                                                        "background_image",
                                                        "",
                                                    );
                                                }
                                            }}
                                        >
                                            {useCustomBg
                                                ? t("Use Default Background")
                                                : t(
                                                    "Upload Custom Background",
                                                )}
                                        </Button>
                                    </div>

                                    {useCustomBg && (
                                        <div className="pt-2 border-t space-y-2">
                                            <MediaPicker
                                                id="bg-image"
                                                value={data.background_image}
                                                onChange={(url) =>
                                                    setData(
                                                        "background_image",
                                                        typeof url === "string"
                                                            ? url
                                                            : url[0] || "",
                                                    )
                                                }
                                                placeholder={t(
                                                    "Choose background image from library...",
                                                )}
                                                showPreview={true}
                                            />
                                            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                                                <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                                <span>
                                                    {t(
                                                        "Recommended size: A4 210mm × 297mm (JPG, PNG, WebP).",
                                                    )}
                                                </span>
                                            </div>
                                            {errors.background_image && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.background_image}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PAGE CONTENT */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-4">
                                            <Label
                                                htmlFor="page-content"
                                                className="text-sm font-bold text-slate-800 dark:text-slate-200"
                                            >
                                                {t("Page Content")}
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={contentEditorType}
                                                    onValueChange={(
                                                        val: "text" | "html",
                                                    ) =>
                                                        handleEditorTypeChange(
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 w-[130px] text-xs font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="text"
                                                            className="text-xs"
                                                        >
                                                            {t("Text Editor")}
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="html"
                                                            className="text-xs"
                                                        >
                                                            {t("HTML Page")}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center p-0 rounded-md border border-border gap-1">
                                            {!showPreview ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md h-7 px-2.5 text-xs gap-1.5 font-medium transition-all shadow-none hover:bg-secondary/80"
                                                    onClick={handlePreview}
                                                    title={t(
                                                        "View exact A4 HTML and CSS rendering",
                                                    )}
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                                    <span>{t("Preview")}</span>
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md h-7 px-2.5 text-xs gap-1.5 font-semibold transition-all bg-background shadow-xs"
                                                    onClick={handleBackToEditor}
                                                    title={t("Back to editor")}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>{t("Edit")}</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* TEXT EDITOR */}
                                    {!showPreview &&
                                        contentEditorType === "text" && (
                                            <div
                                                style={
                                                    {
                                                        "--template-color":
                                                            templateColor,
                                                    } as React.CSSProperties
                                                }
                                            >
                                                <RichTextEditor
                                                    key={editorKey}
                                                    content={textContent}
                                                    onChange={(content) =>
                                                        setTextContent(content)
                                                    }
                                                    placeholder={t(
                                                        "Enter page content with HTML and variables",
                                                    )}
                                                    className="border rounded-lg bg-white shadow-xs overflow-hidden min-h-[320px]"
                                                />
                                            </div>
                                        )}

                                    {/* HTML PAGE */}
                                    {!showPreview &&
                                        contentEditorType === "html" && (
                                            <div className="border rounded-lg overflow-hidden bg-white border-slate-200 shadow-xs">
                                                <Textarea
                                                    id="page-content-html"
                                                    value={htmlContent}
                                                    onChange={(e) =>
                                                        setHtmlContent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        "Paste or write full HTML and CSS here...",
                                                    )}
                                                    rows={15}
                                                    className="font-mono text-xs leading-relaxed bg-white text-slate-900 border-none focus-visible:ring-0 focus-visible:outline-none min-h-[320px] resize-y p-4 selection:bg-primary/20 rounded-none"
                                                    spellCheck={false}
                                                />
                                            </div>
                                        )}

                                    {/* INLINE PREVIEW */}
                                    {showPreview && (
                                        <div
                                            className="border rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xs"
                                            style={
                                                {
                                                    "--template-color":
                                                        templateColor,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <style
                                                dangerouslySetInnerHTML={{
                                                    __html: PRINT_STYLES,
                                                }}
                                            />
                                            <div className="w-full overflow-x-auto p-4 sm:p-6 flex flex-col items-center gap-8 max-h-[820px] bg-slate-200/70 dark:bg-slate-900/60 shadow-inner">
                                                {paginatedPreviewPages.length >
                                                    0 ? (
                                                    paginatedPreviewPages.map(
                                                        (pageHtml, pIdx) => (
                                                            <ProposalPreviewSheet
                                                                key={`${mode}-preview-${pIdx}`}
                                                                pageKey={`${mode}-preview-${pIdx}`}
                                                                backgroundImage={
                                                                    data.background_image
                                                                }
                                                                defaultBg={
                                                                    defaultTemplateBg
                                                                }
                                                                templateColor={
                                                                    templateColor
                                                                }
                                                                headerLogo={
                                                                    logoUrl
                                                                }
                                                                headerLogoAlign={
                                                                    headerLogoAlign
                                                                }
                                                                customHtml={
                                                                    contentEditorType ===
                                                                    "html"
                                                                }
                                                            >
                                                                <LiveA4Editor
                                                                    content={
                                                                        pageHtml
                                                                    }
                                                                    onChange={(
                                                                        newHtml,
                                                                    ) => {
                                                                        if (
                                                                            contentEditorType ===
                                                                            "html"
                                                                        ) {
                                                                            setHtmlContent(
                                                                                newHtml,
                                                                            );
                                                                        } else {
                                                                            setTextContent(
                                                                                newHtml,
                                                                            );
                                                                        }
                                                                    }}
                                                                    className={
                                                                        contentEditorType ===
                                                                            "html"
                                                                            ? "w-full h-full p-0 m-0 border-0"
                                                                            : cn(
                                                                                "html-preview-container flex-1 flex flex-col",
                                                                                PROPOSAL_CONTENT_CLASSES,
                                                                            )
                                                                    }
                                                                />
                                                            </ProposalPreviewSheet>
                                                        ),
                                                    )
                                                ) : (
                                                    <ProposalPreviewSheet
                                                        pageKey={`${mode}-preview-0`}
                                                        backgroundImage={
                                                            data.background_image
                                                        }
                                                        defaultBg={
                                                            defaultTemplateBg
                                                        }
                                                        templateColor={
                                                            templateColor
                                                        }
                                                        headerLogo={logoUrl}
                                                        headerLogoAlign={
                                                            headerLogoAlign
                                                        }
                                                        customHtml={
                                                            contentEditorType ===
                                                            "html"
                                                        }
                                                    >
                                                        <LiveA4Editor
                                                            content={
                                                                processedContent
                                                            }
                                                            onChange={(
                                                                newHtml,
                                                            ) => {
                                                                if (
                                                                    contentEditorType ===
                                                                    "html"
                                                                ) {
                                                                    setHtmlContent(
                                                                        newHtml,
                                                                    );
                                                                } else {
                                                                    setTextContent(
                                                                        newHtml,
                                                                    );
                                                                }
                                                            }}
                                                            className={
                                                                contentEditorType ===
                                                                    "html"
                                                                    ? "w-full h-full p-0 m-0 border-0"
                                                                    : cn(
                                                                        "html-preview-container flex-1 flex flex-col",
                                                                        PROPOSAL_CONTENT_CLASSES,
                                                                    )
                                                            }
                                                        />
                                                    </ProposalPreviewSheet>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {errors.content && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                {/* SAVE BAR */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="min-w-28 gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing
                                            ? t("Saving...")
                                            : mode === "create"
                                                ? t("Create Page")
                                                : t("Save Changes")}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            <PreviewModal
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                title={data.title || t("Preview")}
                pageTitle={data.title || t("Preview")}
                content={processedContent}
                backgroundImage={data.background_image}
                settings={settings}
                isDefaultPageSetup={true}
                customHtml={contentEditorType === "html"}
                showPrintButton={false}
            />
        </AuthenticatedLayout>
    );
}
