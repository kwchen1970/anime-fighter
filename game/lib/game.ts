import {ARENA_LENGTH,groundHeight} from './terrain.ts';
export const WORLD = ARENA_LENGTH;
export const SPEED = 440;
export type Input = { move: number; punch: number; kick: number; at: number };
export type Fighter = { speed?:number; maxHp?:number; x: number; face: number; hp: number; action: string; started: number; until: number; stun: number; flash: number; hit: boolean; punch: number; kick: number; input: Input };
export type Match = { stage?:number; players: Fighter[]; time: number; start: number; end: number; winner: number | null; events: { x: number; time: number; kick: boolean }[] };
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
    if (f.until > now || f.stun > now) continue;
    f.face = other.x >= f.x ? 1 : -1;
    const input = now - f.input.at < 400 ? f.input : {move:0,punch:f.punch,kick:f.kick};
    if (input.kick > f.kick || input.punch > f.punch) {
      const kick=input.kick>f.kick;
      f.punch=input.punch; f.kick=input.kick;
      f.action=kick?'kick':'punch'; f.started=now; f.until=now+(kick?940:780); f.hit=false;
    } else {
      const move=Math.sign(input.move);
      if(move) f.face=move;
      const nextAction=move?'run':'fight'; if(f.action!==nextAction)f.started=now;
      f.action=nextAction;f.x=Math.max(110,Math.min(WORLD-110,f.x+move*SPEED*(f.speed??1)*dt));
    }
  }
  const gap=p[1].x-p[0].x;
  if(Math.abs(gap)<74) { const sign=gap>=0?1:-1; const mid=(p[0].x+p[1].x)/2; p[0].x=Math.max(110,Math.min(WORLD-110,mid-sign*37));p[1].x=Math.max(110,Math.min(WORLD-110,mid+sign*37)); }
  const hits: {i:number;kick:boolean}[]=[];
  for(let i=0;i<2;i++) {
    const f=p[i], o=p[1-i], kick=f.action==='kick';
    if(!['punch','kick'].includes(f.action)||f.hit||f.until<=now||f.stun>now) continue;
    const elapsed=now-f.started;
    if(elapsed<(kick?340:250)||elapsed>(kick?560:440))continue;
    if((o.x-f.x)*f.face>0 && Math.abs(o.x-f.x)<(kick?235:155) && Math.abs(groundHeight(o.x)-groundHeight(f.x))<70) { f.hit=true; hits.push({i,kick}); }
  }
  for(const {i,kick} of hits) {
    const f=p[i],o=p[1-i];o.hp=Math.max(0,o.hp-(kick?17:10));o.stun=now+(kick?300:210);o.flash=now+180;
    o.x=Math.max(110,Math.min(WORLD-110,o.x+f.face*(kick?95:48)));o.until=0;o.action='hurt';o.started=now;
    // Consume inputs during hit stun so a queued attack cannot fire unexpectedly.
    o.punch=o.input.punch;o.kick=o.input.kick;
    g.events.push({x:(f.x+o.x)/2,time:now,kick});
  }
  if(p.some(f=>f.hp<=0)||now>=g.end)g.winner=p[0].hp===p[1].hp?2:p[0].hp>p[1].hp?0:1;
}
