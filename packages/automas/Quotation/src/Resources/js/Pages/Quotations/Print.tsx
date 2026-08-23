import React, { useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PreviewModal, { ProposalPreviewSection as QuotationPreviewSection } from '@/components/PreviewModal';
import { QuotationDefaultPage, SalesQuotation } from './types';

interface PrintProps {
    quotation: SalesQuotation;
    customers?: Array<{ id: number; name: string; email: string; address?: string }>;
    warehouses?: Array<{ id: number; name: string; address?: string }>;
    defaultPages?: QuotationDefaultPage[];
    quotationSetting?: any;
    [key: string]: any;
}

export default function Print() {
    const { t } = useTranslation();
    const { quotation, customers = [], warehouses = [], defaultPages = [], quotationSetting } = usePage<PrintProps>().props;

    const sections = useMemo<QuotationPreviewSection[]>(() => {
        let loadedSections: QuotationPreviewSection[] = [];

        // 1. Check if quotation has saved contents
        if (quotation?.contents && Array.isArray(quotation.contents) && quotation.contents.length > 0) {
            loadedSections = quotation.contents.map((c: any) => {
                let parsed: any = null;
                if (typeof c.quotation_content === 'string') {
                    try {
                        parsed = JSON.parse(c.quotation_content);
                    } catch (e) {
                        parsed = null;
                    }
                }
                if (parsed && typeof parsed === 'object') {
                    return {
                        id: String(c.id || Math.random()),
                        title: parsed.title || c.title || '',
                        content: parsed.content || c.content || '',
                        page_type: parsed.page_type || c.page_type || 'content',
                        background_image: parsed.background_image || c.background_image || undefined,
                        order: c.sort_order ?? c.order ?? 1,
                    };
                }
                return {
                    id: String(c.id || Math.random()),
                    title: c.title || '',
                    content: c.content || c.quotation_content || '',
                    page_type: c.page_type || 'content',
                    background_image: c.background_image || undefined,
                    order: c.sort_order ?? c.order ?? 1,
                };
            });
        }

        // 2. If no custom sections, load from defaultPages
        if (loadedSections.length === 0 && defaultPages && defaultPages.length > 0) {
            loadedSections = defaultPages.map((dp) => ({
                id: String(dp.id),
                title: dp.title,
                content: dp.content,
                background_image: dp.background_image,
                order: dp.sort_order,
            }));
        }

        return loadedSections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }, [quotation, defaultPages]);

    const formattedCustomers = useMemo(() => {
        if (customers.length > 0) return customers;
        if (quotation?.customer) return [quotation.customer];
        return [];
    }, [customers, quotation?.customer]);

    const totals = useMemo(() => {
        return {
            subtotal: Number(quotation?.subtotal || 0),
            tax_amount: Number(quotation?.tax_amount || 0),
            discount_amount: Number(quotation?.discount_amount || 0),
            total_amount: Number(quotation?.total_amount || 0),
        };
    }, [quotation]);

    const formData = useMemo(() => {
        return {
            ...quotation,
            id: quotation?.id,
            quotation_number: quotation?.quotation_number,
            invoice_date: quotation?.quotation_date,
            due_date: quotation?.due_date,
            customer_id: quotation?.customer_id,
            warehouse_id: quotation?.warehouse_id,
            payment_terms: quotation?.payment_terms,
            notes: quotation?.notes,
            items: (quotation?.items || []).map((i: any) => ({
                id: i.id,
                product_id: i.product_id,
                product_name: i.product?.name || i.name,
                description: i.description || i.product_description,
                product_description: i.product?.description || i.description,
                quantity: i.quantity,
                unit_price: i.unit_price,
                discount_amount: i.discount_amount,
                tax_amount: i.tax_amount,
                total_amount: i.total_amount,
                section: i.section,
                product: i.product,
            })),
        };
    }, [quotation]);

    return (
        <>
            <Head title={`${t('Sales Quotation')} - ${quotation?.quotation_number || ''}`} />
            <PreviewModal
                inline={true}
                formData={formData}
                sections={sections}
                customers={formattedCustomers}
                warehouses={warehouses}
                totals={totals}
                proposalSetting={quotationSetting}
            />
        </>
    );
}
