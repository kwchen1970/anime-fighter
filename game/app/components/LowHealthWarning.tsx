'use client';
import {useEffect,useState} from 'react';
export default function LowHealthWarning({hp,maxHp,active}:{hp:number;maxHp:number;active:boolean}){
 const low=active&&hp>0&&hp/maxHp<=.25;
 const [flashing,setFlashing]=useState(false);
 useEffect(()=>{if(!low){setFlashing(false);return;}setFlashing(true);const timer=setTimeout(()=>setFlashing(false),5000);return()=>clearTimeout(timer);},[low]);
 return low?<div className={'low-health-warning'+(flashing?' flashing':'')}><span role="status">LOW HEALTH · FIND THE HEALING CAT</span></div>:null;
}
