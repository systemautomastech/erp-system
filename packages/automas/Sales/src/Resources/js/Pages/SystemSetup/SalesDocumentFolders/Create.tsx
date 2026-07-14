import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { CreateSalesDocumentFolderProps, SalesDocumentFolderFormData } from './types';

export default function Create({ onSuccess, parentFolders }: CreateSalesDocumentFolderProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<SalesDocumentFolderFormData>({
        name: '',
        parent: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.sales-document-folders.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('Create Document Folder')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter Name')}
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                
                <div>
                    <Label htmlFor="parent">{t('Parent')}</Label>
                    <Select value={data.parent?.toString() || ''} onValueChange={(value) => setData('parent', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('Select Parent')} />
                        </SelectTrigger>
                        <SelectContent>
                            {parentFolders && parentFolders.length > 0 ? (
                                parentFolders.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-data" disabled>
                                    {t('No Parent Folders available')}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.parent} />
                </div>
                
                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Enter Description')}
                        rows={3}
                    />
                    <InputError message={errors.description} />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? t('Creating...') : t('Create')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}