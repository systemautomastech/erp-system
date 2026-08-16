import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
}

export default function PageOrderSection({ sections, setSections, defaultPages = [] }: Props) {
    const { t } = useTranslation();

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Add modal state ('existing' | 'new')
    const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
    const [selectedDefaultPage, setSelectedDefaultPage] = useState<ProposalDefaultPage | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    // Editing item state
    const [editingSection, setEditingSection] = useState<ProposalSectionItem | null>(null);

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Open Add Modal
    const handleOpenAddModal = () => {
        setAddTab('existing');
        if (defaultPages && defaultPages.length > 0) {
            const firstNonFront = defaultPages.find(p => p.page_type !== 'front-page') || defaultPages[0];
            setSelectedDefaultPage(firstNonFront);
            setModalTitle(firstNonFront.title || '');
            setModalContent(firstNonFront.content || '');
        } else {
            setAddTab('new');
            setModalTitle('');
            setModalContent('');
        }
        setIsAddModalOpen(true);
    };

    // Select existing template in Add Modal
    const handleSelectDefaultPage = (page: ProposalDefaultPage) => {
        setSelectedDefaultPage(page);
        setModalTitle(page.title);
        setModalContent(page.content || '');
    };

    // Confirm Add Page
    const handleConfirmAddPage = () => {
        if (!modalTitle.trim()) {
            toast.error(t('Please enter a page title.'));
            return;
        }

        const isFront = selectedDefaultPage?.page_type === 'front-page' || modalTitle.toLowerCase().includes('front page');

        const newSection: ProposalSectionItem = {
            id: `sec-${Date.now()}`,
            title: modalTitle.trim(),
            content: modalContent,
            page_type: isFront ? 'front-page' : (selectedDefaultPage?.page_type || 'general'),
            background_image: selectedDefaultPage?.background_image || '',
            order: sections.length + 1,
        };

        setSections((prev) => [...prev, newSection]);
        setIsAddModalOpen(false);
        toast.success(t('Page added to proposal order.'));
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
        setEditingSection(sec);
        setModalTitle(sec.title);
        setModalContent(sec.content || '');
        setIsEditModalOpen(true);
    };

    // Confirm Edit Page
    const handleConfirmEditPage = () => {
        if (!editingSection) return;
        if (!modalTitle.trim()) {
            toast.error(t('Please enter a page title.'));
            return;
        }

        setSections((prev) =>
            prev.map((s) =>
                s.id === editingSection.id
                    ? { ...s, title: modalTitle.trim(), content: modalContent }
                    : s
            )
        );

        setIsEditModalOpen(false);
        setEditingSection(null);
        toast.success(t('Page updated successfully.'));
    };

    // Delete section
    const handleRemoveSection = (id: string, pageType?: string) => {
        if (pageType === 'front-page') {
            toast.error(t('The Front Page is required and cannot be deleted.'));
            return;
        }
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

            {/* 1. ADD PAGE MODAL */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {t('Add Page to Proposal')}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Mode Toggle Tabs */}
                    <div className="px-4 pt-3 border-b flex gap-4 bg-muted/20">
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
                                "pb-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5",
                                addTab === 'existing' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Layers className="h-3.5 w-3.5" />
                            {t('Existing Default Pages')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAddTab('new');
                                setSelectedDefaultPage(null);
                                setModalTitle('');
                                setModalContent('');
                            }}
                            className={cn(
                                "pb-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5",
                                addTab === 'new' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            {t('New Custom Page')}
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {addTab === 'existing' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                                {/* Left Side: List of Existing Templates */}
                                <div className="space-y-2 border-r pr-3 md:col-span-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t('Select Template')}
                                    </Label>
                                    <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                                        {defaultPages.map((page) => {
                                            const isSelected = selectedDefaultPage?.id === page.id;
                                            const isAlreadyAdded = sections.some(s => s.title.toLowerCase() === page.title.toLowerCase());

                                            return (
                                                <button
                                                    key={page.id}
                                                    type="button"
                                                    onClick={() => handleSelectDefaultPage(page)}
                                                    className={cn(
                                                        "w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between gap-2",
                                                        isSelected ? "bg-primary text-primary-foreground border-primary shadow-xs" : "bg-card hover:bg-accent border-border"
                                                    )}
                                                >
                                                    <span className="truncate">{page.title}</span>
                                                    {isAlreadyAdded && (
                                                        <Badge variant="secondary" className={cn("text-[9px] px-1 py-0 h-4", isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-green-100 text-green-700")}>
                                                            {t('Added')}
                                                        </Badge>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right Side: Template Editor / Adjuster */}
                                <div className="space-y-3 md:col-span-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="modal-title">{t('Page Title')}</Label>
                                        <Input
                                            id="modal-title"
                                            value={modalTitle}
                                            onChange={(e) => setModalTitle(e.target.value)}
                                            placeholder={t('Enter page title...')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>{t('Page Content')}</Label>
                                        <RichTextEditor
                                            content={modalContent}
                                            onChange={(val) => setModalContent(val)}
                                            placeholder={t('Enter page content...')}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* New Custom Page Mode */
                            <div className="space-y-4 max-w-xl mx-auto py-2">
                                <div className="space-y-1">
                                    <Label htmlFor="new-page-title">{t('Page Title')}</Label>
                                    <Input
                                        id="new-page-title"
                                        value={modalTitle}
                                        onChange={(e) => setModalTitle(e.target.value)}
                                        placeholder={t('e.g., Executive Summary')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('Page Content')}</Label>
                                    <RichTextEditor
                                        content={modalContent}
                                        onChange={(val) => setModalContent(val)}
                                        placeholder={t('Type custom page content here...')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-3 border-t bg-muted/10 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={handleConfirmAddPage} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            {t('Add to Proposal')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. EDIT PAGE MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Pencil className="h-4 w-4 text-blue-600" />
                            {t('Edit Proposal Page')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-title">{t('Page Title')}</Label>
                            <Input
                                id="edit-title"
                                value={modalTitle}
                                onChange={(e) => setModalTitle(e.target.value)}
                                disabled={editingSection?.page_type === 'front-page'}
                            />
                        </div>
                        {editingSection?.page_type !== 'front-page' && (
                            <div className="space-y-1">
                                <Label>{t('Page Content')}</Label>
                                <RichTextEditor
                                    content={modalContent}
                                    onChange={(val) => setModalContent(val)}
                                    placeholder={t('Edit page content...')}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-3 border-t bg-muted/10 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={handleConfirmEditPage}>
                            {t('Save Changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Card>
    );
}
