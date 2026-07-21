import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';

type Point = {x:number; y:number};

type Bolt = {
  points: Point[];
  branches: Point[][];
  start: number;
  life: number;
  power: number;
};

const W = 1920;
const H = 1080;
const CYCLE = 240;

const pointPath = (points: Point[]) => points.map((p,i)=>`${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

const buildSegment = (a: Point,b: Point,seed:string,steps=13,jitter=58): Point[] => {
  const pts: Point[]=[];
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const envelope=Math.sin(Math.PI*t);
    const x=a.x+(b.x-a.x)*t+(random(`${seed}-x-${i}`)-.5)*jitter*envelope;
    const y=a.y+(b.y-a.y)*t+(random(`${seed}-y-${i}`)-.5)*jitter*envelope;
    pts.push({x,y});
  }
  return pts;
};

const makeBolt = (index:number):Bolt => {
  const side=Math.floor(random(`side-${index}`)*4);
  let a:Point; let b:Point;
  if(side===0){a={x:random(`ax-${index}`)*W,y:-30}; b={x:W*(.25+random(`bx-${index}`)*.5),y:H*(.38+random(`by-${index}`)*.35)}}
  else if(side===1){a={x:W+30,y:random(`ay-${index}`)*H}; b={x:W*(.5+random(`bx-${index}`)*.32),y:H*(.25+random(`by-${index}`)*.55)}}
  else if(side===2){a={x:random(`ax-${index}`)*W,y:H+30}; b={x:W*(.2+random(`bx-${index}`)*.6),y:H*(.48+random(`by-${index}`)*.26)}}
  else {a={x:-30,y:random(`ay-${index}`)*H}; b={x:W*(.18+random(`bx-${index}`)*.32),y:H*(.2+random(`by-${index}`)*.62)}}
  const points=buildSegment(a,b,`main-${index}`,14,90);
  const branches:Point[][]=[];
  for(let j=0;j<4;j++){
    const at=3+Math.floor(random(`branch-at-${index}-${j}`)*8);
    const start=points[at];
    const angle=(random(`branch-angle-${index}-${j}`)-.5)*2.4;
    const len=95+random(`branch-len-${index}-${j}`)*210;
    const end={x:start.x+Math.cos(angle)*len,y:start.y+Math.sin(angle)*len};
    branches.push(buildSegment(start,end,`branch-${index}-${j}`,6,40));
  }
  return {points,branches,start:Math.floor(random(`start-${index}`)*CYCLE),life:5+Math.floor(random(`life-${index}`)*8),power:.55+random(`power-${index}`)*.45};
};

const BOLTS=Array.from({length:18},(_,i)=>makeBolt(i));

const boltOpacity=(frame:number,b:Bolt)=>{
  const local=(frame-b.start+CYCLE)%CYCLE;
  if(local>b.life)return 0;
  const attack=Math.min(1,local/1.2);
  const decay=1-local/b.life;
  const flicker=.6+.4*Math.max(0,Math.sin((local+1)*7.7));
  return attack*decay*flicker*b.power;
};

export const LightningBackground:React.FC<{intensity?:number; transparent?:boolean}>=({intensity=1,transparent=false})=>{
  const frame=useCurrentFrame();
  const active=BOLTS.map(b=>({b,o:boltOpacity(frame,b)})).filter(x=>x.o>.01);
  const flash=Math.min(1,active.reduce((sum,x)=>sum+x.o*x.b.power,0));
  const breathe=interpolate(Math.sin(frame*.045),[-1,1],[.34,.68]);
  const cloudX=(frame*1.7)%W;
  return <AbsoluteFill style={{background:transparent?'transparent':'radial-gradient(circle at 50% 42%, #093365 0%, #031329 34%, #00040b 73%, #000 100%)',overflow:'hidden'}}>
    {!transparent && <>
      <AbsoluteFill style={{background:`radial-gradient(ellipse at ${40+Math.sin(frame*.01)*18}% 42%, rgba(0,134,255,.24), transparent 48%)`,opacity:breathe}}/>
      <AbsoluteFill style={{background:'repeating-radial-gradient(ellipse at center,rgba(16,48,82,.18) 0 2px,transparent 3px 14px)',transform:`translateX(${cloudX-W}px) scale(1.35)`,filter:'blur(18px)',opacity:.42}}/>
      <AbsoluteFill style={{background:'linear-gradient(120deg,transparent 8%,rgba(0,176,255,.08) 28%,transparent 46%,rgba(0,82,255,.08) 71%,transparent 88%)',transform:`translateX(${Math.sin(frame*.012)*90}px)`,filter:'blur(12px)'}}/>
    </>}
    {Array.from({length:95}).map((_,i)=>{
      const x=(random(`px-${i}`)*W+frame*(.15+random(`pv-${i}`)*.55))%W;
      const y=(random(`py-${i}`)*H+Math.sin(frame*.025+i)*9)%H;
      const s=.8+random(`ps-${i}`)*3.6;
      const o=(.08+.42*Math.max(0,Math.sin(frame*.026+i*1.31)))*intensity;
      return <div key={i} style={{position:'absolute',left:x,top:y,width:s,height:s,borderRadius:'50%',background:'#9af5ff',boxShadow:'0 0 10px #00bfff,0 0 24px #006eff',opacity:o}}/>;
    })}
    <svg width={W} height={H} style={{position:'absolute',inset:0,overflow:'visible'}}>
      {active.map(({b,o},i)=><g key={i} opacity={Math.min(1,o*intensity)}>
        <path d={pointPath(b.points)} fill="none" stroke="#006dff" strokeWidth={28*b.power} strokeLinecap="round" strokeLinejoin="round" opacity=".22" style={{filter:'blur(10px)'}}/>
        <path d={pointPath(b.points)} fill="none" stroke="#00bfff" strokeWidth={12*b.power} strokeLinecap="round" strokeLinejoin="round" opacity=".8" style={{filter:'drop-shadow(0 0 14px #00aaff)'}}/>
        <path d={pointPath(b.points)} fill="none" stroke="#efffff" strokeWidth={3.5*b.power} strokeLinecap="round" strokeLinejoin="round"/>
        {b.branches.map((br,j)=><g key={j} opacity={.62}>
          <path d={pointPath(br)} fill="none" stroke="#00aaff" strokeWidth={5*b.power} strokeLinecap="round"/>
          <path d={pointPath(br)} fill="none" stroke="#d9ffff" strokeWidth={1.5*b.power} strokeLinecap="round"/>
        </g>)}
      </g>)}
    </svg>
    <AbsoluteFill style={{background:'#eaffff',opacity:flash*.22*intensity,mixBlendMode:'screen'}}/>
    <AbsoluteFill style={{background:`radial-gradient(circle at 50% 48%, rgba(96,234,255,${flash*.3}), transparent 55%)`,mixBlendMode:'screen'}}/>
    {!transparent && <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(0,0,0,.76),transparent 27%,transparent 73%,rgba(0,0,0,.76))'}}/>}
  </AbsoluteFill>;
};

export const ElectricFrame:React.FC<{x:number;y:number;width:number;height:number;label?:string}>=({x,y,width,height,label})=>{
  const frame=useCurrentFrame();
  const pulse=interpolate(Math.sin(frame*.12),[-1,1],[.58,1]);
  const dash=(frame*7)%120;
  return <div style={{position:'absolute',left:x,top:y,width,height,clipPath:'polygon(18px 0,calc(100% - 18px) 0,100% 18px,100% calc(100% - 18px),calc(100% - 18px) 100%,18px 100%,0 calc(100% - 18px),0 18px)',background:'rgba(0,5,16,.20)',boxShadow:`0 0 ${18+18*pulse}px rgba(0,184,255,.9),inset 0 0 25px rgba(0,112,255,.2)`}}>
    <svg width={width} height={height} style={{position:'absolute',inset:0,overflow:'visible',filter:'drop-shadow(0 0 8px #00c8ff)'}}>
      <rect x="3" y="3" width={width-6} height={height-6} rx="12" fill="none" stroke="#8ff6ff" strokeWidth="3" strokeDasharray="36 18 8 14" strokeDashoffset={-dash}/>
      <rect x="10" y="10" width={width-20} height={height-20} rx="8" fill="none" stroke="#0078ff" strokeWidth="2" strokeDasharray="8 22" strokeDashoffset={dash*.6} opacity={pulse}/>
    </svg>
    {label&&<div style={{position:'absolute',left:24,top:-1,padding:'4px 18px',fontFamily:'Arial Black, sans-serif',fontSize:18,letterSpacing:4,color:'#dfffff',background:'#031226',textShadow:'0 0 12px #00bfff'}}>{label}</div>}
  </div>;
};
