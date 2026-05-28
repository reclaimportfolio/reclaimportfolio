import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { CTASection } from './HomePage.jsx';
import { PageHead, Reveal } from '../ui.jsx';

export function CompliancePage(){
  const {t}=useApp();
  return (
    <main>
      <PageHead eyebrow={t('pages.compliance.eyebrow')} title={t('pages.compliance.title')} sub={t('pages.compliance.sub')}/>
      <section className="section-sm">
        <div className="wrap">
          <div className="grid-3">
            {t('data.complianceItems').map((f,i)=>(
              <Reveal key={f.t} delay={i*50}>
                <div className="glass glass-hover feature"><div className="ic"><Ico name={f.ic}/></div><h4>{f.t}</h4><p>{f.d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm" style={{background:'var(--bg-1)'}}>
        <div className="wrap">
          <Reveal>
            <div className="grid-2" style={{gap:50,alignItems:'center'}}>
              <div>
                <span className="eyebrow">{t('pages.compliance.institution')}</span>
                <h2 className="h2" style={{margin:'22px 0 14px'}}>{t('pages.compliance.docTitle')}</h2>
                <p className="muted" style={{lineHeight:1.8}}>{t('pages.compliance.docText')}</p>
              </div>
              <div className="glass" style={{padding:30}}>
                <div style={{display:'grid',gap:14}}>
                  {t('pages.compliance.checklist').map(x=>(
                    <div key={x} style={{display:'flex',gap:11,alignItems:'center',fontSize:14}}>
                      <Ico name="checkCircle" style={{width:17,height:17,color:'var(--accent-2)',flexShrink:0}}/>{x}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <CTASection/>
    </main>
  );
}
