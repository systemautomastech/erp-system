import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage, router } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import InputError from "@/components/ui/input-error";
import { useFormFields } from '@/hooks/useFormFields';
import { SalesCase, Account, Contact, CaseType, User } from './types';

interface EditProps {
    salesCase: SalesCase;
    onSuccess: () => void;
    accounts: Account[];
    contacts: Contact[];
    caseTypes: CaseType[];
    users: User[];
}

export default function Edit({ salesCase, onSuccess, accounts, contacts, caseTypes, users }: EditProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    
    const { data, setData, put, processing, errors } = useForm({
        name: salesCase.name,
        status: salesCase.status,
        priority: salesCase.priority,
        description: salesCase.description || '',
        account_id: salesCase.account_id?.toString() || '',
        contact_id: salesCase.contact_id?.toString() || '',
        case_type_id: salesCase.case_type_id?.toString() || '',
        assign_user_id: salesCase.assign_user_id?.toString() || null,
        attachment: null as File | null,
    });

    // Filter contacts based on selected account
    const filteredContacts = data.account_id 
        ? contacts?.filter((contact: any) => contact.account_id?.toString() === data.account_id) || []
        : contacts || [];

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Case', id: salesCase.id }, setData, errors, 'edit', t);

    // Calendar hook
    const formFields = useFormFields('salesCase', data, setData, errors, 'edit');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.attachment) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name', data.name);
            formData.append('status', data.status);
            formData.append('priority', data.priority);
            formData.append('description', data.description);
            formData.append('account_id', data.account_id);
            formData.append('contact_id', data.contact_id);
            formData.append('case_type_id', data.case_type_id);
            formData.append('assign_user_id', data.assign_user_id);
            formData.append('attachment', data.attachment);
            
            router.post(route('sales.cases.update', salesCase.id), formData, {
                onSuccess: () => {
                    onSuccess();
                }
            });
        } else {
            put(route('sales.cases.update', salesCase.id), {
                onSuccess: () => {
                    onSuccess();
                }
            });
        }
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{t('Edit Case')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_name">{t('Name')}</Label>
                        <Input
                            id="edit_name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter case name')}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="edit_account_id">{t('Account')}</Label>
                        <Select value={data.account_id} onValueChange={(value) => {
                            setData('account_id', value);
                            setData('contact_id', ''); // Reset contact when account changes
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Account')}>
                                    {data.account_id && accounts?.find(a => a.id.toString() === data.account_id)?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {accounts && accounts.length > 0 ? (
                                    accounts.map((account: any) => (
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_contact_id">{t('Contact')}</Label>
                        <Select key={data.account_id} value={data.contact_id} onValueChange={(value) => setData('contact_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Contact')}>
                                    {data.contact_id && filteredContacts?.find(c => c.id.toString() === data.contact_id)?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {filteredContacts?.length > 0 ? filteredContacts.map((contact: any) => (
                                    <SelectItem key={contact.id} value={contact.id.toString()}>
                                        {contact.name}
                                    </SelectItem>
                                )) : (
                                    <SelectItem value="no-contacts" disabled>
                                        {data.account_id ? t('No contacts for this account') : t('Select an account first')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.contact_id} />
                    </div>
                    <div>
                        <Label htmlFor="edit_case_type_id">{t('Case Type')}</Label>
                        <Select value={data.case_type_id} onValueChange={(value) => setData('case_type_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select case type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {caseTypes && caseTypes.length > 0 ? (
                                    caseTypes.map((caseType) => (
                                        <SelectItem key={caseType.id} value={caseType.id.toString()}>
                                            {caseType.type}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Case Types available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.case_type_id} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="edit_status" required>{t('Status')}</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">{t('New')}</SelectItem>
                                <SelectItem value="assigned">{t('Assigned')}</SelectItem>
                                <SelectItem value="pending">{t('Pending')}</SelectItem>
                                <SelectItem value="closed">{t('Closed')}</SelectItem>
                                <SelectItem value="rejected">{t('Rejected')}</SelectItem>
                                <SelectItem value="duplicate">{t('Duplicate')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                    <div>
                        <Label htmlFor="edit_priority" required>{t('Priority')}</Label>
                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">{t('Low')}</SelectItem>
                                <SelectItem value="medium">{t('Medium')}</SelectItem>
                                <SelectItem value="high">{t('High')}</SelectItem>
                                <SelectItem value="urgent">{t('Urgent')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.priority} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                        {salesCase.attachment && (
                            <p className="text-xs text-gray-500 mt-1">
                                {t('Current file')}: {salesCase.attachment.split('/').pop()}
                            </p>
                        )}
                        <InputError message={errors.attachment} />
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="edit_description">{t('Description')}</Label>
                    <Textarea
                        id="edit_description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Enter case description')}
                        rows={3}
                    />
                    <InputError message={errors.description} />
                </div>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            {customFields.map((field) => (
                                <div key={field.id}>
                                    {field.component}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Calendar */}
                {formFields.map((field) => (
                    <div key={field.id}>{field.component}</div>
                ))}
                
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