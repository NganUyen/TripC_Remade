
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useSupabaseClient } from '@/lib/supabase'

export default function EditEntertainmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = useSupabaseClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        address: '',
        image_url: '',
        category_id: '',
        type: 'show',
        start_date: '',
        start_time: '',
        end_time: '',
        ticket_types: [{ name: 'Standard', price: '' }]
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('entertainment_categories').select('*')
            if (data) setCategories(data)
        }

        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/partner/entertainment/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    // Format ticket types
                    const formattedTickets = data.ticket_types && data.ticket_types.length > 0
                        ? data.ticket_types.map((t: any) => ({
                            name: t.name,
                            price: t.price
                        }))
                        : [{ name: 'Standard', price: '' }]

                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        city: data.city || '',
                        address: data.address || '',
                        image_url: data.image_url || '',
                        category_id: data.category_id || '',
                        type: data.type || 'show',
                        start_date: data.start_date ? data.start_date.split('T')[0] : '',
                        start_time: data.start_time || '',
                        end_time: data.end_time || '',
                        ticket_types: formattedTickets
                    })
                } else {
                    alert('Failed to load item')
                    router.push('/partner/activities')
                }
            } catch (error) {
                console.error("Fetch failed", error)
            } finally {
                setLoading(false)
            }
        }

        Promise.all([fetchCategories(), fetchItem()])
    }, [id, router, supabase])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleTicketTypeChange = (index: number, field: 'name' | 'price', value: string) => {
        const newTicketTypes = [...formData.ticket_types]
        newTicketTypes[index] = { ...newTicketTypes[index], [field]: value }
        setFormData(prev => ({ ...prev, ticket_types: newTicketTypes }))
    }

    const addTicketType = () => {
        setFormData(prev => ({
            ...prev,
            ticket_types: [...prev.ticket_types, { name: '', price: '' }]
        }))
    }

    const removeTicketType = (index: number) => {
        if (formData.ticket_types.length > 1) {
            setFormData(prev => ({
                ...prev,
                ticket_types: prev.ticket_types.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        // Validate prices
        const validTicketTypes = formData.ticket_types.filter(t => t.name && t.price !== '')
        if (validTicketTypes.length === 0) {
            alert('Please add at least one valid ticket type')
            setSaving(false)
            return
        }

        const prices = validTicketTypes.map(t => Number(t.price))
        const minPrice = Math.min(...prices)

        try {
            const res = await fetch(`/api/partner/entertainment/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    min_price: minPrice,
                    ticket_types: validTicketTypes.map(t => ({ ...t, price: Number(t.price) }))
                })
            })

            if (res.ok) {
                router.push('/partner/activities')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to update item')
            }
        } catch (error) {
            console.error("Update failed", error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6 mb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Entertainment</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <select
                            id="category_id"
                            name="category_id"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <select
                            id="type"
                            name="type"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="show">Show</option>
                            <option value="concert">Concert</option>
                            <option value="theater">Theater</option>
                            <option value="exhibition">Exhibition</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Date</Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            required
                            value={formData.start_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                            id="start_time"
                            name="start_time"
                            type="time"
                            value={formData.start_time}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                            id="end_time"
                            name="end_time"
                            type="time"
                            value={formData.end_time}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Ticket Types</Label>
                    {formData.ticket_types.map((ticket, index) => (
                        <div key={index} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`ticket-name-${index}`} className="text-xs text-slate-500">Name</Label>
                                <Input
                                    id={`ticket-name-${index}`}
                                    value={ticket.name}
                                    onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label htmlFor={`ticket-price-${index}`} className="text-xs text-slate-500">Price (USD)</Label>
                                <Input
                                    id={`ticket-price-${index}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ticket.price}
                                    onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                    required
                                />
                            </div>
                            {formData.ticket_types.length > 1 && (
                                <Button type="button" variant="outline" onClick={() => removeTicketType(index)} className="mb-0.5">
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addTicketType} className="w-full">
                        + Add Ticket Type
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        className="h-32"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={saving} className="bg-pink-600 hover:bg-pink-700 text-white">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
