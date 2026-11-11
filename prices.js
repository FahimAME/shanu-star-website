/* Live bar prices on product cards (products page and home page).
   Price = ((DJG 24K rate per gram - AED 4) x grams + packaging) x 1.03 (card payment), rounded to whole AED.
   Reads /api/djg-rates (same source as the rate strip). If the rate is unavailable, cards keep "Enquire Now".
   To change a packaging charge, edit PACK below. */
(function(){
  var DISCOUNT = 4, CARD = 1.03, OZ = 31.1035, WA = '971544339619';
  var PACK = { // key: [grams, packaging AED]
    pamp_1g:[1,90], pamp_2_5g:[2.5,110], pamp_5g:[5,125], pamp_10g:[10,130], pamp_20g:[20,140],
    pamp_50g:[50,160], pamp_100g:[100,180], pamp_1oz:[OZ,170], pamp_1oz_new:[OZ,100],
    val_1g:[1,80], val_2_5g:[2.5,95], val_5g:[5,115], val_10g:[10,125], val_20g:[20,120],
    val_50g:[50,140], val_100g:[100,150], val_1oz:[OZ,160],
    auriz_5g:[5,60], auriz_10g:[10,70], auriz_1oz:[OZ,85]
  };
  // Always in stock (owner, 11 Nov 2026): every PAMP and Valcambi size listed above
  function inStock(k){ return /^(pamp|val)_/.test(k); }
  var css = '.pp{margin:0 0 14px;text-align:center}' +
    '.pp-amt{font-family:"Cormorant Garamond",Georgia,serif;font-size:28px;font-weight:600;color:#f5e0a0;line-height:1.1;font-variant-numeric:tabular-nums}' +
    '.pp-amt small{font-family:"Josefin Sans",sans-serif;font-size:11px;letter-spacing:1.5px;color:#c9a84c;margin-right:6px;font-weight:600}' +
    '.pp-note{display:flex;justify-content:center;align-items:center;font-size:10.5px;letter-spacing:.5px;color:rgba(240,234,216,.6);margin-top:3px}' +
    '.pp-live{display:inline-block;width:6px;height:6px;border-radius:50%;background:#3ddc84;margin:0 6px 0 0;flex:none;box-shadow:0 0 6px #3ddc84;vertical-align:middle}' +
    '.pp-bank{display:block;margin-top:10px;font-size:11px;letter-spacing:.8px;color:#c9a84c;text-decoration:underline;text-underline-offset:3px;text-align:center}' +
    '.pp-bank:hover{color:#f5e0a0}' +
    '.feat-card .pp{margin:-4px 0 16px}' +
    '.pp-stock{display:inline-block;margin-bottom:6px;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#3ddc84;border:1px solid rgba(61,220,132,.45);border-radius:20px;padding:3px 10px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function fmt(n){ return Number(n).toLocaleString('en-US'); }
  function price(r, k){ var p = PACK[k]; return Math.round(((r - DISCOUNT) * p[0] + p[1]) * CARD); }
  function sp(en, ar){ return '<span class="en">'+en+'</span><span class="ar">'+ar+'</span>'; }
  function wa(text){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function time(){ var d = new Date(); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }

  function paint(r, all){
    var t = time();
    // Home: bars strip
    document.querySelectorAll('.hp-card[data-key]').forEach(function(card){
      var k = card.getAttribute('data-key'); if (!PACK[k]) return;
      var aed = price(r, k), name = card.getAttribute('data-name'), w = card.getAttribute('data-weight');
      card.querySelector('.pp').innerHTML = (inStock(k) ? '<span class="pp-stock">' + sp('In stock','متوفر') + '</span>' : '') + '<div class="pp-amt"><small>AED</small>' + fmt(aed) + '</div><div class="pp-note"><i class="pp-live"></i>' + sp('Live price · ' + t, 'سعر مباشر · ' + t) + '</div>';
      var b = card.querySelector('.hp-btn'); if (b) b.href = wa('Hello Shanu Star, I would like to order the ' + name + ' (' + w + '). Price shown: AED ' + fmt(aed) + ' at ' + t + '.');
    });
    // Home: coin offer poster (DJG 22K / 21K minus AED 4 per gram)
    [['22','cs22'],['21','cs21']].forEach(function(x){
      var v = all && Number(all[x[0]]), el = document.getElementById(x[1]), d = document.getElementById(x[1] + 'd');
      if (el && v > 100) { el.textContent = 'AED ' + (v - DISCOUNT).toFixed(2); if (d) d.innerHTML = sp('DJG rate AED ' + v.toFixed(2), 'سعر مجموعة دبي ' + v.toFixed(2) + ' درهم'); }
    });
    // Products page cards
    document.querySelectorAll('.prod-card[data-key]').forEach(function(card){
      var k = card.getAttribute('data-key'); if (!PACK[k]) return;
      var aed = price(r, k);
      var name = (card.querySelector('.prod-name .en') || {}).textContent || k;
      var weight = (card.querySelector('.ps-value') || {}).textContent || '';
      var box = card.querySelector('.pp');
      if (!box) {
        box = document.createElement('div'); box.className = 'pp';
        var btn = card.querySelector('.prod-enquire');
        if (!btn) return;
        btn.parentNode.insertBefore(box, btn);
        btn.removeAttribute('onclick');
        btn.innerHTML = sp('CHECK AVAILABILITY','تحقق من التوفر') + '<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14"><path d="M5 12 H19 M13 6 L19 12 L13 18"></path></svg>';
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          var a = card.getAttribute('data-aed');
          window.open(wa('Hello Shanu Star, is this bar available? ' + name + ' (' + weight + '). Price shown: AED ' + fmt(a) + ' at ' + time() + '.'), '_blank', 'noopener');
        });
        var bank = document.createElement('a'); bank.className = 'pp-bank'; bank.target = '_blank'; bank.rel = 'noopener';
        bank.innerHTML = sp('Paying by bank transfer? Enquire now','الدفع بالتحويل البنكي؟ استفسر الآن');
        bank.addEventListener('click', function(e){ e.stopPropagation(); bank.href = wa('Hello Shanu Star, I would like to buy the ' + name + ' (' + weight + ') and pay by bank transfer. Please share the price and details.'); });
        btn.parentNode.insertBefore(bank, btn.nextSibling);
      }
      card.setAttribute('data-aed', aed);
      box.innerHTML = (inStock(k) ? '<span class="pp-stock">' + sp('In stock','متوفر') + '</span>' : '') + '<div class="pp-amt"><small>AED</small>' + fmt(aed) + '</div><div class="pp-note"><i class="pp-live"></i>' + sp('Live price, card payment · ' + t, 'سعر مباشر، الدفع بالبطاقة · ' + t) + '</div>';
    });
    // Home page featured cards (links to products.html?key=...)
    document.querySelectorAll('a.feat-card[href*="key="]').forEach(function(card){
      var k = (card.getAttribute('href').split('key=')[1] || '').split('&')[0]; if (!PACK[k]) return;
      var box = card.querySelector('.pp');
      if (!box) { var cta = card.querySelector('.feat-cta'); if (!cta) return; box = document.createElement('div'); box.className = 'pp'; cta.parentNode.insertBefore(box, cta); }
      box.innerHTML = '<div class="pp-amt"><small>AED</small>' + fmt(price(r, k)) + '</div><div class="pp-note"><i class="pp-live"></i>' + sp('Live price · ' + t, 'سعر مباشر · ' + t) + '</div>';
    });
  }
  function load(){
    fetch('/api/djg-rates').then(function(x){ if (!x.ok) throw 0; return x.json(); })
      .then(function(d){ var r = d && d.rates && Number(d.rates['24']); if (r > 100) paint(r, d.rates); })
      .catch(function(){});
  }
  load();
  setInterval(function(){ if (!document.hidden) load(); }, 300000);
})();
