
"use client"

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from 'next/navigation'

export default function PartnerActivitiesList() {
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchActivities()
    }, [])

    async function fetchActivities() {
        try {
            const res = await fetch('/api/partner/activities')
            if (res.ok) {
                const data = await res.json()
                setActivities(data)
            }
        } catch (error) {
            console.error("Failed to fetch activities", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string, type: string) {
        if (!confirm('Are you sure you want to delete this listing?')) return

        const endpoint = type === 'event' ? `/api/events/${id}` :
            type === 'entertainment' ? `/api/entertainment/${id}` :
                `/api/partner/activities/${id}`

        try {
            const res = await fetch(endpoint, {
                method: 'DELETE'
            })
            if (res.ok) {
                setActivities(prev => prev.filter(a => a.id !== id))
            } else {
                alert('Failed to delete listing')
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    if (loading) return <div>Loading listings...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Listings</h1>
                <div className="flex gap-2">
                    <Link href="/partner/activities/new">
                        <Button className="bg-[#FF5E1F] text-white hover:bg-[#FF5E1F]/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Activity
                        </Button>
                    </Link>
                    <Link href="/partner/events/new">
                        <Button className="bg-purple-600 text-white hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Event
                        </Button>
                    </Link>
                    <Link href="/partner/entertainment/new">
                        <Button className="bg-pink-600 text-white hover:bg-pink-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Entertainment
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <p className="text-lg font-medium">No items found</p>
                                        <p className="text-sm text-slate-400 max-w-sm">Get started by adding your first listing to the platform.</p>
                                        <div className="flex gap-2">
                                            <Link href="/partner/activities/new">
                                                <Button size="sm" className="bg-[#FF5E1F] text-white hover:bg-[#FF5E1F]/90">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Activity
                                                </Button>
                                            </Link>
                                            <Link href="/partner/events/new">
                                                <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Event
                                                </Button>
                                            </Link>
                                            <Link href="/partner/entertainment/new">
                                                <Button size="sm" className="bg-pink-600 text-white hover:bg-pink-700">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Entertainment
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${item.type === 'activity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                item.type === 'event' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                            {item.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>${item.price}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={
                                            item.type === 'event' ? `/partner/events/${item.id}` :
                                                item.type === 'entertainment' ? `/partner/entertainment/${item.id}` :
                                                    `/partner/activities/${item.id}`
                                        }>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.id, item.type)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
