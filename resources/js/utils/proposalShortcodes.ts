import { getCompanySetting, getAdminSetting, getImagePath, formatDate, formatCurrency } from '@/utils/helpers';

export interface ProposalShortcodeContext {
  proposal?: any;
  formData?: any;
  customer?: any;
  totals?: {
    subtotal?: number;
    total?: number;
    total_amount?: number;
    tax_amount?: number;
    taxAmount?: number;
    discount_amount?: number;
    discountAmount?: number;
  };
  proposalSetting?: any;
  pageProps?: any;
  settings?: any;
  [key: string]: any;
}

export const replaceProposalShortcodes = (
  content: string | undefined | null,
  context: ProposalShortcodeContext = {}
): string => {
  if (!content) return '';

  const companyName = getCompanySetting('company_name', context.pageProps) || '';
  const companyEmail = getCompanySetting('company_email', context.pageProps) || '';
  const companyPhone = getCompanySetting('company_phone', context.pageProps) || '';
  const companyAddress = getCompanySetting('company_address', context.pageProps) || '';
  const companyWebsite = getCompanySetting('company_website', context.pageProps) || '';
  const appName = companyName || getAdminSetting('app_name', context.pageProps) || '';

  const rawCompanyLogo =
    getCompanySetting('logo_dark', context.pageProps) ||
    getCompanySetting('logo_light', context.pageProps) ||
    getCompanySetting('logo', context.pageProps) ||
    getCompanySetting('company_logo', context.pageProps) ||
    getCompanySetting('company_dark_logo', context.pageProps) ||
    getCompanySetting('company_light_logo', context.pageProps) ||
    getAdminSetting('logo_dark', context.pageProps) ||
    getAdminSetting('logo_light', context.pageProps) ||
    getAdminSetting('logo', context.pageProps) ||
    'uploads/logo/logo_dark.png';
  const companyLogoUrl = getImagePath(rawCompanyLogo);

  const rawProposalLogo = context.proposalSetting?.logo_image || context.settings?.logo_image || rawCompanyLogo;
  const proposalLogoUrl = getImagePath(rawProposalLogo);

  const proposalNumber = context.formData?.proposal_number || context.proposal?.proposal_number || '';
  const proposalDate = context.formData?.invoice_date || context.formData?.proposal_date || context.proposal?.proposal_date || context.proposal?.invoice_date;
  const formattedProposalDate = proposalDate ? formatDate(proposalDate, context.pageProps) : '';
  const dueDate = context.formData?.due_date || context.proposal?.due_date;
  const formattedDueDate = dueDate ? formatDate(dueDate, context.pageProps) : '';

  const customer = context.customer || context.formData?.customer || context.proposal?.customer || {};
  const customerName = customer?.name || context.formData?.customer_name || context.proposal?.customer_name || '';
  const customerEmail = customer?.email || context.formData?.customer_email || context.proposal?.customer_email || '';
  const customerPhone = customer?.phone || customer?.mobile || context.formData?.customer_phone || context.proposal?.customer_phone || '';
  const customerAddress = customer?.address || customer?.billing_address || context.formData?.customer_address || context.proposal?.customer_address || '';

  const employeeName = context.creator?.name || context.proposal?.creator?.name || context.employee?.name || context.formData?.creator_name || context.formData?.employee_name || context.pageProps?.auth?.user?.name || '';
  const employeeEmail = context.creator?.email || context.proposal?.creator?.email || context.employee?.email || context.formData?.creator_email || context.formData?.employee_email || context.pageProps?.auth?.user?.email || '';
  const employeePhone = context.creator?.phone || context.creator?.mobile || context.proposal?.creator?.phone || context.proposal?.creator?.mobile || context.employee?.phone || context.employee?.mobile || context.formData?.creator_phone || context.formData?.employee_phone || context.pageProps?.auth?.user?.phone || context.pageProps?.auth?.user?.mobile || '';

  const subTotal = context.totals?.subtotal ?? context.formData?.subtotal ?? context.proposal?.subtotal;
  const totalTax = context.totals?.tax_amount ?? context.totals?.taxAmount ?? context.formData?.tax_amount ?? context.proposal?.tax_amount;
  const totalDiscount = context.totals?.discount_amount ?? context.totals?.discountAmount ?? context.formData?.discount_amount ?? context.proposal?.discount_amount;
  const totalAmount = context.totals?.total ?? context.totals?.total_amount ?? context.formData?.total_amount ?? context.proposal?.total_amount;

  const values: Record<string, string> = {
    app_name: appName,
    company_name: companyName,
    company_email: companyEmail,
    company_phone: companyPhone,
    company_address: companyAddress,
    company_website: companyWebsite,
    employee_name: employeeName,
    employee_email: employeeEmail,
    employee_phone: employeePhone,
    proposal_number: proposalNumber,
    proposal_date: formattedProposalDate,
    due_date: formattedDueDate,
    proposal_validity: context.formData?.payment_terms || context.proposal?.payment_terms || '',
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    total_amount: totalAmount !== undefined && totalAmount !== null && totalAmount !== '' ? formatCurrency(Number(totalAmount), context.pageProps) : '',
    sub_total: subTotal !== undefined && subTotal !== null && subTotal !== '' ? formatCurrency(Number(subTotal), context.pageProps) : '',
    total_tax: totalTax !== undefined && totalTax !== null && totalTax !== '' ? formatCurrency(Number(totalTax), context.pageProps) : '',
    total_discount: totalDiscount !== undefined && totalDiscount !== null && totalDiscount !== '' ? formatCurrency(Number(totalDiscount), context.pageProps) : '',
  };

  let result = content;

  // Handle company_logo and proposal_logo in attributes (e.g. src="{company_logo}")
  result = result.replace(/src=(["'])\s*\{\s*company_logo\s*\}\s*\1/gi, `src=$1${companyLogoUrl}$1`);
  result = result.replace(/src=(["'])\s*\{\s*proposal_logo\s*\}\s*\1/gi, `src=$1${proposalLogoUrl}$1`);

  // Handle standalone company_logo and proposal_logo tags
  result = result.replace(/\{\s*company_logo\s*\}/gi, `<img src="${companyLogoUrl}" alt="Company Logo" class="proposal-logo max-h-16 max-w-[220px] object-contain" style="max-height: 64px; max-width: 220px; object-fit: contain;" />`);
  result = result.replace(/\{\s*proposal_logo\s*\}/gi, `<img src="${proposalLogoUrl}" alt="Proposal Logo" class="proposal-logo max-h-16 max-w-[220px] object-contain" style="max-height: 64px; max-width: 220px; object-fit: contain;" />`);

  // Replace known shortcodes {key} or { key }
  for (const [key, val] of Object.entries(values)) {
    const regex = new RegExp(`\\{\\s*${key}\\s*\\}`, 'gi');
    result = result.replace(regex, val || '');
  }

  // Any remaining unrecognized or empty shortcodes e.g. {some_other_var} become empty string
  result = result.replace(/\{[a-zA-Z0-9_\-\s]+\}/g, '');

  return result;
};
