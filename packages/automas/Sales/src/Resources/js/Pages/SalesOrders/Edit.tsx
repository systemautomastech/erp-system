import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useFlashMessages } from '@/hooks/useFlashMessages';
import { SalesOrderItem } from './types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import OrderItemsTable from './components/OrderItemsTable';
import { useTaxCalculator } from './components/TaxCalculator';
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
import { CalendarDays, Package } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormFields } from '@/hooks/useFormFields';

interface EditProps {
    order: any;
    customers: Array<{ id: number; name: string; email: string }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    accounts?: Array<{ id: number; name: string }>;
    users?: Array<{ id: number; name: string }>;
    opportunities?: Array<{ id: number; name: string; account_id?: number }>;
    contacts?: Array<{ id: number; name: string; account_id?: number }>;
    shippingProviders?: Array<{ id: number; name: string }>;
    quotes?: Array<{ id: number; name: string; opportunity_id?: number; account_id?: number }>;
    [key: string]: any;
}

export default function Edit() {
    const { t } = useTranslation();
    const { order, customers, warehouses, accounts, users, opportunities, contacts, shippingProviders, quotes } = usePage<EditProps>().props;
    const [availableProducts, setAvailableProducts] = useState([]);
    const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

    useFlashMessages();
    const { data, setData, put, processing, errors } = useForm({
        name: order.name || '',
        quote_id: order.quote_id || null,
        opportunity_id: order.opportunity_id || null,
        status: order.status || 'draft',
        account_id: order.account_id || null,
        warehouse_id: order.warehouse_id ? order.warehouse_id.toString() : '',
        order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        billing_address: order.billing_address || '',
        shipping_address: order.shipping_address || '',
        billing_city: order.billing_city || '',
        billing_state: order.billing_state || '',
        shipping_city: order.shipping_city || '',
        shipping_state: order.shipping_state || '',
        billing_country: order.billing_country || '',
        billing_postal_code: order.billing_postal_code || '',
        shipping_country: order.shipping_country || '',
        shipping_postal_code: order.shipping_postal_code || '',
        billing_contact_id: order.billing_contact_id || null,
        shipping_contact_id: order.shipping_contact_id || null,
        shipping_provider_id: order.shipping_provider_id || null,
        assign_user_id: order.assign_user_id || null,
        customer_id: order.customer_id || null,
        description: order.description || '',
        notes: order.notes || '',
        items: (order.items || []).map((item: any) => ({
            ...item,
            taxes: item.taxes || []
        })) as SalesOrderItem[]
    });

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Sales Orders', id: order.id }, setData, errors, 'edit', t);

    const handleWarehouseChange = async (warehouseId: string) => {
        setData('warehouse_id', warehouseId);

        if (warehouseId) {
            try {
                const response = await fetch(route('sales.orders.warehouse.products') + `?warehouse_id=${warehouseId}`);
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

    const handleCustomerChange = async (customerId: string) => {
        setData('customer_id', customerId ? parseInt(customerId) : null);

        if (customerId && customerId !== 'none') {
            try {
                const response = await fetch(route('sales.orders.customer-details', customerId));
                const details = await response.json();

                if (details.customer) {
                    const { billing_address, shipping_address } = details.customer;

                    setData(prev => ({
                        ...prev,
                        customer_id: parseInt(customerId),
                        billing_address: billing_address?.address_line_1 || '',
                        billing_city: billing_address?.city || '',
                        billing_state: billing_address?.state || '',
                        billing_country: billing_address?.country || '',
                        billing_postal_code: billing_address?.zip_code || '',
                        shipping_address: shipping_address?.address_line_1 || '',
                        shipping_city: shipping_address?.city || '',
                        shipping_state: shipping_address?.state || '',
                        shipping_country: shipping_address?.country || '',
                        shipping_postal_code: shipping_address?.zip_code || ''
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch customer details:', error);
            }
        }
    };

    const handleQuoteChange = async (quoteId: string) => {
        setData('quote_id', quoteId ? parseInt(quoteId) : null);

        if (quoteId && quoteId !== 'none') {
            try {
                const response = await fetch(route('sales.orders.quote-details', quoteId));
                const details = await response.json();

                setData(prev => ({
                    ...prev,
                    quote_id: parseInt(quoteId),
                    opportunity_id: details.opportunity_id || null,
                    account_id: details.account_id || null,
                    warehouse_id: details.warehouse_id || '',
                    customer_id: details.customer_id || null,
                    billing_address: details.billing_address || '',
                    shipping_address: details.shipping_address || '',
                    billing_city: details.billing_city || '',
                    billing_state: details.billing_state || '',
                    shipping_city: details.shipping_city || '',
                    shipping_state: details.shipping_state || '',
                    billing_country: details.billing_country || '',
                    billing_postal_code: details.billing_postal_code || '',
                    shipping_country: details.shipping_country || '',
                    shipping_postal_code: details.shipping_postal_code || '',
                    billing_contact_id: details.billing_contact_id || null,
                    shipping_contact_id: details.shipping_contact_id || null,
                    shipping_provider_id: details.shipping_provider_id || null,
                    items: details.items && details.items.length > 0 ? details.items : [{
                        product_id: 0,
                        quantity: 1,
                        unit_price: 0,
                        discount_percentage: 0,
                        discount_amount: 0,
                        tax_percentage: 0,
                        tax_amount: 0,
                        total_amount: 0
                    }]
                }));

                if (details.warehouse_id) {
                    try {
                        const warehouseResponse = await fetch(route('sales.orders.warehouse.products') + `?warehouse_id=${details.warehouse_id}`);
                        const warehouseProducts = await warehouseResponse.json();
                        setAvailableProducts(warehouseProducts);
                    } catch (error) {
                        console.error('Failed to fetch warehouse products:', error);
                        setAvailableProducts([]);
                    }
                } else {
                    setAvailableProducts([]);
                }
            } catch (error) {
                console.error('Failed to fetch quote details:', error);
            }
        }
    };

    const handleOpportunityChange = async (opportunityId: string) => {
        setData('opportunity_id', opportunityId ? parseInt(opportunityId) : null);

        if (opportunityId && opportunityId !== 'none') {
            try {
                const response = await fetch(route('sales.orders.opportunity-details', opportunityId));
                const details = await response.json();

                setData(prev => ({
                    ...prev,
                    opportunity_id: parseInt(opportunityId),
                    account_id: details.account_id || prev.account_id
                }));
            } catch (error) {
                console.error('Failed to fetch opportunity details:', error);
            }
        }
    };

    const handleCopyAddress = (checked: boolean) => {
        setCopyBillingToShipping(checked);
        if (checked) {
            setData(prev => ({
                ...prev,
                shipping_address: prev.billing_address,
                shipping_city: prev.billing_city,
                shipping_state: prev.billing_state,
                shipping_country: prev.billing_country,
                shipping_postal_code: prev.billing_postal_code
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.orders.update', order.id));
    };

    const totals = useTaxCalculator(data.items);

    const filteredContacts = data.account_id
        ? contacts?.filter((contact: any) => contact.account_id === data.account_id)
        : contacts;

    const availableContacts = React.useMemo(() => {
        const baseContacts = filteredContacts || [];
        const result = [...baseContacts];

        if (data.billing_contact_id && !result.find(c => c.id === data.billing_contact_id)) {
            const billingContact = contacts?.find(c => c.id === data.billing_contact_id);
            if (billingContact) result.push(billingContact);
        }
        if (data.shipping_contact_id && !result.find(c => c.id === data.shipping_contact_id)) {
            const shippingContact = contacts?.find(c => c.id === data.shipping_contact_id);
            if (shippingContact) result.push(shippingContact);
        }

        return result;
    }, [filteredContacts, contacts, data.billing_contact_id, data.shipping_contact_id]);

    const availableOpportunities = React.useMemo(() => {
        const baseOpportunities = data.account_id
            ? opportunities?.filter((opportunity: any) => opportunity.account_id === data.account_id)
            : opportunities || [];
        const result = [...baseOpportunities];

        if (data.opportunity_id && !result.find(o => o.id === data.opportunity_id)) {
            const existingOpportunity = opportunities?.find(o => o.id === data.opportunity_id);
            if (existingOpportunity) result.push(existingOpportunity);
        }

        return result;
    }, [opportunities, data.account_id, data.opportunity_id]);

    const filteredQuotes = quotes;

    useEffect(() => {
        if (data.warehouse_id) {
            const loadProducts = async () => {
                try {
                    const response = await fetch(route('sales.orders.warehouse.products') + `?warehouse_id=${data.warehouse_id}`);
                    const warehouseProducts = await response.json();
                    setAvailableProducts(warehouseProducts);
                } catch (error) {
                    console.error('Failed to fetch warehouse products:', error);
                    setAvailableProducts([]);
                }
            };
            loadProducts();
        }
    }, []);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales'), url: route('sales.index') },
                { label: t('Sales Orders'), url: route('sales.orders.index') },
                { label: t('Edit Order') }
            ]}
            pageTitle={t('Edit Sales Order')}
        >
            <Head title={t('Edit Sales Order')} />

            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5" />
                                {t('Order Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="name" required>
                                        {t('Order Name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Enter order name')}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="order_date" required>
                                        {t('Order Date')}
                                    </Label>
                                    <DatePicker
                                        id="order_date"
                                        value={data.order_date}
                                        onChange={(value) => setData('order_date', value)}
                                        required
                                    />
                                    <InputError message={errors.order_date} />
                                </div>

                                <div>
                                    <Label htmlFor="status" required>
                                        {t('Status')}
                                    </Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">{t('Draft')}</SelectItem>
                                            <SelectItem value="confirmed">{t('Confirmed')}</SelectItem>
                                            <SelectItem value="processing">{t('Processing')}</SelectItem>
                                            <SelectItem value="shipped">{t('Shipped')}</SelectItem>
                                            <SelectItem value="delivered">{t('Delivered')}</SelectItem>
                                            <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="quote_id">
                                        {t('Quote')}
                                    </Label>
                                    <Select value={data.quote_id?.toString() || ''} onValueChange={handleQuoteChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Quote')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredQuotes && filteredQuotes.length > 0 ? (
                                                filteredQuotes.map((quote) => (
                                                    <SelectItem key={quote.id} value={quote.id.toString()}>
                                                        {quote.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {t('No Quotes available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.quote_id} />
                                </div>

                                <div>
                                    <Label htmlFor="opportunity_id">
                                        {t('Opportunity')}
                                    </Label>
                                    <Select value={data.opportunity_id?.toString() || ''} onValueChange={handleOpportunityChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Opportunity')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableOpportunities && availableOpportunities.length > 0 ? (
                                                availableOpportunities.map((opportunity) => (
                                                    <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                                                        {opportunity.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {data.account_id ? t('No Opportunities for selected account') : t('No Opportunities available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.opportunity_id} />
                                </div>

                                <div>
                                    <Label htmlFor="account_id">
                                        {t('Account')}
                                    </Label>
                                    <Select value={data.account_id?.toString() || ''} onValueChange={(value) => setData('account_id', value ? parseInt(value) : null)} disabled>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Account')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts && accounts.length > 0 ? (
                                                accounts.map((account) => (
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="assign_user_id">
                                        {t('Assigned User')}
                                    </Label>
                                    <Select value={data.assign_user_id?.toString() || ''} onValueChange={(value) => setData('assign_user_id', value ? parseInt(value) : null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select User')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.assign_user_id} />
                                </div>

                                <div>
                                    <Label htmlFor="customer_id" required>
                                        {t('Customer')}
                                    </Label>
                                    <Select value={data.customer_id?.toString() || ''} onValueChange={handleCustomerChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Customer')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {customers && customers.length > 0 ? (
                                                customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.name} - {customer.email}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {t('No Customers available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.customer_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <h4 className="font-medium mb-3">{t('Billing Address')}</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="billing_address">
                                                {t('Address')}
                                            </Label>
                                            <Textarea
                                                id="billing_address"
                                                value={data.billing_address}
                                                onChange={(e) => setData('billing_address', e.target.value)}
                                                rows={2}
                                                placeholder={t('Billing address...')}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="billing_city">
                                                    {t('City')}
                                                </Label>
                                                <Input
                                                    id="billing_city"
                                                    value={data.billing_city}
                                                    onChange={(e) => setData('billing_city', e.target.value)}
                                                    placeholder={t('City')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="billing_state">
                                                    {t('State')}
                                                </Label>
                                                <Input
                                                    id="billing_state"
                                                    value={data.billing_state}
                                                    onChange={(e) => setData('billing_state', e.target.value)}
                                                    placeholder={t('State')}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="billing_country">
                                                    {t('Country')}
                                                </Label>
                                                <Input
                                                    id="billing_country"
                                                    value={data.billing_country}
                                                    onChange={(e) => setData('billing_country', e.target.value)}
                                                    placeholder={t('Country')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="billing_postal_code">
                                                    {t('Postal Code')}
                                                </Label>
                                                <Input
                                                    id="billing_postal_code"
                                                    value={data.billing_postal_code}
                                                    onChange={(e) => setData('billing_postal_code', e.target.value)}
                                                    placeholder={t('Postal Code')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">{t('Shipping Address')}</h4>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="copy-address"
                                                checked={copyBillingToShipping}
                                                onCheckedChange={handleCopyAddress}
                                            />
                                            <Label htmlFor="copy-address" className="text-sm">
                                                {t('Copy from billing')}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="shipping_address">
                                                {t('Address')}
                                            </Label>
                                            <Textarea
                                                id="shipping_address"
                                                value={data.shipping_address}
                                                onChange={(e) => setData('shipping_address', e.target.value)}
                                                rows={2}
                                                placeholder={t('Shipping address...')}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="shipping_city">
                                                    {t('City')}
                                                </Label>
                                                <Input
                                                    id="shipping_city"
                                                    value={data.shipping_city}
                                                    onChange={(e) => setData('shipping_city', e.target.value)}
                                                    placeholder={t('City')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping_state">
                                                    {t('State')}
                                                </Label>
                                                <Input
                                                    id="shipping_state"
                                                    value={data.shipping_state}
                                                    onChange={(e) => setData('shipping_state', e.target.value)}
                                                    placeholder={t('State')}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="shipping_country">
                                                    {t('Country')}
                                                </Label>
                                                <Input
                                                    id="shipping_country"
                                                    value={data.shipping_country}
                                                    onChange={(e) => setData('shipping_country', e.target.value)}
                                                    placeholder={t('Country')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping_postal_code">
                                                    {t('Postal Code')}
                                                </Label>
                                                <Input
                                                    id="shipping_postal_code"
                                                    value={data.shipping_postal_code}
                                                    onChange={(e) => setData('shipping_postal_code', e.target.value)}
                                                    placeholder={t('Postal Code')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div>
                                    <Label htmlFor="description">
                                        {t('Description')}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={2}
                                        placeholder={t('Order description...')}
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="billing_contact_id">
                                        {t('Billing Contact')}
                                    </Label>
                                    <Select value={data.billing_contact_id?.toString() || ''} onValueChange={(value) => setData('billing_contact_id', value ? parseInt(value) : null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Billing Contact')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {availableContacts && availableContacts.length > 0 ? (
                                                availableContacts.map((contact) => (
                                                    <SelectItem key={contact.id} value={contact.id.toString()}>
                                                        {contact.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {t('No Contacts available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.billing_contact_id} />
                                </div>

                                <div>
                                    <Label htmlFor="shipping_contact_id">
                                        {t('Shipping Contact')}
                                    </Label>
                                    <Select value={data.shipping_contact_id?.toString() || ''} onValueChange={(value) => setData('shipping_contact_id', value ? parseInt(value) : null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Shipping Contact')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {availableContacts && availableContacts.length > 0 ? (
                                                availableContacts.map((contact) => (
                                                    <SelectItem key={contact.id} value={contact.id.toString()}>
                                                        {contact.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {t('No Contacts available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.shipping_contact_id} />
                                </div>

                                <div>
                                    <Label htmlFor="shipping_provider_id">
                                        {t('Shipping Provider')}
                                    </Label>
                                    <Select value={data.shipping_provider_id?.toString() || ''} onValueChange={(value) => setData('shipping_provider_id', value ? parseInt(value) : null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Shipping Provider')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {shippingProviders && shippingProviders.length > 0 ? (
                                                shippingProviders.map((provider) => (
                                                    <SelectItem key={provider.id} value={provider.id.toString()}>
                                                        {provider.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-data" disabled>
                                                    {t('No Shipping Providers available')}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.shipping_provider_id} />
                                </div>
                            </div>

                            {/* Custom Fields */}
                            {customFields.length > 0 && (
                                <div className="mt-1 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {customFields.map((field) => (
                                            <div key={field.id} className="space-y-2">
                                                {field.component}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-5 w-5" />
                                    {t('Sales Order Items')}
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
                            <OrderItemsTable
                                items={data.items}
                                onChange={(items) => setData('items', items)}
                                errors={errors}
                                products={availableProducts}
                                showAddButton={false}
                            />

                            <div className="mt-6 flex justify-end">
                                <div className="w-80 bg-muted/30 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">{t('Order Summary')}</h3>
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

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {data.items.length} {t('items added')}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('sales.orders.index'))}
                            >
                                {t('Cancel')}
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
            </div>
        </AuthenticatedLayout>
    );
}
