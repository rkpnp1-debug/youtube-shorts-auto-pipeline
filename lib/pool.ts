import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

export type VideoStatus = 'ready' | 'processing' | 'uploaded' | 'failed';

export interface Video {
  id: string;
  filename: string;
  title: string;
  notes: string;
  path: string;          // absolute or relative path to the video file
  status: VideoStatus;
  createdAt: string;
  uploadedAt?: string;
  youtubeId?: string;
  generated?: {
    title: string;
    description: string;
    hashtags: string[];
    hook: string;
  };
}

const DB_PATH = path.join(process.cwd(), 'data', 'pool.json');

// Default local folder on Windows. Override with VIDEO_POOL_PATH env var.
const DEFAULT_LOCAL_FOLDER =
  process.platform === 'win32'
    ? path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'Downloads')
    : path.join(process.env.HOME || '/tmp', 'Downloads');

export function getLocalPoolFolder(): string {
  return process.env.VIDEO_POOL_PATH || DEFAULT_LOCAL_FOLDER;
}

async function ensureDb() {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await readFile(DB_PATH, 'utf-8');
  } catch {
    await writeFile(DB_PATH, '[]', 'utf-8');
  }
}

async function readDb(): Promise<Video[]> {
  await ensureDb();
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw) as Video[];
  } catch {
    return [];
  }
}

async function writeDb(videos: Video[]) {
  await ensureDb();
  await writeFile(DB_PATH, JSON.stringify(videos, null, 2), 'utf-8');
}

export async function addVideoToPool(video: Video): Promise<Video> {
  const videos = await readDb();
  videos.push(video);
  await writeDb(videos);
  return video;
}

export async function getAllVideos(): Promise<Video[]> {
  return readDb();
}

export async function updateVideo(id: string, patch: Partial<Video>) {
  const videos = await readDb();
  const idx = videos.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  videos[idx] = { ...videos[idx], ...patch };
  await writeDb(videos);
  return videos[idx];
}

export async function getPoolStats() {
  const videos = await readDb();
  const today = new Date().toISOString().slice(0, 10);

  return {
    total: videos.length,
    ready: videos.filter((v) => v.status === 'ready').length,
    uploadedToday: videos.filter(
      (v) => v.status === 'uploaded' && v.uploadedAt?.startsWith(today)
    ).length,
  };
}

/**
 * Scan a local folder (default: C:\\Users\\<you>\\Downloads)
 * and return the oldest video that has NOT been processed yet.
 */
export async function getNextVideoFromLocalFolder(): Promise<Video | null> {
  const folder = getLocalPoolFolder();
  console.log(`Scanning local folder: ${folder}`);

  let entries: string[];
  try {
    entries = await readdir(folder);
  } catch (err: any) {
    console.error(`Cannot read folder "${folder}": ${err.message}`);
    console.error('Set VIDEO_POOL_PATH env var to the correct path.');
    return null;
  }

  const videoExts = new Set(['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v']);
  const videosInFolder: { fullPath: string; filename: string; mtime: number }[] = [];

  for (const name of entries) {
    const ext = path.extname(name).toLowerCase();
    if (!videoExts.has(ext)) continue;

    const fullPath = path.join(folder, name);
    try {
      const s = await stat(fullPath);
      if (s.isFile()) {
        videosInFolder.push({ fullPath, filename: name, mtime: s.mtimeMs });
      }
    } catch {
      // skip unreadable files
    }
  }

  if (videosInFolder.length === 0) {
    console.log('No video files found in the folder.');
    return null;
  }

  // oldest first
  videosInFolder.sort((a, b) => a.mtime - b.mtime);

  const db = await readDb();
  const alreadyProcessed = new Set(
    db
      .filter((v) => v.status === 'uploaded' || v.status === 'processing' || v.status === 'failed')
      .map((v) => v.filename.toLowerCase())
  );

  for (const item of videosInFolder) {
    if (alreadyProcessed.has(item.filename.toLowerCase())) continue;

    // Also check if we already have a "ready" entry for it
    const existing = db.find(
      (v) => v.filename.toLowerCase() === item.filename.toLowerCase() && v.status === 'ready'
    );
    if (existing) return existing;

    // Create a new entry
    const video: Video = {
      id: uuid(),
      filename: item.filename,
      title: path.parse(item.filename).name.replace(/[_-]/g, ' '),
      notes: '',
      path: item.fullPath, // absolute path
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    await addVideoToPool(video);
    return video;
  }

  console.log('All videos in the folder have already been processed.');
  return null;
}

/**
 * Prefer local folder if VIDEO_POOL_PATH is set or we are on Windows,
 * otherwise fall back to the JSON pool (web uploads).
 */
export async function getNextReadyVideo(): Promise<Video | null> {
  // Always try local folder first when VIDEO_POOL_PATH is set or platform is Windows
  if (process.env.VIDEO_POOL_PATH || process.platform === 'win32') {
    const local = await getNextVideoFromLocalFolder();
    if (local) return local;
  }

  // Fallback to web-uploaded pool
  const videos = await readDb();
  return videos.find((v) => v.status === 'ready') || null;
}
