import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface SalesMeeting {
    id: number;
    name: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    meeting_type: 'online' | 'in_person';
    start_date: string;
    end_date: string;
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
        email?: string;
    };
    assigned_user?: {
        id: number;
        name: string;
        email?: string;
    };

    creator?: {
        id: number;
        name: string;
    };
}

export interface CreateSalesMeetingFormData {
    name: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    meeting_type: 'online' | 'in_person';
    start_date: string;
    end_date: string;
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

export interface SalesMeetingFilters {
    name: string;
    status: string;
    assigned_user_id: string;
}

export type PaginatedSalesMeetings = PaginatedData<SalesMeeting>;
export type SalesMeetingModalState = ModalState<SalesMeeting>;

export interface SalesMeetingsIndexProps {
    salesMeetings: PaginatedSalesMeetings;
    auth: AuthContext;
    [key: string]: unknown;
}

export interface CreateSalesMeetingProps {
    onSuccess: () => void;
    users?: any[];
    accounts?: any[];
    defaultAccountId?: number;
    defaultParentType?: string;
    defaultParentId?: number;
}

export interface EditSalesMeetingProps {
    salesMeeting: SalesMeeting;
    onSuccess: () => void;
    users?: any[];
    accounts?: any[];
}