import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputError from "@/components/ui/input-error";
import { ShippingProvider, ShippingProviderFormData } from './types';

interface EditSalesShippingProviderProps {
    shippingProvider: ShippingProvider;
    onSuccess: () => void;
}

export default function Edit({ shippingProvider, onSuccess }: EditSalesShippingProviderProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm<ShippingProviderFormData>({
        name: shippingProvider.name,
        website: shippingProvider.website || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.shipping-providers.update', shippingProvider.id), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('Edit Shipping Provider')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="edit_name">{t('Name')}</Label>
                    <Input
                        id="edit_name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter shipping provider name')}
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                
                <div>
                    <Label htmlFor="edit_website">{t('Website')}</Label>
                    <Input
                        id="edit_website"
                        type="url"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        placeholder={t('Enter website URL')}
                    />
                    <InputError message={errors.website} />
                </div>
                

                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onSuccess}>
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