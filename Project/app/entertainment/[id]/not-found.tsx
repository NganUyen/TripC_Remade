export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6">
          Entertainment Event Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          The entertainment event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <a
          href="/entertainment"
          className="inline-block px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all"
        >
          Back to Entertainment
        </a>
      </div>
    </div>
  )
}
