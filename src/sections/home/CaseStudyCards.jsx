import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

export function CaseStudyCards({limit,variant='default'}){
  const {t}=useApp();
  const studies=t('data.caseStudies');
  const list=limit?studies.slice(0,limit):studies;
  if(variant==='showcase'){
    return (
      <div className="case-showcase-grid">
        {list.map((c,i)=>(
          <Reveal key={c.title} delay={i*70}>
            <article className="case-showcase-card">
              <div className="case-showcase-top">
                <div>
                  <span>{c.cat}</span>
                  <h3>{c.title}</h3>
                </div>
                <button type="button" aria-label={`View ${c.title}`}>
                  <Ico name="arrow" />
                </button>
              </div>
              <div className="case-showcase-copy">
                <p>{c.problem}</p>
                <p>{c.approach}</p>
                <p>{c.outcome}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-2">
      {list.map((c,i)=>(
        <Reveal key={c.title} delay={i*60}>
          <div className="glass glass-hover case-card">
            <span className="case-cat">{c.cat}</span>
            <h4>{c.title}</h4>
            <p className="case-line"><b>{t('common.problem')} - </b>{c.problem}</p>
            <p className="case-line"><b>{t('common.approach')} - </b>{c.approach}</p>
            <p className="case-line"><b>{t('common.outcome')} - </b>{c.outcome}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
