import { SPEED, WORLD, type Fighter, type Match } from './game.ts';

export type Snapshot = { time: number; match: Match };
export const damp = (value:number,target:number,speed:number,dt:number) => value+(target-value)*(1-Math.exp(-speed*dt));
const clampX = (x:number) => Math.max(110,Math.min(WORLD-110,x));

function velocity(f:Fighter,now:number) {
  if(f.knockback&&f.stun>now)return f.knockback;
  return f.action==='run' && f.until<=now && f.stun<=now && now-f.input.at<400 ? Math.sign(f.input.move)*SPEED : 0;
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
      return {...f,x:clampX(f.x+(next.x-f.x)*ratio)};
    }
    before=after;
  }
  const f=before.match.players[slot];
  return {...f,x:clampX(f.x+velocity(f,target)*Math.max(0,Math.min(.15,(target-before.time)/1000)))};
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
