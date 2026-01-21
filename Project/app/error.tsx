"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Something went wrong!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                We encountered an error while loading this page. Please try again.
            </p>
            <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go Home
                </Button>
                <Button onClick={() => reset()}>Try again</Button>
            </div>
        </div>
    );
}
