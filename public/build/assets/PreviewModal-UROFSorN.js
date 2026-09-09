import{r as O,j as u,R as je}from"./ui-Ce3CDfXD.js";import{D as ze,a as Se,b as Ce,c as Ee}from"./dialog-DcAuSlKr.js";import{B as be}from"./button-7g9Z4Qd-.js";import{c as X,n as qt,b as It,f as At}from"./helpers-DCIlavgG.js";import{c as Rt}from"./utils-DqweA7RH.js";import{u as Le}from"./useTranslation-CpQ214jG.js";import{F as Me}from"./file-text-040fFkED.js";import{P as xe}from"./printer-Crw1BQ4P.js";import{E as Ae}from"./eye-C5bICdjf.js";const fe=(o,t={})=>{var st,Tt,gt,St,ut,at,Ct,$t,kt,l,h,w,i,$,_,B,K,q,ht,Et,lt,Lt,m,P,pt,bt,Ht,jt,zt,Ft,Q,D,C,xt,dt,ct,ft,_t,mt,Yt,Qt,Zt,Jt,Ut,Dt,te,ee,oe,ne,re,ie,se,ae,le,pe,de,ce,me,ge,ue,he;if(!o)return"";let n=t.pageProps;!n&&typeof window<"u"&&(n=(st=window==null?void 0:window.__INITIAL_PAGE__)==null?void 0:st.props);const g=X("company_name",n)||((Tt=t.settings)==null?void 0:Tt.company_name)||"My Company Ltd.",e=X("company_email",n)||((gt=t.settings)==null?void 0:gt.company_email)||"info@company.com",s=X("company_telephone",n)||X("company_phone",n)||((St=t.settings)==null?void 0:St.company_telephone)||((ut=t.settings)==null?void 0:ut.company_phone)||"+880 1234-567890",b=X("company_address",n)||((at=t.settings)==null?void 0:at.company_address)||"123 Main Street, Dhaka, Bangladesh",c=X("company_website",n)||((Ct=t.settings)==null?void 0:Ct.company_website)||"https://www.example.com",y=g,L=X("logo_dark",n)||X("logo_light",n)||X("logo",n)||X("company_logo",n)||X("company_dark_logo",n)||X("company_light_logo",n)||qt("logo_dark",n)||qt("logo_light",n)||qt("logo",n)||"uploads/logo/logo_dark.png",v=It(L),a=(($t=t.proposalSetting)==null?void 0:$t.logo_image)||((kt=t.settings)==null?void 0:kt.logo_image)||L,T=It(a),F=((l=t.formData)==null?void 0:l.subject)||((h=t.proposal)==null?void 0:h.subject)||"",x=((w=t.formData)==null?void 0:w.proposal_number)||((i=t.proposal)==null?void 0:i.proposal_number)||"",E=(($=t.formData)==null?void 0:$.invoice_date)||((_=t.formData)==null?void 0:_.proposal_date)||((B=t.proposal)==null?void 0:B.proposal_date)||((K=t.proposal)==null?void 0:K.invoice_date),W=yt=>{if(!yt)return"";const nt=new Date(yt);if(isNaN(nt.getTime()))return String(yt);const Mt=String(nt.getDate()).padStart(2,"0"),ke=nt.toLocaleString("en-US",{month:"long"}),He=nt.getFullYear();return`${Mt} ${ke}, ${He}`},I=E?W(E):"",A=((q=t.formData)==null?void 0:q.due_date)||((ht=t.proposal)==null?void 0:ht.due_date),f=A?W(A):"",d=t.customer||((Et=t.formData)==null?void 0:Et.customer)||((lt=t.proposal)==null?void 0:lt.customer)||{},p=(d==null?void 0:d.name)||((Lt=t.formData)==null?void 0:Lt.customer_name)||((m=t.proposal)==null?void 0:m.customer_name)||"",j=(d==null?void 0:d.email)||((P=t.formData)==null?void 0:P.customer_email)||((pt=t.proposal)==null?void 0:pt.customer_email)||"",N=(d==null?void 0:d.mobile_no)||(d==null?void 0:d.phone)||(d==null?void 0:d.mobile)||(d==null?void 0:d.contact_person_mobile)||((bt=t.formData)==null?void 0:bt.customer_phone)||((Ht=t.formData)==null?void 0:Ht.customer_mobile)||((jt=t.proposal)==null?void 0:jt.customer_phone)||((zt=t.proposal)==null?void 0:zt.customer_mobile)||"",H=(typeof(d==null?void 0:d.address)=="string"?d.address:"")||(typeof(d==null?void 0:d.billing_address)=="string"?d.billing_address:"")||(d!=null&&d.billing_address&&typeof d.billing_address=="object"?`${d.billing_address.address_line_1||""} ${d.billing_address.city||""} ${d.billing_address.state||""} ${d.billing_address.zip_code||""}`.trim():"")||((Ft=t.formData)==null?void 0:Ft.customer_address)||((Q=t.proposal)==null?void 0:Q.customer_address)||"",r=t.user||t.creator||t.author||((D=t.proposal)==null?void 0:D.creator)||((C=t.proposal)==null?void 0:C.author)||t.employee||((xt=n==null?void 0:n.auth)==null?void 0:xt.user)||(typeof window<"u"?(ft=(ct=(dt=window==null?void 0:window.__INITIAL_PAGE__)==null?void 0:dt.props)==null?void 0:ct.auth)==null?void 0:ft.user:null)||{},R=(r==null?void 0:r.employee)||t.employeeRecord||null,et=(r==null?void 0:r.name)||((_t=t.formData)==null?void 0:_t.user_name)||((mt=t.formData)==null?void 0:mt.creator_name)||"",Y=(r==null?void 0:r.email)||((Yt=t.formData)==null?void 0:Yt.user_email)||((Qt=t.formData)==null?void 0:Qt.creator_email)||"",ot=(r==null?void 0:r.mobile_no)||(r==null?void 0:r.phone)||(r==null?void 0:r.mobile)||(r==null?void 0:r.telephone)||((Zt=t.formData)==null?void 0:Zt.user_phone)||((Jt=t.formData)==null?void 0:Jt.creator_phone)||"",J=(R==null?void 0:R.employee_id)||(r!=null&&r.id?String(r.id):((Ut=t.formData)==null?void 0:Ut.user_id)||""),z=((Dt=t.totals)==null?void 0:Dt.subtotal)??((te=t.formData)==null?void 0:te.subtotal)??((ee=t.proposal)==null?void 0:ee.subtotal),S=((oe=t.totals)==null?void 0:oe.tax_amount)??((ne=t.totals)==null?void 0:ne.taxAmount)??((re=t.formData)==null?void 0:re.tax_amount)??((ie=t.proposal)==null?void 0:ie.tax_amount),M=((se=t.totals)==null?void 0:se.discount_amount)??((ae=t.totals)==null?void 0:ae.discountAmount)??((le=t.formData)==null?void 0:le.discount_amount)??((pe=t.proposal)==null?void 0:pe.discount_amount),U=((de=t.totals)==null?void 0:de.total)??((ce=t.totals)==null?void 0:ce.total_amount)??((me=t.formData)==null?void 0:me.total_amount)??((ge=t.proposal)==null?void 0:ge.total_amount),rt={app_name:y,company_name:g,company_email:e,company_phone:s,company_telephone:s,company_address:b,company_website:c,user_id:J,user_name:et,user_email:Y,user_phone:ot,creator_name:et,creator_email:Y,creator_phone:ot,proposal_subject:F,proposal_number:x,proposal_date:I,proposal_due_date:f,due_date:f,proposal_validity:((ue=t.formData)==null?void 0:ue.payment_terms)||((he=t.proposal)==null?void 0:he.payment_terms)||"",customer_name:p,customer_email:j,customer_phone:N,customer_address:H,total_amount:U!=null&&U!==""?At(Number(U),t.pageProps):"",sub_total:z!=null&&z!==""?At(Number(z),t.pageProps):"",total_tax:S!=null&&S!==""?At(Number(S),t.pageProps):"",total_discount:M!=null&&M!==""?At(Number(M),t.pageProps):""};let k=o;const it=!!t.isDefaultPageSetup;v?(k=k.replace(/src=(["'])\s*\{\s*company_logo\s*\}\s*\1/gi,`src=$1${v}$1`),k=k.replace(/\{\s*company_logo\s*\}/gi,`<img src="${v}" alt="Company Logo" class="proposal-logo inline-block max-h-16 max-w-[220px] object-contain" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />`)):it||(k=k.replace(/src=(["'])\s*\{\s*company_logo\s*\}\s*\1/gi,'src=""'),k=k.replace(/\{\s*company_logo\s*\}/gi,"")),T?(k=k.replace(/src=(["'])\s*\{\s*proposal_logo\s*\}\s*\1/gi,`src=$1${T}$1`),k=k.replace(/\{\s*proposal_logo\s*\}/gi,`<img src="${T}" alt="Proposal Logo" class="proposal-logo inline-block max-h-16 max-w-[220px] object-contain" style="display: inline-block !important; vertical-align: middle; max-height: 64px; max-width: 220px; object-fit: contain;" />`)):it||(k=k.replace(/src=(["'])\s*\{\s*proposal_logo\s*\}\s*\1/gi,'src=""'),k=k.replace(/\{\s*proposal_logo\s*\}/gi,""));const Nt=["user_id","user_name","user_email","user_phone","creator_name","creator_email","creator_phone","creator_designation","user_designation"];for(const[yt,nt]of Object.entries(rt)){if(it&&Nt.includes(yt))continue;const Mt=new RegExp(`\\{\\s*${yt}\\s*\\}`,"gi");nt!=null&&String(nt).trim()!==""?k=k.replace(Mt,String(nt)):it||(k=k.replace(Mt,""))}return k},to=(o,t)=>{var v;if(!o)return"";const n=(t==null?void 0:t.employee)||null,g=(t==null?void 0:t.name)||"",e=(t==null?void 0:t.email)||"",s=(t==null?void 0:t.mobile_no)||(t==null?void 0:t.phone)||(t==null?void 0:t.mobile)||(t==null?void 0:t.telephone)||"",b=(n==null?void 0:n.employee_id)||(t!=null&&t.id?String(t.id):""),c=((v=n==null?void 0:n.designation)==null?void 0:v.name)||(t==null?void 0:t.designation)||"",y={user_name:g,creator_name:g,user_email:e,creator_email:e,user_phone:s,creator_phone:s,user_id:b,creator_designation:c,user_designation:c};let L=o;for(const[a,T]of Object.entries(y))T&&(L=L.replace(new RegExp(`\\{\\s*${a}\\s*\\}`,"gi"),T));return L},Te="#E9591C",$e="html-preview-container",Pe=210,Gt=297,Vt=32,Wt=30,Oe=15,_e=`
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
`;function wt(o){if(typeof document>"u")return o*3.7795275591;const t=document.createElement("div");t.style.cssText=`
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
    `,document.body.appendChild(t);const n=t.getBoundingClientRect().width;return t.remove(),n||o*3.7795275591}function Ot(){if(typeof document>"u")return wt(Gt)-wt(Vt)-wt(Wt);const o=document.createElement("div");o.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        left: -10000px;
        top: -10000px;

        width: ${Pe}mm;
        height: ${Gt}mm;

        box-sizing: border-box;

        padding:
            ${Vt}mm
            ${Oe}mm
            ${Wt}mm;

        display: flex;
        flex-direction: column;

        margin: 0;
        border: 0;
    `;const t=document.createElement("div");t.style.cssText=`
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        box-sizing: border-box;
    `,o.appendChild(t),document.body.appendChild(o);const n=t.getBoundingClientRect().height;return o.remove(),n||wt(Gt)-wt(Vt)-wt(Wt)}const Z=1;function Be(o){if(typeof window>"u")return 0;const t=window.getComputedStyle(o);return(parseFloat(t.marginTop)||0)+(parseFloat(t.marginBottom)||0)}function Ie(o){const t=o.getBoundingClientRect();return t.height>0?t.height:o.offsetHeight||0}function Pt(o){return Ie(o)+Be(o)}function V(o,t){return t===void 0||/data-proposal-section-index=/.test(o)?o:o.replace(/^<(\w+)(\s|>)/,`<$1 data-proposal-section-index="${vt(t)}"$2`)}function vt(o){return o.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Re(o){var t,n,g,e,s;return((t=o.classList)==null?void 0:t.contains("page-break"))||((n=o.style)==null?void 0:n.pageBreakAfter)==="always"||((g=o.style)==null?void 0:g.pageBreakBefore)==="always"||((e=o.style)==null?void 0:e.breakAfter)==="page"||((s=o.style)==null?void 0:s.breakBefore)==="page"}function Fe(o){var t,n,g,e,s;return o.hasAttribute("data-full-page")||((t=o.classList)==null?void 0:t.contains("cover-page-wrapper"))||((g=(n=o.style)==null?void 0:n.height)==null?void 0:g.includes("297mm"))||((s=(e=o.style)==null?void 0:e.minHeight)==null?void 0:s.includes("297mm"))}function qe(o){const t=o.tagName.toLowerCase();return(t==="div"||t==="section"||t==="article"||t==="main")&&o.children.length>0&&!o.classList.contains("page-break")}function tt(o,t){const n=document.createElement("div");n.style.cssText=`
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
    `,n.innerHTML=t,o.appendChild(n);const g=n.getBoundingClientRect().height,e=n.scrollHeight;return n.remove(),Math.max(g,e,0)}function ye(o,t){const n=o.cloneNode(!1);return t.forEach(g=>{n.appendChild(g.cloneNode(!0))}),n.outerHTML}function we(o){const t=Array.from(o.children).find(n=>n.tagName.toLowerCase()==="table");return t||null}function ve(o,t){const n=Array.from(o.children),g=n.indexOf(t);if(g<=0)return null;const e=n[g-1];if(!e)return null;const s=e.tagName.toLowerCase();return s==="div"||s==="h1"||s==="h2"||s==="h3"||s==="h4"||s==="h5"||s==="h6"||s==="p"?e:null}function Ge(o,t,n){const g=Array.from(o.childNodes);if(g.length!==1)return null;const e=g[0];if(e.nodeType!==Node.TEXT_NODE)return null;const s=e.textContent||"";if(!s.trim())return null;const b=s.split(/(\s+)/);if(b.length<=1)return null;const c=[];let y="";const L=v=>{const a=o.cloneNode(!1);return a.textContent=v,tt(t,a.outerHTML)<=n+Z};for(const v of b){const a=y+v;y.trim()&&!L(a)?(c.push(y.trim()),y=v):y=a}return y.trim()&&c.push(y.trim()),c.length<=1?null:c.map(v=>{const a=o.cloneNode(!1);return a.textContent=v,a.outerHTML})}function Ve(o,t,n){const g=Array.from(o.childNodes);if(g.length<=1)return null;const e=[];let s=[];const b=()=>{s.length!==0&&(e.push(ye(o,s)),s=[])};for(const c of g){const y=[...s,c],L=ye(o,y),v=tt(t,L);s.length>0&&v>n+Z?(b(),s=[c]):s.push(c)}return b(),e.length>1?e:null}function Ne(o,t,n,g){const e=Ve(o,t,n);if(e&&e.length>1)return e.map(c=>V(c,g));const s=Ge(o,t,n);if(s&&s.length>1)return s.map(c=>V(c,g));const b=o.cloneNode(!0);return b.classList.add("proposal-pagination-splittable"),[V(b.outerHTML,g)]}function Kt(o,t,n,g,e,s){const b=o.getAttribute("class")||"",c=o.getAttribute("style")||"",y=s!==void 0?` data-proposal-section-index="${vt(s)}"`:"";return`<table class="${vt(b)}"${y} style="${vt(c)}">`+n+`<tbody>${t.join("")}</tbody>`+(e?g:"")+"</table>"}function Xt(o,t=Ot()){const n=Array.from(o.querySelectorAll("style")).map(a=>a.outerHTML).join(`
`),g=[];let e=[],s=0;const b=Math.max(1,t-Z),c=()=>{e.length!==0&&(g.push((n?n+`
`:"")+e.join("")),e=[],s=0)},y=(a,T)=>{e.push(a),s+=T},L=(a,T,F,x)=>{const E=T.querySelector("thead"),W=T.querySelector("tfoot"),I=Array.from(T.querySelectorAll("tbody > tr")),A=E?E.outerHTML:"",f=W?W.outerHTML:"",d=F?V(F.outerHTML,x):"";if(I.length===0){const N=Kt(T,[],A,f,!0,x),H=d+N,r=tt(o,H);s>0&&s+r>b+Z&&c(),y(H,r);return}let p=0,j=!0;for(;p<I.length;){const N=[];for(;p<I.length;){const Y=I[p],ot=[...N,Y.outerHTML],J=p===I.length-1,z=Kt(T,ot,A,f,J,x),S=j?d+z:z,M=tt(o,S);if(s+M<=b+Z){N.push(Y.outerHTML),p++;continue}if(N.length>0)break;if(e.length>0&&s>0){c();continue}const U=Y.cloneNode(!0);U.classList.add("proposal-oversized-row"),N.push(U.outerHTML),p++;break}if(N.length===0)break;const H=p>=I.length,r=Kt(T,N,A,f,H,x),R=j?d+r:r,et=tt(o,R);s>0&&s+et>b+Z&&c(),y(R,et),j=!1,H||c()}},v=(a,T)=>{const x=a.getAttribute("data-proposal-section-index")??T,E=a.tagName.toLowerCase();if(E==="style"||E==="script")return;if(Re(a)){c();const f=we(a);if(f){const j=ve(a,f);L(a,f,j,x);const N=Array.from(a.children),H=N.indexOf(f);for(let r=H+1;r<N.length;r++)v(N[r],x);return}const d=V(a.outerHTML,x),p=Pt(a);y(d,p),c();return}if(Fe(a)){e.length>0&&c();const f=V(a.outerHTML,x);e.push(f),s=Pt(a),c();return}if(E==="table"){L(a,a,null,x);return}const W=we(a);if(W){const f=Array.from(a.children),d=f.indexOf(W),p=ve(a,W),j=p?f.indexOf(p):d;for(let N=0;N<Math.max(0,j);N++)v(f[N],x);L(a,W,p,x);for(let N=d+1;N<f.length;N++)v(f[N],x);return}if((E==="ul"||E==="ol")&&a.children.length>0){const f=a.getAttribute("class")||"",d=a.getAttribute("style")||"",p=Array.from(a.children);let j=[];const N=()=>{if(j.length===0)return;const H=`<${E} class="${vt(f)}" style="${vt(d)}">`+j.join("")+`</${E}>`,r=tt(o,H);y(V(H,x),r),j=[]};for(let H=0;H<p.length;H++){const r=p[H],R=[...j,V(r.outerHTML,x)],et=`<${E}>${R.join("")}</${E}>`,Y=tt(o,et);if(s+Y>b+Z){if(j.length>0&&(N(),c()),tt(o,`<${E}>${V(r.outerHTML,x)}</${E}>`)<=b+Z){j.push(V(r.outerHTML,x));continue}const J=Ne(r,o,b,x);J.forEach((z,S)=>{e.length>0&&s>0&&c();const M=tt(o,z);y(z,M),S<J.length-1&&c()});continue}j.push(V(r.outerHTML,x))}N();return}if(qe(a)){const f=Pt(a);if(s+f<=b+Z){y(V(a.outerHTML,x),f);return}const d=Array.from(a.children);if(d.length>0){d.forEach(p=>v(p,x));return}}const I=Pt(a);if(s+I<=b+Z){y(V(a.outerHTML,x),I);return}if(e.length>0&&c(),I<=b+Z){y(V(a.outerHTML,x),I);return}const A=Ne(a,o,b,x);A.forEach((f,d)=>{e.length>0&&s>0&&c();const p=tt(o,f);y(f,p),d<A.length-1&&c()})};return Array.from(o.children).forEach(a=>{v(a)}),e.length>0&&c(),g.length>0?g:[o.innerHTML]}const G=o=>(Number(o)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),Bt=je.memo(({children:o,content:t,backgroundImage:n,defaultBg:g,templateColor:e=Te,headerLogo:s,headerLogoAlign:b="right",pageKey:c,className:y=""})=>{const L=n&&String(n).trim()!==""?n:g,v=L?It(L):"",a=s?It(s):"",T=()=>{const F=b||"right";return F==="left"?{top:"8mm",left:"15mm",right:"auto",justifyContent:"flex-start",maxHeight:"20mm",maxWidth:"60mm"}:F==="center"||F==="middle"?{top:"8mm",left:"50%",right:"auto",transform:"translateX(-50%)",justifyContent:"center",maxHeight:"20mm",maxWidth:"60mm"}:{top:"8mm",right:"15mm",left:"auto",justifyContent:"flex-end",maxHeight:"20mm",maxWidth:"60mm"}};return u.jsxs("div",{style:{width:"210mm",height:"297mm",minHeight:"297mm",maxHeight:"297mm",boxSizing:"border-box",pageBreakAfter:"always",breakAfter:"page",pageBreakInside:"avoid",breakInside:"avoid-page",fontFamily:'"Open Sans", sans-serif',"--template-color":e},className:Rt("proposal-preview-sheet proposal-cover__sheet bg-white text-slate-900 w-[210mm] h-[297mm] max-w-full shadow-2xl rounded-sm text-sm border border-slate-300 dark:border-slate-800 shrink-0 overflow-hidden relative",y),children:[v&&u.jsx("div",{className:"absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden",children:u.jsx("img",{src:v,alt:"Page Background",className:"w-full h-full object-fill block"})}),a&&u.jsx("div",{className:"absolute z-20 pointer-events-none flex items-center",style:T(),children:u.jsx("img",{src:a,alt:"Header Logo",className:"max-h-[16mm] max-w-[55mm] object-contain"})}),u.jsx("div",{className:"proposal-page__body",style:{position:"relative",zIndex:1,padding:"32mm 15mm 20mm",height:"calc(297mm - 52mm)",minHeight:"calc(297mm - 52mm)",maxHeight:"calc(297mm - 52mm)",boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"flex-start"},children:o||(t?u.jsx("div",{className:Rt("html-preview-container flex-1 flex flex-col",$e),style:{display:"flex",flexDirection:"column",flex:1,width:"100%"},dangerouslySetInnerHTML:{__html:t}}):null)})]},c)});Bt.displayName="ProposalPreviewSheet";function eo({isOpen:o,open:t,onClose:n,onOpenChange:g,formData:e,sections:s=[],customers:b=[],availableProducts:c=[],proposalSetting:y,totals:L,other_details:v,title:a,pageTitle:T,content:F,backgroundImage:x,settings:E,isDefaultPageSetup:W,showPrintButton:I=!0,inline:A=!1,autoPrint:f=!1,hideHeaderBar:d=!1}){const{t:p}=Le(),j=!!(o??t);O.useEffect(()=>{var $;const l=(e==null?void 0:e.subject)||a||T||"",h=(e==null?void 0:e.customer_name)||(b&&b.length>0?($=b[0])==null?void 0:$.name:"")||"",w=[l,h].filter(Boolean),i=w.length>0?w.join("_"):e!=null&&e.proposal_number?String(e.proposal_number):a||"";if(A&&i&&(document.title=i),A&&f){const _=setTimeout(()=>{i&&(document.title=i),window.print()},600);return()=>clearTimeout(_)}},[A,f,e,b,a,T]);const N=O.useCallback(()=>{n&&n(),g&&g(!1)},[n,g]);O.useRef(null);const H=O.useRef(null),r=y||E||null,R=(r==null?void 0:r.template_color)||Te,et=(r==null?void 0:r.show_logo)!==void 0?r.show_logo==="1"||r.show_logo===!0||r.show_logo===1||r.show_logo==="true":!0,Y=(r==null?void 0:r.logo_image)||(r==null?void 0:r.company_logo)||"",ot=et&&Y?Y:"",J=(r==null?void 0:r.header_logo_align)||"right",z=(r==null?void 0:r.background_image)||"",S=!e&&(F!==void 0||a!==void 0||T!==void 0),M=O.useMemo(()=>{if(!S)return"";const l=(F||"").trim();return!l&&(x||z)?"&nbsp;":l?fe(F,{settings:r,isDefaultPageSetup:W??!0}):""},[S,F,x,z,r,W]),[U,rt]=O.useState([]);O.useEffect(()=>{if(!S)return;if(!M){rt([]);return}const l=()=>{if(H.current){const i=Xt(H.current,Ot());rt(i)}else rt([M])};let h=!1;return(async()=>{var i;(i=document.fonts)!=null&&i.ready&&await document.fonts.ready,h||l()})(),()=>{h=!0}},[S,M,j,A]);const k=O.useCallback(l=>{var h;if(l.product_name)return l.product_name;if(l.name)return l.name;if((h=l.product)!=null&&h.name)return l.product.name;if(l.product_id&&c.length>0){const w=c.find(i=>String(i.id)===String(l.product_id));if(w!=null&&w.name)return w.name}return l.product_description||l.description||p("Item / Service")},[c,p]),it=O.useCallback(l=>{var h;if(l.product_description)return l.product_description;if(l.description)return l.description;if((h=l.product)!=null&&h.description)return l.product.description;if(l.product_id&&c.length>0){const w=c.find(i=>String(i.id)===String(l.product_id));if(w!=null&&w.description)return w.description}return""},[c]),Nt=O.useCallback(l=>{var h,w,i,$;if(l.unit_name)return l.unit_name;if(l.unit&&isNaN(Number(l.unit)))return l.unit;if((w=(h=l.product)==null?void 0:h.unit_relation)!=null&&w.unit_name)return l.product.unit_relation.unit_name;if((i=l.product)!=null&&i.unit_name)return l.product.unit_name;if(($=l.product)!=null&&$.unit&&isNaN(Number(l.product.unit)))return l.product.unit;if(l.product_id&&c.length>0){const _=c.find(B=>String(B.id)===String(l.product_id));if(_!=null&&_.unit_name)return _.unit_name;if(_!=null&&_.unit&&isNaN(Number(_.unit)))return _.unit}return""},[c]),st=O.useMemo(()=>(e==null?void 0:e.customer_mode)==="new"?{id:0,name:(e==null?void 0:e.customer_name)||"",email:(e==null?void 0:e.customer_email)||"",mobile_no:(e==null?void 0:e.customer_phone)||"",phone:(e==null?void 0:e.customer_phone)||"",address:(e==null?void 0:e.customer_address)||"",type:(e==null?void 0:e.customer_type)||"Individual"}:b.find(l=>String(l.id)===String(e==null?void 0:e.customer_id)),[b,e==null?void 0:e.customer_id,e==null?void 0:e.customer_mode,e==null?void 0:e.customer_name,e==null?void 0:e.customer_email,e==null?void 0:e.customer_phone,e==null?void 0:e.customer_address]),[Tt,gt]=O.useState([]),[St,ut]=O.useState([]),at=O.useMemo(()=>{if(S||!e)return"";const l=e.items||[],h=l.filter(m=>(m.section==="otc"||m.section==="general"||!m.section)&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),w=l.filter(m=>m.section==="mrc"&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),i=h.reduce((m,P)=>m+Number(P.quantity??1)*Number(P.unit_price||0),0);let $=0;if(e.otc_discount_value>0){const m=Number(e.otc_discount_value)||0;e.otc_discount_type==="percentage"?$=i*Math.min(Math.max(m,0),100)/100:$=Math.min(Math.max(m,0),i)}const _=h.reduce((m,P)=>m+Number(P.tax_amount||0),0),B=Math.max(0,i-$+_),K=w.reduce((m,P)=>m+Number(P.quantity??1)*Number(P.unit_price||0),0);let q=0;if(e.mrc_discount_value>0){const m=Number(e.mrc_discount_value)||0;e.mrc_discount_type==="percentage"?q=K*Math.min(Math.max(m,0),100)/100:q=Math.min(Math.max(m,0),K)}const ht=w.reduce((m,P)=>m+Number(P.tax_amount||0),0),Et=Math.max(0,K-q+ht),lt=[];s.forEach((m,P)=>{const pt=(m.content||"").trim(),bt=(m.page_type||"").toLowerCase(),Ht=bt==="otc"||pt==="[OTC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("one-time charges"),jt=bt==="mrc"||pt==="[MRC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("monthly recurring charges"),zt=bt==="other-details"||pt==="[OTHER_DETAILS_CONTENT]"||m.title&&m.title.toLowerCase().includes("other details");if(Ht){if(h.length===0)return;const Q=m.title||p("ONE-TIME CHARGES (OTC)");let D="";h.forEach((C,xt)=>{const dt=Number(C.quantity??1);Nt(C);const ct=Number(C.unit_price)||0,ft=C.total_amount!==void 0?Number(C.total_amount):dt*ct,_t=it(C),mt=Number(C.tax_amount)||0;D+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${xt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${k(C)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${_t||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${dt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${G(ct)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${mt>0?G(mt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${G(ft)}</td>
                        </tr>
                    `}),lt.push(`
                    <div class="proposal-section-block otc-charges-block" data-proposal-section-index="${P}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${Q}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${R}; color: #ffffff;">
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
                                ${D}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${G(i)}</td>
                                </tr>
                                ${$>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${G($)}</td>
                                </tr>`:""}
                                ${_>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${G(_)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${p("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${G(B)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(jt){if(w.length===0)return;const Q=m.title||p("MONTHLY RECURRING CHARGES (MRC)");let D="";w.forEach((C,xt)=>{const dt=Number(C.quantity??1);Nt(C);const ct=Number(C.unit_price)||0,ft=C.total_amount!==void 0?Number(C.total_amount):dt*ct,_t=it(C),mt=Number(C.tax_amount)||0;D+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${xt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${k(C)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${_t||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${dt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${G(ct)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${mt>0?G(mt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${G(ft)}</td>
                        </tr>
                    `}),lt.push(`
                    <div class="proposal-section-block mrc-charges-block" data-proposal-section-index="${P}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${Q}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${R}; color: #ffffff;">
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
                                ${D}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${G(K)}</td>
                                </tr>
                                ${q>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${G(q)}</td>
                                </tr>`:""}
                                ${ht>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${p("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${G(ht)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${p("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${G(Et)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(zt){const Q=e.other_details||v||"";if(!Q)return;const D=m.title||p("OTHER DETAILS");lt.push(`
                    <div class="proposal-section-block other-details-block" data-proposal-section-index="${P}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${D}</div>
                        <div class="prose max-w-none text-xs leading-relaxed text-slate-700">
                            ${Q}
                        </div>
                    </div>
                `);return}if(m.page_type==="custom"||!Ht&&!jt&&!zt){const Q=m.background_image||"";(pt||Q)&&lt.push(`
                        <div class="proposal-section-block custom-section-block page-break" data-full-page="true" data-proposal-section-index="${P}" style="min-height: 297mm; height: 100%;">
                            ${pt||"&nbsp;"}
                        </div>
                    `)}});const Lt=lt.join(`

`);return fe(Lt,{proposal:e,customer:st,settings:r,isDefaultPageSetup:!1})},[S,e,s,b,k,it,Nt,p,R,r,v]);O.useEffect(()=>{if(!S)return;if(!M){rt(i=>i.length===0?i:[]);return}const l=()=>{if(H.current){const i=Xt(H.current,Ot());rt($=>$.length===i.length&&$.every((_,B)=>_===i[B])?$:i)}else rt(i=>i.length===1&&i[0]===M?i:[M])};let h=!1;return(async()=>{var i;(i=document.fonts)!=null&&i.ready&&await document.fonts.ready,h||l()})(),()=>{h=!0}},[S,M,j,A]),O.useEffect(()=>{if(S||!at){gt(i=>i.length===0?i:[]),ut(i=>i.length===0?i:[]);return}const l=()=>{if(H.current){const i=Xt(H.current,Ot());gt(_=>_.length===i.length&&_.every((B,K)=>B===i[K])?_:i);const $=[];i.forEach(_=>{const B=_.match(/data-proposal-section-index=["'](\d+)["']/);if(B&&B[1]!==void 0){const K=parseInt(B[1],10),q=s[K];if(q!=null&&q.background_image&&q.background_image.trim()!==""){$.push(q.background_image);return}}$.push(z)}),ut(_=>_.length===$.length&&_.every((B,K)=>B===$[K])?_:$)}else gt(i=>i.length===1&&i[0]===at?i:[at]),ut(i=>i.length===1&&i[0]===z?i:[z])};let h=!1;return(async()=>{var i;(i=document.fonts)!=null&&i.ready&&await document.fonts.ready,h||l()})(),()=>{h=!0}},[S,at,s,z,j,A]);const Ct=O.useCallback(()=>{const l=(e==null?void 0:e.subject)||a||T||"",h=(st==null?void 0:st.name)||(e==null?void 0:e.customer_name)||"",w=[l,h].filter(Boolean),i=w.length>0?w.join("_"):e!=null&&e.proposal_number?String(e.proposal_number):document.title,$=document.title;i&&(document.title=i),window.print(),setTimeout(()=>{document.title=$},1e3)},[e,st,a,T]),$t=a||T||(e==null?void 0:e.subject)||p("Preview"),kt=()=>u.jsx("div",{className:"flex flex-col gap-6 items-center w-full print:gap-0 print:block",children:S?U.length>0?U.map((l,h)=>u.jsx(Bt,{pageKey:`single-page-${h}`,backgroundImage:x,defaultBg:z,templateColor:R,headerLogo:ot,headerLogoAlign:J,content:l},`single-page-${h}`)):u.jsx(Bt,{pageKey:"single-page-0",backgroundImage:x,defaultBg:z,templateColor:R,headerLogo:ot,headerLogoAlign:J,content:M},"single-page-0"):Tt.length>0?Tt.map((l,h)=>u.jsx(Bt,{pageKey:`proposal-page-${h}`,backgroundImage:St[h]||z,defaultBg:z,templateColor:R,headerLogo:ot,headerLogoAlign:J,content:l},`proposal-page-${h}`)):u.jsx("div",{className:"p-8 text-center text-slate-500",children:p("No pages configured in Page Order.")})});return u.jsxs(u.Fragment,{children:[u.jsx("div",{ref:H,className:Rt("html-preview-container",$e),style:{position:"fixed",left:"-9999px",top:0,width:"180mm",visibility:"hidden",pointerEvents:"none",zIndex:-1},dangerouslySetInnerHTML:{__html:S?M:at}}),A?u.jsxs("div",{className:Rt("min-h-screen bg-slate-100 dark:bg-slate-950 px-4 print:p-0 print:bg-white flex flex-col items-center",d?"py-0":"py-8"),children:[!d&&u.jsxs("div",{className:"w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 print:hidden",children:[u.jsxs("div",{className:"flex items-center gap-3",children:[u.jsx("div",{className:"p-2 rounded-lg bg-primary/10 text-primary",children:u.jsx(Me,{className:"h-5 w-5"})}),u.jsxs("div",{children:[u.jsx("h1",{className:"font-bold text-slate-900 dark:text-slate-100 text-base",children:(e==null?void 0:e.proposal_number)||$t}),(e==null?void 0:e.subject)&&u.jsx("p",{className:"text-xs text-slate-500",children:e.subject})]})]}),u.jsx("div",{className:"flex items-center gap-2",children:u.jsxs(be,{variant:"default",size:"sm",onClick:()=>window.print(),className:"gap-2",children:[u.jsx(xe,{className:"h-4 w-4"}),p("Print / Save PDF")]})})]}),u.jsxs("div",{className:"w-full flex justify-center",children:[u.jsx("style",{dangerouslySetInnerHTML:{__html:_e}}),kt()]})]}):u.jsx(ze,{open:j,onOpenChange:l=>!l&&N(),children:u.jsxs(Se,{className:"max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-xl !rounded-md [&>div]:p-0 [&>div]:max-h-[92vh] [&>div]:flex [&>div]:flex-col [&>button]:top-2.5 [&>button]:right-3",children:[u.jsxs(Ce,{className:"!py-3 !px-5 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0",children:[u.jsxs("div",{className:"flex items-center gap-2.5 pr-8",children:[u.jsx("div",{className:"p-1.5 rounded-md bg-primary/10 text-primary",children:u.jsx(Ae,{className:"h-4 w-4"})}),u.jsx(Ee,{className:"text-sm font-semibold",children:$t})]}),I&&u.jsx("div",{className:"flex items-center gap-2 pr-6",children:u.jsxs(be,{variant:"default",size:"sm",onClick:Ct,className:"gap-2 text-xs h-8",children:[u.jsx(xe,{className:"h-3.5 w-3.5"}),p("Print")]})})]}),u.jsxs("div",{className:"flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-900 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent",children:[u.jsx("style",{dangerouslySetInnerHTML:{__html:_e}}),kt()]})]})})]})}export{$e as P,_e as a,Bt as b,eo as c,to as d,Xt as p,fe as r};
