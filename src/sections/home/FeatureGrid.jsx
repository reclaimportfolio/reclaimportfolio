import { Ico } from '../../icons.jsx';
import { Reveal } from '../../ui.jsx';

export function FeatureGrid({items}){
  return (
    <div className="grid-3">
      {items.map((f,i)=>(
        <Reveal key={f.t} delay={i*50}>
          <div className="glass glass-hover feature">
            <div className="ic"><Ico name={f.ic}/></div>
            <h4>{f.t}</h4>
            <p>{f.d}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
