import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import PreviewModal from '@/components/PreviewModal';
import {
    Eye,
    Pencil,
    Plus,
    Search,
    FileText,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ProposalDefaultPageItem {
    id: number;
    title: string;
    content: string;
    page_type: string;
    background_image?: string;
    sort_order: number;
    is_active: boolean;
    creator_id?: number;
    created_by?: number;
    creator_user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface DefaultPagesIndexProps {
    settings?: { template_color?: string; background_image?: string; [key: string]: any } | null;
    defaultPages: ProposalDefaultPageItem[];
}

export default function Index({ settings, defaultPages = [] }: DefaultPagesIndexProps) {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewingPage, setViewingPage] = useState<ProposalDefaultPageItem | null>(null);
    const [deletingPage, setDeletingPage] = useState<ProposalDefaultPageItem | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const filteredPages = defaultPages.filter(
        (page) =>
            page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openDeleteModal = (page: ProposalDefaultPageItem) => {
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

    const handleToggleStatus = (page: ProposalDefaultPageItem, checked: boolean) => {
        setTogglingId(page.id);
        router.put(route('proposal-setup.default-pages.update', page.id), {
            title: page.title,
            is_active: checked,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(checked ? t('Page activated.') : t('Page deactivated.'));
            },
            onError: () => {
                toast.error(t('Failed to update page status.'));
            },
            onFinish: () => {
                setTogglingId(null);
            }
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
                    <h3 className="text-lg font-semibold tracking-tight">{t('Default Pages')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {t('Default reusable pages and contents for proposal template.')}
                    </p>
                </div>
                <Button asChild size="sm" className="gap-2 shadow-xs">
                    <Link href={route('proposal-setup.default-pages.create')}>
                        <Plus className="h-4 w-4" />
                        {t('Add New Page')}
                    </Link>
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('Search pages by title...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background shadow-xs"
                />
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPages.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card shadow-xs">
                        <div className="p-3 bg-muted/60 rounded-full mb-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">{t('No default pages found')}</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            {searchQuery ? t('No pages match your search criteria. Try a different search term.') : t('Get started by creating your first default proposal page template.')}
                        </p>
                        {searchQuery ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="mt-4"
                            >
                                {t('Clear Search')}
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="mt-4 gap-2">
                                <Link href={route('proposal-setup.default-pages.create')}>
                                    <Plus className="h-4 w-4" />
                                    {t('Create First Page')}
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredPages.map((page) => {
                        return (
                            <Card
                                key={page.id}
                                className="group relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/40 bg-card"
                            >
                                <CardContent className="p-4 space-y-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold flex-shrink-0 border border-primary/20">
                                                {page.sort_order}
                                            </span>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm truncate text-foreground">
                                                    {page.title}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center min-w-[36px] h-6 shrink-0">
                                            {togglingId === page.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            ) : (
                                                <Switch
                                                    checked={page.is_active}
                                                    onCheckedChange={(checked) => handleToggleStatus(page, checked)}
                                                    className="transition-all duration-300 hover:scale-105 active:scale-95"
                                                    title={page.is_active ? t('Deactivate Page') : t('Activate Page')}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description / Content Preview */}
                                    <div className="bg-muted/40 rounded-lg p-2.5 border border-border/50">
                                        {page.content ? (
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {page.content.replace(/<[^>]*>?/gm, '').trim() || t('No description text.')}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground/60 italic leading-relaxed">
                                                {t('No description available.')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/60">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleViewPage(page)}
                                                title={t('Preview Page')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                title={t('Edit Page')}
                                            >
                                                <Link href={route('proposal-setup.default-pages.edit', page.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => openDeleteModal(page)}
                                                title={t('Delete Page')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Reusable Proposal Preview Modal */}
            <PreviewModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                title={viewingPage?.title}
                pageTitle={viewingPage?.title}
                content={viewingPage?.content}
                backgroundImage={viewingPage?.background_image}
                settings={settings}
            />

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