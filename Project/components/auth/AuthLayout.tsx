"use client";

import Link from "next/link";
import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF5E1F]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-8 group hover:scale-105 transition-transform duration-300">
                    <div className="text-white size-12 bg-gradient-to-br from-[#FF5E1F] to-[#FF8C61] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF5E1F]/20 group-hover:shadow-[#FF5E1F]/40 transition-shadow">
                        <span className="material-symbols-outlined text-3xl">travel_explore</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight leading-none">
                            TripC Pro
                        </h1>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                            TRAVEL COMPANION
                        </span>
                    </div>
                </Link>

                {/* Content Wrapper */}
                <div className="w-full">
                    {children}
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <Link href="#" className="hover:text-[#FF5E1F] transition-colors">Help Center</Link>
                    <Link href="#" className="hover:text-[#FF5E1F] transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-[#FF5E1F] transition-colors">Terms</Link>
                </div>
            </div>
        </div>
    );
}
