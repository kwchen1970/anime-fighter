import assert from 'node:assert/strict';
import {worldScale,FIGHTER_HEIGHT,PLATFORM_THICKNESS} from '../lib/world-scale.ts';
for(const camera of [980,1500,1700,2100,4000]){
 const scale=worldScale(camera);
 assert.ok(Math.abs(PLATFORM_THICKNESS*scale/(FIGHTER_HEIGHT*scale)-PLATFORM_THICKNESS/FIGHTER_HEIGHT)<1e-12,'thickness-to-player ratio stays fixed at every zoom');
}
assert.equal(PLATFORM_THICKNESS,52);
console.log('Platform and fighter proportions stay identical across camera zoom levels.');
