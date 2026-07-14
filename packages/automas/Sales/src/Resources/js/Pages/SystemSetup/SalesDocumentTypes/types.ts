import { PaginatedData, ModalState, AuthContext, CreateProps, EditProps } from '@/types/common';

export interface SalesDocumentType {
    id: number;
    name: string;
    created_at: string;
}

export interface SalesDocumentTypeFormData {
    name: string;
}

export interface CreateSalesDocumentTypeProps extends CreateProps {
}

export interface EditSalesDocumentTypeProps extends EditProps<SalesDocumentType> {
}

export type PaginatedSalesDocumentTypes = PaginatedData<SalesDocumentType>;
export type SalesDocumentTypeModalState = ModalState<SalesDocumentType>;

export interface SalesDocumentTypesIndexProps {
    salesdocumenttypes: PaginatedSalesDocumentTypes;
    auth: AuthContext;
    [key: string]: unknown;
}