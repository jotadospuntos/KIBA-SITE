'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/useMotionPreference';

/*
 * Animated WebGL gradient blob behind the CTA band, replacing the '#blobCanvas'
 * block in app/v3/legacy-behaviors.js.
 *
 * The GLSL below is the original shader source, unchanged - this port is about
 * lifecycle, not visuals. What it adds over the vanilla version is real
 * teardown: that one leaked a live requestAnimationFrame loop, an
 * IntersectionObserver, a resize listener and the GL context itself, which was
 * survivable for a script that ran once per full page load but not across
 * client-side navigations, where each visit would strand another animating
 * context. Browsers cap simultaneous WebGL contexts (~8-16), so leaked ones
 * eventually cause the newest canvas to fail to acquire a context at all.
 *
 * Kept from the original:
 *  - the rAF loop only runs while the canvas is actually on screen
 *    (IntersectionObserver, threshold 0.05)
 *  - reduced motion draws exactly one static frame instead of animating
 *  - devicePixelRatio is capped at 1.5, since this is a soft blurred gradient
 *    and full DPR on a large canvas is wasted fill rate
 *  - if WebGL is unavailable the whole wrapper is hidden, leaving the CTA
 *    band's solid navy gradient fallback
 */

const VERTEX_SHADER_SRC = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';
const FRAGMENT_SHADER_SRC = [
  'precision mediump float;',
  'uniform vec2 uRes;',
  'uniform float uTime;',
  'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }',
  'float noise(vec2 p){',
  '  vec2 i = floor(p); vec2 f = fract(p);',
  '  float a = hash(i); float b = hash(i + vec2(1.0,0.0));',
  '  float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));',
  '  vec2 u = f*f*(3.0-2.0*f);',
  '  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;',
  '}',
  'float fbm(vec2 p){',
  '  float v = 0.0; float amp = 0.5;',
  '  for(int i=0;i<5;i++){ v += amp*noise(p); p *= 2.0; amp *= 0.5; }',
  '  return v;',
  '}',
  'void main(){',
  '  vec2 uv = gl_FragCoord.xy / uRes.xy;',
  '  vec2 p = uv * vec2(uRes.x/uRes.y, 1.0) * 2.6;',
  '  float t = uTime * 0.06;',
  '  float n1 = fbm(p + vec2(t, -t*0.6));',
  '  float n2 = fbm(p*1.6 - vec2(t*0.8, t*0.3) + 4.0);',
  '  float n = mix(n1, n2, 0.5);',
  '  vec3 c1 = vec3(0.008,0.0,0.384);',
  '  vec3 c2 = vec3(0.0,0.145,0.682);',
  '  vec3 c3 = vec3(0.145,0.388,0.921);',
  '  vec3 c4 = vec3(0.427,0.580,0.961);',
  '  vec3 col = mix(c1, c2, smoothstep(0.2,0.55,n));',
  '  col = mix(col, c3, smoothstep(0.5,0.75,n));',
  '  col = mix(col, c4, smoothstep(0.72,0.95,n));',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

export default function GradientBlob() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* Mirrors the vanilla `parentNode.style.display = 'none'` fallback. */
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      setUnsupported(true);
      return;
    }

    const reduceMotion = prefersReducedMotion();

    /* Everything that needs releasing, collected so teardown can't miss one. */
    let program: WebGLProgram | null = null;
    const shaders: WebGLShader[] = [];
    let buffer: WebGLBuffer | null = null;
    let observer: IntersectionObserver | null = null;
    let rafId: number | null = null;
    let visible = false;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('createShader failed');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
      }
      shaders.push(shader);
      return shader;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;

    const render = (time: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = (time: number) => {
      render(time);
      if (visible && !reduceMotion) rafId = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      if (reduceMotion) render(0);
    };

    try {
      program = gl.createProgram();
      if (!program) throw new Error('createProgram failed');
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER_SRC));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
      }
      gl.useProgram(program);

      const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uRes = gl.getUniformLocation(program, 'uRes');
      uTime = gl.getUniformLocation(program, 'uTime');

      /* Animate only while on screen. A full-bleed fragment shader is pure fill
         rate, so running it behind the fold is wasted battery. */
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              visible = entry.isIntersecting;
              if (visible && rafId === null) rafId = requestAnimationFrame(loop);
              if (!visible && rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(canvas);
      } else {
        visible = true;
        rafId = requestAnimationFrame(loop);
      }

      if (reduceMotion) render(0);
      window.addEventListener('resize', onResize);
    } catch {
      /* WebGL present but unusable (shader compile/link failure, context loss
         mid-setup): hide the canvas and keep the CTA band's gradient fallback. */
      setUnsupported(true);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('resize', onResize);

      /* Release GL objects, then drop the context outright. Without
         WEBGL_lose_context the driver-side context can outlive the detached
         canvas until GC gets around to it. */
      shaders.forEach((shader) => {
        if (program) gl.detachShader(program, shader);
        gl.deleteShader(shader);
      });
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      className="blob-canvas-wrap"
      aria-hidden="true"
      style={unsupported ? { display: 'none' } : undefined}
    >
      <canvas id="blobCanvas" ref={canvasRef}></canvas>
    </div>
  );
}
