/**
 * Rex Search Engine — Web Crawler
 * Crawls web pages, extracts content, and saves to data store
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DATA_PATH = path.join(__dirname, '..', 'data', 'index.json');
const QUEUE_PATH = path.join(__dirname, '..', 'data', 'queue.json');

// Load or initialize data
function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); }
  catch { return { pages: [], words: Object.create(null) }; }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8')); }
  catch { return []; }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// Fetch a URL and return HTML
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: { 'User-Agent': 'RexSearchBot/1.0 (+https://github.com/anserabdullah791-collab/rex-language)' },
      timeout: 10000
    };
    
    protocol.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        const newUrl = new URL(res.headers.location, url).href;
        fetchUrl(newUrl).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

// Extract text content from HTML
function extractContent(html) {
  // Remove scripts and styles
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]+description[^>]+content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Extract meta keywords
  const kwMatch = html.match(/<meta[^>]+keywords[^>]+content=["']([^"']+)["']/i);
  const keywords = kwMatch ? kwMatch[1].trim() : '';
  
  // Extract headings
  const headings = [];
  const hMatches = html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi);
  for (const m of hMatches) headings.push(m[1].trim());
  
  // Extract links
  const links = [];
  const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi);
  for (const m of linkMatches) {
    if (m[1] && !m[1].startsWith('#') && !m[1].startsWith('mailto:') && !m[1].startsWith('javascript:')) {
      links.push({ url: m[1], text: m[2].trim() });
    }
  }
  
  // Extract plain text
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract first 200 chars as snippet
  const snippet = text.slice(0, 200);
  
  // Count word frequencies
  const words = {};
  const wordList = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  for (const word of wordList) {
    words[word] = (words[word] || 0) + 1;
  }
  
  return { title, description, keywords, headings, links, text, snippet, words };
}

// Crawl a single page
async function crawlPage(url, depth = 0) {
  try {
    console.log(`  Crawling: ${url}`);
    const html = await fetchUrl(url);
    const content = extractContent(html);
    const urlObj = new URL(url);
    
    const page = {
      url: url,
      domain: urlObj.hostname,
      title: content.title,
      description: content.description,
      snippet: content.snippet,
      keywords: content.keywords,
      headings: content.headings,
      words: content.words,
      links: content.links.length,
      crawled: new Date().toISOString()
    };
    
    return { page, links: content.links, baseUrl: urlObj };
  } catch (e) {
    console.log(`  Error: ${url} — ${e.message}`);
    return null;
  }
}

// Main crawl function
async function crawl(seedUrls, maxPages = 100, maxDepth = 2) {
  const data = loadData();
  const visited = new Set(data.pages.map(p => p.url));
  const queue = seedUrls.map(url => ({ url, depth: 0 }));
  let count = 0;
  
  console.log(`\n  Rex Search Crawler v1.0`);
  console.log(`  Max pages: ${maxPages}, Max depth: ${maxDepth}\n`);
  
  while (queue.length > 0 && count < maxPages) {
    const { url, depth } = queue.shift();
    
    if (visited.has(url)) continue;
    visited.add(url);
    
    const result = await crawlPage(url, depth);
    if (!result) continue;
    
    // Add page to index
    data.pages.push(result.page);
    count++;
    
    // Update word index
    for (const word of Object.keys(result.page.words)) {
      if (!Object.prototype.hasOwnProperty.call(data.words, word)) data.words[word] = [];
      data.words[word].push(result.page.url);
    }
    
    // Save every 10 pages
    if (count % 10 === 0) {
      saveData(data);
      console.log(`  Saved ${count} pages...`);
    }
    
    // Add linked pages to queue
    if (depth < maxDepth) {
      for (const link of result.links.slice(0, 10)) {
        let fullUrl = link.url;
        if (fullUrl.startsWith('/')) {
          fullUrl = result.baseUrl.origin + fullUrl;
        } else if (!fullUrl.startsWith('http')) {
          continue;
        }
        if (!visited.has(fullUrl)) {
          queue.push({ url: fullUrl, depth: depth + 1 });
        }
      }
    }
    
    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500));
  }
  
  saveData(data);
  console.log(`\n  Crawled ${count} pages. Index saved.\n`);
  return count;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const seedUrls = args.filter(a => a.startsWith('http'));
  const maxPages = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '50');
  
  if (seedUrls.length === 0) {
    // Default seed URLs — tech and programming sites
    const defaultSeeds = [
      'https://en.wikipedia.org/wiki/Web_search_engine',
      'https://en.wikipedia.org/wiki/Search_engine_optimization',
      'https://en.wikipedia.org/wiki/Node.js',
      'https://en.wikipedia.org/wiki/JavaScript',
      'https://en.wikipedia.org/wiki/Programming_language',
      'https://en.wikipedia.org/wiki/Artificial_intelligence',
      'https://en.wikipedia.org/wiki/Machine_learning',
      'https://en.wikipedia.org/wiki/Web_development',
      'https://en.wikipedia.org/wiki/Software_engineering',
      'https://en.wikipedia.org/wiki/Computer_science',
      'https://en.wikipedia.org/wiki/Data_science',
      'https://en.wikipedia.org/wiki/Cybersecurity',
      'https://en.wikipedia.org/wiki/Cloud_computing',
      'https://en.wikipedia.org/wiki/Database',
      'https://en.wikipedia.org/wiki/API',
      'https://en.wikipedia.org/wiki/HTML',
      'https://en.wikipedia.org/wiki/CSS',
      'https://en.wikipedia.org/wiki/Python_(programming_language)',
      'https://en.wikipedia.org/wiki/Google',
      'https://en.wikipedia.org/wiki/Search_engine',
    ];
    crawl(defaultSeeds, maxPages, 1);
  } else {
    crawl(seedUrls, maxPages, 1);
  }
}

module.exports = { crawl, crawlPage, fetchUrl, extractContent };
