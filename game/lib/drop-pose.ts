import type {Fighter} from './game.ts';
export function dropFrame(f:Fighter,now:number):number|null{
 if(f.knocked)return null;
 if(f.slipping&&f.airborne)return 1; // Frame 2 stays held through gravity fall.
 if(!f.airborne&&f.dropLandedAt!==undefined&&now-f.dropLandedAt<100&&f.until<=now&&!f.jumpLaunchAt)return 2;
 return null;
}
