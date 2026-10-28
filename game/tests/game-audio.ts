import assert from 'node:assert/strict';
import {GameAudio} from '../lib/game-audio.ts';
const sources:any[]=[];
class Gain{gain={value:0,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}};connect(){}disconnect(){}}
class Context{currentTime=0;destination={};createGain(){return new Gain();}createBufferSource(){const s={buffer:null as any,loop:false,started:false,stopped:false,connect(){},start(when=0,offset=0){s.started=true;(s as any).offset=offset;},stop(){s.stopped=true;}};sources.push(s);return s;}resume(){return Promise.resolve();}decodeAudioData(data:ArrayBuffer){return Promise.resolve({name:new TextDecoder().decode(data),duration:2});}}
Object.assign(globalThis,{AudioContext:Context,fetch:async(url:string)=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer})});
const audio=new GameAudio();await new Promise(resolve=>setTimeout(resolve,0));audio.update(true,true);assert.equal(sources.length,0,'wait for user gesture');audio.unlock();await Promise.resolve();assert.equal(sources.length,1);assert.equal(sources[0].loop,true);assert.ok(sources[0].buffer.name.includes('background'));
audio.hit(false);audio.hit(true);assert.ok(sources[1].buffer.name.includes('normal_punch'));assert.ok(sources[2].buffer.name.includes('strong_punch'));
assert.equal(sources[2].offset,.12,'strong hit skips the slow lead-in');audio.heal();assert.ok(sources[3].buffer.name.includes('levelup'),'healing plays level-up clip');
audio.update(false,true);assert.equal(sources[0].stopped,true,'music stops outside play');audio.update(true,false);audio.hit(false);assert.equal(sources.length,4,'mute disables music and hits');
console.log('Gameplay-only looping music, normal/strong recorded hits, gesture unlock and mute passed.');
