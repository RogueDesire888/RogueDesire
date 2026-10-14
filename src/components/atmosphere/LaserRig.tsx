"use client";

import { useEffect, useRef } from "react";
import { usePulse } from "@/lib/pulse";
import { LaserGrid } from "./LaserGrid";
import "./laser-rig.css";

const VERT = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Beams fan out from three origins on the horizon, sweep in slow arcs, and
// scatter through drifting fbm haze. Brightness lifts at most 15% on the beat.
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime, uPhase, uBeat, uCount, uHorizon;
uniform vec3 uAccent, uGlow;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float haze = fbm(p * 2.2 + vec2(uTime * 0.02, -uTime * 0.015));
  vec3 col = vec3(0.0);

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
    float t = dot(d, dir);
    if (t < 0.0) continue;
    float dist = length(d - dir * t);
    float w = 0.0015 + t * 0.004;
    float core = exp(-(dist * dist) / (w * w * 0.25));
    float bloom = exp(-dist / (w * 6.0 + 0.01)) * 0.35;
    float fade = smoothstep(1.7, 0.0, t) * smoothstep(0.0, 0.03, t);
    col += (uGlow * core * 1.2 + uAccent * bloom * (0.55 + 0.9 * haze)) * fade * on;
  }

  col += uAccent * haze * haze * 0.07 * (1.0 - uv.y * 0.5);
  col *= 1.0 + uBeat * 0.15;
  gl_FragColor = vec4(col, 1.0);
}`;

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

/**
 * Full-size WebGL laser rig (raw WebGL, one fragment shader on a quad).
 * Beam count and sweep speed follow --energy; brightness follows --beat.
 * Colors come from --accent / --accent-glow at mount. DPR capped at 1.5,
 * half resolution and fewer beams under 768px. Pauses offscreen, when its cue
 * layer is hidden, and with the tab. Reduced motion or no WebGL: static
 * LaserGrid (or nothing when `fallback` is false).
 */
export function LaserRig({ className = "", fallback = true }: { className?: string; fallback?: boolean }) {
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
    const uRes = u("uRes"), uTime = u("uTime"), uPhase = u("uPhase"), uBeat = u("uBeat"), uCount = u("uCount"), uHorizon = u("uHorizon");

    const styles = getComputedStyle(root);
    gl.uniform3fv(u("uAccent"), hexToRgb(styles.getPropertyValue("--accent")));
    gl.uniform3fv(u("uGlow"), hexToRgb(styles.getPropertyValue("--accent-glow")));
    root.dataset.state = "live";

    let mobile = false;
    const resize = () => {
      mobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (mobile ? 0.5 : 1);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uHorizon, parseFloat(getComputedStyle(root).getPropertyValue("--rig-horizon")) || 0.32);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Run only while on screen and while any parent cue layer is visible.
    let onScreen = false;
    let cueVisible = true;
    const cue = root.closest<HTMLElement>(".rd-cue");
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      kick();
    });
    io.observe(root);
    const cuePoll = cue
      ? window.setInterval(() => {
          cueVisible = parseFloat(getComputedStyle(cue).opacity) > 0.01;
          kick();
        }, 400)
      : 0;

    let raf = 0;
    let running = false;
    let last = performance.now();
    let phase = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { beat, energy } = pulse.current;
      phase += dt * (0.25 + energy * 1.2);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uPhase, phase);
      gl.uniform1f(uBeat, beat);
      gl.uniform1f(uCount, mobile ? 4 + energy * 2 : 6 + energy * 4);
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

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      window.clearInterval(cuePoll);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      root.dataset.state = "static";
    };
  }, [pulse]);

  return (
    <div ref={ref} aria-hidden="true" data-state="static" className={`rd-rig pointer-events-none ${className}`}>
      {fallback && (
        <div className="rd-rig-fallback absolute inset-0">
          <LaserGrid />
        </div>
      )}
      <canvas ref={canvasRef} className="rd-rig-canvas absolute inset-0 block size-full" />
    </div>
  );
}
