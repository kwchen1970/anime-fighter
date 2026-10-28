import {backdrop,cloudSprite} from './render-assets';
import {DISTRICTS,groundHeight,ARENA_LENGTH,districtBlend} from './terrain.ts';
export function drawScenery(ctx:CanvasRenderingContext2D,images:Record<string,HTMLImageElement>,cameraX:number,now:number,stage:number,W=1200,H=660,elevation=0,scale=1){
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#79b8f0');sky.addColorStop(.65,'#bcdbf5');sky.addColorStop(1,'#e3d8f3');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 const region=districtBlend(cameraX,stage),rise=Math.max(0,elevation);
 // Street -> roofline -> open sky, with subtle altitude parallax.
 const cityAlpha=Math.max(0,1-rise/1800);
 const draw=(index:number,alpha:number)=>{const image=images[DISTRICTS[index].image];if(!image||alpha<=0)return;const offset=Math.sin((cameraX/2400)*Math.PI*.5)*55;ctx.save();ctx.globalAlpha=alpha*cityAlpha;ctx.drawImage(backdrop(image),-85-offset,rise*scale*.38,W+170,H);ctx.restore();};
 draw(region.first,1);if(region.blend>0)draw(region.second,region.blend);
 const cloud=images['/assets/stages/anime-cloud.png'];
 // Clouds occupy fixed heights in the world, so zooming out cannot bring
 // screen-space clouds down over the street or a grounded fighter.
 if(cloud){
  const skyBottom=Math.min(H,500+(elevation-650)*scale);
  if(skyBottom>0){ctx.save();ctx.beginPath();ctx.rect(0,0,W,skyBottom);ctx.clip();ctx.globalAlpha=.5;
   const bottomAltitude=Math.max(850,elevation-(H-500)/scale-250);
   const topAltitude=elevation+500/scale+250;
   for(let band=Math.max(0,Math.floor((bottomAltitude-850)/480));band<=Math.ceil((topAltitude-850)/480);band++){
    const altitude=850+band*480;
    const width=(640+(band%2)*140)*scale,height=width*230/640;
    const x=((band*389-cameraX*.08*scale+now*.008*scale)%(W+width)+W+width)%(W+width)-width;
    const y=500+(elevation-altitude)*scale;
    ctx.drawImage(cloudSprite(cloud),x,y-height/2,width,height);
   }ctx.restore();}
 }


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
