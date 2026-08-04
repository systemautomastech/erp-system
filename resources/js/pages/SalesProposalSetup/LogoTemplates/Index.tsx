import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function LogoTemplates() {
    const { t } = useTranslation();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bgPreview, setBgPreview] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            toast.success(t('Logo selected'));
        }
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBgPreview(URL.createObjectURL(file));
            toast.success(t('PDF Background Image selected'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Branding & PDF Template Assets')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('Upload proposal header logo and PDF template background images.')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                    <Label>{t('Proposal Header Logo')}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                        {logoPreview ? (
                            <div className="relative group w-full flex justify-center">
                                <img src={logoPreview} alt="Logo" className="max-h-24 object-contain rounded" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-7 w-7"
                                    onClick={() => setLogoPreview(null)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{t('PNG, JPG or SVG up to 2MB')}</p>
                                <Label htmlFor="logo-upload" className="cursor-pointer">
                                    <Button type="button" variant="outline" size="sm" asChild>
                                        <span>{t('Upload Logo')}</span>
                                    </Button>
                                </Label>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* PDF Background Image */}
                <div className="space-y-3">
                    <Label>{t('PDF Template Background Image')}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                        {bgPreview ? (
                            <div className="relative group w-full flex justify-center">
                                <img src={bgPreview} alt="Background" className="max-h-24 object-contain rounded" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-7 w-7"
                                    onClick={() => setBgPreview(null)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{t('High resolution A4 background image')}</p>
                                <Label htmlFor="bg-upload" className="cursor-pointer">
                                    <Button type="button" variant="outline" size="sm" asChild>
                                        <span>{t('Upload Background Image')}</span>
                                    </Button>
                                </Label>
                                <Input
                                    id="bg-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBgUpload}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}