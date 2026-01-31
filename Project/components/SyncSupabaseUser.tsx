"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function SyncSupabaseUser() {
    const { user, isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        const syncUser = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    console.log("[SyncSupabaseUser] Syncing user and claiming guest data...");
                    const response = await fetch("/api/sync-user", {
                        method: "POST",
                    });

                    if (!response.ok) {
                        console.error("[SyncSupabaseUser] Sync failed:", await response.text());
                    } else {
                        const result = await response.json();
                        console.log("[SyncSupabaseUser] Sync successful:", result.message);
                    }
                } catch (error) {
                    console.error("[SyncSupabaseUser] Error during sync:", error);
                }
            }
        };

        syncUser();
    }, [isLoaded, isSignedIn, user]);

    return null;
}
