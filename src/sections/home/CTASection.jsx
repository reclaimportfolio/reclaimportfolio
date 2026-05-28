import { useApp } from '../../context.js';
import { Btn, Reveal } from '../../ui.jsx';

const CTA_IMAGE='https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779017916/ChatGPT_Image_May_17_2026_12_36_51_PM_dicqlm.jpg';

export function CTASection(){
  const {t,openAuth}=useApp();

  return (
    <section className="section-sm home-cta-operate-section" style={{'--cta-bg':`url(${CTA_IMAGE})`}}>
      <Reveal>
        <div className="home-cta-operate">
          <div className="wrap home-cta-head">
            <div>
              <span className="eyebrow section-kicker">{t('home.ctaEyebrow')}</span>
              <h2 className="section-title">{t('home.ctaTitle')}</h2>
            </div>

            <div className="home-cta-copy">
              <p className="section-copy">{t('home.ctaText')}</p>
              <Btn primary icon="arrow" onClick={()=>openAuth('signup')}>{t('common.startRecovery')}</Btn>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
