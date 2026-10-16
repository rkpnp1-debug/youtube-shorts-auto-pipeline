# YouTube Shorts Auto Pipeline

Automated daily pipeline that:
1. Lets you upload videos into a pool
2. Daily picks a video via GitHub Actions cron
3. Uses AI agents to generate high-reach titles, descriptions, hashtags & hooks
4. Uploads to YouTube Shorts (YouTube Data API v3)
5. Runs every day automatically

**Stack:** Next.js (Vercel) + GitHub Actions + OpenAI (or any LLM) + YouTube API

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rkpnp1-debug/youtube-shorts-auto-pipeline.git
cd youtube-shorts-auto-pipeline
npm install
```

### 2. Environment Variables
Copy `.env.example` → `.env.local` and fill:

```env
# OpenAI (or compatible) for AI agents
OPENAI_API_KEY=sk-...

# YouTube Data API v3
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...

# Optional: better video storage (Cloudflare R2 / S3)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=youtube-shorts-pool

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
- Push this repo to GitHub (already done)
- Import project in Vercel
- Add the same env vars in Vercel dashboard
- Deploy

### 5. Enable Daily Cron
GitHub Actions workflow (`.github/workflows/daily-upload.yml`) runs every day at 09:00 UTC.
It will:
- Pick the oldest unprocessed video from the pool
- Run AI agents for title / description / hashtags
- Upload to YouTube Shorts
- Mark as processed

## How the Agents Work

1. **Title Agent** – Creates scroll-stopping titles optimized for Shorts algorithm
2. **Description Agent** – Writes SEO-rich descriptions with CTAs
3. **Hashtag Agent** – Picks high-volume + niche hashtags
4. **Hook Agent** – Suggests first 3-second hook text (you can burn it into video later)

## Video Pool

- Upload via the web dashboard (`/upload`)
- Videos are stored in `/public/pool` locally or R2/S3 in production
- Metadata (title suggestions, status) is stored in a simple JSON DB or you can swap to Postgres/Supabase

## Reach Tactics Built-in

- Algorithm-friendly titles (curiosity + emotion + keywords)
- Trending + evergreen hashtags mix
- Strong CTAs in description
- Optimal posting time (cron configurable)
- Vertical 9:16 ready

## Next Steps / Customization

- Add more platforms (TikTok, Instagram Reels) via their APIs
- Connect real AI video editing (e.g. Runway, CapCut API)
- Add analytics feedback loop so agents learn what performs
- Use a real DB (Supabase / PlanetScale)

## License
MIT
