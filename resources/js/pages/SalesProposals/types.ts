export interface ProposalItem {
    id?: number | string;
    proposal_id?: number;
    invoice_id?: number;
    product_id: number;
    section?: string;
    product_type?: string;
    product_description?: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax_percentage: number;
    tax_amount: number;
    total_amount: number;
    taxes?: Array<{ id?: number; tax_name: string; tax_rate?: number; rate?: number }>;
    product?: {
        id?: number;
        name?: string;
        sku?: string;
        sale_price?: number;
        description?: string;
        tax?: Array<{ id?: number; name?: string; rate?: number }>;
    };
}

export type SalesProposalItem = ProposalItem;

export interface ProposalCustomer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface ProposalWarehouse {
    id: number;
    name: string;
    address?: string;
}
