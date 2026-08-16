import{r as l,j as e}from"./ui-Ce3CDfXD.js";import{X as _,S as w}from"./app-VrCFGPac.js";import{h as P}from"./html2pdf-BZj76WTi.js";import{c as t,a as b,f as i}from"./helpers-BSC0is5m.js";import{u as S}from"./useFormFields-DUz9-vff.js";import{u as T}from"./useTranslation-B6HIdUih.js";import"./jspdf.es.min-BXm20c27.js";import"./html2canvas-CYTGiWu0.js";import"./label-CkKMsgxd.js";import"./index-DnPxjgVG.js";import"./utils-BMVe_KuB.js";import"./utils-DqweA7RH.js";import"./select-C1QakBML.js";import"./index-D17hSi50.js";import"./index-Bw1ffeuq.js";import"./input-F5nkAn4H.js";import"./chevron-down-cEvEB-Aw.js";import"./check-0-XYmo7H.js";import"./chevron-up-D3iU1UiN.js";import"./input-error-ipz0CWHW.js";import"./checkbox-YyR4KW_r.js";import"./badge-C_VNGtqa.js";function B(){var p,x,h,j;const{t:s}=T(),{proposal:r}=_().props,[y,c]=l.useState(!1),[m,g]=l.useState(!1),n=S("getCustomFields",{...r,module:"General",sub_module:"Proposal",id:r.id,isPrint:!0},()=>{},{},"view",s);l.useEffect(()=>{n&&n.length>=0&&g(!0)},[n]),l.useEffect(()=>{new URLSearchParams(window.location.search).get("download")==="pdf"&&m&&setTimeout(()=>N(),1e3)},[m]);const N=async()=>{c(!0);const a=document.querySelector(".proposal-container");if(a){const d={margin:.25,filename:`sales-proposal-${r.proposal_number}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2},jsPDF:{unit:"in",format:"a4",orientation:"portrait"}};try{await P().set(d).from(a).save(),setTimeout(()=>window.close(),1e3)}catch(o){console.error("PDF generation failed:",o)}}c(!1)};return e.jsxs("div",{className:"min-h-screen bg-white",children:[e.jsx(w,{title:s("Sales Proposal")}),y&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsx("div",{className:"bg-white p-6 rounded-lg shadow-lg",children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"}),e.jsx("p",{className:"text-lg font-semibold text-gray-700",children:s("Generating PDF...")})]})})}),e.jsxs("div",{className:"proposal-container bg-white max-w-4xl mx-auto p-8",children:[e.jsxs("div",{className:"flex justify-between items-start mb-8",children:[e.jsxs("div",{className:"w-1/2",children:[e.jsx("h1",{className:"text-2xl font-bold mb-4",children:t("company_name")||"YOUR COMPANY"}),e.jsxs("div",{className:"text-sm space-y-1",children:[t("company_address")&&e.jsx("p",{children:t("company_address")}),(t("company_city")||t("company_state")||t("company_zipcode"))&&e.jsxs("p",{children:[t("company_city"),t("company_state")&&`, ${t("company_state")}`," ",t("company_zipcode")]}),t("company_country")&&e.jsx("p",{children:t("company_country")}),t("company_telephone")&&e.jsxs("p",{children:[s("Phone"),": ",t("company_telephone")]}),t("company_email")&&e.jsxs("p",{children:[s("Email"),": ",t("company_email")]}),t("registration_number")&&e.jsxs("p",{children:[s("Registration"),": ",t("registration_number")]})]})]}),e.jsxs("div",{className:"text-right w-1/2",children:[e.jsx("h2",{className:"text-2xl font-bold mb-2",children:s("SALES PROPOSAL")}),e.jsxs("p",{className:"text-lg font-semibold",children:["#",r.proposal_number]}),e.jsxs("div",{className:"text-sm mt-2 space-y-1",children:[e.jsxs("p",{children:[s("Date"),": ",b(r.proposal_date)]}),e.jsxs("p",{children:[s("Due"),": ",b(r.due_date)]})]})]})]}),e.jsxs("div",{className:"flex justify-between mb-8",children:[e.jsxs("div",{className:"w-1/2",children:[e.jsx("h3",{className:"font-bold mb-3",children:s("PROPOSAL TO")}),e.jsxs("div",{className:"text-sm space-y-1",children:[e.jsx("p",{className:"font-semibold",children:(p=r.customer)==null?void 0:p.name}),e.jsx("p",{children:(x=r.customer)==null?void 0:x.email})]})]}),e.jsxs("div",{className:"text-right w-1/2",children:[e.jsx("h3",{className:"font-bold mb-3",children:s("WAREHOUSE")}),e.jsx("div",{className:"text-sm space-y-1",children:e.jsx("p",{children:((h=r.warehouse)==null?void 0:h.name)||"-"})})]})]}),n&&n.length>0&&e.jsx("div",{className:"mb-8",children:e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 text-sm",children:n.map(a=>e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"font-semibold text-gray-700",children:[a.name||a.label||"Custom Field",":"]}),e.jsx("div",{className:"text-gray-900",children:a.component})]},a.id))})}),e.jsx("div",{className:"mb-8",children:e.jsxs("table",{className:"w-full table-fixed",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-gray-300",children:[e.jsx("th",{className:"text-left py-3 font-bold",children:s("ITEM")}),e.jsx("th",{className:"text-center py-3 font-bold",children:s("QTY")}),e.jsx("th",{className:"text-right py-3 font-bold",children:s("PRICE")}),e.jsx("th",{className:"text-right py-3 font-bold",children:s("DISCOUNT")}),e.jsx("th",{className:"text-right py-3 font-bold",children:s("TAX")}),e.jsx("th",{className:"text-right py-3 font-bold",children:s("TOTAL")})]})}),e.jsx("tbody",{children:(j=r.items)==null?void 0:j.map((a,d)=>{var o,f;return e.jsxs("tr",{className:"page-break-inside-avoid",children:[e.jsxs("td",{className:"py-4",children:[e.jsx("div",{className:"font-semibold",children:(o=a.product)==null?void 0:o.name}),((f=a.product)==null?void 0:f.sku)&&e.jsxs("div",{className:"text-xs text-gray-500",children:[s("SKU"),": ",a.product.sku]})]}),e.jsx("td",{className:"text-center py-4",children:a.quantity}),e.jsx("td",{className:"text-right py-4",children:i(a.unit_price)}),e.jsx("td",{className:"text-right py-4",children:a.discount_percentage>0?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"text-sm",children:[a.discount_percentage,"%"]}),e.jsxs("div",{className:"text-sm font-medium",children:["-",i(a.discount_amount)]})]}):e.jsx("div",{className:"text-sm",children:"0%"})}),e.jsx("td",{className:"text-right py-4",children:a.taxes&&a.taxes.length>0?e.jsxs(e.Fragment,{children:[a.taxes.map((u,v)=>e.jsxs("div",{className:"text-sm",children:[u.tax_name," (",u.tax_rate,"%)"]},v)),e.jsx("div",{className:"text-sm font-medium",children:i(a.tax_amount)})]}):a.tax_percentage>0?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"text-sm",children:[a.tax_percentage,"%"]}),e.jsx("div",{className:"text-sm font-medium",children:i(a.tax_amount)})]}):e.jsx("div",{className:"text-sm",children:"0%"})}),e.jsx("td",{className:"text-right py-4 font-semibold",children:i(a.total_amount)})]},d)})})]})}),e.jsx("div",{className:"flex justify-end mb-4 page-break-inside-avoid",children:e.jsx("div",{className:"w-80 page-break-inside-avoid",children:e.jsx("div",{className:"border border-gray-400 p-4 page-break-inside-avoid",children:e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:[s("Subtotal"),":"]}),e.jsx("span",{children:i(r.subtotal)})]}),r.discount_amount>0&&e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:[s("Discount"),":"]}),e.jsxs("span",{children:["-",i(r.discount_amount)]})]}),r.tax_amount>0&&e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("span",{children:[s("Tax"),":"]}),e.jsx("span",{children:i(r.tax_amount)})]}),e.jsx("div",{className:"border-t border-gray-400 pt-2 mt-2",children:e.jsxs("div",{className:"flex justify-between font-bold text-lg",children:[e.jsxs("span",{children:[s("TOTAL"),":"]}),e.jsx("span",{children:i(r.total_amount)})]})})]})})})}),e.jsxs("div",{className:"border-t border-gray-400 pt-4 text-center",children:[e.jsxs("p",{className:"font-semibold",children:[s("PAYMENT TERMS"),": ",r.payment_terms||s("Net 30 Days")]}),e.jsx("p",{className:"text-sm mt-2",children:s("Thank you for your business!")})]})]}),e.jsx("style",{children:`
                body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    font-family: Arial, sans-serif;
                }

                @page {
                    margin: 0.5in;
                    size: A4;
                }

                .proposal-container {
                    max-width: 100%;
                    margin: 0;
                    box-shadow: none;
                }

                .proposal-container table {
                    width: 100%;
                    table-layout: auto;
                    border-collapse: collapse;
                    margin: 12px 0;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .proposal-container tr:first-child,
                .proposal-container th {
                    background-color: var(--primary, #0f172a) !important;
                    color: #ffffff !important;
                    padding: 8px 12px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: bold;
                    border: 1px solid #e2e8f0;
                }

                .proposal-container tr:first-child td {
                    background-color: var(--primary, #0f172a) !important;
                    color: #ffffff !important;
                    font-weight: bold;
                }

                .proposal-container td {
                    padding: 8px 12px;
                    font-size: 11px;
                    border: 1px solid #e2e8f0;
                }

                .page-break-inside-avoid {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                @media print {
                    body {
                        background: white;
                    }

                    .proposal-container {
                        box-shadow: none;
                    }
                }
            `})]})}export{B as default};
