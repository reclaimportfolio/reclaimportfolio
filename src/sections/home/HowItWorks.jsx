import { useState } from 'react';
import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

export function HowItWorks(){
  const {t}=useApp();
  const [active,setActive]=useState(0);
  const steps=t('data.steps');
  const icons=['doc','scan','network','scale','briefcase','checkCircle'];

  return (
    <section className="section-sm process-section">
      <div className="wrap">
        <Reveal>
          <div className="process-head section-head">
            <span className="eyebrow section-kicker">{t('home.processEyebrow')}</span>
            <h2 className="section-title">{t('home.processTitle')}</h2>
          </div>
        </Reveal>

        <div className="process-carousel-bleed">
          <div className="process-carousel" aria-label={t('home.processTitle')}>
            {steps.map((s,i)=>(
              <Reveal key={s.n} delay={i*50}>
                <button
                  className={`process-card ${active===i?'active':''}`}
                  onClick={()=>setActive(i)}
                  onMouseEnter={()=>setActive(i)}
                  aria-pressed={active===i}
                >
                  <span className="process-num mono">{s.n}</span>
                  <span className="process-visual">
                    <span className="process-orbit"/>
                    <Ico name={icons[i]}/>
                  </span>
                  <span className="process-title">{s.t}</span>
                  <span className="process-desc">{s.d}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
