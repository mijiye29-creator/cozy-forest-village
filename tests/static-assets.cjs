const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),handler=require('./static-server.cjs')(root);
function get(url){const result={status:200,headers:{}};handler({url},{setHeader:(k,v)=>result.headers[k]=v,writeHead:n=>result.status=n,end:b=>result.body=b});return result;}
const html=get('/game/index.html?test=1');assert.equal(html.status,200);
for(const url of [...html.body.toString().matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('#'))){const asset=get('/game/'+url);assert.equal(asset.status,200,url);if(url.includes('.js'))assert.equal(asset.headers['Content-Type'],'text/javascript');if(url.includes('.css'))assert.equal(asset.headers['Content-Type'],'text/css');}
assert.equal(get('/runtime.js').headers['Content-Type'],'text/javascript');assert.equal(get('/styles/game.css').headers['Content-Type'],'text/css');
assert.equal(get('/game/missing.js').status,404);assert.equal(get('/%2e%2e%2fREADME.md').status,403);
const map=JSON.parse(get('/runtime.js.map').body.toString());for(const src of map.sources)assert.equal(get('/'+src).status,200,src);
assert.equal(get('/').body.toString(),fs.readFileSync(path.join(root,'game/index.html'),'utf8'));
console.log('PASS: HTML/JS/CSS/source-map assets, query versions, 404 and traversal protection (in-process).');
