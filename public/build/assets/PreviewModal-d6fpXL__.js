import{b as E,j as m,R as ge}from"./ui-BSZZ9r9D.js";import{X as xe}from"./app-D-n7EgpM.js";import{D as be,a as fe,b as ye,c as we}from"./dialog-WeJTKSMw.js";import{B as Zt}from"./button-CNAj7G3n.js";import{b as Jt}from"./helpers-Dr4keE1W.js";import{r as Dt}from"./proposalShortcodes-DchdmcZN.js";import{c as ct}from"./utils-DqweA7RH.js";import{u as _e}from"./useTranslation-DUtWbSXd.js";import{F as ve}from"./file-text-IAWTGpiN.js";import{P as te}from"./printer-CIUtYiqR.js";import{E as $e}from"./eye-DuI8FmbH.js";const le="#E9591C",ae="html-preview-container";function ee(e){return e?/<style|<link\s+rel|<!doctype|<html|<head|<svg|position:\s*absolute|297mm|210mm/i.test(e):!1}function pe(e,n){let i=e.replace(/@(media|supports)\b[^{]*\{([\s\S]*?\})\s*\}/gi,(c,t,o)=>{const u=c.slice(0,c.indexOf("{")+1),p=pe(o,n);return`${u}
${p}
}`});return i=i.replace(/([^{}@]+)\{([^}]+)\}/g,(c,t,o)=>{const u=t.trim();return u.startsWith("@")?c:`${u.split(",").map(H=>{let y=H.trim();return y?/^(html|body|:root)$/i.test(y)?n:/^(html|body|:root)[\s>+~]/i.test(y)?y.replace(/^(html|body|:root)([\s>+~])/i,`${n}$2`):y.startsWith(n)?y:`${n} ${y}`:""}).filter(Boolean).join(", ")} {${o}}`}),i}function It(e,n=".proposal-preview-sheet"){if(!e)return"";let i=e;return i=i.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"").replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi,""),i=i.replace(/<link\b[^>]*>/gi,""),i=i.replace(/<!doctype[^>]*>/gi,"").replace(/<\/?(html|head|meta|title)\b[^>]*>/gi,""),i=i.replace(/<body\b([^>]*)>/gi,'<div class="proposal-body-wrapper" $1>'),i=i.replace(/<\/body>/gi,"</div>"),i=i.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(c,t,o)=>{const u=pe(o,n);return`<style${t}>${u}</style>`}),i}const Te=210,Lt=297,Pt=32,Bt=30,Ne=15,ne=`
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
`;function dt(e){if(typeof document>"u")return e*3.7795275591;const n=document.createElement("div");n.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        width: ${e}mm;
        height: 0;
        padding: 0;
        margin: 0;
        border: 0;
        left: -10000px;
        top: -10000px;
    `,document.body.appendChild(n);const i=n.getBoundingClientRect().width;return n.remove(),i||e*3.7795275591}function kt(){if(typeof document>"u")return dt(Lt)-dt(Pt)-dt(Bt);const e=document.createElement("div");e.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        left: -10000px;
        top: -10000px;

        width: ${Te}mm;
        height: ${Lt}mm;

        box-sizing: border-box;

        padding:
            ${Pt}mm
            ${Ne}mm
            ${Bt}mm;

        display: flex;
        flex-direction: column;

        margin: 0;
        border: 0;
    `;const n=document.createElement("div");n.style.cssText=`
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        box-sizing: border-box;
    `,e.appendChild(n),document.body.appendChild(e);const i=n.getBoundingClientRect().height;return e.remove(),i||dt(Lt)-dt(Pt)-dt(Bt)}const K=1;function ke(e){if(typeof window>"u")return 0;const n=window.getComputedStyle(e);return(parseFloat(n.marginTop)||0)+(parseFloat(n.marginBottom)||0)}function He(e){const n=e.getBoundingClientRect();return n.height>0?n.height:e.offsetHeight||0}function Nt(e){return He(e)+ke(e)}function B(e,n){return n===void 0||/data-proposal-section-index=/.test(e)?e:e.replace(/^<(\w+)(\s|>)/,`<$1 data-proposal-section-index="${mt(n)}"$2`)}function mt(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ze(e){var n,i,c,t,o;return((n=e.classList)==null?void 0:n.contains("page-break"))||((i=e.style)==null?void 0:i.pageBreakAfter)==="always"||((c=e.style)==null?void 0:c.pageBreakBefore)==="always"||((t=e.style)==null?void 0:t.breakAfter)==="page"||((o=e.style)==null?void 0:o.breakBefore)==="page"}function Ce(e){var n,i,c,t,o;return e.hasAttribute("data-full-page")||((n=e.classList)==null?void 0:n.contains("cover-page-wrapper"))||((c=(i=e.style)==null?void 0:i.height)==null?void 0:c.includes("297mm"))||((o=(t=e.style)==null?void 0:t.minHeight)==null?void 0:o.includes("297mm"))}function Se(e){const n=e.tagName.toLowerCase();return(n==="div"||n==="section"||n==="article"||n==="main")&&e.children.length>0&&!e.classList.contains("page-break")}function Y(e,n){const i=document.createElement("div");i.style.cssText=`
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
    `,i.innerHTML=n,e.appendChild(i);const c=i.getBoundingClientRect().height,t=i.scrollHeight;return i.remove(),Math.max(c,t,0)}function ie(e,n){const i=e.cloneNode(!1);return n.forEach(c=>{i.appendChild(c.cloneNode(!0))}),i.outerHTML}function oe(e){const n=Array.from(e.children).find(i=>i.tagName.toLowerCase()==="table");return n||null}function re(e,n){const i=Array.from(e.children),c=i.indexOf(n);if(c<=0)return null;const t=i[c-1];if(!t)return null;const o=t.tagName.toLowerCase();return o==="div"||o==="h1"||o==="h2"||o==="h3"||o==="h4"||o==="h5"||o==="h6"||o==="p"?t:null}function je(e,n,i){const c=Array.from(e.childNodes);if(c.length!==1)return null;const t=c[0];if(t.nodeType!==Node.TEXT_NODE)return null;const o=t.textContent||"";if(!o.trim())return null;const u=o.split(/(\s+)/);if(u.length<=1)return null;const p=[];let _="";const H=y=>{const r=e.cloneNode(!1);return r.textContent=y,Y(n,r.outerHTML)<=i+K};for(const y of u){const r=_+y;_.trim()&&!H(r)?(p.push(_.trim()),_=y):_=r}return _.trim()&&p.push(_.trim()),p.length<=1?null:p.map(y=>{const r=e.cloneNode(!1);return r.textContent=y,r.outerHTML})}function Me(e,n,i){const c=Array.from(e.childNodes);if(c.length<=1)return null;const t=[];let o=[];const u=()=>{o.length!==0&&(t.push(ie(e,o)),o=[])};for(const p of c){const _=[...o,p],H=ie(e,_),y=Y(n,H);o.length>0&&y>i+K?(u(),o=[p]):o.push(p)}return u(),t.length>1?t:null}function se(e,n,i,c){const t=Me(e,n,i);if(t&&t.length>1)return t.map(p=>B(p,c));const o=je(e,n,i);if(o&&o.length>1)return o.map(p=>B(p,c));const u=e.cloneNode(!0);return u.classList.add("proposal-pagination-splittable"),[B(u.outerHTML,c)]}function Ot(e,n,i,c,t,o){const u=e.getAttribute("class")||"",p=e.getAttribute("style")||"",_=o!==void 0?` data-proposal-section-index="${mt(o)}"`:"";return`<table class="${mt(u)}"${_} style="${mt(p)}">`+i+`<tbody>${n.join("")}</tbody>`+(t?c:"")+"</table>"}function Rt(e,n=kt()){const i=Array.from(e.querySelectorAll("style")).map(r=>r.outerHTML).join(`
`),c=[];let t=[],o=0;const u=Math.max(1,n-K),p=()=>{t.length!==0&&(c.push((i?i+`
`:"")+t.join("")),t=[],o=0)},_=(r,N)=>{t.push(r),o+=N},H=(r,N,q,g)=>{const A=N.querySelector("thead"),Q=N.querySelector("tfoot"),O=Array.from(N.querySelectorAll("tbody > tr")),D=A?A.outerHTML:"",x=Q?Q.outerHTML:"",j=q?B(q.outerHTML,g):"";if(O.length===0){const b=Ot(N,[],D,x,!0,g),M=j+b,z=Y(e,M);o>0&&o+z>u+K&&p(),_(M,z);return}let T=0,a=!0;for(;T<O.length;){const b=[];for(;T<O.length;){const V=O[T],wt=[...b,V.outerHTML],ot=T===O.length-1,Z=Ot(N,wt,D,x,ot,g),rt=a?j+Z:Z,L=Y(e,rt);if(o+L<=u+K){b.push(V.outerHTML),T++;continue}if(b.length>0)break;if(t.length>0&&o>0){p();continue}const P=V.cloneNode(!0);P.classList.add("proposal-oversized-row"),b.push(P.outerHTML),T++;break}if(b.length===0)break;const M=T>=O.length,z=Ot(N,b,D,x,M,g),G=a?j+z:z,f=Y(e,G);o>0&&o+f>u+K&&p(),_(G,f),a=!1,M||p()}},y=(r,N)=>{const g=r.getAttribute("data-proposal-section-index")??N,A=r.tagName.toLowerCase();if(A==="style"||A==="script")return;if(ze(r)){p();const x=oe(r);if(x){const a=re(r,x);H(r,x,a,g);const b=Array.from(r.children),M=b.indexOf(x);for(let z=M+1;z<b.length;z++)y(b[z],g);return}const j=B(r.outerHTML,g),T=Nt(r);_(j,T),p();return}if(Ce(r)){t.length>0&&p();const x=B(r.outerHTML,g);t.push(x),o=Nt(r),p();return}if(A==="table"){H(r,r,null,g);return}const Q=oe(r);if(Q){const x=Array.from(r.children),j=x.indexOf(Q),T=re(r,Q),a=T?x.indexOf(T):j;for(let b=0;b<Math.max(0,a);b++)y(x[b],g);H(r,Q,T,g);for(let b=j+1;b<x.length;b++)y(x[b],g);return}if((A==="ul"||A==="ol")&&r.children.length>0){const x=r.getAttribute("class")||"",j=r.getAttribute("style")||"",T=Array.from(r.children);let a=[];const b=()=>{if(a.length===0)return;const M=`<${A} class="${mt(x)}" style="${mt(j)}">`+a.join("")+`</${A}>`,z=Y(e,M);_(B(M,g),z),a=[]};for(let M=0;M<T.length;M++){const z=T[M],G=[...a,B(z.outerHTML,g)],f=`<${A}>${G.join("")}</${A}>`,V=Y(e,f);if(o+V>u+K){if(a.length>0&&(b(),p()),Y(e,`<${A}>${B(z.outerHTML,g)}</${A}>`)<=u+K){a.push(B(z.outerHTML,g));continue}const ot=se(z,e,u,g);ot.forEach((Z,rt)=>{t.length>0&&o>0&&p();const L=Y(e,Z);_(Z,L),rt<ot.length-1&&p()});continue}a.push(B(z.outerHTML,g))}b();return}if(Se(r)){const x=Nt(r);if(o+x<=u+K){_(B(r.outerHTML,g),x);return}const j=Array.from(r.children);if(j.length>0){j.forEach(T=>y(T,g));return}}const O=Nt(r);if(o+O<=u+K){_(B(r.outerHTML,g),O);return}if(t.length>0&&p(),O<=u+K){_(B(r.outerHTML,g),O);return}const D=se(r,e,u,g);D.forEach((x,j)=>{t.length>0&&o>0&&p();const T=Y(e,x);_(x,T),j<D.length-1&&p()})};return Array.from(e.children).forEach(r=>{y(r)}),t.length>0&&p(),c.length>0?c:[e.innerHTML]}const w=e=>(Number(e)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),it=(e,n=10)=>{const c=e.replace(/<[^>]*>/g,"").length;return c>18?"7.5px":c>15?"8.5px":c>12?"9.5px":`${n}px`},Ht=ge.memo(({children:e,content:n,backgroundImage:i,defaultBg:c,templateColor:t=le,headerLogo:o,headerLogoAlign:u="right",pageKey:p,className:_="",customHtml:H=!1})=>{const y=i&&String(i).trim()!==""?i:c,r=y?Jt(y):"",N=o?Jt(o):"",q=()=>{const g=u||"right";return g==="left"?{top:"8mm",left:"15mm",right:"auto",justifyContent:"flex-start",maxHeight:"20mm",maxWidth:"60mm"}:g==="center"||g==="middle"?{top:"8mm",left:"50%",right:"auto",transform:"translateX(-50%)",justifyContent:"center",maxHeight:"20mm",maxWidth:"60mm"}:{top:"8mm",right:"15mm",left:"auto",justifyContent:"flex-end",maxHeight:"20mm",maxWidth:"60mm"}};return m.jsxs("div",{style:{width:"210mm",...H?{minHeight:"297mm",boxSizing:"border-box"}:{height:"297mm",minHeight:"297mm",maxHeight:"297mm",boxSizing:"border-box",overflow:"hidden"},pageBreakAfter:"always",breakAfter:"page",pageBreakInside:"avoid",breakInside:"avoid-page",fontFamily:'"Open Sans", sans-serif',"--template-color":t},className:ct("proposal-preview-sheet proposal-cover__sheet bg-white text-slate-900 w-[210mm] max-w-full shadow-2xl rounded-sm text-sm border border-slate-300 dark:border-slate-800 shrink-0 relative",!H&&"h-[297mm] overflow-hidden",_),children:[r&&m.jsx("div",{className:"absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden",children:m.jsx("img",{src:r,alt:"Page Background",className:"w-full h-full object-fill block"})}),N&&m.jsx("div",{className:"absolute z-20 pointer-events-none flex items-center",style:q(),children:m.jsx("img",{src:N,alt:"Header Logo",className:"max-h-[16mm] max-w-[55mm] object-contain"})}),m.jsx("div",{className:ct(!H&&"proposal-page__body",H&&"w-full h-full p-0 m-0"),style:{position:"relative",zIndex:1,...H?{padding:0,margin:0,width:"100%",minHeight:"297mm",boxSizing:"border-box",display:"block"}:{padding:"32mm 15mm 20mm",height:"calc(297mm - 52mm)",minHeight:"calc(297mm - 52mm)",maxHeight:"calc(297mm - 52mm)",boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"flex-start"}},children:e||(n?m.jsx("div",{className:ct(!H&&ct("html-preview-container flex-1 flex flex-col",ae),H&&"w-full h-full"),style:H?{width:"100%",height:"100%"}:{display:"flex",flexDirection:"column",flex:1,width:"100%"},dangerouslySetInnerHTML:{__html:It(n)}}):null)})]},p)});Ht.displayName="ProposalPreviewSheet";function Ue({isOpen:e,open:n,onClose:i,onOpenChange:c,formData:t,sections:o=[],customers:u=[],availableProducts:p=[],proposalSetting:_,totals:H,other_details:y,title:r,pageTitle:N,content:q,backgroundImage:g,settings:A,isDefaultPageSetup:Q,showPrintButton:O=!0,customHtml:D=!1,inline:x=!1,autoPrint:j=!1,hideHeaderBar:T=!1}){var Wt;const{t:a}=_e(),b=((Wt=xe())==null?void 0:Wt.props)||{},M=!!(e??n);E.useEffect(()=>{var C;const s=(t==null?void 0:t.subject)||r||N||"",h=(t==null?void 0:t.customer_name)||(u&&u.length>0?(C=u[0])==null?void 0:C.name:"")||"",v=[s,h].filter(Boolean),l=v.length>0?v.join("_"):t!=null&&t.proposal_number?String(t.proposal_number):r||"";if(x&&l&&(document.title=l),x&&j){const $=setTimeout(()=>{l&&(document.title=l),window.onafterprint=()=>{window.close()},window.print()},600);return()=>clearTimeout($)}},[x,j,t,u,r,N]);const z=E.useCallback(()=>{i&&i(),c&&c(!1)},[i,c]);E.useRef(null);const G=E.useRef(null),f=E.useMemo(()=>A||_||(b==null?void 0:b.proposalSetting)||(b==null?void 0:b.quotationSetting)||{},[A,_,b]),V=(f==null?void 0:f.template_color)||le,wt=(f==null?void 0:f.show_logo)!==void 0?f.show_logo==="1"||f.show_logo===!0||f.show_logo===1||f.show_logo==="true":!0,ot=(f==null?void 0:f.logo_image)||(f==null?void 0:f.company_logo)||"",Z=wt&&ot?ot:"",rt=(f==null?void 0:f.header_logo_align)||"right",L=(f==null?void 0:f.background_image)||"",P=!t&&(q!==void 0||r!==void 0||N!==void 0),_t=!!(D||P&&q&&ee(q)),st=E.useMemo(()=>{if(!P)return"";const s=(q||"").trim();if(!s&&(g||L))return"&nbsp;";if(!s)return"";const h=Dt(q,{settings:f,isDefaultPageSetup:Q??!0});return It(h)},[P,q,g,L,f,Q]),[Ft,ut]=E.useState([]),[qt,zt]=E.useState([]),[de,Ct]=E.useState([]),[ce,Gt]=E.useState([]);E.useEffect(()=>{if(!P)return;if(!st){ut([]);return}const s=()=>{if(_t){if(/class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(st)&&G.current){const C=Rt(G.current,kt());ut(C)}else ut([st]);return}if(G.current){const l=Rt(G.current,kt());ut(l)}else ut([st])};let h=!1;return(async()=>{var l;(l=document.fonts)!=null&&l.ready&&await document.fonts.ready,h||s()})(),()=>{h=!0}},[P,st,M,x,_t]);const St=E.useCallback(s=>{var h;if(s.product_name)return s.product_name;if(s.name)return s.name;if((h=s.product)!=null&&h.name)return s.product.name;if(s.product_id&&p.length>0){const v=p.find(l=>String(l.id)===String(s.product_id));if(v!=null&&v.name)return v.name}return s.product_description||s.description||a("Item / Service")},[p,a]),jt=E.useCallback(s=>{var h;if(s.description)return s.description;if(s.product_description)return s.product_description;if((h=s.product)!=null&&h.description)return s.product.description;if(s.product_id&&p.length>0){const v=p.find(l=>String(l.id)===String(s.product_id));if(v!=null&&v.description)return v.description}return""},[p]),Mt=E.useCallback(s=>{var h,v,l,C;if(s.unit_name)return s.unit_name;if(s.unit&&isNaN(Number(s.unit)))return s.unit;if((v=(h=s.product)==null?void 0:h.unit_relation)!=null&&v.unit_name)return s.product.unit_relation.unit_name;if((l=s.product)!=null&&l.unit_name)return s.product.unit_name;if((C=s.product)!=null&&C.unit&&isNaN(Number(s.product.unit)))return s.product.unit;if(s.product_id&&p.length>0){const $=p.find(k=>String(k.id)===String(s.product_id));if($!=null&&$.unit_name)return $.unit_name;if($!=null&&$.unit&&isNaN(Number($.unit)))return $.unit}return""},[p]),ht=E.useMemo(()=>(t==null?void 0:t.customer_mode)==="new"||(t==null?void 0:t.customer_type)==="new"||!(t!=null&&t.customer_id)&&!!(t!=null&&t.customer_name||t!=null&&t.customer_email)?{id:0,name:(t==null?void 0:t.customer_name)||"",email:(t==null?void 0:t.customer_email)||"",mobile_no:(t==null?void 0:t.customer_phone)||"",phone:(t==null?void 0:t.customer_phone)||"",address:(t==null?void 0:t.customer_address)||"",type:(t==null?void 0:t.customer_type)||"Individual"}:u.find(h=>String(h.id)===String(t==null?void 0:t.customer_id))||(t!=null&&t.customer_name?{id:Number(t==null?void 0:t.customer_id)||0,name:(t==null?void 0:t.customer_name)||"",email:(t==null?void 0:t.customer_email)||"",mobile_no:(t==null?void 0:t.customer_phone)||"",phone:(t==null?void 0:t.customer_phone)||"",address:(t==null?void 0:t.customer_address)||"",type:(t==null?void 0:t.customer_type)||"Individual"}:void 0),[u,t==null?void 0:t.customer_id,t==null?void 0:t.customer_mode,t==null?void 0:t.customer_type,t==null?void 0:t.customer_name,t==null?void 0:t.customer_email,t==null?void 0:t.customer_phone,t==null?void 0:t.customer_address]),gt=E.useMemo(()=>{if(P||!t)return"";const s=t.items||[],h=s.filter(d=>(d.section==="otc"||d.section==="general"||!d.section)&&(Number(d.product_id)>0||Number(d.unit_price)>0||!!d.product_description||!!d.description)),v=s.filter(d=>d.section==="mrc"&&(Number(d.product_id)>0||Number(d.unit_price)>0||!!d.product_description||!!d.description)),l=h.reduce((d,S)=>d+Number(S.quantity??1)*Number(S.unit_price||0),0),C=h.reduce((d,S)=>d+Number(S.discount_amount||0),0);let $=C;if(C===0&&Number(t.otc_discount_value)>0){const d=Number(t.otc_discount_value)||0;t.otc_discount_type==="percentage"?$=l*Math.min(Math.max(d,0),100)/100:$=Math.min(Math.max(d,0),l)}const k=h.reduce((d,S)=>d+Number(S.tax_amount||0),0),U=Math.max(0,l-$+k),R=v.reduce((d,S)=>d+Number(S.quantity??1)*Number(S.unit_price||0),0),W=v.reduce((d,S)=>d+Number(S.discount_amount||0),0);let tt=W;if(W===0&&Number(t.mrc_discount_value)>0){const d=Number(t.mrc_discount_value)||0;t.mrc_discount_type==="percentage"?tt=R*Math.min(Math.max(d,0),100)/100:tt=Math.min(Math.max(d,0),R)}const pt=v.reduce((d,S)=>d+Number(S.tax_amount||0),0),Xt=Math.max(0,R-tt+pt),xt=[];o.forEach((d,S)=>{const bt=(d.content||"").trim(),Et=(d.page_type||"").toLowerCase(),Kt=Et==="otc"||bt==="[OTC_CHARGES_TABLE]"||d.title&&d.title.toLowerCase().includes("one-time charges"),Qt=Et==="mrc"||bt==="[MRC_CHARGES_TABLE]"||d.title&&d.title.toLowerCase().includes("monthly recurring charges"),Yt=Et==="other-details"||bt==="[OTHER_DETAILS_CONTENT]"||d.title&&d.title.toLowerCase().includes("other details");if(Kt){if(h.length===0)return;const et=d.title||a("ONE-TIME CHARGES (OTC)");let lt="";h.forEach((I,F)=>{const vt=Number(I.quantity??1);Mt(I);const ft=Number(I.unit_price)||0,$t=I.total_amount!==void 0?Number(I.total_amount):vt*ft,At=jt(I),Tt=Number(I.tax_amount)||0,at=Number(I.discount_percentage)||0,X=Number(I.discount_amount)||0,J=I.discount_type||"percentage";let nt="-";J==="percentage"&&at>0?nt=`<div>${at}%</div>${X>0?`<div style="font-size: 9px; color: #64748b;">(৳${w(X)})</div>`:""}`:J==="fixed"&&X>0?nt=`৳${w(X)}`:at>0?nt=`<div>${at}%</div>`:X>0&&(nt=`৳${w(X)}`),lt+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${F+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${St(I)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${At||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${vt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${w(ft)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${nt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${Tt>0?w(Tt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${w($t)}</td>
                        </tr>
                    `}),xt.push(`
                    <div class="proposal-section-block otc-charges-block" data-proposal-section-index="${S}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${et}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${V}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${a("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 15%; padding: 7.5px 8px !important;">${a("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 28%; padding: 7.5px 8px !important;">${a("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 6%; white-space: nowrap; padding: 7.5px 4px !important;">${a("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 9%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Discount")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lt}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: ${it(w(l),10)}; padding: 6px 8px !important;">${w(l)}</td>
                                </tr>
                                ${$>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: ${it(`(-) ${w($)}`,10)}; padding: 6px 8px !important;">(-) ${w($)}</td>
                                </tr>`:""}
                                ${k>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: ${it(`(+) ${w(k)}`,10)}; padding: 6px 8px !important;">(+) ${w(k)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${a("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: ${it(`${w(U)} BDT`,10)}; padding: 7px 8px !important;">${w(U)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(Qt){if(v.length===0)return;const et=d.title||a("MONTHLY RECURRING CHARGES (MRC)");let lt="";v.forEach((F,vt)=>{const ft=Number(F.quantity??1);Mt(F);const $t=Number(F.unit_price)||0,At=F.total_amount!==void 0?Number(F.total_amount):ft*$t,Tt=jt(F),at=Number(F.tax_amount)||0,X=Number(F.discount_percentage)||0,J=Number(F.discount_amount)||0,nt=F.discount_type||"percentage";let yt="-";nt==="percentage"&&X>0?yt=`<div>${X}%</div>${J>0?`<div style="font-size: 9px; color: #64748b;">(৳${w(J)})</div>`:""}`:nt==="fixed"&&J>0?yt=`৳${w(J)}`:X>0?yt=`<div>${X}%</div>`:J>0&&(yt=`৳${w(J)}`),lt+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${vt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${St(F)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${Tt||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${ft}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${w($t)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${yt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${at>0?w(at):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${w(At)}</td>
                        </tr>
                    `});const I=S===0?"":"margin-top: 2rem;";xt.push(`
                    <div class="proposal-section-block mrc-charges-block" data-proposal-section-index="${S}" style="margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm" style="${I}">${et}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${V}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${a("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 15%; padding: 7.5px 8px !important;">${a("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 28%; padding: 7.5px 8px !important;">${a("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 6%; white-space: nowrap; padding: 7.5px 4px !important;">${a("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 9%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Discount")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lt}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: ${it(w(R),10)}; padding: 6px 8px !important;">${w(R)}</td>
                                </tr>
                                ${tt>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: ${it(`(-) ${w(tt)}`,10)}; padding: 6px 8px !important;">(-) ${w(tt)}</td>
                                </tr>`:""}
                                ${pt>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: ${it(`(+) ${w(pt)}`,10)}; padding: 6px 8px !important;">(+) ${w(pt)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td colspan="2" class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${a("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: ${it(`${w(Xt)} BDT`,10)}; padding: 7px 8px !important;">${w(Xt)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(Yt){const et=t.other_details||y||"";if(!et)return;const lt=d.title||a("OTHER DETAILS");xt.push(`
                    <div class="proposal-section-block other-details-block" data-proposal-section-index="${S}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${lt}</div>
                        <div class="prose max-w-none text-xs leading-relaxed text-slate-700">
                            ${et}
                        </div>
                    </div>
                `);return}if(d.page_type==="custom"||!Kt&&!Qt&&!Yt){const et=d.background_image||"";(bt||et)&&xt.push(`
                        <div class="proposal-section-block custom-section-block page-break" data-full-page="true" data-proposal-section-index="${S}" style="min-height: 297mm; height: 100%;">
                            ${bt||"&nbsp;"}
                        </div>
                    `)}});const ue=xt.join(`

`),he=Dt(ue,{proposal:t,customer:ht,settings:f,isDefaultPageSetup:!1});return It(he)},[P,t,o,u,St,jt,Mt,a,V,f,y]);E.useEffect(()=>{if(P||!gt){zt(l=>l.length===0?l:[]),Ct(l=>l.length===0?l:[]);return}const s=()=>{if(G.current){const l=Rt(G.current,kt());zt(k=>k.length===l.length&&k.every((U,R)=>U===l[R])?k:l);const C=[],$=[];l.forEach(k=>{const U=k.match(/data-proposal-section-index=["'](\d+)["']/);if(U&&U[1]!==void 0){const R=parseInt(U[1],10),W=o[R];W!=null&&W.background_image&&W.background_image.trim()!==""?C.push(W.background_image):C.push(L);const tt=(W==null?void 0:W.content)||"",pt=ee(tt);$.push(pt);return}C.push(L),$.push(!1)}),Ct(k=>k.length===C.length&&k.every((U,R)=>U===C[R])?k:C),Gt(k=>k.length===$.length&&k.every((U,R)=>U===$[R])?k:$)}else zt(l=>l.length===1&&l[0]===gt?l:[gt]),Ct(l=>l.length===1&&l[0]===L?l:[L]),Gt(l=>l.length===1&&l[0]===!1?l:[!1])};let h=!1;return(async()=>{var l;(l=document.fonts)!=null&&l.ready&&await document.fonts.ready,h||s()})(),()=>{h=!0}},[P,gt,o,L,M,x]);const me=E.useCallback(()=>{const s=(t==null?void 0:t.subject)||r||N||"",h=(ht==null?void 0:ht.name)||(t==null?void 0:t.customer_name)||"",v=[s,h].filter(Boolean),l=v.length>0?v.join("_"):t!=null&&t.proposal_number?String(t.proposal_number):document.title,C=document.title;l&&(document.title=l),window.print(),setTimeout(()=>{document.title=C},1e3)},[t,ht,r,N]),Vt=r||N||(t==null?void 0:t.subject)||a("Preview"),Ut=()=>m.jsx("div",{className:"flex flex-col gap-6 items-center w-full print:gap-0 print:block",children:P?Ft.length>0?Ft.map((s,h)=>m.jsx(Ht,{pageKey:`single-page-${h}`,backgroundImage:g,defaultBg:L,templateColor:V,headerLogo:Z,headerLogoAlign:rt,content:s,customHtml:_t},`single-page-${h}`)):m.jsx(Ht,{pageKey:"single-page-0",backgroundImage:g,defaultBg:L,templateColor:V,headerLogo:Z,headerLogoAlign:rt,content:st,customHtml:_t},"single-page-0"):qt.length>0?qt.map((s,h)=>m.jsx(Ht,{pageKey:`proposal-page-${h}`,backgroundImage:de[h]||L,defaultBg:L,templateColor:V,headerLogo:Z,headerLogoAlign:rt,content:s,customHtml:!!ce[h]},`proposal-page-${h}`)):m.jsx("div",{className:"p-8 text-center text-slate-500",children:a("No pages configured in Page Order.")})});return m.jsxs(m.Fragment,{children:[m.jsx("div",{ref:G,className:ct("html-preview-container",ae),style:{position:"fixed",left:"-9999px",top:0,width:"180mm",visibility:"hidden",pointerEvents:"none",zIndex:-1},dangerouslySetInnerHTML:{__html:P?st:gt}}),x?m.jsxs("div",{className:ct("min-h-screen bg-slate-100 dark:bg-slate-950 px-4 print:p-0 print:bg-white flex flex-col items-center",T?"py-0":"py-8"),children:[!T&&m.jsxs("div",{className:"w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 print:hidden",children:[m.jsxs("div",{className:"flex items-center gap-3",children:[m.jsx("div",{className:"p-2 rounded-lg bg-primary/10 text-primary",children:m.jsx(ve,{className:"h-5 w-5"})}),m.jsxs("div",{children:[m.jsx("h1",{className:"font-bold text-slate-900 dark:text-slate-100 text-base",children:(t==null?void 0:t.proposal_number)||Vt}),(t==null?void 0:t.subject)&&m.jsx("p",{className:"text-xs text-slate-500",children:t.subject})]})]}),m.jsx("div",{className:"flex items-center gap-2",children:m.jsxs(Zt,{variant:"default",size:"sm",onClick:()=>window.print(),className:"gap-2",children:[m.jsx(te,{className:"h-4 w-4"}),a("Print / Save PDF")]})})]}),m.jsxs("div",{className:"w-full flex justify-center",children:[m.jsx("style",{dangerouslySetInnerHTML:{__html:ne}}),Ut()]})]}):m.jsx(be,{open:M,onOpenChange:s=>!s&&z(),children:m.jsxs(fe,{className:"max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-xl !rounded-md [&>div]:p-0 [&>div]:max-h-[92vh] [&>div]:flex [&>div]:flex-col [&>button]:top-2.5 [&>button]:right-3",children:[m.jsxs(ye,{className:"!py-3 !px-5 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0",children:[m.jsxs("div",{className:"flex items-center gap-2.5 pr-8",children:[m.jsx("div",{className:"p-1.5 rounded-md bg-primary/10 text-primary",children:m.jsx($e,{className:"h-4 w-4"})}),m.jsx(we,{className:"text-sm font-semibold",children:Vt})]}),O&&m.jsx("div",{className:"flex items-center gap-2 pr-6",children:m.jsxs(Zt,{variant:"default",size:"sm",onClick:me,className:"gap-2 text-xs h-8",children:[m.jsx(te,{className:"h-3.5 w-3.5"}),a("Print")]})})]}),m.jsxs("div",{className:"flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-900 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent",children:[m.jsx("style",{dangerouslySetInnerHTML:{__html:ne}}),Ut()]})]})})]})}export{Ue as P,It as s};
