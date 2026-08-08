import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface GeneralSettingsProps {
    settings?: {
        id?: number;
        proposal_prefix?: string;
        proposal_starting_number?: number | string;
        default_validity_days?: number | string;
    } | null;
}

export default function GeneralSettings({ settings }: GeneralSettingsProps) {
    const { t } = useTranslation();

    // 1. Setup form state matching proposal_settings database columns
    const { data, setData, post, put, processing, errors } = useForm({
        proposal_prefix: settings?.proposal_prefix ?? 'PROP-',
        proposal_starting_number: settings?.proposal_starting_number?.toString() ?? '1001',
        default_validity_days: settings?.default_validity_days?.toString() ?? '30',
    });

    // 2. Submit form data to backend route
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (settings?.id) {
            put(route('proposal-setup.general-settings.update', settings.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Settings updated successfully.'));
                },
                onError: () => {
                    toast.error(t('Failed to save data.'));
                },
            });
        } else {
            post(route('proposal-setup.general-settings.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('Settings created successfully.'));
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
                <h3 className="text-lg font-medium">{t('General Settings')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Merged Proposal Numbering (Prefix + Starting Number) */}
                <div className="space-y-2">
                    <Label>{t('Proposal Prefix & Number')}</Label>
                    <div className="flex items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
                        <div className="flex-1 min-w-[100px] border-r">
                            <Input
                                id="proposal_prefix"
                                value={data.proposal_prefix}
                                onChange={(e) => setData('proposal_prefix', e.target.value)}
                                placeholder="PROP-"
                                className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            />
                        </div>
                        <div className="flex-1 min-w-[100px]">
                            <Input
                                id="proposal_starting_number"
                                type="number"
                                value={data.proposal_starting_number}
                                onChange={(e) => setData('proposal_starting_number', e.target.value)}
                                placeholder="1001"
                                className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                        <span>{t('Preview: {{prefix}}{{number}}', { prefix: data.proposal_prefix, number: data.proposal_starting_number })}</span>
                    </div>
                    {errors.proposal_prefix && (
                        <p className="text-xs text-destructive">{errors.proposal_prefix}</p>
                    )}
                    {errors.proposal_starting_number && (
                        <p className="text-xs text-destructive">{errors.proposal_starting_number}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="default_validity_days">{t('Default Validity Period (Days)')}</Label>
                    <Input
                        id="default_validity_days"
                        type="number"
                        value={data.default_validity_days}
                        onChange={(e) => setData('default_validity_days', e.target.value)}
                    />
                    {errors.default_validity_days && (
                        <p className="text-xs text-destructive">{errors.default_validity_days}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="sm" disabled={processing} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t('Save Settings')}
                </Button>
            </div>
        </form>
    );
}