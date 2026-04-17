# Book Atlas

A TypeScript + React application that surfaces curated book discovery content from The New York Times, enriched with Open Library metadata, and optionally expanded with Google Books search.

Book Atlas combines editorial signals (NYT reviews and best seller lists) with broader catalog data so users can quickly explore trending titles, read context, and jump to preview or purchase links.

## Highlights

- Trending book discovery from NYT best seller overview data.
- Metadata enrichment via Open Library (publisher, year, page count, subjects, and cover fallback).
- Search-first UX with NYT review results as the trusted baseline.
- Optional Google Books search provider behind a feature flag.
- Deduplication of search results by ISBN (NYT entries are preferred when duplicates exist).
- Responsive card grid UI and a modal details view with external links.
- React 19 + Vite 7 + TypeScript 5 + Tailwind CSS 4.

## How It Works

1. On initial load, the app fetches NYT overview list data.
2. Results are normalized into the internal `Book` model.
3. Each book is enriched with Open Library metadata when an ISBN is available.
4. The default landing experience displays trending books.
5. Search always runs against NYT reviews first.
6. If enabled, Google Books search runs next and merges with NYT results.
7. Duplicate ISBN matches from Google are removed to preserve NYT-first curation.

## Tech Stack

- Runtime/UI: React, React DOM
- Language: TypeScript
- Build Tooling: Vite, @vitejs/plugin-react
- Styling: Tailwind CSS v4 via @tailwindcss/vite
- Linting: ESLint 9 + typescript-eslint + react-hooks + react-refresh

## Project Structure

```text
src/
  App.tsx                         # page-level orchestration and state
  components/
    BookCard.tsx                  # compact book preview card
    BookGrid.tsx                  # responsive grid + loading states
    BookDetailsModal.tsx          # detailed overlay and external actions
    SearchBar.tsx                 # query input and submit handling
  services/
    bookAggregator.service.ts     # orchestration, enrichment, search merge
    nyt.service.ts                # NYT API client + mapping
    openLibrary.service.ts        # Open Library metadata lookups
    search/
      SearchProvider.ts           # provider interface
      NYTSearchProvider.ts        # NYT review-backed search provider
      GoogleBooksSearchProvider.ts# optional Google Books provider
  types/
    Book.ts                       # shared app/domain and NYT API types
```

## Requirements

- Node.js 20+
- npm 10+
- NYT API key (required for meaningful data)
- Optional: Google Books API key (only if feature flag is enabled)

## Environment Variables

Create a local `.env` file at the project root:

```bash
VITE_NYT_API_KEY=your_nyt_api_key
VITE_ENABLE_GOOGLE_BOOKS_SEARCH=false
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### Variables

- `VITE_NYT_API_KEY`
  - Required for NYT overview and review search endpoints.
  - If omitted or invalid, trending and search data may be empty.
- `VITE_ENABLE_GOOGLE_BOOKS_SEARCH`
  - `true` enables the Google provider during search.
  - `false` keeps search NYT-only.
- `VITE_GOOGLE_BOOKS_API_KEY`
  - Optional, but recommended when Google provider is enabled.
  - The Google API may still respond for some unauthenticated usage, but key-based access is more reliable.

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev`
  - Starts the Vite development server with HMR.
- `npm run build`
  - Runs TypeScript project build then generates production assets.
- `npm run preview`
  - Serves the production build locally.
- `npm run lint`
  - Runs ESLint across the codebase.
- `npm run typecheck`
  - Runs TypeScript type checks without emitting files.
- `npm run check`
  - Convenience script that runs lint + typecheck.

## Data Providers

### New York Times API

- Base: `https://api.nytimes.com/svc/books/v3`
- Used for:
  - overview best seller discovery
  - list-specific retrieval
  - review search by title

### Open Library API

- Base: `https://openlibrary.org/api/books`
- Used for enrichment by ISBN.
- Enrichment is best-effort and intentionally fails silently so the app remains usable even when Open Library is unavailable.

### Google Books API (Optional)

- Base: `https://www.googleapis.com/books/v1/volumes`
- Used only when `VITE_ENABLE_GOOGLE_BOOKS_SEARCH=true`.
- Results are merged after NYT and deduplicated by ISBN.

## Behavior Notes

- NYT responses are mapped into one internal `Book` model used by all UI components.
- The trending feed currently limits to 8 books after deduplication.
- Missing enrichment data does not block rendering.
- Search is treated as a separate view from trending content.

## Troubleshooting

- Empty trending list:
  - Confirm `VITE_NYT_API_KEY` is set correctly.
  - Check browser dev tools for failed NYT requests.
- Search only returns a few results:
  - This can be expected when using NYT reviews only.
  - Enable Google Books search for broader coverage.
- Missing covers or metadata:
  - Open Library enrichment is best-effort and can be incomplete by ISBN.

## Deployment Notes

- Build command: `npm run build`
- Output directory: `dist/`
- Ensure all `VITE_*` variables are configured in your hosting provider before build time.

## Roadmap Ideas

- Add persistent favorites and reading lists.
- Add genre/list filters for trending view.
- Add pagination or infinite scroll for search results.
- Add request caching and retry/backoff logic.
- Add tests for provider mapping and merge/deduplication behavior.

## License

ISC
