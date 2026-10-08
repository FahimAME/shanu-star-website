/* Live DJG rate strip shared by all pages except the homepage.
   Reads /api/djg-rates (server-side fetch of dubaicityofgold.com). */
(function(){
  var K=['24','22','21','18'];
  function paint(rates){
    K.forEach(function(k){
      var el=document.getElementById('rate'+k+'k');
      if(el&&rates[k]!==undefined)el.innerHTML='AED '+Number(rates[k]).toFixed(2)+'<span class="rate-unit">/g</span>';
    });
  }
  function load(){
    fetch('/api/djg-rates').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){if(d&&d.rates)paint(d.rates)}).catch(function(){});
  }
  load();
  setInterval(function(){if(!document.hidden)load()},120000);
})();
