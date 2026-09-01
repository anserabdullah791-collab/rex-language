# Rex Search Engine v3.0

> *Search Without Surveillance* — Privacy-first meta-search proxy with Web, Images, and Videos search. No tracking, no cookies, no logs.

Created by **Abdullah Anser** (Director) and **Box** (AI CEO) at **Digital Creators**.

---

## What Is Rex Search v3.0?

Rex Search v3.0 is a **meta-search proxy engine** with three search types: **Web**, **Images**, and **Videos**. User searches on Rex, results fetched from DuckDuckGo + Bing, displayed on Rex UI. Google sign-in available.

### How It Works

```
User searches on Rex (Web / Images / Videos tabs)
        ↓
Rex Server forwards query to DuckDuckGo + Bing (parallel)
        ↓
Search engines return results to Rex Server (not to user)
        ↓
Rex Server merges, deduplicates, and displays results
        ↓
User sees results on Rex — search engines never see the user
```

---

## Features

1. **Web Search** — Web page results from DuckDuckGo + Bing, merged and ranked
2. **Image Search** — Image results from Bing, displayed in grid layout
3. **Video Search** — Video results from DuckDuckGo (YouTube/Vimeo), with thumbnails
4. **Google Sign-in** — User authentication with Google account
5. **Tabbed Interface** — Switch between Web, Images, Videos seamlessly
6. **Privacy Proxy** — Search engines see our server IP, not user's IP
7. **No Tracking** — No cookies, no logs, no user data collection
8. **Dark UI** — Glassmorphism design with gradient accents
9. **REST API** — JSON APIs for web, images, and video search
10. **Zero Dependencies** — Pure Node.js, no npm packages needed

---

## Installation

```bash
git clone https://github.com/anserabdullah791-collab/rex-search.git
cd rex-search
node server.js
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

### Web Search
```bash
curl "http://localhost:3000/api/search?q=javascript&limit=10"
```

```json
{
  "query": "javascript",
  "total": 17,
  "results": [
    {
      "title": "JavaScript Tutorial - W3Schools",
      "url": "https://www.w3schools.com/js/",
      "domain": "www.w3schools.com",
      "description": "Learn JavaScript...",
      "score": 17,
      "source": "DuckDuckGo"
    }
  ],
  "time": "742ms",
  "engineStats": { "duckduckgo": 10, "bing": 7 }
}
```

### Image Search
```bash
curl "http://localhost:3000/api/images?q=mountains&limit=20"
```

```json
{
  "query": "mountains",
  "total": 20,
  "results": [
    {
      "title": "Alpine Mountains Photo",
      "imageUrl": "https://images.pexels.com/photos/533667/...",
      "thumbnail": "https://images.pexels.com/photos/533667/...",
      "sourceUrl": "https://pexels.com/...",
      "domain": "pexels.com",
      "width": 1920,
      "height": 1080,
      "source": "Bing"
    }
  ],
  "time": "242ms"
}
```

### Video Search
```bash
curl "http://localhost:3000/api/videos?q=python+tutorial&limit=15"
```

```json
{
  "query": "python tutorial",
  "total": 10,
  "results": [
    {
      "title": "Learn Python - Full Course for Beginners",
      "url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
      "thumbnail": "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg",
      "duration": "",
      "domain": "youtube.com",
      "source": "DuckDuckGo"
    }
  ],
  "time": "512ms"
}
```

### Stats
```bash
curl "http://localhost:3000/api/stats"
```

---

## API Summary

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=query&page=1&limit=10` | Web search |
| `GET /api/images?q=query&limit=20` | Image search |
| `GET /api/videos?q=query&limit=15` | Video search |
| `GET /api/stats` | Engine info |

---

## UI Features

| Feature | Description |
|---------|-------------|
| Home page | Logo, search bar, privacy badges, tab selector |
| Results page | Tabbed results (Web/Images/Videos), pagination |
| Image grid | Responsive grid with thumbnails |
| Video grid | Cards with thumbnails, play icon, duration |
| Sign-in button | Google sign-in (top right) |
| Sign-in modal | Google OAuth button |
| User avatar | Shows after sign-in, click to sign out |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v3.0 | Sep 1, 2026 | Added Image search, Video search, Google sign-in, tabbed UI |
| v2.0 | Sep 1, 2026 | Meta-search proxy (DuckDuckGo + Bing), privacy model |
| v1.0 | Sep 1, 2026 | Custom crawler, TF-IDF ranking, dark UI |

---

## Architecture

```
rex-search/
├── server.js            # Meta-search server (web + images + videos APIs)
├── public/
│   └── index.html        # Dark UI with tabs, sign-in, results grid
├── crawler/
│   └── crawler.js        # Legacy crawler (v1.0)
├── lib/
│   └── searchEngine.js   # Legacy TF-IDF engine (v1.0)
├── README.md
├── LICENSE
└── package.json
```

---

## Privacy Model

- Search engines see **our server's IP**, not the user's IP
- We strip all tracking cookies, parameters, and identifiers
- We keep **zero logs** of search queries
- No user accounts required (sign-in optional)
- The user never directly contacts Google, Bing, or DuckDuckGo

---

## Tech Stack

- Node.js (zero external dependencies)
- Vanilla JavaScript
- HTML/CSS (no frameworks)
- HTTPS request scraping

---

## License

MIT — Free to use, modify, and distribute.

---

## Links

- GitHub: https://github.com/anserabdullah791-collab/rex-search
- Rex Language: https://github.com/anserabdullah791-collab/rex-language
- Digital Creators

---

## About

**Rex Search Engine** is part of the Rex ecosystem by Digital Creators. Built by Abdullah Anser (Director) and Box (AI CEO). v3.0 adds image search, video search, and Google sign-in to the privacy-first meta-search proxy.

*Search Without Surveillance.*
