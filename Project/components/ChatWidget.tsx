"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, RotateCcw, MessageSquare } from 'lucide-react'

// Mock initial state
const INITIAL_MESSAGES = [
    { id: 1, role: 'ai', text: "Hi there! I'm your TripC AI Concierge. How can I help you plan your perfect trip today?" }
]

const SUGGESTIONS = [
    "Find hotels in Da Nang",
    "Cheap flights to Tokyo",
    "Best spa in Bali"
]

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = () => {
        if (!inputValue.trim()) return

        const newUserMsg = { id: Date.now(), role: 'user', text: inputValue }
        setMessages(prev => [...prev, newUserMsg])
        setInputValue("")
        setIsTyping(true)

        // Mock AI Response
        setTimeout(() => {
            const aiResponses = [
                "That sounds amazing! I can show you some great options matching your preferences.",
                "I found a few top-rated places for you. Would you like to check them out?",
                "Great choice! Let me narrow down the best deals available right now."
            ]
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
            const newAiMsg = { id: Date.now() + 1, role: 'ai', text: randomResponse }

            setMessages(prev => [...prev, newAiMsg])
            setIsTyping(false)
        }, 1500)
    }

    const handleSuggestionClick = (text: string) => {
        setInputValue(text)
    }

    const handleReset = () => {
        setMessages(INITIAL_MESSAGES)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="pointer-events-auto w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/40 dark:bg-black/20 backdrop-blur-sm border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-[#FF5E1F] rounded-full">
                                    <Sparkles className="w-4 h-4 text-white fill-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none">TripC AI</h3>
                                    <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E1F] to-orange-400 uppercase tracking-widest">Concierge</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleReset} className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 transition-colors" title="Reset Chat">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm' : 'bg-[#FF5E1F] shadow-sm'}`}>
                                            {msg.role === 'ai' ? (
                                                <Sparkles className="w-4 h-4 text-[#FF5E1F]" />
                                            ) : (
                                                <span className="text-white text-xs font-bold">You</span>
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div
                                            className={`px-4 py-3 shadow-sm text-sm font-medium leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-[#FF5E1F] to-[#ff8c5e] text-white rounded-2xl rounded-tr-none'
                                                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-zinc-700 rounded-2xl rounded-tl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-[#FF5E1F]" />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Console */}
                        <div className="p-4 pt-2">
                            {/* Suggestion Chips */}
                            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                                {SUGGESTIONS.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-white/20 dark:border-zinc-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all shadow-sm backdrop-blur-md"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            {/* Input Field */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full shadow-sm border border-white/40 dark:border-zinc-700" />
                                <div className="relative flex items-center px-2 py-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask about hotels, flights..."
                                        className="flex-1 bg-transparent border-none focus:outline-none pl-4 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                                    />
                                    <button
                                        onClick={handleSend}
                                        className={`size-9 rounded-full flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-[#FF5E1F] text-white shadow-md hover:scale-105 active:scale-95' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 cursor-not-allowed'}`}
                                        disabled={!inputValue.trim()}
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="pointer-events-auto relative z-[100] w-14 h-14 bg-[#FF5E1F] hover:bg-orange-600 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white transition-colors"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sparkles className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse Ring when idle */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#FF5E1F] animate-ping opacity-20 pointer-events-none"></span>
                )}
            </motion.button>
        </div>
    )
}
