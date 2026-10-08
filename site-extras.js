/* Shanu Star shared extras, loaded on every page:
   1. Google Analytics (GA4), only after the visitor accepts cookies
   2. Cookie consent banner (English and Arabic)
   3. Open now / Closed badge (Dubai time)
   4. Installable app (service worker + install button)

   >>> TO TURN ON ANALYTICS: replace G-XXXXXXXXXX below with your GA4 Measurement ID. <<<
*/
(function () {
  'use strict';

  var GA_ID = 'G-XXXXXXXXXX';
  var CONSENT_KEY = 'shanu_cookie_consent_v1';
  var WA_NUMBER = '971544339619';

  /* ---------- small helpers ---------- */
  function store(get, key, val) {
    try { return get ? window.localStorage.getItem(key) : window.localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (html) n.innerHTML = html;
    return n;
  }
  function bi(en, ar) { return '<span class="en">' + en + '</span><span class="ar">' + ar + '</span>'; }

  /* ---------- styles (own CSS so every page gets the same look) ---------- */
  var css = '' +
    '.se-banner{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:9998;width:calc(100% - 32px);max-width:760px;background:linear-gradient(180deg,#0d2456,#0a1e4a);border:1px solid var(--gold-border,rgba(201,168,76,.35));border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:22px 26px;display:flex;align-items:center;gap:22px;color:var(--text-2,#c9cfdd);font-family:var(--sans,"Josefin Sans",Arial,sans-serif);font-size:13.5px;line-height:1.65}' +
    '.se-banner::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--gold-bright,#e8c56d),transparent)}' +
    '.se-banner p{flex:1;margin:0}' +
    '.se-banner a{color:var(--gold-bright,#e8c56d);text-decoration:underline;text-underline-offset:3px}' +
    '.se-btns{display:flex;gap:10px;flex-shrink:0}' +
    '.se-btn{cursor:pointer;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:13px 22px;border-radius:3px;border:1px solid var(--gold-border,rgba(201,168,76,.35));background:transparent;color:var(--gold-pale,#f5e0a0);transition:all .25s}' +
    '.se-btn:hover{border-color:var(--gold-bright,#e8c56d);background:rgba(201,168,76,.1)}' +
    '.se-btn.se-yes{background:linear-gradient(135deg,#9a7b32,#c9a84c,#e8c56d);color:#04090f;border-color:transparent}' +
    '.se-btn.se-yes:hover{box-shadow:0 8px 24px rgba(201,168,76,.35)}' +
    '.se-btn:focus-visible,.se-banner a:focus-visible{outline:2px solid var(--gold-bright,#e8c56d);outline-offset:2px}' +
    '@media(max-width:768px){.se-banner{bottom:68px;flex-direction:column;align-items:stretch;gap:14px;padding:18px 18px}.se-btns{width:100%}.se-btn{flex:1;padding:14px 10px}}' +
    '.se-open{display:inline-flex;align-items:center;gap:9px;font-family:var(--sans,"Josefin Sans",Arial,sans-serif);font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:8px 16px;border-radius:30px;border:1px solid var(--gold-border,rgba(201,168,76,.35));background:rgba(6,15,36,.55);color:var(--gold-pale,#f5e0a0);white-space:nowrap}' +
    '.se-open i{width:8px;height:8px;border-radius:50%;background:#8793ad;flex-shrink:0}' +
    '.se-open.is-open i{background:#4ade80;box-shadow:0 0 0 0 rgba(74,222,128,.6);animation:seDot 2s infinite}' +
    '.se-open.is-closed i{background:#f87171}' +
    '.se-open small{font-size:10px;font-weight:600;letter-spacing:1.5px;color:var(--text-3,#8793ad);text-transform:none}' +
    '@keyframes seDot{0%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}70%{box-shadow:0 0 0 9px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}' +
    '.se-foot{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center;justify-content:center;margin:18px 0 6px}' +
    '.se-link{background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-3,#8793ad);padding:6px 2px;text-decoration:underline;text-underline-offset:4px}' +
    '.se-link:hover{color:var(--gold-bright,#e8c56d)}' +
    '@media(max-width:680px){.rate-ticker-inner{flex-direction:column!important;align-items:stretch!important}.rate-pulse-wrap{justify-content:center}.rate-items{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px!important;width:100%}.rate-item{flex-direction:column;align-items:center!important;gap:1px!important;padding:0!important}.rate-name{display:block!important;font-size:9px!important;letter-spacing:1px!important;white-space:nowrap}.rate-name .en,.rate-name .ar{font-size:9px}.rate-value{font-size:14px!important;white-space:nowrap}.rate-unit{display:none}}' +
    'main:focus{outline:none}' +
    '.se-skip{position:fixed;top:-60px;left:12px;z-index:10000;background:#e8c56d;color:#04090f;font-family:var(--sans,Arial,sans-serif);font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 20px;border-radius:0 0 6px 6px;text-decoration:none;transition:top .2s}' +
    '.se-skip:focus{top:0;outline:3px solid #04090f;outline-offset:-3px}' +
    'a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,[role=button]:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--gold-bright,#e8c56d);outline-offset:3px}' +
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}.ticker-track{animation:none!important}.hero-slide{animation:none!important;opacity:0}.hero-slide:first-child{opacity:1!important}}' +
    '@media(prefers-reduced-motion:reduce){.se-open.is-open i{animation:none}}';
  var style = el('style', { id: 'se-css' });
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  /* ---------- 1. Analytics, only with consent ---------- */
  var gaLoaded = false;
  function gaReady() { return /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX'; }
  function loadGA() {
    if (gaLoaded || !gaReady()) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = el('script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID) });
    document.head.appendChild(s);
  }
  function revokeGA() {
    // Stop any further measurement from this page and ask Google tag to deny storage.
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    if (gaReady()) window['ga-disable-' + GA_ID] = true;
  }

  /* ---------- 2. Cookie banner ---------- */
  var banner = null;
  function closeBanner() { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); banner = null; }
  function choose(val) {
    store(false, CONSENT_KEY, val);
    closeBanner();
    if (val === 'yes') { if (gaReady()) window['ga-disable-' + GA_ID] = false; loadGA(); } else revokeGA();
  }
  function showBanner() {
    if (banner || !gaReady()) return;
    banner = el('div', { class: 'se-banner', role: 'dialog', 'aria-live': 'polite', 'aria-label': 'Cookie preferences' });
    banner.innerHTML =
      '<p>' + bi(
        'We use a small number of cookies to remember your language and to count visits anonymously so we can improve the site. We never sell your data. See our <a href="privacy.html">Privacy Policy</a>.',
        'نستخدم عدداً قليلاً من ملفات تعريف الارتباط لتذكّر لغتك ولإحصاء الزيارات دون الكشف عن هويتك لتحسين الموقع. لا نبيع بياناتك أبداً. راجع <a href="privacy.html">سياسة الخصوصية</a>.') + '</p>' +
      '<div class="se-btns">' +
      '<button type="button" class="se-btn" data-v="no">' + bi('Decline', 'رفض') + '</button>' +
      '<button type="button" class="se-btn se-yes" data-v="yes">' + bi('Accept', 'موافق') + '</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.se-btn') : null;
      if (b) choose(b.getAttribute('data-v'));
    });
    document.body.appendChild(banner);
  }
  window.shanuCookieSettings = function () { closeBanner(); showBanner(); };

  /* ---------- 3. Open now / Closed (Dubai time) ---------- */
  // Monday to Thursday and Saturday 10:00-22:30, Friday 14:30-22:30, Sunday closed.
  function dubaiNow() {
    var parts;
    try {
      parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    } catch (e) { return null; }
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: map[o.weekday], min: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
  }
  function hoursFor(day) {
    if (day === 0) return null;
    if (day === 5) return [14 * 60 + 30, 22 * 60 + 30];
    return [10 * 60, 22 * 60 + 30];
  }
  function fmt(min, ar) {
    var h = Math.floor(min / 60), m = min % 60, sfx = h >= 12 ? (ar ? 'م' : 'PM') : (ar ? 'ص' : 'AM');
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + sfx;
  }
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  function openStatus() {
    var n = dubaiNow(); if (!n) return null;
    var h = hoursFor(n.day);
    if (h && n.min >= h[0] && n.min < h[1]) {
      return { open: true, en: 'Open now', ar: 'مفتوح الآن', subEn: 'until ' + fmt(h[1], false), subAr: 'حتى ' + fmt(h[1], true) };
    }
    if (h && n.min < h[0]) {
      return { open: false, en: 'Closed', ar: 'مغلق', subEn: 'opens today ' + fmt(h[0], false), subAr: 'يفتح اليوم ' + fmt(h[0], true) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7, hh = hoursFor(d);
      if (hh) {
        return i === 1
          ? { open: false, en: 'Closed', ar: 'مغلق', subEn: 'opens tomorrow ' + fmt(hh[0], false), subAr: 'يفتح غداً ' + fmt(hh[0], true) }
          : { open: false, en: 'Closed', ar: 'مغلق', subEn: 'opens ' + DAYS_EN[d] + ' ' + fmt(hh[0], false), subAr: 'يفتح ' + DAYS_AR[d] + ' ' + fmt(hh[0], true) };
      }
    }
    return null;
  }
  function paintOpen() {
    var s = openStatus();
    document.querySelectorAll('.se-open').forEach(function (c) {
      if (!s) { c.style.display = 'none'; return; }
      c.style.display = '';
      c.className = 'se-open ' + (s.open ? 'is-open' : 'is-closed');
      c.innerHTML = '<i aria-hidden="true"></i><span>' + bi(s.en, s.ar) + ' <small>' + bi(s.subEn, s.subAr) + '</small></span>';
      c.setAttribute('title', 'Dubai time. Hours may change on public holidays, please confirm on WhatsApp.');
    });
  }
  function placeOpenChips() {
    // Pages can place their own chip with class "se-open". Every page also gets one in the footer.
    var fc = document.querySelector('.footer-copy');
    if (fc && !document.querySelector('.se-foot')) {
      var wrap = el('div', { class: 'se-foot' });
      wrap.appendChild(el('div', { class: 'se-open', role: 'status' }));
      var cs = el('button', { type: 'button', class: 'se-link', id: 'seCookieLink' }, bi('Cookie settings', 'إعدادات ملفات الارتباط'));
      cs.addEventListener('click', function () { window.shanuCookieSettings(); });
      if (gaReady()) wrap.appendChild(cs);
      var ib = el('button', { type: 'button', class: 'se-link', id: 'seInstall', style: 'display:none' }, bi('Install app', 'تثبيت التطبيق'));
      wrap.appendChild(ib);
      fc.parentNode.insertBefore(wrap, fc);
    }
  }

  /* ---------- 4. Installable app ---------- */
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferredPrompt = e;
    var b = document.getElementById('seInstall'); if (b) b.style.display = '';
  });
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null; var b = document.getElementById('seInstall'); if (b) b.style.display = 'none';
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('#seInstall') : null;
    if (!b || !deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () { deferredPrompt = null; b.style.display = 'none'; });
  });
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    var ok = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!ok) return;
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  /* ---------- start ---------- */
  function addSkipLink() {
    var m = document.getElementById('main') || document.querySelector('main');
    if (!m || document.querySelector('.se-skip')) return;
    if (!m.id) m.id = 'main';
    m.setAttribute('tabindex', '-1');
    var a = el('a', { class: 'se-skip', href: '#main' }, bi('Skip to content', 'تخطَّ إلى المحتوى'));
    document.body.insertBefore(a, document.body.firstChild);
  }
  function init() {
    addSkipLink();
    placeOpenChips();
    paintOpen();
    setInterval(paintOpen, 60000);
    var c = store(true, CONSENT_KEY);
    if (c === 'yes') loadGA();
    else if (c !== 'no') showBanner();
    registerSW();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
