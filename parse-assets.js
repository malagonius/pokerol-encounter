const fs=require('fs');
const t=fs.readFileSync('pokeroledex-bundle.js','utf8');
const exts=['png','svg','webp','jpg','jpeg','gif'];
for (const ext of exts){
 const m=[...new Set((t.match(new RegExp('[A-Za-z0-9_\\-\\/\\.]{5,}\\.'+ext,'g'))||[]))];
 console.log(ext.toUpperCase(), m.length);
 console.log(m.slice(0,30).join('\n'));
}
