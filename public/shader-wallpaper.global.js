/*! shader-wallpaper (global build) */
(function(global){
'use strict';
/*!
 * shader-wallpaper.js
 * Interactive GPU wallpapers for the web.
 *
 * Works in:
 *   - ES modules   : import { ShaderWallpaper, PRESETS } from './shader-wallpaper.js'
 *   - Custom Elem  : <shader-wallpaper preset="aurora"></shader-wallpaper>
 *   - Plain script : window.ShaderWallpaper
 *
 * Framework notes:
 *   - Angular / Nuxt / React: include the file once (e.g. register the custom
 *     element on app bootstrap, or import the ShaderWallpaper class and
 *     construct it against a ref). The element is fully encapsulated and will
 *     size itself to its parent OR the viewport if placed at document root.
 *
 *   Angular: add CUSTOM_ELEMENTS_SCHEMA and `import 'shader-wallpaper';`
 *   Nuxt 3:  in a client-only component, `await import('shader-wallpaper')`
 *   React:   <shader-wallpaper preset="vortex" /> (lowercase is fine)
 */

/* =========================================================================
 * VERTEX + 5 FRAGMENT SHADERS
 * ========================================================================= */

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/* Common uniforms available to every fragment shader:
 *   uRes      vec2  - canvas pixel size
 *   uMouse    vec2  - smoothed mouse in canvas px (GL y-up)
 *   uTime     float - seconds since start
 *   uClick    float - decays 1.0 -> 0 per click (~300ms)
 *   uClickPos vec2  - last click position in canvas px (GL y-up)
 *   uIntens   float - 0..1  extra "fidget" multiplier
 *   uQuality  float - 0.0 low / 1.0 high - lets shader cut iterations
 */

const FRAG_METAL = `
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime;
uniform float uClick; uniform vec2 uClickPos;
uniform float uIntens; uniform float uQuality;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

// cheap metaball contribution
float blob(vec2 p, vec2 c, float r2){ vec2 d = p-c; return r2/(dot(d,d) + 0.02); }

// 6 blob positions in a single function, deterministic animation
void blobAt(int i, float t, out vec2 p, out float r2){
  float s = float(i)*1.37 + 0.2;
  float ph = float(i)*2.09;
  float sp = 0.55 + fract(s*0.91)*0.35;
  float tt = t*sp + ph;

  // orbit CENTER offset: spread blobs in a ring so they don't all converge at origin
  float centerAng = float(i) * 1.0472; // 60° apart (2π/6)
  vec2 center = vec2(cos(centerAng), sin(centerAng)) * 0.32;
  // slowly rotate the ring of centers
  float cRot = t*0.04;
  center = vec2(center.x*cos(cRot)-center.y*sin(cRot),
                center.x*sin(cRot)+center.y*cos(cRot));

  float rx = 0.22 + 0.04*sin(s*3.1);
  float ry = 0.18 + 0.03*cos(s*4.7);

  float ax = 0.85 + fract(s*1.31)*0.5;
  float ay = 0.75 + fract(s*2.17)*0.5;

  p = center + vec2(sin(tt*ax + s)*rx, cos(tt*ay - s)*ry)
    + vec2(sin(tt*0.31+s), cos(tt*0.27-s))*0.06;

  float rBase = 0.28 + 0.03*sin(s*5.9);
  r2 = rBase*rBase;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m  = (uMouse - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 cp = (uClickPos - 0.5*uRes)/min(uRes.x,uRes.y);
  float t = uTime;

  // PASS A: find nearest blob index (as float)
  float minD = 9999.0;
  float nearestF = 0.0;
  for(int i=0;i<6;i++){
    vec2 p; float r2;
    blobAt(i, t, p, r2);
    float d = length(p - m);
    if(d < minD){ minD = d; nearestF = float(i); }
  }

  float gravStr = (0.75 + 0.25*uIntens) * exp(-minD*0.8);

  // PASS B: accumulate metaball field with gravity on nearest
  float f = 0.0;
  vec2 capPos = vec2(0.0);
  for(int i=0;i<6;i++){
    vec2 p; float r2;
    blobAt(i, t, p, r2);
    float isNear = step(abs(float(i) - nearestF), 0.5);
    vec2 pp = mix(p, m, gravStr*isNear);
    float rr2 = r2 * (1.0 + 0.55*gravStr*isNear);
    f += blob(uv, pp, rr2);
    capPos = mix(capPos, pp, isNear);
  }
  f += blob(uv, cp, 0.06*uClick) * (1.0+uClick);

  // anti-blob at origin to cancel convergence hot-spot
  f -= blob(uv, vec2(0.0), 0.18) * 0.20;

  // subtle surface shimmer (not origin-centered)
  float shimmer = sin(uv.x*8.0 + uv.y*5.0 - t*0.9)*0.04;
  f += shimmer;

  float rim  = smoothstep(1.0, 1.08, f) - smoothstep(1.08, 1.22, f);
  float core = smoothstep(1.15, 2.0, f);

  vec3 c1 = vec3(0.04, 0.05, 0.09);
  vec3 c2 = vec3(0.38, 0.44, 0.58);
  vec3 c3 = vec3(0.85, 0.72, 0.98);
  vec3 c4 = vec3(1.0, 0.95, 0.90);

  vec3 col = mix(c1, c2, smoothstep(0.05, 0.5, f));
  col = mix(col, c3, smoothstep(0.5, 1.0, f)*0.85);
  col = mix(col, c4, core*0.7);
  col += vec3(0.15,0.1,0.2)*sin(f*20.0 - t*1.2)*smoothstep(0.6,1.4,f);
  col += rim * vec3(0.92, 0.75, 1.0) * 0.65;

  float capD = length(uv - capPos);
  col += vec3(1.0, 0.7, 0.95) * exp(-capD*4.0) * gravStr * 0.4;

  col *= 0.55 + 0.45*(1.0 - length(uv)*0.7);
  col += (hash(gl_FragCoord.xy+t)-0.5)*0.02;
  gl_FragColor = vec4(col, 1.0);
}
`;

const FRAG_PLASMA = `
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime;
uniform float uClick; uniform vec2 uClickPos;
uniform float uIntens; uniform float uQuality;

float hash(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*45758.5); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  mat2 r = mat2(0.8,-0.6,0.6,0.8);
  int N = uQuality > 0.5 ? 6 : 4;
  for(int i=0;i<6;i++){ if(i>=N) break; v+=a*noise(p); p = r*p*2.0; a*=0.5; }
  return v;
}
void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m = (uMouse - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 cp= (uClickPos - 0.5*uRes)/min(uRes.x,uRes.y);
  float t = uTime*0.12;

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));

  vec2 toM = m - p;
  float dM = length(toM);
  vec2 pull = normalize(toM+0.0001) * exp(-dM*1.6) * (0.35 + 0.5*uIntens);

  float dC = length(p - cp);
  float ripple = sin(dC*22.0 - uTime*5.0) * exp(-dC*2.5) * uClick;

  vec2 r = vec2(
    fbm(p + 3.0*q + pull + vec2(1.7,9.2)),
    fbm(p + 3.0*q - pull + vec2(8.3,2.8))
  );
  float f = fbm(p + 2.5*r + ripple*0.4);

  vec3 col = vec3(0.02, 0.03, 0.08);
  col = mix(col, vec3(0.10, 0.04, 0.35), clamp(f*1.6,0.0,1.0));
  col = mix(col, vec3(0.55, 0.12, 0.55), clamp(length(q)*0.9,0.0,1.0));
  col = mix(col, vec3(0.10, 0.75, 0.85), r.x*r.x*0.9);
  col = mix(col, vec3(1.0, 0.85, 0.55), pow(f,4.0)*1.4);
  col += vec3(0.3,0.5,1.0)*pow(max(0.0, 1.0 - dM*1.5), 3.0)*0.3;
  col += vec3(1.0,0.9,0.7)*ripple*0.7;

  col *= 0.7 + 0.4*smoothstep(1.2, 0.2, length(p));
  col += (hash(gl_FragCoord.xy+uTime)-0.5)*0.015;
  gl_FragColor = vec4(col, 1.0);
}
`;

const FRAG_GRID = `
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime;
uniform float uClick; uniform vec2 uClickPos;
uniform float uIntens; uniform float uQuality;

float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m  = (uMouse - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 cp = (uClickPos - 0.5*uRes)/min(uRes.x,uRes.y);

  vec2 tilt = m * (0.5 + 0.4*uIntens);
  vec2 p = uv - vec2(tilt.x, 0.0);
  float horizon = tilt.y * 0.4;
  float y = p.y - horizon;

  float z = 1.0 / max(abs(y), 0.0001);
  float xg = p.x * z;
  float zg = z + uTime*0.9;

  float gx = abs(fract(xg*0.5) - 0.5);
  float gz = abs(fract(zg*0.5) - 0.5);
  float line = min(gx, gz);
  float depthFade = clamp(1.0 - z*0.02, 0.0, 1.0);
  float thick = 0.02 + 0.0005*z;
  float g = smoothstep(thick, 0.0, line);

  bool ceiling = y > 0.0;
  vec3 hotPink = vec3(1.0, 0.15, 0.55);
  vec3 cyan    = vec3(0.2, 0.9, 1.0);
  vec3 lineCol = ceiling ? cyan : hotPink;

  vec2 sunPos = vec2(tilt.x*0.5, horizon + 0.25);
  float sd = length(uv - sunPos);
  float sun = smoothstep(0.32, 0.30, sd);
  float stripe = step(0.0, sin((uv.y - sunPos.y)*30.0 + uTime*0.8));
  float sunBody = sun * mix(0.3, 1.0, stripe);
  float sunGlow = exp(-sd*3.0)*0.6;
  vec3 sunCol = mix(vec3(1.0,0.55,0.25), vec3(1.0,0.25,0.55), clamp((sunPos.y - uv.y)*2.0+0.5, 0.0,1.0));

  vec3 bg = mix(vec3(0.02,0.0,0.06), vec3(0.12,0.02,0.25), smoothstep(-0.4, 0.6, uv.y - horizon));
  bg = mix(bg, vec3(0.05,0.0,0.1), smoothstep(-0.1, -0.6, uv.y - horizon));

  vec3 col = bg;
  col = mix(col, sunCol, sunBody);
  col += sunCol * sunGlow * 0.8;

  float dC = length(uv - cp);
  float ring = smoothstep(0.02, 0.0, abs(dC - uClick*0.8)) * uClick;

  col += lineCol * g * depthFade * (0.8 + 0.5*sin(zg*0.3 + uTime));
  col += lineCol * ring * 2.0;

  float dM = length(uv - m);
  col += cyan * exp(-dM*6.0) * (0.25 + 0.3*uIntens);

  col *= 0.95 + 0.05*sin(frag.y*2.0 + uTime*20.0);
  col += (hash(frag+uTime)-0.5)*0.02;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- AURORA (rebuilt: electric curtains) ---------- */
const FRAG_AURORA = `
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime;
uniform float uClick; uniform vec2 uClickPos;
uniform float uIntens; uniform float uQuality;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  int N = uQuality>0.5 ? 5 : 3;
  for(int i=0;i<5;i++){ if(i>=N) break; v+=a*noise(p); p*=2.03; a*=0.5; }
  return v;
}

// one electric curtain: returns {density, chromaticOffset}
// curtain is a vertical column of light whose lateral position wiggles with noise.
// we integrate along y to get volumetric thickness.
vec2 curtain(vec2 p, float xCenter, float seed, float speed){
  // per-column flicker
  float flicker = 0.85 + 0.3*noise(vec2(p.x*4.0 + seed, uTime*speed));
  // lateral wobble per height
  float wob = (fbm(vec2(p.y*1.6 + seed, uTime*speed)) - 0.5) * 0.35;
  float x = p.x - xCenter - wob;
  // base vertical profile: bright in upper half, tapers top & bottom
  float yTop    = smoothstep(0.95, 0.15, p.y);        // fade at very top
  float yBottom = smoothstep(-0.9, 0.1, p.y);         // fade at bottom
  float prof = yTop * yBottom;
  // horizontal falloff - sharpened for "shaft" look
  float w = 0.05 + 0.03*sin(p.y*3.0 + seed) + 0.02*uIntens;
  float shaft = exp(- (x*x) / (w*w) );
  // thin shimmer filaments inside the shaft
  float shimmer = 0.5 + 0.5*sin(p.y*30.0 + uTime*speed*3.0 + seed*6.0 + x*18.0);
  shaft *= mix(0.55, 1.0, shimmer);
  return vec2(shaft * prof * flicker, x);
}

void main(){
  vec2 uv = gl_FragCoord.xy/uRes.xy;                 // 0..1
  vec2 p  = (gl_FragCoord.xy - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m  = (uMouse/uRes - 0.5);                     // -0.5..0.5
  vec2 cp = (uClickPos/uRes - 0.5);

  // cursor "pulls" the curtain horizontally near its height
  float pullX = m.x * (0.25 + 0.7*uIntens);
  float pullScope = exp(-abs(p.y - m.y*1.4)*1.2);
  p.x -= pullX * pullScope;

  // click shockwave displaces & brightens near epicenter
  float dC = length(p - vec2(cp.x*2.0, cp.y*2.0));
  float shock = exp(-dC*2.2) * uClick;
  p.y += shock * 0.15 * sin(dC*18.0 - uTime*6.0);

  // deep night-sky gradient
  vec3 sky = mix(vec3(0.01,0.01,0.04), vec3(0.05,0.02,0.12), uv.y);
  sky = mix(sky, vec3(0.0,0.0,0.015), smoothstep(0.45,0.0,uv.y));

  // distant starfield
  vec2 sg = floor(gl_FragCoord.xy*0.7);
  float star = step(0.9965, hash(sg)) * smoothstep(0.2, 0.6, uv.y);
  float tw   = 0.5 + 0.5*sin(uTime*2.5 + hash(sg)*30.0);
  sky += vec3(0.95,0.95,1.0) * star * tw;

  // ground silhouette
  float ridge = -0.35 + 0.06*sin(p.x*2.3 + 0.3) + 0.03*sin(p.x*7.0+1.1) + 0.015*sin(p.x*19.0);
  float gMask = smoothstep(ridge, ridge-0.008, p.y);
  sky = mix(sky, vec3(0.0,0.005,0.02), gMask);

  vec3 col = sky;

  // base electric colors
  vec3 TEAL  = vec3(0.15, 1.0, 0.80);
  vec3 CYAN  = vec3(0.25, 0.85, 1.0);
  vec3 MAG   = vec3(1.0, 0.25, 0.85);
  vec3 VIO   = vec3(0.55, 0.25, 1.0);
  vec3 HOT   = vec3(1.0, 0.45, 0.75);

  // layered curtains - positions drift slowly, boosted near cursor
  float t = uTime*0.08;
  float drift = sin(t*0.6)*0.15;
  vec2 cur[6];
  cur[0] = curtain(p, -0.85 + drift, 1.7, 0.5);
  cur[1] = curtain(p, -0.35 - drift*0.7, 3.4, 0.7);
  cur[2] = curtain(p,  0.10 + sin(t*0.9)*0.08, 5.9, 0.6);
  cur[3] = curtain(p,  0.55 - drift*0.4, 7.2, 0.8);
  cur[4] = curtain(p,  1.0 + drift, 9.1, 0.55);
  cur[5] = curtain(p,  m.x*1.8, 11.0, 1.1); // cursor-anchored curtain

  // additive volumetric accumulation (chromatic split on x offset)
  vec3 curtainCol = vec3(0.0);
  curtainCol += TEAL * cur[0].x * 0.9;
  curtainCol += CYAN * cur[1].x * 0.9;
  curtainCol += MAG  * cur[2].x * 1.1;
  curtainCol += VIO  * cur[3].x * 0.9;
  curtainCol += HOT  * cur[4].x * 0.8;
  curtainCol += mix(TEAL, MAG, 0.5 + 0.5*sin(uTime*0.8)) * cur[5].x * (1.0 + uIntens);

  // chromatic edge bleed using x-offset field
  float edge = 0.0;
  edge += abs(cur[0].y)*cur[0].x;
  edge += abs(cur[2].y)*cur[2].x;
  edge += abs(cur[4].y)*cur[4].x;
  curtainCol += vec3(0.3,0.8,1.0) * edge * 0.25;

  // broad soft background bloom from summed density
  float density = cur[0].x + cur[1].x + cur[2].x + cur[3].x + cur[4].x + cur[5].x;
  vec3 bloom = mix(TEAL, MAG, smoothstep(-0.3, 0.3, p.x)) * density * 0.25;

  col += curtainCol;
  col += bloom;

  // horizon reflection glow
  float horizonGlow = exp(-abs(p.y - ridge)*8.0);
  col += mix(TEAL, MAG, 0.5+0.5*sin(p.x*2.0+uTime*0.3)) * horizonGlow * density * 0.08;

  // click bright flash
  col += vec3(0.9,1.0,1.0) * shock * 0.6;

  // subtle scanline atmospheric haze
  col += 0.02 * vec3(0.5,0.8,1.0) * (sin(uv.y*800.0)*0.5+0.5) * density;

  // vignette & grain
  col *= 0.82 + 0.25*(1.0 - length((uv-0.5)*vec2(1.0,1.1)));
  col += (hash(gl_FragCoord.xy+uTime)-0.5)*0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- VORTEX (rebuilt: fireflies swarm) ---------- */
const FRAG_VORTEX = `
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime;
uniform float uClick; uniform vec2 uClickPos;
uniform float uIntens; uniform float uQuality;

float hash(vec2 p){ return fract(sin(dot(p,vec2(23.1,91.7)))*43758.5); }
vec2  hash2(vec2 p){
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))))*43758.5);
}
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}

// a single firefly: wanders on its home orbit, drifts organically,
// orbits mouse when close (flocking), flares on click.
// returns rgb contribution
vec3 firefly(vec2 uv, vec2 m, vec2 cp, float id){
  // each firefly has its own seed
  vec2 s = hash2(vec2(id, 7.1));
  // color hue: warm palette - amber, peach, gold, rose
  vec3 warm[4];
  warm[0] = vec3(1.00, 0.82, 0.40);
  warm[1] = vec3(1.00, 0.55, 0.35);
  warm[2] = vec3(1.00, 0.72, 0.88);
  warm[3] = vec3(0.85, 0.95, 0.55);
  int ci = int(mod(id, 4.0));
  vec3 col = warm[0];
  if(ci==1) col = warm[1];
  else if(ci==2) col = warm[2];
  else if(ci==3) col = warm[3];

  // home orbit around origin (slowly drifting)
  float orbitR = 0.15 + s.x*0.85;                  // 0.15..1.0
  float speed  = (0.15 + s.y*0.45) * (id*0.5 > 0.0 ? 1.0 : -1.0);
  float dir    = (mod(id, 2.0) < 1.0) ? 1.0 : -1.0;
  float ang    = uTime*speed*dir + s.x*6.28 + id*0.37;

  // organic wander via noise
  vec2 home = vec2(cos(ang), sin(ang)) * orbitR;
  home += (vec2(noise(vec2(uTime*0.3 + id*2.1, 0.0)),
                noise(vec2(0.0, uTime*0.3 + id*3.7))) - 0.5) * 0.25;

  // flocking: when mouse close to home, firefly orbits mouse
  float distToM = length(home - m);
  float flock = exp(-distToM * 1.4) * (0.6 + 0.8*uIntens);
  // orbit tangent around mouse
  vec2 dm = home - m;
  vec2 tan = vec2(-dm.y, dm.x);
  home += normalize(tan + 0.0001) * flock * 0.05 * sin(uTime*2.0 + id*1.3);
  // gentle attraction to mouse
  home = mix(home, m, flock * 0.25);

  // click: scatter outward briefly
  vec2 fromC = home - cp;
  float cd = length(fromC);
  float scatter = exp(-cd*2.0) * uClick;
  home += normalize(fromC + 0.0001) * scatter * 0.35;

  // twinkle on/off
  float pulse = 0.5 + 0.5*sin(uTime*(1.2 + s.x*2.0) + id*1.17);
  pulse = pow(pulse, 2.0);

  // glow body
  float d = length(uv - home);
  float size = (0.005 + s.y*0.008) * (0.7 + 0.6*pulse);
  float core = exp(-d/size);
  float halo = exp(-d*6.0) * 0.35;
  float ray  = exp(-d*2.2) * 0.12;

  float flare = 1.0 + uClick*1.5;

  return col * (core*1.4 + halo + ray) * pulse * flare;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m  = (uMouse - 0.5*uRes)/min(uRes.x,uRes.y);
  vec2 cp = (uClickPos - 0.5*uRes)/min(uRes.x,uRes.y);

  // deep dusk sky gradient
  vec3 bg = mix(vec3(0.015,0.01,0.03), vec3(0.04,0.02,0.06), length(uv)*0.8);
  // warm horizon glow
  bg += vec3(0.12,0.06,0.04) * exp(-length(uv+vec2(0.0,0.9))*1.3) * 0.6;

  vec3 col = bg;

  // soft mouse halo (moonlight follows cursor)
  float dM = length(uv - m);
  col += vec3(0.35,0.45,0.55) * exp(-dM*3.0) * 0.08;
  col += vec3(1.0,0.85,0.6) * exp(-dM*10.0) * 0.15 * (0.6 + 0.6*uIntens);

  // particle count - downgrade on low quality
  const int MAX_FLIES = 34;
  int N = uQuality>0.5 ? MAX_FLIES : 18;

  for(int i=0;i<MAX_FLIES;i++){
    if(i>=N) break;
    col += firefly(uv, m, cp, float(i));
  }

  // distant dust / particulate
  float dust = noise(uv*8.0 + uTime*0.05) * noise(uv*23.0 - uTime*0.02);
  col += vec3(0.5,0.4,0.3) * dust * 0.03;

  // faint scattered background stars (cold)
  vec2 sg = floor(frag*0.55);
  float st = step(0.997, hash(sg));
  col += vec3(0.8,0.9,1.0) * st * (0.3 + 0.4*sin(uTime*2.0 + hash(sg)*20.0));

  // click radial glow
  float dC = length(uv - cp);
  col += vec3(1.0,0.8,0.5) * exp(-dC*3.0) * uClick * 0.4;

  // vignette + grain
  col *= 0.85 + 0.25*(1.0 - length(uv)*0.7);
  col += (hash(frag+uTime)-0.5)*0.018;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* =========================================================================
 * PRESETS
 * ========================================================================= */

const PRESETS = Object.freeze({
  metal:  { name: 'Liquid Metal',    color: '#d9c7ff', frag: FRAG_METAL  },
  plasma: { name: 'Plasma Field',    color: '#ff7bd1', frag: FRAG_PLASMA },
  grid:   { name: 'Neon Grid',       color: '#4df0ff', frag: FRAG_GRID   },
  aurora: { name: 'Aurora',          color: '#7affc4', frag: FRAG_AURORA },
  vortex: { name: 'Fireflies',       color: '#ffb26b', frag: FRAG_VORTEX },
});

const PRESET_IDS = Object.freeze(Object.keys(PRESETS));

/* =========================================================================
 * ShaderWallpaper class
 *
 * new ShaderWallpaper(target?, options?)
 *   target  : HTMLElement | null. If omitted, appended to <body> as fullscreen.
 *   options : {
 *     preset    : string              // preset id, default 'aurora'
 *     intensity : number              // 0..1, default 0.85 (fidget-toy high)
 *     quality   : 'auto'|'high'|'low' // default 'auto'
 *     autoStart : boolean             // default true
 *     pointer   : boolean             // default true
 *     clicks    : boolean             // default true
 *     pixelRatio: number|null         // override DPR
 *   }
 *
 * Methods: setPreset, setIntensity, start, stop, pulse(x,y), destroy, canvas
 * ========================================================================= */

class ShaderWallpaper {
  constructor(target = null, options = {}) {
    const opts = Object.assign({
      preset: 'aurora',
      intensity: 0.85,
      quality: 'auto',
      autoStart: true,
      pointer: true,
      clicks: true,
      pixelRatio: null,
    }, options);

    // attach to container OR fullscreen overlay
    this._ownRoot = !target;
    if (!target) {
      target = document.createElement('div');
      Object.assign(target.style, {
        position: 'fixed', inset: '0', zIndex: '-1',
        pointerEvents: 'auto', overflow: 'hidden',
      });
      document.body.appendChild(target);
    } else {
      // ensure positioning context
      const cs = getComputedStyle(target);
      if (cs.position === 'static') target.style.position = 'relative';
      if (cs.overflow === 'visible') target.style.overflow = 'hidden';
    }
    this.target = target;

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      display: 'block',
      position: 'absolute', inset: '0',
      width: '100%', height: '100%',
    });
    target.appendChild(canvas);
    this.canvas = canvas;

    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) {
      console.error('[shader-wallpaper] WebGL not supported');
      return;
    }
    this.gl = gl;

    this._opts = opts;
    this._presetId = opts.preset in PRESETS ? opts.preset : 'aurora';
    this._intensity = Math.max(0, Math.min(1, opts.intensity));
    this._progs = {}; // compiled on demand
    this._buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    // quality
    this._qualityMode = opts.quality;
    this._quality = this._resolveQuality();

    // state
    this._start = performance.now();
    this._mouse = [0, 0];
    this._target = [0, 0];
    this._clickPos = [0, 0];
    this._clickStrength = 0;
    this._lastT = performance.now();
    this._running = false;

    // ensure active preset is compiled so first frame is instant
    this._ensureProgram(this._presetId);

    // size
    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(target);
    window.addEventListener('resize', this._onResize = () => this._resize());

    // set mouse far off-canvas initially so no blob is "captured" before any real interaction
    this._mouse = [-9999, -9999];
    this._target = [-9999, -9999];
    const r = this.canvas.getBoundingClientRect();
    this._clickPos = [r.width * 0.5 * this._dpr, r.height * 0.5 * this._dpr];

    // pointer
    if (opts.pointer) {
      this._onMove = (e) => this._setMouseFromEvent(e);
      canvas.addEventListener('pointermove', this._onMove);
      canvas.addEventListener('pointerenter', this._onMove);
      canvas.addEventListener('pointerleave', () => {
        // push mouse far off-canvas so no blob is captured while pointer is away
        this._target = [-9999, -9999];
      });
      canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0]; if (!t) return;
        this._setMouseFromEvent(t);
      }, { passive: true });
      canvas.addEventListener('touchend', () => { this._target = [-9999, -9999]; });
    }
    if (opts.clicks) {
      this._onDown = (e) => {
        this._setMouseFromEvent(e);
        this._clickPos = this._target.slice();
        this._clickStrength = 1.0;
        this.target.dispatchEvent(new CustomEvent('shaderpulse', { detail: { x: e.clientX, y: e.clientY } }));
      };
      canvas.addEventListener('pointerdown', this._onDown);
    }

    if (opts.autoStart) this.start();
  }

  _resolveQuality() {
    if (this._qualityMode === 'high') return 1.0;
    if (this._qualityMode === 'low')  return 0.0;
    // auto: downgrade on small screens or coarse pointer
    const small = Math.min(window.innerWidth, window.innerHeight) < 720;
    const coarse = matchMedia && matchMedia('(pointer: coarse)').matches;
    return (small || coarse) ? 0.0 : 1.0;
  }

  _dprValue() {
    if (this._opts.pixelRatio) return this._opts.pixelRatio;
    const base = Math.min(window.devicePixelRatio || 1, 2);
    return this._quality < 0.5 ? Math.min(base, 1.25) : base;
  }

  _resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = this._dprValue();
    this._dpr = dpr;
    const w = Math.max(1, Math.floor(r.width * dpr));
    const h = Math.max(1, Math.floor(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  _setMouseFromEvent(e) {
    const r = this.canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * this._dpr;
    const y = (r.height - (e.clientY - r.top)) * this._dpr;
    this._target = [x, y];
  }

  _compile(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[shader-wallpaper] compile error', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  _ensureProgram(id) {
    if (this._progs[id]) return this._progs[id];
    const gl = this.gl;
    const p = gl.createProgram();
    const vs = this._compile(gl.VERTEX_SHADER, VERT);
    const fs = this._compile(gl.FRAGMENT_SHADER, PRESETS[id].frag);
    if (!vs || !fs) return null;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('[shader-wallpaper] link error', gl.getProgramInfoLog(p));
      return null;
    }
    this._progs[id] = {
      prog: p,
      aPos: gl.getAttribLocation(p, 'aPos'),
      uRes: gl.getUniformLocation(p, 'uRes'),
      uMouse: gl.getUniformLocation(p, 'uMouse'),
      uTime: gl.getUniformLocation(p, 'uTime'),
      uClick: gl.getUniformLocation(p, 'uClick'),
      uClickPos: gl.getUniformLocation(p, 'uClickPos'),
      uIntens: gl.getUniformLocation(p, 'uIntens'),
      uQuality: gl.getUniformLocation(p, 'uQuality'),
    };
    return this._progs[id];
  }

  setPreset(id) {
    if (!(id in PRESETS)) return;
    this._presetId = id;
    this._ensureProgram(id);
    this.target.dispatchEvent(new CustomEvent('presetchange', { detail: { preset: id } }));
  }

  setIntensity(v) { this._intensity = Math.max(0, Math.min(1, +v)); }

  pulse(xPx, yPx) {
    const r = this.canvas.getBoundingClientRect();
    if (xPx == null) { xPx = r.width / 2; yPx = r.height / 2; }
    this._clickPos = [xPx * this._dpr, (r.height - yPx) * this._dpr];
    this._clickStrength = 1.0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastT = performance.now();
    const tick = () => {
      if (!this._running) return;
      this._frame();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  destroy() {
    this.stop();
    if (this._ro) this._ro.disconnect();
    window.removeEventListener('resize', this._onResize);
    if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    if (this._ownRoot && this.target && this.target.parentNode) this.target.parentNode.removeChild(this.target);
    this.canvas = null; this.gl = null;
  }

  _frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this._lastT) / 1000);
    this._lastT = now;
    // ease mouse - snap instantly if coming back from offscreen
    const inactive = this._mouse[0] < -5000 || this._target[0] < -5000;
    if (this._mouse[0] < -5000 && this._target[0] > -5000) {
      this._mouse[0] = this._target[0];
      this._mouse[1] = this._target[1];
    } else {
      this._mouse[0] += (this._target[0] - this._mouse[0]) * 0.14;
      this._mouse[1] += (this._target[1] - this._mouse[1]) * 0.14;
    }
    // decay click
    this._clickStrength *= Math.pow(0.015, dt);

    const gl = this.gl;
    const p = this._ensureProgram(this._presetId);
    if (!p) return;
    gl.useProgram(p.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
    gl.enableVertexAttribArray(p.aPos);
    gl.vertexAttribPointer(p.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(p.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(p.uMouse, this._mouse[0], this._mouse[1]);
    gl.uniform1f(p.uTime, (now - this._start) / 1000);
    gl.uniform1f(p.uClick, this._clickStrength);
    gl.uniform2f(p.uClickPos, this._clickPos[0], this._clickPos[1]);
    gl.uniform1f(p.uIntens, this._intensity);
    gl.uniform1f(p.uQuality, this._quality);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

/* =========================================================================
 * Custom element: <shader-wallpaper preset="..." intensity="..." quality="...">
 * ========================================================================= */

class ShaderWallpaperElement extends HTMLElement {
  static get observedAttributes() { return ['preset', 'intensity', 'quality']; }

  connectedCallback() {
    // auto-size: if no explicit size, fill parent. If we're a root-level element
    // and the parent is <body>, present as fullscreen.
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.width)  this.style.width  = '100%';
    if (!this.style.height) this.style.height = '100%';
    if (!this.style.position) this.style.position = 'relative';
    if (!this.style.overflow) this.style.overflow = 'hidden';
    // fullscreen fallback: if parent has no layout height, fill viewport
    const parent = this.parentElement;
    if (parent && parent.tagName === 'BODY') {
      Object.assign(this.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh' });
    }

    if (this._instance) return;
    const opts = {
      preset: this.getAttribute('preset') || 'aurora',
      intensity: this.hasAttribute('intensity') ? parseFloat(this.getAttribute('intensity')) : 0.85,
      quality: this.getAttribute('quality') || 'auto',
    };
    this._instance = new ShaderWallpaper(this, opts);
  }

  disconnectedCallback() {
    if (this._instance) { this._instance.destroy(); this._instance = null; }
  }

  attributeChangedCallback(name, _old, val) {
    if (!this._instance) return;
    if (name === 'preset') this._instance.setPreset(val);
    else if (name === 'intensity') this._instance.setIntensity(parseFloat(val));
    // quality changes require reconstruct - skip for simplicity
  }

  // proxy methods
  setPreset(id)      { this._instance && this._instance.setPreset(id); }
  setIntensity(v)    { this._instance && this._instance.setIntensity(v); }
  pulse(x, y)        { this._instance && this._instance.pulse(x, y); }
}

if (typeof customElements !== 'undefined' && !customElements.get('shader-wallpaper')) {
  customElements.define('shader-wallpaper', ShaderWallpaperElement);
}

/* expose on window for plain <script> consumers */
if (typeof window !== 'undefined') {
  window.ShaderWallpaper = ShaderWallpaper;
  window.ShaderWallpaperPresets = PRESETS;
}


global.ShaderWallpaper = ShaderWallpaper;
global.ShaderWallpaperPresets = PRESETS;
global.ShaderWallpaperPresetIds = PRESET_IDS;
})(typeof window !== 'undefined' ? window : this);
