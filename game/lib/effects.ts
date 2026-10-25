const tinted=new WeakMap<HTMLImageElement,HTMLCanvasElement[]>();
// Tint only the sprite's opaque pixels, keeping its transparent silhouette.
export function hitSprite(image:HTMLImageElement,red:boolean){
 let variants=tinted.get(image);
 if(!variants){variants=['#ff454f','#ffffff'].map(color=>{const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=.75;ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);return canvas;});tinted.set(image,variants);}
 return variants[red?0:1];
}
export function drawHitDust(ctx:CanvasRenderingContext2D,event:{time:number;victimX?:number;direction?:number;y?:number;kick:boolean},now:number,worldX:(x:number)=>number,ground:(x:number)=>number,scale:number){
 const age=(now-event.time)/550;if(age<0||age>1||event.victimX===undefined)return;
 const direction=event.direction??1,distance=event.kick?95:48;
 ctx.save();
 for(let i=0;i<7;i++){
  const delay=i*.045,p=Math.max(0,(age-delay)/(1-delay));if(age<delay)continue;
  const anchor=event.victimX+direction*distance*(1-Math.exp(-age*5))-direction*i*9;
  const x=worldX(anchor)-direction*p*(15+i*3)*scale,y=ground(anchor)-(event.y??0)*scale-(5+p*(12+i%3*7))*scale;
  ctx.globalAlpha=(1-p)*.38;ctx.fillStyle=i%2?'#d5c9bb':'#fff2df';ctx.beginPath();ctx.ellipse(x,y,(7+p*15)*scale,(4+p*9)*scale,i*.4,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
