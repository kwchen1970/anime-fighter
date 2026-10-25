import {newMatch,SPEED,type Match} from './game.ts';
import {platformsIn,JUMP_HEIGHT,landingTime,type Platform} from './platforms.ts';
export const STAGES=[
 {name:'Cat Café Street',difficulty:'Easy',image:'/assets/stages/sakura-cat-cafe.png',health:100,speed:.92,reaction:170,cooldown:1300,accent:'#eaa7c4'},
 {name:'Arcade Plaza',difficulty:'Medium',image:'/assets/stages/sakura-arcade.png',health:100,speed:1,reaction:110,cooldown:1000,accent:'#86b6e7'},
 {name:'Shrine Garden',difficulty:'Hard',image:'/assets/stages/sakura-shrine.png',health:100,speed:1.05,reaction:70,cooldown:820,accent:'#b497e4'},
] as const;
export function campaignMatch(now:number,level:number):Match {
 const index=Math.max(0,Math.min(STAGES.length-1,level));
 const g=newMatch(now,3000,index),profile=STAGES[index];
 g.players[1].hp=profile.health;g.players[1].maxHp=profile.health;g.players[1].speed=profile.speed;
 return g;
}
export function nextLevel(g:Match):number|null {
 return g.winner===0&&(g.stage??0)<STAGES.length-1?(g.stage??0)+1:null;
}
export type BotClock={think:number;attack:number;count:number;lastDodge?:number;evadeUntil?:number;counterUntil?:number;waypoint?:{x:number;y:number;at:number}};
const inside=(x:number,p:Platform)=>x>=p.x&&x<=p.x+p.width;
export function updateBot(g:Match,now:number,clock:BotClock) {
 const bot=g.players[1],you=g.players[0],profile=STAGES[g.stage??0];
 bot.input.at=now;
 if(now<g.start||g.winner!==null){bot.input.move=0;return;}
 const by=bot.y??0,ty=you.y??0,distance=Math.abs(you.x-bot.x),direction=Math.sign(you.x-bot.x);
 // Air steering has its own short cadence, so the bot can brake above a ledge.
 if(bot.airborne){
  const target=clock.waypoint?.x??you.x;
  bot.input.move=Math.abs(target-bot.x)>20?Math.sign(target-bot.x):0;return;
 }
 if(bot.stun>now||bot.until>now)return;
 if(now-clock.think<Math.min(180,profile.reaction))return;
 clock.think=now;clock.waypoint=undefined;
 if((clock.evadeUntil??0)>now){bot.input.move=-direction;return;}
 const incoming=['punch','kick'].includes(you.action)&&you.until>now&&now-you.started<230;
 if(incoming&&Math.abs(ty-by)<90&&distance<(you.action==='kick'?245:180)&&now-(clock.lastDodge??-2000)>1500){clock.lastDodge=now;clock.evadeUntil=now+(g.stage===0?140:220);clock.counterUntil=now+1000;bot.input.move=-direction;return;}

 if(ty>by+80){
  // Choose a reachable step toward the target, not a jump straight at its feet.
  const candidates=platformsIn(bot.x-650,bot.x+650,by+60,Math.min(ty+25,by+JUMP_HEIGHT-28));
  const options=candidates.map(platform=>{
   const landingX=Math.max(platform.x+65,Math.min(platform.x+platform.width-65,bot.x));
   const flight=landingTime(platform.y-by),travel=Math.abs(landingX-bot.x);
   return {platform,landingX,travel,reachable:travel<SPEED*flight*.85-20,score:Math.abs(ty-platform.y)+Math.abs(you.x-landingX)*.22+travel*.08};
  }).filter(option=>option.reachable).sort((a,b)=>a.score-b.score);
  if(options.length){const step=options[0];clock.waypoint={x:step.landingX,y:step.platform.y,at:now};bot.input.move=Math.abs(step.landingX-bot.x)>20?Math.sign(step.landingX-bot.x):0;bot.input.jump=(bot.input.jump??0)+1;return;}
  // With wider gaps, first walk toward a launch edge instead of jumping
  // repeatedly from an unreachable point directly below the opponent.
  const approach=candidates.map(platform=>Math.max(platform.x+65,Math.min(platform.x+platform.width-65,bot.x))).sort((a,b)=>Math.abs(a-bot.x)-Math.abs(b-bot.x))[0];
  bot.input.move=approach===undefined?direction:Math.sign(approach-bot.x);return;
 }
 if(by>ty+130){
  const support=platformsIn(bot.x,bot.x,by-1,by+1).find(p=>inside(bot.x,p));
  if(support){const left=support.x-50,right=support.x+support.width+50;bot.input.move=Math.sign((Math.abs(you.x-left)<Math.abs(you.x-right)?left:right)-bot.x);return;}
 }
 // Traverse holes between ledges and chase across neighboring platforms.
 if(by>0&&distance>220){
  const ahead=bot.x+direction*100;
  const floorAhead=platformsIn(ahead,ahead,by-1,by+1).length>0;
  if(!floorAhead){const next=platformsIn(bot.x-600,bot.x+600,by-170,by+300).filter(p=>direction*(p.x+p.width/2-bot.x)>100).sort((a,b)=>Math.abs(a.x+a.width/2-you.x)-Math.abs(b.x+b.width/2-you.x))[0];
   if(next){const target=Math.max(next.x+65,Math.min(next.x+next.width-65,bot.x+direction*300));clock.waypoint={x:target,y:next.y,at:now};bot.input.jump=(bot.input.jump??0)+1;}}
 }
 if(you.action==='sweep'&&you.until>now&&distance<260){bot.input.jump=(bot.input.jump??0)+1;clock.waypoint={x:you.x+direction*100,y:ty,at:now};bot.input.move=direction;return;}
 if((g.stage??0)===2&&you.until>now&&you.action==='kick'&&distance<235&&clock.count%3===0)bot.input.move=-direction;
 else bot.input.move=distance>175?direction:distance<100?-direction:0;
 if(now-clock.attack>=((clock.counterUntil??0)>now?Math.min(750,profile.cooldown):profile.cooldown)&&distance<235&&Math.abs(ty-by)<100){
  clock.attack=now;clock.count++;
  if(clock.count%3===0)bot.input.sweep=(bot.input.sweep??0)+1;
  else if(distance>145||clock.count%2===0)bot.input.kick++;
  else bot.input.punch++;
 }
}
