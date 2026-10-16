'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('notes', notes);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setStatus('success');
      setMessage(`Uploaded successfully! ID: ${data.id}`);
      setFile(null);
      setTitle('');
      setNotes('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-zinc-400">Add a video to the daily upload pool</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Video file (MP4, vertical preferred)</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Working title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Crazy life hack with eggs"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes for AI agents (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key points, target audience, style..."
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'uploading' || !file}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
        >
          {status === 'uploading' ? 'Uploading...' : 'Add to Pool'}
        </button>

        {message && (
          <p
            className={`text-sm ${
              status === 'success' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-zinc-400'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
