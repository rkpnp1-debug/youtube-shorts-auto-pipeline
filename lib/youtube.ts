import { google } from 'googleapis';
import { createReadStream, existsSync } from 'fs';
import path from 'path';

export async function uploadToYouTubeShorts(opts: {
  videoPath: string;
  title: string;
  description: string;
  tags: string[];
}) {
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
    throw new Error('YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are required');
  }
  if (!process.env.YOUTUBE_REFRESH_TOKEN) {
    throw new Error('YOUTUBE_REFRESH_TOKEN is required');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Resolve path: absolute paths (from local folder) are used as-is
  let fullPath = opts.videoPath;
  if (!path.isAbsolute(fullPath)) {
    // legacy web-upload path like /pool/xxx.mp4
    fullPath = path.join(
      process.cwd(),
      'public',
      fullPath.replace(/^\/?pool\//, 'pool/')
    );
  }

  if (!existsSync(fullPath)) {
    throw new Error(`Video file not found: ${fullPath}`);
  }

  console.log(`  Uploading file: ${fullPath}`);

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: opts.title.slice(0, 100),
        description: opts.description.slice(0, 5000),
        tags: opts.tags.slice(0, 30),
        categoryId: '22',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(fullPath),
    },
  });

  return res.data;
}
