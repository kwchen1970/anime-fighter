import assert from 'node:assert/strict';
import {newMatch,advance,WORLD} from '../lib/game.ts';
const run=(g:ReturnType<typeof newMatch>,until:number)=>{for(let t=g.time+16;t<=until;t+=16){for(const f of g.players)f.input.at=t;advance(g,t);}return g;};
{
 const g=newMatch(0,0);g.players[0].input.move=-1;run(g,6000);assert.equal(g.players[0].x,110);g.players[1].input.move=1;run(g,22000);assert.equal(g.players[1].x,WORLD-110);
}
{
 const g=newMatch(0,0);g.players[1].x=g.players[0].x+130;g.players[0].input.punch=1;run(g,700);assert.equal(g.players[1].hp,90);run(g,1100);assert.equal(g.players[1].hp,90,'one strike must only hit once');
}
{
 const g=newMatch(0,0);g.players[1].x=g.players[0].x+210;g.players[0].input.punch=1;run(g,800);assert.equal(g.players[1].hp,100,'punch out of range');g.players[0].input.kick=1;run(g,1600);assert.equal(g.players[1].hp,83,'kick has longer reach');
}
{
 const g=newMatch(0,3000);g.players[0].input.move=1;run(g,2000);assert.equal(g.players[0].x,1380,'movement locked during countdown');
}
{
 const g=newMatch(0,0);g.players[0].input.move=1;advance(g,1000);assert.equal(g.players[0].x,1380,'stale movement stops');
}
{
 const g=newMatch(0,0);g.players[1].x=g.players[0].x+110;g.players.forEach(f=>{f.hp=10;f.input.punch=1;});run(g,600);assert.equal(g.winner,2,'simultaneous knockout is a tie');
}
console.log('Combat checks passed: arena boundaries, attack range, damage, countdown, stale input, simultaneous KO.');
