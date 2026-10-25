import {platformsIn,GRAVITY,JUMP_SPEED} from './platforms.ts';
import {ARENA_LENGTH,groundHeight} from './terrain.ts';
export const WORLD = ARENA_LENGTH;
export const SPEED = 440;
export type Input = { move: number; punch: number; kick: number; at: number; jump?:number; sweep?:number };
export type Fighter = { speed?:number; maxHp?:number; knockback?:number; y?:number; vy?:number; jump?:number; sweep?:number; airborne?:boolean; jumpStarted?:number; punchMove?:number; x: number; face: number; hp: number; action: string; started: number; until: number; stun: number; flash: number; hit: boolean; punch: number; kick: number; input: Input };
export type Match = { stage?:number; players: Fighter[]; time: number; start: number; end: number; winner: number | null; events: { x: number; time: number; kick: boolean; victimX?:number; direction?:number; y?:number; attacker?:number }[] };
export function newMatch(now: number, countdown = 3000, stage = 0): Match {
  return { stage, players: [1380, 1740].map((x, i) => ({ x, face: i ? -1 : 1, hp: 100, action: 'fight', started: now, until: 0, stun: 0, flash: 0, hit: false, punch: 0, kick: 0, input: { move: 0, punch: 0, kick: 0, at: now } })), time: now, start: now + countdown, end: now + countdown + 90000, winner: null, events: [] };
}
export function advance(g: Match, now: number) {
  const from = Math.max(g.time, now - 350);
  for (let t = from; t < now;) { const next = Math.min(now, t + 1000/60); tick(g, next, (next-t)/1000); t = next; }
  g.time = now;
  g.events = g.events.filter(e => now - e.time < 600);
  return g;
}
function tick(g: Match, now: number, dt: number) {
  if (g.winner !== null || now < g.start) return;
  const p = g.players;
  for (let i=0;i<2;i++) {
    const f=p[i], other=p[1-i];
    f.y??=0;f.vy??=0;f.jump??=0;f.sweep??=0;
    const input=now-f.input.at<400?f.input:{move:0,punch:f.punch,kick:f.kick,jump:f.jump,sweep:f.sweep};
    const nearby=platformsIn(f.x-40,f.x+40,f.y-450,f.y+450);
    const supported=f.y===0||nearby.some(platform=>f.x>=platform.x&&f.x<=platform.x+platform.width&&Math.abs(f.y!-platform.y)<.1);
    if(!supported&&!f.airborne)f.airborne=true;
    if((input.jump??0)>f.jump){f.jump=input.jump??0;if(!f.airborne&&f.stun<=now&&f.until<=now){f.vy=JUMP_SPEED;f.airborne=true;f.jumpStarted=now;}}
    if(f.knockback){const decay=Math.exp(-10*dt);f.x=f.x+f.knockback*(1-decay)/10;f.knockback*=decay;if(Math.abs(f.knockback)<2)f.knockback=0;}
    if(f.airborne){const previous=f.y;f.vy-=GRAVITY*dt;f.y+=f.vy*dt;
      if(f.vy<=0){let floor=0;for(const platform of nearby)if(f.x>=platform.x&&f.x<=platform.x+platform.width&&previous>=platform.y&&f.y<=platform.y)floor=Math.max(floor,platform.y);
        if(f.y<=floor){f.y=floor;f.vy=0;f.airborne=false;}}
    }
    if(f.stun>now)continue;
    const move=Math.sign(input.move);
    if(f.airborne){f.x=f.x+move*SPEED*dt;if(move)f.face=move;if(f.until<=now)f.action='jump';continue;}
    if(f.until>now){if(f.action==='punch'&&move){f.face=move;f.punchMove=move;f.x+=move*SPEED*.8*dt;}else f.punchMove=0;continue;}
    f.face=other.x>=f.x?1:-1;
    if((input.sweep??0)>f.sweep||input.kick>f.kick||input.punch>f.punch){
      const sweep=(input.sweep??0)>f.sweep,kick=!sweep&&input.kick>f.kick;
      f.punch=input.punch;f.kick=input.kick;f.sweep=input.sweep??0;
      f.punchMove=!sweep&&!kick?move:0;if(f.punchMove)f.face=move;f.action=sweep?'sweep':kick?'kick':'punch';f.started=now;f.until=now+(sweep?1000:kick?940:780);f.hit=false;
    }else{if(move)f.face=move;const action=move?'run':'fight';if(f.action!==action)f.started=now;f.action=action;f.x=f.x+move*SPEED*(f.speed??1)*dt;}
  }
  const gap=p[1].x-p[0].x;
  if(Math.abs(gap)<74&&Math.abs((p[0].y??0)-(p[1].y??0))<100) { const sign=gap>=0?1:-1; const mid=(p[0].x+p[1].x)/2; p[0].x=mid-sign*37;p[1].x=mid+sign*37; }
  const hits: {i:number;kick:boolean}[]=[];
  for(let i=0;i<2;i++) {
    const f=p[i], o=p[1-i], kick=f.action==='kick'||f.action==='sweep',sweep=f.action==='sweep';
    if(!['punch','kick','sweep'].includes(f.action)||f.hit||f.until<=now||f.stun>now) continue;
    const elapsed=now-f.started;
    if(elapsed<(kick?340:250)||elapsed>(kick?560:440))continue;
    if((o.x-f.x)*f.face>0 && Math.abs(o.x-f.x)<(kick?235:155) && Math.abs((o.y??0)-(f.y??0))<(sweep?65:130)) { f.hit=true; hits.push({i,kick}); }
  }
  for(const {i,kick} of hits) {
    const f=p[i],o=p[1-i];o.hp=Math.max(0,o.hp-(kick?17:10));o.stun=now+(kick?360:300);o.flash=now+300;
    o.knockback=f.face*(kick?950:480);o.until=0;o.action='hurt';o.started=now;
    // Consume inputs during hit stun so a queued attack cannot fire unexpectedly.
    o.punch=o.input.punch;o.kick=o.input.kick;o.sweep=o.input.sweep??0;o.jump=o.input.jump??0;
    g.events.push({x:(f.x+o.x)/2,time:now,kick,victimX:o.x,direction:f.face,y:o.y??0,attacker:i});
  }
  if(p.some(f=>f.hp<=0)||now>=g.end)g.winner=p[0].hp===p[1].hp?2:p[0].hp>p[1].hp?0:1;
}
