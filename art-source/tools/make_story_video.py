"""Build the storybook intro/ending videos from art-source/storybook-korea/*.jpg (fallback: art-source/storybook/*.jpg).
Usage: python3 art-source/tools/make_story_video.py  (needs Pillow, numpy, ffmpeg)
Each scene holds HOLD s, crossfades XF s, slow Ken Burns zoom 1.00->1.06 with alternating drift.
Outdoor scenes get a soft procedural snowfall. No text, no captions (AGENTS.md: wordless intro)."""
import subprocess, numpy as np, os, sys
from PIL import Image, ImageFilter
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'storybook-korea') if os.path.isdir(os.path.join(ROOT,'storybook-korea')) else os.path.join(ROOT,'storybook')  # 2026-10-09: Korean-history scenes; originals stay in storybook/
OUT=os.path.join(ROOT,'..','game','assets','video')
W,H,FPS,HOLD,XF=720,1280,30,4.5,0.8
SETS={'intro':[('intro-01',0),('intro-02',0),('intro-03',0),('intro-04',1)],
      'ending':[('ending-01',1),('ending-02',0),('ending-03',0)]}
rng=np.random.default_rng(7)
def load(n):
    im=Image.open(os.path.join(SRC,n+'.jpg')).convert('RGB')
    s=max(W/im.width,H/im.height)*1.06
    return im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
def kb(im,u,i):  # u in 0..1 over the scene's life
    z=1.06-0.06*(1-u) if i%2==0 else 1.0+0.06*(1-u)   # alternate push-in / pull-out
    cw,ch=min(im.width,W*1.06/z),min(im.height,H*1.06/z)
    dx=(im.width-cw)*(0.5+0.25*(u-0.5)*(1 if i%2 else -1)); dy=(im.height-ch)*(0.5-0.15*(u-0.5))
    dx=min(max(0,dx),im.width-cw); dy=min(max(0,dy),im.height-ch)
    return np.asarray(im.resize((W,H),Image.BICUBIC,box=(dx,dy,dx+cw,dy+ch)),dtype=np.float32)
class Snow:
    def __init__(s,n=140):
        s.x=rng.uniform(0,W,n); s.y=rng.uniform(0,H,n); s.r=rng.uniform(1.2,3.6,n); s.v=s.r*22; s.p=rng.uniform(0,6.28,n)
    def draw(s,frame,t,alpha):
        if alpha<=0: return frame
        layer=np.zeros((H,W),np.float32)
        ys=(s.y+s.v*t)%H; xs=(s.x+np.sin(t*0.8+s.p)*14)%W
        for x,y,r in zip(xs,ys,s.r):
            x0,x1,y0,y1=int(max(0,x-r-1)),int(min(W,x+r+2)),int(max(0,y-r-1)),int(min(H,y+r+2))
            yy,xx=np.mgrid[y0:y1,x0:x1]; d=np.hypot(xx-x,yy-y)
            layer[y0:y1,x0:x1]=np.maximum(layer[y0:y1,x0:x1],np.clip(1.2-d/r,0,1)*0.85)
        a=(layer*alpha)[...,None]
        return frame*(1-a)+np.array([245,250,255],np.float32)*a
def build(name):
    scenes=[(load(n),snow) for n,snow in SETS[name]]
    n=len(scenes); total=n*HOLD+XF; nf=int(total*FPS); snow=Snow()
    os.makedirs(OUT,exist_ok=True)
    raw=os.path.join(OUT,name+'.yuv.tmp')
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','slow','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',os.path.join(OUT,name+'.mp4')],stdin=subprocess.PIPE)
    for f in range(nf):
        t=f/FPS; i=min(n-1,int(t//HOLD))
        def scene(k):
            u=np.clip((t-k*HOLD)/(HOLD+XF),0,1); fr=kb(scenes[k][0],u,k)
            return snow.draw(fr,t,1.0) if scenes[k][1] else fr
        fr=scene(i)
        lt=t-(i+1)*HOLD+XF
        if i+1<n and lt>0:
            a=min(1,lt/XF); a=a*a*(3-2*a); fr=fr*(1-a)+scene(i+1)*a
        # fade in from / out to warm near-black (#1a1512)
        e=min(1,t/0.6,(total-t)/0.9)
        if e<1: fr=fr*e+np.array([26,21,18],np.float32)*(1-e)
        ff.stdin.write(np.clip(fr,0,255).astype(np.uint8).tobytes())
    ff.stdin.close(); ff.wait()
    mp4=os.path.join(OUT,name+'.mp4')
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',mp4,'-c:v','libvpx-vp9','-b:v','0','-crf','36','-row-mt','1',os.path.join(OUT,name+'.webm')],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','0.8','-i',mp4,'-frames:v','1','-q:v','4',os.path.join(OUT,name+'-poster.jpg')],check=True)
    print(name,round(total,1),'s',{e:os.path.getsize(os.path.join(OUT,name+'.'+e)) for e in ('mp4','webm')})
for k in (sys.argv[1:] or SETS): build(k)
