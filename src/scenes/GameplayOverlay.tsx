import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ElectricFrame, LightningBackground} from '../components/Lightning';
import {Logo} from '../components/Logo';
export const GameplayOverlay:React.FC=()=>{
 const f=useCurrentFrame();
 return <AbsoluteFill>
  <AbsoluteFill style={{opacity:.18}}><LightningBackground intensity={.8}/></AbsoluteFill>
  <ElectricFrame x={34} y={34} width={1852} height={1012}/>
  <ElectricFrame x={1414} y={738} width={430} height={245} label="CAM"/>
  <div style={{position:'absolute',right:103,bottom:268,transform:'scale(.255)',transformOrigin:'bottom right'}}><Logo/></div>
  <div style={{position:'absolute',left:70,bottom:52,fontFamily:'Arial Black',fontSize:28,letterSpacing:5,color:'#fff',textShadow:'0 0 15px #00b7ff'}}>EYESNER</div>
  {Array.from({length:8}).map((_,i)=><div key={i} style={{position:'absolute',left:45+i*260,top:34,width:110,height:2,background:'linear-gradient(90deg,transparent,#a8fbff,transparent)',opacity:.3+.7*Math.max(0,Math.sin(f*.12+i)),boxShadow:'0 0 12px #00bfff'}}/>)}
 </AbsoluteFill>;
};
