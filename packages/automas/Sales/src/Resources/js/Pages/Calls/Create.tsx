import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectEnhanced } from "@/components/ui/multi-select-enhanced";
import { DateTimeRangePicker } from "@/components/ui/datetime-range-picker";
import InputError from "@/components/ui/input-error";
import { useFormFields } from '@/hooks/useFormFields';
import { CreateSalesCallProps, CreateSalesCallFormData } from './types';
import { useState, useEffect } from 'react';

export default function Create({ onSuccess, users = [], accounts = [], defaultAccountId, defaultParentType, defaultParentId }: CreateSalesCallProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const { data, setData, post, processing, errors } = useForm<CreateSalesCallFormData>({
        name: '',
        status: 'scheduled',
        start_date: '',
        end_date: '',
        direction: 'outbound',
        parent_type: defaultParentType || '',
        parent_id: defaultParentId || null,

        account_id: defaultAccountId || null,
        assigned_user_id: null,
        description: '',
        attendees_users: [],
        attendees_contacts: []
    });

    const [parentUsers, setParentUsers] = useState([]);
    const [localAccounts, setLocalAccounts] = useState(accounts);
    const [localUsers, setLocalUsers] = useState(users);
    const [contacts, setContacts] = useState([]);
    const [parentOptions, setParentOptions] = useState([]);

    // Calendar sync fields
    const calendarFields = useFormFields('getCalendarSyncFields', data, setData, errors, 'create', t, 'Sales');

    // AI hooks for name and description fields
    const nameAI = useFormFields('aiField', data, setData, errors, 'create', 'name', 'Name', 'sales', 'call');
    const descriptionAI = useFormFields('aiField', data, setData, errors, 'create', 'description', 'Description', 'sales', 'call');

    const formFields = useFormFields('salesCall', data, setData, errors);

    useEffect(() => {
        // Fetch initial data
        fetchAccounts();
        fetchUsers();
        fetchContacts();
        fetchParentOptions();
    }, []);

    useEffect(() => {
        if (data.parent_type) {
            fetchParentUsers();
        } else {
            setParentUsers([]);
        }
    }, [data.parent_type]);

    const fetchAccounts = async () => {
        try {
            const response = await fetch(`${route('sales.calls.parent-users')}?parent_type=account`);
            const result = await response.json();
            setLocalAccounts(result || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(route('sales.calls.users'));
            const result = await response.json();
            setLocalUsers(result || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await fetch(`${route('sales.calls.parent-users')}?parent_type=contact`);
            const result = await response.json();
            setContacts(result || []);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    const fetchParentOptions = async () => {
        try {
            const response = await fetch(route('sales.calls.parent-options'));
            const result = await response.json();
            setParentOptions(result || []);
        } catch (error) {
            console.error('Failed to fetch parent options:', error);
        }
    };

    const fetchParentUsers = async () => {
        try {
            const response = await fetch(`${route('sales.calls.parent-users')}?parent_type=${data.parent_type}`);
            const result = await response.json();
            setParentUsers(result || []);
        } catch (error) {
            console.error('Failed to fetch parent users:', error);
        }
    };

    const handleParentTypeChange = (value: string) => {
        setData({
            ...data,
            parent_type: value,
            parent_id: null
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.calls.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>{t('Create Call')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter call name')}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="status">{t('Status')}</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scheduled">{t('Scheduled')}</SelectItem>
                                <SelectItem value="in_progress">{t('In Progress')}</SelectItem>
                                <SelectItem value="completed">{t('Completed')}</SelectItem>
                                <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label required>{t('Start Date')}</Label>
                        <DateTimeRangePicker
                            value={data.start_date}
                            onChange={(value) => setData('start_date', value)}
                            placeholder={t('Select start date and time')}
                            mode="single"
                        />
                        <InputError message={errors.start_date} />
                    </div>
                    <div>
                        <Label required>{t('End Date')}</Label>
                        <DateTimeRangePicker
                            value={data.end_date}
                            onChange={(value) => setData('end_date', value)}
                            placeholder={t('Select end date and time')}
                            mode="single"
                        />
                        <InputError message={errors.end_date} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="direction">{t('Direction')}</Label>
                        <Select value={data.direction} onValueChange={(value) => setData('direction', value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inbound">{t('Inbound')}</SelectItem>
                                <SelectItem value="outbound">{t('Outbound')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.direction} />
                    </div>
                    <div>
                        <Label htmlFor="parent_type">{t('Parent Type')}</Label>
                        <Select value={data.parent_type || ''} onValueChange={handleParentTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select parent type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {parentOptions.map((option) => (
                                    <SelectItem key={option.type} value={option.type}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.parent_type} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="parent_id">{t('Parent Record')}</Label>
                        <Select value={data.parent_id?.toString() || ''} onValueChange={(value) => setData('parent_id', value ? parseInt(value) : null)} disabled={!data.parent_type}>
                            <SelectTrigger>
                                <SelectValue placeholder={data.parent_type ? `Select ${data.parent_type}` : 'Select parent type first'} />
                            </SelectTrigger>
                            <SelectContent>
                                {parentUsers.length > 0 ? parentUsers.map((record: any) => (
                                    <SelectItem key={record.id} value={record.id.toString()}>
                                        {record.name}
                                    </SelectItem>
                                )) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No records available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.parent_id} />
                    </div>
                    <div>
                        <Label htmlFor="account_id">{t('Account')}</Label>
                        <Select value={data.account_id?.toString() || ''} onValueChange={(value) => setData('account_id', value ? parseInt(value) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select account')} />
                            </SelectTrigger>
                            <SelectContent>
                                {localAccounts.length > 0 ? localAccounts.map((account: any) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                        {account.name}
                                    </SelectItem>
                                )) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No accounts available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.account_id} />
                    </div>
                </div>

                {(auth.user?.permissions?.includes('manage-any-users') || auth.user?.permissions?.includes('manage-own-users')) && users && (
                    <div>
                        <Label htmlFor="assigned_user_id">{t('Assigned User')}</Label>
                        <Select value={data.assigned_user_id?.toString() || ''} onValueChange={(value) => setData('assigned_user_id', value ? parseInt(value) : null)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select user')} />
                            </SelectTrigger>
                            <SelectContent>
                                {users && users.length > 0 ? (
                                    users.map((user: any) => (
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
                        <InputError message={errors.assigned_user_id} />
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

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">{t('Attendees')}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="attendees_users">{t('Attendees Users')}</Label>
                            <MultiSelectEnhanced
                                options={localUsers.map((user: any) => ({
                                    value: user.id.toString(),
                                    label: user.name
                                }))}
                                value={data.attendees_users.map(id => id.toString())}
                                onValueChange={(value) => setData('attendees_users', value.map(v => parseInt(v)))}
                                placeholder={t('Select Users')}
                            />
                            <InputError message={errors.attendees_users} />
                        </div>

                        <div>
                            <Label htmlFor="attendees_contacts">{t('Attendees Contacts')}</Label>
                            <MultiSelectEnhanced
                                options={contacts.map((contact: any) => ({
                                    value: contact.id.toString(),
                                    label: contact.name
                                }))}
                                value={data.attendees_contacts.map(id => id.toString())}
                                onValueChange={(value) => setData('attendees_contacts', value.map(v => parseInt(v)))}
                                placeholder={t('Select Contacts')}
                            />
                            <InputError message={errors.attendees_contacts} />
                        </div>
                    </div>
                </div>

                {/* Calendar Sync Fields */}
                {calendarFields.map((field) => (
                    <div key={field.id}>
                        {field.component}
                    </div>
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