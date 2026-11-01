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
  // Sky dome: r128 can't use an equirectangular texture as scene.background, so wrap the image on an inside-out sphere that follows the camera.
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(200, 48, 24), new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.BackSide, fog: false, depthWrite: false}));
  skyDome.renderOrder = -1; skyDome.frustumCulled = false; skyDome.visible = false; scene.add(skyDome);
  if (window.CF_ASSETS && CF_ASSETS.sky) new THREE.TextureLoader().load(CF_ASSETS.sky, tex => {
    // The image's left and right edges don't match, which shows as a vertical seam on the dome. Pull both edges of every row
    // toward their shared average color, fading out over SEAM_BLEND of the width, so the wrap-around joins smoothly.
    const SEAM_BLEND = .15, img = tex.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
    try {
      const W = cv.width, H = cv.height, band = Math.round(W * SEAM_BLEND), data = cx.getImageData(0, 0, W, H), d = data.data;
      for (let y = 0; y < H; y++) {
        const row = y * W * 4, L = row, R = row + (W - 1) * 4;
        for (let c = 0; c < 3; c++) {
          const a = d[L + c], b = d[R + c], avg = (a + b) / 2;
          for (let x = 0; x < band; x++) {
            const k = 1 - x / band, w = k * k * (3 - 2 * k);   // smooth falloff from the edge
            const li = row + x * 4 + c, ri = row + (W - 1 - x) * 4 + c;
            d[li] = Math.max(0, Math.min(255, d[li] + (avg - a) * w));
            d[ri] = Math.max(0, Math.min(255, d[ri] + (avg - b) * w));
          }
        }
      }
      cx.putImageData(data, 0, 0);
      tex = new THREE.CanvasTexture(cv);
    } catch (e) { /* if pixels can't be read, fall back to the raw image */ }
    tex.encoding = THREE.sRGBEncoding; skyDome.material.map = tex; skyDome.material.needsUpdate = true; skyDome.visible = true; sky.visible = false;   // hide the old painted-gradient sphere (defined below) once the image is ready
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
  let volcanoFx = null;   // set once the volcano loads; called every frame with the time step
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
      // Crater effects: rising smoke/ash puffs, occasional embers, and a flickering lava glow. Tune the constants below.
      const lava = []; model.traverse(o => { if (o.name === 'LavaLake') lava.push(o); });
      const cb = new THREE.Box3().setFromObject(lava[0] || cone || model), crater = cb.getCenter(new THREE.Vector3());
      if (!lava.length) crater.y = cb.max.y; else crater.y = cb.max.y + .3;
      const softTexture = (stops) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; };
      const smokeTex = softTexture([[0, 'rgba(255,255,255,.9)'], [.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]);
      const emberTex = softTexture([[0, 'rgba(255,255,230,1)'], [.35, 'rgba(255,170,60,.9)'], [1, 'rgba(255,80,0,0)']]);
      const SMOKE_COUNT = 28, SMOKE_LIFE = 9, SMOKE_RISE = 4.2, EMBER_COUNT = 26, EMBER_RATE = 3;   // embers per second on average
      const smoke = [], embers = [], r = Math.random;
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const m = new THREE.SpriteMaterial({map: smokeTex, color: 0x6b625c, transparent: true, depthWrite: false, opacity: 0});
        const sp = new THREE.Sprite(m); sp.visible = false; scene.add(sp); smoke.push({sp, age: r() * SMOKE_LIFE, life: SMOKE_LIFE * (.8 + r() * .4), vx: 0, vz: 0, spin: 0});
      }
      const resetSmoke = (p, fresh) => {
        p.age = 0; p.life = SMOKE_LIFE * (.8 + r() * .4); p.vx = (r() - .3) * .9; p.vz = (r() - .5) * .9;   // gentle drift to one side, like wind
        p.sp.position.set(crater.x + (r() - .5) * 5, crater.y, crater.z + (r() - .5) * 5); p.size0 = 3 + r() * 2;
      };
      smoke.forEach(p => { const a = p.age; resetSmoke(p); p.age = a % p.life; });   // stagger so the column is already full at the start
      for (let i = 0; i < EMBER_COUNT; i++) {
        const m = new THREE.SpriteMaterial({map: emberTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0});
        const sp = new THREE.Sprite(m); sp.visible = false; scene.add(sp); embers.push({sp, age: 99, life: 1, v: new THREE.Vector3()});
      }
      const glow = new THREE.PointLight(0xff6a1f, 2, 42, 1.6); glow.position.set(crater.x, crater.y + 1.5, crater.z); scene.add(glow);
      let t = 0;
      volcanoFx = dt => {
        t += dt;
        smoke.forEach(p => {
          p.age += dt; if (p.age > p.life) resetSmoke(p);
          const k = p.age / p.life, sp = p.sp;
          sp.visible = true; sp.position.x += p.vx * dt; sp.position.z += p.vz * dt; sp.position.y += SMOKE_RISE * (1 - k * .5) * dt;
          sp.scale.setScalar(p.size0 * (1 + k * 3.2));
          sp.material.opacity = Math.min(1, k * 8) * (1 - k) * .55;      // fade in at the vent, fade out as it rises
          sp.material.color.setRGB(.42 + .2 * k, .38 + .2 * k, .36 + .2 * k);   // dark fresh ash, paler as it thins
        });
        for (let n = Math.random() < EMBER_RATE * dt ? 1 : 0, i = 0; n && i < embers.length; i++) {
          const e = embers[i]; if (e.age < e.life) continue;
          e.age = 0; e.life = 1.6 + r() * 1.6; e.sp.visible = true;
          e.sp.position.set(crater.x + (r() - .5) * 4, crater.y + .5, crater.z + (r() - .5) * 4);
          e.v.set((r() - .5) * 5, 7 + r() * 7, (r() - .5) * 5); e.sp.scale.setScalar(.35 + r() * .35); break;
        }
        embers.forEach(e => {
          if (e.age >= e.life) { e.sp.visible = false; return; }
          e.age += dt; e.v.y -= 7 * dt; e.sp.position.addScaledVector(e.v, dt);
          e.sp.material.opacity = Math.max(0, 1 - e.age / e.life) * (.7 + .3 * Math.sin(e.age * 40));   // fade out while twinkling
        });
        glow.intensity = 2 + Math.sin(t * 7.3) * .5 + Math.sin(t * 17.1 + 1.3) * .35 + Math.sin(t * 3.1) * .4;   // lava flicker
        lava.forEach(o => { const m = o.material; if (m && m.emissive) m.emissiveIntensity = 1 + .35 * Math.sin(t * 2.4) + .15 * Math.sin(t * 6.1); });
      };
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
  // Bounds of a posed model: a plain Box3 ignores the skeleton, so measure each skinned vertex after the bones move it.
  function measurePosedBox(root) {
    const box = new THREE.Box3(), v = new THREE.Vector3();
    root.traverse(o => {
      if (o.isSkinnedMesh) {
        o.skeleton.update(); const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 4000));
        for (let i = 0; i < p.count; i += step) { v.fromBufferAttribute(p, i); o.boneTransform(i, v); box.expandByPoint(v.applyMatrix4(o.matrixWorld)); }
      } else if (o.isMesh) box.union(new THREE.Box3().setFromObject(o));
    });
    return box;
  }
  // Action-bar portraits: render a small picture of each model (in its idle pose) and put it in its slot. Slot 0 is the first button.
  // Playable models: action-bar button index -> {name, template (untouched clone), clips, scale, original (world instance to hide while played)}.
  const avatarRegistry = {};
  let thumbRenderer = null;
  function makeThumb(source, clips, slot, name) {
    try {
      const button = document.querySelectorAll('#actionbar .slot')[slot]; if (!button) return;
      if (!thumbRenderer) {
        thumbRenderer = new THREE.WebGLRenderer({alpha: true, antialias: true, preserveDrawingBuffer: true});
        thumbRenderer.setSize(128, 128, false); thumbRenderer.outputEncoding = THREE.sRGBEncoding; thumbRenderer.setClearColor(0x000000, 0);
      }
      const ts = new THREE.Scene(), clone = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(source) : source.clone();
      clone.position.set(0, 0, 0); clone.rotation.set(0, 0, 0); clone.scale.set(1, 1, 1);
      ts.add(clone); ts.add(new THREE.HemisphereLight(0xffffff, 0x556655, 1.1));
      const key = new THREE.DirectionalLight(0xfff0d0, 1.3); key.position.set(3, 5, 4); ts.add(key);
      const idle = (clips || []).find(c => /^idle/i.test(c.name)) || (clips || [])[0];
      if (idle) { const mx = new THREE.AnimationMixer(clone); mx.clipAction(idle).play(); mx.update(0); }
      clone.updateMatrixWorld(true);
      const box = measurePosedBox(clone);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const cam = new THREE.PerspectiveCamera(30, 1, .01, 1000);
      const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(15)) * .72;   // box-sphere overestimates, so frame a bit tighter
      cam.position.copy(sphere.center).add(new THREE.Vector3(.75, .4, 1).normalize().multiplyScalar(dist)); cam.lookAt(sphere.center);
      thumbRenderer.render(ts, cam);
      const img = document.createElement('img'); img.src = thumbRenderer.domElement.toDataURL('image/png'); img.alt = name; img.draggable = false;
      button.appendChild(img); button.title = name;
    } catch (e) { /* a missing portrait just leaves the slot empty */ }
  }
  // Swap the placeholder shapes for the imported wyrmling model (each creature gets its own skinned clone).
  // Animation controller: one per creature. play(name) cross-fades into a clip. Loops (idle, walk, fly) repeat, "die" holds its
  // last frame, and every other clip plays once and then fades back to idle. The AI system can drive creatures through play().
  const animators = [];
  function createAnimator(root, clips) {
    const mixer = new THREE.AnimationMixer(root), actions = {};
    clips.forEach(c => { actions[c.name] = mixer.clipAction(c); });
    const idleName = (clips.find(c => /^idle/i.test(c.name)) || clips[0]).name;
    const kindOf = name => /die/i.test(name) ? 'hold' : /^(idle|walk|run|fly)$/i.test(name) ? 'loop' : 'once';
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
    mixer.addEventListener('finished', e => { if (e.action === current && kindOf(currentName) === 'once') play(currentName === 'take_off' && actions.fly ? 'fly' : idleName, .3); });   // take_off flows into fly
    return { root, label: '', names: Object.keys(actions), actions, play, update: dt => mixer.update(dt), get current() { return currentName; } };
  }
  window.creatureAnimators = animators;   // handy from the browser console: creatureAnimators[0].play('lunge_bite')
  if (window.CF_ASSETS && CF_ASSETS.wyrmling && THREE.GLTFLoader) {
    new THREE.GLTFLoader().load(CF_ASSETS.wyrmling, gltf => {
      const cloneModel = THREE.SkeletonUtils ? m => THREE.SkeletonUtils.clone(m) : m => m.clone();
      const clips = gltf.animations || [], idleClip = clips.find(c => /^idle/i.test(c.name)) || clips[0];
      if (idleClip) { const m0 = new THREE.AnimationMixer(gltf.scene); m0.clipAction(idleClip).play(); m0.update(0); }   // measure the idle pose
      gltf.scene.updateMatrixWorld(true);
      makeThumb(gltf.scene, clips, 1, 'Wyrmling');
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
      avatarRegistry[1] = {name: 'Wyrmling', template: cloneModel(gltf.scene), clips, scale: s, original: null};
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
  // Single imported showcase models placed near the start point. Change height / x / z / turn (radians) to adjust each one.
  function placeShowcase(url, label, height, x, z, turn, slot) {
    if (!url || !THREE.GLTFLoader) return;
    new THREE.GLTFLoader().load(url, gltf => {
      const model = gltf.scene;
      model.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } });
      model.updateMatrixWorld(true);
      makeThumb(model, gltf.animations, slot, label);   // before scaling, so the portrait uses the untouched model
      const template = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(model) : model.clone();
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const s = height / size.y;
      model.scale.setScalar(s); model.position.set(-center.x * s, -box.min.y * s, -center.z * s);   // centered, feet on the ground
      const holder = new THREE.Group(); holder.position.set(x, 0, z); holder.rotation.y = turn;
      holder.add(model); scene.add(holder);
      avatarRegistry[slot] = {name: label, template, clips: gltf.animations || [], scale: s, original: holder};
      // Listed in the animation panel even with no clips, so Tab can still select it.
      const clips = gltf.animations || [];
      const anim = clips.length ? createAnimator(model, clips) : { root: model, names: [], actions: {}, play: () => false, update: () => {}, current: null };
      if (clips.length) anim.play((clips.find(c => /^idle/i.test(c.name)) || clips[0]).name, 0);
      anim.label = label; animators.push(anim);
    }, undefined, () => {});
  }
  if (window.CF_ASSETS) {
    placeShowcase(CF_ASSETS.irithigrib, 'Irithigrib', 3, 4, 2, Math.PI * .85, 2);    // turned to face the start point
    placeShowcase(CF_ASSETS.lemora, 'Lemora', 23.4, -12, -4, -Math.PI * .85, 3);
  }
  let eyeHeight = 1.7, avatar = null, thirdPerson = false, camZoom = .4;   // camZoom: third-person distance as a fraction of the model's size; the scroll wheel changes it   // F5 toggles third-person (only while playing as a model)
    // avatar = the model the player currently controls (null = free camera)
  window.cfDebug=()=>({y:player.y,ground:player.ground,eye:eyeHeight,flying,vertical:player.vertical});   // console helper
  const player={ground:0,x:0,z:10,y:1.7,vertical:0,yaw:0,pitch:0}; const keys=new Set(); let locked=false, started=false, flying=false;   // F toggles flying: look to steer, W/S move along the view, Space up, C down
  // Playing as a model: the camera sits at the model's head, and the model walks/runs/idles with the player.
  function clearAvatar() {
    if (!avatar) return;
    scene.remove(avatar.holder); const i = animators.indexOf(avatar.anim); if (i >= 0) animators.splice(i, 1);
    if (avatar.entry.original) avatar.entry.original.visible = true;
    avatar = null; eyeHeight = 1.7; camera.near = .1; camera.updateProjectionMatrix();
  }
  function switchAvatar(index) {
    const entry = avatarRegistry[index]; if (!entry || (avatar && avatar.entry === entry)) return;
    clearAvatar();
    const clone = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(entry.template) : entry.template.clone();
    clone.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; } });
    const clips = entry.clips, anim = clips.length ? createAnimator(clone, clips) : null;
    if (anim) { anim.label = entry.name; anim.play((clips.find(c => /^idle/i.test(c.name)) || clips[0]).name, 0); anim.update(0); }
    clone.updateMatrixWorld(true);
    const box = measurePosedBox(clone), center = box.getCenter(new THREE.Vector3()), head = new THREE.Vector3();
    // Head position: a bone/node named "head", else the average of the eye nodes, else the top of the model.
    let headNode = null; const eyes = [];
    clone.traverse(o => { if (!headNode && /^head$/i.test(o.name)) headNode = o; if (/^eye_[lr]\d?$/i.test(o.name)) eyes.push(o); });
    if (headNode) headNode.getWorldPosition(head);
    else if (eyes.length) { const q = new THREE.Vector3(); eyes.forEach(e => head.add(e.getWorldPosition(q))); head.divideScalar(eyes.length); }
    else head.set(center.x, box.max.y, center.z);
    head.y += (box.max.y - box.min.y) * HEAD_LIFT;   // a head joint sits at the base of the skull; eyes are a little higher
    // The model's front is whichever way its head lies from its middle (found automatically, so any model orientation works).
    let fx = head.x - center.x, fz = head.z - center.z; if (Math.hypot(fx, fz) < 1e-3) { fx = 0; fz = 1; }
    // Put the camera just ahead of the snout tip, at head height, so the model's own face is not in the way.
    const flen = Math.hypot(fx, fz) || 1, ux = fx / flen, uz = fz / flen; let tip = 0;
    [box.min.x, box.max.x].forEach(x => [box.min.z, box.max.z].forEach(z => { tip = Math.max(tip, (x - center.x) * ux + (z - center.z) * uz); }));
    const span = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
    const sc = entry.scale; clone.scale.setScalar(sc); clone.position.set(-center.x * sc, -box.min.y * sc, -center.z * sc);
    const holder = new THREE.Group(); holder.add(clone); scene.add(holder);
    if (entry.original) entry.original.visible = false;   // the world copy of this creature becomes the player
    if (anim) animators.push(anim);
    avatar = {entry, holder, anim, angle: Math.atan2(fx, fz), headForward: (Math.max(tip, flen) + span * .03) * sc, size: span * sc, state: 'idle'};
    eyeHeight = (head.y - box.min.y) * sc;
    camera.near = Math.min(.1, eyeHeight * .04); camera.updateProjectionMatrix();   // small creatures need a closer near plane
    player.y = player.ground + eyeHeight; player.vertical = 0;
    document.querySelectorAll('#actionbar .slot').forEach((b, i) => b.classList.toggle('active', i === index));
  }
  const HEAD_LIFT = .04;
  // Called every frame: put the model under the player and pick walk / run / idle from how they are moving.
  function syncAvatar(moving, running) {
    if (!avatar) return;
    avatar.holder.position.set(player.x, player.y - eyeHeight, player.z);
    avatar.holder.rotation.y = player.yaw + Math.PI - avatar.angle;
    if (avatar.anim) {
      const an = avatar.anim, names = an.names, cur = an.current, loops = /^(idle|walk|run|fly)$/i;
      // A clip picked from the panel / hotkeys is "pinned": attacks play out, and looping clips (fly, idle...) stay until you start or stop moving.
      if (avatar.pin) {
        if (cur === avatar.pin) { if (!loops.test(cur) || moving === avatar.pinMoving) return; avatar.pin = null; }
        else if (avatar.pin === 'take_off' && cur === 'fly') { avatar.pin = 'fly'; avatar.pinMoving = moving; return; }
        else avatar.pin = null;
      }
      const want = flying && names.includes('fly') ? 'fly' : moving ? (running && names.includes('run') ? 'run' : 'walk') : 'idle';
      if (want !== cur && names.includes(want) && (!cur || loops.test(cur) || (/^die$/i.test(cur) && moving))) an.play(want);
    }
  }
  const slotButtons = document.querySelectorAll('#actionbar .slot');
  slotButtons.forEach((b, i) => b.addEventListener('click', () => switchAvatar(i)));
  window.switchAvatar = switchAvatar;   // handy from the browser console
  // Animation test panel: click a button to play that clip on every creature. ` (backtick) shows or hides it.
  // While the mouse is captured for looking around, press Esc to get the cursor back before clicking.
  const animPanel = document.createElement('div');
  animPanel.style.cssText = 'position:fixed;right:14px;bottom:14px;padding:10px;background:rgba(10,20,20,.72);color:#e8fff6;font:12px/1.4 system-ui,sans-serif;border-radius:10px;z-index:20;display:flex;flex-direction:column;gap:5px;min-width:150px';
  animPanel.addEventListener('pointerdown', e => e.stopPropagation());
  animPanel.addEventListener('click', e => e.stopPropagation());
  document.body.appendChild(animPanel);
  let panelNames = '', selected = null;   // selected = name of the model type whose animations the panel shows (Tab cycles types)
  // Models are grouped by type (all wyrmlings are one type, Irithigrib is another). Tab cycles types; clips play on every model of the type.
  // Hotkeys for the panel's clips (top 1-9/0 keys pick the model you play as, so clips use these letters): button N -> key.
  const ANIM_KEYS = ['KeyQ', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'KeyG', 'KeyH', 'KeyJ'];
  // While playing as a model, panel clips go to that model only; otherwise to every model of the selected type.
  const pinClip = name => { if (avatar) { avatar.pin = name; avatar.pinMoving = ['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(c => keys.has(c)); } };
  const animGroup = () => avatar && avatar.anim && avatar.entry.name === selected ? [avatar.anim] : animators.filter(x => x.label === selected);
  const modelTypes = () => [...new Set(animators.map(x => x.label))];
  function refreshAnimPanel() {
    const types = modelTypes(); if (avatar) selected = avatar.entry.name; if (!types.includes(selected)) selected = types[0] || null;
    const group = animGroup(), a = group[0];
    const key = selected + '#' + (a ? a.names.join('|') : '') + '#' + types.length + '#' + (avatar ? 'p' : '');
    if (key !== panelNames) {   // rebuild the buttons only when the model type or clip list changes
      panelNames = key; animPanel.textContent = '';
      const title = document.createElement('div'); title.style.cssText = 'font-weight:700;letter-spacing:.04em;margin-bottom:2px';
      title.textContent = a ? (avatar ? 'Playing as ' + selected : 'Model ' + (types.indexOf(selected) + 1) + '/' + types.length + ': ' + selected + '  (Tab = next model)') : 'Creature models loading…'; animPanel.appendChild(title);
      if (a) a.names.forEach((n, i) => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.clip = n; btn.textContent = (ANIM_KEYS[i] ? ANIM_KEYS[i].slice(3) + '  ' : '') + n;
        btn.style.cssText = 'text-align:left;padding:5px 9px;border:1px solid rgba(255,255,255,.25);border-radius:6px;background:rgba(255,255,255,.08);color:inherit;font:inherit;cursor:pointer';
        btn.addEventListener('click', () => { pinClip(n); animGroup().forEach(x => x.play(n)); refreshAnimPanel(); });
        animPanel.appendChild(btn);
      });
      if (a && !a.names.length) { const note = document.createElement('div'); note.style.opacity = '.75'; note.textContent = 'This model has no animations.'; animPanel.appendChild(note); }
    }
    animPanel.querySelectorAll('button[data-clip]').forEach(btn => { const on = a && a.current === btn.dataset.clip; btn.style.background = on ? 'rgba(88,240,200,.45)' : 'rgba(255,255,255,.08)'; });
  }
  refreshAnimPanel();
  window.addEventListener('keydown', e => {
    if (e.code === 'F5') { e.preventDefault(); if (started) thirdPerson = !thirdPerson; return; }   // F5 switches first/third person instead of reloading
    if (e.code === 'KeyF' && started) { flying = !flying; player.vertical = 0; return; }
    if (e.code === 'Backquote') { animPanel.style.display = animPanel.style.display === 'none' ? 'flex' : 'none'; return; }
    if (started) { const m = /^Digit(\d)$/.exec(e.code); if (m) { switchAvatar((+m[1] + 9) % 10); return; } }   // number keys pick the model you play as (slot 1..0)
    if (animPanel.style.display === 'none') return;   // panel hidden: Tab does nothing
    const types = modelTypes();
    const ai = ANIM_KEYS.indexOf(e.code);
    if (ai >= 0 && !e.ctrlKey && !e.metaKey) { const g = animGroup(), name = g[0] && g[0].names[ai]; if (name) { pinClip(name); g.forEach(x => x.play(name)); refreshAnimPanel(); } return; }
    if (e.code === 'Tab') { e.preventDefault(); if (types.length && !avatar) { selected = types[(types.indexOf(selected) + (e.shiftKey ? types.length - 1 : 1)) % types.length]; refreshAnimPanel(); } return; }
  });
  // Scroll wheel zooms the third-person camera in and out.
  window.addEventListener('wheel', e => { if (!started || !avatar || !thirdPerson) return; e.preventDefault(); camZoom = Math.min(2, Math.max(.08, camZoom * Math.exp(e.deltaY * .0012))); }, {passive: false});
  setInterval(refreshAnimPanel, 250);
  function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();} window.addEventListener('resize',resize);resize();
  // Creature Fights is a placeholder for now; Explore Mode (the Enter button) starts the existing game.
  const fightButton = document.getElementById('fight');
  if (fightButton) fightButton.addEventListener('click', () => { status.textContent = 'Creature Fights is coming soon. Try Explore Mode for now!'; });
  enter.addEventListener('click',()=>{started=true;overlay.hidden=true;const bar=document.getElementById('actionbar');if(bar)bar.classList.add('show');if(canvas.requestPointerLock && !('ontouchstart' in window)) canvas.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;});
  canvas.addEventListener('click',()=>{if(started && !locked && canvas.requestPointerLock && !('ontouchstart' in window)) canvas.requestPointerLock();});
  document.addEventListener('mousemove',e=>{if(locked){player.yaw-=e.movementX*.002;player.pitch=Math.max(-1.2,Math.min(1.2,player.pitch-e.movementY*.002));}});
  window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();keys.add(e.code);});
  window.addEventListener('keyup',e=>keys.delete(e.code)); window.addEventListener('blur',()=>keys.clear());
  let touchX=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchX=e.clientX;});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch' && touchX!==null){player.yaw-=(e.clientX-touchX)*.008;touchX=e.clientX;}});canvas.addEventListener('pointerup',()=>touchX=null);canvas.addEventListener('pointercancel',()=>touchX=null);
  document.querySelectorAll('[data-key]').forEach(button=>{const key=button.dataset.key;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key);}); ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>keys.delete(key)));});
  let previous=performance.now(); function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(started){const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0), strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);const length=Math.hypot(forward,strafe)||1;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?(flying?30:15):(flying?18:9))*dt/length, fp=flying?Math.cos(player.pitch):1;player.x+=(-Math.sin(player.yaw)*forward*fp+Math.cos(player.yaw)*strafe)*speed;player.z+=(-Math.cos(player.yaw)*forward*fp-Math.sin(player.yaw)*strafe)*speed;if(flying)player.y+=Math.sin(player.pitch)*forward*speed;const distance=Math.hypot(player.x,player.z);if(distance>68){player.x*=68/distance;player.z*=68/distance;} if(!volcanoMeshes.length){const vx=player.x-volcanoBlock.x,vz=player.z-volcanoBlock.z,vd=Math.hypot(vx,vz);if(vd<volcanoBlock.r){const k=volcanoBlock.r/(vd||1);player.x=volcanoBlock.x+(vd?vx*k:volcanoBlock.r);player.z=volcanoBlock.z+(vd?vz*k:0);}}
      player.ground+=(groundHeight(player.x,player.z)-player.ground)*Math.min(1,dt*18);const floor=eyeHeight+player.ground;
      if(flying){player.vertical=0;player.y+=((keys.has('Space')?1:0)-(keys.has('KeyC')?1:0))*(keys.has('ShiftLeft')||keys.has('ShiftRight')?24:14)*dt;player.y=Math.min(150,Math.max(floor,player.y));}
      else{if(keys.has('Space')&&player.y<=floor+.02){player.vertical=7;}player.vertical-=18*dt;player.y=Math.max(floor,player.y+player.vertical*dt);if(player.y<=floor)player.vertical=0;}}
    if(started){syncAvatar(keys.has('KeyW')||keys.has('KeyS')||keys.has('KeyA')||keys.has('KeyD')||keys.has('ArrowUp')||keys.has('ArrowDown')||keys.has('ArrowLeft')||keys.has('ArrowRight'),keys.has('ShiftLeft')||keys.has('ShiftRight'));}
    animators.forEach(a=>a.update(dt)); if(volcanoFx)volcanoFx(dt);
    if(avatar&&thirdPerson){   // orbit behind the model: look where the player looks, stand back along that line
      const cp=Math.cos(player.pitch),fx=-Math.sin(player.yaw)*cp,fy=Math.sin(player.pitch),fz=-Math.cos(player.yaw)*cp,dist=Math.max(avatar.size*camZoom,.6);
      const ty=player.y-eyeHeight*.15; camera.position.set(player.x-fx*dist,Math.max(player.ground+.15,ty-fy*dist),player.z-fz*dist);
    } else camera.position.set(player.x+(avatar?-Math.sin(player.yaw)*avatar.headForward:0),player.y,player.z+(avatar?-Math.cos(player.yaw)*avatar.headForward:0));
    camera.rotation.order='YXZ';camera.rotation.set(player.pitch,player.yaw,0);skyDome.position.copy(camera.position);renderer.render(scene,camera);
  } requestAnimationFrame(frame);
})();


