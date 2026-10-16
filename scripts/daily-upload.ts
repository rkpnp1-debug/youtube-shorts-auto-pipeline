/**
 * Daily YouTube Shorts Pipeline
 *
 * How it picks videos:
 * 1. If VIDEO_POOL_PATH is set  → scan that folder (e.g. C:\\Users\\You\\Downloads)
 * 2. On Windows it defaults to %USERPROFILE%\\Downloads
 * 3. Otherwise falls back to videos uploaded via the web dashboard
 *
 * Usage (local Windows):
 *   set VIDEO_POOL_PATH=C:\\Users\\YourName\\Downloads
 *   npm run cron:daily
 *
 * Or just run it – it auto-detects Downloads on Windows.
 */

import { getNextReadyVideo, updateVideo, getLocalPoolFolder } from '../lib/pool';
import { runReachAgents } from '../lib/agents';
import { uploadToYouTubeShorts } from '../lib/youtube';
import { existsSync } from 'fs';

async function main() {
  console.log('=== Daily YouTube Shorts Pipeline ===');
  console.log(new Date().toISOString());
  console.log(`Local pool folder: ${getLocalPoolFolder()}`);
  console.log('');

  // Basic env checks
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.YOUTUBE_CLIENT_ID) missing.push('YOUTUBE_CLIENT_ID');
  if (!process.env.YOUTUBE_CLIENT_SECRET) missing.push('YOUTUBE_CLIENT_SECRET');
  if (!process.env.YOUTUBE_REFRESH_TOKEN) missing.push('YOUTUBE_REFRESH_TOKEN');

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((m) => console.error(`  - ${m}`));
    console.error('\nCreate a .env file or set them in GitHub Secrets / system env.');
    process.exit(1);
  }

  const video = await getNextReadyVideo();

  if (!video) {
    console.log('No new videos found. Nothing to upload today.');
    return;
  }

  console.log(`Picked video: ${video.filename}`);
  console.log(`  Path: ${video.path}`);
  console.log(`  ID:   ${video.id}`);

  // Verify file actually exists
  if (!existsSync(video.path)) {
    console.error(`File does not exist: ${video.path}`);
    await updateVideo(video.id, { status: 'failed' });
    process.exit(1);
  }

  await updateVideo(video.id, { status: 'processing' });

  try {
    // 1. AI agents for reach
    console.log('\nRunning AI reach agents...');
    const generated = await runReachAgents({
      workingTitle: video.title,
      notes: video.notes,
      filename: video.filename,
    });

    console.log(`  Title: ${generated.title}`);
    console.log(`  Hook:  ${generated.hook}`);
    console.log(`  Tags:  ${generated.hashtags.slice(0, 5).join(' ')}...`);

    // 2. Upload to YouTube Shorts
    console.log('\nUploading to YouTube Shorts...');
    const ytResult = await uploadToYouTubeShorts({
      videoPath: video.path,
      title: generated.title,
      description: `${generated.description}\n\n${generated.hashtags.join(' ')}`,
      tags: generated.hashtags.map((h) => h.replace(/^#/, '')),
    });

    const youtubeId = ytResult?.id;
    if (!youtubeId) {
      throw new Error('YouTube API returned no video ID');
    }

    // 3. Mark done
    await updateVideo(video.id, {
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      youtubeId,
      generated,
    });

    console.log(`\n✅ SUCCESS! Uploaded as YouTube Short`);
    console.log(`   https://youtube.com/shorts/${youtubeId}`);
  } catch (err: any) {
    console.error('\n❌ Pipeline failed:', err?.message || err);
    if (err?.response?.data) {
      console.error('API response:', JSON.stringify(err.response.data, null, 2));
    }
    await updateVideo(video.id, { status: 'failed' });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
