export type CameraPose={x:number;width:number;elevation:number};
export function steadyCameraTarget(camera:CameraPose,fighters:{x:number;y?:number;airborne?:boolean;vy?:number;floor:number}[]){
 const [a,b]=fighters,vertical=Math.abs((a.y??0)-(b.y??0));
 const width=Math.max(1700,Math.abs(a.x-b.x)+780,(vertical+360)*1200/550);
 const scale=1200/width,midpoint=(a.x+b.x)/2,offset=midpoint-camera.x;
 const x=Math.abs(offset)>150?midpoint-Math.sign(offset)*150:camera.x;
 const anchored=(a.floor+b.floor)/2+180-170/scale;
 const highest=Math.max((a.y??0)+360,(b.y??0)+360);
 const headRoom=highest-455/scale;
 let elevation=Math.max(0,anchored,headRoom);
 // Avoid following the entire up/down arc of every jump. Hold the raised view
 // through the flight; ease back toward the floor after landing.
 const lowest=Math.min(...fighters.map(f=>Math.max(0,(f.y??0)+Math.min(0,f.vy??0)*.12)));
 const falling= fighters.some(f=>f.airborne&&(f.vy??0)<-650)||500+(camera.elevation-lowest)*scale>600;
 if(fighters.some(f=>f.airborne)&&!falling)elevation=Math.max(camera.elevation,elevation);
 // Let a fast descent lower the camera immediately instead of holding the
 // last raised view until the character has already landed off screen.
 const maxElevation=lowest+100/scale;
 elevation=Math.min(elevation,maxElevation);
 return {x,width,elevation,falling};
}
