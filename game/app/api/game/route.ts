import { env } from 'cloudflare:workers';
import { advance, newMatch, type Match } from '@/lib/game';
type Room = { tokens: string[]; seen: number[]; ready: boolean[]; match: Match };
const json=(data: unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function publicRoom(r:Room,code:string,slot:number,now:number) { return { code, slot, joined:r.tokens.length, connected:r.seen.map(t=>now-t<6000), ready:r.ready, match:r.match, now }; }
export async function POST(req: Request) {
  try {
    if(req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin) return json({error:'Please join from the game page.'},403);
    const b=await req.json() as {op:string;code?:string;token?:string;input?:{move:number;punch:number;kick:number}}; const db=env.DB as D1Database; let now=Date.now();
    if(b.op==='create') {
      const token=crypto.randomUUID();
      for(let retry=0;retry<5;retry++) {
        const bytes=crypto.getRandomValues(new Uint8Array(5));const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789';const code=Array.from(bytes,x=>chars[x%chars.length]).join('');
        const r:Room={tokens:[token],seen:[now,0],ready:[false,false],match:newMatch(now)};
        const res=await db.prepare('INSERT OR IGNORE INTO rooms (code,data,version,expires) VALUES (?,?,0,?)').bind(code,JSON.stringify(r),now+86400000).run();
        if(res.meta.changes)return json({...publicRoom(r,code,0,now),token});
      }
      return json({error:'Could not make a room. Try again.'},503);
    }
    const code=String(b.code||'').trim().toUpperCase();if(!/^[A-Z2-9]{5}$/.test(code))return json({error:'Enter a five-character room code.'},400);
    for(let attempt=0;attempt<8;attempt++) {
      now=Date.now();
      const row=await db.prepare('SELECT data, version, expires FROM rooms WHERE code=?').bind(code).first<{data:string;version:number;expires:number}>();
      if(!row||row.expires<now)return json({error:'Room not found. Ask your friend for a new code.'},404);
      const r:Room=JSON.parse(row.data);let slot=r.tokens.indexOf(String(b.token||''));let token=b.token;
      if(b.op==='join'&&slot<0) {
        if(r.tokens.length>=2)return json({error:'This room already has two players.'},409);
        slot=1;token=crypto.randomUUID();r.tokens.push(token);r.match=newMatch(now);r.seen[0]=now;
      }
      if(slot<0)return json({error:'Your session has ended. Create or join a room again.'},403);
      const bothPresent=r.tokens.length===2&&r.seen.every(t=>now-t<6000);
      if(bothPresent)advance(r.match,now);
      else { const elapsed=now-r.match.time;r.match.start+=elapsed;r.match.end+=elapsed;r.match.time=now;for(const f of r.match.players){f.input.move=0;f.until=0;f.stun=0;f.action='fight';} }
      r.seen[slot]=now;
      if(b.op==='tick'&&b.input){const f=r.match.players[slot];f.input={move:Math.max(-1,Math.min(1,Number(b.input.move)||0)),punch:Math.max(f.input.punch,Math.min(f.input.punch+1,Math.floor(Number(b.input.punch)||0))),kick:Math.max(f.input.kick,Math.min(f.input.kick+1,Math.floor(Number(b.input.kick)||0))),at:now};}
      if(b.op==='rematch'&&r.match.winner!==null) {r.ready[slot]=true;if(r.ready.every(Boolean)){r.match=newMatch(now);r.ready=[false,false];}}
      const result=await db.prepare('UPDATE rooms SET data=?,version=version+1,expires=? WHERE code=? AND version=?').bind(JSON.stringify(r),now+86400000,code,row.version).run();
      if(result.meta.changes)return json({...publicRoom(r,code,slot,now),...(b.op==='join'?{token}: {})});
    }
    return json({error:'Room is busy. Retrying…'},503);
  } catch(e) { console.error('Game request failed',e);return json({error:'Could not reach the arena. Please try again.'},500); }
}
