import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    FileText,
    Plus,
    Trash2,
    Pencil,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Layers,
    Sparkles,
    BookOpen,
    Code,
    PenTool,
    Eye,
    X,
} from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import MediaPicker from '@/components/MediaPicker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getImagePath } from '@/utils/helpers';
import { replaceProposalShortcodes } from '@/utils/proposalShortcodes';

export interface ProposalSectionItem {
    id: string;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    order: number;
}

interface ProposalDefaultPage {
    id: number;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    sort_order?: number;
}

interface Props {
    sections: ProposalSectionItem[];
    setSections: React.Dispatch<React.SetStateAction<ProposalSectionItem[]>>;
    defaultPages?: ProposalDefaultPage[];
    proposalSetting?: any;
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
 * Paginates rendered DOM nodes from measuring container into A4 page chunks (~900px budget per page)
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

export default function PageOrderSection({ sections, setSections, defaultPages = [], proposalSetting: propSetting }: Props) {
    const { t } = useTranslation();
    const pageProps = usePage<any>().props;
    const settings = propSetting || pageProps.proposalSetting || {};

    const templateColor = settings?.template_color || '#E9591C';
    const defaultTemplateBg = settings?.background_image || '';

    const isLogoEnabled = settings?.show_logo !== undefined
        ? (settings.show_logo === '1' || settings.show_logo === true || settings.show_logo === 1 || settings.show_logo === 'true')
        : true;
    const rawLogo = settings?.logo_image || settings?.company_logo || '';
    const logoUrl = (isLogoEnabled && rawLogo) ? getImagePath(rawLogo) : '';

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');

    // Page Form state
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [modalBackground, setModalBackground] = useState('');
    const [modalPageType, setModalPageType] = useState('general');
    const [selectedDefaultPage, setSelectedDefaultPage] = useState<ProposalDefaultPage | null>(null);
    const [editingSection, setEditingSection] = useState<ProposalSectionItem | null>(null);

    // Editor mode ('rich' | 'code' | 'preview')
    const [editorMode, setEditorMode] = useState<'rich' | 'code' | 'preview'>('rich');
    const [editorKey, setEditorKey] = useState(0);

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Live pagination
    const measureContainerRef = useRef<HTMLDivElement>(null);
    const [paginatedPreviewPages, setPaginatedPreviewPages] = useState<string[]>([]);

    const bgUrl = modalBackground
        ? getImagePath(modalBackground)
        : (defaultTemplateBg ? getImagePath(defaultTemplateBg) : '');

    const processedContent = useMemo(() => {
        if (!modalContent) return '';
        return replaceProposalShortcodes(modalContent, { settings, pageProps });
    }, [modalContent, settings, pageProps]);

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

        runPagination();
        const animId = requestAnimationFrame(runPagination);
        return () => cancelAnimationFrame(animId);
    }, [processedContent, editorMode, isModalOpen]);

    const handleSwitchMode = (mode: 'rich' | 'code' | 'preview') => {
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

    // Open Add Modal
    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditorMode('rich');
        if (defaultPages && defaultPages.length > 0) {
            setAddTab('existing');
            const firstNonFront = defaultPages.find(p => p.page_type !== 'front-page') || defaultPages[0];
            setSelectedDefaultPage(firstNonFront);
            setModalTitle(firstNonFront.title || '');
            setModalContent(firstNonFront.content || '');
            setModalBackground(firstNonFront.background_image || '');
            setModalPageType(firstNonFront.page_type || 'general');
        } else {
            setAddTab('new');
            setSelectedDefaultPage(null);
            setModalTitle('');
            setModalContent('');
            setModalBackground('');
            setModalPageType('general');
        }
        setIsModalOpen(true);
    };

    // Select existing default page in Add Modal
    const handleSelectDefaultPage = (page: ProposalDefaultPage) => {
        setSelectedDefaultPage(page);
        setModalTitle(page.title);
        setModalContent(page.content || '');
        setModalBackground(page.background_image || '');
        setModalPageType(page.page_type || 'general');
    };

    // Open Edit Modal / Jump to section for OTC/MRC/Other Details
    const handleOpenEditModal = (sec: ProposalSectionItem) => {
        if (sec.page_type === 'otc' || sec.page_type === 'mrc' || sec.page_type === 'other-details') {
            const targetId = sec.page_type === 'otc' ? 'otc-section' : (sec.page_type === 'mrc' ? 'mrc-section' : 'other-details-section');
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-primary', 'transition-all');
                setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 2000);
            }
            return;
        }

        setModalMode('edit');
        setEditingSection(sec);
        setModalTitle(sec.title);
        setModalContent(sec.content || '');
        setModalBackground(sec.background_image || '');
        setModalPageType(sec.page_type || 'general');
        setEditorMode('rich');
        setIsModalOpen(true);
    };

    // Save/Confirm Page in Modal
    const handleSaveModal = () => {
        if (!modalTitle.trim()) {
            toast.error(t('Please enter a page title.'));
            return;
        }

        if (modalMode === 'add') {
            const isFront = modalPageType === 'front-page' || modalTitle.toLowerCase().includes('front page');
            const newSection: ProposalSectionItem = {
                id: `sec-${Date.now()}`,
                title: modalTitle.trim(),
                content: modalContent,
                page_type: isFront ? 'front-page' : modalPageType,
                background_image: modalBackground,
                order: sections.length + 1,
            };

            setSections((prev) => [...prev, newSection]);
            toast.success(t('Page added to proposal order.'));
        } else if (modalMode === 'edit' && editingSection) {
            setSections((prev) =>
                prev.map((s) =>
                    s.id === editingSection.id
                        ? {
                            ...s,
                            title: modalTitle.trim(),
                            content: modalContent,
                            background_image: modalBackground,
                        }
                        : s
                )
            );
            toast.success(t('Page updated successfully.'));
        }

        setIsModalOpen(false);
        setEditingSection(null);
    };

    // Delete section
    const handleRemoveSection = (id: string, pageType?: string) => {
        if (pageType === 'otc' || pageType === 'mrc' || pageType === 'other-details') {
            toast.error(t('Clear content from this section editor to remove this card.'));
            return;
        }

        setSections((prev) => {
            const filtered = prev.filter((s) => s.id !== id);
            return filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
        });
        toast.success(t('Page removed.'));
    };

    // Move Up / Down
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        const updated = [...sections];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
        const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
        setSections(reordered);
    };

    // Drag handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updated = [...sections];
        const [dragged] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, dragged);
        const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
        setDraggedIndex(targetIndex);
        setSections(reordered);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <Card className="shadow-sm border">
            {/* Hidden measuring container in exact A4 styling to measure real browser heights */}
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

            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Layers className="h-5 w-5 text-primary" />
                            {t('Page Order')}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('Organize, add, edit, or reorder proposal pages.')}
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={handleOpenAddModal}
                        variant="default"
                        size="sm"
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('Add Page')}
                    </Button>
                </div>

                {/* Compact Cards Grid / Reorder List */}
                {sections.length === 0 ? (
                    <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/10 space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/60" />
                        <p className="text-sm font-medium">{t('No pages in order yet.')}</p>
                        <p className="text-xs text-muted-foreground">
                            {t('Click "+ Add Page" to add existing templates or custom pages.')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {sections.map((sec, index) => {
                            const isFront = sec.page_type === 'front-page' || sec.title.toLowerCase().includes('front page');
                            return (
                                <div
                                    key={sec.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "group relative bg-card border rounded-xl p-3 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all select-none",
                                        draggedIndex === index ? "opacity-40 border-dashed border-primary ring-2 ring-primary/20" : "hover:border-primary/50",
                                        isFront && "bg-primary/5 border-primary/30"
                                    )}
                                >
                                    {/* Top Card Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                                title={t('Drag to reorder')}
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold bg-muted/50 shrink-0">
                                                #{index + 1}
                                            </Badge>
                                            <h4 className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200" title={sec.title}>
                                                {sec.title}
                                            </h4>
                                        </div>

                                        {isFront && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 shrink-0">
                                                {t('Cover')}
                                            </Badge>
                                        )}
                                        {sec.page_type === 'otc' && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-600 border-purple-200 shrink-0">
                                                {t('OTC')}
                                            </Badge>
                                        )}
                                        {sec.page_type === 'mrc' && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-200 shrink-0">
                                                {t('MRC')}
                                            </Badge>
                                        )}
                                        {sec.page_type === 'other-details' && (
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-200 shrink-0">
                                                {t('Other')}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {/* Up/Down buttons */}
                                        <div className="flex items-center gap-0.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                title={t('Move Up')}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === sections.length - 1}
                                                title={t('Move Down')}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Action Icons: Edit, Delete */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleOpenEditModal(sec)}
                                                title={t('Edit Page / Jump to Section')}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            {!isFront && sec.page_type !== 'otc' && sec.page_type !== 'mrc' && sec.page_type !== 'other-details' && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    onClick={() => handleRemoveSection(sec.id, sec.page_type)}
                                                    title={t('Remove Page')}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FULL-FEATURED PAGE CREATION & EDIT MODAL (Identical to Default Pages Create View) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
                    {/* Modal Header */}
                    <DialogHeader className="p-4 sm:px-6 border-b bg-background flex flex-row items-center justify-between space-y-0 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {modalMode === 'add' ? <BookOpen className="h-5 w-5" /> : <Pencil className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold">
                                    {modalMode === 'add' ? t('Add Page to Proposal') : t('Edit Proposal Page')}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    {modalMode === 'add'
                                        ? t('Create a custom proposal page or load from existing default pages.')
                                        : t('Customize title, background, and content for this page.')}
                                </p>
                            </div>
                        </div>

                        {modalMode === 'add' && defaultPages.length > 0 && (
                            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddTab('existing');
                                        if (defaultPages.length > 0) {
                                            const first = defaultPages.find(p => p.page_type !== 'front-page') || defaultPages[0];
                                            handleSelectDefaultPage(first);
                                        }
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                                        addTab === 'existing'
                                            ? "bg-background text-primary shadow-xs font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Layers className="h-3.5 w-3.5" />
                                    {t('Choose from Default Pages')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddTab('new');
                                        setSelectedDefaultPage(null);
                                        setModalTitle('');
                                        setModalContent('');
                                        setModalBackground('');
                                        setModalPageType('general');
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                                        addTab === 'new'
                                            ? "bg-background text-primary shadow-xs font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {t('New Custom Page')}
                                </button>
                            </div>
                        )}
                    </DialogHeader>

                    {/* Modal Body - 2 Column Layout */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column: Existing Templates list (if add) & Variables */}
                            <div className="col-span-12 lg:col-span-3 space-y-4">
                                {modalMode === 'add' && addTab === 'existing' && defaultPages.length > 0 && (
                                    <Card className="shadow-xs border">
                                        <CardHeader className="p-3 pb-2 border-b">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Layers className="h-3.5 w-3.5 text-primary" />
                                                {t('Existing Pages')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-2 space-y-1 max-h-[220px] overflow-y-auto">
                                            {defaultPages.map((page) => {
                                                const isSelected = selectedDefaultPage?.id === page.id;
                                                const isAlreadyAdded = sections.some(s => s.title.toLowerCase() === page.title.toLowerCase());

                                                return (
                                                    <button
                                                        key={page.id}
                                                        type="button"
                                                        onClick={() => handleSelectDefaultPage(page)}
                                                        className={cn(
                                                            "w-full text-left p-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between gap-1.5",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                                                                : "bg-card hover:bg-accent border-border"
                                                        )}
                                                    >
                                                        <span className="truncate">{page.title}</span>
                                                        {isAlreadyAdded && (
                                                            <Badge
                                                                variant="secondary"
                                                                className={cn(
                                                                    "text-[9px] px-1 py-0 h-4 shrink-0",
                                                                    isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-green-100 text-green-700"
                                                                )}
                                                            >
                                                                {t('Added')}
                                                            </Badge>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Variables Card */}
                                <Card className="shadow-xs border">
                                    <CardHeader className="p-3 pb-1.5">
                                        <CardTitle className="text-base font-semibold">{t('Variables')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="grid grid-cols-1 gap-1 text-xs">
                                            {Object.entries(defaultProposalVariables).map(([key, value]) => (
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

                            {/* Right Column: Page Form & Multi-tab Editor */}
                            <div className="col-span-12 lg:col-span-9 space-y-4">
                                <Card className="shadow-xs border">
                                    <CardContent className="p-4 sm:p-6 space-y-4">
                                        {/* Page Title */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="modal-page-title" className="text-sm font-medium">{t('Page Title')}</Label>
                                            <Input
                                                id="modal-page-title"
                                                value={modalTitle}
                                                onChange={(e) => setModalTitle(e.target.value)}
                                                placeholder={t('Enter page title')}
                                                disabled={editingSection?.page_type === 'front-page'}
                                                required
                                            />
                                        </div>

                                        {/* Background Image Picker */}
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium">{t('Background Image')}</Label>
                                            <MediaPicker
                                                value={modalBackground}
                                                onChange={(val) => setModalBackground(Array.isArray(val) ? val[0] : val)}
                                                placeholder={t('Select Custom Background')}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t('Optional custom background for this page. Overrides the template background image.')}
                                            </p>
                                        </div>

                                        {/* Page Content Editor */}
                                        <div className="space-y-2 pt-2 border-t">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Label htmlFor="modal-content" className="text-sm font-medium">{t('Page Content')}</Label>

                                                {/* Mode Tabs (Order: Text Editor, HTML Code, Preview) */}
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

                                            {/* 1. HTML Code Mode */}
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
                                                            id="modal-content-html"
                                                            value={modalContent}
                                                            onChange={(e) => setModalContent(e.target.value)}
                                                            placeholder={t('Paste or write full HTML & CSS body content here (e.g. <div style="...">...</div>)')}
                                                            rows={14}
                                                            className="font-mono text-xs leading-relaxed bg-white text-slate-900 border-none focus-visible:ring-0 focus-visible:outline-none min-h-[280px] resize-y p-4 selection:bg-primary/20 rounded-none"
                                                            spellCheck={false}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground flex items-center justify-between px-1">
                                                        <span>{t('Paste your HTML body content above. It will be dynamically framed in an A4 (210mm × 297mm) sheet.')}</span>
                                                        <span className="font-mono text-[10px]">{t('{{count}} chars', { count: modalContent.length })}</span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* 2. Rich Text WYSIWYG Mode */}
                                            {editorMode === 'rich' && (
                                                <div
                                                    className="space-y-1"
                                                    style={{ '--template-color': templateColor } as React.CSSProperties}
                                                >
                                                    <RichTextEditor
                                                        key={editorKey}
                                                        content={modalContent}
                                                        onChange={(content) => setModalContent(content)}
                                                        placeholder={t('Enter page content with HTML and variables')}
                                                        className="border rounded-lg bg-white shadow-xs overflow-hidden"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground px-1">
                                                        {t('WYSIWYG editor for formatted text, headings, and tables.')}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 3. Exact A4 HTML & CSS Live Preview */}
                                            {editorMode === 'preview' && (
                                                <div
                                                    className="border rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-xs"
                                                    style={{ '--template-color': templateColor } as React.CSSProperties}
                                                >
                                                    <div className="p-4 sm:p-6 flex flex-col items-center gap-6 overflow-y-auto max-h-[600px] bg-slate-200/70 dark:bg-slate-900/60 rounded-lg shadow-inner">
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

                                                                    {/* A4 Body Padding */}
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
                                                                            className={PROPOSAL_CONTENT_CLASSES}
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
                                                                        <p className="text-slate-400">{t('No content entered yet.')}</p>
                                                                        <p className="text-xs text-slate-400">{t('Switch to "HTML Code" or "Text Editor" to add page body content.')}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <DialogFooter className="p-4 sm:px-6 border-t bg-background flex flex-row items-center justify-end gap-2 shrink-0">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={handleSaveModal} className="gap-1.5">
                            {modalMode === 'add' ? (
                                <>
                                    <Plus className="h-4 w-4" />
                                    {t('Add to Proposal')}
                                </>
                            ) : (
                                <>
                                    <Pencil className="h-4 w-4" />
                                    {t('Save Changes')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
