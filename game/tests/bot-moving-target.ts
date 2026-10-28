import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {updateBot,type BotClock} from '../lib/campaign.ts';
import {platformsIn} from '../lib/platforms.ts';
import {nextPlatformStep} from '../lib/platform-route.ts';
for(const direction of [-1,1]){
 const g=newMatch(0,0,2),clock:BotClock={think:0,attack:0,count:0};
 const initial=platformsIn(0,1800,540,540)[0];
 Object.assign(g.players[1],{x:initial.x+initial.width/2,y:initial.y,hp:10000});g.players[0].hp=10000;
 const startX=g.players[1].x;let highest=540;
 for(let t=10;t<32000;t+=20){
  const row=Math.min(7,2+Math.floor(t/4500)),height=200+row*340;
  const column=direction*Math.floor(t/9000);
  const p=platformsIn(column*1950,column*1950+1800,height,height)[0];
  Object.assign(g.players[0],{x:p.x+p.width/2,y:p.y+80,vy:-100,airborne:true,input:{move:0,punch:0,kick:0,at:t}});
  if(t===10)assert(nextPlatformStep(g.players[1],g.players[0]),'airborne target still has a platform route');
  updateBot(g,t,clock);advance(g,t);highest=Math.max(highest,g.players[1].y??0);
 }
 assert(highest>1500,'bot keeps climbing toward moving airborne target');
 assert(direction*(g.players[1].x-startX)>1200,'bot follows horizontal progress instead of repeating old jumps');
}
console.log('PASS: pursuit of moving airborne targets in both horizontal directions');
