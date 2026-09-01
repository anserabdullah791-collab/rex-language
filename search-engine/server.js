const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ===== Rex Search Engine v3.0 — Meta Search Proxy =====
// Web + Images + Videos search proxy
// User searches HERE → Results fetched from DuckDuckGo/Bing → Displayed HERE
// Privacy: No tracking, No cookies, No logs

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function fetchPage(fetchUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(fetchUrl);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'DNT': '1',
        ...extraHeaders,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://${parsed.hostname}${res.headers.location}`;
        return fetchPage(newUrl, extraHeaders).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function decodeEntities(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&#0183;/g, '·').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (m, c) => String.fromCharCode(c)).trim();
}

// =====================
// WEB SEARCH
// =====================

async function searchDuckDuckGo(query, limit = 15) {
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await fetchPage(ddgUrl);
  const results = [];
  const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = resultPattern.exec(html)) !== null) {
    let resultUrl = match[1];
    if (resultUrl.includes('y.js') || resultUrl.includes('duckduckgo.com/y.')) continue;
    const uddgMatch = resultUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) resultUrl = decodeURIComponent(uddgMatch[1]);
    if (resultUrl.includes('duckduckgo.com') && !uddgMatch) continue;
    const title = decodeEntities(match[2].replace(/<[^>]+>/g, ''));
    const description = decodeEntities(match[3].replace(/<[^>]+>/g, ''));
    let domain = '';
    try { domain = new URL(resultUrl).hostname; } catch(e) {}
    if (title.length > 3) {
      results.push({ title: title.substring(0, 200), url: resultUrl, domain, description: description.substring(0, 350), score: results.length + 1, source: 'DuckDuckGo' });
    }
  }
  return results;
}

async function searchBing(query, limit = 15) {
  const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${limit}&setlang=en`;
  const html = await fetchPage(bingUrl);
  const results = [];
  const resultPattern = /<li[^>]+class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = resultPattern.exec(html)) !== null && results.length < limit) {
    const block = match[1];
    const linkMatch = block.match(/<h2[^>]*><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/i);
    if (!linkMatch) continue;
    let resultUrl = linkMatch[1].replace(/&amp;/g, '&');
    const title = decodeEntities(linkMatch[2].replace(/<[^>]+>/g, ''));
    const uMatch = resultUrl.match(/[?&]u=a1([A-Za-z0-9+/=]+)/);
    if (uMatch) {
      try {
        const b64 = uMatch[1] + '=='.substring(0, (4 - uMatch[1].length % 4) % 4);
        resultUrl = Buffer.from(b64, 'base64').toString('utf8');
      } catch(e) {
        const directU = resultUrl.match(/[?&]u=([^&]+)/);
        if (directU) resultUrl = decodeURIComponent(directU[1]);
      }
    }
    if (resultUrl.includes('bing.com') && !uMatch) continue;
    let description = '';
    const descMatch = block.match(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    if (descMatch) description = decodeEntities(descMatch[1].replace(/<[^>]+>/g, ''));
    if (!description) {
      const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (pMatch) description = decodeEntities(pMatch[1].replace(/<[^>]+>/g, ''));
    }
    let domain = '';
    try { domain = new URL(resultUrl).hostname; } catch(e) {}
    if (title.length > 3) {
      results.push({ title: title.substring(0, 200), url: resultUrl, domain, description: description.substring(0, 350), score: results.length + 1, source: 'Bing' });
    }
  }
  return results;
}

async function searchWeb(query, options = {}) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const startTime = Date.now();
  const allResults = [];
  const errors = [];
  const engineStats = {};
  const promises = [];
  promises.push(searchDuckDuckGo(query, 15).then(r => { engineStats.duckduckgo = r.length; allResults.push(...r); }).catch(e => { errors.push({engine:'duckduckgo',error:e.message}); engineStats.duckduckgo=0; }));
  promises.push(searchBing(query, 15).then(r => { engineStats.bing = r.length; allResults.push(...r); }).catch(e => { errors.push({engine:'bing',error:e.message}); engineStats.bing=0; }));
  await Promise.all(promises);
  const seen = new Set();
  const unique = [];
  for (const r of allResults) { if (!seen.has(r.url)) { seen.add(r.url); unique.push(r); } }
  const byEngine = { DuckDuckGo: [], Bing: [] };
  for (const r of unique) { if (!byEngine[r.source]) byEngine[r.source] = []; byEngine[r.source].push(r); }
  const merged = [];
  const maxLen = Math.max((byEngine['DuckDuckGo']||[]).length, (byEngine['Bing']||[]).length);
  for (let i = 0; i < maxLen; i++) {
    if (byEngine['DuckDuckGo'] && byEngine['DuckDuckGo'][i]) merged.push(byEngine['DuckDuckGo'][i]);
    if (byEngine['Bing'] && byEngine['Bing'][i]) merged.push(byEngine['Bing'][i]);
  }
  merged.forEach((r, i) => { r.score = merged.length - i; });
  return { query, total: merged.length, page, limit, results: merged.slice((page-1)*limit, page*limit), time: (Date.now()-startTime)+'ms', engineStats, errors };
}

// =====================
// IMAGE SEARCH
// =====================

async function searchImagesDuckDuckGo(query, limit = 20) {
  // DuckDuckGo image search via their JSON API
  const ddgUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&p=1&s=0&v=1`;
  let html;
  try {
    html = await fetchPage(ddgUrl);
    // DDG image API returns JSON-like data
    const data = JSON.parse(html);
    return (data.results || []).slice(0, limit).map((r, i) => ({
      title: (r.title || 'Image').substring(0, 200),
      imageUrl: r.image || r.thumbnail || '',
      thumbnail: r.thumbnail || r.image || '',
      sourceUrl: r.url || r.redirect || '',
      domain: '',
      width: r.width || 0,
      height: r.height || 0,
      source: 'DuckDuckGo'
    }));
  } catch(e) {
    // Fallback: parse from HTML version
  }
  // Try HTML version
  const htmlUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  html = await fetchPage(htmlUrl);
  const results = [];
  // Parse image results from DDG HTML
  const imgPattern = /<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = imgPattern.exec(html)) !== null && results.length < limit) {
    const imgSrc = match[1];
    const alt = decodeEntities(match[2]);
    if (imgSrc.includes('duckduckgo.com') || imgSrc.includes('data:') || imgSrc.includes('icon')) continue;
    if (!imgSrc.startsWith('http')) continue;
    results.push({
      title: alt || 'Image result',
      imageUrl: imgSrc,
      thumbnail: imgSrc,
      sourceUrl: '',
      domain: '',
      source: 'DuckDuckGo'
    });
  }
  return results;
}

async function searchImagesBing(query, limit = 20) {
  const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=${limit}`;
  const html = await fetchPage(bingUrl);
  const results = [];
  
  // Bing image results have m= attribute with JSON containing image data
  const imgPattern = /<a[^>]+class="iusc"[^>]+m="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = imgPattern.exec(html)) !== null && results.length < limit) {
    try {
      const mJson = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      results.push({
        title: (mJson.t || 'Image').substring(0, 200),
        imageUrl: mJson.murl || mJson.imgurl || '',
        thumbnail: mJson.turl || mJson.murl || '',
        sourceUrl: mJson.purl || '',
        domain: mJson.purl ? (() => { try { return new URL(mJson.purl).hostname; } catch(e) { return ''; } })() : '',
        width: mJson.iw || 0,
        height: mJson.ih || 0,
        source: 'Bing'
      });
    } catch(e) {
      // Skip unparseable entries
    }
  }
  return results;
}

async function searchImages(query, options = {}) {
  const limit = options.limit || 20;
  const startTime = Date.now();
  const allResults = [];
  const errors = [];
  const engineStats = {};
  const promises = [];
  
  promises.push(
    searchImagesBing(query, limit)
      .then(r => { engineStats.bing = r.length; allResults.push(...r); })
      .catch(e => { errors.push({engine:'bing',error:e.message}); engineStats.bing=0; })
  );
  promises.push(
    searchImagesDuckDuckGo(query, limit)
      .then(r => { engineStats.duckduckgo = r.length; allResults.push(...r); })
      .catch(e => { errors.push({engine:'duckduckgo',error:e.message}); engineStats.duckduckgo=0; })
  );
  
  await Promise.all(promises);
  
  // Deduplicate by imageUrl
  const seen = new Set();
  const unique = [];
  for (const r of allResults) {
    if (r.imageUrl && !seen.has(r.imageUrl)) {
      seen.add(r.imageUrl);
      unique.push(r);
    }
  }
  
  return {
    query,
    total: unique.length,
    limit,
    results: unique.slice(0, limit),
    time: (Date.now() - startTime) + 'ms',
    engineStats,
    errors
  };
}

// =====================
// VIDEO SEARCH
// =====================

async function searchVideosBing(query, limit = 15) {
  const bingUrl = `https://www.bing.com/videos/search?q=${encodeURIComponent(query)}&first=1&count=${limit}`;
  const html = await fetchPage(bingUrl);
  const results = [];
  
  // Bing video results
  const videoPattern = /<div[^>]+class="mc_vtvc"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  let match;
  while ((match = videoPattern.exec(html)) !== null && results.length < limit) {
    const block = match[1];
    
    // Extract thumbnail
    const thumbMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : '';
    
    // Extract title
    const titleMatch = block.match(/<a[^>]+title="([^"]+)"/i) || block.match(/<div[^>]+class="b_promtxt"[^>]*>([\s\S]*?)<\/div>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1] ? titleMatch[1] : titleMatch[2].replace(/<[^>]+>/g, '')) : 'Video';
    
    // Extract link
    const linkMatch = block.match(/<a[^>]+href="([^"]+)"/i);
    let videoUrl = linkMatch ? linkMatch[1].replace(/&amp;/g, '&') : '';
    const uMatch = videoUrl.match(/[?&]u=a1([A-Za-z0-9+/=]+)/);
    if (uMatch) {
      try {
        const b64 = uMatch[1] + '=='.substring(0, (4 - uMatch[1].length % 4) % 4);
        videoUrl = Buffer.from(b64, 'base64').toString('utf8');
      } catch(e) {}
    }
    
    // Duration
    const durMatch = block.match(/<div[^>]+class="mc_bc_p"[^>]*>([\s\S]*?)<\/div>/i) || block.match(/(\d+:\d+)/);
    const duration = durMatch ? (durMatch[1] ? durMatch[1].replace(/<[^>]+>/g, '').trim() : durMatch[0]) : '';
    
    if (title.length > 3) {
      let domain = '';
      try { domain = new URL(videoUrl).hostname; } catch(e) {}
      results.push({
        title: title.substring(0, 200),
        url: videoUrl,
        thumbnail: thumbnail,
        duration: duration,
        domain: domain,
        source: 'Bing'
      });
    }
  }
  
  // Fallback: simpler pattern
  if (results.length === 0) {
    const simplePattern = /<img[^>]+src="(https?:\/\/[^"]+(?:thumb|video)[^"]*)"[^>]*>/gi;
    while ((match = simplePattern.exec(html)) !== null && results.length < limit) {
      results.push({
        title: 'Video Result',
        url: '',
        thumbnail: match[1],
        duration: '',
        domain: '',
        source: 'Bing'
      });
    }
  }
  
  return results;
}

async function searchVideosDuckDuckGo(query, limit = 15) {
  // DDG video search
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}+site:youtube.com+OR+site:vimeo.com`;
  const html = await fetchPage(ddgUrl);
  const results = [];
  
  const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = resultPattern.exec(html)) !== null && results.length < limit) {
    let resultUrl = match[1];
    if (resultUrl.includes('y.js') || resultUrl.includes('duckduckgo.com/y.')) continue;
    const uddgMatch = resultUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) resultUrl = decodeURIComponent(uddgMatch[1]);
    
    // Only include video sites
    if (!resultUrl.includes('youtube.com') && !resultUrl.includes('vimeo.com') && !resultUrl.includes('dailymotion.com')) continue;
    
    const title = decodeEntities(match[2].replace(/<[^>]+>/g, ''));
    const description = decodeEntities(match[3].replace(/<[^>]+>/g, ''));
    
    // Extract YouTube video ID for thumbnail
    let thumbnail = '';
    let duration = '';
    const ytMatch = resultUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    
    let domain = '';
    try { domain = new URL(resultUrl).hostname; } catch(e) {}
    
    if (title.length > 3) {
      results.push({
        title: title.substring(0, 200),
        url: resultUrl,
        thumbnail: thumbnail,
        duration: duration,
        domain: domain,
        source: 'DuckDuckGo'
      });
    }
  }
  return results;
}

async function searchVideos(query, options = {}) {
  const limit = options.limit || 15;
  const startTime = Date.now();
  const allResults = [];
  const errors = [];
  const engineStats = {};
  const promises = [];
  
  promises.push(
    searchVideosBing(query, limit)
      .then(r => { engineStats.bing = r.length; allResults.push(...r); })
      .catch(e => { errors.push({engine:'bing',error:e.message}); engineStats.bing=0; })
  );
  promises.push(
    searchVideosDuckDuckGo(query, limit)
      .then(r => { engineStats.duckduckgo = r.length; allResults.push(...r); })
      .catch(e => { errors.push({engine:'duckduckgo',error:e.message}); engineStats.duckduckgo=0; })
  );
  
  await Promise.all(promises);
  
  // Deduplicate by URL
  const seen = new Set();
  const unique = [];
  for (const r of allResults) {
    if (r.url && !seen.has(r.url)) {
      seen.add(r.url);
      unique.push(r);
    } else if (!r.url && r.thumbnail && !seen.has(r.thumbnail)) {
      seen.add(r.thumbnail);
      unique.push(r);
    }
  }
  
  return {
    query,
    total: unique.length,
    limit,
    results: unique.slice(0, limit),
    time: (Date.now() - startTime) + 'ms',
    engineStats,
    errors
  };
}

// =====================
// HTTP SERVER
// =====================

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  
  // API: Web Search
  if (parsed.pathname === '/api/search') {
    const q = parsed.query.q || '';
    const page = parseInt(parsed.query.page) || 1;
    const limit = parseInt(parsed.query.limit) || 10;
    if (!q) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Query parameter "q" required'})); return; }
    try {
      const results = await searchWeb(q, {page, limit});
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(results, null, 2));
    } catch(err) { res.writeHead(500, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:err.message})); }
    return;
  }
  
  // API: Image Search
  if (parsed.pathname === '/api/images') {
    const q = parsed.query.q || '';
    const limit = parseInt(parsed.query.limit) || 20;
    if (!q) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Query parameter "q" required'})); return; }
    try {
      const results = await searchImages(q, {limit});
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(results, null, 2));
    } catch(err) { res.writeHead(500, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:err.message})); }
    return;
  }
  
  // API: Video Search
  if (parsed.pathname === '/api/videos') {
    const q = parsed.query.q || '';
    const limit = parseInt(parsed.query.limit) || 15;
    if (!q) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:'Query parameter "q" required'})); return; }
    try {
      const results = await searchVideos(q, {limit});
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(results, null, 2));
    } catch(err) { res.writeHead(500, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:err.message})); }
    return;
  }
  
  // API: Stats
  if (parsed.pathname === '/api/stats') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({
      engine: 'Rex Search Engine v3.0',
      type: 'Meta Search Proxy',
      features: ['Web Search', 'Image Search', 'Video Search', 'Sign-in Ready'],
      engines: ['DuckDuckGo', 'Bing'],
      privacy: 'No tracking, No cookies, No logs',
      tagline: 'Search Without Surveillance',
      version: '3.0.0'
    }));
    return;
  }
  
  // Serve UI
  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    const uiPath = path.join(__dirname, 'public', 'index.html');
    try {
      const html = fs.readFileSync(uiPath, 'utf8');
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(html);
    } catch(e) {
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end('<h1>Rex Search Engine v3.0</h1><p>API: /api/search?q= | /api/images?q= | /api/videos?q=</p>');
    }
    return;
  }
  
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Rex Search Engine v3.0 running on http://localhost:${PORT}`);
  console.log(`Web + Images + Videos — Meta Search Proxy`);
  console.log(`Search Without Surveillance`);
});

module.exports = { searchWeb, searchImages, searchVideos };
