import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ShoppingCart, CheckCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputError } from '@/components/ui/input-error';

interface SalesQuotation {
    id: number;
    quotation_number: string;
    quotation_date: string;
    due_date: string;
    customer_id?: number | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_address?: string | null;
    customer?: { id: number; name: string; email?: string; phone?: string; address?: string } | null;
    total_amount: number;
    sales_order_id?: number | null;
    status: string;
}

interface ConvertToSalesOrderModalProps {
    quotation: SalesQuotation;
    customers?: Array<{ id: number; name: string; email?: string }>;
    users?: Array<{ id: number; name: string }>;
    userGroups?: Array<{ id: number; name: string }>;
    buttonClassName?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function ConvertToSalesOrderModal({
    quotation,
    customers = [],
    users = [],
    userGroups = [],
    buttonClassName,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange
}: ConvertToSalesOrderModalProps) {
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = externalOnOpenChange || setInternalOpen;

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const existingCustomerId = quotation?.customer_id || quotation?.customer?.id;

    const availableCustomers = useMemo(() => {
        const list = [...(customers || [])];
        if (existingCustomerId) {
            const found = list.some(c => String(c.id) === String(existingCustomerId));
            if (!found) {
                list.unshift({
                    id: existingCustomerId,
                    name: quotation.customer?.name || quotation.customer_name || `${t('Customer')} #${existingCustomerId}`,
                    email: quotation.customer?.email || quotation.customer_email || ''
                });
            }
        }
        return list;
    }, [customers, quotation, existingCustomerId, t]);

    const [formData, setFormData] = useState({
        order_name: quotation.quotation_number ? `${t('Order for')} ${quotation.quotation_number}` : '',
        customer_check: existingCustomerId ? 'exist' : (quotation.customer_name ? 'new' : 'exist'),
        customer_id: existingCustomerId ? String(existingCustomerId) : '',
        customer_name: quotation.customer?.name || quotation.customer_name || '',
        customer_email: quotation.customer?.email || quotation.customer_email || '',
        customer_phone: quotation.customer?.phone || quotation.customer_phone || '',
        customer_address: quotation.customer?.address || quotation.customer_address || '',
        assignment_check: 'none',
        assigned_user_id: '',
        assigned_group_id: '',
    });

    useEffect(() => {
        if (isOpen && quotation) {
            const extId = quotation.customer_id || quotation.customer?.id;
            setFormData({
                order_name: quotation.quotation_number ? `${t('Order for')} ${quotation.quotation_number}` : '',
                customer_check: extId ? 'exist' : (quotation.customer_name ? 'new' : 'exist'),
                customer_id: extId ? String(extId) : '',
                customer_name: quotation.customer?.name || quotation.customer_name || '',
                customer_email: quotation.customer?.email || quotation.customer_email || '',
                customer_phone: quotation.customer?.phone || quotation.customer_phone || '',
                customer_address: quotation.customer?.address || quotation.customer_address || '',
                assignment_check: 'none',
                assigned_user_id: '',
                assigned_group_id: '',
            });
            setErrors({});
        }
    }, [isOpen, quotation, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const payload: Record<string, any> = {
            customer_type: formData.customer_check === 'exist' ? 'existing' : (formData.customer_check === 'new' ? 'new' : 'existing'),
        };

        if (formData.customer_check === 'exist') {
            payload.customer_id = formData.customer_id;
        } else if (formData.customer_check === 'new') {
            payload.customer_name = formData.customer_name;
            payload.customer_email = formData.customer_email;
            payload.customer_phone = formData.customer_phone;
            payload.customer_address = formData.customer_address;
        }

        if (formData.assignment_check === 'user' && formData.assigned_user_id) {
            payload.assigned_user_id = formData.assigned_user_id;
        } else if (formData.assignment_check === 'group' && formData.assigned_group_id) {
            payload.assigned_group_id = formData.assigned_group_id;
        }

        router.post(route('quotations.convert-to-sales-order', quotation.id), payload, {
            onSuccess: () => {
                setIsOpen(false);
                setErrors({});
                setProcessing(false);
            },
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            }
        });
    };

    if (quotation.sales_order_id && !externalOpen) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link href={route('salesorder.orders.show', quotation.sales_order_id)}>
                            <Button size="sm" variant={buttonClassName ? 'ghost' : 'default'} className={buttonClassName || "text-blue-600 border-blue-200 hover:bg-blue-50"}>
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span className="font-normal">{t('Already Converted To Sales Order')}</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            {trigger ? (
                                trigger
                            ) : (
                                <Button size="sm" variant={buttonClassName ? 'ghost' : 'default'} className={buttonClassName || "bg-primary text-primary-foreground hover:bg-primary/90"}>
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    {t('Convert to Sales Order')}
                                </Button>
                            )}
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span className="font-normal">{t('Convert Quotation to Sales Order')}</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        {t('Convert Quotation to Sales Order')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Selection Section */}
                    <div className="space-y-3">
                        <Label className="font-semibold text-base">{t('Customer Options')}</Label>
                        <RadioGroup
                            value={formData.customer_check}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, customer_check: val }))}
                            className="flex items-center space-x-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="exist" id="exist_cust" />
                                <Label htmlFor="exist_cust" className="cursor-pointer">{t('Existing Customer')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="new_cust" />
                                <Label htmlFor="new_cust" className="cursor-pointer">{t('New Customer')}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {formData.customer_check === 'exist' ? (
                            <div className="col-span-2">
                                <Label htmlFor="customer_id">{t('Select Customer')}</Label>
                                <Select
                                    value={formData.customer_id}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, customer_id: val }))}
                                >
                                    <SelectTrigger id="customer_id">
                                        <SelectValue placeholder={t('Select Customer')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCustomers?.map((client) => (
                                            <SelectItem key={client.id} value={String(client.id)}>
                                                {client.name} {client.email ? `(${client.email})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.customer_id} />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <Label htmlFor="customer_name">{t('Customer Name')}</Label>
                                    <Input
                                        id="customer_name"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                        placeholder={t('Enter Customer Name')}
                                        required
                                    />
                                    <InputError message={errors.customer_name} />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">{t('Customer Email')}</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                                        placeholder={t('Enter Customer Email')}
                                    />
                                    <InputError message={errors.customer_email} />
                                </div>
                                <div>
                                    <Label htmlFor="customer_phone">{t('Customer Phone')}</Label>
                                    <Input
                                        id="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                                        placeholder={t('Enter Customer Phone')}
                                    />
                                    <InputError message={errors.customer_phone} />
                                </div>
                                <div>
                                    <Label htmlFor="customer_address">{t('Billing Address')}</Label>
                                    <Input
                                        id="customer_address"
                                        value={formData.customer_address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                                        placeholder={t('Enter Address')}
                                    />
                                    <InputError message={errors.customer_address} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Assignment Options Section */}
                    <div className="space-y-3 pt-2 border-t">
                        <Label className="font-semibold text-base">{t('Order Assignment')}</Label>
                        <RadioGroup
                            value={formData.assignment_check}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, assignment_check: val }))}
                            className="flex items-center space-x-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="none_assign" />
                                <Label htmlFor="none_assign" className="cursor-pointer">{t('Unassigned')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="group" id="group_assign" />
                                <Label htmlFor="group_assign" className="cursor-pointer">{t('User Group')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="user" id="user_assign" />
                                <Label htmlFor="user_assign" className="cursor-pointer">{t('Specific User')}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {formData.assignment_check === 'group' && (
                            <div className="col-span-2">
                                <Label htmlFor="assigned_group_id">{t('User Group')}</Label>
                                <Select
                                    value={formData.assigned_group_id}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, assigned_group_id: val }))}
                                >
                                    <SelectTrigger id="assigned_group_id">
                                        <SelectValue placeholder={t('Select User Group')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userGroups?.map((group) => (
                                            <SelectItem key={group.id} value={String(group.id)}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.assignment_check === 'user' && (
                            <div className="col-span-2">
                                <Label htmlFor="assigned_user_id">{t('Assigned User')}</Label>
                                <Select
                                    value={formData.assigned_user_id}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, assigned_user_id: val }))}
                                >
                                    <SelectTrigger id="assigned_user_id">
                                        <SelectValue placeholder={t('Select User')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? t('Converting...') : t('Convert')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
