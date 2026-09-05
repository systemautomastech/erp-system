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
import RichTextEditor from '@/components/ui/rich-text-editor';
import MediaPicker from '@/components/MediaPicker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    Settings,
    Info,
    Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getImagePath } from '@/utils/helpers';
import { replaceProposalShortcodes } from '@/pages/SalesProposals/utils/proposalShortcodes';
import {
    ProposalPreviewSheet,
    paginateDomContainer,
    PROPOSAL_CONTENT_CLASSES,
} from '@/components/PreviewModal';

export interface ProposalSectionItem {
    id: string;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    order: number;
    default_page_id?: number;
}

interface ProposalDefaultPage {
    id: number;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    sort_order?: number;
    creator_id?: number;
    created_by?: number;
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
    'User Name': 'user_name',
    'User Email': 'user_email',
    'User Phone': 'user_phone',
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

export default function PageOrder({ sections, setSections, defaultPages = [], proposalSetting: propSetting }: Props) {
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
    const headerLogoAlign = settings?.header_logo_align || 'right';

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
    const [modalBgType, setModalBgType] = useState<'default' | 'custom'>('default');

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

    // Detect if modal content has raw/custom HTML code
    const hasRawHtml = useMemo(() => {
        if (!modalContent) return false;
        return /<(?:div|style|section|article|main|iframe|script|table|thead|tbody|tfoot|tr|th|td)\b|style=["'][^"']*["']/i.test(modalContent);
    }, [modalContent]);

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
    }, [processedContent, editorMode, isModalOpen]);

    const handleSwitchMode = (mode: 'rich' | 'code' | 'preview') => {
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

    // Open Add Modal
    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditorMode('rich');
        const customDefaultPages = defaultPages.filter((p) => p.page_type !== 'otc' && p.page_type !== 'mrc');
        if (customDefaultPages && customDefaultPages.length > 0) {
            setAddTab('existing');
            const firstPage = customDefaultPages[0];
            setSelectedDefaultPage(firstPage);
            setModalTitle(firstPage.title || '');
            setModalContent(firstPage.content || '');
            setModalBackground(firstPage.background_image || '');
            setModalBgType(Boolean(firstPage.background_image && String(firstPage.background_image).trim() !== '') ? 'custom' : 'default');
            setModalPageType(firstPage.page_type || 'content');
        } else {
            setAddTab('new');
            setSelectedDefaultPage(null);
            setModalTitle('');
            setModalContent('');
            setModalBackground('');
            setModalBgType('default');
            setModalPageType('content');
        }
        setIsModalOpen(true);
    };

    // Select existing default page in Add Modal
    const handleSelectDefaultPage = (page: ProposalDefaultPage) => {
        setSelectedDefaultPage(page);
        setModalTitle(page.title);
        setModalContent(page.content || '');
        setModalBackground(page.background_image || '');
        setModalBgType(Boolean(page.background_image && String(page.background_image).trim() !== '') ? 'custom' : 'default');
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
        setModalBgType(Boolean(sec.background_image && String(sec.background_image).trim() !== '') ? 'custom' : 'default');
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
            const newSection: ProposalSectionItem = {
                id: `sec-${Date.now()}`,
                default_page_id: addTab === 'existing' && selectedDefaultPage ? selectedDefaultPage.id : undefined,
                title: modalTitle.trim(),
                content: modalContent,
                page_type: modalPageType || 'general',
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

    // Delete section / Jump to section if dynamic
    const handleRemoveSection = (sec: ProposalSectionItem) => {
        if (sec.page_type === 'otc' || sec.page_type === 'mrc' || sec.page_type === 'other-details') {
            const targetId = sec.page_type === 'otc' ? 'otc-section' : (sec.page_type === 'mrc' ? 'mrc-section' : 'other-details-section');
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-rose-500/50', 'transition-all');
                setTimeout(() => el.classList.remove('ring-4', 'ring-rose-500/50'), 2500);
            }
            const sectionName = sec.title || (sec.page_type === 'otc' ? 'One-Time Charges (OTC)' : (sec.page_type === 'mrc' ? 'Monthly Recurring Charges (MRC)' : 'Other Details'));
            toast.info(t('To remove {{section}}, please delete all items or clear content from that section above.', { section: sectionName }));
            return;
        }

        setSections((prev) => {
            const filtered = prev.filter((s) => s.id !== sec.id);
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
                            const isDynamicSection = sec.page_type === 'otc' || sec.page_type === 'mrc' || sec.page_type === 'other-details';
                            return (
                                <div
                                    key={sec.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "group relative bg-card border rounded-xl p-3 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all select-none",
                                        draggedIndex === index ? "opacity-40 border-dashed border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
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
                                                title={isDynamicSection ? t('Jump to Section') : t('Edit Page')}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleRemoveSection(sec)}
                                                title={isDynamicSection ? t('Go to Section to Remove') : t('Remove Page')}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
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
                <DialogContent className="max-w-6xl max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl [&>button]:top-4.5 [&>button]:right-4.5">
                    {/* Modal Header */}
                    <DialogHeader className="p-4 sm:pl-6 sm:pr-14 border-b bg-background flex flex-row items-center justify-between space-y-0 shrink-0 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                {modalMode === 'add' ? <BookOpen className="h-5 w-5" /> : <Pencil className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-base font-semibold truncate">
                                    {modalMode === 'add' ? t('Add Page to Proposal') : t('Edit Proposal Page')}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground truncate">
                                    {modalMode === 'add'
                                        ? t('Create a custom proposal page or load from existing default pages.')
                                        : t('Customize title, background, and content for this page.')}
                                </p>
                            </div>
                        </div>

                        {modalMode === 'add' && defaultPages.filter((p) => p.page_type !== 'otc' && p.page_type !== 'mrc').length > 0 && (
                            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddTab('existing');
                                        const customDefaultPages = defaultPages.filter((p) => p.page_type !== 'otc' && p.page_type !== 'mrc');
                                        if (customDefaultPages.length > 0) {
                                            const first = customDefaultPages[0];
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
                                {modalMode === 'add' && addTab === 'existing' && defaultPages.filter((p) => p.page_type !== 'otc' && p.page_type !== 'mrc').length > 0 && (
                                    <Card className="shadow-xs border">
                                        <CardHeader className="p-3 pb-2 border-b">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Layers className="h-3.5 w-3.5 text-primary" />
                                                {t('Existing Pages')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-2 space-y-1 max-h-[220px] overflow-y-auto">
                                            {defaultPages.filter((p) => p.page_type !== 'otc' && p.page_type !== 'mrc').map((page) => {
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
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <span className="truncate">{page.title}</span>
                                                            {page.created_by !== undefined && page.creator_id !== undefined && page.created_by === page.creator_id && (
                                                                <span className={cn(
                                                                    "text-[8px] font-semibold uppercase px-1 py-0.2 rounded border shrink-0",
                                                                    isSelected ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                                )}>
                                                                    {t('Company')}
                                                                </span>
                                                            )}
                                                        </div>
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
                                                required
                                            />
                                        </div>

                                        {/* Background Image Selection */}
                                        <div className="space-y-2.5">
                                            <Label className="text-sm font-medium flex items-center gap-1.5">
                                                <ImageIcon className="h-4 w-4 text-primary" />
                                                {t('Page Background')}
                                            </Label>

                                            <RadioGroup
                                                value={modalBgType}
                                                onValueChange={(val: 'default' | 'custom') => {
                                                    setModalBgType(val);
                                                    if (val === 'default') {
                                                        setModalBackground('');
                                                    }
                                                }}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                                            >
                                                {/* Option 1: Default Background (Left) */}
                                                <label
                                                    htmlFor="modal-bg-type-default"
                                                    className={cn(
                                                        "relative flex items-center justify-between gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                                        modalBgType === 'default'
                                                            ? "border-primary bg-primary/[0.03] ring-1 ring-primary/30 shadow-2xs"
                                                            : "border-border hover:border-border/80 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <RadioGroupItem value="default" id="modal-bg-type-default" className="shrink-0" />
                                                        <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                                                            {t('Default Background')}
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={route('proposal-setup.index')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                                                        title={t('Change default background image in settings')}
                                                    >
                                                        <Settings className="h-3.5 w-3.5" />
                                                    </a>
                                                </label>

                                                {/* Option 2: Custom Background (Right) */}
                                                <label
                                                    htmlFor="modal-bg-type-custom"
                                                    className={cn(
                                                        "relative flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                                        modalBgType === 'custom'
                                                            ? "border-primary bg-primary/[0.03] ring-1 ring-primary/30 shadow-2xs"
                                                            : "border-border hover:border-border/80 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <RadioGroupItem value="custom" id="modal-bg-type-custom" className="shrink-0" />
                                                    <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                                                        {t('Custom Background')}
                                                    </div>
                                                </label>
                                            </RadioGroup>

                                            {/* Upload Drawer when Custom is Selected */}
                                            {modalBgType === 'custom' && (
                                                <div className="p-3 rounded-xl border border-dashed border-primary/40 bg-card space-y-2 animate-in fade-in-50 duration-200">
                                                    <MediaPicker
                                                        value={modalBackground}
                                                        onChange={(val) => setModalBackground(Array.isArray(val) ? val[0] : val)}
                                                        placeholder={t('Select Custom Background')}
                                                        showPreview={true}
                                                    />
                                                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                                                        <Info className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                                        <span>{t('Up to 2MB (JPG, PNG, WebP). Recommended A4 size: 210mm × 297mm.')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Page Content Editor */}
                                        <div className="space-y-2 pt-2 border-t">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Label htmlFor="modal-content" className="text-sm font-medium">{t('Page Content')}</Label>

                                                {/* Mode Tabs (Order: Text Editor, HTML Code, Preview) */}
                                                <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border gap-1">
                                                    {/* 1. Text Editor */}
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
                                                                <ProposalPreviewSheet
                                                                    key={pageIdx}
                                                                    pageKey={`page-order-preview-${pageIdx}`}
                                                                    backgroundImage={modalBackground}
                                                                    defaultBg={defaultTemplateBg}
                                                                    templateColor={templateColor}
                                                                    headerLogo={logoUrl}
                                                                    headerLogoAlign={headerLogoAlign}
                                                                    content={pageHtml}
                                                                />
                                                            ))
                                                        ) : (
                                                            <ProposalPreviewSheet
                                                                key="page-order-preview-0"
                                                                pageKey="page-order-preview-0"
                                                                backgroundImage={modalBackground}
                                                                defaultBg={defaultTemplateBg}
                                                                templateColor={templateColor}
                                                                headerLogo={logoUrl}
                                                                headerLogoAlign={headerLogoAlign}
                                                                content={processedContent}
                                                            />
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
