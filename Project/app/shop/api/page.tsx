'use client';

import { useState, useEffect } from 'react';

interface EndpointCheck {
    method: string;
    path: string;
    description: string;
    ok: boolean;
    code: number;
    latencyMs: number;
    message?: string;
    category?: string;
    details?: any;
}

interface MonitorData {
    overall: 'OK' | 'DEGRADED' | 'DOWN';
    lastCheckAt: string;
    summary: {
        okCount: number;
        failCount: number;
        avgLatencyMs: number;
        byCategory: Record<string, { ok: number; fail: number }>;
    };
    items: EndpointCheck[];
}

export default function ShopAPIMonitorPage() {
    const [data, setData] = useState<MonitorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const fetchStatus = async () => {
        try {
            setError(null);
            const res = await fetch('/api/internal/monitor/shop');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OK':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'DEGRADED':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'DOWN':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const exportResults = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shop-api-monitor-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Running 31 comprehensive tests...</div>
                </div>
            </div>
        );
    }

    const filteredItems = data?.items.filter(item => {
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterStatus === 'pass' && !item.ok) return false;
        if (filterStatus === 'fail' && item.ok) return false;
        return true;
    }) || [];

    const categories = data ? ['all', ...Object.keys(data.summary.byCategory).sort()] : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="text-4xl">🏪</span>
                        Shop API Health Monitor
                    </h1>
                    <p className="text-gray-600 mt-2">Real-time comprehensive testing with 31 endpoint checks</p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchStatus}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Now
                            </button>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Auto-refresh (10s)</span>
                            </label>

                            <button
                                onClick={exportResults}
                                disabled={!data}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                📥 Export JSON
                            </button>
                        </div>

                        {data && (
                            <div className="text-sm text-gray-600">
                                Last check: {new Date(data.lastCheckAt).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-800 font-medium">Monitor Error: {error}</span>
                        </div>
                    </div>
                )}

                {data && (
                    <>
                        {/* Overall Status */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className={`rounded-lg border-2 p-6 ${getStatusColor(data.overall)}`}>
                                <div className="text-sm font-medium mb-1">Overall Status</div>
                                <div className="text-3xl font-bold">{data.overall}</div>
                                <div className="text-xs mt-2">31 total tests</div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="text-sm text-gray-600 mb-1">✅ Passed</div>
                                <div className="text-3xl font-bold text-green-600">{data.summary.okCount}</div>
                                <div className="text-xs text-gray-500 mt-2">{Math.round((data.summary.okCount / data.items.length) * 100)}% success</div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="text-sm text-gray-600 mb-1">❌ Failed</div>
                                <div className="text-3xl font-bold text-red-600">{data.summary.failCount}</div>
                                <div className="text-xs text-gray-500 mt-2">{data.summary.failCount === 0 ? 'All passing!' : 'Needs attention'}</div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="text-sm text-gray-600 mb-1">⚡ Avg Latency</div>
                                <div className="text-3xl font-bold text-blue-600">{data.summary.avgLatencyMs}ms</div>
                                <div className="text-xs text-gray-500 mt-2">
                                    {data.summary.avgLatencyMs < 100 ? 'Excellent' : data.summary.avgLatencyMs < 500 ? 'Good' : 'Slow'}
                                </div>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Tests by Category</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {Object.entries(data.summary.byCategory).map(([cat, stats]) => (
                                    <div
                                        key={cat}
                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${filterCategory === cat ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                                    >
                                        <div className="text-xs text-gray-600 mb-1">{cat}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-green-600">{stats.ok}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-lg font-bold text-red-600">{stats.fail}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Filters:</span>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pass">✅ Pass Only</option>
                                <option value="fail">❌ Fail Only</option>
                            </select>

                            <span className="text-sm text-gray-600">
                                Showing {filteredItems.length} of {data.items.length} tests
                            </span>
                        </div>

                        {/* Endpoints Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map((item, idx) => (
                                        <tr key={idx} className={item.ok ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{item.category}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-mono font-semibold rounded ${item.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                                                        item.method === 'POST' ? 'bg-green-100 text-green-800' :
                                                            item.method === 'PATCH' ? 'bg-yellow-100 text-yellow-800' :
                                                                item.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-900 max-w-xs truncate" title={item.path}>
                                                {item.path}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {item.ok ? (
                                                    <span className="flex items-center gap-1 text-green-700">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm font-semibold">{item.code}</span>
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <span className="flex items-center gap-1 text-red-700">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">{item.code || 'ERR'}</span>
                                                        </span>
                                                        {item.message && (
                                                            <div className="text-xs text-red-600 mt-1">{item.message}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`text-sm font-mono ${item.latencyMs < 100 ? 'text-green-600' :
                                                        item.latencyMs < 500 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {item.latencyMs}ms
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Failed Tests Detail */}
                        {data.summary.failCount > 0 && (
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-red-900 mb-4">
                                    ⚠️ Failed Tests ({data.summary.failCount})
                                </h2>
                                <div className="space-y-2">
                                    {data.items.filter(item => !item.ok).map((item, idx) => (
                                        <div key={idx} className="bg-white border border-red-200 rounded p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <span className="font-mono text-sm text-red-800 font-semibold">
                                                        {item.method} {item.path}
                                                    </span>
                                                    <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                                                    {item.message && (
                                                        <div className="text-sm text-red-600 mt-2 font-medium">
                                                            ❌ {item.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-4">{item.latencyMs}ms</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
