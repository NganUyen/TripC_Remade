"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { usePartnerStore } from '@/store/usePartnerStore'
import type { PartnerApplicationData, PartnerBusinessType } from '@/lib/shop/types'
import { motion } from 'framer-motion'
import { Store, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Upload, FileText, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CertificateFile {
    file: File
    preview: string
    name: string
}

export function OnboardingForm() {
    const router = useRouter()
    const { user } = useUser()
    const { applyAsPartner, isApplying } = usePartnerStore()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<PartnerApplicationData>({
        business_name: '',
        display_name: '',
        business_type: 'individual',
        email: '',
        phone: '',
        website: '',
        address_line1: '',
        city: '',
        country_code: 'VN',
        description: '',
        business_registration_number: '',
        tax_id: '',
        certificate_urls: [],
    })
    const [certificates, setCertificates] = useState<CertificateFile[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-fill email from logged-in user
    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.primaryEmailAddress?.emailAddress || '' }))
        }
    }, [user])

    const totalSteps = 4

    const updateField = (field: keyof PartnerApplicationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newCerts: CertificateFile[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            // Allow images and PDFs
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                setErrors(prev => ({ ...prev, certificates: 'Only images and PDF files are allowed' }))
                continue
            }
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, certificates: 'Each file must be under 10MB' }))
                continue
            }
            newCerts.push({
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
                name: file.name,
            })
        }

        if (newCerts.length > 0) {
            setCertificates(prev => [...prev, ...newCerts])
            setErrors(prev => ({ ...prev, certificates: '' }))
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeCertificate = (index: number) => {
        setCertificates(prev => {
            const updated = [...prev]
            if (updated[index].preview) {
                URL.revokeObjectURL(updated[index].preview)
            }
            updated.splice(index, 1)
            return updated
        })
    }

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        // Step 2 is optional fields, no strict validation
        return true
    }

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2)
        else if (step === 2 && validateStep2()) setStep(3)
        else if (step === 3) setStep(4)
    }

    const handleSubmit = async () => {
        // TODO: Upload certificate files to storage and get URLs
        // For now, store file names as placeholders
        const certUrls = certificates.map(c => c.name)
        const dataToSubmit = {
            ...formData,
            certificate_urls: certUrls.length > 0 ? certUrls : undefined,
        }

        const success = await applyAsPartner(dataToSubmit)
        if (success) {
            router.push('/shop/partner')
        }
    }

    const inputClasses = (field: string) => `
        w-full px-4 py-3 rounded-xl border transition-colors text-sm
        bg-white dark:bg-slate-800
        ${errors[field]
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary'
        }
        text-slate-900 dark:text-white placeholder:text-slate-400
        focus:outline-none focus:ring-2
    `

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Become a Partner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Set up your store on TripC Marketplace
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    {/* Step 1: Business Info */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.business_name}
                                    onChange={(e) => updateField('business_name', e.target.value)}
                                    placeholder="Your business or brand name"
                                    className={inputClasses('business_name')}
                                />
                                {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.display_name || ''}
                                    onChange={(e) => updateField('display_name', e.target.value)}
                                    placeholder="Name shown to customers (defaults to business name)"
                                    className={inputClasses('display_name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Business Type
                                </label>
                                <select
                                    value={formData.business_type}
                                    onChange={(e) => updateField('business_type', e.target.value as PartnerBusinessType)}
                                    className={inputClasses('business_type')}
                                >
                                    <option value="individual">Individual</option>
                                    <option value="business">Business</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    placeholder="business@example.com"
                                    className={inputClasses('email')}
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Tell customers about your business..."
                                    rows={3}
                                    className={inputClasses('description')}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Contact & Location */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact & Location</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    placeholder="+84 xxx xxx xxxx"
                                    className={inputClasses('phone')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                                <input
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={(e) => updateField('website', e.target.value)}
                                    placeholder="https://yourbusiness.com"
                                    className={inputClasses('website')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                                <input
                                    type="text"
                                    value={formData.address_line1 || ''}
                                    onChange={(e) => updateField('address_line1', e.target.value)}
                                    placeholder="Street address"
                                    className={inputClasses('address_line1')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        value={formData.city || ''}
                                        onChange={(e) => updateField('city', e.target.value)}
                                        placeholder="City"
                                        className={inputClasses('city')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
                                    <select
                                        value={formData.country_code}
                                        onChange={(e) => updateField('country_code', e.target.value)}
                                        className={inputClasses('country_code')}
                                    >
                                        <option value="VN">Vietnam</option>
                                        <option value="US">United States</option>
                                        <option value="SG">Singapore</option>
                                        <option value="TH">Thailand</option>
                                        <option value="JP">Japan</option>
                                        <option value="KR">South Korea</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Business Registration Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.business_registration_number || ''}
                                    onChange={(e) => updateField('business_registration_number', e.target.value)}
                                    placeholder="Optional"
                                    className={inputClasses('business_registration_number')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tax ID</label>
                                <input
                                    type="text"
                                    value={formData.tax_id || ''}
                                    onChange={(e) => updateField('tax_id', e.target.value)}
                                    placeholder="Optional"
                                    className={inputClasses('tax_id')}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Certificates & Verification */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificates & Verification</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Upload your business certificates, licenses, or any relevant documents.
                                These will be verified automatically.
                            </p>

                            {/* Upload area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Click to upload certificates
                                </p>
                                <p className="text-xs text-slate-400">
                                    Images or PDF files, max 10MB each
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {errors.certificates && (
                                <p className="text-xs text-red-500">{errors.certificates}</p>
                            )}

                            {/* Uploaded files list */}
                            {certificates.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Uploaded ({certificates.length})
                                    </p>
                                    {certificates.map((cert, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                        >
                                            {cert.preview ? (
                                                <Image
                                                    src={cert.preview}
                                                    alt={cert.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {cert.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {(cert.file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeCertificate(index)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Certificates are optional for now. You can upload business licenses,
                                    tax certificates, or any documents that verify your business.
                                    AI verification will be available soon.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                        >
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review & Submit</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Please review your information before submitting.
                            </p>

                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                <ReviewField label="Business Name" value={formData.business_name} />
                                {formData.display_name && <ReviewField label="Display Name" value={formData.display_name} />}
                                <ReviewField label="Business Type" value={formData.business_type} />
                                <ReviewField label="Email" value={formData.email} />
                                {formData.phone && <ReviewField label="Phone" value={formData.phone} />}
                                {formData.website && <ReviewField label="Website" value={formData.website} />}
                                {formData.address_line1 && <ReviewField label="Address" value={formData.address_line1} />}
                                {formData.city && <ReviewField label="City" value={formData.city} />}
                                <ReviewField label="Country" value={formData.country_code || 'VN'} />
                                {formData.description && <ReviewField label="Description" value={formData.description} />}
                                {certificates.length > 0 && (
                                    <ReviewField label="Certificates" value={`${certificates.length} file(s) uploaded`} />
                                )}
                            </div>

                            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4">
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Your partner account will be activated immediately after submission.
                                    You can start adding products right away!
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <Link
                                href="/shop/partner"
                                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Cancel
                            </Link>
                        )}

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isApplying}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

function ReviewField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{value}</span>
        </div>
    )
}
