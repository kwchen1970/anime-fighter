import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {pauseMatch,resumeMatch} from '../lib/pause.ts';
const g=newMatch(1000,0);Object.assign(g.players[0],{action:'punch',started:1050,until:1830,flash:1400,y:50,vy:300,airborne:true});g.healthCat={x:1500,y:300,born:1100,expires:41100,updatedAt:1200,evasions:1};g.time=1200;
assert.ok(pauseMatch(g,1,1200));const frozen=JSON.stringify(g);advance(g,10000);assert.equal(JSON.stringify(g),frozen,'pause freezes physics, health, and cat');assert.equal(resumeMatch(g,0,10000),false,'other player cannot resume');assert.equal(JSON.stringify(g),frozen);
assert.ok(resumeMatch(g,1,10000));assert.equal(g.players[0].started,9850);assert.equal(g.players[0].until,10630);assert.equal(g.healthCat?.born,9900);assert.equal(g.healthCat?.expires,49900);assert.equal(g.time,10000);assert.equal(g.pausedAt,undefined);advance(g,10016);assert.ok(g.players[0].y!>50,'resume continues midair action');
const countdown=newMatch(1000,3000);pauseMatch(countdown,0,2000);resumeMatch(countdown,0,12000);assert.equal(countdown.start,14000,'countdown remaining time survives pause');
console.log('Shared pause freezes simulation; only its owner resumes; attacks, cat lifetimes and countdown preserve remaining time.');
