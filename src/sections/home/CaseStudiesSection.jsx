import { useApp } from '../../context.js';
import { Reveal } from '../../ui.jsx';
import { CaseStudyCards } from './CaseStudyCards.jsx';

export function CaseStudiesSection(){
  const {t}=useApp();
  return (
    <section className="case-showcase-section section-sm">
      <div className="wrap case-showcase-wrap">
        <Reveal className="case-showcase-head section-head">
          <span className="eyebrow section-kicker">{t('home.caseEyebrow')}</span>
          <h2 className="section-title">{t('home.caseTitle')}</h2>
          <p className="section-copy">{t('home.caseSub')}</p>
        </Reveal>
        <CaseStudyCards limit={4} variant="showcase"/>
      </div>
    </section>
  );
}
