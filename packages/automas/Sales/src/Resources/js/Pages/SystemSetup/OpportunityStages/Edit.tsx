import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import InputError from "@/components/ui/input-error";
import { OpportunityStage, CreateOpportunityStageFormData } from './types';

interface EditProps {
    stage: OpportunityStage;
    onSuccess: () => void;
}

export default function Edit({ stage, onSuccess }: EditProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm<CreateOpportunityStageFormData>({
        name: stage.name,
        description: stage.description || '',
        order: stage.order,
        color: stage.color,
        is_active: stage.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.opportunity-stages.update', stage.id), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('Edit Opportunity Stage')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="edit_name">{t('Name')}</Label>
                    <Input
                        id="edit_name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter stage name')}
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_order">{t('Order')}</Label>
                        <Input
                            id="edit_order"
                            type="number"
                            value={data.order}
                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                            placeholder={t('Enter order')}
                            min="0"
                        />
                        <InputError message={errors.order} />
                    </div>
                    <div>
                        <Label htmlFor="edit_color">{t('Color')}</Label>
                        <Input
                            id="edit_color"
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                        />
                        <InputError message={errors.color} />
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="edit_description">{t('Description')}</Label>
                    <Textarea
                        id="edit_description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Enter description')}
                        rows={3}
                    />
                    <InputError message={errors.description} />
                </div>
                
                <div>
                    <Label htmlFor="edit_is_active">{t('Status')}</Label>
                    <Select value={data.is_active ? "1" : "0"} onValueChange={(value) => setData('is_active', value === "1")}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">{t('Active')}</SelectItem>
                            <SelectItem value="0">{t('Inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.is_active} />
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