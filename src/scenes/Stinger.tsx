import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightningBackground} from '../components/Lightning';
import {Logo} from '../components/Logo';
export const Stinger:React.FC=()=>{
 const f=useCurrentFrame();
 const cover=interpolate(f,[0,10,46,59],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scale=interpolate(f,[0,27,59],[.18,1.08,2.7]);
 const tear=interpolate(f,[0,24,36,59],[-1100,0,0,1100]);
 return <AbsoluteFill style={{opacity:cover,overflow:'hidden'}}>
  <LightningBackground intensity={1.7}/>
  <div style={{position:'absolute',left:tear-400,top:-150,width:800,height:1400,background:'linear-gradient(90deg,transparent,#dfffff 45%,#00aaff 53%,transparent)',transform:'rotate(17deg)',filter:'blur(12px)',boxShadow:'0 0 100px #00aaff'}}/>
  <AbsoluteFill style={{alignItems:'center',justifyContent:'center'}}><div style={{transform:`scale(${scale})`}}><Logo size={620}/></div></AbsoluteFill>
 </AbsoluteFill>;
};
