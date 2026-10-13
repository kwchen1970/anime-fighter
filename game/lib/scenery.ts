import {DISTRICTS,groundHeight,ARENA_LENGTH,districtBlend} from './terrain.ts';
export function drawScenery(ctx:CanvasRenderingContext2D,images:Record<string,HTMLImageElement>,cameraX:number,now:number,stage:number,W=1200,H=660){
 ctx.fillStyle='#071b39';ctx.fillRect(0,0,W,H);
 const region=districtBlend(cameraX,stage);
 const draw=(index:number,alpha:number)=>{
   const im=images[DISTRICTS[index].image];if(!im)return;
   const offset=Math.sin((cameraX/2400)*Math.PI*.5)*55;
   ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,-85-offset,0,W+170,H);ctx.restore();
 };
 draw(region.first,1);if(region.blend>0)draw(region.second,region.blend);
 const t=now/1000;
 ctx.save();const glow=ctx.createRadialGradient(960,120,20,960,120,450);glow.addColorStop(0,`rgba(36,132,255,${.04+Math.sin(t*.4)*.012})`);glow.addColorStop(1,'rgba(36,132,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.restore();
 if(region.first===2){ctx.save();ctx.strokeStyle='#71caff';ctx.lineWidth=1;for(let i=0;i<9;i++){ctx.globalAlpha=.06+Math.max(0,Math.sin(t*.9+i))*.07;const x=390+i*65+Math.sin(t*.3+i)*8,y=425+(i%4)*12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12+(i%4)*8,y);ctx.stroke();}ctx.restore();}
}
export function drawTerrain(ctx:CanvasRenderingContext2D,cameraX:number,width:number,elevation:number,W=1200,H=660){
 const scale=W/width,left=cameraX-width/2;
 const sx=(x:number)=>(x-left)*scale;
 const sy=(x:number)=>555+(elevation-groundHeight(x))*scale;
 ctx.beginPath();ctx.moveTo(0,H);
 for(let px=0;px<=W+20;px+=20){const x=left+px/scale;ctx.lineTo(px,sy(x));}
 ctx.lineTo(W,H);ctx.closePath();
 const fill=ctx.createLinearGradient(0,485,0,H);fill.addColorStop(0,'#132b47');fill.addColorStop(1,'#09182d');ctx.fillStyle=fill;ctx.fill();
 ctx.beginPath();for(let px=0;px<=W+20;px+=20){const x=left+px/scale;if(px===0)ctx.moveTo(px,sy(x));else ctx.lineTo(px,sy(x));}ctx.strokeStyle='#51b7d0aa';ctx.lineWidth=2;ctx.stroke();
 ctx.strokeStyle='#40658144';ctx.lineWidth=1;
 for(let x=Math.max(0,Math.floor(left/180)*180);x<=Math.min(ARENA_LENGTH,left+width+180);x+=180){const y=sy(x);ctx.beginPath();ctx.moveTo(sx(x),y+4);ctx.lineTo(sx(x+65),H);ctx.stroke();}
 for(let i=1;i<3;i++){ctx.beginPath();for(let px=0;px<=W+20;px+=20){const x=left+px/scale,y=sy(x)+(H-sy(x))*i/3;if(px===0)ctx.moveTo(px,y);else ctx.lineTo(px,y);}ctx.stroke();}
}
export function drawPetals(ctx:CanvasRenderingContext2D,now:number,cameraX:number,W=1200,H=660){
 const t=now/1000;ctx.save();
 for(let i=0;i<14;i++) {
   const phase=t*(10+(i%4)*3)+i*137;
   const x=((i*173+t*(8+i%3*3)+Math.sin(t*.7+i)*22-cameraX*.035)%(W+100)+W+100)%(W+100)-50;
   const y=(phase%(H+120))-80;
   ctx.globalAlpha=.18+(i%3)*.08;ctx.fillStyle=i%3===0?'#8cdcff':i%3===1?'#e9a1d4':'#b9a5ff';
   ctx.beginPath();ctx.ellipse(x,y,2.5+(i%2),1.5,Math.sin(t+i)*1.8,0,Math.PI*2);ctx.fill();
 }ctx.restore();
}
