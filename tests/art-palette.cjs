// Palette checks protect readable HUD text and colored, shaded art across upgrades.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const e={};vm.createContext(e);vm.runInContext(fs.readFileSync('game/src/art-palette.js','utf8'),e);
function rgb(hex){assert.match(hex,/^#[0-9a-f]{6}$/i);return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)}
function sat(hex){const c=rgb(hex),max=Math.max(...c),min=Math.min(...c);return max?(max-min)/max:0}
function lum(hex){return rgb(hex).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const c of [...e.ART.coats,...Object.values(e.ART.roles),...e.ART.forest.flatMap(p=>[p.leaf,p.light])])assert(sat(c)>.4,'Subject colors must remain chromatic');
for(const p of e.ART.forest)assert(lum(p.light)>lum(p.leaf),'Tree highlight must stay lighter than leaf');
const css=fs.readFileSync('game/styles/game.css','utf8').split('/* Colorful book world:')[1];assert(css);
// Test actual final CSS foreground/background declarations, not duplicated expected hexes.
for(const selector of ['#coins','.meta','#radarLabel','#raidRadar #bearChip','#raidRadar #bearChip.warn,#raidRadar #bearChip.raid']){
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),rule=css.match(new RegExp(escaped+'\\{([^}]+)\\}'));assert(rule,selector);
 const fg=rule[1].match(/(?:^|;)color:(#[0-9a-f]+)/i)?.[1];let bg=rule[1].match(/background:(#[0-9a-f]+)/i)?.[1];
 if(selector==='#coins')bg=css.match(/\.coins\{background:(#[0-9a-f]+)/)[1];
 if(selector==='#radarLabel')bg=css.match(/#raidRadar\{background:(#[0-9a-f]+)/)[1].slice(0,7);
 assert(fg&&bg,selector);const hex=c=>c.length===4?'#'+c.slice(1).split('').map(v=>v+v).join(''):c.slice(0,7);
 assert(contrast(hex(fg),hex(bg))>=4.5,selector+' normal text contrast');
}
console.log('PASS: chromatic subjects, ordered tree shading, WCAG AA coin/meta/radar/countdown text contrast.');
