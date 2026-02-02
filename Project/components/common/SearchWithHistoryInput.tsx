"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Clock, X, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Fuse, { type IFuseOptions } from "fuse.js";

export type SearchCategory =
    | "flight"
    | "flight_origin"
    | "flight_destination"
    | "hotels"
    | "transport"
    | "voucher"
    | "event"
    | "activities"
    | "wellness"
    | "beauty"
    | "entertainment"
    | "shop";

export interface SearchHistoryItem {
    id: string;
    category: string;
    search_params: any;
    created_at: string;
}

interface SearchWithHistoryInputProps<T> {
    data: T[];
    searchKeys: string[];
    fuseOptions?: IFuseOptions<T>;
    placeholder?: string;
    onSelect: (item: T) => void;
    category: SearchCategory;
    className?: string;
    label?: string;
    renderResult?: (item: T) => React.ReactNode;
    getDisplayValue?: (item: T) => string;
    value?: string;
    disabled?: boolean;
    historyType?: string;
    onHistorySelect?: (item: SearchHistoryItem) => void;
    renderHistoryItem?: (item: SearchHistoryItem) => React.ReactNode;
    disableLocalSave?: boolean;
    onChange?: (value: string) => void;
}

export function SearchWithHistoryInput<T extends Record<string, any>>({
    data,
    searchKeys,
    fuseOptions,
    placeholder = "Search...",
    onSelect,
    category,
    className,
    label,
    renderResult,
    getDisplayValue,
    value = "",
    disabled = false,
    historyType,
    onHistorySelect,
    renderHistoryItem,
    disableLocalSave = false,
    onChange,
}: SearchWithHistoryInputProps<T>) {
    const { isSignedIn, user } = useUser();
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    const [searchResults, setSearchResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Fuse.js
    const fuse = useRef<Fuse<T>>(
        new Fuse(data, {
            keys: searchKeys,
            threshold: 0.3,
            includeScore: true,
            ...fuseOptions,
        })
    );

    // Update fuse when data changes
    useEffect(() => {
        fuse.current = new Fuse(data, {
            keys: searchKeys,
            threshold: 0.3,
            includeScore: true,
            ...fuseOptions,
        });
    }, [data, searchKeys, fuseOptions]);

    // Update input value when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Fetch search history
    const fetchHistory = async () => {
        if (!isSignedIn) return;
        setLoading(true);
        try {
            let url = `/api/user/history?category=${category}`;
            if (historyType) {
                url += `&type=${historyType}`;
            }
            const res = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Deduplicate results based on their display value to prevent visual duplicates
                    const uniqueHistoryMap = new Map();
                    data.forEach(item => {
                        const queryValue = item.search_params?.query || JSON.stringify(item.search_params);
                        // Only keep the most recent one (already sorted by created_at in backend)
                        if (!uniqueHistoryMap.has(queryValue)) {
                            uniqueHistoryMap.set(queryValue, item);
                        }
                    });
                    setHistory(Array.from(uniqueHistoryMap.values()));
                } else {
                    setHistory([]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    // Load history on mount
    useEffect(() => {
        if (isSignedIn) fetchHistory();
    }, [isSignedIn, category, historyType]);

    // Handle search
    useEffect(() => {
        if (inputValue.trim()) {
            const results = fuse.current.search(inputValue);
            setSearchResults(results.map((r) => r.item));
        } else {
            setSearchResults([]);
        }
    }, [inputValue]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (item: T) => {
        const displayValue = getDisplayValue ? getDisplayValue(item) : JSON.stringify(item);
        setInputValue(displayValue);
        setIsOpen(false);
        onSelect(item);

        // Save to history (fire & forget)
        if (isSignedIn && user && !disableLocalSave) {
            try {
                await fetch("/api/user/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        category,
                        searchParams: {
                            query: displayValue,
                            type: historyType,
                            ...item
                        },
                    }),
                });
                // Refresh history
                fetchHistory();
            } catch (error) {
                console.error("Failed to save history");
            }
        }
    };

    const handleHistorySelect = (historyItem: SearchHistoryItem) => {
        if (onHistorySelect) {
            onHistorySelect(historyItem);
            setIsOpen(false);
            return;
        }

        const queryValue = historyItem.search_params?.query || JSON.stringify(historyItem.search_params);
        setInputValue(queryValue);
        setIsOpen(false);

        // Try to find matching item in data
        const matchingItem = data.find((item) => {
            const displayValue = getDisplayValue ? getDisplayValue(item) : JSON.stringify(item);
            return displayValue === queryValue;
        });

        if (matchingItem) {
            onSelect(matchingItem);
        }
    };

    const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/user/history/clear?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setHistory((prev) => prev.filter((item) => item.id !== id));
                toast.success("Removed from history");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleClearAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/user/history/clear?category=${category}`, { method: "DELETE" });
            if (res.ok) {
                setHistory([]);
                toast.success("Cleared all history");
            }
        } catch (error) {
            toast.error("Failed to clear history");
        }
    };

    const showHistory = isOpen && history.length > 0 && (!inputValue.trim() || inputValue === value);
    const showResults = isOpen && inputValue.trim() && searchResults.length > 0 && inputValue !== value;
    const showDropdown = showHistory || showResults;

    const defaultRenderResult = (item: T) => {
        if (getDisplayValue) {
            return <span>{getDisplayValue(item)}</span>;
        }
        return <span>{JSON.stringify(item)}</span>;
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="h-full min-h-[4rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2 flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-white/10 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-[#FF5E1F]/20 focus-within:border-[#FF5E1F]/30 group cursor-pointer">
                {label && (
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setInputValue(val);
                            if (onChange) onChange(val);
                        }}
                        onFocus={() => {
                            setIsOpen(true);
                            if (isSignedIn) fetchHistory();
                        }}
                        disabled={disabled}
                        className="bg-transparent border-none outline-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full truncate placeholder:text-slate-400/80 dark:placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={placeholder}
                    />
                    {inputValue && !disabled && (
                        <button
                            onClick={() => {
                                setInputValue("");
                                inputRef.current?.focus();
                            }}
                            className="ml-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
                    {/* Search Results */}
                    {showResults && (
                        <div>
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Search className="w-3 h-3" />
                                    Search Results
                                </span>
                            </div>
                            <div>
                                {searchResults.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelect(item)}
                                        className="group flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors"
                                    >
                                        <div className="flex-1">
                                            {renderResult ? renderResult(item) : defaultRenderResult(item)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search History */}
                    {showHistory && (
                        <div>
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Recent Searches
                                </span>
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear All
                                </button>
                            </div>
                            <div>
                                {(() => {
                                    const seen = new Set();
                                    return history.filter(item => {
                                        const queryValue = item.search_params?.query || JSON.stringify(item.search_params);
                                        if (seen.has(queryValue)) return false;
                                        seen.add(queryValue);
                                        return true;
                                    }).map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleHistorySelect(item)}
                                            className="group flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    {renderHistoryItem ? renderHistoryItem(item) : (
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                                                            {item.search_params?.query || JSON.stringify(item.search_params)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteOne(e, item.id)}
                                                className="p-1.5 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {isOpen && inputValue.trim() && searchResults.length === 0 && (
                        <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No results found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
