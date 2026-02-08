"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { partnerApi } from '@/lib/partner/api'
import type { DiningVenue } from '@/lib/dining/types'
import { useUser } from '@clerk/nextjs'
import { Loader2, Save } from 'lucide-react'

export function MyOutlets() {
    const { user } = useUser()
    const [venue, setVenue] = useState<DiningVenue | null>(null)
    const [loading, setLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState<Partial<DiningVenue>>({})

    useEffect(() => {
        const loadData = async () => {
            if (!user) return
            try {
                const venues = await partnerApi.getMyVenues(user.id)
                if (venues.length > 0) {
                    setVenue(venues[0])
                    setFormData(venues[0])
                }
            } catch (error) {
                console.error("Failed to load venue:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const handleSave = async () => {
        if (!venue || !user) return
        try {
            const updated = await partnerApi.updateVenue(venue.id, formData, user.id)
            setVenue(updated)
            alert("Venue updated successfully!")
        } catch (error) {
            console.error(error)
            alert("Failed to update venue")
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
    if (!venue) return <div className="p-8 text-center text-slate-500">No venue found. Please contact admin to assign a venue.</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Outlet Management</h2>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Restaurant Name
                    </label>
                    <input
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Items Price Range</label>
                        <select
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                            value={formData.price_range || 'moderate'}
                            onChange={e => setFormData({ ...formData, price_range: e.target.value as any })}
                        >
                            <option value="budget">Budget</option>
                            <option value="moderate">Moderate</option>
                            <option value="upscale">Upscale</option>
                            <option value="fine_dining">Fine Dining</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Description
                    </label>
                    <textarea
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-32"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Address
                    </label>
                    <input
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                        value={formData.address || ''}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
