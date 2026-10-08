function fit(){
  var r=stageEl.getBoundingClientRect(),aw=r.width,ah=r.height;
  if(aw<=0||ah<=0)return;
  // Match the displayed canvas exactly: portrait and landscape use the same coordinate scale.
  var nsh=W*ah/aw;
  if(Math.abs(nsh-SH)>.01||Math.abs(screenUnit-W/aw)>.001){
    cancelControl();SH=nsh;screenUnit=W/aw;
    cv.height=Math.ceil(SH*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  cwrap.style.width=aw+'px';
  ZOOM_IN=2.6*(W/540)*Math.min(1,Math.max(.52,ah/aw/1.5));
  Z=zoomTarget();
  var pa=agents[0];if(pa){camX=camClampX(pa.x-W/Z/2);camY=camClampY(pa.y-SH/Z*.5);}
  titleT=0;
}
var fitFrame=0;
function scheduleFit(){if(!fitFrame)fitFrame=requestAnimationFrame(function(){fitFrame=0;fit();});}
if(window.ResizeObserver)new ResizeObserver(scheduleFit).observe(stageEl);
window.addEventListener('resize',scheduleFit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',scheduleFit);

