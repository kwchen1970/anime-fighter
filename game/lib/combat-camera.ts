export type CombatFocus={heat:number;focus:number;lastHit:number;lastAttacker?:number;seen:string[]};
export const newCombatFocus=():CombatFocus=>({heat:0,focus:0,lastHit:-Infinity,seen:[]});
export function updateCombatFocus(state:CombatFocus,events:{time:number;attacker?:number}[],now:number,dt:number,separating=false){
 for(const event of events){
  const key=`${event.time}:${event.attacker??'hit'}`;
  if(state.seen.includes(key)||now-event.time>1800||event.time>now)continue;
  state.seen.push(key);if(state.seen.length>32)state.seen.shift();
  const consecutive=event.time-state.lastHit<1800;
  const exchange=consecutive&&event.attacker!==undefined&&event.attacker!==state.lastAttacker;
  state.heat=Math.min(1,(consecutive?state.heat:0)+.16+(exchange?.07:0));
  state.lastHit=event.time;state.lastAttacker=event.attacker;
 }
 if(separating)state.heat*=Math.exp(-2*dt);
 else if(now-state.lastHit>1400)state.heat*=Math.exp(-.8*dt);
 state.focus+=(state.heat-state.focus)*(1-Math.exp(-2*dt));
 return state.focus;
}
export function combatCameraWidth(horizontal:number,vertical:number,focus:number){
 const normal=Math.max(1400,horizontal+850,(vertical+650)*1200/660);
 // Both complete sprites stay visible, even when a combo happens at a ledge.
 const safety=Math.max(980,horizontal+600,(vertical+460)*1200/660);
 return Math.max(safety,normal*(1-.3*focus));
}

export function steadyCombatWidth(base:number,horizontal:number,vertical:number,focus:number){
 return Math.max(1500,horizontal+780,(vertical+360)*1200/550,base*(1-.22*focus));
}
