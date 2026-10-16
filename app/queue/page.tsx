import { getAllVideos } from '@/lib/pool';

export default async function QueuePage() {
  const videos = await getAllVideos();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Queue</h1>
        <p className="text-zinc-400">Videos waiting for the daily agent run</p>
      </div>

      {videos.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
          No videos in the pool yet. <a href="/upload" className="text-red-400 underline">Upload one</a>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{v.title || v.filename}</div>
                <div className="text-sm text-zinc-500 mt-1">
                  {v.id} · {new Date(v.createdAt).toLocaleString()}
                </div>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready: 'bg-emerald-500/20 text-emerald-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    uploaded: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${colors[status] || 'bg-zinc-700 text-zinc-300'}`}>
      {status}
    </span>
  );
}
