import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getImagePath } from '@/utils/helpers';

interface LogoTemplatesProps {
    settings?: Record<string, any> | null;
}

export default function LogoTemplates({ settings }: LogoTemplatesProps) {
    const { t } = useTranslation();

    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isBgModalOpen, setIsBgModalOpen] = useState(false);

    const { data, setData, post, processing } = useForm({
        settings: {
            logo_image: settings?.logo_image ?? '',
            background_image: settings?.background_image ?? '',
        }
    });

    useEffect(() => {
        if (settings) {
            setData('settings', {
                logo_image: settings.logo_image ?? '',
                background_image: settings.background_image ?? '',
            });
        }
    }, [settings]);

    const handleSelectLogo = (url: string | string[]) => {
        const selected = Array.isArray(url) ? url[0] : url;
        setData('settings', { ...data.settings, logo_image: selected || '' });
        setIsLogoModalOpen(false);
    };

    const handleSelectBg = (url: string | string[]) => {
        const selected = Array.isArray(url) ? url[0] : url;
        setData('settings', { ...data.settings, background_image: selected || '' });
        setIsBgModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('proposal-setup.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('Images saved successfully.'));
            },
            onError: () => {
                toast.error(t('Failed to save Images.'));
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Logo & Template')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Header Logo */}
                <div className="space-y-3">
                    <Label>{t('Header Logo')}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[160px] bg-muted/10">
                        {data.settings.logo_image ? (
                            <div className="relative group w-full flex justify-center p-2">
                                <img
                                    src={getImagePath(data.settings.logo_image)}
                                    alt="Header Logo"
                                    className="max-h-28 object-contain rounded"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-7 w-7"
                                    onClick={() => setData('settings', { ...data.settings, logo_image: '' })}
                                    title={t('Remove Logo')}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{t('PNG, JPG or SVG up to 2MB')}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsLogoModalOpen(true)}
                                >
                                    {t('Select Header Logo')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* PDF Background Image */}
                <div className="space-y-3">
                    <Label>{t('Template Background Image')}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[160px] bg-muted/10">
                        {data.settings.background_image ? (
                            <div className="relative group w-full flex justify-center p-2">
                                <img
                                    src={getImagePath(data.settings.background_image)}
                                    alt="Background Image"
                                    className="max-h-28 object-contain rounded"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-7 w-7"
                                    onClick={() => setData('settings', { ...data.settings, background_image: '' })}
                                    title={t('Remove Background Image')}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{t('PNG, JPG or WEBP up to 4MB')}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBgModalOpen(true)}
                                >
                                    {t('Select Background Image')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="sm" disabled={processing} className="gap-2">
                    <Save className="h-4 w-4" />
                    {t('Save Changes')}
                </Button>
            </div>

            {/* Media Library Modals */}
            <MediaLibraryModal
                isOpen={isLogoModalOpen}
                onClose={() => setIsLogoModalOpen(false)}
                onSelect={handleSelectLogo}
            />

            <MediaLibraryModal
                isOpen={isBgModalOpen}
                onClose={() => setIsBgModalOpen(false)}
                onSelect={handleSelectBg}
            />
        </form>
    );
}
