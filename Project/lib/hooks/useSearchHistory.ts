/**
 * useSearchHistory Hook
 * Reusable hook for managing search history across ALL categories
 * Categories: flight, hotel, vouchers, events, dining, activities, wellness, beauty, entertainment, shop, transport
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/nextjs';

export type SearchCategory = 'flight' | 'hotel' | 'vouchers' | 'events' | 'dining' | 'activities' | 'wellness' | 'beauty' | 'entertainment' | 'shop' | 'transport';

export interface SearchHistoryItem {
    id: string;
    user_id: string;
    category: SearchCategory;
    search_params: any; // JSONB - category-specific params
    created_at: string;
}

interface UseSearchHistoryOptions {
    category: SearchCategory;
    limit?: number;
}

export function useSearchHistory({ category, limit = 10 }: UseSearchHistoryOptions) {
    const { userId } = useAuth();
    const supabaseClient = useSupabaseClient();
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch search history from database
    const fetchHistory = useCallback(async () => {
        if (!userId) {
            setHistory([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabaseClient
                .from('user_search_history')
                .select('*')
                .eq('user_id', userId)
                .eq('category', category)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (fetchError) throw fetchError;

            setHistory(data || []);
        } catch (err) {
            console.error('Error fetching search history:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch history');
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId, category, limit]);

    // Add new search to history
    const addSearchHistory = useCallback(async (searchParams: any) => {
        if (!userId) return;

        try {
            const { error: insertError } = await supabaseClient
                .from('user_search_history')
                .insert({
                    user_id: userId,
                    category,
                    search_params: searchParams,
                });

            if (insertError) throw insertError;

            // Refresh history after adding
            await fetchHistory();
        } catch (err) {
            console.error('Error adding search history:', err);
            setError(err instanceof Error ? err.message : 'Failed to add history');
        }
    }, [userId, category, fetchHistory]);

    // Remove single history item
    const removeSearchHistory = useCallback(async (id: string) => {
        if (!userId) return;

        try {
            const { error: deleteError } = await supabaseClient
                .from('user_search_history')
                .delete()
                .eq('id', id)
                .eq('user_id', userId); // Ensure user owns this record

            if (deleteError) throw deleteError;

            // Update local state immediately
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error removing search history:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove history');
        }
    }, [userId]);

    // Clear all history for this category
    const clearAllHistory = useCallback(async () => {
        if (!userId) return;

        try {
            const { error: deleteError } = await supabaseClient
                .from('user_search_history')
                .delete()
                .eq('user_id', userId)
                .eq('category', category);

            if (deleteError) throw deleteError;

            // Clear local state
            setHistory([]);
        } catch (err) {
            console.error('Error clearing search history:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear history');
        }
    }, [userId, category]);

    // Auto-fetch on mount and when userId/category changes
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        isLoading,
        error,
        addSearchHistory,
        removeSearchHistory,
        clearAllHistory,
        refreshHistory: fetchHistory,
    };
}
