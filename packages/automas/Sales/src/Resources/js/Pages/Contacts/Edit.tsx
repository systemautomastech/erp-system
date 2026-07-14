import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MultiSelectEnhanced } from "@/components/ui/multi-select-enhanced";
import InputError from "@/components/ui/input-error";
import { PhoneInputComponent } from "@/components/ui/phone-input";
import { EditContactProps } from './types';
import { useFormFields } from '@/hooks/useFormFields';

export default function Edit({ contact, accounts, users, onSuccess }: EditContactProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: contact.name,
        account_id: contact.account_id?.toString() || '',
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        city: contact.city,
        state: contact.state || '',
        postal_code: contact.postal_code || '',
        country: contact.country || '',
        assign_user_id: contact.assign_user_id?.toString() || '',
        description: contact.description || '',
        is_active: contact.is_active,
        job_title: contact.job_title || '',
        lead_source: contact.lead_source || '',
        department: contact.department || '',
        tags: contact.tags ? (typeof contact.tags === 'string' ? JSON.parse(contact.tags) : contact.tags) : [],
        social_media_urls: contact.social_media_urls || '',
        preferred_contact_method: contact.preferred_contact_method || '',
    });

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Contact', id: contact.id }, setData, errors, 'edit', t);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.contacts.update', contact.id), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{t('Edit Contact')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')} </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter contact name')}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="job_title">{t('Job Title')}</Label>
                        <Input
                            id="job_title"
                            value={data.job_title}
                            onChange={(e) => setData('job_title', e.target.value)}
                            placeholder={t('Enter job title')}
                        />
                        <InputError message={errors.job_title} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="email">{t('Email')} </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('Enter email address')}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <PhoneInputComponent
                            label={t('Phone')}
                            value={data.phone}
                            onChange={(value) => setData('phone', value)}
                            placeholder="+1234567890"
                            error={errors.phone}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="department">{t('Department')}</Label>
                        <Input
                            id="department"
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            placeholder={t('Enter department')}
                        />
                        <InputError message={errors.department} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="lead_source">{t('Lead Source')}</Label>
                        <Input
                            id="lead_source"
                            value={data.lead_source}
                            onChange={(e) => setData('lead_source', e.target.value)}
                            placeholder={t('Enter lead source')}
                        />
                        <InputError message={errors.lead_source} />
                    </div>
                    <div>
                        <Label htmlFor="preferred_contact_method">{t('Preferred Contact Method')}</Label>
                        <Input
                            id="preferred_contact_method"
                            value={data.preferred_contact_method}
                            onChange={(e) => setData('preferred_contact_method', e.target.value)}
                            placeholder={t('Enter preferred contact method')}
                        />
                        <InputError message={errors.preferred_contact_method} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="tags">{t('Tags')}</Label>
                    <MultiSelectEnhanced
                        options={[
                            { value: 'VIP', label: 'VIP' },
                            { value: 'Decision Maker', label: 'Decision Maker' },
                            { value: 'Influencer', label: 'Influencer' },
                            { value: 'Technical', label: 'Technical' },
                            { value: 'Finance', label: 'Finance' },
                        ]}
                        value={data.tags}
                        onValueChange={(value) => setData('tags', value)}
                        placeholder={t('Select tags')}
                        searchable={true}
                    />
                    <InputError message={errors.tags} />
                </div>

                <div>
                    <Label htmlFor="social_media_urls">{t('Social Media URL')}</Label>
                    <Input
                        id="social_media_urls"
                        value={data.social_media_urls}
                        onChange={(e) => setData('social_media_urls', e.target.value)}
                        placeholder={t('Enter social media URL')}
                    />
                    <InputError message={errors.social_media_urls} />
                </div>

                <div>
                    <Label htmlFor="account_id">{t('Account')}</Label>
                    <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('Select account')} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts && accounts.length > 0 ? (
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

                <div className="grid grid-cols-2 gap-4">
                    {(auth.user?.permissions?.includes('manage-any-users') || auth.user?.permissions?.includes('manage-own-users')) && users && (
                        <div>
                            <Label htmlFor="assign_user_id">{t('Assigned User')}</Label>
                            <Select value={data.assign_user_id} onValueChange={(value) => setData('assign_user_id', value)}>
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
                    
                </div>

                <div>
                    <Label htmlFor="address">{t('Address')}</Label>
                    <Textarea
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder={t('Enter address')}
                        required
                        rows={3}
                    />
                    <InputError message={errors.address} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">{t('City')} </Label>
                        <Input
                            id="city"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder={t('Enter city')}
                            required
                        />
                        <InputError message={errors.city} />
                    </div>
                    <div>
                        <Label htmlFor="state">{t('State')}</Label>
                        <Input
                            id="state"
                            value={data.state}
                            onChange={(e) => setData('state', e.target.value)}
                            placeholder={t('Enter state')}
                            required
                        />
                        <InputError message={errors.state} />
                    </div>
                    <div>
                        <Label htmlFor="country">{t('Country')}</Label>
                        <Input
                            id="country"
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            placeholder={t('Enter country')}
                            required
                        />
                        <InputError message={errors.country} />
                    </div>
                    <div>
                        <Label htmlFor="postal_code">{t('Postal Code')}</Label>
                        <Input
                            id="postal_code"
                            value={data.postal_code}
                            onChange={(e) => setData('postal_code', e.target.value)}
                            placeholder={t('Enter postal code')}
                            required
                        />
                        <InputError message={errors.postal_code} />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Enter description')}
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

                <div>
                    <Label htmlFor="is_active">{t('Status')}</Label>
                    <div className="flex items-center space-x-2 mt-2">
                        <Switch
                            id="is_active"
                            checked={data.is_active === true}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active" className="text-sm font-normal">
                            {data.is_active === true ? t('Active') : t('Inactive')}
                        </Label>
                    </div>
                    <InputError message={errors.is_active} />
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