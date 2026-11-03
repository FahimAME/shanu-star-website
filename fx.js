/* Shanu Star — soft light sheen on "Your Trust." and across the live-rates card.
   Adds motion only (no layout change) and switches off when the visitor's device asks for reduced motion. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var css =
    '.hero-title em{background:linear-gradient(100deg,#e8c56d 0%,#e8c56d 38%,#fff3cc 48%,#e8c56d 58%,#e8c56d 100%);background-size:260% 100%;' +
      '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:fxSheen 6.5s ease-in-out 1.6s infinite}' +
    '@keyframes fxSheen{0%{background-position:100% 0}45%,100%{background-position:0 0}}' +
    '.fx-sweep{position:absolute;inset:0;overflow:hidden;pointer-events:none;border-radius:inherit;z-index:3}' +
    '.fx-sweep::after{content:"";position:absolute;top:-20%;bottom:-20%;width:22%;left:-30%;transform:skewX(-18deg);' +
      'background:linear-gradient(90deg,rgba(255,236,180,0),rgba(255,236,180,.10),rgba(255,236,180,0));animation:fxSweep 7s ease-in-out 2s infinite}' +
    '@keyframes fxSweep{0%{left:-30%}35%,100%{left:120%}}' +
    '@media print{.fx-sweep{display:none}.hero-title em{-webkit-text-fill-color:currentColor;background:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var box = document.querySelector('.price-box');
  if (box) { var sw = document.createElement('div'); sw.className = 'fx-sweep'; sw.setAttribute('aria-hidden', 'true'); box.appendChild(sw); }
})();
