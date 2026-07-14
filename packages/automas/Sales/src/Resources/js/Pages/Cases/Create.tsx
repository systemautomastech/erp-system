import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import InputError from "@/components/ui/input-error";
import { useFormFields } from '@/hooks/useFormFields';
import { CreateSalesCaseFormData, Account, Contact, CaseType, User } from './types';

interface CreateProps {
    onSuccess: () => void;
    accounts: Account[];
    contacts: Contact[];
    caseTypes: CaseType[];
    users: User[];
    defaultAccountId?: number;
    defaultContactId?: number;
}

export default function Create({ onSuccess, accounts, contacts, caseTypes, users, defaultAccountId, defaultContactId }: CreateProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;

    const { data, setData, post, processing, errors } = useForm<CreateSalesCaseFormData>({
        name: '',
        status: '',
        priority: '',
        description: '',
        account_id: defaultAccountId ? defaultAccountId.toString() : '',
        contact_id: defaultContactId ? defaultContactId.toString() : '',
        case_type_id: '',
        assign_user_id: null,
        attachment: undefined,
    });

    // Filter contacts based on selected account or show all if opened from contact show page
    const filteredContacts = defaultContactId
        ? contacts || []
        : data.account_id
            ? contacts?.filter((contact: any) => contact.account_id?.toString() === data.account_id) || []
            : contacts || [];

    // Update account_id and contact_id when default props change
    useEffect(() => {
        if (defaultAccountId) {
            setData('account_id', defaultAccountId.toString());
        }
        if (defaultContactId) {
            setData('contact_id', defaultContactId.toString());
        }
    }, [defaultAccountId, defaultContactId, setData]);

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Case' }, setData, errors, 'create', t);

    // Calendar hook
    const formFields = useFormFields('salesCase', data, setData, errors);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.cases.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>{t('Create Case')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter case name')}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="account_id">{t('Account')}</Label>
                        <Select value={data.account_id} onValueChange={(value) => {
                            setData('account_id', value);
                            setData('contact_id', ''); // Reset contact when account changes
                        }} disabled={!!defaultAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Account')} />
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
                        <Label htmlFor="contact_id">{t('Contact')}</Label>
                        <Select key={data.account_id} value={data.contact_id} onValueChange={(value) => setData('contact_id', value)} disabled={!!defaultContactId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Contact')} />
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
                        <Label htmlFor="case_type_id">{t('Case Type')}</Label>
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
                        <Label htmlFor="status" required>{t('Status')}</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Status')} />
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
                        <Label htmlFor="priority" required>{t('Priority')}</Label>
                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Priority')} />
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
                        <Label htmlFor="attachment">{t('Attachment')}</Label>
                        <Input
                            id="attachment"
                            type="file"
                            onChange={(e) => setData('attachment', e.target.files?.[0])}
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                        <InputError message={errors.attachment} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                        id="description"
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
                        {processing ? t('Creating...') : t('Create')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}