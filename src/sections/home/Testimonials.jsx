import { useRef } from 'react';
import { useApp } from '../../context.js';
import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

export function Testimonials(){
  const {t}=useApp();
  const trackRef=useRef(null);
  const fallbackTestimonials=[
    { q: 'They brought order to a complicated file and explained every step without pressure or vague promises.', n: 'Samuel Ortega', r: 'Business Owner' },
    { q: 'The review was clear, careful and confidential. It helped our family understand the practical next steps.', n: 'Helen Brooks', r: 'Family Trustee' },
  ];
  const testimonials=[...t('data.testimonials')];
  fallbackTestimonials.forEach((item)=>{
    if(testimonials.length<5 && !testimonials.some(testimonial=>testimonial.n===item.n)){
      testimonials.push(item);
    }
  });
  const scrollCards=(direction)=>{
    const track=trackRef.current;
    if(!track) return;
    const card=track.querySelector('.voice-card');
    const gap=parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const distance=card ? card.offsetWidth + gap : 360;
    track.scrollBy({left:direction*distance,behavior:'smooth'});
  };

  return (
    <section className="client-voices-section section-sm">
      <div className="wrap client-voices-wrap">
        <Reveal>
          <div className="client-voices-head section-head">
            <div>
              <span className="eyebrow section-kicker">{t('home.testimonialsEyebrow')}</span>
              <h2 className="client-voices-title section-title">{t('home.testimonialsTitle')}</h2>
            </div>
            <div className="voice-controls" aria-label="Client voice controls">
              <button type="button" onClick={()=>scrollCards(-1)} aria-label="Previous client voice">
                <Ico name="arrowL" />
              </button>
              <button type="button" onClick={()=>scrollCards(1)} aria-label="Next client voice">
                <Ico name="arrow" />
              </button>
            </div>
          </div>
        </Reveal>

        <div className="voice-track" ref={trackRef}>
          {testimonials.map((item,i)=>{
            const initials=item.n.split(' ').map(x=>x[0]).join('');
            const credential=item.r.includes(',') ? item.r.split(',').slice(1).join(',').trim() : item.r;
            return (
              <Reveal key={item.n} delay={i*70}>
                <article className="voice-card">
                  <div className="voice-card-top">
                    <span className="voice-avatar">{initials}</span>
                    <span className="voice-pill">
                      <Ico name="checkCircle" />
                      {credential || 'Verified client'}
                    </span>
                  </div>
                  <span className="voice-mark" aria-hidden="true">"</span>
                  <p>{item.q}</p>
                  <div className="voice-person">
                    <strong>{item.n}</strong>
                    <span>{item.r}</span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
