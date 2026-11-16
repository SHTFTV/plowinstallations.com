import {useEffect, useState} from 'react';

const units = [
  {id:'utv', name:'UTV', blade:'Compact straight blade', alt:'Generic UTV with a compact straight snowplow in a snowy workshop yard'},
  {id:'suv', name:'SUV', blade:'Straight blade', alt:'Generic SUV with an orange straight snowplow in a snowy workshop yard'},
  {id:'pickup', name:'3500 series', blade:'Articulated V-plow', alt:'Generic one-ton dually pickup with an orange V-plow in a snowy workshop yard'},
  {id:'dump', name:'Dump truck', blade:'Heavy-duty straight blade', alt:'Generic dump truck with a wide orange straight snowplow in a snowy workshop yard'},
  {id:'tailgate', name:'Tailgate salter', blade:'Compact rear-mounted spreader', alt:'Rear view of a generic pickup with a compact tailgate-mounted salt spreader'},
  {id:'hopper', name:'Hopper salter', blade:'In-bed V-box spreader', alt:'Rear view of a generic pickup with a stainless-steel in-bed hopper salt spreader'},
];

export function PlowFleetHero(){
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const [reduced,setReduced]=useState(true);
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>setReduced(preference.matches);
    const visibility=()=>setVisible(!document.hidden);
    sync();visibility();
    preference.addEventListener('change',sync);
    document.addEventListener('visibilitychange',visibility);
    return()=>{preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  const duration=active>=4?3000:5500;
  useEffect(()=>{
    if(paused||reduced||!visible)return;
    const timer=window.setInterval(()=>setActive(index=>(index+1)%units.length),duration);
    return()=>window.clearInterval(timer);
  },[paused,reduced,visible,active,duration]);
  return <>
    <div className="pi-fleet-stage" role="img" aria-label={units[active].alt}>
      {units.map((unit,index)=><div key={unit.id} className={'pi-unit-frame'+(active===index?' is-active':'')}><img src={'/brand/plow-unit-'+unit.id+'.webp'} width="1672" height="941" alt="" fetchPriority={index===0?'high':'low'} decoding="async"/></div>)}
      <div className="pi-film-shade"/>
      {!reduced&&!paused&&<div key={active} className="pi-snow-sweep"/>}
    </div>
    <div className="pi-fleet-controls" role="group" aria-label="Explore plow vehicles and salter styles">
      <div className="pi-unit-caption"><span>THE RIGHT SETUP FOR YOUR UNIT</span><p>{units[active].name}<small>{units[active].blade}</small></p></div>
      <div className="pi-unit-options">{units.map((unit,index)=><button type="button" key={unit.id} onClick={()=>setActive(index)} aria-pressed={active===index} aria-label={'Show '+unit.name+' with '+unit.blade}>{unit.name}<span className="pi-unit-progress"><i style={{animationDuration:duration+'ms'}} key={active+':'+index} className={active===index&&!paused&&!reduced&&visible?'is-running':''}/></span></button>)}<button type="button" className="pi-unit-pause" onClick={()=>setPaused(value=>!value)} disabled={reduced} aria-label={paused?'Play vehicle sequence':'Pause vehicle sequence'}>{reduced?'Motion off':paused?'Play ▷':'Pause Ⅱ'}</button></div>
      <p className="pi-unit-credit">AI-generated equipment illustrations</p>
    </div>
  </>;
}
