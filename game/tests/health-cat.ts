import assert from 'node:assert/strict';
import {newMatch as makeMatch} from '../lib/game.ts';
import {updateHealthCat,catCatchable,catPosition,type HealthCat} from '../lib/health-cat.ts';
import {updateBot,shouldSeekHealthCat} from '../lib/campaign.ts';
const newMatch=(...args:Parameters<typeof makeMatch>)=>{const g=makeMatch(...args);for(const f of g.players){f.hp=100;f.maxHp=100;}return g;};
const g=newMatch(0,0);updateHealthCat(g,6000);assert.equal(g.healthCat,undefined,'healthy fighters do not spawn cat');
g.players[0].hp=26;updateHealthCat(g,6100);assert.equal(g.healthCat,undefined);
g.players[0].hp=25;updateHealthCat(g,6200);assert.ok(g.healthCat,'25% health spawns cat');
const cat=g.healthCat as unknown as HealthCat;cat.x=1000;cat.y=150;cat.updatedAt=6300;g.players[0].x=1000;g.players[0].y=0;g.players[1].x=2500;
updateHealthCat(g,6300);assert.ok(g.healthCat,'initial contact cannot collect cat');assert.equal(g.players[0].hp,25);
for(let i=0;i<3;i++){
 const near=8000+i*2000;cat.updatedAt=near;g.players[0].x=cat.x-150;updateHealthCat(g,near);assert.equal(cat.escaping,true);
 cat.updatedAt=near+100;g.players[0].x=cat.x-600;updateHealthCat(g,near+100);assert.equal(cat.evasions,i+1);
}
assert.equal(catCatchable(cat,13000),false,'three dodges still require eight seconds');assert.equal(catCatchable(cat,15000),true);
cat.updatedAt=15000;const p=catPosition(cat,15000);g.players[0].x=p.x;g.players[0].y=p.y-150;updateHealthCat(g,15000);assert.equal(g.players[0].hp,65);assert.equal(g.healthCat,undefined);assert.equal(g.players[0].healFlash,15650);
updateHealthCat(g,15100);assert.equal(g.healthCat,undefined,'cooldown');
g.healthCat={x:3000,y:150,born:0,expires:40000,updatedAt:16000};g.players[1].hp=15;g.players[1].x=2700;g.players[0].x=2000;updateBot(g,16000,{think:0,attack:0,count:0});assert.equal(g.players[1].input.move,1);
const saved=JSON.parse(JSON.stringify(g));updateHealthCat(g,16017);updateHealthCat(saved,16017);assert.deepEqual(g.healthCat,saved.healthCat,'shared motion and evasion state serialize');
console.log('Low health spawn, three real evasions, minimum chase time, locked contact, healing, cooldown and bot pursuit passed.');

assert.equal(shouldSeekHealthCat(g,16017),true,'critically hurt bot takes nearby opportunity');
g.players[1].hp=26;assert.equal(shouldSeekHealthCat(g,16017),false,'does not abandon fight at moderate health');
g.players[1].hp=20;g.players[1].x=2300;assert.equal(shouldSeekHealthCat(g,16017),false,'no distant cat chase above critical health');
g.players[1].x=2700;g.players[0].x=2600;assert.equal(shouldSeekHealthCat(g,16017),false,'nearby opponent takes priority above critical health');
g.players[1].hp=15;assert.equal(shouldSeekHealthCat(g,16017),true,'critical bot pursues cat even during combat');g.players[1].x=1000;assert.equal(shouldSeekHealthCat(g,16017),true,'critical bot pursues distant cat');
console.log('Bot health threshold, convenient distance and combat priority passed.');

const touch=newMatch(0,0);touch.players[0].hp=10;touch.players[0].x=1000;touch.players[1].x=2000;touch.healthCat={x:1045,y:150,born:0,expires:40000,updatedAt:12000,evasions:3};updateHealthCat(touch,12000);assert.equal(touch.players[0].hp,50,'clear body contact heals once ready');assert.equal(touch.healthCat,undefined);
console.log('Visible body contact pickup passed.');

const brush=newMatch(0,0);brush.players[0].hp=10;brush.players[0].x=1000;brush.players[1].x=2000;brush.healthCat={x:1065,y:150,born:0,expires:40000,updatedAt:12000,evasions:3};updateHealthCat(brush,12000);assert.equal(brush.players[0].hp,10,'slight edge brush does not collect');assert.ok(brush.healthCat);
console.log('Balanced pickup: body touch counts, outer brush does not.');

const assisted=newMatch(0,0);assisted.botSlot=1;assisted.players[1].hp=10;assisted.players[0].x=1000;assisted.players[1].x=2000;assisted.healthCat={x:2065,y:150,born:0,expires:40000,updatedAt:4000,evasions:1};updateHealthCat(assisted,4000);assert.equal(assisted.players[1].hp,50,'solo bot heals after one escape with a larger pickup area');
const human=newMatch(0,0);human.botSlot=1;human.players[0].hp=10;human.players[0].x=1000;human.players[1].x=2000;human.healthCat={x:1000,y:150,born:0,expires:40000,updatedAt:4000,evasions:1};updateHealthCat(human,4000);assert.equal(human.players[0].hp,10,'human still needs three escapes and eight seconds');
console.log('Solo bot healing advantage and unchanged human rules passed.');

// A floating target between platform tiers needs an interception jump, not a
// nonexistent platform at the cat's height.
const floating=newMatch(0,0);floating.botSlot=1;floating.players[1].hp=10;floating.players[1].x=1450;floating.players[1].y=200;floating.players[0].x=2200;floating.healthCat={x:1500,y:450,born:0,expires:40000,updatedAt:12000};
updateBot(floating,12000,{think:0,attack:0,count:0});assert.equal(floating.players[1].input.jump,1,'jump to intercept cat between tiers');
const edge=newMatch(0,0);edge.botSlot=1;edge.players[1].hp=10;edge.players[1].x=1805;edge.players[1].y=200;edge.players[0].x=2200;edge.healthCat={x:2300,y:1100,born:0,expires:40000,updatedAt:12000};
updateBot(edge,12000,{think:0,attack:0,count:0});assert.ok(edge.players[1].input.move!==0||edge.players[1].input.jump,'keep routing instead of waiting at unreachable edge');
console.log('Cat interception between tiers and edge routing passed.');
