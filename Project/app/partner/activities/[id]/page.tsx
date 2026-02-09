"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function EditActivityPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        image_url: '', // simplified for now
        category: 'Activity',
        duration: '',
        inclusions: '',
        exclusions: '',
        important_info: '',
        ticket_types: [{ name: 'General Admission', price: '' }]
    })

    useEffect(() => {
        async function fetchActivity() {
            try {
                const res = await fetch(`/api/partner/activities/${params.id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Handle ticket_types: if exists and is array, use it. Else create default from price.
                    let loadedTicketTypes = [{ name: 'General Admission', price: String(data.price || '') }]
                    if (Array.isArray(data.ticket_types) && data.ticket_types.length > 0) {
                        loadedTicketTypes = data.ticket_types.map((t: any) => ({
                            name: t.name,
                            price: String(t.price)
                        }))
                    }

                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        location: data.location || '',
                        // price: data.price || '', // No longer managing price directly
                        image_url: data.images?.[0] || data.image_url || '',
                        category: data.category || 'Activity',
                        duration: data.features?.duration || '',
                        inclusions: Array.isArray(data.inclusions) ? data.inclusions.join('\n') : '',
                        exclusions: Array.isArray(data.exclusions) ? data.exclusions.join('\n') : '',
                        important_info: data.important_info || '',
                        ticket_types: loadedTicketTypes
                    })
                } else {
                    alert('Activity not found')
                    router.push('/partner/activities')
                }
            } catch (error) {
                console.error("Failed to fetch activity", error)
            } finally {
                setLoading(false)
            }
        }
        fetchActivity()
    }, [params.id, router])

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
        if (prices.some(p => p < 0)) {
            alert('Price cannot be negative')
            setSaving(false)
            return
        }

        const minPrice = Math.min(...prices)

        try {
            const updateRes = await fetch(`/api/partner/activities/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    images: [formData.image_url],
                    price: minPrice,
                    ticket_types: validTicketTypes.map(t => ({ ...t, price: Number(t.price) })),
                    inclusions: formData.inclusions.split('\n').filter(Boolean),
                    exclusions: formData.exclusions.split('\n').filter(Boolean)
                })
            })

            if (updateRes.ok) {
                router.push('/partner/activities')
                router.refresh()
            } else {
                const error = await updateRes.json()
                alert(error.error || 'Failed to update activity')
            }
        } catch (error) {
            console.error("Update failed", error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading activity...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Activity</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                    <Label htmlFor="title">Activity Title</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-4">
                    <Label>Ticket Types</Label>
                    {formData.ticket_types.map((ticket, index) => (
                        <div key={index} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`ticket-name-${index}`} className="text-xs text-slate-500">Name</Label>
                                <Input
                                    id={`ticket-name-${index}`}
                                    placeholder="e.g. Adult, Child"
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
                                    placeholder="0.00"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            name="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="Activity">Activity</option>
                            <option value="Tour">Tour</option>
                            <option value="Show">Show</option>
                            <option value="Attraction">Attraction</option>
                            <option value="Concert">Concert</option>
                            <option value="Sport">Sport</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                            id="duration"
                            name="duration"
                            placeholder="e.g. 2 hours"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>
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

                <div className="space-y-2">
                    <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                    <Textarea
                        id="inclusions"
                        name="inclusions"
                        className="h-24"
                        value={formData.inclusions}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="exclusions">Exclusions (one per line)</Label>
                    <Textarea
                        id="exclusions"
                        name="exclusions"
                        className="h-24"
                        value={formData.exclusions}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="important_info">Important Information</Label>
                    <Textarea
                        id="important_info"
                        name="important_info"
                        className="h-24"
                        value={formData.important_info}
                        onChange={handleChange}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
