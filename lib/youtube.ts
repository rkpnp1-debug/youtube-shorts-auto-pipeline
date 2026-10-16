import { google } from 'googleapis';
import { createReadStream } from 'fs';
import path from 'path';

export async function uploadToYouTubeShorts(opts: {
  videoPath: string;
  title: string;
  description: string;
  tags: string[];
}) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const fullPath = path.isAbsolute(opts.videoPath)
    ? opts.videoPath
    : path.join(process.cwd(), 'public', opts.videoPath.replace(/^\/pool/, 'pool'));

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: opts.title.slice(0, 100),
        description: opts.description,
        tags: opts.tags,
        categoryId: '22', // People & Blogs (common for Shorts)
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
