"""Render the wordless Korean-history storybook scenes (scenes.js via scene.html) to
art-source/storybook-korea/<name>.jpg and the game's webp frames (game/assets/intro|ending/NN.webp).
Usage (repo root): python3 -m http.server 8788 &  then  python3 art-source/tools/build_story_scenes.py [names...]
Then: python3 art-source/tools/make_story_video.py  (reads art-source/storybook-korea when present)."""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'art-source', 'storybook-korea'); os.makedirs(OUT, exist_ok=True)
URL = os.environ.get('SCENE_URL', 'http://localhost:8788/art-source/tools/scene.html')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 944, 'height': 1680}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.sceneReady===true', timeout=60000)
    names = sys.argv[1:] or pg.evaluate('listScenes()')
    for n in names:
        im = Image.open(io.BytesIO(base64.b64decode(pg.evaluate('n=>renderScene(n)', n).split(',')[1]))).convert('RGB')
        im.save(os.path.join(OUT, n + '.jpg'), quality=90)
        kind, idx = n.split('-'); im.save(os.path.join(ROOT, 'game', 'assets', kind, idx + '.webp'), 'WEBP', quality=86, method=6)
        print(n, im.size)
    b.close(); print('errors:', errs[:5])
