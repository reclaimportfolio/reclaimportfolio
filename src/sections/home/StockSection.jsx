import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Btn, Reveal } from '../../ui.jsx';

export function StockSection(){
  const {go,t}=useApp();
  const features=t('data.stockSignals');

  return (
    <section className="crypto-bento-section stock-bento-section">
      <div className="wrap crypto-bento-wrap">
        <Reveal>
          <div className="crypto-bento-head section-head">
            <span className="eyebrow section-kicker">{t('home.stockEyebrow')}</span>
            <h2 className="section-title two-line-title">{t('home.stockTitle')}</h2>
            <p className="section-copy">{t('home.stockText')}</p>
            <Btn icon="arrow" onClick={()=>go('stocks')}>{t('home.stockButton')}</Btn>
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
