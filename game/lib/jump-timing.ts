// The supplied animations plant the feet for the first three frames.
export const JUMP_PREP_MS=[60,60] as const;
export const JUMP_AIR_MS=1091;
export function jumpAnimationTime(elapsed:number,durations:number[]){
 const prep=durations.slice(0,3).reduce((a,b)=>a+b,0),total=durations.reduce((a,b)=>a+b,0);
 const quickPrep=JUMP_PREP_MS[0];
 return elapsed<quickPrep?Math.max(0,elapsed)/quickPrep*prep:Math.min(total-1,prep+(elapsed-quickPrep)/JUMP_AIR_MS*(total-prep));
}
