import{r as B,j as u,R as $e}from"./ui-Ce3CDfXD.js";import{D as He,a as ze,b as je,c as Ce}from"./dialog-DYPdG9Lq.js";import{B as he}from"./button-7g9Z4Qd-.js";import{c as Y,n as Vt,b as qt,a as be,f as Bt}from"./helpers-C1iBHim0.js";import{c as Tt}from"./utils-DqweA7RH.js";import{u as Se}from"./useTranslation-Cqldhf_p.js";import{F as Ee}from"./file-text-DENV-o2p.js";import{P as xe}from"./printer-H59A_twS.js";import{E as Le}from"./eye-BcPT0aLo.js";const fe=(o,t={})=>{var $t,gt,Lt,ut,Mt,Ht,ht,bt,xt,rt,it,At,zt,jt,l,f,N,a,H,j,L,P,I,F,ft,tt,Pt,m,O,st,_t,Ct,St,Et,Gt,J,et,M,yt,lt,at,wt,vt,pt,Zt,Jt,Ut,Dt,te,ee,oe,ne,re,ie,se,le,ae,pe,de,ce,me;if(!o)return"";let n=t.pageProps;!n&&typeof window<"u"&&(n=($t=window==null?void 0:window.__INITIAL_PAGE__)==null?void 0:$t.props);const g=Y("company_name",n)||((gt=t.settings)==null?void 0:gt.company_name)||"My Company Ltd.",e=Y("company_email",n)||((Lt=t.settings)==null?void 0:Lt.company_email)||"info@company.com",i=Y("company_telephone",n)||Y("company_phone",n)||((ut=t.settings)==null?void 0:ut.company_telephone)||((Mt=t.settings)==null?void 0:Mt.company_phone)||"+880 1234-567890",h=Y("company_address",n)||((Ht=t.settings)==null?void 0:Ht.company_address)||"123 Main Street, Dhaka, Bangladesh",d=Y("company_website",n)||((ht=t.settings)==null?void 0:ht.company_website)||"https://www.example.com",_=g,z=Y("logo_dark",n)||Y("logo_light",n)||Y("logo",n)||Y("company_logo",n)||Y("company_dark_logo",n)||Y("company_light_logo",n)||Vt("logo_dark",n)||Vt("logo_light",n)||Vt("logo",n)||"uploads/logo/logo_dark.png",T=qt(z),s=((bt=t.proposalSetting)==null?void 0:bt.logo_image)||((xt=t.settings)==null?void 0:xt.logo_image)||z,k=qt(s),q=((rt=t.formData)==null?void 0:rt.subject)||((it=t.proposal)==null?void 0:it.subject)||"",b=((At=t.formData)==null?void 0:At.proposal_number)||((zt=t.proposal)==null?void 0:zt.proposal_number)||"",A=((jt=t.formData)==null?void 0:jt.invoice_date)||((l=t.formData)==null?void 0:l.proposal_date)||((f=t.proposal)==null?void 0:f.proposal_date)||((N=t.proposal)==null?void 0:N.invoice_date),Q=A?be(A,n):"",R=((a=t.formData)==null?void 0:a.due_date)||((H=t.proposal)==null?void 0:H.due_date),Z=R?be(R,n):"",r=t.customer||((j=t.formData)==null?void 0:j.customer)||((L=t.proposal)==null?void 0:L.customer)||{},C=(r==null?void 0:r.name)||((P=t.formData)==null?void 0:P.customer_name)||((I=t.proposal)==null?void 0:I.customer_name)||"",$=(r==null?void 0:r.email)||((F=t.formData)==null?void 0:F.customer_email)||((ft=t.proposal)==null?void 0:ft.customer_email)||"",p=(r==null?void 0:r.mobile_no)||(r==null?void 0:r.phone)||(r==null?void 0:r.mobile)||(r==null?void 0:r.contact_person_mobile)||((tt=t.formData)==null?void 0:tt.customer_phone)||((Pt=t.formData)==null?void 0:Pt.customer_mobile)||((m=t.proposal)==null?void 0:m.customer_phone)||((O=t.proposal)==null?void 0:O.customer_mobile)||"",y=(typeof(r==null?void 0:r.address)=="string"?r.address:"")||(typeof(r==null?void 0:r.billing_address)=="string"?r.billing_address:"")||(r!=null&&r.billing_address&&typeof r.billing_address=="object"?`${r.billing_address.address_line_1||""} ${r.billing_address.city||""} ${r.billing_address.state||""} ${r.billing_address.zip_code||""}`.trim():"")||((st=t.formData)==null?void 0:st.customer_address)||((_t=t.proposal)==null?void 0:_t.customer_address)||"",c=t.user||t.creator||t.author||((Ct=t.proposal)==null?void 0:Ct.creator)||((St=t.proposal)==null?void 0:St.author)||t.employee||((Et=n==null?void 0:n.auth)==null?void 0:Et.user)||(typeof window<"u"?(et=(J=(Gt=window==null?void 0:window.__INITIAL_PAGE__)==null?void 0:Gt.props)==null?void 0:J.auth)==null?void 0:et.user:null)||{},w=(c==null?void 0:c.employee)||t.employeeRecord||null,x=(c==null?void 0:c.name)||((M=t.formData)==null?void 0:M.user_name)||((yt=t.formData)==null?void 0:yt.creator_name)||"",G=(c==null?void 0:c.email)||((lt=t.formData)==null?void 0:lt.user_email)||((at=t.formData)==null?void 0:at.creator_email)||"",D=(c==null?void 0:c.mobile_no)||(c==null?void 0:c.phone)||(c==null?void 0:c.mobile)||(c==null?void 0:c.telephone)||((wt=t.formData)==null?void 0:wt.user_phone)||((vt=t.formData)==null?void 0:vt.creator_phone)||"",dt=(w==null?void 0:w.employee_id)||(c!=null&&c.id?String(c.id):((pt=t.formData)==null?void 0:pt.user_id)||""),X=((Zt=t.totals)==null?void 0:Zt.subtotal)??((Jt=t.formData)==null?void 0:Jt.subtotal)??((Ut=t.proposal)==null?void 0:Ut.subtotal),V=((Dt=t.totals)==null?void 0:Dt.tax_amount)??((te=t.totals)==null?void 0:te.taxAmount)??((ee=t.formData)==null?void 0:ee.tax_amount)??((oe=t.proposal)==null?void 0:oe.tax_amount),S=((ne=t.totals)==null?void 0:ne.discount_amount)??((re=t.totals)==null?void 0:re.discountAmount)??((ie=t.formData)==null?void 0:ie.discount_amount)??((se=t.proposal)==null?void 0:se.discount_amount),E=((le=t.totals)==null?void 0:le.total)??((ae=t.totals)==null?void 0:ae.total_amount)??((pe=t.formData)==null?void 0:pe.total_amount)??((de=t.proposal)==null?void 0:de.total_amount),nt={app_name:_,company_name:g,company_email:e,company_phone:i,company_telephone:i,company_address:h,company_website:d,user_id:dt,user_name:x,user_email:G,user_phone:D,creator_name:x,creator_email:G,creator_phone:D,proposal_subject:q,proposal_number:b,proposal_date:Q,proposal_due_date:Z,due_date:Z,proposal_validity:((ce=t.formData)==null?void 0:ce.payment_terms)||((me=t.proposal)==null?void 0:me.payment_terms)||"",customer_name:C,customer_email:$,customer_phone:p,customer_address:y,total_amount:E!=null&&E!==""?Bt(Number(E),t.pageProps):"",sub_total:X!=null&&X!==""?Bt(Number(X),t.pageProps):"",total_tax:V!=null&&V!==""?Bt(Number(V),t.pageProps):"",total_discount:S!=null&&S!==""?Bt(Number(S),t.pageProps):""};let v=o;const ct=!!t.isDefaultPageSetup;T?(v=v.replace(/src=(["'])\s*\{\s*company_logo\s*\}\s*\1/gi,`src=$1${T}$1`),v=v.replace(/\{\s*company_logo\s*\}/gi,`<img src="${T}" alt="Company Logo" class="proposal-logo inline-block max-h-16 max-w-[220px] object-contain" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />`)):ct||(v=v.replace(/src=(["'])\s*\{\s*company_logo\s*\}\s*\1/gi,'src=""'),v=v.replace(/\{\s*company_logo\s*\}/gi,"")),k?(v=v.replace(/src=(["'])\s*\{\s*proposal_logo\s*\}\s*\1/gi,`src=$1${k}$1`),v=v.replace(/\{\s*proposal_logo\s*\}/gi,`<img src="${k}" alt="Proposal Logo" class="proposal-logo inline-block max-h-16 max-w-[220px] object-contain" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />`)):ct||(v=v.replace(/src=(["'])\s*\{\s*proposal_logo\s*\}\s*\1/gi,'src=""'),v=v.replace(/\{\s*proposal_logo\s*\}/gi,""));const mt=["user_id","user_name","user_email","user_phone","creator_name","creator_email","creator_phone","creator_designation","user_designation"];for(const[ge,Ot]of Object.entries(nt)){if(ct&&mt.includes(ge))continue;const ue=new RegExp(`\\{\\s*${ge}\\s*\\}`,"gi");Ot!=null&&String(Ot).trim()!==""?v=v.replace(ue,String(Ot)):ct||(v=v.replace(ue,""))}return v},Ue=(o,t)=>{var T;if(!o)return"";const n=(t==null?void 0:t.employee)||null,g=(t==null?void 0:t.name)||"",e=(t==null?void 0:t.email)||"",i=(t==null?void 0:t.mobile_no)||(t==null?void 0:t.phone)||(t==null?void 0:t.mobile)||(t==null?void 0:t.telephone)||"",h=(n==null?void 0:n.employee_id)||(t!=null&&t.id?String(t.id):""),d=((T=n==null?void 0:n.designation)==null?void 0:T.name)||(t==null?void 0:t.designation)||"",_={user_name:g,creator_name:g,user_email:e,creator_email:e,user_phone:i,creator_phone:i,user_id:h,creator_designation:d,user_designation:d};let z=o;for(const[s,k]of Object.entries(_))k&&(z=z.replace(new RegExp(`\\{\\s*${s}\\s*\\}`,"gi"),k));return z},Te="#E9591C",ke="html-preview-container",Me=210,Wt=297,Kt=32,Xt=30,Ae=15,_e=`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }

    .phone-tab{
        display:none;
    }
    .proposal-cover__sheet, .proposal-preview-sheet {
        width: 210mm; min-height: 297mm; height: 297mm; max-height: 297mm; margin: 0 auto; background: #fff; position: relative !important; overflow: hidden !important; box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.08); page-break-after: always; font-family: "Open Sans", sans-serif !important;
    }
    .proposal-page__body {
        position: relative !important; z-index: 1; padding: 32mm 15mm 20mm; height: calc(297mm - 52mm); min-height: calc(297mm - 52mm); max-height: calc(297mm - 52mm); box-sizing: border-box; display: flex !important; flex-direction: column !important;
    }

    /* Table Styles */
    .proposal-preview-sheet table, .proposal-page__body table, .html-preview-container table, .prose table {
        width: 100% !important; border-collapse: collapse !important; border: 1px solid #cbd5e1 !important; font-size: 10px !important; font-family: "Open Sans", sans-serif !important; line-height: 1.35 !important; margin: 8px 0 !important; color: #293240 !important;
    }
    .proposal-preview-sheet table th, .proposal-page__body table th, .html-preview-container table th, .prose table th {
        padding: 7.5px 8px !important; font-size: 10px !important; font-weight: 600 !important; border: 1px solid #cbd5e1 !important; vertical-align: middle !important; background-color: var(--template-color, #E9591C) !important; color: #ffffff !important; line-height: 1.2 !important;
    }
    .proposal-preview-sheet table th *, .proposal-page__body table th *, .html-preview-container table th *, .prose table th * {
        color: #ffffff !important; font-size: 10px !important; font-weight: 600 !important; margin: 0 !important; padding: 0 !important; line-height: 1.2 !important;
    }
    .proposal-preview-sheet table td, .proposal-page__body table td, .html-preview-container table td, .prose table td {
        padding: 6.5px 8px !important; font-size: 10px !important; border: 1px solid #cbd5e1 !important; vertical-align: middle !important; color: #293240 !important; word-break: break-word !important; line-height: 1.35 !important; background-color: transparent;
    }
    .proposal-preview-sheet table td > p, .proposal-page__body table td > p, .html-preview-container table td > p, .prose table td > p {
        margin: 0 !important; padding: 0 !important; line-height: 1.35 !important; font-size: 10px !important;
    }
    .proposal-preview-sheet table td p + p, .proposal-page__body table td p + p, .html-preview-container table td p + p, .prose table td p + p { margin-top: 3px !important; }

    /* Content Typography */
    .html-preview-container { font-size: 14px; line-height: 1.5; color: #1e293b; width: 100%; font-family: "Open Sans", sans-serif; display: flex !important; flex-direction: column !important; flex: 1 !important; height: 100% !important; }
    .html-preview-container h1 { font-size: 24px; font-weight: 700; margin: 8px 0; color: #0f172a; }
    .html-preview-container h2 { font-size: 20px; font-weight: 700; margin: 8px 0; color: #0f172a; }
    .html-preview-container h3 { font-size: 18px; font-weight: 600; margin: 6px 0; color: #0f172a; }
    .html-preview-container h4 { font-size: 16px; font-weight: 600; margin: 4px 0; color: #0f172a; }
    .html-preview-container p { margin: 4px 0; }
    .html-preview-container p:empty::before { content: "\\00a0"; }
    .html-preview-container ul, .proposal-page__body ul, .prose ul { list-style-type: disc !important; list-style-position: outside !important; padding-left: 20px !important; margin: 6px 0 !important; }
    .html-preview-container ol, .proposal-page__body ol, .prose ol { list-style-type: decimal !important; list-style-position: outside !important; padding-left: 20px !important; margin: 6px 0 !important; }
    .html-preview-container li, .proposal-page__body li, .prose li { display: list-item !important; margin: 3px 0 !important; line-height: 1.45 !important; }
    .html-preview-container li p, .proposal-page__body li p, .prose li p { display: inline !important; margin: 0 !important; }

    /* Tables Inner Lists Formatting */
    table td ul, .html-preview-container table td ul { list-style-type: disc !important; list-style-position: outside !important; padding-left: 14px !important; margin: 3px 0 3px 2px !important; }
    table td ol, .html-preview-container table td ol { list-style-type: decimal !important; list-style-position: outside !important; padding-left: 14px !important; margin: 3px 0 3px 2px !important; }
    table td li, .html-preview-container table td li { display: list-item !important; margin: 2px 0 !important; font-size: 10px !important; line-height: 1.35 !important; color: #293240 !important; }
    table td li p, .html-preview-container table td li p { display: inline !important; margin: 0 !important; }
    .html-preview-container blockquote { border-left: 4px solid #cbd5e1; padding-left: 16px; font-style: italic; margin: 8px 0; }
    .html-preview-container img, .proposal-page__body img, .prose img, img.proposal-logo { display: inline-block !important; vertical-align: middle; }
    .html-preview-container a { color: #2563eb; text-decoration: underline; }

    @media print {
        @page { size: 210mm 297mm; margin: 0; }
        html, body { width: 210mm !important; margin: 0 !important; padding: 0 !important; background: white !important; font-family: "Open Sans", sans-serif !important; }
        .print-wrapper { width: 210mm !important; margin: 0 !important; padding: 0 !important; }
        .proposal-preview-sheet, .proposal-cover__sheet { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important; page-break-after: always !important; break-after: page !important; page-break-inside: avoid !important; break-inside: avoid-page !important; overflow: hidden !important; }
        .proposal-page__body { position: relative !important; z-index: 1 !important; padding: 32mm 15mm 20mm !important; height: calc(297mm - 52mm) !important; min-height: calc(297mm - 52mm) !important; max-height: calc(297mm - 52mm) !important; box-sizing: border-box !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; }
        .proposal-preview-sheet:last-child, .proposal-cover__sheet:last-child { page-break-after: auto !important; break-after: auto !important; }
    }
`;function Nt(o){if(typeof document>"u")return o*3.7795275591;const t=document.createElement("div");t.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        width: ${o}mm;
        height: 0;
        padding: 0;
        margin: 0;
        border: 0;
        left: -10000px;
        top: -10000px;
    `,document.body.appendChild(t);const n=t.getBoundingClientRect().width;return t.remove(),n||o*3.7795275591}function It(){if(typeof document>"u")return Nt(Wt)-Nt(Kt)-Nt(Xt);const o=document.createElement("div");o.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        left: -10000px;
        top: -10000px;

        width: ${Me}mm;
        height: ${Wt}mm;

        box-sizing: border-box;

        padding:
            ${Kt}mm
            ${Ae}mm
            ${Xt}mm;

        display: flex;
        flex-direction: column;

        margin: 0;
        border: 0;
    `;const t=document.createElement("div");t.style.cssText=`
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        box-sizing: border-box;
    `,o.appendChild(t),document.body.appendChild(o);const n=t.getBoundingClientRect().height;return o.remove(),n||Nt(Wt)-Nt(Kt)-Nt(Xt)}const U=1;function Pe(o){if(typeof window>"u")return 0;const t=window.getComputedStyle(o);return(parseFloat(t.marginTop)||0)+(parseFloat(t.marginBottom)||0)}function Oe(o){const t=o.getBoundingClientRect();return t.height>0?t.height:o.offsetHeight||0}function Rt(o){return Oe(o)+Pe(o)}function K(o,t){return t===void 0||/data-proposal-section-index=/.test(o)?o:o.replace(/^<(\w+)(\s|>)/,`<$1 data-proposal-section-index="${kt(t)}"$2`)}function kt(o){return o.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Be(o){var t,n,g,e,i;return((t=o.classList)==null?void 0:t.contains("page-break"))||((n=o.style)==null?void 0:n.pageBreakAfter)==="always"||((g=o.style)==null?void 0:g.pageBreakBefore)==="always"||((e=o.style)==null?void 0:e.breakAfter)==="page"||((i=o.style)==null?void 0:i.breakBefore)==="page"}function Re(o){var t,n,g,e,i;return o.hasAttribute("data-full-page")||((t=o.classList)==null?void 0:t.contains("cover-page-wrapper"))||((g=(n=o.style)==null?void 0:n.height)==null?void 0:g.includes("297mm"))||((i=(e=o.style)==null?void 0:e.minHeight)==null?void 0:i.includes("297mm"))}function Ie(o){const t=o.tagName.toLowerCase();return(t==="div"||t==="section"||t==="article"||t==="main")&&o.children.length>0&&!o.classList.contains("page-break")}function ot(o,t){const n=document.createElement("div");n.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;

        left: 0;
        top: 0;

        width: 100%;

        margin: 0;
        padding: 0;
        border: 0;

        box-sizing: border-box;
    `,n.innerHTML=t,o.appendChild(n);const g=n.getBoundingClientRect().height,e=n.scrollHeight;return n.remove(),Math.max(g,e,0)}function ye(o,t){const n=o.cloneNode(!1);return t.forEach(g=>{n.appendChild(g.cloneNode(!0))}),n.outerHTML}function we(o){const t=Array.from(o.children).find(n=>n.tagName.toLowerCase()==="table");return t||null}function ve(o,t){const n=Array.from(o.children),g=n.indexOf(t);if(g<=0)return null;const e=n[g-1];if(!e)return null;const i=e.tagName.toLowerCase();return i==="div"||i==="h1"||i==="h2"||i==="h3"||i==="h4"||i==="h5"||i==="h6"||i==="p"?e:null}function Fe(o,t,n){const g=Array.from(o.childNodes);if(g.length!==1)return null;const e=g[0];if(e.nodeType!==Node.TEXT_NODE)return null;const i=e.textContent||"";if(!i.trim())return null;const h=i.split(/(\s+)/);if(h.length<=1)return null;const d=[];let _="";const z=T=>{const s=o.cloneNode(!1);return s.textContent=T,ot(t,s.outerHTML)<=n+U};for(const T of h){const s=_+T;_.trim()&&!z(s)?(d.push(_.trim()),_=T):_=s}return _.trim()&&d.push(_.trim()),d.length<=1?null:d.map(T=>{const s=o.cloneNode(!1);return s.textContent=T,s.outerHTML})}function qe(o,t,n){const g=Array.from(o.childNodes);if(g.length<=1)return null;const e=[];let i=[];const h=()=>{i.length!==0&&(e.push(ye(o,i)),i=[])};for(const d of g){const _=[...i,d],z=ye(o,_),T=ot(t,z);i.length>0&&T>n+U?(h(),i=[d]):i.push(d)}return h(),e.length>1?e:null}function Ne(o,t,n,g){const e=qe(o,t,n);if(e&&e.length>1)return e.map(d=>K(d,g));const i=Fe(o,t,n);if(i&&i.length>1)return i.map(d=>K(d,g));const h=o.cloneNode(!0);return h.classList.add("proposal-pagination-splittable"),[K(h.outerHTML,g)]}function Qt(o,t,n,g,e,i){const h=o.getAttribute("class")||"",d=o.getAttribute("style")||"",_=i!==void 0?` data-proposal-section-index="${kt(i)}"`:"";return`<table class="${kt(h)}"${_} style="${kt(d)}">`+n+`<tbody>${t.join("")}</tbody>`+(e?g:"")+"</table>"}function Yt(o,t=It()){const n=Array.from(o.querySelectorAll("style")).map(s=>s.outerHTML).join(`
`),g=[];let e=[],i=0;const h=Math.max(1,t-U),d=()=>{e.length!==0&&(g.push((n?n+`
`:"")+e.join("")),e=[],i=0)},_=(s,k)=>{e.push(s),i+=k},z=(s,k,q,b)=>{const A=k.querySelector("thead"),Q=k.querySelector("tfoot"),R=Array.from(k.querySelectorAll("tbody > tr")),Z=A?A.outerHTML:"",r=Q?Q.outerHTML:"",C=q?K(q.outerHTML,b):"";if(R.length===0){const y=Qt(k,[],Z,r,!0,b),c=C+y,w=ot(o,c);i>0&&i+w>h+U&&d(),_(c,w);return}let $=0,p=!0;for(;$<R.length;){const y=[];for(;$<R.length;){const D=R[$],dt=[...y,D.outerHTML],X=$===R.length-1,V=Qt(k,dt,Z,r,X,b),S=p?C+V:V,E=ot(o,S);if(i+E<=h+U){y.push(D.outerHTML),$++;continue}if(y.length>0)break;if(e.length>0&&i>0){d();continue}const nt=D.cloneNode(!0);nt.classList.add("proposal-oversized-row"),y.push(nt.outerHTML),$++;break}if(y.length===0)break;const c=$>=R.length,w=Qt(k,y,Z,r,c,b),x=p?C+w:w,G=ot(o,x);i>0&&i+G>h+U&&d(),_(x,G),p=!1,c||d()}},T=(s,k)=>{const b=s.getAttribute("data-proposal-section-index")??k,A=s.tagName.toLowerCase();if(A==="style"||A==="script")return;if(Be(s)){d();const r=we(s);if(r){const p=ve(s,r);z(s,r,p,b);const y=Array.from(s.children),c=y.indexOf(r);for(let w=c+1;w<y.length;w++)T(y[w],b);return}const C=K(s.outerHTML,b),$=Rt(s);_(C,$),d();return}if(Re(s)){e.length>0&&d();const r=K(s.outerHTML,b);e.push(r),i=Rt(s),d();return}if(A==="table"){z(s,s,null,b);return}const Q=we(s);if(Q){const r=Array.from(s.children),C=r.indexOf(Q),$=ve(s,Q),p=$?r.indexOf($):C;for(let y=0;y<Math.max(0,p);y++)T(r[y],b);z(s,Q,$,b);for(let y=C+1;y<r.length;y++)T(r[y],b);return}if((A==="ul"||A==="ol")&&s.children.length>0){const r=s.getAttribute("class")||"",C=s.getAttribute("style")||"",$=Array.from(s.children);let p=[];const y=()=>{if(p.length===0)return;const c=`<${A} class="${kt(r)}" style="${kt(C)}">`+p.join("")+`</${A}>`,w=ot(o,c);_(K(c,b),w),p=[]};for(let c=0;c<$.length;c++){const w=$[c],x=[...p,K(w.outerHTML,b)],G=`<${A}>${x.join("")}</${A}>`,D=ot(o,G);if(i+D>h+U){if(p.length>0&&(y(),d()),ot(o,`<${A}>${K(w.outerHTML,b)}</${A}>`)<=h+U){p.push(K(w.outerHTML,b));continue}const X=Ne(w,o,h,b);X.forEach((V,S)=>{e.length>0&&i>0&&d();const E=ot(o,V);_(V,E),S<X.length-1&&d()});continue}p.push(K(w.outerHTML,b))}y();return}if(Ie(s)){const r=Rt(s);if(i+r<=h+U){_(K(s.outerHTML,b),r);return}const C=Array.from(s.children);if(C.length>0){C.forEach($=>T($,b));return}}const R=Rt(s);if(i+R<=h+U){_(K(s.outerHTML,b),R);return}if(e.length>0&&d(),R<=h+U){_(K(s.outerHTML,b),R);return}const Z=Ne(s,o,h,b);Z.forEach((r,C)=>{e.length>0&&i>0&&d();const $=ot(o,r);_(r,$),C<Z.length-1&&d()})};return Array.from(o.children).forEach(s=>{T(s)}),e.length>0&&d(),g.length>0?g:[o.innerHTML]}const W=o=>(Number(o)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),Ft=$e.memo(({children:o,content:t,backgroundImage:n,defaultBg:g,templateColor:e=Te,headerLogo:i,headerLogoAlign:h="right",pageKey:d,className:_="",customHtml:z=!1})=>{const T=n&&String(n).trim()!==""?n:g,s=T?qt(T):"",k=i?qt(i):"",q=()=>{const b=h||"right";return b==="left"?{top:"8mm",left:"15mm",right:"auto",justifyContent:"flex-start",maxHeight:"20mm",maxWidth:"60mm"}:b==="center"||b==="middle"?{top:"8mm",left:"50%",right:"auto",transform:"translateX(-50%)",justifyContent:"center",maxHeight:"20mm",maxWidth:"60mm"}:{top:"8mm",right:"15mm",left:"auto",justifyContent:"flex-end",maxHeight:"20mm",maxWidth:"60mm"}};return u.jsxs("div",{style:{width:"210mm",...z?{minHeight:"297mm",boxSizing:"border-box"}:{height:"297mm",minHeight:"297mm",maxHeight:"297mm",boxSizing:"border-box",overflow:"hidden"},pageBreakAfter:"always",breakAfter:"page",pageBreakInside:"avoid",breakInside:"avoid-page",fontFamily:'"Open Sans", sans-serif',"--template-color":e},className:Tt("proposal-preview-sheet proposal-cover__sheet bg-white text-slate-900 w-[210mm] max-w-full shadow-2xl rounded-sm text-sm border border-slate-300 dark:border-slate-800 shrink-0 relative",!z&&"h-[297mm] overflow-hidden",_),children:[s&&u.jsx("div",{className:"absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden",children:u.jsx("img",{src:s,alt:"Page Background",className:"w-full h-full object-fill block"})}),k&&u.jsx("div",{className:"absolute z-20 pointer-events-none flex items-center",style:q(),children:u.jsx("img",{src:k,alt:"Header Logo",className:"max-h-[16mm] max-w-[55mm] object-contain"})}),u.jsx("div",{className:Tt(!z&&"proposal-page__body",z&&"w-full h-full p-0 m-0"),style:{position:"relative",zIndex:1,...z?{padding:0,margin:0,width:"100%",minHeight:"297mm",boxSizing:"border-box",display:"block"}:{padding:"32mm 15mm 20mm",height:"calc(297mm - 52mm)",minHeight:"calc(297mm - 52mm)",maxHeight:"calc(297mm - 52mm)",boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"flex-start"}},children:o||(t?u.jsx("div",{className:Tt(!z&&Tt("html-preview-container flex-1 flex flex-col",ke),z&&"w-full h-full"),style:z?{width:"100%",height:"100%"}:{display:"flex",flexDirection:"column",flex:1,width:"100%"},dangerouslySetInnerHTML:{__html:t}}):null)})]},d)});Ft.displayName="ProposalPreviewSheet";function De({isOpen:o,open:t,onClose:n,onOpenChange:g,formData:e,sections:i=[],customers:h=[],availableProducts:d=[],proposalSetting:_,totals:z,other_details:T,title:s,pageTitle:k,content:q,backgroundImage:b,settings:A,isDefaultPageSetup:Q,showPrintButton:R=!0,customHtml:Z=!1,inline:r=!1,autoPrint:C=!1,hideHeaderBar:$=!1}){const{t:p}=Se(),y=!!(o??t);B.useEffect(()=>{var H;const l=(e==null?void 0:e.subject)||s||k||"",f=(e==null?void 0:e.customer_name)||(h&&h.length>0?(H=h[0])==null?void 0:H.name:"")||"",N=[l,f].filter(Boolean),a=N.length>0?N.join("_"):e!=null&&e.proposal_number?String(e.proposal_number):s||"";if(r&&a&&(document.title=a),r&&C){const j=setTimeout(()=>{a&&(document.title=a),window.print()},600);return()=>clearTimeout(j)}},[r,C,e,h,s,k]);const c=B.useCallback(()=>{n&&n(),g&&g(!1)},[n,g]);B.useRef(null);const w=B.useRef(null),x=_||A||null,G=(x==null?void 0:x.template_color)||Te,D=(x==null?void 0:x.show_logo)!==void 0?x.show_logo==="1"||x.show_logo===!0||x.show_logo===1||x.show_logo==="true":!0,dt=(x==null?void 0:x.logo_image)||(x==null?void 0:x.company_logo)||"",X=D&&dt?dt:"",V=(x==null?void 0:x.header_logo_align)||"right",S=(x==null?void 0:x.background_image)||"",E=!e&&(q!==void 0||s!==void 0||k!==void 0),nt=!!(Z||E&&q&&/<style|<link\s+rel|<!doctype|<html|<head/i.test(q)),v=B.useMemo(()=>{if(!E)return"";const l=(q||"").trim();return!l&&(b||S)?"&nbsp;":l?fe(q,{settings:x,isDefaultPageSetup:Q??!0}):""},[E,q,b,S,x,Q]),[ct,mt]=B.useState([]),[$t,gt]=B.useState([]),[Lt,ut]=B.useState([]),[Mt,Ht]=B.useState([]);B.useEffect(()=>{if(!E)return;if(!v){mt([]);return}const l=()=>{if(nt){if(/class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(v)&&w.current){const H=Yt(w.current,It());mt(H)}else mt([v]);return}if(w.current){const a=Yt(w.current,It());mt(a)}else mt([v])};let f=!1;return(async()=>{var a;(a=document.fonts)!=null&&a.ready&&await document.fonts.ready,f||l()})(),()=>{f=!0}},[E,v,y,r,nt]);const ht=B.useCallback(l=>{var f;if(l.product_name)return l.product_name;if(l.name)return l.name;if((f=l.product)!=null&&f.name)return l.product.name;if(l.product_id&&d.length>0){const N=d.find(a=>String(a.id)===String(l.product_id));if(N!=null&&N.name)return N.name}return l.product_description||l.description||p("Item / Service")},[d,p]),bt=B.useCallback(l=>{var f;if(l.product_description)return l.product_description;if(l.description)return l.description;if((f=l.product)!=null&&f.description)return l.product.description;if(l.product_id&&d.length>0){const N=d.find(a=>String(a.id)===String(l.product_id));if(N!=null&&N.description)return N.description}return""},[d]),xt=B.useCallback(l=>{var f,N,a,H;if(l.unit_name)return l.unit_name;if(l.unit&&isNaN(Number(l.unit)))return l.unit;if((N=(f=l.product)==null?void 0:f.unit_relation)!=null&&N.unit_name)return l.product.unit_relation.unit_name;if((a=l.product)!=null&&a.unit_name)return l.product.unit_name;if((H=l.product)!=null&&H.unit&&isNaN(Number(l.product.unit)))return l.product.unit;if(l.product_id&&d.length>0){const j=d.find(L=>String(L.id)===String(l.product_id));if(j!=null&&j.unit_name)return j.unit_name;if(j!=null&&j.unit&&isNaN(Number(j.unit)))return j.unit}return""},[d]),rt=B.useMemo(()=>(e==null?void 0:e.customer_mode)==="new"?{id:0,name:(e==null?void 0:e.customer_name)||"",email:(e==null?void 0:e.customer_email)||"",mobile_no:(e==null?void 0:e.customer_phone)||"",phone:(e==null?void 0:e.customer_phone)||"",address:(e==null?void 0:e.customer_address)||"",type:(e==null?void 0:e.customer_type)||"Individual"}:h.find(l=>String(l.id)===String(e==null?void 0:e.customer_id)),[h,e==null?void 0:e.customer_id,e==null?void 0:e.customer_mode,e==null?void 0:e.customer_name,e==null?void 0:e.customer_email,e==null?void 0:e.customer_phone,e==null?void 0:e.customer_address]),it=B.useMemo(()=>{if(E||!e)return"";const l=e.items||[],f=l.filter(m=>(m.section==="otc"||m.section==="general"||!m.section)&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),N=l.filter(m=>m.section==="mrc"&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),a=f.reduce((m,O)=>m+Number(O.quantity??1)*Number(O.unit_price||0),0);let H=0;if(e.otc_discount_value>0){const m=Number(e.otc_discount_value)||0;e.otc_discount_type==="percentage"?H=a*Math.min(Math.max(m,0),100)/100:H=Math.min(Math.max(m,0),a)}const j=f.reduce((m,O)=>m+Number(O.tax_amount||0),0),L=Math.max(0,a-H+j),P=N.reduce((m,O)=>m+Number(O.quantity??1)*Number(O.unit_price||0),0);let I=0;if(e.mrc_discount_value>0){const m=Number(e.mrc_discount_value)||0;e.mrc_discount_type==="percentage"?I=P*Math.min(Math.max(m,0),100)/100:I=Math.min(Math.max(m,0),P)}const F=N.reduce((m,O)=>m+Number(O.tax_amount||0),0),ft=Math.max(0,P-I+F),tt=[];i.forEach((m,O)=>{const st=(m.content||"").trim(),_t=(m.page_type||"").toLowerCase(),Ct=_t==="otc"||st==="[OTC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("one-time charges"),St=_t==="mrc"||st==="[MRC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("monthly recurring charges"),Et=_t==="other-details"||st==="[OTHER_DETAILS_CONTENT]"||m.title&&m.title.toLowerCase().includes("other details");if(Ct){if(f.length===0)return;const J=m.title||p("ONE-TIME CHARGES (OTC)");let et="";f.forEach((M,yt)=>{const lt=Number(M.quantity??1);xt(M);const at=Number(M.unit_price)||0,wt=M.total_amount!==void 0?Number(M.total_amount):lt*at,vt=bt(M),pt=Number(M.tax_amount)||0;et+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${yt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${ht(M)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${vt||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${lt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${W(at)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${pt>0?W(pt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${W(wt)}</td>
                        </tr>
                    `}),tt.push(`
                    <div class="proposal-section-block otc-charges-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${J}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${G}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${p("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${p("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${p("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${p("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${et}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${W(a)}</td>
                                </tr>
                                ${H>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${W(H)}</td>
                                </tr>`:""}
                                ${j>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${W(j)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${p("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${W(L)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(St){if(N.length===0)return;const J=m.title||p("MONTHLY RECURRING CHARGES (MRC)");let et="";N.forEach((M,yt)=>{const lt=Number(M.quantity??1);xt(M);const at=Number(M.unit_price)||0,wt=M.total_amount!==void 0?Number(M.total_amount):lt*at,vt=bt(M),pt=Number(M.tax_amount)||0;et+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${yt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${ht(M)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${vt||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${lt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${W(at)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${pt>0?W(pt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${W(wt)}</td>
                        </tr>
                    `}),tt.push(`
                    <div class="proposal-section-block mrc-charges-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${J}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${G}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${p("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${p("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${p("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${p("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${p("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${et}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${W(P)}</td>
                                </tr>
                                ${I>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${W(I)}</td>
                                </tr>`:""}
                                ${F>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${W(F)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${p("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${W(ft)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(Et){const J=e.other_details||T||"";if(!J)return;const et=m.title||p("OTHER DETAILS");tt.push(`
                    <div class="proposal-section-block other-details-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${et}</div>
                        <div class="prose max-w-none text-xs leading-relaxed text-slate-700">
                            ${J}
                        </div>
                    </div>
                `);return}if(m.page_type==="custom"||!Ct&&!St&&!Et){const J=m.background_image||"";(st||J)&&tt.push(`
                        <div class="proposal-section-block custom-section-block page-break" data-full-page="true" data-proposal-section-index="${O}" style="min-height: 297mm; height: 100%;">
                            ${st||"&nbsp;"}
                        </div>
                    `)}});const Pt=tt.join(`

`);return fe(Pt,{proposal:e,customer:rt,settings:x,isDefaultPageSetup:!1})},[E,e,i,h,ht,bt,xt,p,G,x,T]);B.useEffect(()=>{if(E||!it){gt(a=>a.length===0?a:[]),ut(a=>a.length===0?a:[]);return}const l=()=>{if(w.current){const a=Yt(w.current,It());gt(L=>L.length===a.length&&L.every((P,I)=>P===a[I])?L:a);const H=[],j=[];a.forEach(L=>{const P=L.match(/data-proposal-section-index=["'](\d+)["']/);if(P&&P[1]!==void 0){const I=parseInt(P[1],10),F=i[I];F!=null&&F.background_image&&F.background_image.trim()!==""?H.push(F.background_image):H.push(S);const ft=(F==null?void 0:F.content)||"",tt=/<style|<link\s+rel|<!doctype|<html|<head/i.test(ft);j.push(tt);return}H.push(S),j.push(!1)}),ut(L=>L.length===H.length&&L.every((P,I)=>P===H[I])?L:H),Ht(L=>L.length===j.length&&L.every((P,I)=>P===j[I])?L:j)}else gt(a=>a.length===1&&a[0]===it?a:[it]),ut(a=>a.length===1&&a[0]===S?a:[S]),Ht(a=>a.length===1&&a[0]===!1?a:[!1])};let f=!1;return(async()=>{var a;(a=document.fonts)!=null&&a.ready&&await document.fonts.ready,f||l()})(),()=>{f=!0}},[E,it,i,S,y,r]);const At=B.useCallback(()=>{const l=(e==null?void 0:e.subject)||s||k||"",f=(rt==null?void 0:rt.name)||(e==null?void 0:e.customer_name)||"",N=[l,f].filter(Boolean),a=N.length>0?N.join("_"):e!=null&&e.proposal_number?String(e.proposal_number):document.title,H=document.title;a&&(document.title=a),window.print(),setTimeout(()=>{document.title=H},1e3)},[e,rt,s,k]),zt=s||k||(e==null?void 0:e.subject)||p("Preview"),jt=()=>u.jsx("div",{className:"flex flex-col gap-6 items-center w-full print:gap-0 print:block",children:E?ct.length>0?ct.map((l,f)=>u.jsx(Ft,{pageKey:`single-page-${f}`,backgroundImage:b,defaultBg:S,templateColor:G,headerLogo:X,headerLogoAlign:V,content:l,customHtml:nt},`single-page-${f}`)):u.jsx(Ft,{pageKey:"single-page-0",backgroundImage:b,defaultBg:S,templateColor:G,headerLogo:X,headerLogoAlign:V,content:v,customHtml:nt},"single-page-0"):$t.length>0?$t.map((l,f)=>u.jsx(Ft,{pageKey:`proposal-page-${f}`,backgroundImage:Lt[f]||S,defaultBg:S,templateColor:G,headerLogo:X,headerLogoAlign:V,content:l,customHtml:!!Mt[f]},`proposal-page-${f}`)):u.jsx("div",{className:"p-8 text-center text-slate-500",children:p("No pages configured in Page Order.")})});return u.jsxs(u.Fragment,{children:[u.jsx("div",{ref:w,className:Tt("html-preview-container",ke),style:{position:"fixed",left:"-9999px",top:0,width:"180mm",visibility:"hidden",pointerEvents:"none",zIndex:-1},dangerouslySetInnerHTML:{__html:E?v:it}}),r?u.jsxs("div",{className:Tt("min-h-screen bg-slate-100 dark:bg-slate-950 px-4 print:p-0 print:bg-white flex flex-col items-center",$?"py-0":"py-8"),children:[!$&&u.jsxs("div",{className:"w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 print:hidden",children:[u.jsxs("div",{className:"flex items-center gap-3",children:[u.jsx("div",{className:"p-2 rounded-lg bg-primary/10 text-primary",children:u.jsx(Ee,{className:"h-5 w-5"})}),u.jsxs("div",{children:[u.jsx("h1",{className:"font-bold text-slate-900 dark:text-slate-100 text-base",children:(e==null?void 0:e.proposal_number)||zt}),(e==null?void 0:e.subject)&&u.jsx("p",{className:"text-xs text-slate-500",children:e.subject})]})]}),u.jsx("div",{className:"flex items-center gap-2",children:u.jsxs(he,{variant:"default",size:"sm",onClick:()=>window.print(),className:"gap-2",children:[u.jsx(xe,{className:"h-4 w-4"}),p("Print / Save PDF")]})})]}),u.jsxs("div",{className:"w-full flex justify-center",children:[u.jsx("style",{dangerouslySetInnerHTML:{__html:_e}}),jt()]})]}):u.jsx(He,{open:y,onOpenChange:l=>!l&&c(),children:u.jsxs(ze,{className:"max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-xl !rounded-md [&>div]:p-0 [&>div]:max-h-[92vh] [&>div]:flex [&>div]:flex-col [&>button]:top-2.5 [&>button]:right-3",children:[u.jsxs(je,{className:"!py-3 !px-5 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0",children:[u.jsxs("div",{className:"flex items-center gap-2.5 pr-8",children:[u.jsx("div",{className:"p-1.5 rounded-md bg-primary/10 text-primary",children:u.jsx(Le,{className:"h-4 w-4"})}),u.jsx(Ce,{className:"text-sm font-semibold",children:zt})]}),R&&u.jsx("div",{className:"flex items-center gap-2 pr-6",children:u.jsxs(he,{variant:"default",size:"sm",onClick:At,className:"gap-2 text-xs h-8",children:[u.jsx(xe,{className:"h-3.5 w-3.5"}),p("Print")]})})]}),u.jsxs("div",{className:"flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-900 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent",children:[u.jsx("style",{dangerouslySetInnerHTML:{__html:_e}}),jt()]})]})})]})}export{ke as P,_e as a,Ft as b,De as c,Ue as d,Yt as p,fe as r};
