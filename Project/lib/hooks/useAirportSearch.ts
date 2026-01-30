/**
 * useAirportSearch Hook
 * Provides fuzzy search functionality for airports using Fuse.js
 */

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { AIRPORTS, Airport } from '@/lib/constants/airports';

export function useAirportSearch() {
    const [searchQuery, setSearchQuery] = useState('');

    // Configure Fuse.js for fuzzy searching
    const fuse = useMemo(() => {
        return new Fuse(AIRPORTS, {
            keys: [
                { name: 'code', weight: 2 },      // IATA code has highest priority
                { name: 'city', weight: 1.5 },    // City name
                { name: 'name', weight: 1 },      // Full airport name
                { name: 'country', weight: 0.5 }, // Country name
            ],
            threshold: 0.3,        // 0 = perfect match, 1 = match anything
            includeScore: true,    // Include relevance score
            minMatchCharLength: 2, // Minimum 2 characters to match
            ignoreLocation: true,  // Don't care about location in string
        });
    }, []);

    // Perform search
    const results = useMemo(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            // Return popular airports when no search query
            return AIRPORTS.slice(0, 10);
        }

        // Fuzzy search
        const fuseResults = fuse.search(searchQuery);
        return fuseResults.map(result => result.item);
    }, [searchQuery, fuse]);

    return {
        searchQuery,
        setSearchQuery,
        results,
        hasQuery: searchQuery.trim().length >= 2,
    };
}
