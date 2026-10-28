import type {Fighter} from './game.ts';
// Post-round poses must not inherit a losing fighter's fall/jump state.
export function travelFighter(f:Fighter,slot:number,now:number,started:number):Fighter{
 return {...f,x:1160+slot*260+(now-started)*.44,y:0,vy:0,airborne:false,slipping:false,dropLandedAt:undefined,knocked:false,jumpLaunchAt:0,jumpStarted:undefined,fallStarted:undefined,fallLanded:undefined,landingDustAt:undefined,knockback:0,punchMove:0,punchRunning:false,healFlash:0,face:1,action:'run',started,until:0,stun:0,flash:0};
}
