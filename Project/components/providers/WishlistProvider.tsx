"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSupabaseClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export interface WishlistItem {
    id: string;
    external_user_ref: string;
    user_uuid: string;
    item_type: string;
    item_id: string;
    title: string;
    image_url: string | null;
    price: number | null;
    created_at: string;
}

export type NewWishlistItem = Omit<WishlistItem, "id" | "external_user_ref" | "user_uuid" | "created_at">;

interface WishlistContextType {
    wishlist: WishlistItem[];
    isLoading: boolean;
    isInWishlist: (itemId: string) => boolean;
    addToWishlist: (item: NewWishlistItem) => Promise<any>;
    removeFromWishlist: (itemId: string) => Promise<void>;
    toggleWishlist: (item: NewWishlistItem) => Promise<boolean>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Simple global cache outside of component to persist across re-mounts if needed
let globalWishlistCache: WishlistItem[] | null = null;

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { supabaseUser, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();
    const supabase = useSupabaseClient();
    const [wishlist, setWishlist] = useState<WishlistItem[]>(globalWishlistCache || []);
    const [isLoading, setIsLoading] = useState(!globalWishlistCache);

    const loadWishlist = useCallback(async () => {
        if (!isAuthenticated && !isUserLoading) {
            setWishlist([]);
            setIsLoading(false);
            return;
        }

        if (isUserLoading && !globalWishlistCache) return;

        try {
            const { data, error } = await supabase
                .from("wishlist")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            const items = data || [];
            setWishlist(items);
            globalWishlistCache = items;
        } catch (err) {
            console.error("Error loading wishlist:", err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, isAuthenticated, isUserLoading]);

    // Initial load and subscription
    useEffect(() => {
        loadWishlist();

        const channel = supabase
            .channel("wishlist_global_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "wishlist",
                },
                () => {
                    loadWishlist();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [loadWishlist, supabase]);

    const isInWishlist = useCallback((itemId: string) => {
        return wishlist.some((item) => item.item_id === itemId);
    }, [wishlist]);

    const addToWishlist = useCallback(async (item: NewWishlistItem) => {
        if (!isAuthenticated || !supabaseUser) throw new Error("Must be authenticated");

        // Optimistic Update
        const optimisticItem: WishlistItem = {
            ...item,
            id: `temp-${Math.random().toString()}`,
            external_user_ref: supabaseUser.clerk_id,
            user_uuid: supabaseUser.id,
            created_at: new Date().toISOString(),
        };

        setWishlist(prev => [optimisticItem, ...prev]);

        try {
            const { data, error } = await supabase
                .from("wishlist")
                .insert({
                    ...item,
                    external_user_ref: supabaseUser.clerk_id,
                    user_uuid: supabaseUser.id,
                })
                .select()
                .single();

            if (error) {
                // Rollback
                setWishlist(prev => prev.filter(i => i.item_id !== item.item_id));
                throw error;
            }

            // Update with real data from server
            setWishlist(prev => prev.map(i => i.item_id === item.item_id ? data : i));
            globalWishlistCache = null; // Invalidate cache to force fetch if needed
            return data;
        } catch (err) {
            console.error("Error adding to wishlist:", err);
            throw err;
        }
    }, [isAuthenticated, supabaseUser, supabase]);

    const removeFromWishlist = useCallback(async (itemId: string) => {
        const removedItem = wishlist.find(i => i.item_id === itemId);
        setWishlist(prev => prev.filter((item) => item.item_id !== itemId));

        try {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("item_id", itemId);

            if (error) {
                if (removedItem) setWishlist(prev => [removedItem, ...prev]);
                throw error;
            }
            globalWishlistCache = null;
        } catch (err) {
            console.error("Error removing from wishlist:", err);
            throw err;
        }
    }, [supabase, wishlist]);

    const toggleWishlist = useCallback(async (item: NewWishlistItem) => {
        if (isInWishlist(item.item_id)) {
            await removeFromWishlist(item.item_id);
            return false;
        } else {
            await addToWishlist(item);
            return true;
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    const value = {
        wishlist,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist: loadWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlistContext must be used within a WishlistProvider");
    }
    return context;
}
