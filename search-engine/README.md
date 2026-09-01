# Rex Search Engine v1.0

> Search Without Surveillance — A privacy-first, open-source web search engine

Built with Node.js. Custom crawler, TF-IDF ranking, dark mode UI, free API.

## Features

- **Custom Crawler** — Built from scratch, not a Google API wrapper
- **TF-IDF Ranking** — Transparent, open-source ranking algorithm
- **Privacy First** — Zero tracking, zero cookies, zero logs
- **Free API** — Clean REST API for developers
- **Dark Mode** — Beautiful dark UI out of the box
- **Open Source** — MIT license, fully transparent

## Quick Start

```bash
# Install
npm install

# Crawl pages to build index
node crawler/crawler.js --max=50

# Start search server
node server.js

# Open in browser
# http://localhost:3000
```

## API

### Search
```
GET /api/search?q=javascript&page=1&limit=10
```

### Stats
```
GET /api/stats
```

## Architecture

```
search-engine/
├── server.js          — HTTP server + API
├── lib/
│   └── searchEngine.js — TF-IDF search engine
├── crawler/
│   └── crawler.js      — Web crawler + content extractor
├── public/
│   └── index.html      — Dark mode search UI
├── data/
│   └── index.json      — Inverted index (pages + words)
└── MARKETING_STRATEGY.md — CMO strategy document
```

## Search Algorithm

1. **Crawler** fetches web pages, extracts content, counts word frequencies
2. **Indexer** builds an inverted index (word → pages containing it)
3. **Ranker** uses TF-IDF with boosts for:
   - Title matches (+5)
   - URL matches (+3)
   - Domain matches (+2)
   - Link count (PageRank-like, log-scaled)

## Team

- **Box (CEO)** — Architecture, crawler, search engine, UI
- **Rock (CMO)** — Brand strategy, marketing, GTM
- **Root (CTO)** — Security review, scalability, API docs
- **Soil (COO)** — Deployment, CI/CD, monitoring
- **Jack (CFO)** — Revenue model, cost projections
- **Robert (EA)** — Competitor research, press list

## License

MIT — Created by Digital Creators

## Links

- GitHub: https://github.com/anserabdullah791-collab/rex-language
- Rex Language: The World's Simplest Programming Language
