import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { Btn, PageHead, Reveal } from '../ui.jsx';
import { SERVICE_IMAGES } from '../sections/home/ServiceRows.jsx';
import { CTASection } from './HomePage.jsx';

export function StocksPage(){
  const {go,t}=useApp();
  const page=t('pages.stocks');
  const signals=t('data.stockSignals');

  return (
    <main>
      <PageHead eyebrow={page.eyebrow} title={page.title} sub={page.sub}/>
      <section className="stocks-page-section">
        <div className="wrap stocks-page-wrap">
          <div className="stocks-hero-grid">
            <Reveal className="stocks-copy">
              <span className="eyebrow section-kicker">{page.intelEyebrow}</span>
              <h2 className="section-title two-line-title">{page.intelTitle}</h2>
              <p className="section-copy">{page.intelText}</p>
              <div className="stocks-actions">
                <Btn primary icon="arrow" onClick={()=>go('signup')}>{page.primaryCta}</Btn>
                <Btn icon="arrow" onClick={()=>go('contact')}>{page.secondaryCta}</Btn>
              </div>
            </Reveal>

            <Reveal delay={100} className="stocks-visual">
              <img src={SERVICE_IMAGES['02']} alt="Stock recovery records and financial asset review visual" loading="lazy" />
            </Reveal>
          </div>

          <div className="stocks-signal-grid">
            {signals.map((item,i)=>(
              <Reveal key={item.t} delay={i*50}>
                <article className="stocks-signal-card">
                  <div className="stocks-signal-icon"><Ico name={item.ic}/></div>
                  <h3>{item.t}</h3>
                  <p>{item.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTASection/>
    </main>
  );
}
