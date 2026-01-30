import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-6">
            <Search className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
            Hotel Not Found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            We couldn't find the hotel you're looking for. It may have been
            removed or the link might be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hotels"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/30"
          >
            <Search className="w-5 h-5" />
            Browse Hotels
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-slate-300 dark:border-slate-700 hover:border-orange-500 text-slate-700 dark:text-slate-300 hover:text-orange-500 font-bold transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
