"use client"

import { useState } from 'react'
import { Star, MapPin, Share2, Heart, CheckCircle2, Truck, RefreshCw, Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import { BadgePill } from '@/components/ui/BadgePill'

interface ProductInfoProps {
    data: any // Using any for flexibility with the mock data structure
}

export function ProductInfo({ data }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1)
    const [selectedVariant, setSelectedVariant] = useState<any>({})

    const decreaseQty = () => setQuantity(q => Math.max(1, q - 1))
    const increaseQty = () => setQuantity(q => Math.min(data.stock, q + 1))

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                        LazMall
                    </span>
                    <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-red-500 transition-colors"><Heart className="w-5 h-5" /></button>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors"><Share2 className="w-5 h-5" /></button>
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                    {data.title}
                </h1>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-[#FF5E1F]">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold underline">{data.rating}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 underline">{data.reviews} Ratings</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">Brand: <span className="text-[#FF5E1F] font-bold cursor-pointer">Monos</span></span>
                </div>
            </div>

            {/* Price Section */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex items-center gap-4">
                <span className="text-4xl font-bold text-[#FF5E1F]">${data.price}</span>
                <div className="flex flex-col">
                    <span className="text-sm text-slate-400 line-through">${data.oldPrice}</span>
                    <span className="text-xs font-bold text-red-500">-15%</span>
                </div>
            </div>

            {/* Variants */}
            <div className="space-y-6">
                {data.variants.map((variant: any) => (
                    <div key={variant.id}>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3 block">
                            {variant.type}: <span className="text-slate-900 dark:text-white font-bold">{selectedVariant[variant.id] || 'Select'}</span>
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {variant.options.map((opt: any) => (
                                <button
                                    key={opt.name}
                                    onClick={() => setSelectedVariant({ ...selectedVariant, [variant.id]: opt.name })}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedVariant[variant.id] === opt.name
                                            ? 'border-[#FF5E1F] text-[#FF5E1F] bg-orange-50 dark:bg-orange-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                        }`}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery & Service Info */}
            <div className="space-y-3 py-4 text-sm">
                <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-medium">Delivery to</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Ho Chi Minh City, District 1</span>
                    </div>
                    <button className="ml-auto text-blue-500 font-bold uppercase text-xs">Change</button>
                </div>
                <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-medium">Standard Delivery</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Get it by 18 Oct - 20 Oct</span>
                    </div>
                    <span className="ml-auto text-slate-900 dark:text-white font-bold">$2.00</span>
                </div>
                <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                        <span className="text-slate-900 dark:text-white font-medium">7 Days Returns</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block">Change of mind is not applicable</span>
                    </div>
                </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Quantity</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                        <button onClick={decreaseQty} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5"><Minus className="w-4 h-4" /></button>
                        <span className="w-12 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
                        <button onClick={increaseQty} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5"><Plus className="w-4 h-4" /></button>
                    </div>
                    <span className="text-xs text-slate-400">{data.stock} pieces available</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
                <button className="flex-1 py-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-bold text-lg hover:bg-cyan-200 transition-colors">
                    Add to Cart
                </button>
                <button className="flex-1 py-4 rounded-full bg-[#FF5E1F] text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
                    Buy Now
                </button>
            </div>
        </div>
    )
}
