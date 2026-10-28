import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {updateBot,type BotClock} from '../lib/campaign.ts';
import {platformsIn} from '../lib/platforms.ts';
// Stationary targets with an intervening platform, in either direction and
// several tiers: the bot must actually land on the target, not merely jump high.
let cases=0;
for(const level of [0,1,2])for(const row of [2,3,5])for(const column of [-1,0,1]){
 const height=200+row*340,target=platformsIn(column*1950,column*1950+1800,height,height)[0];
 const lower=platformsIn(column*1950,column*1950+1800,height-680,height-680)[0];
 const g=newMatch(0,0,level);g.end=120000;g.players[0].hp=10000;g.players[1].hp=10000;g.players[1].x=lower.x+lower.width/2;g.players[1].y=lower.y;
 const clock:BotClock={think:0,attack:0,count:0};let reached=false;
 for(let t=10;t<45000;t+=10){Object.assign(g.players[0],{x:target.x+target.width/2,y:target.y,vy:0,airborne:false});updateBot(g,t,clock);advance(g,t);const b=g.players[1];if(!b.airborne&&Math.abs((b.y??0)-target.y)<1&&Math.abs(b.x-g.players[0].x)<235){reached=true;break;}}
 assert.ok(reached,`route reaches stationary opponent: level ${level}, row ${row}, column ${column}`);cases++;
}
console.log(`${cases} stationary-platform pursuit routes passed without alternating-platform loops.`);

let drops=0;
for(const level of [0,1,2])for(const gap of [340,680])for(const column of [-1,0,1]){
 const target=platformsIn(column*1950,column*1950+1800,540,540)[0];
 const upper=platformsIn(column*1950,column*1950+1800,540+gap,540+gap)[0];
 const g=newMatch(0,0,level);g.end=120000;g.players[0].hp=10000;g.players[1].hp=10000;g.players[1].x=upper.x+upper.width/2;g.players[1].y=upper.y;
 const clock:BotClock={think:0,attack:0,count:0};let reached=false;
 for(let t=10;t<45000;t+=10){Object.assign(g.players[0],{x:target.x+target.width/2,y:target.y,vy:0,airborne:false});updateBot(g,t,clock);advance(g,t);const b=g.players[1];if(!b.airborne&&Math.abs((b.y??0)-target.y)<1&&Math.abs(b.x-g.players[0].x)<235){reached=true;break;}}
 assert.ok(reached,`downward route: level ${level}, gap ${gap}, column ${column}`);drops++;
}
console.log(`${drops} downward pursuit routes reached the lower opponent.`);
const descend=newMatch(0,0);descend.players[0].x=1400;descend.players[0].y=540;descend.players[1].x=500;descend.players[1].y=880;updateBot(descend,200,{think:0,attack:0,count:0});assert.equal(descend.players[1].input.jump??0,0,'start downward route by walking off rather than jumping in place');assert.notEqual(descend.players[1].input.move,0);
