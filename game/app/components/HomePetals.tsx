'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
export default function HomePetals(){
 const layer=useRef<HTMLDivElement>(null),[height,setHeight]=useState(0);
 useEffect(()=>{const root=layer.current?.parentElement,card=root?.querySelector('.play-card');if(!root||!card)return;
  const measure=()=>setHeight(Math.max(0,Math.ceil(card.getBoundingClientRect().bottom-root.getBoundingClientRect().top)));
  const observer=new ResizeObserver(measure);observer.observe(root);observer.observe(card);window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
 },[]);
 return <div ref={layer} className="home-petals" aria-hidden="true" style={{height:`${height}px`,'--petal-fall':`${height+80}px`} as CSSProperties}>{Array.from({length:22},(_,i)=><span key={i} style={{left:`${(i*31+9)%116}%`,width:`${18+i%4*4}px`,height:`${18+i%4*4}px`,animationDuration:`${16+i%5*2}s`,animationDelay:`${-i*2.3}s`,'--breeze':`${-420-i%5*65}px`,'--petal-alpha':`${.48+i%3*.08}`} as CSSProperties}><img src="/assets/home/sakura-petal.png" alt="" style={{animationDuration:`${4+i%4}s`,animationDelay:`${-i}s`}}/></span>)}</div>;
}
