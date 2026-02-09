"use client"

import { useEffect, useState } from 'react'
import { usePartnerStore } from '@/store/usePartnerStore'
import {
    Users,
    UserPlus,
    Loader2,
    Shield,
    MoreVertical,
    Trash2,
    Mail,
    Crown,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { EmptyState } from '../shared/EmptyState'
import type { PartnerMember, PartnerMemberPermissions, PartnerMemberRole } from '@/lib/shop/types'

interface TeamMemberWithUser extends PartnerMember {
    user_email?: string
    user_name?: string
}

export function TeamManagement() {
    const { partner } = usePartnerStore()
    const [members, setMembers] = useState<TeamMemberWithUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isInviting, setIsInviting] = useState(false)
    const [showInviteForm, setShowInviteForm] = useState(false)
    const [actionMenuId, setActionMenuId] = useState<string | null>(null)

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<PartnerMemberRole>('staff')
    const [invitePermissions, setInvitePermissions] = useState<PartnerMemberPermissions>({
        products: true,
        orders: true,
        analytics: false,
    })

    useEffect(() => {
        fetchTeam()
    }, [])

    const fetchTeam = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/shop/partners/team')
            if (res.ok) {
                const { data } = await res.json()
                setMembers(data || [])
            } else {
                toast.error('Failed to load team members')
            }
        } catch {
            toast.error('Connection error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error('Email is required')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
            toast.error('Invalid email address')
            return
        }

        setIsInviting(true)
        try {
            const res = await fetch('/api/shop/partners/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    permissions: invitePermissions,
                }),
            })

            if (res.ok) {
                toast.success('Team member invited')
                setInviteEmail('')
                setInviteRole('staff')
                setInvitePermissions({ products: true, orders: true, analytics: false })
                setShowInviteForm(false)
                await fetchTeam()
            } else {
                const body = await res.json().catch(() => null)
                toast.error(body?.error?.message || 'Failed to invite team member')
            }
        } catch {
            toast.error('Connection error')
        } finally {
            setIsInviting(false)
        }
    }

    const handleUpdateMember = async (memberId: string, data: { role?: string; permissions?: PartnerMemberPermissions }) => {
        try {
            const res = await fetch(`/api/shop/partners/team/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                toast.success('Team member updated')
                await fetchTeam()
            } else {
                const body = await res.json().catch(() => null)
                toast.error(body?.error?.message || 'Failed to update team member')
            }
        } catch {
            toast.error('Connection error')
        }
        setActionMenuId(null)
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return

        try {
            const res = await fetch(`/api/shop/partners/team/${memberId}`, {
                method: 'DELETE',
            })

            if (res.ok || res.status === 204) {
                toast.success('Team member removed')
                setMembers(prev => prev.filter(m => m.id !== memberId))
            } else {
                const body = await res.json().catch(() => null)
                toast.error(body?.error?.message || 'Failed to remove team member')
            }
        } catch {
            toast.error('Connection error')
        }
        setActionMenuId(null)
    }

    const statusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                )
            case 'removed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> Removed
                    </span>
                )
            default:
                return null
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your team members and their permissions
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-orange-500/20"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* Invite Form */}
            {showInviteForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
                >
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Invite Team Member
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Role
                            </label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as PartnerMemberRole)}
                                className={inputClasses}
                            >
                                <option value="staff">Staff</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Permissions
                            </label>
                            <div className="space-y-2">
                                {(['products', 'orders', 'analytics'] as const).map((perm) => (
                                    <label key={perm} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={invitePermissions[perm]}
                                            onChange={(e) => setInvitePermissions(prev => ({
                                                ...prev,
                                                [perm]: e.target.checked,
                                            }))}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{perm}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setShowInviteForm(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={isInviting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {isInviting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4" />
                                )}
                                {isInviting ? 'Sending...' : 'Send Invite'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Team Members List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : members.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No team members yet"
                    description="Invite team members to help manage your store, products, and orders."
                    action={{
                        label: 'Invite Member',
                        onClick: () => setShowInviteForm(true),
                    }}
                />
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Members ({members.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {members.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    {member.role === 'owner' ? (
                                        <Crown className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Shield className="w-5 h-5 text-primary" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {member.user_name || member.user_email || `User ${member.user_id.slice(0, 8)}...`}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
                                            {member.role}
                                        </span>
                                        {statusBadge(member.status)}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                        {member.user_email && <span>{member.user_email}</span>}
                                        {!member.user_email && (
                                            <span>Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        )}
                                    </div>
                                    {/* Permissions */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        {member.role === 'owner' ? (
                                            <span className="text-xs text-slate-400">Full access</span>
                                        ) : (
                                            Object.entries(member.permissions || {}).map(([key, val]) => (
                                                val && (
                                                    <span
                                                        key={key}
                                                        className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium capitalize"
                                                    >
                                                        {key}
                                                    </span>
                                                )
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Actions (only for non-owner members when current user is owner) */}
                                {member.role !== 'owner' && partner?.role === 'owner' && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setActionMenuId(actionMenuId === member.id ? null : member.id)}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                        </button>

                                        {actionMenuId === member.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-20 py-1">
                                                    {/* Toggle permissions */}
                                                    {(['products', 'orders', 'analytics'] as const).map((perm) => (
                                                        <button
                                                            key={perm}
                                                            onClick={() => handleUpdateMember(member.id, {
                                                                permissions: {
                                                                    ...member.permissions,
                                                                    [perm]: !member.permissions?.[perm],
                                                                },
                                                            })}
                                                            className="flex items-center justify-between w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                        >
                                                            <span className="capitalize">{perm}</span>
                                                            <span className={`text-xs font-medium ${member.permissions?.[perm] ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                {member.permissions?.[perm] ? 'ON' : 'OFF'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
