/**
 * Rex Search Engine v1.0
 * Main Server — handles search queries, serves UI
 * 
 * Created by: Director Abdullah Anser & Box (CEO)
 * Date: September 1, 2026
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { search } = require('./lib/searchEngine');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API: /api/search?q=query
  if (url.pathname === '/api/search') {
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!query.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query is required' }));
      return;
    }
    
    try {
      const results = search(query, { page, limit });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        query,
        total: results.total,
        page,
        limit,
        results: results.items,
        time: results.time + 'ms'
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // API: /api/stats
  if (url.pathname === '/api/stats') {
    const dataPath = path.join(__dirname, 'data', 'index.json');
    let stats = { pages: 0, size: '0 KB' };
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      stats.pages = data.pages.length;
      stats.size = (fs.statSync(dataPath).size / 1024).toFixed(1) + ' KB';
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }
  
  // Serve static files
  let filePath = url.pathname === '/' ? '/public/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  
  res.writeHead(404);
  res.end('404 — Not Found');
});

server.listen(PORT, () => {
  console.log(`\n  Rex Search Engine v1.0`);
  console.log(`  → http://localhost:${PORT}\n`);
});
