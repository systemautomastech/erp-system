import React, { useState, useEffect, useMemo } from 'react';
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

interface CreateProps {
    customers: Array<{ id: number; name: string; email: string;[key: string]: any }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    defaultPages?: ProposalDefaultPage[];
    defaultTerms?: string | null;
    [key: string]: any;
}

export default function Create() {
    const { t } = useTranslation();
    const { customers, warehouses, defaultPages = [], defaultTerms, proposalSetting } = usePage<CreateProps>().props;
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Initialize proposal sections from default pages
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string; page_type?: string; background_image?: string; order: number; isExpanded: boolean }>>(() => {
        if (defaultPages && defaultPages.length > 0) {
            return defaultPages.map((p, idx) => ({
                id: `sec-${p.id || idx}-${Date.now()}`,
                title: p.title,
                content: p.content || '',
                page_type: p.page_type || 'content',
                background_image: p.background_image || '',
                order: p.sort_order || idx + 1,
                isExpanded: false,
            }));
        }
        return [];
    });

    useFlashMessages();
    const { data, setData, post, processing, errors, transform } = useForm({
        proposal_id: '',
        reference: '',
        subject: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        customer_mode: 'existing' as 'existing' | 'new',
        customer_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_type: 'Individual',
        customer_address: '',
        warehouse_id: '',
        type: 'product',
        is_tax_enabled: true,
        is_prepaid: false,
        payment_terms: defaultTerms || '',
        notes: '',
        items: [{
            product_id: 0,
            section: 'general',
            product_type: 'product',
            description: '',
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
        other_details: '',
    });

    const customFields = useFormFields('getCustomFields', { ...data, module: 'General', sub_module: 'Proposal' }, setData, errors, 'create', t);

    // Auto-sync OTC and MRC section cards into Page Order list when products exist in those tables
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
            } else if (!hasOtcItems && otcIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'otc');
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
            } else if (!hasMrcItems && mrcIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'mrc');
            }

            // Other Details Card
            const otherIdx = updated.findIndex((s) => s.page_type === 'other-details');
            if (hasOtherDetails && otherIdx === -1) {
                updated.push({
                    id: `sec-other-details-${Date.now()}`,
                    title: 'Other Details',
                    content: '[OTHER_DETAILS_CONTENT]',
                    page_type: 'other-details',
                    order: updated.length + 1,
                    isExpanded: false,
                });
            } else if (!hasOtherDetails && otherIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'other-details');
            }

            return updated;
        });
    }, [data.items, data.other_details]);

    // Fetch warehouse products
    const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
    const fetchWarehouseProducts = async (warehouseId: string) => {
        if (!warehouseId) {
            setAvailableProducts([]);
            return;
        }

        try {
            setIsRefreshingProducts(true);
            const response = await fetch(route('sales-proposals.warehouse.products') + `?warehouse_id=${warehouseId}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setAvailableProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching warehouse products:', error);
            setAvailableProducts([]);
        } finally {
            setIsRefreshingProducts(false);
        }
    };

    const refreshProducts = () => {
        if (data.warehouse_id) {
            fetchWarehouseProducts(data.warehouse_id);
        } else if (data.type === 'service') {
            fetchServiceProducts();
        }
    };

    useEffect(() => {
        if (data.warehouse_id) {
            fetchWarehouseProducts(data.warehouse_id);
        }
    }, [data.warehouse_id]);

    const fetchServiceProducts = async () => {
        try {
            setIsRefreshingProducts(true);
            const response = await fetch(route('sales-proposals.services'));
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setAvailableProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching service products:', error);
            setAvailableProducts([]);
        } finally {
            setIsRefreshingProducts(false);
        }
    };

    const handleWarehouseChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            warehouse_id: value,
            items: prev.items.map((item) => ({
                ...item,
                product_id: 0,
                unit_price: 0,
                total_amount: 0,
            })),
        }));
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

        post(route('sales-proposals.store'));
    };

    const totals = useTaxCalculator(data.items);

    const selectedCustomer = useMemo(() => {
        if (data.customer_mode === 'new') {
            if (!data.customer_name && !data.customer_email) return null;
            return {
                id: 0,
                name: data.customer_name,
                email: data.customer_email,
                mobile_no: data.customer_phone,
                phone: data.customer_phone,
                address: data.customer_address,
                type: data.customer_type,
            };
        }
        return customers?.find((c: any) => c.id.toString() === data.customer_id) || null;
    }, [data.customer_mode, data.customer_id, data.customer_name, data.customer_email, data.customer_phone, data.customer_type, data.customer_address, customers]);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposal'), url: route('sales-proposals.index') },
                { label: t('Create') }
            ]}
            pageTitle={t('Create Sales Proposal')}
        >
            <Head title={t('Create Sales Proposal')} />

            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5" />
                                {t('Sales Proposal Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Row 1: Proposal Number & Subject */}
                            <div className="flex flex-col md:flex-row gap-4 border-b pb-4 items-start">
                                <div className="w-full md:w-64 shrink-0">
                                    <Label htmlFor="proposal_number">{t('Proposal Number')}</Label>
                                    <Input
                                        id="proposal_number"
                                        value={`${proposalSetting?.proposal_prefix || 'PROP-'}${proposalSetting?.proposal_starting_number || '1001'}-${data.invoice_date || new Date().toISOString().split('T')[0]}`}
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
                                            className="text-[11px] font-semibold text-primary flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            {data.customer_mode === 'new' ? (
                                                <>
                                                    <Users className="h-3 w-3" />
                                                    {t('Select Existing')}
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-3 w-3" />
                                                    {t('New Customer')}
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
                                        <div className="h-10 px-3 py-1 rounded-md border border-dashed border-primary/50 bg-primary/5 text-primary text-xs font-medium flex items-center justify-between">
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
                                <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] space-y-2.5 animate-in fade-in-50 duration-200">
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
                                <Label htmlFor="enable-tax-toggle" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                    {t('Enable VAT/Tax')}
                                </Label>
                                <Switch
                                    id="enable-tax-toggle"
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
                                <Label htmlFor="prepaid-toggle" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                    {t('Prepaid')}
                                </Label>
                                <Switch
                                    id="prepaid-toggle"
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
                                    placeholder={t('Enter additional notes...')}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custom Fields */}
                    {Array.isArray(customFields) && customFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('Custom Fields')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customFields.map((field: any) => (
                                    <div key={field.id}>{field.component}</div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex items-center justify-end gap-3">
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
                        <Button type="submit" disabled={processing}>
                            {t('Create')}
                        </Button>
                    </div>
                </form>

                <PreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    formData={data}
                    sections={sections}
                    customers={customers}
                    warehouses={warehouses}
                    availableProducts={availableProducts}
                    totals={totals}
                    proposalSetting={proposalSetting}
                    other_details={data.other_details}
                />
            </div>
        </AuthenticatedLayout>
    );
}
