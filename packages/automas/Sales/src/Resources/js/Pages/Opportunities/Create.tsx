import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from '@/components/ui/currency-input';
import InputError from "@/components/ui/input-error";
import { CreateOpportunityProps, CreateOpportunityFormData } from './types';
import { useFormFields } from '@/hooks/useFormFields';

export default function Create({ onSuccess, accounts, contacts, stages, users, selectedStageId, defaultAccountId, defaultContactId }: CreateOpportunityProps) {
    const { t } = useTranslation();
    const { auth } = usePage<any>().props;
    const { data, setData, post, processing, errors, reset } = useForm<CreateOpportunityFormData>({
        name: '',
        account_id: defaultAccountId ? defaultAccountId.toString() : '',
        contact_id: defaultContactId ? defaultContactId.toString() : '',
        stage_id: selectedStageId ? selectedStageId.toString() : (stages && stages.length > 0 ? stages[0].id.toString() : ''),
        amount: 0,
        expected_amount: 0,
        lead_source: '',
        probability: [50],
        close_date: new Date().toISOString().split('T')[0],
        next_followup_date: '',
        next_step: '',
        lost_reason: '',
        assign_user_id: null,
        description: '',
        is_active: true,
    });

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Opportunity' }, setData, errors, 'create', t);

    // Filter contacts based on selected account
    const filteredContacts = data.account_id 
        ? contacts?.filter((contact: any) => contact.account_id?.toString() === data.account_id)
        : contacts;

    // Calculate expected amount automatically
    useEffect(() => {
        const calculatedExpectedAmount = (data.amount * data.probability[0]) / 100;
        setData('expected_amount', parseFloat(calculatedExpectedAmount.toFixed(2)));
    }, [data.amount, data.probability]);

    // Update stage_id when selectedStageId prop changes
    useEffect(() => {
        if (selectedStageId) {
            setData('stage_id', selectedStageId.toString());
        }
    }, [selectedStageId, setData]);
    
    // Update account_id when defaultAccountId prop changes
    useEffect(() => {
        if (defaultAccountId) {
            setData('account_id', defaultAccountId.toString());
        }
    }, [defaultAccountId, setData]);
    
    // Update contact_id when defaultContactId prop changes
    useEffect(() => {
        if (defaultContactId) {
            setData('contact_id', defaultContactId.toString());
        }
    }, [defaultContactId, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sales.opportunities.store'), {
            onSuccess: () => {
                reset();
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{t('Create Opportunity')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Enter opportunity name')}
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
                        <Select value={data.contact_id} onValueChange={(value) => setData('contact_id', value)} disabled={!!defaultContactId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Contact')} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredContacts && filteredContacts.length > 0 ? (
                                    filteredContacts.map((contact) => (
                                    <SelectItem key={contact.id} value={contact.id.toString()}>
                                        {contact.name}
                                    </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-contacts" disabled>
                                        {data.account_id ? t('No contacts for this account') : t('Select an account first')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.contact_id} />
                    </div>
                    <div>
                        <Label htmlFor="stage_id">{t('Stage')}</Label>
                        <Select value={data.stage_id} onValueChange={(value) => setData('stage_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Stage')} />
                            </SelectTrigger>
                            <SelectContent>
                                {stages && stages.length > 0 ? (
                                    stages.map((stage: any) => (
                                        <SelectItem key={stage.id} value={stage.id.toString()}>
                                            {stage.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-data" disabled>
                                        {t('No Stages available')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.stage_id} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <CurrencyInput
                            label={t('Amount')}
                            value={data.amount.toString()}
                            onChange={(value) => setData('amount', parseFloat(value) || 0)}
                            error={errors.amount}
                            required
                        />
                    </div>
                    <div>
                        <CurrencyInput
                            label={t('Expected Amount')}
                            value={data.expected_amount.toString()}
                            onChange={(value) => setData('expected_amount', parseFloat(value) || 0)}
                            error={errors.expected_amount}
                            disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('Auto-calculated: Amount × Probability')}
                        </p>
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
                        <Label>{t('Close Date')}</Label>
                        <DatePicker
                            value={data.close_date}
                            onChange={(value) => setData('close_date', value)}
                            placeholder={t('Select close date')}
                        />
                        <InputError message={errors.close_date} />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>{t('Probability')} ({data.probability[0]}%)</Label>
                    <Slider
                        value={data.probability}
                        onValueChange={(value) => setData('probability', value)}
                        max={100}
                        step={1}
                        className="mt-2"
                    />
                    <InputError message={errors.probability} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {(auth.user?.permissions?.includes('manage-any-users') || auth.user?.permissions?.includes('manage-own-users')) && users && (
                        <div>
                            <Label htmlFor="assign_user_id">{t('Assigned User')}</Label>
                            <Select value={data.assign_user_id?.toString() || ''} onValueChange={(value) => setData('assign_user_id', value ? parseInt(value) : null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select User')} />
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
                            <InputError message={errors.assign_user_id} />
                        </div>
                    )}
                    <div>
                        <Label>{t('Next Followup Date')}</Label>
                        <DatePicker
                            value={data.next_followup_date}
                            onChange={(value) => setData('next_followup_date', value)}
                            placeholder={t('Select next followup date')}
                        />
                        <InputError message={errors.next_followup_date} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="next_step">{t('Next Step')}</Label>
                        <Input
                            id="next_step"
                            value={data.next_step}
                            onChange={(e) => setData('next_step', e.target.value)}
                            placeholder={t('Enter next step')}
                        />
                        <InputError message={errors.next_step} />
                    </div>
                    <div>
                        <Label htmlFor="lost_reason">{t('Lost Reason')}</Label>
                        <Input
                            id="lost_reason"
                            value={data.lost_reason}
                            onChange={(e) => setData('lost_reason', e.target.value)}
                            placeholder={t('Enter lost reason')}
                        />
                        <InputError message={errors.lost_reason} />
                    </div>
                </div>

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
                        {processing ? t('Creating...') : t('Create')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}