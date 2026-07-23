import React from 'react';
import {Composition} from 'remotion';
import {MainScene} from './scenes/MainScene';
import {GameplayOverlay} from './scenes/GameplayOverlay';
import {AlertScene} from './scenes/AlertScene';
import {Stinger} from './scenes/Stinger';

const FPS = 60;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StartingSoon"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'STREAM STARTING',
          subtitle: 'THE STORM IS BUILDING',
        }}
      />

      <Composition
        id="BeRightBack"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'BE RIGHT BACK',
          subtitle: 'STAY CHARGED',
        }}
      />

      <Composition
        id="StreamEnding"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'STREAM OFFLINE',
          subtitle: 'THANKS FOR WATCHING',
        }}
      />

      <Composition
        id="Intermission"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'INTERMISSION',
          subtitle: 'RECHARGING THE GRID',
        }}
      />

      <Composition
        id="GameplayOverlay"
        component={GameplayOverlay}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="FollowerAlert"
        component={AlertScene}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          label: 'NEW FOLLOWER',
          username: 'RYGUYR6',
        }}
      />

      <Composition
        id="SubscriberAlert"
        component={AlertScene}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          label: 'NEW SUBSCRIBER',
          username: 'EYESNER',
        }}
      />

      <Composition
        id="LightningStinger"
        component={Stinger}
        durationInFrames={FPS * 2}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
