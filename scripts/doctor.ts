import fs from 'node:fs';
const required=['src/index.ts','src/Root.tsx','public/assets/eyesner-logo.png','remotion.config.ts'];
let ok=true;
for (const file of required){if(!fs.existsSync(file)){console.error(`MISSING: ${file}`);ok=false}else console.log(`OK: ${file}`)}
if(!ok) process.exit(1);
console.log('Eyesner lightning package is ready.');
