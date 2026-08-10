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
        template_color?: string;
    } | null;
}

export default function GeneralSettings({ settings }: GeneralSettingsProps) {
    const { t } = useTranslation();

    // Preset color swatches
    const presetColors = ['#E9591C', '#2563EB', '#059669', '#7C3AED', '#DC2626', '#111827'];

    // 1. Setup form state matching proposal_settings database columns
    const { data, setData, post, put, processing, errors } = useForm({
        proposal_prefix: settings?.proposal_prefix ?? 'PROP-',
        proposal_starting_number: settings?.proposal_starting_number?.toString() ?? '1001',
        default_validity_days: settings?.default_validity_days?.toString() ?? '30',
        template_color: settings?.template_color ?? '#E9591C',
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

                {/* Template Accent Color Setting */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="template_color">{t('Template Color')}</Label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            id="template_color_picker"
                            value={data.template_color || '#E9591C'}
                            onChange={(e) => setData('template_color', e.target.value)}
                            className="h-10 w-12 rounded cursor-pointer border border-input p-1 bg-background"
                        />
                        <Input
                            id="template_color"
                            type="text"
                            value={data.template_color || '#E9591C'}
                            onChange={(e) => setData('template_color', e.target.value)}
                            placeholder="#E9591C"
                            className="w-36 h-10 font-mono text-sm uppercase"
                        />
                        <div className="flex items-center gap-1.5 ml-2">
                            {presetColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('template_color', color)}
                                    className={`h-7 w-7 rounded-full border transition-all ${data.template_color?.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('This color will be used for cover page topbar gradients, geometric SVG shapes, watermarks, divider lines, and accent badges.')}
                    </p>
                    {errors.template_color && (
                        <p className="text-xs text-destructive">{errors.template_color}</p>
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