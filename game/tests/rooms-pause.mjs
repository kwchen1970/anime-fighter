import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5173';
async function req(b,status=200){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;}
const a=await req({op:'create'}),b=await req({op:'join',code:a.code});
const paused=await req({op:'pause',code:a.code,token:a.token});assert.equal(paused.match.pausedBy,0);assert.ok(paused.match.pausedAt);
const same=await req({op:'pause',code:a.code,token:b.token});assert.equal(same.match.pausedBy,0,'another pause cannot take ownership');
await req({op:'resume',code:a.code,token:b.token},403);
const input={move:1,punch:1,kick:0,jump:1,sweep:0};const frozen=JSON.stringify(paused.match);
await new Promise(r=>setTimeout(r,350));const seen=await req({op:'tick',code:a.code,token:b.token,input});assert.equal(JSON.stringify(seen.match),frozen,'both players see same frozen match; paused input is ignored');
const resumed=await req({op:'resume',code:a.code,token:a.token});assert.equal(resumed.match.pausedAt,undefined);assert.equal(resumed.match.players[1].input.move,0);assert.equal(resumed.match.players[1].input.punch,0,'no queued paused attacks');
console.log('Two-player API pause, shared freeze, owner-only resume, and paused input rejection passed.');
