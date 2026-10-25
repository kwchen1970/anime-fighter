import assert from 'node:assert/strict';
import {readStick} from '../lib/touch-input.ts';
assert.equal(readStick(0,0,40).move,0);assert.equal(readStick(8,1,40).move,0,'dead zone prevents drift');
assert.equal(readStick(40,0,40).move,1);assert.equal(readStick(-40,0,40).move,-1);
const up=readStick(0,-40,40);assert.equal(up.jump,true);assert.equal(up.move,0);
const diagonal=readStick(40,-40,40);assert.equal(diagonal.jump,true);assert.equal(diagonal.move,1);
assert.ok(Math.hypot(diagonal.x,diagonal.y)<=1.00001,'knob stays within its travel ring');assert.equal(readStick(0,25,40).jump,false);
console.log('Joystick dead zone, left/right, up jump, diagonal jump, and clamped travel passed.');
