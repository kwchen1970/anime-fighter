export function readStick(dx:number,dy:number,radius:number){
 const length=Math.hypot(dx,dy),limit=length>radius?radius/length:1;
 const x=dx*limit/radius,y=dy*limit/radius;
 return {x,y,move:Math.abs(x)>.24?Math.sign(x):0,jump:y<-.48,releaseJump:y>-.24};
}
