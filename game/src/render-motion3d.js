/* Small software 3D renderer: model-space vertices, joint transforms, lighting
 * and depth-sorted faces. Canvas is the output surface; no network assets.
 * Visual poses never write simulation or save state. */
var MOTION3D_REDUCED=window.matchMedia('(prefers-reduced-motion:reduce)');
function motion3DTime(){return MOTION3D_REDUCED.matches?0:time;}
function motion3DRotate(p,yaw){var c=Math.cos(yaw),s=Math.sin(yaw);return [p[0]*c+p[2]*s,p[1],p[2]*c-p[0]*s];}
function motion3DProject(p){return [p[0],-p[1]-p[2]*.32];}
function motion3DFace(mesh,points,color){mesh.push({p:points,color:color});}
function motion3DBox(mesh,x,y,z,w,h,d,color,rx){
 var p=[],c=Math.cos(rx||0),s=Math.sin(rx||0);
 for(var k=0;k<8;k++){var yy=(k&2)?h/2:-h/2,zz=(k&4)?d/2:-d/2;p.push([x+((k&1)?w/2:-w/2),y+yy*c-zz*s,z+yy*s+zz*c]);}
 [[0,4,6,2],[1,3,7,5],[0,1,5,4],[2,6,7,3],[0,2,3,1],[4,5,7,6]].forEach(function(f){motion3DFace(mesh,f.map(function(i){return p[i];}),color);});
}
function motion3DBall(mesh,x,y,z,rx,ry,rz,color,cap){
 var n=8,bands=4,grid=[];
 for(var j=0;j<=bands;j++){var lat=-Math.PI/2+j*Math.PI/bands;grid[j]=[];for(var i=0;i<=n;i++){var a=i/n*Math.PI*2;grid[j][i]=[x+Math.cos(a)*Math.cos(lat)*rx,y+Math.sin(lat)*ry,z+Math.sin(a)*Math.cos(lat)*rz];}}
 for(var j=0;j<bands;j++)for(var i=0;i<n;i++)motion3DFace(mesh,[grid[j][i],grid[j][i+1],grid[j+1][i+1],grid[j+1][i]],cap&&j>=3?cap:color);
}
function motion3DDraw(g,mesh,yaw,oblique){
 var faces=[];
 mesh.forEach(function(f){var p=f.p.map(function(v){return motion3DRotate(v,yaw);}),a=p[0],b=p[1],c=p[2],u=b.map(function(v,i){return v-a[i];}),v=c.map(function(n,i){return n-a[i];}),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot.apply(Math,normal);
  if(len<.00001)return;var light=.8+.24*(normal[0]*-.45+normal[1]*.8+normal[2]*(oblique?-.4:.4))/len;
  faces.push({p:p.map(oblique?function(v){return [v[0]+v[2],-v[1]-v[2]*.58];}:motion3DProject),depth:p.reduce(function(s,v){return s+(oblique?-v[2]:v[2]+v[1]*.32);},0)/p.length,col:artShade(f.color,light)});
 });
 faces.sort(function(a,b){return a.depth-b.depth;});
 faces.forEach(function(f){g.fillStyle=f.col;g.beginPath();f.p.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);});g.closePath();g.fill();});
}
function motion3DPose(a){
 var t=motion3DTime(),moving=!!a.mv&&!MOTION3D_REDUCED.matches,ph=moving?(a.bob||0):0,stride=moving?Math.sin(ph)*.65:0;
 return {stride:stride,bounce:moving?Math.abs(Math.sin(ph))*.8:Math.sin(t*2.4+(a.x||0)*.01)*.22,work:a.working&&!MOTION3D_REDUCED.matches?Math.sin(t*7)*.65:0,attack:(a.stab||0)>0?Math.sin(Math.min(1,a.stab/.32)*Math.PI):0,yaw:.48+(moving?Math.sin(ph)*.08:0)};
}
function drawActor3D(g,a,style){
 style=style||{};var pose=motion3DPose(a),mesh=[],coat=style.coat||ART.roles[a.role]||ART.roles.lumber,skin=style.skin||'#ffe0c4',scarf=style.scarf||'#ffcb56',pants=style.pants||'#24556b',y=pose.bounce;
 g.save();g.translate(a.x,a.y+9);g.scale((a.dir||1)*(style.scale||1),style.scale||1);
 g.fillStyle='rgba(20,55,65,.2)';g.beginPath();g.ellipse(1,1,8,2.7,0,0,7);g.fill();
 [-1,1].forEach(function(side){var s=pose.stride*side,kick=a.strikeType==='kick'&&side===1?pose.attack:0;
  motion3DBox(mesh,side*2.8,7+y+kick*5,Math.sin(s)*4+kick*12,3.2,12,3.6,pants,s+kick*.9);
  motion3DBox(mesh,side*2.8,1.8+Math.max(0,s)*2+kick*11,Math.sin(s)*7+2+kick*17,4,3.3,6,'#634333',s*.25);
  var hit=pose.attack*((a.strikeType==='punch-left'?side<0:side>0)?1:0),swing=-s*.7+pose.work*(side>0?1:.4);
  motion3DBox(mesh,side*6.2,21+y,Math.sin(swing)*4+hit*9,3.2,11,3.7,coat,swing+hit*1.1);
  motion3DBall(mesh,side*6.5,15+y+hit*6,Math.sin(swing)*7+hit*15,1.9,2,1.9,skin);
 });
 motion3DBall(mesh,0,21+y,0,6,10,4.1,coat);
 motion3DBox(mesh,0,16+y,4,7,7,.7,style.apron?'#ffe1a3':coat);
 motion3DBox(mesh,0,29+y,.5,10,2.5,8,scarf);
 motion3DBox(mesh,-2,25+y,4.7,2.7,6,1,scarf,Math.sin(motion3DTime()*3)*.14);
 motion3DBall(mesh,0,35+y,.3,5.1,5.7,4.7,skin,style.hair||'#45332d');
 motion3DBall(mesh,0,34.5+y,4.8,1,1.2,1.6,skin);
 [-1,1].forEach(function(side){motion3DBox(mesh,side*2,35.2+y,4.8,.9,(motion3DTime()*.6)%5<.13?.2:1.2,.6,'#233b49');});
 motion3DBox(mesh,0,39.6+y,0,10.5,2,9,style.hat||coat);
 if(style.level>=3)motion3DBox(mesh,-2.7,25+y,4.3,1.7,1.7,.9,'#ffd25e');
 motion3DDraw(g,mesh,pose.yaw);g.restore();
}
/* A real 3D rotor turns around its shaft, changing blade depth and lighting. */
function drawFacilityMotion3D(g,x,y,kind,L,busy){
 var mesh=[],t=motion3DTime(),angle=t*(busy?5+L*.4:.65),col=kind==='elec'?'#ffd054':kind==='smelt'?'#f7994b':'#62cde4';
 motion3DBox(mesh,0,0,-1,15,15,5,'#20647d');
 for(var i=0;i<4;i++){var a=angle+i*Math.PI/2,r=5;motion3DBox(mesh,0,Math.cos(a)*r,Math.sin(a)*r,3,9,2.5,col,a);}
 motion3DBall(mesh,0,0,3,2.3,2.3,2.3,'#fff2c9');
 g.save();g.translate(x,y);motion3DDraw(g,mesh,.22);g.restore();
}

function drawFacilitySolid3D(g,x,y,w,d,h,color){
 var mesh=[];motion3DBox(mesh,w/2,h/2,d/2,w,h,d,color);g.save();g.translate(x,y);motion3DDraw(g,mesh,0,true);g.restore();
}
