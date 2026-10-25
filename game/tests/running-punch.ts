import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
for(const direction of [-1,1]){
 const g=newMatch(0,0),f=g.players[0];g.players[1].x=5000;f.input.move=direction;f.input.punch=1;const start=f.x;
 for(let t=10;t<=350;t+=10){f.input.at=t;advance(g,t);}
 assert.equal(f.action,'punch');assert.ok((f.x-start)*direction>90,'moving punch carries the fighter forward');assert.equal(f.face,direction);
 f.input.move=0;const stopped=f.x;for(let t=360;t<=600;t+=10){f.input.at=t;advance(g,t);}assert.equal(f.x,stopped,'releasing movement stops punch travel');
}
console.log('Running punch works in both directions and stops on movement release.');
