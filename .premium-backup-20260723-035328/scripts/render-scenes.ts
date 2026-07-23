import {execFileSync} from 'node:child_process';
import fs from 'fs-extra';
const scenes=['StartingSoon','BeRightBack','StreamEnding','Intermission','GameplayOverlay','FollowerAlert','SubscriberAlert','LightningStinger'];
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE;
fs.ensureDirSync('dist/renders');
for(const scene of scenes){
 const transparent=['GameplayOverlay','FollowerAlert','SubscriberAlert','LightningStinger'].includes(scene);
 const output=`dist/renders/${scene}.webm`;
 const args=['remotion','render','src/index.ts',scene,output,'--codec=vp8','--overwrite'];
 if(browserExecutable) args.push(`--browser-executable=${browserExecutable}`);
 if(transparent) args.push('--image-format=png','--pixel-format=yuva420p');
 console.log(`Rendering ${scene}...`);
 execFileSync('npx',args,{stdio:'inherit'});
}
