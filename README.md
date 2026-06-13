# mosaic-module-lectio

Daily readings, journal, contemplative practice, and prayers module for the Mosaic framework. Aggregates multiple Catholic/Christian daily reading sources, provides a structured Examen journal with nightly AI condensation, and manages a personal prayer library with intercessions.

---

## Features

### Daily Readings

Fetched from external sources and cached locally. The archive job runs at 00:05 daily.

| Source | What it provides |
|---|---|
| Roman Catholic | Daily Mass readings |
| Liturgy of the Hours | Morning, daytime, evening, and night prayer |
| Saint of the day | Biography and feast day information |
| Greek Orthodox | Daily Orthodox readings |
| Eastern Orthodox | Eastern tradition daily readings |

### Contemplative

Daily spiritual reading drawn from multiple sources in a rotating sequence:

- Ignatian 19th Annotation retreat schedule
- 18-week Ignatian retreat
- Sacred Space
- Creighton Online Ministries
- My Utmost for His Highest

Each day's reading has a personal reflection journal attached. A sequential reader allows browsing the full text corpus.

### Journal

Structured daily Examen journal with these fields:

| Field | Purpose |
|---|---|
| General Notes | Free-form top-of-day entry |
| Gratitude | What am I grateful for today? |
| Awareness | Where did I notice God / goodness today? |
| Action | What do I need to act on? |
| Intercessions | Who or what am I praying for? |

Entries are condensed into prose each night by Claude (`claude-sonnet-4-6`). A **View original** toggle shows the raw field-by-field content. Weekly theme summaries are generated every Friday morning.

The nav badge shows **1** if no journal entry has been written today, **0** otherwise.

### Prayers

Personal prayer library:
- Add, edit, hide/show, and delete prayers
- Prayers displayed as clickable chips that open full text in a popup
- Manage button for bulk editing

### Intercessions

A separate prayer request list — people and intentions you are praying for, each with a date added.

### Ignatian Examen

Structured daily examination of conscience with guided prompts.

### Scheduled jobs

| Job | Schedule | What it does |
|---|---|---|
| Archive readings | Daily 00:05 | Archives previous day's cached readings |
| Condense journal | Daily 03:00 | AI condenses previous day's journal fields into prose |
| Weekly review | Friday 03:05 | AI synthesises weekly themes from journal entries |

---

## API

Base path: `/api/lectio/`

### Journal

| Method | Path | Description |
|---|---|---|
| `GET` | `/journal` | List journal entries (date range) |
| `GET` | `/journal/:date` | Get entry for a date (`YYYY-MM-DD`) |
| `PUT` | `/journal/:date` | Create or update entry fields |
| `GET` | `/journal/:date/condensed` | Get the AI-condensed prose for a date |

### Readings

| Method | Path | Description |
|---|---|---|
| `GET` | `/readings` | Today's readings from all sources |
| `GET` | `/readings/:date` | Readings for a specific date |

### Contemplative

| Method | Path | Description |
|---|---|---|
| `GET` | `/contemplative` | Today's contemplative reading |
| `GET` | `/contemplative/history` | Browse past readings |
| `POST` | `/contemplative/:date/reflection` | Save personal reflection for a date |

### Prayers

| Method | Path | Description |
|---|---|---|
| `GET` | `/prayers` | List prayers |
| `POST` | `/prayers` | Create prayer (`title`, `text`) |
| `PUT` | `/prayers/:id` | Update prayer |
| `DELETE` | `/prayers/:id` | Delete prayer |

### Intercessions

| Method | Path | Description |
|---|---|---|
| `GET` | `/intercessions` | List active intercessions |
| `POST` | `/intercessions` | Add intercession (`name`, `intention`) |
| `DELETE` | `/intercessions/:id` | Remove intercession |

### Ignatian Examen

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get today's examen prompts |
| `POST` | `/` | Save examen response |

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@anthropic-ai/sdk` | ^0.104.1 | Claude AI — journal condensation and weekly review (`claude-sonnet-4-6`) |
| `better-sqlite3` | peer | SQLite driver (provided by framework) |
| `express` | peer | HTTP server (provided by framework) |
| `@opentelemetry/api` | peer | Observability (provided by framework) |

---

## Project structure

```
mosaic-module-lectio/
├── index.ts                    # Module manifest — slug, nav badge, scheduled jobs
├── src/
│   ├── routes/
│   │   ├── index.ts            # Root router — mounts all sub-routers + /ui.js
│   │   ├── journal.ts          # Journal CRUD and AI condensation trigger
│   │   ├── readings.ts         # Daily readings fetch and cache
│   │   ├── contemplative.ts    # Contemplative readings + personal reflection
│   │   ├── prayers.ts          # Prayer library management
│   │   ├── intercessions.ts    # Intercession prayer list
│   │   └── ignatian.ts         # Ignatian examen prompts and responses
│   └── services/               # Reading fetchers, AI condensation jobs
├── public/
│   └── ui.js                   # Frontend IIFE — served via GET /api/lectio/ui.js
└── tests/
    └── unit/                   # Vitest unit tests
```
