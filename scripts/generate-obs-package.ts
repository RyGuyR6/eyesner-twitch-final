import fs from 'fs-extra';
import path from 'node:path';

const renderDirectory = path.resolve('dist/renders');
const outputDirectory = path.resolve('dist/obs-import');
const mediaDirectory = path.join(outputDirectory, 'media');

if (!fs.existsSync(renderDirectory)) {
  throw new Error(
    'dist/renders does not exist. Run the render script first.'
  );
}

fs.removeSync(outputDirectory);
fs.ensureDirSync(mediaDirectory);
fs.copySync(renderDirectory, mediaDirectory);

const logoSource = path.resolve(
  'public/assets/eyesner-logo.png'
);

if (fs.existsSync(logoSource)) {
  fs.copySync(
    logoSource,
    path.join(outputDirectory, 'eyesner-logo.png')
  );
}

fs.writeFileSync(
  path.join(outputDirectory, 'README.txt'),
  [
    'EYESNER PREMIUM OBS PACKAGE',
    '',
    'Resolution: 1920x1080',
    'Frame rate: 60 FPS',
    '',
    'Use MP4 files for full-screen scenes.',
    'Use WebM files for transparent overlays and alerts.',
    'Use LightningStinger.webm as the OBS stinger transition.',
    '',
  ].join('\n'),
  'utf8'
);

console.log(`OBS package created: ${outputDirectory}`);
