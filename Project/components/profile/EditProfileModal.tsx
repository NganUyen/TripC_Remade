
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, User, MapPin, FileText, Phone } from 'lucide-react'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: any
    onUpdate: (newProfile: any) => void
}

export function EditProfileModal({ isOpen, onClose, profile, onUpdate }: EditProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        city: '',
        country: '',
        phone_number: ''
    })

    // Sync state with profile prop when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
                city: profile.city || '',
                country: profile.country || '',
                phone_number: profile.phone_number || ''
            })
        }
    }, [isOpen, profile])

    // Check if form is dirty (has changes)
    const isDirty = profile && (
        formData.name !== (profile.name || '') ||
        formData.bio !== (profile.bio || '') ||
        formData.city !== (profile.city || '') ||
        formData.country !== (profile.country || '') ||
        formData.phone_number !== (profile.phone_number || '')
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/v1/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to update profile')

            const updatedProfile = await res.json()
            onUpdate(updatedProfile)

            // Attempt to verify "Complete Profile" quest
            try {
                const verifyRes = await fetch('/api/v1/quests/verify', {
                    method: 'POST',
                    body: JSON.stringify({ questType: 'IDENTITY' })
                })

                const verifyJson = await verifyRes.json()

                if (verifyRes.ok) {
                    if (verifyJson.completed) {
                        // Success
                        console.log('Quest verified:', verifyJson)
                    } else {
                        console.warn('Profile not complete according to server:', verifyJson)
                    }
                } else {
                    console.error('Quest verification error:', verifyJson)
                    alert(`Quest Verification Failed: ${verifyJson.error || verifyJson.message}`)
                }
            } catch (e) {
                console.error('Quest verification failed', e)
                alert('Quest verification failed to connect.')
            }

            onClose()
        } catch (error) {
            console.error(error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10 max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="shrink-0 p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Bio / Tagline
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us a bit about yourself..."
                                    rows={3}
                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white resize-none"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Location Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>


                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-12 px-6 rounded-full font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !isDirty}
                                className="h-12 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
