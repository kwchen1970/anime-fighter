import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {updateBot,type BotClock} from '../lib/campaign.ts';
for(const side of [-1,1])for(const level of [0,1,2]){
 const g=newMatch(0,0,level);g.botSlot=1;const b=g.players[1],p=g.players[0];b.x=1500;p.x=b.x+side*85;b.face=-side;
 const clock:BotClock={think:0,attack:-5000,count:1};updateBot(g,200,clock);advance(g,200);
 assert.equal(b.face,side,'bot attacks toward close opponent after facing away');
 b.action='kick';b.started=200;b.until=1140;b.hit=false;b.input.move=0;p.x=b.x-side*85;
 updateBot(g,450,clock);assert.equal(b.face,-side,'bot turns when opponent crosses behind during attack');
 advance(g,600);assert(p.hp<120,'turned kick can hit opponent');
}
console.log('PASS: close-range bot turns and hits on either side at all difficulties');
