const fs=require('node:fs'),path=require('node:path');
const game=path.resolve(__dirname,'../game');
function readRuntime(...ids){const m=JSON.parse(fs.readFileSync(path.join(game,'runtime-manifest.json'),'utf8'));const selected=ids.length?m.modules.filter(x=>ids.includes(x.id)):m.modules;if(ids.some(id=>!selected.some(x=>x.id===id)))throw Error('Unknown runtime category');return selected.map(x=>fs.readFileSync(path.join(game,x.path),'utf8')).join('');}
module.exports={readRuntime};
