import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {JUMP_PREP_MS,jumpAnimationTime} from '../lib/jump-timing.ts';
for(const slot of [0,1]){
 const g=newMatch(0,0),f=g.players[slot];f.input.jump=1;advance(g,10);const started=f.jumpStarted!;
 for(let t=20;t<started+JUMP_PREP_MS[slot];t+=10){f.input.at=t;advance(g,t);assert.equal(f.y,0,'feet remain planted during frames 1–3');assert.ok(!f.airborne);}
 advance(g,started+JUMP_PREP_MS[slot]+15);assert.ok((f.y??0)>0,'launch begins on frame 4');
 const durations=Array(14).fill(slot?80:82),prep=JUMP_PREP_MS[slot];const sourcePrep=durations.slice(0,3).reduce((a,b)=>a+b,0);assert.equal(prep,60);assert.equal(jumpAnimationTime(prep,durations),sourcePrep);assert.ok(jumpAnimationTime(prep-1,durations)<sourcePrep);
}
console.log('Both fighters launch at frame four; frames one through three remain grounded.');
