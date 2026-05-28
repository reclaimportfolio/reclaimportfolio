import { useApp } from '../../context.js';
import { Counter, Reveal } from '../../ui.jsx';

export function StatsBand(){
  const {t}=useApp();
  return (
    <div className="wrap" style={{paddingBottom:20}}>
      <Reveal>
        <div className="stats">
          {t('home.stats').map((s,i)=>(
            <div className="stat" key={i}>
              <div className="stat-num">{typeof s[0]==='number'?<Counter to={s[0]} suffix={s[1]}/>:s[0]}</div>
              <div className="stat-label">{s[2]}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
