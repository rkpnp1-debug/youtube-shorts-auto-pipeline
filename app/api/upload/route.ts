import { NextRequest, NextResponse } from 'next/server';
import { addVideoToPool } from '@/lib/pool';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    const title = (formData.get('title') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const id = uuid();
    const ext = path.extname(file.name) || '.mp4';
    const filename = `${id}${ext}`;

    // Store locally for now (in production use R2/S3)
    const poolDir = path.join(process.cwd(), 'public', 'pool');
    await mkdir(poolDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(poolDir, filename);
    await writeFile(filePath, buffer);

    const video = await addVideoToPool({
      id,
      filename,
      title,
      notes,
      path: `/pool/${filename}`,
      status: 'ready',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: video.id, message: 'Added to pool' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
