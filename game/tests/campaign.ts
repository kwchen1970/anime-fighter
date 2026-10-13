import assert from 'node:assert/strict';
import {STAGES,campaignMatch,nextLevel,updateBot,type BotClock} from '../lib/campaign.ts';
import {advance} from '../lib/game.ts';
for(let i=0;i<STAGES.length;i++) {
 const g=campaignMatch(1000,i);
 assert.equal(g.stage,i);assert.equal(g.players[0].hp,100);assert.equal(g.players[1].hp,STAGES[i].health);
 assert.equal(g.players[1].maxHp,STAGES[i].health);assert.equal(nextLevel(g),null);
 g.winner=1;assert.equal(nextLevel(g),null,'a loss does not skip a stage');
 g.winner=2;assert.equal(nextLevel(g),null,'a tie does not skip a stage');
 g.winner=0;assert.equal(nextLevel(g),i<2?i+1:null,'advance only after victory, stop after finale');
}
assert.ok(STAGES[0].speed<STAGES[1].speed&&STAGES[1].speed<STAGES[2].speed);
assert.ok(STAGES[0].cooldown>STAGES[1].cooldown&&STAGES[1].cooldown>STAGES[2].cooldown);
assert.ok(STAGES[0].reaction>STAGES[1].reaction&&STAGES[1].reaction>STAGES[2].reaction);
for(let i=0;i<3;i++){
 const g=campaignMatch(1000,i),clock:BotClock={think:0,attack:0,count:0};g.players[1].x=g.players[0].x+200;
 updateBot(g,2000,clock);assert.equal(g.players[1].input.punch+g.players[1].input.kick,0,'no attack during countdown');
 for(let t=4000;t<8000;t+=16){updateBot(g,t,clock);advance(g,t);}
 assert.ok(clock.count>0,'bot attacks once match begins');assert.ok(g.players[1].hp<=g.players[1].maxHp!);
}
const finale=campaignMatch(1,2);finale.winner=0;assert.equal(nextLevel(finale),null);
console.log('Campaign checks passed: three distinct stages, rising difficulty, victory progression, retries, finale, and bot timing.');
