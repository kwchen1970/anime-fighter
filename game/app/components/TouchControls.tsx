'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {readStick} from '../../lib/touch-input';
type Attack='punch'|'kick'|'sweep'|'jump';
type Props={onMove:(direction:number)=>void;onAttack:(attack:Attack)=>void;onPunchHold:(held:boolean)=>void};
export default function TouchControls({onMove,onAttack,onPunchHold}:Props){
 const [stick,setStick]=useState({x:0,y:0}),pointer=useRef<number|null>(null),up=useRef(false);
 const callbacks=useRef({onMove,onAttack,onPunchHold});callbacks.current={onMove,onAttack,onPunchHold};
 const reset=()=>{pointer.current=null;up.current=false;setStick({x:0,y:0});callbacks.current.onMove(0);};
 useEffect(()=>{const clear=()=>{reset();callbacks.current.onPunchHold(false);};window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);return()=>{window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);callbacks.current.onMove(0);callbacks.current.onPunchHold(false);};},[]);
 const update=(event:PointerEvent<HTMLDivElement>)=>{
  const bounds=event.currentTarget.getBoundingClientRect(),radius=bounds.width*.31;
  const value=readStick(event.clientX-bounds.left-bounds.width/2,event.clientY-bounds.top-bounds.height/2,radius);
  setStick({x:value.x*radius,y:value.y*radius});onMove(value.move);
  if(value.jump&&!up.current){up.current=true;onAttack('jump');}else if(value.releaseJump)up.current=false;
 };
 return <div className="touch-controls controller-layout" aria-label="Touch game controls">
  <div className="joystick-section"><div className={'thumb-joystick '+(pointer.current!==null?'engaged':'')} role="group" aria-label="Movement joystick: drag left or right to run, up to jump, diagonal up to run and jump" onPointerDown={event=>{if(pointer.current!==null)return;event.preventDefault();pointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);update(event);}} onPointerMove={event=>{if(event.pointerId===pointer.current){event.preventDefault();update(event);}}} onPointerUp={event=>{if(event.pointerId===pointer.current)reset();}} onPointerCancel={event=>{if(event.pointerId===pointer.current)reset();}} onLostPointerCapture={event=>{if(event.pointerId===pointer.current)reset();}}>
   <span className="stick-up" aria-hidden="true">↑</span><span className="stick-left" aria-hidden="true">‹</span><span className="stick-right" aria-hidden="true">›</span><span className="joystick-knob" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}/>
  </div><span className="joystick-caption">MOVE · UP TO JUMP</span></div>
  <div className="attack-diamond" role="group" aria-label="Attack buttons">
   {([{action:'kick',label:'HIGH KICK',position:'north'},{action:'punch',label:'PUNCH',position:'west'},{action:'sweep',label:'SWEEP',position:'east'},{action:'jump',label:'JUMP',position:'south'}] as const).map(button=><button key={button.action} className={`round-action ${button.position} ${button.action}-action`} aria-label={button.label==='HIGH KICK'?'High kick':button.label[0]+button.label.slice(1).toLowerCase()} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);if(button.action==='punch')onPunchHold(true);onAttack(button.action);}} onPointerUp={()=>{if(button.action==='punch')onPunchHold(false);}} onPointerCancel={()=>{if(button.action==='punch')onPunchHold(false);}} onLostPointerCapture={()=>{if(button.action==='punch')onPunchHold(false);}}>{button.label}</button>)}
  </div>
 </div>;
}
