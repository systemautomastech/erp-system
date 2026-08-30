import React, { useEffect, useState, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js';
import { formatCurrency, formatDate, getCompanySetting } from '@/utils/helpers';
import { CustomerPayment } from './types';

interface PrintProps {
    payment: CustomerPayment;
}

export default function Print() {
    const { t } = useTranslation();
    const { payment } = usePage<PrintProps>().props;
    const [isDownloading, setIsDownloading] = useState(false);
    const downloadInitiatedRef = useRef(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('download') === 'pdf' && !downloadInitiatedRef.current) {
            downloadInitiatedRef.current = true;
            setTimeout(() => downloadPDF(), 500);
        } else {
            // Automatically open the print modal when visiting the print page
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const downloadPDF = async () => {
        if (isDownloading) return;
        setIsDownloading(true);

        const printContent = document.querySelector('.payment-container');
        if (printContent) {
            const opt = {
                margin: 0.25,
                filename: `customer-payment-${payment.payment_number || payment.id}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };

            try {
                await html2pdf().set(opt).from(printContent as HTMLElement).save();
                setTimeout(() => window.close(), 1000);
            } catch (error) {
                console.error('PDF generation failed:', error);
            }
        }

        setIsDownloading(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title={`${t('Customer Payment')} - ${payment.payment_number || '#' + payment.id}`} />

            {isDownloading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-lg font-semibold text-gray-700">{t('Generating PDF...')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="payment-container bg-white max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="w-1/2">
                        <h1 className="text-2xl font-bold mb-4">{getCompanySetting('company_name') || 'YOUR COMPANY'}</h1>
                        <div className="text-sm space-y-1 text-gray-600">
                            {getCompanySetting('company_address') && <p>{getCompanySetting('company_address')}</p>}
                            {(getCompanySetting('company_city') || getCompanySetting('company_state') || getCompanySetting('company_zipcode')) && (
                                <p>
                                    {getCompanySetting('company_city')}{getCompanySetting('company_state') && `, ${getCompanySetting('company_state')}`} {getCompanySetting('company_zipcode')}
                                </p>
                            )}
                            {getCompanySetting('company_country') && <p>{getCompanySetting('company_country')}</p>}
                            {getCompanySetting('company_telephone') && <p>{t('Phone')}: {getCompanySetting('company_telephone')}</p>}
                            {getCompanySetting('company_email') && <p>{t('Email')}: {getCompanySetting('company_email')}</p>}
                            {getCompanySetting('registration_number') && <p>{t('Registration')}: {getCompanySetting('registration_number')}</p>}
                        </div>
                    </div>
                    <div className="text-right w-1/2">
                        <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">{t('Payment Receipt')}</h2>
                        <p className="text-lg font-semibold text-gray-800">{payment.payment_number || `#${payment.id}`}</p>
                        <div className="text-sm mt-2 space-y-1 text-gray-600">
                            <p>{t('Payment Date')}: <span className="font-medium text-gray-900">{formatDate(payment.payment_date)}</span></p>
                            <p className="capitalize">{t('Status')}: <span className="font-semibold text-gray-900">{t(payment.status)}</span></p>
                            {payment.reference_number && (
                                <p>{t('Reference Number')}: <span className="font-medium text-gray-900">{payment.reference_number}</span></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer & Bank Details */}
                <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('RECEIVED FROM')}</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900">{payment.customer?.name || '-'}</p>
                            {payment.customer?.email && <p className="text-gray-600">{payment.customer.email}</p>}
                            {payment.customer?.contact && <p className="text-gray-600">{payment.customer.contact}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('DEPOSITED TO')}</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900">{payment.bank_account?.account_name || '-'}</p>
                            {payment.bank_account?.account_number && (
                                <p className="text-gray-600">{t('Account No')}: {payment.bank_account.account_number}</p>
                            )}
                            {payment.bank_account?.bank_name && (
                                <p className="text-gray-600">{payment.bank_account.bank_name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoice Allocations */}
                {payment.allocations && payment.allocations.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-base font-bold text-gray-900 mb-3">{t('Invoice Allocations')}</h3>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="text-left py-2 font-semibold text-gray-700">{t('Invoice Number')}</th>
                                    <th className="text-left py-2 font-semibold text-gray-700">{t('Invoice Date')}</th>
                                    <th className="text-right py-2 font-semibold text-gray-700">{t('Invoice Total')}</th>
                                    <th className="text-right py-2 font-semibold text-gray-700">{t('Allocated Amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payment.allocations.map((allocation) => (
                                    <tr key={allocation.id} className="border-b border-gray-200">
                                        <td className="py-2.5 font-medium text-gray-900">{allocation.invoice?.invoice_number || '-'}</td>
                                        <td className="py-2.5 text-gray-600">{formatDate(allocation.invoice?.invoice_date)}</td>
                                        <td className="py-2.5 text-right text-gray-600">{formatCurrency(allocation.invoice?.total_amount)}</td>
                                        <td className="py-2.5 text-right font-semibold text-gray-900">{formatCurrency(allocation.allocated_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Credit Note History */}
                {payment.credit_note_applications && payment.credit_note_applications.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-base font-bold text-gray-900 mb-3">{t('Credit Note History')}</h3>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="text-left py-2 font-semibold text-gray-700">{t('Credit Note Number')}</th>
                                    <th className="text-left py-2 font-semibold text-gray-700">{t('Application Date')}</th>
                                    <th className="text-right py-2 font-semibold text-gray-700">{t('Applied Amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payment.credit_note_applications.map((application) => (
                                    <tr key={application.id} className="border-b border-gray-200">
                                        <td className="py-2.5 font-medium text-gray-900">{application.credit_note?.credit_note_number || '-'}</td>
                                        <td className="py-2.5 text-gray-600">{formatDate(application.application_date)}</td>
                                        <td className="py-2.5 text-right font-semibold text-gray-900">{formatCurrency(application.applied_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-300 font-semibold">
                                    <td colSpan={2} className="py-2 text-right text-gray-700">{t('Total Applied Credit Note:')}</td>
                                    <td className="py-2 text-right text-gray-900">
                                        {formatCurrency(payment.credit_note_applications.reduce((sum, app) => sum + parseFloat(app.applied_amount || '0'), 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Total Summary */}
                <div className="flex justify-end mb-8 page-break-inside-avoid">
                    <div className="w-80 border border-gray-300 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>{t('Total Payment Amount')}:</span>
                            <span className="text-green-600">{formatCurrency(payment.payment_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {payment.notes && (
                    <div className="border-t border-gray-200 pt-4 mb-8">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('Notes')}:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">{payment.notes}</p>
                    </div>
                )}

                <div className="text-center mt-12 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">{t('Thank you for your business!')}</p>
                </div>
            </div>

            <style>{`
                body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    font-family: Arial, sans-serif;
                }

                @page {
                    margin: 0.5in;
                    size: A4;
                }

                .payment-container {
                    max-width: 100%;
                    margin: 0;
                    box-shadow: none;
                }

                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                @media print {
                    body {
                        background: white;
                    }

                    .payment-container {
                        box-shadow: none;
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
}
