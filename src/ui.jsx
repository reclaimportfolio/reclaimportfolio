import { useState, useEffect, useRef } from 'react';
import { Ico } from './icons.jsx';

/* ============ NETWORK SVG ============ */
export function NetGraphic({style}){
  return (
    <svg viewBox="0 0 600 400" style={style} fill="none">
      <g stroke="var(--accent-2)" strokeWidth="0.8" opacity="0.45">
        <path d="M60 90L210 60L340 140L470 70M210 60L260 220M340 140L470 220L530 320M260 220L120 300L300 360M260 220L420 290M470 220L420 290M120 300L60 90"/>
      </g>
      {[[60,90],[210,60],[340,140],[470,70],[260,220],[470,220],[530,320],[120,300],[300,360],[420,290]].map((p,i)=>(
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={i%3===0?4:2.6} fill="var(--accent)" opacity={i%3===0?0.9:0.55}/>
          {i%3===0 && <circle cx={p[0]} cy={p[1]} r="9" stroke="var(--accent)" strokeWidth="0.8" opacity="0.35"/>}
        </g>
      ))}
    </svg>
  );
}

/* ============ HOOKS ============ */
function useReveal(){
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const ob=new IntersectionObserver(([e])=>{ if(e.isIntersecting){el.classList.add('in');ob.unobserve(el);} },{threshold:0.12});
    ob.observe(el); return ()=>ob.disconnect();
  },[]);
  return ref;
}
export function Reveal({children,delay=0,as='div',className=''}){
  const ref=useReveal();
  const Tag=as;
  return <Tag ref={ref} className={'reveal '+className} style={{transitionDelay:delay+'ms'}}>{children}</Tag>;
}
export function Counter({to,suffix=''}){
  const [n,setN]=useState(0); const ref=useRef(null); const done=useRef(false);
  useEffect(()=>{
    const el=ref.current;
    const ob=new IntersectionObserver(([e])=>{
      if(e.isIntersecting && !done.current){
        done.current=true; const dur=1400,t0=performance.now();
        const tick=t=>{const p=Math.min((t-t0)/dur,1);setN(Math.floor((1-Math.pow(1-p,3))*to));if(p<1)requestAnimationFrame(tick);};
        requestAnimationFrame(tick);
      }
    },{threshold:0.5});
    ob.observe(el); return ()=>ob.disconnect();
  },[to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ============ SHARED UI ============ */
export function Btn({children,primary,onClick,sm,icon,type,disabled}){
  return <button type={type} disabled={disabled} className={'btn '+(primary?'btn-primary':'btn-ghost')+(sm?' btn-sm':'')} onClick={onClick}>
    {children}{icon&&<Ico name={icon}/>}
  </button>;
}
function badgeClass(s){
  const m={'Open':'b-open','Pending':'b-review','Pending Review':'b-review','Processing':'b-progress','Completed':'b-progress','Failed':'b-high','Cancelled':'b-closed','In Progress':'b-progress','Closed':'b-closed',
    'High':'b-high','Medium':'b-med','Low':'b-low','New':'b-open','Reviewing':'b-review','Converted':'b-progress',
    'Final':'b-progress','Draft':'b-review','Published':'b-progress','Verified':'b-progress','Denied':'b-high'};
  return m[s]||'b-closed';
}
export function Badge({s}){return <span className={'badge '+badgeClass(s)}>{s}</span>;}

/* ============ PAGE HEADER ============ */
export function PageHead({eyebrow,title,sub}){
  return (
    <div className="page-head">
      <div className="hero-glow" style={{opacity:.6}}/>
      <div className="wrap" style={{position:'relative',zIndex:2}}>
        <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>
        <Reveal delay={80}><h1 className="display" style={{fontSize:'clamp(2.4rem,5vw,4rem)',margin:'22px 0 18px'}}>{title}</h1></Reveal>
        {sub&&<Reveal delay={140}><p className="lead" style={{maxWidth:620}}>{sub}</p></Reveal>}
      </div>
    </div>
  );
}
