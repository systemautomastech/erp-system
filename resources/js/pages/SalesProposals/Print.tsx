import React, { useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PreviewModal, { ProposalPreviewSection } from '@/components/PreviewModal';

interface ProposalDefaultPage {
    id: number;
    title: string;
    content: string;
    page_type?: string;
    background_image?: string;
    sort_order: number;
}

interface PrintProps {
    proposal: any;
    customers?: Array<{ id: number; name: string; email: string; address?: string }>;
    warehouses?: Array<{ id: number; name: string; address?: string }>;
    defaultPages?: ProposalDefaultPage[];
    proposalSetting?: any;
    [key: string]: any;
}

export default function Print() {
    const { t } = useTranslation();
    const { proposal, customers = [], warehouses = [], defaultPages = [], proposalSetting } = usePage<PrintProps>().props;

    const sections = useMemo<ProposalPreviewSection[]>(() => {
        let loadedSections: ProposalPreviewSection[] = [];

        // 1. Check if proposal has saved contents
        if (proposal?.contents && Array.isArray(proposal.contents) && proposal.contents.length > 0) {
            loadedSections = proposal.contents.map((c: any) => {
                let parsed: any = null;
                if (typeof c.proposal_content === 'string') {
                    try {
                        parsed = JSON.parse(c.proposal_content);
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
                        order: c.order ?? 1,
                    };
                }
                return {
                    id: String(c.id || Math.random()),
                    title: c.title || '',
                    content: c.content || c.proposal_content || '',
                    page_type: c.page_type || 'content',
                    background_image: c.background_image || undefined,
                    order: c.order ?? 1,
                };
            });
        } else if (proposal?.proposal_content) {
            try {
                const parsed = typeof proposal.proposal_content === 'string'
                    ? JSON.parse(proposal.proposal_content)
                    : proposal.proposal_content;
                if (Array.isArray(parsed)) {
                    loadedSections = parsed.map((p: any, idx: number) => ({
                        id: String(p.id || idx + 1),
                        title: p.title || '',
                        content: p.content || '',
                        page_type: p.page_type || 'content',
                        background_image: p.background_image || undefined,
                        order: p.order ?? idx + 1,
                    }));
                }
            } catch (e) {}
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
    }, [proposal, defaultPages]);

    const formattedCustomers = useMemo(() => {
        if (customers.length > 0) return customers;
        if (proposal?.customer) return [proposal.customer];
        return [];
    }, [customers, proposal?.customer]);

    const totals = useMemo(() => {
        return {
            subtotal: Number(proposal?.subtotal || 0),
            tax_amount: Number(proposal?.tax_amount || 0),
            discount_amount: Number(proposal?.discount_amount || 0),
            total_amount: Number(proposal?.total_amount || 0),
        };
    }, [proposal]);

    const formData = useMemo(() => {
        return {
            ...proposal,
            id: proposal?.id,
            proposal_number: proposal?.proposal_number,
            subject: proposal?.subject,
            invoice_date: proposal?.proposal_date || proposal?.invoice_date,
            due_date: proposal?.due_date,
            customer_id: proposal?.customer_id,
            warehouse_id: proposal?.warehouse_id,
            payment_terms: proposal?.payment_terms,
            notes: proposal?.notes,
            other_details: proposal?.other_details,
            items: (proposal?.items || []).map((i: any) => ({
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
    }, [proposal]);

    return (
        <>
            <Head title={`${t('Sales Proposal')} - ${proposal?.proposal_number || ''}`} />
            <PreviewModal
                inline={true}
                formData={formData}
                sections={sections}
                customers={formattedCustomers}
                warehouses={warehouses}
                totals={totals}
                proposalSetting={proposalSetting}
                other_details={proposal?.other_details}
            />
        </>
    );
}
