import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LightningBackground} from '../components/Lightning';
import {Logo} from '../components/Logo';
export const AlertScene:React.FC<{label:string;username:string}>=({label,username})=>{
 const f=useCurrentFrame(); const {fps}=useVideoConfig();
 const s=spring({frame:f,fps,config:{damping:9,stiffness:190,mass:.65}});
 const out=interpolate(f,[118,149],[1,0],{extrapolateLeft:'clamp'});
 const shock=interpolate(f,[0,17],[0,1],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{alignItems:'center',justifyContent:'center'}}>
  <AbsoluteFill style={{opacity:.38*out}}><LightningBackground intensity={1.45}/></AbsoluteFill>
  <div style={{position:'absolute',width:460,height:460,border:'5px solid #aafaff',borderRadius:'50%',transform:`scale(${.3+shock*2.5})`,opacity:(1-shock)*.8,boxShadow:'0 0 40px #00aaff'}}/>
  <div style={{display:'flex',alignItems:'center',gap:18,transform:`scale(${s}) translateY(${(1-s)*38}px)`,opacity:out,padding:'20px 46px',background:'linear-gradient(90deg,rgba(0,5,20,.95),rgba(5,45,90,.96))',border:'4px solid #9cf6ff',boxShadow:'0 0 25px #00aaff,0 0 90px rgba(0,120,255,.9)',clipPath:'polygon(20px 0,100% 0,calc(100% - 20px) 100%,0 100%)'}}>
   <Logo size={145}/><div style={{fontFamily:'Arial Black',color:'white'}}><div style={{fontSize:25,letterSpacing:7,color:'#8cf5ff'}}>{label}</div><div style={{fontSize:62,letterSpacing:3,textShadow:'0 0 18px #00aaff'}}>{username}</div></div>
  </div>
 </AbsoluteFill>;
};
