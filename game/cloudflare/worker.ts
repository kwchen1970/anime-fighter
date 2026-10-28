export {GameRoom} from './room';
type Env={ASSETS:Fetcher;GAME_ROOMS:DurableObjectNamespace};
export default {async fetch(request:Request,env:Env){const url=new URL(request.url);
 try{
  if(url.pathname==='/api/game'){
   if(request.method!=='POST')return new Response('Method not allowed',{status:405});
   if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response('Forbidden',{status:403});
   if(Number(request.headers.get('content-length')??0)>4096)return new Response('Request too large',{status:413});
   const text=await request.text();if(text.length>4096)return new Response('Request too large',{status:413});const b=JSON.parse(text);
   const create=b.op==='create';for(let retry=0;retry<(create?5:1);retry++){
    const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789',code=create?Array.from(crypto.getRandomValues(new Uint8Array(5)),v=>chars[v%chars.length]).join(''):String(b.code??'').trim().toUpperCase();
    if(!/^[A-Z2-9]{5}$/.test(code))return Response.json({error:'Enter a five-character room code.'},{status:400});
    const result=await env.GAME_ROOMS.getByName(code).fetch(new Request(`https://room/game?code=${code}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}));
    if(!create||result.status!==409)return new Response(result.body,{status:result.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
   }return Response.json({error:'Could not make a room. Try again.'},{status:503});
  }
  const socket=url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{5})\/socket$/);
  if(socket){if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response('Forbidden',{status:403});return env.GAME_ROOMS.getByName(socket[1]).fetch(new Request(`https://room/connect?code=${socket[1]}`,request));}
  if(url.pathname.startsWith('/api/'))return new Response('Not found',{status:404});
  return env.ASSETS.fetch(request);
 }catch{return Response.json({error:'Game service unavailable. Please try again.'},{status:503});}
}};
