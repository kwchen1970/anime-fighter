import assert from 'node:assert/strict';
import {ARENA_LENGTH,groundHeight,TERRAIN,districtBlend} from '../lib/terrain.ts';
import {newMatch,advance,WORLD} from '../lib/game.ts';
assert.equal(WORLD,7200);assert.equal(WORLD,ARENA_LENGTH);
for(const [x,y] of TERRAIN)assert.ok(Math.abs(groundHeight(x)-y)<.001);
for(let x=1;x<=WORLD;x++)assert.ok(Math.abs(groundHeight(x)-groundHeight(x-1))<.21,'no ground discontinuities');
assert.equal(groundHeight(400),0);assert.equal(groundHeight(1300),55);assert.equal(groundHeight(5000),80);
for(const x of [2400,4800]){
 const before=districtBlend(x-.01),after=districtBlend(x+.01);
 assert.equal(before.second,after.first,'district edges meet on the same scenery');assert.ok(before.blend>.999);
}
const sample=districtBlend(2100);assert.ok(sample.blend>0&&sample.blend<1,'scenery blends during traversal');
const a=newMatch(0,0),b=structuredClone(a);
for(let t=16;t<9000;t+=16){for(const g of [a,b]){g.players[0].input={move:-1,punch:0,kick:0,at:t};g.players[1].input={move:1,punch:0,kick:0,at:t};advance(g,t);}}
assert.deepEqual(a,b,'shared simulation gives both players identical positions on ramps');
assert.equal(groundHeight(a.players[0].x),groundHeight(b.players[0].x));
console.log('Terrain checks passed: expanded bounds, continuous ramps, changing districts, and shared movement.');
