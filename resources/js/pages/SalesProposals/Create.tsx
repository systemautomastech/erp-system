import React, { useState } from 'react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, Plus, Trash2, GripVertical, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CreateProps {
    customers: Array<{ id: number; name: string; email: string }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    [key: string]: any;
}

export default function Create() {
    const { t } = useTranslation();
    const { customers, warehouses } = usePage<CreateProps>().props;
    const [availableProducts, setAvailableProducts] = useState([]);

    // Custom Proposal Text Sections (Moved from setup page)
    const [sections, setSections] = useState([
        {
            id: 'sec-1',
            content: '',
            order: 1,
            isExpanded: true,
        },
    ]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // const handleAddSection = () => {
    //     const newSection = {
    //         id: `sec-${Date.now()}`,
    //         title: '',
    //         description: '',
    //         isExpanded: true,
    //     };
    //     setSections([...sections, newSection]);
    // };

    const handleAddSection = () => {
        setSections([
            ...sections,
            {
                id: `sec-${Date.now()}`,
                content: '',
                order: sections.length + 1,
                isExpanded: true,
            },
        ]);
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

        // Form data sync
        // setData(
        //     'proposal_content',
        //     updatedSections.map((item) => ({
        //         content: item.content,
        //         order: item.order,
        //     }))
        // );
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    useFlashMessages();
    const { data, setData, post, processing, errors, transform } = useForm({
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        customer_id: '',
        warehouse_id: '',
        type: 'product',
        payment_terms: '',
        notes: '',
        items: [{
            product_id: 0,
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0
        }] as SalesInvoiceItem[],
        proposal_content: []
    });

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
            quantity: 1,
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            tax_percentage: 0,
            tax_amount: 0,
            total_amount: 0
        }]);
    };

    const handleTypeChange = async (type: string) => {
        setData('type', type);

        if (type === 'service') {
            try {
                const response = await fetch(route('sales-proposals.services'));
                const services = await response.json();
                setAvailableProducts(services);
            } catch (error) {
                console.error('Failed to fetch services:', error);
                setAvailableProducts([]);
            }
        } else {
            setAvailableProducts([]);
            setData('warehouse_id', '');
        }

        // Reset items when type changes
        setData('items', [{
            product_id: 0,
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
                content: item.content,
                order: index + 1,
            })),
        }));

        post(route('sales-proposals.store'));
    };

    const totals = useTaxCalculator(data.items);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposal'), url: route('sales-proposals.index') },
                { label: t('Create Sales Proposal') }
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
                        <CardContent>
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
                                            <SelectContent>
                                                {warehouses?.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name} - {warehouse.address}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.warehouse_id} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="payment_terms">
                                        {t('Payment Terms')}
                                    </Label>
                                    <Input
                                        id="payment_terms"
                                        value={data.payment_terms}
                                        onChange={(e) => setData('payment_terms', e.target.value)}
                                        placeholder={t('e.g., Net 30')}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">
                                        {t('Notes')}
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        placeholder={t('Additional notes...')}
                                    />
                                </div>
                            </div>

                            {/* Custom Fields */}
                            {customFields && customFields.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                                    {customFields.map(field => field.component)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5" />
                                    {t('Sales Proposal Items')}
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const newItem = {
                                            product_id: 0,
                                            quantity: 1,
                                            unit_price: 0,
                                            discount_percentage: 0,
                                            discount_amount: 0,
                                            tax_percentage: 0,
                                            tax_amount: 0,
                                            total_amount: 0
                                        };
                                        setData('items', [...data.items, newItem]);
                                    }}
                                    variant="default"
                                    size="sm"
                                >
                                    + {t('Add Item')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <InvoiceItemsTable
                                items={data.items}
                                onChange={(items) => setData('items', items)}
                                errors={errors}
                                products={availableProducts}
                                showAddButton={false}
                                invoiceType={data.type}
                            />

                            <div className="mt-6 flex justify-end">
                                <div className="w-80 bg-muted/30 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">{t('Proposal Summary')}</h3>
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Subtotal')}</span>
                                            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Discount')}</span>
                                            <span className="font-medium text-red-600">-{formatCurrency(totals.discountAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{t('Tax')}</span>
                                            <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{t('Total')}</span>
                                            <span className="font-bold text-lg">{formatCurrency(totals.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposal Dynamic Content Sections */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5" />
                                        {t('Proposal Contents')}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('Add custom text blocks (e.g. Introduction, Scope of Work).')}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddSection}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('Add Section')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sections.map((section, index) => (
                                <Card
                                    key={section.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`transition-all border ${draggedIndex === index ? 'opacity-50 border-dashed border-primary' : ''
                                        }`}
                                >
                                    <Collapsible
                                        open={section.isExpanded}
                                        onOpenChange={() => toggleSectionExpand(section.id)}
                                    >
                                        <div className="p-4 flex items-center justify-between select-none">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div
                                                    className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
                                                    title={t('Drag to reorder')}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <GripVertical className="h-5 w-5" />
                                                </div>

                                                <div className="flex items-center gap-2 font-medium text-base">
                                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                                    <span>
                                                        {section.content
                                                            ? section.content.replace(/<[^>]+>/g, '').slice(0, 30)
                                                            : `${t('Section')} ${index + 1}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
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
                                                    {/* <Label>{t('Description / Content')}</Label> */}
                                                    {/* <RichTextEditor
                                                        content={data.proposal_content}
                                                        onChange={(content) => setData('proposal_content', content)}
                                                        placeholder={t('Enter section detailed content with formatting...')}
                                                    /> */}
                                                    <RichTextEditor
                                                        content={section.content}
                                                        onChange={(content) => {
                                                            const updated = [...sections];
                                                            updated[index].content = content;

                                                            setSections(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            ))}

                            <div className="flex justify-start pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={handleAddSection} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('Add Another Section')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                                type="submit"
                                disabled={processing || data.items.length === 0}
                            >
                                {processing ? t('Creating...') : t('Create')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
