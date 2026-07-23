import {execFileSync} from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';

type RenderDefinition = {
  id: string;
  output: string;
  transparent: boolean;
};

const renders: RenderDefinition[] = [
  {
    id: 'StartingSoon',
    output: 'StartingSoon.mp4',
    transparent: false,
  },
  {
    id: 'BeRightBack',
    output: 'BeRightBack.mp4',
    transparent: false,
  },
  {
    id: 'Intermission',
    output: 'Intermission.mp4',
    transparent: false,
  },
  {
    id: 'StreamEnding',
    output: 'StreamEnding.mp4',
    transparent: false,
  },
  {
    id: 'GameplayOverlay',
    output: 'GameplayOverlay.webm',
    transparent: true,
  },
  {
    id: 'FollowerAlert',
    output: 'FollowerAlert.webm',
    transparent: true,
  },
  {
    id: 'SubscriberAlert',
    output: 'SubscriberAlert.webm',
    transparent: true,
  },
  {
    id: 'LightningStinger',
    output: 'LightningStinger.webm',
    transparent: true,
  },
];

const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const outputDirectory = path.resolve('dist/renders');

fs.removeSync(outputDirectory);
fs.ensureDirSync(outputDirectory);

for (const render of renders) {
  const outputLocation = path.join(outputDirectory, render.output);

  const args = [
    'remotion',
    'render',
    'src/index.ts',
    render.id,
    outputLocation,
    '--overwrite',
    '--image-format=png',
    '--scale=1',
    '--concurrency=50%',
  ];

  if (render.transparent) {
    args.push(
      '--codec=vp9',
      '--pixel-format=yuva420p',
      '--crf=10'
    );
  } else {
    args.push(
      '--codec=h264',
      '--pixel-format=yuv420p',
      '--crf=8'
    );
  }

  if (browserExecutable) {
    args.push(`--browser-executable=${browserExecutable}`);
  }

  console.log('');
  console.log('==========================================');
  console.log(`Rendering ${render.id}`);
  console.log(`Output: ${outputLocation}`);
  console.log(
    render.transparent
      ? 'Format: transparent WebM / VP9'
      : 'Format: MP4 / H.264'
  );
  console.log('Resolution: 1920x1080');
  console.log('Frame rate: 60 FPS');
  console.log('==========================================');

  execFileSync('npx', args, {
    stdio: 'inherit',
  });
}

console.log('');
console.log('All premium renders completed.');
