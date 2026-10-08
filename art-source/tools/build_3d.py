"""Export every model in models.js to art-source/models/<name>.glb and render game sprite sheets
to game/assets/sprites/<name>.webp + atlas.json, plus a contact sheet for review.
Usage (repo root): python3 -m http.server 8788 &  then  python3 art-source/tools/build_3d.py [names...]
Needs: npm i (in art-source/tools), Playwright Chromium, Pillow."""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
MODELS=os.path.join(ROOT,'art-source','models'); SPR=os.path.join(ROOT,'game','assets','sprites'); PREV=os.path.join(ROOT,'art-source','previews')
URL=os.environ.get('STUDIO_URL','http://localhost:8788/art-source/tools/studio.html')
for d in (MODELS,SPR,PREV): os.makedirs(d,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
    pg.goto(URL); pg.wait_for_function('window.studioReady===true',timeout=30000)
    lst=pg.evaluate('listModels()'); names=sys.argv[1:] or [m['name'] for m in lst]
    atlas_path=os.path.join(SPR,'atlas.json'); atlas=json.load(open(atlas_path)) if os.path.exists(atlas_path) else {}
    thumbs=[]
    for n in names:
        g=pg.evaluate('n=>exportGLB(n)',n); open(os.path.join(MODELS,n+'.glb'),'wb').write(base64.b64decode(g['b64']))
        r=pg.evaluate('n=>renderSheet(n)',n); im=Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGBA')
        im.save(os.path.join(SPR,n+'.webp'),'WEBP',quality=88,method=6,exact=False)
        meta=r['meta']; meta['glb']='art-source/models/'+n+'.glb'; meta['clips']=g['clips']; atlas[n]=meta
        fw,fh=meta['frameW'],meta['frameH']; thumbs.append((n,im.crop((0,0,fw,fh))))
        print(f"{n:15s} {meta['kind']:8s} frame {fw}x{fh} anims {','.join(meta['anims'])} glb {os.path.getsize(os.path.join(MODELS,n+'.glb'))//1024}KB sheet {os.path.getsize(os.path.join(SPR,n+'.webp'))//1024}KB")
    json.dump(dict(sorted(atlas.items())),open(atlas_path,'w'),ensure_ascii=False,indent=1)
    if not sys.argv[1:]:
        # contact sheet (first frame of each model, scaled to a common 180px cell)
        cell=200; cols=6; rows=(len(thumbs)+cols-1)//cols; sheet=Image.new('RGBA',(cols*cell,rows*(cell+22)),(233,241,246,255))
        from PIL import ImageDraw; d=ImageDraw.Draw(sheet)
        for i,(n,t) in enumerate(thumbs):
            t=t.copy(); t.thumbnail((cell-16,cell-16)); x=(i%cols)*cell; y=(i//cols)*(cell+22)
            sheet.alpha_composite(t,(x+(cell-t.width)//2,y+cell-t.height-4)); d.text((x+8,y+cell+4),n,fill=(40,40,40,255))
        sheet.convert('RGB').save(os.path.join(PREV,'contact-sheet.png'))
    print('errors:',errs[:5]); b.close()
import subprocess
subprocess.run(['node',os.path.join(ROOT,'art-source','tools','optimize_glb.mjs'),MODELS],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print('glb optimised (dedup/weld/join/quantize)')
