import {platformsIn,landingTime,JUMP_HEIGHT,type Platform} from './platforms.ts';
import {SPEED,type Fighter} from './game.ts';
const inset=(p:Platform,x:number,margin:number)=>Math.max(p.x+margin,Math.min(p.x+p.width-margin,x));
export function nextPlatformStep(bot:Fighter,target:Fighter){
 const by=bot.y??0,ty=target.y??0;
 const left=Math.min(bot.x,target.x)-2400,right=Math.max(bot.x,target.x)+2400;
 const ground:Platform={id:'ground',x:left,width:right-left,y:0};
 const list=[ground,...platformsIn(left,right,Math.max(0,Math.min(by,ty)-750),Math.max(by,ty)+400)];
 const surface=(f:Fighter)=>list.find(p=>Math.abs(p.y-(f.y??0))<2&&f.x>=p.x&&f.x<=p.x+p.width);
 const start=surface(bot),goal=surface(target);if(!start||!goal||start.id===goal.id)return null;
 // Plan a complete route to the opponent's surface. A local height heuristic
 // can repeatedly select the same two ledges without ever reaching the goal.
 const queue=[start],previous=new Map<string,Platform|null>([[start.id,null]]);
 for(let i=0;i<queue.length&&!previous.has(goal.id);i++){
  const from=queue[i];
  for(const to of list){
   if(previous.has(to.id)||to.y-from.y>JUMP_HEIGHT-28||from.y-to.y>750)continue;
   const gap=Math.max(0,to.x+120-(from.x+from.width-40),from.x+40-(to.x+to.width-120));
   if(gap>SPEED*landingTime(to.y-from.y)*.85-20)continue;
   previous.set(to.id,from);queue.push(to);
  }
 }
 if(!previous.has(goal.id))return null;
 let next=goal;while(previous.get(next.id)?.id!==start.id)next=previous.get(next.id)!;
 let landingX=inset(next,bot.x,120);
 if((bot.ledgePressure??0)>0&&next.id===goal.id){
  const reach=SPEED*landingTime(next.y-start.y)*.85-25;
  const interior=inset(next,next.x+next.width/2,120);
  landingX=inset(next,Math.max(start.x+40-reach,Math.min(start.x+start.width-40+reach,interior)),120);
 }
 const launchX=inset(start,landingX,40);
 const exits=[start.x-35,start.x+start.width+35];
 const dropX=exits.sort((a,b)=>(Math.abs(bot.x-a)+Math.abs(landingX-a)*.6)-(Math.abs(bot.x-b)+Math.abs(landingX-b)*.6))[0];
 return {x:landingX,y:next.y,launchX,dropX};
}
