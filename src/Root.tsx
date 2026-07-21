import React from 'react';
import {Composition} from 'remotion';
import {MainScene} from './scenes/MainScene';
import {GameplayOverlay} from './scenes/GameplayOverlay';
import {AlertScene} from './scenes/AlertScene';
import {Stinger} from './scenes/Stinger';

const fps = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="StartingSoon" component={MainScene} durationInFrames={fps * 20} fps={fps} width={1920} height={1080} defaultProps={{title:'STREAM STARTING', subtitle:'THE STORM IS BUILDING'}} />
    <Composition id="BeRightBack" component={MainScene} durationInFrames={fps * 20} fps={fps} width={1920} height={1080} defaultProps={{title:'BE RIGHT BACK', subtitle:'STAY CHARGED'}} />
    <Composition id="StreamEnding" component={MainScene} durationInFrames={fps * 20} fps={fps} width={1920} height={1080} defaultProps={{title:'STREAM OFFLINE', subtitle:'THANKS FOR WATCHING'}} />
    <Composition id="Intermission" component={MainScene} durationInFrames={fps * 20} fps={fps} width={1920} height={1080} defaultProps={{title:'INTERMISSION', subtitle:'RECHARGING THE GRID'}} />
    <Composition id="GameplayOverlay" component={GameplayOverlay} durationInFrames={fps * 20} fps={fps} width={1920} height={1080} />
    <Composition id="FollowerAlert" component={AlertScene} durationInFrames={fps * 5} fps={fps} width={1920} height={1080} defaultProps={{label:'NEW FOLLOWER', username:'RYGUYR6'}} />
    <Composition id="SubscriberAlert" component={AlertScene} durationInFrames={fps * 5} fps={fps} width={1920} height={1080} defaultProps={{label:'NEW SUBSCRIBER', username:'EYESNER'}} />
    <Composition id="LightningStinger" component={Stinger} durationInFrames={fps * 2} fps={fps} width={1920} height={1080} />
  </>
);
