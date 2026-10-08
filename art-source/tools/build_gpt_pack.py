"""Build the GPT/Codex hand-off pack from the 3D library (no .glb is re-exported here).
Writes art-source/gpt/asset-catalog.json, art-source/previews/turnarounds/<name>.png (front, 3/4, side, back),
art-source/previews/contact-sheet.png (every model) and art-source/previews/aurora-village-sheet.png.
Usage (repo root): python3 -m http.server 8788 &  then  python3 art-source/tools/build_gpt_pack.py
Needs: npm ci (art-source/tools), Playwright, Pillow. Set CHROMIUM_PATH to use a pre-installed Chromium."""
import base64, io, json, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GPT = os.path.join(ROOT, 'art-source', 'gpt'); PREV = os.path.join(ROOT, 'art-source', 'previews'); TURN = os.path.join(PREV, 'turnarounds')
SPR = os.path.join(ROOT, 'game', 'assets', 'sprites'); URL = os.environ.get('STUDIO_URL', 'http://localhost:8788/art-source/tools/studio.html')
os.makedirs(TURN, exist_ok=True)
info = json.load(open(os.path.join(GPT, 'model-info.json'))); atlas = json.load(open(os.path.join(SPR, 'atlas.json')))
BG = (233, 241, 246, 255)
CAT = os.path.join(GPT, 'asset-catalog.json'); links = json.load(open(CAT)).get('links', {}) if os.path.exists(CAT) else {}  # external copies (Canva/Figma/Dropbox) survive rebuilds

def first_frame(name, anim=None):
    m = atlas[name]; im = Image.open(os.path.join(SPR, m['file'])).convert('RGBA'); A = m['anims'].get(anim) or next(iter(m['anims'].values()))
    return im.crop((0, A['row'] * m['frameH'], m['frameW'], (A['row'] + 1) * m['frameH']))

def grid(items, cell, cols, path, label_h=22):
    rows = (len(items) + cols - 1) // cols; sheet = Image.new('RGBA', (cols * cell, rows * (cell + label_h)), BG); d = ImageDraw.Draw(sheet)
    for i, (label, t) in enumerate(items):
        t = t.copy(); t.thumbnail((cell - 16, cell - 16)); x = (i % cols) * cell; y = (i // cols) * (cell + label_h)
        sheet.alpha_composite(t, (x + (cell - t.width) // 2, y + cell - t.height - 4)); d.text((x + 8, y + cell + 4), label, fill=(40, 40, 40, 255))
    sheet.convert('RGB').save(path)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.studioReady===true', timeout=30000)
    names = [m['name'] for m in pg.evaluate('listModels()')]
    catalog = {'schema_version': 1, 'units': '1 unit = 1 m, +Y up, models face +Z, origin at feet / ground centre',
               'sprite_camera': 'front 3/4 (yaw 28deg), looking down 30deg, 64 px per unit, dark outline; characters face front-left, mirror for dir>0',
               'runtime_connected': False, 'handoff': 'art-source/gpt/GPT-HANDOFF.md', 'links': links, 'models': {}}
    for n in names:
        f = pg.evaluate('n=>modelFacts(n)', n); meta = info.get(n, {}); a = atlas.get(n, {})
        png = pg.evaluate('([n,a])=>renderTurnaround(n,a)', [n, 'repaired' if 'repaired' in f['anims'] else 'idle'])
        Image.open(io.BytesIO(base64.b64decode(png.split(',')[1]))).save(os.path.join(TURN, n + '.png'), optimize=True)
        catalog['models'][n] = {
            'group': meta.get('group', f['kind']), 'village': meta.get('village'), 'new_in_2026_10': bool(meta.get('new')),
            'suggested_role_key': meta.get('role'), 'replaces_game_draw': meta.get('game_draw'), 'ko': meta.get('ko'), 'en': meta.get('en'),
            'kind': f['kind'], 'size_m': f['size_m'], 'meshes': f['meshes'], 'main_colors': f['colors'],
            'clips': {k: {'frames': v['frames'], 'seconds': v['dur']} for k, v in f['anims'].items()},
            'glb': f'art-source/models/{n}.glb', 'sprite_sheet': f'game/assets/sprites/{n}.webp',
            'sprite': {k: a.get(k) for k in ('frameW', 'frameH', 'ppu', 'anchor')} | {'anims': a.get('anims')},
            'turnaround_png': f'art-source/previews/turnarounds/{n}.png'}
        print(f"{n:15s} {f['kind']:8s} size {f['size_m']}")
    b.close()
missing = [n for n in names if n not in info or n not in atlas]
json.dump(catalog, open(CAT, 'w'), ensure_ascii=False, indent=1)
grid([(n, first_frame(n)) for n in names], 200, 8, os.path.join(PREV, 'contact-sheet.png'))
aur = [n for n in names if info.get(n, {}).get('village') == 4]
grid([(f'{n} · {s}', first_frame(n, s)) for n in aur for s in (('broken', 'repaired') if 'repaired' in atlas[n]['anims'] else ('idle',))], 260, 4, os.path.join(PREV, 'aurora-village-sheet.png'))
print('models', len(names), 'missing info/atlas:', missing, 'errors:', errs[:5])
