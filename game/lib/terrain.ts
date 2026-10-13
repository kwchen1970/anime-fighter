export const ARENA_LENGTH=7200;
export const TERRAIN:readonly (readonly [number,number])[]=[[0,0],[ARENA_LENGTH,0]];
export function groundHeight(x:number):number {
 const clamped=Math.max(0,Math.min(ARENA_LENGTH,x));
 for(let i=1;i<TERRAIN.length;i++){
   const [end,height]=TERRAIN[i],[start,previous]=TERRAIN[i-1];
   if(clamped<=end)return previous+(height-previous)*(clamped-start)/(end-start);
 }
 return TERRAIN[TERRAIN.length-1][1];
}
export const DISTRICTS=[
 {name:'Cat Café Street',image:'/assets/stages/sakura-cat-cafe.png'},
 {name:'Arcade Plaza',image:'/assets/stages/sakura-arcade.png'},
 {name:'Shrine Garden',image:'/assets/stages/sakura-shrine.png'},
] as const;
export function districtBlend(x:number,stage=0){
 const part=Math.max(0,Math.min(2,x/2400));
 const section=Math.min(2,Math.floor(part));
 const fraction=section<2?Math.max(0,Math.min(1,(part-section-.7333333333)/.2666666667)):0;
 const blend=fraction*fraction*(3-2*fraction);
 return {first:(section+stage)%3,second:(Math.min(2,section+1)+stage)%3,blend};
}
