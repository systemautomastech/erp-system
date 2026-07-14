import { PaginatedData, AuthContext } from '@/types/common';

export interface SalesQuote {
    id: number;
    name: string;
    opportunity_id?: number;
    status: string;
    account_id?: number;
    warehouse_id?: number;
    date_quoted: string;
    expiry_date?: string;
    quote_number: string;
    amount: number;
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    notes?: string;
    is_converted: boolean;
    converted_salesorder_id?: number;
    assign_user_id?: number;
    billing_address?: string;
    billing_city?: string;
    billing_state?: string;
    billing_country?: string;
    billing_postal_code?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_postal_code?: string;
    description?: string;
    account?: {
        id: number;
        name: string;
    };
    warehouse?: {
        id: number;
        name: string;
        address?: string;
    };
    assignUser?: {
        id: number;
        name: string;
    };
    assign_user?: {
        id: number;
        name: string;
    };
    opportunity?: {
        id: number;
        name: string;
    };
    items?: SalesQuoteItem[];
    created_at: string;
}

export interface SalesQuoteItem {
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

export interface SalesQuoteFormData {
    name: string;
    opportunity_id: number | null;
    status: string;
    account_id: number | null;
    warehouse_id?: number | null;
    date_quoted: string;
    expiry_date?: string;
    quote_number?: string;
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
    items?: SalesQuoteItem[];
    same_as_billing?: boolean;
}

export interface QuotesIndexProps {
    quotes: PaginatedData<SalesQuote>;
    auth: AuthContext;
    accounts?: any[];
    users?: any[];
    opportunities?: any[];
    contacts?: any[];
    shippingProviders?: any[];
    warehouses?: any[];
    filters?: any;
}

export interface QuoteFormProps {
    opportunities: any[];
    accounts: any[];
    contacts: any[];
    shippingProviders: any[];
    users: any[];
    warehouses?: any[];
}