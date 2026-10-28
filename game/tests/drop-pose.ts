import assert from 'node:assert/strict';
import {newMatch,advance} from '../lib/game.ts';
import {dropFrame} from '../lib/drop-pose.ts';
import {platformsIn} from '../lib/platforms.ts';
for(const slot of [0,1]){
 const g=newMatch(0,0),f=g.players[slot];g.players[1-slot].x=5000;f.x=1400;f.y=500;f.airborne=false;
 advance(g,16);assert.equal(f.slipping,true);assert.equal(dropFrame(f,16),1,'frame two while falling');
 let landed=0;for(let t=32;t<1200;t+=16){advance(g,t);if(!f.airborne){landed=t;break;}assert.equal(dropFrame(f,t),1);}
 assert.ok(landed);assert.equal(f.y,0);assert.equal(dropFrame(f,landed),2,'frame three on ground');assert.equal(dropFrame(f,landed+110),null,'normal control resumes');
 const p=platformsIn(50,900,200,200)[0];const ledge=newMatch(0,0);Object.assign(ledge.players[slot],{x:p.x+300,y:450,airborne:false});ledge.players[1-slot].x=5000;
 for(let t=16;t<1200;t+=16){advance(ledge,t);if(!ledge.players[slot].airborne){assert.equal(ledge.players[slot].y,200);assert.equal(dropFrame(ledge.players[slot],t),2);break;}}
}
const jump=newMatch(0,0);jump.players[0].input.jump=1;advance(jump,100);assert.equal(dropFrame(jump.players[0],100),null,'intentional jumps keep their somersault animation');
console.log('Both fighters hold fall frame two until ground/platform contact, then show frame three; jumps remain separate.');

for(const slot of [0,1]){
 const g=newMatch(0,0),f=g.players[slot];g.players[1-slot].x=5000;Object.assign(f,{x:1400,y:500,airborne:false,until:600});
 f.input.move=-1;f.input.at=16;advance(g,16);assert.equal(f.face,-1,'fall faces left even during unfinished action');
 f.input.move=1;f.input.at=32;advance(g,32);assert.equal(f.face,1,'fall turns right on direction change');
 f.input.move=-1;f.input.at=48;advance(g,48);f.input.move=0;
 let landed=0;for(let t=64;t<1200;t+=16){f.input.at=t;advance(g,t);if(!f.airborne){landed=t;break;}}
 assert.ok(landed);assert.equal(f.face,-1,'landing retains last falling direction instead of turning to opponent');
}
console.log('Both fall sprites follow left/right input and retain their last direction on landing.');

for(const slot of [0,1]){
 const g=newMatch(0,0),victim=g.players[slot],attacker=g.players[1-slot],p=platformsIn(50,900,200,200)[0];
 Object.assign(victim,{x:p.x+p.width-10,y:p.y,airborne:false});Object.assign(attacker,{x:victim.x-160,y:p.y,airborne:false,action:'kick',started:0,until:940,face:1});
 let fell=false,landed=false;
 for(let t=10;t<1500;t+=10){advance(g,t);if(victim.airborne){fell=true;assert.equal(victim.knocked,undefined,'ordinary kick is not a strong knockdown');assert.equal(dropFrame(victim,t),1,'ordinary kick off ledge uses fall pose even during stun');}else if(fell){assert.equal(dropFrame(victim,t),2,'frame three on landing from ordinary hit');landed=true;break;}}
 assert.ok(fell&&landed,'ordinary kick pushes fighter off ledge and onto ground');
 const midair=newMatch(0,0),v=midair.players[slot],a=midair.players[1-slot];Object.assign(v,{x:1450,y:300,vy:200,airborne:true});Object.assign(a,{x:1300,y:300,vy:200,airborne:true,action:'kick',started:0,until:940,face:1});midair.time=340;advance(midair,350);assert.equal(dropFrame(v,350),1,'normal hit while already airborne switches to fall pose');
}
console.log('Ordinary hits off platforms or in midair use regular fall and landing poses; strong knockdown remains separate.');
