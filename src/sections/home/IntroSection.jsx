import { useApp } from '../../context.js';
import { Reveal } from '../../ui.jsx';

export function IntroSection(){
  const {t}=useApp();
  return (
    <section className="section-sm intro-quote-section">
      <div className="wrap">
        <Reveal>
          <div className="intro-quote">
            <blockquote>{t('home.introTitle')}</blockquote>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
