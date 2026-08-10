import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { useFormFields } from '@/hooks/useFormFields';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import InvoiceItemsTable from '../Sales/components/InvoiceItemsTable';
import { useTaxCalculator, calculateLineItemAmounts } from '../Sales/components/TaxCalculator';
import { formatCurrency } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputError } from '@/components/ui/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Package, Eye, FileText, User, X } from 'lucide-react';
import ProposalPreviewModal from './components/ProposalPreviewModal';
import TariffDetailsTable, { ProposalTariffRow } from './components/TariffDetailsTable';
import ChargeItemsTable from './components/ChargeItemsTable';

interface SalesProposal {
    id: number;
    proposal_date: string;
    due_date: string;
    customer_id: number;
    warehouse_id?: number;
    type?: string;
    payment_terms?: string;
    notes?: string;
    items: any[];
    tariffs?: any[];
}

interface EditProps {
    proposal: SalesProposal;
    customers: Array<{ id: number; name: string; email: string }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    [key: string]: any;
}

export default function Edit() {
    const { t } = useTranslation();
    const { proposal, customers, warehouses, proposalSetting } = usePage<EditProps>().props;
    const [availableProducts, setAvailableProducts] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useFlashMessages();
    const { data, setData, put, processing, errors } = useForm({
        invoice_date: proposal.proposal_date,
        due_date: proposal.due_date,
        customer_id: proposal.customer_id.toString(),
        warehouse_id: proposal.warehouse_id?.toString() || '',
        type: proposal.type || 'product',
        payment_terms: proposal.payment_terms || '',
        notes: proposal.notes || '',
        items: (proposal.items || []).map(item => {
            const calculations = calculateLineItemAmounts(
                item.quantity,
                item.unit_price,
                item.discount_percentage,
                item.tax_percentage
            );
            return {
                ...item,
                taxes: item.taxes || [],
                discount_amount: calculations.discountAmount,
                tax_amount: calculations.taxAmount,
                tariffs: (proposal.tariffs || []) as ProposalTariffRow[],
            });

        // Selected Customer Details
        const selectedCustomer = customers?.find((c) => String(c.id) === String(data.customer_id));

        // Get custom fields using useFormFields hook
        const customFields = useFormFields('getCustomFields', { ...data, module: 'General', sub_module: 'Proposal', id: proposal.id }, setData, errors, 'edit', t);

        useEffect(() => {
        if (data.type === 'product' && data.warehouse_id) {
            handleWarehouseChange(data.warehouse_id);
        } else if (data.type === 'service') {
            loadServices();
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

    const loadServices = async () => {
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
        put(route('sales-proposals.update', proposal.id));
    };

    const totals = useTaxCalculator(data.items);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Proposals'), url: route('sales-proposals.index') },
                { label: t('Edit Proposal') }
            ]}
            pageTitle={t('Edit Proposal')}
        >
            <Head title={t('Edit Proposal')} />

            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5" />
                                {t('Sales Proposal Details')}
                            </CardTitle>
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
                                            {customers.map((customer) => (
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
                                            <SelectContent>
                                                {warehouses.map((warehouse) => (
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

                    {/* 1. One-Time Charge (OTC) Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="h-5 w-5 text-purple-600" />
                                {t('One-Time Charges (OTC)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InvoiceItemsTable
                                items={data.items.filter(i => i.section === 'otc' || i.section === 'general' || !i.section)}
                                onChange={(updatedOtcItems) => {
                                    const formattedOtc = updatedOtcItems.map(i => ({ ...i, section: 'otc' }));
                                    const mrcItems = data.items.filter(i => i.section === 'mrc');
                                    setData('items', [...formattedOtc, ...mrcItems]);
                                }}
                                errors={errors}
                                products={availableProducts}
                                showAddButton={true}
                                invoiceType={data.type}
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
                                onChange={(updatedMrcItems) => {
                                    const formattedMrc = updatedMrcItems.map(i => ({ ...i, section: 'mrc' }));
                                    const otcItems = data.items.filter(i => i.section !== 'mrc');
                                    setData('items', [...otcItems, ...formattedMrc]);
                                }}
                                errors={errors}
                                products={availableProducts}
                                showAddButton={true}
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
                                {t('Full Preview')}
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

                <ProposalPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    formData={{
                        ...data,
                        proposal_number: proposal.id ? `PROP-${proposal.id}` : undefined,
                    }}
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
                    tariffs={data.tariffs}
                />
            </div>
        </AuthenticatedLayout>
    );
}
