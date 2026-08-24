import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useFormFields } from '@/hooks/useFormFields';
import { ProposalItem } from '@/pages/SalesProposals/types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import ProposalItemsTable from '@/pages/SalesProposals/components/ProposalItemsTable';
import { useTaxCalculator } from '@/pages/Sales/components/TaxCalculator';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputError } from '@/components/ui/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, Plus, Trash2, GripVertical, FileText, ChevronDown, ChevronRight, Check, Eye, User, Users, UserPlus, X } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import PreviewModal from '@/components/PreviewModal';
import ChargeItemsTable from './components/ChargeItemsTable';
import PageOrderSection from './components/PageOrderSection';

interface ProposalDefaultPage {
    id: number;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    sort_order: number;
}

interface SalesProposal {
    id: number;
    proposal_number: string;
    reference?: string;
    subject?: string;
    proposal_date: string;
    due_date: string;
    customer_id?: number | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_address?: string | null;
    warehouse_id?: number;
    type?: string;
    is_tax_enabled?: boolean | number;
    is_prepaid?: boolean | number;
    payment_terms?: string;
    notes?: string;
    items: any[];
    other_details?: string;
    proposal_content?: any;
}

interface EditProps {
    proposal: SalesProposal;
    customers: Array<{ id: number; name: string; email: string }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    products?: any[];
    defaultPages?: ProposalDefaultPage[];
    defaultTerms?: string | null;
    [key: string]: any;
}

export default function Edit() {
    const { t } = useTranslation();
    const { proposal, customers, warehouses, products = [], defaultPages = [], defaultTerms, proposalSetting } = usePage<EditProps>().props;
    const [availableProducts, setAvailableProducts] = useState<any[]>(Array.isArray(products) ? products : []);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Initialize proposal sections with existing proposal_content or fallback to defaultPages
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string; page_type?: string; background_image?: string; order: number; isExpanded: boolean }>>(() => {
        const contentsRel = (proposal as any).contents;
        let parsed: any[] = [];
        if (Array.isArray(contentsRel) && contentsRel.length > 0) {
            parsed = contentsRel.map((c: any) => {
                let dec: any = null;
                if (c.proposal_content) {
                    try {
                        dec = typeof c.proposal_content === 'string' ? JSON.parse(c.proposal_content) : c.proposal_content;
                    } catch (e) { }
                }

                if (dec && typeof dec === 'object' && !Array.isArray(dec)) {
                    return {
                        title: dec.title || c.title || '',
                        content: dec.content || c.proposal_content || '',
                        page_type: dec.page_type || c.page_type || 'content',
                        background_image: dec.background_image || c.background_image || '',
                        order: typeof c.order !== 'undefined' ? Number(c.order) : (typeof dec.order !== 'undefined' ? Number(dec.order) : 1),
                    };
                }

                return {
                    title: c.title || '',
                    content: c.proposal_content || '',
                    page_type: c.page_type || 'content',
                    background_image: c.background_image || '',
                    order: typeof c.order !== 'undefined' ? Number(c.order) : 1,
                };
            });
        } else {
            const rawContent = (proposal as any).proposal_content || (proposal as any).others;
            if (typeof rawContent === 'string') {
                try {
                    parsed = JSON.parse(rawContent);
                } catch (e) {
                    parsed = [];
                }
            } else if (Array.isArray(rawContent)) {
                parsed = rawContent;
            }
        }

        if (parsed.length === 0 && defaultPages && defaultPages.length > 0) {
            parsed = defaultPages.map((p, idx) => ({
                title: p.title,
                content: p.content || '',
                page_type: p.page_type || 'content',
                background_image: p.background_image || '',
                order: Number(p.sort_order) || idx + 1,
            }));
        }

        parsed.sort((a: any, b: any) => {
            const orderA = typeof a.order === 'number' ? a.order : (parseInt(a.order, 10) || 0);
            const orderB = typeof b.order === 'number' ? b.order : (parseInt(b.order, 10) || 0);
            return orderA - orderB;
        });

        return parsed.map((item: any, idx: number) => ({
            id: `sec-${idx}-${Date.now()}`,
            title: item.title || (item.page_type === 'otc' ? 'One-Time Charges (OTC)' : item.page_type === 'mrc' ? 'Monthly Recurring Charges (MRC)' : item.page_type === 'other-details' ? 'Other Details' : `Page ${idx + 1}`),
            content: item.content || '',
            page_type: item.page_type || 'content',
            background_image: item.background_image || '',
            order: typeof item.order === 'number' ? item.order : (parseInt(item.order, 10) || (idx + 1)),
            isExpanded: false,
        }));
    });

    useFlashMessages();
    const { data, setData, put, processing, errors, transform } = useForm({
        proposal_id: proposal.id ? proposal.id.toString() : '',
        reference: proposal.reference || '',
        subject: proposal.subject || '',
        invoice_date: proposal.proposal_date || new Date().toISOString().split('T')[0],
        due_date: proposal.due_date || '',
        customer_id: proposal.customer_id ? proposal.customer_id.toString() : '',
        customer_mode: !proposal.customer_id && (proposal.customer_name || proposal.customer_email) ? 'new' : 'existing',
        customer_name: proposal.customer_name || '',
        customer_email: proposal.customer_email || '',
        customer_phone: proposal.customer_phone || '',
        customer_address: proposal.customer_address || '',
        warehouse_id: proposal.warehouse_id ? proposal.warehouse_id.toString() : '',
        type: proposal.type || 'product',
        is_tax_enabled: proposal.is_tax_enabled !== undefined ? Boolean(proposal.is_tax_enabled) : true,
        is_prepaid: proposal.is_prepaid !== undefined ? Boolean(proposal.is_prepaid) : false,
        payment_terms: proposal.payment_terms || '',
        notes: proposal.notes || '',
        items: (proposal.items && proposal.items.length > 0) ? proposal.items.map(item => ({
            ...item,
            section: item.section || 'general',
            product_type: item.product_type || proposal.type || 'product',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            discount_percentage: item.discount_percentage || 0,
            discount_amount: item.discount_amount || 0,
            tax_percentage: item.tax_percentage || 0,
            tax_amount: item.tax_amount || 0,
            total_amount: item.total_amount || 0,
        })) : [{
            product_id: 0,
            section: 'general',
            product_type: 'product',
            product_description: '',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0
        }] as ProposalItem[],
        proposal_content: [],
        other_details: proposal.other_details || '',
    });

    // Auto-sync OTC, MRC, and Other Details section cards into Page Order list when products exist in those tables
    useEffect(() => {
        const hasOtcItems = data.items.some(
            (i) => (i.section === 'otc' || i.section === 'general' || !i.section) && (Number(i.product_id) > 0 || Number(i.unit_price) > 0 || Boolean(i.product_description))
        );
        const hasMrcItems = data.items.some(
            (i) => i.section === 'mrc' && (Number(i.product_id) > 0 || Number(i.unit_price) > 0 || Boolean(i.product_description))
        );

        const hasOtherDetails = Boolean(data.other_details && data.other_details.trim() !== '' && data.other_details !== '<p></p>');

        setSections((prev) => {
            let updated = [...prev];
            let changed = false;

            // OTC Card
            const otcIdx = updated.findIndex((s) => s.page_type === 'otc');
            if (hasOtcItems && otcIdx === -1) {
                updated.push({
                    id: `sec-otc-${Date.now()}`,
                    title: 'One-Time Charges (OTC)',
                    content: '[OTC_CHARGES_TABLE]',
                    page_type: 'otc',
                    order: updated.length + 1,
                    isExpanded: false,
                });
                changed = true;
            } else if (!hasOtcItems && otcIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'otc');
                changed = true;
            }

            // MRC Card
            const mrcIdx = updated.findIndex((s) => s.page_type === 'mrc');
            if (hasMrcItems && mrcIdx === -1) {
                updated.push({
                    id: `sec-mrc-${Date.now()}`,
                    title: 'Monthly Recurring Charges (MRC)',
                    content: '[MRC_CHARGES_TABLE]',
                    page_type: 'mrc',
                    order: updated.length + 1,
                    isExpanded: false,
                });
                changed = true;
            } else if (!hasMrcItems && mrcIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'mrc');
                changed = true;
            }

            // Other Details Card
            const otherIdx = updated.findIndex((s) => s.page_type === 'other-details');
            if (hasOtherDetails && otherIdx === -1) {
                updated.push({
                    id: `sec-other-${Date.now()}`,
                    title: 'Other Details',
                    content: '[OTHER_DETAILS_CONTENT]',
                    page_type: 'other-details',
                    order: updated.length + 1,
                    isExpanded: false,
                });
                changed = true;
            } else if (!hasOtherDetails && otherIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'other-details');
                changed = true;
            }

            if (!changed) return prev;
            return updated.map((item, idx) => ({ ...item, order: idx + 1 }));
        });
    }, [data.items, data.other_details]);

    // Selected Customer Details
    const selectedCustomer: any = customers?.find((c: any) => String(c.id) === String(data.customer_id));

    // Get custom fields using useFormFields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'General', sub_module: 'Proposal', id: proposal.id }, setData, errors, 'edit', t);

    const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

    const refreshProducts = async () => {
        setIsRefreshingProducts(true);
        const startTime = Date.now();
        try {
            const url = data.warehouse_id
                ? route('sales-proposals.warehouse.products') + `?warehouse_id=${data.warehouse_id}`
                : route('sales-proposals.warehouse.products');
            const response = await fetch(url);
            const warehouseProducts = await response.json();
            setAvailableProducts(Array.isArray(warehouseProducts) ? warehouseProducts : []);
        } catch (error) {
            console.error('Failed to refresh products:', error);
        } finally {
            const elapsed = Date.now() - startTime;
            if (elapsed < 500) {
                setTimeout(() => setIsRefreshingProducts(false), 500 - elapsed);
            } else {
                setIsRefreshingProducts(false);
            }
        }
    };

    const handleWarehouseChange = async (warehouseId: string) => {
        setData('warehouse_id', warehouseId);

        try {
            const url = warehouseId
                ? route('sales-proposals.warehouse.products') + `?warehouse_id=${warehouseId}`
                : route('sales-proposals.warehouse.products');
            const response = await fetch(url);
            const warehouseProducts = await response.json();
            setAvailableProducts(Array.isArray(warehouseProducts) ? warehouseProducts : []);
        } catch (error) {
            console.error('Failed to fetch warehouse products:', error);
            setAvailableProducts([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            proposal_content: sections.map((item, index) => ({
                title: item.title,
                content: item.content,
                page_type: item.page_type || 'content',
                background_image: item.background_image || '',
                order: index + 1,
            })),
        }));

        put(route('sales-proposals.update', proposal.id));
    };

    const totals = useTaxCalculator(data.items);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposal'), url: route('sales-proposals.index') },
                { label: t('Edit') }
            ]}
            pageTitle={t('Edit Sales Proposal')}
        >
            <Head title={t('Edit Sales Proposal')} />

            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5" />
                                {t('Sales Proposal Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 border-b pb-4 items-start">
                                <div className="w-full md:w-64 shrink-0">
                                    <Label htmlFor="proposal_number">{t('Proposal Number')}</Label>
                                    <Input
                                        id="proposal_number"
                                        value={proposal.proposal_number || `PROP-${proposal.id}`}
                                        readOnly
                                        className="bg-muted cursor-not-allowed font-mono text-xs"
                                    />
                                </div>

                                <div className="w-full flex-1">
                                    <Label htmlFor="subject">{t('Subject')}</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder={t('e.g., Quotation for IP PABX Service')}
                                    />
                                    <InputError message={errors.subject} />
                                </div>
                            </div>

                            {/* Row 2: Customer, Proposal Date, Due Date, Warehouse */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label htmlFor="customer_id" required className="mb-0">
                                            {t('Customer')}
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextMode = data.customer_mode === 'new' ? 'existing' : 'new';
                                                setData('customer_mode', nextMode);
                                            }}
                                            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            {data.customer_mode === 'new' ? (
                                                <>
                                                    <Users className="h-3 w-3" />
                                                    {t('Select Existing')}
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-3 w-3" />
                                                    {t('+ New Customer')}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {data.customer_mode === 'existing' ? (
                                        <>
                                            <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('Select Customer')} />
                                                </SelectTrigger>
                                                <SelectContent searchable>
                                                    {customers?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name} - {customer.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.customer_id} />

                                            {/* Selected Customer Card directly below customer select */}
                                            {selectedCustomer && (
                                                <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50/80 dark:bg-slate-900/40 text-xs space-y-1">
                                                    <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                                                                <User className="w-2.5 h-2.5" />
                                                            </div>
                                                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                                                                {selectedCustomer.name}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-4 px-1 text-[10px] font-medium gap-0.5 shrink-0"
                                                            onClick={() => setData('customer_id', '')}
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                            {t('Clear')}
                                                        </Button>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 truncate">
                                                        <div className="truncate">{selectedCustomer.email || '-'}</div>
                                                        {(selectedCustomer.mobile_no || selectedCustomer.phone) && (
                                                            <div className="truncate">{selectedCustomer.mobile_no || selectedCustomer.phone}</div>
                                                        )}
                                                        {selectedCustomer.address && (
                                                            <div className="text-slate-600 dark:text-slate-300 truncate" title={selectedCustomer.address}>
                                                                {selectedCustomer.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-9 px-3 py-1 rounded-md border border-dashed border-primary/50 bg-primary/5 text-primary text-xs font-medium flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <UserPlus className="h-3.5 w-3.5" />
                                                {data.customer_name || t('New Customer Mode')}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                {t('New')}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="invoice_date" required>
                                        {t('Proposal Date')}
                                    </Label>
                                    <DatePicker
                                        id="invoice_date"
                                        value={data.invoice_date}
                                        onChange={(value) => setData('invoice_date', value)}
                                        required
                                    />
                                    <InputError message={errors.invoice_date} />
                                </div>

                                <div>
                                    <Label htmlFor="due_date" required>
                                        {t('Due Date')}
                                    </Label>
                                    <DatePicker
                                        id="due_date"
                                        value={data.due_date}
                                        onChange={(value) => setData('due_date', value)}
                                        required
                                    />
                                    <InputError message={errors.due_date} />
                                </div>

                                <div>
                                    <Label htmlFor="warehouse_id" required>
                                        {t('Warehouse')}
                                    </Label>
                                    <Select value={data.warehouse_id} onValueChange={handleWarehouseChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Warehouse')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {warehouses?.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.warehouse_id} />
                                </div>
                            </div>

                            {/* New Customer Form Row when New Mode is Active */}
                            {data.customer_mode === 'new' && (
                                <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] space-y-2.5 animate-in fade-in-50 duration-200 mt-4">
                                    <div className="flex items-center justify-between pb-1 border-b border-primary/10">
                                        <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                            <UserPlus className="h-3.5 w-3.5" />
                                            {t('New Customer Details')}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                        {/* Name */}
                                        <div className="space-y-1">
                                            <Label htmlFor="customer_name" required className="text-xs">
                                                {t('Customer Name')}
                                            </Label>
                                            <Input
                                                id="customer_name"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                placeholder={t('Name')}
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_name} />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1">
                                            <Label htmlFor="customer_email" required className="text-xs">
                                                {t('Email')}
                                            </Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                placeholder="email@example.com"
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_email} />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1">
                                            <Label htmlFor="customer_phone" required className="text-xs">
                                                {t('Phone')}
                                            </Label>
                                            <Input
                                                id="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder={t('Phone')}
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_phone} />
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-1">
                                            <Label htmlFor="customer_address" required className="text-xs">
                                                {t('Address')}
                                            </Label>
                                            <Input
                                                id="customer_address"
                                                value={data.customer_address}
                                                onChange={(e) => setData('customer_address', e.target.value)}
                                                placeholder={t('Address')}
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_address} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 1. One-Time Charge (OTC) Card */}
                    <Card id="otc-section" className="transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5" />
                                {t('One-Time Charges (OTC)')}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="enable-tax-toggle-edit" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                    {t('Enable VAT/Tax')}
                                </Label>
                                <Switch
                                    id="enable-tax-toggle-edit"
                                    size="sm"
                                    checked={data.is_tax_enabled}
                                    onCheckedChange={(checked) => {
                                        setData('is_tax_enabled', checked);
                                        const updatedItems = data.items.map(item => {
                                            const qty = Number(item.quantity) || 0;
                                            const price = Number(item.unit_price) || 0;
                                            const disc = Number(item.discount_percentage) || 0;
                                            const lineTotal = qty * price;
                                            const discountAmount = (lineTotal * disc) / 100;
                                            const discountedTotal = lineTotal - discountAmount;

                                            if (!checked) {
                                                return {
                                                    ...item,
                                                    tax_percentage: 0,
                                                    tax_amount: 0,
                                                    total_amount: discountedTotal,
                                                    taxes: []
                                                };
                                            } else {
                                                const product = availableProducts.find(p => String(p.id) === String(item.product_id));
                                                const prodTaxes = product?.taxes || [];
                                                const totalTaxRate = prodTaxes.reduce((sum: number, tax: any) => sum + (Number(tax.rate) || 0), 0);
                                                const taxes = prodTaxes.map((tax: any) => ({
                                                    tax_name: tax.tax_name,
                                                    tax_rate: tax.rate
                                                }));
                                                const taxRate = totalTaxRate > 0 ? totalTaxRate : (Number(item.tax_percentage) || 0);
                                                const taxAmount = (discountedTotal * taxRate) / 100;

                                                return {
                                                    ...item,
                                                    tax_percentage: taxRate,
                                                    tax_amount: taxAmount,
                                                    total_amount: discountedTotal + taxAmount,
                                                    taxes: taxes.length > 0 ? taxes : (item.taxes || [])
                                                };
                                            }
                                        });
                                        setData('items', updatedItems);
                                    }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProposalItemsTable
                                items={data.items.filter(i => i.section === 'otc' || i.section === 'general' || !i.section)}
                                products={availableProducts}
                                onChange={(updatedOtcItems) => {
                                    const formattedOtc = updatedOtcItems.map(i => ({ ...i, section: 'otc' }));
                                    const mrcItems = data.items.filter(i => i.section === 'mrc');
                                    setData('items', [...formattedOtc, ...mrcItems]);
                                }}
                                invoiceType={data.type as 'product' | 'service'}
                                errors={errors}
                                onRefresh={refreshProducts}
                                isRefreshing={isRefreshingProducts}
                                isTaxEnabled={data.is_tax_enabled}
                                defaultSection="otc"
                            />
                        </CardContent>
                    </Card>

                    {/* 2. Monthly Recurring Charge (MRC) Card */}
                    <Card id="mrc-section" className="transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5" />
                                {t('Monthly Recurring Charges (MRC)')}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="prepaid-toggle-edit" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                    {t('Prepaid')}
                                </Label>
                                <Switch
                                    id="prepaid-toggle-edit"
                                    size="sm"
                                    checked={data.is_prepaid}
                                    onCheckedChange={(checked) => setData('is_prepaid', checked)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProposalItemsTable
                                items={data.items.filter(i => i.section === 'mrc')}
                                products={availableProducts}
                                onChange={(updatedMrcItems) => {
                                    const formattedMrc = updatedMrcItems.map(i => ({ ...i, section: 'mrc' }));
                                    const otcItems = data.items.filter(i => i.section !== 'mrc');
                                    setData('items', [...otcItems, ...formattedMrc]);
                                }}
                                invoiceType={data.type as 'product' | 'service'}
                                errors={errors}
                                onRefresh={refreshProducts}
                                isRefreshing={isRefreshingProducts}
                                isTaxEnabled={data.is_tax_enabled}
                                defaultSection="mrc"
                            />
                        </CardContent>
                    </Card>

                    {/* Other Details Card */}
                    <Card id="other-details-section">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                {t('Other Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                content={data.other_details || ''}
                                onChange={(val) => setData('other_details', val)}
                                placeholder={t('Enter other details...')}
                            />
                        </CardContent>
                    </Card>

                    {/* Page Order Section */}
                    <PageOrderSection
                        sections={sections as any}
                        setSections={setSections as any}
                        defaultPages={defaultPages}
                        proposalSetting={proposalSetting}
                    />

                    {/* Additional Notes Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('Notes')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder={t('Enter any additional notes or terms...')}
                                    rows={4}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Render Custom Fields */}
                    {customFields && customFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('Custom Fields')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customFields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <Label htmlFor={field.id}>{(field as any).name || (field as any).label || 'Custom Field'}</Label>
                                            {field.component}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {data.items.length} {t('items added')}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsPreviewOpen(true)}
                                className="gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                {t('Preview')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || data.items.length === 0}
                            >
                                {processing ? t('Updating...') : t('Update')}
                            </Button>
                        </div>
                    </div>
                </form>

                <PreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    formData={{
                        ...data,
                        id: proposal.id,
                        proposal_number: proposal.proposal_number || (proposal.id ? `PROP-${proposal.id}` : undefined),
                    }}
                    sections={sections as any}
                    customers={customers}
                    warehouses={warehouses}
                    availableProducts={availableProducts}
                    totals={{
                        subtotal: totals.subtotal,
                        tax_amount: totals.taxAmount,
                        discount_amount: totals.discountAmount,
                        total_amount: totals.total,
                    }}
                    proposalSetting={proposalSetting}
                    other_details={data.other_details}
                />
            </div>
        </AuthenticatedLayout>
    );
}
