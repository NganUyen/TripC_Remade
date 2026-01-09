"use client"

import { motion } from "framer-motion"
import { Shield, CreditCard, Plane } from "lucide-react"

export function TransportFeatures() {
    return (
        <section className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden relative">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-12 relative">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* LEFT COLUMN: Feature List & Text */}
                    <div className="relative z-10">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase mb-3 block">
                            Premium Standards
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                            Experience the<br />difference.
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-md mb-12">
                            Travel with peace of mind knowing every detail is handled by professionals. From seamless arrivals to premium vehicles.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Safe & Reliable</h4>
                                    <p className="text-slate-500 text-sm">Strict vetting for all chauffeurs ensuring your absolute safety.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <Plane className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Flight Tracking</h4>
                                    <p className="text-slate-500 text-sm">Real-time monitoring. We wait for you, not the other way around.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xl mb-1">All-Inclusive</h4>
                                    <p className="text-slate-500 text-sm">Zero hidden fees. Tolls, tips, and taxes included in the price.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Editorial Visual Composition */}
                    <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-end overflow-visible lg:translate-x-12">
                        {/* Atmospheric Glow */}
                        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />

                        {/* Masked Car Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative w-full lg:w-[120%] h-full"
                        >
                            <motion.img
                                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop"
                                alt="Luxury Transport"
                                initial={{ scale: 1 }}
                                whileInView={{ scale: 1.05 }}
                                transition={{ duration: 10, ease: "linear" }}
                                className="w-full h-full object-cover object-center lg:object-left [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%),linear-gradient(to_left,black_50%,transparent_100%)] lg:[mask-image:linear-gradient(to_left,black_60%,transparent_100%)]"
                            />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}