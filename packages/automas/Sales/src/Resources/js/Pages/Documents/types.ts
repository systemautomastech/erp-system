import { PaginatedData, AuthContext } from '@/types/common';

export interface SalesDocument {
    id: number;
    name: string;
    account_id?: number;
    folder_id?: number;
    type_id?: number;
    opportunity_id?: number;
    status: string;
    publish_date?: string;
    expiration_date?: string;
    attachment?: string;
    assign_user_id?: number;
    description?: string;
    is_active: boolean;
    account?: {
        id: number;
        name: string;
    };
    folder?: {
        id: number;
        name: string;
    };
    type?: {
        id: number;
        name: string;
    };
    opportunity?: {
        id: number;
        name: string;
    };
    assignUser?: {
        id: number;
        name: string;
    };
    assign_user?: {
        id: number;
        name: string;
    };
    created_at: string;
}

export interface SalesDocumentFormData {
    name: string;
    account_id: number | null;
    folder_id: number | null;
    type_id: number | null;
    opportunity_id: number | null;
    status: string;
    publish_date: string;
    expiration_date: string;
    attachment?: File | null;
    assign_user_id: number | null;
    description: string;
    is_active: boolean;
}

export interface DocumentsIndexProps {
    documents: PaginatedData<SalesDocument>;
    auth: AuthContext;
    accounts?: any[];
    folders?: any[];
    types?: any[];
    opportunities?: any[];
    users?: any[];
}

export interface DocumentFormProps {
    accounts: any[];
    folders: any[];
    types: any[];
    opportunities: any[];
    users: any[];
}