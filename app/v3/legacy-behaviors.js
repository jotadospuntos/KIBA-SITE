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

  /* The WebGL gradient blob now lives in components/GradientBlob, which also
     tears the GL context down on unmount - this version leaked it. */
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
