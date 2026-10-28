import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {updateBot} from '../lib/campaign.ts';
import {platformsIn,JUMP_HEIGHT,ROW_HEIGHT,PLATFORM_STRIDE} from '../lib/platforms.ts';
assert.ok(JUMP_HEIGHT>ROW_HEIGHT,'every adjacent tier is reachable');assert.equal(ROW_HEIGHT,340);assert.equal(PLATFORM_STRIDE,1950);
assert.ok(platformsIn(-50000,-48000,100000,101000).length>0,'platforms continue high up and far left');assert.ok(platformsIn(50000,52000,0,1500).length>0,'platforms continue far right');

assert.deepEqual(platformsIn(1200,2800,0,1500),platformsIn(1200,2800,0,1500),'generation is deterministic');
// The target waits far above the starting point. Verify consecutive climbing,
// including a landing on each step, without teleporting or extra bot jump power.
for(const level of [0,1,2]){
 const g=newMatch(0,0,level);g.end=100000;const perch=platformsIn(800,1800,2900,3000)[0];g.players[0].x=perch.x+perch.width/2;g.players[0].y=perch.y;g.players[0].airborne=false;
 const clock={think:0,attack:0,count:0};let max=0;
 for(let t=10;t<=50000;t+=10){const target=g.players[0];target.y=perch.y;target.vy=0;target.airborne=false;target.input.at=t;updateBot(g,t,clock);advance(g,t);max=Math.max(max,g.players[1].y??0);if(max>=perch.y-5)break;}
 assert.ok(max>=perch.y-5,`level ${level} bot climbs sequentially; reached ${max}`);
}
// A rising fighter passes through both lower ledges and lands on the second row.
{
 const g=newMatch(0,0);const f=g.players[0];f.x=500;f.input.jump=1;let top=0;
 for(let t=10;t<=1800;t+=10){f.input.at=t;advance(g,t);top=Math.max(top,f.y??0);}
 assert.ok(top>350);assert.equal(f.y,200);assert.equal(f.airborne,false);
}
console.log('Infinite platform generation, jump-through landing, higher jump, and sequential bot climbing passed.');
// Landing waypoints use a safe inset, rather than the edge that caused slips.
{
 const g=newMatch(0,0);g.players[0].x=1500;g.players[0].y=880;
 const clock:{think:number;attack:number;count:number;waypoint?:{x:number;y:number;at:number}}={think:0,attack:0,count:0};
 updateBot(g,200,clock);
 if(clock.waypoint){const w=clock.waypoint,p=platformsIn(w.x,w.x,w.y,w.y)[0];assert.ok(w.x>=p.x+119&&w.x<=p.x+p.width-119,'aim inside platform');}
 clock.waypoint={x:1500,y:200,at:200};g.players[1].x=1400;g.players[1].y=200;g.players[1].airborne=false;g.players[1].input.jump=0;
 updateBot(g,400,clock);assert.equal(g.players[1].input.move,1);assert.equal(g.players[1].input.jump,0,'finish moving into landing before another jump');
}
