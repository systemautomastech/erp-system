import { AuthContext, ModalState } from '@/types/common';

export interface AccountIndustry {
    id: number;
    name: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateAccountIndustryFormData {
    name: string;
    color: string;
    is_active: boolean;
}

export interface AccountIndustriesIndexProps {
    accountIndustries: AccountIndustry[];
    auth: AuthContext;
}

export type AccountIndustryModalState = ModalState<AccountIndustry>;

export interface CreateAccountIndustryProps {
    onSuccess: () => void;
}

export interface EditAccountIndustryProps {
    accountIndustry: AccountIndustry;
    onSuccess: () => void;
}