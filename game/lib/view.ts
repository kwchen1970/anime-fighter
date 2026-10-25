import {GRAVITY,JUMP_SPEED,platformsIn} from './platforms.ts';
import { SPEED, WORLD, type Fighter, type Match } from './game.ts';

export type Snapshot = { time: number; match: Match };
export const damp = (value:number,target:number,speed:number,dt:number) => value+(target-value)*(1-Math.exp(-speed*dt));
const clampX = (x:number) => x;

function velocity(f:Fighter,now:number) {
  if(f.knockback&&f.stun>now)return f.knockback;
  return (f.airborne||f.action==='run'&&f.until<=now||f.action==='punch'&&f.until>now)&&f.stun<=now&&now-f.input.at<400?Math.sign(f.input.move)*SPEED*(f.action==='punch'?.8:1):0;
}

// Opponents render a little behind the server, between snapshots, rather than
// jumping to each new packet. Brief gaps extrapolate with a bounded velocity.
export function sampleOpponent(history:Snapshot[],slot:number,now:number):Fighter|null {
  if(!history.length)return null;
  const target=now-100;
  let before=history[0];
  for(let i=1;i<history.length;i++) {
    const after=history[i];
    if(after.time>=target) {
      const ratio=Math.max(0,Math.min(1,(target-before.time)/Math.max(1,after.time-before.time)));
      const f=before.match.players[slot],next=after.match.players[slot];
      return {...f,x:clampX(f.x+(next.x-f.x)*ratio),y:(f.y??0)+((next.y??0)-(f.y??0))*ratio};
    }
    before=after;
  }
  const f=before.match.players[slot];
  const age=Math.max(0,Math.min(.15,(target-before.time)/1000));return {...f,x:clampX(f.x+velocity(f,target)*age),...projectVertical(f,age,target)};
}

// Tile identity follows world position. Wrapping only a camera offset would
// suddenly swap every building's silhouette at each tile boundary.
export function skylineTiles(cameraX:number,layer:number,width=1200) {
  const offset=cameraX*(.07+layer*.09);
  const first=Math.floor(offset/95)-2;
  return Array.from({length:Math.ceil(width/95)+5},(_,n)=>{
    const id=first+n;
    const mod=(v:number,m:number)=>((v%m)+m)%m;
    return {id,x:id*95-offset,width:60+mod(id*47+1000,70),height:70+mod(id*61+1500+layer*43,150)};
  });
}

// Render in-between packet times instead of holding a jumping fighter at each
// network height. Landing still obeys the same one-way platform surfaces.
export function projectVertical(f:Fighter,age:number,now:number):Pick<Fighter,'y'|'vy'|'airborne'|'action'>{
 let time=Math.max(0,Math.min(.15,age)),y=f.y??0,vy=f.vy??0,airborne=f.airborne;
 if(f.jumpLaunchAt&&now>=f.jumpLaunchAt&&!airborne){time=Math.min(time,(now-f.jumpLaunchAt)/1000);vy=JUMP_SPEED;airborne=true;}
 if(!airborne)return {y,vy,airborne,action:f.action};
 const previous=y;y+=vy*time-.5*GRAVITY*time*time;vy-=GRAVITY*time;
 if(vy<=0){let floor=0;for(const platform of platformsIn(f.x,f.x,y,previous))if(platform.y<=previous)floor=Math.max(floor,platform.y);if(y<=floor){y=floor;vy=0;airborne=false;}}
 return {y,vy,airborne,action:airborne?'jump':f.action};
}
