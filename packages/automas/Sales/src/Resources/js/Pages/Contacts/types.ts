import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface Contact {
    id: number;
    name: string;
    account_id?: number;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    postal_code?: string;
    country?: string;
    assign_user_id?: number;
    description?: string;
    is_active: boolean;
    created_at: string;
    assign_user?: { id: number; name: string };
    account?: { id: number; name: string };
}

export interface CreateContactFormData {
    name: string;
    account_id: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    assign_user_id: string;
    description: string;
    is_active: boolean;
}

export interface ContactFilters {
    name: string;
    email: string;
    account_id: string;
    assign_user_id: string;
    is_active: string;
}

export type PaginatedContacts = PaginatedData<Contact>;
export type ContactModalState = ModalState<Contact>;

export interface ContactsIndexProps {
    contacts: PaginatedContacts;
    auth: AuthContext;
    accounts: Account[];
    users: User[];
}

export interface User {
    id: number;
    name: string;
}

export interface Account {
    id: number;
    name: string;
}

export interface CreateContactProps {
    accounts: Account[];
    users: User[];
    onSuccess: () => void;
}

export interface EditContactProps {
    contact: Contact;
    accounts: Account[];
    users: User[];
    onSuccess: () => void;
}

export interface ShowContactProps {
    contact: Contact;
    streams?: any[];
    opportunities?: Opportunity[];
}

export interface Opportunity {
    id: number;
    name: string;
    account_id?: number;
    contact_id?: number;
    stage_id?: number;
    amount: number;
    probability: number;
    close_date: string;
    lead_source?: string;
    assign_user_id?: number;
    description?: string;
    is_active: boolean;
    created_at: string;
    assign_user?: { id: number; name: string };
    account?: { id: number; name: string };
    stage?: { id: number; name: string };
}