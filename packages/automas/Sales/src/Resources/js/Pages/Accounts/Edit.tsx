import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import InputError from "@/components/ui/input-error";
import { PhoneInputComponent } from "@/components/ui/phone-input";
import { Account, AccountFormData, EditAccountProps } from './types';

export default function Edit({ account, onSuccess, users, accountTypes, accountIndustries, documents = [] }: EditAccountProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm<AccountFormData>({
        name: account.name,
        email: account.email,
        phone: account.phone,
        website: account.website || '',
        billing_address: {
            address: account.billing_address || '',
            city: account.billing_city || '',
            state: account.billing_state || '',
            country: account.billing_country || '',
            postal_code: account.billing_postal_code || ''
        },
        shipping_address: {
            address: account.shipping_address || '',
            city: account.shipping_city || '',
            state: account.shipping_state || '',
            country: account.shipping_country || '',
            postal_code: account.shipping_postal_code || ''
        },
        same_as_billing: account.billing_address === account.shipping_address && 
                        account.billing_city === account.shipping_city &&
                        account.billing_state === account.shipping_state &&
                        account.billing_country === account.shipping_country &&
                        account.billing_postal_code === account.shipping_postal_code,
        assign_user_id: account.assign_user_id?.toString() || null,
        type_id: account.type_id?.toString() || '',
        industry_id: account.industry_id?.toString() || '',
        sales_document_id: account.sales_document_id?.toString() || '',
        description: account.description || '',
        is_active: account.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.accounts.update', account.id), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{t('Edit Account')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="name">{t('Account Name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter account name')}
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="email">{t('Email')}</Label>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="website">{t('Website')}</Label>
                        <Input
                            id="website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder={t('Enter website URL')}
                        />
                        <InputError message={errors.website} />
                    </div>
                    <div>
                        <Label htmlFor="type_id">{t('Account Type')}</Label>
                        <Select value={data.type_id} onValueChange={(value) => setData('type_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {accountTypes && accountTypes.length > 0 ? (
                                    accountTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Account Types available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type_id} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="industry_id">{t('Industry')}</Label>
                        <Select value={data.industry_id} onValueChange={(value) => setData('industry_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select industry')} />
                            </SelectTrigger>
                            <SelectContent>
                                {accountIndustries && accountIndustries.length > 0 ? (
                                    accountIndustries.map((industry) => (
                                        <SelectItem key={industry.id} value={industry.id.toString()}>
                                            {industry.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Industries available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.industry_id} />
                    </div>
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
                </div>
                <div>
                    <Label htmlFor="sales_document_id">{t('Document')}</Label>
                    <Select value={data.sales_document_id} onValueChange={(value) => setData('sales_document_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('Select document')} />
                        </SelectTrigger>
                        <SelectContent>
                            {documents && documents.length > 0 ? (
                                documents.map((document) => (
                                    <SelectItem key={document.id} value={document.id.toString()}>
                                        {document.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-data" disabled>
                                    {t('No Documents available')}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.sales_document_id} />
                </div>

                <div>
                    <Label htmlFor="billing_address">{t('Billing Address')}</Label>
                    <Input
                        id="billing_address"
                        value={data.billing_address.address}
                        onChange={(e) => setData('billing_address', {...data.billing_address, address: e.target.value})}
                        placeholder={t('Enter billing address')}
                        required
                    />
                    <InputError message={errors['billing_address.address']} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="billing_city">{t('City')}</Label>
                        <Input
                            id="billing_city"
                            value={data.billing_address.city}
                            onChange={(e) => setData('billing_address', {...data.billing_address, city: e.target.value})}
                            placeholder={t('Enter city')}
                            required
                        />
                        <InputError message={errors['billing_address.city']} />
                    </div>
                    <div>
                        <Label htmlFor="billing_state">{t('State')}</Label>
                        <Input
                            id="billing_state"
                            value={data.billing_address.state}
                            onChange={(e) => setData('billing_address', {...data.billing_address, state: e.target.value})}
                            placeholder={t('Enter state')}
                            required
                        />
                        <InputError message={errors['billing_address.state']} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="billing_country">{t('Country')}</Label>
                        <Input
                            id="billing_country"
                            value={data.billing_address.country}
                            onChange={(e) => setData('billing_address', {...data.billing_address, country: e.target.value})}
                            placeholder={t('Enter country')}
                            required
                        />
                        <InputError message={errors['billing_address.country']} />
                    </div>
                    <div>
                        <Label htmlFor="billing_postal_code">{t('Postal Code')}</Label>
                        <Input
                            id="billing_postal_code"
                            value={data.billing_address.postal_code}
                            onChange={(e) => setData('billing_address', {...data.billing_address, postal_code: e.target.value})}
                            placeholder={t('Enter postal code')}
                            required
                        />
                        <InputError message={errors['billing_address.postal_code']} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="same_as_billing"
                        checked={data.same_as_billing}
                        onCheckedChange={(checked) => {
                            setData('same_as_billing', !!checked);
                            if (checked) {
                                setData('shipping_address', {
                                    address: data.billing_address.address,
                                    city: data.billing_address.city,
                                    state: data.billing_address.state,
                                    country: data.billing_address.country,
                                    postal_code: data.billing_address.postal_code
                                });
                            }
                        }}
                    />
                    <Label htmlFor="same_as_billing">{t('Shipping address same as billing')}</Label>
                </div>

                {!data.same_as_billing && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-medium">{t('Shipping Address')}</h3>
                        <div>
                            <Label htmlFor="shipping_address">{t('Shipping Address')}</Label>
                            <Input
                                id="shipping_address"
                                value={data.shipping_address.address}
                                onChange={(e) => setData('shipping_address', {...data.shipping_address, address: e.target.value})}
                                placeholder={t('Enter shipping address')}
                                required
                            />
                            <InputError message={errors['shipping_address.address']} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="shipping_city">{t('City')}</Label>
                                <Input
                                    id="shipping_city"
                                    value={data.shipping_address.city}
                                    onChange={(e) => setData('shipping_address', {...data.shipping_address, city: e.target.value})}
                                    placeholder={t('Enter city')}
                                    required
                                />
                                <InputError message={errors['shipping_address.city']} />
                            </div>
                            <div>
                                <Label htmlFor="shipping_state">{t('State')}</Label>
                                <Input
                                    id="shipping_state"
                                    value={data.shipping_address.state}
                                    onChange={(e) => setData('shipping_address', {...data.shipping_address, state: e.target.value})}
                                    placeholder={t('Enter state')}
                                    required
                                />
                                <InputError message={errors['shipping_address.state']} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="shipping_country">{t('Country')}</Label>
                                <Input
                                    id="shipping_country"
                                    value={data.shipping_address.country}
                                    onChange={(e) => setData('shipping_address', {...data.shipping_address, country: e.target.value})}
                                    placeholder={t('Enter country')}
                                    required
                                />
                                <InputError message={errors['shipping_address.country']} />
                            </div>
                            <div>
                                <Label htmlFor="shipping_postal_code">{t('Postal Code')}</Label>
                                <Input
                                    id="shipping_postal_code"
                                    value={data.shipping_address.postal_code}
                                    onChange={(e) => setData('shipping_address', {...data.shipping_address, postal_code: e.target.value})}
                                    placeholder={t('Enter postal code')}
                                    required
                                />
                                <InputError message={errors['shipping_address.postal_code']} />
                            </div>
                        </div>
                    </div>
                )}
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