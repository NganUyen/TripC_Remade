"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const TRIPC = {
    accent: "#FF5E1F",
}

const fadeUp = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.55, ease: "easeOut" },
}

export function Newsletter() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate email
        if (!email || !email.includes("@")) {
            toast.error("Vui lòng nhập email hợp lệ")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSubscribed(true)
                setEmail("")
                toast.success(data.message || "Đăng ký thành công! Kiểm tra email của bạn.")
            } else {
                toast.error(data.message || "Có lỗi xảy ra, vui lòng thử lại")
            }
        } catch (error) {
            console.error("Newsletter subscription error:", error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            <motion.div
                {...fadeUp}
                className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#070A12] shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
            >
                {/* Clean background (no "AI glow") */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div
                        className="absolute -top-24 -right-24 h-[240px] w-[240px] rounded-full blur-3xl opacity-15 dark:opacity-20"
                        style={{ background: TRIPC.accent }}
                    />
                </div>

                <div className="relative p-8 sm:p-10 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        {/* Copy */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TRIPC.accent }} />
                                TripC Drops
                                <span className="text-slate-400 dark:text-slate-400 font-medium">•</span>
                                Weekly
                            </div>

                            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                                Deal xịn & tips du lịch — gửi gọn trong 1 email.
                            </h2>

                            <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                Nhận flash deal, gợi ý lịch trình, và cảnh báo giá theo tuyến bạn quan tâm.
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <ShieldCheck className="h-4 w-4" />
                                Không spam. Hủy đăng ký bất kỳ lúc nào.
                            </div>
                        </div>

                        {/* Form */}
                        <div className="w-full md:w-[420px]">
                            {isSubscribed ? (
                                <div className="rounded-2xl border border-green-200/70 dark:border-green-500/20 bg-green-50/70 dark:bg-green-500/10 p-6 backdrop-blur text-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                                        Đăng ký thành công! 🎉
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-200">
                                        Kiểm tra email của bạn để xác nhận đăng ký.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 backdrop-blur">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="email"
                                                placeholder="Email của bạn"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                className="w-full h-12 pl-12 pr-32 rounded-xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#070A12] disabled:opacity-50 disabled:cursor-not-allowed"
                                            />

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="absolute right-1.5 top-1.5 h-9 px-4 rounded-lg font-semibold text-sm text-white
                                   shadow-sm hover:opacity-95 active:opacity-90 transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ background: TRIPC.accent }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        Subscribe
                                                        <ArrowRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="mt-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                                            Bằng việc đăng ký, bạn đồng ý nhận email cập nhật từ TripC.
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Optional: social proof, keep subtle */}
                            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                Hơn <span className="font-semibold text-slate-700 dark:text-slate-200">200k+</span> travelers đang theo dõi TripC Drops.
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
