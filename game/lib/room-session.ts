import {advance,newMatch,type Match,type Input} from './game.ts';
import {pauseMatch,resumeMatch} from './pause.ts';
export const EMPTY_ROOM_TTL=15*60*1000;
export type RoomData={tokens:string[];ready:boolean[];match:Match;expires:number};
export class RoomError extends Error{constructor(message:string,public status=400){super(message);}}
export class RoomSession{
 constructor(public data:RoomData|null=null){}
 create(now:number){if(this.data&&this.data.expires>now)throw new RoomError('Room exists.',409);const token=crypto.randomUUID();this.data={tokens:[token],ready:[false,false],match:newMatch(now),expires:now+EMPTY_ROOM_TTL};return token;}
 get(now:number){if(!this.data||this.data.expires<=now)throw new RoomError('Room not found. Make a new room.',404);return this.data;}
 presence(now:number,connected:boolean[]){
  if(!this.data)return false;
  const occupied=connected.some(Boolean),wasOccupied=this.data.expires===Number.MAX_SAFE_INTEGER;
  if(occupied===wasOccupied)return false;
  this.data.expires=occupied?Number.MAX_SAFE_INTEGER:now+EMPTY_ROOM_TTL;
  return true;
 }
 slot(token:string,now:number){const slot=this.get(now).tokens.indexOf(token);if(slot<0)throw new RoomError('Your session has ended. Join a room again.',403);return slot;}
 join(now:number){const r=this.get(now);if(r.tokens.length>=2)throw new RoomError('This room already has two players.',409);const token=crypto.randomUUID();r.tokens.push(token);r.match=newMatch(now);return token;}
 input(slot:number,value:Partial<Input>,now:number){const r=this.get(now),f=r.match.players[slot];if(r.match.pausedAt!==undefined)return;const count=(key:'punch'|'kick'|'sweep'|'jump')=>Math.max(f.input[key]??0,Math.min((f.input[key]??0)+1,Math.max(0,Math.floor(Number(value[key])||0))));f.input={move:Math.sign(Number(value.move)||0),punch:count('punch'),kick:count('kick'),jump:count('jump'),sweep:count('sweep'),at:now};}
 tick(now:number,connected:boolean[]){const r=this.get(now),g=r.match;if(g.pausedAt!==undefined)return;
  if(connected.every(Boolean)&&r.tokens.length===2){for(const f of g.players)f.input.at=now;advance(g,now);}
  else{const elapsed=Math.max(0,now-g.time);g.start+=elapsed;g.end+=elapsed;g.time=now;for(const f of g.players)f.input.move=0;}
 }
 command(op:string,slot:number,now:number){const r=this.get(now);if(op==='pause'){if(r.tokens.length!==2||r.match.winner!==null)throw new RoomError('Pause is available during a match.',409);pauseMatch(r.match,slot,now);}else if(op==='resume'){if(r.match.pausedAt!==undefined&&!resumeMatch(r.match,slot,now))throw new RoomError('Only the player who paused can resume.',403);}else if(op==='rematch'&&r.match.winner!==null){r.ready[slot]=true;if(r.ready.every(Boolean)){r.match=newMatch(now,3000,((r.match.stage??0)+1)%3);r.ready=[false,false];}}else if(op!=='tick')throw new RoomError('Unknown game command.');}
 packet(code:string,slot:number,now:number,connected:boolean[]){const r=this.get(now);return {code,slot,joined:r.tokens.length,connected,ready:r.ready,match:r.match,now};}
}
