'use strict';
window.stopPursuitVoice=window.stopPursuitVoice||function(){};
window.stopJumpScream=window.stopJumpScream||function(){};
window.playJumpScream=window.playJumpScream||function(){return Promise.resolve(false)};
window.playPursuitVoice=window.playPursuitVoice||function(){return Promise.resolve(false)};

// Consume game control keys before WebKit/macOS handles navigation or emits a system beep.
window.addEventListener('keydown',event=>{const target=event.target;if(target&&(target.matches?.('input,textarea,select')||target.isContentEditable))return;const key=event.key.toLowerCase();if(['w','a','s','d','e','m','f','r','h','j','q','shift','arrowup','arrowdown','arrowleft','arrowright','escape','1','2','3','4','5','6','7'].includes(key))event.preventDefault()},{capture:true});

const $=id=>document.getElementById(id);const canvas=$('world');const scene=new THREE.Scene();scene.background=new THREE.Color(0x100f0c);scene.fog=new THREE.FogExp2(0x100f0c,.038);const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,100);const renderer=new THREE.WebGLRenderer({canvas,antialias:true});let renderScale=Math.min(devicePixelRatio,0.8,Math.sqrt(900000/(innerWidth*innerHeight)));renderer.setPixelRatio(renderScale);renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;scene.add(new THREE.HemisphereLight(0xb2c2b4,0x141811,.32));const flash=new THREE.SpotLight(0xffe3a6,105,26,.55,.65,1.4);camera.add(flash,flash.target);flash.target.position.set(0,0,-1);scene.add(camera);const materialCache=new Map();const mat=(c,r=.85)=>{const key=c+':'+r;if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color:c,roughness:r}));return materialCache.get(key)};const wall=mat(0x65736b),floor=mat(0x38443f,.3),metal=mat(0x374d49),dark=mat(0x111918),red=mat(0x612c2b),lightmat=new THREE.MeshBasicMaterial({color:0x9bbfa9});const architecturalMaterials=new Map();function box(x,y,z,w,h,d,m){if((m===floor||m===wall)&&m.map){const key=m.uuid+':'+w+':'+h+':'+d;if(!architecturalMaterials.has(key)){const material=m.clone(),rx=m===floor?w/6:Math.max(w,d)/2,ry=m===floor?d/6:h/2;for(const field of ['map','normalMap','roughnessMap'])if(m[field]){material[field]=m[field].clone();material[field].repeat.set(rx,ry);material[field].needsUpdate=true}architecturalMaterials.set(key,material)}m=architecturalMaterials.get(key)}let q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);scene.add(q);return q}// Retro hospital materials: stained plaster, worn checker tiles, and imperfect painted wood.
function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=kind==='wall'?'#9a9981':kind==='floor'?'#767562':'#554b3f';x.fillRect(0,0,512,512);if(kind==='wall'){x.fillStyle='#4c5c50';x.fillRect(0,325,512,187);x.fillStyle='#aaa288';x.fillRect(0,318,512,7)}if(kind==='floor'){for(let y=0;y<4;y++)for(let z=0;z<4;z++){x.fillStyle=(y+z)%2?'#666d60':'#aaa78f';x.fillRect(z*128,y*128,126,126)}}let n=17;for(let i=0;i<9000;i++){n=(n*1664525+1013904223)>>>0;let xx=n%512,yy=(n>>>9)%512;x.fillStyle=i%3?'#14171114':'#f8e3b710';x.fillRect(xx,yy,1+(n%4),1+((n>>>5)%7))}for(let i=0;i<18;i++){n=(n*1664525+1013904223)>>>0;x.fillStyle='#302c2340';x.fillRect(n%512,(n>>>9)%512,1+(n%4),15+((n>>>5)%60))}let t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t}const wt=texture('wall'),ft=texture('floor');wt.repeat.set(8,1);ft.repeat.set(2,16);wall.map=wt;wall.color.set(0xffffff);wall.needsUpdate=true;floor.map=ft;floor.color.set(0xffffff);floor.needsUpdate=true;
// Photographed surface details and normal maps add depth to plaster and tile.
function surface(name,rx,ry,srgb=true){const t=new THREE.TextureLoader().load(imageAssets[name]);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t}
wall.map=surface('wall-color.jpg',8,1);wall.normalMap=surface('wall-normal.jpg',8,1,false);wall.normalScale.set(.36,.36);wall.color.set(0xb0ad98);wall.needsUpdate=true;
floor.map=surface('floor-color.jpg',1.5,12);floor.normalMap=surface('floor-normal.jpg',1.5,12,false);floor.normalScale.set(.22,.22);floor.color.set(0xb6b4a8);floor.roughness=.88;floor.needsUpdate=true;
function rod(x1,y1,z1,x2,y2,z2,r,m){let a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),d=new THREE.Vector3().subVectors(b,a),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),7),m);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());scene.add(mesh);return mesh}
const roomDefinitions=[
 {side:-1,z:-4,name:'护士站',key:'nurse',depth:7}, {side:1,z:-4,name:'观察病房',key:null,depth:7},
 {side:-1,z:-11,name:'值班室',key:null,depth:7},{side:1,z:-11,name:'药房',key:'pharmacy',depth:7},
 {side:-1,z:-18,name:'西侧候诊区',key:null,depth:13},{side:1,z:-18,name:'东侧治疗区',key:null,depth:13},
 {side:-1,z:-25,name:'档案室',key:'archive',depth:7},{side:1,z:-25,name:'设备间',key:null,depth:7}
];
const walkable=[{x1:-4.5,x2:4.5,z1:-32,z2:3}],hospitalDoors=[],movingObjects=new Set(),keyItems=[],inventory=new Set();
// Wall openings are actual gaps in the architecture, so unlocked rooms can be entered.
box(0,-.12,-14.5,9,.25,35,floor);box(0,3.5,-14.5,9,.25,35,mat(0x38443e));box(0,1.7,3.12,9,3.4,.25,wall);box(-3.4,1.7,-32.2,2.2,3.4,.25,wall);box(3.4,1.7,-32.2,2.2,3.4,.25,wall);
for(let side of [-1,1]){let upper=3;for(let z of [-4,-11,-18,-25]){let low=z+.73;box(side*4.5,1.7,(upper+low)/2,.3,3.4,upper-low,wall);box(side*4.5,2.89,z,.3,1.02,1.46,wall);upper=z-.73}box(side*4.5,1.7,(-32+upper)/2,.3,3.4,upper+32,wall)}
for(const room of roomDefinitions){let center=room.side*(4.5+room.depth/2),outer=room.side*(4.5+room.depth);room.center=center;walkable.push({x1:Math.min(room.side*4.32,outer)+.18,x2:Math.max(room.side*4.32,outer)-.18,z1:room.z-2.86,z2:room.z+2.86});walkable.push({x1:Math.min(room.side*4.0,room.side*5.1),x2:Math.max(room.side*4.0,room.side*5.1),z1:room.z-.65,z2:room.z+.65});box(center,-.12,room.z,room.depth,.25,6,floor);box(center,3.5,room.z,room.depth,.25,6,mat(0x38443e));if(room.z===-18){for(let dz of [-1.9,1.9])box(outer,1.7,room.z+dz,.25,3.4,2.2,wall);box(outer,2.9,room.z,.25,1,1.6,wall)}else box(outer,1.7,room.z,.25,3.4,6,wall);for(let dz of [-3,3])box(center,1.7,room.z+dz,room.depth,3.4,.25,wall);box(center,3.27,room.z,1.2,.045,.35,lightmat)}
for(let z=-4;z>-32;z-=7)box(0,3.3,z,1.5,.06,.35,lightmat);

const rust=mat(0x60554b),ivory=mat(0xb0aa92),tire=mat(0x151b19);
// Recessed hospital doors with stepped jambs, inset glazing, hinges and working-scale hardware.
for(let side of [-1,1]){rod(side*3.5,3.17,-1,side*3.5,3.17,-32,.09,rust);for(let z=-4;z>-32;z-=7)rod(side*4.28,1.02,z+.8,side*4.28,1.02,Math.min(-1,z+6.2),.045,metal);rod(side*4.28,1.02,-67.8,side*4.28,1.02,-72,.045,metal)}
const doorWood=new THREE.MeshStandardMaterial({map:surface('door-color.jpg',1,1),normalMap:surface('door-normal.jpg',1,1,false),roughnessMap:surface('door-rough.jpg',1,1,false),color:0x858c7a,roughness:.88});doorWood.normalScale.set(.18,.18);
const doorTrim=mat(0x68746b),doorGap=mat(0x141b18),hardware=new THREE.MeshStandardMaterial({color:0x999c91,metalness:.8,roughness:.36}),kickMat=new THREE.MeshStandardMaterial({color:0x73796f,metalness:.65,roughness:.65});
for(let side of [-1,1])for(let z=-4;z>-32;z-=7){
 const room=roomDefinitions.find(r=>r.side===side&&r.z===z);const root=new THREE.Group();let leafMode=false;const leaf=new THREE.Group();leaf.position.x=-.60;root.add(leaf);hospitalDoors.push({...room,leaf,open:false});root.position.set(side*4.32,0,z);root.rotation.y=side===1?-Math.PI/2:Math.PI/2;scene.add(root);
 function piece(x,y,z,w,h,d,m){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(leafMode){o.position.x+=.60;leaf.add(o)}else root.add(o);return o}
 function tube(a,b,r,m){let v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),delta=w.clone().sub(v),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),12),m);o.position.copy(v).add(w).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());if(leafMode){o.position.x+=.60;leaf.add(o)}else root.add(o);return o}

 // Frames sit close to the plaster rather than floating out in the corridor.
 for(let x of [-.68,.68]){piece(x,1.15,.015,.075,2.30,.075,doorTrim);piece(x,1.15,.065,.025,2.30,.035,kickMat)}piece(0,2.29,.015,1.43,.085,.075,doorTrim);piece(0,.018,.045,1.35,.035,.15,hardware);
 leafMode=true; // Movable leaf pivots around its hinge.
 piece(0,.66,.033,1.20,1.25,.055,doorWood);piece(0,2.085,.033,1.20,.25,.055,doorWood);piece(-.40,1.63,.033,.40,.69,.055,doorWood);piece(.40,1.63,.033,.40,.69,.055,doorWood);
 const glazing=new THREE.MeshStandardMaterial({color:0x233a35,metalness:.25,roughness:.22,transparent:true,opacity:.87});piece(0,1.63,.022,.39,.67,.013,glazing);for(let x of [-.215,.215])piece(x,1.63,.073,.032,.74,.025,hardware);for(let y of [1.26,2.0])piece(0,y,.073,.46,.032,.025,hardware);
 // Fine wire mesh and a muted reflection make the glass readable at close range.
 for(let x=-.15;x<=.16;x+=.075)tube([x,1.31,.034],[x,1.95,.034],.0016,hardware);for(let y=1.35;y<1.95;y+=.10)tube([-.18,y,.034],[.18,y,.034],.0016,hardware);
 // Kick plate, lever, escutcheon, keyhole, hinges, and screw heads.
 piece(0,.24,.07,1.10,.33,.012,kickMat);piece(.44,1.03,.073,.075,.25,.018,hardware);tube([.44,1.07,.086],[.44,1.07,.15],.018,hardware);tube([.44,1.07,.15],[.27,1.07,.15],.016,hardware);piece(.44,.98,.088,.012,.025,.005,doorGap);
 for(let y of [.31,1.15,1.98]){piece(-.615,y,.078,.045,.13,.014,hardware);tube([-.63,y-.07,.09],[-.63,y+.07,.09],.012,hardware)}
 for(let x of [-.49,.49])for(let y of [.105,.375]){let screw=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),hardware);screw.position.set(x,y,.079);screw.position.x+=.60;leaf.add(screw)}
 leafMode=false;leaf.traverse(o=>movingObjects.add(o));const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#31473e';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#a8b4a1';ctx.strokeRect(5,5,502,118);ctx.fillStyle='#d4d7bc';ctx.textAlign='center';ctx.font='36px sans-serif';ctx.fillText(room.name,256,53);ctx.font='16px sans-serif';ctx.fillText('REN AN HOSPITAL',256,94);const label=new THREE.CanvasTexture(c);label.colorSpace=THREE.SRGBColorSpace;piece(0,2.51,.02,.67,.17,.018,new THREE.MeshStandardMaterial({map:label,roughness:.8}));
}

// Detailed CC0 furniture from Poly Haven, preserving mesh topology and PBR UV materials.
const loadedModels={};
function detailedModel(id){if(loadedModels[id])return loadedModels[id].clone(true);const pack=sceneModels[id],j=pack.gltf;
 const bins=j.buffers.map(b=>{let s=atob(pack.files[b.uri]),bytes=new Uint8Array(s.length);for(let k=0;k<s.length;k++)bytes[k]=s.charCodeAt(k);return bytes.buffer});
 function attribute(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView],dim={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array},T=types[a.componentType],sz=T.BYTES_PER_ELEMENT,start=(v.byteOffset||0)+(a.byteOffset||0);if(!v.byteStride||v.byteStride===dim*sz)return new THREE.BufferAttribute(new T(bins[v.buffer],start,a.count*dim).slice(),dim,a.normalized||false);let result=new T(a.count*dim);for(let k=0;k<a.count;k++)result.set(new T(bins[v.buffer],start+k*v.byteStride,dim),k*dim);return new THREE.BufferAttribute(result,dim,a.normalized||false)}
 const tx={};function tex(index,color){if(index===undefined)return null;let key=index+':'+color;if(tx[key])return tx[key];const uri=j.images[j.textures[index].source].uri,t=new THREE.TextureLoader().load('data:image/jpeg;base64,'+pack.files[uri]);t.flipY=false;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(color)t.colorSpace=THREE.SRGBColorSpace;tx[key]=t;return t}
 const materials=(j.materials||[]).map(m=>{let q=m.pbrMetallicRoughness||{},o=new THREE.MeshStandardMaterial({color:0xffffff,roughness:q.roughnessFactor??1,metalness:q.metallicFactor??1,side:m.doubleSided?THREE.DoubleSide:THREE.FrontSide});if(q.baseColorFactor)o.color.fromArray(q.baseColorFactor);if(q.baseColorTexture)o.map=tex(q.baseColorTexture.index,true);if(q.metallicRoughnessTexture){o.roughnessMap=tex(q.metallicRoughnessTexture.index,false);o.metalnessMap=o.roughnessMap}if(m.normalTexture){o.normalMap=tex(m.normalTexture.index,false);o.normalScale.set(.55,.55)}return o});
 function node(idx){let n=j.nodes[idx],g=new THREE.Group();if(n.matrix)g.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));else {if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale)}if(n.mesh!==undefined)for(let p of j.meshes[n.mesh].primitives){let geometry=new THREE.BufferGeometry();for(let [key,a] of Object.entries(p.attributes)){let name={POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv',TANGENT:'tangent'}[key];if(name)geometry.setAttribute(name,attribute(a))}if(p.indices!==undefined)geometry.setIndex(attribute(p.indices));if(!geometry.attributes.normal)geometry.computeVertexNormals();let mesh=new THREE.Mesh(geometry,materials[p.material]||mat(0x92958b));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh)}for(let c of n.children||[])g.add(node(c));return g}
 const root=new THREE.Group();for(let idx of j.scenes[j.scene||0].nodes)root.add(node(idx));loadedModels[id]=root;return root.clone(true)
}
function furniture(id,x,z,width,turn=0){const root=detailedModel(id),b=new THREE.Box3().setFromObject(root),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),factor=width/size.x;root.position.set(-center.x,-b.min.y,-center.z);const holder=new THREE.Group();holder.add(root);holder.scale.setScalar(factor);holder.position.set(x,0,z);holder.rotation.y=turn;scene.add(holder);return holder}
for(let z=-7;z>-32;z-=14){furniture('old_bed_frame',-2.9,z,1.75,Math.PI/2);furniture('painted_wooden_cabinet',3.4,z-4,1.2,-Math.PI/2)}for(let z of [-4,-21])furniture('wheelchair_01',2.8,z,.78,Math.PI*.7);
// Curved and sagging bed linen has real volume with a softly irregular silhouette.
for(let z=-7;z>-32;z-=14){const bedding=new THREE.SphereGeometry(1,36,24);let pp=bedding.attributes.position;for(let n=0;n<pp.count;n++){let x=pp.getX(n),y=pp.getY(n),v=pp.getZ(n);pp.setXYZ(n,x*.90,y*.10+.018*Math.sin(x*35+v*9),v*.44)}bedding.computeVertexNormals();let sheet=new THREE.Mesh(bedding,new THREE.MeshStandardMaterial({color:0xb6b4a3,roughness:.98}));sheet.position.set(-2.9,.62,z);sheet.castShadow=true;sheet.receiveShadow=true;scene.add(sheet)}
// Recessed ceiling panels, timber skirting and continuous architectural details.
for(let z=-2;z>-32;z-=2){for(let x of [-3,-1,1,3]){const panel=box(x,3.34,z,1.96,.035,1.96,mat(0x6f746a));panel.receiveShadow=true}box(-4.29,.09,z,.10,.18,2,mat(0x343f38));box(4.29,.09,z,.10,.18,2,mat(0x343f38))}
scene.traverse(o=>{if(o.isMesh)o.receiveShadow=true});flash.castShadow=true;flash.shadow.mapSize.set(2048,2048);flash.shadow.bias=-.0002;flash.shadow.normalBias=.015;flash.shadow.camera.near=.15;flash.shadow.camera.far=26;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
// Gentle pools of ceiling illumination preserve depth without washing out photographed materials.
const corridorLights=[];for(let n=0;n<4;n++){const l=new THREE.PointLight(0xe0d6b8,17,12);l.position.set(0,3,-4-n*7);scene.add(l);corridorLights.push(l)}
for(const room of roomDefinitions){furniture('painted_wooden_cabinet',room.center+room.side*1.7,room.z+1.9,1.05,Math.PI);if(room.name.includes('病房')||room.name.includes('治疗'))furniture('old_bed_frame',room.center,room.z-1.1,1.4,Math.PI/2);else furniture('wheelchair_01',room.center,room.z-1.8,.75,.4)}
// Two traversable hospital wings: deterministic connected mazes, with actual wall collision.
const mazeWalls=[],mazeWings=[],mazeStations=[],visitedMazeCells=new Set();
function makeHospitalMaze(side,N,seed){const size=3.2,zmid=-18,inner=17.5,outer=inner+N*size;const cells=Array.from({length:N*N},()=>({walls:[true,true,true,true],seen:false}));let state=seed;const rand=n=>{state=(state*1664525+1013904223)>>>0;return state%n},stack=[Math.floor(N/2)*N];cells[stack[0]].seen=true;
 while(stack.length){const idx=stack[stack.length-1],x=idx%N,y=Math.floor(idx/N),options=[];for(const [dir,dx,dy] of [[0,0,-1],[1,1,0],[2,0,1],[3,-1,0]]){let xx=x+dx,yy=y+dy;if(xx>=0&&xx<N&&yy>=0&&yy<N&&!cells[yy*N+xx].seen)options.push([dir,yy*N+xx])}if(!options.length){stack.pop();continue}const [dir,next]=options[rand(options.length)];cells[idx].walls[dir]=false;cells[next].walls[(dir+2)%4]=false;cells[next].seen=true;stack.push(next)}
 // A few loops allow alternate approaches without making every route obvious.
 for(let n=0;n<Math.floor(N/2);n++){const x=1+rand(N-2),y=1+rand(N-2),idx=y*N+x;cells[idx].walls[1]=false;cells[idx+1].walls[3]=false}cells[Math.floor(N/2)*N].walls[3]=false;
 const z0=zmid-N*size/2;function wallAt(x,z,w,d){const m=box(x,1.7,z,w,3.4,d,wall);mazeWalls.push({x1:x-w/2-.18,x2:x+w/2+.18,z1:z-d/2-.18,z2:z+d/2+.18})}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=cells[y*N+x],cx=side*(inner+(x+.5)*size),cz=z0+(y+.5)*size;if(c.walls[0])wallAt(cx,cz-size/2,size,.16);if(c.walls[3])wallAt(cx-side*size/2,cz,.16,size);if(y===N-1&&c.walls[2])wallAt(cx,cz+size/2,size,.16);if(x===N-1&&c.walls[1])wallAt(cx+side*size/2,cz,.16,size);if((x+y*3)%7===0)box(cx,3.25,cz,.9,.05,.25,lightmat)}
 const center=side*(inner+N*size/2);box(center,-.12,zmid,N*size,.25,N*size,floor);box(center,3.5,zmid,N*size,.25,N*size,mat(0x38443e));walkable.push({x1:Math.min(side*inner,side*outer),x2:Math.max(side*inner,side*outer),z1:z0,z2:z0+N*size});walkable.push({x1:Math.min(side*16.7,side*18.2),x2:Math.max(side*16.7,side*18.2),z1:-18.7,z2:-17.3});
 const station={side,x:side*(inner+(N-.5)*size),z:z0+.5*size,name:side===1?'东翼控制室':'西翼储物站',id:side===1?'east':'west',solved:false};mazeStations.push(station);box(station.x,.45,station.z,1.2,.9,.7,metal);box(station.x,.98,station.z,1.3,.12,.8,ivory);furniture('painted_wooden_cabinet',station.x,station.z+.8,.8,Math.PI);
 // Landmarks differ between wings, supporting navigation without a complete map.
 for(let n=0;n<7;n++){const x=rand(N),y=rand(N),cx=side*(inner+(x+.5)*size),cz=z0+(y+.5)*size;if(n%2)furniture('wheelchair_01',cx+.65,cz,.65,.6);else furniture('painted_wooden_cabinet',cx+.8,cz,.7,Math.PI/2)}mazeWings.push({side,N,size,z0,inner,cells,station});
}
makeHospitalMaze(-1,9,731);makeHospitalMaze(1,11,1107);
const mazeMap=document.createElement('canvas');mazeMap.width=540;mazeMap.height=370;mazeMap.style.cssText='position:absolute;inset:auto;right:22px;bottom:60px;width:420px;max-width:75vw;display:none;background:#07100eed;border:1px solid #7d928066;pointer-events:none';$('hud').append(mazeMap);let mapOpen=false;
function updateMazeMap(){const ctx=mazeMap.getContext('2d');for(const wing of mazeWings){const xx=Math.floor((Math.abs(p.x)-wing.inner)/wing.size),yy=Math.floor((p.z-wing.z0)/wing.size);if(Math.sign(p.x)===wing.side&&xx>=0&&xx<wing.N&&yy>=0&&yy<wing.N)visitedMazeCells.add(wing.side+':'+xx+':'+yy)}if(!mapOpen)return;ctx.clearRect(0,0,540,370);ctx.fillStyle='#c4d0ba';ctx.font='17px sans-serif';ctx.fillText('已探索区域 · M 收起',16,25);for(let k=0;k<mazeWings.length;k++){let wing=mazeWings[k],scale=20,ox=20+k*270,oy=65;ctx.fillText(wing.side===1?'东翼':'西翼',ox,50);for(let y=0;y<wing.N;y++)for(let x=0;x<wing.N;x++){if(!visitedMazeCells.has(wing.side+':'+x+':'+y))continue;ctx.fillStyle='#33463b';ctx.fillRect(ox+x*scale,oy+y*scale,scale,scale);ctx.strokeStyle='#b3c0a8';const walls=wing.cells[y*wing.N+x].walls;for(let d=0;d<4;d++){if(!walls[d])continue;ctx.beginPath();const edges=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[0,1]],[[0,1],[0,0]]][d];ctx.moveTo(ox+(x+edges[0][0])*scale,oy+(y+edges[0][1])*scale);ctx.lineTo(ox+(x+edges[1][0])*scale,oy+(y+edges[1][1])*scale);ctx.stroke()}}let xx=Math.floor((Math.abs(p.x)-wing.inner)/wing.size),yy=Math.floor((p.z-wing.z0)/wing.size);if(Math.sign(p.x)===wing.side&&xx>=0&&xx<wing.N&&yy>=0&&yy<wing.N){ctx.fillStyle='#e0b26f';ctx.beginPath();ctx.arc(ox+(xx+.5)*scale,oy+(yy+.5)*scale,4,0,Math.PI*2);ctx.fill()}}}
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='m'&&!e.repeat&&playing){mapOpen=!mapOpen;mazeMap.style.display=mapOpen?'block':'none'}});

// A two-flight U stair is traversable, with continuous elevation and an accessible second floor.
const upperRooms=[{side:-1,z:-8,name:'病历阅览室'},{side:1,z:-8,name:'心电检查室'},{side:-1,z:-22,name:'器材整理室'},{side:1,z:-22,name:'住院观察室'}];
const upperWalkable=[{x1:-4.32,x2:4.32,z1:-31.3,z2:3}];
for(let n=0;n<12;n++){const rise=(n+1)/6,z=-32-(n+.5)*.5;box(-1.1,rise/2,z,1.8,rise,.5,mat(0x7c8276));box(-1.1,rise+.008,z+.21,1.8,.016,.045,hardware);const z2=-38+(n+.5)*.5;box(1.1,2+rise/2,z2,1.8,rise,.5,mat(0x7c8276));box(1.1,2+rise+.008,z2-.21,1.8,.016,.045,hardware);if(n%2===0){rod(-2.05,rise,z,-2.05,rise+.95,z,.025,hardware);rod(2.05,2+rise,z2,2.05,2+rise+.95,z2,.025,hardware)}}
box(0,1.90,-39,4.3,.20,2,mat(0x6e7b70));box(1.1,3.90,-31.4,2.2,.20,1.2,floor);rod(-2.05,1.10,-32.25,-2.05,2.95,-37.75,.035,hardware);rod(2.05,3.10,-37.75,2.05,4.95,-32.25,.035,hardware);rod(-2.05,2.95,-39.8,2.05,2.95,-39.8,.035,hardware);
for(let x of [-4.5,4.5])box(x,3.6,-36,.25,7.2,8,wall);box(0,3.6,-40.1,9,7.2,.25,wall);box(0,7.35,-36,9,.15,8,mat(0x424b43));box(0,5.8,-39.8,1.1,.35,.04,lightmat);
box(0,3.9,-14.2,9,.20,34.6,floor);box(0,7.5,-14.2,9,.18,34.6,mat(0x424b43));box(0,5.75,3.15,9,3.5,.2,wall);
for(let side of [-1,1]){let end=3;for(let z of [-8,-22]){box(side*4.5,5.75,(end+z+.85)/2,.25,3.5,end-z-.85,wall);box(side*4.5,7.03,z,.25,.94,1.7,wall);end=z-.85}box(side*4.5,5.75,(-31+end)/2,.25,3.5,end+31,wall)}
for(let z=-4;z>-31;z-=6){box(0,7.27,z,1.25,.045,.3,lightmat);for(let x of [-4.28,4.28])rod(x,5.03,z-2,x,5.03,z+2,.035,metal)}
for(const r of upperRooms){const center=r.side*8,outer=r.side*11.5;r.center=center;upperWalkable.push({x1:Math.min(r.side*4.1,outer)+.18,x2:Math.max(r.side*4.1,outer)-.18,z1:r.z-2.9,z2:r.z+2.9});upperWalkable.push({x1:Math.min(r.side*4.0,r.side*5.0),x2:Math.max(r.side*4.0,r.side*5.0),z1:r.z-.76,z2:r.z+.76});box(center,3.90,r.z,7,.2,6,floor);box(center,7.5,r.z,7,.18,6,mat(0x424b43));box(outer,5.75,r.z,.25,3.5,6,wall);for(let dz of [-3,3])box(center,5.75,r.z+dz,7,3.5,.25,wall);box(center,7.27,r.z,1.2,.045,.3,lightmat);const cabinet=furniture('painted_wooden_cabinet',center+r.side*1.8,r.z+1.8,.9,Math.PI);cabinet.position.y=4;const chair=furniture('wheelchair_01',center,r.z-1.5,.7,.5);chair.position.y=4;
 const sign=document.createElement('canvas');sign.width=512;sign.height=128;const cx=sign.getContext('2d');cx.fillStyle='#344d43';cx.fillRect(0,0,512,128);cx.fillStyle='#c4cdb7';cx.font='36px sans-serif';cx.textAlign='center';cx.fillText('2F · '+r.name,256,80);const tex=new THREE.CanvasTexture(sign);tex.colorSpace=THREE.SRGBColorSpace;box(r.side*4.32,6.65,r.z,.025,.20,.85,new THREE.MeshStandardMaterial({map:tex,roughness:.9}))}
function stairHeight(x,z){if(x> -2.12&&x<-.15&&z<=-31.8&&z>=-38.15)return THREE.MathUtils.clamp((-z-32)/6,0,1)*2;if(x>=-2.12&&x<=2.12&&z<-38&&z>=-39.85)return 2;if(x>.15&&x<2.12&&z>=-38.15&&z<=-32)return 2+THREE.MathUtils.clamp((z+38)/6,0,1)*2;if(x>.15&&x<2.15&&z>-32&&z<-30.8)return 4;return null}
function upperPositionAllowed(x,z){const area=upperWalkable.some(r=>x>r.x1+.12&&x<r.x2-.12&&z>r.z1+.12&&z<r.z2-.12);if(!area)return false;if(Math.abs(x)>4.12&&Math.abs(x)<4.75&&!upperRooms.some(r=>Math.sign(x)===r.side&&Math.abs(z-r.z)<.64))return false;return true}
function verticalWalkAllowed(x,z){const y=p.y||0,h=stairHeight(x,z);if(h!==null)return Math.abs(h-y)<.40;if(y>3.65)return upperPositionAllowed(x,z);if(y>.35)return false;return null}
function resolveFloorHeight(x,z,current){const h=stairHeight(x,z);if(h!==null&&Math.abs(h-current)<.45)return h;if(current>3.65&&upperPositionAllowed(x,z))return 4;return current>.35?current:0}

// Clinical props share the hospital palette and are batched with the static architecture.
const medicalStations=[];
for(const room of roomDefinitions.filter(r=>r.name.includes('病房')||r.name.includes('治疗')||r.name==='药房')){
 const x=room.center-room.side*1.5,z=room.z-1.9;
 // Rolling monitor with ECG trace, knobs, screen surround and support column.
 const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=256;const cx=screenCanvas.getContext('2d');cx.fillStyle='#061512';cx.fillRect(0,0,512,256);cx.strokeStyle='#1e4535';for(let n=0;n<512;n+=25){cx.beginPath();cx.moveTo(n,0);cx.lineTo(n,256);cx.stroke()}cx.strokeStyle='#86caa2';cx.lineWidth=2;for(let row=0;row<3;row++){cx.beginPath();for(let n=0;n<512;n++){let q=n%130,y=75+row*60+(q<85?Math.sin(n*.16)*2:q<91?-12:q<96?35:q<102?-28:q<108?10:0);if(n===0)cx.moveTo(n,y);else cx.lineTo(n,y)}cx.stroke()}cx.fillStyle='#b9d5be';cx.font='19px sans-serif';cx.fillText('ECG  72   SpO2 98%',22,25);const ecg=new THREE.CanvasTexture(screenCanvas);ecg.colorSpace=THREE.SRGBColorSpace;
 box(x,1.30,z,.8,.6,.27,ivory);box(x,1.32,z+.15,.66,.43,.018,new THREE.MeshBasicMaterial({map:ecg}));for(let k=0;k<4;k++)box(x-.23+k*.15,1.05,z+.15,.045,.04,.035,metal);rod(x,.1,z,x,1.0,z,.035,metal);for(let side of [-1,1])rod(x-.34,.10,z+side*.22,x+.34,.10,z+side*.22,.025,metal);
 // IV stand, hook, translucent fluid bag and a visible tube.
 const iv=x+room.side*.8;rod(iv,.12,z,iv,2.2,z,.027,hardware);rod(iv-.2,2.2,z,iv+.2,2.2,z,.023,hardware);box(iv+.16,1.93,z,.20,.36,.08,new THREE.MeshStandardMaterial({color:0x9db6af,transparent:true,opacity:.7,roughness:.4}));rod(iv+.16,1.74,z,iv+.08,1.13,z,.006,mat(0xaabbb0));for(let n=0;n<3;n++){let a=n*Math.PI*2/3;rod(iv,.09,z,iv+Math.cos(a)*.26,.05,z+Math.sin(a)*.26,.02,metal)}
 // Oxygen cylinder and valve, plus a supply trolley with labelled bottles.
 const tank=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.64,6,12),mat(0x66877c));tank.position.set(x-room.side*.7,.49,z);scene.add(tank);rod(tank.position.x,.88,z,tank.position.x,1.02,z,.025,hardware);
 const cartX=room.center,z2=room.z+1.7;box(cartX,.77,z2,.9,.05,.6,hardware);box(cartX,.24,z2,.86,.035,.56,metal);for(let dx of [-.38,.38])for(let dz of [-.22,.22])rod(cartX+dx,.1,z2+dz,cartX+dx,.82,z2+dz,.018,hardware);for(let n=0;n<4;n++){let bottle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.12,10),mat(n%2?0x566e63:0xc5c7af));bottle.position.set(cartX-.27+n*.18,.86,z2);scene.add(bottle)}medicalStations.push({x:cartX,z:z2,name:room.name+'诊疗台'});
}

const ghosts=[],names=['白衣护士','无面院长','哭泣病童','缝合医生','轮椅老人','镜中女人','第七号病人'];
for(let i=0;i<7;i++){
 const g=new THREE.Group(),src=closedCharacters[i],photo=new THREE.TextureLoader().load(imageAssets['ghost-'+i+'.jpg']);photo.colorSpace=THREE.SRGBColorSpace;
 const fabricColors=[0x9c9d87,0x3e4740,0x8c9c93,0x708d7a,0x77725e,0x4d554d,0x9a947f];
 const weave=document.createElement('canvas');weave.width=weave.height=256;const wc=weave.getContext('2d');wc.fillStyle='#b4b1a1';wc.fillRect(0,0,256,256);let noise=31+i;for(let n=0;n<7000;n++){noise=(noise*1664525+1013904223)>>>0;wc.fillStyle=n%2?'#171d1320':'#f2e4c31a';wc.fillRect(noise%256,(noise>>>8)%256,1,1+(noise%4))}for(let n=0;n<14;n++){wc.fillStyle='#29302125';wc.fillRect(n*20,0,1,256)}const weaveMap=new THREE.CanvasTexture(weave);weaveMap.colorSpace=THREE.SRGBColorSpace;weaveMap.wrapS=weaveMap.wrapT=THREE.RepeatWrapping;weaveMap.repeat.set(5,5);const textile=surface('fabric-color.jpg',2,2),textileNormal=surface('fabric-normal.jpg',2,2,false);const cloth=new THREE.MeshStandardMaterial({color:fabricColors[i],map:textile,normalMap:textileNormal,normalScale:new THREE.Vector2(.28,.28),roughness:.96});const skin=new THREE.MeshStandardMaterial({color:0x77796a,roughness:.94});const trim=new THREE.MeshStandardMaterial({color:i===1?0x292f2b:0x55594c,roughness:.9});const face=new THREE.MeshStandardMaterial({map:photo,bumpMap:photo,bumpScale:.004,color:0xc4c4b5,roughness:.95});
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(src.p,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(src.n,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(src.uv,2));let all=[],offset=0;for(let m=0;m<4;m++){all=all.concat(src.idx[m]);geometry.addGroup(offset,src.idx[m].length,m);offset+=src.idx[m].length}geometry.setIndex(all);geometry.computeVertexNormals();g.add(new THREE.Mesh(geometry,[face,cloth,skin,trim]));
 function ellipsoid(x,y,z,sx,sy,sz,m){const o=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o}
 function panel(x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
 // Separate garment construction for each role, on top of its unique closed body mesh.
 if(i===0){const hat=new THREE.Mesh(new THREE.CylinderGeometry(.15,.21,.08,24),cloth);hat.position.set(0,2.31,-.03);hat.scale.z=.7;g.add(hat);panel(0,2.32,.11,.07,.025,.008,mat(0x602f2a));panel(0,2.32,.112,.025,.065,.008,mat(0x602f2a));for(let side of [-1,1]){let collar=panel(side*.08,1.62,.125,.10,.13,.025,cloth);collar.rotation.z=side*.5;}}
 if(i===1){for(let side of [-1,1]){let lapel=panel(side*.11,1.48,.19,.10,.27,.025,trim);lapel.rotation.z=side*.35}let tie=panel(0,1.43,.216,.043,.28,.012,mat(0x4f2826));}
 if(i===2){for(let y=.80;y<1.52;y+=.10){const stripe=new THREE.Mesh(new THREE.TorusGeometry(.28,.006,5,36),trim);stripe.rotation.x=Math.PI/2;stripe.scale.y=.67;stripe.position.y=y;g.add(stripe)}g.scale.setScalar(.73)}
 if(i===3){for(let side of [-1,1]){let lapel=panel(side*.10,1.49,.19,.09,.25,.025,cloth);lapel.rotation.z=side*.4}let mask=ellipsoid(0,1.89,.20,.175,.095,.065,cloth);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,.10,24),cloth);cap.position.y=2.31;g.add(cap)}
 if(i===4){for(let k=0;k<6;k++)ellipsoid(0,1.51-k*.09,.20,.012,.012,.009,trim);}
 if(i===5){const hair=new THREE.MeshStandardMaterial({color:0x242a23,roughness:.98});ellipsoid(0,2.12,-.10,.255,.24,.16,hair);for(let side of [-1,1]){ellipsoid(side*.23,1.96,-.035,.065,.29,.10,hair);ellipsoid(side*.24,1.66,.015,.055,.24,.08,hair)}}
 if(i===6){for(let y=1.79;y<2.29;y+=.075){let band=new THREE.Mesh(new THREE.TorusGeometry(.235,.016,6,32),cloth);band.rotation.x=Math.PI/2;band.scale.y=.88;band.position.y=y;g.add(band)}for(let y of [1.02,1.23,1.43]){panel(0,y,.208,.48,.045,.018,trim);panel(.16,y,.225,.06,.06,.02,mat(0x7d8273))}}
 if(i===0||i===3)for(let k=0;k<5;k++)ellipsoid(0,1.49-k*.11,.203,.009,.009,.006,trim);
 for(const accessory of g.children){if(accessory.position.y>1.70){accessory.position.x*=.65;accessory.position.y=1.70+(accessory.position.y-1.70)*.60;accessory.position.z*=.70;accessory.scale.multiply(new THREE.Vector3(.65,.60,.70))}}const stature=[[1,1,1],[1.06,1.10,1.04],[.78,.68,.82],[.94,1.13,.92],[1.03,.91,1.05],[.97,1.065,.97],[.90,1.045,.90]][i];g.scale.fromArray(stature);g.position.set(i%2?2:-2,0,-8-i*8);g.visible=false;scene.add(g);ghosts.push(g)
}

addPortraitGhosts();
const keyNames={nurse:'护士站钥匙',pharmacy:'药房钥匙',archive:'档案室钥匙',exit:'出口钥匙'};
const keyPositions=[{id:'nurse',x:0,z:0},{id:'pharmacy',x:-8,z:-4},{id:'archive',x:8,z:-11},{id:'exit',x:-8,z:-25}];
for(const k of keyPositions){const table=box(k.x,.43,k.z,1.15,.86,.65,mat(0x626b5c));box(k.x,.9,k.z,1.25,.08,.75,ivory);const model=new THREE.Group();let ring=new THREE.Mesh(new THREE.TorusGeometry(.075,.012,6,16),hardware);ring.rotation.x=Math.PI/2;model.add(ring);let stem=new THREE.Mesh(new THREE.BoxGeometry(.022,.022,.18),hardware);stem.position.z=.13;model.add(stem);for(let z of [.17,.21]){let tooth=new THREE.Mesh(new THREE.BoxGeometry(.07,.02,.025),hardware);tooth.position.set(.025,0,z);model.add(tooth)}model.position.set(k.x,.96,k.z);scene.add(model);model.traverse(o=>movingObjects.add(o));keyItems.push({...k,model,taken:false})}
const inventoryLabel=document.createElement('div');inventoryLabel.style.cssText='position:absolute;right:26px;top:65px;color:#b9c9b9;font-size:13px;max-width:260px;text-align:right;line-height:1.8';$('hud').append(inventoryLabel);
let roomMessage='',roomMessageUntil=0;function roomToast(s){roomMessage=s;roomMessageUntil=performance.now()+3200}
let playerNoiseTimer=0;function emitPlayerNoise(duration=2.8){playerNoiseTimer=Math.max(playerNoiseTimer,duration)}
function nearbyKey(){if((p.y||0)>1)return null;return keyItems.find(k=>!k.taken&&Math.hypot(p.x-k.x,p.z-k.z)<1.55)}
function nearbyDoor(){if((p.y||0)>1)return null;return hospitalDoors.find(d=>Math.hypot(p.x-d.side*4.32,p.z-d.z)<1.8)}
function useRoom(){if(nearbyCeilingHead()&&pickUpCeilingHead())return true;if(nearbyPerson()&&pickUpPerson())return true;if(useSupply())return true;if(useUpperStation())return true;if(stationInteraction())return true;const key=nearbyKey();if(key){if(isExtreme()&&key.id==='exit'&&!extremeState.gridSolved){openFuseGrid();return true}inventory.add(key.id);queueFright('key:'+key.id,key.id==='exit'?6:key.id==='archive'?5:2);key.taken=true;key.model.visible=false;inventoryLabel.textContent='钥匙串：'+[...inventory].map(k=>keyNames[k]).join(' · ');roomToast('已拾取 '+keyNames[key.id]);if(difficulty==='peaceful')$('objective').textContent=key.id==='nurse'?'用钥匙打开左侧护士站，寻找下一把钥匙':key.id==='pharmacy'?'打开右侧药房，继续寻找钥匙':key.id==='archive'?'打开左侧档案室，寻找出口钥匙':'已找到出口钥匙，可继续探索或前往走廊尽头';return true}const door=nearbyDoor();if(door){if(difficulty==='inspection'&&door.open&&!door.inspectionJudged){openInspectionPlaqueModal(door);return true}if(door.key&&!inventory.has(door.key)){roomToast(door.name+'已上锁，需要'+keyNames[door.key]);return true}const firstOpening=!door.open;door.open=true;emitPlayerNoise(2.4);if(firstOpening)triggerRoomScene(door);roomToast(difficulty==='inspection'?'已打开 '+door.name+' · 进房核查后在门口按 E 挂牌':'已打开 '+door.name);return true}if(difficulty==='peaceful'&&(p.y||0)<1&&inventory.has('exit')&&p.z<-30){modal('探索完成','<p>你已经找到四把钥匙，并打开了医院的主要房间。</p><p>可以返回继续自由探索。</p>',close);return true}return false}
function canWalk(x,z){if(pursuitEnabled&&pursuingGhosts.some(f=>{const g=ghosts[f.index];return g.visible&&(f.knockdown||0)<=0&&Math.abs(g.position.y-(p.y||0))<.65&&Math.hypot(x-g.position.x,z-g.position.z)<.62&&Math.hypot(x-g.position.x,z-g.position.z)<=Math.hypot(p.x-g.position.x,p.z-g.position.z)}))return false;const vertical=verticalWalkAllowed(x,z);if(vertical!==null)return vertical;const inside=walkable.some(r=>x>r.x1+.16&&x<r.x2-.16&&z>r.z1+.16&&z<r.z2-.16);if(!inside)return false;if(mazeWalls.some(w=>x>w.x1&&x<w.x2&&z>w.z1&&z<w.z2))return false;for(const door of hospitalDoors){if(!door.open&&Math.abs(x-door.side*4.32)<.32&&Math.abs(z-door.z)<.83)return false}return true}
function roomHint(){if(performance.now()<roomMessageUntil)return roomMessage;if(bellState.activeSeventh)return '⚠️ 第七次铃响！切勿大幅回头或后退（剩余 '+bellState.seventhLeft.toFixed(1)+' 秒）';if(carriedPerson)return '正抱着整个人 · 按 Q 把人丢出去（砸中鬼或人都会跌倒 2 秒）';if(carriedHead)return '正拿着人头 · 按 Q 把人头丢出去砸人或砸鬼（跌倒 2 秒）';if(nearbyCeilingHead())return '按 E 捡起落地的人头（按 Q 丢出去可砸倒人或怨灵）';if(nearbyPerson())return '按 E 抱起面前的病患（按 Q 把整个人丢出去砸倒怨灵 2 秒）';if(fieldKit.hidden)return fieldKit.bedDisguise?'病床伪装中（心率 '+Math.round(fieldKit.heartRate)+' BPM）· 连按空格平稳呼吸 · H 离开':'藏身中 · 按 H 或移动离开';const supply=nearbySupply();if(supply)return '按 E 拾取 '+(supply.type==='record'?'诊疗记录':supply.type==='sedative'?'镇静剂药瓶（按 Q 抛投）':'备用电池');const upperSt=nearbyUpperStation();if(upperSt)return '按 E 操作 '+upperSt.name;if((p.y||0)>3.65)return '二楼病区 · 病历阅览室 / 心电检查室(调频) / 器材整理室(发电机) / 住院观察室(病床伪装)';const station=mazeStations.find(s=>!s.solved&&Math.hypot(p.x-s.x,p.z-s.z)<1.9);if(station)return '按 E 检查 '+station.name;const k=nearbyKey();if(k)return '按 E 拾取 '+keyNames[k.id];const d=nearbyDoor();if(d){if(difficulty==='inspection'&&d.open)return d.inspectionJudged?d.name+' · 已完成巡检挂牌':'按 E 对【'+d.name+'】进行 1998 夜班巡检挂牌判定';return d.open?d.name+' · 门已打开':'按 E '+(d.key&&!inventory.has(d.key)?'检查门锁：':'开门：')+d.name}if(inventory.has('exit')&&difficulty!=='inspection')return '已找到出口钥匙 · 前往一楼走廊尽头，按 E';if(difficulty!=='peaceful'&&difficulty!=='inspection'&&(p.y||0)<1&&Math.hypot(p.x-storyLocations[stage][0],p.z-storyLocations[stage][1])<2.1)return '按 E 查阅房间记录';if(patientNearPlayer())return '住院病人 · 按 E 可直接抱起他，按 Q 丢出去砸倒怨灵';return difficulty==='inspection'?'1998夜班巡检：开门观察 8 间病房，在门口按 E 挂牌判定（已巡检 '+inspectionState.completed+'/8）':isExtreme()?'探索两翼迷宫与二楼发电机 · M 查看已探索路线':'寻找钥匙与二楼机关 · E 抱人或捡人头 / Q 丢出去砸人砸鬼';}
function animateRooms(dt){for(const d of hospitalDoors){const target=d.open?-Math.PI*.53:0;d.leaf.rotation.y=THREE.MathUtils.damp(d.leaf.rotation.y,target,7,dt)}}
// Encounters start after an exploration interval and never display a crowd of ghosts.
let explorationTime=0,nextEncounterAt=55,encounterIndex=0,activeEncounter=null;
let pursuitEnabled=true,pursuitCaught=false,pursuitVoiceCooldown=0;
const pursuingGhosts=[],pursuitTrail=[];
let pursuitDistance=0;
const pursuitNames=names;const pursuitTotal=ghosts.length;const pursuitUnlockOrder=[];for(let n=0;n<16;n++){pursuitUnlockOrder.push(n);if(n+16<pursuitTotal)pursuitUnlockOrder.push(n+16)}

// 26 Ghost 4 Sensory Archetypes (听觉猎手 / 视线与光源敏感 / 封路干扰 / 伪装潜伏)
function getGhostArchetype(index){
 if([2,9,10,14,15,20,22].includes(index))return {type:'auditory',tag:'听觉猎手',desc:'静步时移速极慢，奔跑或开门时暴走加速'};
 if([5,11,13,18].includes(index))return {type:'gaze',tag:'视线敏感',desc:'正视她时定身停滞，背对她时疾速逼近'};
 if([7,17,23].includes(index))return {type:'light',tag:'光源趋光',desc:'开手电时加速扑来，关手电(F)时迷失减速'};
 if([1,8,16,21,24].includes(index))return {type:'disruptor',tag:'封路干扰',desc:'途经走廊房门会反手关门，近身散发寒气消耗体力'};
 return {type:'impostor',tag:'伪装潜伏',desc:'常混迹于病房，进入房间范围时移速激增'};
}
function isPlayerLookingAtGhost(point){
 if(Math.abs((p.y||0)-point.y)>1.2)return false;
 const dx=point.x-p.x,dz=point.z-p.z,dist=Math.hypot(dx,dz);
 if(dist>15||dist<.2)return false;
 const lookX=-Math.sin(yaw),lookZ=-Math.cos(yaw);
 const dot=(dx*lookX+dz*lookZ)/dist;
 return dot>.76&&ghostSweptAllowed({x:p.x,y:p.y||0,z:p.z},point,.12);
}

let invincible=false;try{invincible=localStorage.getItem('ward-invincible')==='1'}catch(_){}
const immortalityButton=document.createElement('button');immortalityButton.style.cssText='position:absolute;right:26px;top:82px;z-index:15;padding:9px 14px;background:#284239;color:#dce8d9;pointer-events:auto';document.body.append(immortalityButton);
function updateImmortalityLabel(){immortalityButton.textContent='不死模式：'+(invincible?'开':'关')}
immortalityButton.onclick=()=>{invincible=!invincible;try{localStorage.setItem('ward-invincible',invincible?'1':'0')}catch(_){}updateImmortalityLabel()};updateImmortalityLabel();

let jumpScaresEnabled=true;try{jumpScaresEnabled=localStorage.getItem('ward-jumpscares')!=='0'}catch(_){}
const jumpScareButton=document.createElement('button');jumpScareButton.style.cssText='position:absolute;right:26px;top:126px;z-index:15;padding:9px 14px;background:#284239;color:#dce8d9;pointer-events:auto';document.body.append(jumpScareButton);
function updateJumpScareLabel(){jumpScareButton.textContent='突脸：'+(jumpScaresEnabled?'开':'关');jumpScareButton.setAttribute('aria-pressed',String(jumpScaresEnabled))}
function setJumpScaresEnabled(enabled){jumpScaresEnabled=!!enabled;try{localStorage.setItem('ward-jumpscares',jumpScaresEnabled?'1':'0')}catch(_){}if(!jumpScaresEnabled){$('jumpscare').style.display='none';stopJumpScream();frightState.queue.length=0;frightState.since=0}updateJumpScareLabel()}
jumpScareButton.onclick=()=>setJumpScaresEnabled(!jumpScaresEnabled);updateJumpScareLabel();

// Independent spectator camera. Gameplay time and actors freeze while inspecting.
const freeCamera={enabled:false,x:0,y:0,z:0,returnYaw:0,returnPitch:0,carriedVisible:false,personVisible:false};
const freeCameraButton=document.createElement('button');freeCameraButton.style.cssText='position:absolute;right:26px;top:170px;z-index:15;padding:9px 14px;background:#284239;color:#dce8d9;pointer-events:auto;display:none';document.body.append(freeCameraButton);
function updateFreeCameraLabel(){freeCameraButton.textContent='自由视角：'+(freeCamera.enabled?'开':'关')+' [C]';freeCameraButton.setAttribute('aria-pressed',String(freeCamera.enabled))}
function setFreeCamera(enabled){if(!playing||paused)return;enabled=!!enabled;if(enabled===freeCamera.enabled)return;if(enabled){freeCamera.x=camera.position.x;freeCamera.y=camera.position.y;freeCamera.z=camera.position.z;freeCamera.returnYaw=yaw;freeCamera.returnPitch=pitch;stopPursuitVoice();stopJumpScream();$('jumpscare').style.display='none';if(carriedHead){freeCamera.carriedVisible=carriedHead.group.visible;carriedHead.group.visible=false}if(carriedPerson){freeCamera.personVisible=carriedPerson.model.visible;carriedPerson.model.visible=false}}else{yaw=freeCamera.returnYaw;pitch=freeCamera.returnPitch;camera.position.set(p.x,(p.y||0)+(fieldKit.hidden?.85:1.65),p.z);camera.rotation.set(pitch,yaw,0);if(carriedHead)carriedHead.group.visible=freeCamera.carriedVisible;if(carriedPerson)carriedPerson.model.visible=freeCamera.personVisible;$('hint').textContent=roomHint()}freeCamera.enabled=enabled;keys={};last=performance.now();updateFreeCameraLabel()}
freeCameraButton.onclick=()=>setFreeCamera(!freeCamera.enabled);updateFreeCameraLabel();
function updateFreeCamera(dt){let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),up=(keys[' ']?1:0)-(keys.control?1:0);let x=-Math.sin(yaw)*Math.cos(pitch)*forward+Math.cos(yaw)*side,y=Math.sin(pitch)*forward+up,z=-Math.cos(yaw)*Math.cos(pitch)*forward-Math.sin(yaw)*side;const length=Math.hypot(x,y,z);if(length>1){x/=length;y/=length;z/=length}const speed=(keys.shift?8:3.5)*dt;freeCamera.x=THREE.MathUtils.clamp(freeCamera.x+x*speed,-70,70);freeCamera.y=THREE.MathUtils.clamp(freeCamera.y+y*speed,.15,18);freeCamera.z=THREE.MathUtils.clamp(freeCamera.z+z*speed,-55,15);camera.position.set(freeCamera.x,freeCamera.y,freeCamera.z);camera.rotation.set(pitch,yaw,0);flash.intensity=fieldKit.lightOn?26:0;$('hint').textContent='自由视角 · WASD / 方向键移动 · 双指转视角 · 空格上升 · Control 下降 · Shift 加速 · C / Esc 返回（场景已暂停）'}
window.addEventListener('keydown',event=>{const target=event.target;if(target?.matches?.('input,textarea,select')||target?.isContentEditable)return;const key=event.key.toLowerCase();if(key==='c'&&playing&&!paused){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)setFreeCamera(!freeCamera.enabled);return}if(!freeCamera.enabled)return;event.preventDefault();event.stopImmediatePropagation();if(key==='escape'){setFreeCamera(false);return}keys[key]=true;if(key==='f'&&!event.repeat)fieldKit.lightOn=!fieldKit.lightOn},{capture:true});
window.addEventListener('keyup',event=>{if(!freeCamera.enabled)return;keys[event.key.toLowerCase()]=false;event.preventDefault();event.stopImmediatePropagation()},{capture:true});

function recordPursuitTrail(){const last=pursuitTrail[pursuitTrail.length-1];if(!last){pursuitTrail.push({x:p.x,y:p.y||0,z:p.z,d:0});return}const distance=Math.hypot(p.x-last.x,(p.y||0)-last.y,p.z-last.z);if(distance<.15)return;pursuitDistance+=distance;pursuitTrail.push({x:p.x,y:p.y||0,z:p.z,d:pursuitDistance})}
function pursuitPoint(distance){if(!pursuitTrail.length)return {x:p.x,y:p.y||0,z:p.z};let lo=0,hi=pursuitTrail.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(pursuitTrail[mid].d<distance)lo=mid+1;else hi=mid}const b=pursuitTrail[lo],a=pursuitTrail[Math.max(0,lo-1)],t=Math.max(0,Math.min(1,(distance-a.d)/(b.d-a.d||1)));return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}}

// Ghosts use a body footprint and swept movement, including floor-specific walls.
function ghostCenterAllowed(x,y,z){const stair=stairHeight(x,z);if(stair!==null)return Math.abs(stair-y)<.23;if(y>3.65)return upperPositionAllowed(x,z);if(y>.25)return false;
 if(!walkable.some(r=>x>r.x1+.10&&x<r.x2-.10&&z>r.z1+.10&&z<r.z2-.10))return false;
 if(mazeWalls.some(w=>x>w.x1&&x<w.x2&&z>w.z1&&z<w.z2))return false;
 for(const door of hospitalDoors)if(!door.open&&Math.abs(x-door.side*4.32)<.34&&Math.abs(z-door.z)<.87)return false;return true}
function ghostBodyAllowed(point,radius=.36){if(!ghostCenterAllowed(point.x,point.y,point.z))return false;for(let i=0;i<8;i++){const angle=i*Math.PI/4,x=point.x+Math.cos(angle)*radius,z=point.z+Math.sin(angle)*radius,h=stairHeight(x,z);if(!ghostCenterAllowed(x,h!==null&&Math.abs(h-point.y)<.24?h:point.y,z))return false}return true}
function clearGhostPoint(point,radius){if(ghostBodyAllowed(point,radius))return point;for(const distance of [.12,.24,.36,.48,.60])for(let i=0;i<16;i++){const angle=i*Math.PI/8,x=point.x+Math.cos(angle)*distance,z=point.z+Math.sin(angle)*distance,h=stairHeight(x,z),candidate={x,y:h!==null&&Math.abs(h-point.y)<.24?h:point.y,z};if(ghostBodyAllowed(candidate,radius))return candidate}return null}
function ghostSweptAllowed(from,to,radius){const distance=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z),steps=Math.max(1,Math.ceil(distance/.05));for(let n=1;n<=steps;n++){const t=n/steps;if(!ghostBodyAllowed({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,z:from.z+(to.z-from.z)*t},radius))return false}return true}

// Shared cached navigation cells; each ghost owns its route and can replan if blocked.
const ghostNavCache=new Map();let ghostNavDoorMask=-1,pursuitNavigationBudget=2;
function refreshGhostNavigation(){const mask=hospitalDoors.reduce((v,d,i)=>d.open?v+2**i:v,0);if(mask!==ghostNavDoorMask){ghostNavCache.clear();ghostNavDoorMask=mask}}
function ghostNavPoint(ix,iz,height){const x=ix*.25,z=iz*.25;if(Math.abs(x)>55||z< -41||z>5)return null;const h=stairHeight(x,z);let y;if(h!==null){if(Math.abs(h-height)>.27)return null;y=h}else if(height<.27)y=0;else if(height>3.73)y=4;else return null;const key=ix+','+iz+','+(h!==null?'s':y);if(ghostNavCache.has(key))return ghostNavCache.get(key);const point={x,y,z,key,ix,iz};const valid=ghostBodyAllowed(point,.40)?point:null;ghostNavCache.set(key,valid);return valid}
function nearestGhostNav(point,endpoint=false){const ix=Math.round(point.x*4),iz=Math.round(point.z*4);let best=null,bestDistance=Infinity;for(let r=0;r<=4;r++){for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const n=ghostNavPoint(ix+dx,iz+dz,point.y);if(!n)continue;const distance=Math.hypot(n.x-point.x,n.y-point.y,n.z-point.z);if(distance<bestDistance&&ghostSweptAllowed(point,n,endpoint?.10:.32)){best=n;bestDistance=distance}}if(best)return best}return null}
function findGhostRoute(from,to){refreshGhostNavigation();const start=nearestGhostNav(from),goal=nearestGhostNav(to,true);if(!start||!goal)return [];const heap=[],cost=new Map([[start.key,0]]),parents=new Map(),points=new Map([[start.key,start]]);function push(n){heap.push(n);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=n.f)break;heap[i]=heap[j];i=j}heap[i]=n}function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return top}const heuristic=n=>Math.abs(n.x-goal.x)+Math.abs(n.z-goal.z)+Math.abs(n.y-goal.y)*2;push({point:start,g:0,f:heuristic(start)});let visits=0;
 while(heap.length&&visits++<24000){const current=pop(),node=current.point;if(current.g!==cost.get(node.key))continue;if(node.key===goal.key){const route=[];let key=node.key;while(key){route.push(points.get(key));key=parents.get(key)}return route.reverse()}
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const next=ghostNavPoint(node.ix+dx,node.iz+dz,node.y);if(!next)continue;const value=current.g+.25+Math.abs(next.y-node.y);if(value>=(cost.get(next.key)??Infinity))continue;if(!ghostSweptAllowed(node,next,.40))continue;cost.set(next.key,value);parents.set(next.key,node.key);points.set(next.key,next);push({point:next,g:value,f:value+heuristic(next)})}}
 return []}

const activeSoundLure={active:false,x:0,y:0,z:0,time:0};
function triggerSoundLure(x,y,z,duration=6.5){activeSoundLure.active=true;activeSoundLure.x=x;activeSoundLure.y=y;activeSoundLure.z=z;activeSoundLure.time=duration;for(const f of pursuingGhosts){if(Math.abs(ghosts[f.index].position.y-y)<1.2&&Math.hypot(ghosts[f.index].position.x-x,ghosts[f.index].position.z-z)<18){f.navWait=0;f.directWait=0}}}

function movePursuer(follower,dt,speed){if(speed<=0)return;const ghost=ghosts[follower.index],from={x:ghost.position.x,y:ghost.position.y,z:ghost.position.z};
 const lured=activeSoundLure.active&&Math.abs((activeSoundLure.y||0)-from.y)<1.2&&Math.hypot(activeSoundLure.x-from.x,activeSoundLure.z-from.z)<18;
 const goalPoint=lured?{x:activeSoundLure.x,y:activeSoundLure.y||0,z:activeSoundLure.z}:{x:p.x,y:p.y||0,z:p.z};
 const gap=Math.hypot(goalPoint.x-from.x,goalPoint.y-from.y,goalPoint.z-from.z);follower.navWait=Math.max(0,(follower.navWait||0)-dt);follower.directWait=(follower.directWait||0)-dt;
 if(follower.directWait<=0){follower.direct=ghostSweptAllowed(from,goalPoint,follower.radius);follower.directWait=.45}
 let target=null;if(gap<1.7&&ghostSweptAllowed(from,goalPoint,.12))follower.direct=true;
 if(follower.direct){target=goalPoint;if(gap<1.7&&!lured){const angle=explorationTime*.42+follower.index*2.4;const orbit=clearGhostPoint({x:goalPoint.x+Math.cos(angle)*.86,y:goalPoint.y,z:goalPoint.z+Math.sin(angle)*.86},follower.radius);if(orbit&&ghostSweptAllowed(from,orbit,follower.radius))target=orbit}}
 else{const goalMoved=!follower.navGoal||Math.hypot(goalPoint.x-follower.navGoal.x,goalPoint.z-follower.navGoal.z,goalPoint.y-follower.navGoal.y)>1.5;if((!follower.route?.length||goalMoved||(follower.stalled||0)>.65)&&follower.navWait<=0&&pursuitNavigationBudget>0){pursuitNavigationBudget--;follower.route=findGhostRoute(from,goalPoint);follower.routeIndex=0;follower.navGoal={...goalPoint};follower.navWait=1.2+follower.index*.04;follower.stalled=0}
 while(follower.route&&follower.routeIndex<follower.route.length&&Math.hypot(from.x-follower.route[follower.routeIndex].x,from.y-follower.route[follower.routeIndex].y,from.z-follower.route[follower.routeIndex].z)<.13)follower.routeIndex++;
 target=follower.route?.[follower.routeIndex];
 // Continue along a reachable part of the player's trail until a new route is ready.
 if(!target&&!lured){const nextDistance=Math.min(pursuitDistance,follower.distance+speed*dt),trail=clearGhostPoint(pursuitPoint(nextDistance),follower.radius);if(trail&&ghostSweptAllowed(from,trail,follower.radius)){target=trail;follower.distance=nextDistance}}}
 if(!target){follower.stalled=(follower.stalled||0)+dt;return}
 const distance=Math.hypot(target.x-from.x,target.y-from.y,target.z-from.z);if(distance<.001)return;const step=Math.min(speed*dt,distance),direction={x:(target.x-from.x)/distance,y:(target.y-from.y)/distance,z:(target.z-from.z)/distance};let sx=0,sz=0;
 for(const other of pursuingGhosts){if(other===follower)continue;const pos=ghosts[other.index].position,dx=from.x-pos.x,dz=from.z-pos.z,d=Math.hypot(dx,dz);if(Math.abs(from.y-pos.y)<.5&&d<.85){if(d>.02){sx+=dx/d*(.85-d);sz+=dz/d*(.85-d)}else{const angle=follower.index*2.4+explorationTime*.2;sx+=Math.cos(angle)*.6;sz+=Math.sin(angle)*.6}}}
 const candidates=[];const lx=direction.x+sx*.75,lz=direction.z+sz*.75,length=Math.hypot(lx,lz),horizontal=Math.hypot(direction.x,direction.z);if(length>.001)candidates.push({x:from.x+lx/length*step*horizontal,y:from.y+direction.y*step,z:from.z+lz/length*step*horizontal});candidates.push({x:from.x+direction.x*step,y:from.y+direction.y*step,z:from.z+direction.z*step});
 // Alternate shoulder directions free a ghost caught behind another at a corner.
 for(const sign of [1,-1])candidates.push({x:from.x+(direction.x*.65-direction.z*.45*sign)*step,y:from.y+direction.y*step,z:from.z+(direction.z*.65+direction.x*.45*sign)*step});let moved=false;
 for(const to of candidates){if(ghostSweptAllowed(from,to,follower.radius)){ghost.position.set(to.x,to.y,to.z);moved=true;break}}follower.stalled=moved?0:(follower.stalled||0)+dt;
 if(moved&&follower.direct&&!lured)follower.distance=Math.max(follower.distance,pursuitDistance-gap);
}

function unlockPursuer(index,spawnPoint=null){if(difficulty==='peaceful'||!pursuitEnabled||pursuingGhosts.some(g=>g.index===index))return;recordPursuitTrail();const arch=getGhostArchetype(index);const follower={index,arch,stunned:0,knockdown:0,doorCooldown:0,distance:Math.max(0,pursuitDistance-9-index*.8),voice:2+index*.9,grace:5,contact:0,radius:Math.max(index===4||index===10?.40:.34,ghosts[index].userData.pursuitRadius||.34)};pursuingGhosts.push(follower);const point=clearGhostPoint(spawnPoint||pursuitPoint(follower.distance),follower.radius);if(!point){pursuingGhosts.pop();return}ghosts[index].position.set(point.x,point.y,point.z);ghosts[index].visible=true;roomToast(pursuitNames[index]+'【'+arch.tag+'】已苏醒 · '+arch.desc);encounterIndex=pursuingGhosts.length}
function startFinalPursuit(){if(difficulty==='peaceful')return;chasing=true;for(let i=0;i<pursuitTotal;i++)unlockPursuer(i);for(const g of pursuingGhosts)g.grace=Math.max(g.grace,3)}
function catchByPursuer(index){if(invincible||pursuitCaught)return;pursuitCaught=true;if(isExtreme()){extremeFailure('你被追逐中的鬼（'+pursuitNames[index]+'）抓住了。');return}const checkpoint={x:p.x,y:p.y||0,z:p.z};scare(index,ghosts[index].userData.portrait||null);paused=true;setTimeout(()=>modal('你被抓住了','<p>抓到你的怨灵：<strong>'+pursuitNames[index]+'（'+getGhostArchetype(index).tag+'）</strong></p><p>应对提示：'+getGhostArchetype(index).desc+'。继续后会给你一段重新拉开距离的时间。</p>',()=>{p.x=checkpoint.x;p.y=checkpoint.y;p.z=checkpoint.z;for(const g of pursuingGhosts){g.distance=Math.max(0,pursuitDistance-12-g.index);g.grace=7;g.contact=0;g.route=[];g.direct=false;g.directWait=0;g.navWait=0;const reset=clearGhostPoint(pursuitPoint(g.distance),g.radius);if(reset)ghosts[g.index].position.set(reset.x,reset.y,reset.z)}pursuitCaught=false;close()}),700)}
function updateEncounters(dt){if(difficulty==='peaceful'||!pursuitEnabled||pursuitCaught)return;recordPursuitTrail();explorationTime+=dt;pursuitNavigationBudget=2;pursuitVoiceCooldown=Math.max(0,pursuitVoiceCooldown-dt);playerNoiseTimer=Math.max(0,playerNoiseTimer-dt);if(activeSoundLure.active){activeSoundLure.time-=dt;if(activeSoundLure.time<=0)activeSoundLure.active=false}
if(explorationTime>=nextEncounterAt&&encounterIndex<pursuitTotal&&difficulty!=='inspection'){unlockPursuer(pursuitUnlockOrder[encounterIndex]);nextEncounterAt=explorationTime+65}
let stunnedCount=0,watchedCount=0,fallenCount=0;
for(const follower of pursuingGhosts){const ghost=ghosts[follower.index],arch=follower.arch||getGhostArchetype(follower.index);follower.grace=Math.max(0,follower.grace-dt);follower.voice-=dt;follower.stunned=Math.max(0,(follower.stunned||0)-dt);follower.doorCooldown=Math.max(0,(follower.doorCooldown||0)-dt);
 if((follower.knockdown||0)>0){
  follower.knockdown=Math.max(0,follower.knockdown-dt);
  ghost.rotation.x=THREE.MathUtils.damp(ghost.rotation.x,-Math.PI*.48,14,dt);
  fallenCount++;
 }else{
  ghost.rotation.x=THREE.MathUtils.damp(ghost.rotation.x,0,10,dt);
 }
 const point=ghost.position,gap=Math.hypot(p.x-point.x,p.z-point.z,(p.y||0)-point.y);
 const disguisedSafe=fieldKit.hidden&&(!fieldKit.bedDisguise||fieldKit.heartRate<135);
 if(!disguisedSafe){
  let speed=({easy:1.15,normal:1.45,hard:1.75,ultimate:1.95,abyss:2.10,inspection:1.42}[difficulty]||1.45)*(1+Math.min(follower.index,6)*.025);
  if((follower.knockdown||0)>0||bellState.freezeTimer>0||follower.stunned>0){speed=0;if((follower.knockdown||0)<=0)stunnedCount++}
  else{
   if(arch.type==='auditory')speed*=(keys.shift||playerNoiseTimer>0)?1.62:.52;
   else if(arch.type==='gaze'){if(isPlayerLookingAtGhost(point)){speed=0;watchedCount++}else speed*=1.26}
   else if(arch.type==='light')speed*=(fieldKit.lightOn&&fieldKit.battery>0)?1.46:.48;
   else if(arch.type==='impostor'&&Math.abs(point.x)>4.4)speed*=1.38;
   else if(arch.type==='disruptor'){
    if(follower.doorCooldown<=0&&point.y<1){const openDoor=hospitalDoors.find(d=>d.open&&Math.hypot(point.x-d.side*4.32,point.z-d.z)<1.6&&Math.hypot(p.x-d.side*4.32,p.z-d.z)>1.3);if(openDoor){openDoor.open=false;follower.doorCooldown=7;roomToast(pursuitNames[follower.index]+'反手关上了'+openDoor.name+'的房门！')}}
    if(gap<4.5&&isExtreme())extremeState.stamina=Math.max(0,extremeState.stamina-dt*.45);
   }
   if(sedativePuddles.some(s=>s.active&&Math.abs(s.floor-point.y)<1.0&&Math.hypot(s.x-point.x,s.z-point.z)<2.2))speed*=.35;
  }
  movePursuer(follower,dt,speed);
 }
 if((follower.knockdown||0)<=0)ghost.rotation.y=Math.atan2(p.x-point.x,p.z-point.z);
 ghost.visible=true;
 if(!disguisedSafe&&(follower.knockdown||0)<=0&&follower.voice<=0&&pursuitVoiceCooldown<=0&&gap<25){playPursuitVoice(follower.index,gap);follower.voice=8+Math.random()*7;pursuitVoiceCooldown=2.5}
 if(!disguisedSafe&&(follower.knockdown||0)<=0&&bellState.freezeTimer<=0&&follower.stunned<=0&&follower.grace===0&&gap<1.05&&ghostSweptAllowed(point,{x:p.x,y:p.y||0,z:p.z},.12)){follower.contact+=dt;if(follower.contact>=2){catchByPursuer(follower.index);if(pursuitCaught)return}}else follower.contact=0}
$('chase').textContent=pursuingGhosts.length?'追逐中 · '+pursuingGhosts.length+'/'+pursuitTotal+' 个鬼'+(fallenCount?' · 💥被砸跌倒 '+fallenCount+'个':bellState.freezeTimer>0?' · 🔔铃响定身 '+Math.ceil(bellState.freezeTimer)+'s':stunnedCount?' · 镇静/眩晕 '+stunnedCount+'个':watchedCount?' · 👁视线定身 '+watchedCount+'个':activeSoundLure.active?' · 🔊声源诱饵生效中':invincible?' · 不死模式':pursuingGhosts.some(g=>g.contact>0)?' · 鬼已靠近，快拉开距离！':''):'';
// Keep only trail positions still needed by the slowest follower.
if(pursuitTrail.length>3000&&pursuingGhosts.length){const minimum=Math.min(...pursuingGhosts.map(g=>g.distance))-20;let cut=0;while(cut+1<pursuitTrail.length&&pursuitTrail[cut+1].d<minimum)cut++;if(cut)pursuitTrail.splice(0,cut)}}


// Peaceful residents & throwable patients (抱起整个人并丢出去，鬼跌倒2秒).
const wardPatients=[],patientWards=roomDefinitions.filter(r=>r.name.includes('病房')||r.name.includes('治疗'));
const residentSkin=new THREE.MeshStandardMaterial({color:0xb69d85,roughness:.92});
const residentClothes=[0x889e9a,0x9eaaac,0x909ba9].map(color=>new THREE.MeshStandardMaterial({color,roughness:.98}));
const residentTrim=new THREE.MeshStandardMaterial({color:0x647b80,roughness:.94});
function spawnThrowablePerson(x,y,z,rotY=0,room=null,slot=0){
 const model=new THREE.Group(),mesh=new THREE.Mesh(ghosts[slot%2===0?0:4].children[0].geometry,[residentSkin,residentClothes[Math.floor(Math.random()*residentClothes.length)],residentSkin,residentTrim]);model.add(mesh);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshStandardMaterial({color:slot%2?0x625f54:0x473e31,roughness:1}));hair.position.set(0,1.99,-.085);hair.scale.set(.126,.115,.105);model.add(hair);
 const height=.84+Math.random()*.10;model.scale.set(height*(slot%2?1.05:1),height,height);model.position.set(x,y,z);model.rotation.y=rotY;model.visible=true;model.userData.harmless=true;scene.add(model);model.traverse(o=>movingObjects.add(o));
 const entry={room,slot,model,baseScale:height,phase:Math.random()*6.28,held:false,flying:false,vx:0,vy:0,vz:0,floor:y,fallenTimer:0};
 wardPatients.push(entry);return entry;
}
for(const room of patientWards){room.patientRefreshIn=45+Math.random()*35;for(let slot=0;slot<2;slot++){
 spawnThrowablePerson(room.center+room.side*(slot===0?1.3:-1.3),0,room.z+1.05,slot===0?-.45:.55,room,slot);
}}
// Also place accessible patients along the main 1F corridor & 2F so the player can immediately grab and throw a person anytime!
spawnThrowablePerson(-2.2,0,-6.5,.4,null,0);
spawnThrowablePerson(2.3,0,-16.5,-.5,null,1);
spawnThrowablePerson(-2.1,0,-26.5,.3,null,0);
spawnThrowablePerson(2.1,4,-12.0,-.4,null,1);

let carriedPerson=null;
function nearbyPerson(maxDist=1.85){
 return wardPatients.find(n=>n.model.visible&&!n.held&&!n.flying&&Math.abs((n.floor||0)-(p.y||0))<1.2&&Math.hypot(p.x-n.model.position.x,p.z-n.model.position.z)<maxDist);
}
function pickUpPerson(){
 if(carriedPerson){roomToast('已经抱着一个人了 · 按 Q 把人丢出去！');return false}
 const person=nearbyPerson();if(!person)return false;
 if(carriedHead)throwCarriedHead();
 person.held=true;person.flying=false;person.fallenTimer=0;carriedPerson=person;
 camera.add(person.model);
 person.model.position.set(.28,-.65,-.82);
 person.model.rotation.set(.15,-.35,.78);
 roomToast('已抱起整个人！对准怨灵按 Q 把人丢出去（砸中怨灵会跌倒 2 秒）');
 return true;
}
function knockDownGhost(follower,duration=2.0){
 follower.knockdown=Math.max(follower.knockdown||0,duration);
 follower.stunned=Math.max(follower.stunned||0,duration);
 follower.contact=0;
}
function throwCarriedPerson(){
 if(!carriedPerson)return false;
 const person=carriedPerson,pos=new THREE.Vector3();
 person.model.getWorldPosition(pos);
 scene.add(person.model);
 person.model.position.set(p.x-Math.sin(yaw)*.55,(p.y||0)+.95,p.z-Math.cos(yaw)*.55);
 person.model.rotation.set(-.55,yaw,0);
 person.held=false;person.flying=true;person.floor=p.y||0;
 person.vx=-Math.sin(yaw)*6.8;person.vz=-Math.cos(yaw)*6.8;person.vy=2.1+Math.sin(pitch)*1.4;
 carriedPerson=null;
 emitPlayerNoise(3.0);
 let hitNames=[];
 for(const f of pursuingGhosts){
  const gp=ghosts[f.index].position;
  if(Math.abs(gp.y-person.floor)<1.3&&Math.hypot(gp.x-person.model.position.x,gp.z-person.model.position.z)<1.95){
   knockDownGhost(f,2.0);hitNames.push(pursuitNames[f.index]);
  }
 }
 if(hitNames.length)roomToast('💥 你把人猛砸出去，直接将【'+hitNames.join('、')+'】撞得跌倒在地 2 秒！');
 else roomToast('已把人猛力丢出去！');
 return true;
}
function patientNearPlayer(){return !!nearbyPerson(2.0)}
function updateWardPatients(dt,now){
 if(carriedPerson){
  carriedPerson.model.position.y=-.65+Math.sin(now*.003)*.012;
 }
 for(const n of wardPatients){
  if(n.held)continue;
  if(n.flying){
   n.vy-=9.8*dt;
   n.model.position.y+=n.vy*dt;
   n.model.rotation.x-=dt*4.2;
   const nx=n.model.position.x+n.vx*dt,nz=n.model.position.z+n.vz*dt;
   if(canWalk(nx,n.model.position.z))n.model.position.x=nx;else n.vx*=-.25;
   if(canWalk(n.model.position.x,nz))n.model.position.z=nz;else n.vz*=-.25;
   for(const f of pursuingGhosts){
    const gp=ghosts[f.index].position;
    if(Math.abs(gp.y-n.floor)<1.3&&Math.hypot(gp.x-n.model.position.x,gp.z-n.model.position.z)<1.75&&(f.knockdown||0)<=0){
     knockDownGhost(f,2.0);
     roomToast('💥 丢出去的人砸中【'+pursuitNames[f.index]+'】，鬼跌倒在地 2 秒！');
    }
   }
   for(const other of wardPatients){
    if(other!==n&&!other.held&&!other.flying&&other.model.visible&&Math.abs((other.floor||0)-n.floor)<1.2&&Math.hypot(other.model.position.x-n.model.position.x,other.model.position.z-n.model.position.z)<1.35&&other.fallenTimer<=0){
     other.model.rotation.set(-Math.PI/2,other.model.rotation.y,0);other.fallenTimer=2.5;
    }
   }
   if(n.model.position.y<=n.floor+.05){
    n.model.position.y=n.floor;n.flying=false;n.vx=0;n.vy=0;n.vz=0;
    n.model.rotation.set(-Math.PI/2,n.model.rotation.y,0);
    n.fallenTimer=3.5;
    triggerSoundLure(n.model.position.x,n.floor,n.model.position.z,5.0);
    let knocked=[];
    for(const f of pursuingGhosts){
     const gp=ghosts[f.index].position;
     if(Math.abs(gp.y-n.floor)<1.3&&Math.hypot(gp.x-n.model.position.x,gp.z-n.model.position.z)<2.35){
      knockDownGhost(f,2.0);knocked.push(pursuitNames[f.index]);
     }
    }
    if(knocked.length)roomToast('💥 丢出去的人重重砸倒了【'+knocked.join('、')+'】，鬼跌倒 2 秒无法行动！');
   }
   continue;
  }
  if(n.fallenTimer>0){
   n.fallenTimer=Math.max(0,n.fallenTimer-dt);
   if(n.fallenTimer===0)n.model.rotation.set(0,n.model.rotation.y,0);
  }
  if(!n.model.visible)continue;
  const breath=1+Math.sin(now*.0015+n.phase)*.0015;n.model.scale.y=n.baseScale*breath;
 }
}

function isExtreme(){return difficulty==='ultimate'||difficulty==='abyss'}function challengeLimit(){return difficulty==='abyss'?2:3}function staminaLimit(){return difficulty==='abyss'?4:6}function timeLimit(){return (difficulty==='abyss'?18:22)*60}
const extremeState={mistakes:0,elapsed:0,stamina:6,rest:0,gridSolved:false,grid:null,generatorBoost:false};
const challengeStatus=document.createElement('div');challengeStatus.style.cssText='position:absolute;left:30px;top:98px;font-size:12px;color:#c6b79e';$('hud').append(challengeStatus);
function extremeFailure(reason){if(invincible){roomToast('不死模式已阻止挑战失败');return}stopPursuitVoice();chasing=false;ghosts.forEach(g=>g.visible=false);modal('极限噩梦 · 挑战失败','<p>'+reason+'</p><p>本次挑战结束。重新开始会重置钥匙、机关和进度。</p>',()=>location.reload(),false,'挑战结束');}
function lockMistake(){extremeState.mistakes++;if(!invincible&&extremeState.mistakes>=challengeLimit()){extremeFailure('密码输入错误次数已达到本难度上限。');return}$('feedback').textContent='密码不匹配。剩余失误次数：'+(invincible?'不限':challengeLimit()-extremeState.mistakes)}
function stationInteraction(){if((p.y||0)>1)return false;const station=mazeStations.find(s=>Math.hypot(p.x-s.x,p.z-s.z)<1.9);if(!station||station.solved)return false;if(!isExtreme()){modal(station.name,'<p>旧巡检记录：每条岔路都通向医院的一部分。记住轮椅和柜子的位置，按 M 查看自己走过的路线。</p><p>附记：二楼器材整理室有一台备用发电机，启动后可稳压全院电路并为手电扩容。</p>',()=>{station.solved=true;fieldKit.sedatives=(fieldKit.sedatives||0)+1;roomToast('在控制室找到 1 瓶镇静剂');close()});return true}
 if(difficulty==='abyss'){abyssLock(station);return true}const west=station.id==='west';modal(station.name+' · 密码柜',west?'<p>三个数字，允许以零开头。以下每一行都准确描述该次试码：</p><p>682：仅一个数字正确，且位置正确。<br>614：仅一个数字正确，但位置错误。<br>206：仅两个数字正确，且位置都错误。<br>738：没有正确数字。<br>780：仅一个数字正确，但位置错误。</p>':'<p>四位数 ABCD，各位互不相同，且都不为零。</p><p>A 比 B 大 4；C 是 B 的三倍；D 比 A 小 3；四位数字之和为 23。</p><p>柜内有档案室钥匙。注意：全局只容许两次错误输入。</p>',()=>{const answer=$('answer').value.trim();if(answer===(west?'042':'7394')){station.solved=true;close();roomToast('密码柜已开启，按 E 取走钥匙')}else lockMistake()},true,'极限噩梦 / 逻辑锁');return true}
function abyssLock(station){const west=station.id==='west';const text=west?'<p>五位数 ABCDE，每位在 1–9 之间，且互不相同。</p><p>A+B=10；C=A−B；D=C+1；E=B+1；五位数字之和是26。</p><p>完整提交五位数。</p>':'<p>字母算式：<strong>SEND + MORE = MONEY</strong></p><p>每个字母代表一个数字，不同字母的数字不同；S 和 M 不为零。加法遵循十进制进位。</p><p>请依次输入 SEND 与 MORE，连成八位数字。例：如果 SEND=1234、MORE=5678，应输入12345678（这只是输入格式）。</p>';modal(station.name+' · 深渊逻辑锁',text,()=>{if($('answer').value.trim()===(west?'82673':'95671085')){station.solved=true;close();roomToast('逻辑锁已解除，按 E 拾取钥匙')}else lockMistake()},true,'深渊 / 逻辑锁')}
function toggleGridCell(board,n){const size=Math.sqrt(board.length),x=n%size,y=Math.floor(n/size);for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)board[yy*size+xx]^=1}}
function openFuseGrid(){const size=difficulty==='abyss'?6:5;if(!extremeState.grid){extremeState.grid=Array(size*size).fill(0);for(const n of (size===6?[0,3,5,8,11,13,16,19,21,24,27,29,32,35]:[0,2,6,9,12,17,20,23]))toggleGridCell(extremeState.grid,n)}modal('档案室 · '+size+'×'+size+'供电矩阵','<p>每次按下一个开关，它和上下左右的灯都会反转。将全部 '+(size*size)+' 盏灯熄灭，才能释放出口钥匙。</p>'+(extremeState.generatorBoost?'<p style="color:#8cd7a8">✓ 二楼备用发电机已联机稳压：可直接点击下方【发电机稳压破译】一键熄灭全矩阵！</p>':'<p>提示：前往二楼【器材整理室】启动备用发电机，可直接稳压破译此矩阵。</p>'),close,false,'极限噩梦 / 电路机关');$('modalAction').textContent='暂时离开';const host=$('modalInput');function draw(){host.innerHTML=(extremeState.generatorBoost?'<div style="text-align:center;margin:10px 0"><button id="genBypassBtn" style="background:#2e6f56;padding:10px 18px">⚡ 二楼备用发电机稳压破译（直接归零）</button></div>':'')+'<div style="display:grid;grid-template-columns:repeat('+size+',42px);gap:7px;justify-content:center;margin:20px">'+extremeState.grid.map((v,n)=>'<button data-fuse="'+n+'" aria-label="开关 '+(n+1)+'" style="height:42px;padding:0;border:1px solid #849483;background:'+(v?'#c8b466':'#17251e')+';color:'+(v?'#272b1e':'#bac6b1')+'">'+(n+1)+'</button>').join('')+'</div>';const bypass=$('genBypassBtn');if(bypass)bypass.onclick=()=>{extremeState.grid.fill(0);extremeState.gridSolved=true;close();roomToast('二楼发电机稳压完成，供电矩阵已解除！按 E 拾取出口钥匙')};host.querySelectorAll('[data-fuse]').forEach(b=>b.onclick=()=>{toggleGridCell(extremeState.grid,Number(b.dataset.fuse));if(extremeState.grid.every(v=>v===0)){extremeState.gridSolved=true;close();roomToast('供电矩阵已解除，按 E 拾取出口钥匙')}else draw()})}draw()}
function beginExtreme(){if(!isExtreme())return;extremeState.stamina=staminaLimit();for(const [id,stationId] of [['pharmacy','west'],['archive','east']]){const key=keyItems.find(k=>k.id===id),station=mazeStations.find(s=>s.id===stationId);key.x=station.x;key.z=station.z;key.model.position.set(key.x,1.08,key.z)}$('objective').textContent='钥匙被转移到两翼迷宫。找到控制站（或上二楼启动备用发电机），解除逻辑锁。';}
function updateExtreme(dt){if(!isExtreme())return;extremeState.elapsed+=dt;if(!invincible&&extremeState.elapsed>timeLimit()){extremeFailure('本次撤离的行动时间已经用尽。');return}const moving=keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright;if(keys.shift&&moving&&extremeState.stamina>0){extremeState.stamina=Math.max(0,extremeState.stamina-dt);extremeState.rest=0}else{extremeState.rest+=dt;if(extremeState.rest>2.5)extremeState.stamina=Math.min(staminaLimit(),extremeState.stamina+dt*(difficulty==='abyss'?.45:.65))}const remain=Math.max(0,Math.ceil(timeLimit()-extremeState.elapsed));challengeStatus.textContent=(difficulty==='abyss'?'深渊':'极限噩梦')+'　剩余 '+Math.floor(remain/60)+':'+String(remain%60).padStart(2,'0')+'　体力 '+Math.ceil(extremeState.stamina)+'/'+staminaLimit()+'　失误 '+extremeState.mistakes+'/'+challengeLimit()}

const fieldKit={lightOn:true,battery:100,spares:1,sedatives:1,generatorActive:false,hidden:false,bedDisguise:false,heartRate:76,hideLeft:0,hideCooldown:0};const caseNotes=new Map(),explorationItems=[];
const optionalRecords=[
 {x:8,z:-4,text:'观察记录：病房与走廊中的病患或落地人头均可按 E 拾取，按 Q 丢出去能直接把人或追逐的怨灵砸得跌倒 2 秒。'},
 {x:-8,z:-11,text:'值班交接：当仁安医院旧铃响到第 7 下时，千万不要回头或后退，保持镇定 5 秒可令怨灵退散。'},
 {x:11,z:-18,text:'治疗记录：盲眼药师与哭泣病童属于【听觉猎手】，静步慢走可躲避，奔跑或开门会引其暴走。'},
 {x:-11,z:-18,text:'旧巡检单：镜中女人与裂瓷面孔惧怕直视；而白瞳麻醉师与镜片医生具有趋光性，关闭手电(F)可大幅降低其移速。'}
];
for(let n=0;n<optionalRecords.length;n++){const r=optionalRecords[n],x=r.x,z=r.z+.6;box(x,.66,z,.72,.055,.54,metal);for(let dx of [-.29,.29])for(let dz of [-.2,.2])rod(x+dx,.1,z+dz,x+dx,.65,z+dz,.018,metal);const paper=new THREE.Mesh(new THREE.BoxGeometry(.24,.007,.31),mat(0xc0c4ae));paper.position.set(x,.70,z);paper.rotation.y=.16;scene.add(paper);paper.traverse(o=>movingObjects.add(o));explorationItems.push({id:'record'+n,type:'record',x,y:0,z,model:paper,text:r.text,taken:false});if(n<3){const battery=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.13,10),hardware);battery.rotation.z=Math.PI/2;battery.position.set(x+.23,.74,z);scene.add(battery);movingObjects.add(battery);explorationItems.push({id:'battery'+n,type:'battery',x:x+.23,y:0,z,model:battery,taken:false})}}
const kitStatus=document.createElement('div');kitStatus.style.cssText='position:absolute;right:26px;top:135px;color:#b2c6b6;font-size:12px;text-align:right;line-height:1.8;white-space:pre-line';$('hud').append(kitStatus);
function nearbySupply(){return explorationItems.find(n=>!n.taken&&Math.abs((n.y||0)-(p.y||0))<1.2&&Math.hypot(p.x-n.x,p.z-n.z)<1.5)}
function useSupply(){const item=nearbySupply();if(!item)return false;item.taken=true;item.model.visible=false;if(item.type==='battery'){fieldKit.spares++;roomToast('找到备用电池 · 按 R 更换');queueFright('battery',3)}else if(item.type==='sedative'){fieldKit.sedatives=(fieldKit.sedatives||0)+1;roomToast('已拾取 镇静剂药瓶（当前 '+fieldKit.sedatives+' 瓶）· 按 Q 抛投砸晕或减速怨灵')}else{caseNotes.set(item.id,item.text);roomToast('已收录诊疗记录 · 按 J 阅读');queueFright(item.id,caseNotes.size%7)}return true}
function shelterKind(){
 if((p.y||0)>3.5){
  for(const r of upperRooms){
   if(Math.sign(p.x)===r.side&&Math.abs(p.x)>5){
    if(r.name==='住院观察室'&&Math.hypot(p.x-r.center,p.z-(r.z-1.1))<2.1)return 'bed';
    if(Math.hypot(p.x-(r.center+r.side*1.8),p.z-(r.z+1.8))<2.1)return 'cabinet';
   }
  }
  return null;
 }
 if(Math.abs(p.x-(-2.9))<1.6&&[-7,-21].some(z=>Math.abs(p.z-z)<1.6))return 'bed';
 for(const r of roomDefinitions){
  if(Math.sign(p.x)===r.side&&Math.abs(p.x)>5){
   if((r.name.includes('病房')||r.name.includes('治疗'))&&Math.hypot(p.x-r.center,p.z-(r.z-1.1))<2.1)return 'bed';
   if(Math.hypot(p.x-(r.center+r.side*1.7),p.z-(r.z+1.9))<2.1)return 'cabinet';
  }
 }
 return null;
}
function shelterNear(){return !!shelterKind()}
function stopHiding(){fieldKit.hidden=false;fieldKit.bedDisguise=false;fieldKit.hideCooldown=8}
function showJournal(){const texts=[...caseNotes.values()];const archGuide='<hr style="border:0;border-top:1px solid #3c5246;margin:12px 0"><p><strong>【怨灵四大感知图鉴】</strong><br>· 听觉猎手（哭泣病童/盲眼药师等）：静步慢走时迟缓，奔跑或开门会高速暴走。<br>· 视线敏感（镜中女人/裂瓷面孔等）：正视她时定身，背对时疾速逼近。<br>· 光源趋光（白瞳麻醉师/镜片医生等）：开手电时加速，按 F 关手电可使其减速迷失。<br>· 封路干扰（无面院长/冷柜管理员等）：途经房门会反手关门，近身散发寒气。</p>';modal('调查笔记 · '+texts.length+' 条记录','<p>钥匙：'+([...inventory].map(k=>keyNames[k]).join('、')||'暂无')+'　|　镇静剂：'+(fieldKit.sedatives||0)+' 瓶</p>'+texts.map((s,n)=>'<p>'+(n+1)+'. '+s+'</p>').join('')+archGuide+'<p>E 抱起病人/捡人头 · Q 丢人/丢人头(砸倒鬼或人2秒) / 抛药瓶 · F 手电 · R 换电池 · H 病床伪装 · M 地图</p>',close,false,'随身记录')}
document.addEventListener('keydown',e=>{if(!playing||paused)return;const target=e.target;if(target?.matches?.('input,textarea,select'))return;const key=e.key.toLowerCase();if(key===' '&&fieldKit.hidden&&fieldKit.bedDisguise){e.preventDefault();fieldKit.heartRate=Math.max(62,fieldKit.heartRate-16);roomToast('深呼吸平稳心率… 当前 '+Math.round(fieldKit.heartRate)+' BPM');return}if(e.repeat)return;switch(key){case 'f':fieldKit.lightOn=!fieldKit.lightOn;roomToast(fieldKit.lightOn?'已打开手电（趋光型怨灵会加速）':'已关闭手电（趋光型怨灵已减速）');break;case 'r':if(fieldKit.spares>0){fieldKit.spares--;fieldKit.battery=100;roomToast('手电电池已更换')}else roomToast('没有备用电池，留意一二楼诊疗台');break;case 'h':if(fieldKit.hidden){stopHiding();roomToast('已离开藏身/伪装状态')}else if(fieldKit.hideCooldown>0)roomToast('稍等 '+Math.ceil(fieldKit.hideCooldown)+' 秒后可再次藏身');else{const kind=shelterKind();if(kind){fieldKit.hidden=true;fieldKit.bedDisguise=kind==='bed';fieldKit.heartRate=78;fieldKit.hideLeft=difficulty==='abyss'?8:isExtreme()?10:15;roomToast(kind==='bed'?'已躺在病床上伪装成病患 · 鬼靠近时连按【空格键】压低心率':'已躲入柜旁阴影，按 H 或移动离开')}else roomToast('靠近房内病床（可伪装病患）或柜子再按 H')}break;case 'j':showJournal();break}});
function updateFieldKit(dt){fieldKit.hideCooldown=Math.max(0,fieldKit.hideCooldown-dt);if(difficulty!=='peaceful'&&fieldKit.lightOn){const drain=(difficulty==='abyss'?.30:.16)*(fieldKit.generatorActive?.45:1);fieldKit.battery=Math.max(0,fieldKit.battery-dt*drain)}if(fieldKit.hidden){fieldKit.hideLeft-=dt;if(fieldKit.bedDisguise){const nearGhost=pursuingGhosts.some(f=>Math.abs(ghosts[f.index].position.y-(p.y||0))<1.2&&Math.hypot(ghosts[f.index].position.x-p.x,ghosts[f.index].position.z-p.z)<8.5);fieldKit.heartRate=THREE.MathUtils.clamp(fieldKit.heartRate+(nearGhost?24:-6)*dt,64,145);if(fieldKit.heartRate>=138){stopHiding();roomToast('⚠️ 心跳过速（>135 BPM）暴露了你的伪装！');scare(0)}}if(keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright||fieldKit.hideLeft<=0)stopHiding()}kitStatus.textContent=(fieldKit.hidden?(fieldKit.bedDisguise?'🛏 病床伪装 '+Math.ceil(fieldKit.hideLeft)+'s (心率 '+Math.round(fieldKit.heartRate)+' BPM · 空格平复)':'藏身中 '+Math.ceil(fieldKit.hideLeft)+'秒'):carriedPerson?'🧍 正抱着病患（按 Q 丢出去砸倒鬼/人 2 秒）':carriedHead?'💀 正拿着人头（按 Q 丢出去砸倒人/鬼 2 秒）':'')+'　手电 '+(difficulty==='peaceful'?'无限':Math.ceil(fieldKit.battery)+'%')+' · 电池 '+fieldKit.spares+' · 镇静剂 '+(fieldKit.sedatives||0)+'\nE 抱人/捡人头 · Q 丢人/丢人头/抛药瓶 · F 手电 · H 伪装'}
// Unavoidable story scares are spaced out; they never cause damage and are disabled in peaceful mode.
const frightState={seen:new Set(),queue:[],since:0,total:0,ambient:0};
function queueFright(id,ghost){if(!jumpScaresEnabled||difficulty==='peaceful'||frightState.seen.has(id))return;frightState.seen.add(id);frightState.queue.push(ghost%7)}
function updateStoryFrights(dt){if(!jumpScaresEnabled||difficulty==='peaceful'||!pursuitEnabled)return;frightState.since+=dt;frightState.total+=dt;frightState.ambient+=dt;for(const r of roomDefinitions)if(Math.sign(p.x)===r.side&&Math.abs(p.x)>5&&Math.abs(p.z-r.z)<2.8)queueFright('enter:'+r.name,Math.round(-r.z/7)%7);const mazeMilestone=Math.floor(visitedMazeCells.size/10);if(mazeMilestone>0)queueFright('maze:'+mazeMilestone,mazeMilestone%7);if(frightState.ambient>(pursuingGhosts.length?Math.max(7,20-pursuingGhosts.length*1.5):(difficulty==='abyss'?55:90))){frightState.ambient=0;queueFright('ambient:'+Math.floor(frightState.total/50),Math.floor(frightState.total/50)%7)}if(frightState.total<45||fieldKit.hidden||!frightState.queue.length||frightState.since<(pursuingGhosts.length?Math.max(6,18-pursuingGhosts.length*1.5):(difficulty==='abyss'?18:30)))return;const id=frightState.queue.shift();scare(id);frightState.since=0}

const roomStoryScenes=[];
function ordinaryClinicalPerson(template,coat){const g=new THREE.Group(),skin=new THREE.MeshStandardMaterial({color:0xa59178,roughness:.93}),cloth=new THREE.MeshStandardMaterial({color:coat,roughness:.96}),mesh=new THREE.Mesh(ghosts[template].children[0].geometry,[skin,cloth,skin,mat(0x485950)]);g.add(mesh);g.scale.setScalar(.9);g.userData.harmless=true;scene.add(g);g.traverse(o=>movingObjects.add(o));return g}
function clinicalCurtain(x,z){const group=new THREE.Group(),fabric=new THREE.MeshStandardMaterial({color:0x607c70,roughness:.98,side:THREE.DoubleSide,transparent:true,opacity:.92});const geo=new THREE.PlaneGeometry(1.7,2.05,28,4),pos=geo.attributes.position;for(let n=0;n<pos.count;n++)pos.setZ(n,Math.sin(pos.getX(n)*32)*.045);geo.computeVertexNormals();const sheet=new THREE.Mesh(geo,fabric);sheet.position.set(.4,1.5,0);group.add(sheet);for(const dx of [-.55,1.35]){let post=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,2.65,8),hardware);post.position.set(dx,1.325,0);group.add(post)}let rail=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.9,8),hardware);rail.rotation.z=Math.PI/2;rail.position.set(.4,2.65,0);group.add(rail);group.position.set(x,0,z);scene.add(group);return group}
const clinicalSceneDefinitions=[
 {title:'旧日期检查单',intro:'医生正在检查病人，暂时没有理会你。',note:'异常现象：医生填写的检查单仍使用 1998 年的封锁日期。'},
 {title:'空病床的生命体征',intro:'医生正对着空病床填写完整检查记录。',note:'异常现象：床上空无一人，医生却记录了完整的心率、体温和血压。'},
 {title:'隔帘后的检查',intro:'隔帘后有人低声询问病情。',note:'异常现象：隔帘后的患者始终没有回答，医生却不停记录“患者已应答”。'},
 {title:'等待门口的病人',intro:'病人背对房门站着，医生在一旁记录。',note:'异常现象：病人脖子缓缓扭向门口盯着你，身体却完全不动。'},
 {title:'矛盾的监护仪',intro:'医生正在核对监护仪和病人状态。',note:'异常现象：病人仍站立受检，监护屏却显示“记录中断：1998年已离院”。'},
 {title:'帘后空位',intro:'医生请你不要靠近隔帘后的病床。',note:'异常现象：隔帘后原先有人影，走近再看时却凭空消失只剩空位。'},
 {title:'两份相反的病历',intro:'两名医生正在核对同一位病人的检查单。',note:'异常现象：两名医生的记录分别写着“今日入院”和“1998年封存”。'},
 {title:'改变的封锁牌',intro:'这间房门内挂着一块巡检牌。',note:'异常现象：墙上巡检牌自动变成了“第七病区：1998年封锁”。'}
];
function clinicalNotice(x,z,title,body){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshStandardMaterial({map:texture,roughness:.88});const board=new THREE.Mesh(new THREE.BoxGeometry(1.05,.52,.025),material);board.position.set(x,1.55,z);scene.add(board);movingObjects.add(board);function write(heading,line){const c=canvas.getContext('2d');c.fillStyle='#b6bfaa';c.fillRect(0,0,768,384);c.strokeStyle='#3b5548';c.lineWidth=10;c.strokeRect(12,12,744,360);c.fillStyle='#233c30';c.textAlign='center';c.font='36px sans-serif';c.fillText(heading,384,145);c.font='25px sans-serif';c.fillText(line,384,245);texture.needsUpdate=true}write(title,body);return {board,write}}
function triggerRoomScene(door,forcedMode=null){if(door.storyChecked)return;if(difficulty!=='inspection'&&roomStoryScenes.filter(s=>!s.finished).length>=2)return;door.storyChecked=true;
 const room=roomDefinitions.find(r=>r.side===door.side&&r.z===door.z),center=room.center;
 if(difficulty==='inspection'){
  const isAnom=door.isAnomaly;
  const mode=isAnom?door.anomalyMode:0;
  const doctor=ordinaryClinicalPerson(3,0xa4b5a8);doctor.position.set(center-.65,0,room.z+.15);doctor.rotation.y=Math.PI/2;
  let patient=null;if(!isAnom||mode!==1){patient=ordinaryClinicalPerson(0,0x839ba2);patient.position.set(center+.12,0,room.z+.15);patient.rotation.y=(isAnom&&mode===3)?Math.PI:-Math.PI/2;patient.scale.multiplyScalar(.94)}
  const chart=new THREE.Mesh(new THREE.BoxGeometry(.018,.20,.15),mat(0xb7bda7));chart.position.set(.30,1.22,.12);doctor.add(chart);
  const curtain=(isAnom&&[2,5].includes(mode))?clinicalCurtain(center,room.z+.65):null;
  const notice=clinicalNotice(center+.85,room.z-.10,isAnom?clinicalSceneDefinitions[mode].title:'常规夜班查房','仁安医院 / 第七病区');
  const secondDoctor=(isAnom&&mode===6)?ordinaryClinicalPerson(3,0x657f73):null;
  if(secondDoctor){secondDoctor.position.set(center+.9,0,room.z-.15);secondDoctor.rotation.y=-Math.PI/2}
  const state={room,door,doctor,patient,curtain,extras:[notice.board],notice,secondDoctor,mode,isAnomaly:isAnom,time:0,revealed:false,finished:false};
  roomStoryScenes.push(state);for(const resident of wardPatients)if(resident.room===room)resident.model.visible=false;room.patientRefreshIn=600;
  roomToast('已进入【'+room.name+'】· 请走近观察医生、病床与巡检牌，再回门口按 E 挂牌');
  return;
 }
 if(forcedMode===null&&Math.random()>.72)return;const mode=forcedMode!==null?forcedMode:difficulty==='peaceful'?0:Math.floor(Math.random()*clinicalSceneDefinitions.length),definition=clinicalSceneDefinitions[mode];const doctor=ordinaryClinicalPerson(3,0xa4b5a8);doctor.position.set(center-.65,0,room.z+.15);doctor.rotation.y=Math.PI/2;let patient=null;if(mode!==1){patient=ordinaryClinicalPerson(0,0x839ba2);patient.position.set(center+.12,0,room.z+.15);patient.rotation.y=mode===3?Math.PI:-Math.PI/2;patient.scale.multiplyScalar(.94)}const chart=new THREE.Mesh(new THREE.BoxGeometry(.018,.20,.15),mat(0xb7bda7));chart.position.set(.30,1.22,.12);doctor.add(chart);const curtain=[2,5].includes(mode)?clinicalCurtain(center,room.z+.65):null,extras=[];let notice=null,secondDoctor=null;
 if([4,6,7].includes(mode)){notice=clinicalNotice(center+.85,room.z-.10,mode===4?'ECG · 记录正常':mode===6?'病历核对':'今日巡检','仁安医院 / 第七病区');extras.push(notice.board)}
 if(mode===6){secondDoctor=ordinaryClinicalPerson(3,0x657f73);secondDoctor.position.set(center+.9,0,room.z-.15);secondDoctor.rotation.y=-Math.PI/2;extras.push(secondDoctor)}
 const state={room,doctor,patient,curtain,extras,notice,secondDoctor,mode,isAnomaly:true,time:0,revealed:false,finished:false};roomStoryScenes.push(state);for(const resident of wardPatients)if(resident.room===room)resident.model.visible=false;room.patientRefreshIn=120;roomToast(difficulty==='peaceful'?'正在进行常规检查，病人不会攻击。':definition.intro)
}
function updateRoomStories(dt,now){for(const s of roomStoryScenes){if(s.finished)continue;s.time+=dt;const nearby=(p.y||0)<1&&Math.hypot(p.x-s.room.center,p.z-s.room.z)<5;s.doctor.rotation.z=Math.sin(now*.0018)*.012;if(s.patient)s.patient.scale.y=.846*(1+Math.sin(now*.0014)*.0015);if(difficulty==='peaceful')continue;
 const revealDelay=difficulty==='inspection'?2.5:10;
 if(s.time>revealDelay&&!s.revealed&&nearby){s.revealed=true;
  if(difficulty==='inspection'&&!s.isAnomaly){
   const okText='【'+s.room.name+'】查房核对：患者心率 72 BPM，血氧 98%，登记日期与床位完全正常。';
   caseNotes.set('inspect:'+s.room.name,okText);roomToast(okText);
   if(s.notice)s.notice.write('心率 72 · 血氧 98%','今日常规查房 · 体征正常');
  }else{
   const text=clinicalSceneDefinitions[s.mode].note;caseNotes.set('medical-scene:'+s.room.name,'【'+s.room.name+'】'+text);roomToast(text);
   if(s.notice)s.notice.write(s.mode===4?'记录中断 · 已离院':s.mode===6?'今日入院 / 1998年封存':'1998 · 第七病区封锁',clinicalSceneDefinitions[s.mode].title);
   queueFright('clinical-scene:'+s.room.name,s.mode%7);
  }
 }
 if(s.revealed&&s.isAnomaly&&s.mode===3&&s.patient){const desired=Math.atan2(p.x-s.patient.position.x,p.z-s.patient.position.z);s.patient.rotation.y=THREE.MathUtils.damp(s.patient.rotation.y,desired,.7,dt)}
 if(s.revealed&&s.isAnomaly&&s.mode===5&&s.time>(difficulty==='inspection'?5:18)&&s.patient)s.patient.visible=false;
 if(difficulty!=='inspection'&&s.revealed&&s.time>28&&!nearby){s.doctor.visible=false;if(s.secondDoctor)s.secondDoctor.visible=false;s.finished=true}
}}

// Horror-only ceiling events & tactical head throwing (人头也可丢出去砸人或砸鬼跌倒2秒).
const fallingHeads=[];let headEventTimer=55+Math.random()*25,headEventAge=0;
const headSource=closedCharacters[0],headIndices=headSource.idx[0],headGeometry=new THREE.BufferGeometry(),headRemap=new Map(),headVertices=[],headNormals=[],headUVs=[],compactHeadIndices=[];for(const oldIndex of headIndices){if(!headRemap.has(oldIndex)){headRemap.set(oldIndex,headRemap.size);headVertices.push(...headSource.p.slice(oldIndex*3,oldIndex*3+3));headNormals.push(...headSource.n.slice(oldIndex*3,oldIndex*3+3));headUVs.push(...headSource.uv.slice(oldIndex*2,oldIndex*2+2))}compactHeadIndices.push(headRemap.get(oldIndex))}headGeometry.setAttribute('position',new THREE.Float32BufferAttribute(headVertices,3));headGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(headNormals,3));headGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(headUVs,2));headGeometry.setIndex(compactHeadIndices);headGeometry.computeBoundingBox();const headBounds=headGeometry.boundingBox,headCenter=headBounds.getCenter(new THREE.Vector3());headGeometry.translate(-headCenter.x,-headCenter.y,-headCenter.z);headGeometry.computeBoundingSphere();
const bloodCanvas=document.createElement('canvas');bloodCanvas.width=bloodCanvas.height=128;const bc=bloodCanvas.getContext('2d');bc.clearRect(0,0,128,128);bc.fillStyle='#421312';bc.beginPath();for(let n=0;n<40;n++){const a=n/40*Math.PI*2,r=36+Math.sin(n*2.3)*9;const x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;if(!n)bc.moveTo(x,y);else bc.lineTo(x,y)}bc.closePath();bc.fill();for(let n=0;n<18;n++){bc.beginPath();bc.ellipse(15+(n*37)%100,15+(n*53)%100,1+n%3,1+n%2,0,0,Math.PI*2);bc.fill()}const bloodTexture=new THREE.CanvasTexture(bloodCanvas);bloodTexture.colorSpace=THREE.SRGBColorSpace;
for(let n=0;n<3;n++){const group=new THREE.Group(),head=new THREE.Mesh(headGeometry,ghosts[n].children[0].material[0]);group.add(head);const cut=new THREE.Mesh(new THREE.CylinderGeometry(.055,.045,.009,16),new THREE.MeshStandardMaterial({color:0x4b1716,roughness:.9}));cut.position.y=-.13;group.add(cut);group.visible=false;scene.add(group);group.traverse(o=>movingObjects.add(o));const stainMaterial=new THREE.MeshStandardMaterial({map:bloodTexture,transparent:true,opacity:.8,roughness:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const stain=new THREE.Mesh(new THREE.PlaneGeometry(.65,.65),stainMaterial);stain.rotation.x=-Math.PI/2;stain.visible=false;scene.add(stain);movingObjects.add(stain);fallingHeads.push({group,head,stain,stainMaterial,active:false,vy:0,vx:0,vz:0,time:0,landed:false,floor:0,thrownByPlayer:false})}
// Pre-place one landed head in the corridor so the player can immediately pick up and throw it
(function initStarterHead(){const item=fallingHeads[0];item.active=true;item.landed=true;item.floor=0;item.time=0;item.group.position.set(1.65,.17,-4.8);item.group.rotation.set(.2,.8,.9);item.group.visible=true;item.stain.position.set(1.65,.015,-4.8);item.stain.visible=true})();
function spawnCeilingHead(){if(difficulty==='peaceful'||((p.y||0)>.2&&(p.y||0)<3.8))return;const item=fallingHeads.find(h=>!h.active);if(!item)return;let spot=null;for(let n=0;n<8;n++){const distance=1.0+Math.random()*1.8,angle=yaw+(Math.random()-.5)*.9,x=p.x-Math.sin(angle)*distance,z=p.z-Math.cos(angle)*distance;if(canWalk(x,z)){spot={x,z};break}}if(!spot)return;item.active=true;item.time=0;item.landed=false;item.thrownByPlayer=false;item.floor=p.y||0;item.vy=-.3;item.vx=(Math.random()-.5)*.35;item.vz=(Math.random()-.5)*.35;item.group.position.set(spot.x,item.floor+3.05,spot.z);item.group.rotation.set(.2,Math.random()*6.28,.1);item.head.material=ghosts[Math.floor(Math.random()*ghosts.length)].children[0].material[0];item.group.visible=true;item.stain.visible=false;item.stainMaterial.opacity=.8}
function checkHeadHitTargets(hx,hy,hz,radius=1.65){
 let hitGhostNames=[],hitPersonCount=0;
 for(const f of pursuingGhosts){
  const gPos=ghosts[f.index].position;
  if(Math.abs(gPos.y-hy)<1.3&&Math.hypot(gPos.x-hx,gPos.z-hz)<radius&&(f.knockdown||0)<=0){
   knockDownGhost(f,2.0);hitGhostNames.push(pursuitNames[f.index]);
  }
 }
 for(const n of wardPatients){
  if(!n.held&&!n.flying&&n.model.visible&&Math.abs((n.floor||0)-hy)<1.3&&Math.hypot(n.model.position.x-hx,n.model.position.z-hz)<radius&&n.fallenTimer<=0){
   n.model.rotation.set(-Math.PI/2,n.model.rotation.y,0);n.fallenTimer=2.5;hitPersonCount++;
  }
 }
 for(const s of roomStoryScenes){
  if(s.finished||hy>1)continue;
  for(const actor of [s.doctor,s.patient,s.secondDoctor]){
   if(actor&&actor.visible&&Math.hypot(actor.position.x-hx,actor.position.z-hz)<radius){
    actor.rotation.x=-Math.PI/2;setTimeout(()=>{if(actor)actor.rotation.x=0},2000);hitPersonCount++;
   }
  }
 }
 return {hitGhostNames,hitPersonCount};
}
function updateCeilingHeads(dt){if(difficulty==='peaceful')return;headEventAge+=dt;headEventTimer-=dt;if(headEventAge>32&&headEventTimer<=0&&!fieldKit.hidden&&!chasing){spawnCeilingHead();headEventTimer=(difficulty==='abyss'?22:35)+Math.random()*30}for(const item of fallingHeads){if(!item.active||item.held)continue;item.time+=dt;item.vy-=9.5*dt;item.group.position.y+=item.vy*dt;if(canWalk(item.group.position.x+item.vx*dt,item.group.position.z))item.group.position.x+=item.vx*dt;else item.vx=0;if(canWalk(item.group.position.x,item.group.position.z+item.vz*dt))item.group.position.z+=item.vz*dt;else item.vz=0;
 if(item.thrownByPlayer&&!item.landed){
  const midHit=checkHeadHitTargets(item.group.position.x,item.floor,item.group.position.z,1.55);
  if(midHit.hitGhostNames.length)roomToast('🎯 丢出的人头直接砸翻【'+midHit.hitGhostNames.join('、')+'】，鬼跌倒 2 秒！');
  else if(midHit.hitPersonCount>0)roomToast('🎯 丢出的人头砸倒了面前的病患/医生（跌倒 2 秒）！');
 }
 if(item.group.position.y<item.floor+.17){item.group.position.y=item.floor+.17;if(!item.landed){item.landed=true;item.vy=.85;item.stain.position.set(item.group.position.x,item.floor+.015,item.group.position.z);item.stain.visible=true;
 if(item.thrownByPlayer){
  triggerSoundLure(item.group.position.x,item.floor,item.group.position.z,6.5);
  const landHit=checkHeadHitTargets(item.group.position.x,item.floor,item.group.position.z,1.85);
  if(landHit.hitGhostNames.length)roomToast('🎯 人头砸中【'+landHit.hitGhostNames.join('、')+'】！鬼跌倒 2 秒并制造声源诱饵！');
  else if(landHit.hitPersonCount>0)roomToast('🎯 人头砸倒了旁边的人（跌倒 2 秒），并发出声响吸引附近怨灵！');
  else roomToast('🔊 抛出的人头落地发出巨响，已吸引附近怨灵前往查看（可再次按 E 捡起）');
 }else roomToast('天花板传来一声闷响（可按 E 捡起人头丢出去砸人或砸鬼）。');
}else item.vy=0;item.vx*=.9;item.vz*=.9}if(!item.landed){item.group.rotation.x+=dt*2.5;item.group.rotation.z+=dt*.8}else item.group.rotation.z=THREE.MathUtils.damp(item.group.rotation.z,.9,4,dt);if(!item.thrownByPlayer&&item.time>18){item.group.visible=false;item.stainMaterial.opacity=Math.max(0,.8-(item.time-18)*.06)}if(!item.thrownByPlayer&&item.time>32){item.active=false;item.group.visible=false;item.stain.visible=false}}}

let carriedHead=null;const headCarryDecals=[];
function nearbyCeilingHead(maxDistance=1.65){return fallingHeads.find(h=>h.active&&h.landed&&!h.held&&Math.abs(h.floor-(p.y||0))<.5&&Math.hypot(p.x-h.group.position.x,p.z-h.group.position.z)<maxDistance)}
function pickUpCeilingHead(maxDistance=1.65){if(carriedHead){roomToast('手里已经拿着人头 · 按 Q 抛出砸人/砸鬼');return false}const item=nearbyCeilingHead(maxDistance);if(!item)return false;if(carriedPerson)throwCarriedPerson();if(item.stain.visible){const stain=item.stain.clone();stain.material=item.stainMaterial.clone();scene.add(stain);headCarryDecals.push({mesh:stain,time:0});if(headCarryDecals.length>6){const old=headCarryDecals.shift();scene.remove(old.mesh);old.mesh.material.dispose()}}item.stain.visible=false;item.held=true;carriedHead=item;item.time=0;camera.add(item.group);item.group.position.set(.32,-.28,-.64);item.group.rotation.set(.08,-.12,.12);roomToast('已捡起人头 · 按 Q 丢出去砸人或砸倒怨灵（2秒）');return true}
function throwCarriedHead(){if(!carriedHead)return false;const item=carriedHead,position=new THREE.Vector3(),quaternion=new THREE.Quaternion();item.group.getWorldPosition(position);item.group.getWorldQuaternion(quaternion);scene.add(item.group);item.group.position.copy(position);item.group.quaternion.copy(quaternion);item.held=false;item.landed=false;item.thrownByPlayer=true;item.time=0;item.floor=p.y||0;item.vx=-Math.sin(yaw)*5.8;item.vz=-Math.cos(yaw)*5.8;item.vy=1.8+Math.sin(pitch)*1.5;item.active=true;item.group.visible=true;item.stainMaterial.opacity=.8;carriedHead=null;
 const instantHit=checkHeadHitTargets(p.x-Math.sin(yaw)*.8,item.floor,p.z-Math.cos(yaw)*.8,1.65);
 if(instantHit.hitGhostNames.length)roomToast('🎯 贴脸丢出人头，直接把【'+instantHit.hitGhostNames.join('、')+'】砸得跌倒 2 秒！');
 else if(instantHit.hitPersonCount>0)roomToast('🎯 你把人头丢出去砸倒了面前的人！');
 else roomToast('已把人头丢出去！');
 return true}
function updateHeadCarry(dt,now){if(carriedHead){carriedHead.group.position.y=-.28+Math.sin(now*.002)*.004}for(let n=headCarryDecals.length-1;n>=0;n--){const d=headCarryDecals[n];d.time+=dt;if(d.time>8)d.mesh.material.opacity=Math.max(0,.8-(d.time-8)*.08);if(d.time>19){scene.remove(d.mesh);d.mesh.material.dispose();headCarryDecals.splice(n,1)}}}
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='q'&&playing&&!paused&&!e.repeat){e.preventDefault();if(!throwCarriedPerson()&&!throwCarriedHead())throwSedativeBottle()}});

// Batch static geometry by material and corridor section to reduce draw calls.
scene.updateMatrixWorld(true);const staticBatches=new Map(),originalMeshes=[];const characterObjects=new Set();ghosts.forEach(g=>g.traverse(o=>characterObjects.add(o)));
scene.traverse(o=>{if(!o.isMesh||characterObjects.has(o)||movingObjects.has(o)||Array.isArray(o.material))return;const geom=o.geometry;if(!geom.attributes.position)return;const world=new THREE.Vector3();o.getWorldPosition(world);const key=o.material.uuid+':'+Math.floor(world.z/14);if(!staticBatches.has(key))staticBatches.set(key,{material:o.material,items:[]});staticBatches.get(key).items.push(o);originalMeshes.push(o)});
for(const batch of staticBatches.values()){let vertexCount=0,indexCount=0;for(const o of batch.items){vertexCount+=o.geometry.attributes.position.count;indexCount+=o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count}const positions=new Float32Array(vertexCount*3),normals=new Float32Array(vertexCount*3),uvs=new Float32Array(vertexCount*2),indices=new Uint32Array(indexCount);let vertexOffset=0,indexOffset=0;for(const o of batch.items){const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const pa=geo.attributes.position,na=geo.attributes.normal,uv=geo.attributes.uv;positions.set(pa.array,vertexOffset*3);if(na)normals.set(na.array,vertexOffset*3);if(uv)uvs.set(uv.array,vertexOffset*2);const count=geo.index?geo.index.count:pa.count;for(let k=0;k<count;k++)indices[indexOffset++]=(geo.index?geo.index.getX(k):k)+vertexOffset;vertexOffset+=pa.count;geo.dispose()}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geo.setIndex(new THREE.BufferAttribute(indices,1));geo.computeBoundingSphere();scene.add(new THREE.Mesh(geo,batch.material))}for(const o of originalMeshes)o.removeFromParent();

// ============================================================================
// NEW GAMEPLAY SYSTEMS (Created after static batching so dynamic meshes stay interactive)
// ============================================================================

// 1. Tactical Sedative Bottles & Puddles (镇静剂药瓶拾取与抛投)
const sedativeProjectiles=[],sedativePuddles=[];
const sedativeGlassMat=new THREE.MeshStandardMaterial({color:0x43b581,emissive:0x113826,roughness:.25,metalness:.2,transparent:true,opacity:.88});
for(let i=0;i<medicalStations.length;i++){
 const st=medicalStations[i];
 const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.15,12),sedativeGlassMat);
 bottle.position.set(st.x+.32,.87,st.z+.12);
 scene.add(bottle);movingObjects.add(bottle);
 explorationItems.push({id:'sedative-1f-'+i,type:'sedative',x:st.x+.32,y:0,z:st.z+.12,model:bottle,taken:false});
}
function throwSedativeBottle(){
 if((fieldKit.sedatives||0)<=0){roomToast('手里没有抱着人或人头，也没有镇静剂了（可靠近病患或人头按 E 拾取，或在诊疗车拾取药瓶）');return false}
 fieldKit.sedatives--;
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.15,12),sedativeGlassMat);
 mesh.position.set(p.x-Math.sin(yaw)*.45,(p.y||0)+1.35,p.z-Math.cos(yaw)*.45);
 scene.add(mesh);
 sedativeProjectiles.push({mesh,floor:p.y||0,vx:-Math.sin(yaw)*5.2,vz:-Math.cos(yaw)*5.2,vy:1.6+Math.sin(pitch)*1.8,time:0});
 roomToast('已抛出镇静剂药瓶！（剩余 '+fieldKit.sedatives+' 瓶）');
 return true;
}
function updateSedativeProjectiles(dt){
 for(let i=sedativeProjectiles.length-1;i>=0;i--){
  const b=sedativeProjectiles[i];b.time+=dt;b.vy-=9.8*dt;
  b.mesh.position.y+=b.vy*dt;b.mesh.rotation.x+=dt*5;b.mesh.rotation.z+=dt*3;
  if(canWalk(b.mesh.position.x+b.vx*dt,b.mesh.position.z))b.mesh.position.x+=b.vx*dt;else b.vx*=-.3;
  if(canWalk(b.mesh.position.x,b.mesh.position.z+b.vz*dt))b.mesh.position.z+=b.vz*dt;else b.vz*=-.3;
  if(b.mesh.position.y<=b.floor+.08||b.time>3){
   const lx=b.mesh.position.x,lz=b.mesh.position.z,ly=b.floor;
   scene.remove(b.mesh);sedativeProjectiles.splice(i,1);
   const puddleMat=new THREE.MeshBasicMaterial({color:0x3ca374,transparent:true,opacity:.58,depthWrite:false});
   const puddle=new THREE.Mesh(new THREE.CircleGeometry(1.85,24),puddleMat);
   puddle.rotation.x=-Math.PI/2;puddle.position.set(lx,ly+.02,lz);scene.add(puddle);
   sedativePuddles.push({mesh:puddle,mat:puddleMat,x:lx,z:lz,floor:ly,time:8.5,active:true});
   triggerSoundLure(lx,ly,lz,4.5);
   let hitCount=0;
   for(const f of pursuingGhosts){
    const gp=ghosts[f.index].position;
    if(Math.abs(gp.y-ly)<1.2&&Math.hypot(gp.x-lx,gp.z-lz)<1.85){f.stunned=Math.max(f.stunned||0,4.5);hitCount++}
   }
   roomToast(hitCount?'🧪 镇静剂碎裂！直接麻痹 '+hitCount+' 名怨灵 4.5 秒，并形成 8 秒减速药雾区！':'🧪 镇静剂碎裂！形成 8 秒强效减速药雾区并吸引附近怨灵！');
  }
 }
 for(let i=sedativePuddles.length-1;i>=0;i--){
  const pd=sedativePuddles[i];pd.time-=dt;
  if(pd.time<2)pd.mat.opacity=Math.max(0,pd.time/2*.58);
  if(pd.time<=0){pd.active=false;scene.remove(pd.mesh);pd.mat.dispose();sedativePuddles.splice(i,1)}
 }
}

// 2. Second Floor (2F) Deep Activation: ECG Tuning Station, Backup Generator, 2F Bed & Supplies
const upperStations=[
 {id:'ecg',name:'二楼心电调频台（心电检查室）',x:8,y:4,z:-8,solved:false},
 {id:'generator',name:'二楼备用发电机（器材整理室）',x:-8,y:4,z:-22,solved:false}
];
(function buildUpperFloorProps(){
 // 2F 病历阅览室 (-8, 4, -8): Desk, Confidential Note & Battery
 box(-8,4.45,-8,1.2,.9,.7,metal);
 const note2f=new THREE.Mesh(new THREE.BoxGeometry(.28,.01,.36),mat(0xd4d2b8));note2f.position.set(-8,4.92,-8);scene.add(note2f);
 explorationItems.push({id:'record-2f-archive',type:'record',x:-8,y:4,z:-8,model:note2f,text:'二楼阅览室密档：64号目击者当晚在二楼心电检查室接受监测，其静息心率锁定在【64】BPM。将二楼心电调频台调至 64 BPM 可开启应急镇静剂柜并释放全院电磁脉冲。',taken:false});
 const bat2f=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.14,10),hardware);bat2f.rotation.z=Math.PI/2;bat2f.position.set(-7.7,4.93,-8);scene.add(bat2f);
 explorationItems.push({id:'battery-2f-1',type:'battery',x:-7.7,y:4,z:-8,model:bat2f,taken:false});

 // 2F 心电检查室 (8, 4, -8): Interactive ECG Tuning Monitor
 box(8,4.55,-8,1.1,1.1,.65,ivory);
 const ecgCanvas=document.createElement('canvas');ecgCanvas.width=512;ecgCanvas.height=256;const ecx=ecgCanvas.getContext('2d');
 ecx.fillStyle='#051a14';ecx.fillRect(0,0,512,256);ecx.strokeStyle='#39c288';ecx.lineWidth=3;ecx.beginPath();
 for(let n=0;n<512;n++){const q=n%110,y=130+(q<70?Math.sin(n*.2)*4:q<76?-18:q<82?45:q<88?-35:0);if(!n)ecx.moveTo(n,y);else ecx.lineTo(n,y)}ecx.stroke();
 ecx.fillStyle='#8ef0c0';ecx.font='24px sans-serif';ecx.fillText('2F ECG TUNER · 调频待命 [按 E]',24,42);
 const ecgTex=new THREE.CanvasTexture(ecgCanvas);ecgTex.colorSpace=THREE.SRGBColorSpace;
 box(8,5.35,-8,.95,.55,.08,new THREE.MeshBasicMaterial({map:ecgTex}));

 // 2F 器材整理室 (-8, 4, -22): Backup Generator
 box(-8,4.6,-22,1.35,1.2,.85,mat(0x3d5447));box(-8,5.28,-22,.9,.18,.5,red);
 const sed2f=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.15,12),sedativeGlassMat);sed2f.position.set(-7.2,4.45,-21.4);scene.add(sed2f);
 explorationItems.push({id:'sedative-2f-1',type:'sedative',x:-7.2,y:4,z:-21.4,model:sed2f,taken:false});

 // 2F 住院观察室 (8, 4, -22): Ward Bed for Bed Disguise & Sedative Bottle
 const bed2f=furniture('old_bed_frame',8,-23.1,1.45,Math.PI/2);bed2f.position.y=4;
 const sed2f2=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.15,12),sedativeGlassMat);sed2f2.position.set(9.4,4.85,-20.3);scene.add(sed2f2);
 explorationItems.push({id:'sedative-2f-2',type:'sedative',x:9.4,y:4,z:-20.3,model:sed2f2,taken:false});
})();
function nearbyUpperStation(){if((p.y||0)<3.5)return null;return upperStations.find(s=>!s.solved&&Math.hypot(p.x-s.x,p.z-s.z)<2.1)}
function useUpperStation(){
 const st=nearbyUpperStation();if(!st)return false;
 if(st.id==='generator'){
  modal('二楼器材整理室 · 备用发电机','<p>你找到了仁安医院的应急柴油发电机。</p><p>拉下合闸手柄后：</p><p>1. 手电筒立即充满至 100%，且后续耗电速度减半；<br>2. 获得 1 节备用电池与 1 瓶镇静剂；<br>3. 若处于极限噩梦/深渊难度，将直接稳压联机一楼档案室的供电矩阵（可一键归零破译）。</p>',()=>{
   st.solved=true;fieldKit.generatorActive=true;fieldKit.battery=100;fieldKit.spares++;fieldKit.sedatives=(fieldKit.sedatives||0)+1;extremeState.generatorBoost=true;
   emitPlayerNoise(3.0);close();roomToast('⚡ 二楼备用发电机已启动！手电续航翻倍，一楼档案室电路已获稳压支援！');
  },false,'二楼工程区 / 电力联动');
  return true;
 }
 if(st.id==='ecg'){
  modal('二楼心电检查室 · 生命体征调频台','<p>监护仪连接着二级应急药柜与走廊脉冲发生器。</p><p>屏幕提示：<strong>请输入 1998 年失踪目击者（妹妹）的病历编号 / 静息心率（BPM）以完成谐振解锁：</strong></p><p class="small">（线索可在二楼左侧【病历阅览室】密档或一楼档案室中查到，两位数）</p>',()=>{
   const val=$('answer').value.trim();
   if(val==='64'){
    st.solved=true;fieldKit.sedatives=(fieldKit.sedatives||0)+2;fieldKit.spares++;
    inventory.add('nurse');inventory.add('pharmacy');
    inventoryLabel.textContent='钥匙串：'+[...inventory].map(k=>keyNames[k]).join(' · ');
    bellState.freezeTimer=Math.max(bellState.freezeTimer,10);
    close();roomToast('✓ 心电调频 64 BPM 谐振成功！获得 2 瓶镇静剂、护士站/药房通行权限，并释放 10 秒定身脉冲！');
   }else $('feedback').textContent='谐振频率不匹配（提示：十位比个位大2、数字之和为10的两位数）。';
  },true,'二楼心电检查室 / 调频机关');
  return true;
 }
 return false;
}

// 3. "Seventh Bell Rule" (“第七次铃响”规则博弈系统)
let bellAudioCtx=null;
function playHospitalBell(isSeventh=false){
 try{
  if(!bellAudioCtx)bellAudioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(bellAudioCtx.state==='suspended')bellAudioCtx.resume();
  const now=bellAudioCtx.currentTime;
  const freqs=isSeventh?[392,784,1188,1568]:[523.25,1046.5,1580];
  freqs.forEach((f,idx)=>{
   const osc=bellAudioCtx.createOscillator(),gain=bellAudioCtx.createGain();
   osc.type=idx%2?'triangle':'sine';
   osc.frequency.setValueAtTime(f,now);
   gain.gain.setValueAtTime((isSeventh?.18:.11)/(idx+1),now);
   gain.gain.exponentialRampToValueAtTime(.0008,now+(isSeventh?3.6:2.1));
   osc.connect(gain);gain.connect(bellAudioCtx.destination);
   osc.start(now);osc.stop(now+(isSeventh?3.7:2.2));
  });
 }catch(_){}
}
const bellState={count:0,timer:24,activeSeventh:false,seventhLeft:0,refYaw:0,refX:0,refZ:0,freezeTimer:0};
const bellBanner=document.createElement('div');
bellBanner.style.cssText='position:absolute;top:24px;left:50%;transform:translateX(-50%);padding:8px 18px;background:#160808dd;border:1px solid #a93f3b;color:#f0d6d2;font-size:14px;letter-spacing:.12em;display:none;z-index:12;text-align:center;box-shadow:0 6px 24px #000a';
$('hud').append(bellBanner);
function shortestAngleDiff(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b))}
function updateBellRule(dt){
 if(difficulty==='peaceful'||!playing||paused){bellBanner.style.display='none';return}
 if(bellState.freezeTimer>0)bellState.freezeTimer=Math.max(0,bellState.freezeTimer-dt);
 if(bellState.activeSeventh){
  bellState.seventhLeft-=dt;
  const turnAngle=Math.abs(shortestAngleDiff(yaw,bellState.refYaw));
  const backStep=(p.x-bellState.refX)*Math.sin(bellState.refYaw)+(p.z-bellState.refZ)*Math.cos(bellState.refYaw);
  bellBanner.style.display='block';
  bellBanner.style.background='#4a0d0dee';
  bellBanner.textContent='🔔 第七次铃响！切勿回头或后退 · 保持镇定 '+Math.max(0,bellState.seventhLeft).toFixed(1)+' 秒（视角偏移 '+Math.round(turnAngle*180/Math.PI)+'°/115°）';
  if(turnAngle>2.0||backStep>.42||keys.s||keys.arrowdown){
   bellState.activeSeventh=false;bellState.timer=25;
   if(!pursuingGhosts.length)unlockPursuer(pursuitUnlockOrder[0]);
   const f=pursuingGhosts[0];
   if(f){
    const ambush=clearGhostPoint({x:p.x-Math.sin(yaw)*1.5,y:p.y||0,z:p.z-Math.cos(yaw)*1.5},f.radius);
    if(ambush)ghosts[f.index].position.set(ambush.x,ambush.y,ambush.z);
    f.grace=1.2;
   }
   scare(5);
   roomToast('❌ 你打破了“第七次铃响不回头”的禁忌！怨灵瞬间闪现逼近！');
  }else if(bellState.seventhLeft<=0){
   bellState.activeSeventh=false;bellState.timer=26;bellState.freezeTimer=8.5;
   fieldKit.battery=Math.min(100,fieldKit.battery+25);
   roomToast('✓ 你守住了第七次铃响禁忌！所有追逐怨灵被铃音定身 8.5 秒，手电电量 +25%！');
  }
  return;
 }
 bellState.timer-=dt;
 if(bellState.count>0&&bellState.timer>18){
  bellBanner.style.display='block';
  bellBanner.style.background='#0a1613cc';
  bellBanner.textContent='🔔 仁安医院旧铃计数：第 '+bellState.count+' / 7 次';
 }else bellBanner.style.display='none';
 if(bellState.timer<=0){
  bellState.count=(bellState.count%7)+1;
  const isSeventh=bellState.count===7;
  playHospitalBell(isSeventh);
  if(isSeventh){
   bellState.activeSeventh=true;bellState.seventhLeft=5.0;bellState.refYaw=yaw;bellState.refX=p.x;bellState.refZ=p.z;
   roomToast('🔔 当——第七次铃响！5 秒内千万不要回头或后退！');
  }else{
   bellState.timer=(difficulty==='abyss'?16:21)+Math.random()*5;
   roomToast('🔔 走廊深处传来第 '+bellState.count+' / 7 次旧铃声……');
  }
 }
}

// 4. "1998 Night Shift Inspection Mode" (「1998 夜班巡检」独立挂牌玩法模式)
const inspectionState={completed:0,mistakes:0,total:8};
function beginInspectionMode(){
 inventory.add('nurse');inventory.add('pharmacy');inventory.add('archive');
 inventoryLabel.textContent='巡检权限：全病房通行证已激活';
 inspectionState.completed=0;inspectionState.mistakes=0;
 const indices=[0,1,2,3,4,5,6,7];
 for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]]}
 const anomalySet=new Set(indices.slice(0,5));
 hospitalDoors.forEach((d,idx)=>{
  d.isAnomaly=anomalySet.has(idx);
  d.anomalyMode=idx%clinicalSceneDefinitions.length;
  d.inspectionJudged=false;
  const plaqueCanvas=document.createElement('canvas');plaqueCanvas.width=256;plaqueCanvas.height=96;
  const pTex=new THREE.CanvasTexture(plaqueCanvas);pTex.colorSpace=THREE.SRGBColorSpace;
  const pMat=new THREE.MeshBasicMaterial({map:pTex});
  const pMesh=new THREE.Mesh(new THREE.BoxGeometry(.03,.24,.58),pMat);
  pMesh.position.set(d.side*4.26,1.48,d.z+(d.side===1?.95:-.95));
  scene.add(pMesh);
  d.updatePlaque=(statusText,bgColor)=>{
   const c=plaqueCanvas.getContext('2d');c.fillStyle=bgColor;c.fillRect(0,0,256,96);
   c.strokeStyle='#d5dfd3';c.lineWidth=4;c.strokeRect(4,4,248,88);
   c.fillStyle='#ffffff';c.font='bold 24px sans-serif';c.textAlign='center';
   c.fillText(statusText,128,56);pTex.needsUpdate=true;
  };
  d.updatePlaque('待巡检 [按E]','#2c3e35');
 });
 $('chapter').textContent='1998 夜班巡检 / 0/8 病房';
 $('objective').textContent='逐一开门进入 8 间病房观察体征与病历，在房门口按 E 挂牌【巡检正常】或【1998异常封锁】';
}
function openInspectionPlaqueModal(door){
 modal('1998 夜班巡检挂牌 · '+door.name,'<p>你正在对【<strong>'+door.name+'</strong>】进行夜班巡检登记。</p><p>请根据房内医患表现、监护仪数据及检查单日期，选择要悬挂的巡检牌：</p><div style="display:flex;gap:14px;margin-top:18px;flex-wrap:wrap"><button id="judgeNormalBtn" style="background:#2d6a4f;padding:12px 20px">✓ 挂牌：【巡检正常 · 常规查房】</button><button id="judgeAnomalyBtn" style="background:#9e2a2b;padding:12px 20px">⚠️ 挂牌：【1998 异常封锁 · 立即隔离】</button></div>',close,false,'夜班巡检 / WARD INSPECTION');
 $('modalAction').textContent='再观察一下';
 setTimeout(()=>{
  const btnNorm=$('judgeNormalBtn'),btnAnom=$('judgeAnomalyBtn');
  if(btnNorm)btnNorm.onclick=()=>submitInspectionJudgment(door,false);
  if(btnAnom)btnAnom.onclick=()=>submitInspectionJudgment(door,true);
 },30);
}
function submitInspectionJudgment(door,choseAnomaly){
 door.inspectionJudged=true;close();
 const correct=(choseAnomaly===!!door.isAnomaly);
 if(correct){
  inspectionState.completed++;
  door.open=false;
  door.updatePlaque(choseAnomaly?'1998 异常封锁':'巡检正常','#1f5c3e');
  if(inspectionState.completed%2===0)fieldKit.sedatives=(fieldKit.sedatives||0)+1;
  $('chapter').textContent='1998 夜班巡检 / '+inspectionState.completed+'/8 病房';
  roomToast('✓ 【'+door.name+'】挂牌判定正确！（已完成 '+inspectionState.completed+'/8，失误 '+inspectionState.mistakes+'）');
  if(inspectionState.completed+inspectionState.mistakes>=8){
   finishInspectionMode();
  }
 }else{
  inspectionState.mistakes++;
  door.updatePlaque('判定失误 · 怨灵暴走','#7a1c1c');
  const spawnIdx=pursuitUnlockOrder[encounterIndex%pursuitTotal];
  unlockPursuer(spawnIdx,{x:door.center,y:0,z:door.z});
  scare(spawnIdx%7);
  $('chapter').textContent='1998 夜班巡检 / '+inspectionState.completed+'/8 病房（失误 '+inspectionState.mistakes+'）';
  roomToast('❌ 【'+door.name+'】挂牌判断失误！房内的伪装者苏醒并开始追逐你！');
  if(inspectionState.completed+inspectionState.mistakes>=8){
   setTimeout(()=>finishInspectionMode(),1200);
  }
 }
}
function finishInspectionMode(){
 pursuitEnabled=false;chasing=false;stopPursuitVoice();ghosts.forEach(g=>g.visible=false);
 modal('1998 夜班巡检报告 · 黎明交接','<p>你完成了仁安医院一楼全部 8 间病房的夜班核查：</p><p>· 准确封锁与鉴别病房：<strong>'+inspectionState.completed+' / 8 间</strong><br>· 巡检误判次数：<strong>'+inspectionState.mistakes+' 次</strong></p><p>'+(inspectionState.mistakes===0?'你以零失误完美识破了所有 1998 年残留的时间异象，在第七次铃响前锁好了每一扇异常房门，平安迎来黎明。':'你在怨灵的追击下完成了全部巡检记录，带着1998年的异常档案冲出了第七病区。')+'</p>',()=>location.reload(),false,'巡检结局 / INSPECTION COMPLETE');
}

let fpsWindowStart=performance.now(),fpsFrames=0;function updatePerformance(now){fpsFrames++;if(now-fpsWindowStart>2400){const fps=fpsFrames*1000/(now-fpsWindowStart);if(fps<42&&renderScale>.72){renderScale=Math.max(.72,renderScale*.88);renderer.setPixelRatio(renderScale);renderer.setSize(innerWidth,innerHeight)}fpsWindowStart=now;fpsFrames=0}const center=-4+Math.round((camera.position.z+4)/7)*7;for(let n=0;n<corridorLights.length;n++){corridorLights[n].position.y=3+(p.y||0);corridorLights[n].position.x=Math.abs(camera.position.x)>12?camera.position.x:0;corridorLights[n].position.z=center+(n-2)*7;corridorLights[n].intensity=bellState.activeSeventh?6+Math.sin(now*.04)*5:(fieldKit.generatorActive?22:17)}}
let difficulty='normal',stage=0,playing=false,paused=false,yaw=0,keys={},p={x:0,y:0,z:2},last=performance.now(),triggered=new Set(),chasing=false,chasePos=0,chaseTime=0;const points=[-4,-11,-25,-31];const storyLocations=[[-8,-4],[8,-11],[-8,-25],[0,-31]];const objectives=['前往护士站，查找停电前的记录（或上二楼探索心电与发电机）','前往药房，破解药柜密码','前往档案室，还原病人编号','逃离第七病区，抵达走廊尽头'];function hud(){if(stage>=1)caseNotes.set('story-nurse','火灾记录：1998年11月7日，院方锁住了第七病区。药柜密码使用月和日。');if(stage>=2)caseNotes.set('story-recorder','录音线索：院长修改过病人名单，妹妹的线索留在档案室。');if(stage>=3)caseNotes.set('story-witness','64号病历：妹妹是目击者。证据需要带出医院。');$('chapter').textContent='索命诡院 / 0'+(stage+1);$('objective').textContent=objectives[stage]||'黎明之前';}function modal(title,text,action,input=false,kicker='档案 / RECORD') {paused=true;stopPursuitVoice();document.exitPointerLock?.();$('modalKicker').textContent=kicker;$('modalTitle').textContent=title;$('modalText').innerHTML=text;$('modalInput').innerHTML=input?'<div class="row"><input id="answer" autocomplete="off" placeholder="输入答案，按确认" /></div>':'';$('feedback').textContent='';$('modal').classList.remove('hidden');$('modalAction').textContent=input?'确认':'继续';$('modalAction').onclick=action;if(input)setTimeout(()=>$('answer').focus(),80)}function close(){ $('modal').classList.add('hidden');paused=false;last=performance.now() }function scare(i,forcedImage=null){if(freeCamera.enabled||!jumpScaresEnabled||paused||difficulty==='peaceful')return;const scareKey=(forcedImage&&scareImageKeys.includes(forcedImage))?forcedImage:nextScareImage();let el=$('jumpscare');const assets=window.imageAssets||(typeof imageAssets!=='undefined'?imageAssets:null);const scareUrl=(assets&&assets[scareKey])||(assets&&assets['ghost-0.jpg'])||'';if(scareUrl)el.querySelector('.face').style.backgroundImage="url('"+scareUrl+"')";el.style.display='flex';playJumpScream(scareVoiceByImage[scareKey]??null);setTimeout(()=>el.style.display='none',650)}function puzzle(){if(stage===3&&!inventory.has('exit')){roomToast('出口上锁：必须取得出口钥匙并解除机关');return}if(stage===0)modal('护士站 · 最后的值班记录','<p>“火灾发生在 1998 年 11 月 7 日。院长锁住了七楼病区，把病人留在里面。”</p><p>妹妹的笔迹：<em>药柜密码是火灾日期的月、日，连成四位数。</em></p><p>走廊深处传来病床轮子拖行的声音……</p>',()=>{stage=1;hud();close()});else if(stage===1)modal('药房 · 生锈的密码锁','<p>锁上刻着：<strong>月 / 日</strong>。护士站的记录提到了火灾日期。</p>'+(difficulty==='easy'?'<p>提示：11 月 7 日写作四位数。</p>':''),()=>{if($('answer').value.trim()==='1107'){stage=2;hud();modal('药柜打开','<p>一支录音笔：“第七号病人不是我妹妹。院长修改了名单，把她藏在了档案里。”</p><p>走廊里的脚步声突然停了。</p>',close);setTimeout(()=>scare(3),900)}else if(isExtreme())lockMistake();else $('feedback').textContent='密码错误。再想想护士站记录。'},true);else if(stage===2)modal('档案室 · 七张病历','<p>病历上有四条线索：</p><p>① 妹妹的编号是两位数，十位比个位大 2。<br>② 两位数字之和是 10。<br>③ 这个数能被 4 整除。<br>④ 档案按从小到大排列。</p>'+(difficulty==='easy'?'<p>提示：先列出数字之和为 10 的两位数。</p>':''),()=>{if($('answer').value.trim()==='64'){stage=3;hud();modal('病历 64','<p>“她不是病人，她是目击者。”妹妹当年发现院长人为锁门，引发了这场悲剧。</p><p>录音继续：“证据在出口。带它出去，让他们的名字重见天日。”</p><p>身后的脚步开始加快。<strong>跑！</strong></p>',()=>{close();startFinalPursuit()});}else if(isExtreme())lockMistake();else $('feedback').textContent='编号不对。检查四条线索。'},true);else if(stage===3){pursuitEnabled=false;chasing=false;stopPursuitVoice();ghosts.forEach(g=>g.visible=false);modal('天亮了','<p>你带着录音和病历冲出医院。身后的追逐声在门外戛然而止。</p><p>证据让七名遇难者的名字重见天日。新闻播出的那一晚，你收到一条没有号码的语音：</p><p>“谢谢你……但第七次铃，还没有响。”</p><p>— 完 —</p>',()=>location.reload(),false,'结局 / END');}}
const originalIntro=$('intro').innerHTML;function updateIntro(){$('intro').innerHTML=$('difficulty').value==='peaceful'?'在安静的医院里自由走走。<br>没有鬼、突脸、追逐和惊吓音效。<br>可以按照自己的节奏探索一楼、二楼与两翼。':$('difficulty').value==='inspection'?'【1998 夜班巡检新模式】：你持有全院通行证，需逐一核查一楼 8 间病房。<br>观察医患行为、监护仪与检查单是否出现 1998 年异常，在门口按 E 挂牌判定。<br>误判将直接唤醒房内怨灵！可按 E 抱起病患或捡起人头，按 Q 丢出去砸人或砸倒怨灵 2 秒。':$('difficulty').value==='abyss'?'深渊：更难的逻辑锁与 6×6 电路矩阵（可上二楼启动备用发电机稳压破译）。<br>18 分钟行动时间；第二次密码错误或被抓即重开。<br>包含抱人/丢人头投掷（砸中跌倒2秒）、第七次铃响规则与 26 鬼差异化感知。':$('difficulty').value==='ultimate'?'两翼迷宫中的控制站藏着药房和档案室钥匙（二楼发电机与心电调频台可提供支援）。<br>22 分钟行动时间；三次密码错误或追逐失败将重开。<br>M 查看走过的路线；E 抱起病人或捡起人头 / Q 丢出去砸倒怨灵或人。':originalIntro} $('difficulty').addEventListener('change',updateIntro);updateIntro();$('begin').onclick=()=>{difficulty=$('difficulty').value;$('start').classList.add('hidden');$('hud').style.display='block';playing=true;beginExtreme();if(difficulty==='peaceful'){ghosts.forEach(g=>g.visible=false);scene.background.set(0x454c43);scene.fog=new THREE.FogExp2(0x454c43,.018);scene.add(new THREE.HemisphereLight(0xe0e8df,0x667360,.65));scene.traverse(o=>{if(o.isMesh && o.material===red)o.visible=false});$('chapter').textContent='安心探索 / 仁安医院';$('objective').textContent='找到接待台上的钥匙，自由探索一楼、二楼与东西两翼';$('hint').textContent='慢慢逛逛，随时按 ESC 暂停';return}if(difficulty==='inspection'){beginInspectionMode();modal('1998 夜班巡检 · 值班须知','<p>今晚你负责核查一楼的 <strong>8 间病房与科室</strong>。你已配备全院通行证与 1 瓶镇静剂。</p><p>1. 推门进入房间，走近观察医生、患者与墙上告示牌；<br>2. 回到房门口按 <strong>E</strong> 选择悬挂<strong>【巡检正常】</strong>或<strong>【1998 异常封锁】</strong>牌；<br>3. 靠近病患或地上的人头按 <strong>E</strong> 可<strong>抱起整个人或捡起人头</strong>，按 <strong>Q</strong> 丢出去可直接把人或追逐的鬼<strong>砸得跌倒 2 秒</strong>！</p>',close,false,'夜班巡检 / BRIEFING');return}hud();modal('仁安医院 · 入口','<p>妹妹在调查医院旧案时失踪，只留下一盘录音。她的声音断断续续：“先去护士站……如果听见第七次铃响，千万不要回头。”</p><p>提示：靠近病患或人头按 <strong>E</strong> 可<strong>抱起整个人或捡起人头</strong>，按 <strong>Q</strong> 丢出去能把人或怨灵<strong>砸得跌倒 2 秒</strong>！二楼还设有心电调频台与备用发电机。</p>',close)};document.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e'&&playing&&!paused&&!e.repeat){if(!useRoom()&&difficulty!=='peaceful'&&difficulty!=='inspection'&&(p.y||0)<1&&Math.hypot(p.x-storyLocations[stage][0],p.z-storyLocations[stage][1])<2.1)puzzle()}if(e.key==='Escape'&&playing&&!paused)modal('暂停','<p>故事会从当前位置继续。</p>',close)});document.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);let pitch=0;
function movementRelativeToView(heading,pressed){let forward=(pressed.w||pressed.arrowup?1:0)-(pressed.s||pressed.arrowdown?1:0),side=(pressed.d||pressed.arrowright?1:0)-(pressed.a||pressed.arrowleft?1:0);const length=Math.hypot(forward,side);if(length>1){forward/=length;side/=length}return {x:-Math.sin(heading)*forward+Math.cos(heading)*side,z:-Math.cos(heading)*forward-Math.sin(heading)*side}}

// macOS two-finger trackpad scrolling turns the view without a button or pointer lock.
function trackpadViewDelta(deltaX,deltaY,mode=0){const units=mode===1?16:mode===2?160:1;return {yaw:-THREE.MathUtils.clamp(deltaX*units,-120,120)*.0035,pitch:-THREE.MathUtils.clamp(deltaY*units,-120,120)*.0035}}
window.addEventListener('wheel',event=>{if(!playing||paused)return;if(event.target?.closest?.('input,textarea,select'))return;event.preventDefault();if(event.ctrlKey)return;const delta=trackpadViewDelta(event.deltaX,event.deltaY,event.deltaMode);yaw+=delta.yaw;pitch=THREE.MathUtils.clamp(pitch+delta.pitch,-1.1,1.1)},{passive:false});
canvas.onclick=null;document.exitPointerLock?.();
window.addEventListener('blur',()=>{keys={}});camera.rotation.order='YXZ';
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});function tick(now){requestAnimationFrame(tick);let dt=Math.min((now-last)/1000,.05);last=now;freeCameraButton.style.display=playing?'block':'none';if(playing&&!paused&&freeCamera.enabled){updateFreeCamera(dt);updatePerformance(now);renderer.render(scene,camera);return}if(playing&&!paused){updateExtreme(dt);if(paused)return;updateFieldKit(dt);updateBellRule(dt);updateSedativeProjectiles(dt);const isSprinting=keys.shift&&(!isExtreme()||extremeState.stamina>0);const speed=(isSprinting?5.2:2.7)*dt,movement=movementRelativeToView(yaw,keys);if(isSprinting&&(movement.x||movement.z))emitPlayerNoise(.6);let nx=p.x+movement.x*speed,nz=p.z+movement.z*speed;if(canWalk(nx,p.z))p.x=nx;if(canWalk(p.x,nz))p.z=nz;p.y=resolveFloorHeight(p.x,p.z,p.y||0);animateRooms(dt);updateRoomStories(dt,now);updateCeilingHeads(dt);updateHeadCarry(dt,now);updateMazeMap();updateWardPatients(dt,now);updateEncounters(dt);updateStoryFrights(dt);$('hint').textContent=roomHint();camera.position.set(p.x,(p.y||0)+(fieldKit.hidden?(fieldKit.bedDisguise?.76:.85):1.65),p.z);camera.rotation.set(pitch,yaw,0);flash.intensity=fieldKit.lightOn&&(difficulty==='peaceful'||fieldKit.battery>0)?(difficulty==='peaceful'?26:24+Math.sin(now*.017)*2):0}updatePerformance(now);renderer.render(scene,camera)}requestAnimationFrame(tick);

$('inspectModel').onclick=()=>{wardPatients.forEach(n=>n.model.visible=false);difficulty='peaceful';playing=false;$('start').classList.add('hidden');$('hud').style.display='block';$('chapter').textContent='静态模型查看 · 26鬼感知图鉴';const modelPicker=document.createElement('select');modelPicker.style.cssText='position:absolute;top:224px;right:26px;z-index:20';names.forEach((name,i)=>{const arch=getGhostArchetype(i);const option=document.createElement('option');option.value=String(i);option.textContent=(i+1)+'. '+name+' 【'+arch.tag+'】';modelPicker.append(option)});document.body.append(modelPicker);modelPicker.onchange=()=>{const idx=Number(modelPicker.value),arch=getGhostArchetype(idx);ghosts.forEach((g,i)=>g.visible=i===idx);$('hint').textContent=names[idx]+' · 【'+arch.tag+'】'+arch.desc};$('objective').textContent='下拉菜单选择 26 个角色查看其专属感知机制 · W/S 前后 · A/D 横移 · ←/→ 转向 · ESC 返回';$('hint').textContent=names[0]+' · 【'+getGhostArchetype(0).tag+'】'+getGhostArchetype(0).desc;ghosts.forEach((g,i)=>{g.visible=i===0;g.position.set(0,0,-1);g.rotation.set(0,.32,0)});camera.position.set(0,1.7,1.2);camera.rotation.set(0,0,0);scene.add(new THREE.HemisphereLight(0xd5dfd2,0x6b7263,.9));flash.intensity=8;const fill=new THREE.PointLight(0xffffff,6,8);fill.position.set(-1,2,1);scene.add(fill);let viewYaw=0;document.addEventListener('keydown',e=>{if(/^[1-9]$/.test(e.key)){const idx=Number(e.key)-1;modelPicker.value=String(idx);modelPicker.onchange()}});function preview(){if(playing)return;let speed=.022;if(keys.w)camera.position.z-=speed;if(keys.s)camera.position.z+=speed;if(keys.a)camera.position.x-=speed;if(keys.d)camera.position.x+=speed;if(keys.arrowleft)viewYaw+=.018;if(keys.arrowright)viewYaw-=.018;camera.rotation.y=viewYaw;if(keys.escape){location.reload();return}requestAnimationFrame(preview)}requestAnimationFrame(preview)};
