import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { CTASection, HowItWorks } from './HomePage.jsx';
import { PageHead, Reveal } from '../ui.jsx';
import { SERVICE_IMAGES } from '../sections/home/ServiceRows.jsx';

export function ServicesPage(){
  const {t}=useApp();
  return (
    <main>
      <PageHead eyebrow={t('pages.services.eyebrow')} title={t('pages.services.title')} sub={t('pages.services.sub')}/>
      <section className="section-sm"><div className="wrap"><ServiceRowsInline/></div></section>
      <HowItWorks/>
      <CTASection/>
    </main>
  );
}

function ServiceRowsInline(){
  const {go,t}=useApp();
  const serviceRoute=(index)=>index===1?'stocks':index===2||index===3?'crypto':'contact';
  return t('data.services').map((s,i)=>(
    <Reveal key={s.n} delay={i*40}>
      <div className="srow">
        <div className="srow-num">{s.n}</div>
        <div>
          <h3 className="srow-title">{s.title}</h3>
          <p className="muted" style={{fontSize:14.5,maxWidth:440}}>{s.desc}</p>
          <a className="srow-learn" onClick={()=>go(serviceRoute(i))}>{t('common.learnMore')} <Ico name="arrow"/></a>
        </div>
        <div className="srow-visual service-page-visual">
          <img src={SERVICE_IMAGES[s.n]} alt={`${s.title} visual`} loading="lazy" />
        </div>
      </div>
    </Reveal>
  ));
}
