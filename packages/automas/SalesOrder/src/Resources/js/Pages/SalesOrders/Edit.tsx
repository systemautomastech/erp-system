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
import { CalendarDays, Package, UserPlus, Users, User, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useFormFields } from '@/hooks/useFormFields';

interface EditProps {
    order: any;
    customers: Array<{
        id: number;
        name: string;
        email: string;
        mobile_no?: string;
        billing_address?: any;
        shipping_address?: any;
    }>;
    warehouses: Array<{ id: number; name: string; address: string }>;
    users?: Array<{ id: number; name: string }>;
    quotes?: Array<{ id: number; name: string; customer_id?: number; warehouse_id?: number; [key: string]: any }>;
    [key: string]: any;
}

export default function Edit() {
    const { t } = useTranslation();
    const { order, customers, warehouses, users, quotes } = usePage<EditProps>().props;
    const [availableProducts, setAvailableProducts] = useState([]);
    const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

    useFlashMessages();
    const { data, setData, put, processing, errors } = useForm({
        name: order.name || '',
        quote_id: order.quote_id || null,
        status: order.status || 'draft',
        warehouse_id: order.warehouse_id ? order.warehouse_id.toString() : '',
        order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expected_delivery_date: order.expected_delivery_date ? new Date(order.expected_delivery_date).toISOString().split('T')[0] : '',

        customer_type: 'existing' as 'existing' | 'new',
        customer_id: order.customer_id || null,
        customer_name: order.customer?.name || '',
        customer_email: order.customer?.email || '',
        customer_phone: order.customer?.mobile_no || '',
        customer_address: '',

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

        assign_user_id: order.assign_user_id || (order.assigned_users && order.assigned_users[0]?.id) || null,
        assigned_user_ids: order.assigned_users ? order.assigned_users.map((u: any) => u.id) : [],
        description: order.description || '',
        notes: order.notes || '',
        items: (order.items || []).map((item: any) => ({
            ...item,
            taxes: item.taxes || []
        })) as SalesOrderItem[]
    });

    // Custom fields hook
    const customFields = useFormFields('getCustomFields', { ...data, module: 'Sales', sub_module: 'Sales Orders', id: order.id }, setData, errors, 'edit', t);

    // Initial products load for order warehouse
    useEffect(() => {
        if (order.warehouse_id) {
            handleWarehouseChange(order.warehouse_id.toString());
        }
    }, [order.warehouse_id]);

    const handleWarehouseChange = async (warehouseId: string) => {
        setData('warehouse_id', warehouseId);

        if (warehouseId) {
            try {
                const response = await fetch(route('salesorder.orders.products') + `?warehouse_id=${warehouseId}`);
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

    const selectedCustomer = React.useMemo(() => {
        if (data.customer_type === 'new') {
            if (!data.customer_name && !data.customer_email) return null;
            return {
                id: 0,
                name: data.customer_name,
                email: data.customer_email,
                mobile_no: data.customer_phone,
            };
        }
        if (!data.customer_id || !Array.isArray(customers)) return null;
        return customers.find((c: any) => String(c.id) === String(data.customer_id)) || null;
    }, [data.customer_type, data.customer_id, data.customer_name, data.customer_email, data.customer_phone, customers]);

    const handleCustomerChange = async (customerId: string) => {
        const id = customerId ? parseInt(customerId) : null;
        setData('customer_id', id);

        if (!customerId || customerId === 'none') {
            return;
        }

        // 1. Instant local auto-fill if available in customers prop
        const localCust = customers?.find((c: any) => String(c.id) === String(customerId));
        if (localCust) {
            let bAddr = '', bCity = '', bState = '', bCountry = '', bZip = '';
            let sAddr = '', sCity = '', sState = '', sCountry = '', sZip = '';

            if (typeof localCust.billing_address === 'object' && localCust.billing_address !== null) {
                bAddr = localCust.billing_address.address_line_1 || localCust.billing_address.address || '';
                bCity = localCust.billing_address.city || '';
                bState = localCust.billing_address.state || '';
                bCountry = localCust.billing_address.country || '';
                bZip = localCust.billing_address.zip_code || '';
            } else if (typeof localCust.billing_address === 'string') {
                bAddr = localCust.billing_address;
            }

            if (typeof localCust.shipping_address === 'object' && localCust.shipping_address !== null) {
                sAddr = localCust.shipping_address.address_line_1 || localCust.shipping_address.address || '';
                sCity = localCust.shipping_address.city || '';
                sState = localCust.shipping_address.state || '';
                sCountry = localCust.shipping_address.country || '';
                sZip = localCust.shipping_address.zip_code || '';
            } else if (typeof localCust.shipping_address === 'string') {
                sAddr = localCust.shipping_address;
            }

            setData(prev => ({
                ...prev,
                customer_id: id,
                billing_address: bAddr || prev.billing_address,
                billing_city: bCity || prev.billing_city,
                billing_state: bState || prev.billing_state,
                billing_country: bCountry || prev.billing_country,
                billing_postal_code: bZip || prev.billing_postal_code,
                shipping_address: sAddr || bAddr || prev.shipping_address,
                shipping_city: sCity || bCity || prev.shipping_city,
                shipping_state: sState || bState || prev.shipping_state,
                shipping_country: sCountry || bCountry || prev.shipping_country,
                shipping_postal_code: sZip || bZip || prev.shipping_postal_code,
            }));
        }

        // 2. Fetch server details for fresh address data
        try {
            const response = await fetch(route('salesorder.orders.customer-details', customerId));
            if (response.ok) {
                const details = await response.json();
                if (details.customer) {
                    const { billing_address, shipping_address } = details.customer;

                    const parseAddr = (addr: any) => {
                        if (typeof addr === 'object' && addr !== null) {
                            return {
                                address: addr.address_line_1 || addr.address || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                country: addr.country || '',
                                zip: addr.zip_code || '',
                            };
                        }
                        return { address: typeof addr === 'string' ? addr : '', city: '', state: '', country: '', zip: '' };
                    };

                    const b = parseAddr(billing_address);
                    const s = parseAddr(shipping_address);

                    setData(prev => ({
                        ...prev,
                        customer_id: id,
                        billing_address: b.address || prev.billing_address,
                        billing_city: b.city || prev.billing_city,
                        billing_state: b.state || prev.billing_state,
                        billing_country: b.country || prev.billing_country,
                        billing_postal_code: b.zip || prev.billing_postal_code,
                        shipping_address: s.address || b.address || prev.shipping_address,
                        shipping_city: s.city || b.city || prev.shipping_city,
                        shipping_state: s.state || b.state || prev.shipping_state,
                        shipping_country: s.country || b.country || prev.shipping_country,
                        shipping_postal_code: s.zip || b.zip || prev.shipping_postal_code,
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
        }
    };

    const handleQuoteChange = async (quoteId: string) => {
        setData('quote_id', quoteId ? parseInt(quoteId) : null);

        if (quoteId && quoteId !== 'none') {
            const quote = quotes?.find((q: any) => String(q.id) === String(quoteId));
            if (quote?.customer_id) {
                handleCustomerChange(String(quote.customer_id));
            }
            if (quote?.warehouse_id) {
                handleWarehouseChange(String(quote.warehouse_id));
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
        put(route('salesorder.orders.update', order.id), {
            onSuccess: () => {
                router.visit(route('salesorder.orders.show', order.id));
            }
        });
    };

    const totals = useTaxCalculator(data.items);

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Sales Orders'), url: route('salesorder.orders.index') },
                { label: order.order_number || order.name, url: route('salesorder.orders.show', order.id) },
                { label: t('Edit') }
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
                        <CardContent className="space-y-5">
                            {/* Row 1: Order Name, Order Date, Status, Warehouse */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="name" required>
                                        {t('Order Name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Order Name')}
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
                                        <SelectContent searchable>
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

                            {/* Row 2: Customer, Quote, Assigned User, Expected Delivery Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Customer with Existing / New Toggle */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label htmlFor="customer_id" required className="mb-0">
                                            {t('Customer')}
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextMode = data.customer_type === 'new' ? 'existing' : 'new';
                                                setData('customer_type', nextMode);
                                            }}
                                            className="text-[11px] font-semibold text-primary flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            {data.customer_type === 'new' ? (
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

                                    {data.customer_type === 'existing' ? (
                                        <>
                                            <Select
                                                value={data.customer_id ? data.customer_id.toString() : ''}
                                                onValueChange={handleCustomerChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('Select Customer')} />
                                                </SelectTrigger>
                                                <SelectContent searchable>
                                                    {customers && customers.length > 0 ? (
                                                        customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                {customer.name} {customer.email ? `- ${customer.email}` : ''}
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

                                            {/* Selected Customer Preview Card */}
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
                                                            onClick={() => {
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    customer_id: null,
                                                                    billing_address: '',
                                                                    billing_city: '',
                                                                    billing_state: '',
                                                                    billing_country: '',
                                                                    billing_postal_code: '',
                                                                    shipping_address: '',
                                                                    shipping_city: '',
                                                                    shipping_state: '',
                                                                    shipping_country: '',
                                                                    shipping_postal_code: '',
                                                                }));
                                                            }}
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                            {t('Clear')}
                                                        </Button>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 truncate">
                                                        <div className="truncate">{selectedCustomer.email || '-'}</div>
                                                        {selectedCustomer.mobile_no && (
                                                            <div className="truncate">{selectedCustomer.mobile_no}</div>
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

                                {/* Quote */}
                                <div>
                                    <Label htmlFor="quote_id">
                                        {t('Quote')}
                                    </Label>
                                    <Select value={data.quote_id?.toString() || ''} onValueChange={handleQuoteChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select Quote')} />
                                        </SelectTrigger>
                                        <SelectContent searchable>
                                            {quotes && quotes.length > 0 ? (
                                                quotes.map((quote) => (
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

                                {/* Assigned User */}
                                <div>
                                    <Label htmlFor="assign_user_id">
                                        {t('Assigned User')}
                                    </Label>
                                    <Select
                                        value={data.assign_user_id?.toString() || ''}
                                        onValueChange={(value) => setData('assign_user_id', value ? parseInt(value) : null)}
                                    >
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

                                {/* Expected Delivery Date */}
                                <div>
                                    <Label htmlFor="expected_delivery_date">
                                        {t('Expected Delivery Date')}
                                    </Label>
                                    <DatePicker
                                        id="expected_delivery_date"
                                        value={data.expected_delivery_date}
                                        onChange={(value) => setData('expected_delivery_date', value)}
                                    />
                                    <InputError message={errors.expected_delivery_date} />
                                </div>
                            </div>

                            {/* New Customer Form Row (Active only when New Customer Mode is selected) */}
                            {data.customer_type === 'new' && (
                                <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] space-y-2.5">
                                    <div className="flex items-center justify-between pb-1 border-b border-primary/10">
                                        <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                            <UserPlus className="h-3.5 w-3.5" />
                                            {t('New Customer Details')}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                        <div className="space-y-1">
                                            <Label htmlFor="customer_name" required className="text-xs">
                                                {t('Customer Name')}
                                            </Label>
                                            <Input
                                                id="customer_name"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                placeholder={t('Customer / Company Name')}
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_name} />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="customer_email" required className="text-xs">
                                                {t('Email')}
                                            </Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                placeholder="customer@example.com"
                                                className="h-8 text-xs"
                                                required
                                            />
                                            <InputError message={errors.customer_email} />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="customer_phone" className="text-xs">
                                                {t('Phone / Mobile')}
                                            </Label>
                                            <Input
                                                id="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder="+123456789"
                                                className="h-8 text-xs"
                                            />
                                            <InputError message={errors.customer_phone} />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="customer_address" className="text-xs">
                                                {t('Address')}
                                            </Label>
                                            <Input
                                                id="customer_address"
                                                value={data.customer_address}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        customer_address: val,
                                                        billing_address: prev.billing_address || val,
                                                        shipping_address: prev.shipping_address || val,
                                                    }));
                                                }}
                                                placeholder={t('Street Address')}
                                                className="h-8 text-xs"
                                            />
                                            <InputError message={errors.customer_address} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Addresses: Billing & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                                            <Label htmlFor="copy-address" className="text-sm cursor-pointer">
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

                            {/* Description & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

                    {/* Order Items */}
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
                                onClick={() => router.visit(route('salesorder.orders.show', order.id))}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || data.items.length === 0}
                            >
                                {processing ? t('Saving...') : t('Save Changes')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
