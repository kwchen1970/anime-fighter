export function connectRoom<T>({code,token,input,packet,error}:{code:string;token:string;input:()=>unknown;packet:(p:T)=>void;error:(message:string)=>void}){
 let stopped=false,socket:WebSocket|null=null,timer:ReturnType<typeof setTimeout>|undefined,sent='',retry=500,heartbeat=0,authenticated=false;
 const connect=()=>{if(stopped)return;authenticated=false;socket=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/api/rooms/${code}/socket`);
  socket.onopen=()=>{socket?.send(JSON.stringify({op:'auth',token}));sent='';};
  socket.onmessage=e=>{if(e.data==='pong')return;try{const value=JSON.parse(e.data);if(value.error){error(value.error);return;}authenticated=true;retry=500;error('');packet(value);}catch{error('Could not read the room update.');}};
  socket.onclose=()=>{if(stopped)return;error('Connection interrupted. Reconnecting…');timer=setTimeout(connect,retry);retry=Math.min(5000,retry*2);};socket.onerror=()=>socket?.close();
 };
 const send=setInterval(()=>{if(!authenticated||socket?.readyState!==WebSocket.OPEN)return;const next=JSON.stringify(input());if(next!==sent){socket.send(JSON.stringify({op:'input',input:JSON.parse(next)}));sent=next;}if(Date.now()-heartbeat>5000){socket.send('ping');heartbeat=Date.now();}},50);
 connect();return()=>{stopped=true;clearInterval(send);clearTimeout(timer);socket?.close();};
}
