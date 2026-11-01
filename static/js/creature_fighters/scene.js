(() => {
  'use strict';
  const canvas = document.getElementById('scene');
  const overlay = document.getElementById('overlay');
  const enter = document.getElementById('enter');
  const status = document.getElementById('status');
  if (!window.THREE) { status.textContent = 'The 3D library could not load. Please check your connection and refresh.'; enter.disabled = true; return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true}); }
  catch (error) { status.textContent = 'This browser could not start the 3D scene. Try a browser with WebGL enabled.'; enter.disabled = true; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ed9cb);
  new THREE.TextureLoader().load('/static/img/creature_fighters/sky.png', tex => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    scene.background = tex;
  });
  scene.fog = new THREE.Fog(0xaddbcc, 55, 145);
  const camera = new THREE.PerspectiveCamera(65, 1, .1, 220);
  scene.add(new THREE.HemisphereLight(0xe6f8d1, 0x526b3a, .85));
  const sun = new THREE.DirectionalLight(0xffedbd, 1.1);
  sun.position.set(-30, 60, 25); sun.castShadow = true;
  Object.assign(sun.shadow.camera, {left:-55,right:55,top:55,bottom:-55,near:1,far:150});
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0004; scene.add(sun);
  // Painted textures are generated locally, so every surface can be restyled in code.
  function paintedTexture(base, strokes, repeat = 1) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
    let state = 37421;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = strokes[Math.floor(random() * strokes.length)];
      ctx.globalAlpha = .025 + random() * .10;
      const x = random() * 256, y = random() * 256;
      ctx.beginPath(); ctx.ellipse(x, y, 2 + random() * 17, 1 + random() * 4, random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(c); texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(repeat, repeat);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return texture;
  }
  // Ground uses an imported image texture; change repeat to make the pattern larger or smaller.
  function imageTexture(url, repeat = 1) {
    const texture = new THREE.TextureLoader().load(url); texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(repeat, repeat);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return texture;
  }
  const grassPaint = window.CF_ASSETS && CF_ASSETS.ground
    ? imageTexture(CF_ASSETS.ground, 10)
    : paintedTexture('#91ab61', ['#244e37', '#e1d282', '#4b8050', '#c3cf7a'], 14);
  const earthPaint = paintedTexture('#a88e62', ['#604c39', '#e3c68a', '#748b54', '#ccac78'], 4);
  const rockPaint = window.CF_ASSETS && CF_ASSETS.rock
    ? imageTexture(CF_ASSETS.rock, 2)
    : paintedTexture('#958879', ['#4c5952', '#d8bb8f', '#6d7964', '#c7a98d'], 2);
  const barkPaint = window.CF_ASSETS && CF_ASSETS.bark
    ? imageTexture(CF_ASSETS.bark, 2)
    : paintedTexture('#8c6a4a', ['#493b31', '#d1a471', '#6c553a'], 2);
  const leafPaint = paintedTexture('#69a767', ['#285c40', '#c9ce7c', '#93bb74', '#417a4c'], 1);
  const cliffPaint = window.CF_ASSETS && CF_ASSETS.cliff ? imageTexture(CF_ASSETS.cliff, 1.5) : rockPaint;
  const volcanoPaint = window.CF_ASSETS && CF_ASSETS.volcano ? imageTexture(CF_ASSETS.volcano, 1.5) : cliffPaint;
  const crystalPaint = window.CF_ASSETS && CF_ASSETS.crystal ? imageTexture(CF_ASSETS.crystal, 1) : null;
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .94, ...extra});
  const materials = { grass:mat(0xffffff,{map:grassPaint}), earth:mat(0xffffff,{map:earthPaint}), rock:mat(0xffffff,{map:rockPaint,flatShading:true}), dark:mat(0x777069,{map:rockPaint,flatShading:true}), cliff:mat(0xffffff,{map:cliffPaint,flatShading:true}), volcano:mat(0xffffff,{map:volcanoPaint,emissiveMap:volcanoPaint,emissive:0xff7a2a,emissiveIntensity:.5,flatShading:true}), cliffDark:mat(0x9a948c,{map:cliffPaint,flatShading:true}), trunk:mat(0xffffff,{map:barkPaint}), leaf:mat(0xb4d59a, {map:leafPaint,side:THREE.DoubleSide}), leaf2:mat(0xe0dba1, {map:leafPaint,side:THREE.DoubleSide}), crystal:mat(crystalPaint?0xffffff:0x2fd2dc,{map:crystalPaint,emissiveMap:crystalPaint,emissive:0x0f9fb8,emissiveIntensity:.85,roughness:.12,metalness:.15,transparent:true,opacity:.8,flatShading:true}), crystalCore:new THREE.MeshBasicMaterial({color:0xc9fff6,transparent:true,opacity:.55,fog:false}), lava:mat(0xff802c,{emissive:0xf34a0a,emissiveIntensity:.8}), dino:mat(0x728c53), belly:mat(0xc8ba7a), eye:mat(0x201d13) };
  function mesh(geometry, material, x=0,y=0,z=0, parent=scene) { const m=new THREE.Mesh(geometry, material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
  // A seeded generator keeps the landscape stable on reload.
  let seed=7819; function rand(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
  const ground=mesh(new THREE.CircleGeometry(100,64),materials.grass); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true;
  // Irregular, feathered clearing avoids a hard geometric edge against the grass.
  const clearingCanvas=document.createElement('canvas'); clearingCanvas.width=clearingCanvas.height=256;
  const cc=clearingCanvas.getContext('2d'); const fade=cc.createRadialGradient(128,128,65,128,128,127);
  fade.addColorStop(0,'#ffffff'); fade.addColorStop(.65,'#dddddd'); fade.addColorStop(1,'#000000');
  cc.fillStyle=fade;cc.fillRect(0,0,256,256);const clearingAlpha=new THREE.CanvasTexture(clearingCanvas);
  const clearingMat=materials.earth.clone();clearingMat.transparent=true;clearingMat.alphaMap=clearingAlpha;clearingMat.depthWrite=false;
  const clearing=mesh(new THREE.PlaneGeometry(42,42),clearingMat,0,.025,0); clearing.rotation.x=-Math.PI/2;
  // A softly painted sky gradient surrounds the valley.
  const skyCanvas=document.createElement('canvas');skyCanvas.width=16;skyCanvas.height=256;
  const skyContext=skyCanvas.getContext('2d');const skyGradient=skyContext.createLinearGradient(0,0,0,256);
  skyGradient.addColorStop(0,'#77b9bc');skyGradient.addColorStop(.58,'#bee0bf');skyGradient.addColorStop(1,'#f3d6a3');
  skyContext.fillStyle=skyGradient;skyContext.fillRect(0,0,16,256);
  const skyTexture=new THREE.CanvasTexture(skyCanvas);skyTexture.encoding=THREE.sRGBEncoding;
  const sky=mesh(new THREE.SphereGeometry(180,32,16),new THREE.MeshBasicMaterial({map:skyTexture,side:THREE.BackSide,depthWrite:false,fog:false}));sky.castShadow=false;sky.receiveShadow=false;
  // A broken ring of cliffs and a low volcano enclose the valley.
  // Rugged rock massifs: a tall tapered cylinder with ledges and noisy, bulging faces instead of a smooth cone.
  function roughen(geo, h, amp, ledges, pinTop) {
    const p = geo.attributes.position, ph = rand() * 6.28;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = y / h + .5;
      const n = Math.sin(x * .55 + z * .32 + ph) * Math.sin(z * .5 - x * .21 + ph * 1.7) + .5 * Math.sin(y * 1.1 + x * .45 + ph);
      const ledge = 1 + ledges * Math.sin(t * 17 + ph);                       // stepped cliff bands
      const fade = pinTop ? Math.min(1, Math.max(0, (.92 - t) * 6)) : 1;      // keep the volcano rim intact
      const s = Math.max(.35, ledge * (1 + n * amp * fade));
      p.setX(i, x * s); p.setZ(i, z * s);
      if (t > .02) p.setY(i, y + n * amp * h * .08 * fade);                   // uneven, broken summit
    }
    geo.computeVertexNormals(); return geo;
  }
  for(let i=0;i<42;i++) {
    const a=i*Math.PI*2/42, radius=74+rand()*12, h=14+rand()*19, w=9+rand()*7, m=i%3?materials.cliff:materials.cliffDark;
    const cx=Math.cos(a)*radius, cz=Math.sin(a)*radius, spin=rand()*6.28;
    const cliff=mesh(roughen(new THREE.CylinderGeometry(w*.38,w,h,12,8),h,.34,.06,false),m,cx,h/2-2,cz); cliff.rotation.y=spin;
    // A smaller shoulder beside each massif breaks up the silhouette.
    const sh=h*(.45+rand()*.25), sw=w*(.5+rand()*.2), off=w*.7;
    const shoulder=mesh(roughen(new THREE.CylinderGeometry(sw*.3,sw,sh,10,6),sh,.34,.06,false),m,cx+Math.cos(spin)*off,sh/2-2,cz+Math.sin(spin)*off); shoulder.rotation.y=rand()*6.28;
  }
  const volcano=mesh(roughen(new THREE.CylinderGeometry(5,20,25,12,8),25,.22,.05,true),materials.volcano,-5,11,-62); volcano.rotation.y=.2;
  const crater=mesh(new THREE.CircleGeometry(4.8,16),materials.lava,-5,23.55,-62); crater.rotation.x=-Math.PI/2;
  const procedural=[volcano,crater];
  const volcanoBlock={x:-5,z:-62,r:21};   // fallback no-walk circle, used only while the imported volcano model is not loaded
  // The imported volcano is walkable: the player's feet follow the model's real surface, found by casting a ray straight down.
  const volcanoMeshes=[], downRay=new THREE.Raycaster(), rayOrigin=new THREE.Vector3(), rayDir=new THREE.Vector3(0,-1,0);
  function groundHeight(x,z){ if(!volcanoMeshes.length) return 0; rayOrigin.set(x,200,z); downRay.set(rayOrigin,rayDir); const hit=downRay.intersectObjects(volcanoMeshes,false)[0]; return hit?Math.max(0,hit.point.y):0; }
  for(let i=0;i<7;i++){const b=mesh(new THREE.IcosahedronGeometry(1.5+rand()*2,0),mat(0xa4b8a3,{transparent:true,opacity:.45}),-5+(rand()-.5)*4,27+i*2.5,-62); b.scale.set(1.4,1,1); procedural.push(b);}
  // Imported Cinderpeak volcano replaces the procedural one. The model's own ash plain is hidden because the scene has its own ground.
  if (window.CF_ASSETS && CF_ASSETS.volcanoModel && THREE.GLTFLoader) {
    new THREE.GLTFLoader().load(CF_ASSETS.volcanoModel, gltf => {
      const model = gltf.scene; let cone = null;
      model.traverse(o => {
        if (!o.isMesh) return;
        if (o.name === 'AshPlain') { o.visible = false; return; }
        if (o.name === 'Volcano') cone = o;
        volcanoMeshes.push(o);
        o.castShadow = o.name !== 'LavaLake'; o.receiveShadow = true;
      });
      model.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(cone || model), size = b.getSize(new THREE.Vector3()), center = b.getCenter(new THREE.Vector3());
      const s = 54 / Math.max(size.x, size.z);                    // volcano is about 54 units across
      const holder = new THREE.Group(); holder.add(model); model.scale.setScalar(s); model.updateMatrixWorld(true);
      const fit = new THREE.Box3().setFromObject(cone || model), c = fit.getCenter(new THREE.Vector3());
      // Flush with the ground: line up the outer rim of the volcano's base (not its single lowest point) with ground level,
      // then sink it a hair so there is no lip or gap where the model meets the terrain.
      let baseY = fit.min.y;
      if (cone) {
        const pos = cone.geometry.attributes.position, v = new THREE.Vector3(); let maxR = 0, sum = 0, n = 0;
        for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(cone.matrixWorld); maxR = Math.max(maxR, Math.hypot(v.x - c.x, v.z - c.z)); }
        for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(cone.matrixWorld); if (Math.hypot(v.x - c.x, v.z - c.z) > maxR * .96) { sum += v.y; n++; } }
        if (n) baseY = sum / n;
      }
      model.position.set(-c.x, -baseY - .04, -c.z); holder.position.set(-5, 0, -62);
      scene.add(holder); holder.updateMatrixWorld(true);
      procedural.forEach(o => scene.remove(o));
    }, undefined, () => {});
  }
  // Broad curved leaf blades with a raised center give the canopy a hand-shaped silhouette.
  function leafGeometry(length, width) {
    const vertices=[], uvs=[], indices=[]; const segments=8;
    for(let i=0;i<=segments;i++) {
      const t=i/segments, w=Math.sin(Math.PI*t)*width;
      const y=Math.sin(t*Math.PI)*length*.22-t*t*length*.22, z=-t*length;
      vertices.push(-w,y,z, 0,y+width*.12,z, w,y,z); uvs.push(0,t, .5,t, 1,t);
      if(i<segments){const n=i*3;indices.push(n,n+3,n+1,n+1,n+3,n+4,n+1,n+4,n+2,n+2,n+4,n+5);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  }
  const palmLeaf=leafGeometry(5.5,1.15), fernLeaf=leafGeometry(2.8,.5);
  function palm(x,z,s=1) {
    const tree=new THREE.Group(); tree.position.set(x,0,z); tree.scale.setScalar(s); scene.add(tree);
    const trunk=mesh(new THREE.CylinderGeometry(.32,.8,8,9,5),materials.trunk,0,4,0,tree); trunk.rotation.z=.1;
    for(let i=0;i<10;i++){const a=i*Math.PI*2/10;const leaf=mesh(palmLeaf,i%2?materials.leaf:materials.leaf2,.35,8,0,tree);leaf.rotation.y=a;leaf.rotation.x=.12+(i%3)*.12;}
  }
  function fern(x,z,s=1){const plant=new THREE.Group();plant.position.set(x,.1,z);plant.scale.setScalar(s);scene.add(plant);
    for(let i=0;i<8;i++){const leaf=mesh(fernLeaf,i%2?materials.leaf:materials.leaf2,0,.5,0,plant);leaf.rotation.y=i*Math.PI*2/8;leaf.rotation.x=-.25;}}
  // Faceted six-sided crystal: a hexagonal shaft with an angled, pointed tip.
  function crystalGeometry(r, h) { return new THREE.LatheGeometry([new THREE.Vector2(0,0), new THREE.Vector2(r*.9,0), new THREE.Vector2(r,h*.12), new THREE.Vector2(r,h*.68), new THREE.Vector2(r*.3,h*.92), new THREE.Vector2(0,h)], 6); }
  function crystals(x,z){
    for(let i=0;i<6;i++){
      const h=1.2+rand()*3, r=.22+rand()*.2, px=x+(rand()-.5)*2.2, pz=z+(rand()-.5)*2.2, tilt=(rand()-.5)*.55, yaw=rand()*3;
      const c=mesh(crystalGeometry(r,h),materials.crystal,px,0,pz); c.castShadow=false; c.rotation.set(tilt,yaw,(rand()-.5)*.55);
      const core=mesh(crystalGeometry(r*.4,h*.85),materials.crystalCore,px,0,pz); core.castShadow=core.receiveShadow=false; core.rotation.copy(c.rotation);
    }
    const glow=new THREE.PointLight(0x58f0ee,1.1,13,2); glow.position.set(x,1.4,z); scene.add(glow);
  }
  for(let i=0;i<105;i++){const a=rand()*Math.PI*2, r=21+rand()*49, x=Math.cos(a)*r,z=Math.sin(a)*r; if(i%4===0)palm(x,z,.7+rand()*.7); else fern(x,z,.6+rand()*.9);}
  [[-16,-12],[18,-25],[-30,12],[28,18],[4,-37]].forEach(p=>crystals(...p));
  for(let i=0;i<30;i++){const a=rand()*6.28,r=17+rand()*40; const rock=mesh(new THREE.IcosahedronGeometry(.5+rand()*2,0),materials.rock,Math.cos(a)*r,.4,Math.sin(a)*r); rock.scale.y=.5;}
  // A friendly, original little crater-dweller, assembled from editable shapes.
  function creature(x,z,scale,angle){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);g.rotation.y=angle;scene.add(g);
    const body=mesh(new THREE.SphereGeometry(1,10,7),materials.dino,0,2,0,g);body.scale.set(1.1,1,1.8);
    const head=mesh(new THREE.SphereGeometry(1,10,7),materials.dino,0,3.4,-1.25,g);head.scale.set(.85,.8,1);
    const snout=mesh(new THREE.SphereGeometry(.65,9,6),materials.belly,0,3.15,-2,g);snout.scale.set(1,.6,1);
    for(const side of [-1,1]){mesh(new THREE.SphereGeometry(.12,8,6),materials.eye,side*.65,3.55,-1.8,g);const leg=mesh(new THREE.CylinderGeometry(.3,.4,1.5,6),materials.dino,side*.7,.8,.5,g);leg.rotation.z=side*.1;mesh(new THREE.SphereGeometry(.4,7,5),materials.dino,side*.7,.25,-.15,g);}
    const tail=mesh(new THREE.ConeGeometry(.55,3,7),materials.dino,0,1.7,2.25,g);tail.rotation.x=Math.PI/2;
    for(let i=0;i<5;i++){const spike=mesh(new THREE.ConeGeometry(.25,.6,4),materials.belly,0,2.85-i*.13,-.1+i*.55,g);spike.rotation.x=.2;}
    return g;
  }
  const creatures=[creature(-7,-14,1, .4),creature(12,-28,.7,-.7)];
  // Swap the placeholder shapes for the imported wyrmling model (each creature gets its own skinned clone).
  // Animation controller: one per creature. play(name) cross-fades into a clip. Loops (idle, walk, fly) repeat, "die" holds its
  // last frame, and every other clip plays once and then fades back to idle. The AI system can drive creatures through play().
  const animators = [];
  function createAnimator(root, clips) {
    const mixer = new THREE.AnimationMixer(root), actions = {};
    clips.forEach(c => { actions[c.name] = mixer.clipAction(c); });
    const idleName = (clips.find(c => /^idle/i.test(c.name)) || clips[0]).name;
    const kindOf = name => /die/i.test(name) ? 'hold' : /^(idle|walk|fly)$/i.test(name) ? 'loop' : 'once';
    let current = null, currentName = null;
    function play(name, fade = .25) {
      const next = actions[name]; if (!next) return false;
      const kind = kindOf(name);
      next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.setEffectiveTimeScale(1);
      if (kind === 'loop') { next.setLoop(THREE.LoopRepeat, Infinity); next.clampWhenFinished = false; }
      else { next.setLoop(THREE.LoopOnce, 1); next.clampWhenFinished = true; }
      if (current && current !== next) current.crossFadeTo(next, fade, false); else next.fadeIn(fade);
      next.play(); current = next; currentName = name; return true;
    }
    mixer.addEventListener('finished', e => { if (e.action === current && kindOf(currentName) === 'once') play(idleName, .3); });
    return { root, label: '', names: Object.keys(actions), actions, play, update: dt => mixer.update(dt), get current() { return currentName; } };
  }
  window.creatureAnimators = animators;   // handy from the browser console: creatureAnimators[0].play('lunge_bite')
  if (window.CF_ASSETS && CF_ASSETS.wyrmling && THREE.GLTFLoader) {
    new THREE.GLTFLoader().load(CF_ASSETS.wyrmling, gltf => {
      const cloneModel = THREE.SkeletonUtils ? m => THREE.SkeletonUtils.clone(m) : m => m.clone();
      const clips = gltf.animations || [], idleClip = clips.find(c => /^idle/i.test(c.name)) || clips[0];
      if (idleClip) { const m0 = new THREE.AnimationMixer(gltf.scene); m0.clipAction(idleClip).play(); m0.update(0); }   // measure the idle pose
      gltf.scene.updateMatrixWorld(true);
      // Lowest point of the posed model. A plain bounding box ignores the skeleton, which can leave the creature floating or sunk.
      let minY = Infinity; const tmp = new THREE.Vector3();
      gltf.scene.traverse(o => {
        if (o.isSkinnedMesh) {
          o.skeleton.update(); const p = o.geometry.attributes.position;
          for (let i = 0; i < p.count; i++) { tmp.fromBufferAttribute(p, i); o.boneTransform(i, tmp); tmp.applyMatrix4(o.matrixWorld); if (tmp.y < minY) minY = tmp.y; }
        } else if (o.isMesh) { minY = Math.min(minY, new THREE.Box3().setFromObject(o).min.y); }
      });
      if (!isFinite(minY)) minY = new THREE.Box3().setFromObject(gltf.scene).min.y;
      // Size it so the head-and-forebody section (about 2 model units long) looks 1 inch (96 CSS px) wide on screen
      // when viewed from VIEW_DISTANCE game units away. Change either number to resize the creatures.
      const FOREBODY_MODEL_LENGTH = 2.0, ONE_INCH_PX = 96, VIEW_DISTANCE = 4;
      const pxPerUnitAtOne = window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      const s = (ONE_INCH_PX * VIEW_DISTANCE / pxPerUnitAtOne) / FOREBODY_MODEL_LENGTH;
      creatures.forEach((g, i) => {
        const model = cloneModel(gltf.scene);   // always clone the untouched original so the scaling isn't applied twice
        model.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } });
        const holder = new THREE.Group(); holder.rotation.y = Math.PI;   // model faces +z; creatures face -z
        model.scale.multiplyScalar(s); model.position.y = -minY * s;   // feet rest exactly on the ground
        holder.add(model); g.children.slice().forEach(c => c.visible = false); g.add(holder);
        if (clips.length) { const anim = createAnimator(model, clips); anim.play(idleClip.name, 0); anim.actions[idleClip.name].time = i * idleClip.duration * .37; anim.label = 'Wyrmling'; animators.push(anim); }
      });
    }, undefined, () => {});
  }
  // Irithigrib: a single imported model placed near the start point. Change IRITHIGRIB_HEIGHT / the position to adjust it.
  if (window.CF_ASSETS && CF_ASSETS.irithigrib && THREE.GLTFLoader) {
    new THREE.GLTFLoader().load(CF_ASSETS.irithigrib, gltf => {
      const IRITHIGRIB_HEIGHT = 3, model = gltf.scene;
      model.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } });
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const s = IRITHIGRIB_HEIGHT / size.y;
      model.scale.setScalar(s); model.position.set(-center.x * s, -box.min.y * s, -center.z * s);   // centered, feet on the ground
      const holder = new THREE.Group(); holder.position.set(4, 0, 2); holder.rotation.y = Math.PI * .85;   // turned to face the start point
      holder.add(model); scene.add(holder);
      // Listed in the animation panel even with no clips, so Tab can still select it.
      const clips = gltf.animations || [];
      const anim = clips.length ? createAnimator(model, clips) : { root: model, names: [], actions: {}, play: () => false, update: () => {}, current: null };
      if (clips.length) anim.play((clips.find(c => /^idle/i.test(c.name)) || clips[0]).name, 0);
      anim.label = 'Irithigrib'; animators.push(anim);
    }, undefined, () => {});
  }
  const player={ground:0,x:0,z:10,y:1.7,vertical:0,yaw:0,pitch:0}; const keys=new Set(); let locked=false, started=false;
  // Animation test panel: click a button (or press 1-9) to play that clip on every creature. ` (backtick) shows or hides it.
  // While the mouse is captured for looking around, press Esc to get the cursor back before clicking.
  const animPanel = document.createElement('div');
  animPanel.style.cssText = 'position:fixed;right:14px;bottom:14px;padding:10px;background:rgba(10,20,20,.72);color:#e8fff6;font:12px/1.4 system-ui,sans-serif;border-radius:10px;z-index:20;display:flex;flex-direction:column;gap:5px;min-width:150px';
  animPanel.addEventListener('pointerdown', e => e.stopPropagation());
  animPanel.addEventListener('click', e => e.stopPropagation());
  document.body.appendChild(animPanel);
  let panelNames = '', selected = null;   // selected = name of the model type whose animations the panel shows (Tab cycles types)
  // Models are grouped by type (all wyrmlings are one type, Irithigrib is another). Tab cycles types; clips play on every model of the type.
  const modelTypes = () => [...new Set(animators.map(x => x.label))];
  function refreshAnimPanel() {
    const types = modelTypes(); if (!types.includes(selected)) selected = types[0] || null;
    const group = animators.filter(x => x.label === selected), a = group[0];
    const key = selected + '#' + (a ? a.names.join('|') : '') + '#' + types.length;
    if (key !== panelNames) {   // rebuild the buttons only when the model type or clip list changes
      panelNames = key; animPanel.textContent = '';
      const title = document.createElement('div'); title.style.cssText = 'font-weight:700;letter-spacing:.04em;margin-bottom:2px';
      title.textContent = a ? 'Model ' + (types.indexOf(selected) + 1) + '/' + types.length + ': ' + selected + '  (Tab = next model)' : 'Creature models loading…'; animPanel.appendChild(title);
      if (a) a.names.forEach((n, i) => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.clip = n; btn.textContent = (i < 9 ? (i + 1) + '  ' : '') + n;
        btn.style.cssText = 'text-align:left;padding:5px 9px;border:1px solid rgba(255,255,255,.25);border-radius:6px;background:rgba(255,255,255,.08);color:inherit;font:inherit;cursor:pointer';
        btn.addEventListener('click', () => { group.forEach(x => x.play(n)); refreshAnimPanel(); });
        animPanel.appendChild(btn);
      });
      if (a && !a.names.length) { const note = document.createElement('div'); note.style.opacity = '.75'; note.textContent = 'This model has no animations.'; animPanel.appendChild(note); }
    }
    animPanel.querySelectorAll('button[data-clip]').forEach(btn => { const on = a && a.current === btn.dataset.clip; btn.style.background = on ? 'rgba(88,240,200,.45)' : 'rgba(255,255,255,.08)'; });
  }
  refreshAnimPanel();
  window.addEventListener('keydown', e => {
    if (e.code === 'Backquote') { animPanel.style.display = animPanel.style.display === 'none' ? 'flex' : 'none'; return; }
    const types = modelTypes();
    if (e.code === 'Tab') { e.preventDefault(); if (types.length) { selected = types[(types.indexOf(selected) + (e.shiftKey ? types.length - 1 : 1)) % types.length]; refreshAnimPanel(); } return; }
    const m = /^Digit([1-9])$/.exec(e.code); if (!m) return;
    const group = animators.filter(x => x.label === selected), name = group[0] && group[0].names[+m[1] - 1];
    if (name) { group.forEach(x => x.play(name)); refreshAnimPanel(); }
  });
  setInterval(refreshAnimPanel, 250);
  function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();} window.addEventListener('resize',resize);resize();
  enter.addEventListener('click',()=>{started=true;overlay.hidden=true;if(canvas.requestPointerLock && !('ontouchstart' in window)) canvas.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;});
  canvas.addEventListener('click',()=>{if(started && !locked && canvas.requestPointerLock && !('ontouchstart' in window)) canvas.requestPointerLock();});
  document.addEventListener('mousemove',e=>{if(locked){player.yaw-=e.movementX*.002;player.pitch=Math.max(-1.2,Math.min(1.2,player.pitch-e.movementY*.002));}});
  window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();keys.add(e.code);});
  window.addEventListener('keyup',e=>keys.delete(e.code)); window.addEventListener('blur',()=>keys.clear());
  let touchX=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchX=e.clientX;});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch' && touchX!==null){player.yaw-=(e.clientX-touchX)*.008;touchX=e.clientX;}});canvas.addEventListener('pointerup',()=>touchX=null);canvas.addEventListener('pointercancel',()=>touchX=null);
  document.querySelectorAll('[data-key]').forEach(button=>{const key=button.dataset.key;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key);}); ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>keys.delete(key)));});
  let previous=performance.now(); function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(started){const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0), strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);const length=Math.hypot(forward,strafe)||1;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?15:9)*dt/length;player.x+=(-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*strafe)*speed;player.z+=(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*strafe)*speed;const distance=Math.hypot(player.x,player.z);if(distance>68){player.x*=68/distance;player.z*=68/distance;} if(!volcanoMeshes.length){const vx=player.x-volcanoBlock.x,vz=player.z-volcanoBlock.z,vd=Math.hypot(vx,vz);if(vd<volcanoBlock.r){const k=volcanoBlock.r/(vd||1);player.x=volcanoBlock.x+(vd?vx*k:volcanoBlock.r);player.z=volcanoBlock.z+(vd?vz*k:0);}}
      player.ground+=(groundHeight(player.x,player.z)-player.ground)*Math.min(1,dt*18);const floor=1.7+player.ground;
      if(keys.has('Space')&&player.y<=floor+.02){player.vertical=7;}player.vertical-=18*dt;player.y=Math.max(floor,player.y+player.vertical*dt);if(player.y<=floor)player.vertical=0;}
    animators.forEach(a=>a.update(dt));
    camera.position.set(player.x,player.y,player.z);camera.rotation.order='YXZ';camera.rotation.set(player.pitch,player.yaw,0);renderer.render(scene,camera);
  } requestAnimationFrame(frame);
})();


