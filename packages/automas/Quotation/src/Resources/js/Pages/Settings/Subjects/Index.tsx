import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Tag,
    Loader2,
    Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface QuotationSubjectItem {
    id: number;
    name: string;
    creator_id?: number;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

interface QuotationSubjectsProps {
    subjects?: QuotationSubjectItem[];
}

export default function Subjects({ subjects = [] }: QuotationSubjectsProps) {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addError, setAddError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [editingSubject, setEditingSubject] = useState<QuotationSubjectItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editError, setEditError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [deletingSubject, setDeletingSubject] = useState<QuotationSubjectItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filteredSubjects = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setAddName('');
        setAddError('');
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addName.trim()) {
            setAddError(t('Subject name is required.'));
            return;
        }

        setIsAdding(true);
        router.post(route('quotation-setup.subjects.store'), {
            name: addName.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Subject created successfully.'));
                setIsAddModalOpen(false);
                setAddName('');
                setAddError('');
            },
            onError: (errors: any) => {
                setAddError(errors.name || t('Failed to create subject.'));
            },
            onFinish: () => {
                setIsAdding(false);
            }
        });
    };

    const handleOpenEdit = (subject: QuotationSubjectItem) => {
        setEditingSubject(subject);
        setEditName(subject.name);
        setEditError('');
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;

        if (!editName.trim()) {
            setEditError(t('Subject name is required.'));
            return;
        }

        setIsUpdating(true);
        router.put(route('quotation-setup.subjects.update', editingSubject.id), {
            name: editName.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Subject updated successfully.'));
                setEditingSubject(null);
                setEditName('');
                setEditError('');
            },
            onError: (errors: any) => {
                setEditError(errors.name || t('Failed to update subject.'));
            },
            onFinish: () => {
                setIsUpdating(false);
            }
        });
    };

    const handleOpenDelete = (subject: QuotationSubjectItem) => {
        setDeletingSubject(subject);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deletingSubject) return;

        router.delete(route('quotation-setup.subjects.destroy', deletingSubject.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Subject deleted successfully.'));
                setDeletingSubject(null);
                setIsDeleteModalOpen(false);
            },
            onError: () => {
                toast.error(t('Failed to delete subject.'));
            }
        });
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">{t('Quotation Subjects')}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t('Manage predefined quotation subjects that users can select when creating a sales quotation.')}
                        </p>
                    </div>
                    <div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleOpenAdd}
                            className="gap-2 shadow-xs"
                        >
                            <Plus className="h-4 w-4" />
                            {t('Add Subject')}
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('Search subjects by name...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background shadow-xs"
                    />
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-card shadow-xs">
                            <div className="p-3 bg-muted/60 rounded-full mb-3">
                                <Tag className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h4 className="font-semibold text-sm text-foreground">{t('No subjects found')}</h4>
                            <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                {searchQuery
                                    ? t('No quotation subjects match your search. Try a different search term.')
                                    : t('Get started by creating quotation subjects for your company.')}
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
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleOpenAdd}
                                    className="mt-4 gap-2 shadow-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add Subject')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredSubjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="group relative border rounded-xl p-4 bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4
                                                className="font-medium text-sm text-foreground truncate"
                                                title={subject.name}
                                            >
                                                {subject.name}
                                            </h4>
                                            {subject.created_at && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {new Date(subject.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleOpenEdit(subject)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('Edit')}</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleOpenDelete(subject)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('Delete')}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADD SUBJECT MODAL */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            {t('Add New Quotation Subject')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Enter a descriptive subject name for quotations (e.g. Quotation for IP PABX Service).')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="add-subject-name" required>
                                {t('Subject Name')}
                            </Label>
                            <Input
                                id="add-subject-name"
                                value={addName}
                                onChange={(e) => {
                                    setAddName(e.target.value);
                                    if (addError) setAddError('');
                                }}
                                placeholder={t('e.g., Quotation for Web Development Service')}
                                autoFocus
                            />
                            {addError && (
                                <p className="text-xs font-medium text-destructive">{addError}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={isAdding}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" disabled={isAdding} className="gap-2">
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {t('Create Subject')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT SUBJECT MODAL */}
            <Dialog open={Boolean(editingSubject)} onOpenChange={(open) => !open && setEditingSubject(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            {t('Edit Quotation Subject')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Update the subject name.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-subject-name" required>
                                {t('Subject Name')}
                            </Label>
                            <Input
                                id="edit-subject-name"
                                value={editName}
                                onChange={(e) => {
                                    setEditName(e.target.value);
                                    if (editError) setEditError('');
                                }}
                                autoFocus
                            />
                            {editError && (
                                <p className="text-xs font-medium text-destructive">{editError}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingSubject(null)}
                                disabled={isUpdating}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" disabled={isUpdating} className="gap-2">
                                {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {t('Save Changes')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('Delete Quotation Subject')}
                description={
                    deletingSubject
                        ? `${t('Are you sure you want to delete the subject')} "${deletingSubject.name}"?`
                        : t('Are you sure you want to delete this subject?')
                }
                confirmText={t('Delete')}
                cancelText={t('Cancel')}
                variant="destructive"
            />
        </TooltipProvider>
    );
}
