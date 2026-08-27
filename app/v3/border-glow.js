/*
 * The last vanilla behavior left from public/legacy/v2.html's inline scripts.
 * Everything else that used to live here is now a real React component - see
 * CLAUDE.md "What's been ported to real components so far". This file was
 * app/v3/legacy-behaviors.js until it shrank to just this one function.
 *
 * initBorderGlow drives the pointer-following edge glow on the 14
 * .border-glow-card elements. components/BorderGlow exists as a real component
 * but is deliberately NOT wired in: it renders a hardcoded <div> (5 of the 14
 * cards are <a href> links) and its inner wrapper's display:flex/overflow:auto
 * breaks .solution-visual's margin-top:auto, so using it would need a
 * polymorphic-element fork plus layout neutralizers to produce identical
 * output. Kept vanilla on purpose; see the note in page.tsx.
 */

/* eslint-disable */

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
