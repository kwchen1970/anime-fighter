import assert from 'node:assert/strict';
import {RoomSession,EMPTY_ROOM_TTL} from '../lib/room-session.ts';
import {newMatch,advance} from '../lib/game.ts';
const now=1000000,r=new RoomSession();r.create(now);
assert.equal(r.data!.expires,now+EMPTY_ROOM_TTL);
r.presence(now+100,[true,false]);assert.equal(r.data!.expires,Number.MAX_SAFE_INTEGER);
r.presence(now+200,[false,false]);assert.equal(r.data!.expires,now+200+EMPTY_ROOM_TTL);
r.presence(now+300,[false,false]);assert.equal(r.data!.expires,now+200+EMPTY_ROOM_TTL,'empty events must not restart countdown');
r.presence(now+400,[false,true]);assert.equal(r.data!.expires,Number.MAX_SAFE_INTEGER);
r.data!.match.pausedAt=now;r.presence(now+500,[true,true]);assert.equal(r.data!.expires,Number.MAX_SAFE_INTEGER);
r.presence(now+600,[false,false]);assert.throws(()=>r.get(now+600+EMPTY_ROOM_TTL));
for(const direction of [-1,1]){const g=newMatch(now,0);g.players[0].input.move=direction;g.players[0].input.at=now;advance(g,now+100);g.players[0].input.move=0;g.players[0].input.at=now+100;advance(g,now+200);assert.equal(g.players[0].face,direction,'idle keeps last movement direction');}
console.log('PASS: room expiry, reconnect cancellation, paused presence, idle facing');
