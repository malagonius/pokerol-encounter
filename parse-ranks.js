const fs = require('fs');
const t = fs.readFileSync('pokeroledex-bundle.js', 'utf8');
const rankWords = [...new Set((t.match(/Rookie|Standard|Advanced|Expert|Ace|Master|Champion/gi) || []))];
const assetPaths = [...new Set((t.match(/\/assets\/[A-Za-z0-9_\-\.]+\.(png|svg|webp|jpg|jpeg|gif)/g) || []))];
const rankLikeAssets = assetPaths.filter(p => /rank|rookie|standard|advanced|expert|ace|master|champion|pokeball|ball/i.test(p));
console.log('RANK_WORDS:', rankWords.join(', '));
console.log('RANK_LIKE_ASSETS_COUNT:', rankLikeAssets.length);
console.log(rankLikeAssets.slice(0, 80).join('\n'));
