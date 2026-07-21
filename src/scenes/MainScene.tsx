import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {LightningBackground} from '../components/Lightning';
import {Logo} from '../components/Logo';
export const MainScene:React.FC<{title:string;subtitle:string}>=({title,subtitle})=>{
 const f=useCurrentFrame();
 const rise=interpolate(f,[0,28],[44,0],{extrapolateRight:'clamp'});
 const opacity=interpolate(f,[0,22],[0,1],{extrapolateRight:'clamp'});
 const scan=(f*9)%2100-100;
 return <AbsoluteFill style={{fontFamily:'Arial Black,Impact,sans-serif',color:'white'}}>
  <LightningBackground intensity={1.15}/>
  <AbsoluteFill style={{alignItems:'center',justifyContent:'center'}}>
   <div style={{transform:`translateY(${Math.sin(f*.035)*7}px)`}}><Logo size={660}/></div>
   <div style={{marginTop:-54,transform:`translateY(${rise}px)`,opacity,textAlign:'center',position:'relative'}}>
    <div style={{fontSize:88,letterSpacing:9,textShadow:'0 4px 0 #041526,0 0 14px #bdfcff,0 0 44px #008cff'}}>{title}</div>
    <div style={{position:'absolute',left:scan,top:0,width:90,height:100,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent)',transform:'skewX(-18deg)',filter:'blur(5px)',mixBlendMode:'screen'}}/>
    <div style={{fontSize:28,letterSpacing:12,color:'#8eeeff',marginTop:10,textShadow:'0 0 18px #00aaff'}}>{subtitle}</div>
   </div>
  </AbsoluteFill>
  <div style={{position:'absolute',bottom:42,width:'100%',textAlign:'center',fontSize:22,letterSpacing:7,color:'#8beaff',textShadow:'0 0 16px #008cff'}}>YOUTUBE • TWITCH • TIKTOK / EYESNER</div>
 </AbsoluteFill>;
};
