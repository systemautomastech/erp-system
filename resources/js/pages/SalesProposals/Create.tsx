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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, Plus, Trash2, GripVertical, FileText, ChevronDown, ChevronRight, Check, Eye, User, X } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import ProposalPreviewModal from './components/ProposalPreviewModal';
import TariffDetailsTable, { ProposalTariffRow } from './components/TariffDetailsTable';
import ChargeItemsTable from './components/ChargeItemsTable';

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

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleInsertDefaultPage = (defaultPage: ProposalDefaultPage) => {
        const isFront = defaultPage.page_type === 'front-page' || defaultPage.title?.toLowerCase().includes('front') || defaultPage.title?.toLowerCase().includes('cover');
        const isAlreadyAdded = sections.some(
            (sec) => sec.id === `sec-${defaultPage.id}` || (isFront && (sec.page_type === 'front-page' || sec.title?.toLowerCase().includes('front') || sec.title?.toLowerCase().includes('cover'))) || sec.title.trim().toLowerCase() === defaultPage.title.trim().toLowerCase()
        );

        if (isAlreadyAdded) {
            const updated = sections.filter(
                (sec) => !(sec.id === `sec-${defaultPage.id}` || (isFront && (sec.page_type === 'front-page' || sec.title?.toLowerCase().includes('front') || sec.title?.toLowerCase().includes('cover'))) || sec.title.trim().toLowerCase() === defaultPage.title.trim().toLowerCase())
            );
            updated.forEach((item, index) => {
                item.order = index + 1;
            });
            setSections(updated);
        } else {
            setSections((prev) => [
                ...prev,
                {
                    id: `sec-${defaultPage.id}-${Date.now()}`,
                    title: defaultPage.title,
                    content: defaultPage.content,
                    page_type: isFront ? 'front-page' : (defaultPage.page_type || 'general'),
                    background_image: defaultPage.background_image,
                    order: prev.length + 1,
                    isExpanded: true,
                },
            ]);
        }
    };

    const handleAddBlankSection = () => {
        setSections((prev) => [
            ...prev,
            {
                id: `sec-${Date.now()}`,
                title: `${t('Section')} ${prev.length + 1}`,
                content: '',
                order: prev.length + 1,
                isExpanded: true,
            },
        ]);
    };

    // Terms Sections state
    const [termSections, setTermSections] = useState<Array<{ id: string; title: string; content: string; order: number; isExpanded: boolean }>>([]);
    const [draggedTermIndex, setDraggedTermIndex] = useState<number | null>(null);

    const handleInsertDefaultTerms = () => {
        const defaultTitle = t('Default Terms & Conditions');
        const isAlreadyAdded = termSections.some(
            (tSec) => tSec.title.trim().toLowerCase() === defaultTitle.trim().toLowerCase()
        );

        if (isAlreadyAdded) {
            const updated = termSections.filter(
                (tSec) => tSec.title.trim().toLowerCase() !== defaultTitle.trim().toLowerCase()
            );
            updated.forEach((item, index) => {
                item.order = index + 1;
            });
            setTermSections(updated);
        } else {
            const termsToInsert = defaultTerms || '<h2>Terms & Conditions</h2><p>1. Proposal is valid for 30 days from issuance.<br/>2. Payment terms: 50% deposit upon acceptance, 50% on project completion.</p>';
            setTermSections((prev) => [
                ...prev,
                {
                    id: `term-${Date.now()}`,
                    title: defaultTitle,
                    content: termsToInsert,
                    order: prev.length + 1,
                    isExpanded: true,
                },
            ]);
        }
    };

    const handleAddBlankTerm = () => {
        setTermSections((prev) => [
            ...prev,
            {
                id: `term-${Date.now()}`,
                title: `${t('Term')} ${prev.length + 1}`,
                content: '',
                order: prev.length + 1,
                isExpanded: true,
            },
        ]);
    };

    const handleRemoveTermSection = (id: string) => {
        const updated = termSections.filter((term) => term.id !== id);
        updated.forEach((item, index) => {
            item.order = index + 1;
        });
        setTermSections(updated);
    };

    const toggleTermExpand = (id: string) => {
        setTermSections(
            termSections.map((term) =>
                term.id === id ? { ...term, isExpanded: !term.isExpanded } : term
            )
        );
    };

    const handleTermDragStart = (index: number) => {
        setDraggedTermIndex(index);
    };

    const handleTermDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedTermIndex === null || draggedTermIndex === targetIndex) return;

        const updated = [...termSections];
        const [draggedItem] = updated.splice(draggedTermIndex, 1);
        updated.splice(targetIndex, 0, draggedItem);

        updated.forEach((item, index) => {
            item.order = index + 1;
        });

        setDraggedTermIndex(targetIndex);
        setTermSections(updated);
    };

    const handleTermDragEnd = () => {
        setDraggedTermIndex(null);
    };

    const handleRemoveSection = (id: string) => {
        const updated = sections.filter((sec) => sec.id !== id);

        updated.forEach((item, index) => {
            item.order = index + 1;
        });

        setSections(updated);
    };

    const toggleSectionExpand = (id: string) => {
        setSections(
            sections.map((sec) =>
                sec.id === id ? { ...sec, isExpanded: !sec.isExpanded } : sec
            )
        );
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updatedSections = [...sections];

        const [draggedItem] = updatedSections.splice(draggedIndex, 1);
        updatedSections.splice(targetIndex, 0, draggedItem);

        // Order update
        updatedSections.forEach((item, index) => {
            item.order = index + 1;
        });

        setDraggedIndex(targetIndex);
        setSections(updatedSections);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

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
        payment_terms: '',
        notes: '',
        items: [{
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
        }] as SalesInvoiceItem[],
        proposal_content: [],
        tariffs: [] as ProposalTariffRow[],
    });

    // Selected Customer Details
    const selectedCustomer = customers?.find((c) => String(c.id) === String(data.customer_id));

    // Get custom fields using useFormFields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'General', sub_module: 'Proposal' }, setData, errors, 'create', t);

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

    const handleTypeChange = (type: string) => {
        setData('type', type);
        if (type === 'service') {
            fetchServices();
        } else if (data.warehouse_id) {
            handleWarehouseChange(data.warehouse_id);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(route('sales-proposals.services'));
            const services = await response.json();
            setAvailableProducts(services);
        } catch (error) {
            console.error('Failed to fetch services:', error);
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
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CalendarDays className="h-5 w-5" />
                                    {t('Sales Proposal Details')}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <RadioGroup value={data.type} onValueChange={handleTypeChange} className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="product" id="type-product" />
                                            <Label htmlFor="type-product" className="cursor-pointer font-normal">{t('Product Wise')}</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="service" id="type-service" />
                                            <Label htmlFor="type-service" className="cursor-pointer font-normal">{t('Service Wise')}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
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

                                {data.type === 'product' && (
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
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 1. One-Time Charge (OTC) Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5" />
                                {t('One-Time Charges (OTC)')}
                            </CardTitle>
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
                            />
                        </CardContent>
                    </Card>

                    {/* 2. Monthly Recurring Charge (MRC) Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5" />
                                {t('Monthly Recurring Charges (MRC)')}
                            </CardTitle>
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
                            />
                        </CardContent>
                    </Card>

                    {/* 4. Tariff Details Table Card */}

                    {/* Tariff Details Table Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                {t('Tariff Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TariffDetailsTable
                                tariffs={data.tariffs || []}
                                onChange={(updatedTariffs) => setData('tariffs', updatedTariffs)}
                            />
                        </CardContent>
                    </Card>

                    {/* Default Pages & Proposal Text Sections */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5" />
                                        {t('Default Pages')}
                                    </CardTitle>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddBlankSection}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-9 text-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add New Page')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Default Page Template Cards */}
                            {defaultPages && defaultPages.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t('Existing Pages')}
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {defaultPages.map((page) => {
                                            const isInserted = sections.some((s) => s.title.toLowerCase() === page.title.toLowerCase());
                                            return (
                                                <Card
                                                    key={page.id}
                                                    onClick={() => handleInsertDefaultPage(page)}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:border-primary/80 hover:shadow-xs group relative p-3 border rounded-lg flex items-center justify-between gap-2 select-none",
                                                        isInserted ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                                                            {page.sort_order || page.order}
                                                        </span>
                                                        <span className="text-xs font-medium truncate">{page.title}</span>
                                                    </div>
                                                    {isInserted ? (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600 dark:text-green-400 gap-1 shrink-0 border border-green-500/20">
                                                            <Check className="h-3 w-3" />
                                                            {t('Added')}
                                                        </Badge>
                                                    ) : (
                                                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6 opacity-60 group-hover:opacity-100 shrink-0">
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Section Cards List */}
                            <div className="space-y-4 pt-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('Proposal Content Sections')}
                                </Label>
                                {sections.length === 0 ? (
                                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground space-y-2 bg-muted/20">
                                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/60" />
                                        <p className="text-sm font-medium">{t('No pages added to this proposal yet.')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('Click on an existing page card above or click "+ Add New Page" to add sections to your proposal.')}
                                        </p>
                                    </div>
                                ) : (
                                    sections.map((section, index) => (
                                        <Card
                                            key={section.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`transition-all border ${draggedIndex === index ? 'opacity-50 border-dashed border-primary' : ''}`}
                                        >
                                            <Collapsible
                                                open={section.isExpanded}
                                                onOpenChange={() => toggleSectionExpand(section.id)}
                                            >
                                                <div className="p-4 flex items-center justify-between select-none">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div
                                                            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0"
                                                            title={t('Drag to reorder')}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <GripVertical className="h-5 w-5" />
                                                        </div>

                                                        <div className="flex items-center gap-2 font-medium text-base min-w-0 flex-1">
                                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                                            <span className="truncate">
                                                                {section.title || `${t('Section')} ${index + 1}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <CollapsibleTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title={section.isExpanded ? t('Fold box') : t('Unfold box')}
                                                            >
                                                                {section.isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSection(section.id);
                                                            }}
                                                            title={t('Remove section')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <CollapsibleContent>
                                                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                                        <div className="space-y-2">
                                                            {(section.page_type !== 'front-page') ?
                                                                (
                                                                    <><Label htmlFor={`sec-title-${section.id}`}>{t('Section Title')}</Label>
                                                                        <Input
                                                                            id={`sec-title-${section.id}`}
                                                                            value={section.title}
                                                                            onChange={(e) => {
                                                                                const updated = [...sections];
                                                                                updated[index].title = e.target.value;
                                                                                setSections(updated);
                                                                            }}
                                                                            placeholder={t('e.g., Introduction')}
                                                                        /></>
                                                                ) : (<span>{section.title}</span>)}

                                                        </div>

                                                        {(section.page_type === 'front-page' || section.is_front_page || section.title?.toLowerCase().includes('front page') || section.title?.toLowerCase().includes('cover')) ? (
                                                            <div className="space-y-2 pt-1">
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <Label>{t('Section Content')}</Label>
                                                                <RichTextEditor
                                                                    content={section.content}
                                                                    onChange={(content) => {
                                                                        const updated = [...sections];
                                                                        updated[index].content = content;
                                                                        setSections(updated);
                                                                    }}
                                                                    placeholder={t('Enter section content...')}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    ))
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddBlankSection} className="gap-2 h-9 text-xs">
                                        <Plus className="h-4 w-4" />
                                        {t('Add New Page')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms & Conditions Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5" />
                                        {t('Terms & Conditions')}
                                    </CardTitle>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddBlankTerm}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-9 text-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add New Term')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Existing Terms Template Cards */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('Existing Terms')}
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {(() => {
                                        const isTermsInserted = termSections.some((tSec) => tSec.title.toLowerCase() === t('Default Terms & Conditions').toLowerCase());
                                        return (
                                            <Card
                                                onClick={handleInsertDefaultTerms}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:border-primary/80 hover:shadow-xs group relative p-3 border rounded-lg flex items-center justify-between gap-2 select-none",
                                                    isTermsInserted ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                                                        1
                                                    </span>
                                                    <span className="text-xs font-medium truncate">{t('Default Terms & Conditions')}</span>
                                                </div>
                                                {isTermsInserted ? (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600 dark:text-green-400 gap-1 shrink-0 border border-green-500/20">
                                                        <Check className="h-3 w-3" />
                                                        {t('Added')}
                                                    </Badge>
                                                ) : (
                                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 opacity-60 group-hover:opacity-100 shrink-0">
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </Card>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Term Section Cards List */}
                            <div className="space-y-4 pt-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('Proposal Terms Sections')}
                                </Label>
                                {termSections.length === 0 ? (
                                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground space-y-2 bg-muted/20">
                                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/60" />
                                        <p className="text-sm font-medium">{t('No terms added to this proposal yet.')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('Click on an existing terms card above or click "+ Add New Term" to add terms to your proposal.')}
                                        </p>
                                    </div>
                                ) : (
                                    termSections.map((term, index) => (
                                        <Card
                                            key={term.id}
                                            draggable
                                            onDragStart={() => handleTermDragStart(index)}
                                            onDragOver={(e) => handleTermDragOver(e, index)}
                                            onDragEnd={handleTermDragEnd}
                                            className={`transition-all border ${draggedTermIndex === index ? 'opacity-50 border-dashed border-primary' : ''}`}
                                        >
                                            <Collapsible
                                                open={term.isExpanded}
                                                onOpenChange={() => toggleTermExpand(term.id)}
                                            >
                                                <div className="p-4 flex items-center justify-between select-none">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div
                                                            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground shrink-0"
                                                            title={t('Drag to reorder')}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <GripVertical className="h-5 w-5" />
                                                        </div>

                                                        <div className="flex items-center gap-2 font-medium text-base min-w-0 flex-1">
                                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                                            <span className="truncate">
                                                                {term.title || `${t('Term')} ${index + 1}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <CollapsibleTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title={term.isExpanded ? t('Fold box') : t('Unfold box')}
                                                            >
                                                                {term.isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveTermSection(term.id);
                                                            }}
                                                            title={t('Remove term section')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <CollapsibleContent>
                                                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`term-title-${term.id}`}>{t('Term Title')}</Label>
                                                            <Input
                                                                id={`term-title-${term.id}`}
                                                                value={term.title}
                                                                onChange={(e) => {
                                                                    const updated = [...termSections];
                                                                    updated[index].title = e.target.value;
                                                                    setTermSections(updated);
                                                                }}
                                                                placeholder={t('e.g., Payment Terms')}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>{t('Term Content')}</Label>
                                                            <RichTextEditor
                                                                content={term.content}
                                                                onChange={(content) => {
                                                                    const updated = [...termSections];
                                                                    updated[index].content = content;
                                                                    setTermSections(updated);
                                                                }}
                                                                placeholder={t('Enter term content...')}
                                                            />
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </Card>
                                    ))
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddBlankTerm} className="gap-2 h-9 text-xs">
                                        <Plus className="h-4 w-4" />
                                        {t('Add New Term')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                    termSections={termSections}
                    customers={customers}
                    warehouses={warehouses}
                    availableProducts={availableProducts}
                    totals={totals}
                    proposalSetting={proposalSetting}
                    tariffs={data.tariffs}
                />
            </div>
        </AuthenticatedLayout>
    );
}
