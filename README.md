# Sea Cube — Underwater Archaeology

AI-powered underwater archaeology image classification and team matching. Upload an underwater photo, and the app uses Claude Vision AI to identify archaeological artifacts and connect you with the research team studying that type of object in your region.

## How It Works

1. **Upload** an underwater image and select a dive location + confidence threshold
2. **AI Analysis** — Claude Vision performs a multi-step pipeline:
   - Safety check (filters inappropriate content)
   - Underwater verification (confirms the image is taken underwater)
   - Man-made object detection with confidence scoring
   - Object classification into categories: amphora, pottery, statue, anchor, coin, ship, cargo, cannon, chest, tool, aircraft
3. **Team Matching** — The detected object type and location are looked up against a database of 20 archaeology research teams
4. **Result** — If a match is found, you get the team name, project details, and a way to contact them. If not, you can submit a review request for manual processing.

### Error States

| Code | Meaning |
|------|---------|
| 5.1  | Safety violation or invalid input |
| 5.2  | Image is not underwater |
| 5.3  | No man-made object detected |
| 5.4  | Confidence below threshold |
| 5.5  | No team match in database |

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript, `src/` directory)
- **Styling:** Tailwind CSS (dark navy/cyan/purple theme, mobile-first)
- **AI:** Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`) — Vision API for image analysis
- **Database:** Cloudflare D1 (SQLite) via REST API
- **Hosting:** Cloudflare Workers via `@opennextjs/cloudflare`
- **CI/CD:** GitHub Actions — auto-deploys on push to `main`
- **PWA:** Installable as a mobile app via Web App Manifest

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-image/route.ts   # Main analysis endpoint
│   │   └── submit-review/route.ts   # Review request endpoint
│   ├── layout.tsx                   # Root layout with PWA metadata
│   ├── page.tsx                     # Home page (state machine)
│   └── globals.css                  # Tailwind + custom animations
├── components/
│   ├── UploadForm.tsx               # Image upload + location + threshold
│   ├── LoadingSpinner.tsx           # Animated loading state
│   ├── ResultModal.tsx              # Success/error result display
│   └── ReviewRequestForm.tsx        # Manual review submission form
└── lib/
    ├── claude.ts                    # Claude Vision API integration
    ├── db.ts                        # Cloudflare D1 queries
    └── types.ts                     # Shared TypeScript types
```

## Setup Guide (Fork & Run)

### Prerequisites

- Node.js 20+
- npm
- A [Cloudflare](https://dash.cloudflare.com) account
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone and install

```bash
git clone https://github.com/sabry4u/sea-cube.git
cd sea-cube
npm install --legacy-peer-deps
```

### 2. Create a Cloudflare D1 database

```bash
npx wrangler d1 create archaeology-db
```

Copy the `database_id` from the output. Then seed the database with these tables:

```sql
CREATE TABLE IF NOT EXISTS archaeology_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL,
  location TEXT NOT NULL,
  object_type TEXT NOT NULL,
  project_name TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upload_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  confidence_threshold INTEGER,
  object_detected TEXT,
  object_confidence REAL,
  team_matched TEXT,
  error_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  object_detected TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Run the SQL via the Cloudflare dashboard (D1 > your database > Console) or with `wrangler d1 execute`.

Then insert team data into `archaeology_teams`. Valid locations: `mediterranean`, `caribbean`, `pacific`. Valid object types: `amphora`, `pottery`, `statue`, `anchor`, `coin`, `ship`, `cargo`, `cannon`, `chest`, `tool`, `aircraft`.

### 3. Set environment variables

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-...your-key...
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_D1_DATABASE_ID=your-database-id
CLOUDFLARE_API_TOKEN=your-api-token
```

| Variable | Where to find it |
|----------|-----------------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) > API Keys |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard URL bar (`dash.cloudflare.com/<account-id>`) or Overview sidebar |
| `CLOUDFLARE_D1_DATABASE_ID` | Output of `wrangler d1 create` or Dashboard > D1 > your database |
| `CLOUDFLARE_API_TOKEN` | Dashboard > My Profile > API Tokens > Create Token. Required permissions: **Workers Scripts: Edit**, **D1: Edit**, **Account Settings: Read** |

### 4. Update wrangler.toml

Replace the `database_id` in `wrangler.toml` with your own:

```toml
[[d1_databases]]
binding = "DB"
database_name = "archaeology-db"
database_id = "your-database-id-here"
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Cloudflare Workers

Build and deploy:

```bash
npx opennextjs-cloudflare build
npx wrangler deploy
```

Set runtime secrets (required for the live app):

```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_D1_DATABASE_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN
```

Each command will prompt you to enter the secret value.

### 7. CI/CD with GitHub Actions (optional)

The repo includes `.github/workflows/deploy.yml` which auto-deploys on push to `main`. Add these as GitHub repository secrets (Settings > Secrets and variables > Actions):

- `ANTHROPIC_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `CLOUDFLARE_API_TOKEN`

## License

MIT