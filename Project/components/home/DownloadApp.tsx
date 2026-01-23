"use client"

import { motion } from "framer-motion"
import { QrCode, Bell, Wallet, Map, ShieldCheck, ArrowRight } from "lucide-react"

const TRIPC = {
    accent: "#FF5E1F", // giữ tông cam TripC nếu bạn đang dùng
    ink: "#0B0F1A",
}

const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.55, ease: "easeOut" },
}

export function DownloadApp() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#070A12] shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
                {/* Clean travel-ish background (no nebula) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div
                        className="absolute -top-24 -right-24 h-[260px] w-[260px] rounded-full blur-3xl opacity-20 dark:opacity-25"
                        style={{ background: TRIPC.accent }}
                    />
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 sm:p-12 md:p-14">
                    {/* Left */}
                    <div>
                        <motion.div {...fadeUp} className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TRIPC.accent }} />
                            TripC Mobile
                            <span className="text-slate-400 dark:text-slate-400 font-medium">•</span>
                            Faster booking management
                        </motion.div>

                        <motion.h2
                            {...fadeUp}
                            transition={{ ...fadeUp.transition, delay: 0.05 }}
                            className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white"
                        >
                            Tải app TripC để quản lý
                            <span className="block">
                                chuyến đi <span style={{ color: TRIPC.accent }}>mượt hơn</span>.
                            </span>
                        </motion.h2>

                        <motion.p
                            {...fadeUp}
                            transition={{ ...fadeUp.transition, delay: 0.1 }}
                            className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl"
                        >
                            Xem itinerary, nhận cảnh báo realtime, lưu ví ưu đãi và check-in nhanh — mọi thứ gói gọn trong một nơi.
                        </motion.p>

                        <motion.div
                            {...fadeUp}
                            transition={{ ...fadeUp.transition, delay: 0.15 }}
                            className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                            {[
                                { icon: Map, title: "Itinerary thông minh", desc: "Gộp vé + lịch trình theo ngày" },
                                { icon: Bell, title: "Alert realtime", desc: "Gate/Delay/Reminder kịp thời" },
                                { icon: Wallet, title: "Ví ưu đãi", desc: "Lưu voucher & điểm dùng 1 chạm" },
                                { icon: ShieldCheck, title: "Thanh toán an toàn", desc: "Bảo vệ giao dịch & dữ liệu" },
                            ].map((f, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 backdrop-blur">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                                            <f.icon className="h-5 w-5" style={{ color: TRIPC.accent }} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</div>
                                            <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA row */}
                        <motion.div
                            {...fadeUp}
                            transition={{ ...fadeUp.transition, delay: 0.2 }}
                            className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="h-12 px-5 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-95 transition inline-flex items-center gap-2">
                                    Tải iOS
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button className="h-12 px-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition inline-flex items-center gap-2">
                                    Tải Android
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="sm:ml-auto flex items-center gap-3 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10">
                                    <QrCode className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-slate-900 dark:text-white">Quét QR để tải</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Mở camera hoặc Zalo</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right - Phone mock (recommend: replace with your screenshot) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                        className="relative flex justify-center md:justify-end"
                    >
                        <div className="relative w-[280px] sm:w-[320px] md:w-[360px]">
                            {/* Phone shell */}
                            <div className="rounded-[2.2rem] border border-slate-200/70 dark:border-white/10 bg-slate-900 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
                                <div className="rounded-[1.9rem] overflow-hidden bg-white">
                                    {/* Replace this block with <img src="/your-app-screenshot.png" .../> */}
                                    <img
                                        src="https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop"
                                        alt="TripC Mobile App Interface"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* subtle floating chip (not “AI bounce”) */}
                            <div className="absolute -left-6 top-16 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md hidden sm:block">
                                <div className="text-[11px] font-semibold text-slate-900">Alert</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Gate changed • 12A</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
