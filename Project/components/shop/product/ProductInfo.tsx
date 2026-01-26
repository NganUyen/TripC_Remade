"use client"

import { useState, useTransition } from 'react'
import { Star, Share2, Heart, Truck, RefreshCw, Minus, Plus, Zap, Check, Loader2 } from 'lucide-react'
import { shopApi } from '@/lib/hooks/useShopAPI'

interface ProductInfoProps {
    data: any
    variantId?: string // Selected variant ID for Add to Cart
    onVariantSelect?: (variantId: string) => void
}

export function ProductInfo({ data, variantId: initialVariantId, onVariantSelect }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1)
    const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({})
    const [isPending, startTransition] = useTransition()
    const [cartSuccess, setCartSuccess] = useState(false)
    const [cartError, setCartError] = useState<string | null>(null)

    // If data has real variants from API, use them
    const variantOptions = data.variants?.[0]?.options || []
    const selectedVariantId = initialVariantId || variantOptions[0]?.id

    const decreaseQty = () => setQuantity(q => Math.max(1, q - 1))
    const increaseQty = () => setQuantity(q => Math.min(data.stock || 99, q + 1))

    const handleAddToCart = async () => {
        if (!selectedVariantId) {
            setCartError('Please select a variant')
            return
        }

        setCartError(null)
        startTransition(async () => {
            const result = await shopApi.addToCart(selectedVariantId, quantity)

            if (result.error) {
                setCartError(result.error)
            } else {
                setCartSuccess(true)
                setTimeout(() => setCartSuccess(false), 2000)
            }
        })
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 rounded-md bg-[#FF5E1F] text-white text-xs font-bold uppercase tracking-wider">
                        TripC Shop
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
                    {data.category && (
                        <>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">{data.category}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Price Section */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex items-center gap-4">
                <span className="text-4xl font-bold text-[#FF5E1F]">${data.price}</span>
                {data.oldPrice && (
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-400 line-through">${data.oldPrice}</span>
                        <span className="text-xs font-bold text-red-500">
                            -{Math.round((1 - parseFloat(data.price) / parseFloat(data.oldPrice)) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Variants */}
            <div className="space-y-6">
                {data.variants?.map((variant: any) => (
                    <div key={variant.id}>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3 block">
                            {variant.type}: <span className="text-slate-900 dark:text-white font-bold">{selectedVariant[variant.id] || 'Select'}</span>
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {variant.options?.map((opt: any) => (
                                <button
                                    key={opt.name || opt.id}
                                    onClick={() => {
                                        setSelectedVariant({ ...selectedVariant, [variant.id]: opt.name })
                                        if (opt.id && onVariantSelect) onVariantSelect(opt.id)
                                    }}
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
                        <span className="text-slate-900 dark:text-white font-medium">Delivery</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Standard shipping 5-7 days</span>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                        <span className="text-slate-900 dark:text-white font-medium">7 Days Returns</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block">Free returns within 7 days</span>
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
                    <span className="text-xs text-slate-400">{data.stock || 'In'} stock</span>
                </div>
            </div>

            {/* Cart Error/Success Messages */}
            {cartError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                    {cartError}
                </div>
            )}
            {cartSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Added to cart!
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-2">
                <button
                    onClick={handleAddToCart}
                    disabled={isPending}
                    className="flex-1 py-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-bold text-lg hover:bg-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                    ) : (
                        'Add to Cart'
                    )}
                </button>
                <button className="flex-1 py-4 rounded-full bg-[#FF5E1F] text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
                    Buy Now
                </button>
            </div>
        </div>
    )
}
