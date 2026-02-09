
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        address: '',
        image_url: '',
        category: 'conference',
        start_date: '',
        start_time: '',
        end_time: '',
        inclusions: '',
        exclusions: '',
        important_info: '',
        ticket_types: [{ name: 'General Admission', price: '' }]
    })

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
        setLoading(true)

        // Validate prices
        const validTicketTypes = formData.ticket_types.filter(t => t.name && t.price !== '')
        if (validTicketTypes.length === 0) {
            alert('Please add at least one valid ticket type')
            setLoading(false)
            return
        }

        const prices = validTicketTypes.map(t => Number(t.price))
        if (prices.some(p => p < 0)) {
            alert('Price cannot be negative')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/partner/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ticket_types: validTicketTypes.map(t => ({ ...t, price: Number(t.price) })),
                    inclusions: formData.inclusions.split('\n').filter(Boolean),
                    exclusions: formData.exclusions.split('\n').filter(Boolean)
                })
            })

            if (res.ok) {
                router.push('/partner/activities')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to create event')
            }
        } catch (error) {
            console.error("Submit failed", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 mb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Event</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        placeholder="e.g. Music Festival 2024"
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
                            placeholder="e.g. Da Nang"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="e.g. 123 Beach Road"
                            value={formData.address}
                            onChange={handleChange}
                        />
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
                                    placeholder="e.g. Early Bird, VIP"
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
                        placeholder="Describe your event..."
                        className="h-32"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                        id="category"
                        name="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="conference">Conference</option>
                        <option value="concert">Concert</option>
                        <option value="festival">Festival</option>
                        <option value="workshop">Workshop</option>
                        <option value="exhibition">Exhibition</option>
                        <option value="sports">Sports</option>
                        <option value="theater">Theater</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                        id="image_url"
                        name="image_url"
                        placeholder="https://..."
                        value={formData.image_url}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                    <Textarea
                        id="inclusions"
                        name="inclusions"
                        placeholder="Entry fee\nDrink"
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
                        placeholder="Parking\nTips"
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
                        placeholder="Age restrictions, dress code..."
                        className="h-24"
                        value={formData.important_info}
                        onChange={handleChange}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
