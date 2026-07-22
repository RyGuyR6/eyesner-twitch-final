import {execFileSync} from 'node:child_process';
import {accessSync, constants} from 'node:fs';
import fs from 'fs-extra';
const scenes = ['StartingSoon', 'BeRightBack', 'StreamEnding', 'Intermission', 'GameplayOverlay', 'FollowerAlert', 'SubscriberAlert', 'LightningStinger'];
const getPlatformBrowserExecutables = () => {
 switch (process.platform) {
  case 'darwin':
   return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  case 'win32':
   return ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files/Chromium/Application/chrome.exe'];
  default:
   return ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
 }
};
const isExecutableAccessible = (candidate: string) => {
 try {
  accessSync(candidate, constants.X_OK);
  return true;
 } catch {
  return false;
 }
};
const browserExecutableCandidates = [
 process.env.REMOTION_BROWSER_EXECUTABLE,
 process.env.CHROME_PATH,
 process.env.PUPPETEER_EXECUTABLE_PATH,
 ...getPlatformBrowserExecutables(),
].filter((candidate): candidate is string => candidate !== null && candidate !== undefined && candidate !== '');
const browserExecutable = browserExecutableCandidates.find((candidate) => isExecutableAccessible(candidate)) ?? null;
fs.ensureDirSync('dist/renders');
if (browserExecutable) console.log(`Using browser executable: ${browserExecutable}`);
else console.warn('No local browser executable found. Remotion will try to download Chrome Headless Shell.');
for (const scene of scenes) {
 const transparent = ['GameplayOverlay', 'FollowerAlert', 'SubscriberAlert', 'LightningStinger'].includes(scene);
 const output = `dist/renders/${scene}.webm`;
 const args = ['remotion', 'render', 'src/index.ts', scene, output, '--codec=vp8', '--overwrite'];
 if (browserExecutable) args.push(`--browser-executable=${browserExecutable}`);
 if (transparent) args.push('--image-format=png', '--pixel-format=yuva420p');
 console.log(`Rendering ${scene}...`);
 execFileSync('npx', args, {stdio: 'inherit'});
}
