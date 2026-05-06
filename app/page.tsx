export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Kairos</h1>
      <p className="text-gray-500 text-center max-w-md">
        Your ADHD-friendly task scheduler. The app is being built — check back
        soon.
      </p>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 max-w-sm w-full">
        <p className="font-medium text-gray-800 mb-2">What&apos;s ready</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>AI Scheduler (heuristic engine)</li>
          <li>Next Action Scorer</li>
          <li>Habit Model</li>
          <li>Reminder Scheduler</li>
        </ul>
      </div>
    </main>
  );
}
