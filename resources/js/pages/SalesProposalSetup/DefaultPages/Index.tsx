import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface ProposalDefaultPageItem {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    order: number;
}

interface DefaultPagesProps {
    defaultPages?: ProposalDefaultPageItem[];
}

export default function DefaultPages({ defaultPages = [] }: DefaultPagesProps) {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<ProposalDefaultPageItem | null>(null);
    const [viewingPage, setViewingPage] = useState<ProposalDefaultPageItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
        is_active: true,
        order: 1,
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
            is_active: true,
            order: defaultPages.length + 1,
        });
        setIsPageModalOpen(true);
    };

    const openEditPageModal = (page: ProposalDefaultPageItem) => {
        setEditingPage(page);
        clearErrors();
        setData({
            title: page.title,
            content: page.content,
            is_active: Boolean(page.is_active),
            order: page.order || 1,
        });
        setIsPageModalOpen(true);
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
                    if (errs.order) {
                        toast.error(errs.order);
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
                    if (errs.order) {
                        toast.error(errs.order);
                    } else {
                        toast.error(t('Failed to create page. Please check errors.'));
                    }
                },
            });
        }
    };

    const handleDeletePage = (pageId: number) => {
        if (confirm(t('Are you sure you want to delete this page?'))) {
            router.delete(route('proposal-setup.default-pages.destroy', pageId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Default page deleted successfully.'));
                },
                onError: () => {
                    toast.error(t('Failed to delete page.'));
                },
            });
        }
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
                    filteredPages.map((page) => (
                        <Card
                            key={page.id}
                            className="group relative overflow-hidden border hover:border-primary/50 transition-all shadow-xs"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
                                        <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0 border border-primary/20">
                                            {page.order}
                                        </span>
                                        <h4 className="font-medium text-sm truncate">{page.title}</h4>
                                    </div>
                                    {page.is_active ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleDeletePage(page.id)}
                                        title={t('Delete')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {filteredPages.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    {t('Showing {{count}} page(s)', { count: filteredPages.length })}
                </p>
            )}

            {/* Add/Edit Page Modal */}
            <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <form onSubmit={handleSavePage} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{editingPage ? t('Edit Page') : t('Add New Page')}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="page-title">{t('Page Title')}</Label>
                                <Input
                                    id="page-title"
                                    placeholder={t('e.g., Scope of Work')}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title}</p>
                                )}
                            </div>

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
                                        <Label htmlFor="page-order" className="text-xs text-muted-foreground">
                                            {t('Sort Order')}
                                        </Label>
                                        <Input
                                            id="page-order"
                                            type="number"
                                            min="1"
                                            className="w-20 h-8 text-xs"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    {errors.order && (
                                        <p className="text-xs text-destructive text-right">{errors.order}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
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

            {/* View Page Content Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <File className="h-5 w-5 text-primary" />
                            {viewingPage?.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-background text-foreground border rounded-lg p-6 shadow-xs max-h-[60vh] overflow-y-auto">
                            {viewingPage?.content ? (
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3 [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2 [&_h3]:text-foreground [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-1 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1"
                                    dangerouslySetInnerHTML={{ __html: viewingPage.content }}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground italic py-4 text-center">
                                    {t('No page content.')}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            {t('Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}