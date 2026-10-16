import { getPoolStats } from '@/lib/pool';

export default async function Dashboard() {
  const stats = await getPoolStats();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-400">Your automated YouTube Shorts pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Videos in Pool" value={stats.total} />
        <StatCard label="Ready to Upload" value={stats.ready} accent="green" />
        <StatCard label="Uploaded Today" value={stats.uploadedToday} accent="red" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
          <li>Upload videos via the <a href="/upload" className="text-red-400 underline">Upload</a> page</li>
          <li>AI agents generate high-reach titles, descriptions & hashtags</li>
          <li>GitHub Actions runs daily and picks the next video</li>
          <li>Video is uploaded to YouTube Shorts automatically</li>
        </ol>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Next scheduled run</h2>
        <p className="text-zinc-400">Every day at 09:00 UTC via GitHub Actions cron</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = 'zinc',
}: {
  label: string;
  value: number;
  accent?: 'zinc' | 'green' | 'red';
}) {
  const color =
    accent === 'green'
      ? 'text-emerald-400'
      : accent === 'red'
      ? 'text-red-400'
      : 'text-white';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="text-sm text-zinc-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
