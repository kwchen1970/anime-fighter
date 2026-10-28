import assert from 'node:assert/strict';
import {newMatch} from '../lib/game.ts';
import {travelFighter} from '../lib/travel.ts';
const g=newMatch(0,0);Object.assign(g.players[1],{hp:0,y:600,vy:-800,airborne:true,knocked:true,action:'fall',until:5000,stun:5000});
for(const i of [0,1]){const a=travelFighter(g.players[i],i,1000,500),b=travelFighter(g.players[i],i,1100,500);assert.equal(a.action,'run');assert.equal(a.airborne,false);assert.equal(a.knocked,false);assert.equal(a.y,0);assert.ok(b.x>a.x);}
console.log('Both transition fighters run, including a defeated airborne/knocked-down fighter.');
