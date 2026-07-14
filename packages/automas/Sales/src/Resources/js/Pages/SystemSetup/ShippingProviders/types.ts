export interface ShippingProvider {
    id: number;
    name: string;
    website?: string;
    created_at: string;
}

export interface ShippingProviderFormData {
    name: string;
    website: string;
}