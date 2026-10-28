import {nextPlatformStep} from './platform-route.ts';
import {catPosition} from './health-cat.ts';
import {newMatch,SPEED,STARTING_HEALTH,type Match} from './game.ts';
import {platformsIn,JUMP_HEIGHT,landingTime,type Platform} from './platforms.ts';
export const STAGES=[
 {name:'Cat Café Street',difficulty:'Easy',image:'/assets/stages/sakura-cat-cafe.png',health:STARTING_HEALTH,speed:.92,reaction:170,cooldown:1300,accent:'#eaa7c4'},
 {name:'Arcade Plaza',difficulty:'Medium',image:'/assets/stages/sakura-arcade.png',health:STARTING_HEALTH,speed:1,reaction:110,cooldown:1000,accent:'#86b6e7'},
 {name:'Shrine Garden',difficulty:'Hard',image:'/assets/stages/sakura-shrine.png',health:STARTING_HEALTH,speed:1.05,reaction:70,cooldown:820,accent:'#b497e4'},
] as const;
export function campaignMatch(now:number,level:number):Match {
 const index=Math.max(0,Math.min(STAGES.length-1,level));
 const g=newMatch(now,3000,index),profile=STAGES[index];
 g.botSlot=1;g.players[1].hp=profile.health;g.players[1].maxHp=profile.health;g.players[1].speed=profile.speed;
 return g;
}
export function nextLevel(g:Match):number|null {
 return g.winner===0&&(g.stage??0)<STAGES.length-1?(g.stage??0)+1:null;
}
export type BotClock={think:number;attack:number;count:number;seekingCat?:boolean;lastDodge?:number;evadeUntil?:number;counterUntil?:number;waypoint?:{x:number;y:number;at:number}};
const landingInset=120;
const safeLanding=(p:Platform,x:number)=>Math.max(p.x+landingInset,Math.min(p.x+p.width-landingInset,x));
const inside=(x:number,p:Platform)=>x>=p.x&&x<=p.x+p.width;
export function shouldSeekHealthCat(g:Match,now:number){
 const bot=g.players[1],opponent=g.players[0];if(!g.healthCat||bot.hp/(bot.maxHp??100)>.25)return false;
 const cat=catPosition(g.healthCat,now),horizontal=Math.abs(cat.x-bot.x),vertical=Math.abs(cat.y-150-(bot.y??0));
 const inCombat=Math.abs(opponent.x-bot.x)<280&&Math.abs((opponent.y??0)-(bot.y??0))<140;
 return bot.hp/(bot.maxHp??100)<=.15||(!inCombat&&horizontal<600&&vertical<350);
}
export function updateBot(g:Match,now:number,clock:BotClock) {
 const bot=g.players[1],opponent=g.players[0],profile=STAGES[g.stage??0];
 bot.input.at=now;
 if(now<g.start||g.winner!==null){bot.input.move=0;return;}
 const cat=g.healthCat?catPosition(g.healthCat,now):null;
 const seekingCat=shouldSeekHealthCat(g,now);
 if(clock.seekingCat!==seekingCat){clock.waypoint=undefined;clock.seekingCat=seekingCat;}
 if(cat&&g.healthCat){cat.x+=(g.healthCat.vx??0)*.16;}
 const you=seekingCat&&cat?{...opponent,x:cat.x,y:Math.max(0,cat.y-150)}:opponent;
 const by=bot.y??0,ty=you.y??0,distance=Math.abs(you.x-bot.x),direction=Math.sign(you.x-bot.x);
 // After repeated edge knockbacks, brace briefly on the next approach.
 if(!seekingCat&&bot.airborne&&(bot.vy??0)>0&&bot.stun<=now&&(bot.ledgePressure??0)>=2&&Math.abs(ty-by)<190&&distance<360&&now>=(bot.guardReadyAt??0)){
  bot.knockback=0;bot.guardUntil=now+750;bot.guardReadyAt=now+8000;bot.ledgePressure=1;
 }
 // Air steering has its own short cadence, so the bot can brake above a ledge.
 if(bot.jumpLaunchAt&&bot.jumpLaunchAt>now)return;
 if(bot.airborne){
  // Drop a stale flight target after a missed landing. Do not steer back
  // toward a platform above us that we can no longer reach this jump.
  if(clock.waypoint&&((now-clock.waypoint.at)>1800||((bot.vy??0)<0&&by<clock.waypoint.y-35)))clock.waypoint=undefined;
  const target=clock.waypoint?.x??you.x;
  bot.input.move=Math.abs(target-bot.x)>20?Math.sign(target-bot.x):0;return;
 }
 if(bot.stun>now||bot.until>now)return;
 if(!seekingCat&&(bot.guardUntil??0)>now&&distance<235&&Math.abs(ty-by)<100){bot.input.move=direction;bot.input.kick++;clock.attack=now;return;}
 // Finish the landing before choosing another step; never plan from a ledge lip.
 if(clock.waypoint&&now-clock.waypoint.at>2200)clock.waypoint=undefined;
 if(clock.waypoint&&Math.abs(by-clock.waypoint.y)<2){
  const delta=clock.waypoint.x-bot.x;
  if(Math.abs(delta)>28){bot.input.move=Math.sign(delta);return;}
  bot.input.move=0;
 }
 if(now-clock.think<Math.min(180,profile.reaction))return;
 clock.think=now;clock.waypoint=undefined;
 if(!seekingCat&&(clock.evadeUntil??0)>now){bot.input.move=-direction;return;}
 const incoming=['punch','kick'].includes(you.action)&&you.until>now&&now-you.started<230;
 if(!seekingCat&&incoming&&Math.abs(ty-by)<90&&distance<(you.action==='kick'?245:180)&&now-(clock.lastDodge??-2000)>1500){clock.lastDodge=now;clock.evadeUntil=now+(g.stage===0?140:220);clock.counterUntil=now+1000;bot.input.move=-direction;return;}

 // The cat is in open air, not necessarily above a platform. Intercept it
 // directly when one ordinary jump can reach it instead of waiting for a ledge.
 if(seekingCat&&ty>by+45&&ty-by<JUMP_HEIGHT-25&&distance<SPEED*landingTime(ty-by)*.78){
  clock.waypoint={x:you.x,y:-1,at:now};bot.input.move=distance>20?direction:0;bot.input.jump=(bot.input.jump??0)+1;return;
 }
 if(!seekingCat&&(Math.abs(ty-by)>80||distance>300)){
  const step=nextPlatformStep(bot,opponent);
  if(step){
   if(step.y<by-2){clock.waypoint={x:step.x,y:step.y,at:now};bot.input.move=Math.sign(step.dropX-bot.x);return;}
   const flight=landingTime(step.y-by),reach=SPEED*flight*.85-20;
   if(Math.abs(step.x-bot.x)<=reach){clock.waypoint={x:step.x,y:step.y,at:now};bot.input.move=Math.abs(step.x-bot.x)>20?Math.sign(step.x-bot.x):0;bot.input.jump=(bot.input.jump??0)+1;}
   else bot.input.move=Math.abs(step.launchX-bot.x)>8?Math.sign(step.launchX-bot.x):0;
   return;
  }
 }
 if(ty>by+80){
  // Choose a reachable step toward the target, not a jump straight at its feet.
  const candidates=platformsIn(bot.x-650,bot.x+650,by+60,seekingCat?by+JUMP_HEIGHT-28:Math.min(ty+25,by+JUMP_HEIGHT-28));
  const options=candidates.map(platform=>{
   const landingX=safeLanding(platform,bot.x);
   const flight=landingTime(platform.y-by),travel=Math.abs(landingX-bot.x);
   return {platform,landingX,travel,reachable:travel<SPEED*flight*.85-20,score:Math.abs(ty-platform.y)+Math.abs(you.x-landingX)*.22+travel*.08};
  }).filter(option=>option.reachable).sort((a,b)=>a.score-b.score);
  if(options.length){const step=options[0];clock.waypoint={x:step.landingX,y:step.platform.y,at:now};bot.input.move=Math.abs(step.landingX-bot.x)>20?Math.sign(step.landingX-bot.x):0;bot.input.jump=(bot.input.jump??0)+1;return;}
  // With wider gaps, first walk toward a launch edge instead of jumping
  // repeatedly from an unreachable point directly below the opponent.
  const approach=candidates.map(platform=>safeLanding(platform,bot.x)).sort((a,b)=>Math.abs(a-bot.x)-Math.abs(b-bot.x))[0];
  const support=platformsIn(bot.x,bot.x,by-1,by+1).find(p=>inside(bot.x,p));
  const launch=approach===undefined?bot.x: support?Math.max(support.x+40,Math.min(support.x+support.width-40,approach)):approach;
  if(seekingCat&&(approach===undefined||Math.abs(launch-bot.x)<=8)){
   // If the current edge cannot reach an upper step, route sideways/down
   // rather than freeze there while the cat flies away.
   const routes=platformsIn(bot.x-700,bot.x+700,Math.max(0,by-400),by+JUMP_HEIGHT-28).filter(p=>Math.abs(p.y-by)>2||!inside(bot.x,p)).map(p=>{
    const x=safeLanding(p,you.x),flight=landingTime(p.y-by);
    return {x,y:p.y,reachable:Math.abs(x-bot.x)<SPEED*flight*.85-20,score:Math.abs(x-you.x)+Math.abs(p.y-ty)*.5};
   }).filter(p=>p.reachable).sort((a,b)=>a.score-b.score);
   if(routes.length){clock.waypoint={x:routes[0].x,y:routes[0].y,at:now};bot.input.move=Math.sign(routes[0].x-bot.x);bot.input.jump=(bot.input.jump??0)+1;return;}
   bot.input.move=direction;return;
  }
  bot.input.move=Math.abs(launch-bot.x)>8?Math.sign(launch-bot.x):0;return;
 }
 if(by>ty+130){
  const support=platformsIn(bot.x,bot.x,by-1,by+1).find(p=>inside(bot.x,p));
  if(support){const left=support.x-50,right=support.x+support.width+50;bot.input.move=Math.sign((Math.abs(you.x-left)<Math.abs(you.x-right)?left:right)-bot.x);return;}
 }
 if(seekingCat&&distance<100&&Math.abs(ty-by)<100){bot.input.move=distance>25?direction:0;return;}
 // Traverse holes between ledges and chase across neighboring platforms.
 if(by>0&&distance>220){
  const ahead=bot.x+direction*100;
  const floorAhead=platformsIn(ahead,ahead,by-1,by+1).length>0;
  if(!floorAhead){const next=platformsIn(bot.x-600,bot.x+600,by-170,by+300).filter(p=>direction*(p.x+p.width/2-bot.x)>100).sort((a,b)=>Math.abs(a.x+a.width/2-you.x)-Math.abs(b.x+b.width/2-you.x))[0];
   if(next){const target=safeLanding(next,bot.x+direction*300);clock.waypoint={x:target,y:next.y,at:now};bot.input.jump=(bot.input.jump??0)+1;bot.input.move=Math.sign(target-bot.x);return;}}
 }
 if(!seekingCat&&you.action==='sweep'&&you.until>now&&distance<260){bot.input.jump=(bot.input.jump??0)+1;clock.waypoint={x:you.x+direction*100,y:ty,at:now};bot.input.move=direction;return;}
 if(!seekingCat&&(g.stage??0)===2&&you.until>now&&you.action==='kick'&&distance<235&&clock.count%3===0)bot.input.move=-direction;
 else bot.input.move=seekingCat?(distance>25?direction:0):distance>175?direction:distance<100?-direction:0;
 if(!seekingCat&&now-clock.attack>=((clock.counterUntil??0)>now?Math.min(750,profile.cooldown):profile.cooldown)&&distance<235&&Math.abs(ty-by)<100){
  clock.attack=now;clock.count++;
  if(clock.count%3===0)bot.input.sweep=(bot.input.sweep??0)+1;
  else if(distance>145||clock.count%2===0)bot.input.kick++;
  else bot.input.punch++;
 }
}
