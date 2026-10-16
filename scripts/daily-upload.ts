/**
 * Daily cron script – run by GitHub Actions
 * 1. Pick next ready video
 * 2. Run AI reach agents
 * 3. Upload to YouTube Shorts
 * 4. Mark as uploaded
 */

import { getNextReadyVideo, updateVideo } from '../lib/pool';
import { runReachAgents } from '../lib/agents';
import { uploadToYouTubeShorts } from '../lib/youtube';

async function main() {
  console.log('=== Daily YouTube Shorts Pipeline ===');
  console.log(new Date().toISOString());

  const video = await getNextReadyVideo();

  if (!video) {
    console.log('No videos ready in the pool. Exiting.');
    return;
  }

  console.log(`Picked video: ${video.id} (${video.filename})`);

  await updateVideo(video.id, { status: 'processing' });

  try {
    // 1. AI agents
    console.log('Running reach agents...');
    const generated = await runReachAgents({
      workingTitle: video.title,
      notes: video.notes,
      filename: video.filename,
    });

    console.log('Generated title:', generated.title);

    // 2. Upload
    console.log('Uploading to YouTube Shorts...');
    const ytResult = await uploadToYouTubeShorts({
      videoPath: video.path,
      title: generated.title,
      description: `${generated.description}\n\n${generated.hashtags.join(' ')}`,
      tags: generated.hashtags.map((h) => h.replace('#', '')),
    });

    const youtubeId = ytResult.id;

    // 3. Mark done
    await updateVideo(video.id, {
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      youtubeId: youtubeId || undefined,
      generated,
    });

    console.log(`✅ Uploaded successfully! YouTube ID: ${youtubeId}`);
  } catch (err: any) {
    console.error('Pipeline failed:', err.message);
    await updateVideo(video.id, { status: 'failed' });
    process.exit(1);
  }
}

main();
