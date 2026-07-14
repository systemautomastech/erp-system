import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';

import { EditCaseTypeProps, CaseTypeFormData } from './types';

export default function Edit({ casetype, onSuccess }: EditCaseTypeProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm<CaseTypeFormData>({
        type: casetype.type ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.case-types.update', casetype.id), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('Edit Case Type')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="type">{t('Type')}</Label>
                    <Input
                        id="type"
                        type="text"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        placeholder={t('Enter Type')}
                        required
                    />
                    <InputError message={errors.type} />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? t('Updating...') : t('Update')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}