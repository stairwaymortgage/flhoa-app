# flhoa-app — flhoaregistry.com

Statewide directory of Florida community associations, management firms, licensed managers (CAMs),
and developers. One authoritative site, built on official DBPR public records — ~109,000
individually-searchable pages designed to rank on the name people search, with a lending /
real-estate conversion layer on every record page.

Sister site to soflocondoverify.com (`scv-app`), same engine.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with locked official design tokens (navy `#003366`, gold `#C9A227`)
- **Fonts:** Merriweather (headings), Public Sans (body), IBM Plex Mono (record IDs)
- **Data:** Supabase in production. This scaffold ships a real-record seed sample
  (`src/data/seed.json`) so every template renders against authentic DBPR data.
- **Deploy:** Vercel + Cloudflare DNS

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                              Homepage + registry search
│   ├── associations/
│   │   ├── page.tsx                          Associations directory
│   │   └── [county]/
│   │       ├── [slug]/page.tsx               Association profile (flagship)
│   │       └── city/[city]/page.tsx          City hub (local-SEO depth)
│   ├── managers/
│   │   ├── firms/[slug]/page.tsx             Management firm profile
│   │   └── cam/[slug]/page.tsx               CAM licensee profile
│   ├── developers/[slug]/page.tsx            Developer portfolio profile
│   ├── counties/[slug]/page.tsx              County hub + full city directory
│   ├── verify/page.tsx                       Verify-a-license tool
│   └── api/search/route.ts                   Registry search endpoint
├── components/                               Header, footer, hook bar, sponsor slots, UI
├── lib/
│   ├── types.ts                              Entity types
│   ├── data.ts                               Data access layer (swap to Supabase in prod)
│   └── status.ts                             DBPR status decoders + explainers
└── data/seed.json                            Real-record seed sample
```

## Design & content rules (enforced)

- **Clean registry nav, conversion on record pages.** No sales language in navigation;
  the self-segmenting hook bar and labeled sponsor slots live on record pages only.
- **Facts with sources, never characterizations.** Status is shown as a registry fact with an
  as-of date. No financial-health claims. No reserves content. Financial Indicators data is
  never imported or published.
- **Compliance = filed/not-filed facts only.**
- **Every sponsor unit is labeled "Sponsored."** Banner creative here is placeholder;
  final creative is designed separately.
- **"Not affiliated with the State of Florida"** disclaimer stays in the header bar and footer.
- **Personal contacts** (board officers) stay gated pending policy decision.

## Production data pipeline

The full build ingests `FL_Community_Associations_Master_Directory.xlsx` (14 sheets) plus the
supporting HOA-contact and reference files into Supabase, generating association/firm/CAM/developer
pages, county hubs, and ~500–600 city hubs. See the build tracker for the task breakdown.

## Roadmap

Tracked in `flhoaregistry_Build_Tracker.xlsx` (57 tasks, 9 phases). This repo covers the
Phase 0 foundation and the Phase 2–5 page templates rendering against seed data. Next: wire the
Supabase data layer and run the full static generation.
