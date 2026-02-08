
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

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this activity?')) return

        try {
            const res = await fetch(`/api/partner/activities/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setActivities(prev => prev.filter(a => a.id !== id))
            } else {
                alert('Failed to delete activity')
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    if (loading) return <div>Loading activities...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Activities</h1>
                <Link href="/partner/activities/new">
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Activity
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <p className="text-lg font-medium">No activities found</p>
                                        <p className="text-sm text-slate-400 max-w-sm">Get started by adding your first activity listing to the platform.</p>
                                        <Link href="/partner/activities/new">
                                            <Button className="bg-[#FF5E1F] text-white hover:bg-[#FF5E1F]/90 mt-2">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Activity
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium">{activity.title}</TableCell>
                                    <TableCell>{activity.location}</TableCell>
                                    <TableCell>${activity.price}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/partner/activities/${activity.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(activity.id)}
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
