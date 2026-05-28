import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

const ASSET_IMAGE='https://res.cloudinary.com/dxmdwvmxl/image/upload/v1779012007/ChatGPT_Image_May_17_2026_10_54_58_AM_z9qqwh.avif';

export function AssetTypes(){
  const {t}=useApp();
  const assets=t('data.assets');

  return (
    <section className="section-sm split-feature-section asset-split-section">
      <div className="wrap">
        <div className="split-feature">
          <Reveal className="split-feature-media">
            <img src={ASSET_IMAGE} alt="Asset recovery case review workspace" loading="lazy" />
            <div className="split-feature-badge" aria-hidden="true">
              <Ico name="vault" />
            </div>
          </Reveal>

          <Reveal delay={100} className="split-feature-copy">
            <span className="eyebrow section-kicker">{t('home.assetEyebrow')}</span>
            <h2 className="section-title">{t('home.assetTitle')}</h2>
            <p className="section-copy">{t('home.introText')}</p>

            <div className="split-feature-list">
              {assets.slice(0,6).map((a)=>(
                <span key={a}>
                  <Ico name="checkCircle" />
                  {a}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
