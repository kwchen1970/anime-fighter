import assert from 'node:assert/strict';
import {newCombatFocus,updateCombatFocus,combatCameraWidth,steadyCombatWidth} from '../lib/combat-camera.ts';
const state=newCombatFocus();let events:{time:number;attacker:number}[]=[];
for(let t=0;t<=5000;t+=20){if(t%600===0)events.push({time:t,attacker:Math.floor(t/600)%2});events=events.filter(e=>t-e.time<600);updateCombatFocus(state,events,t,.02);}
const close=state.focus;assert.ok(close>.8,'successive exchanges build gradual focus');assert.ok(combatCameraWidth(200,0,close)<combatCameraWidth(200,0,0));
const duplicate=state.heat;updateCombatFocus(state,events,5000,0);assert.equal(state.heat,duplicate,'polling same hit cannot add focus');
for(let t=5020;t<12000;t+=20)updateCombatFocus(state,[],t,.02);assert.ok(state.focus<.05,'quiet period eases out');
assert.ok(combatCameraWidth(1800,600,1)>=2400,'zoom keeps separated fighters visible');
console.log('Camera: gradual combo focus, duplicate hit handling, quiet decay, and framing safety passed.');

assert.ok(steadyCombatWidth(2100,200,0,1)<steadyCombatWidth(2100,200,0,0),'steady mode includes gentle combat zoom');
assert.ok(steadyCombatWidth(2100,1600,0,1)>=2380,'running apart preserves framing');
const fleeing=newCombatFocus();fleeing.heat=1;fleeing.focus=1;fleeing.lastHit=0;
for(let t=20;t<=1200;t+=20)updateCombatFocus(fleeing,[],t,.02,true);
assert.ok(fleeing.heat<.1,'separating ends combat focus without waiting for timeout');
