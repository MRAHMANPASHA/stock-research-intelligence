# Stock Research Intelligence

**By Rahman Pasha**

Turn any topic into a complete stock-content research brief — timing, audiences,
activities and regional notes — with ranked photo, vector and video opportunities,
each one pictured and ready with design, image and video prompts.

## What's inside

- **Research console** — enter a topic, pick 10 / 15 / 20 opportunities, get a full brief
- **Awareness Days** — 1,006 real worldwide observances built in, each with its own
  topic-matched picture and a one-click "Research this"
- **Opportunity detail** — 9 ready-to-paste prompts per opportunity (3 design, 3 image, 3 video)
- **Export** — Briefs CSV, Brief JSON, Opportunities CSV and Prompts CSV downloads
- **Sheet Data** — the research sheet, mirrored in the app

## Site structure

- `index.html` — the whole app (static)
- `assets/` — image library (world map, event and opportunity photos)
- `api/visit.js` — Vercel serverless function for the public unique-visitor
  counter (1 user = 1 count; Upstash Redis storage, deduped by IP hash)

Deployed on Vercel from this repository.
