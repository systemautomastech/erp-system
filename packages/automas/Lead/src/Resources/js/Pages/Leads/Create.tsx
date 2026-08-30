import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInputComponent } from '@/components/ui/phone-input';
import { DateTimeRangePicker } from '@/components/ui/datetime-range-picker';
import { CreateLeadProps, CreateLeadFormData } from './types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '@/utils/helpers';
import { useFormFields } from '@/hooks/useFormFields';
import { MultiSelectEnhanced } from '@/components/ui/multi-select-enhanced';


export default function Create({ onSuccess }: CreateLeadProps) {
    const { users, sources, subjects, auth, pipelines } = usePage<any>().props;
    const [stages, setStages] = useState<any[]>([]);

    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<CreateLeadFormData>({
        subject: '',
        user_id: auth?.user?.id ? auth.user.id.toString() : '',
        name: '',
        email: '',
        phone: '',
        sources: [],
        date: '',
        pipeline_id: '',
        stage_id: '',
    });

    useEffect(() => {
        if (data.pipeline_id) {
            fetch(route('lead.stages.by-pipeline', data.pipeline_id))
                .then(res => res.json())
                .then(stageList => {
                    setStages(stageList || []);
                })
                .catch(() => setStages([]));
        } else {
            setStages([]);
        }
    }, [data.pipeline_id]);

    const nameAI = useFormFields('aiField', data, setData, errors, 'create', 'name', 'Name', 'lead', 'lead');
    const subjectAI = useFormFields('aiField', data, setData, errors, 'create', 'subject', 'Subject', 'lead', 'lead');
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Lead', sub_module: 'Lead' }, setData, errors, 'create', t);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('lead.leads.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>{t('Create Lead')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Label htmlFor="name">{t('Name')}</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('Enter Name')}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        {nameAI.map(field => <div key={field.id}>{field.component}</div>)}
                    </div>

                    <div>
                        <Label htmlFor="email">{t('Email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('Enter Email')}
                        />
                        <InputError message={errors.email} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="subject" required>{t('Subject')}</Label>
                        <Select value={data.subject} onValueChange={(value) => setData('subject', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Subject')} />
                            </SelectTrigger>
                            <SelectContent searchable>
                                {Array.isArray(subjects) ? (
                                    subjects.map((item: any) => (
                                        <SelectItem key={item.id ?? item.name ?? item} value={item.name ?? item}>
                                            {item.name ?? item}
                                        </SelectItem>
                                    ))
                                ) : (
                                    Object.entries(subjects || {}).map(([id, name]: [string, any]) => (
                                        <SelectItem key={id} value={typeof name === 'string' ? name : (name?.name ?? id)}>
                                            {typeof name === 'string' ? name : (name?.name ?? id)}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.subject} />
                    </div>

                    <div>
                        <Label htmlFor="user_id" required>{t('User')}</Label>
                        <Select value={data.user_id?.toString() || ''} onValueChange={(value) => setData('user_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select User')} />
                            </SelectTrigger>
                            <SelectContent searchable>
                                {users?.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.user_id} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <PhoneInputComponent
                            label={t('Phone No')}
                            value={data.phone}
                            onChange={(value) => setData('phone', value || '')}
                            error={errors.phone}
                        />
                    </div>

                    <div>
                        <Label>{t('Follow Up Date')}</Label>
                        <DateTimeRangePicker
                            value={data.date}
                            onChange={(date) => setData('date', date)}
                            placeholder={t('Select Follow Up Date & Time')}
                            mode="single"
                        />
                        <InputError message={errors.date} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="pipeline_id">{t('Pipeline')}</Label>
                        <Select
                            value={data.pipeline_id || ''}
                            onValueChange={(value) => {
                                setData(prev => ({ ...prev, pipeline_id: value, stage_id: '' }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select Pipeline')} />
                            </SelectTrigger>
                            <SelectContent searchable>
                                {pipelines?.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.pipeline_id} />
                    </div>

                    <div>
                        <Label htmlFor="stage_id">{t('Stage')}</Label>
                        <Select
                            value={data.stage_id || ''}
                            onValueChange={(value) => setData('stage_id', value)}
                            disabled={!data.pipeline_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={data.pipeline_id ? t('Select Stage') : t('Select Pipeline first')} />
                            </SelectTrigger>
                            <SelectContent searchable>
                                {stages?.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.stage_id} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="sources">
                            {t('Sources')}
                        </Label>

                        <MultiSelectEnhanced
                            options={
                                Array.isArray(sources)
                                    ? sources.map((source: any) => ({
                                        value: String(source.id),
                                        label: String(source.name ?? ''),
                                    }))
                                    : Object.entries(sources || {}).map(
                                        ([id, source]: [string, any]) => ({
                                            value: String(
                                                source?.id ?? id
                                            ),
                                            label: String(
                                                source?.name ??
                                                source ??
                                                ''
                                            ),
                                        })
                                    )
                            }
                            value={
                                Array.isArray(data.sources)
                                    ? data.sources.map(String)
                                    : []
                            }
                            onValueChange={(values) =>
                                setData('sources', values)
                            }
                            placeholder={t('Select Sources')}
                            searchable
                        />

                        <InputError message={errors.sources} />
                    </div>
                </div>

                {customFields.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {customFields.map((field) => (
                                <div key={field.id}>
                                    {field.component}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
