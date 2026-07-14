import { PaginatedData, ModalState, AuthContext, CreateProps, EditProps } from '@/types/common';

export interface SalesDocumentFolder {
    id: number;
    name: string;
    parent?: number;
    description?: string;
    created_at: string;
}

export interface SalesDocumentFolderFormData {
    name: string;
    parent: string;
    description: string;
}

export interface CreateSalesDocumentFolderProps extends CreateProps {
    parentFolders: any[];
}

export interface EditSalesDocumentFolderProps extends EditProps<SalesDocumentFolder> {
    parentFolders: any[];
}

export type PaginatedSalesDocumentFolders = PaginatedData<SalesDocumentFolder>;
export type SalesDocumentFolderModalState = ModalState<SalesDocumentFolder>;

export interface SalesDocumentFoldersIndexProps {
    salesdocumentfolders: PaginatedSalesDocumentFolders;
    auth: AuthContext;
    salesdocumentfolders: any[];
    [key: string]: unknown;
}