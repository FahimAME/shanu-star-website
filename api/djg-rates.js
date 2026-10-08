// /api/djg-rates.js
// Vercel Serverless Function — fetches today's suggested retail gold rates
// published by Dubai Jewellery Group on dubaicityofgold.com, and serves them
// to the Shanu Star website in a clean JSON shape.
//
// WHY THIS RUNS SERVER-SIDE, NOT IN THE BROWSER:
//   1. dubaicityofgold.com does not offer a public API, this reads their
//      published page directly. Browsers block that kind of cross-site
//      request (CORS), so it has to run here on the server.
//   2. It also means visitors never see a request to a third-party site in
//      their network tab, this function is the only thing that talks to
//      dubaicityofgold.com.
//
// IMPORTANT, PLEASE READ:
//   This page belongs to Dubai Jewellery Group, not Shanu Star. Their HTML
//   can change at any time without notice, and if it does, the regex below
//   will stop matching and this function will fall back to the last
//   successfully read price (see CACHE below) rather than show nothing.
//   If the site's homepage design changes significantly, this parser will
//   need a small update, tell Claude "the DJG price parser stopped working"
//   and paste what https://shanustarjewellery.ae/api/djg-rates shows, that's
//   enough to diagnose and fix it quickly.
//   Displaying their reference rate is common practice among Dubai jewellers
//   citing "today's DJG rate", but always attribute it clearly wherever it's
//   shown, the website already does this ("Reference: Dubai Jewellery Group").

let cache = { data: null, timestamp: 0 };
// Short cache so a price change on DJG's site reaches Shanu Star's site
// within a few minutes, "immediate" in practice, without hammering their
// server on every single visitor.
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');

  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    const pageRes = await fetch('https://www.dubaicityofgold.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShanuStarRateBot/1.0)' }
    });
    if (!pageRes.ok) throw new Error('Fetch failed: ' + pageRes.status);
    const html = await pageRes.text();

    // Strip tags to plain text so the match works regardless of exact
    // markup between the karat label and its price.
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');

    // Matches "24K Gold AED 514.25" style lines, as published on their
    // homepage's "Today's Suggested Retail Gold Jewellery Price" section.
    const matches = [...text.matchAll(/(\d{2})K\s*Gold\s*AED\s*([\d,]+\.?\d*)/gi)];

    const rates = {};
    matches.forEach(m => {
      const karat = m[1];
      const price = parseFloat(m[2].replace(/,/g, ''));
      if (['24', '22', '21', '18', '14'].includes(karat) && !isNaN(price)) {
        rates[karat] = price;
      }
    });

    const gotAllFive = ['24', '22', '21', '18', '14'].every(k => k in rates);
    if (!gotAllFive) {
      throw new Error('Could not find all 5 karat rates, DJG page structure may have changed.');
    }

    const data = {
      rates, // e.g. { "24": 514.25, "22": 476.25, "21": 456.75, "18": 391.50, "14": 305.25 }
      source: 'Dubai Jewellery Group (dubaicityofgold.com)',
      fetchedAt: new Date().toISOString(),
      stale: false
    };

    cache = { data, timestamp: now };
    return res.status(200).json(data);
  } catch (err) {
    // DJG's site is briefly down, or their page structure changed.
    // Serve the last good value rather than break the homepage.
    if (cache.data) {
      return res.status(200).json({ ...cache.data, stale: true });
    }
    return res.status(502).json({ error: 'Unable to fetch DJG retail rates right now.', detail: String(err.message || err) });
  }
};
