"use client"

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Truck, ShieldCheck, Zap } from 'lucide-react'

interface PurchasePanelProps {
    price: string
    oldPrice: string
    stock: number
}

export function PurchasePanel({ price, oldPrice, stock }: PurchasePanelProps) {
    const [quantity, setQuantity] = useState(1)

    const decreaseQty = () => setQuantity(q => Math.max(1, q - 1))
    const increaseQty = () => setQuantity(q => Math.min(stock, q + 1))

    return (
        <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-orange-500/5 p-6 space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <span className="text-sm text-slate-400 line-through">${oldPrice}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">${price}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">USD</span>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    Save 15%
                </span>
            </div>

            {/* Quantity Selector */}
            <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quantity</span>
                <div className="flex items-center justify-between p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                    <button onClick={decreaseQty} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all">
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{quantity}</span>
                    <button onClick={increaseQty} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {stock < 5 && (
                    <p className="text-xs text-orange-500 font-medium mt-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Only {stock} items left!
                    </p>
                )}
            </div>

            {/* Shipping Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">Free Express Shipping</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Arrives by Oct 18 - Oct 20</span>
                </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
                <button className="w-full py-4 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                    Buy Now
                </button>

                <button className="w-full py-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-all flex items-center justify-center gap-2 group">
                    <ShoppingCart className="w-5 h-5 group-hover:fill-current" />
                    Add to Cart
                </button>
            </div>

            {/* Micro Trust */}
            <div className="flex items-center justify-center gap-4 text-slate-400 text-xs mt-4">
                <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Warranty
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Secure Checkout</span>
            </div>
        </div>
    )
}
