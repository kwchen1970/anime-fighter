import assert from 'node:assert/strict';
import {newMatch,advance,SPEED} from '../lib/game.ts';
import {JUMP_SPEED,GRAVITY,JUMP_HEIGHT,ROW_HEIGHT} from '../lib/platforms.ts';
import {projectVertical} from '../lib/view.ts';
import {JUMP_AIR_MS} from '../lib/jump-timing.ts';
const g=newMatch(0,0);g.players[0].input.move=-1;
for(let t=10;t<=1000;t+=10){g.players[0].input.at=t;advance(g,t);}
assert.ok(Math.abs(g.players[0].x-(1380-SPEED))<.01,'full running speed without added acceleration delay');
assert.equal(SPEED,560);assert.ok(JUMP_HEIGHT>480&&JUMP_HEIGHT<500,'preserve height and platform reach');assert.ok(JUMP_HEIGHT>ROW_HEIGHT);assert.ok(2*JUMP_SPEED/GRAVITY<1.1,'faster rise and fall');assert.ok(Math.abs(JUMP_AIR_MS-2000*JUMP_SPEED/GRAVITY)<1,'animation matches jump duration');
console.log('Faster running and jump cadence preserve platform reach and animation timing.');

const jumper={...g.players[0],x:1400,y:100,vy:1000,airborne:true,action:'jump'};
assert.ok((projectVertical(jumper,.05,500).y??0)>100,'jump position advances between packets');
const falling={...jumper,x:1400,y:25,vy:-1000};assert.equal(projectVertical(falling,.1,500).y,0,'prediction respects ground landing');
