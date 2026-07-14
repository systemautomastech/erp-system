import { PaginatedData, ModalState, AuthContext, CreateProps, EditProps } from '@/types/common';

export interface CaseType {
    id: number;
    type: string;
    created_at: string;
}

export interface CaseTypeFormData {
    type: string;
}

export interface CreateCaseTypeProps extends CreateProps {
}

export interface EditCaseTypeProps extends EditProps<CaseType> {
}

export type PaginatedCaseTypes = PaginatedData<CaseType>;
export type CaseTypeModalState = ModalState<CaseType>;

export interface CaseTypesIndexProps {
    casetypes: PaginatedCaseTypes;
    auth: AuthContext;
    [key: string]: unknown;
}