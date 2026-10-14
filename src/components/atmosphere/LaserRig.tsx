"use client";

import { useEffect, useRef } from "react";
import { BURST_MS, getFogBursts, usePulse } from "@/lib/pulse";
import { LaserGrid } from "./LaserGrid";
import "./laser-rig.css";

const VERT = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Fog: domain-warped fbm, dense low and thinning upward, rolling sideways.
// Bursts: plumes rising from the bottom edge. Beams fan from three horizon
// origins and scatter through the fog (a faint core survives clear air).
// Fog behind text-bearing rects is capped at 25%. Beat lift stays under 15%.
const FRAG = `
precision mediump float;
uniform vec2 uRes, uPointer, uPointerVel;
uniform float uTime, uPhase, uBeat, uCount, uHorizon, uEnergy, uOctaves, uBeamAmt, uFogAmt, uPointerOn;
uniform vec3 uAccent, uGlow;
uniform vec4 uBurst0, uBurst1; // x, age (s), intensity, size
uniform vec4 uCap0, uCap1, uCap2, uCap3; // uv rects x0, y0, x1, y1

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= uOctaves) break;
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
float capMask(vec2 uv, vec4 r) {
  vec2 e = vec2(0.07, 0.09); // wide feather so caps never read as boxes
  vec2 m = smoothstep(r.xy - e, r.xy + e, uv) * (1.0 - smoothstep(r.zw - e, r.zw + e, uv));
  return m.x * m.y;
}
float burst(vec4 b, vec2 p, float aspect) {
  if (b.z <= 0.0) return 0.0;
  float t = b.y;
  vec2 c = vec2(b.x * aspect, -0.08 + t * 0.07 * b.w);
  float spread = (0.14 + t * 0.07) * b.w;
  vec2 d = p - c;
  d.y *= 0.65;
  float n = fbm(p * 3.2 - vec2(0.0, uTime * 0.35) + b.x * 13.0);
  float plume = exp(-dot(d, d) / (spread * spread)) * (0.6 + 1.4 * n);
  float fade = smoothstep(0.0, 0.8, t) * (1.0 - smoothstep(3.5, 8.0, t));
  return plume * fade * b.z;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  vec2 dp = p - vec2(uPointer.x * aspect, uPointer.y);
  float near = uPointerOn * exp(-dot(dp, dp) / 0.03);
  vec2 fp = p - uPointerVel * near * 0.25;

  vec2 q = vec2(fbm(fp * 1.4 + vec2(t * 0.04, 0.0)), fbm(fp * 1.4 + vec2(5.2, 1.3) + vec2(0.0, t * 0.03)));
  float n = fbm(fp * vec2(1.6, 2.4) + 1.8 * q + vec2(t * 0.06, -t * 0.015));
  float fog = smoothstep(0.12, 0.8, n) * exp(-uv.y * 2.2) * (0.9 + 0.35 * uEnergy);
  fog += burst(uBurst0, p, aspect) + burst(uBurst1, p, aspect);
  fog *= 1.0 - near * 0.85;
  fog = clamp(fog * uFogAmt, 0.0, 1.0);
  float cap = max(max(capMask(uv, uCap0), capMask(uv, uCap1)), max(capMask(uv, uCap2), capMask(uv, uCap3)));
  fog = mix(fog, min(fog, 0.25), cap);

  vec3 tint = mix(vec3(dot(uGlow, vec3(0.333))), uGlow, 0.35) * 0.95;
  vec3 col = tint * fog;

  vec3 beams = vec3(0.0);
  float bleed = 0.0;
  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float on = clamp(uCount - fi, 0.0, 1.0);
    if (on <= 0.0) continue;
    float o = mod(fi, 3.0);
    vec2 origin = vec2((0.2 + 0.3 * o) * aspect, uHorizon);
    float spread = mix(-1.15, 1.15, fract(fi * 0.618 + 0.13));
    float ang = spread + 0.35 * sin(uPhase * (0.6 + 0.25 * o) + fi * 1.7);
    vec2 dir = vec2(sin(ang), cos(ang));
    vec2 d = p - origin;
    float s = dot(d, dir);
    if (s < 0.0) continue;
    float dist = length(d - dir * s);
    float w = 0.0015 + s * 0.004;
    float core = exp(-(dist * dist) / (w * w * 0.25));
    float bloom = exp(-dist / (w * 6.0 + 0.01)) * 0.35;
    float fade = smoothstep(1.7, 0.0, s) * smoothstep(0.0, 0.03, s);
    beams += (uGlow * core * 1.2 + uAccent * bloom) * fade * on;
    bleed += bloom * fade * on;
  }
  col += beams * (0.45 + 1.6 * fog) * uBeamAmt;
  col += uAccent * bleed * fog * 0.6 * uBeamAmt;
  col *= 1.0 + uBeat * 0.15;
  gl_FragColor = vec4(col, 1.0);
}`;

/** Quality tiers, stepped down when fps stays under 50 for 2s, up after 10s of headroom. */
const TIERS = [
  { octaves: 4, scale: 0.75, mobileOctaves: 3, mobileScale: 0.5, pointer: true },
  { octaves: 3, scale: 0.75, mobileOctaves: 3, mobileScale: 0.5, pointer: true },
  { octaves: 3, scale: 0.5, mobileOctaves: 2, mobileScale: 0.4, pointer: true },
  { octaves: 2, scale: 0.5, mobileOctaves: 2, mobileScale: 0.4, pointer: false },
];

/** Per atmosphere cue: beam and fog strength. Fog sections keep beams low. */
const CUE_MIX: Record<string, [beams: number, fog: number]> = { lasers: [1, 0.45], fog: [0.12, 0.6] };

function hexToRgb(value: string): [number, number, number] {
  const hex = value.trim().replace("#", "");
  const n = Number.parseInt(hex.length === 3 ? hex.replace(/./g, "$&$&") : hex, 16);
  if (Number.isNaN(n)) return [0.55, 0.17, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

type Fallback = "grid" | "fog" | "none";

/**
 * Full-size WebGL laser rig with a fog machine (raw WebGL, one fragment
 * shader on a quad, one canvas). Beams follow --energy and --beat; fog bursts
 * come from the pulse engine. Inside an Atmosphere layer, beam/fog mix follows
 * the active cue. Pauses offscreen, when its cue layer is hidden, and with the
 * tab. Reduced motion or no WebGL: static fallback.
 */
export function LaserRig({ className = "", fallback = "grid" }: { className?: string; fallback?: Fallback }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulse = usePulse();

  useEffect(() => {
    const root = ref.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = Object.fromEntries(
      ["uRes", "uTime", "uPhase", "uBeat", "uCount", "uHorizon", "uEnergy", "uOctaves", "uBeamAmt", "uFogAmt",
        "uPointer", "uPointerVel", "uPointerOn", "uBurst0", "uBurst1", "uCap0", "uCap1", "uCap2", "uCap3"].map((n) => [n, u(n)]),
    );

    const styles = getComputedStyle(root);
    gl.uniform3fv(u("uAccent"), hexToRgb(styles.getPropertyValue("--accent")));
    gl.uniform3fv(u("uGlow"), hexToRgb(styles.getPropertyValue("--accent-glow")));
    root.dataset.state = "live";

    const dev = process.env.NODE_ENV !== "production";
    let tier = 0;
    let mobile = false;
    const resize = () => {
      mobile = window.innerWidth < 768;
      const q = TIERS[tier];
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (mobile ? q.mobileScale : q.scale);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uHorizon, parseFloat(getComputedStyle(root).getPropertyValue("--rig-horizon")) || 0.32);
      gl.uniform1f(U.uOctaves, mobile ? q.mobileOctaves : q.octaves);
      updateCaps();
    };
    const setTier = (next: number) => {
      tier = Math.max(0, Math.min(TIERS.length - 1, next));
      root.dataset.tier = String(tier);
      if (dev) console.info(`[LaserRig] quality tier ${tier}`);
      resize();
    };

    // Text-bearing rects (data-fog-cap) in canvas uv space, so fog stays under 25% behind text.
    let capsDue = 0;
    function updateCaps() {
      const box = canvas!.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const rects = [...document.querySelectorAll<HTMLElement>("[data-fog-cap]")]
        .map((el) => el.getBoundingClientRect())
        .map((r) => ({
          x0: (r.left - box.left) / box.width,
          x1: (r.right - box.left) / box.width,
          y0: (box.bottom - r.bottom) / box.height,
          y1: (box.bottom - r.top) / box.height,
        }))
        .filter((r) => r.y1 > 0 && r.y0 < 1 && r.x1 > 0 && r.x0 < 1)
        .sort((a, b) => (b.y1 - b.y0) * (b.x1 - b.x0) - (a.y1 - a.y0) * (a.x1 - a.x0))
        .slice(0, 4);
      ["uCap0", "uCap1", "uCap2", "uCap3"].forEach((name, i) => {
        const r = rects[i];
        gl!.uniform4f(U[name], r ? r.x0 : 0, r ? r.y0 : 0, r ? r.x1 : 0, r ? r.y1 : 0);
      });
    }
    const onScroll = () => {
      capsDue = 1;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pointer (fine pointers only): fog thins around it and is pushed along the movement.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: -1, y: -1, vx: 0, vy: 0, on: 0, t: 0 };
    const onPointer = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width;
      const y = (box.bottom - e.clientY) / box.height;
      const now = performance.now();
      const dt = Math.max(16, now - pointer.t) / 1000;
      if (pointer.t) {
        pointer.vx += ((x - pointer.x) / dt - pointer.vx) * 0.3;
        pointer.vy += ((y - pointer.y) / dt - pointer.vy) * 0.3;
      }
      Object.assign(pointer, { x, y, on: 1, t: now });
    };
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Run only while on screen and while any parent cue layer is visible.
    let onScreen = false;
    let cueVisible = true;
    const cueLayer = root.closest<HTMLElement>(".rd-cue");
    const atmo = root.closest<HTMLElement>(".rd-atmo");
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      kick();
    });
    io.observe(root);
    const cuePoll = cueLayer
      ? window.setInterval(() => {
          cueVisible = parseFloat(getComputedStyle(cueLayer).opacity) > 0.01;
          kick();
        }, 400)
      : 0;

    let raf = 0;
    let running = false;
    let last = performance.now();
    let phase = 0;
    let beamAmt = 1;
    let fogAmt = 0.8;
    let capClock = 0;
    let fpsFrames = 0;
    let fpsClock = 0;
    let slowSeconds = 0;
    let fastSeconds = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const rawDt = now - last;
      const dt = Math.min(0.1, rawDt / 1000);
      last = now;
      const { beat, energy } = pulse.current;

      // Adaptive quality, sampled once per second (ignoring resumes after a pause).
      if (rawDt < 250) {
        fpsFrames++;
        fpsClock += rawDt;
        if (fpsClock >= 1000) {
          const fps = (fpsFrames * 1000) / fpsClock;
          fpsFrames = 0;
          fpsClock = 0;
          slowSeconds = fps < 50 ? slowSeconds + 1 : 0;
          fastSeconds = fps >= 57 ? fastSeconds + 1 : 0;
          if (slowSeconds >= 2 && tier < TIERS.length - 1) {
            slowSeconds = 0;
            setTier(tier + 1);
          } else if (fastSeconds >= 10 && tier > 0) {
            fastSeconds = 0;
            setTier(tier - 1);
          }
        }
      }

      if (capsDue && now - capClock > 100) {
        capsDue = 0;
        capClock = now;
        updateCaps();
      }

      const [beamTarget, fogTarget] = (atmo && CUE_MIX[atmo.dataset.activeCue ?? ""]) || [1, 0.8];
      beamAmt += (beamTarget - beamAmt) * Math.min(1, dt * 1.5);
      fogAmt += (fogTarget - fogAmt) * Math.min(1, dt * 1.5);

      pointer.on *= Math.exp(-dt / 0.7); // recovers over ~2s
      pointer.vx *= Math.exp(-dt / 0.5);
      pointer.vy *= Math.exp(-dt / 0.5);
      const pointerOn = finePointer && TIERS[tier].pointer ? pointer.on : 0;

      const bursts = getFogBursts();
      const size = mobile ? 0.5 : 1;
      [U.uBurst0, U.uBurst1].forEach((loc, i) => {
        const b = bursts[bursts.length - 1 - i];
        const age = b ? (now - b.start) / 1000 : 0;
        gl.uniform4f(loc, b ? b.x : 0, age, b && age * 1000 < BURST_MS ? b.intensity : 0, size);
      });

      phase += dt * (0.25 + energy * 1.2);
      gl.uniform1f(U.uTime, (now - start) / 1000);
      gl.uniform1f(U.uPhase, phase);
      gl.uniform1f(U.uBeat, beat);
      gl.uniform1f(U.uEnergy, energy);
      gl.uniform1f(U.uCount, mobile ? 4 + energy * 2 : 6 + energy * 4);
      gl.uniform1f(U.uBeamAmt, beamAmt);
      gl.uniform1f(U.uFogAmt, fogAmt);
      gl.uniform2f(U.uPointer, pointer.x, pointer.y);
      gl.uniform2f(U.uPointerVel, Math.max(-2, Math.min(2, pointer.vx)), Math.max(-2, Math.min(2, pointer.vy)));
      gl.uniform1f(U.uPointerOn, pointerOn);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = onScreen && cueVisible ? requestAnimationFrame(frame) : 0;
      running = raf !== 0;
    };
    function kick() {
      if (running || !onScreen || !cueVisible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    setTier(0);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      window.clearInterval(cuePoll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      root.dataset.state = "static";
    };
  }, [pulse]);

  return (
    <div ref={ref} aria-hidden="true" data-state="static" className={`rd-rig pointer-events-none ${className}`}>
      {fallback !== "none" && (
        <div className="rd-rig-fallback absolute inset-0">
          <div className="rd-rig-fog absolute inset-0" />
          {fallback === "grid" && <LaserGrid />}
        </div>
      )}
      <canvas ref={canvasRef} className="rd-rig-canvas absolute inset-0 block size-full" />
    </div>
  );
}
