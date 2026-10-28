'use client';
import {useEffect,useState,type CSSProperties} from 'react';
const colors=['#ff738a','#ffb75d','#ffe176','#77dbab','#74c9fa','#a491f0','#ed9cdd'];
export default function VictoryConfetti({won}:{won:boolean}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{if(!won){setVisible(false);return;}setVisible(true);const timer=setTimeout(()=>setVisible(false),5500);return()=>clearTimeout(timer);},[won]);
 return visible?<div className="victory-confetti" aria-hidden="true">{Array.from({length:224},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:colors[i%7],width:`${6+i%7}px`,height:`${10+i%9}px`,animationDelay:`${i<96?(i%12)*.025:.4+(i%32)*.07}s`,animationDuration:`${1.6+(i%8)*.14}s`,'--drift':`${(i%2?1:-1)*(90+i%13*24)}px`,'--spin':`${(i%2?1:-1)*(900+i%19*95)}deg`} as CSSProperties}/>)}</div>:null;
}
