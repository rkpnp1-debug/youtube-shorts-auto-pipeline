import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export type VideoStatus = 'ready' | 'processing' | 'uploaded' | 'failed';

export interface Video {
  id: string;
  filename: string;
  title: string;
  notes: string;
  path: string;
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

async function ensureDb() {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await readFile(DB_PATH, 'utf-8');
  } catch {
    await writeFile(DB_PATH, '[]');
  }
}

async function readDb(): Promise<Video[]> {
  await ensureDb();
  const raw = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(videos: Video[]) {
  await ensureDb();
  await writeFile(DB_PATH, JSON.stringify(videos, null, 2));
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

export async function getNextReadyVideo(): Promise<Video | null> {
  const videos = await readDb();
  return videos.find((v) => v.status === 'ready') || null;
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
