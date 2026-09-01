/**
 * Rex Search Engine — Core Search Logic
 * Handles querying, ranking, and returning results
 */

const fs = require('fs');
const path = require('path');

let indexData = null;

function loadIndex() {
  if (indexData) return indexData;
  const indexPath = path.join(__dirname, '..', 'data', 'index.json');
  try {
    indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch {
    indexData = { pages: [], words: Object.create(null) };
  }
  return indexData;
}

function reloadIndex() {
  indexData = null;
  return loadIndex();
}

// TF-IDF scoring
function calculateScore(queryTerms, page, index) {
  let score = 0;
  const totalDocs = index.pages.length;
  
  for (const term of queryTerms) {
    const termLower = term.toLowerCase();
    
    // TF (Term Frequency)
    let tf = 0;
    if (page.words && page.words[termLower]) {
      tf = page.words[termLower];
    }
    
    // IDF (Inverse Document Frequency)
    let docCount = 0;
    if (index.words[termLower]) {
      docCount = index.words[termLower].length;
    }
    const idf = docCount > 0 ? Math.log(totalDocs / docCount) : 0;
    
    score += tf * idf;
    
    // Boost: title match
    if (page.title && page.title.toLowerCase().includes(termLower)) {
      score += 5;
    }
    
    // Boost: URL match
    if (page.url && page.url.toLowerCase().includes(termLower)) {
      score += 3;
    }
    
    // Boost: domain match
    if (page.domain && page.domain.toLowerCase().includes(termLower)) {
      score += 2;
    }
  }
  
  // PageRank-like boost: more links = more authority
  if (page.links && page.links > 0) {
    score += Math.log(page.links + 1) * 0.5;
  }
  
  return score;
}

function search(query, options = {}) {
  const startTime = Date.now();
  const { page = 1, limit = 10 } = options;
  
  const index = loadIndex();
  
  if (index.pages.length === 0) {
    return { total: 0, items: [], time: '0' };
  }
  
  // Parse query
  const queryTerms = query.trim().split(/\s+/).filter(t => t.length > 0);
  
  // Score all pages
  const scored = [];
  for (const pageData of index.pages) {
    const score = calculateScore(queryTerms, pageData, index);
    if (score > 0) {
      scored.push({ ...pageData, score });
    }
  }
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Paginate
  const start = (page - 1) * limit;
  const paginated = scored.slice(start, start + limit);
  
  // Clean results for output
  const items = paginated.map(p => ({
    title: p.title || 'Untitled',
    url: p.url,
    domain: p.domain || '',
    description: p.description || p.snippet || '',
    score: Math.round(p.score * 100) / 100
  }));
  
  const time = Date.now() - startTime;
  
  return { total: scored.length, items, time };
}

// Get suggestions based on indexed pages
function getSuggestions(prefix, limit = 5) {
  const index = loadIndex();
  const prefixLower = prefix.toLowerCase();
  const suggestions = new Set();
  
  for (const page of index.pages) {
    if (page.title) {
      const words = page.title.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.startsWith(prefixLower) && word.length > prefixLower.length) {
          suggestions.add(word);
        }
      }
    }
    if (suggestions.size >= limit * 2) break;
  }
  
  return [...suggestions].slice(0, limit);
}

module.exports = { search, reloadIndex, getSuggestions, loadIndex };
