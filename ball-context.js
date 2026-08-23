const fs=require('fs');
const t=fs.readFileSync('pokeroledex-bundle.js','utf8');
const balls=['WhiteBall.png','PokeBall.png','GreatBall.png','ExpertBall.png','UltraBall.png','CherishBall.png','MasterBall.png','ChampionBall.png'];
for(const b of balls){
 const i=t.indexOf(b);
 if(i<0){console.log('missing',b);continue;}
 console.log('\n===',b,'===');
 console.log(t.slice(Math.max(0,i-240), Math.min(t.length,i+260)));
}
