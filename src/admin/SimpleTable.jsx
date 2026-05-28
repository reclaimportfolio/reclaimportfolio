import { useState } from 'react';
import { Ico } from '../icons.jsx';
import { Btn } from '../ui.jsx';

export function SimpleTable({title,desc,columns,rows,addLabel,renderCell}){
  const [q,setQ]=useState('');
  const keys=columns.map(c=>c.k);
  const filtered=rows.filter(r=>keys.some(k=>String(r[k]).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 className="admin-h1">{title}</h1>
          <p className="muted" style={{fontSize:13,marginTop:4}}>{desc}</p>
        </div>
        {addLabel&&<Btn primary sm icon="plus">{addLabel}</Btn>}
      </div>
      <div className="glass panel">
        <div className="toolbar">
          <div className="search-box">
            <Ico name="search"/>
            <input placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr>{columns.map(c=><th key={c.k}>{c.label}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={i}>
                  {columns.map(c=><td key={c.k}>{renderCell?renderCell(c.k,r):r[c.k]}</td>)}
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={columns.length} className="muted" style={{textAlign:'center',padding:30}}>No results.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
