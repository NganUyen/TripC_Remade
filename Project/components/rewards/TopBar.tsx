
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BellButton } from '@/components/notifications/BellButton'

export function TopBar() {
    return (
        <div className="sticky top-0 z-40 bg-[#fcfaf8]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 px-4 h-16 flex items-center justify-between">
            <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
            </Link>
            <span className="font-bold text-slate-900 dark:text-white">Tcent Rewards</span>
            <BellButton colorClass="text-slate-900 dark:text-white" />
        </div>
    )
}
