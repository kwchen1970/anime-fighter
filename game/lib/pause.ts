import type {Match} from './game.ts';
export function pauseMatch(g:Match,slot:number,now:number){if(g.winner!==null||g.pausedAt!==undefined)return false;g.pausedAt=now;g.pausedBy=slot;for(const f of g.players)f.input.move=0;return true;}
export function resumeMatch(g:Match,slot:number,now:number){if(g.pausedAt===undefined||g.pausedBy!==slot)return false;const elapsed=Math.max(0,now-g.pausedAt);
 g.start+=elapsed;g.end+=elapsed;g.time=now;
 for(const f of g.players){for(const key of ['guardUntil','guardReadyAt','lastLedgeHit','lastLandedAt','dropLandedAt','started','until','stun','flash','healFlash','jumpStarted','jumpLaunchAt','fallStarted','fallLanded','lastKnockdown','landingDustAt'] as const){const value=f[key];if(value!==undefined&&value!==0)(f as any)[key]=value+elapsed;}f.input.at=now;f.input.move=0;}
 for(const e of g.events)e.time+=elapsed;
 if(g.catNextAt!==undefined)g.catNextAt+=elapsed;
 if(g.healthCat){const cat=g.healthCat;cat.born+=elapsed;cat.expires+=elapsed;if(cat.updatedAt!==undefined)cat.updatedAt+=elapsed;if(cat.lastEvadeAt!==undefined)cat.lastEvadeAt+=elapsed;}
 delete g.pausedAt;delete g.pausedBy;return true;
}
