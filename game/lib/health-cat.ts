import type {Match} from './game.ts';
export type HealthCat={x:number;y:number;born:number;expires:number;vx?:number;vy?:number;updatedAt?:number;evasions?:number;escaping?:boolean;lastEvadeAt?:number};
export const CAT_HEAL=25;
export function catCatchable(cat:HealthCat,now:number,bot=false){return (cat.evasions??0)>=(bot?1:3)&&now-cat.born>=(bot?3000:8000);}
export function catPosition(cat:HealthCat,now:number){const age=(now-cat.born)/1000,dt=Math.max(0,Math.min(.06,(now-(cat.updatedAt??now))/1000));return {x:cat.x+(cat.vx??0)*dt,y:cat.y+(cat.vy??0)*dt+Math.sin(age*2)*9};}
export function updateHealthCat(g:Match,now:number){
 if(g.winner!==null||now<g.start)return;
 g.catNextAt??=g.start+6000;
 if(g.healthCat&&now>=g.healthCat.expires){g.healthCat=undefined;g.catNextAt=now+10000;}
 if(!g.healthCat&&now>=g.catNextAt&&g.players.some(f=>f.hp>0&&f.hp/(f.maxHp??100)<=.25)){
  const a=g.players[0],b=g.players[1],anchor=a.hp/(a.maxHp??100)<=b.hp/(b.maxHp??100)?a:b;
  g.healthCat={x:anchor.x+800*(anchor.face||1),y:(anchor.y??0)+380,born:now,expires:now+40000,vx:anchor.face*140,vy:0,updatedAt:now};
 }
 if(!g.healthCat)return;
 const cat=g.healthCat,dt=Math.max(0,Math.min(.05,(now-(cat.updatedAt??now))/1000));
 const nearest=g.players.map(f=>({f,d:Math.hypot(f.x-cat.x,(f.y??0)+150-cat.y)})).sort((a,b)=>a.d-b.d)[0];
 // Count a dodge only after a close approach followed by a successful escape.
 if(nearest.d<300&&!cat.escaping&&now-(cat.lastEvadeAt??-2000)>=1500)cat.escaping=true;
 if(cat.escaping&&nearest.d>460){cat.evasions=Math.min(3,(cat.evasions??0)+1);cat.escaping=false;cat.lastEvadeAt=now;}
 const center=(g.players[0].x+g.players[1].x)/2;
 const age=(now-cat.born)/1000;
 // Wide slow arcs above the action, with continuous steering rather than bursts.
 const targetX=center+Math.cos(age*.32)*850;
 const targetY=Math.max(...g.players.map(f=>f.y??0))+370+Math.sin(age*.65)*85;
 let desiredX=Math.max(-280,Math.min(280,(targetX-cat.x)*.65));
 let desiredY=Math.max(-160,Math.min(160,(targetY-cat.y)*.7));
 if(nearest.d<650){
  const dx=cat.x-nearest.f.x,dy=cat.y-((nearest.f.y??0)+150),distance=Math.max(1,nearest.d);
  const strength=(1-Math.min(1,distance/650))*(catCatchable(cat,now)?620:850);
  desiredX+=dx/distance*strength;desiredY+=dy/distance*strength;
 }
 const ease=1-Math.exp(-2*dt);
 cat.vx=(cat.vx??0)+(desiredX-(cat.vx??0))*ease;
 cat.vy=(cat.vy??0)+(desiredY-(cat.vy??0))*ease;
 cat.x+=(cat.vx??0)*dt;cat.y=Math.max(95,cat.y+(cat.vy??0)*dt);cat.updatedAt=now;
 const position=catPosition(cat,now);
 // Resolve pickup once in the shared simulation, so both browsers agree.
 const collector=g.players.map((f,i)=>({f,i,d:Math.hypot((f.x-position.x)/56,(((f.y??0)+155)-position.y)/82)})).filter(({f,i,d})=>f.hp>0&&catCatchable(cat,now,g.botSlot===i)&&d<=(g.botSlot===i?1.3:1)).sort((a,b)=>a.d-b.d||a.i-b.i)[0];
 if(collector){const f=collector.f;f.hp=Math.min(f.maxHp??100,f.hp+CAT_HEAL);f.healFlash=now+650;g.healthCat=undefined;g.catNextAt=now+12000;}
}
