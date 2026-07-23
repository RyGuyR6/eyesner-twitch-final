import {execFileSync} from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';

type RenderJob = {
  composition: string;
  filename: string;
  transparent: boolean;
};

const jobs: RenderJob[] = [
  {
    composition: 'StartingSoon',
    filename: 'StartingSoon.mp4',
    transparent: false,
  },
  {
    composition: 'BeRightBack',
    filename: 'BeRightBack.mp4',
    transparent: false,
  },
  {
    composition: 'Intermission',
    filename: 'Intermission.mp4',
    transparent: false,
  },
  {
    composition: 'StreamEnding',
    filename: 'StreamEnding.mp4',
    transparent: false,
  },
  {
    composition: 'GameplayOverlay',
    filename: 'GameplayOverlay.webm',
    transparent: true,
  },
  {
    composition: 'FollowerAlert',
    filename: 'FollowerAlert.webm',
    transparent: true,
  },
  {
    composition: 'SubscriberAlert',
    filename: 'SubscriberAlert.webm',
    transparent: true,
  },
  {
    composition: 'LightningStinger',
    filename: 'LightningStinger.webm',
    transparent: true,
  },
];

const outputDirectory = path.resolve('dist/renders');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;

fs.removeSync(outputDirectory);
fs.ensureDirSync(outputDirectory);

for (const job of jobs) {
  const outputPath = path.join(outputDirectory, job.filename);

  const args = [
    'remotion',
    'render',
    'src/index.ts',
    job.composition,
    outputPath,
    '--overwrite',
    '--image-format=png',
    '--scale=1',
    '--concurrency=50%',
  ];

  if (job.transparent) {
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
  console.log('------------------------------------------------');
  console.log(`Composition: ${job.composition}`);
  console.log(`Output:      ${outputPath}`);
  console.log('Resolution:  1920x1080');
  console.log('Frame rate:  60 FPS');
  console.log(
    `Format:      ${
      job.transparent
        ? 'VP9 WebM with transparency'
        : 'H.264 MP4'
    }`
  );
  console.log('------------------------------------------------');

  execFileSync('npx', args, {
    stdio: 'inherit',
  });
}

console.log('');
console.log('All Remotion renders completed.');
