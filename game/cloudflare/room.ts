import {DurableObject} from 'cloudflare:workers';
import {RoomSession,RoomError,type RoomData} from '../lib/room-session';
type Attachment={slot?:number;code:string;window?:number;count?:number};
export class GameRoom extends DurableObject<Record<string,unknown>>{
 private room=new RoomSession();private timer:ReturnType<typeof setInterval>|null=null;private savedAt=0;private savedMatch:object|null=null;
 constructor(ctx:DurableObjectState,env:Record<string,unknown>){super(ctx,env);ctx.blockConcurrencyWhile(async()=>{this.room=new RoomSession((await ctx.storage.get<RoomData>('room'))??null);if(this.room.data)this.room.tick(Date.now(),[false,false]);this.refresh();});}
 private connections(){return this.ctx.getWebSockets().filter(ws=>{try{return ws.deserializeAttachment()?.slot!==undefined;}catch{return false;}});}
 private connected(){const slots=this.connections().map(ws=>(ws.deserializeAttachment() as Attachment).slot);return [slots.includes(0),slots.includes(1)];}
 private save(){if(!this.room.data)return;this.savedAt=Date.now();this.savedMatch=this.room.data.match;this.ctx.waitUntil(this.ctx.storage.put('room',this.room.data));}
 private refresh(){const r=this.room.data;if(!r)return;const active=this.connected().every(Boolean)&&r.match.winner===null&&r.match.pausedAt===undefined;
  if(active&&!this.timer)this.timer=setInterval(()=>{try{this.room.tick(Date.now(),this.connected());this.broadcast();if(Date.now()-this.savedAt>10000||this.savedMatch!==this.room.data?.match)this.save();if(this.room.data?.match.winner!==null){this.save();this.refresh();}}catch{this.stop();}},1000/30);
  if(!active)this.stop();
 }
 private stop(){if(this.timer){clearInterval(this.timer);this.timer=null;}}
 private broadcast(){const connected=this.connected(),now=Date.now();for(const ws of this.connections())try{const a=ws.deserializeAttachment() as Attachment;ws.send(JSON.stringify(this.room.packet(a.code,a.slot!,now,connected)));}catch{}}
 async fetch(request:Request){try{
  const url=new URL(request.url),code=url.searchParams.get('code')??'';const now=Date.now();
  if(request.headers.get('Upgrade')?.toLowerCase()==='websocket'){
   this.room.get(now);if(this.ctx.getWebSockets().length>=6)throw new RoomError('Too many connections. Try again shortly.',429);
   const pair=new WebSocketPair(),client=pair[0],server=pair[1];this.ctx.acceptWebSocket(server);server.serializeAttachment({code});this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'));return new Response(null,{status:101,webSocket:client});
  }
  const b=await request.json() as {op:string;token?:string};let token=b.token;
  if(b.op==='create'){token=this.room.create(now);this.ctx.waitUntil(this.ctx.storage.setAlarm(this.room.data!.expires));}
  else if(b.op==='join'&&!token)token=this.room.join(now);
  const slot=this.room.slot(token??'',now);this.room.tick(now,this.connected());
  if(!['create','join'].includes(b.op))this.room.command(b.op,slot,now);
  if(b.op!=='tick')this.save();this.refresh();this.broadcast();return Response.json({...this.room.packet(code,slot,now,this.connected()),...(['create','join'].includes(b.op)?{token}:{})});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Room unavailable.'},{status:e instanceof RoomError?e.status:500});}}
 webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){try{
  if(typeof message!=='string'||message.length>2048){ws.close(1008,'Invalid input');return;}
  const now=Date.now(),a=ws.deserializeAttachment() as Attachment;
  if(now-(a.window??0)>1000){a.window=now;a.count=0;}a.count=(a.count??0)+1;if(a.count>45){ws.close(1008,'Input rate limit');return;}
  const b=JSON.parse(message);
  if(a.slot===undefined){if(b.op!=='auth')throw new RoomError('Sign in to the room first.',403);a.slot=this.room.slot(String(b.token??''),now);
   for(const old of this.connections())if(old!==ws&&(old.deserializeAttachment() as Attachment).slot===a.slot){old.serializeAttachment({code:a.code});old.close(1000,'Reconnected in another tab');}
   ws.serializeAttachment(a);this.room.tick(now,[false,false]);this.refresh();this.broadcast();return;
  }
  ws.serializeAttachment(a);if(b.op==='input')this.room.input(a.slot,b.input??{},now);else if(b.op!=='heartbeat')throw new RoomError('Unknown input.');
 }catch(e){try{ws.send(JSON.stringify({error:e instanceof Error?e.message:'Invalid input.'}));ws.close(1008,'Invalid session');}catch{}}}
 webSocketClose(ws:WebSocket){ws.serializeAttachment({code:''});this.room.tick(Date.now(),[false,false]);this.save();this.refresh();this.broadcast();}
 webSocketError(ws:WebSocket){this.webSocketClose(ws);}
 async alarm(){this.stop();for(const ws of this.ctx.getWebSockets())ws.close(1000,'Room expired');await this.ctx.storage.deleteAll();this.room=new RoomSession();}
}
