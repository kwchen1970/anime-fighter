import {newMatch,type Match} from './game.ts';
export const STAGES=[
 {name:'Cat Café Street',difficulty:'Easy',image:'/assets/stages/sakura-cat-cafe.png',health:70,speed:.72,reaction:360,cooldown:2400,accent:'#eaa7c4'},
 {name:'Arcade Plaza',difficulty:'Medium',image:'/assets/stages/sakura-arcade.png',health:85,speed:.88,reaction:220,cooldown:1650,accent:'#86b6e7'},
 {name:'Shrine Garden',difficulty:'Hard',image:'/assets/stages/sakura-shrine.png',health:100,speed:1,reaction:110,cooldown:1050,accent:'#b497e4'},
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
export type BotClock={think:number;attack:number;count:number};
export function updateBot(g:Match,now:number,clock:BotClock) {
 const bot=g.players[1],you=g.players[0],profile=STAGES[g.stage??0];
 bot.input.at=now;
 if(now<g.start||g.winner!==null){bot.input.move=0;return;}
 const distance=Math.abs(you.x-bot.x),direction=Math.sign(you.x-bot.x);
 if(now-clock.think>=profile.reaction) {
   clock.think=now;
   if((g.stage??0)===2&&you.until>now&&you.action==='kick'&&distance<235&&clock.count%3===0)bot.input.move=-direction;
   else if(distance>200)bot.input.move=direction;
   else if(distance<105)bot.input.move=-direction;
   else if(distance<170)bot.input.move=0;
 }
 if(bot.until<=now&&bot.stun<=now&&now-clock.attack>=profile.cooldown&&distance<235) {
   clock.attack=now;clock.count++;
   const kick=(g.stage??0)===0?clock.count%4===0:(g.stage??0)===1?clock.count%2===0:clock.count%4!==0;
   if(kick)bot.input.kick++;else bot.input.punch++;
 }
}
