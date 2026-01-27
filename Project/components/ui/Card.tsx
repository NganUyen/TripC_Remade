import React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    // 1. Outer Wrapper (The Mover)
    <div className={`group hover:-translate-y-1 transition-transform duration-300 transform-gpu ${className}`}>
      {/* 2. Inner Container (The Shell) */}
      <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow p-6">
        {/* 3. Content */}
        {title && <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
