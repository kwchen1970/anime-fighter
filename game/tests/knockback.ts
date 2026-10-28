import assert from 'node:assert/strict';
import {newMatch,advance,WORLD} from '../lib/game.ts';
for(const direction of [-1,1]){
 const g=newMatch(0,0),attacker=g.players[0],victim=g.players[1];attacker.x=2000;victim.x=2000+direction*130;attacker.input.punch=1;
 for(let t=16;t<=272;t+=16){attacker.input.at=t;advance(g,t);}
 assert.equal(victim.hp,110);assert.ok((victim.knockback??0)*direction>0);const start=victim.x;
 advance(g,288);const first=(victim.x-start)*direction;assert.ok(first>0&&first<15,'knockback begins with a small slide rather than teleporting');
 for(let t=304;t<=800;t+=16)advance(g,t);
 const total=(victim.x-start)*direction;assert.ok(total>55&&total<85,'slide eases out over a controlled distance');assert.equal(victim.hp,110);assert.ok(g.players.every(f=>f.x>=110&&f.x<=WORLD-110));
}
console.log('Knockback: both directions slide gradually, ease out, and preserve single-hit damage.');
