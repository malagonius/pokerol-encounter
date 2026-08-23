const fs=require('fs');
const t=fs.readFileSync('pokeroledex-bundle.js','utf8');
const ranks=['ROOKIE','STANDARD','ADVANCED','EXPERT','ACE','MASTER','CHAMPION'];
for(const r of ranks){
  const i=t.indexOf(r);
  if(i===-1){console.log('missing',r);continue;}
  const start=Math.max(0,i-350);
  const end=Math.min(t.length,i+650);
  console.log('\n===',r,'===');
  console.log(t.slice(start,end));
}
