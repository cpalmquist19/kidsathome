const rt={rock:{id:"rock",name:"Rock (basalt)",behavior:"brittle",density:2700,soundSpeed:5e3,strength:2e7,restitution:.5,meltEnergy:16e5,vaporEnergy:16e6,disruptionFamily:"rock",strengthFactor:1,color:"#8b7468"},iron:{id:"iron",name:"Iron / steel",behavior:"ductile",density:7800,soundSpeed:5e3,strength:35e7,restitution:.6,meltEnergy:95e4,vaporEnergy:8e6,disruptionFamily:"rock",strengthFactor:6,color:"#9aa3ad"},ice:{id:"ice",name:"Ice",behavior:"brittle",density:920,soundSpeed:3500,strength:2e6,restitution:.4,meltEnergy:38e4,vaporEnergy:31e5,disruptionFamily:"ice",strengthFactor:1,color:"#cfe8f5"},glass:{id:"glass",name:"Glass",behavior:"brittle",density:2500,soundSpeed:5400,strength:4e7,restitution:.8,meltEnergy:14e5,vaporEnergy:12e6,disruptionFamily:"rock",strengthFactor:.3,color:"#b9dbe8"},hardPlastic:{id:"hardPlastic",name:"Hard plastic",behavior:"ductile",density:1400,soundSpeed:2e3,strength:5e7,restitution:.6,meltEnergy:5e5,vaporEnergy:3e6,ignitionEnergy:5e5,disruptionFamily:"rock",strengthFactor:6,color:"#814bd1"},rubber:{id:"rubber",name:"Rubber",behavior:"elastic",density:1100,soundSpeed:1e3,strength:2e7,restitution:.85,meltEnergy:4e5,vaporEnergy:3e6,ignitionEnergy:4e5,disruptionFamily:"rock",strengthFactor:10,color:"#d9482b"},leatherCork:{id:"leatherCork",name:"Leather and cork",behavior:"soft",density:700,soundSpeed:600,strength:5e6,restitution:.5,meltEnergy:4e5,vaporEnergy:3e6,ignitionEnergy:35e4,disruptionFamily:"rock",strengthFactor:6,color:"#f2f1e8"},wood:{id:"wood",name:"Wood",behavior:"brittle",density:600,soundSpeed:3500,strength:2e7,restitution:.4,meltEnergy:1e6,vaporEnergy:1e7,ignitionEnergy:44e4,disruptionFamily:"rock",strengthFactor:1.5,color:"#a9784a"},concrete:{id:"concrete",name:"Concrete",behavior:"brittle",density:2400,soundSpeed:3700,strength:1e7,restitution:.3,meltEnergy:15e5,vaporEnergy:15e6,disruptionFamily:"rock",strengthFactor:.6,color:"#9a9a96"},ceramic:{id:"ceramic",name:"Eggshell / thin ceramic",behavior:"brittle",density:2400,soundSpeed:5e3,strength:5e5,restitution:.3,meltEnergy:15e5,vaporEnergy:14e6,disruptionFamily:"rock",strengthFactor:.03,color:"#f1e6d0"},aluminum:{id:"aluminum",name:"Aluminium",behavior:"ductile",density:2700,soundSpeed:5100,strength:25e7,restitution:.5,meltEnergy:1e6,vaporEnergy:11e6,disruptionFamily:"rock",strengthFactor:4,color:"#c9ced4"},copper:{id:"copper",name:"Copper",behavior:"ductile",density:8960,soundSpeed:3900,strength:2e8,restitution:.5,meltEnergy:6e5,vaporEnergy:53e5,disruptionFamily:"rock",strengthFactor:3,color:"#c26a3d"},gold:{id:"gold",name:"Gold",behavior:"ductile",density:19300,soundSpeed:3200,strength:12e7,restitution:.4,meltEnergy:23e4,vaporEnergy:17e5,disruptionFamily:"rock",strengthFactor:2,color:"#e0b43b"},lead:{id:"lead",name:"Lead",behavior:"ductile",density:11340,soundSpeed:1200,strength:2e7,restitution:.1,meltEnergy:12e4,vaporEnergy:9e5,disruptionFamily:"rock",strengthFactor:1.5,color:"#5d646d"},diamond:{id:"diamond",name:"Diamond",behavior:"brittle",density:3510,soundSpeed:12e3,strength:1e9,restitution:.9,meltEnergy:2e7,vaporEnergy:6e7,disruptionFamily:"rock",strengthFactor:8,color:"#cfeefb"},organic:{id:"organic",name:"Fruit and other soft stuff",behavior:"brittle",density:1e3,soundSpeed:1500,strength:3e5,restitution:.1,meltEnergy:3e5,vaporEnergy:26e5,disruptionFamily:"ice",strengthFactor:.3,color:"#d96b2b"},gas:{id:"gas",name:"Gas and cloud",behavior:"fluid",density:1,soundSpeed:1e3,strength:1e3,restitution:0,meltEnergy:1e7,vaporEnergy:1e8,disruptionFamily:"ice",strengthFactor:.01,color:"#d9b98a"},plasma:{id:"plasma",name:"Star plasma",behavior:"fluid",density:.001,soundSpeed:1e4,strength:1e3,restitution:0,meltEnergy:1e9,vaporEnergy:1e10,disruptionFamily:"ice",strengthFactor:.01,color:"#ffd27a"},degenerate:{id:"degenerate",name:"Ultra-dense matter",behavior:"brittle",density:1e12,soundSpeed:1e8,strength:1e25,restitution:0,meltEnergy:1e12,vaporEnergy:1e13,disruptionFamily:"rock",strengthFactor:1e6,color:"#cfe0ff"},singularity:{id:"singularity",name:"Black hole",behavior:"hole",density:1e18,soundSpeed:3e8,strength:1e40,restitution:0,meltEnergy:1e20,vaporEnergy:1e21,disruptionFamily:"rock",strengthFactor:1e12,color:"#000000"}},nr=66743e-15,rs=9.80665,Ku=4184e9,En=2998e5,wa=(i,e)=>.6*nr*i/e;function ju(i,e,t,n){return Math.min(Math.sqrt(2*nr*(i+t)/(e+n)),.99*En)}function Zu(i){const e=Math.min(i/En,.999999);if(e<.01)return i*(1+.375*e*e);const t=1/Math.sqrt(1-e*e);return En*Math.sqrt(2*(t-1))}const Vn=(i,e,t)=>Math.min(t,Math.max(e,i)),as=(i,e,t)=>Vn((i-e)/(t-e),0,1),Yt=i=>Number.isNaN(i)?0:Number.isFinite(i)?i:i>0?1e300:-1e300;function dl(i,e){const t=Math.min(i,e),n=Math.max(i,e);return t/(1+t/n)}const Ju=i=>4/3*Math.PI*i*i*i,br=(i,e)=>i/e/e/e/(4/3*Math.PI),Qu=1602176634e-28;function eh(i){const e=i.mass??rt[i.material].density*Ju(i.radius),t={id:i.id,name:i.name,emoji:i.emoji,radius:i.radius,mass:e,material:i.material,blurb:i.blurb,group:i.group??"Custom"};return i.shownMass&&(t.shownMass=i.shownMass),i.shownRadius&&(t.shownRadius=i.shownRadius),i.length!==void 0&&(t.length=i.length),i.temperatureC!==void 0&&(t.temperatureC=i.temperatureC),i.antimatter&&(t.antimatter=!0),i.special&&(t.special=i.special),i.blastJ!==void 0&&(t.blastJ=i.blastJ),i.blastKind&&(t.blastKind=i.blastKind),i.energyEv!==void 0&&(t.energyEv=i.energyEv,t.lorentzGamma=1+i.energyEv*Qu/(e*En*En)),t}const th=["Tiny","Cosmic-ray particles","Everyday","Heavy","Vehicles and buildings","Space rocks","Moons and planets","Bigger planets","Stars","Extreme objects","Nebulae and clusters","Galaxies","Giant structures","Monster black holes","Beyond the universe","Cosmic powers"],fl="Cosmic-ray particles",fi="Tiny",mt="Everyday",Br="Heavy",Tn="Vehicles and buildings",an="Space rocks",It="Moons and planets",$t="Bigger planets",Nt="Stars",pi="Extreme objects",fn="Nebulae and clusters",pn="Galaxies",Gt="Giant structures",jn="Monster black holes",Zt="Beyond the universe",Zn="Cosmic powers",Ut=" (Treated as a ball with the same mass.)",nh=[{id:"dust",name:"Dust grain",emoji:"✨",radius:5e-6,material:"rock",group:fi,blurb:"A 10-micrometre speck of rock, like the grains in a meteor shower."},{id:"sand",name:"Sand grain",emoji:"🏖️",radius:3e-4,material:"rock",group:fi,blurb:"A 0.6 mm grain of sand."},{id:"bbPellet",name:"BB pellet",emoji:"🔹",radius:.00225,material:"iron",group:fi,blurb:"A 4.5 mm steel airgun pellet."},{id:"bullet",name:"Lead bullet",emoji:"🔫",radius:.005,mass:.008,material:"lead",group:fi,blurb:"A soft lead slug, about 8 g."},{id:"diamond",name:"Diamond",emoji:"💎",radius:.005,material:"diamond",group:fi,blurb:"A 1 cm diamond, the hardest thing in the list."},{id:"pebble",name:"Pebble",emoji:"⚪",radius:.01,material:"rock",group:fi,blurb:"A 2 cm pebble from a stream."},{id:"marble",name:"Glass marble",emoji:"🔮",radius:.0085,material:"glass",group:fi,blurb:"A 1.7 cm toy marble."},{id:"pingPong",name:"Ping-pong ball",emoji:"🏓",radius:.02,mass:.0027,material:"hardPlastic",group:mt,blurb:"A hollow plastic ball, only 2.7 g."},{id:"hailstone",name:"Hailstone",emoji:"🧊",radius:.02,material:"ice",group:mt,blurb:"A 4 cm chunk of ice."},{id:"golfBall",name:"Golf ball",emoji:"⛳",radius:.0213,mass:.0459,material:"hardPlastic",group:mt,blurb:"A 46 g golf ball."},{id:"egg",name:"Egg",emoji:"🥚",radius:.025,mass:.06,material:"ceramic",group:mt,blurb:"A hen's egg: a very thin shell around something soft."},{id:"rubberBall",name:"Super ball",emoji:"🟠",radius:.03,material:"rubber",group:mt,blurb:"A very bouncy rubber ball."},{id:"lightBulb",name:"Light bulb",emoji:"💡",radius:.03,mass:.04,material:"glass",group:mt,blurb:"A thin glass bulb."},{id:"tennisBall",name:"Tennis ball",emoji:"🎾",radius:.0335,mass:.058,material:"rubber",group:mt,blurb:"A 58 g tennis ball."},{id:"baseball",name:"Baseball",emoji:"⚾",radius:.0366,mass:.145,material:"leatherCork",group:mt,blurb:"A regulation baseball, 145 g."},{id:"snowball",name:"Snowball",emoji:"☃️",radius:.04,mass:.12,material:"ice",group:mt,blurb:"A packed snowball."},{id:"rubberDuck",name:"Rubber duck",emoji:"🦆",radius:.05,mass:.05,material:"rubber",group:mt,blurb:"A squeaky bath duck, as a ball."},{id:"woodBall",name:"Wooden ball",emoji:"🪵",radius:.05,material:"wood",group:mt,blurb:"A solid wooden ball."},{id:"goldBar",name:"Gold bar",emoji:"🪙",radius:.0535,mass:12.4,material:"gold",group:mt,blurb:"A 12.4 kg gold bar."+Ut},{id:"cannonball",name:"Cannonball",emoji:"💣",radius:.06,material:"iron",group:mt,blurb:"A solid iron ball, about 7 kg."},{id:"brick",name:"Brick",emoji:"🧱",radius:.07,mass:2.5,material:"concrete",group:mt,blurb:"A house brick."+Ut},{id:"bowling",name:"Bowling ball",emoji:"🎳",radius:.1085,mass:7,material:"hardPlastic",group:mt,blurb:"A 7 kg bowling ball."},{id:"soccerBall",name:"Soccer ball",emoji:"⚽",radius:.11,mass:.43,material:"leatherCork",group:mt,blurb:"A size-5 football, 430 g."},{id:"anvil",name:"Anvil",emoji:"⚒️",radius:.12,mass:50,material:"iron",group:mt,blurb:"A 50 kg blacksmith's anvil."+Ut},{id:"basketball",name:"Basketball",emoji:"🏀",radius:.12,mass:.62,material:"rubber",group:mt,blurb:"A 620 g basketball."},{id:"watermelon",name:"Watermelon",emoji:"🍉",radius:.15,mass:6,material:"organic",group:mt,blurb:"A 6 kg watermelon."},{id:"pumpkin",name:"Pumpkin",emoji:"🎃",radius:.2,mass:8,material:"organic",group:mt,blurb:"An 8 kg pumpkin."},{id:"wreckingBall",name:"Wrecking ball",emoji:"🏗️",radius:.4,material:"iron",group:Br,blurb:"A steel demolition ball, about 2 tonnes."},{id:"piano",name:"Grand piano",emoji:"🎹",radius:.7,mass:300,material:"wood",group:Br,blurb:"A 300 kg grand piano."+Ut},{id:"boulder",name:"Boulder",emoji:"🪨",radius:1,material:"rock",group:Br,blurb:"A 2 m rock, about 11 tonnes."},{id:"car",name:"Car",emoji:"🚗",radius:1.3,mass:1500,material:"iron",group:Br,blurb:"A 1.5 tonne family car."+Ut},{id:"bus",name:"School bus",emoji:"🚌",radius:3.5,mass:12e3,material:"iron",group:Tn,blurb:"A 12 tonne school bus."+Ut},{id:"house",name:"House",emoji:"🏠",radius:6,mass:8e4,material:"wood",group:Tn,blurb:"A wooden house, about 80 tonnes."+Ut},{id:"shuttle",name:"Space Shuttle",emoji:"🚀",radius:9,mass:78e3,material:"aluminum",group:Tn,blurb:"An orbiter, about 78 tonnes."+Ut},{id:"liberty",name:"Statue of Liberty",emoji:"🗽",radius:10,mass:204e3,material:"copper",group:Tn,blurb:"204 tonnes of copper and steel."+Ut},{id:"boeing",name:"Jumbo jet",emoji:"✈️",radius:12,mass:18e4,material:"aluminum",group:Tn,blurb:"An empty Boeing 747, 180 tonnes."+Ut},{id:"iss",name:"Space Station",emoji:"🛰️",radius:25,mass:42e4,material:"aluminum",group:Tn,blurb:"The International Space Station, 420 tonnes."+Ut},{id:"eiffel",name:"Eiffel Tower",emoji:"🗼",radius:40,mass:101e5,material:"iron",group:Tn,blurb:"10,000 tonnes of wrought iron."+Ut},{id:"titanic",name:"Titanic",emoji:"🚢",radius:50,mass:52e6,material:"iron",group:Tn,blurb:"A 52,000 tonne ocean liner."+Ut},{id:"pyramid",name:"Great Pyramid",emoji:"🔺",radius:86,mass:59e8,material:"rock",group:Tn,blurb:"About 6 million tonnes of stone."+Ut},{id:"empire",name:"Empire State Building",emoji:"🏙️",radius:100,mass:33e7,material:"concrete",group:Tn,blurb:"About 330,000 tonnes."+Ut},{id:"chelyabinsk",name:"Chelyabinsk meteor",emoji:"☄️",radius:9.5,mass:12e6,material:"rock",group:an,blurb:"The 2013 Russian fireball: 19 m, 12,000 tonnes."},{id:"ironMeteoroid",name:"Iron meteoroid",emoji:"🌠",radius:25,material:"iron",group:an,blurb:"50 m of solid iron, like the one that dug Arizona's Meteor Crater."},{id:"tunguska",name:"Tunguska rock",emoji:"🌲",radius:30,material:"rock",group:an,blurb:"A 60 m stony rock like the one that flattened Siberian forest in 1908."},{id:"oumuamua",name:"ʻOumuamua",emoji:"🥖",radius:33,mass:4e8,material:"rock",group:an,blurb:"The first interstellar visitor, a stretched rock about 230 m long."+Ut},{id:"apophis",name:"Apophis",emoji:"🪐",radius:170,mass:61e9,material:"rock",group:an,blurb:"A 340 m asteroid that passes close to Earth in 2029."},{id:"bennu",name:"Bennu",emoji:"🌑",radius:245,mass:73e9,material:"rock",group:an,blurb:"A loose pile of rubble about 490 m across."},{id:"ryugu",name:"Ryugu",emoji:"🥌",radius:435,mass:45e10,material:"rock",group:an,blurb:"A rubble-pile asteroid, 870 m across."},{id:"comet",name:"Comet nucleus",emoji:"💫",radius:2e3,mass:2e13,material:"ice",group:an,blurb:"A 4 km ball of porous dirty ice."},{id:"asteroid",name:"Asteroid (10 km)",emoji:"🌌",radius:5e3,mass:157e13,material:"rock",group:an,blurb:"About the size of the object that ended the dinosaurs."},{id:"halley",name:"Halley's Comet",emoji:"🌟",radius:5500,mass:22e13,material:"ice",group:an,blurb:"The famous 11 km comet that returns every 76 years."},{id:"phobos",name:"Phobos",emoji:"🥔",radius:11e3,mass:107e14,material:"rock",group:an,blurb:"The larger moon of Mars, a dark rocky potato."},{id:"eros",name:"Eros",emoji:"🌓",radius:8400,mass:67e14,material:"rock",group:an,blurb:"A 34 km asteroid near Earth."},{id:"enceladus",name:"Enceladus",emoji:"🧊",radius:252e3,mass:108e18,material:"ice",group:It,blurb:"An icy moon of Saturn that sprays water into space."},{id:"vesta",name:"Vesta",emoji:"⚪",radius:263e3,mass:259e18,material:"rock",group:It,blurb:"The second-biggest asteroid, 525 km wide."},{id:"ceres",name:"Ceres",emoji:"⚫",radius:473e3,mass:938e18,material:"rock",group:It,blurb:"The largest asteroid, a dwarf planet."},{id:"charon",name:"Charon",emoji:"🌘",radius:606e3,mass:1586e18,material:"ice",group:It,blurb:"Pluto's big moon."},{id:"pluto",name:"Pluto",emoji:"❄️",radius:1188300,mass:1303e19,material:"ice",group:It,blurb:"A dwarf planet of ice and rock."},{id:"triton",name:"Triton",emoji:"🩵",radius:1353400,mass:214e20,material:"ice",group:It,blurb:"Neptune's big frozen moon."},{id:"europa",name:"Europa",emoji:"🥶",radius:1560800,mass:48e21,material:"ice",group:It,blurb:"Jupiter's icy moon with an ocean underneath."},{id:"moon",name:"Moon",emoji:"🌙",radius:1737400,mass:7346e19,material:"rock",group:It,blurb:"Earth's Moon."},{id:"io",name:"Io",emoji:"🌋",radius:1821600,mass:893e20,material:"rock",group:It,blurb:"Jupiter's volcanic yellow moon."},{id:"callisto",name:"Callisto",emoji:"🌑",radius:2410300,mass:1076e20,material:"ice",group:It,blurb:"Jupiter's heavily cratered moon."},{id:"mercury",name:"Mercury",emoji:"☿️",radius:2439700,mass:3301e20,material:"rock",group:It,blurb:"The smallest planet, closest to the Sun."},{id:"titan",name:"Titan",emoji:"🟠",radius:2574700,mass:1345e20,material:"ice",group:It,blurb:"Saturn's big moon with a thick orange haze."},{id:"ganymede",name:"Ganymede",emoji:"🪨",radius:2634100,mass:1482e20,material:"ice",group:It,blurb:"The largest moon in the Solar System."},{id:"mars",name:"Mars",emoji:"🔴",radius:3389500,mass:6417e20,material:"rock",group:It,blurb:"The red planet."},{id:"venus",name:"Venus",emoji:"🟡",radius:6051800,mass:4867e21,material:"rock",group:It,blurb:"Earth's hot, cloudy twin."},{id:"earth",name:"Earth",emoji:"🌍",radius:6371e3,mass:5972e21,material:"rock",group:It,blurb:"Our home planet."},{id:"proximab",name:"Proxima b",emoji:"🪐",radius:7e6,mass:64e23,material:"rock",group:$t,blurb:"A rocky planet circling the nearest star to the Sun."},{id:"kepler452b",name:"Kepler-452b",emoji:"🌱",radius:10385e3,mass:299e23,material:"rock",group:$t,blurb:"Earth's bigger cousin, 1,800 light-years away."},{id:"cancri55e",name:"55 Cancri e",emoji:"🔥",radius:1198e4,mass:478e23,material:"rock",group:$t,blurb:"A scorching lava world that circles its star in 18 hours."},{id:"superEarth",name:"Super-Earth",emoji:"🌐",radius:127e5,mass:597e23,material:"rock",group:$t,blurb:"A rocky planet twice as wide as Earth and ten times as heavy."},{id:"kepler10c",name:"Kepler-10c",emoji:"🟣",radius:15e6,mass:1e26,material:"rock",group:$t,blurb:`A "mega-Earth", 17 times Earth's mass.`},{id:"gj1214b",name:"GJ 1214 b",emoji:"💧",radius:172e5,mass:39e24,material:"ice",group:$t,blurb:"A water world wrapped in thick steamy air."},{id:"neptune",name:"Neptune",emoji:"🔵",radius:24622e3,mass:1024e23,material:"gas",group:$t,blurb:"A deep-blue ice giant with the fastest winds in the Solar System."},{id:"uranus",name:"Uranus",emoji:"🩵",radius:25362e3,mass:8681e22,material:"gas",group:$t,blurb:"A pale ice giant that rolls around the Sun on its side."},{id:"kepler51d",name:"Kepler-51d",emoji:"🍬",radius:603e5,mass:454e23,material:"gas",group:$t,blurb:'A "cotton-candy" planet as fluffy as foam.'},{id:"saturn",name:"Saturn",emoji:"🪐",radius:58232e3,mass:5683e23,material:"gas",group:$t,blurb:"The ringed gas giant. It is light enough to float in water."},{id:"jupiter",name:"Jupiter",emoji:"🟤",radius:69911e3,mass:1898e24,material:"gas",group:$t,blurb:"The biggest planet: over 1,300 Earths would fit inside."},{id:"hotJupiter",name:"HD 189733 b",emoji:"🔷",radius:797e5,mass:216e25,material:"gas",group:$t,blurb:"A blue hot Jupiter where it rains molten glass sideways."},{id:"brownDwarf",name:"Brown dwarf",emoji:"🟣",radius:75e6,mass:13e28,material:"gas",group:$t,blurb:"A failed star, 70 times heavier than Jupiter but no bigger."},{id:"wasp12b",name:"WASP-12b",emoji:"🥚",radius:133e6,mass:266e25,material:"gas",group:$t,blurb:"A puffy, egg-shaped planet being eaten by its star."},{id:"trappist1",name:"TRAPPIST-1",emoji:"🔴",radius:84e6,mass:177e27,material:"plasma",group:Nt,blurb:"A tiny red dwarf only a little bigger than Jupiter."},{id:"proximaCen",name:"Proxima Centauri",emoji:"🟠",radius:107e6,mass:243e27,material:"plasma",group:Nt,blurb:"The nearest star to the Sun."},{id:"barnard",name:"Barnard's Star",emoji:"🔸",radius:136e6,mass:286e27,material:"plasma",group:Nt,blurb:"A faint red dwarf that races across the sky."},{id:"sun",name:"Sun",emoji:"☀️",radius:6957e5,mass:1989e27,material:"plasma",group:Nt,blurb:"Our star. A million Earths would fit inside."},{id:"sirius",name:"Sirius A",emoji:"⭐",radius:119e7,mass:41e29,material:"plasma",group:Nt,blurb:"The brightest star in our night sky."},{id:"vega",name:"Vega",emoji:"💠",radius:164e7,mass:426e28,material:"plasma",group:Nt,blurb:"A fast-spinning blue-white star."},{id:"pollux",name:"Pollux",emoji:"🌟",radius:61e8,mass:38e29,material:"plasma",group:Nt,blurb:"An orange giant with a planet of its own."},{id:"arcturus",name:"Arcturus",emoji:"🧡",radius:177e8,mass:215e28,material:"plasma",group:Nt,blurb:"A swollen orange giant, 25 Suns wide."},{id:"r136a1",name:"R136a1",emoji:"💙",radius:28e9,mass:63e31,material:"plasma",group:Nt,blurb:"The heaviest known star: about 300 Suns of mass."},{id:"aldebaran",name:"Aldebaran",emoji:"🔶",radius:306e8,mass:23e29,material:"plasma",group:Nt,blurb:"The glowing eye of Taurus the bull."},{id:"rigel",name:"Rigel",emoji:"🔵",radius:549e8,mass:42e30,material:"plasma",group:Nt,blurb:"A blue supergiant 120,000 times brighter than the Sun."},{id:"antares",name:"Antares",emoji:"❤️",radius:473e9,mass:239e29,material:"plasma",group:Nt,blurb:"A red supergiant that would swallow Mars's orbit."},{id:"betelgeuse",name:"Betelgeuse",emoji:"🔴",radius:531e9,mass:328e29,material:"plasma",group:Nt,blurb:"The red supergiant in Orion's shoulder, due to explode someday."},{id:"vycma",name:"VY Canis Majoris",emoji:"🟥",radius:988e9,mass:34e30,material:"plasma",group:Nt,blurb:"A hypergiant 1,400 Suns wide."},{id:"uyScuti",name:"UY Scuti",emoji:"🔴",radius:118e10,mass:18e30,material:"plasma",group:Nt,blurb:"One of the biggest stars ever measured."},{id:"stephenson218",name:"Stephenson 2-18",emoji:"🏆",radius:15e11,mass:4e31,material:"plasma",group:Nt,blurb:"The largest star known, about 2,150 Suns wide."},{id:"siriusB",name:"White dwarf",emoji:"⚪",radius:58e5,mass:203e28,material:"degenerate",group:pi,blurb:"Sirius B: a Sun's mass squeezed into an Earth-sized ball."},{id:"neutronStar",name:"Neutron star",emoji:"💫",radius:12e3,mass:278e28,material:"degenerate",group:pi,blurb:"Heavier than the Sun but only 24 km across. A teaspoon weighs a billion tonnes."},{id:"stellarBH",name:"Black hole (10 Suns)",emoji:"⚫",radius:29500,mass:1989e28,material:"singularity",group:pi,blurb:"The remains of a star, about 59 km across. Nothing escapes it."},{id:"cygnusX1",name:"Cygnus X-1",emoji:"🕳️",radius:62e3,mass:42e30,material:"singularity",group:pi,blurb:"The first black hole ever discovered, 21 Suns of mass."},{id:"sgrA",name:"Sagittarius A*",emoji:"🌀",radius:127e8,mass:855e34,material:"singularity",group:pi,blurb:"The giant black hole at the centre of our galaxy, 4 million Suns."},{id:"m87",name:"M87*",emoji:"🍩",radius:192e11,mass:129e38,material:"singularity",group:pi,blurb:"The first black hole ever photographed: 6.5 billion Suns."},{id:"ton618",name:"TON 618",emoji:"🌌",radius:195e12,mass:131e39,material:"singularity",group:pi,blurb:"One of the heaviest black holes known: 66 billion Suns."},{id:"pillars",name:"Pillars of Creation",emoji:"🏛️",radius:24e15,mass:4e32,material:"gas",group:fn,blurb:"Towers of gas and dust in the Eagle Nebula, about 4 light-years tall, where new stars are forming."},{id:"crab",name:"Crab Nebula",emoji:"🦀",radius:52e15,mass:91e29,material:"gas",group:fn,blurb:"The glowing wreck of a star that exploded in 1054, still expanding."},{id:"orion",name:"Orion Nebula",emoji:"🔥",radius:11e16,mass:4e33,material:"gas",group:fn,blurb:"A stellar nursery 24 light-years across that you can see with the naked eye."},{id:"pleiades",name:"Pleiades cluster",emoji:"✨",radius:2e17,mass:16e32,material:"plasma",group:fn,blurb:"The Seven Sisters: about a thousand young blue stars."},{id:"omegaCen",name:"Omega Centauri",emoji:"🔮",radius:7e17,mass:79e35,material:"plasma",group:fn,blurb:"The biggest globular cluster of the Milky Way, millions of ancient stars in one ball."},{id:"carina",name:"Carina Nebula",emoji:"🌺",radius:14e17,mass:2e36,material:"gas",group:fn,blurb:"A glowing cloud of gas 300 light-years wide that is home to some of the biggest stars known."},{id:"tarantula",name:"Tarantula Nebula",emoji:"🕷️",radius:85e17,mass:1e36,material:"gas",group:fn,blurb:"The brightest star-forming region around, 1,800 light-years across. If it sat where Orion does it would light up the night."},{id:"lmc",name:"Large Magellanic Cloud",emoji:"☁️",radius:66e18,mass:28e39,material:"plasma",group:pn,blurb:"A small galaxy orbiting ours, with 30 billion stars."},{id:"smc",name:"Small Magellanic Cloud",emoji:"🌫️",radius:33e18,mass:14e39,material:"plasma",group:pn,blurb:"A dwarf galaxy and neighbour of the Milky Way."},{id:"m33",name:"Triangulum Galaxy",emoji:"🔺",radius:28e19,mass:8e40,material:"plasma",group:pn,blurb:"The third biggest galaxy in our neighbourhood, 60,000 light-years across."},{id:"m51",name:"Whirlpool Galaxy",emoji:"🌀",radius:36e19,mass:32e40,material:"plasma",group:pn,blurb:"A grand spiral galaxy tangled up with a smaller one."},{id:"milkyWay",name:"Milky Way",emoji:"🌌",radius:47e19,mass:3e42,material:"plasma",group:pn,blurb:"Our galaxy: 100,000 light-years wide, a few hundred billion stars, and a lot of dark matter."},{id:"andromeda",name:"Andromeda Galaxy",emoji:"🪐",radius:104e19,mass:3e42,material:"plasma",group:pn,blurb:"The nearest big galaxy. It is falling toward the Milky Way and they will merge in about 4 billion years."},{id:"m87gal",name:"Messier 87",emoji:"🟡",radius:28e20,mass:12e42,material:"plasma",group:pn,blurb:"A giant elliptical galaxy with a trillion stars and thousands of globular clusters."},{id:"ic1101",name:"IC 1101",emoji:"🏔️",radius:19e21,mass:2e44,material:"plasma",group:pn,blurb:"One of the biggest galaxies known: 4 million light-years across, 100 times the Milky Way."},{id:"localGroup",name:"Local Group",emoji:"👥",radius:47e21,mass:8e42,material:"plasma",group:Gt,blurb:"The Milky Way, Andromeda and about 80 smaller galaxies, 10 million light-years wide."},{id:"virgoSC",name:"Virgo Supercluster",emoji:"🏘️",radius:52e22,mass:3e45,material:"plasma",group:Gt,blurb:"Our home supercluster: more than 100 groups of galaxies, 110 million light-years across."},{id:"virgoCluster",name:"Virgo Cluster",emoji:"🌐",radius:7e22,mass:24e44,material:"plasma",group:Gt,blurb:"About 1,300 galaxies packed together, the heart of our local supercluster."},{id:"coma",name:"Coma Cluster",emoji:"🧲",radius:93e21,mass:3e45,material:"plasma",group:Gt,blurb:"A rich cluster of over 1,000 galaxies, 300 million light-years away."},{id:"elGordo",name:"El Gordo",emoji:"🦣",radius:15e22,mass:6e45,material:"plasma",group:Gt,blurb:"The most massive galaxy cluster seen in the early universe, 3 quadrillion Suns."},{id:"laniakea",name:"Laniakea Supercluster",emoji:"🏝️",radius:25e23,mass:2e47,material:"plasma",group:Gt,blurb:"Our cosmic home: 100,000 galaxies bound together, 520 million light-years across."},{id:"bootes",name:"Boötes Void",emoji:"🕳️",radius:156e22,mass:3e45,material:"plasma",group:Gt,blurb:"A huge hole in the universe, 330 million light-years across, with almost no galaxies in it."},{id:"shapley",name:"Shapley Supercluster",emoji:"🗻",radius:31e23,mass:2e46,material:"plasma",group:Gt,blurb:"The biggest clump of galaxies near us, pulling the Milky Way toward it."},{id:"sloanWall",name:"Sloan Great Wall",emoji:"🧱",radius:65e23,mass:4e47,material:"plasma",group:Gt,blurb:"A wall of galaxies 1.4 billion light-years long."},{id:"herculesWall",name:"Hercules–Corona Borealis Great Wall",emoji:"🏯",radius:47e24,mass:2e50,material:"plasma",group:Gt,blurb:"The largest structure known: a sheet of galaxies about 10 billion light-years across."},{id:"universe",name:"Observable Universe",emoji:"🔭",radius:44e25,mass:15e52,material:"plasma",group:Gt,blurb:"Everything we can see: 93 billion light-years across."},{id:"phoenixA",name:"Phoenix A*",emoji:"🔥",radius:295e12,mass:1989e38,material:"singularity",group:jn,blurb:"A black hole of 100 billion Suns, about twice as heavy as TON 618, at the heart of the Phoenix Cluster."},{id:"trillionBH",name:"Trillion-Sun black hole",emoji:"🕳️",radius:295e13,mass:1989e39,material:"singularity",group:jn,blurb:"A black hole with the mass of a trillion Suns. Heavier than anything seen, but nothing in physics forbids it."},{id:"milkyWayBH",name:"Milky Way-mass black hole",emoji:"🌌",radius:44e14,mass:3e42,material:"singularity",group:jn,blurb:"Squeeze our whole galaxy, stars and dark matter included, into one black hole. It would be 1 light-year wide."},{id:"groupBH",name:"100-trillion-Sun black hole",emoji:"⚫",radius:295e15,mass:1989e41,material:"singularity",group:jn,blurb:"The mass of a whole group of galaxies in one black hole, 31 light-years across."},{id:"virgoBH",name:"Virgo Cluster black hole",emoji:"💀",radius:354e16,mass:239e43,material:"singularity",group:jn,blurb:"A black hole as heavy as the Virgo Cluster: 370 light-years across."},{id:"laniakeaBH",name:"Laniakea black hole",emoji:"🌑",radius:295e18,mass:1989e44,material:"singularity",group:jn,blurb:"Our whole supercluster of 100,000 galaxies collapsed into a black hole 31,000 light-years across."},{id:"universeBH",name:"Universe-mass black hole",emoji:"♾️",radius:223e24,mass:15e52,material:"singularity",group:jn,blurb:"All the matter in the observable universe in one black hole. Its size is close to the size of the universe itself."},{id:"ring",name:"Ring Nebula",emoji:"💍",radius:47e14,mass:4e29,material:"gas",group:fn,blurb:"A dying star puffing off a glowing smoke ring about a light-year wide."},{id:"helix",name:"Helix Nebula",emoji:"👁️",radius:24e15,mass:12e29,material:"gas",group:fn,blurb:"The Eye of God: gas thrown off by a dying Sun-like star, 2.5 light-years wide."},{id:"westerlund1",name:"Westerlund 1",emoji:"💎",radius:3e17,mass:2e35,material:"plasma",group:fn,blurb:"The biggest young star cluster in the Milky Way, with hundreds of giant stars."},{id:"rosette",name:"Rosette Nebula",emoji:"🌹",radius:61e16,mass:2e34,material:"gas",group:fn,blurb:"A rose-shaped cloud 130 light-years across, lit up from inside by a cluster of hot stars."},{id:"sombrero",name:"Sombrero Galaxy",emoji:"👒",radius:24e19,mass:16e41,material:"plasma",group:pn,blurb:"A galaxy with a huge bright bulge and a dark ring of dust, 28 million light-years away."},{id:"cartwheel",name:"Cartwheel Galaxy",emoji:"🎡",radius:69e19,mass:4e41,material:"plasma",group:pn,blurb:"A galaxy that was punched through the middle by another one and now has a giant ring."},{id:"centaurusA",name:"Centaurus A",emoji:"⚡",radius:5e20,mass:2e42,material:"plasma",group:pn,blurb:"A galaxy with a monster black hole shooting jets that stretch a million light-years."},{id:"perseus",name:"Perseus Cluster",emoji:"🧿",radius:9e22,mass:3e45,material:"plasma",group:Gt,blurb:"One of the heaviest clusters nearby, with a huge hot-gas cloud around thousands of galaxies."},{id:"bulletCluster",name:"Bullet Cluster",emoji:"🎯",radius:15e22,mass:3e45,material:"plasma",group:Gt,blurb:"Two clusters of galaxies that crashed at 4,500 km/s."},{id:"greatAttractor",name:"Great Attractor",emoji:"🧲",radius:7e23,mass:1e47,material:"plasma",group:Gt,blurb:"A mysterious region 150 million light-years away that pulls our whole corner of the universe toward it."},{id:"piscesCetus",name:"Pisces–Cetus Supercluster Complex",emoji:"🐟",radius:47e23,mass:4e48,material:"plasma",group:Gt,blurb:"A chain of superclusters a billion light-years long."},{id:"tenTrillionBH",name:"10-trillion-Sun black hole",emoji:"🌑",radius:295e14,mass:1989e40,material:"singularity",group:jn,blurb:"A black hole of ten trillion Suns, 3 light-years across."},{id:"omgParticle",name:"Oh-My-God particle",emoji:"⚡",radius:84e-17,mass:16726e-31,material:"iron",group:fl,energyEv:32e19,blurb:"A proton seen in 1991 carrying 51 joules, the energy of a thrown baseball in one subatomic particle. It travelled within 4 trillionths of a trillionth of the speed of light."},{id:"amaterasu",name:"Amaterasu particle",emoji:"☀️",radius:84e-17,mass:16726e-31,material:"iron",group:fl,energyEv:24e19,blurb:"A cosmic ray seen over Utah in 2021 with 40 joules, the second most energetic ever detected. Its source is still a mystery, and it came from an empty patch of space."},{id:"alarastraza",name:"Alarastraza",emoji:"🌠",radius:22233e22,mass:5205e49,material:"plasma",group:Zt,blurb:"Another universe, 47 billion light-years across, with 0.347 times the mass of ours."},{id:"hawkramenshon",name:"Hawkramenshon",emoji:"🟣",radius:404e8,mass:1005e51,material:"plasma",group:Zt,blurb:"A purple hyper-giant only 0.27 AU wide that weighs as much as 337 billion Milky Ways."},{id:"hyperUniverse",name:"Hyper Universe",emoji:"🌌",radius:946e24,mass:227e53,material:"plasma",group:Zt,blurb:"An entire universe 100 billion light-years wide, packed with 50 trillion hyper galaxies."},{id:"theFelon",name:"The Felon",emoji:"🦹",radius:4276e15,mass:1996e55,material:"plasma",group:Zt,blurb:"A 452-light-year-wide object that weighs as much as 6.7 quadrillion Milky Ways. Why does this even exist?"},{id:"giganaurus",name:"Giganaurus",emoji:"🤯",radius:4579e21,mass:5431e64,material:"plasma",group:Zt,blurb:"As heavy as 18 trillion trillion galaxies, and almost 10,000 times wider than the Milky Way."},{id:"mlti183",name:"MLTI-183",emoji:"🌌",radius:38e27,mass:9945e64,material:"plasma",group:Zt,blurb:"A structure of 5 × 10³⁷ Suns, far larger than the whole observable universe."},{id:"ulturuas",name:"Ulturuas",emoji:"🌀",radius:79118e22,mass:14658e89,material:"plasma",group:Zt,blurb:"Roughly the size of the observable universe but 10⁵⁰ galaxies heavy. Why does this even exist?"},{id:"tremendous1500",name:"TREMENDOUS-1500",emoji:"🌌",radius:1419e31,mass:5967e71,material:"plasma",group:Zt,blurb:"3 × 10⁴⁴ Suns spread over 1.5 quintillion light-years."},{id:"grondeo",name:"Grondeo-Asigion Attoverse Complex",emoji:"🌌",radius:1419e41,mass:6e104,material:"plasma",group:Zt,blurb:"A complex 15 octillion light-years wide, bigger than our universe by a factor of 10¹⁷."},{id:"mar234",name:"MAR-234 Megacluster Complex",emoji:"🌌",radius:24e59,mass:2e154,material:"plasma",group:Zt,blurb:"A megacluster of universes: 2 × 10¹⁵⁴ kg across 2.4 × 10⁶⁰ metres."},{id:"uuz435",name:"UUZ-435 Ultracluster Complex",emoji:"🌌",radius:1e90,mass:1e160,material:"plasma",group:Zt,shownMass:"2.09 × 10⁴⁹⁷ kg",shownRadius:"5.01 × 10¹⁷⁴ m (5.3 × 10¹⁵⁸ light-years)",blurb:"Its real size is 5.3 × 10¹⁵⁸ light-years and 2.1 × 10⁴⁹⁷ kg, too big for a computer number. Smash Lab uses stand-in numbers that keep its place in the order."},{id:"meve1",name:"MEVE-1",emoji:"🌌",radius:1e95,mass:1e165,material:"plasma",group:Zt,shownMass:"10^(3 × 10¹⁰) solar masses",shownRadius:"ω³ light-years (transfinite)",blurb:"Its mass is 10^(3×10¹⁰) Suns and its radius is the transfinite number ω³ light-years. Smash Lab uses stand-in numbers that keep its place in the order."},{id:"phyve1",name:"PHYVE-1-LOC",emoji:"🌌",radius:1e100,mass:1e170,material:"plasma",group:Zt,shownMass:"≈ 10^(3 × 10^(10¹⁰)) kg",shownRadius:"10^(10^(10¹⁰)) m",blurb:"Its width is 10^(10^(10^10)) metres: a number with a number with ten billion digits in it. Smash Lab uses stand-in numbers that keep its place in the order."},{id:"atomicBreath",name:"Godzilla's Atomic Breath",emoji:"☢️",radius:2.4384,mass:.07,material:"plasma",group:Zn,energyEv:63e14/1602176634e-28,length:6437376,temperatureC:5e5,blurb:"The beam from Godzilla's 2024 film: 16 feet wide, 4,000 miles long, 500,000 °C, and only 70 grams of matter. It arrives with 6.3 petajoules, about 1.5 megatons of TNT, in one pink-white flash. Smash Lab draws the real long thin shape."},{id:"antiGravityOrb",name:"Anti-Gravity Orb",emoji:"🔮",radius:70,mass:7346e19,material:"plasma",group:Zn,antimatter:!0,shownMass:"−7.346 × 10²² kg (−1 Moon)",blurb:"A 70 metre ball with the mass of the Moon, but negative. Everything near it is pushed away as hard as the Moon pulls things in, and it is antimatter: where it touches ordinary matter, both vanish into pure energy."},{id:"antiBubble",name:"Anti-Bubble",emoji:"⚫",radius:1e-18,mass:1e-40,material:"plasma",group:Zn,special:"antiBubble",shownMass:"0 kg",shownRadius:"no fixed size (it grows from nothing)",blurb:"A bubble with no mass and no size that starts growing the moment the simulation starts. It does not move, it only expands, and anything it touches is deleted."},{id:"strangeOrb",name:"Strange Matter Orb",emoji:"🟢",radius:70,mass:1e-30,material:"plasma",group:Zn,special:"strangeOrb",shownMass:"−0 kg (no mass)",blurb:"A green 70 metre orb with no mass. Whatever it touches turns into green strange matter, and the change spreads through all of it."},{id:"grb",name:"Gamma-Ray Burst",emoji:"💜",radius:2e-18,mass:1e-40,material:"plasma",group:Zn,special:"blast",blastKind:"grb",blastJ:1e47,shownMass:"1.1 × 10³⁰ kg of energy (E ÷ c²)",shownRadius:"a jet a few degrees wide",blurb:"A narrow jet of gamma rays from a dying giant star, the brightest explosions since the Big Bang. Counting it as if it went out in every direction it equals about 10⁴⁷ joules, as much as the Sun gives off in 10 billion years, times 100,000."},{id:"supernova",name:"Supernova",emoji:"💥",radius:2e-18,mass:1e-40,material:"plasma",group:Zn,special:"blast",blastKind:"supernova",blastJ:1e44,shownMass:"8 Suns of ejecta (1.6 × 10³¹ kg)",shownRadius:"a blast that grows outward",blurb:'A massive star blows itself apart. The blast and light carry about 10⁴⁴ joules (one "foe"), as much as the Sun makes in its whole 10 billion year life.'},{id:"hypernova",name:"Hypernova",emoji:"🌠",radius:2e-18,mass:1e-40,material:"plasma",group:Zn,special:"blast",blastKind:"hypernova",blastJ:5e45,shownMass:"10 Suns of ejecta (2 × 10³¹ kg)",shownRadius:"a blast that grows outward",blurb:"A supernova about 50 times stronger, from a star that collapses into a black hole. The ejecta fly at about 22,000 km/s and the blast carries about 5 × 10⁴⁵ joules, like the 1998 hypernova SN 1998bw."},{id:"bigBang",name:"Big Bang",emoji:"🌌",radius:2e-18,mass:1e-40,material:"plasma",group:Zn,special:"blast",blastKind:"bigBang",blastJ:15e52*299792458**2,shownMass:"1.5 × 10⁵³ kg of energy (the whole observable universe)",shownRadius:"starts as a point and grows without end",blurb:"The start of space and time. Its energy is the whole mass of the observable universe turned into energy, E = mc², about 1.3 × 10⁷⁰ joules."}],Oc=nh.map(eh).sort((i,e)=>i.radius-e.radius);function Ra(i){const e=Oc.find(t=>t.id===i);if(!e)throw new Error(`Unknown catalog object: ${i}`);return e}const vt={rebound:0,dent:1,crater:2,fracture:3,shatter:4,disrupt:5,vaporize:6},ih=.2,rh=10,ah=3,pl=3200,sh={rock:{Q0:9e7,B:.5,a:-.36,b:1.36},ice:{Q0:16e6,B:1.2,a:-.39,b:1.26}};function oh(i){const e=rt[i.material],t=sh[e.disruptionFamily],n=Math.log(i.radius*100),r=br(i.mass,i.radius)/1e3,a=Math.log(t.Q0*e.strengthFactor)+t.a*n,s=Math.log(t.B*r)+t.b*n,o=Math.max(a,s),l=Math.min(a,s),c=o+Math.log1p(Math.exp(l-o))+Math.log(1e-4);return Math.max(c,Math.log(wa(i.mass,i.radius)))}function lh(i){return i<1.8?Vn(1-.5*i,0,1):Vn(.1*Math.pow(i/1.8,-1.5),0,1)}const Er=i=>i.length!==void 0||i.antimatter===!0||i.special!==void 0;function ml(i,e,t){const n=rt[i.material],r=rt[e.material],a=n.behavior==="fluid"||n.behavior==="hole",s=Er(e),o=r.behavior==="fluid"&&!s||r.behavior==="hole",l=n.density*n.soundSpeed,c=Er(e)?l:r.density*r.soundSpeed,u=r.behavior==="fluid"&&!s?Math.min(1,br(e.mass,e.radius)*e.radius/(br(i.mass,i.radius)*i.radius)):1,p=o?t.normalSpeed*Math.sqrt(u):t.normalSpeed*c/(l+c),h=.5*p*p,d=t.peakStress/n.strength,_=Math.log(.5*t.mu)+2*Math.log(t.normalSpeed)-Math.log(i.mass)+Math.log(u),x=Vn(Math.exp(_-oh(i)),0,1e300),m=s?1:1/n.strength/(1/n.strength+1/r.strength),f=ih*m*t.dissipated/n.strength,v=Math.cbrt(12*f/Math.PI),E=Math.max(nr*i.mass/i.radius/i.radius,1e-12),y=1.161*Math.cbrt(r.density/n.density)*Math.pow(2*e.radius,.78)*Math.pow(t.speed,.44)*Math.pow(E,-.22)*Math.cbrt(Math.max(t.cosPhi,.001)),A=312*Math.pow(Math.max(.5*t.mu*t.speed*t.speed,1)/4184e9/104,1/3.4)*Math.pow(rs/E,.17)*Math.cbrt(Math.max(t.cosPhi,.001)),T=s?A:y,b=!a&&d>=1&&v>0?1/Math.sqrt(1/(v*v)+1/(T*T)):0,C=b/i.radius,R=Yt(C*C*C)/16,D=Math.max(n.vaporEnergy,wa(i.mass,i.radius)),O=as(h,.25*n.meltEnergy,n.meltEnergy),V=as(h,.5*D,D),L=1-.75*as(Math.log10(i.mass/e.mass),-1,.3),G=O*Math.min(L,rh*e.mass/i.mass),X=V*Math.min(L,ah*e.mass/i.mass),N=n.ignitionEnergy!==void 0&&h>=n.ignitionEnergy,K=Vn(Math.log10(Math.max(h,1e-9)/(.1*n.meltEnergy))/2,0,1),W=br(i.mass,i.radius)*E*i.radius>5*n.strength,j=n.behavior==="elastic"||n.behavior==="soft",Q=n.behavior==="brittle";let ae;n.behavior==="hole"?ae="rebound":a?ae=X>=.5?"vaporize":x>=1?"disrupt":"rebound":r.behavior==="hole"?ae="vaporize":o?X>=.5?ae="vaporize":G>=.5||x>=1?ae="disrupt":x>=.2?ae="shatter":ae="rebound":X>=.5?ae="vaporize":x>=1||R>=1?ae="disrupt":Q&&x>=.2||R>=.3?ae="shatter":Q&&!W&&(x>=.05||R>=.05)?ae="fracture":d>=1?j?ae=R>=.05?"crater":"dent":ae=d>=3||R>=1e-4?"crater":"dent":ae="rebound";const ce=vt[ae]<=vt.fracture,H=.8*pl*(rs/E),ne=ce&&n.behavior==="brittle"&&b>H;let me=0,be=0;if(ce&&b>0){const Ye=pl*(rs/E);me=ne?1.17*Math.pow(b,1.13)*Math.pow(Ye,-.13):1.25*b,me=Math.min(me,2*i.radius),be=me*(ne?.07:n.behavior==="ductile"?.4:.2)}let te=lh(x);ae==="vaporize"?te=0:ae==="disrupt"?te=Math.min(te,.5):ae==="shatter"&&(te=Math.min(te,.8));const Re=Math.max(x,R);let Ge=0;ae==="fracture"?Ge=Vn(Math.round(4+40*Re),4,12):ae==="shatter"?Ge=Vn(Math.round(16+40*Math.min(1,Re)),16,56):(ae==="disrupt"||ae==="vaporize")&&(Ge=64);const Te=ce?.5*i.mass*Math.min(R,1):i.mass*(1-te);return{bodyId:i.id,regime:ae,stressRatio:Yt(d),energyRatio:Yt(x),damagedVolumeFraction:Yt(Math.min(R,1e6)),craterDiameter:Yt(me),craterDepth:Yt(be),craterIsComplex:ne,ejectaMass:Yt(Te),largestRemnantFraction:te,suggestedFragments:Ge,shockSpecificEnergy:Yt(h),meltFraction:G,vaporFraction:X,meltMass:Yt(G*i.mass),vaporMass:Yt(X*i.mass),ignites:N,glow:K}}const Bc=1989e27,ch=1.4*Bc,uh=2.3*Bc;function hh(i,e){if(i.special==="antiBubble"||e.special==="antiBubble"||i.special==="blast"||e.special==="blast")return!1;const t=(n,r)=>n.antimatter===!0&&(r.antimatter===!0||r.mass<n.mass);return t(i,e)||t(e,i)}function zc(i,e){return i.lorentzGamma!==void 0?i.lorentzGamma:e.length===void 0?e.lorentzGamma:void 0}function gl(i){if(Er(i))return!1;const e=rt[i.material];if(e.behavior==="fluid"||e.behavior==="hole")return!0;const t=nr*i.mass/i.radius/i.radius;return br(i.mass,i.radius)*t*i.radius>5*e.strength}function dh(i,e){const t=i.mass>=e.mass?i:e,n=i.mass+e.mass;return rt[i.material].behavior==="hole"&&rt[e.material].behavior==="hole"?{mass:n,radius:i.radius+e.radius,blackHole:!1}:i.material==="degenerate"&&e.material==="degenerate"?i.radius<1e5&&e.radius<1e5?n>uh?{mass:n,radius:2*nr*n/(En*En),blackHole:!0}:{mass:n,radius:t.radius,blackHole:!1}:{mass:n,radius:t.radius*Math.pow(t.mass/n,1/3),blackHole:!1}:{mass:n,radius:Math.cbrt(i.radius**3+e.radius**3),blackHole:!1}}function kc(i){const{projectile:e,target:t,speed:n}=i;if(!(n>0)||!Number.isFinite(n))throw new RangeError("speed must be a positive, finite number of m/s");for(const ce of[e,t])if(!(ce.mass>0)||!(ce.radius>0))throw new RangeError(`${ce.id}: mass and radius must be positive`);const r=Vn(i.impactParameter??0,0,.999),a=zc(e,t);let s=a!==void 0?En*Math.sqrt(2*(a-1)):Zu(n);const o=e.special==="antiBubble"||t.special==="antiBubble",l=o?void 0:[e,t].filter(ce=>ce.special==="blast").sort((ce,H)=>(H.blastJ??0)-(ce.blastJ??0))[0],c=!o&&!l&&(e.special==="strangeOrb"||t.special==="strangeOrb"),u=!o&&!c&&!l?e.antimatter?e:t.antimatter?t:void 0:void 0,p=u&&!(e.antimatter&&t.antimatter)?Math.min(u.mass,u===e?t.mass:e.mass):0,h=2*p*En*En,d=Math.sqrt(1-r*r),_=dl(e.mass,t.mass);h>0&&(s=Math.sqrt(s*s+2*h/_)),l&&(s=Math.sqrt(2*(l.blastJ??0)/_));const x=s*d,m=rt[e.material],f=rt[t.material],v=f.density*f.soundSpeed,E=m.density*m.soundSpeed,y=Er(e)?v:E,A=Er(t)?E:v,T=x*y*A/(y+A),g=Math.min(m.strength,f.strength),b=Math.sqrt(m.restitution*f.restitution),C=T>0?b*Math.min(1,Math.pow(g/T,.25)):b,R=(1-C*C)*.5*_*x*x,D={speed:s,cosPhi:d,normalSpeed:x,mu:_,peakStress:T,dissipated:R},O=.5*_*s*s,V=ml(e,t,D),L=ml(t,e,D),X=e.material==="degenerate"&&t.material==="degenerate"&&e.radius>1e5&&t.radius>1e5&&e.mass+t.mass>=ch;if(X)for(const ce of[V,L])ce.regime="vaporize",ce.largestRemnantFraction=0,ce.suggestedFragments=64,ce.vaporFraction=1,ce.glow=1;let N="none",K=0;if(o){N="deleted";for(const[ce,H]of[[V,e],[L,t]])Object.assign(ce,H.special==="antiBubble"?{regime:"rebound",glow:0,suggestedFragments:0,vaporFraction:0,meltFraction:0}:{regime:"vaporize",largestRemnantFraction:0,suggestedFragments:0,vaporFraction:1,meltFraction:0,glow:0,craterDiameter:0,craterDepth:0})}else if(l){N="blast";const ce=l.blastJ??0;for(const[H,ne]of[[V,e],[L,t]]){if(ne===l){Object.assign(H,{regime:"vaporize",glow:1,largestRemnantFraction:0,suggestedFragments:0,vaporFraction:1,meltFraction:1});continue}const me=rt[ne.material],be=ne.mass*Math.max(me.vaporEnergy,wa(ne.mass,ne.radius)),te=ce/be;K=Math.max(K,te);const Re=Math.min(1,te),Ge=te>=.5?"vaporize":te>=.3?"disrupt":te>=.1?"shatter":te>=.001?"crater":te>=1e-6?"dent":"rebound",Te=2*ne.radius*Math.cbrt(2*Re);Object.assign(H,{regime:Ge,vaporFraction:Re,meltFraction:Math.min(1,2*Re),largestRemnantFraction:Math.max(0,1-Re),glow:Vn((Math.log10(Math.max(te,1e-12))+9)/9,.05,1),suggestedFragments:0,craterDiameter:Ge==="dent"||Ge==="crater"?Te:0,craterDepth:Ge==="dent"||Ge==="crater"?Te/2:0})}}else if(c){N="strange";for(const[ce,H]of[[V,e],[L,t]])Object.assign(ce,{regime:"rebound",glow:H.special==="strangeOrb"?0:.35,suggestedFragments:0,vaporFraction:0,meltFraction:0,craterDiameter:0,craterDepth:0,largestRemnantFraction:1})}if(h>0&&u){const ce=.5*_*s*s;for(const[H,ne]of[[V,e],[L,t]]){const me=rt[ne.material];if(ne===u){const be=p/u.mass;H.glow=1,be>=.5?Object.assign(H,{regime:"vaporize",largestRemnantFraction:0,suggestedFragments:64,vaporFraction:1,meltFraction:1}):H.largestRemnantFraction=1-be}else{const be=ne.mass*Math.max(me.vaporEnergy,wa(ne.mass,ne.radius)),te=Math.min(1,ce/be);H.glow=1,H.vaporFraction=Math.max(H.vaporFraction,te),H.meltFraction=Math.max(H.meltFraction,te),te>=.5?Object.assign(H,{regime:"vaporize",largestRemnantFraction:0,suggestedFragments:64}):te>=.3&&vt[H.regime]<vt.disrupt&&Object.assign(H,{regime:"disrupt",largestRemnantFraction:Math.min(H.largestRemnantFraction,.5),suggestedFragments:64})}}}const W=[e,t].some(ce=>rt[ce.material].behavior==="hole"),j=rt[e.material].behavior==="hole"&&rt[t.material].behavior==="hole";let Q=null;const ae=[[e,t],[t,e]].some(([ce,H])=>ce.length!==void 0&&H.group==="Stars");if(N==="strange")Q={mass:e.mass+t.mass,radius:Math.max(e.radius,t.radius),blackHole:!1};else if(N==="deleted"||N==="blast")Q=null;else if(ae){const ce=e.length!==void 0?t:e;Q={mass:e.mass+t.mass,radius:ce.radius,blackHole:!1}}else if(!X&&(!W||j)&&gl(e)&&gl(t)){const ce=dh(e,t),ne=.5*dl(e.mass,t.mass)*s*s,me=j?1/0:.6*nr*ce.mass*(ce.mass/ce.radius),be=[e,t].some(Re=>rt[Re.material].behavior==="fluid"),te=Math.min(e.mass,t.mass)>=.02*Math.max(e.mass,t.mass);be?ne<=1.5*me&&(Q=ce):te&&ne<=.5*me&&(Q=ce)}return{speed:n,normalSpeed:x,impactAngleDeg:Math.acos(r)*180/Math.PI,energyJ:N==="deleted"||N==="strange"?0:Yt(O),energyKilotons:N==="deleted"||N==="strange"?0:Yt(O/Ku),peakStressPa:Yt(T),restitution:C,projectile:V,target:L,merge:Q,effect:N,blastFraction:Yt(K),repelled:hh(e,t),annihilatedMass:p,supernova:X}}const fh={"-":"⁻",0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"},ph=i=>String(i).split("").map(e=>fh[e]??e).join(""),zs=94607e11;function Fe(i){if(i===0||!Number.isFinite(i))return"0";const e=Math.abs(i);if(e>=.001&&e<1e6)return Number(i.toPrecision(3)).toLocaleString("en-US",{maximumFractionDigits:6});const t=Math.floor(Math.log10(e));return`${(i/Math.pow(10,t)).toFixed(2)} × 10${ph(t)}`}function si(i){if(i===0)return"0 m";const e=Math.abs(i);if(e<1e-6)return`${Fe(i*1e9)} nm`;if(e<.001)return`${Fe(i*1e6)} µm`;if(e<1)return`${Fe(i*1e3)} mm`;if(e<1e3)return`${Fe(i)} m`;if(e<1e16)return`${Fe(i/1e3)} km`;const t=e/zs,n=i<0?"-":"";return t<1e6?`${n}${Fe(t)} light-year${t===1?"":"s"}`:t<1e9?`${n}${Fe(t/1e6)} million light-years`:t<1e15?`${n}${Fe(t/1e9)} billion light-years`:`${n}${Fe(t)} light-years`}function cn(i){if(i===0)return"0 kg";const e=Math.abs(i);return e<1e-6?`${Fe(i*1e9)} µg`:e<.001?`${Fe(i*1e6)} mg`:e<1?`${Fe(i*1e3)} g`:e>=1e29?`${Fe(i)} kg (${Fe(i/1989e27)} Suns)`:`${Fe(i)} kg`}function zr(i){return i>=3e6?`${Fe(i/1e3)} km/s (${Fe(i/2998e5*100)}% of light speed)`:i>=1e3?`${Fe(i/1e3)} km/s`:`${Fe(i)} m/s`}function mh(i){if(i<100){const t=Math.sqrt(1-1/(i*i));return`${Fe(299792.458*t)} km/s (${Fe(t*100)}% of the speed of light)`}const e=1/(2*i*i);return`${Fe(299792.458)} km/s, within ${Fe(e)} of the speed of light`}function Tr(i,e){if(i>=1e44)return`${Fe(i)} J (${Fe(i/1e44)} supernovae)`;if(i>=1e26)return`${Fe(i)} J (${Fe(i/3828e23)} seconds of all the Sun's light)`;const t=e>=1e6?`${Fe(e/1e6)} gigatons TNT`:e>=1?`${Fe(e)} kilotons TNT`:e>=1e-6?`${Fe(e*1e6)} kg TNT`:"";return t?`${Fe(i)} J (${t})`:`${Fe(i)} J`}const Gc={rebound:{label:"Bounces",tone:"calm",blurb:"Springs back with no lasting damage."},dent:{label:"Dented",tone:"calm",blurb:"Squashed or dented but still in one piece."},crater:{label:"Cratered",tone:"warm",blurb:"Digs a crater and throws out debris."},fracture:{label:"Cracks apart",tone:"warm",blurb:"Breaks into a few big pieces."},shatter:{label:"Shatters",tone:"hot",blurb:"Smashed into many fragments."},disrupt:{label:"Destroyed",tone:"extreme",blurb:"Blown apart; no piece keeps most of the mass."},vaporize:{label:"Vaporized",tone:"extreme",blurb:"Turned to hot gas in an explosion."}};function gh(i,e,t){const n=rt[i.material].behavior,r=rt[e.material].behavior;if(n==="hole")return{label:"Swallows it",tone:"extreme",blurb:"Nothing escapes the event horizon, and nothing here can hurt it."};if(n==="fluid"&&t.regime==="rebound")return{label:"Swallows it",tone:"warm",blurb:"No solid surface to damage: the hit heats a patch of gas that swirls away."};if(r==="hole")return{label:"Swallowed",tone:"extreme",blurb:"Stretched, torn apart and pulled across the event horizon."};if(r==="fluid"){if(t.regime==="rebound")return{label:"Sinks in",tone:"warm",blurb:"Plunges into the gas without breaking up."};if(t.regime==="vaporize")return{label:"Burns up",tone:"extreme",blurb:"Boils away in the hot gas."};if(t.regime==="shatter"||t.regime==="disrupt")return{label:"Breaks up",tone:"hot",blurb:"Torn apart and burned as it plunges in."}}return t.regime==="rebound"&&i.mass>1e4*e.mass?{label:"Barely notices",tone:"calm",blurb:"Far too big to be bothered by this hit."}:Gc[t.regime]}function _h(i,e,t,n){if(n)return{label:"Supernova",tone:"extreme",blurb:"Together the two white dwarfs are heavier than the 1.4 Sun limit a white dwarf can hold up, so the merger ignites and blows both apart.",facts:[`Combined mass: ${cn(i.mass+e.mass)}.`,"Nothing is left behind."]};if(!t)return null;const r=i.mass>=e.mass?i:e,a=[r.shownMass?`Combined mass: about ${r.shownMass}.`:`Combined mass: ${cn(t.mass)}.`,r.shownRadius?`New radius: about ${r.shownRadius}.`:`New radius: ${si(t.radius)}.`];return t.blackHole?{label:"Black hole",tone:"extreme",blurb:"The two merge into one object too heavy to hold itself up, and it collapses into a black hole.",facts:a}:i.length!==void 0||e.length!==void 0?{label:"Absorbed",tone:"hot",blurb:"A star swallows the beam whole. It takes in the beam's mass and all of its energy, and carries on as before.",facts:a}:{label:"Merges",tone:"hot",blurb:rt[i.material].behavior==="hole"?"The two black holes spiral together into one bigger black hole.":"Held together by their own gravity, they do not bounce or stack: they run into each other and fuse into one new body.",facts:a}}function vh(i,e,t,n){return n?{label:"Pushed away",tone:"calm",blurb:i.antimatter?"The orb pushes away anything lighter than itself, and any other orb, so the two can never touch.":"It is pushed away by the Anti-Gravity Orb before it can touch it, so nothing happens.",facts:[]}:t==="blast"&&i.special==="blast"?{label:"Goes off",tone:"extreme",blurb:{grb:"A narrow jet of gamma rays hits the impact point and everything near it is cooked by the flash.",supernova:"The blast goes off at the impact point and the fireball grows outward, burning whatever it passes through.",hypernova:"A far fiercer blast goes off at the impact point and the fireball grows outward at about 22,000 km/s.",bigBang:"Space and time begin at the impact point and everything expands outward from it, all at once."}[i.blastKind??"supernova"],facts:[`Releases ${Tr(i.blastJ??0,(i.blastJ??0)/4184e9)}.`,"Does not move: it goes off the moment you launch."]}:t==="deleted"?i.special==="antiBubble"?{label:"Expands",tone:"extreme",blurb:"It does not move. It just grows from nothing, and anything it touches is deleted: no debris, no explosion, no energy.",facts:["No mass and no fixed size.",`${e.name} is inside it, so ${e.name} is gone.`]}:{label:"Deleted",tone:"extreme",blurb:"The growing bubble deletes everything it touches. Nothing is left: no pieces, no heat, no explosion.",facts:[`${e.shownMass??cn(e.mass)} deleted.`]}:t==="strange"?i.special==="strangeOrb"?{label:"Spreads",tone:"hot",blurb:"Whatever it touches turns into green strange matter, and the change spreads through all of it.",facts:["No mass, so it hits with no force and no energy."]}:{label:"Strange matter",tone:"hot",blurb:"The change spreads from the touch point through the whole object until all of it is green strange matter.",facts:[`Same mass as before: ${i.shownMass??cn(i.mass)}.`,"No energy is released."]}:null}function xh(i,e){const t=[],n=s=>s>=.995?"All":s<.001?"Under 0.1%":`${(s*100).toFixed(s<.1?1:0)}%`,r=rt[i.material].behavior;if(r==="hole")t.push("Nothing that hits it can hurt it, and nothing that falls in comes back out.");else if(r==="fluid"&&e.regime==="rebound")t.push("No solid surface, so there is nothing to dent or crack.");else if(e.regime==="rebound")t.push("Stress stays below the material's strength.");else if(e.craterDiameter>0){const s=e.craterDiameter>=1.8*i.radius,o=e.regime==="dent"?"Dent":e.craterIsComplex?"Impact basin":"Crater";t.push(s?`${o} as wide as the whole body: the surface is completely reshaped.`:`${o} about ${si(e.craterDiameter)} across and ${si(e.craterDepth)} deep.`),e.ejectaMass>0&&(e.regime==="crater"||e.regime==="fracture")&&t.push(`Throws out about ${cn(e.ejectaMass)} of material.`)}if(e.regime==="fracture"||e.regime==="shatter"||e.regime==="disrupt"){const s=e.largestRemnantFraction<.001?"under 0.1%":`${(e.largestRemnantFraction*100).toFixed(e.largestRemnantFraction<.1?1:0)}%`;t.push(`Largest piece keeps ${s} of the mass; about ${e.suggestedFragments} main fragments.`)}e.vaporFraction>=.01&&t.push(`${n(e.vaporFraction)} of its mass is vaporized.`);const a=e.meltFraction-e.vaporFraction;return a>=.001&&t.push(`${n(a)} of its mass melts into glowing liquid.`),e.ignites&&t.push("Hot enough to catch fire."),e.regime!=="rebound"&&e.regime!=="dent"&&t.length===0&&t.push(Gc[e.regime].blurb),t}function bh(i){return i>=1e9?`${Fe(i/1e9)} GPa`:i>=1e6?`${Fe(i/1e6)} MPa`:i>=1e3?`${Fe(i/1e3)} kPa`:`${Fe(i)} Pa`}const $i=10,_l=4,Mh=.002,Sh=40,vl=1.3,vn=(i,e,t)=>Math.min(t,Math.max(e,i)),yh={approachEnd:2.6,cutEnd:2.85,contact:3.75,impactEnd:8.25,returnEnd:8.5,end:11.5};function Eh(i,e){switch(i){case"vaporize":return"vaporize";case"disrupt":case"shatter":return"shatter";case"fracture":return"crack";default:return e>=.15?"bounce":"embed"}}function Th(i,e){const t=rt[e.material].behavior,n=t==="elastic"||t==="soft"?2.4:1,r=vn((.06+.12*Math.log10(1+i.stressRatio))*n,.04,.4),a=i.regime==="dent"?.5*r:i.regime==="crater"?.8*r:0;return{peak:r,permanent:a}}function Ah(i,e){const t=i.projectile.radius>i.target.radius,n=t?i.projectile:i.target,r=t?i.target:i.projectile,a=t?e.projectile:e.target,s=t?e.target:e.projectile,o=vn(e.impactAngleDeg,1,90),l=o*Math.PI/180,c=[Math.cos(l),-Math.sin(l),0],u=e.merge!==null,p=u?0:a.regime==="dent"||a.regime==="crater"||vt[a.regime]>=vt.fracture?a.craterDiameter:0,h=!u&&(vt[a.regime]>=vt.disrupt||vt[a.regime]>=vt.shatter&&n.radius<=r.radius*8),d=Math.max(r.radius,p/(2*_l)),_=1.4*$i/Math.PI-.5,x=h?Math.max(r.radius,n.radius/_):d,m=n.radius/x,f=r.radius/x,v=vn(f,Mh,1),E=r.radius/n.radius;let y={kind:"none",radius:0,depth:0,complex:!1};if(p>0&&(a.regime==="dent"||vt[a.regime]>=vt.crater)){const He=vn(p/(2*x),.05,_l),Mt=vn(a.craterDepth/x,.2*He*.25,.6*He);y={kind:a.regime==="dent"?"dent":"crater",radius:He,depth:Mt,complex:a.craterIsComplex}}const A=1.4*$i/Math.PI,T=m<=A,g=T?Math.PI:$i/m,b=rt[n.material].behavior,C=b==="fluid"||b==="hole";let R=u?"merge":Eh(s.regime,e.restitution);!u&&h&&C&&rt[r.material].behavior!=="hole"&&(R==="embed"||R==="bounce")&&(R="vaporize");const D=!u&&!h&&b==="fluid"&&(R==="embed"||R==="bounce"||R==="crack");D&&(R="merge");const{peak:O,permanent:V}=Th(s,r),L=vn(e.restitution,0,1),G=R==="bounce"||R==="embed"||R==="crack",X=e.merge,N=X?{scale:X.radius/n.radius,blackHole:X.blackHole,glow:vn(Math.max(a.glow,s.glow,.4),.4,1),impactorShare:e.effect==="strange"?r.special==="strangeOrb"?1:0:r.mass/(r.mass+n.mass)}:D?{scale:1,blackHole:!1,glow:vn(Math.max(a.glow,s.glow,.3),.3,1),impactorShare:0}:null,W=G&&e.restitution>=.15?[c[0],-c[1]*Math.max(L,.05),0]:null,j=1.6+2*E,Q=Math.max(.12,1.5*E),ae=Math.sin(l),H=-Math.cos(l)*j-E,ne=1.6,me=-1.9,be=ae*j+2*E,te=(ne-H)/2,Re=(be-me)/2,Ge=Math.tan(Sh*Math.PI/360),Te=e.effect==="deleted",Ye=[i.projectile,i.target].filter(He=>He.special==="blast").sort((He,Mt)=>(Mt.blastJ??0)-(He.blastJ??0))[0],Ke=e.effect==="blast"&&Ye?(()=>{const He=e.blastFraction,Mt=He>=.5?2.7:He<1e-9?0:Math.min(2.7,Math.cbrt(2*He));return{kind:Ye.blastKind??"supernova",fraction:He,removed:Mt,fire:Math.min(3.1,Math.max(.09,Mt*1.15+.03)),heat:He>=.5?1:vn((Math.log10(Math.max(He,1e-9))+9)/9,.05,1)}})():null,ke=Te||Ke?(()=>{const He=Ke?vn(Ke.fire*1.25+1.3,2.4,3.9):3.9;return 1.2*Math.max(.846*He/Ge,He/(Ge*vl))})():1.3*Math.max(Re/Ge,te/(Ge*vl)),bt=Te||Ke?[0,-.5,0]:[(H+ne)/2,(me+be)/2,0],ut=Math.max(v,.4*y.radius,.4),Tt=4.2*ut+1,it=T?2*m*Math.max(1,N?.scale??1)+2:$i,en=vn(Math.max(1.6*Tt,1.5*it),Tt,24);return{surfaceIsProjectile:t,surface:n,impactor:r,surfaceOutcome:a,impactorOutcome:s,unit:x,rsLocal:m,riLocal:v,riLocalTrue:f,riGlobal:E,dir:c,angleDeg:o,deform:y,patchAngle:g,patchIsWholeSphere:T,impactorFate:R,impactorSurvives:G,peakSquash:O,permanentSquash:V,bounce:W,surfaceDestroyed:h,merge:N,bubble:Te,blast:Ke,strange:e.effect==="strange"&&r.special==="strangeOrb",global:{startDistance:j,cutDistance:Q,cameraDistance:ke,cameraTarget:bt},local:{startDistance:5+2*v,focus:ut,cameraNear:Tt,cameraFar:en},timeline:yh}}const Lo="187",wh=0,xl=1,Rh=2,_a=1,Ch=2,vr=3,Si=0,Wt=1,Mn=2,Mi=0,Mr=1,Sn=2,bl=3,Ml=4,Ph=5,qi=100,Lh=101,Dh=102,Ih=103,Nh=104,Uh=200,Fh=201,Oh=202,Bh=203,Hc=204,Vc=205,zh=206,kh=207,Gh=208,Hh=209,Vh=210,Wh=211,Xh=212,qh=213,$h=214,ks=0,Gs=1,Hs=2,Ar=3,Vs=4,Ws=5,Xs=6,qs=7,Wc=0,Yh=1,Kh=2,qn=0,Do=1,Io=2,No=3,qa=4,Uo=5,Fo=6,Oo=7,Xc=300,ji=301,wr=302,ss=303,os=304,$s=1e3,Wn=1001,Ys=1002,Pt=1003,jh=1004,kr=1005,jt=1006,ls=1007,ri=1008,un=1009,qc=1010,$c=1011,Rr=1012,Bo=1013,In=1014,Ln=1015,Xt=1016,zo=1017,ko=1018,Zi=1020,Yc=35902,Kc=35899,jc=1021,Zc=1022,Dn=1023,li=1026,ai=1027,Jc=1028,Go=1029,yi=1030,Ho=1031,Vo=1033,va=33776,xa=33777,ba=33778,Ma=33779,Ks=35840,js=35841,Zs=35842,Js=35843,Qs=36196,eo=37492,to=37496,no=37488,io=37489,Ca=37490,ro=37491,ao=37808,so=37809,oo=37810,lo=37811,co=37812,uo=37813,ho=37814,fo=37815,po=37816,mo=37817,go=37818,_o=37819,vo=37820,xo=37821,bo=36492,Mo=36494,So=36495,yo=36283,Eo=36284,Pa=36285,To=36286,Zh=3200,Sl=0,Jh=1,Hn="",on="srgb",La="srgb-linear",Da="linear",Qe="srgb",cs=7680,Qh=519,ed=512,td=513,nd=514,Qc=515,id=516,rd=517,eu=518,tu=519,nu=35044,yl="300 es",yn=2e3,Ia=2001;function ad(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Na(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function sd(){const i=Na("canvas");return i.style.display="block",i}const El={};function Ua(...i){const e="THREE."+i.shift();console.log(e,...i)}function iu(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=iu(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ze(...i){i=iu(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Sa(...i){const e=i.join(" ");e in El||(El[e]=!0,Le(...i))}function od(i,e,t){return new Promise(function(n,r){function a(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(a,t);break;default:n()}}setTimeout(a,t)})}const ld={[ks]:ks,[Hs]:Xs,[Vs]:Vs,[Ar]:Ws,[Gs]:Gs,[Xs]:Hs,[qs]:qs,[Ws]:Ar};class Ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const r=n[e];if(r!==void 0){const a=r.indexOf(t);a!==-1&&r.splice(a,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let a=0,s=r.length;a<s;a++)r[a].call(this,e);e.target=null}}}const Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],us=Math.PI/180,Ao=180/Math.PI;function Ai(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[t&63|128]+Ft[t>>8&255]+"-"+Ft[t>>16&255]+Ft[t>>24&255]+Ft[n&255]+Ft[n>>8&255]+Ft[n>>16&255]+Ft[n>>24&255]).toLowerCase()}function qe(i,e,t){return Math.max(e,Math.min(t,i))}function cd(i,e){return(i%e+e)%e}function hs(i,e,t){return(1-t)*i+t*e}function ud(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function $a(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function ru(i,e){if(e.constructor===Float32Array)return i;const t=$a(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function au(i,e){if(e.constructor===Float32Array)return i;const t=$a(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}class we{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),a=this.x-e.x,s=this.y-e.y;return this.x=a*n-s*r+e.x,this.y=a*r+s*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ci{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,a,s,o){let l=n[r+0],c=n[r+1],u=n[r+2],p=n[r+3],h=a[s+0],d=a[s+1],_=a[s+2],x=a[s+3];if(p!==x||l!==h||c!==d||u!==_){let m=l*h+c*d+u*_+p*x;m<0&&(h=-h,d=-d,_=-_,x=-x,m=-m);let f=1-o;if(m<.9995){const v=Math.acos(m),E=Math.sin(v);f=Math.sin(f*v)/E,o=Math.sin(o*v)/E,l=l*f+h*o,c=c*f+d*o,u=u*f+_*o,p=p*f+x*o}else{l=l*f+h*o,c=c*f+d*o,u=u*f+_*o,p=p*f+x*o;const v=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=v,c*=v,u*=v,p*=v}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,r,a,s){const o=n[r],l=n[r+1],c=n[r+2],u=n[r+3],p=a[s],h=a[s+1],d=a[s+2],_=a[s+3];return e[t]=o*_+u*p+l*d-c*h,e[t+1]=l*_+u*h+c*p-o*d,e[t+2]=c*_+u*d+o*h-l*p,e[t+3]=u*_-o*p-l*h-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,a=e._z,s=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(r/2),p=o(a/2),h=l(n/2),d=l(r/2),_=l(a/2);switch(s){case"XYZ":this._x=h*u*p+c*d*_,this._y=c*d*p-h*u*_,this._z=c*u*_+h*d*p,this._w=c*u*p-h*d*_;break;case"YXZ":this._x=h*u*p+c*d*_,this._y=c*d*p-h*u*_,this._z=c*u*_-h*d*p,this._w=c*u*p+h*d*_;break;case"ZXY":this._x=h*u*p-c*d*_,this._y=c*d*p+h*u*_,this._z=c*u*_+h*d*p,this._w=c*u*p-h*d*_;break;case"ZYX":this._x=h*u*p-c*d*_,this._y=c*d*p+h*u*_,this._z=c*u*_-h*d*p,this._w=c*u*p+h*d*_;break;case"YZX":this._x=h*u*p+c*d*_,this._y=c*d*p+h*u*_,this._z=c*u*_-h*d*p,this._w=c*u*p-h*d*_;break;case"XZY":this._x=h*u*p-c*d*_,this._y=c*d*p-h*u*_,this._z=c*u*_+h*d*p,this._w=c*u*p+h*d*_;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],a=t[8],s=t[1],o=t[5],l=t[9],c=t[2],u=t[6],p=t[10],h=n+o+p;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(a-c)*d,this._z=(s-r)*d}else if(n>o&&n>p){const d=2*Math.sqrt(1+n-o-p);this._w=(u-l)/d,this._x=.25*d,this._y=(r+s)/d,this._z=(a+c)/d}else if(o>p){const d=2*Math.sqrt(1+o-n-p);this._w=(a-c)/d,this._x=(r+s)/d,this._y=.25*d,this._z=(l+u)/d}else{const d=2*Math.sqrt(1+p-n-o);this._w=(s-r)/d,this._x=(a+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,a=e._z,s=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+s*o+r*c-a*l,this._y=r*u+s*l+a*o-n*c,this._z=a*u+s*c+n*l-r*o,this._w=s*u-n*o-r*l-a*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,a=e._z,s=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,a=-a,s=-s,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+a*t,this._w=this._w*l+s*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+a*t,this._w=this._w*l+s*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Tl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Tl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[3]*n+a[6]*r,this.y=a[1]*t+a[4]*n+a[7]*r,this.z=a[2]*t+a[5]*n+a[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,a=e.elements,s=1/(a[3]*t+a[7]*n+a[11]*r+a[15]);return this.x=(a[0]*t+a[4]*n+a[8]*r+a[12])*s,this.y=(a[1]*t+a[5]*n+a[9]*r+a[13])*s,this.z=(a[2]*t+a[6]*n+a[10]*r+a[14])*s,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,a=e.x,s=e.y,o=e.z,l=e.w,c=2*(s*r-o*n),u=2*(o*t-a*r),p=2*(a*n-s*t);return this.x=t+l*c+s*p-o*u,this.y=n+l*u+o*c-a*p,this.z=r+l*p+a*u-s*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r,this.y=a[1]*t+a[5]*n+a[9]*r,this.z=a[2]*t+a[6]*n+a[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,a=e.z,s=t.x,o=t.y,l=t.z;return this.x=r*l-a*o,this.y=a*s-n*l,this.z=n*o-r*s,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ds.copy(this).projectOnVector(e),this.sub(ds)}reflect(e){return this.sub(ds.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ds=new I,Tl=new ci;class Ue{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,a,s,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,a,s,o,l,c)}set(e,t,n,r,a,s,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=a,u[5]=l,u[6]=n,u[7]=s,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,a=this.elements,s=n[0],o=n[3],l=n[6],c=n[1],u=n[4],p=n[7],h=n[2],d=n[5],_=n[8],x=r[0],m=r[3],f=r[6],v=r[1],E=r[4],y=r[7],A=r[2],T=r[5],g=r[8];return a[0]=s*x+o*v+l*A,a[3]=s*m+o*E+l*T,a[6]=s*f+o*y+l*g,a[1]=c*x+u*v+p*A,a[4]=c*m+u*E+p*T,a[7]=c*f+u*y+p*g,a[2]=h*x+d*v+_*A,a[5]=h*m+d*E+_*T,a[8]=h*f+d*y+_*g,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],s=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*s*u-t*o*c-n*a*u+n*o*l+r*a*c-r*s*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],s=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=u*s-o*c,h=o*l-u*a,d=c*a-s*l,_=t*p+n*h+r*d;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/_;return e[0]=p*x,e[1]=(r*c-u*n)*x,e[2]=(o*n-r*s)*x,e[3]=h*x,e[4]=(u*t-r*l)*x,e[5]=(r*a-o*t)*x,e[6]=d*x,e[7]=(n*l-c*t)*x,e[8]=(s*t-n*a)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,a,s,o){const l=Math.cos(a),c=Math.sin(a);return this.set(n*l,n*c,-n*(l*s+c*o)+s+e,-r*c,r*l,-r*(-c*s+l*o)+o+t,0,0,1),this}scale(e,t){return Sa("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(fs.makeScale(e,t)),this}rotate(e){return Sa("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(fs.makeRotation(-e)),this}translate(e,t){return Sa("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(fs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const fs=new Ue,Al=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wl=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hd(){const i={enabled:!0,workingColorSpace:La,spaces:{},convert:function(r,a,s){return this.enabled===!1||a===s||!a||!s||(this.spaces[a].transfer===Qe&&(r.r=$n(r.r),r.g=$n(r.g),r.b=$n(r.b)),this.spaces[a].primaries!==this.spaces[s].primaries&&(r.applyMatrix3(this.spaces[a].toXYZ),r.applyMatrix3(this.spaces[s].fromXYZ)),this.spaces[s].transfer===Qe&&(r.r=Yi(r.r),r.g=Yi(r.g),r.b=Yi(r.b))),r},workingToColorSpace:function(r,a){return this.convert(r,this.workingColorSpace,a)},colorSpaceToWorking:function(r,a){return this.convert(r,a,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Hn?Da:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,a=this.workingColorSpace){return r.fromArray(this.spaces[a].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,a,s){return r.copy(this.spaces[s].fromXYZ).multiply(this.spaces[a].toXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[La]:{primaries:e,whitePoint:n,transfer:Da,toXYZ:Al,fromXYZ:wl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:on},outputColorSpaceConfig:{drawingBufferColorSpace:on}},[on]:{primaries:e,whitePoint:n,transfer:Qe,toXYZ:Al,fromXYZ:wl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:on}}}),i}const Xe=hd();function $n(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Yi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ri;class dd{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ri===void 0&&(Ri=Na("canvas")),Ri.width=e.width,Ri.height=e.height;const r=Ri.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=Ri}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Na("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),a=r.data;for(let s=0;s<a.length;s++)a[s]=$n(a[s]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor($n(t[n]/255)*255):t[n]=$n(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let fd=0;class Wo{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=Ai(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let a;if(Array.isArray(r)){a=[];for(let s=0,o=r.length;s<o;s++)r[s].isDataTexture?a.push(ps(r[s].image)):a.push(ps(r[s]))}else a=ps(r);n.url=a}return t||(e.images[this.uuid]=n),n}}function ps(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?dd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}let pd=0;const ms=new I;class Bt extends Ti{constructor(e=Bt.DEFAULT_IMAGE,t=Bt.DEFAULT_MAPPING,n=Wn,r=Wn,a=jt,s=ri,o=Dn,l=un,c=Bt.DEFAULT_ANISOTROPY,u=Hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pd++}),this.uuid=Ai(),this.name="",this.source=new Wo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=a,this.minFilter=s,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new we(0,0),this.repeat=new we(1,1),this.center=new we(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(ms).x}get height(){return this.source.getSize(ms).y}get depth(){return this.source.getSize(ms).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Xc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $s:e.x=e.x-Math.floor(e.x);break;case Wn:e.x=e.x<0?0:1;break;case Ys:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $s:e.y=e.y-Math.floor(e.y);break;case Wn:e.y=e.y<0?0:1;break;case Ys:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Bt.DEFAULT_IMAGE=null;Bt.DEFAULT_MAPPING=Xc;Bt.DEFAULT_ANISOTROPY=1;class ht{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,a=this.w,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r+s[12]*a,this.y=s[1]*t+s[5]*n+s[9]*r+s[13]*a,this.z=s[2]*t+s[6]*n+s[10]*r+s[14]*a,this.w=s[3]*t+s[7]*n+s[11]*r+s[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,a;const l=e.elements,c=l[0],u=l[4],p=l[8],h=l[1],d=l[5],_=l[9],x=l[2],m=l[6],f=l[10];if(Math.abs(u-h)<.01&&Math.abs(p-x)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(p+x)<.1&&Math.abs(_+m)<.1&&Math.abs(c+d+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,y=(d+1)/2,A=(f+1)/2,T=(u+h)/4,g=(p+x)/4,b=(_+m)/4;return E>y&&E>A?E<.01?(n=0,r=.707106781,a=.707106781):(n=Math.sqrt(E),r=T/n,a=g/n):y>A?y<.01?(n=.707106781,r=0,a=.707106781):(r=Math.sqrt(y),n=T/r,a=b/r):A<.01?(n=.707106781,r=.707106781,a=0):(a=Math.sqrt(A),n=g/a,r=b/a),this.set(n,r,a,t),this}let v=Math.sqrt((m-_)*(m-_)+(p-x)*(p-x)+(h-u)*(h-u));return Math.abs(v)<.001&&(v=1),this.x=(m-_)/v,this.y=(p-x)/v,this.z=(h-u)/v,this.w=Math.acos((c+d+f-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class md extends Ti{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ht(0,0,e,t),this.scissorTest=!1,this.viewport=new ht(0,0,e,t),this.textures=[];const r=n.count;for(let a=0;a<r;a++)this.textures[a]=new Bt({width:e,height:t,depth:n.depth}),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,a=this.textures.length;r<a;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new Wo(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qt extends md{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class su extends Bt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class gd extends Bt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}class lt{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,a,s,o,l,c,u,p,h,d,_,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,a,s,o,l,c,u,p,h,d,_,x,m)}set(e,t,n,r,a,s,o,l,c,u,p,h,d,_,x,m){const f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=r,f[1]=a,f[5]=s,f[9]=o,f[13]=l,f[2]=c,f[6]=u,f[10]=p,f[14]=h,f[3]=d,f[7]=_,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new lt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,r=1/Ci.setFromMatrixColumn(e,0).length(),a=1/Ci.setFromMatrixColumn(e,1).length(),s=1/Ci.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=0,t[8]=n[8]*s,t[9]=n[9]*s,t[10]=n[10]*s,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,a=e.z,s=Math.cos(n),o=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(a),p=Math.sin(a);if(e.order==="XYZ"){const h=s*u,d=s*p,_=o*u,x=o*p;t[0]=l*u,t[4]=-l*p,t[8]=c,t[1]=d+_*c,t[5]=h-x*c,t[9]=-o*l,t[2]=x-h*c,t[6]=_+d*c,t[10]=s*l}else if(e.order==="YXZ"){const h=l*u,d=l*p,_=c*u,x=c*p;t[0]=h+x*o,t[4]=_*o-d,t[8]=s*c,t[1]=s*p,t[5]=s*u,t[9]=-o,t[2]=d*o-_,t[6]=x+h*o,t[10]=s*l}else if(e.order==="ZXY"){const h=l*u,d=l*p,_=c*u,x=c*p;t[0]=h-x*o,t[4]=-s*p,t[8]=_+d*o,t[1]=d+_*o,t[5]=s*u,t[9]=x-h*o,t[2]=-s*c,t[6]=o,t[10]=s*l}else if(e.order==="ZYX"){const h=s*u,d=s*p,_=o*u,x=o*p;t[0]=l*u,t[4]=_*c-d,t[8]=h*c+x,t[1]=l*p,t[5]=x*c+h,t[9]=d*c-_,t[2]=-c,t[6]=o*l,t[10]=s*l}else if(e.order==="YZX"){const h=s*l,d=s*c,_=o*l,x=o*c;t[0]=l*u,t[4]=x-h*p,t[8]=_*p+d,t[1]=p,t[5]=s*u,t[9]=-o*u,t[2]=-c*u,t[6]=d*p+_,t[10]=h-x*p}else if(e.order==="XZY"){const h=s*l,d=s*c,_=o*l,x=o*c;t[0]=l*u,t[4]=-p,t[8]=c*u,t[1]=h*p+x,t[5]=s*u,t[9]=d*p-_,t[2]=_*p-d,t[6]=o*u,t[10]=x*p+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_d,e,vd)}lookAt(e,t,n){const r=this.elements;return Jt.subVectors(e,t),Jt.lengthSq()===0&&(Jt.z=1),Jt.normalize(),Jn.crossVectors(n,Jt),Jn.lengthSq()===0&&(Math.abs(n.z)===1?Jt.x+=1e-4:Jt.z+=1e-4,Jt.normalize(),Jn.crossVectors(n,Jt)),Jn.normalize(),Gr.crossVectors(Jt,Jn),r[0]=Jn.x,r[4]=Gr.x,r[8]=Jt.x,r[1]=Jn.y,r[5]=Gr.y,r[9]=Jt.y,r[2]=Jn.z,r[6]=Gr.z,r[10]=Jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,a=this.elements,s=n[0],o=n[4],l=n[8],c=n[12],u=n[1],p=n[5],h=n[9],d=n[13],_=n[2],x=n[6],m=n[10],f=n[14],v=n[3],E=n[7],y=n[11],A=n[15],T=r[0],g=r[4],b=r[8],C=r[12],R=r[1],D=r[5],O=r[9],V=r[13],L=r[2],G=r[6],X=r[10],N=r[14],K=r[3],W=r[7],j=r[11],Q=r[15];return a[0]=s*T+o*R+l*L+c*K,a[4]=s*g+o*D+l*G+c*W,a[8]=s*b+o*O+l*X+c*j,a[12]=s*C+o*V+l*N+c*Q,a[1]=u*T+p*R+h*L+d*K,a[5]=u*g+p*D+h*G+d*W,a[9]=u*b+p*O+h*X+d*j,a[13]=u*C+p*V+h*N+d*Q,a[2]=_*T+x*R+m*L+f*K,a[6]=_*g+x*D+m*G+f*W,a[10]=_*b+x*O+m*X+f*j,a[14]=_*C+x*V+m*N+f*Q,a[3]=v*T+E*R+y*L+A*K,a[7]=v*g+E*D+y*G+A*W,a[11]=v*b+E*O+y*X+A*j,a[15]=v*C+E*V+y*N+A*Q,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],a=e[12],s=e[1],o=e[5],l=e[9],c=e[13],u=e[2],p=e[6],h=e[10],d=e[14],_=e[3],x=e[7],m=e[11],f=e[15],v=l*d-c*h,E=o*d-c*p,y=o*h-l*p,A=s*d-c*u,T=s*h-l*u,g=s*p-o*u;return t*(x*v-m*E+f*y)-n*(_*v-m*A+f*T)+r*(_*E-x*A+f*g)-a*(_*y-x*T+m*g)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],r=e[8],a=e[1],s=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(s*u-o*c)-n*(a*u-o*l)+r*(a*c-s*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],s=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=e[9],h=e[10],d=e[11],_=e[12],x=e[13],m=e[14],f=e[15],v=t*o-n*s,E=t*l-r*s,y=t*c-a*s,A=n*l-r*o,T=n*c-a*o,g=r*c-a*l,b=u*x-p*_,C=u*m-h*_,R=u*f-d*_,D=p*m-h*x,O=p*f-d*x,V=h*f-d*m,L=v*V-E*O+y*D+A*R-T*C+g*b;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const G=1/L;return e[0]=(o*V-l*O+c*D)*G,e[1]=(r*O-n*V-a*D)*G,e[2]=(x*g-m*T+f*A)*G,e[3]=(h*T-p*g-d*A)*G,e[4]=(l*R-s*V-c*C)*G,e[5]=(t*V-r*R+a*C)*G,e[6]=(m*y-_*g-f*E)*G,e[7]=(u*g-h*y+d*E)*G,e[8]=(s*O-o*R+c*b)*G,e[9]=(n*R-t*O-a*b)*G,e[10]=(_*T-x*y+f*v)*G,e[11]=(p*y-u*T-d*v)*G,e[12]=(o*C-s*D-l*b)*G,e[13]=(t*D-n*C+r*b)*G,e[14]=(x*E-_*A-m*v)*G,e[15]=(u*A-p*E+h*v)*G,this}scale(e){const t=this.elements,n=e.x,r=e.y,a=e.z;return t[0]*=n,t[4]*=r,t[8]*=a,t[1]*=n,t[5]*=r,t[9]*=a,t[2]*=n,t[6]*=r,t[10]*=a,t[3]*=n,t[7]*=r,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),a=1-n,s=e.x,o=e.y,l=e.z,c=a*s,u=a*o;return this.set(c*s+n,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+n,u*l-r*s,0,c*l-r*o,u*l+r*s,a*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,a,s){return this.set(1,n,a,0,e,1,s,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,a=t._x,s=t._y,o=t._z,l=t._w,c=a+a,u=s+s,p=o+o,h=a*c,d=a*u,_=a*p,x=s*u,m=s*p,f=o*p,v=l*c,E=l*u,y=l*p,A=n.x,T=n.y,g=n.z;return r[0]=(1-(x+f))*A,r[1]=(d+y)*A,r[2]=(_-E)*A,r[3]=0,r[4]=(d-y)*T,r[5]=(1-(h+f))*T,r[6]=(m+v)*T,r[7]=0,r[8]=(_+E)*g,r[9]=(m-v)*g,r[10]=(1-(h+x))*g,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];const a=this.determinantAffine();if(a===0)return n.set(1,1,1),t.identity(),this;let s=Ci.set(r[0],r[1],r[2]).length();const o=Ci.set(r[4],r[5],r[6]).length(),l=Ci.set(r[8],r[9],r[10]).length();a<0&&(s=-s),mn.copy(this);const c=1/s,u=1/o,p=1/l;return mn.elements[0]*=c,mn.elements[1]*=c,mn.elements[2]*=c,mn.elements[4]*=u,mn.elements[5]*=u,mn.elements[6]*=u,mn.elements[8]*=p,mn.elements[9]*=p,mn.elements[10]*=p,t.setFromRotationMatrix(mn),n.x=s,n.y=o,n.z=l,this}makePerspective(e,t,n,r,a,s,o=yn,l=!1){const c=this.elements,u=2*a/(t-e),p=2*a/(n-r),h=(t+e)/(t-e),d=(n+r)/(n-r);let _,x;if(l)_=a/(s-a),x=s*a/(s-a);else if(o===yn)_=-(s+a)/(s-a),x=-2*s*a/(s-a);else if(o===Ia)_=-s/(s-a),x=-s*a/(s-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=p,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,a,s,o=yn,l=!1){const c=this.elements,u=2/(t-e),p=2/(n-r),h=-(t+e)/(t-e),d=-(n+r)/(n-r);let _,x;if(l)_=1/(s-a),x=s/(s-a);else if(o===yn)_=-2/(s-a),x=-(s+a)/(s-a);else if(o===Ia)_=-1/(s-a),x=-a/(s-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=p,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=_,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ci=new I,mn=new lt,_d=new I(0,0,0),vd=new I(1,1,1),Jn=new I,Gr=new I,Jt=new I,Rl=new lt,Cl=new ci;class Ei{constructor(e=0,t=0,n=0,r=Ei.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,a=r[0],s=r[4],o=r[8],l=r[1],c=r[5],u=r[9],p=r[2],h=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-s,a)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,d),this._z=Math.atan2(-s,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-qe(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-s,c));break;case"YZX":this._z=Math.asin(qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-qe(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Rl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Rl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Cl.setFromEuler(this),this.setFromQuaternion(Cl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ei.DEFAULT_ORDER="XYZ";class ou{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xd=0;const Pl=new I,Pi=new ci,Un=new lt,Hr=new I,or=new I,bd=new I,Md=new ci,Ll=new I(1,0,0),Dl=new I(0,1,0),Il=new I(0,0,1),Nl={type:"added"},Sd={type:"removed"},Li={type:"childadded",child:null},gs={type:"childremoved",child:null};class zt extends Ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=zt.DEFAULT_UP.clone();const e=new I,t=new Ei,n=new ci,r=new I(1,1,1);function a(){n.setFromEuler(t,!1)}function s(){t.setFromQuaternion(n,void 0,!1)}t._onChange(a),n._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new lt},normalMatrix:{value:new Ue}}),this.matrix=new lt,this.matrixWorld=new lt,this.matrixAutoUpdate=zt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=zt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ou,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Pi.setFromAxisAngle(e,t),this.quaternion.multiply(Pi),this}rotateOnWorldAxis(e,t){return Pi.setFromAxisAngle(e,t),this.quaternion.premultiply(Pi),this}rotateX(e){return this.rotateOnAxis(Ll,e)}rotateY(e){return this.rotateOnAxis(Dl,e)}rotateZ(e){return this.rotateOnAxis(Il,e)}translateOnAxis(e,t){return Pl.copy(e).applyQuaternion(this.quaternion),this.position.add(Pl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ll,e)}translateY(e){return this.translateOnAxis(Dl,e)}translateZ(e){return this.translateOnAxis(Il,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Un.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Hr.copy(e):Hr.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),or.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Un.lookAt(or,Hr,this.up):Un.lookAt(Hr,or,this.up),this.quaternion.setFromRotationMatrix(Un),r&&(Un.extractRotation(r.matrixWorld),Pi.setFromRotationMatrix(Un),this.quaternion.premultiply(Pi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ze("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Nl),Li.child=e,this.dispatchEvent(Li),Li.child=null):Ze("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sd),gs.child=e,this.dispatchEvent(gs),gs.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Un.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Un.multiply(e.parent.matrixWorld)),e.applyMatrix4(Un),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Nl),Li.child=e,this.dispatchEvent(Li),Li.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const s=this.children[n].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let a=0,s=r.length;a<s;a++)r[a].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,e,bd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,Md,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,r=e.z,a=this.matrix.elements;a[12]+=t-a[0]*t-a[4]*n-a[8]*r,a[13]+=n-a[1]*t-a[5]*n-a[9]*r,a[14]+=r-a[2]*t-a[6]*n-a[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const a=this.children;for(let s=0,o=a.length;s<o;s++)a[s].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=a(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const p=l[c];a(e.shapes,p)}else a(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(e.materials,this.material[l]));r.material=o}else r.material=a(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(a(e.animations,l))}}if(t){const o=s(e.geometries),l=s(e.materials),c=s(e.textures),u=s(e.images),p=s(e.shapes),h=s(e.skeletons),d=s(e.animations),_=s(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),_.length>0&&(n.nodes=_)}return n.object=r,n;function s(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}zt.DEFAULT_UP=new I(0,1,0);zt.DEFAULT_MATRIX_AUTO_UPDATE=!0;zt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Xn extends zt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const yd={type:"move"};class _s{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,a=null,s=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){s=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),f=this._getHandJoint(c,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.quaternion,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],h=u.position.distanceTo(p.position),d=.02,_=.005;c.inputState.pinching&&h>d+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=d-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,n),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&a!==null&&(r=a),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(yd)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Xn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const lu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qn={h:0,s:0,l:0},Vr={h:0,s:0,l:0};function vs(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class De{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=on){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Xe.workingColorSpace){if(e=cd(e,1),t=qe(t,0,1),n=qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const a=n<=.5?n*(1+t):n+t-n*t,s=2*n-a;this.r=vs(s,a,e+1/3),this.g=vs(s,a,e),this.b=vs(s,a,e-1/3)}return Xe.colorSpaceToWorking(this,r),this}setStyle(e,t=on){function n(a){a!==void 0&&parseFloat(a)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const s=r[1],o=r[2];switch(s){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(100,parseFloat(a[1]))/100,Math.min(100,parseFloat(a[2]))/100,Math.min(100,parseFloat(a[3]))/100,t);break;case"hsl":case"hsla":if(a=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=r[1],s=a.length;if(s===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(a,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=on){const n=lu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=$n(e.r),this.g=$n(e.g),this.b=$n(e.b),this}copyLinearToSRGB(e){return this.r=Yi(e.r),this.g=Yi(e.g),this.b=Yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=on){return Xe.workingToColorSpace(Ot.copy(this),e),Math.round(qe(Ot.r*255,0,255))*65536+Math.round(qe(Ot.g*255,0,255))*256+Math.round(qe(Ot.b*255,0,255))}getHexString(e=on){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Ot.copy(this),t);const n=Ot.r,r=Ot.g,a=Ot.b,s=Math.max(n,r,a),o=Math.min(n,r,a);let l,c;const u=(o+s)/2;if(o===s)l=0,c=0;else{const p=s-o;switch(c=u<=.5?p/(s+o):p/(2-s-o),s){case n:l=(r-a)/p+(r<a?6:0);break;case r:l=(a-n)/p+2;break;case a:l=(n-r)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Ot.copy(this),t),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=on){Xe.workingToColorSpace(Ot.copy(this),e);const t=Ot.r,n=Ot.g,r=Ot.b;return e!==on?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Qn),this.setHSL(Qn.h+e,Qn.s+t,Qn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Qn),e.getHSL(Vr);const n=hs(Qn.h,Vr.h,t),r=hs(Qn.s,Vr.s,t),a=hs(Qn.l,Vr.l,t);return this.setHSL(n,r,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,a=e.elements;return this.r=a[0]*t+a[3]*n+a[6]*r,this.g=a[1]*t+a[4]*n+a[7]*r,this.b=a[2]*t+a[5]*n+a[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ot=new De;De.NAMES=lu;class Ed extends zt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ei,this.environmentIntensity=1,this.environmentRotation=new Ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const gn=new I,Fn=new I,xs=new I,On=new I,Di=new I,Ii=new I,Ul=new I,bs=new I,Ms=new I,Ss=new I,ys=new ht,Es=new ht,Ts=new ht;class hn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),gn.subVectors(e,t),r.cross(gn);const a=r.lengthSq();return a>0?r.multiplyScalar(1/Math.sqrt(a)):r.set(0,0,0)}static getBarycoord(e,t,n,r,a){gn.subVectors(r,t),Fn.subVectors(n,t),xs.subVectors(e,t);const s=gn.dot(gn),o=gn.dot(Fn),l=gn.dot(xs),c=Fn.dot(Fn),u=Fn.dot(xs),p=s*c-o*o;if(p===0)return a.set(0,0,0),null;const h=1/p,d=(c*l-o*u)*h,_=(s*u-o*l)*h;return a.set(1-d-_,_,d)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,On)===null?!1:On.x>=0&&On.y>=0&&On.x+On.y<=1}static getInterpolation(e,t,n,r,a,s,o,l){return this.getBarycoord(e,t,n,r,On)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,On.x),l.addScaledVector(s,On.y),l.addScaledVector(o,On.z),l)}static getInterpolatedAttribute(e,t,n,r,a,s){return ys.setScalar(0),Es.setScalar(0),Ts.setScalar(0),ys.fromBufferAttribute(e,t),Es.fromBufferAttribute(e,n),Ts.fromBufferAttribute(e,r),s.setScalar(0),s.addScaledVector(ys,a.x),s.addScaledVector(Es,a.y),s.addScaledVector(Ts,a.z),s}static isFrontFacing(e,t,n,r){return gn.subVectors(n,t),Fn.subVectors(e,t),gn.cross(Fn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return gn.subVectors(this.c,this.b),Fn.subVectors(this.a,this.b),gn.cross(Fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return hn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return hn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,a){return hn.getInterpolation(e,this.a,this.b,this.c,t,n,r,a)}containsPoint(e){return hn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return hn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,a=this.c;let s,o;Di.subVectors(r,n),Ii.subVectors(a,n),bs.subVectors(e,n);const l=Di.dot(bs),c=Ii.dot(bs);if(l<=0&&c<=0)return t.copy(n);Ms.subVectors(e,r);const u=Di.dot(Ms),p=Ii.dot(Ms);if(u>=0&&p<=u)return t.copy(r);const h=l*p-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return s=l/(l-u),t.copy(n).addScaledVector(Di,s);Ss.subVectors(e,a);const d=Di.dot(Ss),_=Ii.dot(Ss);if(_>=0&&d<=_)return t.copy(a);const x=d*c-l*_;if(x<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Ii,o);const m=u*_-d*p;if(m<=0&&p-u>=0&&d-_>=0)return Ul.subVectors(a,r),o=(p-u)/(p-u+(d-_)),t.copy(r).addScaledVector(Ul,o);const f=1/(m+x+h);return s=x*f,o=h*f,t.copy(n).addScaledVector(Di,s).addScaledVector(Ii,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Lr{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(_n.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(_n.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=_n.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const a=n.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let s=0,o=a.count;s<o;s++)e.isMesh===!0?e.getVertexPosition(s,_n):_n.fromBufferAttribute(a,s),_n.applyMatrix4(e.matrixWorld),this.expandByPoint(_n);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wr.copy(n.boundingBox)),Wr.applyMatrix4(e.matrixWorld),this.union(Wr)}const r=e.children;for(let a=0,s=r.length;a<s;a++)this.expandByObject(r[a],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_n),_n.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(lr),Xr.subVectors(this.max,lr),Ni.subVectors(e.a,lr),Ui.subVectors(e.b,lr),Fi.subVectors(e.c,lr),ei.subVectors(Ui,Ni),ti.subVectors(Fi,Ui),mi.subVectors(Ni,Fi);let t=[0,-ei.z,ei.y,0,-ti.z,ti.y,0,-mi.z,mi.y,ei.z,0,-ei.x,ti.z,0,-ti.x,mi.z,0,-mi.x,-ei.y,ei.x,0,-ti.y,ti.x,0,-mi.y,mi.x,0];return!As(t,Ni,Ui,Fi,Xr)||(t=[1,0,0,0,1,0,0,0,1],!As(t,Ni,Ui,Fi,Xr))?!1:(qr.crossVectors(ei,ti),t=[qr.x,qr.y,qr.z],As(t,Ni,Ui,Fi,Xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_n).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_n).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Bn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Bn=[new I,new I,new I,new I,new I,new I,new I,new I],_n=new I,Wr=new Lr,Ni=new I,Ui=new I,Fi=new I,ei=new I,ti=new I,mi=new I,lr=new I,Xr=new I,qr=new I,gi=new I;function As(i,e,t,n,r){for(let a=0,s=i.length-3;a<=s;a+=3){gi.fromArray(i,a);const o=r.x*Math.abs(gi.x)+r.y*Math.abs(gi.y)+r.z*Math.abs(gi.z),l=e.dot(gi),c=t.dot(gi),u=n.dot(gi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const gt=new I,$r=new we;let Td=0;class $e extends Ti{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Td++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=nu,this.updateRanges=[],this.gpuType=Ln,this.version=0,this._normalizationScale=e!==void 0?$a(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,a=this.itemSize;r<a;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)$r.fromBufferAttribute(this,t),$r.applyMatrix3(e),this.setXY(t,$r.x,$r.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix3(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix4(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyNormalMatrix(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.transformDirection(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,a){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),a=this._normalize(a)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):ru(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):au(e,this.array)}}class cu extends $e{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class uu extends $e{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class at extends $e{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Ad=new Lr,cr=new I,ws=new I;class Dr{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ad.setFromPoints(e).getCenter(n);let r=0;for(let a=0,s=e.length;a<s;a++)r=Math.max(r,n.distanceToSquared(e[a]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;cr.subVectors(e,this.center);const t=cr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(cr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ws.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(cr.copy(e.center).add(ws)),this.expandByPoint(cr.copy(e.center).sub(ws))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let wd=0;const sn=new lt,Rs=new zt,Oi=new I,Qt=new Lr,ur=new Lr,Rt=new I;class ft extends Ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:wd++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ad(e)?uu:cu)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const a=new Ue().getNormalMatrix(e);n.applyNormalMatrix(a),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return sn.makeRotationFromQuaternion(e),this.applyMatrix4(sn),this}rotateX(e){return sn.makeRotationX(e),this.applyMatrix4(sn),this}rotateY(e){return sn.makeRotationY(e),this.applyMatrix4(sn),this}rotateZ(e){return sn.makeRotationZ(e),this.applyMatrix4(sn),this}translate(e,t,n){return sn.makeTranslation(e,t,n),this.applyMatrix4(sn),this}scale(e,t,n){return sn.makeScale(e,t,n),this.applyMatrix4(sn),this}lookAt(e){return Rs.lookAt(e),Rs.updateMatrix(),this.applyMatrix4(Rs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Oi).negate(),this.translate(Oi.x,Oi.y,Oi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,a=e.length;r<a;r++){const s=e[r];n.push(s.x,s.y,s.z||0)}this.setAttribute("position",new at(n,3))}else{const n=Math.min(e.length,t.count);for(let r=0;r<n;r++){const a=e[r];t.setXYZ(r,a.x,a.y,a.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Lr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ze("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const a=t[n];Qt.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ze('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Dr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ze("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let a=0,s=t.length;a<s;a++){const o=t[a];ur.setFromBufferAttribute(o),this.morphTargetsRelative?(Rt.addVectors(Qt.min,ur.min),Qt.expandByPoint(Rt),Rt.addVectors(Qt.max,ur.max),Qt.expandByPoint(Rt)):(Qt.expandByPoint(ur.min),Qt.expandByPoint(ur.max))}Qt.getCenter(n);let r=0;for(let a=0,s=e.count;a<s;a++)Rt.fromBufferAttribute(e,a),r=Math.max(r,n.distanceToSquared(Rt));if(t)for(let a=0,s=t.length;a<s;a++){const o=t[a],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Rt.fromBufferAttribute(o,c),l&&(Oi.fromBufferAttribute(e,c),Rt.add(Oi)),r=Math.max(r,n.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ze('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ze("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,a=t.uv;let s=this.getAttribute("tangent");(s===void 0||s.count!==n.count)&&(s=new $e(new Float32Array(4*n.count),4),this.setAttribute("tangent",s));const o=[],l=[],c=new Uint8Array(n.count);for(let C=0;C<n.count;C++)o[C]=new I,l[C]=new I;const u=new I,p=new I,h=new I,d=new we,_=new we,x=new we,m=new I,f=new I;function v(C,R,D){c[C]=c[R]=c[D]=1,u.fromBufferAttribute(n,C),p.fromBufferAttribute(n,R),h.fromBufferAttribute(n,D),d.fromBufferAttribute(a,C),_.fromBufferAttribute(a,R),x.fromBufferAttribute(a,D),p.sub(u),h.sub(u),_.sub(d),x.sub(d);const O=1/(_.x*x.y-x.x*_.y);isFinite(O)&&(m.copy(p).multiplyScalar(x.y).addScaledVector(h,-_.y).multiplyScalar(O),f.copy(h).multiplyScalar(_.x).addScaledVector(p,-x.x).multiplyScalar(O),o[C].add(m),o[R].add(m),o[D].add(m),l[C].add(f),l[R].add(f),l[D].add(f))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let C=0,R=E.length;C<R;++C){const D=E[C],O=D.start,V=D.count;for(let L=O,G=O+V;L<G;L+=3)v(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const y=new I,A=new I,T=new I,g=new I;function b(C){T.fromBufferAttribute(r,C),g.copy(T);const R=o[C];y.copy(R),y.sub(T.multiplyScalar(T.dot(R))).normalize(),A.crossVectors(g,R);const O=A.dot(l[C])<0?-1:1;s.setXYZW(C,y.x,y.y,y.z,O)}for(let C=0,R=n.count;C<R;++C)c[C]&&b(C);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new $e(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);const r=new I,a=new I,s=new I,o=new I,l=new I,c=new I,u=new I,p=new I;if(e)for(let h=0,d=e.count;h<d;h+=3){const _=e.getX(h+0),x=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,x),s.fromBufferAttribute(t,m),u.subVectors(s,a),p.subVectors(r,a),u.cross(p),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,d=t.count;h<d;h+=3)r.fromBufferAttribute(t,h+0),a.fromBufferAttribute(t,h+1),s.fromBufferAttribute(t,h+2),u.subVectors(s,a),p.subVectors(r,a),u.cross(p),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,p=o.normalized,h=new c.constructor(l.length*u);let d=0,_=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?d=l[x]*o.data.stride+o.offset:d=l[x]*u;for(let f=0;f<u;f++)h[_++]=c[d++]}return new $e(h,u,p)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new ft,n=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,n);t.setAttribute(o,c)}const a=this.morphAttributes;for(const o in a){const l=[],c=a[o];for(let u=0,p=c.length;u<p;u++){const h=c[u],d=e(h,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const s=this.groups;for(let o=0,l=s.length;o<l;o++){const c=s[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let a=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let p=0,h=c.length;p<h;p++){const d=c[p];u.push(d.toJSON(e.data))}u.length>0&&(r[l]=u,a=!0)}a&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const s=this.groups;s.length>0&&(e.data.groups=JSON.parse(JSON.stringify(s)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const a=e.morphAttributes;for(const c in a){const u=[],p=a[c];for(let h=0,d=p.length;h<d;h++)u.push(p[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const s=e.groups;for(let c=0,u=s.length;c<u;c++){const p=s[c];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Rd{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=nu,this.updateRanges=[],this.version=0,this.uuid=Ai()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,a=this.stride;r<a;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=Fl(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);const n=new this.array.constructor(e.arrayBuffers[t]),r=new this.constructor(n,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=Fl(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));const n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}}function Fl(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=Ai()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}const Ht=new I;class Fa{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r,this._normalizationScale=e!==void 0?$a(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.applyMatrix4(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.applyNormalMatrix(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.transformDirection(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),a=this._normalize(a)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=a,this}clone(e){if(e===void 0){Ua("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)t.push(this.data.array[r+a])}return new $e(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Fa(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ua("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)t.push(this.data.array[r+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):ru(e,this.data.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):au(e,this.data.array)}}const Cs=new I,Cd=new I,Pd=new Ue;class ii{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=Cs.subVectors(n,t).cross(Cd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const r=e.delta(Cs),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/a;return n===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(r,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Pd.getNormalMatrix(e),r=this.coplanarPoint(Cs).applyMatrix4(e),a=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Ld=0;class wi extends Ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ld++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=Mr,this.side=Si,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Hc,this.blendDst=Vc,this.blendEquation=qi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=Ar,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Qh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=cs,this.stencilZFail=cs,this.stencilZPass=cs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(a){const s=[];for(const o in a){const l=a[o];delete l.metadata,s.push(l)}return s}if(t){const a=r(e.textures),s=r(e.images);a.length>0&&(n.textures=a),s.length>0&&(n.images=s)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new De().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new ii().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new we().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new we().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let a=0;a!==r;++a)n[a]=t[a].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class hu extends wi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new De(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Bi;const hr=new I,zi=new I,ki=new I,Gi=new we,dr=new we,du=new lt,Yr=new I,fr=new I,Kr=new I,Ol=new we,Ps=new we,Bl=new we;class Dd extends zt{constructor(e=new hu){if(super(),this.isSprite=!0,this.type="Sprite",Bi===void 0){Bi=new ft;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Rd(t,5);Bi.setIndex([0,1,2,0,2,3]),Bi.setAttribute("position",new Fa(n,3,0,!1)),Bi.setAttribute("uv",new Fa(n,2,3,!1))}this.geometry=Bi,this.material=e,this.center=new we(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Ze('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),zi.setFromMatrixScale(this.matrixWorld),du.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ki.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&zi.multiplyScalar(-ki.z);const n=this.material.rotation;let r,a;n!==0&&(a=Math.cos(n),r=Math.sin(n));const s=this.center;jr(Yr.set(-.5,-.5,0),ki,s,zi,r,a),jr(fr.set(.5,-.5,0),ki,s,zi,r,a),jr(Kr.set(.5,.5,0),ki,s,zi,r,a),Ol.set(0,0),Ps.set(1,0),Bl.set(1,1);let o=e.ray.intersectTriangle(Yr,fr,Kr,!1,hr);if(o===null&&(jr(fr.set(-.5,.5,0),ki,s,zi,r,a),Ps.set(0,1),o=e.ray.intersectTriangle(Yr,Kr,fr,!1,hr),o===null))return;const l=e.ray.origin.distanceTo(hr);l<e.near||l>e.far||t.push({distance:l,point:hr.clone(),uv:hn.getInterpolation(hr,Yr,fr,Kr,Ol,Ps,Bl,new we),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){const t=super.toJSON(e);return t.object.center=this.center.toArray(),t}}function jr(i,e,t,n,r,a){Gi.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(dr.x=a*Gi.x-r*Gi.y,dr.y=r*Gi.x+a*Gi.y):dr.copy(Gi),i.copy(e),i.x+=dr.x,i.y+=dr.y,i.applyMatrix4(du)}const zn=new I,Ls=new I,Zr=new I,Jr=new I;class Xo{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zn.copy(this.origin).addScaledVector(this.direction,t),zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ls.copy(e).add(t).multiplyScalar(.5),Zr.copy(t).sub(e).normalize(),Jr.copy(this.origin).sub(Ls);const a=e.distanceTo(t)*.5,s=-this.direction.dot(Zr),o=Jr.dot(this.direction),l=-Jr.dot(Zr),c=Jr.lengthSq(),u=Math.abs(1-s*s);let p,h,d,_;if(u>0)if(p=s*l-o,h=s*o-l,_=a*u,p>=0)if(h>=-_)if(h<=_){const x=1/u;p*=x,h*=x,d=p*(p+s*h+2*o)+h*(s*p+h+2*l)+c}else h=a,p=Math.max(0,-(s*h+o)),d=-p*p+h*(h+2*l)+c;else h=-a,p=Math.max(0,-(s*h+o)),d=-p*p+h*(h+2*l)+c;else h<=-_?(p=Math.max(0,-(-s*a+o)),h=p>0?-a:Math.min(Math.max(-a,-l),a),d=-p*p+h*(h+2*l)+c):h<=_?(p=0,h=Math.min(Math.max(-a,-l),a),d=h*(h+2*l)+c):(p=Math.max(0,-(s*a+o)),h=p>0?a:Math.min(Math.max(-a,-l),a),d=-p*p+h*(h+2*l)+c);else h=s>0?-a:a,p=Math.max(0,-(s*h+o)),d=-p*p+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Ls).addScaledVector(Zr,h),d}intersectSphere(e,t){if(e.radius<0)return null;zn.subVectors(e.center,this.origin);const n=zn.dot(this.direction),r=zn.dot(zn)-n*n,a=e.radius*e.radius;if(r>a)return null;const s=Math.sqrt(a-r),o=n-s,l=n+s;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,a,s,o,l;const c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(a=(e.min.y-h.y)*u,s=(e.max.y-h.y)*u):(a=(e.max.y-h.y)*u,s=(e.min.y-h.y)*u),n>s||a>r||((a>n||isNaN(n))&&(n=a),(s<r||isNaN(r))&&(r=s),p>=0?(o=(e.min.z-h.z)*p,l=(e.max.z-h.z)*p):(o=(e.max.z-h.z)*p,l=(e.min.z-h.z)*p),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,zn)!==null}intersectTriangle(e,t,n,r,a){const s=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,p=e.x-s.x,h=e.y-s.y,d=e.z-s.z,_=t.x-s.x,x=t.y-s.y,m=t.z-s.z,f=n.x-s.x,v=n.y-s.y,E=n.z-s.z,y=Math.abs(l),A=Math.abs(c),T=Math.abs(u);let g,b,C,R,D,O,V,L,G,X,N,K;if(y>=A&&y>=T?(C=l,O=p,G=_,K=f,l>=0?(g=c,b=u,R=h,D=d,V=x,L=m,X=v,N=E):(g=u,b=c,R=d,D=h,V=m,L=x,X=E,N=v)):A>=T?(C=c,O=h,G=x,K=v,c>=0?(g=u,b=l,R=d,D=p,V=m,L=_,X=E,N=f):(g=l,b=u,R=p,D=d,V=_,L=m,X=f,N=E)):(C=u,O=d,G=m,K=E,u>=0?(g=l,b=c,R=p,D=h,V=_,L=x,X=f,N=v):(g=c,b=l,R=h,D=p,V=x,L=_,X=v,N=f)),C===0)return null;const W=g/C,j=b/C,Q=1/C,ae=R-W*O,ce=D-j*O,H=V-W*G,ne=L-j*G,me=X-W*K,be=N-j*K,te=me*ne-be*H,Re=ae*be-ce*me,Ge=H*ce-ne*ae;if(r){if(te<0||Re<0||Ge<0)return null}else if((te<0||Re<0||Ge<0)&&(te>0||Re>0||Ge>0))return null;const Te=te+Re+Ge;if(Te===0)return null;const Ye=Q*(te*O+Re*G+Ge*K);return(Te>0?Ye<0:Ye>0)?null:this.at(Ye/Te,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Oa extends wi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ei,this.combine=Wc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const zl=new lt,_i=new Xo,Qr=new Dr,kl=new I,ea=new I,ta=new I,na=new I,Ds=new I,ia=new I,Gl=new I,ra=new I;class xt extends zt{constructor(e=new ft,t=new Oa){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,s=r.length;a<s;a++){const o=r[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,a=n.morphAttributes.position,s=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(a&&o){ia.set(0,0,0);for(let l=0,c=a.length;l<c;l++){const u=o[l],p=a[l];u!==0&&(Ds.fromBufferAttribute(p,e),s?ia.addScaledVector(Ds,u):ia.addScaledVector(Ds.sub(t),u))}t.add(ia)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,r=this.material,a=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qr.copy(n.boundingSphere),Qr.applyMatrix4(a),_i.copy(e.ray).recast(e.near),!(Qr.containsPoint(_i.origin)===!1&&(_i.intersectSphere(Qr,kl)===null||_i.origin.distanceToSquared(kl)>(e.far-e.near)**2))&&(zl.copy(a).invert(),_i.copy(e.ray).applyMatrix4(zl),!(n.boundingBox!==null&&_i.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,_i)))}_computeIntersections(e,t,n){let r;const a=this.geometry,s=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,u=a.attributes.uv1,p=a.attributes.normal,h=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(s))for(let _=0,x=h.length;_<x;_++){const m=h[_],f=s[m.materialIndex],v=Math.max(m.start,d.start),E=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=v,A=E;y<A;y+=3){const T=o.getX(y),g=o.getX(y+1),b=o.getX(y+2);r=aa(this,f,e,n,c,u,p,T,g,b),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const _=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=_,f=x;m<f;m+=3){const v=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);r=aa(this,s,e,n,c,u,p,v,E,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(s))for(let _=0,x=h.length;_<x;_++){const m=h[_],f=s[m.materialIndex],v=Math.max(m.start,d.start),E=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=v,A=E;y<A;y+=3){const T=y,g=y+1,b=y+2;r=aa(this,f,e,n,c,u,p,T,g,b),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const _=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=_,f=x;m<f;m+=3){const v=m,E=m+1,y=m+2;r=aa(this,s,e,n,c,u,p,v,E,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function Id(i,e,t,n,r,a,s,o){let l;if(e.side===Wt?l=n.intersectTriangle(s,a,r,!0,o):l=n.intersectTriangle(r,a,s,e.side===Si,o),l===null)return null;ra.copy(o),ra.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(ra);return c<t.near||c>t.far?null:{distance:c,point:ra.clone(),object:i}}function aa(i,e,t,n,r,a,s,o,l,c){i.getVertexPosition(o,ea),i.getVertexPosition(l,ta),i.getVertexPosition(c,na);const u=Id(i,e,t,n,ea,ta,na,Gl);if(u){const p=new I;hn.getBarycoord(Gl,ea,ta,na,p),r&&(u.uv=hn.getInterpolatedAttribute(r,o,l,c,p,new we)),a&&(u.uv1=hn.getInterpolatedAttribute(a,o,l,c,p,new we)),s&&(u.normal=hn.getInterpolatedAttribute(s,o,l,c,p,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new I,materialIndex:0};hn.getNormal(ea,ta,na,h.normal),u.face=h,u.barycoord=p}return u}class Nd extends Bt{constructor(e=null,t=1,n=1,r,a,s,o,l,c=Pt,u=Pt,p,h){super(null,s,o,l,c,u,r,a,p,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class pr extends $e{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const vi=new Dr,Ud=new we(.5,.5),sa=new I;class Ba{constructor(e=new ii,t=new ii,n=new ii,r=new ii,a=new ii,s=new ii){this.planes=[e,t,n,r,a,s]}set(e,t,n,r,a,s){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(a),o[5].copy(s),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yn,n=!1){const r=this.planes,a=e.elements,s=a[0],o=a[1],l=a[2],c=a[3],u=a[4],p=a[5],h=a[6],d=a[7],_=a[8],x=a[9],m=a[10],f=a[11],v=a[12],E=a[13],y=a[14],A=a[15];if(r[0].setComponents(c-s,d-u,f-_,A-v).normalize(),r[1].setComponents(c+s,d+u,f+_,A+v).normalize(),r[2].setComponents(c+o,d+p,f+x,A+E).normalize(),r[3].setComponents(c-o,d-p,f-x,A-E).normalize(),n)r[4].setComponents(l,h,m,y).normalize(),r[5].setComponents(c-l,d-h,f-m,A-y).normalize();else if(r[4].setComponents(c-l,d-h,f-m,A-y).normalize(),t===yn)r[5].setComponents(c+l,d+h,f+m,A+y).normalize();else if(t===Ia)r[5].setComponents(l,h,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vi)}intersectsSprite(e){vi.center.set(0,0,0);const t=Ud.distanceTo(e.center);return vi.radius=.7071067811865476+t,vi.applyMatrix4(e.matrixWorld),this.intersectsSphere(vi)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(sa.x=r.normal.x>0?e.max.x:e.min.x,sa.y=r.normal.y>0?e.max.y:e.min.y,sa.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(sa)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const Hl=new lt;class qo{constructor(){this.coordinateSystem=yn,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let r=0;r<t.length;r++){const a=t[r];Hl.multiplyMatrices(a.projectionMatrix,a.matrixWorldInverse),n[r]===void 0&&(n[r]=new Ba),n[r].setFromProjectionMatrix(Hl,a.coordinateSystem,a.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new Ba),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new qo().copy(this)}}class fu extends wi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new De(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const za=new I,ka=new I,Vl=new lt,mr=new Xo,oa=new Dr,Is=new I,Wl=new I;class Fd extends zt{constructor(e=new ft,t=new fu){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,a=t.count;r<a;r++)za.fromBufferAttribute(t,r-1),ka.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=za.distanceTo(ka);e.setAttribute("lineDistance",new at(n,1))}else Le("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,r=this.matrixWorld,a=e.params.Line.threshold,s=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(r),oa.radius+=a,e.ray.intersectsSphere(oa)===!1)return;Vl.copy(r).invert(),mr.copy(e.ray).applyMatrix4(Vl);const o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const d=Math.max(0,s.start),_=Math.min(u.count,s.start+s.count);for(let x=d,m=_-1;x<m;x+=c){const f=u.getX(x),v=u.getX(x+1),E=la(this,e,mr,l,f,v,x);E&&t.push(E)}if(this.isLineLoop){const x=u.getX(_-1),m=u.getX(d),f=la(this,e,mr,l,x,m,_-1);f&&t.push(f)}}else{const d=Math.max(0,s.start),_=Math.min(h.count,s.start+s.count);for(let x=d,m=_-1;x<m;x+=c){const f=la(this,e,mr,l,x,x+1,x);f&&t.push(f)}if(this.isLineLoop){const x=la(this,e,mr,l,_-1,d,_-1);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,s=r.length;a<s;a++){const o=r[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}}function la(i,e,t,n,r,a,s){const o=i.geometry.attributes.position;if(za.fromBufferAttribute(o,r),ka.fromBufferAttribute(o,a),t.distanceSqToSegment(za,ka,Is,Wl)>n)return;Is.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Is);if(!(c<e.near||c>e.far))return{distance:c,point:Wl.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Xl=new I,ql=new I;class Od extends Fd{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,a=t.count;r<a;r+=2)Xl.fromBufferAttribute(t,r),ql.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Xl.distanceTo(ql);e.setAttribute("lineDistance",new at(n,1))}else Le("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Bd extends wi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new De(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const $l=new lt,wo=new Xo,ca=new Dr,ua=new I;class pu extends zt{constructor(e=new ft,t=new Bd){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,r=this.matrixWorld,a=e.params.Points.threshold,s=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ca.copy(n.boundingSphere),ca.applyMatrix4(r),ca.radius+=a,e.ray.intersectsSphere(ca)===!1)return;$l.copy(r).invert(),wo.copy(e.ray).applyMatrix4($l);const o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,p=n.attributes.position;if(c!==null){const h=Math.max(0,s.start),d=Math.min(c.count,s.start+s.count);for(let _=h,x=d;_<x;_++){const m=c.getX(_);ua.fromBufferAttribute(p,m),Yl(ua,m,l,r,e,t,this)}}else{const h=Math.max(0,s.start),d=Math.min(p.count,s.start+s.count);for(let _=h,x=d;_<x;_++)ua.fromBufferAttribute(p,_),Yl(ua,_,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,s=r.length;a<s;a++){const o=r[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}}function Yl(i,e,t,n,r,a,s){const o=wo.distanceSqToPoint(i);if(o<t){const l=new I;wo.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;a.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:s})}}class mu extends Bt{constructor(e=[],t=ji,n,r,a,s,o,l,c,u){super(e,t,n,r,a,s,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class zd extends Bt{constructor(e,t,n,r,a,s,o,l,c){super(e,t,n,r,a,s,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ji extends Bt{constructor(e,t,n=In,r,a,s,o=Pt,l=Pt,c,u=li,p=1){if(u!==li&&u!==ai)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:p};super(h,r,a,s,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Wo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class gu extends Ji{constructor(e,t=In,n=ji,r,a,s=Pt,o=Pt,l,c=li){const u={width:e,height:e,depth:1},p=[u,u,u,u,u,u];super(e,e,t,n,r,a,s,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class _u extends Bt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ir extends ft{constructor(e=1,t=1,n=1,r=1,a=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:a,depthSegments:s};const o=this;r=Math.floor(r),a=Math.floor(a),s=Math.floor(s);const l=[],c=[],u=[],p=[];let h=0,d=0;_("z","y","x",-1,-1,n,t,e,s,a,0),_("z","y","x",1,-1,n,t,-e,s,a,1),_("x","z","y",1,1,e,n,t,r,s,2),_("x","z","y",1,-1,e,n,-t,r,s,3),_("x","y","z",1,-1,e,t,n,r,a,4),_("x","y","z",-1,-1,e,t,-n,r,a,5),this.setIndex(l),this.setAttribute("position",new at(c,3)),this.setAttribute("normal",new at(u,3)),this.setAttribute("uv",new at(p,2));function _(x,m,f,v,E,y,A,T,g,b,C){const R=y/g,D=A/b,O=y/2,V=A/2,L=T/2,G=g+1,X=b+1;let N=0,K=0;const W=new I;for(let j=0;j<X;j++){const Q=j*D-V;for(let ae=0;ae<G;ae++){const ce=ae*R-O;W[x]=ce*v,W[m]=Q*E,W[f]=L,c.push(W.x,W.y,W.z),W[x]=0,W[m]=0,W[f]=T>0?1:-1,u.push(W.x,W.y,W.z),p.push(ae/g),p.push(1-j/b),N+=1}}for(let j=0;j<b;j++)for(let Q=0;Q<g;Q++){const ae=h+Q+G*j,ce=h+Q+G*(j+1),H=h+(Q+1)+G*(j+1),ne=h+(Q+1)+G*j;l.push(ae,ce,ne),l.push(ce,H,ne),K+=6}o.addGroup(d,K,C),d+=K,h+=N}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ir(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class $o extends ft{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};const a=[],s=[];o(r),c(n),u(),this.setAttribute("position",new at(a,3)),this.setAttribute("normal",new at(a.slice(),3)),this.setAttribute("uv",new at(s,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(v){const E=new I,y=new I,A=new I;for(let T=0;T<t.length;T+=3)d(t[T+0],E),d(t[T+1],y),d(t[T+2],A),l(E,y,A,v)}function l(v,E,y,A){const T=A+1,g=[];for(let b=0;b<=T;b++){g[b]=[];const C=v.clone().lerp(y,b/T),R=E.clone().lerp(y,b/T),D=T-b;for(let O=0;O<=D;O++)O===0&&b===T?g[b][O]=C:g[b][O]=C.clone().lerp(R,O/D)}for(let b=0;b<T;b++)for(let C=0;C<2*(T-b)-1;C++){const R=Math.floor(C/2);C%2===0?(h(g[b][R+1]),h(g[b+1][R]),h(g[b][R])):(h(g[b][R+1]),h(g[b+1][R+1]),h(g[b+1][R]))}}function c(v){const E=new I;for(let y=0;y<a.length;y+=3)E.x=a[y+0],E.y=a[y+1],E.z=a[y+2],E.normalize().multiplyScalar(v),a[y+0]=E.x,a[y+1]=E.y,a[y+2]=E.z}function u(){const v=new I;for(let E=0;E<a.length;E+=3){v.x=a[E+0],v.y=a[E+1],v.z=a[E+2];const y=m(v)/2/Math.PI+.5,A=f(v)/Math.PI+.5;s.push(y,1-A)}_(),p()}function p(){for(let v=0;v<s.length;v+=6){const E=s[v+0],y=s[v+2],A=s[v+4],T=Math.max(E,y,A),g=Math.min(E,y,A);T>.9&&g<.1&&(E<.2&&(s[v+0]+=1),y<.2&&(s[v+2]+=1),A<.2&&(s[v+4]+=1))}}function h(v){a.push(v.x,v.y,v.z)}function d(v,E){const y=v*3;E.x=e[y+0],E.y=e[y+1],E.z=e[y+2]}function _(){const v=new I,E=new I,y=new I,A=new I,T=new we,g=new we,b=new we;for(let C=0,R=0;C<a.length;C+=9,R+=6){v.set(a[C+0],a[C+1],a[C+2]),E.set(a[C+3],a[C+4],a[C+5]),y.set(a[C+6],a[C+7],a[C+8]),T.set(s[R+0],s[R+1]),g.set(s[R+2],s[R+3]),b.set(s[R+4],s[R+5]),A.copy(v).add(E).add(y).divideScalar(3);const D=m(A);x(T,R+0,v,D),x(g,R+2,E,D),x(b,R+4,y,D)}}function x(v,E,y,A){A<0&&v.x===1&&(s[E]=v.x-1),y.x===0&&y.z===0&&(s[E]=A/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function f(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $o(e.vertices,e.indices,e.radius,e.detail)}}class Ya extends $o{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],a=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,a,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ya(e.radius,e.detail)}}class Yo extends ft{constructor(e=[new we(0,-.5),new we(.5,0),new we(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=qe(r,0,Math.PI*2);const a=[],s=[],o=[],l=[],c=[],u=1/t,p=new I,h=new we,d=new I,_=new I,x=new I;let m=0,f=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,f=e[v+1].y-e[v].y,d.x=f*1,d.y=-m,d.z=f*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:x.normalize(),l.push(x.x,x.y,x.z);break;default:m=e[v+1].x-e[v].x,f=e[v+1].y-e[v].y,d.x=f*1,d.y=-m,d.z=f*0,_.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(_)}for(let v=0;v<=t;v++){const E=n+v*u*r,y=Math.sin(E),A=Math.cos(E);for(let T=0;T<=e.length-1;T++){p.x=e[T].x*y,p.y=e[T].y,p.z=e[T].x*A,s.push(p.x,p.y,p.z),h.x=v/t,h.y=T/(e.length-1),o.push(h.x,h.y);const g=l[3*T+0]*y,b=l[3*T+1],C=l[3*T+0]*A;c.push(g,b,C)}}for(let v=0;v<t;v++)for(let E=0;E<e.length-1;E++){const y=E+v*e.length,A=y,T=y+e.length,g=y+e.length+1,b=y+1;a.push(A,T,b),a.push(g,b,T)}this.setIndex(a),this.setAttribute("position",new at(s,3)),this.setAttribute("uv",new at(o,2)),this.setAttribute("normal",new at(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yo(e.points,e.segments,e.phiStart,e.phiLength)}}class Ka extends ft{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const a=e/2,s=t/2,o=Math.floor(n),l=Math.floor(r),c=o+1,u=l+1,p=e/o,h=t/l,d=[],_=[],x=[],m=[];for(let f=0;f<u;f++){const v=f*h-s;for(let E=0;E<c;E++){const y=E*p-a;_.push(y,-v,0),x.push(0,0,1),m.push(E/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let v=0;v<o;v++){const E=v+c*f,y=v+c*(f+1),A=v+1+c*(f+1),T=v+1+c*f;d.push(E,y,T),d.push(y,A,T)}this.setIndex(d),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(x,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ka(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ko extends ft{constructor(e=.5,t=1,n=32,r=1,a=0,s=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:a,thetaLength:s},n=Math.max(3,n),r=Math.max(1,r);const o=[],l=[],c=[],u=[];let p=e;const h=(t-e)/r,d=new I,_=new we;for(let x=0;x<=r;x++){for(let m=0;m<=n;m++){const f=a+m/n*s;d.x=p*Math.cos(f),d.y=p*Math.sin(f),l.push(d.x,d.y,d.z),c.push(0,0,1),_.x=(d.x/t+1)/2,_.y=(d.y/t+1)/2,u.push(_.x,_.y)}p+=h}for(let x=0;x<r;x++){const m=x*(n+1);for(let f=0;f<n;f++){const v=f+m,E=v,y=v+n+1,A=v+n+2,T=v+1;o.push(E,y,T),o.push(y,A,T)}}this.setIndex(o),this.setAttribute("position",new at(l,3)),this.setAttribute("normal",new at(c,3)),this.setAttribute("uv",new at(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ko(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class jo extends ft{constructor(e=1,t=32,n=16,r=0,a=Math.PI*2,s=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:a,thetaStart:s,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(s+o,Math.PI);let c=0;const u=[],p=new I,h=new I,d=[],_=[],x=[],m=[];for(let f=0;f<=n;f++){const v=[],E=f/n,y=s+E*o,A=e*Math.cos(y),T=Math.sqrt(e*e-A*A);let g=0;f===0&&s===0?g=.5/t:f===n&&l===Math.PI&&(g=-.5/t);for(let b=0;b<=t;b++){const C=b/t,R=r+C*a;p.x=-T*Math.cos(R),p.y=A,p.z=T*Math.sin(R),_.push(p.x,p.y,p.z),h.copy(p).normalize(),x.push(h.x,h.y,h.z),m.push(C+g,1-E),v.push(c++)}u.push(v)}for(let f=0;f<n;f++)for(let v=0;v<t;v++){const E=u[f][v+1],y=u[f][v],A=u[f+1][v],T=u[f+1][v+1];(f!==0||s>0)&&d.push(E,y,T),(f!==n-1||l<Math.PI)&&d.push(y,A,T)}this.setIndex(d),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(x,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new jo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function Qi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];if(Kl(r))r.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(Kl(r[0])){const a=[];for(let s=0,o=r.length;s<o;s++)a[s]=r[s].clone();e[t][n]=a}else e[t][n]=r.slice();else e[t][n]=r}}return e}function Vt(i){const e={};for(let t=0;t<i.length;t++){const n=Qi(i[t]);for(const r in n)e[r]=n[r]}return e}function Kl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function kd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function vu(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const Cr={clone:Qi,merge:Vt};var Gd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Hd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class dt extends wi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Gd,this.fragmentShader=Hd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Qi(e.uniforms),this.uniformsGroups=kd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const s=this.uniforms[r].value;s&&s.isTexture?t.uniforms[r]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[r]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[r]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[r]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[r]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[r]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[r]={type:"m4",value:s.toArray()}:t.uniforms[r]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new De().setHex(r.value);break;case"v2":this.uniforms[n].value=new we().fromArray(r.value);break;case"v3":this.uniforms[n].value=new I().fromArray(r.value);break;case"v4":this.uniforms[n].value=new ht().fromArray(r.value);break;case"m3":this.uniforms[n].value=new Ue().fromArray(r.value);break;case"m4":this.uniforms[n].value=new lt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class xu extends dt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Vd extends wi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Wd extends wi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const ha=new I,da=new ci,An=new I;class bu extends zt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new lt,this.projectionMatrix=new lt,this.projectionMatrixInverse=new lt,this.coordinateSystem=yn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ha,da,An),An.x===1&&An.y===1&&An.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ha,da,An.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ha,da,An),An.x===1&&An.y===1&&An.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ha,da,An.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const ni=new I,jl=new we,Zl=new we;class bn extends bu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ao*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(us*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ao*2*Math.atan(Math.tan(us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ni.x,ni.y).multiplyScalar(-e/ni.z),ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ni.x,ni.y).multiplyScalar(-e/ni.z)}getViewSize(e,t){return this.getViewBounds(e,jl,Zl),t.subVectors(Zl,jl)}setViewOffset(e,t,n,r,a,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=a,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(us*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,a=-.5*r;const s=this.view;if(this.view!==null&&this.view.enabled){const l=s.fullWidth,c=s.fullHeight;a+=s.offsetX*r/l,t-=s.offsetY*n/c,r*=s.width/l,n*=s.height/c}const o=this.filmOffset;o!==0&&(a+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Mu extends bu{constructor(e=-1,t=1,n=1,r=-1,a=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=a,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,a,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=a,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let a=n-e,s=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,s=a+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(a,s,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Xd extends ft{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}const Hi=-90,Vi=1;class Ro extends zt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new bn(Hi,Vi,e,t);r.layers=this.layers,this.add(r);const a=new bn(Hi,Vi,e,t);a.layers=this.layers,this.add(a);const s=new bn(Hi,Vi,e,t);s.layers=this.layers,this.add(s);const o=new bn(Hi,Vi,e,t);o.layers=this.layers,this.add(o);const l=new bn(Hi,Vi,e,t);l.layers=this.layers,this.add(l);const c=new bn(Hi,Vi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,a,s,o,l]=t;for(const c of t)this.remove(c);if(e===yn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ia)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,s,o,l,c,u]=this.children,p=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=x,e.setRenderTarget(n,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(p,h,d),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class qd extends bn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}class $d{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Yd.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function Yd(){this._document.hidden===!1&&this.reset()}function Jl(i,e,t,n){const r=Kd(n);switch(t){case jc:return i*e;case Jc:return i*e/r.components*r.byteLength;case Go:return i*e/r.components*r.byteLength;case yi:return i*e*2/r.components*r.byteLength;case Ho:return i*e*2/r.components*r.byteLength;case Zc:return i*e*3/r.components*r.byteLength;case Dn:return i*e*4/r.components*r.byteLength;case Vo:return i*e*4/r.components*r.byteLength;case va:case xa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ba:case Ma:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case js:case Js:return Math.max(i,16)*Math.max(e,8)/4;case Ks:case Zs:return Math.max(i,8)*Math.max(e,8)/2;case Qs:case eo:case no:case io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case to:case Ca:case ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ao:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case so:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case oo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case lo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case co:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case uo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ho:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case fo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case po:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case mo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case go:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case _o:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case vo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case xo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case bo:case Mo:case So:return Math.ceil(i/4)*Math.ceil(e/4)*16;case yo:case Eo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Pa:case To:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Kd(i){switch(i){case un:case qc:return{byteLength:1,components:1};case Rr:case $c:case Xt:return{byteLength:2,components:1};case zo:case ko:return{byteLength:2,components:4};case In:case Bo:case Ln:return{byteLength:4,components:1};case Yc:case Kc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lo}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lo);function Su(){let i=null,e=!1,t=null,n=null;function r(a,s){n=i.requestAnimationFrame(r),t(a,s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){i=a}}}function jd(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,p=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){const u=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,u);else{p.sort((d,_)=>d.start-_.start);let h=0;for(let d=1;d<p.length;d++){const _=p[h],x=p[d];x.start<=_.start+_.count+1?_.count=Math.max(_.count,x.start+x.count-_.start):(++h,p[h]=x)}p.length=h+1;for(let d=0,_=p.length;d<_;d++){const x=p[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function s(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:r,remove:a,update:s}}var Zd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Qd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ef=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,af=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,sf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,of=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,lf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,cf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,uf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,hf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,df=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ff=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,pf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,mf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,gf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,vf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,xf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,bf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Mf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Sf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ef=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Af=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Pf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Lf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Df=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,If=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Uf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ff=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Of=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,zf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,kf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Gf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Hf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Vf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Wf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$f=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Kf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,jf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Zf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Jf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qf=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ep=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,np=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ip=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ap=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,op=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,up=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,hp=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,dp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,pp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,gp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_p=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,bp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Mp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Sp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,yp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ep=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Tp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ap=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,wp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Rp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Cp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Pp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Lp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Dp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ip=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Np=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Up=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Fp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Op=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,zp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,kp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Gp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Hp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Vp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Wp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Xp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,qp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$p=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Zp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Jp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,em=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,im=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,rm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,am=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,sm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,om=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,um=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,gm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,vm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,xm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Sm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ym=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Em=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Am=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Cm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ze={alphahash_fragment:Zd,alphahash_pars_fragment:Jd,alphamap_fragment:Qd,alphamap_pars_fragment:ef,alphatest_fragment:tf,alphatest_pars_fragment:nf,aomap_fragment:rf,aomap_pars_fragment:af,batching_pars_vertex:sf,batching_vertex:of,begin_vertex:lf,beginnormal_vertex:cf,bsdfs:uf,iridescence_fragment:hf,bumpmap_pars_fragment:df,clipping_planes_fragment:ff,clipping_planes_pars_fragment:pf,clipping_planes_pars_vertex:mf,clipping_planes_vertex:gf,color_fragment:_f,color_pars_fragment:vf,color_pars_vertex:xf,color_vertex:bf,common:Mf,defaultnormal_vertex:Sf,displacementmap_pars_vertex:yf,displacementmap_vertex:Ef,emissivemap_fragment:Tf,emissivemap_pars_fragment:Af,colorspace_fragment:wf,colorspace_pars_fragment:Rf,envmap_fragment:Cf,envmap_common_pars_fragment:Pf,envmap_pars_fragment:Lf,envmap_pars_vertex:Df,envmap_physical_pars_fragment:Vf,envmap_vertex:If,fog_vertex:Nf,fog_pars_vertex:Uf,fog_fragment:Ff,fog_pars_fragment:Of,gradientmap_pars_fragment:Bf,lightmap_pars_fragment:zf,lights_lambert_fragment:kf,lights_lambert_pars_fragment:Gf,lights_pars_begin:Hf,lights_toon_fragment:Wf,lights_toon_pars_fragment:Xf,lights_phong_fragment:qf,lights_phong_pars_fragment:$f,lights_physical_fragment:Yf,lights_physical_pars_fragment:Kf,lights_fragment_begin:jf,lights_fragment_maps:Zf,lights_fragment_end:Jf,lightprobes_pars_fragment:Qf,logdepthbuf_fragment:ep,logdepthbuf_pars_fragment:tp,logdepthbuf_pars_vertex:np,logdepthbuf_vertex:ip,map_fragment:rp,map_pars_fragment:ap,map_particle_fragment:sp,map_particle_pars_fragment:op,metalnessmap_fragment:lp,metalnessmap_pars_fragment:cp,morphinstance_vertex:up,morphcolor_vertex:hp,morphnormal_vertex:dp,morphtarget_pars_vertex:fp,morphtarget_vertex:pp,normal_fragment_begin:mp,normal_fragment_maps:gp,normal_pars_fragment:_p,normal_pars_vertex:vp,normal_vertex:xp,normalmap_pars_fragment:bp,clearcoat_normal_fragment_begin:Mp,clearcoat_normal_fragment_maps:Sp,clearcoat_pars_fragment:yp,iridescence_pars_fragment:Ep,opaque_fragment:Tp,packing:Ap,premultiplied_alpha_fragment:wp,project_vertex:Rp,dithering_fragment:Cp,dithering_pars_fragment:Pp,roughnessmap_fragment:Lp,roughnessmap_pars_fragment:Dp,shadowmap_pars_fragment:Ip,shadowmap_pars_vertex:Np,shadowmap_vertex:Up,shadowmask_pars_fragment:Fp,skinbase_vertex:Op,skinning_pars_vertex:Bp,skinning_vertex:zp,skinnormal_vertex:kp,specularmap_fragment:Gp,specularmap_pars_fragment:Hp,tonemapping_fragment:Vp,tonemapping_pars_fragment:Wp,transmission_fragment:Xp,transmission_pars_fragment:qp,uv_pars_fragment:$p,uv_pars_vertex:Yp,uv_vertex:Kp,worldpos_vertex:jp,background_vert:Zp,background_frag:Jp,backgroundCube_vert:Qp,backgroundCube_frag:em,cube_vert:tm,cube_frag:nm,depth_vert:im,depth_frag:rm,distance_vert:am,distance_frag:sm,equirect_vert:om,equirect_frag:lm,linedashed_vert:cm,linedashed_frag:um,meshbasic_vert:hm,meshbasic_frag:dm,meshlambert_vert:fm,meshlambert_frag:pm,meshmatcap_vert:mm,meshmatcap_frag:gm,meshnormal_vert:_m,meshnormal_frag:vm,meshphong_vert:xm,meshphong_frag:bm,meshphysical_vert:Mm,meshphysical_frag:Sm,meshtoon_vert:ym,meshtoon_frag:Em,points_vert:Tm,points_frag:Am,shadow_vert:wm,shadow_frag:Rm,sprite_vert:Cm,sprite_frag:Pm},ve={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new we(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new we(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},Pn={basic:{uniforms:Vt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Vt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new De(0)},envMapIntensity:{value:1}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Vt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Vt([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Vt([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new De(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Vt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Vt([ve.points,ve.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Vt([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Vt([ve.common,ve.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Vt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Vt([ve.sprite,ve.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distance:{uniforms:Vt([ve.common,ve.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distance_vert,fragmentShader:ze.distance_frag},shadow:{uniforms:Vt([ve.lights,ve.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Pn.physical={uniforms:Vt([Pn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new we(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ue},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new we},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new we},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const fa={r:0,b:0,g:0},Lm=new lt,yu=new Ue;yu.set(-1,0,0,0,1,0,0,0,1);function Dm(i,e,t,n,r,a){const s=new De(0);let o=r===!0?0:1,l,c,u=null,p=0,h=null;function d(v){let E=v.isScene===!0?v.background:null;if(E&&E.isTexture){const y=v.backgroundBlurriness>0;E=e.get(E,y)}return E}function _(v){let E=!1;const y=d(v);y===null?m(s,o):y&&y.isColor&&(m(y,1),E=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,a),(i.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(v,E){const y=d(E);y&&y.isCubeTexture?(c===void 0&&(c=new xt(new Ir(1,1,1),new dt({name:"BackgroundCubeMaterial",uniforms:Qi(Pn.backgroundCube.uniforms),vertexShader:Pn.backgroundCube.vertexShader,fragmentShader:Pn.backgroundCube.fragmentShader,side:Wt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,T,g){this.matrixWorld.copyPosition(g.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Lm.makeRotationFromEuler(E.backgroundRotation)).transpose(),y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(yu),c.material.toneMapped=Xe.getTransfer(y.colorSpace)!==Qe,(u!==y||p!==y.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,p=y.version,h=i.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new xt(new Ka(2,2),new dt({name:"BackgroundMaterial",uniforms:Qi(Pn.background.uniforms),vertexShader:Pn.background.vertexShader,fragmentShader:Pn.background.fragmentShader,side:Si,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=Xe.getTransfer(y.colorSpace)!==Qe,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||p!==y.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=y,p=y.version,h=i.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,E){v.getRGB(fa,vu(i)),t.buffers.color.setClear(fa.r,fa.g,fa.b,E,a)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(v,E=1){s.set(v),o=E,m(s,o)},getClearAlpha:function(){return o},setClearAlpha:function(v){o=v,m(s,o)},render:_,addToRenderList:x,dispose:f}}function Im(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=h(null);let a=r,s=!1;function o(D,O,V,L,G){let X=!1;const N=p(D,L,V,O);a!==N&&(a=N,c(a.object)),X=d(D,L,V,G),X&&_(D,L,V,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(X||s)&&(s=!1,y(D,O,V,L),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return i.createVertexArray()}function c(D){return i.bindVertexArray(D)}function u(D){return i.deleteVertexArray(D)}function p(D,O,V,L){const G=L.wireframe===!0;let X=n[O.id];X===void 0&&(X={},n[O.id]=X);const N=D.isInstancedMesh===!0?D.id:0;let K=X[N];K===void 0&&(K={},X[N]=K);let W=K[V.id];W===void 0&&(W={},K[V.id]=W);let j=W[G];return j===void 0&&(j=h(l()),W[G]=j),j}function h(D){const O=[],V=[],L=[];for(let G=0;G<t;G++)O[G]=0,V[G]=0,L[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:V,attributeDivisors:L,object:D,attributes:{},index:null}}function d(D,O,V,L){const G=a.attributes,X=O.attributes;let N=0;const K=V.getAttributes();for(const W in K)if(K[W].location>=0){const Q=G[W];let ae=X[W];if(ae===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(ae=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(ae=D.instanceColor)),Q===void 0||Q.attribute!==ae||ae&&Q.data!==ae.data)return!0;N++}return a.attributesNum!==N||a.index!==L}function _(D,O,V,L){const G={},X=O.attributes;let N=0;const K=V.getAttributes();for(const W in K)if(K[W].location>=0){let Q=X[W];Q===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(Q=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(Q=D.instanceColor));const ae={};ae.attribute=Q,Q&&Q.data&&(ae.data=Q.data),G[W]=ae,N++}a.attributes=G,a.attributesNum=N,a.index=L}function x(){const D=a.newAttributes;for(let O=0,V=D.length;O<V;O++)D[O]=0}function m(D){f(D,0)}function f(D,O){const V=a.newAttributes,L=a.enabledAttributes,G=a.attributeDivisors;V[D]=1,L[D]===0&&(i.enableVertexAttribArray(D),L[D]=1),G[D]!==O&&(i.vertexAttribDivisor(D,O),G[D]=O)}function v(){const D=a.newAttributes,O=a.enabledAttributes;for(let V=0,L=O.length;V<L;V++)O[V]!==D[V]&&(i.disableVertexAttribArray(V),O[V]=0)}function E(D,O,V,L,G,X,N){N===!0?i.vertexAttribIPointer(D,O,V,G,X):i.vertexAttribPointer(D,O,V,L,G,X)}function y(D,O,V,L){x();const G=L.attributes,X=V.getAttributes(),N=O.defaultAttributeValues;for(const K in X){const W=X[K];if(W.location>=0){let j=G[K];if(j===void 0&&(K==="instanceMatrix"&&D.instanceMatrix&&(j=D.instanceMatrix),K==="instanceColor"&&D.instanceColor&&(j=D.instanceColor)),j!==void 0){const Q=j.normalized,ae=j.itemSize,ce=e.get(j);if(ce===void 0)continue;const H=ce.buffer,ne=ce.type,me=ce.bytesPerElement,be=ne===i.INT||ne===i.UNSIGNED_INT||j.gpuType===Bo;if(j.isInterleavedBufferAttribute){const te=j.data,Re=te.isInterleavedBuffer===!0?te.stride:te.itemSize,Ge=j.offset;if(te.isInstancedInterleavedBuffer||te.isInstancedBufferAttribute){for(let Te=0;Te<W.locationSize;Te++)f(W.location+Te,te.meshPerAttribute);D.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Te=0;Te<W.locationSize;Te++)m(W.location+Te);i.bindBuffer(i.ARRAY_BUFFER,H);for(let Te=0;Te<W.locationSize;Te++)E(W.location+Te,ae/W.locationSize,ne,Q,Re*me,(Ge+ae/W.locationSize*Te)*me,be)}else{if(j.isInstancedBufferAttribute){for(let te=0;te<W.locationSize;te++)f(W.location+te,j.meshPerAttribute);D.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let te=0;te<W.locationSize;te++)m(W.location+te);i.bindBuffer(i.ARRAY_BUFFER,H);for(let te=0;te<W.locationSize;te++)E(W.location+te,ae/W.locationSize,ne,Q,ae*me,ae/W.locationSize*te*me,be)}}else if(N!==void 0){const Q=N[K];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(W.location,Q);break;case 3:i.vertexAttrib3fv(W.location,Q);break;case 4:i.vertexAttrib4fv(W.location,Q);break;default:i.vertexAttrib1fv(W.location,Q)}}}}v()}function A(){C();for(const D in n){const O=n[D];for(const V in O){const L=O[V];for(const G in L){const X=L[G];for(const N in X)u(X[N].object),delete X[N];delete L[G]}}delete n[D]}}function T(D){if(n[D.id]===void 0)return;const O=n[D.id];for(const V in O){const L=O[V];for(const G in L){const X=L[G];for(const N in X)u(X[N].object),delete X[N];delete L[G]}}delete n[D.id]}function g(D){for(const O in n){const V=n[O];for(const L in V){const G=V[L];if(G[D.id]===void 0)continue;const X=G[D.id];for(const N in X)u(X[N].object),delete X[N];delete G[D.id]}}}function b(D){for(const O in n){const V=n[O],L=D.isInstancedMesh===!0?D.id:0,G=V[L];if(G!==void 0){for(const X in G){const N=G[X];for(const K in N)u(N[K].object),delete N[K];delete G[X]}delete V[L],Object.keys(V).length===0&&delete n[O]}}}function C(){R(),s=!0,a!==r&&(a=r,c(a.object))}function R(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:C,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:T,releaseStatesOfObject:b,releaseStatesOfProgram:g,initAttributes:x,enableAttribute:m,disableUnusedAttributes:v}}function Nm(i,e,t){let n;function r(l){n=l}function a(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function s(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];t.update(h,n,1)}this.setMode=r,this.render=a,this.renderInstances=s,this.renderMultiDraw=o}function Um(i,e,t,n){let r;function a(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const g=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(g.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function s(g){return!(g!==Dn&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(g){const b=g===Xt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(g!==un&&g!==Ln&&!b&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(g){if(g==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";g="mediump"}return g==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Le("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const p=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&p===!1;t.reversedDepthBuffer===!0&&p===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&p===!0&&Le("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),v=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:s,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:p,maxTextures:d,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:v,maxVaryings:E,maxFragmentUniforms:y,maxSamples:A,samples:T}}function Fm(i){const e=this;let t=null,n=0,r=!1,a=!1;const s=new ii,o=new Ue,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){const d=p.length!==0||h||n!==0||r;return r=h,n=p.length,d},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,h){t=u(p,h,0)},this.setState=function(p,h,d){const _=p.clippingPlanes,x=p.clipIntersection,m=p.clipShadows,f=i.get(p);if(!r||_===null||_.length===0||a&&!m)a?u(null):c();else{const v=a?0:n,E=v*4;let y=f.clippingState||null;l.value=y,y=u(_,h,E,d);for(let A=0;A!==E;++A)y[A]=t[A];f.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(p,h,d,_){const x=p!==null?p.length:0;let m=null;if(x!==0){if(m=l.value,_!==!0||m===null){const f=d+x*4,v=h.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<f)&&(m=new Float32Array(f));for(let E=0,y=d;E!==x;++E,y+=4)s.copy(p[E]).applyMatrix4(v,o),s.normal.toArray(m,y),m[y+3]=s.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}class Zo extends qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new mu(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ir(5,5,5),a=new dt({name:"CubemapFromEquirect",uniforms:Qi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Wt,blending:Mi});a.uniforms.tEquirect.value=t;const s=new xt(r,a),o=t.minFilter;return t.minFilter===ri&&(t.minFilter=jt),new Ro(1,10,this).update(e,s),t.minFilter=o,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){const a=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,n,r);e.setRenderTarget(a)}}const Ql=256,Om=3,Bm=20,Eu=256,Tu=16,zm=3,km=new I,Gm=new De;class Ga{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ro(1,10,null),this._boxMesh=new xt(new Ir(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,a={}){const{size:s=256,position:o=km}=a,l=this._renderer;this._setSize(s);const c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);const p=l.autoClear,h=l.autoClearColor,d=l.autoClearDepth,_=l.autoClearStencil,x=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,x===null&&(e.background=l.getClearColor(Gm));const m=new Ro(n,r,u);return m.position.copy(o),m.update(l,e),l.autoClear=p,l.autoClearColor=h,l.autoClearDepth=d,l.autoClearStencil=_,e.background=x,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=tc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Ql,ud(e))}_fromTexture(e,t){e.mapping===ji||e.mapping===wr?this._setSize(e.image.length===0?Ql:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=ec(e,!1,!1),n=Math.log2(e)-Om;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=ec(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const r=this._boxMesh,a=this._cubeCamera;r.material=n,a.renderTarget=e,a.activeMipmapLevel=t;const s=e.width>>t;e.viewport.set(0,0,s,s),a.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===ji||e.mapping===wr?(this._cubemapMaterial===null&&(this._cubemapMaterial=nc()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=tc()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Hm(),this._integrationMaterial=Vm());const t=this._cubeSize,n=e.texture.mipmaps.length-1,r=this._ggxMaterial.uniforms;r.envMap.value=this._sourceTarget.texture;const a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(t/Tu);for(let s=0;s<=n;s++){const o=Ga.lodToRoughness(s,n);if(s>n-zm)a.roughness.value=o,this._renderCube(e,s,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/(Eu*Math.pow(o,4)))+.5:0;r.roughness.value=o,r.lodBias.value=l,this._renderCube(e,s,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Wm());const n=this._blurMaterial,r=n.uniforms,a=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=a.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(a,0,n)}}function ec(i,e,t){return new Zo(i,{minFilter:ri,generateMipmaps:e,type:Xt,colorSpace:La,depthBuffer:t})}function Nr(i,e,t){return new dt({name:i,uniforms:e,vertexShader:ze.cube_vert,fragmentShader:t,side:Wt,blending:Mi,depthTest:!1,depthWrite:!1})}function Hm(){return Nr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Eu}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Vm(){return Nr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Tu}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Wm(){return Nr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Bm}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function tc(){return Nr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function nc(){return Nr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Xm(i){let e=new WeakMap,t=new WeakMap,n=null;function r(h,d=!1){return h==null?null:d?s(h):a(h)}function a(h){if(h&&h.isTexture){const d=h.mapping;if(d===ss||d===os)if(e.has(h)){const _=e.get(h).texture;return o(_,h.mapping)}else{const _=h.image;if(_&&_.height>0){const x=new Zo(_.height);return x.fromEquirectangularTexture(i,h),e.set(h,x),h.addEventListener("dispose",c),o(x.texture,h.mapping)}else return null}}return h}function s(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){const d=h.mapping,_=d===ss||d===os,x=d===ji||d===wr;if(_||x){let m=t.get(h);const f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return n===null&&(n=new Ga(i)),m=_?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{const v=h.image;return _&&v&&v.height>0||x&&v&&l(v)?(n===null&&(n=new Ga(i)),m=_?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,d){return d===ss?h.mapping=ji:d===os&&(h.mapping=wr),h}function l(h){let d=0;const _=6;for(let x=0;x<_;x++)h[x]!==void 0&&d++;return d===_}function c(h){const d=h.target;d.removeEventListener("dispose",c);const _=e.get(d);_!==void 0&&(e.delete(d),_.dispose())}function u(h){const d=h.target;d.removeEventListener("dispose",u);const _=t.get(d);_!==void 0&&(t.delete(d),_.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:p}}function qm(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Sa("WebGLRenderer: "+n+" extension not supported."),r}}}function $m(i,e,t,n){const r={},a=new WeakMap,s=new FinalizationRegistry(_=>delete r[_]);function o(_){l(_.target)}function l(_){_.index!==null&&e.remove(_.index);for(const m in _.attributes)e.remove(_.attributes[m]);_.removeEventListener("dispose",o),delete r[_.id],s.unregister(_);const x=a.get(_);x&&(e.remove(x),a.delete(_)),n.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function c(_,x){return r[x.id]!==void 0||(x.addEventListener("dispose",o),r[x.id]=new WeakRef(x),s.register(x,x.id,x),t.memory.geometries++),x}function u(_){const x=_.attributes;for(const m in x)e.update(x[m],i.ARRAY_BUFFER)}function p(_){const x=_.index,m=_.attributes.position;let f=0;if(m===void 0)return;const v=x!==null?x.array.length:m.array.length/3-1,E=m.count>=65535?uu:cu,y=new E(Math.ceil(v/3)*6,1),A=y.array;if(x!==null){const g=x.array;f=x.version;for(let b=0,C=0;b<v;b+=3){const R=g[b+0],D=g[b+1],O=g[b+2];A[C++]=R,A[C++]=D,A[C++]=D,A[C++]=O,A[C++]=O,A[C++]=R}}else{f=m.version;for(let g=0,b=0;g<v;g+=3){const C=g+0,R=g+1,D=g+2;A[b++]=C,A[b++]=R,A[b++]=R,A[b++]=D,A[b++]=D,A[b++]=C}}y.version=f;const T=a.get(_);T&&e.remove(T),a.set(_,y)}function h(_){const x=a.get(_);if(x){const m=_.index;m!==null&&x.version<m.version&&p(_)}else p(_);return a.get(_)}function d(){for(const _ in r){const x=r[_].deref();x!==void 0&&l(x)}}return{get:c,update:u,getWireframeAttribute:h,dispose:d}}function Ym(i,e,t){let n;function r(p){n=p}let a,s;function o(p){a=p.type,s=p.bytesPerElement}function l(p,h){i.drawElements(n,h,a,p*s),t.update(h,n,1)}function c(p,h,d){d!==0&&(i.drawElementsInstanced(n,h,a,p*s,d),t.update(h,n,d))}function u(p,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,a,p,0,d);let x=0;for(let m=0;m<d;m++)x+=h[m];t.update(x,n,1)}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Km(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(a,s,o){switch(t.calls++,s){case i.TRIANGLES:t.triangles+=o*(a/3);break;case i.LINES:t.lines+=o*(a/2);break;case i.LINE_STRIP:t.lines+=o*(a-1);break;case i.LINE_LOOP:t.lines+=o*a;break;case i.POINTS:t.points+=o*a;break;default:Ze("WebGLInfo: Unknown draw mode:",s);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function jm(i,e,t){const n=new WeakMap,r=new ht;function a(s,o,l){const c=s.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==p){let R=function(){b.dispose(),n.delete(o),o.removeEventListener("dispose",R)};var d=R;h!==void 0&&h.texture.dispose();const _=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],v=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let y=0;_===!0&&(y=1),x===!0&&(y=2),m===!0&&(y=3);let A=o.attributes.position.count*y,T=1;A>e.maxTextureSize&&(T=Math.ceil(A/e.maxTextureSize),A=e.maxTextureSize);const g=new Float32Array(A*T*4*p),b=new su(g,A,T,p);b.type=Ln,b.needsUpdate=!0;const C=y*4;for(let D=0;D<p;D++){const O=f[D],V=v[D],L=E[D],G=A*T*4*D;for(let X=0;X<O.count;X++){const N=X*C;_===!0&&(r.fromBufferAttribute(O,X),g[G+N+0]=r.x,g[G+N+1]=r.y,g[G+N+2]=r.z,g[G+N+3]=0),x===!0&&(r.fromBufferAttribute(V,X),g[G+N+4]=r.x,g[G+N+5]=r.y,g[G+N+6]=r.z,g[G+N+7]=0),m===!0&&(r.fromBufferAttribute(L,X),g[G+N+8]=r.x,g[G+N+9]=r.y,g[G+N+10]=r.z,g[G+N+11]=L.itemSize===4?r.w:1)}}h={count:p,texture:b,size:new we(A,T)},n.set(o,h),o.addEventListener("dispose",R)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",s.morphTexture,t);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const x=o.morphTargetsRelative?1:1-_;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:a}}function Zm(i,e,t,n,r){let a=new WeakMap;function s(c){const u=r.render.frame,p=c.geometry,h=e.get(c,p);if(a.get(h)!==u&&(e.update(h),a.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),a.set(c,u))),c.isSkinnedMesh){const d=c.skeleton;a.get(d)!==u&&(d.update(),a.set(d,u))}return h}function o(){a=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:s,dispose:o}}const Jm={[Do]:"LINEAR_TONE_MAPPING",[Io]:"REINHARD_TONE_MAPPING",[No]:"CINEON_TONE_MAPPING",[qa]:"ACES_FILMIC_TONE_MAPPING",[Fo]:"AGX_TONE_MAPPING",[Oo]:"NEUTRAL_TONE_MAPPING",[Uo]:"CUSTOM_TONE_MAPPING"};function Qm(i,e,t,n,r,a){const s=new qt(e,t,{type:i,depthBuffer:r,stencilBuffer:a,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const u=new ft;u.setAttribute("position",new at([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new at([0,2,0,0,2,0],2));const p=new xu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new xt(u,p),d=new Mu(-1,1,1,-1,0,1);let _=null,x=null,m=!1,f,v=null,E=[],y=!1;this.setSize=function(A,T){s.setSize(A,T),o!==null&&o.setSize(A,T),l!==null&&l.setSize(A,T);for(let g=0;g<E.length;g++){const b=E[g];b.setSize&&b.setSize(A,T)}},this.setEffects=function(A){E=A,y=E.length>0&&E[0].isRenderPass===!0;const T=s.width,g=s.height;E.length>0&&o===null&&(o=new qt(T,g,{type:Xt,depthBuffer:!1,stencilBuffer:!1}),l=new qt(T,g,{type:Xt,depthBuffer:!1,stencilBuffer:!1}));const b=r===!0&&E.some(C=>C.needsDepthTexture===!0);b!==(s.depthTexture!==null)&&(b===!0&&c===null&&(c=new Ji(T,g),a===!0&&(c.format=ai,c.type=Zi)),s.dispose(),s.depthTexture=b?c:null,s.resolveDepthBuffer=b,s.storeMultisampledDepthBuffer=b);for(let C=0;C<E.length;C++){const R=E[C];R.setSize&&R.setSize(T,g),b&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(A,T){if(m||A.toneMapping===qn&&E.length===0)return!1;if(v=T,T!==null){const g=T.width,b=T.height;(s.width!==g||s.height!==b)&&this.setSize(g,b)}return y===!1&&A.setRenderTarget(s),f=A.toneMapping,A.toneMapping=qn,!0},this.hasRenderPass=function(){return y},this.end=function(A,T){A.toneMapping=f,m=!0;let g=s,b=o;for(let C=0;C<E.length;C++){const R=E[C];R.enabled!==!1&&(R.render(A,b,g,T),R.needsSwap!==!1&&(g=b,b=b===o?l:o))}if(_!==A.outputColorSpace||x!==A.toneMapping){_=A.outputColorSpace,x=A.toneMapping,p.defines={},Xe.getTransfer(_)===Qe&&(p.defines.SRGB_TRANSFER="");const C=Jm[x];C&&(p.defines[C]=""),p.needsUpdate=!0}p.uniforms.tDiffuse.value=g.texture,A.setRenderTarget(v),A.render(h,d),v=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){s.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),p.dispose()}}const Au=new Bt,wu=new Ji(1,1),Ru=new gu(1),Cu=new su,Pu=new gd,Lu=new mu,ic=[],rc=[],ac=new Float32Array(16),sc=new Float32Array(9),oc=new Float32Array(4);function ir(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let a=ic[r];if(a===void 0&&(a=new Float32Array(r),ic[r]=a),e!==0){n.toArray(a,0);for(let s=1,o=0;s!==e;++s)o+=t,i[s].toArray(a,o)}return a}function yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Et(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ja(i,e){let t=rc[e];t===void 0&&(t=new Int32Array(e),rc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function eg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function tg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2fv(this.addr,e),Et(t,e)}}function ng(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;i.uniform3fv(this.addr,e),Et(t,e)}}function ig(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4fv(this.addr,e),Et(t,e)}}function rg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(yt(t,n))return;oc.set(n),i.uniformMatrix2fv(this.addr,!1,oc),Et(t,n)}}function ag(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(yt(t,n))return;sc.set(n),i.uniformMatrix3fv(this.addr,!1,sc),Et(t,n)}}function sg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(yt(t,n))return;ac.set(n),i.uniformMatrix4fv(this.addr,!1,ac),Et(t,n)}}function og(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function lg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2iv(this.addr,e),Et(t,e)}}function cg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3iv(this.addr,e),Et(t,e)}}function ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4iv(this.addr,e),Et(t,e)}}function hg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function dg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2uiv(this.addr,e),Et(t,e)}}function fg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3uiv(this.addr,e),Et(t,e)}}function pg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4uiv(this.addr,e),Et(t,e)}}function Za(i){return i.version===0&&(i.compareFunction=tu,i.needsUpdate=!0),i}function mg(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let a;this.type===i.SAMPLER_2D_SHADOW?a=Za(wu):a=Au,t.setTexture2D(e||a,r)}function gg(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Pu,r)}function _g(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Za(Ru):a=Lu,t.setTextureCube(e||a,r)}function vg(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Cu,r)}function xg(i){switch(i){case 5126:return eg;case 35664:return tg;case 35665:return ng;case 35666:return ig;case 35674:return rg;case 35675:return ag;case 35676:return sg;case 5124:case 35670:return og;case 35667:case 35671:return lg;case 35668:case 35672:return cg;case 35669:case 35673:return ug;case 5125:return hg;case 36294:return dg;case 36295:return fg;case 36296:return pg;case 35678:case 36198:case 36298:case 36306:case 35682:return mg;case 35679:case 36299:case 36307:return gg;case 35680:case 36300:case 36308:case 36293:return _g;case 36289:case 36303:case 36311:case 36292:return vg}}function bg(i,e){i.uniform1fv(this.addr,e)}function Mg(i,e){const t=ir(e,this.size,2);i.uniform2fv(this.addr,t)}function Sg(i,e){const t=ir(e,this.size,3);i.uniform3fv(this.addr,t)}function yg(i,e){const t=ir(e,this.size,4);i.uniform4fv(this.addr,t)}function Eg(i,e){const t=ir(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Tg(i,e){const t=ir(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ag(i,e){const t=ir(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function wg(i,e){i.uniform1iv(this.addr,e)}function Rg(i,e){i.uniform2iv(this.addr,e)}function Cg(i,e){i.uniform3iv(this.addr,e)}function Pg(i,e){i.uniform4iv(this.addr,e)}function Lg(i,e){i.uniform1uiv(this.addr,e)}function Dg(i,e){i.uniform2uiv(this.addr,e)}function Ig(i,e){i.uniform3uiv(this.addr,e)}function Ng(i,e){i.uniform4uiv(this.addr,e)}function Ug(i,e,t){const n=this.cache,r=e.length,a=ja(t,r);yt(n,a)||(i.uniform1iv(this.addr,a),Et(n,a));let s;this.type===i.SAMPLER_2D_SHADOW?s=Za(wu):s=Au;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||s,a[o])}function Fg(i,e,t){const n=this.cache,r=e.length,a=ja(t,r);yt(n,a)||(i.uniform1iv(this.addr,a),Et(n,a));for(let s=0;s!==r;++s)t.setTexture3D(e[s]||Pu,a[s])}function Og(i,e,t){const n=this.cache,r=e.length,a=ja(t,r);yt(n,a)||(i.uniform1iv(this.addr,a),Et(n,a));let s;this.type===i.SAMPLER_CUBE_SHADOW?s=Za(Ru):s=Lu;for(let o=0;o!==r;++o)t.setTextureCube(e[o]||s,a[o])}function Bg(i,e,t){const n=this.cache,r=e.length,a=ja(t,r);yt(n,a)||(i.uniform1iv(this.addr,a),Et(n,a));for(let s=0;s!==r;++s)t.setTexture2DArray(e[s]||Cu,a[s])}function zg(i){switch(i){case 5126:return bg;case 35664:return Mg;case 35665:return Sg;case 35666:return yg;case 35674:return Eg;case 35675:return Tg;case 35676:return Ag;case 5124:case 35670:return wg;case 35667:case 35671:return Rg;case 35668:case 35672:return Cg;case 35669:case 35673:return Pg;case 5125:return Lg;case 36294:return Dg;case 36295:return Ig;case 36296:return Ng;case 35678:case 36198:case 36298:case 36306:case 35682:return Ug;case 35679:case 36299:case 36307:return Fg;case 35680:case 36300:case 36308:case 36293:return Og;case 36289:case 36303:case 36311:case 36292:return Bg}}class kg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=xg(t.type)}}class Gg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=zg(t.type)}}class Hg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let a=0,s=r.length;a!==s;++a){const o=r[a];o.setValue(e,t[o.id],n)}}}const Ns=/(\w+)(\])?(\[|\.)?/g;function lc(i,e){i.seq.push(e),i.map[e.id]=e}function Vg(i,e,t){const n=i.name,r=n.length;for(Ns.lastIndex=0;;){const a=Ns.exec(n),s=Ns.lastIndex;let o=a[1];const l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&s+2===r){lc(t,c===void 0?new kg(o,i,e):new Gg(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new Hg(o),lc(t,p)),t=p}}}class ya{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const o=e.getActiveUniform(t,s),l=e.getUniformLocation(t,o.name);Vg(o,l,this)}const r=[],a=[];for(const s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(s):a.push(s);r.length>0&&(this.seq=r.concat(a))}setValue(e,t,n,r){const a=this.map[t];a!==void 0&&a.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let a=0,s=t.length;a!==s;++a){const o=t[a],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,a=e.length;r!==a;++r){const s=e[r];s.id in t&&n.push(s)}return n}}function cc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Wg=37297;let Xg=0;function qg(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let s=r;s<a;s++){const o=s+1;n.push(`${o===e?">":" "} ${o}: ${t[s]}`)}return n.join(`
`)}const uc=new Ue;function $g(i){Xe._getMatrix(uc,Xe.workingColorSpace,i);const e=`mat3( ${uc.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case Da:return[e,"LinearTransferOETF"];case Qe:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function hc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),a=(i.getShaderInfoLog(e)||"").trim();if(n&&a==="")return"";const s=/ERROR: 0:(\d+)/.exec(a);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+a+`

`+qg(i.getShaderSource(e),o)}else return a}function Yg(i,e){const t=$g(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Kg={[Do]:"Linear",[Io]:"Reinhard",[No]:"Cineon",[qa]:"ACESFilmic",[Fo]:"AgX",[Oo]:"Neutral",[Uo]:"Custom"};function jg(i,e){const t=Kg[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const pa=new I;function Zg(){Xe.getLuminanceCoefficients(pa);const i=pa.x.toFixed(4),e=pa.y.toFixed(4),t=pa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Jg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xr).join(`
`)}function Qg(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function e0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const a=i.getActiveAttrib(e,r),s=a.name;let o=1;a.type===i.FLOAT_MAT2&&(o=2),a.type===i.FLOAT_MAT3&&(o=3),a.type===i.FLOAT_MAT4&&(o=4),t[s]={type:a.type,location:i.getAttribLocation(e,s),locationSize:o}}return t}function xr(i){return i!==""}function dc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function fc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const t0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Co(i){return i.replace(t0,n0)}function n0(i,e){const t=ze[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Co(t)}const i0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pc(i){return i.replace(i0,r0)}function r0(i,e,t,n){let r="";for(let a=parseInt(e);a<parseInt(t);a++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return r}function mc(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const a0={[_a]:"SHADOWMAP_TYPE_PCF",[vr]:"SHADOWMAP_TYPE_VSM"};function s0(i){return a0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const o0={[wr]:"ENVMAP_MODE_REFRACTION"};function l0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":o0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const c0={[Wc]:"ENVMAP_BLENDING_MULTIPLY",[Yh]:"ENVMAP_BLENDING_MIX",[Kh]:"ENVMAP_BLENDING_ADD"};function u0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":c0[i.combine]||"ENVMAP_BLENDING_NONE"}function h0(i,e,t,n){const r=i.getContext(),a=t.defines;let s=t.vertexShader,o=t.fragmentShader;const l=s0(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=l0(t),p=u0(t),h=Jg(t),d=Qg(a),_=r.createProgram();let x,m,f=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(xr).join(`
`),x.length>0&&(x+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(xr).join(`
`),m.length>0&&(m+=`
`)):(x=[mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xr).join(`
`),m=[mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+p:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qn?"#define TONE_MAPPING":"",t.toneMapping!==qn?ze.tonemapping_pars_fragment:"",t.toneMapping!==qn?jg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,Yg("linearToOutputTexel",t.outputColorSpace),Zg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xr).join(`
`)),s=Co(s),s=dc(s,t),s=fc(s,t),o=Co(o),o=dc(o,t),o=fc(o,t),s=pc(s),o=pc(o),t.isRawShaderMaterial!==!0&&(f=`#version 300 es
`,x=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,m=["#define varying in",t.glslVersion===yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const v=f+x+s,E=f+m+o,y=cc(r,r.VERTEX_SHADER,v),A=cc(r,r.FRAGMENT_SHADER,E);r.attachShader(_,y),r.attachShader(_,A),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function T(R){if(i.debug.checkShaderErrors){const D=r.getProgramInfoLog(_)||"",O=r.getShaderInfoLog(y)||"",V=r.getShaderInfoLog(A)||"",L=D.trim(),G=O.trim(),X=V.trim();let N=!0,K=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(N=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,_,y,A);else{const W=hc(r,y,"vertex"),j=hc(r,A,"fragment");Ze("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+W+`
`+j)}else L!==""?Le("WebGLProgram: Program Info Log:",L):(G===""||X==="")&&(K=!1);K&&(R.diagnostics={runnable:N,programLog:L,vertexShader:{log:G,prefix:x},fragmentShader:{log:X,prefix:m}})}r.deleteShader(y),r.deleteShader(A),g=new ya(r,_),b=e0(r,_)}let g;this.getUniforms=function(){return g===void 0&&T(this),g};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=r.getProgramParameter(_,Wg)),C},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xg++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=y,this.fragmentShader=A,this}let d0=0;class f0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new p0(e),t.set(e,n)),n}}class p0{constructor(e){this.id=d0++,this.code=e,this.usedTimes=0}}function m0(i){return i===yi||i===Ca||i===Pa}function g0(i,e,t,n,r,a){const s=new ou,o=new f0,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(g){return l.add(g),g===0?"uv":`uv${g}`}function _(g,b,C,R,D,O){const V=R.fog,L=D.geometry,G=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?R.environment:null,X=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,N=e.get(g.envMap||G,X),K=h[g.type];let W=n.precision;g.precision!==null&&(W=n.getMaxPrecision(g.precision),W!==g.precision&&Le("WebGLProgram.getParameters:",g.precision,"not supported, using",W,"instead."));const j=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,Q=j!==void 0?j.length:0;let ae=0;L.morphAttributes.position!==void 0&&(ae=1),L.morphAttributes.normal!==void 0&&(ae=2),L.morphAttributes.color!==void 0&&(ae=3);let ce,H,ne,me;if(K){const _e=Pn[K];ce=_e.vertexShader,H=_e.fragmentShader}else{ce=g.vertexShader,H=g.fragmentShader;const _e=o.getVertexShaderStage(g),et=o.getFragmentShaderStage(g);o.update(g,_e,et),ne=_e.id,me=et.id}const be=i.getRenderTarget(),te=i.state.buffers.depth.getReversed(),Re=D.isInstancedMesh===!0,Ge=D.isBatchedMesh===!0,Te=!!g.map,Ye=!!g.matcap,Ke=!!N,ke=Ke&&N.isPMREMTexture===!0,bt=!!g.aoMap,ut=!!g.lightMap,Tt=!!g.bumpMap&&g.wireframe===!1,it=!!g.normalMap,en=!!g.displacementMap,He=!!g.emissiveMap,Mt=!!g.metalnessMap,tn=!!g.roughnessMap,nn=g.anisotropy>0,F=g.clearcoat>0,rn=g.diffuseRoughness>0,st=g.dispersion>0,ot=g.retroreflectivity>0,ge=g.iridescence>0,St=g.sheen>0,Pe=g.transmission>0,Ie=nn&&!!g.anisotropyMap,w=F&&!!g.clearcoatMap,M=F&&!!g.clearcoatNormalMap,z=F&&!!g.clearcoatRoughnessMap,ie=rn&&!!g.diffuseRoughnessMap,ee=ge&&!!g.iridescenceMap,oe=ge&&!!g.iridescenceThicknessMap,fe=St&&!!g.sheenColorMap,Y=St&&!!g.sheenRoughnessMap,Z=!!g.specularMap,ue=!!g.specularColorMap,P=!!g.specularIntensityMap,J=Pe&&!!g.transmissionMap,$=Pe&&!!g.thicknessMap,he=!!g.gradientMap,se=!!g.alphaMap,le=g.alphaTest>0,Ae=!!g.alphaHash,Be=!!g.extensions;let re=qn;g.toneMapped&&(be===null||be.isXRRenderTarget===!0)&&(re=i.toneMapping);const Ce=ke?N.isCompressedCubeTexture?N.image[0].mipmaps:N.mipmaps:null,Oe={shaderID:K,shaderType:g.type,shaderName:g.name,vertexShader:ce,fragmentShader:H,defines:g.defines,customVertexShaderID:ne,customFragmentShaderID:me,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:W,batching:Ge,batchingColor:Ge&&D._colorsTexture!==null,instancing:Re,instancingColor:Re&&D.instanceColor!==null,instancingMorph:Re&&D.morphTexture!==null,outputColorSpace:be===null?i.outputColorSpace:be.isXRRenderTarget===!0?be.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Te,matcap:Ye,envMap:Ke,envMapMode:Ke&&N.mapping,envMapPMREM:ke,envMapMaxLod:ke?Ce.length-1:null,envMapSize:ke?Ce[0].width:null,aoMap:bt,lightMap:ut,bumpMap:Tt,normalMap:it,displacementMap:en,emissiveMap:He,normalMapObjectSpace:it&&g.normalMapType===Jh,normalMapTangentSpace:it&&g.normalMapType===Sl,packedNormalMap:it&&g.normalMapType===Sl&&m0(g.normalMap.format),metalnessMap:Mt,roughnessMap:tn,anisotropy:nn,anisotropyMap:Ie,clearcoat:F,clearcoatMap:w,clearcoatNormalMap:M,clearcoatRoughnessMap:z,diffuseRoughness:rn,diffuseRoughnessMap:ie,dispersion:st,retroreflection:ot,iridescence:ge,iridescenceMap:ee,iridescenceThicknessMap:oe,sheen:St,sheenColorMap:fe,sheenRoughnessMap:Y,specularMap:Z,specularColorMap:ue,specularIntensityMap:P,transmission:Pe,transmissionMap:J,thicknessMap:$,gradientMap:he,opaque:g.transparent===!1&&g.blending===Mr&&g.alphaToCoverage===!1,alphaMap:se,alphaTest:le,alphaHash:Ae,combine:g.combine,mapUv:Te&&d(g.map.channel),aoMapUv:bt&&d(g.aoMap.channel),lightMapUv:ut&&d(g.lightMap.channel),bumpMapUv:Tt&&d(g.bumpMap.channel),normalMapUv:it&&d(g.normalMap.channel),displacementMapUv:en&&d(g.displacementMap.channel),emissiveMapUv:He&&d(g.emissiveMap.channel),metalnessMapUv:Mt&&d(g.metalnessMap.channel),roughnessMapUv:tn&&d(g.roughnessMap.channel),anisotropyMapUv:Ie&&d(g.anisotropyMap.channel),clearcoatMapUv:w&&d(g.clearcoatMap.channel),clearcoatNormalMapUv:M&&d(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&d(g.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ie&&d(g.diffuseRoughnessMap.channel),iridescenceMapUv:ee&&d(g.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&d(g.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&d(g.sheenColorMap.channel),sheenRoughnessMapUv:Y&&d(g.sheenRoughnessMap.channel),specularMapUv:Z&&d(g.specularMap.channel),specularColorMapUv:ue&&d(g.specularColorMap.channel),specularIntensityMapUv:P&&d(g.specularIntensityMap.channel),transmissionMapUv:J&&d(g.transmissionMap.channel),thicknessMapUv:$&&d(g.thicknessMap.channel),alphaMapUv:se&&d(g.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(it||nn),vertexNormals:!!L.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!L.attributes.uv&&(Te||se),fog:!!V,useFog:g.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||L.attributes.normal===void 0&&it===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:te,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:ae,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:O.filter(_e=>_e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:re,decodeVideoTexture:Te&&g.map.isVideoTexture===!0&&Xe.getTransfer(g.map.colorSpace)===Qe,decodeVideoTextureEmissive:He&&g.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(g.emissiveMap.colorSpace)===Qe,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===Mn,flipSided:g.side===Wt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:Be&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Be&&g.extensions.multiDraw===!0||Ge)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Oe.vertexUv1s=l.has(1),Oe.vertexUv2s=l.has(2),Oe.vertexUv3s=l.has(3),l.clear(),Oe}function x(g){const b=[];if(g.shaderID?b.push(g.shaderID):(b.push(g.customVertexShaderID),b.push(g.customFragmentShaderID)),g.defines!==void 0)for(const C in g.defines)b.push(C),b.push(g.defines[C]);return g.isRawShaderMaterial===!1&&(m(b,g),f(b,g),b.push(i.outputColorSpace)),b.push(g.customProgramCacheKey),b.join()}function m(g,b){g.push(b.precision),g.push(b.outputColorSpace),g.push(b.envMapMode),g.push(b.envMapPMREM),g.push(b.envMapMaxLod),g.push(b.envMapSize),g.push(b.mapUv),g.push(b.alphaMapUv),g.push(b.lightMapUv),g.push(b.aoMapUv),g.push(b.bumpMapUv),g.push(b.normalMapUv),g.push(b.displacementMapUv),g.push(b.emissiveMapUv),g.push(b.metalnessMapUv),g.push(b.roughnessMapUv),g.push(b.anisotropyMapUv),g.push(b.clearcoatMapUv),g.push(b.clearcoatNormalMapUv),g.push(b.clearcoatRoughnessMapUv),g.push(b.diffuseRoughnessMapUv),g.push(b.iridescenceMapUv),g.push(b.iridescenceThicknessMapUv),g.push(b.sheenColorMapUv),g.push(b.sheenRoughnessMapUv),g.push(b.specularMapUv),g.push(b.specularColorMapUv),g.push(b.specularIntensityMapUv),g.push(b.transmissionMapUv),g.push(b.thicknessMapUv),g.push(b.combine),g.push(b.fogExp2),g.push(b.sizeAttenuation),g.push(b.morphTargetsCount),g.push(b.numSunLights),g.push(b.numDirLights),g.push(b.numPointLights),g.push(b.numSpotLights),g.push(b.numSpotLightMaps),g.push(b.numHemiLights),g.push(b.numRectAreaLights),g.push(b.numSunLightShadows),g.push(b.numDirLightShadows),g.push(b.numPointLightShadows),g.push(b.numSpotLightShadows),g.push(b.numSpotLightShadowsWithMaps),g.push(b.numLightProbes),g.push(b.numLightProbeGrids),g.push(b.shadowMapType),g.push(b.toneMapping),g.push(b.numClippingPlanes),g.push(b.numClipIntersection),g.push(b.depthPacking)}function f(g,b){s.disableAll(),b.instancing&&s.enable(0),b.instancingColor&&s.enable(1),b.instancingMorph&&s.enable(2),b.matcap&&s.enable(3),b.envMap&&s.enable(4),b.normalMapObjectSpace&&s.enable(5),b.normalMapTangentSpace&&s.enable(6),b.clearcoat&&s.enable(7),b.iridescence&&s.enable(8),b.alphaTest&&s.enable(9),b.vertexColors&&s.enable(10),b.vertexAlphas&&s.enable(11),b.vertexUv1s&&s.enable(12),b.vertexUv2s&&s.enable(13),b.vertexUv3s&&s.enable(14),b.vertexTangents&&s.enable(15),b.anisotropy&&s.enable(16),b.alphaHash&&s.enable(17),b.batching&&s.enable(18),b.dispersion&&s.enable(19),b.retroreflection&&s.enable(24),b.diffuseRoughness&&s.enable(25),b.batchingColor&&s.enable(20),b.gradientMap&&s.enable(21),b.packedNormalMap&&s.enable(22),b.vertexNormals&&s.enable(23),g.push(s.mask),s.disableAll(),b.fog&&s.enable(0),b.useFog&&s.enable(1),b.flatShading&&s.enable(2),b.logarithmicDepthBuffer&&s.enable(3),b.reversedDepthBuffer&&s.enable(4),b.skinning&&s.enable(5),b.morphTargets&&s.enable(6),b.morphNormals&&s.enable(7),b.morphColors&&s.enable(8),b.premultipliedAlpha&&s.enable(9),b.shadowMapEnabled&&s.enable(10),b.doubleSided&&s.enable(11),b.flipSided&&s.enable(12),b.useDepthPacking&&s.enable(13),b.dithering&&s.enable(14),b.transmission&&s.enable(15),b.sheen&&s.enable(16),b.opaque&&s.enable(17),b.pointsUvs&&s.enable(18),b.decodeVideoTexture&&s.enable(19),b.decodeVideoTextureEmissive&&s.enable(20),b.alphaToCoverage&&s.enable(21),b.numLightProbeGrids>0&&s.enable(22),b.hasPositionAttribute&&s.enable(23),g.push(s.mask)}function v(g){const b=h[g.type];let C;if(b){const R=Pn[b];C=Cr.clone(R.uniforms)}else C=g.uniforms;return C}function E(g,b){let C=u.get(b);return C!==void 0?++C.usedTimes:(C=new h0(i,b,g,r),c.push(C),u.set(b,C)),C}function y(g){if(--g.usedTimes===0){const b=c.indexOf(g);c[b]=c[c.length-1],c.pop(),u.delete(g.cacheKey),g.destroy()}}function A(g){o.remove(g)}function T(){o.dispose()}return{getParameters:_,getProgramCacheKey:x,getUniforms:v,acquireProgram:E,releaseProgram:y,releaseShaderCache:A,programs:c,dispose:T}}function _0(){let i=new WeakMap;function e(s){return i.has(s)}function t(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function n(s){i.delete(s)}function r(s,o,l){i.get(s)[o]=l}function a(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:a}}function v0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function gc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function _c(){const i=[];let e=0;const t=[],n=[],r=[];function a(){e=0,t.length=0,n.length=0,r.length=0}function s(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,_,x,m,f){let v=i[e];return v===void 0?(v={id:h.id,object:h,geometry:d,material:_,materialVariant:s(h),groupOrder:x,renderOrder:h.renderOrder,z:m,group:f},i[e]=v):(v.id=h.id,v.object=h,v.geometry=d,v.material=_,v.materialVariant=s(h),v.groupOrder=x,v.renderOrder=h.renderOrder,v.z=m,v.group=f),e++,v}function l(h,d,_,x,m,f,v){v.reversedDepth===!0&&(m=-m);const E=o(h,d,_,x,m,f);_.transmission>0?n.push(E):_.transparent===!0?r.push(E):t.push(E)}function c(h,d,_,x,m,f){const v=o(h,d,_,x,m,f);_.transmission>0?n.unshift(v):_.transparent===!0?r.unshift(v):t.unshift(v)}function u(h,d){t.length>1&&t.sort(h||v0),n.length>1&&n.sort(d||gc),r.length>1&&r.sort(d||gc)}function p(){for(let h=e,d=i.length;h<d;h++){const _=i[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:r,init:a,push:l,unshift:c,finish:p,sort:u}}function x0(){let i=new WeakMap;function e(n,r){const a=i.get(n);let s;return a===void 0?(s=new _c,i.set(n,[s])):r>=a.length?(s=new _c,a.push(s)):s=a[r],s}function t(){i=new WeakMap}return{get:e,dispose:t}}function b0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new I,color:new De};break;case"SpotLight":t={position:new I,direction:new I,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new De,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new De,groundColor:new De};break;case"RectAreaLight":t={color:new De,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function M0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let S0=0;function y0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function E0(i){const e=new b0,t=M0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const r=new I,a=new lt,s=new lt;function o(c){let u=0,p=0,h=0;for(let O=0;O<9;O++)n.probe[O].set(0,0,0);let d=0,_=0,x=0,m=0,f=0,v=0,E=0,y=0,A=0,T=0,g=0,b=0,C=0,R=0;c.sort(y0);for(let O=0,V=c.length;O<V;O++){const L=c[O],G=L.color,X=L.intensity,N=L.distance;let K=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===yi?K=L.shadow.map.texture:K=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)u+=G.r*X,p+=G.g*X,h+=G.b*X;else if(L.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(L.sh.coefficients[W],X);R++}else if(L.isSunLight){const W=e.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const j=L.shadow,Q=t.get(L);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),n.sunShadow[_]=Q,n.sunShadowMap[_]=K;const ae=j.getViewportCount();for(let ce=0;ce<ae;ce++)n.sunShadowMatrix[x+ce]=j.getMatrix(ce),n.sunShadowCascade[x+ce]=j._cascadeData[ce];x+=ae,_++}n.sun[d]=W,d++}else if(L.isDirectionalLight){const W=e.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const j=L.shadow,Q=t.get(L);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,n.directionalShadow[m]=Q,n.directionalShadowMap[m]=K,n.directionalShadowMatrix[m]=L.shadow.matrix,A++}n.directional[m]=W,m++}else if(L.isSpotLight){const W=e.get(L);W.position.setFromMatrixPosition(L.matrixWorld),W.color.copy(G).multiplyScalar(X),W.distance=N,W.coneCos=Math.cos(L.angle),W.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),W.decay=L.decay,n.spot[v]=W;const j=L.shadow;if(L.map&&(n.spotLightMap[b]=L.map,b++,j.updateMatrices(L),L.castShadow&&C++),n.spotLightMatrix[v]=j.matrix,L.castShadow){const Q=t.get(L);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,n.spotShadow[v]=Q,n.spotShadowMap[v]=K,g++}v++}else if(L.isRectAreaLight){const W=e.get(L);W.color.copy(G).multiplyScalar(X),W.halfWidth.set(L.width*.5,0,0),W.halfHeight.set(0,L.height*.5,0),n.rectArea[E]=W,E++}else if(L.isPointLight){const W=e.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),W.distance=L.distance,W.decay=L.decay,L.castShadow){const j=L.shadow,Q=t.get(L);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,Q.shadowCameraNear=j.camera.near,Q.shadowCameraFar=j.camera.far,n.pointShadow[f]=Q,n.pointShadowMap[f]=K,n.pointShadowMatrix[f]=L.shadow.matrix,T++}n.point[f]=W,f++}else if(L.isHemisphereLight){const W=e.get(L);W.skyColor.copy(L.color).multiplyScalar(X),W.groundColor.copy(L.groundColor).multiplyScalar(X),n.hemi[y]=W,y++}}E>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=h;const D=n.hash;(D.sunLength!==d||D.directionalLength!==m||D.pointLength!==f||D.spotLength!==v||D.rectAreaLength!==E||D.hemiLength!==y||D.numSunShadows!==_||D.numDirectionalShadows!==A||D.numPointShadows!==T||D.numSpotShadows!==g||D.numSpotMaps!==b||D.numLightProbes!==R)&&(n.sun.length=d,n.directional.length=m,n.spot.length=v,n.rectArea.length=E,n.point.length=f,n.hemi.length=y,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=g,n.spotShadowMap.length=g,n.spotLightMatrix.length=g+b-C,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=R,D.sunLength=d,D.directionalLength=m,D.pointLength=f,D.spotLength=v,D.rectAreaLength=E,D.hemiLength=y,D.numSunShadows=_,D.numDirectionalShadows=A,D.numPointShadows=T,D.numSpotShadows=g,D.numSpotMaps=b,D.numLightProbes=R,n.version=S0++)}function l(c,u){let p=0,h=0,d=0,_=0,x=0,m=0;const f=u.matrixWorldInverse;for(let v=0,E=c.length;v<E;v++){const y=c[v];if(y.isSunLight){const A=n.sun[p];A.direction.setFromMatrixPosition(y.matrixWorld),A.direction.transformDirection(f),p++}else if(y.isDirectionalLight){const A=n.directional[h];A.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),A.direction.sub(r),A.direction.transformDirection(f),h++}else if(y.isSpotLight){const A=n.spot[_];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(f),A.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),A.direction.sub(r),A.direction.transformDirection(f),_++}else if(y.isRectAreaLight){const A=n.rectArea[x];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(f),s.identity(),a.copy(y.matrixWorld),a.premultiply(f),s.extractRotation(a),A.halfWidth.set(y.width*.5,0,0),A.halfHeight.set(0,y.height*.5,0),A.halfWidth.applyMatrix4(s),A.halfHeight.applyMatrix4(s),x++}else if(y.isPointLight){const A=n.point[d];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(f),d++}else if(y.isHemisphereLight){const A=n.hemi[m];A.direction.setFromMatrixPosition(y.matrixWorld),A.direction.transformDirection(f),m++}}}return{setup:o,setupView:l,state:n}}function vc(i){const e=new E0(i),t=[],n=[],r=[];function a(p){u.camera=p,t.length=0,n.length=0,r.length=0}function s(p){p.isLightProbeGrid?r.push(p):t.push(p)}function o(p){n.push(p)}function l(){e.setup(t),r.sort((p,h)=>p.priority-h.priority||p.id-h.id)}function c(p){e.setupView(t,p)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:l,setupLightsView:c,pushLight:s,pushShadow:o}}function T0(i){let e=new WeakMap;function t(r,a=0){const s=e.get(r);let o;return s===void 0?(o=new vc(i),e.set(r,[o])):a>=s.length?(o=new vc(i),s.push(o)):o=s[a],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const A0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,w0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,R0=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],C0=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],xc=new lt,gr=new I,Us=new I;function P0(i,e,t){let n=new Ba;const r=new we,a=new we,s=new ht,o=new Vd,l=new Wd,c={},u=t.maxTextureSize,p={[Si]:Wt,[Wt]:Si,[Mn]:Mn},h=new dt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new we},radius:{value:4}},vertexShader:A0,fragmentShader:w0}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const _=new ft;_.setAttribute("position",new $e(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new xt(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=_a;let f=this.type;this.render=function(T,g,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Ch&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=_a);const C=i.getRenderTarget(),R=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Mi),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const V=f!==this.type;V&&g.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(G=>G.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,G=T.length;L<G;L++){const X=T[L],N=X.shadow;if(N===void 0){Le("WebGLShadowMap:",X,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;r.copy(N.mapSize);const K=N.getFrameExtents();r.multiply(K),a.copy(N.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(a.x=Math.floor(u/K.x),r.x=a.x*K.x,N.mapSize.x=a.x),r.y>u&&(a.y=Math.floor(u/K.y),r.y=a.y*K.y,N.mapSize.y=a.y));const W=i.state.buffers.depth.getReversed();if(N.camera._reversedDepth=W,N.map===null||V===!0){if(N.map!==null&&(N.map.depthTexture!==null&&(N.map.depthTexture.dispose(),N.map.depthTexture=null),N.map.dispose()),this.type===vr){if(X.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}N.map=new qt(r.x,r.y,{format:yi,type:Xt,minFilter:jt,magFilter:jt,generateMipmaps:!1}),N.map.texture.name=X.name+".shadowMap",N.map.depthTexture=new Ji(r.x,r.y,Ln),N.map.depthTexture.name=X.name+".shadowMapDepth",N.map.depthTexture.format=li,N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=Pt,N.map.depthTexture.magFilter=Pt}else X.isPointLight?(N.map=new Zo(r.x),N.map.depthTexture=new gu(r.x,In)):(N.map=new qt(r.x,r.y),N.map.depthTexture=new Ji(r.x,r.y,In)),N.map.depthTexture.name=X.name+".shadowMap",N.map.depthTexture.format=li,this.type===_a?(N.map.depthTexture.compareFunction=W?eu:Qc,N.map.depthTexture.minFilter=jt,N.map.depthTexture.magFilter=jt):(N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=Pt,N.map.depthTexture.magFilter=Pt);N.camera.updateProjectionMatrix()}N.map.isWebGLCubeRenderTarget!==!0&&(N.map.width!==r.x||N.map.height!==r.y)&&N.map.setSize(r.x,r.y);const j=N.map.isWebGLCubeRenderTarget?6:N.getViewportCount();X.isPointLight!==!0&&N.updateMatrices(X,b);const Q=(N.camera.layers.mask&4294967294)!==0?N.camera.layers:b.layers;for(let ae=0;ae<j;ae++){const ce=N.getCamera(ae);if(X.isPointLight){const H=N.camera,ne=N.matrix,me=X.distance||H.far;me!==H.far&&(H.far=me,H.updateProjectionMatrix()),gr.setFromMatrixPosition(X.matrixWorld),H.position.copy(gr),Us.copy(H.position),Us.add(R0[ae]),H.up.copy(C0[ae]),H.lookAt(Us),H.updateMatrixWorld(),ne.makeTranslation(-gr.x,-gr.y,-gr.z),xc.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),N._frustum.setFromProjectionMatrix(xc,H.coordinateSystem,H.reversedDepth)}if(N.map.isWebGLCubeRenderTarget)i.setRenderTarget(N.map,ae),i.clear();else{ae===0&&(i.setRenderTarget(N.map),i.clear());const H=N.getViewport(ae);s.set(a.x*H.x,a.y*H.y,a.x*H.z,a.y*H.w),O.viewport(s)}n=N.getFrustum(ae),y(g,b,ce,X,Q,this.type)}N.isPointLightShadow!==!0&&this.type===vr&&v(N,b),N.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(C,R,D)};function v(T,g){const b=e.update(x);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new qt(r.x,r.y,{format:yi,type:Xt}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),h.uniforms.shadow_pass.value=T.map.depthTexture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(g,null,b,h,x,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(g,null,b,d,x,null)}function E(T,g,b,C){let R=null;const D=b.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(D!==void 0)R=D;else if(R=b.isPointLight===!0?l:o,i.localClippingEnabled&&g.clipShadows===!0&&Array.isArray(g.clippingPlanes)&&g.clippingPlanes.length!==0||g.displacementMap&&g.displacementScale!==0||g.alphaMap&&g.alphaTest>0||g.map&&g.alphaTest>0||g.alphaToCoverage===!0){const O=R.uuid,V=g.uuid;let L=c[O];L===void 0&&(L={},c[O]=L);let G=L[V];G===void 0&&(G=R.clone(),L[V]=G,g.addEventListener("dispose",A)),R=G}if(R.visible=g.visible,R.wireframe=g.wireframe,C===vr?R.side=g.shadowSide!==null?g.shadowSide:g.side:R.side=g.shadowSide!==null?g.shadowSide:p[g.side],R.alphaMap=g.alphaMap,R.alphaTest=g.alphaToCoverage===!0?.5:g.alphaTest,R.map=g.map,R.clipShadows=g.clipShadows,R.clippingPlanes=g.clippingPlanes,R.clipIntersection=g.clipIntersection,R.displacementMap=g.displacementMap,R.displacementScale=g.displacementScale,R.displacementBias=g.displacementBias,R.wireframeLinewidth=g.wireframeLinewidth,R.linewidth=g.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const O=i.properties.get(R);O.light=b}return R}function y(T,g,b,C,R,D){if(T.visible===!1)return;if(T.layers.test(R)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&D===vr)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,T.matrixWorld);const L=e.update(T),G=T.material;if(Array.isArray(G)){const X=L.groups;for(let N=0,K=X.length;N<K;N++){const W=X[N],j=G[W.materialIndex];if(j&&j.visible){const Q=E(T,j,C,D);T.onBeforeShadow(i,T,g,b,L,Q,W),i.renderBufferDirect(b,null,L,Q,T,W),T.onAfterShadow(i,T,g,b,L,Q,W)}}}else if(G.visible){const X=E(T,G,C,D);T.onBeforeShadow(i,T,g,b,L,X,null),i.renderBufferDirect(b,null,L,X,T,null),T.onAfterShadow(i,T,g,b,L,X,null)}}const V=T.children;for(let L=0,G=V.length;L<G;L++)y(V[L],g,b,C,R,D)}function A(T){T.target.removeEventListener("dispose",A);for(const b in c){const C=c[b],R=T.target.uuid;R in C&&(C[R].dispose(),delete C[R])}}}function L0(i,e){function t(){let P=!1;const J=new ht;let $=null;const he=new ht(0,0,0,0);return{setMask:function(se){$!==se&&!P&&(i.colorMask(se,se,se,se),$=se)},setLocked:function(se){P=se},setClear:function(se,le,Ae,Be,re){re===!0&&(se*=Be,le*=Be,Ae*=Be),J.set(se,le,Ae,Be),he.equals(J)===!1&&(i.clearColor(se,le,Ae,Be),he.copy(J))},reset:function(){P=!1,$=null,he.set(-1,0,0,0)}}}function n(){let P=!1,J=!1,$=null,he=null,se=null;return{setReversed:function(le){if(J!==le){const Ae=e.get("EXT_clip_control");le?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),J=le;const Be=se;se=null,this.setClear(Be)}},getReversed:function(){return J},setTest:function(le){le?te(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(le){$!==le&&!P&&(i.depthMask(le),$=le)},setFunc:function(le){if(J&&(le=ld[le]),he!==le){switch(le){case ks:i.depthFunc(i.NEVER);break;case Gs:i.depthFunc(i.ALWAYS);break;case Hs:i.depthFunc(i.LESS);break;case Ar:i.depthFunc(i.LEQUAL);break;case Vs:i.depthFunc(i.EQUAL);break;case Ws:i.depthFunc(i.GEQUAL);break;case Xs:i.depthFunc(i.GREATER);break;case qs:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}he=le}},setLocked:function(le){P=le},setClear:function(le){se!==le&&(se=le,J&&(le=1-le),i.clearDepth(le))},reset:function(){P=!1,$=null,he=null,se=null,J=!1}}}function r(){let P=!1,J=null,$=null,he=null,se=null,le=null,Ae=null,Be=null,re=null;return{setTest:function(Ce){P||(Ce?te(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(Ce){J!==Ce&&!P&&(i.stencilMask(Ce),J=Ce)},setFunc:function(Ce,Oe,_e){($!==Ce||he!==Oe||se!==_e)&&(i.stencilFunc(Ce,Oe,_e),$=Ce,he=Oe,se=_e)},setOp:function(Ce,Oe,_e){(le!==Ce||Ae!==Oe||Be!==_e)&&(i.stencilOp(Ce,Oe,_e),le=Ce,Ae=Oe,Be=_e)},setLocked:function(Ce){P=Ce},setClear:function(Ce){re!==Ce&&(i.clearStencil(Ce),re=Ce)},reset:function(){P=!1,J=null,$=null,he=null,se=null,le=null,Ae=null,Be=null,re=null}}}const a=new t,s=new n,o=new r;let l={};const c=new WeakMap;let u={},p={},h={},d=new WeakMap,_=[],x=null,m=!1,f=null,v=null,E=null,y=null,A=null,T=null,g=null,b=new De(0,0,0),C=0,R=!1,D=null,O=null,V=null,L=null,G=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let N=!1,K=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(W)[1]),N=K>=1):W.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),N=K>=2);let j=null,Q={};const ae=i.getParameter(i.SCISSOR_BOX),ce=i.getParameter(i.VIEWPORT),H=new ht().fromArray(ae),ne=new ht().fromArray(ce);function me(P,J,$,he){const se=new Uint8Array(4),le=i.createTexture();i.bindTexture(P,le),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ae=0;Ae<$;Ae++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(J,0,i.RGBA,1,1,he,0,i.RGBA,i.UNSIGNED_BYTE,se):i.texImage2D(J+Ae,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,se);return le}const be={};be[i.TEXTURE_2D]=me(i.TEXTURE_2D,i.TEXTURE_2D,1),be[i.TEXTURE_CUBE_MAP]=me(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),be[i.TEXTURE_2D_ARRAY]=me(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),be[i.TEXTURE_3D]=me(i.TEXTURE_3D,i.TEXTURE_3D,1,1),a.setClear(0,0,0,1),s.setClear(1),o.setClear(0),te(i.DEPTH_TEST),s.setFunc(Ar),Tt(!1),it(xl),te(i.CULL_FACE),bt(Mi);function te(P){u[P]!==!0&&(i.enable(P),u[P]=!0)}function Re(P){u[P]!==!1&&(i.disable(P),u[P]=!1)}function Ge(P,J){return h[P]!==J?(i.bindFramebuffer(P,J),h[P]=J,P===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=J),P===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=J),!0):!1}function Te(P,J){let $=_,he=!1;if(P){$=d.get(J),$===void 0&&($=[],d.set(J,$));const se=P.textures;if($.length!==se.length||$[0]!==i.COLOR_ATTACHMENT0){for(let le=0,Ae=se.length;le<Ae;le++)$[le]=i.COLOR_ATTACHMENT0+le;$.length=se.length,he=!0}}else $[0]!==i.BACK&&($[0]=i.BACK,he=!0);he&&i.drawBuffers($)}function Ye(P){return x!==P?(i.useProgram(P),x=P,!0):!1}const Ke={[qi]:i.FUNC_ADD,[Lh]:i.FUNC_SUBTRACT,[Dh]:i.FUNC_REVERSE_SUBTRACT};Ke[Ih]=i.MIN,Ke[Nh]=i.MAX;const ke={[Uh]:i.ZERO,[Fh]:i.ONE,[Oh]:i.SRC_COLOR,[Hc]:i.SRC_ALPHA,[Vh]:i.SRC_ALPHA_SATURATE,[Gh]:i.DST_COLOR,[zh]:i.DST_ALPHA,[Bh]:i.ONE_MINUS_SRC_COLOR,[Vc]:i.ONE_MINUS_SRC_ALPHA,[Hh]:i.ONE_MINUS_DST_COLOR,[kh]:i.ONE_MINUS_DST_ALPHA,[Wh]:i.CONSTANT_COLOR,[Xh]:i.ONE_MINUS_CONSTANT_COLOR,[qh]:i.CONSTANT_ALPHA,[$h]:i.ONE_MINUS_CONSTANT_ALPHA};function bt(P,J,$,he,se,le,Ae,Be,re,Ce){if(P===Mi){m===!0&&(Re(i.BLEND),m=!1);return}if(m===!1&&(te(i.BLEND),m=!0),P!==Ph){if(P!==f||Ce!==R){if((v!==qi||A!==qi)&&(i.blendEquation(i.FUNC_ADD),v=qi,A=qi),Ce)switch(P){case Mr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sn:i.blendFunc(i.ONE,i.ONE);break;case bl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ml:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ze("WebGLState: Invalid blending: ",P);break}else switch(P){case Mr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case bl:Ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ml:Ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ze("WebGLState: Invalid blending: ",P);break}E=null,y=null,T=null,g=null,b.set(0,0,0),C=0,f=P,R=Ce}return}se=se||J,le=le||$,Ae=Ae||he,(J!==v||se!==A)&&(i.blendEquationSeparate(Ke[J],Ke[se]),v=J,A=se),($!==E||he!==y||le!==T||Ae!==g)&&(i.blendFuncSeparate(ke[$],ke[he],ke[le],ke[Ae]),E=$,y=he,T=le,g=Ae),(Be.equals(b)===!1||re!==C)&&(i.blendColor(Be.r,Be.g,Be.b,re),b.copy(Be),C=re),f=P,R=!1}function ut(P,J){P.side===Mn?Re(i.CULL_FACE):te(i.CULL_FACE);let $=P.side===Wt;J&&($=!$),Tt($),P.blending===Mr&&P.transparent===!1?bt(Mi):bt(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),s.setFunc(P.depthFunc),s.setTest(P.depthTest),s.setMask(P.depthWrite),a.setMask(P.colorWrite);const he=P.stencilWrite;o.setTest(he),he&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),He(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?te(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function Tt(P){D!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),D=P)}function it(P){P!==wh?(te(i.CULL_FACE),P!==O&&(P===xl?i.cullFace(i.BACK):P===Rh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),O=P}function en(P){P!==V&&(N&&i.lineWidth(P),V=P)}function He(P,J,$){P?(te(i.POLYGON_OFFSET_FILL),(L!==J||G!==$)&&(L=J,G=$,s.getReversed()&&(J=-J,$=-$),i.polygonOffset(J,$))):Re(i.POLYGON_OFFSET_FILL)}function Mt(P){P?te(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function tn(P){P===void 0&&(P=i.TEXTURE0+X-1),j!==P&&(i.activeTexture(P),j=P)}function nn(P,J,$){$===void 0&&(j===null?$=i.TEXTURE0+X-1:$=j);let he=Q[$];he===void 0&&(he={type:void 0,texture:void 0},Q[$]=he),(he.type!==P||he.texture!==J)&&(j!==$&&(i.activeTexture($),j=$),i.bindTexture(P,J||be[P]),he.type=P,he.texture=J)}function F(){const P=Q[j];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function rn(){try{i.compressedTexImage2D(...arguments)}catch(P){Ze("WebGLState:",P)}}function st(){try{i.compressedTexImage3D(...arguments)}catch(P){Ze("WebGLState:",P)}}function ot(){try{i.texSubImage2D(...arguments)}catch(P){Ze("WebGLState:",P)}}function ge(){try{i.texSubImage3D(...arguments)}catch(P){Ze("WebGLState:",P)}}function St(){try{i.compressedTexSubImage2D(...arguments)}catch(P){Ze("WebGLState:",P)}}function Pe(){try{i.compressedTexSubImage3D(...arguments)}catch(P){Ze("WebGLState:",P)}}function Ie(){try{i.texStorage2D(...arguments)}catch(P){Ze("WebGLState:",P)}}function w(){try{i.texStorage3D(...arguments)}catch(P){Ze("WebGLState:",P)}}function M(){try{i.texImage2D(...arguments)}catch(P){Ze("WebGLState:",P)}}function z(){try{i.texImage3D(...arguments)}catch(P){Ze("WebGLState:",P)}}function ie(P){return p[P]!==void 0?p[P]:i.getParameter(P)}function ee(P,J){p[P]!==J&&(i.pixelStorei(P,J),p[P]=J)}function oe(P){H.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),H.copy(P))}function fe(P){ne.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),ne.copy(P))}function Y(P,J){let $=c.get(J);$===void 0&&($=new WeakMap,c.set(J,$));let he=$.get(P);he===void 0&&(he=i.getUniformBlockIndex(J,P.name),i.uniformBlockBinding(J,he,he),$.set(P,he))}function Z(P,J,$){const se=c.get(J).get(P);l[se]!==$&&(i.bindBufferBase(i.UNIFORM_BUFFER,se,$),l[se]=$)}function ue(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),s.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},j=null,Q={},h={},l={},d=new WeakMap,_=[],x=null,m=!1,f=null,v=null,E=null,y=null,A=null,T=null,g=null,b=new De(0,0,0),C=0,R=!1,D=null,O=null,V=null,L=null,G=null,H.set(0,0,i.canvas.width,i.canvas.height),ne.set(0,0,i.canvas.width,i.canvas.height),a.reset(),s.reset(),o.reset()}return{buffers:{color:a,depth:s,stencil:o},enable:te,disable:Re,bindFramebuffer:Ge,drawBuffers:Te,useProgram:Ye,setBlending:bt,setMaterial:ut,setFlipSided:Tt,setCullFace:it,setLineWidth:en,setPolygonOffset:He,setScissorTest:Mt,activeTexture:tn,bindTexture:nn,unbindTexture:F,compressedTexImage2D:rn,compressedTexImage3D:st,texImage2D:M,texImage3D:z,pixelStorei:ee,getParameter:ie,updateUBOMapping:Y,uniformBlockBinding:Z,texStorage2D:Ie,texStorage3D:w,texSubImage2D:ot,texSubImage3D:ge,compressedTexSubImage2D:St,compressedTexSubImage3D:Pe,scissor:oe,viewport:fe,reset:ue}}function D0(i,e,t,n,r,a,s){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new we,u=new WeakMap,p=new Set;let h;const d=new WeakMap,_=new Set,x=new FinalizationRegistry(w=>_.delete(w));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function f(w,M){return m?new OffscreenCanvas(w,M):Na("canvas")}function v(w,M,z){let ie=1;const ee=Ie(w);if((ee.width>z||ee.height>z)&&(ie=z/Math.max(ee.width,ee.height)),ie<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const oe=Math.floor(ie*ee.width),fe=Math.floor(ie*ee.height);h===void 0&&(h=f(oe,fe));const Y=M?f(oe,fe):h;return Y.width=oe,Y.height=fe,Y.getContext("2d").drawImage(w,0,0,oe,fe),Le("WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+oe+"x"+fe+")."),Y}else return"data"in w&&Le("WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),w;return w}function E(w){return w.generateMipmaps}function y(w){i.generateMipmap(w)}function A(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(w,M,z,ie,ee,oe=!1){if(w!==null){if(i[w]!==void 0)return i[w];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let fe;ie&&(fe=e.get("EXT_texture_norm16"),fe||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=M;if(M===i.RED&&(z===i.FLOAT&&(Y=i.R32F),z===i.HALF_FLOAT&&(Y=i.R16F),z===i.UNSIGNED_BYTE&&(Y=i.R8),z===i.UNSIGNED_SHORT&&fe&&(Y=fe.R16_EXT),z===i.SHORT&&fe&&(Y=fe.R16_SNORM_EXT)),M===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(Y=i.R8UI),z===i.UNSIGNED_SHORT&&(Y=i.R16UI),z===i.UNSIGNED_INT&&(Y=i.R32UI),z===i.BYTE&&(Y=i.R8I),z===i.SHORT&&(Y=i.R16I),z===i.INT&&(Y=i.R32I)),M===i.RG&&(z===i.FLOAT&&(Y=i.RG32F),z===i.HALF_FLOAT&&(Y=i.RG16F),z===i.UNSIGNED_BYTE&&(Y=i.RG8),z===i.UNSIGNED_SHORT&&fe&&(Y=fe.RG16_EXT),z===i.SHORT&&fe&&(Y=fe.RG16_SNORM_EXT)),M===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(Y=i.RG8UI),z===i.UNSIGNED_SHORT&&(Y=i.RG16UI),z===i.UNSIGNED_INT&&(Y=i.RG32UI),z===i.BYTE&&(Y=i.RG8I),z===i.SHORT&&(Y=i.RG16I),z===i.INT&&(Y=i.RG32I)),M===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),z===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),z===i.UNSIGNED_INT&&(Y=i.RGB32UI),z===i.BYTE&&(Y=i.RGB8I),z===i.SHORT&&(Y=i.RGB16I),z===i.INT&&(Y=i.RGB32I)),M===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),z===i.UNSIGNED_INT&&(Y=i.RGBA32UI),z===i.BYTE&&(Y=i.RGBA8I),z===i.SHORT&&(Y=i.RGBA16I),z===i.INT&&(Y=i.RGBA32I)),M===i.RGB&&(z===i.UNSIGNED_SHORT&&fe&&(Y=fe.RGB16_EXT),z===i.SHORT&&fe&&(Y=fe.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(Y=i.R11F_G11F_B10F)),M===i.RGBA){const Z=oe?Da:Xe.getTransfer(ee);z===i.FLOAT&&(Y=i.RGBA32F),z===i.HALF_FLOAT&&(Y=i.RGBA16F),z===i.UNSIGNED_BYTE&&(Y=Z===Qe?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&fe&&(Y=fe.RGBA16_EXT),z===i.SHORT&&fe&&(Y=fe.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function g(w,M){let z;return w?M===null||M===In||M===Zi?z=i.DEPTH24_STENCIL8:M===Ln?z=i.DEPTH32F_STENCIL8:M===Rr&&(z=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===In||M===Zi?z=i.DEPTH_COMPONENT24:M===Ln?z=i.DEPTH_COMPONENT32F:M===Rr&&(z=i.DEPTH_COMPONENT16),z}function b(w,M){return E(w)===!0||w.isFramebufferTexture&&w.minFilter!==Pt&&w.minFilter!==jt?Math.log2(Math.max(M.width,M.height))+1:w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?M.mipmaps.length:1}function C(w){const M=new WeakRef(w);n.get(w).__ref=M,_.add(M),x.register(w,M,M)}function R(w){const M=n.get(w).__ref;M!==void 0&&(_.delete(M),x.unregister(M))}function D(w){V(w.target)}function O(w){L(w.target)}function V(w){w.removeEventListener("dispose",D),R(w),X(w),w.isVideoTexture&&u.delete(w),w.isHTMLTexture&&p.delete(w)}function L(w){w.removeEventListener("dispose",O),R(w),K(w)}function G(){for(const w of _){const M=w.deref();M!==void 0&&(M.isRenderTarget===!0?L(M):V(M))}_.clear(),p.clear()}function X(w){const M=n.get(w);if(M.__webglInit===void 0)return;const z=w.source,ie=d.get(z);if(ie){const ee=ie[M.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&N(w),Object.keys(ie).length===0&&d.delete(z)}n.remove(w)}function N(w){const M=n.get(w);i.deleteTexture(M.__webglTexture);const z=w.source,ie=d.get(z);delete ie[M.__cacheKey],s.memory.textures--}function K(w){const M=n.get(w);M.__depthDisposeCallback&&M.__depthDisposeCallback();const z=w.depthTexture;if(z&&z.renderTarget===w&&V(z),w.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(M.__webglFramebuffer[ee]))for(let oe=0;oe<M.__webglFramebuffer[ee].length;oe++)i.deleteFramebuffer(M.__webglFramebuffer[ee][oe]);else i.deleteFramebuffer(M.__webglFramebuffer[ee]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[ee])}else{if(Array.isArray(M.__webglFramebuffer))for(let ee=0;ee<M.__webglFramebuffer.length;ee++)i.deleteFramebuffer(M.__webglFramebuffer[ee]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ee=0;ee<M.__webglColorRenderbuffer.length;ee++)M.__webglColorRenderbuffer[ee]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[ee]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const ie=w.textures;for(let ee=0,oe=ie.length;ee<oe;ee++){const fe=n.get(ie[ee]);fe.__webglTexture&&(i.deleteTexture(fe.__webglTexture),s.memory.textures--),n.remove(ie[ee])}n.remove(w)}let W=0;function j(){W=0}function Q(){return W}function ae(w){W=w}function ce(){const w=W;return w>=r.maxTextures&&Le("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+r.maxTextures),W+=1,w}function H(w){const M=[];return M.push(w.wrapS),M.push(w.wrapT),M.push(w.wrapR||0),M.push(w.magFilter),M.push(w.minFilter),M.push(w.anisotropy),M.push(w.internalFormat),M.push(w.format),M.push(w.type),M.push(w.generateMipmaps),M.push(w.mipmapsAutoUpdate),M.push(w.premultiplyAlpha),M.push(w.flipY),M.push(w.unpackAlignment),M.push(w.colorSpace),M.join()}function ne(w,M){const z=n.get(w);if(w.isVideoTexture&&St(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&z.__version!==w.version){const ie=w.image;if(ie===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{ut(z,w,M);return}}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+M)}function me(w,M){const z=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){ut(z,w,M);return}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+M)}function be(w,M){const z=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){ut(z,w,M);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+M)}function te(w,M){const z=n.get(w);if(w.version>0&&z.__version!==w.version){Tt(z,w,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+M)}const Re={[$s]:i.REPEAT,[Wn]:i.CLAMP_TO_EDGE,[Ys]:i.MIRRORED_REPEAT},Ge={[Pt]:i.NEAREST,[jh]:i.NEAREST_MIPMAP_NEAREST,[kr]:i.NEAREST_MIPMAP_LINEAR,[jt]:i.LINEAR,[ls]:i.LINEAR_MIPMAP_NEAREST,[ri]:i.LINEAR_MIPMAP_LINEAR},Te={[ed]:i.NEVER,[tu]:i.ALWAYS,[td]:i.LESS,[Qc]:i.LEQUAL,[nd]:i.EQUAL,[eu]:i.GEQUAL,[id]:i.GREATER,[rd]:i.NOTEQUAL};function Ye(w,M){if(M.type===Ln&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===jt||M.magFilter===ls||M.magFilter===kr||M.magFilter===ri||M.minFilter===jt||M.minFilter===ls||M.minFilter===kr||M.minFilter===ri)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,Re[M.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,Re[M.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,Re[M.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,Ge[M.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,Ge[M.minFilter]),M.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Te[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Pt||M.minFilter!==kr&&M.minFilter!==ri||M.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Ke(w,M){let z=!1;w.__webglInit===void 0&&(w.__webglInit=!0,M.addEventListener("dispose",D),C(M));const ie=M.source;let ee=d.get(ie);ee===void 0&&(ee={},d.set(ie,ee));const oe=H(M);if(oe!==w.__cacheKey){ee[oe]===void 0&&(ee[oe]={texture:i.createTexture(),usedTimes:0},s.memory.textures++,z=!0),ee[oe].usedTimes++;const fe=ee[w.__cacheKey];fe!==void 0&&(ee[w.__cacheKey].usedTimes--,fe.usedTimes===0&&N(M)),w.__cacheKey=oe,w.__webglTexture=ee[oe].texture}return z}function ke(w,M,z){return Math.floor(Math.floor(w/z)/M)}function bt(w,M,z,ie){const oe=w.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,z,ie,M.data);else{oe.sort((P,J)=>P.start-J.start);let fe=0;for(let P=1;P<oe.length;P++){const J=oe[fe],$=oe[P],he=J.start+J.count,se=ke($.start,M.width,4),le=ke(J.start,M.width,4);$.start<=he+1&&se===le&&ke($.start+$.count-1,M.width,4)===se?J.count=Math.max(J.count,$.start+$.count-J.start):(++fe,oe[fe]=$)}oe.length=fe+1;const Y=t.getParameter(i.UNPACK_ROW_LENGTH),Z=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let P=0,J=oe.length;P<J;P++){const $=oe[P],he=Math.floor($.start/4),se=Math.ceil($.count/4),le=he%M.width,Ae=Math.floor(he/M.width),Be=se,re=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,le),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ae),t.texSubImage2D(i.TEXTURE_2D,0,le,Ae,Be,re,z,ie,M.data)}w.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Y),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Z),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function ut(w,M,z){let ie=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ie=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ie=i.TEXTURE_3D);const ee=Ke(w,M),oe=M.source;t.bindTexture(ie,w.__webglTexture,i.TEXTURE0+z);const fe=n.get(oe);if(oe.version!==fe.__version||ee===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){const re=Xe.getPrimaries(Xe.workingColorSpace),Ce=M.colorSpace===Hn?null:Xe.getPrimaries(M.colorSpace),Oe=M.colorSpace===Hn||re===Ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe)}t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment);let Z=v(M.image,!1,r.maxTextureSize);Z=Pe(M,Z);const ue=a.convert(M.format,M.colorSpace),P=a.convert(M.type);let J=T(M.internalFormat,ue,P,M.normalized,M.colorSpace,M.isVideoTexture);Ye(ie,M);let $;const he=M.mipmaps,se=M.isVideoTexture!==!0,le=fe.__version===void 0||ee===!0,Ae=oe.dataReady,Be=b(M,Z);if(M.isDepthTexture)J=g(M.format===ai,M.type),le&&(se?t.texStorage2D(i.TEXTURE_2D,1,J,Z.width,Z.height):t.texImage2D(i.TEXTURE_2D,0,J,Z.width,Z.height,0,ue,P,null));else if(M.isDataTexture)if(he.length>0){se&&le&&t.texStorage2D(i.TEXTURE_2D,Be,J,he[0].width,he[0].height);for(let re=0,Ce=he.length;re<Ce;re++)$=he[re],se?Ae&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,$.width,$.height,ue,P,$.data):t.texImage2D(i.TEXTURE_2D,re,J,$.width,$.height,0,ue,P,$.data);M.generateMipmaps=!1}else se?(le&&t.texStorage2D(i.TEXTURE_2D,Be,J,Z.width,Z.height),Ae&&bt(M,Z,ue,P)):t.texImage2D(i.TEXTURE_2D,0,J,Z.width,Z.height,0,ue,P,Z.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){se&&le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Be,J,he[0].width,he[0].height,Z.depth);for(let re=0,Ce=he.length;re<Ce;re++)if($=he[re],M.format!==Dn)if(ue!==null)if(se){if(Ae)if(M.layerUpdates.size>0){const Oe=Jl($.width,$.height,M.format,M.type);for(const _e of M.layerUpdates){const et=$.data.subarray(_e*Oe/$.data.BYTES_PER_ELEMENT,(_e+1)*Oe/$.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,_e,$.width,$.height,1,ue,et)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,$.width,$.height,Z.depth,ue,$.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,re,J,$.width,$.height,Z.depth,0,$.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else se?Ae&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,$.width,$.height,Z.depth,ue,P,$.data):t.texImage3D(i.TEXTURE_2D_ARRAY,re,J,$.width,$.height,Z.depth,0,ue,P,$.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{se&&le&&t.texStorage2D(i.TEXTURE_2D,Be,J,he[0].width,he[0].height);for(let re=0,Ce=he.length;re<Ce;re++)$=he[re],M.format!==Dn?ue!==null?se?Ae&&t.compressedTexSubImage2D(i.TEXTURE_2D,re,0,0,$.width,$.height,ue,$.data):t.compressedTexImage2D(i.TEXTURE_2D,re,J,$.width,$.height,0,$.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?Ae&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,$.width,$.height,ue,P,$.data):t.texImage2D(i.TEXTURE_2D,re,J,$.width,$.height,0,ue,P,$.data)}else if(M.isDataArrayTexture)if(se){if(le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Be,J,Z.width,Z.height,Z.depth),Ae)if(M.layerUpdates.size>0){const re=Jl(Z.width,Z.height,M.format,M.type);for(const Ce of M.layerUpdates){const Oe=Z.data.subarray(Ce*re/Z.data.BYTES_PER_ELEMENT,(Ce+1)*re/Z.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ce,Z.width,Z.height,1,ue,P,Oe)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,ue,P,Z.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,J,Z.width,Z.height,Z.depth,0,ue,P,Z.data);else if(M.isData3DTexture)se?(le&&t.texStorage3D(i.TEXTURE_3D,Be,J,Z.width,Z.height,Z.depth),Ae&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,ue,P,Z.data)):t.texImage3D(i.TEXTURE_3D,0,J,Z.width,Z.height,Z.depth,0,ue,P,Z.data);else if(M.isFramebufferTexture){if(le)if(se)t.texStorage2D(i.TEXTURE_2D,Be,J,Z.width,Z.height);else{let re=Z.width,Ce=Z.height;for(let Oe=0;Oe<Be;Oe++)t.texImage2D(i.TEXTURE_2D,Oe,J,re,Ce,0,ue,P,null),re>>=1,Ce>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in i){const re=i.canvas;if(re.hasAttribute("layoutsubtree")||re.setAttribute("layoutsubtree","true"),Z.parentNode!==re){re.appendChild(Z),p.add(M),re.onpaint=Ce=>{const Oe=Ce.changedElements;for(const _e of p)Oe.includes(_e.image)&&(_e.needsUpdate=!0)},re.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Z);else{const Oe=i.RGBA,_e=i.RGBA,et=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Oe,_e,et,Z)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(he.length>0){if(se&&le){const re=Ie(he[0]);t.texStorage2D(i.TEXTURE_2D,Be,J,re.width,re.height)}for(let re=0,Ce=he.length;re<Ce;re++)$=he[re],se?Ae&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,ue,P,$):t.texImage2D(i.TEXTURE_2D,re,J,ue,P,$);M.generateMipmaps=!1}else if(se){if(le){const re=Ie(Z);t.texStorage2D(i.TEXTURE_2D,Be,J,re.width,re.height)}Ae&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,P,Z)}else t.texImage2D(i.TEXTURE_2D,0,J,ue,P,Z);E(M)&&M.mipmapsAutoUpdate===!0&&y(ie),fe.__version=oe.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function Tt(w,M,z){if(M.image.length!==6)return;const ie=Ke(w,M),ee=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+z);const oe=n.get(ee);if(ee.version!==oe.__version||ie===!0){t.activeTexture(i.TEXTURE0+z);const fe=Xe.getPrimaries(Xe.workingColorSpace),Y=M.colorSpace===Hn?null:Xe.getPrimaries(M.colorSpace),Z=M.colorSpace===Hn||fe===Y?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);const ue=M.isCompressedTexture||M.image[0].isCompressedTexture,P=M.image[0]&&M.image[0].isDataTexture,J=[];for(let _e=0;_e<6;_e++)!ue&&!P?J[_e]=v(M.image[_e],!0,r.maxCubemapSize):J[_e]=P?M.image[_e].image:M.image[_e],J[_e]=Pe(M,J[_e]);const $=J[0],he=a.convert(M.format,M.colorSpace),se=a.convert(M.type);let le=T(M.internalFormat,he,se,M.normalized,M.colorSpace);const Ae=M.isVideoTexture!==!0,Be=oe.__version===void 0||ie===!0,re=ee.dataReady;let Ce=b(M,$);Ye(i.TEXTURE_CUBE_MAP,M);let Oe;if(M.isDepthTexture){if(le=g(M.format===ai,M.type),Be)if(Ae)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,le,$.width,$.height);else for(let _e=0;_e<6;_e++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,le,$.width,$.height,0,he,se,null)}else if(ue){Ae&&Be&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,le,$.width,$.height);for(let _e=0;_e<6;_e++){Oe=J[_e].mipmaps;for(let et=0;et<Oe.length;et++){const At=Oe[et];M.format!==Dn?he!==null?Ae?re&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,0,0,At.width,At.height,he,At.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,le,At.width,At.height,0,At.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ae?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,0,0,At.width,At.height,he,se,At.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,le,At.width,At.height,0,he,se,At.data)}}}else{if(Oe=M.mipmaps,Ae&&Be){Oe.length>0&&Ce++;const _e=Ie(J[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,le,_e.width,_e.height)}for(let _e=0;_e<6;_e++)if(P){Ae?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,J[_e].width,J[_e].height,he,se,J[_e].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,le,J[_e].width,J[_e].height,0,he,se,J[_e].data);for(let et=0;et<Oe.length;et++){const Yn=Oe[et].image[_e].image;Ae?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,0,0,Yn.width,Yn.height,he,se,Yn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,le,Yn.width,Yn.height,0,he,se,Yn.data)}}else{Ae?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,he,se,J[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,le,he,se,J[_e]);for(let et=0;et<Oe.length;et++){const At=Oe[et];Ae?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,0,0,he,se,At.image[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,le,he,se,At.image[_e])}}}E(M)&&M.mipmapsAutoUpdate===!0&&y(i.TEXTURE_CUBE_MAP),oe.__version=ee.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function it(w,M,z,ie,ee,oe){const fe=a.convert(z.format,z.colorSpace),Y=a.convert(z.type),Z=T(z.internalFormat,fe,Y,z.normalized,z.colorSpace),ue=n.get(M),P=n.get(z);if(P.__renderTarget=M,!ue.__hasExternalTextures){const J=Math.max(1,M.width>>oe),$=Math.max(1,M.height>>oe);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,oe,Z,J,$,M.depth,0,fe,Y,null):t.texImage2D(ee,oe,Z,J,$,0,fe,Y,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),ge(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,ee,P.__webglTexture,0,ot(M)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ie,ee,P.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function en(w,M,z){if(i.bindRenderbuffer(i.RENDERBUFFER,w),M.depthBuffer){const ie=M.depthTexture,ee=ie&&ie.isDepthTexture?ie.type:null,oe=g(M.stencilBuffer,ee),fe=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ge(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ot(M),oe,M.width,M.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,ot(M),oe,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,oe,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,fe,i.RENDERBUFFER,w)}else{const ie=M.textures;for(let ee=0;ee<ie.length;ee++){const oe=ie[ee],fe=a.convert(oe.format,oe.colorSpace),Y=a.convert(oe.type),Z=T(oe.internalFormat,fe,Y,oe.normalized,oe.colorSpace);ge(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ot(M),Z,M.width,M.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,ot(M),Z,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Z,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function He(w,M,z){const ie=M.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ee=n.get(M.depthTexture);ee.__renderTarget=M;const oe=ie?M.depthTexture.image[0]:M.depthTexture.image;(!ee.__webglTexture||oe.width!==M.width||oe.height!==M.height)&&(oe.width=M.width,oe.height=M.height,M.depthTexture.needsUpdate=!0),ie?te(M.depthTexture,0):ne(M.depthTexture,0);const fe=ee.__webglTexture,Y=ot(M),Z=ie?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,ue=M.depthTexture.format===ai?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(M.depthTexture.format===li)ge(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,Z,fe,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,ue,Z,fe,0);else if(M.depthTexture.format===ai)ge(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,Z,fe,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,ue,Z,fe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Mt(w){const M=n.get(w),z=w.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==w.depthTexture){const ie=w.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),ie){const ee=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,ie.removeEventListener("dispose",ee)};ie.addEventListener("dispose",ee),M.__depthDisposeCallback=ee}M.__boundDepthTexture=ie}if(w.depthTexture&&!M.__autoAllocateDepthBuffer)if(z)for(let ie=0;ie<6;ie++)He(M.__webglFramebuffer[ie],w,ie);else w.texture.mipmaps.length>0?He(M.__webglFramebuffer[0],w,0):He(M.__webglFramebuffer,w,0);else if(z){M.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[ie]),M.__webglDepthbuffer[ie]===void 0)M.__webglDepthbuffer[ie]=i.createRenderbuffer(),en(M.__webglDepthbuffer[ie],w,!1);else{const ee=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=M.__webglDepthbuffer[ie];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,oe)}}else if(w.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),en(M.__webglDepthbuffer,w,!1);else{const ee=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,oe)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function tn(w,M,z){const ie=n.get(w);M!==void 0&&it(ie.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&Mt(w)}function nn(w){const M=w.texture,z=n.get(w),ie=n.get(M);w.addEventListener("dispose",O),C(w);const ee=w.textures,oe=w.isWebGLCubeRenderTarget===!0,fe=ee.length>1;if(fe||(ie.__webglTexture===void 0&&(ie.__webglTexture=i.createTexture()),ie.__version=M.version,s.memory.textures++),oe){z.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(M.mipmaps.length>0){z.__webglFramebuffer[Y]=[];for(let Z=0;Z<M.mipmaps.length;Z++)z.__webglFramebuffer[Y][Z]=i.createFramebuffer()}else z.__webglFramebuffer[Y]=i.createFramebuffer()}else{if(M.mipmaps.length>0){z.__webglFramebuffer=[];for(let Y=0;Y<M.mipmaps.length;Y++)z.__webglFramebuffer[Y]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(fe)for(let Y=0,Z=ee.length;Y<Z;Y++){const ue=n.get(ee[Y]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),s.memory.textures++)}if(w.samples>0&&ge(w)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let Y=0;Y<ee.length;Y++){const Z=ee[Y];z.__webglColorRenderbuffer[Y]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[Y]);const ue=a.convert(Z.format,Z.colorSpace),P=a.convert(Z.type),J=T(Z.internalFormat,ue,P,Z.normalized,Z.colorSpace,w.isXRRenderTarget===!0),$=ot(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,$,J,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Y,i.RENDERBUFFER,z.__webglColorRenderbuffer[Y])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),en(z.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,ie.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,M);for(let Y=0;Y<6;Y++)if(M.mipmaps.length>0)for(let Z=0;Z<M.mipmaps.length;Z++)it(z.__webglFramebuffer[Y][Z],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else it(z.__webglFramebuffer[Y],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);E(M)?y(i.TEXTURE_CUBE_MAP):M.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),t.unbindTexture()}else if(fe){for(let Y=0,Z=ee.length;Y<Z;Y++){const ue=ee[Y],P=n.get(ue);let J=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(J=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,P.__webglTexture),Ye(J,ue),it(z.__webglFramebuffer,w,ue,i.COLOR_ATTACHMENT0+Y,J,0),E(ue)&&y(J)}t.unbindTexture()}else{let Y=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Y=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Y,ie.__webglTexture),Ye(Y,M),M.mipmaps.length>0)for(let Z=0;Z<M.mipmaps.length;Z++)it(z.__webglFramebuffer[Z],w,M,i.COLOR_ATTACHMENT0,Y,Z);else it(z.__webglFramebuffer,w,M,i.COLOR_ATTACHMENT0,Y,0);E(M)?y(Y):M.mipmaps.length>0&&i.texParameteri(Y,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),t.unbindTexture()}w.depthBuffer&&Mt(w)}function F(w){const M=w.textures;for(let z=0,ie=M.length;z<ie;z++){const ee=M[z];if(E(ee)&&ee.mipmapsAutoUpdate===!0){const oe=A(w),fe=n.get(ee).__webglTexture;t.bindTexture(oe,fe),y(oe),t.unbindTexture()}}}const rn=[];function st(w){if(w.samples>0){if(ge(w)===!1){const M=w.textures,z=w.width,ie=w.height;let ee=i.COLOR_BUFFER_BIT;const oe=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=n.get(w),Y=M.length>1;if(Y)for(let ue=0;ue<M.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,fe.__webglMultisampledFramebuffer),w.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglFramebuffer);for(let ue=0;ue<M.length;ue++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),Y){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,fe.__webglColorRenderbuffer[ue]);const P=n.get(M[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,P,0)}i.blitFramebuffer(0,0,z,ie,0,0,z,ie,ee,i.NEAREST),l===!0&&(rn.length=0,rn.push(i.COLOR_ATTACHMENT0+ue),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&rn.push(oe),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,rn))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Y)for(let ue=0;ue<M.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,fe.__webglColorRenderbuffer[ue]);const P=n.get(M[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,P,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&l){const M=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function ot(w){return Math.min(r.maxSamples,w.samples)}function ge(w){const M=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function St(w){const M=s.render.frame;u.get(w)!==M&&(u.set(w,M),w.update())}function Pe(w,M){const z=w.colorSpace,ie=w.format,ee=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||z!==La&&z!==Hn&&(Xe.getTransfer(z)===Qe?(ie!==Dn||ee!==un)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ze("WebGLTextures: Unsupported texture color space:",z)),M}function Ie(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=ce,this.resetTextureUnits=j,this.getTextureUnits=Q,this.setTextureUnits=ae,this.setTexture2D=ne,this.setTexture2DArray=me,this.setTexture3D=be,this.setTextureCube=te,this.rebindTextures=tn,this.setupRenderTarget=nn,this.updateRenderTargetMipmap=F,this.updateMultisampleRenderTarget=st,this.setupDepthRenderbuffer=Mt,this.setupFrameBufferTexture=it,this.useMultisampledRTT=ge,this.dispose=G}function I0(i,e){function t(n,r=Hn){let a;const s=Xe.getTransfer(r);if(n===un)return i.UNSIGNED_BYTE;if(n===zo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ko)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Yc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Kc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===qc)return i.BYTE;if(n===$c)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===Bo)return i.INT;if(n===In)return i.UNSIGNED_INT;if(n===Ln)return i.FLOAT;if(n===Xt)return i.HALF_FLOAT;if(n===jc)return i.ALPHA;if(n===Zc)return i.RGB;if(n===Dn)return i.RGBA;if(n===li)return i.DEPTH_COMPONENT;if(n===ai)return i.DEPTH_STENCIL;if(n===Jc)return i.RED;if(n===Go)return i.RED_INTEGER;if(n===yi)return i.RG;if(n===Ho)return i.RG_INTEGER;if(n===Vo)return i.RGBA_INTEGER;if(n===va||n===xa||n===ba||n===Ma)if(s===Qe)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(n===va)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ba)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ma)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(n===va)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xa)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ba)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ma)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ks||n===js||n===Zs||n===Js)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(n===Ks)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===js)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Zs)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Js)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Qs||n===eo||n===to||n===no||n===io||n===Ca||n===ro)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(n===Qs||n===eo)return s===Qe?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===to)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(n===no)return a.COMPRESSED_R11_EAC;if(n===io)return a.COMPRESSED_SIGNED_R11_EAC;if(n===Ca)return a.COMPRESSED_RG11_EAC;if(n===ro)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===ao||n===so||n===oo||n===lo||n===co||n===uo||n===ho||n===fo||n===po||n===mo||n===go||n===_o||n===vo||n===xo)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(n===ao)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===so)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===oo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===lo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===co)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===uo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ho)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===fo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===po)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===mo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===go)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===_o)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===vo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===xo)return s===Qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===bo||n===Mo||n===So)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(n===bo)return s===Qe?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Mo)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===So)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===yo||n===Eo||n===Pa||n===To)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(n===yo)return a.COMPRESSED_RED_RGTC1_EXT;if(n===Eo)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Pa)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===To)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Zi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const N0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,U0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class F0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new _u(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new dt({vertexShader:N0,fragmentShader:U0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new xt(new Ka(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class O0 extends Ti{constructor(e,t){super();const n=this;let r=null,a=1,s=null,o="local-floor",l=1,c=null,u=null,p=null,h=null,d=null,_=null;const x=typeof XRWebGLBinding<"u",m=new F0,f={},v=t.getContextAttributes();let E=null,y=null;const A=[],T=[],g=new we;let b=null,C=null;const R=new bn;R.viewport=new ht;const D=new bn;D.viewport=new ht;const O=[R,D],V=new qd;let L=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let ne=A[H];return ne===void 0&&(ne=new _s,A[H]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(H){let ne=A[H];return ne===void 0&&(ne=new _s,A[H]=ne),ne.getGripSpace()},this.getHand=function(H){let ne=A[H];return ne===void 0&&(ne=new _s,A[H]=ne),ne.getHandSpace()};function X(H){const ne=T.indexOf(H.inputSource);if(ne===-1)return;const me=A[ne];me!==void 0&&(me.update(H.inputSource,H.frame,c||s),me.dispatchEvent({type:H.type,data:H.inputSource}))}function N(){r.removeEventListener("select",X),r.removeEventListener("selectstart",X),r.removeEventListener("selectend",X),r.removeEventListener("squeeze",X),r.removeEventListener("squeezestart",X),r.removeEventListener("squeezeend",X),r.removeEventListener("end",N),r.removeEventListener("inputsourceschange",K);for(let H=0;H<A.length;H++){const ne=T[H];ne!==null&&(T[H]=null,A[H].disconnect(ne))}L=null,G=null,m.reset();for(const H in f)delete f[H];if(e.setRenderTarget(E),d=null,h=null,p=null,r=null,y=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(g.width,g.height,!1),C!==null){const H=C.camera;H.fov=C.fov,H.zoom=C.zoom,H.updateProjectionMatrix(),C=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){a=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){o=H,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||s},this.setReferenceSpace=function(H){c=H},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return p===null&&x&&(p=new XRWebGLBinding(r,t)),p},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(H){if(r=H,r!==null){if(E=e.getRenderTarget(),r.addEventListener("select",X),r.addEventListener("selectstart",X),r.addEventListener("selectend",X),r.addEventListener("squeeze",X),r.addEventListener("squeezestart",X),r.addEventListener("squeezeend",X),r.addEventListener("end",N),r.addEventListener("inputsourceschange",K),v.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(g),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let me=null,be=null,te=null;v.depth&&(te=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,me=v.stencil?ai:li,be=v.stencil?Zi:In);const Re={colorFormat:t.RGBA8,depthFormat:te,scaleFactor:a};p=this.getBinding(),h=p.createProjectionLayer(Re),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),y=new qt(h.textureWidth,h.textureHeight,{format:Dn,type:un,depthTexture:new Ji(h.textureWidth,h.textureHeight,be,void 0,void 0,void 0,void 0,void 0,void 0,me),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const me={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(r,t,me),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new qt(d.framebufferWidth,d.framebufferHeight,{format:Dn,type:un,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,s=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function K(H){for(let ne=0;ne<H.removed.length;ne++){const me=H.removed[ne],be=T.indexOf(me);be>=0&&(T[be]=null,A[be].disconnect(me))}for(let ne=0;ne<H.added.length;ne++){const me=H.added[ne];let be=T.indexOf(me);if(be===-1){for(let Re=0;Re<A.length;Re++)if(Re>=T.length){T.push(me),be=Re;break}else if(T[Re]===null){T[Re]=me,be=Re;break}if(be===-1)break}const te=A[be];te&&te.connect(me)}}function W(H,ne){ne===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(ne.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(r===null)return;let ne=H.near,me=H.far;m.texture!==null&&(m.depthNear>0&&(ne=m.depthNear),m.depthFar>0&&(me=m.depthFar)),V.near=D.near=R.near=ne,V.far=D.far=R.far=me,(L!==V.near||G!==V.far)&&(r.updateRenderState({depthNear:V.near,depthFar:V.far}),L=V.near,G=V.far),V.layers.mask=H.layers.mask|6,R.layers.mask=V.layers.mask&-5,D.layers.mask=V.layers.mask&-3;const be=H.parent,te=V.cameras;W(V,be);for(let Re=0;Re<te.length;Re++)W(te[Re],be);V.projectionMatrix.copy(R.projectionMatrix),V.projectionMatrixInverse.copy(R.projectionMatrixInverse),C===null&&H.isPerspectiveCamera&&(C={camera:H,fov:H.fov,zoom:H.zoom}),j(H,V,be)};function j(H,ne,me){me===null?H.matrix.copy(ne.matrixWorld):(H.matrix.copy(me.matrixWorld),H.matrix.invert(),H.matrix.multiply(ne.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(ne.projectionMatrix),H.projectionMatrixInverse.copy(ne.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=Ao*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(H){l=H,h!==null&&(h.fixedFoveation=H),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=H)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(H){return f[H]};let Q=null;function ae(H,ne){if(u=ne.getViewerPose(c||s),_=ne,u!==null){const me=u.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let be=!1;me.length!==V.cameras.length&&(V.cameras.length=0,be=!0);for(let Te=0;Te<me.length;Te++){const Ye=me[Te];let Ke=null;if(d!==null)Ke=d.getViewport(Ye);else{const bt=p.getViewSubImage(h,Ye);Ke=bt.viewport,Te===0&&(e.setRenderTargetTextures(y,bt.colorTexture,bt.depthStencilTexture),e.setRenderTarget(y))}let ke=O[Te];ke===void 0&&(ke=new bn,ke.layers.enable(Te),ke.viewport=new ht,O[Te]=ke),ke.matrix.fromArray(Ye.transform.matrix),ke.matrix.decompose(ke.position,ke.quaternion,ke.scale),ke.projectionMatrix.fromArray(Ye.projectionMatrix),ke.projectionMatrixInverse.copy(ke.projectionMatrix).invert(),ke.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),Te===0&&(V.matrix.copy(ke.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),be===!0&&V.cameras.push(ke)}const te=r.enabledFeatures;if(te&&te.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&x){p=n.getBinding();const Te=p.getDepthInformation(me[0]);Te&&Te.isValid&&Te.texture&&m.init(Te,r.renderState)}if(te&&te.includes("camera-access")&&x){e.state.unbindTexture(),p=n.getBinding();for(let Te=0;Te<me.length;Te++){const Ye=me[Te].camera;if(Ye){let Ke=f[Ye];Ke||(Ke=new _u,f[Ye]=Ke);const ke=p.getCameraImage(Ye);Ke.sourceTexture=ke}}}}for(let me=0;me<A.length;me++){const be=T[me],te=A[me];be!==null&&te!==void 0&&te.update(be,ne,c||s)}Q&&Q(H,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),_=null}const ce=new Su;ce.setAnimationLoop(ae),this.setAnimationLoop=function(H){Q=H},this.dispose=function(){}}}const B0=new lt,Du=new Ue;Du.set(-1,0,0,0,1,0,0,0,1);function z0(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,vu(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function r(m,f,v,E,y){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?a(m,f):f.isMeshLambertMaterial?(a(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(a(m,f),p(m,f)):f.isMeshPhongMaterial?(a(m,f),u(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(a(m,f),h(m,f),f.isMeshPhysicalMaterial&&d(m,f,y)):f.isMeshMatcapMaterial?(a(m,f),_(m,f)):f.isMeshDepthMaterial?a(m,f):f.isMeshDistanceMaterial?(a(m,f),x(m,f)):f.isMeshNormalMaterial?a(m,f):f.isLineBasicMaterial?(s(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,v,E):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function a(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Wt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Wt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const v=e.get(f),E=v.envMap,y=v.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(B0.makeRotationFromEuler(y)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Du),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function s(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,v,E){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*v,m.scale.value=E*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function p(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function d(m,f,v){m.ior.value=f.ior,f.diffuseRoughness>0&&(m.diffuseRoughness.value=f.diffuseRoughness,f.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=f.diffuseRoughnessMap,t(f.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Wt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=f.iridescenceThicknessMaximum,f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){const v=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function k0(i,e,t,n){let r={},a={};function s(v,E){const y=E.program;n.uniformBlockBinding(v,y,r[v.id])}function o(v,E){let y=r[v.id];y===void 0&&(_(v),y=l(v),r[v.id]=y,v.addEventListener("dispose",m));const A=E.program;n.updateUBOMapping(v,A);const T=e.render.frame;a[v.id]!==T&&(c(v),a[v.id]=T)}function l(v){const E=i.createBuffer(),y=v.__size,A=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,y,A),i.bindBuffer(i.UNIFORM_BUFFER,null),E}function c(v){const E=r[v.id],y=v.uniforms,A=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let T=0,g=y.length;T<g;T++){const b=y[T];if(Array.isArray(b))for(let C=0,R=b.length;C<R;C++)u(b[C],T,C,A);else u(b,T,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(v,E,y,A){if(h(v,E,y,A)===!0){const T=v.__offset,g=v.value;if(Array.isArray(g)){let b=0;for(let C=0;C<g.length;C++){const R=g[C],D=x(R,!0);p(R,v.__data,b),b+=D.storage/Float32Array.BYTES_PER_ELEMENT}}else p(g,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,v.__data)}}function p(v,E,y){typeof v=="number"||typeof v=="boolean"?E[y]=v:v.isMatrix3?(E[y]=v.elements[0],E[y+1]=v.elements[1],E[y+2]=v.elements[2],E[y+3]=0,E[y+4]=v.elements[3],E[y+5]=v.elements[4],E[y+6]=v.elements[5],E[y+7]=0,E[y+8]=v.elements[6],E[y+9]=v.elements[7],E[y+10]=v.elements[8],E[y+11]=0):ArrayBuffer.isView(v)?E.set(v.subarray(0,E.length-y),y):v.toArray(E,y)}function h(v,E,y,A){const T=v.value,g=E+"_"+y;if(Array.isArray(T)){A[g]===void 0&&(A[g]=[]);const b=A[g];let C=!1;for(let R=0;R<T.length;R++)d(T[R],b,R)===!0&&(C=!0);return C}return d(T,A,g)}function d(v,E,y){if(E[y]===void 0)return typeof v=="number"||typeof v=="boolean"?E[y]=v:ArrayBuffer.isView(v)?E[y]=v.slice():E[y]=v.clone(),!0;{const A=E[y];if(typeof v=="number"||typeof v=="boolean"){if(A!==v)return E[y]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(A.equals(v)===!1)return A.copy(v),!0}}return!1}function _(v){const E=v.uniforms;let y=0;const A=16;for(let g=0,b=E.length;g<b;g++){const C=Array.isArray(E[g])?E[g]:[E[g]];for(let R=0,D=C.length;R<D;R++){const O=C[R],V=Array.isArray(O.value)?O.value:[O.value],L=Array.isArray(E[g])||Array.isArray(O.value);let G=y;for(let N=0,K=V.length;N<K;N++){const W=V[N],j=x(W,L),Q=y%A,ae=Q%j.boundary,ce=Q+ae;y+=ae,ce!==0&&A-ce<j.storage&&(y+=A-ce),N===0&&(G=y),y+=j.storage}const X=O.type==="int"?Int32Array:O.type==="uint"?Uint32Array:Float32Array;O.__data=new X((y-G)/Float32Array.BYTES_PER_ELEMENT),O.__offset=G}}const T=y%A;return T>0&&(y+=A-T),v.__size=y,v.__cache={},this}function x(v,E){const y={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(y.boundary=4,y.storage=4):v.isVector2?(y.boundary=8,y.storage=8):v.isVector3||v.isColor?(y.boundary=16,y.storage=12):v.isVector4?(y.boundary=16,y.storage=16):v.isMatrix3?(y.boundary=16,y.storage=48):v.isMatrix4?(y.boundary=16,y.storage=64):v.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(y.boundary=16,y.storage=v.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",v),E===!0&&(y.boundary=16,y.storage=Math.ceil(y.storage/16)*16),y}function m(v){const E=v.target;E.removeEventListener("dispose",m),i.deleteBuffer(r[E.id]),delete r[E.id],delete a[E.id]}function f(){for(const v in r)i.deleteBuffer(r[v]);r={},a={}}return{bind:s,update:o,dispose:f}}const G0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let wn=null;function H0(){return wn===null&&(wn=new Nd(G0,16,16,yi,Xt),wn.name="DFG_LUT",wn.minFilter=jt,wn.magFilter=jt,wn.wrapS=Wn,wn.wrapT=Wn,wn.generateMipmaps=!1,wn.needsUpdate=!0),wn}class V0{constructor(e={}){const{canvas:t=sd(),context:n=null,depth:r=!0,stencil:a=!1,alpha:s=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:d=un}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=s;const x=d,m=new Set([Vo,Ho,Go]),f=new Set([un,In,Rr,Zi,zo,ko]),v=new Uint32Array(4),E=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]};let A=null,T=null;const g=[],b=[];let C=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=qn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let D=!1,O=null,V=null,L=null,G=null;this._outputColorSpace=on;let X=0,N=0,K=null,W=-1,j=null;const Q=new ht,ae=new ht;let ce=null;const H=new De(0);let ne=0,me=t.width,be=t.height,te=1,Re=null,Ge=null;const Te=new ht(0,0,me,be),Ye=new ht(0,0,me,be);let Ke=!1;const ke=new Ba,bt=new qo;let ut=!1,Tt=!1;const it=new lt,en=new I,He=new ht,Mt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let tn=!1;function nn(){return K===null?te:1}let F=n;function rn(S,U){return t.getContext(S,U)}let st,ot,ge,St,Pe,Ie,w,M,z,ie,ee,oe,fe,Y,Z,ue,P,J,$,he,se,le,Ae;try{const S={alpha:!0,depth:r,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Lo}`),t.addEventListener("webglcontextlost",Ce,!1),t.addEventListener("webglcontextrestored",Oe,!1),t.addEventListener("webglcontextcreationerror",_e,!1),F===null){const U="webgl2";if(F=rn(U,S),F===null)throw rn(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Be()}catch(S){throw t.removeEventListener("webglcontextlost",Ce,!1),t.removeEventListener("webglcontextrestored",Oe,!1),t.removeEventListener("webglcontextcreationerror",_e,!1),Ze("WebGLRenderer: "+S.message),S}function Be(){st=new qm(F),st.init(),se=new I0(F,st),ot=new Um(F,st,e,se),ge=new L0(F,st),ot.reversedDepthBuffer&&h&&ge.buffers.depth.setReversed(!0),V=F.createFramebuffer(),L=F.createFramebuffer(),G=F.createFramebuffer(),St=new Km(F),Pe=new _0,Ie=new D0(F,st,ge,Pe,ot,se,St),w=new Xm(R),M=new jd(F),le=new Im(F,M),z=new $m(F,M,St,le),ie=new Zm(F,z,M,le,St),J=new jm(F,ot,Ie),Z=new Fm(Pe),ee=new g0(R,w,st,ot,le,Z),oe=new z0(R,Pe),fe=new x0,Y=new T0(st),P=new Dm(R,w,ge,ie,_,l),ue=new P0(R,ie,ot),Ae=new k0(F,St,ot,ge),$=new Nm(F,st,St),he=new Ym(F,st,St),St.programs=ee.programs,R.capabilities=ot,R.extensions=st,R.properties=Pe,R.renderLists=fe,R.shadowMap=ue,R.state=ge,R.info=St}x!==un&&(C=new Qm(x,t.width,t.height,o,r,a));const re=new O0(R,F);this.xr=re,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const S=st.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=st.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(S){S!==void 0&&(te=S,this.setSize(me,be,!1))},this.getSize=function(S){return S.set(me,be)},this.setSize=function(S,U,q=!0){if(re.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}me=S,be=U,t.width=Math.floor(S*te),t.height=Math.floor(U*te),q===!0&&(t.style.width=S+"px",t.style.height=U+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set(me*te,be*te).floor()},this.setDrawingBufferSize=function(S,U,q){me=S,be=U,te=q,t.width=Math.floor(S*q),t.height=Math.floor(U*q),this.setViewport(0,0,S,U)},this.setEffects=function(S){if(x===un){Ze("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let U=0;U<S.length;U++)if(S[U].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(Q)},this.getViewport=function(S){return S.copy(Te)},this.setViewport=function(S,U,q,B){S.isVector4?Te.set(S.x,S.y,S.z,S.w):Te.set(S,U,q,B),ge.viewport(Q.copy(Te).multiplyScalar(nn()).round())},this.getScissor=function(S){return S.copy(Ye)},this.setScissor=function(S,U,q,B){S.isVector4?Ye.set(S.x,S.y,S.z,S.w):Ye.set(S,U,q,B),ge.scissor(ae.copy(Ye).multiplyScalar(nn()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(S){ge.setScissorTest(Ke=S)},this.setOpaqueSort=function(S){Re=S},this.setTransparentSort=function(S){Ge=S},this.getClearColor=function(S){return S.copy(P.getClearColor())},this.setClearColor=function(){P.setClearColor(...arguments)},this.getClearAlpha=function(){return P.getClearAlpha()},this.setClearAlpha=function(){P.setClearAlpha(...arguments)},this.clear=function(S=!0,U=!0,q=!0){let B=0;if(S){let k=!1;if(K!==null){const pe=K.texture.format;k=m.has(pe)}if(k){const pe=K.texture.type,Me=f.has(pe),de=P.getClearColor(),xe=P.getClearAlpha(),Ee=de.r,Ne=de.g,Ve=de.b;Me?(v[0]=Ee,v[1]=Ne,v[2]=Ve,v[3]=xe,F.clearBufferuiv(F.COLOR,0,v)):(E[0]=Ee,E[1]=Ne,E[2]=Ve,E[3]=xe,F.clearBufferiv(F.COLOR,0,E))}else B|=F.COLOR_BUFFER_BIT}U&&(B|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(B|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B!==0&&F.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),O=S},this.dispose=function(){t.removeEventListener("webglcontextlost",Ce,!1),t.removeEventListener("webglcontextrestored",Oe,!1),t.removeEventListener("webglcontextcreationerror",_e,!1),P.dispose(),fe.dispose(),Y.dispose(),Ie.dispose(),Pe.dispose(),w.dispose(),ie.dispose(),z.dispose(),le.dispose(),Ae.dispose(),ee.dispose(),re.dispose(),re.removeEventListener("sessionstart",nl),re.removeEventListener("sessionend",il),ui.stop()};function Ce(S){S.preventDefault(),Ua("WebGLRenderer: Context Lost."),D=!0}function Oe(){Ua("WebGLRenderer: Context Restored."),D=!1;const S=St.autoReset,U=ue.enabled,q=ue.autoUpdate,B=ue.needsUpdate,k=ue.type;Be(),St.autoReset=S,ue.enabled=U,ue.autoUpdate=q,ue.needsUpdate=B,ue.type=k}function _e(S){Ze("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function et(S){const U=S.target;U.removeEventListener("dispose",et),At(U)}function At(S){Yn(S),Pe.remove(S)}function Yn(S){const U=Pe.get(S).programs;U!==void 0&&(U.forEach(function(q){ee.releaseProgram(q)}),S.isShaderMaterial&&ee.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,q,B,k,pe){U===null&&(U=Mt);const Me=k.isMesh&&k.matrixWorld.determinantAffine()<0,de=qu(S,U,q,B,k);ge.setMaterial(B,Me);let xe=q.index,Ee=1;if(B.wireframe===!0){if(xe=z.getWireframeAttribute(q),xe===void 0)return;Ee=2}const Ne=q.drawRange,Ve=q.attributes.position;let Se=Ne.start*Ee,We=(Ne.start+Ne.count)*Ee;pe!==null&&(Se=Math.max(Se,pe.start*Ee),We=Math.min(We,(pe.start+pe.count)*Ee)),xe!==null?(Se=Math.max(Se,0),We=Math.min(We,xe.count)):Ve!=null&&(Se=Math.max(Se,0),We=Math.min(We,Ve.count));const pt=We-Se;if(pt<0||pt===1/0)return;le.setup(k,B,de,q,xe);let nt,tt=$;if(xe!==null&&(nt=M.get(xe),tt=he,tt.setIndex(nt)),k.isMesh)B.wireframe===!0?(ge.setLineWidth(B.wireframeLinewidth*nn()),tt.setMode(F.LINES)):tt.setMode(F.TRIANGLES);else if(k.isLine){let Lt=B.linewidth;Lt===void 0&&(Lt=1),ge.setLineWidth(Lt*nn()),k.isLineSegments?tt.setMode(F.LINES):k.isLineLoop?tt.setMode(F.LINE_LOOP):tt.setMode(F.LINE_STRIP)}else k.isPoints?tt.setMode(F.POINTS):k.isSprite&&tt.setMode(F.TRIANGLES);if(k.isBatchedMesh)if(st.get("WEBGL_multi_draw"))tt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Lt=k._multiDrawStarts,ye=k._multiDrawCounts,kt=k._multiDrawCount,Je=xe?M.get(xe).bytesPerElement:1,hi=Pe.get(B).currentProgram.getUniforms();for(let Dt=0;Dt<kt;Dt++)hi.setValue(F,"_gl_DrawID",Dt),tt.render(Lt[Dt]/Je,ye[Dt])}else if(k.isInstancedMesh)tt.renderInstances(Se,pt,k.count);else if(q.isInstancedBufferGeometry){const Lt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ye=Math.min(q.instanceCount,Lt);tt.renderInstances(Se,pt,ye)}else tt.render(Se,pt)};function tl(S,U,q,B){O!==null&&S.isNodeMaterial&&O.setObject(B,S),ut===!0&&Z.setState(S,q,!1),S.transparent===!0&&S.side===Mn&&S.forceSinglePass===!1?(S.side=Wt,S.needsUpdate=!0,sr(S,U,B),S.side=Si,S.needsUpdate=!0,sr(S,U,B),S.side=Mn):sr(S,U,B)}this.compile=function(S,U,q=null){q===null&&(q=S),O!==null&&O.renderStart(S,U,q),T=Y.get(q),T.init(U),b.push(T),q.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(T.pushLight(k),k.castShadow&&T.pushShadow(k))}),S!==q&&S.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(T.pushLight(k),k.castShadow&&T.pushShadow(k))}),T.setupLights(),O!==null&&O.updateLights(T.state.lightsArray),Tt=this.localClippingEnabled,ut=Z.init(this.clippingPlanes,Tt),ut===!0&&Z.setGlobalState(this.clippingPlanes,U),O!==null&&ue.render(T.state.shadowsArray,q,U);const B=new Set;return S.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const pe=k.material;if(pe)if(Array.isArray(pe))for(let Me=0;Me<pe.length;Me++){const de=pe[Me];tl(de,q,U,k),B.add(de)}else tl(pe,q,U,k),B.add(pe)}),T=b.pop(),O!==null&&O.renderEnd(),B},this.compileAsync=function(S,U,q=null){const B=this.compile(S,U,q);return new Promise(k=>{function pe(){if(B.forEach(function(Me){const xe=Pe.get(Me).currentProgram;(xe===void 0||xe.isReady())&&B.delete(Me)}),B.size===0){k(S);return}setTimeout(pe,10)}st.get("KHR_parallel_shader_compile")!==null?pe():setTimeout(pe,10)})};let ns=null;function Wu(S){ns&&ns(S)}function nl(){ui.stop()}function il(){ui.start()}const ui=new Su;ui.setAnimationLoop(Wu),typeof self<"u"&&ui.setContext(self),this.setAnimationLoop=function(S){ns=S,re.setAnimationLoop(S),S===null?ui.stop():ui.start()},re.addEventListener("sessionstart",nl),re.addEventListener("sessionend",il),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){Ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;O!==null&&O.renderStart(S,U);const q=re.enabled===!0&&re.isPresenting===!0,B=C!==null&&(K===null||q)&&C.begin(R,K);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(re.cameraAutoUpdate===!0&&re.updateCamera(U),U=re.getCamera()),S.isScene===!0&&S.onBeforeRender(R,S,U,K),T=Y.get(S,b.length),T.init(U),T.state.textureUnits=Ie.getTextureUnits(),b.push(T),it.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera?bt.setFromArrayCamera(U):ke.setFromProjectionMatrix(it,yn,U.reversedDepth),Tt=this.localClippingEnabled,ut=Z.init(this.clippingPlanes,Tt),A=fe.get(S,g.length),A.init(),g.push(A),this.info.render.frame++,re.enabled===!0&&re.isPresenting===!0){const Me=R.xr.getDepthSensingMesh();Me!==null&&is(Me,U,-1/0,R.sortObjects)}is(S,U,0,R.sortObjects),A.finish(),O!==null&&O.updateLights(T.state.lightsArray),R.sortObjects===!0&&A.sort(Re,Ge),tn=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,tn&&P.addToRenderList(A,S),this.info.autoReset===!0&&this.info.reset(),ut===!0&&Z.beginShadows();const k=T.state.shadowsArray;if(ue.render(k,S,U),ut===!0&&Z.endShadows(),(B&&C.hasRenderPass())===!1){const Me=A.opaque,de=A.transmissive;if(T.setupLights(),U.isArrayCamera){const xe=U.cameras;if(de.length>0)for(let Ee=0,Ne=xe.length;Ee<Ne;Ee++){const Ve=xe[Ee];al(Me,de,S,Ve)}tn&&P.render(S);for(let Ee=0,Ne=xe.length;Ee<Ne;Ee++){const Ve=xe[Ee];rl(A,S,Ve,Ve.viewport)}}else de.length>0&&al(Me,de,S,U),tn&&P.render(S),rl(A,S,U)}K!==null&&N===0&&(Ie.updateMultisampleRenderTarget(K),Ie.updateRenderTargetMipmap(K)),B&&C.end(R),S.isScene===!0&&S.onAfterRender(R,S,U),le.resetDefaultState(),W=-1,j=null,b.pop(),b.length>0?(T=b[b.length-1],Ie.setTextureUnits(T.state.textureUnits),ut===!0&&Z.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,g.pop(),g.length>0?A=g[g.length-1]:A=null,O!==null&&O.renderEnd()};function is(S,U,q,B){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLight)T.pushLight(S),S.castShadow&&T.pushShadow(S);else if(S.isSprite){const Me=U.isArrayCamera?bt:ke;if(!S.frustumCulled||S.intersectsFrustum(Me)){B&&He.setFromMatrixPosition(S.matrixWorld).applyMatrix4(it);const de=ie.update(S),xe=S.material;xe.visible&&A.push(S,de,xe,q,He.z,null,U)}}else if(S.isMesh||S.isLine||S.isPoints){const Me=U.isArrayCamera?bt:ke;if(!S.frustumCulled||S.intersectsFrustum(Me)){const de=ie.update(S),xe=S.material;if(B&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),He.copy(S.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),He.copy(de.boundingSphere.center)),He.applyMatrix4(S.matrixWorld).applyMatrix4(it)),Array.isArray(xe)){const Ee=de.groups;for(let Ne=0,Ve=Ee.length;Ne<Ve;Ne++){const Se=Ee[Ne],We=xe[Se.materialIndex];We&&We.visible&&A.push(S,de,We,q,He.z,Se,U)}}else xe.visible&&A.push(S,de,xe,q,He.z,null,U)}}}const pe=S.children;for(let Me=0,de=pe.length;Me<de;Me++)is(pe[Me],U,q,B)}function rl(S,U,q,B){const{opaque:k,transmissive:pe,transparent:Me}=S;T.setupLightsView(q),ut===!0&&Z.setGlobalState(R.clippingPlanes,q),B&&ge.viewport(Q.copy(B)),k.length>0&&Fr(k,U,q),pe.length>0&&Fr(pe,U,q),Me.length>0&&Fr(Me,U,q),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function al(S,U,q,B){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[B.id]===void 0){const Se=st.has("EXT_color_buffer_half_float")||st.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[B.id]=new qt(1,1,{generateMipmaps:!0,type:Se?Xt:un,minFilter:ri,samples:Math.max(4,ot.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const pe=T.state.transmissionRenderTarget[B.id],Me=B.viewport||Q;pe.setSize(Me.z*R.transmissionResolutionScale,Me.w*R.transmissionResolutionScale);const de=R.getRenderTarget(),xe=R.getActiveCubeFace(),Ee=R.getActiveMipmapLevel();R.setRenderTarget(pe),R.getClearColor(H),ne=R.getClearAlpha(),ne<1&&R.setClearColor(16777215,.5),R.clear(),tn&&P.render(q);const Ne=R.toneMapping;R.toneMapping=qn;const Ve=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),T.setupLightsView(B),ut===!0&&Z.setGlobalState(R.clippingPlanes,B),Fr(S,q,B),Ie.updateMultisampleRenderTarget(pe),Ie.updateRenderTargetMipmap(pe),st.has("WEBGL_multisampled_render_to_texture")===!1){let Se=!1;for(let We=0,pt=U.length;We<pt;We++){const nt=U[We],{object:tt,geometry:Lt,material:ye,group:kt}=nt;if(ye.side===Mn&&tt.layers.test(B.layers)){const Je=ye.side;ye.side=Wt,ye.needsUpdate=!0,sl(tt,q,B,Lt,ye,kt),ye.side=Je,ye.needsUpdate=!0,Se=!0}}Se===!0&&(Ie.updateMultisampleRenderTarget(pe),Ie.updateRenderTargetMipmap(pe))}R.setRenderTarget(de,xe,Ee),R.setClearColor(H,ne),Ve!==void 0&&(B.viewport=Ve),R.toneMapping=Ne}function Fr(S,U,q){const B=U.isScene===!0?U.overrideMaterial:null;for(let k=0,pe=S.length;k<pe;k++){const Me=S[k],{object:de,geometry:xe,group:Ee}=Me;let Ne=Me.material;Ne.allowOverride===!0&&B!==null&&(Ne=B),de.layers.test(q.layers)&&sl(de,U,q,xe,Ne,Ee)}}function sl(S,U,q,B,k,pe){O!==null&&k.isNodeMaterial&&O.setObject(S,k),S.onBeforeRender(R,U,q,B,k,pe),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),k.onBeforeRender(R,U,q,B,S,pe),k.transparent===!0&&k.side===Mn&&k.forceSinglePass===!1?(k.side=Wt,k.needsUpdate=!0,R.renderBufferDirect(q,U,B,k,S,pe),k.side=Si,k.needsUpdate=!0,R.renderBufferDirect(q,U,B,k,S,pe),k.side=Mn):R.renderBufferDirect(q,U,B,k,S,pe),S.onAfterRender(R,U,q,B,k,pe)}function ol(S){let U=0;for(const q of S)q.texture!==null&&U++;return U}function sr(S,U,q){U.isScene!==!0&&(U=Mt);const B=Pe.get(S),k=T.state.lights,pe=T.state.shadowsArray,Me=k.state.version,de=ee.getParameters(S,k.state,pe,U,q,T.state.lightProbeGridArray),xe=ee.getProgramCacheKey(de);let Ee=B.programs;B.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?U.environment:null,B.fog=U.fog;const Ne=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;B.envMap=w.get(S.envMap||B.environment,Ne),B.envMapRotation=B.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Ee===void 0&&(S.addEventListener("dispose",et),Ee=new Map,B.programs=Ee,B.programVariants=new Map);let Ve=Ee.get(xe);if(Ve!==void 0){if(B.currentProgram===Ve&&B.lightsStateVersion===Me)return cl(S,de),Ve}else de.uniforms=ee.getUniforms(S),O!==null&&S.isNodeMaterial&&O.build(S,q,de),S.onBeforeCompile(de,R),Ve=ee.acquireProgram(de,xe),Ee.set(xe,Ve),B.uniforms=de.uniforms;const Se=B.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Se.clippingPlanes=Z.uniform),cl(S,de),B.needsLights=Yu(S),B.lightsStateVersion=Me,B.needsLights&&(Se.ambientLightColor.value=k.state.ambient,Se.lightProbe.value=k.state.probe,Se.sunLights.value=k.state.sun,Se.sunLightShadows.value=k.state.sunShadow,Se.directionalLights.value=k.state.directional,Se.directionalLightShadows.value=k.state.directionalShadow,Se.spotLights.value=k.state.spot,Se.spotLightShadows.value=k.state.spotShadow,Se.rectAreaLights.value=k.state.rectArea,Se.ltc_1.value=k.state.rectAreaLTC1,Se.ltc_2.value=k.state.rectAreaLTC2,Se.pointLights.value=k.state.point,Se.pointLightShadows.value=k.state.pointShadow,Se.hemisphereLights.value=k.state.hemi,Se.sunShadowMatrix.value=k.state.sunShadowMatrix,Se.sunShadowCascade.value=k.state.sunShadowCascade,Se.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Se.spotLightMatrix.value=k.state.spotLightMatrix,Se.spotLightMap.value=k.state.spotLightMap,Se.pointShadowMatrix.value=k.state.pointShadowMatrix),B.numLightProbeGrids=ol(T.state.lightProbeGridArray),B.currentProgram=Ve,B.uniformsList=null,Ve}function Xu(S,U,q,B,k){const pe=Pe.get(S),Me=pe.currentProgram.id+","+B+","+k;let de=pe.programVariants.get(Me);return de===void 0?(de=sr(S,U,q),pe.programVariants.set(Me,de)):(pe.currentProgram=de,pe.uniformsList=null,pe.outputColorSpace=B,pe.toneMapping=k),de}function ll(S){if(S.uniformsList===null){const U=S.currentProgram.getUniforms();S.uniformsList=ya.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function cl(S,U){const q=Pe.get(S);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function qu(S,U,q,B,k){U.isScene!==!0&&(U=Mt),Ie.resetTextureUnits();const pe=U.fog,Me=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?U.environment:null,de=K===null?R.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:Xe.workingColorSpace,xe=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap,Ee=w.get(B.envMap||Me,xe),Ne=B.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Ve=!!q.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Se=!!q.morphAttributes.position,We=!!q.morphAttributes.normal,pt=!!q.morphAttributes.color;let nt=qn;B.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(nt=R.toneMapping);const tt=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Lt=tt!==void 0?tt.length:0,ye=Pe.get(B),kt=T.state.lights;if(ut===!0&&(Tt===!0||S!==j)){const ct=S===j&&B.id===W;Z.setState(B,S,ct)}let Je=!1,hi=!1;B.version===ye.__version?ye.needsLights&&ye.lightsStateVersion!==kt.state.version||k.isBatchedMesh&&ye.batching===!1||!k.isBatchedMesh&&ye.batching===!0||k.isBatchedMesh&&ye.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&ye.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&ye.instancing===!1||!k.isInstancedMesh&&ye.instancing===!0||k.isSkinnedMesh&&ye.skinning===!1||!k.isSkinnedMesh&&ye.skinning===!0||k.isInstancedMesh&&ye.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&ye.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&ye.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&ye.instancingMorph===!1&&k.morphTexture!==null||ye.envMap!==Ee||B.fog===!0&&ye.fog!==pe||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Z.numPlanes||ye.numIntersection!==Z.numIntersection)||ye.vertexAlphas!==Ne||ye.vertexTangents!==Ve||ye.morphTargets!==Se||ye.morphNormals!==We||ye.morphColors!==pt||ye.morphTargetsCount!==Lt||ye.numLightProbeGrids!==ol(T.state.lightProbeGridArray)?Je=!0:(ye.outputColorSpace!==de||ye.toneMapping!==nt)&&(hi=!0):(Je=!0,ye.__version=B.version);let Dt=ye.currentProgram;(Je===!0||hi===!0)&&(Dt=hi===!0?Xu(B,U,k,de,nt):sr(B,U,k),O&&B.isNodeMaterial&&O.onUpdateProgram(B,Dt,ye));let Or=!1,Kn=!1,di=!1;const je=Dt.getUniforms(),Ct=ye.uniforms;if(ge.useProgram(Dt.program)&&(Or=!0,Kn=!0,di=!0),B.id!==W&&(W=B.id,Kn=!0),Or||j!==S){ge.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),je.setValue(F,"projectionMatrix",S.projectionMatrix),je.setValue(F,"viewMatrix",S.matrixWorldInverse);const wt=je.map.cameraPosition;wt!==void 0&&wt.setValue(F,en.setFromMatrixPosition(S.matrixWorld)),ot.logarithmicDepthBuffer&&je.setValue(F,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&je.setValue(F,"isOrthographic",S.isOrthographicCamera===!0),j!==S&&(j=S,Kn=!0,di=!0)}if(ye.needsLights&&(kt.state.sunShadowMap.length>0&&je.setValue(F,"sunShadowMap",kt.state.sunShadowMap,Ie),kt.state.directionalShadowMap.length>0&&je.setValue(F,"directionalShadowMap",kt.state.directionalShadowMap,Ie),kt.state.spotShadowMap.length>0&&je.setValue(F,"spotShadowMap",kt.state.spotShadowMap,Ie),kt.state.pointShadowMap.length>0&&je.setValue(F,"pointShadowMap",kt.state.pointShadowMap,Ie)),k.isSkinnedMesh){je.setOptional(F,k,"bindMatrix"),je.setOptional(F,k,"bindMatrixInverse");const ct=k.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),je.setValue(F,"boneTexture",ct.boneTexture,Ie))}k.isBatchedMesh&&(je.setOptional(F,k,"batchingTexture"),je.setValue(F,"batchingTexture",k._matricesTexture,Ie),je.setOptional(F,k,"batchingIdTexture"),je.setValue(F,"batchingIdTexture",k._indirectTexture,Ie),je.setOptional(F,k,"batchingColorTexture"),k._colorsTexture!==null&&je.setValue(F,"batchingColorTexture",k._colorsTexture,Ie));const dn=q.morphAttributes;if((dn.position!==void 0||dn.normal!==void 0||dn.color!==void 0)&&J.update(k,q,Dt),(Kn||ye.receiveShadow!==k.receiveShadow)&&(ye.receiveShadow=k.receiveShadow,je.setValue(F,"receiveShadow",k.receiveShadow)),(B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial)&&B.envMap===null&&U.environment!==null&&(Ct.envMapIntensity.value=U.environmentIntensity),Ct.dfgLUT!==void 0&&(Ct.dfgLUT.value=H0()),Kn){if(je.setValue(F,"toneMappingExposure",R.toneMappingExposure),ye.needsLights&&$u(Ct,di),pe&&B.fog===!0&&oe.refreshFogUniforms(Ct,pe),oe.refreshMaterialUniforms(Ct,B,te,be,T.state.transmissionRenderTarget[S.id]),ye.needsLights&&ye.numLightProbeGrids>0){const ct=y;let wt=0;for(const Nn of T.state.lightProbeGridArray)Nn.texture!==null&&(ct.textures[wt]=Nn.texture,ct.min[wt]=Nn.boundingBox.min,ct.max[wt]=Nn.boundingBox.max,ct.resolution[wt]=Nn.resolution,wt++);for(const Nn in ct)ct[Nn].length=wt;Ct.probesSH.value=ct.textures,Ct.probesMin.value=ct.min,Ct.probesMax.value=ct.max,Ct.probesResolution.value=ct.resolution}ya.upload(F,ll(ye),Ct,Ie)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(ya.upload(F,ll(ye),Ct,Ie),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&je.setValue(F,"center",k.center),je.setValue(F,"modelViewMatrix",k.modelViewMatrix),je.setValue(F,"normalMatrix",k.normalMatrix),je.setValue(F,"modelMatrix",k.matrixWorld),B.uniformsGroups!==void 0){const ct=B.uniformsGroups;for(let wt=0,Nn=ct.length;wt<Nn;wt++){const hl=ct[wt];Ae.update(hl,Dt),Ae.bind(hl,Dt)}}return Dt}function $u(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.sunLights.needsUpdate=U,S.sunLightShadows.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function Yu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(S,U,q){const B=Pe.get(S);B.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1&&(B.__useRenderToTexture=!1),Pe.get(S.texture).__webglTexture=U,Pe.get(S.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:q,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,U){const q=Pe.get(S);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(S,U=0,q=0){K=S,X=U,N=q;let B=null,k=!1,pe=!1;if(S){const de=Pe.get(S);if(de.__useDefaultFramebuffer!==void 0){ge.bindFramebuffer(F.FRAMEBUFFER,de.__webglFramebuffer),Q.copy(S.viewport),ae.copy(S.scissor),ce=S.scissorTest,ge.viewport(Q),ge.scissor(ae),ge.setScissorTest(ce),W=-1;return}else if(de.__webglFramebuffer===void 0)Ie.setupRenderTarget(S);else if(de.__hasExternalTextures)Ie.rebindTextures(S,Pe.get(S.texture).__webglTexture,Pe.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Ne=S.depthTexture;if(de.__boundDepthTexture!==Ne){if(Ne!==null&&Pe.has(Ne)&&(S.width!==Ne.image.width||S.height!==Ne.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ie.setupDepthRenderbuffer(S)}}const xe=S.texture;(xe.isData3DTexture||xe.isDataArrayTexture||xe.isCompressedArrayTexture)&&(pe=!0);const Ee=Pe.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ee[U])?B=Ee[U][q]:B=Ee[U],k=!0):S.samples>0&&Ie.useMultisampledRTT(S)===!1?B=Pe.get(S).__webglMultisampledFramebuffer:Array.isArray(Ee)?B=Ee[q]:B=Ee,Q.copy(S.viewport),ae.copy(S.scissor),ce=S.scissorTest}else Q.copy(Te).multiplyScalar(te).floor(),ae.copy(Ye).multiplyScalar(te).floor(),ce=Ke;if(q!==0&&(B=V),ge.bindFramebuffer(F.FRAMEBUFFER,B)&&ge.drawBuffers(S,B),ge.viewport(Q),ge.scissor(ae),ge.setScissorTest(ce),k){const de=Pe.get(S.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+U,de.__webglTexture,q)}else if(pe){const de=U;for(let xe=0;xe<S.textures.length;xe++){const Ee=Pe.get(S.textures[xe]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+xe,Ee.__webglTexture,q,de)}}else if(S!==null&&q!==0){const de=Pe.get(S.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,de.__webglTexture,q)}W=-1};function ul(S){const U=Pe.get(S);return(U.__readFormat!==S.format||U.__readType!==S.type)&&(U.__readFormat=S.format,U.__readType=S.type,U.__formatReadable=ot.textureFormatReadable(S.format),U.__typeReadable=ot.textureTypeReadable(S.type)),U}this.readRenderTargetPixels=function(S,U,q,B,k,pe,Me,de=0){if(!(S&&S.isWebGLRenderTarget)){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Pe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Me!==void 0&&(xe=xe[Me],Array.isArray(xe)&&(xe=xe[0])),xe){ge.bindFramebuffer(F.FRAMEBUFFER,xe);try{const Ee=S.textures[de],Ne=Ee.format,Ve=Ee.type;S.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+de);const Se=ul(Ee);if(Se.__formatReadable===!1){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Se.__typeReadable===!1){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-B&&q>=0&&q<=S.height-k&&F.readPixels(U,q,B,k,se.convert(Ne),se.convert(Ve),pe)}finally{const Ee=K!==null?Pe.get(K).__webglFramebuffer:null;ge.bindFramebuffer(F.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(S,U,q,B,k,pe,Me,de=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=Pe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Me!==void 0&&(xe=xe[Me],Array.isArray(xe)&&(xe=xe[0])),xe)if(U>=0&&U<=S.width-B&&q>=0&&q<=S.height-k){ge.bindFramebuffer(F.FRAMEBUFFER,xe);const Ee=S.textures[de],Ne=Ee.format,Ve=Ee.type;S.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+de);const Se=ul(Ee);if(Se.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Se.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const We=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,We),F.bufferData(F.PIXEL_PACK_BUFFER,pe.byteLength,F.STREAM_READ),F.readPixels(U,q,B,k,se.convert(Ne),se.convert(Ve),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);const pt=K!==null?Pe.get(K).__webglFramebuffer:null;ge.bindFramebuffer(F.FRAMEBUFFER,pt);const nt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await od(F,nt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,We),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,pe),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(We),F.deleteSync(nt),pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,U=null,q=0){const B=Math.pow(2,-q),k=Math.floor(S.image.width*B),pe=Math.floor(S.image.height*B),Me=U!==null?U.x:0,de=U!==null?U.y:0;Ie.setTexture2D(S,0),F.copyTexSubImage2D(F.TEXTURE_2D,q,0,0,Me,de,k,pe),ge.unbindTexture()},this.copyTextureToTexture=function(S,U,q=null,B=null,k=0,pe=0){let Me,de,xe,Ee,Ne,Ve,Se,We,pt;const nt=S.isCompressedTexture?S.mipmaps[pe]:S.image;if(q!==null)Me=q.max.x-q.min.x,de=q.max.y-q.min.y,xe=q.isBox3?q.max.z-q.min.z:1,Ee=q.min.x,Ne=q.min.y,Ve=q.isBox3?q.min.z:0;else{const je=Math.pow(2,-k);Me=Math.floor(nt.width*je),de=Math.floor(nt.height*je),S.isDataArrayTexture?xe=nt.depth:S.isData3DTexture?xe=Math.floor(nt.depth*je):xe=1,Ee=0,Ne=0,Ve=0}B!==null?(Se=B.x,We=B.y,pt=B.z):(Se=0,We=0,pt=0);const tt=se.convert(U.format),Lt=se.convert(U.type);let ye;U.isData3DTexture?(Ie.setTexture3D(U,0),ye=F.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Ie.setTexture2DArray(U,0),ye=F.TEXTURE_2D_ARRAY):(Ie.setTexture2D(U,0),ye=F.TEXTURE_2D),ge.activeTexture(F.TEXTURE0),ge.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,U.flipY),ge.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),ge.pixelStorei(F.UNPACK_ALIGNMENT,U.unpackAlignment);const kt=ge.getParameter(F.UNPACK_ROW_LENGTH),Je=ge.getParameter(F.UNPACK_IMAGE_HEIGHT),hi=ge.getParameter(F.UNPACK_SKIP_PIXELS),Dt=ge.getParameter(F.UNPACK_SKIP_ROWS),Or=ge.getParameter(F.UNPACK_SKIP_IMAGES);ge.pixelStorei(F.UNPACK_ROW_LENGTH,nt.width),ge.pixelStorei(F.UNPACK_IMAGE_HEIGHT,nt.height),ge.pixelStorei(F.UNPACK_SKIP_PIXELS,Ee),ge.pixelStorei(F.UNPACK_SKIP_ROWS,Ne),ge.pixelStorei(F.UNPACK_SKIP_IMAGES,Ve);const Kn=S.isDataArrayTexture||S.isData3DTexture,di=U.isDataArrayTexture||U.isData3DTexture;if(S.isDepthTexture){const je=Pe.get(S),Ct=Pe.get(U),dn=Pe.get(je.__renderTarget),ct=Pe.get(Ct.__renderTarget);ge.bindFramebuffer(F.READ_FRAMEBUFFER,dn.__webglFramebuffer),ge.bindFramebuffer(F.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let wt=0;wt<xe;wt++)Kn&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Pe.get(S).__webglTexture,k,Ve+wt),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Pe.get(U).__webglTexture,pe,pt+wt)),F.blitFramebuffer(Ee,Ne,Ee+Me,Ne+de,Se,We,Se+Me,We+de,F.DEPTH_BUFFER_BIT,F.NEAREST);ge.bindFramebuffer(F.READ_FRAMEBUFFER,null),ge.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(k!==0||S.isRenderTargetTexture||Pe.has(S)){const je=Pe.get(S),Ct=Pe.get(U);ge.bindFramebuffer(F.READ_FRAMEBUFFER,L),ge.bindFramebuffer(F.DRAW_FRAMEBUFFER,G);for(let dn=0;dn<xe;dn++)Kn?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,je.__webglTexture,k,Ve+dn):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,je.__webglTexture,k),di?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Ct.__webglTexture,pe,pt+dn):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Ct.__webglTexture,pe),k!==0?F.blitFramebuffer(Ee,Ne,Ee+Me,Ne+de,Se,We,Se+Me,We+de,F.COLOR_BUFFER_BIT,F.NEAREST):di?F.copyTexSubImage3D(ye,pe,Se,We,pt+dn,Ee,Ne,Me,de):F.copyTexSubImage2D(ye,pe,Se,We,Ee,Ne,Me,de);ge.bindFramebuffer(F.READ_FRAMEBUFFER,null),ge.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else di?S.isDataTexture||S.isData3DTexture?F.texSubImage3D(ye,pe,Se,We,pt,Me,de,xe,tt,Lt,nt.data):U.isCompressedArrayTexture?F.compressedTexSubImage3D(ye,pe,Se,We,pt,Me,de,xe,tt,nt.data):F.texSubImage3D(ye,pe,Se,We,pt,Me,de,xe,tt,Lt,nt):S.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,pe,Se,We,Me,de,tt,Lt,nt.data):S.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,pe,Se,We,nt.width,nt.height,tt,nt.data):F.texSubImage2D(F.TEXTURE_2D,pe,Se,We,Me,de,tt,Lt,nt);ge.pixelStorei(F.UNPACK_ROW_LENGTH,kt),ge.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Je),ge.pixelStorei(F.UNPACK_SKIP_PIXELS,hi),ge.pixelStorei(F.UNPACK_SKIP_ROWS,Dt),ge.pixelStorei(F.UNPACK_SKIP_IMAGES,Or),pe===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0&&F.generateMipmap(ye),ge.unbindTexture()},this.initRenderTarget=function(S){Pe.get(S).__webglFramebuffer===void 0&&Ie.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Ie.setTextureCube(S,0):S.isData3DTexture?Ie.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Ie.setTexture2DArray(S,0):Ie.setTexture2D(S,0),ge.unbindTexture()},this.resetState=function(){X=0,N=0,K=null,ge.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const Ea={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class rr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const W0=new Mu(-1,1,1,-1,0,1);class X0 extends ft{constructor(){super(),this.setAttribute("position",new at([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new at([0,2,0,0,2,0],2))}}const q0=new X0;class Jo{constructor(e){this._mesh=new xt(q0,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,W0)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class $0 extends rr{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof dt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Cr.clone(e.uniforms),this.material=new dt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Jo(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class bc extends rr{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const r=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let s,o;this.inverse?(s=0,o=1):(s=1,o=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),a.buffers.stencil.setFunc(r.ALWAYS,s,4294967295),a.buffers.stencil.setClear(o),a.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(r.EQUAL,1,4294967295),a.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),a.buffers.stencil.setLocked(!0)}}class Y0 extends rr{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class K0{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new we);this._width=n.width,this._height=n.height,t=new qt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Xt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new $0(Ea),this.copyPass.material.blending=Mi,this.timer=new $d}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let r=0,a=this.passes.length;r<a;r++){const s=this.passes[r];if(s.enabled!==!1){if(s.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),s.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),s.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}bc!==void 0&&(s instanceof bc?n=!0:s instanceof Y0&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new we);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const ma={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class j0 extends rr{constructor(){super(),this.isOutputPass=!0,this.uniforms=Cr.clone(ma.uniforms),this.material=new xu({name:ma.name,uniforms:this.uniforms,vertexShader:ma.vertexShader,fragmentShader:ma.fragmentShader}),this._fsQuad=new Jo(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Xe.getTransfer(this._outputColorSpace)===Qe&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Do?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Io?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===No?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===qa?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Fo?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Oo?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Uo&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Z0 extends rr{constructor(e,t,n=null,r=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new De}render(e,t,n){const r=e.autoClear;e.autoClear=!1;let a,s;this.overrideMaterial!==null&&(s=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=s),e.autoClear=r}}const J0={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new De(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class er extends rr{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e!==void 0?new we(e.x,e.y):new we(256,256),this.clearColor=new De(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),s=Math.round(this.resolution.y/2);this.renderTargetBright=new qt(a,s,{type:Xt,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const p=new qt(a,s,{type:Xt,depthBuffer:!1});p.texture.name="UnrealBloomPass.h"+u,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const h=new qt(a,s,{type:Xt,depthBuffer:!1});h.texture.name="UnrealBloomPass.v"+u,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),a=Math.round(a/2),s=Math.round(s/2)}const o=J0;this.highPassUniforms=Cr.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new dt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];a=Math.round(this.resolution.x/2),s=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new we(1/a,1/s),a=Math.round(a/2),s=Math.round(s/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Cr.clone(Ea.uniforms),this.blendMaterial=new dt({uniforms:this.copyUniforms,vertexShader:Ea.vertexShader,fragmentShader:Ea.fragmentShader,premultipliedAlpha:!0,blending:Sn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new De,this._oldClearAlpha=1,this._basic=new Oa,this._fsQuad=new Jo(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(n,r),this.renderTargetsVertical[a].setSize(n,r),this.separableBlurMaterials[a].uniforms.invSize.value=new we(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,t,n,r,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const s=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=er.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=er.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=s}_getSeparableBlurMaterial(e){const t=[],n=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(n*n))/n);const r=[],a=[];for(let s=1;s<e;s+=2){const o=t[s],l=s+1<e?t[s+1]:0,c=o+l;r.push((s*o+(s+1)*l)/c),a.push(c)}return new dt({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new we(.5,.5)},direction:{value:new we(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:a}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new dt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}er.BlurDirectionX=new we(1,0);er.BlurDirectionY=new we(0,1);function Mc(i,e){const t=new De(i);return t.multiplyScalar(e),t}const Q0={rock:{a:.62,b:.34,scale:1.4,bump:.05,spec:.08,shine:18,metal:0},iron:{a:.62,b:.4,scale:3,bump:.012,spec:.45,shine:55,metal:.8},ice:{a:.72,b:.5,scale:1.8,bump:.02,spec:.3,shine:70,metal:0},glass:{a:.7,b:.5,scale:2.5,bump:.004,spec:.55,shine:140,metal:0},hardPlastic:{a:.7,b:.55,scale:3,bump:.004,spec:.4,shine:120,metal:0},rubber:{a:.8,b:.6,scale:4,bump:.012,spec:.15,shine:14,metal:0},leatherCork:{a:.6,b:.5,scale:3.5,bump:.008,spec:.08,shine:10,metal:0},wood:{a:.85,b:.5,scale:2.2,bump:.02,spec:.12,shine:16,metal:0},concrete:{a:.7,b:.45,scale:3,bump:.03,spec:.04,shine:10,metal:0},ceramic:{a:.85,b:.7,scale:2,bump:.003,spec:.35,shine:90,metal:0},aluminum:{a:.7,b:.5,scale:3,bump:.008,spec:.4,shine:50,metal:.7},copper:{a:.7,b:.45,scale:3,bump:.01,spec:.45,shine:50,metal:.85},gold:{a:.85,b:.6,scale:3,bump:.006,spec:.55,shine:70,metal:.9},lead:{a:.6,b:.4,scale:3,bump:.01,spec:.2,shine:30,metal:.6},diamond:{a:.9,b:.7,scale:2,bump:.002,spec:.7,shine:200,metal:0},organic:{a:.8,b:.55,scale:3,bump:.006,spec:.12,shine:20,metal:0},gas:{a:1,b:.8,scale:.7,bump:0,spec:0,shine:10,metal:0},plasma:{a:1,b:.7,scale:1.1,bump:0,spec:0,shine:10,metal:0},degenerate:{a:1,b:.8,scale:1.5,bump:0,spec:0,shine:10,metal:0},singularity:{a:0,b:0,scale:1,bump:0,spec:0,shine:10,metal:0}},e_={earth:1,moon:2,mars:3,pluto:4,jupiter:5,saturn:5,hotJupiter:5,wasp12b:5,brownDwarf:5,neptune:6,uranus:6,kepler51d:6,stellarBH:9,cygnusX1:9,sgrA:9,m87:9,ton618:9,phoenixA:9,trillionBH:9,milkyWayBH:9,groupBH:9,virgoBH:9,laniakeaBH:9,universeBH:9,lmc:10,smc:10,m33:10,m51:10,milkyWay:10,andromeda:10,m87gal:10,ic1101:10,pleiades:11,omegaCen:11,localGroup:11,virgoSC:11,virgoCluster:11,coma:11,elGordo:11,laniakea:11,bootes:11,shapley:11,sloanWall:11,herculesWall:11,universe:11,tenTrillionBH:9,sombrero:10,cartwheel:10,centaurusA:10,westerlund1:11,perseus:11,bulletCluster:11,greatAttractor:11,piscesCetus:11,alarastraza:11,hyperUniverse:11,theFelon:11,giganaurus:11,mlti183:11,tremendous1500:11,grondeo:11,mar234:11,uuz435:11,meve1:11,phyve1:11,ulturuas:10,ring:12,helix:12,rosette:12,pillars:12,crab:12,orion:12,carina:12,tarantula:12};function Ta(i){return e_[i]??0}const t_={earth:[[.3,.24,.13],[.13,.17,.07]],moon:[[.3,.3,.3],[.15,.15,.15]],mars:[[.5,.22,.1],[.24,.11,.07]],pluto:[[.5,.42,.35],[.28,.2,.16]]},n_={snowball:["#f4f8fb","#cfdbe6"],watermelon:["#3f8a3a","#1f5a28","#e0354a"],pumpkin:["#e8761d","#b4510f","#f2a53a"],egg:["#f2e6cf","#d9c7a6","#f5c542"],lightBulb:["#e8f1f4","#c4d6dc"],rubberDuck:["#ffd21f","#e0a800","#f7c600"],soccerBall:["#f4f4f4","#2a2a2a","#ddd"],basketball:["#d9712b","#8a3f12","#a84e18"],tennisBall:["#d5e83a","#a8bd1d","#b9cc2a"],golfBall:["#f6f6f2","#d8d8d2"],pingPong:["#f6f2e8","#e2d9c0"],brick:["#b4533a","#7d3524","#8a3a28"],bullet:["#b8742f","#7a4a1e","#5a5f66"],car:["#c4262e","#7e151c"],bus:["#f4b81c","#c48a0c"],boeing:["#ececec","#b9c2cc"],shuttle:["#efefef","#8a8d92"],iss:["#e6e6e6","#c9a64a"],titanic:["#26292e","#14161a","#6a2a1c"],eiffel:["#7d6a52","#4e4130"],liberty:["#5fae98","#3c7f70","#b46a3a"],empire:["#aaa9a2","#767670"],pyramid:["#cfb27a","#8f7648"],house:["#d9c9a3","#8b6b43"],chelyabinsk:["#4a443f","#26221f"],tunguska:["#6b625a","#3a342f"],apophis:["#6e6962","#3b3834"],bennu:["#3d3c3b","#1f1e1e"],ryugu:["#403f3e","#222120"],oumuamua:["#7a3d28","#3c1c12"],halley:["#2f2d2c","#161514"],eros:["#7b6a58","#40362c"],enceladus:["#f4f9fc","#d2e2ee"],phobos:["#6a5f55","#35302b"],vesta:["#9a9187","#554f48"],ceres:["#8b8a86","#4b4a47"],charon:["#8f8680","#4d4642"],triton:["#d9c9c2","#9c8a83"],europa:["#e6dfd2","#a1704f"],io:["#e6d24a","#b44d1c"],titan:["#c98a3a","#7d4d1a"],callisto:["#5c5148","#2c2621"],ganymede:["#8f8780","#4e4843"],mercury:["#8c8782","#4a4743"],venus:["#e1c58a","#a0793a"],kepler452b:["#6f8f4f","#3a5a45"],cancri55e:["#ff7a1c","#2a0f08"],proximab:["#9a5a3c","#3f2418"],superEarth:["#5d7a8a","#2e4a52"],kepler10c:["#7a5f8a","#3c2d4a"],gj1214b:["#7fb2c9","#3d6f8a"],kepler51d:["#e9c8a8","#c99c8a"],neptune:["#5b86e8","#2e49a8"],uranus:["#bfeaf0","#8ecdd6"],saturn:["#ead9a8","#b69a64"],jupiter:["#ecd9b8","#a9693f"],hotJupiter:["#3b4fb8","#1c2260"],wasp12b:["#2a2230","#6b1d14"],brownDwarf:["#a64d79","#4a1c3a"],proximaCen:["#ff7a45","#a8260f"],trappist1:["#ff8a4a","#b53a12"],barnard:["#ff8e52","#b8421a"],sun:["#ffd070","#ff8a1c"],sirius:["#cfe0ff","#8fb2ff"],vega:["#c4d6ff","#86a8ff"],siriusB:["#dfe9ff","#a9c3ff"],neutronStar:["#d8e6ff","#8fb0ff"],pollux:["#ffc067","#d9791e"],arcturus:["#ffb067","#d3601a"],aldebaran:["#ff9d52","#c24a12"],rigel:["#cfe0ff","#7fa6ff"],antares:["#ff6a3a","#a01a0a"],betelgeuse:["#ff7a3d","#b22a0c"],vycma:["#ff6a45","#8e1408"],uyScuti:["#ff6e3a","#951a08"],stephenson218:["#ff6a3a","#7e1006"],r136a1:["#b4ccff","#6f98ff"],stellarBH:["#000000","#000000"],cygnusX1:["#000000","#000000"],sgrA:["#000000","#000000"],m87:["#000000","#000000"],ton618:["#000000","#000000"],phoenixA:["#000000","#000000"],trillionBH:["#000000","#000000"],milkyWayBH:["#000000","#000000"],groupBH:["#000000","#000000"],virgoBH:["#000000","#000000"],laniakeaBH:["#000000","#000000"],universeBH:["#000000","#000000"],lmc:["#ffe9c4","#8fb2ff"],smc:["#ffe0b0","#8aa8ff"],m33:["#ffe9c4","#7fa6ff"],m51:["#ffeccc","#6f98ff"],milkyWay:["#ffe2a8","#86a8ff"],andromeda:["#ffdca0","#9ab4ff"],m87gal:["#ffe3a8","#d8b070"],ic1101:["#ffd890","#c89858"],pleiades:["#cfe0ff","#16264a"],omegaCen:["#ffe8b0","#3a2c18"],localGroup:["#ffe9c4","#241a3d"],virgoSC:["#ffe9c4","#2a1d4a"],virgoCluster:["#ffe0a8","#34224a"],coma:["#ffd9a0","#3a2540"],elGordo:["#ffd098","#46233a"],laniakea:["#ffe9c4","#241a4a"],bootes:["#9fb4ff","#080a1a"],shapley:["#ffe0b0","#3a2250"],sloanWall:["#ffe9c4","#2a1d4a"],herculesWall:["#dfe6ff","#1f1a4a"],universe:["#ffffff","#2a1a5a"],tenTrillionBH:["#000000","#000000"],sombrero:["#ffe6b0","#9ab0e8"],cartwheel:["#fff0d0","#7fb0ff"],centaurusA:["#ffd9a0","#c8a878"],westerlund1:["#cfe0ff","#1a2250"],perseus:["#ffd9a0","#46233a"],bulletCluster:["#ffe0b0","#3a1e48"],greatAttractor:["#ffe9c4","#301f50"],piscesCetus:["#ffe9c4","#251a4a"],ring:["#8fe8ff","#ff6a5a"],helix:["#6fb8ff","#ff9a5a"],rosette:["#ff5a7a","#4a2a6a"],grb:["#c8a0ff","#6a2fd0"],supernova:["#ffb060","#d04010"],hypernova:["#a0c8ff","#2050d0"],bigBang:["#ffffff","#ffd9a0"],strangeOrb:["#7dff9a","#0a8f3c","#caffd8"],antiBubble:["#101018","#000000","#334466"],antiGravityOrb:["#c9b6ff","#2a0f6e","#e8f4ff"],atomicBreath:["#ffd9ff","#ff4fd8","#ff9af0"],alarastraza:["#ffffff","#2a1a5a"],hawkramenshon:["#d9a0ff","#7a2fd0"],hyperUniverse:["#ffffff","#301a6a"],theFelon:["#ff9a6a","#3a1550"],giganaurus:["#ffd9a0","#3a1e5a"],mlti183:["#c8d8ff","#1a2860"],ulturuas:["#ffd0e8","#a090ff"],tremendous1500:["#ffe0a0","#4a1a2a"],grondeo:["#a8ffd8","#143a3a"],mar234:["#ffb0e0","#40204a"],uuz435:["#ffee99","#4a3510"],meve1:["#9ad8ff","#10304f"],phyve1:["#ffffff","#4a0f3f"],pillars:["#ffb066","#3d1f2e"],crab:["#6fd6ff","#ff7a3d"],orion:["#ff6a9a","#3a5cff"],carina:["#ff8a7a","#2a4a9a"],tarantula:["#ff5a8a","#5a2a7a"]},i_={rock:[.42,.37,.33],iron:[.55,.57,.6],ice:[.8,.9,.95],glass:[.55,.75,.8],hardPlastic:[.35,.2,.6],rubber:[.45,.12,.08],leatherCork:[.55,.4,.25],wood:[.6,.42,.22],concrete:[.35,.35,.33],ceramic:[.8,.72,.55],aluminum:[.55,.57,.6],copper:[.6,.38,.22],gold:[.75,.55,.15],lead:[.3,.32,.35],diamond:[.7,.85,.95],organic:[.7,.12,.1],gas:[.8,.6,.4],plasma:[1,.7,.3],degenerate:[.8,.9,1],singularity:[0,0,0]};function tr(i,e){const t=Q0[i],n=rt[i].color,r={colorA:Mc(n,t.a),colorB:Mc(n,t.b),noiseScale:t.scale,bump:t.bump,spec:t.spec,shine:t.shine,metal:t.metal,inner:new De(...i_[i]),emissive:i==="plasma"||i==="degenerate"?1:0},a=e?n_[e]:void 0;a&&(r.colorA=new De(a[0]),r.colorB=new De(a[1]),a[2]&&(r.inner=new De(a[2])));const s=e?t_[e]:void 0;return s&&(r.colorA=new De(s[0][0],s[0][1],s[0][2]),r.colorB=new De(s[1][0],s[1][1],s[1][2])),r}function Ur(i){let e=i>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}const ar=`
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
// Rough blackbody ramp: dark red -> orange -> yellow -> white. Output is HDR so bloom picks it up.
vec3 heatColor(float h) {
  h = clamp(h, 0.0, 1.8);
  vec3 c = mix(vec3(0.0), vec3(0.45, 0.03, 0.0), smoothstep(0.0, 0.3, h));
  c = mix(c, vec3(1.0, 0.30, 0.02), smoothstep(0.25, 0.7, h));
  c = mix(c, vec3(1.0, 0.75, 0.35), smoothstep(0.65, 1.1, h));
  c = mix(c, vec3(1.0, 0.97, 0.85), smoothstep(1.05, 1.6, h));
  return c * (0.35 + 1.9 * h);
}
`,Iu=new I(-.78,.38,.5).normalize(),r_=`
attribute vec3 aBase;
attribute float aHeat;
attribute float aAO;
attribute float aRho;
attribute float aInner;
varying float vInner;
varying vec3 vW;
varying vec3 vN;
varying vec3 vBase;
varying float vHeat;
varying float vAO;
varying float vRho;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
  vBase = aBase;
  vHeat = aHeat;
  vAO = aAO;
  vRho = aRho;
  vInner = aInner;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,a_=`
uniform vec3 uSun;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uNoiseScale;
uniform float uBump;
uniform float uSpec;
uniform float uShine;
uniform float uMetal;
uniform float uHeat;      // global multiplier on the heat attribute (cooling over time)
uniform float uHeatAdd;   // extra uniform heat (for whole bodies)
uniform float uTime;
uniform float uEdge;      // fade the patch out towards this arc radius
uniform vec3 uScarDir;
uniform float uScarAng;
uniform float uScarHeat;
uniform float uCharMix;
uniform int uPlanet;       // 0 generic, 1 Earth, 2 Moon, 3 Mars, 4 Pluto, 5 gas giant, 6 ice giant, 9 black hole
uniform float uEmissive;   // 1 = shines by itself (stars)
uniform vec3 uCenter;      // body centre in the same space as aBase
varying vec3 vW;
varying vec3 vN;
varying vec3 vBase;
varying float vHeat;
varying float vAO;
varying float vRho;
varying float vInner;
uniform vec3 uInner;
uniform vec4 uBubble;         // Anti-Bubble: xyz centre, w radius. Everything inside is deleted.
uniform float uStrangeAmt;    // 0..1, strange matter on or off
uniform vec3 uStrangeOrigin;  // where the change starts
uniform float uStrangeFront;  // how far it has spread
${ar}
void main() {
  if (uBubble.w > 0.0 && distance(vW, uBubble.xyz) < uBubble.w) discard;
  vec3 p = vBase * uNoiseScale;
  float n1 = fbm(p);
  float n2 = fbm(p * 3.7 + 11.0);
  float h = n1 * 0.7 + n2 * 0.3;
  float nIn = 0.0;
  if (vInner > 0.5) nIn = fbm(vBase * 14.0);
  h = mix(h, nIn, step(0.5, vInner));
  vec3 albedo = mix(uColorA, uColorB, smoothstep(0.3, 0.7, n1 * 0.65 + n2 * 0.35));

  float oceanMask = 0.0;
  float bumpK = 1.0;
  vec3 atmo = vec3(0.0);
  if (uPlanet > 0) {
    vec3 d = normalize(vBase - uCenter);
    float lat = abs(d.y);
    float rough = fbm(d * 9.0);
    if (uPlanet == 1) {
      float warp = fbm(d * 3.0 + vec3(3.1, 1.7, 5.3));
      float n = fbm(d * 2.4 + warp * 0.9 + 4.0);
      float land = smoothstep(0.50, 0.53, n);
      float moist = fbm(d * 3.0 + 9.0);
      vec3 desert = vec3(0.30, 0.22, 0.10);
      vec3 forest = vec3(0.025, 0.10, 0.025);
      vec3 grass = vec3(0.08, 0.17, 0.04);
      float wet = smoothstep(0.38, 0.55, moist + 0.25 * (1.0 - lat * 1.4));
      vec3 landC = mix(desert, mix(grass, forest, smoothstep(0.45, 0.7, moist)), wet);
      landC = mix(landC, vec3(0.2, 0.18, 0.15), smoothstep(0.58, 0.7, n) * smoothstep(0.4, 0.7, rough));
      vec3 ocean = mix(vec3(0.02, 0.11, 0.22), vec3(0.004, 0.02, 0.09), 1.0 - smoothstep(0.38, 0.5, n));
      albedo = mix(ocean, landC, land);
      float ice = smoothstep(0.80, 0.88, lat + 0.07 * (rough - 0.5));
      albedo = mix(albedo, vec3(0.75, 0.78, 0.8), ice);
      float cloud = smoothstep(0.52, 0.72, fbm(d * 3.2 + vec3(7.0, 2.0, 1.0) + warp)) * (1.0 - 0.3 * ice);
      albedo = mix(albedo, vec3(0.8), cloud * 0.85);
      oceanMask = (1.0 - land) * (1.0 - ice) * (1.0 - cloud);
      bumpK = land * (1.0 - cloud) * 0.25;
      atmo = vec3(0.18, 0.4, 1.0);
    } else if (uPlanet == 2) {
      float maria = smoothstep(0.52, 0.6, fbm(d * 1.7 + 2.0));
      albedo = vec3(0.30) * (0.75 + 0.5 * rough) * mix(1.0, 0.5, maria);
      albedo *= 0.85 + 0.3 * fbm(d * 24.0);
      bumpK = 0.6;
    } else if (uPlanet == 3) {
      float dark = smoothstep(0.45, 0.62, fbm(d * 2.0 + 5.0));
      albedo = mix(vec3(0.5, 0.22, 0.10), vec3(0.22, 0.11, 0.07), dark) * (0.8 + 0.4 * rough);
      albedo = mix(albedo, vec3(0.8), smoothstep(0.9, 0.95, lat));
      bumpK = 0.4;
      atmo = vec3(0.5, 0.25, 0.15) * 0.35;
    } else if (uPlanet == 5) {
      // Banded gas giant: latitude stripes wobbled by noise, plus one big storm.
      float warp = fbm(d * vec3(2.0, 5.0, 2.0) + 3.0);
      float band = sin((d.y + 0.10 * warp) * 17.0 + 3.5 * fbm(d * vec3(2.5, 1.2, 2.5)));
      float fine = fbm(d * vec3(4.0, 22.0, 4.0));
      float t = smoothstep(-0.7, 0.7, band + 0.9 * (fine - 0.5));
      albedo = mix(uColorB, uColorA, t) * (0.85 + 0.3 * rough);
      vec3 spot = normalize(vec3(0.62, -0.28, 0.73));
      float storm = smoothstep(0.2, 0.06, length(d - spot) * (1.0 + 0.5 * abs(d.y + 0.28)));
      albedo = mix(albedo, uColorB * vec3(1.25, 0.75, 0.65), storm * 0.85);
      bumpK = 0.0;
      atmo = uColorA * 0.3;
    } else if (uPlanet == 6) {
      // Smooth ice giant: faint broad bands and a hazy limb.
      float band = 0.5 + 0.35 * sin(d.y * 7.0 + 2.0 * fbm(d * 2.0 + 1.0)) + 0.25 * (fbm(d * vec3(3.0, 9.0, 3.0)) - 0.5);
      albedo = mix(uColorB, uColorA, smoothstep(0.2, 0.85, band));
      bumpK = 0.0;
      atmo = uColorA * 0.55;
    } else if (uPlanet >= 9) {
      albedo = vec3(0.0);
      bumpK = 0.0;
    } else {
      float heart = smoothstep(0.5, 0.62, fbm(d * 1.5 + 8.0));
      albedo = mix(vec3(0.42, 0.30, 0.22), vec3(0.8, 0.74, 0.66), heart) * (0.8 + 0.4 * rough);
      albedo = mix(albedo, vec3(0.2, 0.12, 0.09), smoothstep(0.16, 0.0, lat) * 0.6);
      bumpK = 0.3;
    }
  }

  if (vInner > 0.5) albedo = uInner * (0.45 + 0.5 * nIn) * 0.8;

  float scar = 0.0;
  if (uScarAng > 0.0) {
    float ang = acos(clamp(dot(normalize(vBase), uScarDir), -1.0, 1.0));
    scar = 1.0 - smoothstep(uScarAng * 0.75, uScarAng * 1.2, ang);
    albedo *= 1.0 - 0.6 * scar;
  }

  vec3 N = normalize(vN);
  vec3 sx = dFdx(vW);
  vec3 sy = dFdy(vW);
  vec3 r1 = cross(sy, N);
  vec3 r2 = cross(N, sx);
  float det = dot(sx, r1);
  float limb = smoothstep(0.02, 0.4, dot(N, normalize(cameraPosition - vW)));
  vec3 grad = sign(det) * limb * bumpK * (uBump * dFdx(h) * r1 + uBump * dFdy(h) * r2);
  vec3 Np = normalize(abs(det) * N - grad);

  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = max(dot(Np, L), 0.0);
  float terminator = smoothstep(0.0, 0.12, dot(N, L));
  vec3 H = normalize(L + V);
  float specAmt = mix(uSpec, 0.9, oceanMask) * mix(1.0, 0.3, step(0.5, vInner));
  float shineV = mix(uShine, 120.0, oceanMask);
  float spec = pow(max(dot(Np, H), 0.0), shineV) * specAmt * ndl * terminator;

  float ndv = max(dot(N, V), 0.0);
  float heat = vHeat * uHeat + uHeatAdd + uScarHeat * scar;
  albedo *= 1.0 - 0.55 * clamp(heat, 0.0, 1.0) * uCharMix;

  vec3 sky = vec3(0.09, 0.11, 0.16) * (0.55 + 0.45 * N.y);
  vec3 col = albedo * (sky + vec3(1.55, 1.5, 1.4) * ndl * terminator) * vAO;
  col += spec * mix(vec3(1.0), albedo * 2.0, uMetal) * vec3(1.55, 1.5, 1.4);

  col += atmo * pow(1.0 - ndv, 3.0) * (0.1 + 1.2 * smoothstep(-0.15, 0.4, dot(N, L)));

  if (heat > 0.001) {
    float flicker = 0.75 + 0.5 * fbm(p * 1.3 + vec3(0.0, uTime * 0.35, 0.0));
    col += heatColor(heat * flicker);
  }

  if (uEmissive > 0.5) {
    // A star shines by itself: churning granulation, darker towards the edge of the disc.
    float gran = fbm(vBase * uNoiseScale * 2.5 + vec3(0.0, uTime * 0.05, 0.0));
    float cells = smoothstep(0.3, 0.75, n1 * 0.45 + gran * 0.55);
    vec3 e = mix(uColorB, uColorA, cells);
    col = e * (0.45 + 0.75 * pow(max(ndv, 0.0), 0.6)) * 1.1;
  }
  if (uPlanet == 9) {
    // Black hole: nothing but the bent light of a hot ring hugging the edge of the disc.
    float rim = pow(1.0 - ndv, 6.0);
    col = vec3(1.0, 0.55, 0.18) * rim * 3.5 + vec3(1.0, 0.85, 0.6) * pow(1.0 - ndv, 18.0) * 3.0;
  }

  if (uPlanet >= 10) {
    // Things made of light: galaxies, star clusters, whole superclusters and nebulae, drawn as glowing discs.
    vec3 d = normalize(vBase - uCenter);
    float rim = smoothstep(0.0, 0.5, ndv);
    vec3 g = vec3(0.0);
    if (uPlanet == 10) {
      vec3 ax = normalize(vec3(0.0, 0.3, 0.95));
      vec3 u = normalize(cross(ax, vec3(0.0, 1.0, 0.0)));
      vec3 w = cross(ax, u);
      float x = dot(d, u);
      float y = dot(d, w);
      float r = length(vec2(x, y));
      float th = atan(y, x);
      float arms = pow(0.5 + 0.5 * cos(2.0 * (th - 5.5 * log(r + 0.08))), 1.4);
      float dust = fbm(vec3(x, y, 0.0) * 7.0 + 1.0);
      float disc = 1.0 - smoothstep(0.5, 0.95, r);
      float bulge = exp(-r * r * 20.0);
      float field = pow(fbm(d * 70.0), 5.0) * 6.0 * disc;
      g = uColorB * arms * disc * (0.35 + 1.0 * dust) + uColorA * bulge * 2.2 + uColorA * field;
    } else if (uPlanet == 11) {
      float web = fbm(d * 5.0 + 3.0);
      float specks = smoothstep(0.66, 0.74, fbm(d * 28.0)) + 0.6 * smoothstep(0.7, 0.78, fbm(d * 55.0 + 4.0));
      g = uColorB * (0.5 + 2.2 * web) + uColorA * specks * (0.4 + 1.6 * web);
    } else {
      vec3 q = d * 3.2;
      float wisp = fbm(q + fbm(q * 2.0 + 3.0) * 1.6);
      float gas = smoothstep(0.25, 0.75, wisp);
      float stars = smoothstep(0.78, 0.84, fbm(d * 45.0)) * 1.5;
      g = mix(uColorB, uColorA, gas) * (0.25 + 1.5 * gas) + vec3(1.0, 0.95, 0.9) * stars;
    }
    col = g * rim;
    if (heat > 0.001) col += heatColor(heat * 0.7);
  }

  if (uStrangeAmt > 0.0) {
    float f = max(uStrangeFront, 1e-6);
    float dd = distance(vW, uStrangeOrigin);
    float inside = uStrangeAmt * (1.0 - smoothstep(0.85 * f, f, dd));
    float web = fbm(vBase * uNoiseScale * 3.0 + vec3(0.0, uTime * 0.15, 0.0));
    vec3 green = vec3(0.04, 0.95, 0.28) * (0.5 + 1.2 * web) + vec3(0.2, 0.5, 0.25) * pow(web, 3.0);
    float front = exp(-pow((dd - f) / (0.04 * f + 1e-5), 2.0)) * uStrangeAmt * step(0.0001, uStrangeFront);
    col = mix(col, green, clamp(inside, 0.0, 1.0)) + vec3(0.3, 1.2, 0.5) * front;
  }
  float edge = 1.0 - smoothstep(uEdge * 0.7, uEdge, vRho);
  col *= edge;
  gl_FragColor = vec4(col, 1.0);
}
`;function Sr(i,e={}){return new dt({vertexShader:r_,fragmentShader:a_,side:Mn,uniforms:{uSun:{value:Iu.clone()},uColorA:{value:i.colorA.clone()},uColorB:{value:i.colorB.clone()},uNoiseScale:{value:i.noiseScale},uBump:{value:i.bump},uSpec:{value:i.spec},uShine:{value:i.shine},uMetal:{value:i.metal},uHeat:{value:0},uHeatAdd:{value:0},uTime:{value:0},uEdge:{value:e.edge??1e9},uScarDir:{value:new I(0,1,0)},uScarAng:{value:0},uScarHeat:{value:0},uCharMix:{value:1},uPlanet:{value:e.planet??0},uEmissive:{value:i.emissive},uInner:{value:i.inner.clone()},uCenter:{value:e.center?.clone()??new I},uBubble:{value:new ht(0,0,0,0)},uStrangeAmt:{value:0},uStrangeOrigin:{value:new I},uStrangeFront:{value:0}}})}const s_={dust:3500,fire:1400,chunks:110},o_={dust:1200,fire:500,chunks:50},Pr=6,Ha=.9,Nu=`
uniform float uRs;
float groundAt(vec2 xz) {
  if (uRs > 1e4) return 0.0;
  return -uRs + sqrt(max(uRs * uRs - dot(xz, xz), 0.0));
}
vec3 flight(vec3 p0, vec3 v, float t, float lift, out float landed) {
  float gnd = 0.0;
  float tl = 0.0;
  for (int k = 0; k < 3; k++) {
    float y0 = p0.y - gnd - lift;
    tl = (v.y + sqrt(max(v.y * v.y + 2.0 * uG * y0, 0.0))) / uG;
    gnd = groundAt(p0.xz + v.xz * tl);
  }
  float te = min(t, tl);
  vec3 p = p0 + v * te;
  p.y = p0.y + v.y * te - 0.5 * uG * te * te;
  float slide = max(t - te, 0.0);
  p.xz += v.xz * 0.3 * (1.0 - exp(-slide / 0.4));
  p.y = max(p.y, groundAt(p.xz) + lift);
  landed = t - tl;
  return p;
}
`,l_=`
attribute vec3 aP0;
attribute vec3 aV;
attribute vec4 aA; // size, delay, life, heat
attribute float aTint;
uniform float uT;
uniform float uG;
uniform float uPixelScale;
varying float vHeat;
varying float vAlpha;
varying float vTint;
${Nu}
void main() {
  float t = uT - aA.y;
  float landed;
  vec3 p = flight(aP0, aV, max(t, 0.0), 0.0, landed);
  float alive = step(0.0, t) * (1.0 - step(aA.z, t));
  vAlpha = alive * (1.0 - smoothstep(aA.z * 0.7, aA.z, t));
  vHeat = aA.w * exp(-max(t, 0.0) / (0.5 + 1.8 * aA.w));
  vTint = aTint;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(aA.x * uPixelScale / max(-mv.z, 1e-4), 0.0, 48.0) * alive;
  gl_Position = projectionMatrix * mv;
}
`,c_=`
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vHeat;
varying float vAlpha;
varying float vTint;
${ar}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0 || vAlpha <= 0.001) discard;
  // Gaussian falloff: overlapping puffs blend into one glowing cloud instead of showing hard-edged discs.
  float soft = exp(-d * d * 4.0) * (1.0 - d * d);
  #ifdef ADDITIVE
    vec3 col = heatColor(vHeat + 0.25) * soft * 0.7;
    gl_FragColor = vec4(col * vAlpha, 1.0);
  #else
    vec3 base = mix(uColorA, uColorB, vTint) * 0.85;
    vec3 col = base + heatColor(vHeat) * 0.3;
    gl_FragColor = vec4(col, soft * vAlpha * 0.8);
  #endif
}
`,u_=`
attribute vec3 aP0;
attribute vec3 aV;
attribute vec4 aSpin;   // axis xyz, rate
attribute vec4 aInfo;   // scale, delay, heat, seed
attribute float aTint;
uniform float uT;
uniform float uG;
varying vec3 vW;
varying vec3 vObj;
varying float vHeat;
varying float vTint;
varying float vSeed;
${Nu}
${ar}
vec3 rotate(vec3 v, vec3 axis, float ang) {
  float c = cos(ang);
  float s = sin(ang);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}
void main() {
  float t = uT - aInfo.y;
  float landed;
  float sc = aInfo.x * step(0.0, t);
  vec3 p = flight(aP0, aV, max(t, 0.0), sc * 0.55, landed);
  float onGround = max(landed, 0.0);
  float ang = aSpin.w * (max(t, 0.0) - onGround + 0.25 * (1.0 - exp(-onGround / 0.3)));
  vec3 axis = normalize(aSpin.xyz);
  vec3 lp = position * (0.72 + 0.56 * hash13(position * 3.1 + aInfo.w));
  vec3 r = rotate(lp, axis, ang) * sc;
  vec3 wp = p + r;
  vW = wp;
  vObj = lp;
  vHeat = aInfo.z * exp(-max(t, 0.0) / (0.6 + 1.6 * aInfo.z));
  vTint = aTint;
  vSeed = aInfo.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`,h_=`
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uSun;
varying vec3 vW;
varying vec3 vObj;
varying float vHeat;
varying float vTint;
varying float vSeed;
${ar}
void main() {
  vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
  if (dot(N, cameraPosition - vW) < 0.0) N = -N;
  float n = fbm(vObj * 5.0 + vSeed);
  vec3 albedo = mix(uColorA, uColorB, vTint) * (0.55 + 0.7 * n);
  float ndl = max(dot(N, normalize(uSun)), 0.0);
  vec3 col = albedo * (vec3(0.05, 0.065, 0.1) + vec3(1.55, 1.5, 1.4) * ndl);
  col += heatColor(vHeat * (0.8 + 0.4 * n));
  gl_FragColor = vec4(col, 1.0);
}
`;function Wi(i){const e=i()*2-1,t=i()*Math.PI*2,n=Math.sqrt(1-e*e);return new I(n*Math.cos(t),e,n*Math.sin(t))}function d_(i,e,t=!1){const n=Ur(2654435769^Math.floor(i.unit*1e9)),r=[],a=[],s=[],o=i.deform.radius,l=i.riLocal,c=Math.max(o,l,.3),u=i.surfaceOutcome,p=i.impactorOutcome,h=Math.cos(i.angleDeg*Math.PI/180),d=new I(i.dir[0],0,0).normalize(),_=i.local.startDistance/Ha,x=new I(0,l,0),m=(g,b,C,R,D,O)=>{s.push({p:g,v:b,size:C,delay:R,life:99,heat:D,tint:O,spin:Wi(n),spinRate:(n()-.5)*14,seed:n()*50})},f=i.deform.kind==="crater"?1:i.deform.kind==="dent"?.12:0,v=Math.round(e.dust*f),E=Math.max(o,.25);for(let g=0;g<v;g++){let b=0;for(let X=0;X<8&&(b=n()*Math.PI*2,!(n()*1.6<1+.6*h*Math.cos(b)));X++);const C=n(),R=E*(.2+.7*n()),D=(38+32*n())*Math.PI/180,O=E*(.7+3.4*Math.pow(C,1.7)),V=Math.sqrt(O*Pr/Math.sin(2*D)),L=V*Math.cos(D),G=n()<u.glow*.8?u.glow*(.4+.5*n()):0;r.push({p:new I(R*Math.cos(b),.02,R*Math.sin(b)),v:new I(L*Math.cos(b),V*Math.sin(D),L*Math.sin(b)),size:c*(.012+.032*n())*(.6+C),delay:.02+.3*n()*(R/E),life:9+3*n(),heat:G,tint:0})}if(i.deform.kind==="crater"){const g=Math.min(e.chunks/2,10+Math.round(8*Math.log10(1+u.stressRatio)));for(let b=0;b<g;b++){const C=n()*Math.PI*2,R=E*(.9+1.8*n()),D=(45+20*n())*Math.PI/180,O=Math.sqrt(R*Pr/Math.sin(2*D));m(new I(E*.6*Math.cos(C),.05,E*.6*Math.sin(C)),new I(O*Math.cos(D)*Math.cos(C),O*Math.sin(D),O*Math.cos(D)*Math.sin(C)),c*(.025+.06*n()),.04+.2*n(),u.glow*n()*.7,0)}}const y=Math.max(u.glow,p.glow);if(y>.12||u.ignites||p.ignites){const g=Math.round(e.fire*.35*Math.max(y,p.ignites||u.ignites?.5:0));for(let b=0;b<g;b++){const C=Wi(n);C.y=Math.abs(C.y)*.9+.1;const R=(3+11*n())*(.6+y);a.push({p:new I(0,l*.8,0),v:C.multiplyScalar(R),size:c*(.015+.03*n()),delay:.01+.15*n(),life:1.2+1.8*n(),heat:.7+.7*n(),tint:0})}}const A=(g,b,C,R,D,O,V)=>{if(C==="vaporize"){const X=Math.round(e.fire*1.1);for(let N=0;N<X;N++){const K=Wi(n);K.y=Math.abs(K.y)*.8+.2;const W=V*(.3+1.2*n());a.push({p:g.clone().addScaledVector(K,b*.5*n()),v:K.multiplyScalar(W),size:Math.max(b,.25)*(.07+.2*n()*n()),delay:.01+.1*n(),life:1.4+2.4*n(),heat:.5+.9*n()*Math.max(D,.6),tint:O})}return}const L=t?0:C==="crack"?Math.min(14,Math.max(5,Math.round(R*.7))):Math.min(e.chunks,Math.max(18,R));for(let X=0;X<L;X++){const N=Wi(n);N.y=Math.abs(N.y)*.9+.1;const K=V*(.15+.85*n()),W=b*(C==="crack"?.16+.14*n():.07+.2*Math.pow(n(),2.2)),j=g.clone().addScaledVector(Wi(n),b*.6*n());j.y=Math.max(j.y,.05+W);const Q=N.multiplyScalar(K).addScaledVector(d,K*.35*h);m(j,Q,W,.01+.05*n(),D*n(),O)}const G=Math.round(e.dust*(C==="crack"?.08:.3));for(let X=0;X<G;X++){const N=Wi(n);N.y=Math.abs(N.y)*.9+.1,r.push({p:g.clone().addScaledVector(N,b*.4),v:N.multiplyScalar(V*(.2+.9*n())),size:Math.max(b,.2)*(.03+.07*n()),delay:.01+.1*n(),life:6+3*n(),heat:D*n(),tint:O})}},T=i.impactorFate;if(T==="crack"||T==="shatter"||T==="vaporize"){const g=Math.max(2.5,_*(T==="vaporize"?2.2:.8));A(x,l,T,p.suggestedFragments,p.glow,1,g)}else if(i.impactorFate==="embed")for(let g=0;g<Math.round(e.dust*.08);g++){const b=n()*Math.PI*2;r.push({p:new I(l*.6*Math.cos(b),.02,l*.6*Math.sin(b)),v:new I(Math.cos(b)*(1+3*n()),1.5+3*n(),Math.sin(b)*(1+3*n())),size:l*(.03+.05*n()),delay:.02+.1*n(),life:5,heat:0,tint:0})}if(i.merge){const g=i.merge.glow,b=Math.max(l,i.patchIsWholeSphere?.5*i.rsLocal:l);A(x,b,"vaporize",40,g,0,Math.max(1.5,_*.45))}if(i.surfaceDestroyed){const g=i.rsLocal,b=rt[i.surface.material].behavior,C=u.regime==="vaporize"||b==="fluid"||b==="hole"?"vaporize":"shatter";A(new I(0,-g,0).add(new I(0,.6*g,0)),g,C,u.suggestedFragments,u.glow,0,Math.max(2.5,_*.7))}else if(!i.merge&&vt[u.regime]>=vt.fracture&&i.deform.kind!=="crater"){const g=Math.min(12,Math.max(4,Math.round(u.suggestedFragments*.6)));for(let b=0;b<g;b++){const C=n()*Math.PI*2,R=2+4*n();m(new I(.3*l*Math.cos(C),.05,.3*l*Math.sin(C)),new I(R*Math.cos(C),2+4*n(),R*Math.sin(C)),l*(.1+.12*n()),.02+.08*n(),u.glow*n(),0)}}return{dust:r,fire:a,chunks:s}}function f_(i){const e=i.length,t=new Float32Array(e*3),n=new Float32Array(e*3),r=new Float32Array(e*4),a=new Float32Array(e);i.forEach((o,l)=>{t.set([o.p.x,o.p.y,o.p.z],l*3),n.set([o.v.x,o.v.y,o.v.z],l*3),r.set([o.size,o.delay,o.life,o.heat],l*4),a[l]=o.tint});const s=new ft;return s.setAttribute("position",new $e(new Float32Array(e*3),3)),s.setAttribute("aP0",new $e(t,3)),s.setAttribute("aV",new $e(n,3)),s.setAttribute("aA",new $e(r,4)),s.setAttribute("aTint",new $e(a,1)),s}class Sc{objects=[];materials=[];geometries=[];constructor(e,t,n=!1){const{dust:r,fire:a,chunks:s}=d_(e,t,n),o=tr(e.surface.material,e.surface.id),l=tr(e.impactor.material,e.impactor.id),c=()=>({uT:{value:-1},uG:{value:Pr},uRs:{value:e.rsLocal<1e4?e.rsLocal:1e9},uPixelScale:{value:600},uColorA:{value:o.colorA.clone().lerp(new De(0),.1)},uColorB:{value:l.colorA.clone()},uSun:{value:Iu.clone()}}),u=(p,h)=>{if(p.length===0)return;const d=f_(p),_=new dt({vertexShader:l_,fragmentShader:c_,uniforms:c(),transparent:!0,depthWrite:!1,...h?{blending:Sn}:{},defines:h?{ADDITIVE:""}:{}}),x=new pu(d,_);x.frustumCulled=!1,x.renderOrder=h?6:5,this.objects.push(x),this.materials.push(_),this.geometries.push(d)};if(u(r,!1),u(a,!0),s.length>0){const p=new Ya(1,1),h=new Xd;h.index=p.index,h.setAttribute("position",p.getAttribute("position")),h.instanceCount=s.length;const d=s.length,_=new Float32Array(d*3),x=new Float32Array(d*3),m=new Float32Array(d*4),f=new Float32Array(d*4),v=new Float32Array(d);s.forEach((A,T)=>{_.set([A.p.x,A.p.y,A.p.z],T*3),x.set([A.v.x,A.v.y,A.v.z],T*3),m.set([A.spin.x,A.spin.y,A.spin.z,A.spinRate],T*4),f.set([A.size,A.delay,A.heat,A.seed],T*4),v[T]=A.tint}),h.setAttribute("aP0",new pr(_,3)),h.setAttribute("aV",new pr(x,3)),h.setAttribute("aSpin",new pr(m,4)),h.setAttribute("aInfo",new pr(f,4)),h.setAttribute("aTint",new pr(v,1));const E=new dt({vertexShader:u_,fragmentShader:h_,uniforms:c(),side:Mn}),y=new xt(h,E);y.frustumCulled=!1,this.objects.push(y),this.materials.push(E),this.geometries.push(h)}}update(e,t){for(const n of this.materials)n.uniforms.uT.value=e,n.uniforms.uPixelScale.value=t}dispose(){for(const e of this.geometries)e.dispose();for(const e of this.materials)e.dispose()}}const p_="modulepreload",m_=function(i){return"/static/smash_lab/"+i},yc={},g_=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let c=function(u){return Promise.all(u.map(p=>Promise.resolve(p).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};var s=c;document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=o?.nonce||o?.getAttribute("nonce");r=c(t.map(u=>{if(u=m_(u),u in yc)return;yc[u]=!0;const p=u.endsWith(".css"),h=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${h}`))return;const d=document.createElement("link");if(d.rel=p?"stylesheet":p_,p||(d.as="script"),d.crossOrigin="",d.href=u,l&&d.setAttribute("nonce",l),document.head.appendChild(d),p)return new Promise((_,x)=>{d.addEventListener("load",_),d.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${u}`)))})}))}function a(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return r.then(o=>{for(const l of o||[])l.status==="rejected"&&a(l.reason);return e().catch(a)})};function Uu(i){const e=i.getAttribute("position"),t=e.count;return i.setAttribute("aBase",new $e(new Float32Array(e.array),3)),i.setAttribute("aHeat",new $e(new Float32Array(t),1)),i.setAttribute("aAO",new $e(new Float32Array(t).fill(1),1)),i.setAttribute("aRho",new $e(new Float32Array(t),1)),i}function __(i=96,e=64){return Uu(new jo(1,i,e))}const v_=i=>1-Math.pow(1-Math.min(1,Math.max(0,i)),3);class Fu{constructor(e,t){this.plan=e,this.rings=t.rings,this.segs=t.segments;const{rings:n,segs:r}=this,a=(n+1)*r,s=e.rsLocal,o=e.patchAngle;this.rho=new Float64Array(n+1),this.sinPhi=new Float64Array(n+1),this.cosPhi=new Float64Array(n+1),this.yBase=new Float64Array(n+1);for(let f=0;f<=n;f++){const v=o*Math.pow(f/n,1.6);this.rho[f]=s*v,this.sinPhi[f]=Math.sin(v),this.cosPhi[f]=Math.cos(v),this.yBase[f]=-2*s*Math.pow(Math.sin(v/2),2)}this.cosPsi=new Float64Array(r),this.sinPsi=new Float64Array(r);for(let f=0;f<r;f++){const v=2*Math.PI*f/r;this.cosPsi[f]=Math.cos(v),this.sinPsi[f]=Math.sin(v)}const l=Ur(Math.floor(e.unit*1e6)^20973),c=[2,3,5].map(f=>({k:f,a:.05+.04*l(),p:l()*6.283}));this.wobble=new Float64Array(r),this.rubble=new Float64Array(r);for(let f=0;f<r;f++){const v=2*Math.PI*f/r;let E=0;for(const y of c)E+=y.a*Math.sin(y.k*v+y.p);this.wobble[f]=E,this.rubble[f]=l()}const u=new Float32Array(a*3),p=new Float32Array(a),h=new Float32Array(a);this.positions=new Float32Array(a*3),this.ao=new Float32Array(a).fill(1);const d=Math.max(e.deform.radius*1.2,e.riLocal*1.3,.3),_=e.surfaceOutcome.glow;for(let f=0;f<=n;f++)for(let v=0;v<r;v++){const E=f*r+v,y=this.sinPhi[f],A=s*y*this.cosPsi[v],T=s*y*this.sinPsi[v],g=this.yBase[f];u[E*3]=A,u[E*3+1]=g,u[E*3+2]=T,this.positions[E*3]=A,this.positions[E*3+1]=g,this.positions[E*3+2]=T;const b=this.rho[f];h[E]=b,p[E]=_*Math.exp(-Math.pow(b/d,2)*1.4)}const x=[];for(let f=0;f<n;f++)for(let v=0;v<r;v++){const E=(v+1)%r,y=f*r+v,A=f*r+E,T=(f+1)*r+v,g=(f+1)*r+E;x.push(y,A,T,A,g,T)}this.geometry.setIndex(x),this.geometry.setAttribute("position",new $e(this.positions,3)),this.geometry.setAttribute("aBase",new $e(u,3)),this.geometry.setAttribute("aHeat",new $e(p,1)),this.geometry.setAttribute("aAO",new $e(this.ao,1)),this.geometry.setAttribute("aRho",new $e(h,1)),this.geometry.setAttribute("normal",new $e(new Float32Array(a*3),3));const m=e.patchIsWholeSphere?1e9:$i;this.material=Sr(tr(e.surface.material,e.surface.id),{edge:m,planet:e.patchIsWholeSphere?Ta(e.surface.id):0,center:new I(0,-e.rsLocal,0)}),this.mesh=new xt(this.geometry,this.material),this.mesh.frustumCulled=!1,this.setProgress(0,!0)}plan;mesh;material;geometry=new ft;rings;segs;rho;sinPhi;cosPhi;yBase;cosPsi;sinPsi;wobble;rubble;positions;ao;lastProgress=-1;height(e,t,n){const r=this.plan.deform;if(r.kind==="none"||n<=0)return 0;const a=v_(n),s=1+this.wobble[t]*(r.kind==="crater"?1:.3),o=r.radius*a*s,l=r.depth*a;if(o<=1e-9)return 0;const c=e/o;if(r.kind==="dent")return-l*Math.exp(-2.4*c*c)+.08*l*Math.exp(-Math.pow((c-1.35)/.35,2));const u=(r.complex?.07:.14)*l,p=1+.35*(this.rubble[t]-.5);let h;return c<1?h=r.complex?-l*(1-Math.pow(c,4))+.3*l*Math.exp(-Math.pow(c/.16,2)):-l*(1-c*c):h=0,h+=u*p*Math.exp(-Math.pow((c-1)/.2,2)),c>1&&(h+=.45*u*p*Math.pow(1/c,3)),h}setProgress(e,t=!1){const n=Math.round(Math.min(1,Math.max(0,e))*400)/400;if(!t&&n===this.lastProgress)return;this.lastProgress=n;const{rings:r,segs:a}=this,s=this.positions,o=this.plan.deform.kind!=="none";for(let l=0;l<=r;l++){const c=this.rho[l],u=this.sinPhi[l],p=this.cosPhi[l],h=this.yBase[l],d=this.plan.rsLocal;for(let _=0;_<a;_++){const x=l*a+_,m=o?this.height(c,_,n):0;s[x*3]=d*u*this.cosPsi[_]+m*u*this.cosPsi[_],s[x*3+1]=h+m*p,s[x*3+2]=d*u*this.sinPsi[_]+m*u*this.sinPsi[_];const f=this.plan.deform.depth;this.ao[x]=o&&f>0?1-.55*Math.min(1,Math.max(0,-m)/f):1}}this.geometry.getAttribute("position").needsUpdate=!0,this.geometry.getAttribute("aAO").needsUpdate=!0,this.computeNormals()}computeNormals(){this.geometry.computeVertexNormals();const e=this.geometry.getAttribute("normal"),t=e.array,n=this.segs;for(const r of[0,this.rings]){let a=0,s=0,o=0;for(let c=0;c<n;c++){const u=r*n+c;a+=t[u*3],s+=t[u*3+1],o+=t[u*3+2]}const l=Math.hypot(a,s,o)||1;for(let c=0;c<n;c++){const u=r*n+c;t[u*3]=a/l,t[u*3+1]=s/l,t[u*3+2]=o/l}}e.needsUpdate=!0}collisionSnapshot(){const e=this.positions,t=this.geometry.getIndex(),n=t?t.array:[],r=[];for(let a=0;a+2<n.length;a+=3){const s=n[a]*3,o=n[a+1]*3,l=n[a+2]*3,c=e[o]-e[s],u=e[o+1]-e[s+1],p=e[o+2]-e[s+2],h=e[l]-e[s],d=e[l+1]-e[s+1],_=e[l+2]-e[s+2];Math.hypot(u*_-p*d,p*h-c*_,c*d-u*h)>1e-9&&r.push(n[a],n[a+1],n[a+2])}return{vertices:new Float32Array(e),indices:new Uint32Array(r)}}dispose(){this.geometry.dispose(),this.material.dispose()}}function x_(i){const e=new Fu(i,{rings:56,segments:80});e.setProgress(1,!0);const t=e.collisionSnapshot();return e.dispose(),t}const Ec=1e-9,ln=(i,e)=>[i[0]-e[0],i[1]-e[1],i[2]-e[2]],Qo=(i,e)=>[i[0]+e[0],i[1]+e[1],i[2]+e[2]],el=(i,e)=>[i[0]*e,i[1]*e,i[2]*e],Gn=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],Va=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],oi=i=>Math.hypot(i[0],i[1],i[2]),bi=i=>{const e=oi(i)||1;return[i[0]/e,i[1]/e,i[2]/e]},Aa=(i,e,t)=>[i[0]+(e[0]-i[0])*t,i[1]+(e[1]-i[1])*t,i[2]+(e[2]-i[2])*t];function b_(i){const e=(1+Math.sqrt(5))/2,n=[[-1,e,0],[1,e,0],[-1,-e,0],[1,-e,0],[0,-1,e],[0,1,e],[0,-1,-e],[0,1,-e],[e,0,-1],[e,0,1],[-e,0,-1],[-e,0,1]].map(bi);let a=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]].map(([s,o,l])=>[n[s],n[o],n[l]]);for(let s=0;s<i;s++){const o=[];for(const[l,c,u]of a){const p=bi(Aa(l,c,.5)),h=bi(Aa(c,u,.5)),d=bi(Aa(u,l,.5));o.push([l,p,d],[c,h,p],[u,d,h],[p,h,d])}a=o}return a}function M_(i,e,t){const n=[],r=[];for(const s of i){const o=s.v,l=o.length,c=[];for(let d=0;d<l;d++){const _=o[d],x=o[(d+1)%l],m=Gn(e,_)-t,f=Gn(e,x)-t,v=m<=Ec,E=f<=Ec;if(v&&c.push(_),v!==E){const y=Aa(_,x,m/(m-f));c.push(y),r.push(y)}}const u=[];for(const d of c){const _=u[u.length-1];(!_||oi(ln(d,_))>1e-9)&&u.push(d)}const p=u[0],h=u[u.length-1];u.length>1&&p&&h&&oi(ln(p,h))<=1e-9&&u.pop(),u.length>=3&&n.push({v:u,inner:s.inner})}const a=[];for(const s of r)a.some(o=>oi(ln(s,o))<1e-7)||a.push(s);if(a.length>=3){let s=[0,0,0];for(const u of a)s=Qo(s,u);s=el(s,1/a.length);const o=Math.abs(e[0])<.9?[1,0,0]:[0,1,0],l=bi(Va(o,e)),c=Va(e,l);a.sort((u,p)=>Math.atan2(Gn(ln(u,s),c),Gn(ln(u,s),l))-Math.atan2(Gn(ln(p,s),c),Gn(ln(p,s),l))),n.push({v:a,inner:!0})}return n}function S_(i){let e=0,t=0,n=0;for(let r=0;r<i.length;r++){const a=i[r],s=i[(r+1)%i.length];e+=(a[1]-s[1])*(a[2]+s[2]),t+=(a[2]-s[2])*(a[0]+s[0]),n+=(a[0]-s[0])*(a[1]+s[1])}return bi([e,t,n])}function y_(i,e,t,n,r){const a=[];let s=0;for(;a.length<i&&s++<i*200;){const o=r()*2-1,l=r()*Math.PI*2,c=Math.sqrt(1-o*o),u=[c*Math.cos(l),o,c*Math.sin(l)],p=-Math.log(1-r()*.999)*t,h=Qo(e,el(u,p));oi(h)>.97||a.some(d=>oi(ln(h,d))<n)||a.push(h)}return a}function E_(i){const{seeds:e,radius:t}=i,n=b_(i.detail??3).map(l=>({v:l.map(c=>[...c]),inner:!1})),r=i.minVolumeFraction??2e-4,a=[];e.forEach((l,c)=>{let u=n;const p=e.map((d,_)=>({j:_,d:oi(ln(d,l))})).filter(d=>d.j!==c).sort((d,_)=>d.d-_.d);let h=2;for(const d of p){if(d.d/2>=h)break;const _=e[d.j],x=ln(_,l),m=Gn(x,el(Qo(l,_),.5));u=M_(u,x,m);let f=0;for(const v of u)for(const E of v.v)f=Math.max(f,oi(ln(E,l)));h=f}a.push({faces:u})});let s=0;for(const l of n){const c=l.v[0];for(let u=1;u+1<l.v.length;u++)s+=Gn(c,Va(l.v[u],l.v[u+1]))/6}const o=[];for(const{faces:l}of a){let c=0,u=0,p=0,h=0;for(const A of l){const T=A.v[0];for(let g=1;g+1<A.v.length;g++){const b=A.v[g],C=A.v[g+1],R=Gn(T,Va(b,C))/6;c+=R,u+=(T[0]+b[0]+C[0])/4*R,p+=(T[1]+b[1]+C[1])/4*R,h+=(T[2]+b[2]+C[2])/4*R}}if(c/s<r)continue;const d=[u/c,p/c,h/c],_=[],x=[],m=[],f=[],v=new Set,E=[],y=(A,T,g)=>{const b=ln(A,d);_.push(b[0]*t,b[1]*t,b[2]*t),x.push(T[0],T[1],T[2]),m.push(g),f.push(A[0],A[1],A[2]);const C=`${Math.round(b[0]*1e6)},${Math.round(b[1]*1e6)},${Math.round(b[2]*1e6)}`;v.has(C)||(v.add(C),E.push(b[0]*t,b[1]*t,b[2]*t))};for(const A of l){const T=S_(A.v),g=A.v[0];for(let b=1;b+1<A.v.length;b++){const C=[g,A.v[b],A.v[b+1]];for(const R of C)y(R,A.inner?T:bi(R),A.inner?1:0)}}o.push({centroid:d,volumeFraction:c/s,positions:new Float32Array(_),normals:new Float32Array(x),inner:new Float32Array(m),base:new Float32Array(f),hull:new Float32Array(E)})}return o}const Wa=60,Tc=2,T_={maxShards:64},A_={maxShards:32};function Ac(i){return wc(i.surface)||wc(i.impactor)?!1:i.impactorFate==="shatter"||i.impactorFate==="crack"||Xa(i)}function wc(i){const e=rt[i.material].behavior;return e==="fluid"||e==="hole"}function Xa(i){return i.surfaceDestroyed&&i.surfaceOutcome.regime!=="vaporize"}let Rc=null;function w_(){return Rc??=g_(()=>import("./chunks/rapier-Dr7-2af2.js"),[]).then(async i=>(await i.default.init(),i.default)),Rc}function Cc(i,e,t,n,r,a,s,o){const l=n==="crack"?Math.min(14,Math.max(8,r)):Math.min(s.maxShards,Math.max(18,r)),c=.45*Math.cbrt(4/3*Math.PI/l),u=y_(l,a,n==="crack"?.3:.6,c,Ur(o)),p=E_({seeds:u,radius:e,detail:l<=20?3:2});return{source:i,shards:p,radius:e,center:t}}class R_{world;bodies=[];centerOfGravity;frames;frameCount;frame=0;freed=!1;bake;constructor(e,t,n){const r=n.reduce((x,m)=>x+m.shards.length,0),a=t.timeline.impactEnd-t.timeline.contact;this.frameCount=Math.ceil(a*Wa)+1,this.frames=new Float32Array(this.frameCount*r*7);const s=!Xa(t);this.centerOfGravity=s&&t.rsLocal<50?[0,-t.rsLocal,0]:null;const o=s&&this.centerOfGravity===null?{x:0,y:-Pr,z:0}:{x:0,y:0,z:0};if(this.world=new e.World(o),this.world.integrationParameters.dt=1/(Wa*Tc),s)if(t.patchIsWholeSphere){const x=this.world.createRigidBody(e.RigidBodyDesc.fixed().setTranslation(0,-t.rsLocal,0));this.world.createCollider(e.ColliderDesc.ball(t.rsLocal).setFriction(.8).setRestitution(.25),x)}else{const x=x_(t),m=this.world.createRigidBody(e.RigidBodyDesc.fixed());this.world.createCollider(e.ColliderDesc.trimesh(x.vertices,x.indices).setFriction(.8).setRestitution(.25),m)}const l=t.local.startDistance/Ha,c=t.riLocal**3,u=t.rsLocal**3,p=Xa(t)?c/(c+u)*l:.55*l,h=t.dir,d=Ur(11256099^r),_=x=>l*(.12+.55*Math.min(1,Math.log10(1+x)/1.2));for(const x of n){const m=x.source==="impactor"?t.impactorOutcome:t.surfaceOutcome,f=_(m.energyRatio);for(const v of x.shards){const E=x.center[0]+v.centroid[0]*x.radius,y=x.center[1]+v.centroid[1]*x.radius,A=x.center[2]+v.centroid[2]*x.radius,T=[E,y,A],g=Math.hypot(...T)||1,b=f*(.4+.6*d()),C=e.RigidBodyDesc.dynamic().setTranslation(E,y,A).setLinvel(h[0]*p+T[0]/g*b,h[1]*p+T[1]/g*b+.25*b,h[2]*p+T[2]/g*b).setAngvel({x:(d()-.5)*12,y:(d()-.5)*12,z:(d()-.5)*12}).setCcdEnabled(!0).setAngularDamping(.15).setLinearDamping(.02),R=this.world.createRigidBody(C),D=e.ColliderDesc.convexHull(v.hull);D?this.world.createCollider(D.setDensity(1).setFriction(.7).setRestitution(.3),R):this.world.createCollider(e.ColliderDesc.ball(x.radius*.1).setDensity(1),R),this.bodies.push(R)}}this.bake={specs:n,frames:this.frames,frameCount:this.frameCount,shardCount:r},this.record()}record(){const e=this.bodies.length,t=this.frame*e*7;for(let n=0;n<e;n++){const r=this.bodies[n],a=r.translation(),s=r.rotation();this.frames.set([a.x,a.y,a.z,s.x,s.y,s.z,s.w],t+n*7)}}step(e){for(let n=0;n<e&&this.frame<this.frameCount-1;n++){for(let r=0;r<Tc;r++){if(this.centerOfGravity){const a=this.centerOfGravity;for(const s of this.bodies){const o=s.translation(),l=a[0]-o.x,c=a[1]-o.y,u=a[2]-o.z,p=Math.hypot(l,c,u)||1,h=s.mass()*Pr;s.resetForces(!0),s.addForce({x:l/p*h,y:c/p*h,z:u/p*h},!0)}}this.world.step()}this.frame++,this.record()}const t=this.frame>=this.frameCount-1;return t&&!this.freed&&(this.freed=!0,this.world.free()),t}dispose(){this.freed||(this.freed=!0,this.world.free())}}function C_(i,e){const t=[],n=i.riLocal;if((i.impactorFate==="shatter"||i.impactorFate==="crack")&&t.push(Cc("impactor",n,[0,n,0],i.impactorFate,i.impactorOutcome.suggestedFragments,[0,-1,0],e,101)),Xa(i)){const r=i.rsLocal,a=vt[i.surfaceOutcome.regime]>=vt.shatter?"shatter":"crack";t.push(Cc("surface",r,[0,-r,0],a,i.surfaceOutcome.suggestedFragments,[0,1,0],e,202))}return t}class P_{constructor(e,t){this.bake=e;for(const o of e.specs){const l=o.source==="impactor"?t.impactor:t.surface,c=tr(l.material,l.id),u=Sr({...c,noiseScale:c.noiseScale*2.5,bump:c.bump*o.radius});this.materials.set(o.source,u);for(const p of o.shards){const h=new ft,d=p.positions.length/3;h.setAttribute("position",new $e(p.positions,3)),h.setAttribute("normal",new $e(p.normals,3)),h.setAttribute("aBase",new $e(p.base,3)),h.setAttribute("aInner",new $e(p.inner,1)),h.setAttribute("aHeat",new $e(new Float32Array(d),1)),h.setAttribute("aAO",new $e(new Float32Array(d).fill(1),1)),h.setAttribute("aRho",new $e(new Float32Array(d),1));const _=new xt(h,u);_.frustumCulled=!1,this.group.add(_),this.meshes.push(_),this.geometries.push(h)}}this.group.visible=!1;const{frames:n,frameCount:r,shardCount:a}=e;this.cloudData=new Float32Array(r*4);const s=new Float32Array(a);for(let o=0;o<r;o++){let l=0,c=0,u=0;for(let h=0;h<a;h++){const d=(o*a+h)*7;l+=n[d],c+=n[d+1],u+=n[d+2]}l/=a,c/=a,u/=a;for(let h=0;h<a;h++){const d=(o*a+h)*7;s[h]=Math.hypot(n[d]-l,n[d+1]-c,n[d+2]-u)}const p=Array.from(s).sort((h,d)=>h-d);this.cloudData.set([l,c,u,p[Math.floor(p.length*.85)]],o*4)}}bake;group=new Xn;meshes=[];materials=new Map;geometries=[];qa=new ci;qb=new ci;cloudData;cloud(e){const t=Math.min(Math.max(e,0)*Wa,this.bake.frameCount-1),n=Math.round(t)*4,r=this.cloudData;return{x:r[n],y:r[n+1],z:r[n+2],radius:r[n+3]}}hasSource(e){return this.bake.specs.some(t=>t.source===e)}setHeat(e,t){const n=this.materials.get(e);n&&(n.uniforms.uHeatAdd.value=t)}update(e){if(this.group.visible=e>=0,e<0)return;const{frames:t,frameCount:n,shardCount:r}=this.bake,a=Math.min(e*Wa,n-1),s=Math.floor(a),o=Math.min(s+1,n-1),l=a-s;for(let c=0;c<r;c++){const u=(s*r+c)*7,p=(o*r+c)*7,h=this.meshes[c],d=_=>t[u+_]*(1-l)+t[p+_]*l;h.position.set(d(0),d(1),d(2)),this.qa.set(t[u+3],t[u+4],t[u+5],t[u+6]),this.qb.set(t[p+3],t[p+4],t[p+5],t[p+6]),h.quaternion.slerpQuaternions(this.qa,this.qb,l)}}dispose(){for(const e of this.geometries)e.dispose();for(const e of this.materials.values())e.dispose();this.group.clear()}}let _r=null;function L_(){if(_r)return _r;const i=128,e=document.createElement("canvas");e.width=i,e.height=i;const t=e.getContext("2d");if(t){const n=t.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.18,"rgba(255,235,200,0.75)"),n.addColorStop(.5,"rgba(255,150,60,0.22)"),n.addColorStop(1,"rgba(255,100,20,0)"),t.fillStyle=n,t.fillRect(0,0,i,i)}return _r=new zd(e),_r.colorSpace=Hn,_r}function Po(i=!0){const e=new hu({map:L_(),blending:Sn,depthWrite:!1,transparent:!0,sizeAttenuation:i}),t=new Dd(e);return t.frustumCulled=!1,t}const D_=`
uniform float uT;
varying vec3 vN;
varying vec3 vW;
varying float vK;
${ar}
void main() {
  float n = fbm(position * 2.2 + vec3(0.0, uT * 0.7, 0.0));
  vK = n;
  vec3 p = position * (0.78 + 0.5 * n);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,I_=`
uniform float uAge;      // 0 at start, 1 when gone
uniform float uStrength;
varying vec3 vN;
varying vec3 vW;
varying float vK;
${ar}
void main() {
  vec3 V = normalize(cameraPosition - vW);
  float facing = pow(abs(dot(normalize(vN), V)), 1.4);
  float heat = (1.15 - 0.95 * uAge) * (0.55 + 0.9 * vK) * facing;
  float alpha = (1.0 - smoothstep(0.55, 1.0, uAge)) * uStrength;
  gl_FragColor = vec4(heatColor(heat) * alpha * (0.35 + 0.65 * facing) * 0.4, 1.0);
}
`;class N_{constructor(e){this.plan=e,this.riLocal=e.riLocal,this.eventScale=Math.max(e.deform.radius,e.riLocal,.3),this.heatLevel=Math.max(e.surfaceOutcome.glow,e.impactorOutcome.glow,e.merge?e.merge.glow:0),this.severity=Math.max(e.deform.kind==="crater"?1:e.deform.kind==="dent"?.3:0,e.impactorFate==="shatter"||e.impactorFate==="vaporize"?1:e.impactorFate==="crack"?.6:0,e.surfaceDestroyed?1:0,e.merge?.6:0),this.flash.position.set(0,e.riLocal*.8,0),this.group.add(this.flash),this.ringMaterial=new dt({transparent:!0,depthWrite:!1,blending:Sn,uniforms:{uAlpha:{value:0}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",fragmentShader:`uniform float uAlpha; varying vec2 vUv;
        void main(){
          float r = length(vUv - 0.5) * 2.0;
          float a = smoothstep(0.93, 0.975, r) * (1.0 - smoothstep(0.975, 1.0, r));
          gl_FragColor = vec4(vec3(1.0, 0.82, 0.6) * a * uAlpha, 1.0);
        }`});const t=new Ko(.93,1,128);t.rotateX(-Math.PI/2),this.ring=new xt(t,this.ringMaterial),this.ring.position.y=.02,this.ring.visible=!e.patchIsWholeSphere,this.group.add(this.ring),this.fireMaterial=new dt({transparent:!0,depthWrite:!1,blending:Sn,uniforms:{uT:{value:0},uAge:{value:1},uStrength:{value:1}},vertexShader:D_,fragmentShader:I_}),this.fireball=new xt(new Ya(1,4),this.fireMaterial),this.fireball.frustumCulled=!1,this.group.add(this.fireball)}plan;group=new Xn;flash=Po();ring;ringMaterial;fireball;fireMaterial;eventScale;heatLevel;severity;riLocal;update(e){const t=this.flash.material;if(e<0||this.severity<=0){t.opacity=0,this.ring.visible=!1,this.fireball.visible=!1;return}const n=this.heatLevel,r=(.25+.75*this.severity)*(.3+.7*Math.min(1,n*1.6)),a=this.eventScale,s=Math.exp(-e/(.07+.1*n));t.opacity=1,t.color.setScalar(r*(n>.05?4.5:1)*s);const o=Math.max(this.riLocal,.25*this.plan.deform.radius,.15);this.flash.scale.setScalar(o*(n>.05?4.2:2.2));const l=a*(.5+5*(1-Math.exp(-e/.4)));if(this.ring.visible=e<2.5&&this.ringMaterial.uniforms.uAlpha!==void 0,this.ring.scale.set(l,1,l),this.ringMaterial.uniforms.uAlpha.value=.45*this.severity*Math.exp(-e/.45)*(e<2.5?1:0),n>.25){const c=1.4+2.6*n,u=e/c;this.fireball.visible=u<1;const p=a*(.3+.8*n)*(1-Math.exp(-e/.3))+.001;this.fireball.scale.setScalar(p),this.fireball.position.set(0,p*.4,0),this.fireMaterial.uniforms.uT.value=e,this.fireMaterial.uniforms.uAge.value=Math.min(1,u),this.fireMaterial.uniforms.uStrength.value=Math.min(1.2,.5+n)}else this.fireball.visible=!1}dispose(){this.flash.material.dispose(),this.ringMaterial.dispose(),this.fireMaterial.dispose(),this.ring.geometry.dispose(),this.fireball.geometry.dispose()}}function Fs(i){const e=[],t=Math.min(48,Math.max(2,Math.ceil(i/4)));for(let a=0;a<=t;a++)e.push(new we(1,-i*(1-a/t)));const n=14;for(let a=1;a<=n;a++){const s=a/n*(Math.PI/2);e.push(new we(Math.cos(s),Math.sin(s)))}const r=new Yo(e,40);return r.rotateZ(-Math.PI/2),r.computeVertexNormals(),Uu(r)}const U_=240,Pc=.0035;function F_(i=2600,e=1){const t=Ur(1234567),n=new Float32Array(i*3),r=new Float32Array(i*3),a=new Float32Array(i);for(let u=0;u<i;u++){const p=t()*2-1,h=t()*Math.PI*2,d=Math.sqrt(1-p*p);n.set([d*Math.cos(h)*80,p*80,d*Math.sin(h)*80],u*3);const _=t(),x=.25+.75*Math.pow(t(),3);r.set([x*(.8+.3*_),x*(.85+.1*_),x*(1.1-.3*_)],u*3),a[u]=1+1.6*Math.pow(t(),6)}const s=new $e(n,3),o=new ft;o.setAttribute("position",s),o.setAttribute("aColor",new $e(r,3)),o.setAttribute("aSize",new $e(a,1));const l=new dt({depthTest:!1,depthWrite:!1,uniforms:{uPx:{value:e}},vertexShader:`
      attribute vec3 aColor; attribute float aSize; uniform float uPx; varying vec3 vC;
      void main() {
        vC = aColor;
        gl_PointSize = aSize * uPx;
        gl_Position = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0);
      }`,fragmentShader:`
      varying vec3 vC;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        gl_FragColor = vec4(vC * (1.0 - d * 0.5) * 0.9, 1.0);
      }`}),c=new pu(o,l);return c.frustumCulled=!1,c.renderOrder=-10,c}const Os=40,Lc=1.1,Xi=.14,Cn=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),xn=(i,e,t)=>{const n=Cn((t-i)/(e-i));return n*n*(3-2*n)},O_={grb:{color:[.75,.5,1],gain:1.5},supernova:{color:[1,.5,.15],gain:1.2},hypernova:{color:[.45,.7,1],gain:1.5},bigBang:{color:[1,.95,.85],gain:3.2}},B_=2.7,z_=8.5,Rn=i=>1-Math.pow(1-Cn(i),3),kn=(i,e,t)=>i+(e-i)*t,Bs=(i,e,t)=>i<=e||i>=t?0:Math.sin(Math.PI*(i-e)/(t-e));function xi(i,e){if(i<=0)return 0;const t=2.5+6*e;return xn(0,.05,i)*Math.pow(Cn(1-i/t),1.5)}function Dc(i){const e=Math.floor(Math.log10(i)),t=Math.pow(10,e),n=i/t;return(n>=5?5:n>=2?2:1)*t}class k_{constructor(e,t={}){this.host=e;const n=t.quality==="low";this.patchQuality=n?{rings:120,segments:160}:{rings:220,segments:256},this.debrisQuality=n?o_:s_,this.fractureQuality=n?A_:T_,this.renderer=new V0({antialias:!1,powerPreference:"high-performance",alpha:!1}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.toneMapping=qa,this.renderer.toneMappingExposure=1,this.renderer.setClearColor(131850,1);const r=this.renderer.domElement;r.className="stage-canvas",e.appendChild(r);const a=document.createElement("div");a.className="stage-hud",a.innerHTML=`
      <div class="stage-label"></div>
      <div class="stage-scale"><div class="stage-bar"></div><span class="stage-bar-label"></span></div>
      <div class="stage-fade"></div>`,e.appendChild(a),this.labelEl=a.querySelector(".stage-label"),this.barEl=a.querySelector(".stage-bar"),this.barLabelEl=a.querySelector(".stage-bar-label"),this.fadeEl=a.querySelector(".stage-fade"),this.scene.add(this.globalRoot,this.localRoot),this.stars=F_(2600,this.renderer.getPixelRatio()),this.scene.add(this.stars);const s=new qt(2,2,{type:Xt,samples:n?0:4});this.composer=new K0(this.renderer,s),this.composer.addPass(new Z0(this.scene,this.camera)),this.bloom=new er(new we(2,2),.75,.55,1),this.composer.addPass(this.bloom),this.composer.addPass(new j0),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize()}host;onTime;renderer;composer;bloom;camera=new bn(Os,1,.01,400);scene=new Ed;stars;globalRoot=new Xn;localRoot=new Xn;sphere=__(96,64);labelEl;barEl;barLabelEl;fadeEl;resizeObserver;patchQuality;debrisQuality;fractureQuality;fractureView=null;fractureReady=!1;fractureEligible=!1;bakeToken=0;holding=!1;plan=null;shot=null;time=0;playing=!1;lastStamp=0;raf=0;height=1;get currentTime(){return this.time}get isPlaying(){return this.playing}get breakupReady(){return!this.fractureEligible||this.fractureReady}get duration(){return this.plan?.timeline.end??0}setShot(e){this.pause(),this.disposeShot(),this.plan=e,this.shot=this.buildShot(e),this.startFracture(e),this.seek(0)}play(){this.plan&&(this.time>=this.plan.timeline.end&&(this.time=0),this.playing=!0,this.lastStamp=performance.now(),cancelAnimationFrame(this.raf),this.raf=requestAnimationFrame(this.tick))}pause(){this.playing=!1,cancelAnimationFrame(this.raf)}replay(){this.time=0,this.play()}seek(e){this.plan&&(this.time=Cn(e,0,Math.min(this.plan.timeline.end,this.timeLimit)),this.apply(this.time),this.composer.render(),this.onTime?.(this.time,this.time>=this.plan.timeline.end))}canvasDataUrl(){return this.renderer.domElement.toDataURL("image/png")}dispose(){this.pause(),this.resizeObserver.disconnect(),this.disposeShot(),this.sphere.dispose(),this.composer.dispose(),this.renderer.dispose(),this.host.replaceChildren()}get timeLimit(){return this.plan?this.fractureEligible&&!this.fractureReady?this.plan.timeline.contact-.12:this.plan.timeline.end:0}tick=e=>{if(!this.playing||!this.plan)return;const t=Math.min(.05,Math.max(0,(e-this.lastStamp)/1e3));this.lastStamp=e;const n=this.timeLimit,r=this.time+t;if(r>=this.plan.timeline.end){this.seek(this.plan.timeline.end),this.playing=!1;return}this.holding=r>=n,this.seek(Math.min(r,n)),this.raf=requestAnimationFrame(this.tick)};resize(){const e=Math.max(2,this.host.clientWidth),t=Math.max(2,this.host.clientHeight);this.height=t,this.renderer.setSize(e,t,!1),this.composer.setSize(e,t),this.bloom.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.plan&&this.seek(this.time)}get pixelScale(){return this.renderer.domElement.height/(2*Math.tan(Os*Math.PI/360))}buildShot(e){const t=tr(e.surface.material,e.surface.id),n=tr(e.impactor.material,e.impactor.id),r=Ta(e.surface.id),a=Ta(e.impactor.id),s=Sr({...t,noiseScale:t.noiseScale*2.5,bump:t.bump},{planet:r}),o=new xt(this.sphere,s);o.position.set(0,-1,0);const l=Sr({...n,noiseScale:n.noiseScale*2.5,bump:n.bump*e.riGlobal},{planet:a}),c=e.impactor.length,u=new xt(c!==void 0?Fs(c/e.surface.radius/Math.max(e.riGlobal,Pc)):this.sphere,l),p=Po(!1);p.scale.setScalar(.022);const h=new ft;h.setAttribute("position",new $e(new Float32Array(6),3)),h.setAttribute("color",new $e(new Float32Array([2.5,1.5,.8,0,0,0]),3));const d=new Od(h,new fu({vertexColors:!0,blending:Sn,transparent:!0,depthWrite:!1}));d.frustumCulled=!1;const _=Po();this.globalRoot.add(o,u,p,d,_);let x,m,f,v;e.blast&&(f=new xt(this.sphere,new dt({transparent:!0,depthWrite:!1,blending:Sn,uniforms:{uColor:{value:new I(1,.6,.25)},uGain:{value:0}},vertexShader:"varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",fragmentShader:"uniform vec3 uColor; uniform float uGain; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uColor * uGain * (0.35 + 1.4 * pow(f, 0.8)), 1.0); }"})),f.visible=!1,this.globalRoot.add(f),e.blast.kind==="grb"&&(v=new xt(Fs(4.5/.02),new Oa({color:16777215,transparent:!0,depthWrite:!1,blending:Sn})),v.scale.setScalar(.02),v.quaternion.setFromUnitVectors(new I(1,0,0),new I(...e.dir)),v.position.set(...e.dir).multiplyScalar(-.02),v.visible=!1,this.globalRoot.add(v))),e.bubble&&(x=new xt(this.sphere,new Oa({color:0})),m=new xt(this.sphere,new dt({transparent:!0,depthWrite:!1,blending:Sn,side:Wt,vertexShader:"varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",fragmentShader:"varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(vec3(0.55, 0.8, 1.0) * (0.15 + 3.0 * f), 1.0); }"})),x.visible=!1,m.visible=!1,this.globalRoot.add(x,m));const E=new Fu(e,this.patchQuality),y=new Sc(e,this.debrisQuality,Ac(e)),A=new N_(e),T=Sr({...n,noiseScale:n.noiseScale*2.5,bump:n.bump*e.riLocal},{planet:a}),g=new xt(c!==void 0?Fs(Math.min(U_,c/e.unit)/e.riLocal):this.sphere,T);g.scale.setScalar(e.riLocal);const b=new Xn;return b.add(g),this.localRoot.add(E.mesh,b,A.group,...y.objects),{patch:E,debris:y,effects:A,gSurface:o,gSurfaceMat:s,gImpactor:u,gImpactorMat:l,beacon:p,trail:d,gGlow:_,lFrame:b,lImpactor:g,beam:c!==void 0,lImpactorMat:T,surfaceLook:t,impactorLook:n,bubbleVoid:x,bubbleRim:m,fire:f,jet:v}}disposeShot(){this.bakeToken++,this.fractureView?.dispose(),this.fractureView=null,this.fractureReady=!1,this.fractureEligible=!1,this.holding=!1;const e=this.shot;e&&(e.patch.dispose(),e.debris.dispose(),e.effects.dispose(),e.gSurfaceMat.dispose(),e.beam&&(e.gImpactor.geometry.dispose(),e.lImpactor.geometry.dispose()),e.gImpactorMat.dispose(),e.lImpactorMat.dispose(),e.bubbleVoid?.material?.dispose(),e.bubbleRim?.material?.dispose(),e.fire?.material?.dispose(),e.jet&&(e.jet.geometry.dispose(),e.jet.material.dispose()),e.beacon.material.dispose(),e.gGlow.material.dispose(),e.trail.geometry.dispose(),e.trail.material.dispose(),this.globalRoot.clear(),this.localRoot.clear(),this.shot=null)}startFracture(e){this.bakeToken++,this.fractureReady=!1,this.fractureEligible=Ac(e),this.fractureEligible&&this.bakeFracture(e,this.bakeToken)}async bakeFracture(e,t){const n=new MessageChannel,r=()=>new Promise(a=>{n.port1.onmessage=()=>a(),n.port2.postMessage(0)});try{const a=await w_();if(await r(),t!==this.bakeToken)return;const s=C_(e,this.fractureQuality);if(await r(),t!==this.bakeToken)return;const o=new R_(a,e,s);for(;!o.step(15);)if(await r(),t!==this.bakeToken){o.dispose();return}if(t!==this.bakeToken)return;const l=new P_(o.bake,e);this.localRoot.add(l.group),this.fractureView=l,this.fractureReady=!0,this.holding=!1,this.seek(this.time)}catch(a){if(t!==this.bakeToken)return;console.warn("Smash Lab: breakup simulation unavailable, using simple fragments",a),this.fractureEligible=!1,this.holding=!1;const s=this.shot;s&&(this.localRoot.remove(...s.debris.objects),s.debris.dispose(),s.debris=new Sc(e,this.debrisQuality,!1),this.localRoot.add(...s.debris.objects)),this.seek(this.time)}}apply(e){const t=this.plan,n=this.shot;if(!t||!n)return;const r=t.timeline,a=t.patchIsWholeSphere,s=(r.approachEnd+r.cutEnd)/2,o=(r.impactEnd+r.returnEnd)/2,l=!(t.bubble||t.blast)&&e>=s&&(a||e<o);this.globalRoot.visible=!l,this.localRoot.visible=l,this.fadeEl.style.opacity=String(t.bubble||t.blast?0:Math.max(Bs(e,r.approachEnd,r.cutEnd),a?0:Bs(e,r.impactEnd,r.returnEnd)));let c,u;l?(c=this.applyLocal(t,n,e),u=t.unit):(c=this.applyGlobal(t,n,e),u=t.surface.radius),this.stars.position.copy(this.camera.position),this.updateHud(t,l,e,c,u)}applyGlobal(e,t,n){const r=e.timeline,a=e.global,s=e.riGlobal,o=!(e.bubble||e.blast)&&n>r.cutEnd,l=o?n-r.returnEnd:0,c=new I(...e.dir),u=e.surfaceOutcome.glow,p=new I(0,s,0);let h=!(e.bubble||e.blast);const d=p.clone();if(o)if(e.impactorSurvives){const N=(a.startDistance-a.cutDistance)/r.approachEnd;e.bounce?d.add(new I(...e.bounce).multiplyScalar(N*(Math.max(l,0)+.3))):d.y=s*.4}else h=!1;else{const N=Cn(n/r.approachEnd),K=kn(a.startDistance,a.cutDistance,N);d.addScaledVector(c,-K)}const _=h&&(t.beam||s>2e-4);t.gImpactor.visible=_,t.gImpactor.position.copy(d),t.gImpactor.scale.setScalar(t.beam?Math.max(s,Pc):Math.max(s,1e-6)),t.beam&&t.gImpactor.quaternion.setFromUnitVectors(new I(1,0,0),c),t.gSurface.rotation.y=0,t.gSurface.scale.setScalar(e.merge&&o?e.merge.scale:1);const x=e.blast,m=Math.max(0,n-.3),f=e.bubble?B_*Math.pow(Cn(n/z_),1.7):x?x.removed*Rn(m/3.2):0;if(t.gSurfaceMat.uniforms.uBubble.value.set(0,0,0,f),t.bubbleVoid&&t.bubbleRim){const N=f>1e-5;t.bubbleVoid.visible=N,t.bubbleRim.visible=N,t.bubbleVoid.scale.setScalar(Math.max(f,1e-6)),t.bubbleRim.scale.setScalar(Math.max(f,1e-6)*1.06)}if(x&&t.fire){const N=O_[x.kind],K=x.fire*Rn(m/3.2),W=N.gain*xn(0,.25,m)*(.1+.9*(1-xn(3.5,9,n)));t.fire.visible=n>=.3&&W>.002,t.fire.scale.setScalar(Math.max(K,1e-5));const j=t.fire.material.uniforms;if(j.uColor.value.set(...N.color),j.uGain.value=W,t.jet){const Q=4*(1-xn(.9,1.9,n));t.jet.visible=Q>.01,t.jet.material.color.setRGB(.8*Q,.55*Q,1.4*Q)}t.gSurfaceMat.uniforms.uHeatAdd.value=x.heat*xn(.3,2,n)*(1-.5*xn(6,11,n))}{const N=t.gSurfaceMat.uniforms,K=e.strange&&n>r.contact;N.uStrangeAmt.value=K?1:0,N.uStrangeFront.value=K?2.7*Rn((n-r.contact)/5):0,N.uTime.value=n}const v=o?1:0,E=kn(-.4+.06*Math.sin(n*.35),-.15,v),y=kn(.24,.95,v),A=new I(...a.cameraTarget).lerp(new I(0,-.45,0),v),T=1-.07*Rn(n/r.end),g=a.cameraDistance*T*kn(1,.72,v);this.camera.position.set(A.x+g*Math.sin(E)*Math.cos(y),A.y+g*Math.sin(y),A.z+g*Math.cos(E)*Math.cos(y)),this.camera.near=.05,this.camera.far=400,this.camera.lookAt(A),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld();const b=this.camera.position.distanceTo(d),C=s*this.pixelScale/Math.max(b,1e-6)/this.renderer.getPixelRatio(),R=h&&!o;if(t.beacon.visible=R,t.beacon.position.copy(d),t.beacon.material.opacity=Cn(1.2-C/10),t.beacon.material.color.setScalar(2.4),t.trail.visible=R&&!t.beam,R&&!t.beam){const N=.35+.5*(1-Cn(n/r.approachEnd)),K=d.clone().addScaledVector(c,-N);t.trail.geometry.getAttribute("position").set([d.x,d.y,d.z,K.x,K.y,K.z]),t.trail.geometry.getAttribute("position").needsUpdate=!0}const D=e.deform.kind==="none"?0:e.deform.radius*e.unit/e.surface.radius,O=D>.002?Math.min(D,1.3):0,V=o&&O>0,L=t.gSurfaceMat.uniforms;L.uScarAng.value=V?O*Rn(l/.5):0,L.uScarHeat.value=V?u*1*xi(l+.05,u):0;const G=e.deform.kind==="crater"||e.impactorFate==="shatter"||e.impactorFate==="vaporize"||e.impactorFate==="merge",X=o&&G;if(t.gGlow.visible=X,X){const N=Math.max(.05,3.2*Math.max(D,s*1.5,.004))*(.5+.5*Math.min(1,u*2)),K=Math.exp(-l/(.5+1.5*u))*xn(0,.08,l);t.gGlow.position.set(0,.01,0),t.gGlow.scale.setScalar(N*(1+.8*Rn(l/1.5))),t.gGlow.material.opacity=1,t.gGlow.material.color.setScalar((.6+5*u)*K)}return g}applyMerge(e,t,n){const r=e.merge;if(!r)return;const a=t.patch.material.uniforms,s=e.patchIsWholeSphere,o=r.glow*xi(n,r.glow);if(a.uHeatAdd.value=o*(s?1:.35),!s)return;const l=r.scale>=1?.3:1.9,c=Rn((n-l)/2.2),u=.05*Bs(n,.15,1.6)*(r.blackHole?0:1),p=kn(1,r.scale,c)*(1+u),h=-e.rsLocal;t.patch.mesh.scale.setScalar(p),t.patch.mesh.position.set(0,h*(1-p),0);const d=xn(.4,3,n)*r.impactorShare,_=a,x=t.surfaceLook.colorA.clone().lerp(t.impactorLook.colorA,d),m=t.surfaceLook.colorB.clone().lerp(t.impactorLook.colorB,d);if(t.surfaceLook.emissive>0&&d>0){const v=new De(1,.82,.55);for(const E of[x,m]){const y=.2126*E.r+.7152*E.g+.0722*E.b;E.lerp(v.clone().multiplyScalar(y*1.15),.7)}}const f=r.blackHole?xn(1.5,2.1,n):0;_.uColorA.value.copy(x.multiplyScalar(1-f)),_.uColorB.value.copy(m.multiplyScalar(1-f)),a.uEmissive.value=t.surfaceLook.emissive*(1-f),r.blackHole&&(a.uPlanet.value=n>1.8?9:Ta(e.surface.id))}applyLocal(e,t,n){const r=e.timeline,a=n-r.contact,s=e.riLocal,o=new I(...e.dir),l=e.surfaceOutcome,c=e.impactorOutcome,u=e.local.startDistance/Ha;t.patch.setProgress(a/Lc);const p=this.fractureReady?this.fractureView:null,h=p?.hasSource("impactor")??!1,d=p?.hasSource("surface")??!1;t.patch.mesh.visible=a<0||(d?!1:!e.surfaceDestroyed||a<.012);const _=t.patch.material.uniforms;if(_.uHeat.value=xi(a,e.merge?Math.max(l.glow,e.merge.glow):l.glow),_.uTime.value=n,e.merge&&this.applyMerge(e,t,a),e.strange){const N=e.patchIsWholeSphere?2*e.rsLocal+2:$i*1.3;_.uStrangeAmt.value=a>0?1:0,_.uStrangeFront.value=a>0?N*Rn(a/3):0}const x=new I(0,s,0);let m=0;if(a<0||t.beam)x.addScaledVector(o,u*a);else{const N=Cn(a/Xi);if(m=e.permanentSquash*xn(0,1,N)+(e.peakSquash-e.permanentSquash)*Math.sin(Math.PI*N),x.addScaledVector(o,s*m*.9),a>Xi&&e.merge)x.y-=Rn((a-Xi)/1.5)*2.6*s;else if(a>Xi)if(e.bounce){const W=.9*u*.9*(1-Math.exp(-(a-Xi)/.9));x.add(new I(...e.bounce).multiplyScalar(W))}else{const K=e.deform.kind==="none"?0:e.deform.depth,W=Math.min(x.y,-K+.9*s);x.y=kn(x.y,W,Rn((a-Xi)/Lc))}}const f=a<0||(t.beam?a<.45:h?!1:e.merge?a<1.9:e.impactorSurvives||a<.012);t.lImpactor.visible=f,t.lFrame.visible=f,t.lFrame.position.copy(x),t.lFrame.quaternion.setFromUnitVectors(new I(1,0,0),o);const v=1-m,E=1/Math.sqrt(Math.max(v,.2));t.lFrame.scale.set(v,E,E),t.beam||t.lImpactor.rotation.set(.6*n,.9*n,.2*n);const y=t.lImpactorMat.uniforms;y.uHeatAdd.value=e.merge?e.merge.glow*xi(a,e.merge.glow):e.impactorSurvives?c.glow*xi(a,c.glow):0,y.uTime.value=n,p&&(p.setHeat("impactor",c.glow*xi(a,c.glow)),p.setHeat("surface",l.glow*xi(a,l.glow)),p.update(a)),t.debris.update(a,this.pixelScale),t.effects.update(a);const A=e.local,T=xn(.1,3.4,a),g=Cn(-a/Ha),b=1+.9*g,C=kn(A.cameraNear*b,A.cameraFar,T),R=kn(.32,.75,T),D=kn(.26,.55,T),O=e.patchIsWholeSphere?new I(0,-e.rsLocal*.55,0):new I(0,.05,0),V=new I(0,.35*A.focus,0).lerp(O,T).lerp(x,.55*g);let L=C;if(p&&T>0){const N=p.cloud(a),K=(d?.85:.35)*T;V.lerp(new I(N.x,N.y,N.z),K),L=Math.min(80,Math.max(C,T*(N.radius*3.2+2)))}const G=Math.min(1,Math.max(l.glow,c.glow,e.merge?e.merge.glow:0,e.deform.kind==="crater"?.4:0)),X=a>0?.03*A.focus*G*Math.exp(-a/.3):0;return this.camera.position.set(V.x+L*Math.sin(R)*Math.cos(D)+X*Math.sin(a*71),V.y+L*Math.sin(D)+X*Math.sin(a*53+1),V.z+L*Math.cos(R)*Math.cos(D)+X*Math.sin(a*47+2)),this.camera.near=Math.max(.005,Math.min(.05,A.cameraNear*.01)),this.camera.far=400,this.camera.lookAt(V),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld(),L}updateHud(e,t,n,r,a){const s=e.timeline;let o;e.bubble?o="THE ANTI-BUBBLE EXPANDS":e.blast?o={grb:"GAMMA-RAY BURST",supernova:"SUPERNOVA",hypernova:"HYPERNOVA",bigBang:"THE BIG BANG"}[e.blast.kind]:n<s.approachEnd?o="APPROACH · wide view":n<s.contact?o="CLOSE-UP · final approach (slow motion)":t&&n<s.impactEnd?o="IMPACT":o="AFTERMATH",this.labelEl.textContent=this.holding?"PREPARING BREAKUP…":o;const l=this.height/(2*Math.tan(Os*Math.PI/360))/r,c=a/l,u=110*c,p=u>=1e16?Dc(u/zs)*zs:Dc(u),h=p/c;this.barEl.style.width=`${Math.round(h)}px`,this.barLabelEl.textContent=si(p)}}const Ou=[{label:"Baseball vs bowling ball",projectile:"baseball",target:"bowling",speed:40,angle:90},{label:"Marble crash",projectile:"marble",target:"marble",speed:45,angle:90},{label:"Meteor Crater",projectile:"ironMeteoroid",target:"earth",speed:12800,angle:45},{label:"Dinosaur-killer asteroid",projectile:"asteroid",target:"earth",speed:2e4,angle:45},{label:"Moon hits Earth",projectile:"moon",target:"earth",speed:3e4,angle:90},{label:"Dust grain vs Earth",projectile:"dust",target:"earth",speed:2e4,angle:90},{label:"Egg drop",projectile:"egg",target:"boulder",speed:6,angle:90},{label:"Watermelon splat",projectile:"watermelon",target:"boulder",speed:12,angle:90},{label:"Head-on car crash",projectile:"car",target:"car",speed:30,angle:90},{label:"Snowball vs house",projectile:"snowball",target:"house",speed:20,angle:60},{label:"Diamond vs gold",projectile:"diamond",target:"goldBar",speed:300,angle:90},{label:"Jumbo jet vs Empire State",projectile:"boeing",target:"empire",speed:250,angle:90},{label:"Liberty vs Eiffel Tower",projectile:"liberty",target:"eiffel",speed:80,angle:90},{label:"Chelyabinsk meteor",projectile:"chelyabinsk",target:"earth",speed:19e3,angle:18},{label:"Halley's Comet hits Venus",projectile:"halley",target:"venus",speed:7e4,angle:45},{label:"Vesta hits Mars",projectile:"vesta",target:"mars",speed:1e4,angle:45},{label:"Io vs Europa",projectile:"io",target:"europa",speed:2e4,angle:90},{label:"Comet hits Jupiter",projectile:"comet",target:"jupiter",speed:6e4,angle:45},{label:"Asteroid falls into the Sun",projectile:"asteroid",target:"sun",speed:617e3,angle:60},{label:"Jupiter vs the Sun",projectile:"jupiter",target:"sun",speed:617e3,angle:90},{label:"Earth meets a black hole",projectile:"earth",target:"stellarBH",speed:2e7,angle:90},{label:"Neutron star hits Earth",projectile:"neutronStar",target:"earth",speed:76e5,angle:90},{label:"The Sun hits Betelgeuse",projectile:"sun",target:"betelgeuse",speed:1e6,angle:90},{label:"Godzilla's atomic breath hits Earth",projectile:"atomicBreath",target:"earth",speed:2998e5,angle:60},{label:"Anti-Gravity Orb hits Earth",projectile:"antiGravityOrb",target:"earth",speed:4e5,angle:90},{label:"Supernova next to Earth",projectile:"supernova",target:"earth",speed:1,angle:60},{label:"Hypernova vs the Sun",projectile:"hypernova",target:"sun",speed:1,angle:60},{label:"Gamma-ray burst hits Earth",projectile:"grb",target:"earth",speed:1,angle:50},{label:"Big Bang vs the Milky Way",projectile:"bigBang",target:"milkyWay",speed:1,angle:60},{label:"Oh-My-God particle hits Earth",projectile:"omgParticle",target:"earth",speed:2998e5,angle:90},{label:"Amaterasu particle hits Earth",projectile:"amaterasu",target:"earth",speed:2998e5,angle:45},{label:"Planet into TON 618",projectile:"jupiter",target:"ton618",speed:1e8,angle:90},{label:"Milky Way meets Andromeda",projectile:"milkyWay",target:"andromeda",speed:11e4,angle:90},{label:"Two galaxy clusters collide",projectile:"virgoCluster",target:"coma",speed:45e5,angle:90},{label:"Milky Way falls into a black hole",projectile:"milkyWay",target:"trillionBH",speed:3e7,angle:90},{label:"The Sun crosses the Orion Nebula",projectile:"sun",target:"orion",speed:2e4,angle:90},{label:"Our universe hits the Hyper Universe",projectile:"universe",target:"hyperUniverse",speed:2e8,angle:90},{label:"MEVE-1 meets PHYVE-1-LOC",projectile:"meve1",target:"phyve1",speed:2e8,angle:90},{label:"Universe-mass black hole eats the universe",projectile:"universe",target:"universeBH",speed:2e8,angle:90}],G_=0,H_=8.4,Bu=document.getElementById("app");if(!Bu)throw new Error("Smash Lab: #app element missing");const Ic=th.map(i=>{const e=Oc.filter(t=>t.group===i).map(t=>`<option value="${t.id}">${t.emoji} ${t.name}</option>`).join("");return`<optgroup label="${i}">${e}</optgroup>`}).join("");Bu.innerHTML=`
  <header class="top">
    <a href="/" class="back">← Kids at Home</a>
    <span class="tag">EXPERIMENT 01 / SMASH LAB</span>
  </header>
  <main>
    <section class="intro">
      <h1>Smash Lab</h1>
      <p>Pick two objects, choose how fast one hits the other, and see what the energy does to each.</p>
    </section>
    <div class="layout">
      <section class="panel controls" aria-label="Setup">
        <h2>Setup</h2>
        <label for="projectile">Launched object</label>
        <select id="projectile">${Ic}</select>
        <p class="blurb" id="projectile-blurb"></p>
        <label for="target">Target object</label>
        <select id="target">${Ic}</select>
        <p class="blurb" id="target-blurb"></p>
        <div class="row"><label for="speed">Speed</label><output id="speed-out" for="speed"></output></div>
        <input id="speed" type="range" min="${G_}" max="${H_}" step="0.01">
        <p class="hint" id="speed-hint" hidden></p>
        <div class="row"><label for="angle">Impact angle</label><output id="angle-out" for="angle"></output></div>
        <input id="angle" type="range" min="10" max="90" step="1">
        <p class="hint">90° is head-on; low angles graze the surface.</p>
        <h3>Try one</h3>
        <div class="presets" id="presets"></div>
      </section>
      <section class="panel stagebox" aria-label="3D view">
        <div class="stage" id="stage"></div>
        <div class="stage-controls">
          <button type="button" id="launch" class="launch">▶ Launch</button>
          <input id="scrub" type="range" min="0" max="1000" value="0" aria-label="Playback position">
        </div>
        <p class="stage-note" id="stage-note" hidden></p>
      </section>
      <section class="panel results" aria-label="Result">
        <div id="energy" class="energy" aria-live="polite"></div>
        <div class="cards" id="cards" aria-live="polite"></div>
        <p class="footnote">Estimates from standard impact physics (crater scaling, catastrophic-disruption
          thresholds, shock heating), tuned to match Meteor Crater and the Chicxulub impact. Real craters
          vary; expect answers within a factor of two or so for big impacts.</p>
      </section>
    </div>
  </main>`;const _t=i=>{const e=document.getElementById(i);if(!e)throw new Error(`Smash Lab: #${i} missing`);return e},Ja=_t("projectile"),Qa=_t("target"),es=_t("speed"),ts=_t("angle"),zu=()=>Math.pow(10,Number(es.value));function ku(i,e){if([i,e].some(a=>a.special==="antiBubble"||a.special==="blast"))return{speed:1,floor:0,raised:!1,stationary:!0};const t=zc(i,e);if(t!==void 0)return{speed:En,floor:0,raised:!1,fixedGamma:t};const n=ju(i.mass,i.radius,e.mass,e.radius),r=zu();return{speed:Math.max(r,n),floor:n,raised:n>r}}const V_=i=>String(Math.log10(i));function Nc(i,e,t,n,r=!1){const a=vh(i,e,n.effect,n.repelled),s=a?null:_h(i,e,n.merge,n.supernova),o=a??s??gh(i,e,t),l=Object.keys(vt).map(h=>`<i class="${vt[h]<=vt[t.regime]?"on":""}"></i>`).join(""),c=[...a?a.facts:s?s.facts:xh(i,t)];if(n.effect==="blast"&&i.special!=="blast"&&c.unshift(n.blastFraction>=1?`The blast is ${Fe(n.blastFraction)} times the energy needed to vaporize it`:`The blast is ${Fe(n.blastFraction*100)}% of the energy needed to vaporize it`),i.special==="antiBubble"&&c.unshift("Mass: none. Size: none, it grows from a point from the moment you launch.","Never moves. Deletes everything it touches."),i.special==="strangeOrb"&&c.unshift("Mass: −0 (none). Radius: 70 m.","Turns whatever it touches into green strange matter."),i.antimatter){const h=66743e-15*i.mass/(i.radius*i.radius);c.unshift(`Pushes everything away exactly as hard as the Moon pulls it in (the Moon pulls 1.62 m/s² at its surface; at the orb's own surface the push is ${Fe(h)} m/s²)`,`Antimatter: every kilogram that touches ordinary matter turns both into ${Fe(2*898755e11)} J (E = 2mc²)`)}i.temperatureC!==void 0&&c.unshift(`Temperature: ${i.temperatureC.toLocaleString("en-US")} °C`),r&&i.energyEv!==void 0&&i.length!==void 0&&c.unshift(`Carries ${Tr(i.energyEv*1602176634e-28,i.energyEv*1602176634e-28/4184e9)} whatever it hits`);const u=c.map(h=>`<li>${h}</li>`).join(""),p=i.special==="blast"?`releases ${Tr(i.blastJ??0,(i.blastJ??0)/4184e9)}`:i.special==="antiBubble"?"no mass · no fixed size, it grows":i.length!==void 0?`${si(i.radius*2)} wide · ${si(i.length)} long · ${cn(i.mass)}`:`${i.shownRadius??si(i.radius)} radius · ${i.shownMass??cn(i.mass)}`;return`
    <article class="card tone-${o.tone}">
      <header><span class="emoji" aria-hidden="true">${i.emoji}</span>
        <div><h3>${i.name}</h3><small>${p}</small></div></header>
      <div class="badge">${o.label}</div>
      <div class="meter" role="img" aria-label="Damage level ${vt[t.regime]+1} of 7">${l}</div>
      <p class="blurb">${o.blurb}</p>
      <ul>${u}</ul>
    </article>`}const Uc=new URLSearchParams(location.search),Ki=_t("launch"),yr=_t("scrub");let Kt=null;try{const i=window.matchMedia("(max-width: 700px)").matches;Kt=new k_(_t("stage"),{quality:Uc.get("q")==="low"||i?"low":"high"}),Uc.has("debug")&&(window.__smashStage=Kt)}catch(i){console.error("Smash Lab: 3D view unavailable",i);const e=_t("stage-note");e.hidden=!1,e.textContent="The 3D view needs WebGL2, which this browser could not start. The numbers below still work.",_t("stage").hidden=!0,Ki.disabled=!0,yr.disabled=!0}let Fc=0,ga=!1;function W_(i){if(!Kt)return;const e=Ra(Ja.value),t=Ra(Qa.value),n={projectile:e,target:t,speed:ku(e,t).speed,impactParameter:Math.cos(Number(ts.value)*Math.PI/180)},r=kc(n);r.repelled||(Kt.setShot(Ah(n,r)),Ki.textContent="▶ Launch",i&&Kt.play())}function Gu(i=!1){ga=ga||i,window.clearTimeout(Fc),Fc=window.setTimeout(()=>{W_(ga),ga=!1},i?0:160)}Kt&&(Kt.onTime=(i,e)=>{const t=Kt?.duration??1;yr.value=String(Math.round(i/t*1e3)),e&&(Ki.textContent="↺ Replay")},Ki.addEventListener("click",()=>{Kt?.replay(),Ki.textContent="↺ Replay"}),yr.addEventListener("input",()=>{Kt&&(Kt.pause(),Kt.seek(Number(yr.value)/1e3*Kt.duration))}));function Hu(){const i=Ra(Ja.value),e=Ra(Qa.value),t=ku(i,e),n=t.speed,r=Number(ts.value);_t("projectile-blurb").textContent=i.blurb,_t("target-blurb").textContent=e.blurb,es.disabled=t.fixedGamma!==void 0||t.stationary===!0,_t("speed-out").textContent=t.stationary?"It does not move":t.fixedGamma!==void 0?mh(t.fixedGamma):zr(n);const a=_t("speed-hint");a.hidden=t.stationary!==!0&&t.fixedGamma===void 0&&!t.raised&&t.floor<zu()*.3,t.stationary?a.textContent=[i,e].some(v=>v.special==="blast")?"An explosion does not fly anywhere: it goes off the moment you launch, so the speed slider is switched off.":"The Anti-Bubble never moves. It starts growing the moment you launch, so the speed slider is switched off.":t.fixedGamma!==void 0?a.textContent="Locked: this particle (or beam) always arrives at the speed real ones do, so the speed slider is switched off.":i.antimatter||e.antimatter?a.textContent=`The orb pushes everything away, so to touch it anything has to arrive at ${zr(t.floor)} or faster.`:a.textContent=t.raised?`Gravity alone pulls these two together at ${zr(t.floor)}, so they cannot meet any slower.`:`Gravity already pulls these two together at ${zr(t.floor)}; the speed above is the speed at impact.`,_t("angle-out").textContent=`${r}°`;const s=kc({projectile:i,target:e,speed:n,impactParameter:Math.cos(r*Math.PI/180)}),o=i.mass>=e.mass?i:e,l=s.merge!==null&&s.merge!==void 0,c=o.shownMass?`about ${o.shownMass}`:cn(l&&s.merge?s.merge.mass:i.mass+e.mass),u=l&&s.merge?` · radius ${o.shownRadius?`about ${o.shownRadius}`:si(s.merge.radius)}`:"",p=s.annihilatedMass>0,h=i.antimatter?i:e.antimatter?e:void 0,d=h?h.mass-s.annihilatedMass:0,_=i.special!==void 0?e:i,x=_.shownMass?`about ${_.shownMass}`:cn(_.mass),m=s.effect==="blast",f=s.blastFraction>=1?`Enough to vaporize it ${Fe(s.blastFraction)} times over`:`${Fe(s.blastFraction*100)}% of what it takes to vaporize it`;if(m)_t("energy").innerHTML=`<span>Energy released</span><strong>${Tr(s.energyJ,s.energyKilotons)}</strong>
    <span class="combined-label">Damage</span><strong class="combined">${f}</strong>
    <small>${i.special==="blast"?e.name:i.name} takes all of it.</small>`;else if(s.repelled||s.effect!=="none"){const[v,E,y,A]=s.repelled?["They never touch","Result","No collision","The Anti-Gravity Orb pushes away anything lighter than itself, and other orbs."]:s.effect==="deleted"?["No energy: nothing explodes","Deleted",`${x} of matter`,"The bubble grows past the whole object and deletes it."]:["No energy: it weighs nothing","Turned to strange matter",x,"Same mass as before, now green strange matter all the way through."];_t("energy").innerHTML=`<span>Impact energy</span><strong>${v}</strong>
    <span class="combined-label">${E}</span><strong class="combined">${y}</strong>
    <small>${A}</small>`}else _t("energy").innerHTML=`<span>Impact energy</span><strong>${Tr(s.energyJ,s.energyKilotons)}</strong>
    <small>Peak contact pressure ${bh(s.peakStressPa)} · bounce ${(s.restitution*100).toFixed(0)}%</small>
    <span class="combined-label">${p?"Annihilated":l?"Combined object":"Mass of both together"}</span><strong class="combined">${p?`${cn(s.annihilatedMass)} of matter + ${cn(s.annihilatedMass)} of antimatter`:c}</strong>
    <small>${p?d>.001*(h?.mass??1)?`${cn(d)} of the orb is left over`:"The whole orb is used up":l?`The two fuse into one body${u}`:s.supernova?"Nothing is left after the explosion":`${i.name} + ${e.name}`}</small>`;if(_t("cards").innerHTML=Nc(i,e,s.projectile,s,!0)+Nc(e,i,s.target,s),Kt){const v=_t("stage-note");v.hidden=!s.repelled,v.textContent="The Anti-Gravity Orb pushes this one away, so they can never touch. Pick something heavier than the orb (the Moon or bigger).",Ki.disabled=s.repelled,yr.disabled=s.repelled}}function Vu(i,e=!0){Ja.value=i.projectile,Qa.value=i.target,es.value=V_(i.speed),ts.value=String(i.angle),Hu(),Gu(e)}const X_=_t("presets");for(const i of Ou){const e=document.createElement("button");e.type="button",e.textContent=i.label,e.addEventListener("click",()=>Vu(i,!0)),X_.appendChild(e)}for(const i of[Ja,Qa,es,ts])i.addEventListener("input",()=>{Hu(),Gu()});Vu(Ou[2],!1);
