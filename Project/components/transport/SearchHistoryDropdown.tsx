"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Clock, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SearchHistoryItem {
    id: string;
    category: string;
    search_params: {
        query?: string;
        origin?: string;
        destination?: string;
        date?: string;
        time?: string;
        serviceType?: string;
        passengers?: number;
        luggage?: number;
        duration?: string;
        timestamp?: string;
    };
    created_at: string;
}

interface SearchHistoryDropdownProps {
    onSelect: (origin: string, destination: string) => void;
    className?: string;
}

export function SearchHistoryDropdown({ onSelect, className }: SearchHistoryDropdownProps) {
    const { isSignedIn } = useUser();
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        if (!isSignedIn) return;
        setLoading(true);
        try {
            const res = await fetch("/api/user/history?category=transport");
            if (res.ok) {
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        if (isSignedIn) fetchHistory();
    }, [isSignedIn]);

    const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/user/history/clear?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setHistory((prev) => prev.filter((item) => item.id !== id));
                toast.success("Đã xóa khỏi lịch sử");
            }
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const handleClearAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/user/history/clear`, { method: "DELETE" });
            if (res.ok) {
                setHistory([]);
                toast.success("Đã xóa toàn bộ lịch sử");
            }
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    if (!isSignedIn || history.length === 0) return null;

    return (
        <div className={cn("absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200", className)}>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lịch sử tìm kiếm</span>
                <button
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Xóa tất cả
                </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {history.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.search_params?.origin || '', item.search_params?.destination || '')}
                        className="group flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                                    {item.search_params?.query || `${item.search_params?.origin || ''} → ${item.search_params?.destination || ''}`}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => handleDeleteOne(e, item.id)}
                            className="p-1.5 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
