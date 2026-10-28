// Frames 1–4 are the fall; frame 5 is reserved for actual surface contact.
export function fallFrame(started:number,landed:number|undefined,now:number){
 if(landed===undefined)return Math.min(3,Math.floor(Math.max(0,now-started)/120));
 return Math.min(7,4+Math.floor(Math.max(0,now-landed)/125));
}
export const GET_UP_MS=500;
