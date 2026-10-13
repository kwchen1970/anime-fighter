import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5173';
async function req(b,expected=200){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));return data;}
const a=await req({op:'create'}),b=await req({op:'join',code:a.code});
assert.equal(a.slot,0);assert.equal(b.slot,1);assert.equal(b.joined,2);
await req({op:'join',code:a.code},409);await req({op:'tick',code:a.code,token:'wrong'},403);
let ia={move:0,punch:0,kick:0},ib={move:0,punch:0,kick:0};let pa,pb;
async function poll(ms){const end=Date.now()+ms;while(Date.now()<end){[pa,pb]=await Promise.all([req({op:'tick',code:a.code,token:a.token,input:ia}),req({op:'tick',code:a.code,token:b.token,input:ib})]);await new Promise(r=>setTimeout(r,45));}}
await poll(3200);ia.move=1;await poll(350);ia.move=0;assert.ok(pa.match.players[0].x>1450,'movement advances shared state');
ia.kick=1;await poll(1200);assert.equal(pa.match.players[1].hp,83);assert.equal(pb.match.players[1].hp,83,'both clients agree on damage');
await poll(300);assert.equal(pa.match.players[1].hp,83,'one attack only damages once');
const resumed=await req({op:'tick',code:a.code,token:a.token,input:ia});assert.equal(resumed.slot,0,'existing token restores player slot');
console.log('Room checks passed: create, join, full room, session authentication, synchronized movement and damage, recovery.');
