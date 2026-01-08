'use client'

import React from 'react'

interface SharePopupProps {
    isOpen: boolean
    onClose: () => void
}

export function SharePopup({ isOpen, onClose }: SharePopupProps) {
    const [showToast, setShowToast] = React.useState(false)

    if (!isOpen) return null

    const handleCopy = () => {
        // In a real app we'd use navigator.clipboard.writeText
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-white/50 dark:border-white/10 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Share this Experience</h3>
                    <p className="text-sm text-slate-500 mb-6">Let your friends know about this amazing trip!</p>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="size-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <span className="text-xl font-bold">f</span>
                            </div>
                            <span className="text-xs font-medium text-slate-600">Facebook</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group" onClick={handleCopy}>
                            <div className="size-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 group-hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined">link</span>
                            </div>
                            <span className="text-xs font-medium text-slate-600">Copy Link</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="size-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 group-hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined">ios_share</span>
                            </div>
                            <span className="text-xs font-medium text-slate-600">More</span>
                        </button>
                    </div>
                </div>
                {showToast && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-1 animate-fade-in">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Copied!
                    </div>
                )}
            </div>
        </div>
    )
}
