import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context.js';
import { Btn, Reveal } from '../../ui.jsx';

const HERO_IMAGE = 'https://res.cloudinary.com/dxmdwvmxl/image/upload/v1778771414/ChatGPT_Image_May_14_2026_04_09_56_PM_mmfswk.png';
const SCRAMBLE = 'ΑΒΓΔΕΖΗΘΛΞΠΣΦΨΩαβγδεζηθλμπξσφψω∑∏∆Ωλπφ';

export function HeroSection(){
  const {go,t,openAuth}=useApp();
  const [decryptKey,setDecryptKey]=useState(0);

  return (
    <section className="hero hero-redesign">
      <img className="hero-pattern" src={HERO_IMAGE} alt="" aria-hidden="true" fetchPriority="high"/>

      <div className="wrap hero-redesign-wrap">
        <div className="hero-redesign-grid hero-single">
          <div className="hero-copy">
            <Reveal><span className="eyebrow">{t('home.heroEyebrow')}</span></Reveal>
            <Reveal delay={80}>
              <h1
                className="display hero-title decrypt-title"
                onMouseEnter={()=>setDecryptKey((key)=>key+1)}
              >
                <DecryptLine text="Recover Lost Assets." highlights={['Lost']} trigger={decryptKey}/><br/>
                <DecryptLine text="Trace Digital Wealth." highlights={['Wealth']} trigger={decryptKey}/><br/>
                <DecryptLine text="Reclaim What's Yours." highlights={['Reclaim']} trigger={decryptKey}/>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="lead hero-lead">{t('home.heroLead')}</p>
            </Reveal>
            <Reveal delay={220}>
              <div className="hero-actions">
                <Btn primary icon="arrow" onClick={()=>openAuth('signup')}>{t('common.startRecovery')}</Btn>
                <span className="hero-glass-button">
                  <Btn icon="arrow" onClick={()=>go('services')}>{t('common.exploreServices')}</Btn>
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function DecryptLine({text,highlights,trigger}){
  const [display,setDisplay]=useState(text);
  const [decrypting,setDecrypting]=useState(false);
  const highlightSet=useMemo(()=>new Set(highlights),[highlights]);

  useEffect(()=>{
    let frame=0;
    setDecrypting(true);
    const total=text.length + 14;
    const timer=window.setInterval(()=>{
      frame+=1;
      const revealed=Math.max(0,Math.floor((frame-5)*1.15));
      setDisplay(text.split('').map((char,index)=>{
        if(char===' ') return ' ';
        if(index<revealed) return char;
        return SCRAMBLE[Math.floor(Math.random()*SCRAMBLE.length)];
      }).join(''));

      if(frame>=total){
        window.clearInterval(timer);
        setDisplay(text);
        window.setTimeout(()=>setDecrypting(false),90);
      }
    },34);

    return ()=>window.clearInterval(timer);
  },[text,trigger]);

  if(display!==text || decrypting) return <span className="decrypt-line decrypting">{display}</span>;

  return (
    <span className="decrypt-line resolved">
      {text.split(/(\bLost\b|\bWealth\b|\bReclaim\b)/g).map((part,index)=>
        highlightSet.has(part) ? <span key={`${part}-${index}`}>{part}</span> : part
      )}
    </span>
  );
}
