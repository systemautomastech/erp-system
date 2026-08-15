import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { getImagePath, getCompanySetting, formatDate } from '@/utils/helpers';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Eye,
    Pencil,
    Plus,
    Search,
    File,
    GripVertical,
    Trash2,
    CheckCircle2,
    XCircle,
    Sparkles,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface ProposalDefaultPageItem {
    id: number;
    title: string;
    content: string;
    page_type: string;
    background_image?: string;
    sort_order: number;
    is_active: boolean;
}

interface DefaultPagesProps {
    defaultPages?: ProposalDefaultPageItem[];
    settings?: { template_color?: string };
}

export default function DefaultPages({ defaultPages = [], settings }: DefaultPagesProps) {
    const { t } = useTranslation();
    const templateColor = settings?.template_color || '#E9591C';

    const [searchQuery, setSearchQuery] = useState('');
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isBgModalOpen, setIsBgModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<ProposalDefaultPageItem | null>(null);
    const [viewingPage, setViewingPage] = useState<ProposalDefaultPageItem | null>(null);
    const [deletingPage, setDeletingPage] = useState<ProposalDefaultPageItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
        page_type: 'general',
        background_image: '',
        sort_order: 1,
        is_active: true,
    });

    const filteredPages = defaultPages.filter(
        (page) =>
            page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddPageModal = () => {
        setEditingPage(null);
        clearErrors();
        reset();
        setData({
            title: '',
            content: '',
            page_type: 'general',
            background_image: '',
            sort_order: defaultPages.length + 1,
            is_active: true,
        });
        setIsPageModalOpen(true);
    };

    const openEditPageModal = (page: ProposalDefaultPageItem) => {
        setEditingPage(page);
        clearErrors();
        setData({
            title: page.title,
            content: page.content || '',
            page_type: page.page_type || 'general',
            background_image: page.background_image || '',
            sort_order: page.sort_order || 1,
            is_active: Boolean(page.is_active),
        });
        setIsPageModalOpen(true);
    };

    const handleSelectBg = (url: string | string[]) => {
        const selected = Array.isArray(url) ? url[0] : url;
        setData('background_image', selected || '');
        setIsBgModalOpen(false);
    };

    const handleSavePage = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPage) {
            put(route('proposal-setup.default-pages.update', editingPage.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Default page updated successfully.'));
                    setIsPageModalOpen(false);
                    reset();
                },
                onError: (errs) => {
                    if (errs.sort_order) {
                        toast.error(errs.sort_order);
                    } else {
                        toast.error(t('Failed to update page. Please check errors.'));
                    }
                },
            });
        } else {
            post(route('proposal-setup.default-pages.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Default page created successfully.'));
                    setIsPageModalOpen(false);
                    reset();
                },
                onError: (errs) => {
                    if (errs.sort_order) {
                        toast.error(errs.sort_order);
                    } else {
                        toast.error(t('Failed to create page. Please check errors.'));
                    }
                },
            });
        }
    };

    const openDeleteModal = (page: ProposalDefaultPageItem) => {
        if (page.page_type === 'front-page' || page.page_type === 'terms-conditions') {
            toast.error(t('This fixed default page cannot be deleted.'));
            return;
        }
        setDeletingPage(page);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deletingPage) return;
        router.delete(route('proposal-setup.default-pages.destroy', deletingPage.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Default page deleted successfully.'));
                setIsDeleteModalOpen(false);
                setDeletingPage(null);
            },
            onError: () => {
                toast.error(t('Failed to delete page.'));
            },
        });
    };

    const handleViewPage = (page: ProposalDefaultPageItem) => {
        setViewingPage(page);
        setIsViewModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium">{t('Default Pages')}</h3>
                </div>
                <Button type="button" size="sm" className="gap-2" onClick={openAddPageModal}>
                    <Plus className="h-4 w-4" />
                    {t('Add New Page')}
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('Search pages by title...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPages.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                        <File className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? t('No pages match your search.') : t('No default pages created yet.')}
                        </p>
                        {searchQuery && (
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="mt-1"
                            >
                                {t('Clear search')}
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredPages.map((page) => {
                        const isFrontPage = page.page_type === 'front-page';
                        return (
                            <Card
                                key={page.id}
                                className={`group relative overflow-hidden border transition-all shadow-xs ${isFrontPage ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10' : 'hover:border-primary/50'}`}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                                            <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 border border-primary/20">
                                                {page.sort_order}
                                            </span>
                                            <div className="min-w-0">
                                                <h4 className="font-medium text-sm truncate flex items-center gap-2">
                                                    {page.title}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {page.is_active ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description / Content Preview */}
                                    <div className="pt-1 space-y-1">
                                        {page.content ? (
                                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
                                                {page.content.replace(/<[^>]*>?/gm, '').trim() || t('No description text.')}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground/60 italic min-h-[32px] leading-relaxed">
                                                {t('No description available.')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-1 pt-2 border-t opacity-90 group-hover:opacity-100 transition-opacity">
                                        <div>
                                            {isFrontPage && (
                                                <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 text-[10px] gap-1 font-semibold">
                                                    <Sparkles className="h-3 w-3 text-yellow-500" />
                                                    {t('Fixed Page')}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleViewPage(page)}
                                                title={t('View')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEditPageModal(page)}
                                                title={t('Edit')}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!isFrontPage && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => openDeleteModal(page)}
                                                    title={t('Delete')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {filteredPages.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    {t('Showing {{count}} page(s)', { count: filteredPages.length })}
                </p>
            )}

            {/* Add/Edit Page Modal with Live Side-by-Side Preview */}
            <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
                <DialogContent className="max-w-6xl w-full max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden border-border">
                    <form onSubmit={handleSavePage} className="flex flex-col flex-1 overflow-hidden">
                        <DialogHeader className="p-4 sm:px-6 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                                {editingPage?.page_type === 'front-page' && <Sparkles className="h-5 w-5 text-amber-500" />}
                                {editingPage ? (editingPage.page_type === 'front-page' ? t('Edit Front Page') : t('Edit Page')) : t('Add New Page')}
                            </DialogTitle>
                        </DialogHeader>

                        {/* Two-Column Side-by-Side Layout: Form Left, Live Preview Right */}
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-background">
                            {/* Left Column: Form Fields */}
                            <div className="lg:col-span-6 p-4 sm:p-6 overflow-y-auto space-y-4 border-r border-border">
                                <div className="space-y-2">
                                    <Label htmlFor="page-title">{t('Page Title')}</Label>
                                    <Input
                                        id="page-title"
                                        placeholder={t('e.g., Front Page')}
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                {/* Background Image option */}
                                <div className="space-y-2">
                                    <Label className="flex items-center justify-between">
                                        <span>{t('Page Background Image')}</span>
                                    </Label>
                                    <div className="border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 bg-muted/10">
                                        {data.background_image ? (
                                            <div className="relative group w-full flex justify-center p-1">
                                                <img
                                                    src={getImagePath(data.background_image)}
                                                    alt="Background Image"
                                                    className="max-h-24 object-contain rounded"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-0 right-0 h-6 w-6"
                                                    onClick={() => setData('background_image', '')}
                                                    title={t('Remove Background Image')}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">{t('PNG, JPG or WEBP up to 4MB')}</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsBgModalOpen(true)}
                                                    className="h-8 text-xs gap-1.5"
                                                >
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                    {t('Select Background Image')}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    {errors.background_image && (
                                        <p className="text-xs text-destructive">{errors.background_image}</p>
                                    )}
                                </div>

                                {data.page_type !== 'front-page' && editingPage?.page_type !== 'front-page' && (
                                    <div className="space-y-2">
                                        <Label>{t('Page Content')}</Label>
                                        <RichTextEditor
                                            content={data.content}
                                            onChange={(content) => setData('content', content)}
                                            placeholder={t('Enter default content for this page...')}
                                        />
                                        {errors.content && (
                                            <p className="text-xs text-destructive">{errors.content}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="page-active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="page-active" className="text-sm font-normal cursor-pointer">
                                            {t('Active (include in new proposals by default)')}
                                        </Label>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="page-sort-order" className="text-xs text-muted-foreground">
                                                {t('Sort Order')}
                                            </Label>
                                            <Input
                                                id="page-sort-order"
                                                type="number"
                                                min="1"
                                                className="w-20 h-8 text-xs"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        {errors.sort_order && (
                                            <p className="text-xs text-destructive text-right">{errors.sort_order}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Live Interactive A4 Sheet Preview */}
                            <div className="lg:col-span-6 p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
                                <div className="w-full flex items-center justify-between mb-3 px-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Eye className="h-3.5 w-3.5 text-primary" />
                                        {t('Page Preview')}
                                    </span>
                                    <Badge variant="outline" className="text-[10px]">
                                        {t('A4 Full Sheet')}
                                    </Badge>
                                </div>

                                <div
                                    style={{
                                        padding: '32mm 15mm 20mm',
                                        ...(data.background_image
                                            ? {
                                                backgroundImage: `url(${getImagePath(data.background_image)})`,
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                            }
                                            : {})
                                    }}
                                    className="proposal-preview-sheet quotation-cover__sheet bg-white text-slate-900 w-[210mm] min-h-[297mm] max-w-full mx-auto shadow-xl rounded-sm text-xs font-sans border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all relative overflow-hidden"
                                >
                                    {!data.background_image && data.page_type === 'front-page' && (
                                        <>
                                            <div className="quotation-cover__topbar" style={{ background: `linear-gradient(90deg, ${templateColor}, #fffb00)` }}></div>

                                            <svg className="absolute quotation-cover__shape quotation-cover__shape--top pointer-events-none" style={{ position: 'absolute', top: '-46px', left: '-46px', width: '240px', zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28"></circle>
                                                <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                                <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10"></circle>
                                            </svg>

                                            <svg className="absolute quotation-cover__shape quotation-cover__shape--bottom pointer-events-none" style={{ position: 'absolute', right: '-30px', bottom: '-30px', width: '240px', transform: 'rotate(180deg)', opacity: 0.5, zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="40" cy="40" r="180" stroke={templateColor} strokeWidth="28"></circle>
                                                <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                                <circle cx="110" cy="110" r="70" stroke={templateColor} strokeWidth="10"></circle>
                                            </svg>

                                            <svg className="absolute quotation-cover__watermark pointer-events-none" style={{ position: 'absolute', right: '22mm', top: '76mm', width: '150px', height: '150px', opacity: 0.05, zIndex: 1, color: templateColor }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none"></circle>
                                                <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                            </svg>

                                            <svg className="absolute quotation-cover__watermark_bottom pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '0.5rem', bottom: '7.5rem', width: '150px', height: '150px', opacity: 0.08, pointerEvents: 'none', zIndex: 1, color: templateColor }}>
                                                <circle cx="100" cy="100" r="72" stroke={templateColor} strokeWidth="16" fill="none"></circle>
                                                <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                            </svg>
                                        </>
                                    )}
                                    {data.page_type === 'front-page' ? (
                                        <div className="flex flex-col justify-between h-full w-full space-y-4">
                                            {/* Header with Right-Aligned Logo */}
                                            <div className="flex justify-end items-start w-full">
                                                <img
                                                    src={getImagePath(getCompanySetting('company_logo') || getCompanySetting('company_dark_logo') || getCompanySetting('logo') || 'uploads/logo/logo_dark.png')}
                                                    alt="Company Logo"
                                                    className="max-h-12 max-w-[200px] object-contain"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent && !parent.querySelector('.company-name-fallback')) {
                                                            const fallback = document.createElement('h1');
                                                            fallback.className = 'text-base font-bold text-slate-900 tracking-tight company-name-fallback';
                                                            fallback.innerText = getCompanySetting('company_name') || '';
                                                            parent.appendChild(fallback);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Hero Section: Label, Title, Subtitle, Divider, Date */}
                                            <div className="my-auto space-y-3 py-4">
                                                <div className="text-[10px] uppercase font-extrabold tracking-widest" style={{ color: templateColor }}>
                                                    {t('Financial Proposal')}
                                                </div>

                                                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                                    {data.title || t('IP PABX Solution Service')}
                                                </h1>

                                                <div className="text-xs font-semibold text-slate-500">
                                                    {t('Quotation & Commercial Proposal')}
                                                </div>

                                                <div className="w-full h-1 rounded-full my-2" style={{ backgroundColor: templateColor }}></div>

                                                <div>
                                                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border" style={{ borderColor: templateColor, color: templateColor }}>
                                                        {formatDate(new Date().toISOString())}
                                                    </span>
                                                </div>

                                                {data.content && (
                                                    <div
                                                        className="text-slate-600 text-xs leading-relaxed prose prose-slate max-w-none pt-1"
                                                        dangerouslySetInnerHTML={{ __html: data.content }}
                                                    />
                                                )}

                                                {/* Submitted To Box */}
                                                <div className="mt-4 p-3 bg-slate-50/90 border border-slate-200/80 rounded-lg text-center space-y-1">
                                                    <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 underline decoration-slate-300">
                                                        {t('Submitted To')}
                                                    </h3>
                                                    <h2 className="text-sm font-bold text-slate-900">
                                                        {t('Client Name')}
                                                    </h2>
                                                    <p className="text-[10px] text-slate-600">
                                                        {t('Client Address')}
                                                    </p>
                                                </div>

                                                {/* Prepared By Box */}
                                                <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-lg text-center space-y-1.5">
                                                    <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 underline decoration-slate-300">
                                                        {t('Prepared By')}
                                                    </h3>

                                                    <h2 className="text-sm font-bold text-slate-900">
                                                        {getCompanySetting('company_name') || t('Company Name')}
                                                    </h2>

                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        {getCompanySetting('company_tagline') || t('Company Information')}
                                                    </p>

                                                    <div className="text-[10px] text-slate-700 space-y-0.5 pt-1 border-t border-slate-200/60">
                                                        <div>
                                                            <strong>{t('Corporate Office')}:</strong>{' '}
                                                            {getCompanySetting('company_address') || t('Company Address')}
                                                        </div>
                                                        <div className="flex flex-wrap justify-center items-center gap-x-2">
                                                            <span><strong>{t('Web')}:</strong> {getCompanySetting('company_website') || 'www.example.com'}</span>
                                                            <span><strong>{t('Email')}:</strong> {getCompanySetting('company_email') || 'info@example.com'}</span>
                                                        </div>
                                                        <div>
                                                            <strong>{t('Phone')}:</strong> {getCompanySetting('company_phone') || t('Company Phone')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Bar */}
                                            <div className="flex justify-between items-end gap-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                                                <div>
                                                    <strong className="text-slate-900">{t('Prepared by')}:</strong> {getCompanySetting('company_name') || t('Creator Name')}
                                                </div>
                                                <div className="text-right truncate max-w-[180px]">
                                                    <strong className="text-slate-900">{t('Subject')}:</strong> {data.title || t('Subject')}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 flex-1">
                                            {data.content ? (
                                                <div
                                                    className="text-slate-700 text-xs leading-relaxed prose max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-1 [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-slate-200 [&_table]:rounded-sm [&_table]:overflow-hidden [&_thead]:bg-[var(--template-color)] [&_thead]:text-white [&_thead_th]:bg-[var(--template-color)] [&_thead_th]:text-white [&_thead_th]:font-semibold [&_thead_th]:py-2 [&_thead_th]:px-3 [&_thead_th]:border [&_thead_th]:border-slate-200 [&_thead_th]:text-left [&_tr:first-child]:bg-[var(--template-color)] [&_tr:first-child]:text-white [&_tr:first-child_th]:bg-[var(--template-color)] [&_tr:first-child_th]:text-white [&_tr:first-child_th]:font-semibold [&_tr:first-child_th]:py-2 [&_tr:first-child_th]:px-3 [&_tr:first-child_th]:border [&_tr:first-child_th]:border-slate-200 [&_tr:first-child_th]:text-left [&_tr:first-child_td]:bg-[var(--template-color)] [&_tr:first-child_td]:text-white [&_tr:first-child_td]:font-semibold [&_tr:first-child_td]:py-2 [&_tr:first-child_td]:px-3 [&_tr:first-child_td]:border [&_tr:first-child_td]:border-slate-200 [&_tr:first-child_td]:text-left [&_td]:py-2 [&_td]:px-3 [&_td]:border [&_td]:border-slate-200 [&_td]:text-slate-700 [&_td]:text-xs [&_tr:not(:first-child):hover]:bg-slate-50/50"
                                                    dangerouslySetInnerHTML={{ __html: data.content }}
                                                />
                                            ) : (
                                                <p className="text-xs text-slate-400 italic py-12 text-center">{t('Enter content on the left to see live preview...')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-4 bg-background border-t border-border shrink-0 flex items-center justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsPageModalOpen(false)}>
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingPage ? t('Update Page') : t('Create Page')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Media Library Modal for Selecting Background Image */}
            <MediaLibraryModal
                isOpen={isBgModalOpen}
                onClose={() => setIsBgModalOpen(false)}
                onSelect={handleSelectBg}
            />

            {/* View Page Content Modal - Full A4 Sheet Preview */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-900/40 backdrop-blur-md border-slate-700">
                    <DialogHeader className="p-4 sm:px-6 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <File className="h-5 w-5 text-primary" />
                            {t('Page Preview')}: {viewingPage?.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
                        {viewingPage && (
                            <div
                                style={
                                    viewingPage.background_image
                                        ? {
                                            backgroundImage: `url(${getImagePath(viewingPage.background_image)})`,
                                            backgroundSize: '100% 100%',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }
                                        : {}
                                }
                                className="proposal-preview-sheet quotation-cover__sheet bg-white text-slate-900 w-[210mm] min-h-[297mm] max-w-full shadow-2xl rounded-sm p-0 text-sm font-sans border border-slate-200 dark:border-slate-800 shrink-0 flex flex-col justify-between relative overflow-hidden"
                            >
                                {!viewingPage.background_image && viewingPage.page_type === 'front-page' && (
                                    <>
                                        <div className="quotation-cover__topbar"></div>

                                        <svg className="absolute quotation-cover__shape quotation-cover__shape--top pointer-events-none" style={{ position: 'absolute', top: '-46px', left: '-46px', width: '240px', zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="40" cy="40" r="180" stroke="currentColor" strokeWidth="28" className="text-primary"></circle>
                                            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                            <circle cx="110" cy="110" r="70" stroke="currentColor" strokeWidth="10" className="text-primary"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__shape quotation-cover__shape--bottom pointer-events-none" style={{ position: 'absolute', right: '-30px', bottom: '-30px', width: '240px', transform: 'rotate(180deg)', opacity: 0.5, zIndex: 1 }} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="40" cy="40" r="180" stroke="currentColor" strokeWidth="28" className="text-primary"></circle>
                                            <circle cx="80" cy="80" r="120" stroke="#111827" strokeWidth="14"></circle>
                                            <circle cx="110" cy="110" r="70" stroke="currentColor" strokeWidth="10" className="text-primary"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__watermark text-primary pointer-events-none" style={{ position: 'absolute', right: '22mm', top: '76mm', width: '150px', height: '150px', opacity: 0.05, zIndex: 1 }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="16" fill="none"></circle>
                                            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                        </svg>

                                        <svg className="absolute quotation-cover__watermark_bottom text-primary pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '0.5rem', bottom: '7.5rem', width: '150px', height: '150px', opacity: 0.08, pointerEvents: 'none', zIndex: 1 }}>
                                            <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="16" fill="none"></circle>
                                            <circle cx="100" cy="100" r="42" stroke="#111827" strokeWidth="10" fill="none"></circle>
                                        </svg>
                                    </>
                                )}
                                {viewingPage.page_type === 'front-page' ? (
                                    <div className="quotation-cover__body">
                                        <div className="text-end logo-container">
                                            <img
                                                src={getImagePath(getCompanySetting('company_logo') || getCompanySetting('company_dark_logo') || getCompanySetting('logo') || 'uploads/logo/logo_dark.png')}
                                                alt="Company Logo"
                                                className="quotation-cover__logo max-h-16 max-w-[240px] object-contain ml-auto"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.company-name-fallback')) {
                                                        const fallback = document.createElement('h1');
                                                        fallback.className = 'text-xl font-bold text-slate-900 tracking-tight company-name-fallback';
                                                        fallback.innerText = getCompanySetting('company_name') || '';
                                                        parent.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="quotation-cover__label mb-2">
                                                {t('Financial Proposal')}
                                            </div>

                                            <h1 className="quotation-cover__title mb-2">
                                                {viewingPage.title || t('IP PABX Solution Service')}
                                            </h1>

                                            <div className="text-lg text-slate-500 font-semibold mb-3">
                                                {t('Quotation & Commercial Proposal')}
                                            </div>

                                            <div className="quotation-cover__line mb-4"></div>

                                            <div className="mb-5">
                                                <span className="quotation-cover__date">
                                                    {formatDate(new Date().toISOString())}
                                                </span>
                                            </div>

                                            {viewingPage.content && (
                                                <div
                                                    className="text-slate-600 text-sm leading-relaxed prose prose-slate max-w-none mb-4"
                                                    dangerouslySetInnerHTML={{ __html: viewingPage.content }}
                                                />
                                            )}

                                            <div className="mb-4">
                                                <div className="quotation-cover__box quotation-cover__submitted text-center">
                                                    <div className="uppercase text-slate-500 font-bold text-xs mb-2 underline" style={{ textDecoration: 'underline' }}>
                                                        {t('Submitted To')}
                                                    </div>
                                                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                                                        {t('Client Name')}
                                                    </h2>
                                                    <p className="text-slate-600 text-xs mb-0">
                                                        {t('Client Address')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="quotation-cover__box quotation-cover__prepared text-center mb-4">
                                                <div className="uppercase text-slate-500 font-bold text-xs mb-3 underline" style={{ textDecoration: 'underline' }}>
                                                    {t('Prepared By')}
                                                </div>

                                                <img
                                                    src={getImagePath(getCompanySetting('company_logo') || getCompanySetting('company_dark_logo') || getCompanySetting('logo') || 'uploads/logo/logo_dark.png')}
                                                    alt="Company Logo"
                                                    className="quotation-cover__logo mx-auto mb-3"
                                                />

                                                <div className="text-xl font-bold text-slate-900 mb-1">
                                                    {getCompanySetting('company_name') || t('Company Name')}
                                                </div>

                                                <div className="text-sm text-slate-500 mb-3 font-medium">
                                                    {getCompanySetting('company_tagline') || t('Company Information')}
                                                </div>

                                                <div className="text-xs text-slate-700 space-y-1">
                                                    <div className="mb-1">
                                                        <strong>{t('Corporate Office')}:</strong>{' '}
                                                        {getCompanySetting('company_address') || t('Company Address')}
                                                    </div>
                                                    <div className="mb-1 flex flex-wrap justify-center gap-x-4">
                                                        <span><strong>{t('Web')}:</strong> {getCompanySetting('company_website') || 'www.example.com'}</span>
                                                        <span><strong>{t('Email')}:</strong> {getCompanySetting('company_email') || 'info@example.com'}</span>
                                                    </div>
                                                    <div>
                                                        <strong>{t('Phone')}:</strong> {getCompanySetting('company_phone') || t('Company Phone')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="quotation-cover__footer flex justify-between items-end gap-3 text-slate-600">
                                            <div>
                                                <strong className="text-slate-900">{t('Prepared by')}:</strong>{' '}
                                                {getCompanySetting('company_name') || t('Creator Name')}
                                            </div>
                                            <div className="text-right">
                                                <strong className="text-slate-900">{t('Subject')}:</strong>{' '}
                                                {viewingPage.title || t('Subject')}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight border-b border-slate-200 pb-4">
                                            {viewingPage.title}
                                        </h2>
                                        {viewingPage.content ? (
                                            <div
                                                className="text-slate-700 text-sm leading-relaxed prose max-w-none [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                                dangerouslySetInnerHTML={{ __html: viewingPage.content }}
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-400 italic py-8 text-center">{t('No page content.')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 bg-background border-t">
                        <Button type="button" variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            {t('Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Standard Delete Confirmation Modal */}
            <ConfirmationDialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('Delete Default Page')}
                message={deletingPage ? `${t('Are you sure you want to delete')} "${deletingPage.title}"? ${t('This action cannot be undone.')}` : t('Are you sure you want to delete this page?')}
                confirmText={t('Delete')}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}