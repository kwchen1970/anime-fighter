// Stable coordinates are shared by the browser and room server: no random spawns
// or growing list to transmit. Only nearby rows are generated for each query.
export type Platform={id:string;x:number;width:number;y:number};
export const GRAVITY=3300;
export const JUMP_SPEED=1800;
export const JUMP_HEIGHT=JUMP_SPEED*JUMP_SPEED/(2*GRAVITY);
export const FIRST_PLATFORM_HEIGHT=200;
export const ROW_HEIGHT=340;
export const PLATFORM_STRIDE=1950;
export const PLATFORM_ART=['/assets/stages/cafe-platform-slim.png','/assets/stages/arcade-platform-slim.png','/assets/stages/shrine-platform-slim.png'];
const rowCache=new Map<string,Platform[]>();
function rowPlatforms(row:number,column:number):Platform[]{
 const key=`${row}:${column}`,cached=rowCache.get(key);if(cached)return cached;
 const seed=Math.abs(Math.imul(row+17,73856093)^Math.imul(column+31,19349663));
 const width=820+(seed%3)*80;
 const list=[{id:key,x:column*PLATFORM_STRIDE+(row%2?975:50),width,y:FIRST_PLATFORM_HEIGHT+row*ROW_HEIGHT}];
 rowCache.set(key,list);if(rowCache.size>1600)rowCache.delete(rowCache.keys().next().value!);return list;
}
export function platformsIn(left:number,right:number,bottom:number,top:number):Platform[]{
 const list:Platform[]=[];
 const firstRow=Math.max(0,Math.ceil((bottom-FIRST_PLATFORM_HEIGHT)/ROW_HEIGHT)),lastRow=Math.floor((top-FIRST_PLATFORM_HEIGHT)/ROW_HEIGHT);
 for(let row=firstRow;row<=lastRow;row++)for(let column=Math.floor((left-2200)/PLATFORM_STRIDE);column<=Math.floor(right/PLATFORM_STRIDE);column++){
  const platform=rowPlatforms(row,column)[0];if(platform.y>=bottom&&platform.y<=top&&platform.x+platform.width>=left&&platform.x<=right)list.push(platform);
 }
 return list;
}
export function supportAt(x:number,y:number){
 let height=0;for(const platform of platformsIn(x,x,y-600,y+1))if(platform.y<=y+1)height=Math.max(height,platform.y);return height;
}
// Time at which a jump descends back through a requested height.
export function landingTime(delta:number){const discriminant=JUMP_SPEED*JUMP_SPEED-2*GRAVITY*delta;return discriminant<0?0:(JUMP_SPEED+Math.sqrt(discriminant))/GRAVITY;}
