import { AuthContext, ModalState } from '@/types/common';

export interface AccountType {
    id: number;
    name: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateAccountTypeFormData {
    name: string;
    color: string;
    is_active: boolean;
}

export interface AccountTypesIndexProps {
    accountTypes: AccountType[];
    auth: AuthContext;
}

export type AccountTypeModalState = ModalState<AccountType>;

export interface CreateAccountTypeProps {
    onSuccess: () => void;
}

export interface EditAccountTypeProps {
    accountType: AccountType;
    onSuccess: () => void;
}