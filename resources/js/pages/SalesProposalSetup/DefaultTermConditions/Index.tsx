import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useTranslation } from 'react-i18next';

interface DefaultTermConditionsProps {
    settings?: {
        id?: number;
        default_terms?: string;
    } | null;
}

export default function DefaultTermConditions({ settings }: DefaultTermConditionsProps) {
    const { t } = useTranslation();

    const { data, setData, post, put, processing, errors } = useForm({
        default_terms: settings?.default_terms ??
            '<h2>Terms & Conditions</h2><p>1. Proposal is valid for 30 days from issuance.<br/>2. Payment terms: 50% deposit upon acceptance, 50% on project completion.</p>',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (settings?.id) {
            put(route('proposal-setup.general-settings.update', settings.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Terms & Conditions saved successfully.'));
                },
                onError: () => {
                    toast.error(t('Failed to save data.'));
                },
            });
        } else {
            post(route('proposal-setup.general-settings.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Terms & Conditions saved successfully.'));
                },
                onError: () => {
                    toast.error(t('Failed to save data.'));
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Default Terms & Conditions')}</h3>
            </div>

            <div className="space-y-2">
                <RichTextEditor
                    content={data.default_terms}
                    onChange={(val) => setData('default_terms', val)}
                    placeholder={t('Enter default proposal terms & conditions...')}
                />
                {errors.default_terms && (
                    <p className="text-xs text-destructive">{errors.default_terms}</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={processing} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t('Save Terms')}
                </Button>
            </div>
        </form>
    );
}