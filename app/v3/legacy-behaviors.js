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

  /* Hero headline char-by-char reveal (React Bits SplitText, ported to vanilla GSAP) */
  (function initHeroSplit(){
    var heading = document.getElementById('heroHeadline');
    if(!heading) return;
    if(reduceMotion || typeof gsap === 'undefined' || typeof SplitText === 'undefined') return;
    gsap.registerPlugin(SplitText);

    function runSplit(){
      /* Split words as well as chars: each char becomes an inline-block, so without
         a word wrapper the browser is free to line-break between any two letters
         (which split "business's" across two lines). Wrapping words keeps them intact. */
      var split = new SplitText(heading, {
        type: 'words, chars',
        wordsClass: 'split-word',
        charsClass: 'split-char'
      });
      gsap.fromTo(split.chars,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.018 }
      );
    }

    if(document.fonts && document.fonts.status !== 'loaded'){
      document.fonts.ready.then(runSplit);
    } else {
      runSplit();
    }
  })();

  /* Sticky nav shrink-on-scroll */
  var nav = document.getElementById('siteNav');
  function onScrollNav(){
    if(!nav) return;
    if(window.scrollY > 24){ nav.classList.add('nav-scrolled'); }
    else{ nav.classList.remove('nav-scrolled'); }
  }
  document.addEventListener('scroll', onScrollNav, { passive:true });
  onScrollNav();

  /* Desktop "Solutions" dropdown */
  var solutionsItem = document.getElementById('solutionsItem');
  var solutionsTrigger = document.getElementById('solutionsTrigger');
  function closeSolutions(){
    if(!solutionsItem) return;
    solutionsItem.classList.remove('is-open');
    solutionsTrigger.setAttribute('aria-expanded', 'false');
  }
  if(solutionsTrigger){
    solutionsTrigger.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = solutionsItem.classList.toggle('is-open');
      solutionsTrigger.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', function(e){
      if(!solutionsItem.contains(e.target)){ closeSolutions(); }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ closeSolutions(); }
    });
  }

  /* Mobile nav sheet + accordion */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMobileMenu(){
    if(!mobileMenu) return;
    mobileMenu.hidden = true;
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if(navToggle && mobileMenu){
    navToggle.addEventListener('click', function(){
      var isOpen = mobileMenu.hidden;
      mobileMenu.hidden = !isOpen;
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', closeMobileMenu);
    });
  }
  var mobileSolutionsTrigger = document.getElementById('mobileSolutionsTrigger');
  var mobileSolutionsPanel = document.getElementById('mobileSolutionsPanel');
  if(mobileSolutionsTrigger && mobileSolutionsPanel){
    mobileSolutionsTrigger.addEventListener('click', function(){
      var isOpen = mobileSolutionsPanel.hidden;
      mobileSolutionsPanel.hidden = !isOpen;
      mobileSolutionsTrigger.classList.toggle('is-open', isOpen);
      mobileSolutionsTrigger.setAttribute('aria-expanded', String(isOpen));
    });
  }
  /* Collapse the mobile sheet if the viewport grows past the mobile breakpoint */
  window.addEventListener('resize', function(){
    if(window.innerWidth >= 960){ closeMobileMenu(); }
  });

  /* Scroll-reveal fade/rise */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll('[data-count-to]');
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){ el.textContent = prefix + target + suffix; return; }
    var start = null;
    var duration = 1400;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = prefix + value + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
      else{ el.textContent = prefix + target + suffix; }
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold:0.6 });
    counters.forEach(function(el){ cio.observe(el); });
  }

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

  /* Testimonial carousel */
  var track = document.getElementById('testimonialTrack');
  var dotsWrap = document.getElementById('testimonialDots');
  var prevBtn = document.getElementById('testimonialPrev');
  var nextBtn = document.getElementById('testimonialNext');
  if(track && dotsWrap){
    var slides = track.querySelectorAll('.testimonial-slide');
    var perView = window.innerWidth >= 860 ? 3 : 1;
    var maxIndex = Math.max(0, slides.length - perView);
    var index = 0;

    slides.forEach(function(_, i){
      var dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function(){ goTo(i > maxIndex ? maxIndex : i); });
      dotsWrap.appendChild(dot);
    });

    function update(){
      var slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = 'translateX(-' + (index * slideWidth) + 'px)';
      Array.prototype.forEach.call(dotsWrap.children, function(dot, i){
        dot.classList.toggle('is-active', i === index);
      });
    }
    function goTo(i){
      index = Math.max(0, Math.min(i, slides.length - 1));
      update();
    }
    prevBtn && prevBtn.addEventListener('click', function(){ goTo(index - 1 < 0 ? slides.length - 1 : index - 1); });
    nextBtn && nextBtn.addEventListener('click', function(){ goTo(index + 1 >= slides.length ? 0 : index + 1); });
    window.addEventListener('resize', function(){
      perView = window.innerWidth >= 860 ? 3 : 1;
      maxIndex = Math.max(0, slides.length - perView);
      update();
    });
    update();

    if(!reduceMotion){
      var autoplay = setInterval(function(){ goTo(index + 1 >= slides.length ? 0 : index + 1); }, 6000);
      track.closest('.testimonial-carousel').addEventListener('mouseenter', function(){ clearInterval(autoplay); });
    }
  }

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
