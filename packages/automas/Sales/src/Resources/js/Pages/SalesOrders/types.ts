import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface SalesOrder {
    id: number;
    name: string;
    quote_id?: number;
    opportunity_id?: number;
    account_id?: number;
    order_date: string;
    status: string;
    order_number?: string;
    assign_user_id?: number;
    billing_address?: string;
    shipping_address?: string;
    billing_city?: string;
    billing_state?: string;
    shipping_city?: string;
    shipping_state?: string;
    billing_country?: string;
    billing_postal_code?: string;
    shipping_country?: string;
    shipping_postal_code?: string;
    billing_contact_id?: number;
    shipping_contact_id?: number;
    shipping_provider_id?: number;
    description?: string;
    amount: number;

    created_at: string;
    quote?: { id: number; name: string };
    opportunity?: { id: number; name: string };
    account?: { id: number; name: string };
    assign_user?: { id: number; name: string };
    billing_contact?: { id: number; name: string };
    shipping_contact?: { id: number; name: string };
    shipping_provider?: { id: number; name: string };
    items?: SalesOrderItem[];
}

export interface SalesOrderItem {
    id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    total_amount: number;
    description?: string;
    taxes?: Array<{tax_name: string; tax_rate: number}>;
}

export interface SalesOrderFormData {
    name: string;
    quote_id: number | null;
    opportunity_id: number | null;
    account_id: number | null;
    warehouse_id?: number | null;
    order_date: string;
    status: string;
    order_number?: string;
    billing_address: string;
    shipping_address: string;
    billing_city: string;
    billing_state: string;
    shipping_city: string;
    shipping_state: string;
    billing_country: string;
    billing_postal_code: string;
    shipping_country: string;
    shipping_postal_code: string;
    billing_contact_id: number | null;
    shipping_contact_id: number | null;
    shipping_provider_id: number | null;
    assign_user_id: number | null;
    description: string;
    notes?: string;
    items?: SalesOrderItem[];
    same_as_billing?: boolean;
}

export interface SalesOrderFilters {
    name: string;
    status: string;
    account: string;
    order_id: string;
    quote_id: string;
    opportunity_id: string;
    assign_user_id: string;
}

export interface SalesOrderTotals {
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    total: number;
}

export interface DropdownOption {
    id: number;
    name: string;
}

export type PaginatedSalesOrders = PaginatedData<SalesOrder>;
export type SalesOrderModalState = ModalState<SalesOrder>;

export interface SalesOrdersIndexProps {
    salesOrders: PaginatedSalesOrders;
    auth: AuthContext;
    quotes?: any[];
    opportunities?: any[];
    accounts?: any[];
    contacts?: any[];
    shippingProviders?: any[];
    users?: any[];
    warehouses?: any[];
    filters?: any;
}

export interface OrderFormProps {
    opportunities: any[];
    accounts: any[];
    contacts: any[];
    shippingProviders: any[];
    users: any[];
    warehouses?: any[];
}