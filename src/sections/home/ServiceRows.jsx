import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

export const SERVICE_IMAGES={
  '01':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003960/ChatGPT_Image_May_17_2026_08_07_08_AM_ngqyiv.avif',
  '02':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003960/ChatGPT_Image_May_17_2026_08_25_42_AM_kweno2.avif',
  '03':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003960/ChatGPT_Image_May_17_2026_08_26_29_AM_bmkmdh.avif',
  '04':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003961/ChatGPT_Image_May_17_2026_08_15_12_AM_pybtki.avif',
  '05':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003960/ChatGPT_Image_May_17_2026_08_28_28_AM_apmjdw.avif',
  '06':'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779003961/ChatGPT_Image_May_17_2026_08_15_24_AM_brboaz.avif',
};

export function ServiceRows(){
  const {go,t}=useApp();
  const services=t('data.services');
  const serviceRoute=(index)=>index===1?'stocks':index===2||index===3?'crypto':'services';
  const sectionRef=useRef(null);
  const [active,setActive]=useState(0);
  const visiblePage=Math.floor(active/3);

  useEffect(()=>{
    const updateActive=()=>{
      const section=sectionRef.current;
      if(!section) return;

      const rect=section.getBoundingClientRect();
      const scrollable=section.offsetHeight-window.innerHeight;
      if(scrollable<=0) return;

      const progress=Math.min(1,Math.max(0,-rect.top/scrollable));
      setActive(Math.min(services.length-1,Math.floor(progress*services.length)));
    };

    updateActive();
    window.addEventListener('scroll',updateActive,{passive:true});
    window.addEventListener('resize',updateActive);
    return ()=>{
      window.removeEventListener('scroll',updateActive);
      window.removeEventListener('resize',updateActive);
    };
  },[services.length]);

  return (
    <section className="services-snap-section" ref={sectionRef} style={{'--service-count':services.length}}>
      <div className="services-snap-sticky">
      <div className="wrap">
        <div className="services-snap-layout">
          <Reveal>
            <div className="services-snap-head section-head">
              <span className="eyebrow section-kicker">{t('home.servicesEyebrow')}</span>
              <h2 className="section-title">{t('home.servicesTitle')}</h2>
              <p className="section-copy">{t('home.introText')}</p>
              <div className="services-progress mono">{services[active].n} / {services.length.toString().padStart(2,'0')}</div>
            </div>
          </Reveal>

          <div className="services-snap-list" aria-label={t('home.servicesEyebrow')}>
            <div className="services-snap-track" style={{'--service-page':visiblePage}}>
              {services.map((s,i)=>(
                <article className={`service-snap-card ${active===i?'active':''}`} key={s.n}>
                  <div className="service-card-visual">
                    <img src={SERVICE_IMAGES[s.n]} alt={`${s.title} visual`} loading="lazy" />
                  </div>

                  <div className="service-card-body">
                    <span className="service-card-num mono">{s.n}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <button className="service-card-link" onClick={()=>go(serviceRoute(i))}>
                      {t('common.learnMore')} <Ico name="arrow"/>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
