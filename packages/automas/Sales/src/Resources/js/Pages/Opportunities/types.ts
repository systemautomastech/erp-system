import { PaginatedData, ModalState, AuthContext, CreateProps, EditProps } from '@/types/common';

export interface Opportunity {
    id: number;
    name: string;
    description?: string;
    amount: number;
    expected_amount?: number;
    lead_source?: string;
    probability: number;
    close_date?: string;
    next_followup_date?: string;
    next_step?: string;
    lost_reason?: string;
    is_active: boolean;
    account_id?: number;
    contact_id?: number;
    stage_id?: number;
    assign_user_id?: number;
    account?: {
        id: number;
        name: string;
    };
    contact?: {
        id: number;
        name: string;
    };
    stage?: {
        id: number;
        name: string;
        color?: string;
    };
    assign_user?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface OpportunityFormData {
    name: string;
    account_id: string;
    contact_id: string;
    stage_id: string;
    amount: number;
    expected_amount: number;
    lead_source: string;
    probability: number[];
    close_date: string;
    next_followup_date: string;
    next_step: string;
    lost_reason: string;
    assign_user_id: string;
    description: string;
    is_active: boolean;
}

export type CreateOpportunityFormData = OpportunityFormData;
export type EditOpportunityFormData = OpportunityFormData;

export interface CreateOpportunityProps {
    onSuccess: () => void;
    accounts?: any[];
    contacts?: any[];
    stages?: any[];
    users?: any[];
    selectedStageId?: string;
    defaultAccountId?: number;
    defaultContactId?: number;
}

export interface EditOpportunityProps {
    opportunity: Opportunity;
    onSuccess: () => void;
    accounts?: any[];
    contacts?: any[];
    stages?: any[];
    users?: any[];
}

export interface OpportunityFilters {
    name: string;
    account_id: string;
    stage_id: string;
    assign_user_id: string;
    is_active: string;
}

export type PaginatedOpportunities = PaginatedData<Opportunity>;

export interface OpportunityModalState {
    isOpen: boolean;
    mode: '' | 'add' | 'edit';
    data: Opportunity | null;
}

export interface OpportunitiesIndexProps {
    opportunities: PaginatedOpportunities;
    accounts: Array<{ id: number; name: string }>;
    contacts: Array<{ id: number; name: string; account_id?: number }>;
    stages: Array<{ id: number; name: string; color?: string }>;
    users: Array<{ id: number; name: string }>;
    auth: AuthContext;
    [key: string]: unknown;
}

export interface OpportunityFormErrors {
    name?: string;
    account_id?: string;
    contact_id?: string;
    stage_id?: string;
    amount?: string;
    expected_amount?: string;
    lead_source?: string;
    probability?: string;
    close_date?: string;
    next_followup_date?: string;
    next_step?: string;
    lost_reason?: string;
    assign_user_id?: string;
    description?: string;
    is_active?: string;
}