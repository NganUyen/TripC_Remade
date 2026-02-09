"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const COLLECTIONS = [
    {
        id: 1,
        title: "Kỳ Nghỉ Đảo Tư Nhân",
        description: "Không gian riêng tư tuyệt đối giữa biển khơi",
        image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2574&auto=format&fit=crop",
        tag: "Luxury"
    },
    {
        id: 2,
        title: "Nghỉ Dưỡng Núi Tuyết",
        description: "Ấm áp bên lò sưởi giữa đỉnh núi phủ tuyết",
        image: "https://images.unsplash.com/photo-1512273222628-4daea6e55abb?q=80&w=2670&auto=format&fit=crop",
        tag: "Winter"
    },
    {
        id: 3,
        title: "Khách Sạn Thiết Kế",
        description: "Kiệt tác kiến trúc giữa lòng thành phố",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop",
        tag: "City"
    }
]

export function TrendingCollections() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#FF5E1F]" /> Bộ Sưu Tập Tuyển Chọn
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Trải nghiệm đẳng cấp được TripC lựa chọn kỹ lưỡng</p>
                </div>
                <Link href="/collections" className="hidden sm:flex items-center text-slate-900 dark:text-white font-bold text-sm hover:text-[#FF5E1F] transition-colors gap-2 cursor-pointer group">
                    Xem tất cả
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {COLLECTIONS.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer relative aspect-[4/5] rounded-[2rem] overflow-hidden"
                    >
                        <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                        <div className="absolute top-4 left-4">
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {item.tag}
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{item.title}</h3>
                            <p className="text-white/80 text-sm line-clamp-2 mb-4 group-hover:text-white transition-colors">{item.description}</p>
                            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-[#FF5E1F] transition-colors">
                                Khám phá <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
