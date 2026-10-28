// Fixed screen positions and a shared gentle drift avoid camera-induced
// swelling. Irregular groups mix single wisps with overlapping pairs and fuller three-piece clusters.
export function calmClouds(now:number,viewportWidth=1200,viewportHeight=660){
 const period=viewportWidth+300;
 const clouds:{x:number;y:number;width:number;height:number}[]=[];
 const rowOffsets=[0,.46,.13,.68,.29],jitter=[-15,18,-7,12,-20];
 for(let row=0;row<5;row++)for(let group=0;group<3;group++){
  const id=row*3+group,width=125+(id*23%55);
  const offset=(group+rowOffsets[row])*period/3;
  const x=((offset+now*.004)%period+period)%period-300;
  const y=20+row*(viewportHeight-100)/4+jitter[(row+group)%5];
  clouds.push({x,y,width,height:width*230/640});
  if(id%3!==1){const small=width*.65;clouds.push({x:x+width*.42,y:y+8+(id%2)*5,width:small,height:small*230/640});}
  if(id%4===0){const w=width*.78;clouds.push({x:x+width*.18,y:y-14,width:w,height:w*230/640});}
 }
 return clouds;
}
