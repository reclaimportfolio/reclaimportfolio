import { useApp } from '../context.js';
import { CTASection, TrustSection } from './HomePage.jsx';
import { PageHead, Reveal } from '../ui.jsx';

export function AboutPage(){
  const {t}=useApp();
  return (
    <main>
      <PageHead eyebrow={t('pages.about.eyebrow')} title={t('pages.about.title')} sub={t('pages.about.sub')}/>
      <section className="section-sm">
        <div className="wrap">
          <div className="grid-2" style={{gap:50}}>
            <Reveal>
              <h3 className="h3" style={{marginBottom:16}}>{t('pages.about.approachTitle')}</h3>
              <p className="muted" style={{lineHeight:1.8}}>{t('pages.about.approachText')}</p>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="h3" style={{marginBottom:16}}>{t('pages.about.guidesTitle')}</h3>
              <p className="muted" style={{lineHeight:1.8}}>{t('pages.about.guidesText')}</p>
            </Reveal>
          </div>
        </div>
      </section>
      <TrustSection/>
      <CTASection/>
    </main>
  );
}
