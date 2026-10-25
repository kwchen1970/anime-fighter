import {PLATFORM_THICKNESS} from './world-scale';
const backdrops=new WeakMap<HTMLImageElement,HTMLCanvasElement>();
const ledges=new WeakMap<HTMLImageElement,HTMLCanvasElement>();
export function backdrop(image:HTMLImageElement){
 let canvas=backdrops.get(image);if(!canvas){canvas=document.createElement('canvas');canvas.width=1370;canvas.height=660;const ctx=canvas.getContext('2d')!;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,1370,660);ctx.globalCompositeOperation='destination-in';const fade=ctx.createLinearGradient(0,0,0,140);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');ctx.fillStyle=fade;ctx.fillRect(0,0,1370,660);ctx.globalCompositeOperation='source-over';backdrops.set(image,canvas);}return canvas;
}
// Normalize the art once at load time, rather than resampling multi-megapixel
// transparent images for every ledge on every frame.
export function platformSprite(image:HTMLImageElement){
 let canvas=ledges.get(image);if(canvas)return canvas;
 const scan=document.createElement('canvas');scan.width=image.naturalWidth;scan.height=image.naturalHeight;const ctx=scan.getContext('2d')!;ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,scan.width,scan.height).data;
 let left=scan.width,top=scan.height,right=0,bottom=0;
 for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++)if(pixels[(y*scan.width+x)*4+3]>160){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(1,Math.round(1024*(bottom-top+1)/(right-left+1)));const target=canvas.getContext('2d')!;target.imageSmoothingQuality='high';target.drawImage(image,left,top,right-left+1,bottom-top+1,0,0,canvas.width,canvas.height);ledges.set(image,canvas);return canvas;
}

const clouds=new WeakMap<HTMLImageElement,HTMLCanvasElement>();
export function cloudSprite(image:HTMLImageElement){let canvas=clouds.get(image);if(!canvas){canvas=document.createElement('canvas');canvas.width=640;canvas.height=230;canvas.getContext('2d')!.drawImage(image,0,0,640,230);clouds.set(image,canvas);}return canvas;}

const platformWidths=new WeakMap<HTMLImageElement,Map<number,HTMLCanvasElement>>();
// Keep a fixed world thickness. Repeat only a small fascia section to fill
// different ledge lengths; end caps and the central motif retain their shape.
export function platformWorldSprite(image:HTMLImageElement,width:number){
 let variants=platformWidths.get(image);if(!variants){variants=new Map();platformWidths.set(image,variants);}
 const cached=variants.get(width);if(cached)return cached;
 const sprite=platformSprite(image),sw=sprite.width,sh=sprite.height;
 const canvas=document.createElement('canvas');canvas.width=Math.round(width*2);canvas.height=PLATFORM_THICKNESS*2;
 const ctx=canvas.getContext('2d')!,factor=canvas.height/sh;
 const cap=sw*.18,capWidth=cap*factor,center=sw*.3,centerWidth=center*factor;
 const tileX=sw*.22,tile=sw*.08,tileWidth=tile*factor;
 for(let x=capWidth;x<canvas.width-capWidth;x+=tileWidth){const w=Math.min(tileWidth,canvas.width-capWidth-x);ctx.drawImage(sprite,tileX,0,w/factor,sh,x,0,w,canvas.height);}
 ctx.drawImage(sprite,0,0,cap,sh,0,0,capWidth,canvas.height);
 ctx.drawImage(sprite,sw-cap,0,cap,sh,canvas.width-capWidth,0,capWidth,canvas.height);
 ctx.drawImage(sprite,(sw-center)/2,0,center,sh,(canvas.width-centerWidth)/2,0,centerWidth,canvas.height);
 variants.set(width,canvas);return canvas;
}
