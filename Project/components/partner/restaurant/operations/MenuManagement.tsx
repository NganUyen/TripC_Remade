"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash, Save, X, Loader2 } from 'lucide-react'
import { partnerApi } from '@/lib/partner/api'
import type { DiningMenuItem, DiningVenue } from '@/lib/dining/types'
import { useUser } from '@clerk/nextjs'

export function MenuManagement() {
    const { user } = useUser()
    const [venue, setVenue] = useState<DiningVenue | null>(null)
    const [items, setItems] = useState<DiningMenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<Partial<DiningMenuItem> | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (!user) return
            try {
                const venues = await partnerApi.getMyVenues(user.id)
                if (venues.length > 0) {
                    const currentVenue = venues[0]
                    setVenue(currentVenue)
                    // Pass userId to authenticated getMenuItems
                    const menuItems = await partnerApi.getMenuItems(currentVenue.id, user.id)
                    setItems(menuItems)
                }
            } catch (error) {
                console.error("Failed to load menu:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const handleSave = async () => {
        if (!editingItem || !venue || !user) return

        try {
            if (editingItem.id) {
                // Update
                const updated = await partnerApi.updateMenuItem(editingItem.id, editingItem, user.id)
                setItems(items.map(i => i.id === updated.id ? updated : i))
            } else {
                // Create
                const created = await partnerApi.createMenuItem(venue.id, editingItem, user.id)
                setItems([...items, created])
            }
            setEditingItem(null)
        } catch (error: any) {
            console.error("Failed to save item:", error)
            alert(`Failed to save item: ${error.message || JSON.stringify(error)}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?") || !user) return
        try {
            await partnerApi.deleteMenuItem(id, user.id)
            setItems(items.filter(i => i.id !== id))
        } catch (error) {
            console.error("Failed to delete:", error)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
    if (!venue) return <div className="p-8 text-center text-slate-500">No venue found. Please create a venue first.</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Menu Management</h2>
                <button
                    onClick={() => setEditingItem({})}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {/* Editor Modal/Form inline */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl">
                        <h3 className="text-xl font-bold mb-4">{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    value={editingItem.name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                        value={editingItem.price || ''}
                                        onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <input
                                        className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                        value={editingItem.category || ''}
                                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {items.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                <span className="text-xs font-mono text-slate-400 font-normal mr-2">[{item.id.slice(0, 8)}]</span>
                                {item.name}
                            </h3>
                            <p className="text-sm text-slate-500">{item.description}</p>
                            <span className="text-primary font-semibold">{item.price?.toLocaleString()} {item.currency}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingItem(item)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
