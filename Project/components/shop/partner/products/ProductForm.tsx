"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePartnerProductStore } from '@/store/usePartnerProductStore'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Rocket,
    Archive,
    Trash2,
    Plus,
    X,
    Image as ImageIcon,
    Package,
    Upload,
    Loader2,
    GripVertical,
} from 'lucide-react'
import Link from 'next/link'
import type { PartnerProduct, Variant, ProductImage, Category } from '@/lib/shop/types'
import Image from 'next/image'

// BUG-004 Fix: Category type for dropdown
interface CategoryOption {
    id: string;
    name: string;
    children?: CategoryOption[];
}

interface ProductFormProps {
    productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
    const router = useRouter()
    const {
        currentProduct,
        isLoadingProduct,
        isSaving,
        fetchProduct,
        clearCurrentProduct,
        createProduct,
        updateProduct,
        publishProduct,
        archiveProduct,
        deleteProduct,
        createVariant,
        updateVariant,
        deleteVariant,
        uploadImage,
        deleteImage,
    } = usePartnerProductStore()

    const isEditing = !!productId
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [productType, setProductType] = useState('physical')
    const [hasChanges, setHasChanges] = useState(false)

    // BUG-004 Fix: Categories for dropdown
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    // Variant form
    const [showVariantForm, setShowVariantForm] = useState(false)
    const [variantForm, setVariantForm] = useState({ sku: '', title: '', price: '', compare_at_price: '', stock_on_hand: '' })

    // BUG-004 Fix: Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            setIsLoadingCategories(true)
            try {
                const res = await fetch('/api/shop/categories')
                if (res.ok) {
                    const { data } = await res.json()
                    setCategories(data || [])
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err)
            } finally {
                setIsLoadingCategories(false)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        if (productId) {
            fetchProduct(productId)
        }
        return () => { clearCurrentProduct() }
    }, [productId, fetchProduct, clearCurrentProduct])

    useEffect(() => {
        if (currentProduct) {
            setTitle(currentProduct.title)
            setDescription(currentProduct.description)
            setCategoryId(currentProduct.category_id || '')
            setProductType(currentProduct.product_type)
        }
    }, [currentProduct])

    const handleSave = async () => {
        if (isEditing && productId) {
            const success = await updateProduct(productId, {
                title,
                description,
                category_id: categoryId || undefined,
                product_type: productType as 'physical' | 'digital',
            })
            if (success) setHasChanges(false)
        } else {
            const newId = await createProduct({ title, description, category_id: categoryId || undefined, product_type: productType })
            if (newId) {
                router.push(`/shop/partner/products/${newId}`)
            }
        }
    }

    const handlePublish = async () => {
        if (productId) {
            // Save first if there are changes
            if (hasChanges) await handleSave()
            const success = await publishProduct(productId)
            if (success) {
                // Navigate to dashboard after successful publish
                router.push('/shop/partner')
            }
        }
    }

    const handleAddVariant = async () => {
        if (!productId) return
        const success = await createVariant(productId, {
            sku: variantForm.sku,
            title: variantForm.title,
            price: parseFloat(variantForm.price) || 0,
            compare_at_price: variantForm.compare_at_price ? parseFloat(variantForm.compare_at_price) : undefined,
            stock_on_hand: variantForm.stock_on_hand ? parseInt(variantForm.stock_on_hand) : 0,
        })
        if (success) {
            setShowVariantForm(false)
            setVariantForm({ sku: '', title: '', price: '', compare_at_price: '', stock_on_hand: '' })
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!productId || !e.target.files?.length) return
        const file = e.target.files[0]
        await uploadImage(productId, file)
        e.target.value = ''
    }

    if (isEditing && isLoadingProduct) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const inputClasses = `
        w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
        transition-colors
    `

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/shop/partner/products"
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditing ? 'Edit Product' : 'New Product'}
                        </h1>
                        {isEditing && currentProduct && (
                            <span className={`
                                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1
                                ${currentProduct.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                                    currentProduct.status === 'draft' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                                        'bg-slate-100 dark:bg-slate-700 text-slate-500'}
                            `}>
                                {currentProduct.status}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && currentProduct?.status === 'active' && (
                        <button
                            onClick={() => archiveProduct(productId!)}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Archive className="w-4 h-4 inline mr-1.5" />
                            Archive
                        </button>
                    )}
                    {isEditing && (currentProduct?.status === 'draft' || currentProduct?.status === 'archived') && (
                        <button
                            onClick={handlePublish}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
                        >
                            <Rocket className="w-4 h-4 inline mr-1.5" />
                            Publish
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (!isEditing && !title.trim())}
                        className="px-6 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); setHasChanges(true) }}
                                    placeholder="Product title"
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => { setDescription(e.target.value); setHasChanges(true) }}
                                    placeholder="Describe your product (min 50 characters for publishing)"
                                    rows={5}
                                    className={inputClasses}
                                />
                                <p className="text-xs text-slate-400 mt-1">{description.length}/50 min characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Variants (only show after creation) */}
                    {isEditing && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Variants</h3>
                                <button
                                    onClick={() => setShowVariantForm(true)}
                                    className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                                >
                                    <Plus className="w-4 h-4" /> Add Variant
                                </button>
                            </div>

                            {/* Existing Variants */}
                            {currentProduct?.variants && currentProduct.variants.length > 0 ? (
                                <div className="space-y-2">
                                    {currentProduct.variants.map((v) => (
                                        <VariantRow
                                            key={v.id}
                                            variant={v}
                                            productId={productId!}
                                            onUpdate={updateVariant}
                                            onDelete={deleteVariant}
                                            isSaving={isSaving}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No variants yet. Add at least one variant with a price.
                                </p>
                            )}

                            {/* New Variant Form */}
                            {showVariantForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                                >
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                        <input
                                            placeholder="SKU"
                                            value={variantForm.sku}
                                            onChange={(e) => setVariantForm(p => ({ ...p, sku: e.target.value }))}
                                            className={inputClasses}
                                        />
                                        <input
                                            placeholder="Title"
                                            value={variantForm.title}
                                            onChange={(e) => setVariantForm(p => ({ ...p, title: e.target.value }))}
                                            className={inputClasses}
                                        />
                                        <input
                                            placeholder="Price"
                                            type="number"
                                            step="0.01"
                                            value={variantForm.price}
                                            onChange={(e) => setVariantForm(p => ({ ...p, price: e.target.value }))}
                                            className={inputClasses}
                                        />
                                        <input
                                            placeholder="Compare at"
                                            type="number"
                                            step="0.01"
                                            value={variantForm.compare_at_price}
                                            onChange={(e) => setVariantForm(p => ({ ...p, compare_at_price: e.target.value }))}
                                            className={inputClasses}
                                        />
                                        <input
                                            placeholder="Stock"
                                            type="number"
                                            value={variantForm.stock_on_hand}
                                            onChange={(e) => setVariantForm(p => ({ ...p, stock_on_hand: e.target.value }))}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={handleAddVariant}
                                            disabled={isSaving || !variantForm.sku || !variantForm.title || !variantForm.price}
                                            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => setShowVariantForm(false)}
                                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Images (only show after creation) */}
                    {isEditing && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Images</h3>
                                <label className="text-sm text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline">
                                    <Upload className="w-4 h-4" /> Upload
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {currentProduct?.images && currentProduct.images.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {currentProduct.images
                                        .sort((a, b) => a.sort_order - b.sort_order)
                                        .map((img) => (
                                            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
                                                <Image src={img.url} alt={img.alt || 'Product image'} fill className="object-cover" unoptimized />
                                                {img.is_primary && (
                                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium">
                                                        Primary
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => deleteImage(productId!, img.id)}
                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Click to upload images</span>
                                    <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP. Max 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Organization</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Type</label>
                                <select
                                    value={productType}
                                    onChange={(e) => { setProductType(e.target.value); setHasChanges(true) }}
                                    className={inputClasses}
                                >
                                    <option value="physical">Physical</option>
                                    <option value="digital">Digital</option>
                                </select>
                            </div>
                            {/* BUG-004 Fix: Replace text input with category dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => { setCategoryId(e.target.value); setHasChanges(true) }}
                                    className={inputClasses}
                                    disabled={isLoadingCategories}
                                >
                                    <option value="">Select a category (optional)</option>
                                    {categories.map((cat) => (
                                        <optgroup key={cat.id} label={cat.name}>
                                            <option value={cat.id}>{cat.name}</option>
                                            {cat.children?.map((child) => (
                                                <option key={child.id} value={child.id}>
                                                    &nbsp;&nbsp;{child.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {isEditing && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 p-6">
                            <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                            <p className="text-sm text-slate-500 mb-4">Permanently delete this product and all its data.</p>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this product? This cannot be undone.')) {
                                        deleteProduct(productId!).then(ok => ok && router.push('/shop/partner/products'))
                                    }
                                }}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full justify-center"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Product
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function VariantRow({
    variant,
    productId,
    onUpdate,
    onDelete,
    isSaving,
}: {
    variant: Variant
    productId: string
    onUpdate: (productId: string, variantId: string, data: Record<string, unknown>) => Promise<boolean>
    onDelete: (productId: string, variantId: string) => Promise<boolean>
    isSaving: boolean
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        price: variant.price.toString(),
        stock_on_hand: variant.stock_on_hand.toString(),
    })

    const handleSave = async () => {
        await onUpdate(productId, variant.id, {
            price: parseFloat(editData.price),
            stock_on_hand: parseInt(editData.stock_on_hand),
        })
        setIsEditing(false)
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{variant.title}</span>
                    <span className="text-xs text-slate-400 font-mono">{variant.sku}</span>
                </div>
                {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="number"
                            step="0.01"
                            value={editData.price}
                            onChange={(e) => setEditData(p => ({ ...p, price: e.target.value }))}
                            className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800"
                            placeholder="Price"
                        />
                        <input
                            type="number"
                            value={editData.stock_on_hand}
                            onChange={(e) => setEditData(p => ({ ...p, stock_on_hand: e.target.value }))}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800"
                            placeholder="Stock"
                        />
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 rounded-lg border text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 mt-0.5">
                        ${variant.price.toFixed(2)}
                        {variant.compare_at_price ? <span className="line-through ml-2">${variant.compare_at_price.toFixed(2)}</span> : ''}
                        {' · '}Stock: {variant.stock_on_hand}
                        {' · '}{variant.is_active ? 'Active' : 'Inactive'}
                    </p>
                )}
            </div>
            {!isEditing && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Remove this variant?')) onDelete(productId, variant.id)
                        }}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                </div>
            )}
        </div>
    )
}
