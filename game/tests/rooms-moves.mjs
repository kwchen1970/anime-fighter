import assert from 'node:assert/strict';
async function request(body){const response=await fetch('http://127.0.0.1:5173/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;}
const a=await request({op:'create'}),b=await request({op:'join',code:a.code});
let sawJump=false,sawSweep=false;
const end=Date.now()+4800;
while(Date.now()<end){for(const [session,input] of [[a,{move:0,punch:0,kick:0,jump:1,sweep:0}],[b,{move:0,punch:0,kick:0,jump:0,sweep:1}]]){const p=await request({op:'tick',code:a.code,token:session.token,input});sawJump ||= (p.match.players[0].y??0)>30;sawSweep ||= p.match.players[1].action==='sweep';}await new Promise(r=>setTimeout(r,40));}
assert.ok(sawJump,'shared room simulates airborne position');assert.ok(sawSweep,'shared room accepts sweep input');console.log('Multiplayer jump and sweep inputs passed.');
