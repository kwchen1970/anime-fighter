import assert from 'node:assert/strict';
import {steadyCameraTarget} from '../lib/steady-camera.ts';
const camera={x:1500,width:1900,elevation:0};
const ground=[{x:1400,y:0,floor:0},{x:1600,y:0,floor:0}];
const base=steadyCameraTarget(camera,ground),jump=steadyCameraTarget(camera,[{...ground[0],y:490,airborne:true},ground[1]]);
assert.equal(base.width,1700,'closer default framing');assert.ok(jump.width-base.width<160,'large jumps only widen enough to preserve framing');assert.equal(base.x,camera.x,'small movements stay inside dead zone');assert.ok(jump.elevation<200,'track only necessary headroom rather than entire jump');
const held=steadyCameraTarget({...camera,elevation:160},[{...ground[0],y:200,airborne:true},{...ground[1],y:200,floor:200}]);assert.equal(held.elevation,160,'view does not dip during descent');
console.log('Steady camera: fixed normal jump zoom, horizontal dead zone, limited lift, and descent hold passed.');

const falling=steadyCameraTarget({x:1500,width:1700,elevation:1400},[{x:1400,y:900,vy:-1500,airborne:true,floor:0},{x:1600,y:920,vy:-1400,airborne:true,floor:0}]);
assert.equal(falling.falling,true,'detect a fast drop');assert.ok(falling.elevation<1100,'do not hold high camera during a fall');
const landed=steadyCameraTarget({x:1500,width:1700,elevation:900},ground);assert.equal(landed.falling,true,'recover quickly if landing is below the camera');
