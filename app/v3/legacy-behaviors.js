/*
 * Behaviors ported from public/legacy/v2.html's inline <script> blocks, kept as
 * close to verbatim as possible so /v3 behaves identically to the static page.
 * These drive the DOM directly (getElementById / querySelector) rather than via
 * React state, which is why they run from a useEffect after mount and match the
 * ids/classNames in the JSX.
 *
 * These get replaced by real React components incrementally - SplitText and
 * BorderGlow both have proper component versions. Until then this keeps the
 * migration honest: same code, same behavior, just mounted from React.
 */

/* eslint-disable */

export function initLegacyBehaviors() {
(function(){
  var reduceMotion = !window.__forceMotion && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The hero headline reveal now lives in components/SplitText (real React
     Bits component, bundled GSAP) rather than being driven from here. */

  /* The sticky nav, the desktop Solutions dropdown, the mobile sheet and its
     accordion now live in components/SiteNav as real React state - including
     the dropdown's arrow-key handling, the sheet's focus trap, and the focus
     restore on Escape. Nothing here touches the nav anymore. */

  /* The scroll-reveal fade/rise now lives in components/Reveal (one observer
     per element, torn down on unmount) rather than being driven from here. */

  /* The animated stat counters now live in components/Counter (per-element
     observer + rAF, both cancelled on unmount) rather than being driven from
     here. */

  /* Cursor-reactive hero blobs */
  var heroVisual = document.getElementById('heroVisual');
  if(heroVisual && !reduceMotion && window.matchMedia('(pointer:fine)').matches){
    var blobs = heroVisual.querySelectorAll('.cursor-blob');
    heroVisual.addEventListener('mousemove', function(e){
      var rect = heroVisual.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width - 0.5;
      var cy = (e.clientY - rect.top) / rect.height - 0.5;
      blobs.forEach(function(blob){
        var depth = parseFloat(blob.getAttribute('data-depth')) || 20;
        blob.style.transform = 'translate(' + (cx * depth) + 'px,' + (cy * depth) + 'px)';
      });
    });
    heroVisual.addEventListener('mouseleave', function(){
      blobs.forEach(function(blob){ blob.style.transform = 'translate(0,0)'; });
    });
  }

  /* Marquee: duplicate content once for a seamless infinite loop */
  var marqueeTrack = document.getElementById('marqueeTrack');
  if(marqueeTrack){
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* The testimonial carousel now lives in components/TestimonialCarousel (real
     React state; autoplay interval cleared on unmount) rather than being driven
     from here. */

  /* Animated WebGL gradient blob (CTA band) */
  var canvas = document.getElementById('blobCanvas');
  if(canvas){
    try{
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if(!gl) throw new Error('no webgl');

      var vsSource = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';
      var fsSource = [
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

      function compile(type, source){
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
          throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
      }
      var program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw new Error(gl.getProgramInfoLog(program));
      }
      gl.useProgram(program);

      var quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
      var aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      var uRes = gl.getUniformLocation(program, 'uRes');
      var uTime = gl.getUniformLocation(program, 'uTime');

      function resize(){
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var rect = canvas.getBoundingClientRect();
        var w = Math.max(1, Math.round(rect.width * dpr));
        var h = Math.max(1, Math.round(rect.height * dpr));
        if(canvas.width !== w || canvas.height !== h){
          canvas.width = w; canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      }

      function render(time){
        resize();
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, time * 0.001);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      var visible = false;
      var rafId = null;
      function loop(time){
        render(time);
        if(visible && !reduceMotion){ rafId = requestAnimationFrame(loop); }
      }

      if('IntersectionObserver' in window){
        var bio = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            visible = entry.isIntersecting;
            if(visible && rafId === null){ rafId = requestAnimationFrame(loop); }
            if(!visible && rafId !== null){ cancelAnimationFrame(rafId); rafId = null; }
          });
        }, { threshold:0.05 });
        bio.observe(canvas);
      } else {
        visible = true;
        rafId = requestAnimationFrame(loop);
      }

      if(reduceMotion){ render(0); }
      window.addEventListener('resize', function(){ resize(); if(reduceMotion){ render(0); } });
    } catch(e){
      /* WebGL unavailable — the CTA band keeps its solid navy gradient fallback */
      if(canvas && canvas.parentNode){ canvas.parentNode.style.display = 'none'; }
    }
  }
})();
}

export function initBorderGlow() {
/* BorderGlow hover effect — vanilla port of the React Bits BorderGlow component */
(function(){
  function center(el){ var r = el.getBoundingClientRect(); return [r.width/2, r.height/2]; }
  function edgeProximity(el, x, y){
    var c = center(el), dx = x - c[0], dy = y - c[1];
    var kx = Infinity, ky = Infinity;
    if(dx !== 0) kx = c[0] / Math.abs(dx);
    if(dy !== 0) ky = c[1] / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }
  function cursorAngle(el, x, y){
    var c = center(el), dx = x - c[0], dy = y - c[1];
    if(dx === 0 && dy === 0) return 0;
    var deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if(deg < 0) deg += 360;
    return deg;
  }
  /* The glow is driven purely by pointer position, so it is hover feedback,
     not autonomous animation. It therefore stays enabled under
     prefers-reduced-motion; the eased transition is dropped in CSS instead,
     so the glow appears instantly with no animation. */
  document.querySelectorAll('.border-glow-card').forEach(function(card){
    card.addEventListener('pointermove', function(e){
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      card.style.setProperty('--edge-proximity', (edgeProximity(card, x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', cursorAngle(card, x, y).toFixed(3) + 'deg');
    });
    card.addEventListener('pointerenter', function(){ card.classList.add('glow-on'); });
    card.addEventListener('pointerleave', function(){
      card.classList.remove('glow-on');
      card.style.setProperty('--edge-proximity', '0');
    });
  });
})();
}
