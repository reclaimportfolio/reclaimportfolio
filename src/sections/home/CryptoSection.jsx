import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Btn, Reveal } from '../../ui.jsx';

export function CryptoSection(){
  const {go,t}=useApp();
  const features=t('data.cryptoFeat');

  return (
    <section className="crypto-bento-section">
      <div className="wrap crypto-bento-wrap">
        <Reveal>
          <div className="crypto-bento-head section-head">
            <span className="eyebrow section-kicker">{t('home.cryptoEyebrow')}</span>
            <h2 className="section-title two-line-title">{t('home.cryptoTitle')}</h2>
            <p className="section-copy">{t('home.cryptoText')}</p>
            <Btn icon="arrow" onClick={()=>go('crypto')}>{t('home.cryptoButton')}</Btn>
          </div>
        </Reveal>

        <div className="crypto-bento-grid">
          {features.map((item,i)=>(
            <Reveal key={item.t} delay={i*55} className="crypto-bento-card">
              <div className="crypto-card-art" aria-hidden="true">
                <Ico name={item.ic} />
              </div>

              <div className="crypto-card-copy">
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
