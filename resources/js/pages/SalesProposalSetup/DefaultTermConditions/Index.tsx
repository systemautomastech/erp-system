import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useTranslation } from 'react-i18next';

export default function DefaultTermConditions() {
    const { t } = useTranslation();
    const [defaultTerms, setDefaultTerms] = useState(
        '<p>1. Proposal is valid for 30 days from issuance.<br/>2. Payment terms: 50% deposit upon acceptance, 50% on project completion.</p>'
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Default Terms & Conditions')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('Define default terms and conditions content for new proposals.')}
                </p>
            </div>

            <div className="space-y-2">
                <Label>{t('Terms & Conditions')}</Label>
                <RichTextEditor
                    content={defaultTerms}
                    onChange={setDefaultTerms}
                    placeholder={t('Enter default proposal terms & conditions...')}
                />
            </div>
        </div>
    );
}