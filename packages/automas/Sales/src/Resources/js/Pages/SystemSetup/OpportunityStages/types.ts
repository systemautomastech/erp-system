export interface OpportunityStage {
    id: number;
    name: string;
    description?: string;
    order: number;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateOpportunityStageFormData {
    name: string;
    description: string;
    order: number;
    color: string;
    is_active: boolean;
}

export interface OpportunityStageModalState {
    isOpen: boolean;
    mode: string;
    data: OpportunityStage | null;
}

export interface OpportunityStagesIndexProps {
    stages: OpportunityStage[];
    auth: {
        user: {
            permissions: string[];
        };
    };
}