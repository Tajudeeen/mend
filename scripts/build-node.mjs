import {spawnSync} from 'node:child_process';
for(const args of [['node_modules/prisma/build/index.js','generate'],['node_modules/next/dist/bin/next','build']]){const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.status!==0)process.exit(r.status??1)}
