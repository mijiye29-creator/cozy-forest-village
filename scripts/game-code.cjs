// Print an index first; read only the matching source with rg/sed afterwards.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),map=JSON.parse(fs.readFileSync(path.join(root,'game/module-map.json'),'utf8'));
const args=process.argv.slice(2),symbol=args[0]==='--symbol',q=(symbol?args[1]:args[0])||'--list';
let count=0;
for(const m of map.modules){const hits=m.symbols.filter(s=>s.name.toLowerCase().includes(q.toLowerCase()));if(q==='--list'||(!symbol&&(m.id+' '+m.topic).includes(q))||hits.length){count++;console.log(`game/${m.path} · ${m.lines} lines · ${m.bytes} bytes · ${m.topic}`);if(q!=='--list'){const selected=symbol?hits:m.symbols;console.log(selected.map(s=>`${s.name}:${s.line}`).join(' '));}}}
if(!count){console.error('No indexed match. Use rg -n on game/src (index covers top-level function and first var declarations).');process.exitCode=1;}
