// User-supplied music and hit recordings, mixed quietly beneath the action.
export class GameAudio{
 private context:AudioContext;private musicGain:GainNode;private buffers=new Map<string,AudioBuffer>();private music:AudioBufferSourceNode|null=null;private active=false;private enabled=true;private unlocked=false;private hits=0;
 constructor(){this.context=new AudioContext();this.musicGain=this.context.createGain();this.musicGain.gain.value=.14;this.musicGain.connect(this.context.destination);
  for(const name of ['background','normal_punch','strong_punch','levelup'])void fetch(`/assets/audio/${name}.mp3`).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(b=>this.context.decodeAudioData(b)).then(buffer=>{this.buffers.set(name,buffer);this.sync();}).catch(()=>{});
 }
 unlock(){this.unlocked=true;void this.context.resume().then(()=>this.sync());}
 update(active:boolean,enabled:boolean){if(active===this.active&&enabled===this.enabled)return;this.active=active;this.enabled=enabled;this.sync();}
 private sync(){
  const wanted=this.active&&this.enabled&&this.unlocked;
  if(wanted&&!this.music&&this.buffers.has('background')){const source=this.context.createBufferSource();source.buffer=this.buffers.get('background')!;source.loop=true;source.connect(this.musicGain);this.musicGain.gain.setValueAtTime(0,this.context.currentTime);this.musicGain.gain.linearRampToValueAtTime(.14,this.context.currentTime+.4);source.start();this.music=source;}
  if(!wanted&&this.music){const source=this.music;this.music=null;this.musicGain.gain.cancelScheduledValues(this.context.currentTime);this.musicGain.gain.setTargetAtTime(0,this.context.currentTime,.06);source.stop(this.context.currentTime+.2);}
 }
 hit(strong:boolean){this.effect(strong?'strong_punch':'normal_punch',strong?.46:.35,strong?.12:0);}
 heal(){this.effect('levelup',.4);}
 private effect(name:string,volume:number,offset=0){if(!this.enabled||!this.unlocked||this.hits>=6)return;const buffer=this.buffers.get(name);if(!buffer)return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(this.context.destination);this.hits++;source.onended=()=>{this.hits--;gain.disconnect();};source.start(0,Math.min(offset,Math.max(0,buffer.duration-.02)));}
}
