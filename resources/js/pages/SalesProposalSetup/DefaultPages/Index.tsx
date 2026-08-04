import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface PageItem {
    id: string;
    title: string;
    description: string;
    content: string;
    isActive: boolean;
    sortOrder: number;
}

export default function DefaultPages() {
    const { t } = useTranslation();

    const [pages, setPages] = useState<PageItem[]>([
        {
            id: '1',
            title: 'Introduction',
            description: 'Company introduction and welcome message for proposals.',
            content: '<p>Welcome to our company. We are excited to present this proposal...</p>',
            isActive: true,
            sortOrder: 1,
        },
        {
            id: '2',
            title: 'Project Overview',
            description: 'High-level summary of the project scope and objectives.',
            content: '<p>This section outlines the project overview...</p>',
            isActive: true,
            sortOrder: 2,
        },
        {
            id: '3',
            title: 'Scope of Work',
            description: 'Detailed breakdown of deliverables and responsibilities.',
            content: '<p>The scope of work includes the following...</p>',
            isActive: true,
            sortOrder: 3,
        },
        {
            id: '4',
            title: 'Timeline & Milestones',
            description: 'Project schedule with key milestones and deadlines.',
            content: '<p>Our proposed timeline is as follows...</p>',
            isActive: true,
            sortOrder: 4,
        },
        {
            id: '5',
            title: 'Pricing & Payment',
            description: 'Cost breakdown and payment schedule details.',
            content: '<p>The total investment for this project...</p>',
            isActive: true,
            sortOrder: 5,
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<PageItem | null>(null);
    const [pageForm, setPageForm] = useState({
        title: '',
        description: '',
        content: '',
        isActive: true,
    });

    const filteredPages = pages.filter(
        (page) =>
            page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddPageModal = () => {
        setEditingPage(null);
        setPageForm({ title: '', description: '', content: '', isActive: true });
        setIsPageModalOpen(true);
    };

    const openEditPageModal = (page: PageItem) => {
        setEditingPage(page);
        setPageForm({
            title: page.title,
            description: page.description,
            content: page.content,
            isActive: page.isActive,
        });
        setIsPageModalOpen(true);
    };

    const handleSavePage = () => {
        if (!pageForm.title.trim()) {
            toast.error(t('Page title is required'));
            return;
        }

        if (editingPage) {
            setPages((prev) =>
                prev.map((p) => (p.id === editingPage.id ? { ...p, ...pageForm } : p))
            );
            toast.success(t('Page updated successfully'));
        } else {
            const newPage: PageItem = {
                id: Date.now().toString(),
                ...pageForm,
                sortOrder: pages.length + 1,
            };
            setPages((prev) => [...prev, newPage]);
            toast.success(t('Page created successfully'));
        }
        setIsPageModalOpen(false);
    };

    const handleDeletePage = (pageId: string) => {
        if (confirm(t('Are you sure you want to delete this page?'))) {
            setPages((prev) => prev.filter((p) => p.id !== pageId));
            toast.success(t('Page deleted successfully'));
        }
    };

    const handleViewPage = (page: PageItem) => {
        toast.info(t('Viewing page: {{title}}', { title: page.title }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium">{t('Default Proposal Pages')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('Manage reusable page templates that appear in proposals.')}
                    </p>
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
                    placeholder={t('Search pages by title or description...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPages.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <File className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? t('No pages match your search.') : t('No pages created yet.')}
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
                            className="group relative overflow-hidden border hover:border-primary/50 transition-colors"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="mt-1">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-sm truncate">{page.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {page.description}
                                            </p>
                                        </div>
                                    </div>
                                    {page.isActive && (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPage ? t('Edit Page') : t('Add New Page')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="page-title">{t('Page Title')}</Label>
                            <Input
                                id="page-title"
                                placeholder={t('e.g., Introduction')}
                                value={pageForm.title}
                                onChange={(e) =>
                                    setPageForm((prev) => ({ ...prev, title: e.target.value }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="page-description">{t('Description')}</Label>
                            <Textarea
                                id="page-description"
                                placeholder={t('Brief description of this page...')}
                                rows={2}
                                value={pageForm.description}
                                onChange={(e) =>
                                    setPageForm((prev) => ({ ...prev, description: e.target.value }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Page Content')}</Label>
                            <RichTextEditor
                                content={pageForm.content}
                                onChange={(content) =>
                                    setPageForm((prev) => ({ ...prev, content }))
                                }
                                placeholder={t('Enter default content for this page...')}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="page-active"
                                checked={pageForm.isActive}
                                onChange={(e) =>
                                    setPageForm((prev) => ({ ...prev, isActive: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="page-active" className="text-sm font-normal cursor-pointer">
                                {t('Active (include in new proposals by default)')}
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPageModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={handleSavePage}>
                            {editingPage ? t('Update Page') : t('Create Page')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}