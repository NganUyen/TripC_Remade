"use client"

import { useState, useEffect } from 'react'
import { usePartnerStore } from '@/store/usePartnerStore'
import {
    Store,
    Save,
    Loader2,
    Globe,
    Phone,
    FileText,
    Image as ImageIcon,
    Upload,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Image from 'next/image'

export function SettingsView() {
    const { partner, isUpdating, updateProfile } = usePartnerStore()

    const [formData, setFormData] = useState({
        display_name: '',
        description: '',
        logo_url: '',
        cover_url: '',
        phone: '',
        website: '',
    })
    const [isDirty, setIsDirty] = useState(false)

    // Initialize form from partner data
    useEffect(() => {
        if (partner) {
            setFormData({
                display_name: partner.display_name || '',
                description: partner.description || '',
                logo_url: partner.logo_url || '',
                cover_url: partner.cover_url || '',
                phone: partner.phone || '',
                website: partner.website || '',
            })
        }
    }, [partner])

    if (!partner) return null

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        // Only send changed fields
        const changes: Record<string, string | null> = {}
        if (formData.display_name !== (partner.display_name || '')) changes.display_name = formData.display_name || null
        if (formData.description !== (partner.description || '')) changes.description = formData.description || null
        if (formData.logo_url !== (partner.logo_url || '')) changes.logo_url = formData.logo_url || null
        if (formData.cover_url !== (partner.cover_url || '')) changes.cover_url = formData.cover_url || null
        if (formData.phone !== (partner.phone || '')) changes.phone = formData.phone || null
        if (formData.website !== (partner.website || '')) changes.website = formData.website || null

        if (Object.keys(changes).length === 0) {
            toast.info('No changes to save')
            return
        }

        const success = await updateProfile(changes as any)
        if (success) {
            setIsDirty(false)
        }
    }

    const inputClasses = `
        w-full px-4 py-3 rounded-xl border transition-colors text-sm
        bg-white dark:bg-slate-800
        border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary
        text-slate-900 dark:text-white placeholder:text-slate-400
        focus:outline-none focus:ring-2
    `

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Store Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your store profile and public information
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isUpdating}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                    {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Store Profile */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
                {/* Cover Preview */}
                <div className="h-32 bg-gradient-to-r from-primary to-[#FF8A00] relative">
                    {formData.cover_url && (
                        <Image
                            src={formData.cover_url}
                            alt="Cover"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Update cover URL below
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Logo + Name */}
                    <div className="flex items-start gap-6 -mt-14 relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 overflow-hidden shadow-sm">
                                {formData.logo_url ? (
                                    <Image
                                        src={formData.logo_url}
                                        alt="Logo"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <Store className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-8 flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {formData.display_name || partner.business_name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {partner.business_name} · {partner.business_type}
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => updateField('display_name', e.target.value)}
                                placeholder="Store name shown to customers"
                                className={inputClasses}
                            />
                            <p className="text-xs text-slate-400 mt-1">Defaults to your business name if left empty</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Tell customers about your store..."
                                rows={4}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                placeholder="+84 xxx xxx xxxx"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => updateField('website', e.target.value)}
                                placeholder="https://yourbusiness.com"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Logo URL
                            </label>
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={(e) => updateField('logo_url', e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Cover URL
                            </label>
                            <input
                                type="url"
                                value={formData.cover_url}
                                onChange={(e) => updateField('cover_url', e.target.value)}
                                placeholder="https://example.com/cover.jpg"
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Read-only Business Info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
            >
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Business Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    These fields are set during onboarding and cannot be changed here. Contact support if you need to update them.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField label="Business Name" value={partner.business_name} />
                    <ReadOnlyField label="Business Type" value={partner.business_type} />
                    <ReadOnlyField label="Email" value={partner.email} />
                    <ReadOnlyField label="Country" value={partner.country_code} />
                    {partner.address_line1 && <ReadOnlyField label="Address" value={partner.address_line1} />}
                    {partner.city && <ReadOnlyField label="City" value={partner.city} />}
                    {partner.business_registration_number && (
                        <ReadOnlyField label="Registration Number" value={partner.business_registration_number} />
                    )}
                    {partner.tax_id && <ReadOnlyField label="Tax ID" value={partner.tax_id} />}
                </div>
            </motion.div>
        </div>
    )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 capitalize">{value}</p>
        </div>
    )
}
