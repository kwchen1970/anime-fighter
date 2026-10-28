export const PUNCH_MS=780;
// Procreate clips have 11 Mochi frames and 10 Yuna frames, played over 780ms.
export function punchLungeWindow(slot:number){const frame=PUNCH_MS/(slot===0?11:10);return {start:frame*6,end:frame*8};}
export function punchTravelFactor(slot:number,elapsed:number){const {start,end}=punchLungeWindow(slot);if(elapsed<start||elapsed>=end)return 0;return 3.3*Math.sin(Math.PI*(elapsed-start)/(end-start));}
export function punchLift(slot:number,elapsed:number,moving:boolean){return punchTravelFactor(slot,elapsed)/3.3*(moving?44:18);}
export function punchMoveScale(moving:boolean){return moving?1:.34;}
