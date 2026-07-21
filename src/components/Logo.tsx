import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
export const Logo:React.FC<{size?:number;charged?:boolean}>=({size=620,charged=true})=>{
 const f=useCurrentFrame();
 const pulse=interpolate(Math.sin(f*.075),[-1,1],[.965,1.035]);
 const surge=Math.max(0,Math.sin(f*.031))**18;
 return <div style={{position:'relative',width:size,height:size,transform:`scale(${pulse+surge*.018})`}}>
   {charged&&<div style={{position:'absolute',inset:'14%',borderRadius:'50%',background:'radial-gradient(circle,rgba(100,245,255,.24),transparent 66%)',filter:'blur(14px)',opacity:.55+surge*.45}}/>}
   <Img src={staticFile('assets/eyesner-logo.png')} style={{position:'absolute',inset:0,width:size,height:size,objectFit:'contain',filter:`drop-shadow(0 0 ${18+surge*24}px #89f7ff) drop-shadow(0 0 ${48+surge*42}px #006bff)`}}/>
 </div>;
};
