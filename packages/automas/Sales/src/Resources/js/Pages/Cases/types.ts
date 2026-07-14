import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface SalesCase {
    id: number;
    name: string;
    case_number: string;
    status: string;
    priority: string;
    description?: string;
    attachment?: string;
    account_id?: number;
    contact_id?: number;
    case_type_id?: number;
    assign_user_id?: number;
    account?: {
        id: number;
        name: string;
    };
    contact?: {
        id: number;
        name: string;
    };
    case_type?: {
        id: number;
        type: string;
    };
    assign_user?: {
        id: number;
        name: string;
    };
    streams?: Stream[];
    created_at: string;
}

export interface Stream {
    id: number;
    remark: string;
    file_upload?: string;
    created_at: string;
    creator?: {
        name: string;
    };
}

export interface CreateSalesCaseFormData {
    name: string;
    status: string;
    priority: string;
    description: string;
    account_id: string;
    contact_id: string;
    case_type_id: string;
    assign_user_id: string;
    attachment?: File;
}

export interface SalesCaseFilters {
    name: string;
    status: string;
    priority: string;
}

export type PaginatedSalesCases = PaginatedData<SalesCase>;
export type SalesCaseModalState = ModalState<SalesCase>;

export interface SalesCasesIndexProps {
    cases: PaginatedSalesCases;
    auth: AuthContext;
    accounts?: Account[];
    contacts?: Contact[];
    caseTypes?: CaseType[];
    users?: User[];
    [key: string]: unknown;
}

export interface Account {
    id: number;
    name: string;
}

export interface Contact {
    id: number;
    name: string;
}

export interface CaseType {
    id: number;
    type: string;
}

export interface User {
    id: number;
    name: string;
}