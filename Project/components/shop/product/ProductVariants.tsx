"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'

interface Variant {
    id: string
    type: string
    options: { name: string, value?: string, priceMod?: number }[]
}

interface ProductVariantsProps {
    variants: Variant[]
}

export function ProductVariants({ variants }: ProductVariantsProps) {
    // Simple state just for visualization
    const [selections, setSelections] = useState<Record<string, string>>({
        v1: "Midnight Black",
        v2: "Pro (Carry-On)"
    })

    const handleSelect = (id: string, name: string) => {
        setSelections(prev => ({ ...prev, [id]: name }))
    }

    return (
        <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            {variants.map((variant) => (
                <div key={variant.id}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                        Select {variant.type}: <span className="text-[#FF5E1F]">{selections[variant.id]}</span>
                    </h3>

                    {variant.type === "Color" ? (
                        <div className="flex gap-4">
                            {variant.options.map((opt) => (
                                <button
                                    key={opt.name}
                                    onClick={() => handleSelect(variant.id, opt.name)}
                                    className={`w-12 h-12 rounded-full relative shadow-sm ring-offset-2 dark:ring-offset-slate-900 transition-all ${selections[variant.id] === opt.name ? 'ring-2 ring-[#FF5E1F] scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: opt.value }}
                                    title={opt.name}
                                >
                                    {selections[variant.id] === opt.name && (
                                        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                            <Check className="w-5 h-5" />
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {variant.options.map((opt) => (
                                <button
                                    key={opt.name}
                                    onClick={() => handleSelect(variant.id, opt.name)}
                                    className={`px-6 py-3 rounded-full border text-sm font-bold transition-all ${selections[variant.id] === opt.name
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg'
                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#FF5E1F]'
                                        }`}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
