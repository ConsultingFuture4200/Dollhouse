(function() {
if (!window.THREE) {
document.getElementById("fallback").hidden = false;
return;
}
const T = THREE;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage = document.getElementById("stage");
let renderer;
try {
renderer = new T.WebGLRenderer({
antialias: true
});
} catch (e) {
document.getElementById("fallback").hidden = false;
return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.outputEncoding = T.sRGBEncoding;
stage.appendChild(renderer.domElement);
const scene = new T.Scene;
scene.background = new T.Color("#9fdcff");
scene.fog = new T.Fog("#9fdcff", 40, 90);
const camera = new T.PerspectiveCamera(42, 1, .1, 200);
scene.add(new T.HemisphereLight("#ffffff", "#9bd37a", .75));
const sun = new T.DirectionalLight("#fff4e0", .85);
sun.position.set(6, 14, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, {
left: -12,
right: 12,
top: 12,
bottom: -12,
near: 1,
far: 40
});
scene.add(sun);
const matCache = {};
const mat = (c, extra) => {
const k = c + JSON.stringify(extra || {});
if (!matCache[k]) matCache[k] = new T.MeshStandardMaterial(Object.assign({
color: c,
roughness: .7
}, extra || {}));
return matCache[k];
};
function mesh(geo, color, x, y, z, parent, opts) {
const m = new T.Mesh(geo, mat(color, opts));
m.position.set(x || 0, y || 0, z || 0);
m.castShadow = true;
m.receiveShadow = true;
(parent || scene).add(m);
return m;
}
const box = (w, h, d) => new T.BoxGeometry(w, h, d);
const ball = (r, s) => new T.SphereGeometry(r, s || 20, s ? Math.max(8, s / 2) : 14);
const cyl = (rt, rb, h, s) => new T.CylinderGeometry(rt, rb, h, s || 20);
const texCache = {};
function emojiTex(e, bubble) {
const k = e + (bubble ? "b" : "");
if (texCache[k]) return texCache[k];
const c = document.createElement("canvas");
c.width = c.height = 128;
const g = c.getContext("2d");
if (bubble) {
g.fillStyle = "#fffaf2";
g.strokeStyle = "#ff6fae";
g.lineWidth = 8;
g.beginPath();
g.arc(64, 60, 52, 0, Math.PI * 2);
g.fill();
g.stroke();
g.beginPath();
g.moveTo(52, 108);
g.lineTo(64, 126);
g.lineTo(76, 108);
g.fill();
}
g.textAlign = "center";
g.textBaseline = "middle";
g.font = (bubble ? 64 : 96) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
g.fillText(e, 64, bubble ? 64 : 68);
const t = new T.CanvasTexture(c);
t.encoding = T.sRGBEncoding;
return texCache[k] = t;
}
function makeSprite(e, bubble, size) {
const s = new T.Sprite(new T.SpriteMaterial({
map: emojiTex(e, bubble),
transparent: true,
depthTest: false
}));
s.scale.set(size, size, size);
s.renderOrder = 20;
return s;
}
const ground = mesh(new T.CircleGeometry(60, 48), "#8fd46a", 0, 0, 0);
ground.rotation.x = -Math.PI / 2;
const path = mesh(new T.RingGeometry(4.3, 5.9, 64), "#f3d9a4", 0, .01, 0);
path.rotation.x = -Math.PI / 2;
path.scale.set(1.15, .78, 1);
function tree(x, z, s) {
const g = new T.Group;
g.position.set(x, 0, z);
g.scale.setScalar(s);
scene.add(g);
mesh(cyl(.18, .24, 1.2, 10), "#a0683f", 0, .6, 0, g);
mesh(ball(.9, 16), "#5fbf55", 0, 1.7, 0, g);
mesh(ball(.65, 16), "#6ccc5e", .4, 2.3, .1, g);
mesh(ball(.12, 8), "#ff5a6e", .5, 1.8, .7, g);
mesh(ball(.12, 8), "#ff5a6e", -.4, 2.1, .6, g);
}
tree(-8.5, -2, 1.3);
tree(8.8, -1.5, 1.1);
tree(-10, 3, .9);
tree(11, 4, 1.2);
const flowerColors = [ "#ff6fae", "#ffc93c", "#b9a2ff", "#ff8f5a", "#ffffff" ];
for (let i = 0; i < 40; i++) {
const a = Math.random() * Math.PI * 2, r = 7.5 + Math.random() * 7;
const x = Math.cos(a) * r * 1.2, z = Math.sin(a) * r * .7 + 1;
if (z > 9) continue;
mesh(cyl(.02, .02, .3, 5), "#3f9a3a", x, .15, z);
mesh(ball(.1, 8), flowerColors[i % 5], x, .32, z);
}
const clouds = [];
for (let i = 0; i < 5; i++) {
const g = new T.Group;
g.position.set(-18 + i * 9, 10 + i % 2 * 2, -12 - i % 3 * 3);
scene.add(g);
[ [ 0, 0, 1.4 ], [ 1.3, -.2, 1 ], [ -1.3, -.2, 1.1 ], [ .5, .6, 1 ] ].forEach(p => {
const m = new T.Mesh(ball(p[2], 14), mat("#ffffff", {
roughness: 1
}));
m.position.set(p[0], p[1], 0);
g.add(m);
});
clouds.push(g);
}
const sunBall = new T.Mesh(ball(1.6, 24), new T.MeshBasicMaterial({
color: "#ffe066"
}));
sunBall.position.set(13, 13, -20);
scene.add(sunBall);
const house = new T.Group;
scene.add(house);
const W = 9, D = 3.4, FH = 2.4;
mesh(box(W + .4, .3, D + .3), "#e8b27d", 0, -.05, 0, house);
mesh(box(W, .18, D), "#e8b27d", 0, FH, 0, house);
mesh(box(W + .3, .18, D + .2), "#fff0f6", 0, FH * 2, 0, house);
mesh(box(.2, FH * 2, D + .1), "#ff9cc9", -W / 2 - .05, FH, 0, house);
mesh(box(.2, FH * 2, D + .1), "#ff9cc9", W / 2 + .05, FH, 0, house);
mesh(box(W + .3, .12, .12), "#ffffff", 0, FH + .02, D / 2, house);
mesh(box(W + .4, .14, .14), "#ffffff", 0, FH * 2, D / 2 + .05, house);
const rooms = [ {
x: -W / 4,
y: 0,
wall: "#bff0d6",
rug: "#ffd166"
}, {
x: W / 4,
y: 0,
wall: "#bfe6ff",
rug: "#ffffff"
}, {
x: -W / 4,
y: FH,
wall: "#e3d6ff",
rug: "#ffb3d1"
}, {
x: W / 4,
y: FH,
wall: "#fff1a8",
rug: "#9be7c4"
} ];
rooms.forEach(r => {
mesh(box(W / 2, FH, .12), r.wall, r.x, r.y + FH / 2, -D / 2, house);
mesh(box(1.1, .9, .06), "#ffffff", r.x - .9, r.y + 1.45, -D / 2 + .08, house);
mesh(box(.95, .75, .06), "#a9e3ff", r.x - .9, r.y + 1.45, -D / 2 + .1, house, {
emissive: "#4aa3d8",
emissiveIntensity: .15
});
mesh(box(.05, .75, .07), "#ffffff", r.x - .9, r.y + 1.45, -D / 2 + .12, house);
const rug = mesh(cyl(.9, .9, .03, 28), r.rug, r.x + .3, r.y + .1, .3, house);
rug.scale.set(1.3, 1, .8);
});
mesh(box(.12, FH - .1, 1.6), "#ffffff", 0, FH / 2, -D / 2 + .8, house);
mesh(box(.12, FH - .1, 1.6), "#ffffff", 0, FH + FH / 2, -D / 2 + .8, house);
mesh(box(.7, 1.6, .6), "#ffffff", -4, .8, -1.2, house);
mesh(box(.05, .4, .05), "#9aa", -3.7, 1.1, -.88, house);
mesh(cyl(.55, .55, .08, 24), "#ffffff", -2.1, .72, -.6, house);
mesh(cyl(.07, .07, .7, 8), "#c98b58", -2.1, .36, -.6, house);
mesh(box(.3, .2, .2), "#ff8f5a", -2, .86, -.7, house);
mesh(box(1.6, .55, .9), "#ffffff", 2.4, .33, .1, house);
mesh(box(1.4, .05, .7), "#7fd3ff", 2.4, .58, .1, house, {
emissive: "#3aa8e0",
emissiveIntensity: .2
});
for (let i = 0; i < 5; i++) mesh(ball(.1, 10), "#ffffff", 1.9 + i * .25, .64, .1 + Math.sin(i) * .2, house);
mesh(ball(.14, 12), "#ffd400", 3, .68, .3, house);
mesh(ball(.09, 10), "#ffd400", 3.1, .82, .3, house);
mesh(new T.ConeGeometry(.04, .1, 8), "#ff8f1f", 3.19, .82, .3, house).rotation.z = -Math.PI / 2;
const crib = new T.Group;
crib.position.set(-2.4, FH + .09, .1);
house.add(crib);
mesh(box(1.4, .12, .8), "#ffffff", 0, .35, 0, crib);
mesh(box(1.3, .1, .7), "#bfe6ff", 0, .43, 0, crib);
for (let i = 0; i < 8; i++) {
mesh(cyl(.025, .025, .5, 6), "#ffffff", -.65 + i * .186, .6, -.38, crib);
}
[ [ -.7, -.4 ], [ .7, -.4 ], [ -.7, .4 ], [ .7, .4 ] ].forEach(p => mesh(cyl(.04, .04, .9, 8), "#ffffff", p[0], .45, p[1], crib));
mesh(box(1.45, .06, .06), "#ffffff", 0, .87, -.4, crib);
const blockCol = [ "#ff6fae", "#ffc93c", "#7fd3ff", "#9be7c4", "#b9a2ff" ];
for (let i = 0; i < 5; i++) mesh(box(.3, .3, .3), blockCol[i], 3.3 - i % 2 * .35, FH + .25 + Math.floor(i / 2) * .3, -.9, house).rotation.y = i * .3;
mesh(ball(.28, 20), "#ff5a6e", 1.3, FH + .37, -.8, house);
const RW = W / 2 + .7, RH = 2.6, RY = FH * 2 + .08;
const slope = Math.hypot(RW, RH), ang = Math.atan2(RH, RW);
const roofL = mesh(box(slope + .25, .18, D + .8), "#ff6fae", -RW / 2, RY + RH / 2 + .06, 0, house);
roofL.rotation.z = ang;
const roofR = mesh(box(slope + .25, .18, D + .8), "#ff6fae", RW / 2, RY + RH / 2 + .06, 0, house);
roofR.rotation.z = -ang;
const gable = new T.Shape;
gable.moveTo(-RW + .2, 0);
gable.lineTo(RW - .2, 0);
gable.lineTo(0, RH - .1);
gable.lineTo(-RW + .2, 0);
mesh(new T.ShapeGeometry(gable), "#ffe3f0", 0, RY, -D / 2 - .04, house);
mesh(new T.CircleGeometry(.42, 24), "#a9e3ff", 0, RY + 1.05, -D / 2 + .01, house, {
emissive: "#4aa3d8",
emissiveIntensity: .15
});
const atticRug = mesh(cyl(1.3, 1.3, .03, 32), "#9be7c4", 0, RY + .04, .5, house);
atticRug.scale.set(1.6, 1, .7);
mesh(box(W + .3, .12, .12), "#ffffff", 0, RY + .05, D / 2 + .05, house);
mesh(box(.6, 1.2, .6), "#c96d8e", 3, FH * 2 + 1.8, -.6, house);
mesh(new T.ConeGeometry(.18, .35, 5), "#ffc93c", 0, FH * 2 + 2.85, 0, house);
function eyes(parent, y, z, r, spread) {
mesh(ball(r, 10), "#2b2140", -spread, y, z, parent);
mesh(ball(r, 10), "#2b2140", spread, y, z, parent);
mesh(ball(r * .35, 6), "#ffffff", -spread + r * .3, y + r * .3, z + r * .8, parent);
mesh(ball(r * .35, 6), "#ffffff", spread + r * .3, y + r * .3, z + r * .8, parent);
}
function makeMommy() {
const g = new T.Group;
g.userData.kind = "mommy";
mesh(new T.ConeGeometry(.5, 1.15, 24), "#b07cff", 0, .6, 0, g);
mesh(cyl(.52, .52, .08, 24), "#ffffff", 0, .06, 0, g);
mesh(ball(.2, 14), "#b07cff", 0, 1.12, 0, g);
const armL = mesh(cyl(.06, .06, .55, 8), "#f6c9a8", -.26, .9, .05, g);
armL.rotation.z = .5;
const armR = mesh(cyl(.06, .06, .55, 8), "#f6c9a8", .26, .9, .05, g);
armR.rotation.z = -.5;
g.userData.armR = armR;
mesh(ball(.3, 20), "#f6c9a8", 0, 1.5, 0, g);
const hair = mesh(ball(.33, 20), "#6b3d24", 0, 1.56, -.06, g);
hair.scale.set(1, 1, .9);
mesh(ball(.16, 12), "#6b3d24", 0, 1.9, -.1, g);
mesh(ball(.07, 8), "#ff6fae", .12, 1.86, .02, g);
eyes(g, 1.52, .26, .045, .1);
mesh(ball(.05, 8), "#ff9fb8", -.17, 1.44, .23, g);
mesh(ball(.05, 8), "#ff9fb8", .17, 1.44, .23, g);
const smile = mesh(new T.TorusGeometry(.07, .015, 6, 12, Math.PI), "#c0395b", 0, 1.41, .28, g);
smile.rotation.z = Math.PI;
const hit = new T.Mesh(new T.CylinderGeometry(.6, .6, 2.1, 8), new T.MeshBasicMaterial({
transparent: true,
opacity: 0,
depthWrite: false
}));
hit.position.y = 1;
g.add(hit);
g.scale.setScalar(1.15);
return g;
}
const babyLooks = [ {
onesie: "#ffb3d1",
hair: "#6b3d24",
skin: "#f6c9a8"
}, {
onesie: "#9be7c4",
hair: "#f2c14e",
skin: "#ffd9bd"
}, {
onesie: "#7fd3ff",
hair: "#2b2140",
skin: "#c68a62"
}, {
onesie: "#ffd166",
hair: "#b5532b",
skin: "#f6c9a8"
}, {
onesie: "#c7b3ff",
hair: "#2b2140",
skin: "#8d5a3b"
}, {
onesie: "#ff9f7a",
hair: "#2b2140",
skin: "#5c3a24"
}, {
onesie: "#a8e6ff",
hair: "#d9a441",
skin: "#ffd9bd"
}, {
onesie: "#ffe08a",
hair: "#6b3d24",
skin: "#e0ac80"
}, {
onesie: "#b8f2a0",
hair: "#2b2140",
skin: "#c68a62"
}, {
onesie: "#f7a8ff",
hair: "#b5532b",
skin: "#f6c9a8"
}, {
onesie: "#ffb3d1",
hair: "#2b2140",
skin: "#8d5a3b"
}, {
onesie: "#7fd3ff",
hair: "#f2c14e",
skin: "#f6c9a8"
}, {
onesie: "#c7b3ff",
hair: "#6b3d24",
skin: "#e0ac80"
}, {
onesie: "#9be7c4",
hair: "#2b2140",
skin: "#5c3a24"
}, {
onesie: "#ffd166",
hair: "#d9a441",
skin: "#ffd9bd"
} ];
function makeBaby(i) {
const L = babyLooks[i];
const g = new T.Group;
g.userData.kind = "baby";
g.userData.index = i;
const body = new T.Group;
g.add(body);
g.userData.body = body;
const tummy = mesh(ball(.3, 18), L.onesie, 0, .3, 0, body);
tummy.scale.set(1, 1.05, .95);
mesh(ball(.1, 10), L.onesie, -.15, .08, .14, body);
mesh(ball(.1, 10), L.onesie, .15, .08, .14, body);
mesh(ball(.08, 10), L.skin, -.3, .38, .05, body);
mesh(ball(.08, 10), L.skin, .3, .38, .05, body);
mesh(ball(.27, 20), L.skin, 0, .78, 0, body);
mesh(ball(.09, 10), L.hair, 0, 1.04, .02, body);
mesh(ball(.07, 10), L.hair, .08, 1.07, .06, body);
eyes(body, .8, .23, .042, .09);
mesh(ball(.05, 8), "#ff9fb8", -.15, .72, .21, body);
mesh(ball(.05, 8), "#ff9fb8", .15, .72, .21, body);
const m = mesh(new T.TorusGeometry(.05, .014, 6, 12, Math.PI), "#c0395b", 0, .7, .26, body);
m.rotation.z = Math.PI;
const hit = new T.Mesh(ball(.6, 10), new T.MeshBasicMaterial({
transparent: true,
opacity: 0,
depthWrite: false
}));
hit.position.y = .55;
g.add(hit);
g.scale.setScalar(1.15);
return g;
}
const babySpots = [ [ -3.1, .1, .9 ], [ -1.1, .1, .9 ], [ 1.6, .1, 1 ], [ -2.75, FH + .62, .15 ], [ 2.1, FH + .1, .8 ], [ -2.1, .1, 1.4 ], [ 2.6, .42, .12 ], [ 2.75, .1, 1.45 ], [ -2.05, FH + .62, .15 ], [ -1.75, FH + .1, 1.35 ], [ 2.95, FH + .1, .15 ], [ 3, FH + .1, 1.45 ], [ -1.35, FH * 2 + .12, .6 ], [ 0, FH * 2 + .12, .95 ], [ 1.35, FH * 2 + .12, .6 ] ];
const babies = babySpots.map((p, i) => {
const b = makeBaby(i);
b.position.set(p[0], p[1], p[2]);
house.add(b);
b.userData.home = new T.Vector3(p[0], p[1], p[2]);
b.userData.need = null;
b.userData.bubble = null;
b.userData.jump = 0;
b.userData.spin = 0;
b.userData.busy = false;
return b;
});
const mommy = makeMommy();
mommy.position.set(.3, .1, 1.1);
house.add(mommy);
mommy.userData.jump = 0;
mommy.userData.wave = 0;
function makeTruck() {
const g = new T.Group;
g.userData.kind = "truck";
const body = new T.Group;
g.add(body);
g.userData.body = body;
mesh(box(2.3, .55, 1.2), "#ffffff", 0, 1, 0, body);
mesh(box(1.1, .62, 1.05), "#f3eaff", -.35, 1.58, 0, body);
mesh(box(.06, .45, .9), "#a9e3ff", .22, 1.6, 0, body, {
emissive: "#4aa3d8",
emissiveIntensity: .2
});
mesh(box(.8, .4, .04), "#a9e3ff", -.4, 1.6, .53, body);
mesh(box(.8, .4, .04), "#a9e3ff", -.4, 1.6, -.53, body);
[ "#ff5a6e", "#ff8f5a", "#ffc93c", "#6fdc8c", "#6fb8ff", "#b07cff" ].forEach((c, i) => {
mesh(box(2.1, .07, .03), c, 0, 1.2 - i * .075, .61, body);
mesh(box(2.1, .07, .03), c, 0, 1.2 - i * .075, -.61, body);
});
const horn = mesh(new T.ConeGeometry(.12, .7, 16), "#ffd54a", 1, 1.55, 0, body, {
metalness: .3,
roughness: .35
});
horn.rotation.z = -.9;
mesh(ball(.13, 12), "#ffffff", 1.16, 1.08, .3, body);
mesh(ball(.13, 12), "#ffffff", 1.16, 1.08, -.3, body);
mesh(ball(.07, 10), "#2b2140", 1.26, 1.08, .3, body);
mesh(ball(.07, 10), "#2b2140", 1.26, 1.08, -.3, body);
mesh(ball(.08, 10), "#ff9fb8", 1.17, .88, .42, body);
mesh(ball(.08, 10), "#ff9fb8", 1.17, .88, -.42, body);
[ "#ff6fae", "#ffc93c", "#7fd3ff", "#b07cff", "#6fdc8c" ].forEach((c, i) => {
mesh(ball(.15, 10), c, .05 - i * .22, 1.95 - i * .03, 0, body);
});
mesh(new T.ConeGeometry(.1, .25, 8), "#ffffff", .05, 2.05, .2, body);
mesh(new T.ConeGeometry(.1, .25, 8), "#ffffff", .05, 2.05, -.2, body);
const wheels = [];
[ [ .78, .68 ], [ -.78, .68 ], [ .78, -.68 ], [ -.78, -.68 ] ].forEach(p => {
const w = new T.Group;
w.position.set(p[0], .52, p[1]);
g.add(w);
const tire = mesh(cyl(.52, .52, .42, 20), "#3a3350", 0, 0, 0, w);
tire.rotation.x = Math.PI / 2;
const hub = mesh(cyl(.24, .24, .44, 12), "#b07cff", 0, 0, 0, w);
hub.rotation.x = Math.PI / 2;
mesh(box(.08, .4, .46), "#ffc93c", 0, 0, 0, w);
wheels.push(w);
});
g.userData.wheels = wheels;
const hit = new T.Mesh(box(3, 2.4, 2), new T.MeshBasicMaterial({
transparent: true,
opacity: 0,
depthWrite: false
}));
hit.position.y = 1.1;
g.add(hit);
return g;
}
const truck = makeTruck();
scene.add(truck);
const drive = {
rx: 7.2,
rz: 4.9,
parkA: .45,
a: .45,
t: 0,
dur: 5.5,
active: false
};
function placeTruck(a) {
const x = drive.rx * Math.cos(a), z = drive.rz * Math.sin(a) + .6;
const tx = -drive.rx * Math.sin(a), tz = drive.rz * Math.cos(a);
truck.position.set(x, 0, z);
truck.rotation.y = Math.atan2(-tz, tx);
}
let actx = null, soundOn = true;
function audio() {
if (!soundOn) return null;
if (!actx) {
try {
actx = new (window.AudioContext || window.webkitAudioContext);
} catch (e) {
return null;
}
}
if (actx.state === "suspended") actx.resume();
return actx;
}
function tone(freq, start, len, type, vol) {
try {
toneRaw(freq, start, len, type, vol);
} catch (e) {}
}
function toneRaw(freq, start, len, type, vol) {
const ctx = audio();
if (!ctx) return;
const o = ctx.createOscillator(), g = ctx.createGain();
o.type = type || "sine";
o.frequency.value = freq;
const t0 = ctx.currentTime + start;
g.gain.setValueAtTime(1e-4, t0);
g.gain.exponentialRampToValueAtTime(vol || .2, t0 + .02);
g.gain.exponentialRampToValueAtTime(1e-4, t0 + len);
o.connect(g);
g.connect(ctx.destination);
o.start(t0);
o.stop(t0 + len + .05);
}
const sfx = {
chime() {
[ 784, 988, 1175 ].forEach((f, i) => tone(f, i * .09, .35, "sine", .18));
},
giggle() {
[ 880, 1046, 932, 1175 ].forEach((f, i) => tone(f, i * .07, .1, "triangle", .12));
},
honk() {
tone(392, 0, .22, "square", .07);
tone(392, .3, .3, "square", .07);
tone(494, .3, .3, "square", .05);
},
yay() {
[ 523, 659, 784, 1046, 1318 ].forEach((f, i) => tone(f, i * .1, .4, "triangle", .14));
},
boop() {
tone(660, 0, .12, "sine", .15);
tone(990, .08, .15, "sine", .12);
},
gulp() {
sweep(320, 140, .18, "sine", .25);
},
squeak() {
sweep(900 + Math.random() * 300, 1700, .12, "sine", .1);
},
burp() {
sweep(140, 70, .35, "sawtooth", .12);
sweep(110, 60, .3, "square", .05);
},
boing() {
sweep(180, 620, .3, "triangle", .18);
},
daddy() {
tone(196, 0, .22, "triangle", .2);
tone(196, .26, .3, "triangle", .2);
tone(147, .26, .3, "sine", .12);
},
sister() {
[ 1046, 1318, 1568, 2093 ].forEach((f, i) => tone(f, i * .06, .25, "sine", .1));
},
grandma() {
[ 659, 784, 659, 523 ].forEach((f, i) => tone(f, i * .12, .25, "sine", .14));
},
grandpa() {
tone(165, 0, .25, "triangle", .2);
tone(220, .28, .35, "triangle", .18);
},
brother() {
sweep(220, 880, .25, "square", .05);
tone(660, .28, .15, "triangle", .12);
},
note(f) {
tone(f, 0, .7, "sine", .2);
tone(f * 2, 0, .5, "sine", .04);
}
};
function sweep(f1, f2, len, type, vol) {
try {
sweepRaw(f1, f2, len, type, vol);
} catch (e) {}
}
function sweepRaw(f1, f2, len, type, vol) {
const ctx = audio();
if (!ctx) return;
const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime;
o.type = type;
o.frequency.setValueAtTime(f1, t0);
o.frequency.exponentialRampToValueAtTime(f2, t0 + len);
g.gain.setValueAtTime(1e-4, t0);
g.gain.exponentialRampToValueAtTime(vol, t0 + .02);
g.gain.exponentialRampToValueAtTime(1e-4, t0 + len);
o.connect(g);
g.connect(ctx.destination);
o.start(t0);
o.stop(t0 + len + .05);
}
const soundBtn = document.getElementById("soundBtn");
soundBtn.addEventListener("click", () => {
soundOn = !soundOn;
soundBtn.textContent = soundOn ? "🔊" : "🔇";
if (soundOn) sfx.boop(); else hush();
});
const floaters = [];
function floatEmoji(e, pos, opts) {
const s = makeSprite(e, false, opts && opts.size || .55);
s.material = s.material.clone();
s.position.copy(pos);
scene.add(s);
floaters.push({
s: s,
v: new T.Vector3((Math.random() - .5) * .8, 1.4 + Math.random() * .6, 0),
life: 0,
max: opts && opts.life || 1.4
});
}
const confetti = [];
const confGeo = box(.12, .12, .03);
function confettiBurst(center, n) {
for (let i = 0; i < n; i++) {
const m = new T.Mesh(confGeo, mat(flowerColors[i % 5], {
roughness: .5
}));
m.position.copy(center);
scene.add(m);
confetti.push({
m: m,
v: new T.Vector3((Math.random() - .5) * 7, 4 + Math.random() * 5, (Math.random() - .2) * 4),
r: new T.Vector3(Math.random() * 8, Math.random() * 8, 0),
life: 0
});
}
}
const trail = [];
const trailGeo = ball(.14, 8);
const rainbow = [ "#ff5a6e", "#ff8f5a", "#ffc93c", "#6fdc8c", "#6fb8ff", "#b07cff" ];
let trailI = 0;
const NEEDS = [ "🍼", "🛁", "😴", "🧸" ];
function giveNeed(b) {
const need = NEEDS[Math.floor(Math.random() * NEEDS.length)];
b.userData.need = need;
const s = makeSprite(need, true, .95);
s.position.set(0, 1.75, 0);
b.add(s);
b.userData.bubble = s;
}
function spawnNeed() {
const free = babies.filter(b => !b.userData.need && !b.userData.busy);
if (!free.length || babies.filter(b => b.userData.need).length >= 4) return;
giveNeed(free[Math.floor(Math.random() * free.length)]);
}
let nextNeed = 5;
spawnNeed();
spawnNeed();
const queue = [];
const mom = {
state: "idle",
from: new T.Vector3,
to: new T.Vector3,
t: 0,
target: null
};
function requestCare(b) {
if (b.userData.busy) return;
b.userData.busy = true;
queue.push(b);
}
function startNext() {
const b = queue.shift();
if (!b) return;
mom.target = b;
mom.state = "moving";
mom.t = 0;
mom.from.copy(mommy.position);
const side = b.userData.home.x > 3 ? -.75 : .75;
mom.to.set(b.userData.home.x + side, b.userData.home.y > 4 ? FH * 2 + .12 : b.userData.home.y > 1 ? FH + .1 : .1, Math.min(b.userData.home.z + .35, 1.3));
mommy.rotation.y = side > 0 ? -.5 : .5;
}
let stars = 0;
const starEl = document.getElementById("stars"), starCount = document.getElementById("starCount");
function addStar() {
stars++;
starCount.textContent = stars;
starEl.classList.remove("pop");
void starEl.offsetWidth;
starEl.classList.add("pop");
if (stars % 5 === 0) {
setTimeout(() => {
sfx.yay();
confettiBurst(new T.Vector3(0, 3, 2), 80);
mommy.userData.jump = 1;
babies.forEach((b, i) => setTimeout(() => {
b.userData.jump = 1;
}, i * 120));
family.forEach((f, i) => setTimeout(() => {
f.userData.jump = 1;
f.userData.wave = 1.2;
}, 150 + i * 150));
}, 400);
}
}
function finishCare(b) {
const need = b.userData.need;
if (b.userData.bubble) {
b.remove(b.userData.bubble);
b.userData.bubble = null;
}
b.userData.need = null;
b.userData.busy = false;
b.userData.spin = 1;
b.userData.jump = 1;
const wp = new T.Vector3;
b.getWorldPosition(wp);
for (let i = 0; i < 4; i++) setTimeout(() => floatEmoji(i % 2 ? "💖" : "✨", wp.clone().add(new T.Vector3(0, 1.2, .3))), i * 110);
if (need) {
sfx.chime();
addStar();
}
}
const NUMW = [ "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten" ];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function say(text, keep) {
try {
if (!soundOn || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
if (!keep) speechSynthesis.cancel();
const u = new SpeechSynthesisUtterance(text);
u.rate = .85;
u.pitch = 1.15;
speechSynthesis.speak(u);
} catch (e) {}
}
function hush() {
try {
window.speechSynthesis && speechSynthesis.cancel();
} catch (e) {}
}
const miniEl = document.getElementById("mini"), arena = document.getElementById("arena");
const dotsEl = document.getElementById("dots"), miniBack = document.getElementById("miniBack");
const wordEl = document.getElementById("word");
let mg = null;
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = a => {
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[a[i], a[j]] = [ a[j], a[i] ];
}
return a;
};
function tapOn(node, fn) {
node.addEventListener("pointerdown", ev => {
ev.preventDefault();
ev.stopPropagation();
audio();
try {
fn(ev);
} catch (e) {
console.error(e);
}
});
}
function faceSVG(L) {
const eye = x => `<g><ellipse cx="${x}" cy="100" rx="10" ry="12" fill="#2b2140"/><circle cx="${x + 3}" cy="95" r="3.6" fill="#fff"/>\n      <rect class="lid" x="${x - 15}" y="84" width="30" height="30" fill="${L.skin}"/>\n      <path class="lash" d="M${x - 11} 104 q11 9 22 0" stroke="#2b2140" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
return `<svg class="face" viewBox="0 0 200 210" aria-hidden="true">\n      <ellipse cx="100" cy="196" rx="70" ry="28" fill="${L.onesie}"/>\n      <ellipse cx="24" cy="112" rx="13" ry="17" fill="${L.skin}"/><ellipse cx="176" cy="112" rx="13" ry="17" fill="${L.skin}"/>\n      <circle cx="100" cy="108" r="78" fill="${L.skin}"/>\n      <path d="M92 34 c-8 -22 22 -26 22 -8 c0 10 -12 10 -12 2" stroke="${L.hair}" stroke-width="9" fill="none" stroke-linecap="round"/>\n      ${eye(72)}${eye(128)}\n      <ellipse cx="50" cy="132" rx="14" ry="9" fill="#ff9fb8" opacity=".8"/><ellipse cx="150" cy="132" rx="14" ry="9" fill="#ff9fb8" opacity=".8"/>\n      <path class="m m-smile" d="M80 140 q20 20 40 0" stroke="#c0395b" stroke-width="7" fill="none" stroke-linecap="round"/>\n      <ellipse class="m m-o" cx="100" cy="148" rx="13" ry="15" fill="#c0395b"/>\n      <path class="m m-laugh" d="M74 136 q26 44 52 0 z" fill="#c0395b"/>\n      <path class="m m-sleep" d="M90 148 q10 6 20 0" stroke="#c0395b" stroke-width="6" fill="none" stroke-linecap="round"/>\n      <path class="m m-sad" d="M82 154 q18 -14 36 0" stroke="#c0395b" stroke-width="7" fill="none" stroke-linecap="round"/>\n    </svg>`;
}
function el(html) {
const d = document.createElement("div");
d.innerHTML = html.trim();
return d.firstChild;
}
function setDots(n) {
dotsEl.innerHTML = "";
dotsEl.hidden = n === 0;
for (let i = 0; i < n; i++) dotsEl.appendChild(el('<span class="dot"></span>'));
}
function fillDot(k) {
const d = dotsEl.children[k - 1];
if (d) d.classList.add("on");
}
function later(fn, ms) {
const id = setTimeout(() => {
try {
fn();
} catch (e) {
console.error(e);
}
}, ms);
if (mg) mg.timers.push(id);
return id;
}
function rel(node, fx, fy) {
const a = arena.getBoundingClientRect(), r = node.getBoundingClientRect();
return [ r.left - a.left + r.width * fx, r.top - a.top + r.height * fy ];
}
function puff(x, y, emoji) {
const p = el(`<div class="puff">${emoji}</div>`);
p.style.left = x + "px";
p.style.top = y + "px";
arena.appendChild(p);
setTimeout(() => p.remove(), 900);
}
function numPop(n, x, y) {
const p = el(`<div class="numpop">${n}</div>`);
p.style.left = x + "px";
p.style.top = y + "px";
arena.appendChild(p);
setTimeout(() => p.remove(), 1200);
}
function localXY(ev) {
const r = arena.getBoundingClientRect();
return [ ev.clientX - r.left, ev.clientY - r.top ];
}
tapOn(wordEl, () => {
if (!mg) return;
sfx.giggle();
wordEl.classList.remove("hopall");
void wordEl.offsetWidth;
wordEl.classList.add("hopall");
});
const GAMES = {
"🍼": gameFeed,
"🛁": gameBath,
"😴": gameSleep,
"🧸": gameToys
};
function openMini(baby, onDone, onCancel) {
const L = babyLooks[baby.userData.index];
const need = baby.userData.need;
startGame(`<span class="wbig">${need}</span>`, learn => GAMES[need](L, learn), onDone, onCancel);
}
function closeMini() {
if (!mg) return;
mg.timers.forEach(clearTimeout);
mg.cleanup.forEach(f => f());
miniEl.hidden = true;
arena.innerHTML = "";
}
function winMini(line) {
if (!mg || mg.done) return;
mg.done = true;
if (line) say(line);
sfx.yay();
arena.appendChild(el('<div class="win"><span>⭐</span></div>'));
const r = arena.getBoundingClientRect();
for (let i = 0; i < 8; i++) later(() => puff(rnd(.15, .85) * r.width, rnd(.2, .8) * r.height, i % 2 ? "💖" : "✨"), i * 90);
const cb = mg.onDone;
later(() => {
closeMini();
mg = null;
cb();
}, 2300);
}
tapOn(miniBack, () => {
if (!mg) return;
hush();
const cb = mg.onCancel;
closeMini();
mg = null;
cb();
});
const LEARN_CHANCE = .3;
function gameFeed(L, learn) {
const N = learn ? rint(3, 5) : 5;
let n = 0, busy = false;
arena.classList.add("g-feed");
const face = el(`<div class="facewrap" data-mouth="o">${faceSVG(L)}</div>`);
const marks = learn ? `<span class="marks">${"<i></i>".repeat(N - 1)}</span>` : "";
const bottle = el(`<button class="bottle" aria-label="Bottle"><span class="nip"></span><span class="glass"><span class="milk"></span>${marks}</span></button>`);
const point = el('<div class="point">👆</div>');
arena.append(face, bottle, point);
const milk = bottle.querySelector(".milk");
later(() => say(learn ? "Baby's hungry! Let's count the sips." : "Baby's hungry!"), 250);
tapOn(bottle, () => {
if (busy || mg.done || n >= N) return;
busy = true;
if (point.parentNode) point.remove();
const k = ++n;
bottle.classList.add("tip");
face.dataset.mouth = "o";
later(() => {
face.classList.add("gulp");
milk.style.height = 100 - k / N * 100 + "%";
sfx.gulp();
const [x, y] = rel(face, .5, .35);
if (learn) {
numPop(k, x, y);
say(NUMW[k]);
} else puff(x, y, pick([ "💕", "✨", "🤍" ]));
}, 260);
later(() => {
bottle.classList.remove("tip");
face.classList.remove("gulp");
busy = false;
if (k >= N) {
bottle.classList.add("empty");
face.dataset.mouth = "laugh";
later(() => {
sfx.burp();
const [x, y] = rel(face, .5, .2);
puff(x, y, "💨");
}, 300);
later(() => {
face.dataset.mouth = "smile";
winMini(learn ? `${cap(NUMW[N])} sips! All gone!` : "Burp! All full!");
}, 1100);
}
}, 700);
});
}
function gameBath(L, learn) {
const N = rint(3, 6);
let n = 0;
arena.classList.add("g-bath");
const face = el(`<div class="facewrap" data-mouth="sad">${faceSVG(L)}</div>`);
arena.append(face, el('<div class="tubwater"></div>'));
shuffle([ [ 30, 30 ], [ 66, 28 ], [ 24, 56 ], [ 76, 54 ], [ 50, 42 ], [ 38, 72 ], [ 62, 74 ] ]).slice(0, N).forEach(p => {
const m = el('<span class="mud"></span>');
m.style.left = p[0] + "%";
m.style.top = p[1] + "%";
m.style.setProperty("--s", rnd(.85, 1.2).toFixed(2));
m.style.borderRadius = `${rint(40, 60)}% ${rint(40, 60)}% ${rint(40, 60)}% ${rint(40, 60)}%`;
face.appendChild(m);
});
const sponge = el('<div class="sponge">🧽</div>');
arena.appendChild(sponge);
const ar = arena.getBoundingClientRect();
sponge.style.transform = `translate(${ar.width * .8 - 40}px, ${ar.height * .72 - 40}px)`;
const point = el('<div class="point rub">👆</div>');
arena.appendChild(point);
later(() => say("Uh oh, muddy baby! Scrub scrub!"), 250);
let down = false;
function scrub(ev) {
const [x, y] = localXY(ev);
sponge.style.transform = `translate(${x - 40}px, ${y - 40}px)`;
if (!down || mg.done) return;
const hit = document.elementFromPoint(ev.clientX, ev.clientY);
if (hit && hit.classList.contains("mud") && !hit.classList.contains("gone")) {
hit.classList.add("gone");
const k = ++n;
if (point.parentNode) point.remove();
puff(x, y, "🫧");
sfx.squeak();
if (learn) {
numPop(k, x, y - 30);
say(NUMW[k]);
}
if (k >= N) {
face.dataset.mouth = "laugh";
const duck = el('<div class="duck">🦆</div>');
arena.appendChild(duck);
later(() => sfx.squeak(), 350);
later(() => sfx.squeak(), 550);
later(() => winMini(learn ? `${cap(NUMW[N])} spots! Squeaky clean!` : "Squeaky clean!"), 700);
}
} else if (Math.random() < .1) puff(x, y, "🫧");
}
const onDown = ev => {
down = true;
try {
arena.setPointerCapture(ev.pointerId);
} catch (e) {}
scrub(ev);
};
const onUp = () => {
down = false;
};
arena.addEventListener("pointerdown", onDown);
arena.addEventListener("pointermove", scrub);
window.addEventListener("pointerup", onUp);
window.addEventListener("pointercancel", onUp);
mg.cleanup.push(() => {
arena.removeEventListener("pointerdown", onDown);
arena.removeEventListener("pointermove", scrub);
window.removeEventListener("pointerup", onUp);
window.removeEventListener("pointercancel", onUp);
});
}
function gameSleep(L, learn) {
const tune = [ 262, 262, 392, 392, 440, 440, 392 ];
const word = learn ? pick([ "NAP", "BED", "MOON", "HUSH" ]) : null;
const count = learn ? word.length : 6;
let i = 0;
arena.classList.add("g-sleep");
const face = el(`<div class="facewrap" data-mouth="smile">${faceSVG(L)}</div>`);
arena.append(el('<div class="moon">🌙</div>'), face);
let sky = null;
if (learn) {
sky = el(`<div class="skyword">${[ ...word ].map(c => `<span>${c}</span>`).join("")}</div>`);
arena.appendChild(sky);
}
const spots = shuffle([ [ 8, 22 ], [ 34, 8 ], [ 58, 16 ], [ 8, 48 ], [ 76, 40 ], [ 32, 32 ], [ 60, 42 ] ]);
const stars = [];
for (let k = 0; k < count; k++) {
const c = learn ? word[k] : "";
const s = el(`<button class="star" aria-label="Star"><span class="st">⭐</span>${c ? `<span class="sl">${c}</span>` : ""}</button>`);
s.dataset.letter = c;
s.style.left = spots[k][0] + "%";
s.style.top = spots[k][1] + "%";
s.style.animationDelay = k * .23 + "s";
arena.appendChild(s);
stars.push(s);
}
const markNext = () => {
if (learn) stars.forEach(s => s.classList.toggle("next", !s.classList.contains("caught") && s.dataset.letter === word[i]));
};
markNext();
later(() => say(learn ? `Night night. Tap the shiny star.` : `Night night. Tap the stars.`), 250);
stars.forEach(s => tapOn(s, () => {
if (s.classList.contains("caught") || mg.done) return;
if (learn && s.dataset.letter !== word[i]) {
s.classList.remove("nope");
void s.offsetWidth;
s.classList.add("nope");
return;
}
s.classList.add("caught");
sfx.note(tune[i % tune.length]);
if (learn) {
sky.children[i].classList.add("lit");
say(word[i]);
}
i++;
face.style.setProperty("--lid", Math.min(1, i / count).toFixed(2));
markNext();
if (i >= count) {
face.dataset.mouth = "sleep";
face.classList.add("asleep");
arena.appendChild(el('<div class="zzz">💤</div>'));
later(() => winMini(learn ? `${word.toLowerCase()}. Night night, baby.` : "Shhh. Night night, baby."), 800);
}
}));
}
function gameToys(L, learn) {
arena.classList.add("g-toys");
const face = el(`<div class="facewrap" data-mouth="smile">${faceSVG(L)}</div>`);
arena.appendChild(face);
let pile = null, have = 0;
const toysPool = shuffle([ "🧸", "🚂", "🎈", "🦆", "⚽", "🐶", "🦄" ]);
const total = learn ? 2 : 5;
const pileToy = learn ? pick([ "🦆", "🧸", "🎈" ]) : null;
if (learn) {
have = rint(1, 3);
pile = el(`<div class="pile">${`<span>${pileToy}</span>`.repeat(have)}</div>`);
arena.appendChild(pile);
later(() => say(`Baby has ${NUMW[have]}. Let's give one more!`), 250);
} else later(() => say("Baby wants to play!"), 250);
let given = 0, cur = null;
function spawn() {
if (mg.done) return;
if (cur) cur.remove();
const t = el(`<button class="toy" aria-label="Toy">${learn ? pileToy : toysPool[given % toysPool.length]}</button>`);
t.style.left = rnd(52, 76) + "%";
t.style.top = rnd(12, 56) + "%";
arena.appendChild(t);
cur = t;
const move = later(() => {
if (cur === t) spawn();
}, 3800);
tapOn(t, () => {
if (t.classList.contains("fly") || mg.done) return;
clearTimeout(move);
sfx.boing();
const target = learn ? pile : face;
const fr = target.getBoundingClientRect(), tr = t.getBoundingClientRect();
t.style.setProperty("--dx", fr.left + fr.width * (learn ? 1 : .5) - tr.left - tr.width / 2 + "px");
t.style.setProperty("--dy", fr.top + fr.height * (learn ? .5 : .6) - tr.top - tr.height / 2 + "px");
t.classList.add("fly");
face.dataset.mouth = "laugh";
later(() => sfx.giggle(), 250);
given++;
later(() => {
face.dataset.mouth = "smile";
t.remove();
if (cur === t) cur = null;
if (learn) {
const before = have;
have++;
pile.appendChild(el(`<span class="new">${pileToy}</span>`));
[ ...pile.children ].forEach((c, k) => later(() => {
c.classList.remove("count");
void c.offsetWidth;
c.classList.add("count");
}, k * 380));
say(`${cap(NUMW[before])}, and one more, makes ${NUMW[have]}!`);
if (given >= total) later(() => winMini(null), 400 + have * 380 + 1200); else later(spawn, 400 + have * 380 + 1e3);
} else if (given >= total) winMini("Wheee! Baby loves her toys!"); else spawn();
}, 650);
});
}
later(spawn, learn ? 2200 : 400);
}
function makePerson(o) {
const g = new T.Group;
g.userData.kind = "family";
g.userData.who = o.who;
const body = new T.Group;
g.add(body);
g.userData.body = body;
if (o.dress) {
mesh(new T.ConeGeometry(.42, .85, 24), o.shirt, 0, .62, 0, body);
mesh(cyl(.06, .06, .25, 8), o.skin, -.12, .13, 0, body);
mesh(cyl(.06, .06, .25, 8), o.skin, .12, .13, 0, body);
} else {
mesh(cyl(.1, .1, .6, 10), o.pants, -.13, .3, 0, body);
mesh(cyl(.1, .1, .6, 10), o.pants, .13, .3, 0, body);
mesh(cyl(.27, .3, .55, 16), o.shirt, 0, .84, 0, body);
}
if (o.apron) mesh(box(.34, .5, .04), o.apron, 0, .72, o.dress ? .24 : .29, body);
mesh(ball(.1, 10), o.shoes, -.13, .03, .06, body);
mesh(ball(.1, 10), o.shoes, .13, .03, .06, body);
function arm(side) {
const pivot = new T.Group;
pivot.position.set(side * .3, 1.08, 0);
body.add(pivot);
mesh(cyl(.06, .06, .5, 8), o.sleeve || o.shirt, 0, -.25, 0, pivot);
const hand = mesh(ball(.075, 8), o.skin, 0, -.52, 0, pivot);
pivot.rotation.z = side * .25;
return {
pivot: pivot,
hand: hand
};
}
const L = arm(-1), R = arm(1);
g.userData.armL = L.pivot;
g.userData.armR = R.pivot;
g.userData.hand = R.hand;
mesh(ball(.29, 20), o.skin, 0, 1.4, 0, body);
if (o.bald) {
mesh(ball(.12, 12), o.hair, -.26, 1.4, -.06, body);
mesh(ball(.12, 12), o.hair, .26, 1.4, -.06, body);
mesh(ball(.16, 12), o.hair, 0, 1.36, -.22, body);
} else {
const hair = mesh(ball(.31, 20), o.hair, 0, 1.47, -.07, body);
hair.scale.set(1, .85, .9);
}
eyes(body, 1.43, .25, .045, .1);
mesh(ball(.05, 8), "#ff9fb8", -.17, 1.34, .22, body);
mesh(ball(.05, 8), "#ff9fb8", .17, 1.34, .22, body);
const sm = mesh(new T.TorusGeometry(.07, .015, 6, 12, Math.PI), "#c0395b", 0, 1.3, .27, body);
sm.rotation.z = Math.PI;
if (o.beard) {
const b = mesh(ball(.2, 14), o.hair, 0, 1.22, .1, body);
b.scale.set(1.2, .7, .8);
mesh(ball(.05, 8), "#c0395b", 0, 1.26, .28, body);
}
if (o.mustache) {
const m = mesh(ball(.1, 10), o.hair, 0, 1.35, .26, body);
m.scale.set(1.8, .6, .7);
}
if (o.glasses) {
[ -.1, .1 ].forEach(x => mesh(new T.TorusGeometry(.075, .014, 6, 18), "#6b5a7a", x, 1.43, .27, body));
mesh(box(.06, .02, .02), "#6b5a7a", 0, 1.44, .28, body);
}
if (o.bun) mesh(ball(.15, 12), o.hair, 0, 1.74, -.1, body);
if (o.cap) {
mesh(ball(.31, 16), o.cap, 0, 1.52, -.02, body).scale.set(1, .6, 1);
mesh(box(.3, .04, .25), o.cap, 0, 1.55, .27, body);
}
if (o.pigtails) {
mesh(ball(.12, 12), o.hair, -.32, 1.5, -.05, body);
mesh(ball(.12, 12), o.hair, .32, 1.5, -.05, body);
mesh(ball(.05, 8), o.bow, -.26, 1.58, .02, body);
mesh(ball(.05, 8), o.bow, .26, 1.58, .02, body);
}
const hit = new T.Mesh(new T.CylinderGeometry(.6, .6, 2, 8), new T.MeshBasicMaterial({
transparent: true,
opacity: 0,
depthWrite: false
}));
hit.position.y = .9;
g.add(hit);
g.scale.setScalar(o.scale);
Object.assign(g.userData, {
name: o.name,
icon: o.icon,
scale: o.scale,
jump: 0,
wave: 0,
spin: 0,
state: "work",
timer: rnd(4, 10),
t: 0
});
return g;
}
const STATIONS = [ {
id: "cook",
p: [ -2.7, .1, -.35 ],
word: "COOK",
e: "🍳",
line: "is cooking soup",
anim: "stir"
}, {
id: "dish",
p: [ -.75, .1, -.4 ],
word: "WASH",
e: "🧽",
line: "is washing the dishes",
anim: "scrub"
}, {
id: "tub",
p: [ 3.7, .1, 1.05 ],
word: "SCRUB",
e: "🧼",
line: "is scrubbing the tub",
anim: "scrub"
}, {
id: "fold",
p: [ -3.75, FH + .1, 1 ],
word: "FOLD",
e: "👕",
line: "is folding the laundry",
anim: "fold"
}, {
id: "sing",
p: [ -.85, FH + .1, 1 ],
word: "SING",
e: "🎵",
line: "is singing to the babies",
anim: "sway"
}, {
id: "tidy",
p: [ 3.75, FH + .1, 1.05 ],
word: "TIDY",
e: "🧸",
line: "is tidying the toys",
anim: "bend"
}, {
id: "read",
p: [ .95, FH + .1, 1.1 ],
word: "READ",
e: "📖",
line: "is reading a story",
anim: "sway"
}, {
id: "water",
p: [ -3.3, 0, 2.55 ],
word: "WATER",
e: "💧",
line: "is watering the flowers",
anim: "bend"
}, {
id: "sweep",
p: [ .9, 0, 2.45 ],
word: "SWEEP",
e: "🧹",
line: "is sweeping the porch",
anim: "sweep"
}, {
id: "rake",
p: [ 3.3, 0, 2.6 ],
word: "RAKE",
e: "🍂",
line: "is raking the leaves",
anim: "sweep"
} ];
mesh(box(.8, .9, .55), "#ffffff", -2.7, .45, -1.3, house);
mesh(cyl(.14, .14, .05, 16), "#3a3350", -2.85, .93, -1.3, house);
mesh(cyl(.2, .18, .25, 16), "#ff5a6e", -2.55, 1.02, -1.25, house);
mesh(box(.9, .8, .55), "#9be7c4", -.75, .4, -1.3, house);
mesh(box(.6, .05, .35), "#7fd3ff", -.75, .82, -1.25, house);
mesh(cyl(.3, .25, .35, 16), "#e8b27d", -3.35, FH + .28, .3, house);
mesh(ball(.13, 8), "#ff6fae", -3.4, FH + .47, .3, house);
mesh(ball(.12, 8), "#7fd3ff", -3.25, FH + .46, .35, house);
const chair = new T.Group;
chair.position.set(.95, FH + .09, .5);
house.add(chair);
mesh(box(.6, .1, .5), "#c98b58", 0, .35, 0, chair);
mesh(box(.6, .6, .08), "#c98b58", 0, .65, -.22, chair);
for (let i = 0; i < 9; i++) mesh(ball(.14, 10), flowerColors[i % 5], -3.9 + i % 3 * .35, .14, 3 + Math.floor(i / 3) * .28);
for (let i = 0; i < 10; i++) mesh(ball(.13, 8), [ "#e0662b", "#f2a33a", "#c9432a" ][i % 3], 3.6 + rnd(-.35, .35), .1 + i % 3 * .06, 3.1 + rnd(-.25, .25));
function wordTex(e, word) {
const k = "w" + e + word;
if (texCache[k]) return texCache[k];
const c = document.createElement("canvas");
c.width = 320;
c.height = 128;
const g = c.getContext("2d");
g.fillStyle = "#fffaf2";
g.strokeStyle = "#ffc93c";
g.lineWidth = 8;
g.beginPath();
g.moveTo(40, 8);
g.arcTo(312, 8, 312, 120, 34);
g.arcTo(312, 120, 8, 120, 34);
g.arcTo(8, 120, 8, 8, 34);
g.arcTo(8, 8, 312, 8, 34);
g.closePath();
g.fill();
g.stroke();
g.textBaseline = "middle";
g.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
g.fillText(e, 22, 68);
g.fillStyle = "#3b2a55";
g.font = '800 64px "Baloo 2","Arial Rounded MT Bold",Arial,sans-serif';
g.fillText(word, 104, 72, 200);
const t = new T.CanvasTexture(c);
t.encoding = T.sRGBEncoding;
return texCache[k] = t;
}
const family = [ makePerson({
who: "daddy",
name: "Daddy",
icon: "👨",
scale: 1.22,
shirt: "#4a9bff",
pants: "#3b3f6e",
shoes: "#5a3a28",
skin: "#f6c9a8",
hair: "#5a3a28",
beard: true
}), makePerson({
who: "grandma",
name: "Grandma",
icon: "👵",
scale: 1.1,
dress: true,
shirt: "#b07cff",
sleeve: "#c7b3ff",
apron: "#ffffff",
shoes: "#6b5a7a",
skin: "#f6c9a8",
hair: "#d9d4e4",
bun: true,
glasses: true
}), makePerson({
who: "grandpa",
name: "Grandpa",
icon: "👴",
scale: 1.16,
shirt: "#e0662b",
pants: "#6b5a4a",
shoes: "#3a3350",
skin: "#f6c9a8",
hair: "#e4e0ea",
bald: true,
mustache: true,
glasses: true
}), makePerson({
who: "brother",
name: "Brother",
icon: "👦",
scale: .88,
shirt: "#6fdc8c",
pants: "#4a9bff",
shoes: "#ff5a6e",
skin: "#f6c9a8",
hair: "#2b2140",
cap: "#ff8f5a"
}), makePerson({
who: "sister",
name: "Sister",
icon: "👧",
scale: .85,
dress: true,
shirt: "#ff6fae",
shoes: "#b07cff",
skin: "#f6c9a8",
hair: "#b5532b",
pigtails: true,
bow: "#ffc93c"
}) ];
const startAt = [ "rake", "cook", "read", "tidy", "sing" ];
family.forEach((f, i) => {
house.add(f);
arriveAt(f, STATIONS.find(s => s.id === startAt[i]));
});
function arriveAt(f, st) {
const u = f.userData;
u.station = st;
u.state = "work";
u.timer = rnd(8, 15);
f.position.set(st.p[0], st.p[1], st.p[2]);
f.rotation.y = st.p[0] < 0 ? .3 : -.3;
if (u.bubble) f.remove(u.bubble);
u.bubble = new T.Sprite(new T.SpriteMaterial({
map: wordTex(st.e, st.word),
transparent: true,
depthTest: false
}));
u.bubble.scale.set(1.25 / u.scale, .5 / u.scale, 1);
u.bubble.position.set(0, 2.25, 0);
u.bubble.renderOrder = 19;
f.add(u.bubble);
}
function walkTo(f, st) {
const u = f.userData;
u.state = "walk";
u.t = 0;
u.next = st;
if (u.bubble) {
f.remove(u.bubble);
u.bubble = null;
}
u.from = f.position.clone();
u.to = new T.Vector3(st.p[0], st.p[1], st.p[2]);
const dist = u.from.distanceTo(u.to);
u.arc = Math.abs(u.to.y - u.from.y) > .5 ? 1.9 : 0;
u.dur = Math.min(3.2, Math.max(1, dist / 1.6));
f.rotation.y = Math.atan2(u.to.x - u.from.x, u.to.z - u.from.z);
u.station = null;
}
function freeStations(me) {
const taken = new Set(family.filter(f => f !== me).map(f => (f.userData.station || f.userData.next || {}).id));
return STATIONS.filter(s => !taken.has(s.id) && s !== me.userData.station);
}
function updateFamily(dt, time) {
family.forEach((f, i) => {
const u = f.userData, body = u.body;
body.rotation.set(0, 0, 0);
let armR = .25, armL = -.25;
if (u.state === "work") {
u.timer -= dt;
if (u.timer <= 0 && mom.state !== "caring") {
const opts = freeStations(f);
if (opts.length) walkTo(f, pick(opts));
}
const a = u.station ? u.station.anim : "sway";
if (!reduceMotion) {
if (a === "stir") armR = 1.3 + Math.sin(time * 6 + i) * .35; else if (a === "scrub") armR = 1.1 + Math.sin(time * 12 + i) * .4; else if (a === "fold") {
armR = .4 + Math.abs(Math.sin(time * 3.5)) * 1.3;
armL = -armR;
} else if (a === "sway") {
body.rotation.z = Math.sin(time * 2 + i) * .1;
armR = .9;
armL = -.9;
} else if (a === "bend") {
body.rotation.x = .28 + Math.sin(time * 3 + i) * .08;
armR = .9;
} else if (a === "sweep") {
body.rotation.y = Math.sin(time * 4 + i) * .35;
armR = .8;
armL = -.8;
}
}
} else if (u.state === "walk") {
u.t = Math.min(1, u.t + dt / u.dur);
f.position.lerpVectors(u.from, u.to, ease(u.t));
f.position.y += u.arc ? Math.sin(u.t * Math.PI) * u.arc : 0;
body.position.y = u.arc ? 0 : Math.abs(Math.sin(u.t * u.dur * 9)) * .08;
armR = Math.sin(u.t * u.dur * 9) * .5;
armL = -armR;
if (u.t >= 1) {
body.position.y = 0;
arriveAt(f, u.next);
u.next = null;
}
}
if (u.state !== "walk") {
if (u.jump > 0) {
u.jump = Math.max(0, u.jump - dt * 2);
body.position.y = Math.sin((1 - u.jump) * Math.PI) * .45;
} else body.position.y = 0;
}
if (u.spin > 0) {
u.spin = Math.max(0, u.spin - dt * 1.3);
body.rotation.y = (1 - u.spin) * Math.PI * 2;
}
if (u.wave > 0) {
u.wave -= dt;
armR = 2.6 + Math.sin(time * 14) * .3;
}
u.armR.rotation.z = armR;
u.armL.rotation.z = armL;
if (u.bubble) u.bubble.position.y = 2.25 + Math.sin(time * 2 + i) * .04;
});
}
const toastEl = document.getElementById("toast");
let toastTimer = 0;
function showToast(icon, name, e, word) {
toastEl.innerHTML = `<span class="t-who">${icon} ${name}</span><span class="t-word">${e} ${[ ...word ].map(c => `<b>${c}</b>`).join("")}</span>`;
toastEl.hidden = false;
toastEl.classList.remove("in");
void toastEl.offsetWidth;
toastEl.classList.add("in");
clearTimeout(toastTimer);
toastTimer = setTimeout(() => {
toastEl.hidden = true;
}, 3800);
}
function spread(n, area, maxCols) {
const cols = Math.min(n, maxCols || 3), rows = Math.ceil(n / cols);
const pts = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
const x = area[0] + (area[1] - area[0]) * ((c + .5) / cols) + rnd(-4, 4);
const y = area[2] + (area[3] - area[2]) * ((r + .5) / rows) + rnd(-4, 4);
pts.push([ x, y ]);
}
return shuffle(pts).slice(0, n);
}
function flyTo(node, target, fx, fy) {
const a = node.getBoundingClientRect(), b = target.getBoundingClientRect();
node.style.setProperty("--dx", b.left + b.width * (fx == null ? .5 : fx) - a.left - a.width / 2 + "px");
node.style.setProperty("--dy", b.top + b.height * (fy == null ? .5 : fy) - a.top - a.height / 2 + "px");
node.classList.add("fly");
}
function stackBox(icon, x, y) {
const s = el(`<div class="stackbox"><span class="sbicon">${icon}</span></div>`);
s.style.left = x + "%";
s.style.top = y + "%";
arena.appendChild(s);
return s;
}
function addToStack(box, emoji) {
const e = el(`<span class="stacked">${emoji}</span>`);
box.appendChild(e);
box.classList.remove("bump");
void box.offsetWidth;
box.classList.add("bump");
}
function rubChore(o, learn) {
arena.classList.add("chore", o.bg);
if (o.scene) arena.appendChild(el(o.scene));
const N = rint(o.n[0], o.n[1]);
let n = 0;
const box = o.stack ? stackBox(o.stack.icon, o.stack.x, o.stack.y) : null;
spread(N, o.area, o.cols).forEach(p => {
const t = el(`<span class="rubt">${typeof o.target === "function" ? o.target() : o.target}</span>`);
t.style.left = p[0] + "%";
t.style.top = p[1] + "%";
t.style.setProperty("--r", rint(-35, 35) + "deg");
arena.appendChild(t);
});
const tool = el(`<div class="tool">${o.tool}</div>`);
arena.appendChild(tool);
const ar = arena.getBoundingClientRect();
const place = (x, y) => {
tool.style.transform = `translate(${x - (o.toolOff ? o.toolOff[0] : 36)}px, ${y - (o.toolOff ? o.toolOff[1] : 36)}px)`;
};
place(ar.width * .82, ar.height * .82);
const point = el('<div class="point rub">👆</div>');
arena.appendChild(point);
let down = false;
function rub(ev) {
const [x, y] = localXY(ev);
place(x, y);
if (!down || mg.done) return;
const hits = document.elementsFromPoint(ev.clientX, ev.clientY);
const hit = hits.map(h => h.closest && h.closest(".rubt")).find(h => h && !h.classList.contains("gone") && !h.classList.contains("fly"));
if (hit) {
const k = ++n;
if (point.parentNode) point.remove();
puff(x, y, o.fx);
(o.sound || sfx.squeak)();
if (box) {
flyTo(hit, box, .7, .5);
later(() => {
hit.remove();
addToStack(box, o.stackEmoji || hit.textContent.trim());
}, 450);
} else hit.classList.add("gone");
if (learn) {
numPop(k, x, y - 30);
say(NUMW[k]);
}
if (k >= N) later(() => {
if (o.finish) o.finish(box);
winMini(learn ? `${cap(NUMW[N])}! ${o.end}` : o.end);
}, 600);
} else if (Math.random() < .08) puff(x, y, o.fx);
}
const onDown = ev => {
down = true;
try {
arena.setPointerCapture(ev.pointerId);
} catch (e) {}
rub(ev);
};
const onUp = () => {
down = false;
};
arena.addEventListener("pointerdown", onDown);
arena.addEventListener("pointermove", rub);
window.addEventListener("pointerup", onUp);
window.addEventListener("pointercancel", onUp);
mg.cleanup.push(() => {
arena.removeEventListener("pointerdown", onDown);
arena.removeEventListener("pointermove", rub);
window.removeEventListener("pointerup", onUp);
window.removeEventListener("pointercancel", onUp);
});
}
function tapChore(o, learn) {
arena.classList.add("chore", o.bg);
const extra = o.scene ? el(o.scene) : null;
if (extra) arena.appendChild(extra);
const box = o.stack ? stackBox(o.stack.icon, o.stack.x, o.stack.y) : null;
const items = o.items();
let n = 0;
const point = el('<div class="point">👆</div>');
spread(items.length, o.area, o.cols).forEach((p, k) => {
const t = el(`<button class="tapi" aria-label="Tap">${items[k]}</button>`);
t.style.left = p[0] + "%";
t.style.top = p[1] + "%";
t.style.setProperty("--r", (o.tilt ? rint(-30, 30) : 0) + "deg");
t.style.animationDelay = k * .08 + "s";
arena.appendChild(t);
if (k === 0) {
point.style.left = `calc(${p[0]}% + 10px)`;
point.style.top = `calc(${p[1]}% + 20px)`;
arena.appendChild(point);
}
tapOn(t, () => {
if (t.classList.contains("used") || mg.done) return;
t.classList.add("used");
if (point.parentNode) point.remove();
const k2 = ++n;
const [x, y] = rel(t, .5, .2);
o.act(t, box, extra, x, y);
if (learn) later(() => {
numPop(k2, x, y - 20);
say(NUMW[k2]);
}, 250);
if (k2 >= items.length) later(() => {
if (o.finish) o.finish(extra, box);
winMini(learn ? `${cap(NUMW[k2])}! ${o.end}` : o.end);
}, o.finishDelay || 800);
});
});
}
const pickN = (arr, a, b) => {
const n = rint(a, b);
const out = [];
for (let i = 0; i < n; i++) out.push(pick(arr));
return out;
};
const CHORES = {
rake: learn => rubChore({
bg: "c-lawn",
n: [ 5, 7 ],
area: [ 8, 54, 26, 88 ],
cols: 2,
target: () => pick([ "🍂", "🍁", "🍂" ]),
fx: "🍃",
sound: () => sweep(500, 300, .12, "triangle", .08),
tool: '<span class="rakeTool"><span class="rs"></span><span class="rh"></span></span>',
toolOff: [ 40, 78 ],
stack: {
icon: "🧺",
x: 77,
y: 70
},
finish: () => {
const r = arena.getBoundingClientRect();
for (let i = 0; i < 12; i++) later(() => puff(rnd(.55, .95) * r.width, rnd(.45, .85) * r.height, pick([ "🍂", "🍁" ])), i * 60);
},
end: "Jump in the leaf pile! Wheee!"
}, learn),
sweep: learn => rubChore({
bg: "c-floor",
n: [ 5, 7 ],
area: [ 8, 54, 10, 88 ],
cols: 2,
target: '<span class="dustb"></span>',
fx: "💨",
sound: () => sweep(1200, 600, .1, "sine", .05),
tool: "🧹",
toolOff: [ 30, 60 ],
stack: {
icon: "🗑️",
x: 77,
y: 72
},
stackEmoji: "✨",
end: "All swept! So shiny!"
}, learn),
tub: learn => rubChore({
bg: "c-tiles",
n: [ 4, 6 ],
area: [ 18, 80, 42, 68 ],
scene: '<div class="tubbig"></div>',
target: '<span class="mudb"></span>',
fx: "🫧",
tool: "🧽",
finish: () => arena.appendChild(el('<div class="duck">🦆</div>')),
end: "Sparkly clean tub!"
}, learn),
dish: learn => rubChore({
bg: "c-kitchen",
n: [ 3, 5 ],
area: [ 8, 54, 12, 86 ],
cols: 2,
target: '<span class="plate">🍽️<i class="grime"></i></span>',
fx: "🫧",
tool: "🧽",
stack: {
icon: "🧺",
x: 77,
y: 66
},
stackEmoji: "🍽️",
end: "Clean dishes! Squeak squeak!"
}, learn),
water: learn => tapChore({
bg: "c-garden",
area: [ 10, 90, 50, 74 ],
items: () => pickN([ "🌱" ], 3, 5).map(() => '<span class="plant">🌱</span><span class="fpot"></span>'),
act: (t, box, sc, x, y) => {
for (let i = 0; i < 3; i++) later(() => puff(x + rnd(-14, 14), y - 30, "💧"), i * 90);
sweep(700, 350, .25, "sine", .08);
later(() => {
const p = t.querySelector(".plant");
p.textContent = pick([ "🌷", "🌻", "🌼", "🌸", "🌺" ]);
p.classList.add("grow");
sfx.boop();
}, 380);
},
end: "Pretty flowers!"
}, learn),
cook: learn => tapChore({
bg: "c-kitchen",
area: [ 8, 92, 8, 34 ],
scene: '<div class="pot"><div class="soup"></div></div>',
items: () => shuffle([ "🥕", "🥔", "🧅", "🍅", "🌽", "🥦" ]).slice(0, rint(3, 5)),
act: (t, box, pot) => {
flyTo(t, pot, .5, .15);
sfx.boing();
later(() => {
const r = pot.getBoundingClientRect(), a = arena.getBoundingClientRect();
puff(r.left - a.left + r.width / 2, r.top - a.top + 10, "💦");
sfx.gulp();
pot.querySelector(".soup").style.background = pick([ "#ffb45a", "#ff8f5a", "#f2c14e", "#e0662b" ]);
pot.classList.remove("bump");
void pot.offsetWidth;
pot.classList.add("bump");
}, 500);
},
finish: pot => {
const r = pot.getBoundingClientRect(), a = arena.getBoundingClientRect();
for (let i = 0; i < 5; i++) later(() => puff(r.left - a.left + r.width * rnd(.3, .7), r.top - a.top, "♨️"), i * 150);
},
end: "Yummy soup!",
finishDelay: 900
}, learn),
fold: learn => tapChore({
bg: "c-nursery",
area: [ 8, 54, 8, 90 ],
tilt: true,
cols: 2,
stack: {
icon: "🧺",
x: 77,
y: 60
},
items: () => pickN([ "👕", "👚", "👖", "🧦", "👗" ], 4, 6),
act: (t, box) => {
t.classList.add("folding");
sweep(400, 800, .15, "triangle", .08);
later(() => {
flyTo(t, box, .7, .5);
}, 280);
later(() => {
addToStack(box, t.textContent.trim());
t.remove();
}, 750);
},
end: "All folded! So neat!",
finishDelay: 1e3
}, learn),
tidy: learn => tapChore({
bg: "c-play",
area: [ 8, 54, 8, 90 ],
tilt: true,
cols: 2,
stack: {
icon: "📦",
x: 77,
y: 62
},
items: () => shuffle([ "🧸", "🚂", "🎈", "🦆", "⚽", "🧩", "🪀", "🎨" ]).slice(0, rint(4, 6)),
act: (t, box) => {
sfx.boing();
flyTo(t, box, .7, .5);
later(() => {
addToStack(box, t.textContent.trim());
t.remove();
}, 480);
},
end: "All tidy!",
finishDelay: 900
}, learn),
sing: learn => singChore(learn),
read: learn => readChore(learn)
};
function singChore(learn) {
arena.classList.add("chore", "c-nursery");
const L = pick(babyLooks);
const face = el(`<div class="facewrap singer" data-mouth="smile">${faceSVG(L)}</div>`);
arena.appendChild(face);
const bars = [ [ "red", "#ff5a6e", 262 ], [ "orange", "#ff8f5a", 294 ], [ "yellow", "#ffc93c", 330 ], [ "green", "#6fdc8c", 392 ], [ "blue", "#6fb8ff", 440 ], [ "purple", "#b07cff", 523 ] ];
const xylo = el(`<div class="xylo">${bars.map((b, i) => `<button class="bar" style="--c:${b[1]};--h:${100 - i * 9}%" aria-label="${b[0]}"></button>`).join("")}</div>`);
arena.appendChild(xylo);
const goal = 8;
let n = 0;
xylo.querySelectorAll(".bar").forEach((btn, i) => tapOn(btn, () => {
if (mg.done) return;
sfx.note(bars[i][2]);
btn.classList.remove("ding");
void btn.offsetWidth;
btn.classList.add("ding");
const [x, y] = rel(btn, .5, 0);
puff(x, y, pick([ "🎵", "🎶" ]));
if (learn) say(bars[i][0]);
face.classList.remove("bop");
void face.offsetWidth;
face.classList.add("bop");
face.dataset.mouth = n % 2 ? "o" : "laugh";
if (++n >= goal) {
face.dataset.mouth = "laugh";
later(() => winMini("What a pretty song!"), 500);
}
}));
}
const STORIES = [ [ [ "🐣", "Little chick says peep.", "Peep peep!" ], [ "🐶", "Puppy says woof.", "Woof woof!" ], [ "🐮", "Cow says moo.", "Moooo!" ], [ "🐑", "Sheep says baa.", "Baaa!" ], [ "😴", "Now everyone sleeps. Shhh.", "Shhh." ] ], [ [ "🚂", "The train goes choo choo.", "Choo choo!" ], [ "🚒", "The fire truck goes nee naw.", "Nee naw!" ], [ "🦄", "The unicorn truck goes vroom.", "Vroom vroom!" ], [ "🏠", "And everyone comes home.", "Home!" ] ], [ [ "🐸", "Frog jumps. Hop hop.", "Ribbit!" ], [ "🐝", "Bee flies. Buzz buzz.", "Bzzzz!" ], [ "🐟", "Fish swims. Splash.", "Splash!" ], [ "🌙", "Good night, friends.", "Night night!" ] ] ];
function readChore(learn) {
arena.classList.add("chore", "c-read");
const story = pick(STORIES);
let p = -1;
const book = el('<button class="book" aria-label="Turn the page"><span class="pic"></span><span class="words"></span><span class="turn">👉</span></button>');
arena.appendChild(book);
const pic = book.querySelector(".pic"), words = book.querySelector(".words");
words.hidden = !learn;
function turn() {
if (mg.done) return;
p++;
if (p >= story.length) {
winMini("The end! Great reading!");
return;
}
const [e, line, sound] = story[p];
book.classList.remove("flip");
void book.offsetWidth;
book.classList.add("flip");
sweep(900, 1400, .12, "sine", .05);
later(() => {
pic.textContent = e;
words.textContent = line;
say(line);
}, 180);
book.dataset.sound = sound;
}
tapOn(pic, () => {
if (book.dataset.sound) {
say(book.dataset.sound);
pic.classList.remove("bump");
void pic.offsetWidth;
pic.classList.add("bump");
}
});
tapOn(book, turn);
later(turn, 200);
}
function startGame(header, run, onDone, onCancel) {
if (mg) {
setTimeout(() => startGame(header, run, onDone, onCancel), 700);
return;
}
mg = {
timers: [],
done: false,
onDone: onDone,
onCancel: onCancel,
cleanup: []
};
arena.innerHTML = "";
arena.className = "arena";
setDots(0);
wordEl.innerHTML = header;
miniEl.hidden = false;
run(Math.random() < LEARN_CHANCE);
}
function startChore(f) {
const u = f.userData, st = u.station || u.next;
if (!st || !CHORES[st.id] || mg) return;
startGame(`<span class="wbig">${u.icon}</span><span class="wbig">${st.e}</span>`, learn => {
CHORES[st.id](learn);
later(() => say(`${u.name} ${st.line}. Let's help!`, true), 150);
}, () => {
addStar();
u.jump = 1;
u.wave = 1.8;
u.timer = Math.max(u.timer, 3);
}, () => {});
}
const raycaster = new T.Raycaster, ndc = new T.Vector2;
const hint = document.getElementById("hint");
let tapped = false;
renderer.domElement.addEventListener("pointerdown", ev => {
audio();
const r = renderer.domElement.getBoundingClientRect();
ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
raycaster.setFromCamera(ndc, camera);
const hits = raycaster.intersectObjects([ ...babies, mommy, ...family, truck ], true);
if (!hits.length) return;
const rank = {
baby: 0,
mommy: 1,
family: 1,
truck: 2
};
let o = null;
hits.forEach(h => {
let n = h.object;
while (n && !n.userData.kind) n = n.parent;
if (n && (!o || rank[n.userData.kind] < rank[o.userData.kind])) o = n;
});
if (!o) return;
if (!tapped) {
tapped = true;
hint.classList.add("gone");
}
if (o.userData.kind === "baby") {
if (o.userData.need) {
if (!o.userData.busy) {
requestCare(o);
sfx.boop();
}
} else {
o.userData.jump = 1;
sfx.giggle();
const wp = new T.Vector3;
o.getWorldPosition(wp);
floatEmoji("💕", wp.add(new T.Vector3(0, 1.2, .3)));
}
} else if (o.userData.kind === "mommy") {
mommy.userData.jump = 1;
mommy.userData.wave = 1.5;
sfx.yay();
const wp = new T.Vector3;
mommy.getWorldPosition(wp);
floatEmoji("💜", wp.add(new T.Vector3(0, 2.3, .3)));
} else if (o.userData.kind === "family") {
const u = o.userData, st = u.station || u.next;
u.jump = 1;
u.wave = 1.5;
if (u.who === "sister") u.spin = 1;
(sfx[u.who] || sfx.boop)();
if (st) setTimeout(() => startChore(o), 450);
} else if (o.userData.kind === "truck") {
sfx.honk();
if (!drive.active) {
drive.active = true;
drive.t = 0;
}
babies.forEach((b, i) => setTimeout(() => {
b.userData.jump = 1;
}, 200 + i * 90));
family.forEach((f, i) => setTimeout(() => {
f.userData.jump = 1;
f.userData.wave = 1;
}, 300 + i * 120));
floatEmoji("🦄", truck.position.clone().add(new T.Vector3(0, 2.6, 0)), {
size: .9
});
}
});
function resize() {
const w = stage.clientWidth, h = stage.clientHeight;
renderer.setSize(w, h, false);
const a = w / h;
camera.aspect = a;
const portrait = a < 1;
const fitWidth = portrait ? 10.2 : 18.5;
const halfTan = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
const dist = Math.max(fitWidth / (2 * halfTan * a), 13);
camera.position.set(0, 3.2 + dist * .28, dist + 1);
camera.lookAt(0, portrait ? 2.6 : 3.1, 1);
camera.updateProjectionMatrix();
drive.rx = portrait ? 4.4 : 7.2;
drive.rz = portrait ? 6.4 : 4.9;
drive.parkA = portrait ? Math.PI / 2 - .3 : .45;
if (!drive.active) placeTruck(drive.parkA);
}
window.addEventListener("resize", resize);
resize();
const clock = new T.Clock;
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
function tick() {
const dt = Math.min(clock.getDelta(), .05), time = clock.elapsedTime;
nextNeed -= dt;
if (nextNeed <= 0) {
spawnNeed();
nextNeed = 4 + Math.random() * 3;
}
babies.forEach((b, i) => {
const u = b.userData, body = u.body;
const wig = u.need ? Math.sin(time * 9 + i) * .12 : Math.sin(time * 1.6 + i) * .04;
body.rotation.z = reduceMotion ? 0 : wig;
if (u.jump > 0) {
u.jump = Math.max(0, u.jump - dt * 2);
body.position.y = Math.sin((1 - u.jump) * Math.PI) * .5;
} else body.position.y = 0;
if (u.spin > 0) {
u.spin = Math.max(0, u.spin - dt * 1.2);
body.rotation.y = (1 - u.spin) * Math.PI * 2;
}
if (u.bubble) {
const p = .95 + Math.sin(time * 4 + i) * .08;
u.bubble.scale.set(p, p, p);
u.bubble.position.y = 1.75 + Math.sin(time * 2 + i) * .06;
}
});
const mu = mommy.userData;
if (mom.state === "idle" && queue.length) startNext();
if (mom.state === "moving") {
mom.t = Math.min(1, mom.t + dt / 1);
const k = ease(mom.t);
mommy.position.lerpVectors(mom.from, mom.to, k);
const hop = Math.abs(mom.to.y - mom.from.y) > .5 ? 1.8 : .35;
mommy.position.y += Math.sin(mom.t * Math.PI) * hop;
if (mom.t >= 1) {
mom.state = "caring";
mom.t = 0;
mu.wave = 1.2;
const b = mom.target;
setTimeout(() => openMini(b, () => {
finishCare(b);
mom.state = "idle";
mom.target = null;
}, () => {
b.userData.busy = false;
mom.state = "idle";
mom.target = null;
}), 450);
}
} else if (mom.state === "caring") {
if (mu.wave <= 0) mu.wave = 1;
}
if (mom.state === "moving") mu.baseY = mom.to.y; else {
if (mu.baseY === undefined) mu.baseY = .1;
if (mu.jump > 0) mu.jump = Math.max(0, mu.jump - dt * 2);
mommy.position.y = mu.baseY + (mu.jump > 0 ? Math.sin((1 - mu.jump) * Math.PI) * .5 : 0);
}
updateFamily(dt, time);
if (mu.wave > 0) {
mu.wave -= dt;
mu.armR.rotation.z = -.5 + Math.sin(time * 14) * .35;
mu.armR.position.set(.38, 1.12, .05);
} else {
mu.armR.rotation.z = -.5;
mu.armR.position.set(.26, .9, .05);
}
const tb = truck.userData.body;
if (drive.active) {
drive.t = Math.min(1, drive.t + dt / drive.dur);
const a = drive.parkA + ease(drive.t) * Math.PI * 2;
placeTruck(a);
const speed = Math.sin(drive.t * Math.PI);
truck.userData.wheels.forEach(w => {
w.rotation.z -= dt * 14 * (.3 + speed);
});
tb.position.y = Math.abs(Math.sin(time * 18)) * .08 * speed;
tb.rotation.z = Math.sin(time * 9) * .04 * speed;
trailI++;
if (trailI % 2 === 0) {
const m = new T.Mesh(trailGeo, new T.MeshBasicMaterial({
color: rainbow[trailI / 2 % 6],
transparent: true
}));
m.position.copy(truck.position).add(new T.Vector3(0, .35, 0));
scene.add(m);
trail.push({
m: m,
life: 0
});
}
if (drive.t >= 1) {
drive.active = false;
placeTruck(drive.parkA);
}
} else {
tb.position.y = reduceMotion ? 0 : Math.abs(Math.sin(time * 2.2)) * .05;
tb.rotation.z = 0;
}
for (let i = floaters.length - 1; i >= 0; i--) {
const f = floaters[i];
f.life += dt;
f.s.position.addScaledVector(f.v, dt);
f.s.material.opacity = 1 - f.life / f.max;
if (f.life >= f.max) {
scene.remove(f.s);
f.s.material.dispose();
floaters.splice(i, 1);
}
}
for (let i = confetti.length - 1; i >= 0; i--) {
const c = confetti[i];
c.life += dt;
c.v.y -= 9 * dt;
c.m.position.addScaledVector(c.v, dt);
c.m.rotation.x += c.r.x * dt;
c.m.rotation.y += c.r.y * dt;
if (c.m.position.y < .05 || c.life > 4) {
scene.remove(c.m);
confetti.splice(i, 1);
}
}
for (let i = trail.length - 1; i >= 0; i--) {
const p = trail[i];
p.life += dt;
p.m.material.opacity = 1 - p.life / 1.1;
p.m.scale.setScalar(1 + p.life * 1.5);
if (p.life > 1.1) {
scene.remove(p.m);
p.m.material.dispose();
trail.splice(i, 1);
}
}
clouds.forEach((c, i) => {
c.position.x += dt * (.3 + i * .05);
if (c.position.x > 26) c.position.x = -26;
});
renderer.render(scene, camera);
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();
