import { useApp } from '../context.js';
import { Ico } from '../icons.jsx';
import { CTASection } from './HomePage.jsx';
import { PageHead, Reveal } from '../ui.jsx';
import { SERVICE_IMAGES } from '../sections/home/ServiceRows.jsx';

export function CryptoPage(){
  const {t}=useApp();
  const features=t('data.cryptoFeat');
  const stats=[
    ['01','Trace movement'],
    ['02','Map wallets'],
    ['03','Package evidence'],
  ];

  return (
    <main>
      <PageHead eyebrow={t('pages.crypto.eyebrow')} title={t('pages.crypto.title')} sub={t('pages.crypto.sub')}/>
      <section className="crypto-page-section">
        <div className="wrap crypto-page-wrap">
          <div className="crypto-page-hero">
            <Reveal className="crypto-page-copy">
              <span className="eyebrow section-kicker">{t('pages.crypto.network')}</span>
              <h2 className="section-title two-line-title">{t('pages.crypto.sectionTitle')}</h2>
              <p className="section-copy">{t('pages.crypto.sectionText')}</p>
              <div className="crypto-page-stats">
                {stats.map(([value,label])=>(
                  <span key={value}><strong>{value}</strong>{label}</span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={100} className="crypto-page-visual">
              <img src={SERVICE_IMAGES['03']} alt="Blockchain investigation and wallet tracing visual" loading="lazy" />
            </Reveal>
          </div>

          <div className="crypto-feature-grid">
            {features.map((f,i)=>(
              <Reveal key={f.t} delay={i*50}>
                <article className="crypto-feature-card">
                  <div className="crypto-feature-icon"><Ico name={f.ic}/></div>
                  <div>
                    <h3>{f.t}</h3>
                    <p>{f.d}</p>
                  </div>
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
