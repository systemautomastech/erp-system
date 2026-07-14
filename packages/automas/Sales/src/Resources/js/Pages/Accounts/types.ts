import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface Account {
    id: number;
    name: string;
    email: string;
    phone: string;
    website?: string;
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
    assign_user_id?: number;
    type_id?: number;
    industry_id?: number;
    sales_document_id?: number;
    description?: string;
    is_active: boolean;
    created_at: string;
    assign_user?: { id: number; name: string };
    account_type?: { id: number; name: string; color: string };
    account_industry?: { id: number; name: string; color: string };

}

export interface AccountFormData {
    name: string;
    email: string;
    phone: string;
    website?: string;
    billing_address: Address;
    shipping_address: Address;
    same_as_billing: boolean;
    assign_user_id?: string;
    type_id?: string;
    industry_id?: string;
    sales_document_id?: string;
    description?: string;
    is_active?: boolean;
}

export interface CreateAccountFormData {
    name: string;
    email: string;
    phone: string;
    website: string;
    billing_address: Address;
    shipping_address: Address;
    same_as_billing: boolean;
    assign_user_id: string;
    type_id: string;
    industry_id: string;
    sales_document_id: string;
    description: string;
    is_active: boolean;
}

export interface AccountFilters {
    name: string;
    email: string;
    type_id: string;
    industry_id: string;
    assign_user_id: string;
    is_active: string;
}

export type PaginatedAccounts = PaginatedData<Account>;
export type AccountModalState = ModalState<Account>;

export interface AccountsIndexProps {
    accounts: PaginatedAccounts;
    auth: AuthContext;
    accountTypes: AccountType[];
    accountIndustries: AccountIndustry[];
    users: User[];
    documents: Document[];
}

export interface User {
    id: number;
    name: string;
}

export interface AccountType {
    id: number;
    name: string;
}

export interface AccountIndustry {
    id: number;
    name: string;
}

export interface Document {
    id: number;
    name: string;
}





export interface CreateAccountProps {
    users: User[];
    accountTypes: AccountType[];
    accountIndustries: AccountIndustry[];
    documents?: Document[];
    onSuccess: () => void;
    defaultDocumentId?: number;
}

export interface EditAccountProps {
    account: Account;
    users: User[];
    accountTypes: AccountType[];
    accountIndustries: AccountIndustry[];
    documents?: Document[];
    onSuccess: () => void;
}

export interface ShowAccountProps {
    account: Account;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    assign_user?: { id: number; name: string };
    is_active: boolean;
}

export interface Opportunity {
    id: number;
    name: string;
    amount: number;
    probability: number;
    stage?: { id: number; name: string };
    assign_user?: { id: number; name: string };
    is_active: boolean;
}

export interface Stage {
    id: number;
    name: string;
}