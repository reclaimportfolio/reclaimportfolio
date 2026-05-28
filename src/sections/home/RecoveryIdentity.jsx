import { useApp } from '../../context.js';
import { Counter, Reveal } from '../../ui.jsx';

function parseStat(value){
  if(value==='24/7') return {to:24,suffix:'/7'};
  const match=String(value).match(/^(\d+)(.*)$/);
  return match ? {to:Number(match[1]),suffix:match[2]} : {to:0,suffix:value};
}

export function RecoveryIdentity(){
  const {t}=useApp();
  const stats=t('home.identityStats');

  return (
    <section className="identity-section">
      <div className="identity-grid-bg" aria-hidden="true" />

      <div className="wrap identity-wrap">
        <Reveal className="identity-copy-reveal">
          <div className="identity-copy">
            <span className="eyebrow section-kicker identity-eyebrow">{t('home.identityEyebrow')}</span>

            <h2 className="section-title">
              {t('home.identityLineA')} <span>{t('home.identityLineB')}</span>
            </h2>
          </div>
        </Reveal>

        <div className="identity-stat-band">
          {stats.map((item,i)=>(
            <Reveal key={item.label} delay={i*90}>
              <div className="identity-band-item">
                <strong>
                  <Counter {...parseStat(item.value)} />
                </strong>
                <span>{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
