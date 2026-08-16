import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useFormFields } from '@/hooks/useFormFields';
import { SalesInvoiceItem } from '@/pages/Sales/types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import InvoiceItemsTable from '@/pages/Sales/components/InvoiceItemsTable';
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
import ProposalPreviewModal from './components/ProposalPreviewModal';
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
    customers: Array<{ id: number; name: string; email: string }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    defaultPages?: ProposalDefaultPage[];
    defaultTerms?: string | null;
    [key: string]: any;
}

export default function Create() {
    const { t } = useTranslation();
    const { customers, warehouses, defaultPages = [], defaultTerms, proposalSetting } = usePage<CreateProps>().props;
    const [availableProducts, setAvailableProducts] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Initialize proposal sections (auto pre-populating Front Page if available)
    const [sections, setSections] = useState<Array<{ id: string; title: string; content: string; page_type?: string; background_image?: string; order: number; isExpanded: boolean }>>(() => {
        if (defaultPages && defaultPages.length > 0) {
            const frontPage = defaultPages.find((p) => p.page_type === 'front-page' || p.title?.toLowerCase().includes('front') || p.title?.toLowerCase().includes('cover'));
            if (frontPage) {
                return [
                    {
                        id: `sec-${frontPage.id}-${Date.now()}`,
                        title: frontPage.title,
                        content: frontPage.content || '',
                        page_type: 'front-page',
                        background_image: frontPage.background_image || '',
                        order: 1,
                        isExpanded: true,
                    },
                ];
            }
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
        customer_id: '',
        warehouse_id: '',
        type: 'product',
        is_tax_enabled: true,
        is_prepaid: false,
        payment_terms: '',
        notes: '',
        items: [{
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
        }] as SalesInvoiceItem[],
        proposal_content: [],
        other_details: '',
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
    const customFields = useFormFields('getCustomFields', { ...data, module: 'General', sub_module: 'Proposal' }, setData, errors, 'create', t);

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

        if (warehouseId) {
            try {
                const response = await fetch(route('sales-proposals.warehouse.products') + `?warehouse_id=${warehouseId}`);
                const warehouseProducts = await response.json();
                setAvailableProducts(warehouseProducts);
                console.log('warehouseProducts', warehouseProducts);
            } catch (error) {
                console.error('Failed to fetch warehouse products:', error);
                setAvailableProducts([]);
            }
        } else {
            setAvailableProducts([]);
        }

        // Reset items when warehouse changes
        setData('items', [{
            product_id: 0,
            section: 'general',
            product_type: 'product',
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0
        }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            proposal_content: sections.map((item, index) => ({
                title: item.title,
                content: item.content,
                order: index + 1,
            })),
            tariffs: (formData.tariffs || []).map((t, idx) => ({
                ...t,
                sort_order: idx + 1,
            })),
        }));

        post(route('sales-proposals.store'));
    };

    const totals = useTaxCalculator(data.items);

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
                        <CardContent className="space-y-4">
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
                                <Label htmlFor="enable-tax-toggle" className="text-xs cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                     {t('Enable Tax')}
                                 </Label>
                                 <Switch
                                     id="enable-tax-toggle"
                                     size="sm"
                                     checked={data.is_tax_enabled}
                                     onCheckedChange={(checked) => {
                                         setData('is_tax_enabled', checked);
                                         if (!checked) {
                                             // When tax is disabled, set all items' tax_amount, tax_percentage to 0
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
                            <InvoiceItemsTable
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
                            <InvoiceItemsTable
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

                <ProposalPreviewModal
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
