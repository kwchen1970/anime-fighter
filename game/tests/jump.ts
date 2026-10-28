import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
const step=(g:ReturnType<typeof newMatch>,end:number)=>{for(let t=g.time+10;t<=end;t+=10){for(const f of g.players)f.input.at=t;advance(g,t);}};
{
 const g=newMatch(0,0);g.players[0].x=1400;g.players[1].x=1560;g.players[0].input.sweep=1;g.players[1].input.jump=1;step(g,600);assert.equal(g.players[1].hp,120,'jump dodges low sweep');
}
{
 const g=newMatch(0,0);g.players[0].x=1400;g.players[1].x=1560;g.players[0].input.sweep=1;step(g,600);assert.equal(g.players[1].hp,103,'grounded sweep hits');
}
{
 const g=newMatch(0,0);g.players[0].x=800;g.players[0].input.jump=1;step(g,1600);assert.equal(g.players[0].y,200,'land on terrace');assert.equal(g.players[0].airborne,false);g.players[0].input.move=1;step(g,2500);g.players[0].input.move=0;step(g,4300);assert.ok((g.players[0].y??0)<200,'fall off ledge onto a lower surface');assert.equal(g.players[0].airborne,false);
}
{
 const g=newMatch(0,0);g.players[0].x=1400;g.players[1].x=1520;g.players[0].input.jump=1;g.players[0].input.move=1;step(g,600);assert.ok(g.players[0].x>g.players[1].x,'can cross above opponent');
}
console.log('Jump and sweep checks passed: dodge, grounded hit, platform landing, ledge fall, crossing opponent.');
