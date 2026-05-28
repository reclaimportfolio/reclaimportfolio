import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

const CLIENT_IMAGE='https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779012007/ChatGPT_Image_May_17_2026_10_54_49_AM_h8ywoo.avif';

export function ClientTypes(){
  const {t}=useApp();
  const clients=t('data.clientTypes');

  return (
    <section className="section split-feature-section client-split-section">
      <div className="wrap">
        <div className="split-feature reverse">
          <Reveal className="split-feature-copy">
            <span className="eyebrow section-kicker">{t('home.clientsEyebrow')}</span>
            <h2 className="section-title">{t('home.clientsTitle')}</h2>
            <p className="section-copy">{t('home.identityText')}</p>

            <div className="split-feature-list">
              {clients.slice(0,6).map((client)=>(
                <span key={client}>
                  <Ico name="checkCircle" />
                  {client}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100} className="split-feature-media">
            <img src={CLIENT_IMAGE} alt="" loading="lazy" />
            <div className="split-feature-badge" aria-hidden="true">
              <Ico name="users" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
