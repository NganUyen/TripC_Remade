export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden rounded-b-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="max-w-[1440px] mx-auto">
            <div className="w-32 h-8 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
            <div className="w-2/3 h-16 bg-slate-300 dark:bg-slate-700 rounded-lg mb-4" />
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="w-40 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="w-48 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="w-3/4 h-6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
