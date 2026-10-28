import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {punchLungeWindow,punchTravelFactor,punchLift} from '../lib/punch-timing.ts';
for(const slot of [0,1])for(const direction of [-1,1]){
 const g=newMatch(0,0),f=g.players[slot];g.players[1-slot].x=5000;f.input.move=direction;f.input.punch=1;const start=f.x;
 const {start:takeoff,end:landing}=punchLungeWindow(slot);
 for(let t=5;t<takeoff;t+=5){f.input.at=t;advance(g,t);}
 assert.equal(f.x,start,'feet-planted frames do not slide');
 for(let t=Math.ceil(takeoff/5)*5;t<=landing+10;t+=5){f.input.at=t;advance(g,t);}
 assert.ok((f.x-start)*direction>140,'frames seven and eight give a forward lunge');assert.equal(f.face,direction);
 const stopped=f.x;for(let t=Math.ceil((landing+15)/5)*5;t<770;t+=5){f.input.at=t;advance(g,t);}assert.equal(f.x,stopped,'planted recovery frames stay put');
 assert.equal(punchTravelFactor(slot,100),0);assert.equal(punchTravelFactor(slot,700),0);
}
const released=newMatch(0,0);released.players[1].x=5000;const f=released.players[0];f.input.move=1;f.input.punch=1;for(let t=5;t<=480;t+=5){f.input.at=t;advance(released,t);}f.input.move=0;const x=f.x;for(let t=485;t<=650;t+=5){f.input.at=t;advance(released,t);}assert.equal(f.x,x,'release stops lunge');
console.log('Both fighters lunge only during frames seven/eight; planted feet and recovery stay still, and releasing stops travel.');
for(const slot of [0,1]){
 const g=newMatch(0,0),a=g.players[slot],b=g.players[1-slot];a.x=1000;b.x=1240;a.input.move=1;a.input.punch=1;
 const w=punchLungeWindow(slot);
 for(let t=5;t<780;t+=5){a.input.at=t;advance(g,t);if(t<w.start)assert.equal(b.hp,120,'no moving-punch hit before the lunge');}
 assert.equal(b.hp,110,'lunge connects once during airborne punch frames');
}
console.log('Running punch hit detection follows the lunge for both fighters.');
for(const slot of [0,1]){
 const g=newMatch(0,0),f=g.players[slot];g.players[1-slot].x=5000;f.input.punch=1;const start=f.x;for(let t=5;t<=770;t+=5){f.input.at=t;advance(g,t);}assert.ok(f.x-start>55&&f.x-start<80,'standing punch has a modest automatic lunge');
}

for(const slot of [0,1]){const w=punchLungeWindow(slot),middle=(w.start+w.end)/2;assert.ok(Math.abs(punchLift(slot,middle,true)-44)<.01);assert.equal(punchLift(slot,100,true),0);assert.equal(punchLift(slot,700,true),0);assert.ok(punchLift(slot,middle,true)>punchLift(slot,middle,false));}
console.log('Punch hop peaks on airborne frames and settles before planted recovery.');
