"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Store, Hotel, ArrowRight } from 'lucide-react'

export default function PartnerSelectionPage() {
    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Partner Portal
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Chọn loại hình kinh doanh của bạn
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Restaurant Portal */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href="/partner/restaurant">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer group h-full flex flex-col">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                                        <Store className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        Restaurant Portal
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Quản lý nhà hàng, thực đơn, đặt bàn và đơn hàng
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                                    <span>Bắt đầu</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Hotel Portal */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link href="/partner/hotel">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer group h-full flex flex-col">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                                        <Hotel className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        Hotel Portal
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Quản lý khách sạn, phòng, đặt phòng và kênh phân phối
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                                    <span>Bắt đầu</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
