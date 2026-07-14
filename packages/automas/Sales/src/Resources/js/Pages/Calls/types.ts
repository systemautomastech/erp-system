import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface SalesCall {
    id: number;
    name: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    start_date: string;
    end_date: string;
    direction: 'inbound' | 'outbound';
    parent_type?: string;
    parent_id?: number;

    account_id?: number;
    assigned_user_id?: number;
    description?: string;
    attendees_users?: number[];
    attendees_contacts?: number[];
    creator_id: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    account?: {
        id: number;
        name: string;
    };
    assigned_user?: {
        id: number;
        name: string;
    };

    creator?: {
        id: number;
        name: string;
    };
}

export interface CreateSalesCallFormData {
    name: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    start_date: string;
    end_date: string;
    direction: 'inbound' | 'outbound';
    parent_type: string;
    parent_id: number | null;

    account_id: number | null;
    assigned_user_id: number | null;
    description: string;
    attendees_users: number[];
    attendees_contacts: number[];
    sync_to_google_calendar: boolean;
    sync_to_outlook_calendar: boolean;
}

export interface SalesCallFilters {
    name: string;
    status: string;
    direction: string;
    assigned_user_id: string;
}

export type PaginatedSalesCalls = PaginatedData<SalesCall>;
export type SalesCallModalState = ModalState<SalesCall>;

export interface SalesCallsIndexProps {
    salesCalls: PaginatedSalesCalls;
    auth: AuthContext;
    [key: string]: unknown;
}

export interface CreateSalesCallProps {
    onSuccess: () => void;
    users?: any[];
    accounts?: any[];
    defaultAccountId?: number;
    defaultParentType?: string;
    defaultParentId?: number;
}

export interface EditSalesCallProps {
    salesCall: SalesCall;
    onSuccess: () => void;
    users?: any[];
    accounts?: any[];
}