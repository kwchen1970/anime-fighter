import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {updateBot,STAGES} from '../lib/campaign.ts';
{
 const g=newMatch(0,0,2),clock={think:0,attack:0,count:0};g.players[0].x=1400;g.players[1].x=1550;g.players[0].action='punch';g.players[0].started=0;g.players[0].until=780;
 updateBot(g,80,clock);assert.equal(g.players[1].input.move,1,'backs away from punch windup');
}
{
 const g=newMatch(0,0,2),clock={think:0,attack:0,count:0};let count=0;
 for(let t=10;t<=20000&&g.winner===null;t+=10){const you=g.players[0];you.input.at=t;if(you.until<=t&&you.stun<=t)you.input.punch=++count;updateBot(g,t,clock);advance(g,t);}
 assert.ok(g.players[0].hp<50,'maintains pressure against stationary punch spam');
}
assert.ok(STAGES.every(stage=>stage.cooldown<=1300&&stage.health===100));
console.log('Bot: attack evasion, counter pressure, and tougher solo profiles passed.');
