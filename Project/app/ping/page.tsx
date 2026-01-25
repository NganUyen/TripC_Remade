"use client"

import React, { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface HealthData {
    service: string
    timestamp: string
    status: string
    message?: string
    checks: {
        database: {
            status: string
            tables?: Record<string, boolean>
        }
        api: {
            status: string
            uptime_ms: number
        }
    }
}

function EndpointRow({ method, url, desc }: { method: string, url: string, desc: string }) {
    const [status, setStatus] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Skip POST requests for safety/complexity in simple health check
        if (method !== 'GET') {
            setLoading(false)
            return
        }

        fetch(url)
            .then(res => setStatus(res.status))
            .catch(() => setStatus(0))
            .finally(() => setLoading(false))
    }, [url, method])

    return (
        <tr>
            <td className={`px-6 py-4 font-mono font-bold ${method === 'GET' ? 'text-green-600' :
                method === 'POST' ? 'text-blue-600' : 'text-slate-600'
                }`}>{method}</td>
            <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{url}</td>
            <td className="px-6 py-4 text-slate-500">{desc}</td>
            <td className="px-6 py-4 text-right">
                {loading ? (
                    <span className="text-xs text-slate-400">checking...</span>
                ) : method !== 'GET' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Auth Req</span>
                ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status === 200 ? 'bg-green-100 text-green-700' :
                        status === 503 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {status ? `${status} ${status === 200 ? 'OK' : ''}` : 'ERR'}
                    </span>
                )}
            </td>
        </tr>
    )
}

export default function HealthMonitor() {
    const [data, setData] = useState<HealthData | null>(null)
    const [loading, setLoading] = useState(false)
    const [lastCheck, setLastCheck] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    const checkHealth = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ping')
            if (!res.ok) {
                // Try to parse error if JSON, else generic
                try {
                    const errData = await res.json()
                    setData(errData) // API might return 503 but still have structure
                } catch {
                    throw new Error(`HTTP Error ${res.status}`)
                }
            } else {
                const newData = await res.json()
                setData(newData)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setData(null)
        } finally {
            setLoading(false)
            setLastCheck(new Date().toLocaleTimeString())
        }
    }

    useEffect(() => {
        checkHealth()
        const interval = setInterval(checkHealth, 30000) // Auto refresh every 30s
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-mono">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">TripC Service Health Monitor</h1>
                    <p className="text-slate-500 text-sm">Internal System Dashboard</p>
                </header>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={checkHealth}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Status
                            </button>
                            <span className="text-xs text-slate-500">Last checked: {lastCheck || 'Never'}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data?.status === 'OK' ? 'bg-green-100 text-green-700' :
                            data?.status === 'DEGRADED' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {data?.status || 'UNKNOWN'}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md border border-red-200 text-sm flex items-center gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p><strong>System Error:</strong> {error}. Check server logs/connectivity.</p>
                        </div>
                    )}

                    {!error && data && (
                        <div className="space-y-4">
                            {/* API Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="font-bold text-slate-700 dark:text-slate-200">API Server</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-500">Uptime: {Math.floor(data.checks.api.uptime_ms / 1000)}s</span>
                                    <span className="text-green-600 font-bold text-sm">OK</span>
                                </div>
                            </div>

                            {/* Database Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${data.checks.database.status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Database (Supabase)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold text-sm ${data.checks.database.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                                        {data.checks.database.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Endpoint Checklist Mock (Static for now as per image style) */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide">Available Endpoints</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/20 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Method</th>
                                <th className="px-6 py-3 font-medium">Endpoint</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            <EndpointRow method="GET" url="/api/ping" desc="System Health Check" />
                            <EndpointRow method="GET" url="/api/v1/user/status" desc="User Rewards Profile" />
                            <EndpointRow method="GET" url="/api/v1/quests/available" desc="Available Quests List" />
                            <EndpointRow method="POST" url="/api/v1/quests/submit" desc="Quest Submission (Needs Auth)" />
                            <EndpointRow method="GET" url="/api/v1/vouchers/marketplace" desc="Voucher Marketplace" />
                            <EndpointRow method="POST" url="/api/v1/vouchers/exchange" desc="Redeem Voucher (Needs Auth)" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
