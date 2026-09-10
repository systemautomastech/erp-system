import{r as j,j as c,R as le}from"./ui-Ce3CDfXD.js";import{X as ae}from"./app-BmqSHkUs.js";import{D as pe,a as de,b as ce,c as me}from"./dialog-CVzLu5Nz.js";import{B as Gt}from"./button-7g9Z4Qd-.js";import{b as Vt}from"./helpers-DLBGREVn.js";import{r as Ut}from"./proposalShortcodes-Bfi3tUlJ.js";import{c as ot}from"./utils-DqweA7RH.js";import{u as ue}from"./useTranslation-D6d5htpm.js";import{F as he}from"./file-text-C4FbO-e6.js";import{P as Wt}from"./printer-CFcf6qY_.js";import{E as ge}from"./eye-CAIOaxjB.js";const Dt="#E9591C",te="html-preview-container";function Xt(e){return e?/<style|<link\s+rel|<!doctype|<html|<head|<svg|position:\s*absolute|297mm|210mm/i.test(e):!1}function ee(e,n){let r=e.replace(/@(media|supports)\b[^{]*\{([\s\S]*?\})\s*\}/gi,(d,t,o)=>{const u=d.slice(0,d.indexOf("{")+1),p=ee(o,n);return`${u}
${p}
}`});return r=r.replace(/([^{}@]+)\{([^}]+)\}/g,(d,t,o)=>{const u=t.trim();return u.startsWith("@")?d:`${u.split(",").map(k=>{let y=k.trim();return y?/^(html|body|:root)$/i.test(y)?n:/^(html|body|:root)[\s>+~]/i.test(y)?y.replace(/^(html|body|:root)([\s>+~])/i,`${n}$2`):y.startsWith(n)?y:`${n} ${y}`:""}).filter(Boolean).join(", ")} {${o}}`}),r}function Et(e,n=".proposal-preview-sheet"){if(!e)return"";let r=e;return r=r.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"").replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi,""),r=r.replace(/<link\b[^>]*>/gi,""),r=r.replace(/<!doctype[^>]*>/gi,"").replace(/<\/?(html|head|meta|title)\b[^>]*>/gi,""),r=r.replace(/<body\b([^>]*)>/gi,'<div class="proposal-body-wrapper" $1>'),r=r.replace(/<\/body>/gi,"</div>"),r=r.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(d,t,o)=>{const u=ee(o,n);return`<style${t}>${u}</style>`}),r}const xe=210,zt=297,Ct=32,jt=30,be=15,Kt=`
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
`;function rt(e){if(typeof document>"u")return e*3.7795275591;const n=document.createElement("div");n.style.cssText=`
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
    `,document.body.appendChild(n);const r=n.getBoundingClientRect().width;return n.remove(),r||e*3.7795275591}function xt(){if(typeof document>"u")return rt(zt)-rt(Ct)-rt(jt);const e=document.createElement("div");e.style.cssText=`
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        left: -10000px;
        top: -10000px;

        width: ${xe}mm;
        height: ${zt}mm;

        box-sizing: border-box;

        padding:
            ${Ct}mm
            ${be}mm
            ${jt}mm;

        display: flex;
        flex-direction: column;

        margin: 0;
        border: 0;
    `;const n=document.createElement("div");n.style.cssText=`
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        box-sizing: border-box;
    `,e.appendChild(n),document.body.appendChild(e);const r=n.getBoundingClientRect().height;return e.remove(),r||rt(zt)-rt(Ct)-rt(jt)}const W=1;function fe(e){if(typeof window>"u")return 0;const n=window.getComputedStyle(e);return(parseFloat(n.marginTop)||0)+(parseFloat(n.marginBottom)||0)}function ye(e){const n=e.getBoundingClientRect();return n.height>0?n.height:e.offsetHeight||0}function gt(e){return ye(e)+fe(e)}function R(e,n){return n===void 0||/data-proposal-section-index=/.test(e)?e:e.replace(/^<(\w+)(\s|>)/,`<$1 data-proposal-section-index="${it(n)}"$2`)}function it(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function we(e){var n,r,d,t,o;return((n=e.classList)==null?void 0:n.contains("page-break"))||((r=e.style)==null?void 0:r.pageBreakAfter)==="always"||((d=e.style)==null?void 0:d.pageBreakBefore)==="always"||((t=e.style)==null?void 0:t.breakAfter)==="page"||((o=e.style)==null?void 0:o.breakBefore)==="page"}function _e(e){var n,r,d,t,o;return e.hasAttribute("data-full-page")||((n=e.classList)==null?void 0:n.contains("cover-page-wrapper"))||((d=(r=e.style)==null?void 0:r.height)==null?void 0:d.includes("297mm"))||((o=(t=e.style)==null?void 0:t.minHeight)==null?void 0:o.includes("297mm"))}function ve(e){const n=e.tagName.toLowerCase();return(n==="div"||n==="section"||n==="article"||n==="main")&&e.children.length>0&&!e.classList.contains("page-break")}function K(e,n){const r=document.createElement("div");r.style.cssText=`
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
    `,r.innerHTML=n,e.appendChild(r);const d=r.getBoundingClientRect().height,t=r.scrollHeight;return r.remove(),Math.max(d,t,0)}function Qt(e,n){const r=e.cloneNode(!1);return n.forEach(d=>{r.appendChild(d.cloneNode(!0))}),r.outerHTML}function Yt(e){const n=Array.from(e.children).find(r=>r.tagName.toLowerCase()==="table");return n||null}function Zt(e,n){const r=Array.from(e.children),d=r.indexOf(n);if(d<=0)return null;const t=r[d-1];if(!t)return null;const o=t.tagName.toLowerCase();return o==="div"||o==="h1"||o==="h2"||o==="h3"||o==="h4"||o==="h5"||o==="h6"||o==="p"?t:null}function Te(e,n,r){const d=Array.from(e.childNodes);if(d.length!==1)return null;const t=d[0];if(t.nodeType!==Node.TEXT_NODE)return null;const o=t.textContent||"";if(!o.trim())return null;const u=o.split(/(\s+)/);if(u.length<=1)return null;const p=[];let w="";const k=y=>{const i=e.cloneNode(!1);return i.textContent=y,K(n,i.outerHTML)<=r+W};for(const y of u){const i=w+y;w.trim()&&!k(i)?(p.push(w.trim()),w=y):w=i}return w.trim()&&p.push(w.trim()),p.length<=1?null:p.map(y=>{const i=e.cloneNode(!1);return i.textContent=y,i.outerHTML})}function $e(e,n,r){const d=Array.from(e.childNodes);if(d.length<=1)return null;const t=[];let o=[];const u=()=>{o.length!==0&&(t.push(Qt(e,o)),o=[])};for(const p of d){const w=[...o,p],k=Qt(e,w),y=K(n,k);o.length>0&&y>r+W?(u(),o=[p]):o.push(p)}return u(),t.length>1?t:null}function Jt(e,n,r,d){const t=$e(e,n,r);if(t&&t.length>1)return t.map(p=>R(p,d));const o=Te(e,n,r);if(o&&o.length>1)return o.map(p=>R(p,d));const u=e.cloneNode(!0);return u.classList.add("proposal-pagination-splittable"),[R(u.outerHTML,d)]}function Mt(e,n,r,d,t,o){const u=e.getAttribute("class")||"",p=e.getAttribute("style")||"",w=o!==void 0?` data-proposal-section-index="${it(o)}"`:"";return`<table class="${it(u)}"${w} style="${it(p)}">`+r+`<tbody>${n.join("")}</tbody>`+(t?d:"")+"</table>"}function St(e,n=xt()){const r=Array.from(e.querySelectorAll("style")).map(i=>i.outerHTML).join(`
`),d=[];let t=[],o=0;const u=Math.max(1,n-W),p=()=>{t.length!==0&&(d.push((r?r+`
`:"")+t.join("")),t=[],o=0)},w=(i,N)=>{t.push(i),o+=N},k=(i,N,q,h)=>{const M=N.querySelector("thead"),X=N.querySelector("tfoot"),I=Array.from(N.querySelectorAll("tbody > tr")),Y=M?M.outerHTML:"",x=X?X.outerHTML:"",z=q?R(q.outerHTML,h):"";if(I.length===0){const b=Mt(N,[],Y,x,!0,h),C=z+b,H=K(e,C);o>0&&o+H>u+W&&p(),w(C,H);return}let v=0,a=!0;for(;v<I.length;){const b=[];for(;v<I.length;){const V=I[v],ut=[...b,V.outerHTML],J=v===I.length-1,Q=Mt(N,ut,Y,x,J,h),D=a?z+Q:Q,L=K(e,D);if(o+L<=u+W){b.push(V.outerHTML),v++;continue}if(b.length>0)break;if(t.length>0&&o>0){p();continue}const A=V.cloneNode(!0);A.classList.add("proposal-oversized-row"),b.push(A.outerHTML),v++;break}if(b.length===0)break;const C=v>=I.length,H=Mt(N,b,Y,x,C,h),G=a?z+H:H,f=K(e,G);o>0&&o+f>u+W&&p(),w(G,f),a=!1,C||p()}},y=(i,N)=>{const h=i.getAttribute("data-proposal-section-index")??N,M=i.tagName.toLowerCase();if(M==="style"||M==="script")return;if(we(i)){p();const x=Yt(i);if(x){const a=Zt(i,x);k(i,x,a,h);const b=Array.from(i.children),C=b.indexOf(x);for(let H=C+1;H<b.length;H++)y(b[H],h);return}const z=R(i.outerHTML,h),v=gt(i);w(z,v),p();return}if(_e(i)){t.length>0&&p();const x=R(i.outerHTML,h);t.push(x),o=gt(i),p();return}if(M==="table"){k(i,i,null,h);return}const X=Yt(i);if(X){const x=Array.from(i.children),z=x.indexOf(X),v=Zt(i,X),a=v?x.indexOf(v):z;for(let b=0;b<Math.max(0,a);b++)y(x[b],h);k(i,X,v,h);for(let b=z+1;b<x.length;b++)y(x[b],h);return}if((M==="ul"||M==="ol")&&i.children.length>0){const x=i.getAttribute("class")||"",z=i.getAttribute("style")||"",v=Array.from(i.children);let a=[];const b=()=>{if(a.length===0)return;const C=`<${M} class="${it(x)}" style="${it(z)}">`+a.join("")+`</${M}>`,H=K(e,C);w(R(C,h),H),a=[]};for(let C=0;C<v.length;C++){const H=v[C],G=[...a,R(H.outerHTML,h)],f=`<${M}>${G.join("")}</${M}>`,V=K(e,f);if(o+V>u+W){if(a.length>0&&(b(),p()),K(e,`<${M}>${R(H.outerHTML,h)}</${M}>`)<=u+W){a.push(R(H.outerHTML,h));continue}const J=Jt(H,e,u,h);J.forEach((Q,D)=>{t.length>0&&o>0&&p();const L=K(e,Q);w(Q,L),D<J.length-1&&p()});continue}a.push(R(H.outerHTML,h))}b();return}if(ve(i)){const x=gt(i);if(o+x<=u+W){w(R(i.outerHTML,h),x);return}const z=Array.from(i.children);if(z.length>0){z.forEach(v=>y(v,h));return}}const I=gt(i);if(o+I<=u+W){w(R(i.outerHTML,h),I);return}if(t.length>0&&p(),I<=u+W){w(R(i.outerHTML,h),I);return}const Y=Jt(i,e,u,h);Y.forEach((x,z)=>{t.length>0&&o>0&&p();const v=K(e,x);w(x,v),z<Y.length-1&&p()})};return Array.from(e.children).forEach(i=>{y(i)}),t.length>0&&p(),d.length>0?d:[e.innerHTML]}const B=e=>(Number(e)||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),bt=le.memo(({children:e,content:n,backgroundImage:r,defaultBg:d,templateColor:t=Dt,headerLogo:o,headerLogoAlign:u="right",pageKey:p,className:w="",customHtml:k=!1})=>{const y=r&&String(r).trim()!==""?r:d,i=y?Vt(y):"",N=o?Vt(o):"",q=()=>{const h=u||"right";return h==="left"?{top:"8mm",left:"15mm",right:"auto",justifyContent:"flex-start",maxHeight:"20mm",maxWidth:"60mm"}:h==="center"||h==="middle"?{top:"8mm",left:"50%",right:"auto",transform:"translateX(-50%)",justifyContent:"center",maxHeight:"20mm",maxWidth:"60mm"}:{top:"8mm",right:"15mm",left:"auto",justifyContent:"flex-end",maxHeight:"20mm",maxWidth:"60mm"}};return c.jsxs("div",{style:{width:"210mm",...k?{minHeight:"297mm",boxSizing:"border-box"}:{height:"297mm",minHeight:"297mm",maxHeight:"297mm",boxSizing:"border-box",overflow:"hidden"},pageBreakAfter:"always",breakAfter:"page",pageBreakInside:"avoid",breakInside:"avoid-page",fontFamily:'"Open Sans", sans-serif',"--template-color":t},className:ot("proposal-preview-sheet proposal-cover__sheet bg-white text-slate-900 w-[210mm] max-w-full shadow-2xl rounded-sm text-sm border border-slate-300 dark:border-slate-800 shrink-0 relative",!k&&"h-[297mm] overflow-hidden",w),children:[i&&c.jsx("div",{className:"absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden",children:c.jsx("img",{src:i,alt:"Page Background",className:"w-full h-full object-fill block"})}),N&&c.jsx("div",{className:"absolute z-20 pointer-events-none flex items-center",style:q(),children:c.jsx("img",{src:N,alt:"Header Logo",className:"max-h-[16mm] max-w-[55mm] object-contain"})}),c.jsx("div",{className:ot(!k&&"proposal-page__body",k&&"w-full h-full p-0 m-0"),style:{position:"relative",zIndex:1,...k?{padding:0,margin:0,width:"100%",minHeight:"297mm",boxSizing:"border-box",display:"block"}:{padding:"32mm 15mm 20mm",height:"calc(297mm - 52mm)",minHeight:"calc(297mm - 52mm)",maxHeight:"calc(297mm - 52mm)",boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"flex-start"}},children:e||(n?c.jsx("div",{className:ot(!k&&ot("html-preview-container flex-1 flex flex-col",te),k&&"w-full h-full"),style:k?{width:"100%",height:"100%"}:{display:"flex",flexDirection:"column",flex:1,width:"100%"},dangerouslySetInnerHTML:{__html:Et(n)}}):null)})]},p)});bt.displayName="ProposalPreviewSheet";function Oe({isOpen:e,open:n,onClose:r,onOpenChange:d,formData:t,sections:o=[],customers:u=[],availableProducts:p=[],proposalSetting:w,totals:k,other_details:y,title:i,pageTitle:N,content:q,backgroundImage:h,settings:M,isDefaultPageSetup:X,showPrintButton:I=!0,customHtml:Y=!1,inline:x=!1,autoPrint:z=!1,hideHeaderBar:v=!1}){var Rt;const{t:a}=ue(),b=((Rt=ae())==null?void 0:Rt.props)||{},C=!!(e??n);j.useEffect(()=>{var T;const s=(t==null?void 0:t.subject)||i||N||"",g=(t==null?void 0:t.customer_name)||(u&&u.length>0?(T=u[0])==null?void 0:T.name:"")||"",_=[s,g].filter(Boolean),l=_.length>0?_.join("_"):t!=null&&t.proposal_number?String(t.proposal_number):i||"";if(x&&l&&(document.title=l),x&&z){const $=setTimeout(()=>{l&&(document.title=l),window.print()},600);return()=>clearTimeout($)}},[x,z,t,u,i,N]);const H=j.useCallback(()=>{r&&r(),d&&d(!1)},[r,d]);j.useRef(null);const G=j.useRef(null),f=j.useMemo(()=>M||w||(b==null?void 0:b.proposalSetting)||(b==null?void 0:b.quotationSetting)||{},[M,w,b]),V=(f==null?void 0:f.template_color)||Dt,ut=(f==null?void 0:f.show_logo)!==void 0?f.show_logo==="1"||f.show_logo===!0||f.show_logo===1||f.show_logo==="true":!0,J=(f==null?void 0:f.logo_image)||(f==null?void 0:f.company_logo)||"",Q=ut&&J?J:"",D=(f==null?void 0:f.header_logo_align)||"right",L=(f==null?void 0:f.background_image)||"",A=!t&&(q!==void 0||i!==void 0||N!==void 0),ht=!!(Y||A&&q&&Xt(q)),tt=j.useMemo(()=>{if(!A)return"";const s=(q||"").trim();if(!s&&(h||L))return"&nbsp;";if(!s)return"";const g=Ut(q,{settings:f,isDefaultPageSetup:X??!0});return Et(g)},[A,q,h,L,f,X]),[Lt,st]=j.useState([]),[At,ft]=j.useState([]),[ne,yt]=j.useState([]),[re,Pt]=j.useState([]);j.useEffect(()=>{if(!A)return;if(!tt){st([]);return}const s=()=>{if(ht){if(/class=["'][^"']*page-break[^"']*["']|style=["'][^"']*(?:page-break|break-after|break-before)[^"']*["']/i.test(tt)&&G.current){const T=St(G.current,xt());st(T)}else st([tt]);return}if(G.current){const l=St(G.current,xt());st(l)}else st([tt])};let g=!1;return(async()=>{var l;(l=document.fonts)!=null&&l.ready&&await document.fonts.ready,g||s()})(),()=>{g=!0}},[A,tt,C,x,ht]);const wt=j.useCallback(s=>{var g;if(s.product_name)return s.product_name;if(s.name)return s.name;if((g=s.product)!=null&&g.name)return s.product.name;if(s.product_id&&p.length>0){const _=p.find(l=>String(l.id)===String(s.product_id));if(_!=null&&_.name)return _.name}return s.product_description||s.description||a("Item / Service")},[p,a]),_t=j.useCallback(s=>{var g;if(s.product_description)return s.product_description;if(s.description)return s.description;if((g=s.product)!=null&&g.description)return s.product.description;if(s.product_id&&p.length>0){const _=p.find(l=>String(l.id)===String(s.product_id));if(_!=null&&_.description)return _.description}return""},[p]),vt=j.useCallback(s=>{var g,_,l,T;if(s.unit_name)return s.unit_name;if(s.unit&&isNaN(Number(s.unit)))return s.unit;if((_=(g=s.product)==null?void 0:g.unit_relation)!=null&&_.unit_name)return s.product.unit_relation.unit_name;if((l=s.product)!=null&&l.unit_name)return s.product.unit_name;if((T=s.product)!=null&&T.unit&&isNaN(Number(s.product.unit)))return s.product.unit;if(s.product_id&&p.length>0){const $=p.find(S=>String(S.id)===String(s.product_id));if($!=null&&$.unit_name)return $.unit_name;if($!=null&&$.unit&&isNaN(Number($.unit)))return $.unit}return""},[p]),lt=j.useMemo(()=>(t==null?void 0:t.customer_mode)==="new"?{id:0,name:(t==null?void 0:t.customer_name)||"",email:(t==null?void 0:t.customer_email)||"",mobile_no:(t==null?void 0:t.customer_phone)||"",phone:(t==null?void 0:t.customer_phone)||"",address:(t==null?void 0:t.customer_address)||"",type:(t==null?void 0:t.customer_type)||"Individual"}:u.find(s=>String(s.id)===String(t==null?void 0:t.customer_id)),[u,t==null?void 0:t.customer_id,t==null?void 0:t.customer_mode,t==null?void 0:t.customer_name,t==null?void 0:t.customer_email,t==null?void 0:t.customer_phone,t==null?void 0:t.customer_address]),at=j.useMemo(()=>{if(A||!t)return"";const s=t.items||[],g=s.filter(m=>(m.section==="otc"||m.section==="general"||!m.section)&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),_=s.filter(m=>m.section==="mrc"&&(Number(m.product_id)>0||Number(m.unit_price)>0||!!m.product_description)),l=g.reduce((m,O)=>m+Number(O.quantity??1)*Number(O.unit_price||0),0);let T=0;if(t.otc_discount_value>0){const m=Number(t.otc_discount_value)||0;t.otc_discount_type==="percentage"?T=l*Math.min(Math.max(m,0),100)/100:T=Math.min(Math.max(m,0),l)}const $=g.reduce((m,O)=>m+Number(O.tax_amount||0),0),S=Math.max(0,l-T+$),P=_.reduce((m,O)=>m+Number(O.quantity??1)*Number(O.unit_price||0),0);let F=0;if(t.mrc_discount_value>0){const m=Number(t.mrc_discount_value)||0;t.mrc_discount_type==="percentage"?F=P*Math.min(Math.max(m,0),100)/100:F=Math.min(Math.max(m,0),P)}const U=_.reduce((m,O)=>m+Number(O.tax_amount||0),0),Tt=Math.max(0,P-F+U),et=[];o.forEach((m,O)=>{const pt=(m.content||"").trim(),$t=(m.page_type||"").toLowerCase(),It=$t==="otc"||pt==="[OTC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("one-time charges"),Ft=$t==="mrc"||pt==="[MRC_CHARGES_TABLE]"||m.title&&m.title.toLowerCase().includes("monthly recurring charges"),qt=$t==="other-details"||pt==="[OTHER_DETAILS_CONTENT]"||m.title&&m.title.toLowerCase().includes("other details");if(It){if(g.length===0)return;const Z=m.title||a("ONE-TIME CHARGES (OTC)");let nt="";g.forEach((E,Nt)=>{const dt=Number(E.quantity??1);vt(E);const ct=Number(E.unit_price)||0,kt=E.total_amount!==void 0?Number(E.total_amount):dt*ct,Ht=_t(E),mt=Number(E.tax_amount)||0;nt+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${Nt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${wt(E)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${Ht||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${dt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${B(ct)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${mt>0?B(mt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${B(kt)}</td>
                        </tr>
                    `}),et.push(`
                    <div class="proposal-section-block otc-charges-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${Z}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${V}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${a("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${a("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${a("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${a("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${nt}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${B(l)}</td>
                                </tr>
                                ${T>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${B(T)}</td>
                                </tr>`:""}
                                ${$>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${B($)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${a("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${B(S)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(Ft){if(_.length===0)return;const Z=m.title||a("MONTHLY RECURRING CHARGES (MRC)");let nt="";_.forEach((E,Nt)=>{const dt=Number(E.quantity??1);vt(E);const ct=Number(E.unit_price)||0,kt=E.total_amount!==void 0?Number(E.total_amount):dt*ct,Ht=_t(E),mt=Number(E.tax_amount)||0;nt+=`
                        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
                            <td class="text-center font-medium border border-slate-200" style="font-size: 10px; padding: 6.5px 4px !important;">${Nt+1}</td>
                            <td class="font-semibold text-slate-900 border border-slate-200 align-top" style="font-size: 11px; padding: 6.5px 8px !important; line-height: 1.35;">${wt(E)}</td>
                            <td class="text-slate-600 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">
                                <div class="leading-normal break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-0.5 [&_li]:my-0.5 [&_li]:list-item [&_li_p]:inline [&_li_p]:m-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                                    ${Ht||"-"}
                                </div>
                            </td>
                            <td class="text-center border border-slate-200 align-top whitespace-nowrap" style="font-size: 10px; padding: 6.5px 4px !important;">${dt}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${B(ct)}</td>
                            <td class="text-right border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${mt>0?B(mt):"-"}</td>
                            <td class="text-right font-medium text-slate-900 border border-slate-200 align-top" style="font-size: 10px; padding: 6.5px 8px !important;">${B(kt)}</td>
                        </tr>
                    `}),et.push(`
                    <div class="proposal-section-block mrc-charges-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${Z}</div>
                        <table class="charges-table w-full text-xs mb-2 border-collapse border border-slate-300" style="font-size: 11px; width: 100%; table-layout: fixed;">
                            <thead>
                                <tr class="text-center font-semibold" style="background-color: ${V}; color: #ffffff;">
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 5%; white-space: nowrap; padding: 7.5px 4px !important;">${a("S/N")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 16%; padding: 7.5px 8px !important;">${a("Item / Service")}</th>
                                    <th class="border border-slate-300 text-white text-left" style="font-size: 10px; width: 33%; padding: 7.5px 8px !important;">${a("Description")}</th>
                                    <th class="border border-slate-300 text-white text-center" style="font-size: 10px; width: 7%; white-space: nowrap; padding: 7.5px 4px !important;">${a("Qty.")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 12%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Price (BDT)")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 14%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Tax / VAT")}</th>
                                    <th class="border border-slate-300 text-white text-right" style="font-size: 10px; width: 13%; white-space: nowrap; padding: 7.5px 8px !important;">${a("Total (BDT)")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${nt}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Subtotal")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">${B(P)}</td>
                                </tr>
                                ${F>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Discount")}:</td>
                                    <td class="text-right text-rose-600 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">-${B(F)}</td>
                                </tr>`:""}
                                ${U>0?`
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-medium text-slate-700 bg-slate-50 border border-slate-200 text-right" style="font-size: 10px; padding: 6px 8px !important;">${a("Tax / VAT")}:</td>
                                    <td class="text-right text-slate-900 font-semibold border border-slate-200" style="font-size: 10px; padding: 6px 8px !important;">+${B(U)}</td>
                                </tr>`:""}
                                <tr>
                                    <td colspan="5" class="border border-slate-200"></td>
                                    <td class="font-bold text-slate-900 border border-slate-200 text-right" style="font-size: 10px; padding: 7px 8px !important;">${a("Total")}:</td>
                                    <td class="text-right font-bold text-slate-900 border border-slate-200" style="font-size: 10px; padding: 7px 8px !important;">${B(Tt)} BDT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                `);return}if(qt){const Z=t.other_details||y||"";if(!Z)return;const nt=m.title||a("OTHER DETAILS");et.push(`
                    <div class="proposal-section-block other-details-block" data-proposal-section-index="${O}" style="margin-top: 1.5rem; margin-bottom: 1.25rem;">
                        <div class="font-bold mb-2 text-[#293240] text-sm">${nt}</div>
                        <div class="prose max-w-none text-xs leading-relaxed text-slate-700">
                            ${Z}
                        </div>
                    </div>
                `);return}if(m.page_type==="custom"||!It&&!Ft&&!qt){const Z=m.background_image||"";(pt||Z)&&et.push(`
                        <div class="proposal-section-block custom-section-block page-break" data-full-page="true" data-proposal-section-index="${O}" style="min-height: 297mm; height: 100%;">
                            ${pt||"&nbsp;"}
                        </div>
                    `)}});const ie=et.join(`

`),se=Ut(ie,{proposal:t,customer:lt,settings:f,isDefaultPageSetup:!1});return Et(se)},[A,t,o,u,wt,_t,vt,a,V,f,y]);j.useEffect(()=>{if(A||!at){ft(l=>l.length===0?l:[]),yt(l=>l.length===0?l:[]);return}const s=()=>{if(G.current){const l=St(G.current,xt());ft(S=>S.length===l.length&&S.every((P,F)=>P===l[F])?S:l);const T=[],$=[];l.forEach(S=>{const P=S.match(/data-proposal-section-index=["'](\d+)["']/);if(P&&P[1]!==void 0){const F=parseInt(P[1],10),U=o[F];U!=null&&U.background_image&&U.background_image.trim()!==""?T.push(U.background_image):T.push(L);const Tt=(U==null?void 0:U.content)||"",et=Xt(Tt);$.push(et);return}T.push(L),$.push(!1)}),yt(S=>S.length===T.length&&S.every((P,F)=>P===T[F])?S:T),Pt(S=>S.length===$.length&&S.every((P,F)=>P===$[F])?S:$)}else ft(l=>l.length===1&&l[0]===at?l:[at]),yt(l=>l.length===1&&l[0]===L?l:[L]),Pt(l=>l.length===1&&l[0]===!1?l:[!1])};let g=!1;return(async()=>{var l;(l=document.fonts)!=null&&l.ready&&await document.fonts.ready,g||s()})(),()=>{g=!0}},[A,at,o,L,C,x]);const oe=j.useCallback(()=>{const s=(t==null?void 0:t.subject)||i||N||"",g=(lt==null?void 0:lt.name)||(t==null?void 0:t.customer_name)||"",_=[s,g].filter(Boolean),l=_.length>0?_.join("_"):t!=null&&t.proposal_number?String(t.proposal_number):document.title,T=document.title;l&&(document.title=l),window.print(),setTimeout(()=>{document.title=T},1e3)},[t,lt,i,N]),Ot=i||N||(t==null?void 0:t.subject)||a("Preview"),Bt=()=>c.jsx("div",{className:"flex flex-col gap-6 items-center w-full print:gap-0 print:block",children:A?Lt.length>0?Lt.map((s,g)=>c.jsx(bt,{pageKey:`single-page-${g}`,backgroundImage:h,defaultBg:L,templateColor:V,headerLogo:Q,headerLogoAlign:D,content:s,customHtml:ht},`single-page-${g}`)):c.jsx(bt,{pageKey:"single-page-0",backgroundImage:h,defaultBg:L,templateColor:V,headerLogo:Q,headerLogoAlign:D,content:tt,customHtml:ht},"single-page-0"):At.length>0?At.map((s,g)=>c.jsx(bt,{pageKey:`proposal-page-${g}`,backgroundImage:ne[g]||L,defaultBg:L,templateColor:V,headerLogo:Q,headerLogoAlign:D,content:s,customHtml:!!re[g]},`proposal-page-${g}`)):c.jsx("div",{className:"p-8 text-center text-slate-500",children:a("No pages configured in Page Order.")})});return c.jsxs(c.Fragment,{children:[c.jsx("div",{ref:G,className:ot("html-preview-container",te),style:{position:"fixed",left:"-9999px",top:0,width:"180mm",visibility:"hidden",pointerEvents:"none",zIndex:-1},dangerouslySetInnerHTML:{__html:A?tt:at}}),x?c.jsxs("div",{className:ot("min-h-screen bg-slate-100 dark:bg-slate-950 px-4 print:p-0 print:bg-white flex flex-col items-center",v?"py-0":"py-8"),children:[!v&&c.jsxs("div",{className:"w-full max-w-[210mm] mb-6 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 print:hidden",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-2 rounded-lg bg-primary/10 text-primary",children:c.jsx(he,{className:"h-5 w-5"})}),c.jsxs("div",{children:[c.jsx("h1",{className:"font-bold text-slate-900 dark:text-slate-100 text-base",children:(t==null?void 0:t.proposal_number)||Ot}),(t==null?void 0:t.subject)&&c.jsx("p",{className:"text-xs text-slate-500",children:t.subject})]})]}),c.jsx("div",{className:"flex items-center gap-2",children:c.jsxs(Gt,{variant:"default",size:"sm",onClick:()=>window.print(),className:"gap-2",children:[c.jsx(Wt,{className:"h-4 w-4"}),a("Print / Save PDF")]})})]}),c.jsxs("div",{className:"w-full flex justify-center",children:[c.jsx("style",{dangerouslySetInnerHTML:{__html:Kt}}),Bt()]})]}):c.jsx(pe,{open:C,onOpenChange:s=>!s&&H(),children:c.jsxs(de,{className:"max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-xl !rounded-md [&>div]:p-0 [&>div]:max-h-[92vh] [&>div]:flex [&>div]:flex-col [&>button]:top-2.5 [&>button]:right-3",children:[c.jsxs(ce,{className:"!py-3 !px-5 bg-background border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0",children:[c.jsxs("div",{className:"flex items-center gap-2.5 pr-8",children:[c.jsx("div",{className:"p-1.5 rounded-md bg-primary/10 text-primary",children:c.jsx(ge,{className:"h-4 w-4"})}),c.jsx(me,{className:"text-sm font-semibold",children:Ot})]}),I&&c.jsx("div",{className:"flex items-center gap-2 pr-6",children:c.jsxs(Gt,{variant:"default",size:"sm",onClick:oe,className:"gap-2 text-xs h-8",children:[c.jsx(Wt,{className:"h-3.5 w-3.5"}),a("Print")]})})]}),c.jsxs("div",{className:"flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-900 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent",children:[c.jsx("style",{dangerouslySetInnerHTML:{__html:Kt}}),Bt()]})]})})]})}export{Oe as P,Et as s};
