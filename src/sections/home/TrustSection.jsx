import { useRef } from 'react';
import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

const BG_IMAGE='https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779009971/ChatGPT_Image_May_17_2026_07_50_01_AM_pot3uh.avif';

export function TrustSection(){
  const {t}=useApp();
  const trackRef=useRef(null);
  const items=t('data.trust');

  const move=(dir)=>{
    const track=trackRef.current;
    if(!track) return;
    track.scrollBy({left:dir*track.clientWidth*.72,behavior:'smooth'});
  };

  return (
    <section className="section trust-showcase-section" style={{'--trust-bg':`url(${BG_IMAGE})`}}>
      <div className="wrap">
        <div className="trust-showcase">
          <Reveal>
            <div className="trust-showcase-head">
              <div>
                <span className="eyebrow section-kicker">{t('home.trustEyebrow')}</span>
                <h2 className="section-title two-line-title">{t('home.trustTitle')}</h2>
              </div>

              <div className="trust-showcase-copy">
                <p className="section-copy">{t('home.introText')}</p>
                <div className="trust-arrows" aria-label="Scroll methods">
                  <button onClick={()=>move(-1)} aria-label="Previous method">
                    <Ico name="arrowL" />
                  </button>
                  <button onClick={()=>move(1)} aria-label="Next method">
                    <Ico name="arrow" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="trust-card-track" ref={trackRef}>
            {items.map((item,i)=>(
              <Reveal key={item.t} delay={i*55} className="trust-method-card">
                <span className="trust-card-tag">{item.t}</span>
                <div className="trust-card-icon">
                  <Ico name={item.ic} />
                </div>
                <p>{item.d}</p>
                <span className="trust-card-link" aria-hidden="true">
                  <Ico name="arrow" />
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
