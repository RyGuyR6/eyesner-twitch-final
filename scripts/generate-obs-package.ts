import fs from 'fs-extra';
const out='dist/obs-import';
fs.removeSync(out);fs.ensureDirSync(out);
fs.copySync('dist/renders',`${out}/media`);
fs.copySync('public/assets/eyesner-logo.png',`${out}/eyesner-logo.png`);
fs.writeFileSync(`${out}/README.txt`,`EYESNER LIGHTNING OBS PACKAGE\n\nAdd the WEBM files from the media folder as Media Sources in OBS.\nEnable Loop for StartingSoon, BeRightBack, StreamEnding, Intermission and GameplayOverlay.\nUse LightningStinger.webm as a Stinger transition.\n`);
console.log(`OBS package created: ${out}`);
