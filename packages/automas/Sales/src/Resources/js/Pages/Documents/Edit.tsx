import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import InputError from "@/components/ui/input-error";
import { SalesDocument, SalesDocumentFormData, DocumentFormProps } from './types';

interface EditDocumentProps extends DocumentFormProps {
    document: SalesDocument;
    onSuccess: () => void;
}

export default function Edit({ document: salesDocument, accounts, folders, types, opportunities, users, onSuccess }: EditDocumentProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    
    const { data, setData, put, processing, errors } = useForm<SalesDocumentFormData>({
        name: salesDocument.name || '',
        account_id: salesDocument.account_id || null,
        folder_id: salesDocument.folder_id || null,
        type_id: salesDocument.type_id || null,
        opportunity_id: salesDocument.opportunity_id || null,
        status: salesDocument.status || 'draft',
        publish_date: salesDocument.publish_date || '',
        expiration_date: salesDocument.expiration_date || '',
        attachment: null,
        assign_user_id: salesDocument.assign_user_id?.toString() || null,
        description: salesDocument.description || '',
        is_active: salesDocument.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.attachment) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name', data.name);
            formData.append('status', data.status);
            formData.append('account_id', data.account_id?.toString() || '');
            formData.append('folder_id', data.folder_id?.toString() || '');
            formData.append('type_id', data.type_id?.toString() || '');
            formData.append('opportunity_id', data.opportunity_id?.toString() || '');
            formData.append('assign_user_id', data.assign_user_id?.toString() || '');
            formData.append('publish_date', data.publish_date);
            formData.append('expiration_date', data.expiration_date);
            formData.append('description', data.description);
            formData.append('is_active', data.is_active ? '1' : '0');
            formData.append('attachment', data.attachment);
            
            router.post(route('sales.documents.update', salesDocument.id), formData, {
                onSuccess: () => {
                    onSuccess();
                }
            });
        } else {
            put(route('sales.documents.update', salesDocument.id), {
                onSuccess: () => {
                    onSuccess();
                }
            });
        }
    };



    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{t('Edit Document')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_name">{t('Name')}</Label>
                        <Input
                            id="edit_name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter document name')}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="edit_status">{t('Status')}</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t('Active')}</SelectItem>
                                <SelectItem value="draft">{t('Draft')}</SelectItem>
                                <SelectItem value="expired">{t('Expired')}</SelectItem>
                                <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                </div>

                {/* Relationship Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_opportunity_id">{t('Opportunity')}</Label>
                        <Select value={data.opportunity_id?.toString() || ''} onValueChange={async (value) => {
                            const opportunityId = value ? parseInt(value) : null;
                            setData('opportunity_id', opportunityId);
                            
                            if (opportunityId) {
                                try {
                                    const response = await fetch(route('sales.documents.opportunity-details', opportunityId));
                                    const details = await response.json();
                                    
                                    setData(prev => ({
                                        ...prev,
                                        opportunity_id: opportunityId,
                                        account_id: details.account_id || null
                                    }));
                                } catch (error) {
                                    console.error('Failed to fetch opportunity details', error);
                                    // Fallback to local data
                                    const selectedOpportunity = opportunities.find(opp => opp.id === opportunityId);
                                    setData(prev => ({
                                        ...prev,
                                        opportunity_id: opportunityId,
                                        account_id: selectedOpportunity?.account_id || null
                                    }));
                                }
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Opportunity')} />
                            </SelectTrigger>
                            <SelectContent>
                                {opportunities.length > 0 ? (
                                    opportunities.map((opportunity) => (
                                        <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                                            {opportunity.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Opportunities available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.opportunity_id} />
                    </div>
                    <div>
                        <Label htmlFor="edit_account_id">{t('Account')}</Label>
                        <Select value={data.account_id?.toString() || ''} onValueChange={(value) => setData('account_id', value ? parseInt(value) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Account')} />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.length > 0 ? (
                                    accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id.toString()}>
                                            {account.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Accounts available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.account_id} />
                    </div>
                </div>

                {/* Organization Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_folder_id">{t('Folder')}</Label>
                        <Select value={data.folder_id?.toString() || ''} onValueChange={(value) => setData('folder_id', value ? parseInt(value) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Folder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {folders.length > 0 ? (
                                    folders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id.toString()}>
                                            {folder.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Folders available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.folder_id} />
                    </div>
                    <div>
                        <Label htmlFor="edit_type_id">{t('Type')}</Label>
                        <Select value={data.type_id?.toString() || ''} onValueChange={(value) => setData('type_id', value ? parseInt(value) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {types.length > 0 ? (
                                    types.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Types available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </div>
                </div>

                {/* Assignment and File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(auth.user?.permissions?.includes('manage-any-users') || auth.user?.permissions?.includes('manage-own-users')) && users && (
                        <div>
                            <Label htmlFor="assign_user_id">{t('Assigned User')}</Label>
                            <Select value={data.assign_user_id?.toString() || ''} onValueChange={(value) => setData('assign_user_id', value ? parseInt(value) : null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select user')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {users && users.length > 0 ? (
                                        users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-data" disabled>
                                            {t('No Users available')}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.assign_user_id} />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="edit_attachment">{t('Attachment')}</Label>
                        <Input
                            id="edit_attachment"
                            type="file"
                            onChange={(e) => setData('attachment', e.target.files?.[0])}
                            accept="*"
                        />
                        {salesDocument.attachment && (
                            <p className="text-xs text-gray-500 mt-1">
                                {t('Current file')}: {salesDocument.attachment.split('/').pop()}
                            </p>
                        )}
                        <InputError message={errors.attachment} />
                    </div>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>{t('Publish Date')}</Label>
                        <DatePicker
                            value={data.publish_date}
                            onChange={(value) => setData('publish_date', value)}
                            placeholder={t('Select publish date')}
                        />
                        <InputError message={errors.publish_date} />
                    </div>
                    <div>
                        <Label>{t('Expiration Date')}</Label>
                        <DatePicker
                            value={data.expiration_date}
                            onChange={(value) => setData('expiration_date', value)}
                            placeholder={t('Select expiration date')}
                        />
                        <InputError message={errors.expiration_date} />
                    </div>
                </div>

                {/* Description */}
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