import assert from 'node:assert/strict';
import {newMatch,SPEED} from '../lib/game.ts';
import {damp,sampleOpponent,skylineTiles} from '../lib/view.ts';

// Crossing the old 95-pixel wrap boundary must move the same buildings a
// fraction of a pixel, without changing their heights or replacing them.
for(const layer of [0,1,2]) {
 const parallax=.07+layer*.09,boundary=95/parallax;
 const a=skylineTiles(boundary-.1,layer),b=skylineTiles(boundary+.1,layer);
 let compared=0;
 for(const before of a){const after=b.find(t=>t.id===before.id);if(after){assert.equal(after.height,before.height);assert.equal(after.width,before.width);assert.ok(Math.abs(after.x-before.x)<.1);compared++;}}
 assert.ok(compared>10);
}

// The same camera motion should finish at the same place at 30 and 120 FPS.
function follow(fps:number){let x=0;for(let i=0;i<fps;i++)x=damp(x,1000,5,1/fps);return x;}
assert.ok(Math.abs(follow(30)-follow(120))<.001);

const a=newMatch(1000,0),b=structuredClone(a);b.time=1100;b.players[1].x+=44;
const history=[{time:1000,match:a},{time:1100,match:b}];
assert.equal(sampleOpponent(history,1,1150)?.x,a.players[1].x+22,'render between packets instead of snapping');
assert.equal(sampleOpponent(history,1,900)?.x,a.players[1].x,'no backward extrapolation before the first packet');
b.players[1].action='run';b.players[1].input.move=1;b.players[1].input.at=1100;
const near=sampleOpponent(history,1,1250)!;assert.equal(near.x,b.players[1].x+SPEED*.05);
const far=sampleOpponent(history,1,1700)!;assert.equal(far.x,b.players[1].x,'stale input does not keep moving');
console.log('Smoothness checks passed: continuous skyline, frame-rate-independent camera, snapshot interpolation and stale input.');
