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
import { CalendarDays, Package, Plus, Trash2, GripVertical, FileText, ChevronDown, ChevronRight, Check, Eye, User, X } from 'lucide-react';
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
    customer_id: number;
    warehouse_id?: number;
    type?: string;
<<<<<<< HEAD
    is_tax_enabled?: boolean | number;
    is_prepaid?: boolean | number;
=======
    is_tax_enabled?: boolean;
    is_prepaid?: boolean;
>>>>>>> 457aa398e55824ae5f3c947d93b48ae4e1c50c37
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
    defaultPages?: ProposalDefaultPage[];
    defaultTerms?: string | null;
    [key: string]: any;
}

export default function Edit() {
    const { t } = useTranslation();
    const { proposal, customers, warehouses, defaultPages = [], defaultTerms, proposalSetting } = usePage<EditProps>().props;
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Initialize proposal sections with existing proposal_content or fallback to defaultPages
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string; page_type?: string; background_image?: string; order: number; isExpanded: boolean }>>(() => {
        const contentsRel = (proposal as any).contents;
        let parsed: any[] = [];
        if (Array.isArray(contentsRel) && contentsRel.length > 0) {
            parsed = contentsRel.map((c: any) => {
                if (c.proposal_content) {
                    try {
                        const dec = typeof c.proposal_content === 'string' ? JSON.parse(c.proposal_content) : c.proposal_content;
                        if (dec && typeof dec === 'object') return dec;
                    } catch (e) { }
                }
                return {
                    title: c.title || '',
                    content: c.content || c.proposal_content || '',
                    page_type: c.page_type || 'content',
                    background_image: c.background_image || '',
                    order: c.order || 1,
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

        const filteredParsed = (parsed || []).filter((item: any) => {
            const content = (item.content || item.proposal_content || '').trim();
            const pageType = item.page_type || '';
            return !['otc', 'mrc', 'other-details'].includes(pageType) &&
                   !['[OTC_CHARGES_TABLE]', '[MRC_CHARGES_TABLE]', '[OTHER_DETAILS_CONTENT]'].includes(content);
        });

        return filteredParsed.map((item: any, idx: number) => ({
            id: `sec-${idx}-${Date.now()}`,
            title: item.title || `Page ${idx + 1}`,
            content: item.content || '',
            page_type: item.page_type || 'content',
            background_image: item.background_image || '',
            order: item.order || idx + 1,
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
                    id: `sec-other-${Date.now()}`,
                    title: 'Other Details',
                    content: '[OTHER_DETAILS_CONTENT]',
                    page_type: 'other-details',
                    order: updated.length + 1,
                    isExpanded: false,
                });
            } else if (!hasOtherDetails && otherIdx !== -1) {
                updated = updated.filter((s) => s.page_type !== 'other-details');
            }

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

    useEffect(() => {
        if (data.warehouse_id) {
            handleWarehouseChange(data.warehouse_id);
        }
    }, []);

    const handleWarehouseChange = async (warehouseId: string) => {
        setData('warehouse_id', warehouseId);

        if (warehouseId) {
            try {
                const response = await fetch(route('sales-proposals.warehouse.products') + `?warehouse_id=${warehouseId}`);
                const warehouseProducts = await response.json();
                setAvailableProducts(warehouseProducts);
            } catch (error) {
                console.error('Failed to fetch warehouse products:', error);
                setAvailableProducts([]);
            }
        } else {
            setAvailableProducts([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
<<<<<<< HEAD
            proposal_content: sections
                .filter((item) => {
                    const content = (item.content || '').trim();
                    const pageType = item.page_type || '';
                    return !['otc', 'mrc', 'other-details'].includes(pageType) &&
                           !['[OTC_CHARGES_TABLE]', '[MRC_CHARGES_TABLE]', '[OTHER_DETAILS_CONTENT]'].includes(content);
                })
                .map((item, index) => ({
                    title: item.title,
                    content: item.content,
                    page_type: item.page_type || 'content',
                    background_image: item.background_image || '',
                    order: index + 1,
                })),
=======
            proposal_content: sections.map((item, index) => ({
                title: item.title,
                content: item.content,
                page_type: item.page_type,
                background_image: item.background_image,
                order: index + 1,
            })),
            tariffs: ((formData as any).tariffs || []).map((t: any, idx: number) => ({
                ...t,
                sort_order: idx + 1,
            })),
>>>>>>> 457aa398e55824ae5f3c947d93b48ae4e1c50c37
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    <Label htmlFor="customer_id" required>
                                        {t('Customer')}
                                    </Label>
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

                                    {selectedCustomer && (
                                        <div className="mt-2.5 border border-slate-200 rounded-xl p-3 bg-slate-50/90 shadow-2xs w-full max-w-sm sm:max-w-md">
                                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/80">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="font-bold text-slate-900 text-xs truncate leading-tight">{selectedCustomer.name}</h5>
                                                        <div className="text-[11px] text-slate-400 font-normal truncate">{selectedCustomer.email || '-'} | {selectedCustomer.mobile_no || selectedCustomer.phone || '-'}</div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-6 px-2 text-[11px] font-semibold gap-1 shrink-0"
                                                    onClick={() => setData('customer_id', '')}
                                                >
                                                    <X className="w-3 h-3" />
                                                    {t('Remove')}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                                <div className="col-span-2">
                                                    <span className="text-slate-500 font-medium">{t('Address')}: </span>
                                                    <span className="text-slate-800 font-medium">{selectedCustomer.address || selectedCustomer.billing_address || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">{t('Division')}: </span>
                                                    <span className="text-slate-800 font-medium">{selectedCustomer.division || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">{t('District')}: </span>
                                                    <span className="text-slate-800 font-medium">{selectedCustomer.district || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">{t('Upazila')}: </span>
                                                    <span className="text-slate-800 font-medium">{selectedCustomer.upazila || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-medium">{t('Zip Code')}: </span>
                                                    <span className="text-slate-800 font-medium">{selectedCustomer.zip_code || selectedCustomer.zipcode || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                    {t('Enable Tax')}
                                </Label>
                                <Switch
                                    id="enable-tax-toggle-edit"
                                    size="sm"
                                    checked={data.is_tax_enabled}
                                    onCheckedChange={(checked) => {
                                        setData('is_tax_enabled', checked);
                                        if (!checked) {
                                            const updatedItems = data.items.map(item => {
                                                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                                                const discountAmount = (lineTotal * (Number(item.discount_percentage) || 0)) / 100;
                                                return {
                                                    ...item,
                                                    tax_percentage: 0,
                                                    tax_amount: 0,
                                                    total_amount: lineTotal - discountAmount,
                                                    taxes: []
                                                };
                                            });
                                            setData('items', updatedItems);
                                        }
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
