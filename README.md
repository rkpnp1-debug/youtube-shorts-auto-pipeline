# YouTube Shorts Auto Pipeline

Automated daily pipeline that picks videos from a folder on your computer (or a web upload pool), uses AI agents to generate high-reach titles/descriptions/hashtags, and uploads them as YouTube Shorts.

## How video picking works now

**Primary source = your local folder**

By default on Windows it looks in:

```
C:\\Users\\<YourWindowsUsername>\\Downloads
```

You can change it with the environment variable:

```env
VIDEO_POOL_PATH=C:\\Users\\YourName\\Downloads
```

or any other folder you want (e.g. `C:\\Videos\\ToUpload`).

The script:
1. Scans the folder for `.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`, `.m4v`
2. Picks the **oldest** video that has not been uploaded yet
3. Runs AI agents
4. Uploads to YouTube Shorts
5. Remembers it so it never uploads the same file twice

## Quick Start (Windows)

### 1. Clone
```bash
git clone https://github.com/rkpnp1-debug/youtube-shorts-auto-pipeline.git
cd youtube-shorts-auto-pipeline
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in the values:

```env
OPENAI_API_KEY=sk-...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...

# Point this to your Downloads (or any folder)
VIDEO_POOL_PATH=C:\\Users\\YourName\\Downloads
```

### 3. Run once (test)
```bash
npm run cron:daily
```

It will pick the oldest unused video from the folder and upload it.

### 4. Schedule it every day

**Option A – Windows Task Scheduler (recommended for local folder)**
1. Open Task Scheduler
2. Create Basic Task → Daily → 9:00 AM
3. Action: Start a program
4. Program: `node`
5. Arguments: `scripts/daily-upload.ts` (or use `npx tsx scripts/daily-upload.ts`)
6. Start in: the project folder

**Option B – GitHub Actions** (only works if videos are in the repo or cloud storage)
The workflow `.github/workflows/daily-upload.yml` is already there.
You still need to put videos somewhere the runner can reach (S3/R2 recommended).

## Web Dashboard (optional)

```bash
npm run dev
```

- `/` – Dashboard
- `/upload` – Upload extra videos (stored in `public/pool`)
- `/queue` – See status of all processed videos

## Required API keys

| Key | Where to get it |
|-----|-----------------|
| `OPENAI_API_KEY` | platform.openai.com |
| `YOUTUBE_CLIENT_ID` + `SECRET` + `REFRESH_TOKEN` | Google Cloud Console → YouTube Data API v3 |

Need the exact script to generate the YouTube refresh token? Just ask.

## Reach tactics included

- Curiosity + emotion titles
- SEO-rich descriptions with CTA
- Mix of high-volume + niche hashtags
- Strong 3-second hook suggestion

## License
MIT
