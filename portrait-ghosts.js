// Closed humanoids with individual portrait textures, proportions, garments and medical accessories.
var portraitGhostDefinitions=window.portraitGhostDefinitions=window.portraitGhostDefinitions||[
{name:'裂瓷面孔',face:'scare-cracked-porcelain.jpg',body:5,scale:[.88,1.10,.86],waist:.88,shoulders:.92,cloth:0x98998c,skin:0x999c8b,style:'gown',voice:9},
{name:'镜片医生',face:'scare-glass-doctor.jpg',body:3,scale:[.94,1.04,.95],waist:1.02,shoulders:1.08,cloth:0xa4aa9b,skin:0x93947d,style:'coat',voice:10},
{name:'湿发病患',face:'scare-wet-patient.jpg',body:1,scale:[.92,1.02,.93],waist:.90,shoulders:1.0,cloth:0x657d7a,skin:0x748880,style:'patient',voice:11},
{name:'逆笑清洁工',face:'scare-crooked-orderly.jpg',body:4,scale:[1.08,.96,1.05],waist:1.03,shoulders:1.12,cloth:0x4c6559,skin:0x93907c,style:'work',voice:12},
{name:'暗影值班员',face:'scare-shadow-attendant.jpg',body:6,scale:[.87,1.17,.90],waist:.87,shoulders:.95,cloth:0x303c39,skin:0x73776b,style:'uniform',voice:13},
{name:'皱面病患',face:'scare-wrinkled-patient.jpg',body:4,scale:[.94,.91,.96],waist:.95,shoulders:.90,cloth:0x8b8974,skin:0x95927b,style:'patient',voice:4},
{name:'黑眼护士',face:'scare-black-eyed-nurse.jpg',body:0,scale:[.90,1.03,.91],waist:.91,shoulders:.94,cloth:0x9ca99d,skin:0x959e8d,style:'nurse',voice:1},
{name:'绷带窥视者',face:'scare-bandaged-watcher.jpg',body:6,scale:[1.01,1.07,1.02],waist:1.03,shoulders:1.05,cloth:0x99937c,skin:0x8f907a,style:'wrapped',voice:9},
{name:'倒影女人',face:'scare-reflection-woman.jpg',body:5,scale:[.85,1.09,.88],waist:.89,shoulders:.90,cloth:0x465750,skin:0x87978d,style:'reflection',voice:2},
{"name":"盲眼药师","face":"scare-blind-pharmacist.jpg","body":1,"scale":[0.91,1.03,0.94],"waist":0.94,"shoulders":0.95,"cloth":10198921,"skin":9869698,"style":"coat","voice":4,"prop":"bottles"},
{"name":"锈面护工","face":"scare-rust-orderly.jpg","body":4,"scale":[1.06,1.0,1.02],"waist":1.02,"shoulders":1.1,"cloth":7694924,"skin":9601898,"style":"work","voice":5,"prop":"apron"},
{"name":"夜哭产妇","face":"scare-weeping-mother.jpg","body":5,"scale":[0.91,1.01,0.93],"waist":0.96,"shoulders":0.91,"cloth":10787469,"skin":10327175,"style":"gown","voice":2,"prop":"pendant"},
{"name":"白瞳麻醉师","face":"scare-white-eyed-anesthetist.jpg","body":3,"scale":[0.97,1.08,0.96],"waist":0.94,"shoulders":1.02,"cloth":6259319,"skin":8886925,"style":"coat","voice":10,"prop":"cap"},
{"name":"灰烬病患","face":"scare-ash-patient.jpg","body":6,"scale":[0.88,1.02,0.89],"waist":0.91,"shoulders":0.94,"cloth":6318693,"skin":7765104,"style":"wrapped","voice":13,"prop":"cuffs"},
{"name":"笑面护士长","face":"scare-smiling-matron.jpg","body":0,"scale":[1.02,1.06,1.01],"waist":1.04,"shoulders":1.02,"cloth":9148806,"skin":10197891,"style":"nurse","voice":1,"prop":"brooch"},
{"name":"冷柜管理员","face":"scare-cold-storage-keeper.jpg","body":1,"scale":[1.16,0.99,1.1],"waist":1.1,"shoulders":1.15,"cloth":4743786,"skin":8557978,"style":"work","voice":11,"prop":"utility"},
{"name":"缄默记录员","face":"scare-silent-archivist.jpg","body":5,"scale":[0.89,1.04,0.91],"waist":0.92,"shoulders":0.95,"cloth":6053972,"skin":10066563,"style":"uniform","voice":6,"prop":"chain"},
{"name":"裂唇值夜人","face":"scare-split-smile-watchman.jpg","body":1,"scale":[0.96,1.12,0.98],"waist":0.94,"shoulders":1.04,"cloth":4016196,"skin":9144949,"style":"uniform","voice":12,"prop":"cap"},
{"name":"空眼病号","face":"scare-hollow-eyed-patient.jpg","body":6,"scale":[0.81,1.13,0.83],"waist":0.86,"shoulders":0.89,"cloth":11053719,"skin":10198663,"style":"patient","voice":8,"prop":"bracelet"}
];
function createPortraitGhost(def,index){
 const src=closedCharacters[def.body],g=new THREE.Group(),positions=src.p.slice();
 // Smooth torso shaping preserves the continuous neck, waist and limb surfaces.
 for(let v=0;v<positions.length;v+=3){const x=positions[v],y=positions[v+1],z=positions[v+2],torso=Math.exp(-Math.pow((y-1.13)/.36,4)),shoulder=Math.exp(-Math.pow((y-1.52)/.16,2));positions[v]=x*(1+(def.waist-1)*torso+(def.shoulders-1)*shoulder);positions[v+2]=z*(1+(def.waist-1)*torso*.55)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(src.uv,2));let indices=[],offset=0;for(let m=0;m<4;m++){indices=indices.concat(src.idx[m]);geometry.addGroup(offset,src.idx[m].length,m);offset+=src.idx[m].length}geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const photo=new THREE.TextureLoader().load(imageAssets[def.face]);photo.colorSpace=THREE.SRGBColorSpace;const face=new THREE.MeshStandardMaterial({map:photo,bumpMap:photo,bumpScale:.003,roughness:.91,color:0xd0d1c3});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#c1c3b7';ctx.fillRect(0,0,512,512);let seed=73+index;for(let n=0;n<10000;n++){seed=(seed*1664525+1013904223)>>>0;ctx.fillStyle=n%2?'#16251c18':'#ffffff16';ctx.fillRect(seed%512,(seed>>>9)%512,1,3)}
 // Different textile motifs: gown seams, coat stitching, striped patient clothes,
 // workwear reinforcement, and the attendant's dark pinstripe uniform.
 ctx.strokeStyle='#263d3440';ctx.lineWidth=def.style==='patient'?5:2;const gap=def.style==='patient'?27:def.style==='uniform'?18:100;for(let x=0;x<512;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke()}if(def.style==='work'){ctx.fillStyle='#253c3350';ctx.fillRect(20,320,210,120);ctx.fillRect(290,320,200,120)}
 const textile=new THREE.CanvasTexture(canvas);textile.colorSpace=THREE.SRGBColorSpace;const cloth=new THREE.MeshStandardMaterial({color:def.cloth,map:textile,normalMap:surface('fabric-normal.jpg',2,2,false),normalScale:new THREE.Vector2(.22,.22),roughness:def.style==='patient'?.76:.96});const skin=new THREE.MeshStandardMaterial({color:def.skin,roughness:.94});const trim=new THREE.MeshStandardMaterial({color:0x303c34,roughness:.86});g.add(new THREE.Mesh(geometry,[face,cloth,skin,trim]));
 function tube(points,radius,material){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,14,radius,6,false),material);g.add(mesh);return mesh}
 function button(x,y,z,r=.012){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),trim);mesh.position.set(x,y,z);mesh.scale.z=.4;g.add(mesh)}
 if(def.style==='coat'){for(const side of [-1,1]){tube([[side*.16,1.64,.13],[side*.07,1.48,.19],[side*.16,1.29,.19]],.014,cloth);tube([[side*.12,1.23,.205],[side*.26,1.23,.17],[side*.24,1.10,.19],[side*.12,1.10,.205]],.006,trim)}for(let y=1.34;y>.8;y-=.12)button(.025,y,.21);tube([[-.14,1.62,.13],[-.20,1.42,.22],[-.10,1.32,.24],[0,1.40,.23],[.13,1.62,.13]],.012,trim)}
 if(def.style==='gown'){tube([[0,1.62,.15],[.015,1.4,.205],[0,1.12,.22],[0,.80,.20]],.005,trim);for(let y=1.5;y>1;y-=.13)button(.03,y,.21,.008)}
 if(def.style==='patient'){tube([[-.17,1.61,.12],[0,1.48,.19],[.17,1.61,.12]],.012,cloth);tube([[0,1.47,.20],[0,1.20,.22],[0,.9,.21]],.006,trim)}
 if(def.style==='work'){for(let side of [-1,1]){tube([[side*.12,1.63,.12],[side*.19,1.4,.22],[side*.20,1.17,.24]],.023,cloth);tube([[side*.07,1.23,.25],[side*.28,1.22,.21],[side*.27,1.06,.23],[side*.07,1.06,.25]],.008,trim)}for(let y=1.38;y>.9;y-=.12)button(0,y,.24)}
 if(def.style==='uniform'){tube([[-.18,1.65,.09],[0,1.60,.16],[.18,1.65,.09]],.018,cloth);for(let y=1.52;y>.85;y-=.105)button(0,y,.20,.009);tube([[.12,1.47,.20],[.25,1.46,.16]],.012,trim)}

 if(def.style==='nurse'){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.07,24),cloth);cap.position.set(0,2.02,-.02);cap.scale.z=.7;g.add(cap);const emblem=new THREE.Mesh(new THREE.TorusGeometry(.025,.005,6,16),trim);emblem.position.set(0,2.02,.10);g.add(emblem);for(let y=1.53;y>.85;y-=.11)button(0,y,.20,.009);for(const side of [-1,1])tube([[side*.14,1.62,.12],[side*.06,1.51,.18],[side*.13,1.43,.19]],.012,cloth)}
 if(def.style==='wrapped'){for(let y=1.00;y<1.60;y+=.13)tube([[-.22,y,.12],[0,y-.035,.215],[.22,y,.12]],.014,cloth);for(const side of [-1,1])tube([[side*.13,1.62,.12],[side*.19,1.45,.19],[side*.18,1.20,.22]],.018,cloth);for(let y=1.45;y>.8;y-=.16)button(.10,y,.22)}
 if(def.style==='reflection'){const hair=new THREE.MeshStandardMaterial({color:0x1a2421,roughness:.92});for(const side of [-1,1]){tube([[side*.10,2.02,-.055],[side*.15,1.94,-.08],[side*.17,1.78,-.07],[side*.18,1.57,-.03]],.043,hair);tube([[side*.15,1.61,.12],[side*.11,1.43,.18],[side*.15,1.20,.21]],.009,cloth)}tube([[0,1.60,.16],[0,1.26,.22],[0,.86,.19]],.005,trim)}

 if(def.prop==='bottles'){for(const side of [-1,1]){const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.019,.019,.08,10),new THREE.MeshStandardMaterial({color:0x738b74,roughness:.55}));bottle.position.set(side*.15,1.23,.21);g.add(bottle);button(side*.15,1.28,.21,.012)}}
 if(def.prop==='apron'||def.prop==='utility'){for(const side of [-1,1]){tube([[side*.16,1.61,.13],[side*.14,1.28,.24],[side*.20,1.03,.23]],.018,cloth);for(let y=1.26;y>1.07;y-=.07)button(side*.16,y,.25,.009)}}
 if(def.prop==='pendant'||def.prop==='chain'){tube([[-.13,1.62,.13],[-.07,1.48,.20],[0,1.41,.22],[.07,1.48,.20],[.13,1.62,.13]],.004,trim);button(0,1.40,.224,.023)}
 if(def.prop==='cap'){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.125,.145,.065,24),cloth);cap.position.set(0,2.035,-.025);cap.scale.z=.85;g.add(cap)}
 if(def.prop==='cuffs'||def.prop==='bracelet')button(.12,1.47,.20,.013);
 if(def.prop==='brooch'){const badge=new THREE.Mesh(new THREE.TorusGeometry(.024,.005,6,16),trim);badge.position.set(.14,1.49,.20);g.add(badge)}
 g.scale.fromArray(def.scale);g.visible=false;g.userData.portrait=def.face;g.userData.voice=def.voice;g.userData.role=def.style;g.userData.pursuitRadius=Math.max(.34,Math.min(.43,.34*def.scale[0]));g.userData.name=def.name;g.traverse(o=>movingObjects.add(o));scene.add(g);return g;
}
function addPortraitGhosts(){for(const [i,def] of portraitGhostDefinitions.entries()){ghosts.push(createPortraitGhost(def,i));names.push(def.name)}}
