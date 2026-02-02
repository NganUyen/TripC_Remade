import Fuse from 'fuse.js';
import { createServiceSupabaseClient } from '../supabase-server';
import { EventWithSessions, EventSearchParams } from './types';

// Lightweight type for search index matches EventWithSessions structure
// but we prioritize fields needed for search and filtering
interface EventIndexItem extends EventWithSessions {
    // We add derived fields if needed for simpler filtering
}

// Cache configuration
let searchIndexCache: EventIndexItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let cachePromise: Promise<EventIndexItem[]> | null = null;

/**
 * Invalidate the search cache
 */
export function invalidateEventSearchCache(): void {
    searchIndexCache = null;
    lastCacheTime = 0;
    cachePromise = null;
}

/**
 * Get or build the search index
 */
async function getSearchIndex(): Promise<EventIndexItem[]> {
    const now = Date.now();

    if (searchIndexCache && (now - lastCacheTime < CACHE_TTL)) {
        return searchIndexCache;
    }

    if (cachePromise) {
        return cachePromise;
    }

    cachePromise = buildSearchIndex();

    try {
        const index = await cachePromise;
        searchIndexCache = index;
        lastCacheTime = Date.now();
        return index;
    } finally {
        cachePromise = null;
    }
}

async function buildSearchIndex(): Promise<EventIndexItem[]> {
    const supabase = createServiceSupabaseClient();

    // Fetch all active events with sessions and ticket types
    // Since we only have a few dozen events, fetching all is fine.
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            sessions:event_sessions(
                *,
                ticket_types:event_ticket_types(*)
            )
        `)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching event search index:', error);
        return [];
    }

    return (data || []) as EventIndexItem[];
}

/**
 * Search events using Fuse.js for fuzzy matching and in-memory filtering
 */
export async function searchEventsFuzzy(params: EventSearchParams) {
    const allEvents = await getSearchIndex();
    let results = allEvents;

    // 1. Fuzzy Search
    if (params.search && params.search.length >= 1) {
        const fuse = new Fuse(allEvents, {
            keys: [
                { name: 'title', weight: 2 },
                { name: 'description', weight: 0.5 },
                { name: 'venue_name', weight: 1 },
                { name: 'city', weight: 0.8 },
                { name: 'category', weight: 0.8 }
            ],
            threshold: 0.3,
            includeScore: true,
            ignoreLocation: true
        });

        const fuseResults = fuse.search(params.search);
        results = fuseResults.map(r => r.item);
    }

    // 2. Exact Filters
    if (params.city) {
        results = results.filter(e => e.city?.toLowerCase() === params.city?.toLowerCase());
    }

    if (params.category) {
        results = results.filter(e => e.category === params.category);
    }

    if (params.is_featured !== undefined) {
        results = results.filter(e => e.is_featured === params.is_featured);
    }

    // Date filtering (checks if ANY session overlaps AND filters inner sessions)
    if (params.date_from || params.date_to) {
        // Map events to filter their sessions, then filter out events with no remaining sessions
        results = results.map(event => {
            const filteredSessions = event.sessions.filter(session => {
                const sessionDate = new Date(session.session_date);
                if (params.date_from && sessionDate < new Date(params.date_from)) return false;
                if (params.date_to && sessionDate > new Date(params.date_to)) return false;
                return true;
            });

            return {
                ...event,
                sessions: filteredSessions
            };
        }).filter(event => event.sessions.length > 0);
    }

    // 3. Sorting
    if (params.sort_by) {
        // If searching text, keep relevance unless explicit sort is weird
        // But usually user wants relevance if they searched.
        const isRelevance = !params.sort_by;

        if (!isRelevance || !params.search) {
            results = [...results].sort((a, b) => {
                switch (params.sort_by) {
                    case 'date': // closest session date?
                        const dateA = a.created_at;
                        const dateB = b.created_at;
                        return params.sort_order === 'asc'
                            ? new Date(dateA).getTime() - new Date(dateB).getTime()
                            : new Date(dateB).getTime() - new Date(dateA).getTime();
                    case 'created_at':
                        return params.sort_order === 'asc'
                            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    default:
                        return 0;
                }
            });
        }
    }

    // 4. Pagination
    const total = results.length;
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const paginatedItems = results.slice(offset, offset + limit);

    return {
        events: paginatedItems,
        total,
        limit,
        offset
    };
}
