"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmModalProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={!isLoading ? onCancel : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                ${variant === 'danger'
                                    ? 'bg-red-50 dark:bg-red-500/10'
                                    : 'bg-amber-50 dark:bg-amber-500/10'
                                }
                            `}>
                                <AlertTriangle className={`w-5 h-5 ${variant === 'danger'
                                        ? 'text-red-500'
                                        : 'text-amber-500'
                                    }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`
                                    px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2
                                    ${variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                                    }
                                `}
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
