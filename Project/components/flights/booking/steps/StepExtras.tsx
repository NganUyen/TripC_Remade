"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { FlightDetailsSummary } from "../FlightDetailsSummary"
import { Briefcase, Utensils, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function StepExtras() {
    const { setStep } = useBookingStore()
    const [selectedBag, setSelectedBag] = useState('cabin')
    const [selectedMeal, setSelectedMeal] = useState('no-meal')

    return (
        <div className="space-y-8 animate-fadeIn">

            <FlightDetailsSummary />

            <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Baggage & Meals</h3>
            </div>

            {/* Baggage Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-bold">Baggage</div>
                    <span className="text-xs text-[#FF5E1F] font-bold bg-orange-50 px-2 py-1 rounded">No selection</span>
                </div>

                <div className="space-y-3">
                    {[
                        { id: 'cabin', name: 'Cabin Bag Only', desc: 'Personal item + 7kg cabin bag included', price: 0, tag: 'Included' },
                        { id: '15kg', name: 'Checked Bag 15kg', desc: 'One checked bag up to 15kg', price: 25, tag: '15kg' },
                        { id: '23kg', name: 'Checked Bag 23kg', desc: 'One checked bag up to 23kg', price: 40, tag: '23kg' },
                        { id: '32kg', name: 'Checked Bag 32kg', desc: 'One checked bag up to 32kg', price: 60, tag: '32kg' },
                        { id: 'extra', name: 'Extra Checked Bag', desc: 'Two checked bags up to 23kg each', price: 75, tag: '2 x 23kg' },
                    ].map((bag) => (
                        <div
                            key={bag.id}
                            onClick={() => setSelectedBag(bag.id)}
                            className={`group cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all ${selectedBag === bag.id ? 'border-[#FF5E1F] bg-orange-50/50 dark:bg-orange-900/10 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-[#FF5E1F]/50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedBag === bag.id ? 'border-[#FF5E1F] bg-[#FF5E1F]' : 'border-slate-300'}`}>
                                    {selectedBag === bag.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{bag.name}</div>
                                    <div className="text-xs text-slate-500">{bag.desc}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                {bag.price === 0 ? (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{bag.tag}</span>
                                ) : (
                                    <>
                                        <div className="text-xs font-bold text-slate-400 mb-0.5">{bag.tag}</div>
                                        <div className="font-bold text-slate-900 dark:text-white">+${bag.price}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Meals Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-bold">In-Flight Meal</div>
                    <span className="text-xs text-[#FF5E1F] font-bold bg-orange-50 px-2 py-1 rounded">Our flight</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'no-meal', name: 'No Meal', desc: 'Standard complimentary snack only', price: 0, tag: 'Included' },
                        { id: 'standard', name: 'Standard Meal', desc: 'Chef prepared hot meal with dessert', price: 15 },
                        { id: 'veg', name: 'Vegetarian Meal', desc: 'Delicious meat-free hot meal', price: 18, tag: 'Vegetarian' },
                        { id: 'vegan', name: 'Vegan Meal', desc: 'Plant-based gourmet meal', price: 18, tag: 'Vegan', tagColor: 'bg-green-600 text-white' },
                        { id: 'halal', name: 'Halal Meal', desc: 'Halal certified hot meal', price: 18, tag: 'Halal', tagColor: 'bg-orange-600 text-white' },
                        { id: 'gluten', name: 'Gluten-Free Meal', desc: 'Gluten-free hot meal option', price: 18, tag: 'Gluten-Free', tagColor: 'bg-amber-600 text-white' },
                        { id: 'premium', name: 'Premium Meal', desc: 'Three course gourmet meal with wine', price: 35, tag: 'Premium', tagColor: 'bg-purple-600 text-white' },
                    ].map((meal) => (
                        <div
                            key={meal.id}
                            onClick={() => setSelectedMeal(meal.id)}
                            className={`cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden ${selectedMeal === meal.id ? 'border-[#FF5E1F] bg-orange-50/50 dark:bg-orange-900/10 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-[#FF5E1F]/50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${selectedMeal === meal.id ? 'border-[#FF5E1F] bg-[#FF5E1F]' : 'border-slate-300'}`}>
                                    {selectedMeal === meal.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                    {meal.price === 0 ? 'Included' : `+$${meal.price}`}
                                </div>
                            </div>
                            <div className="pl-9">
                                <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{meal.name}</div>
                                <div className="text-xs text-slate-500 mb-2">{meal.desc}</div>
                                {meal.tag && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${meal.tagColor ? meal.tagColor : 'bg-slate-100 text-slate-600'}`}>{meal.tag}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Back</button>
                <button
                    onClick={() => setStep(4)}
                    className="flex-1 ml-4 py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.005] active:scale-[0.99]"
                >
                    Continue to Insurance
                </button>
            </div>
        </div>
    )
}
