import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export default function GeneralSettings() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('General Setup Options')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('Configure global default rules for proposals.')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="proposalPrefix">{t('Proposal Number Prefix')}</Label>
                    <Input id="proposalPrefix" defaultValue="PROP-" placeholder="PROP-" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startingNumber">{t('Next Starting Number')}</Label>
                    <Input id="startingNumber" type="number" defaultValue="1001" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="validityDays">{t('Default Validity Period (Days)')}</Label>
                    <Input id="validityDays" type="number" defaultValue="30" />
                </div>
            </div>
        </div>
    );
}