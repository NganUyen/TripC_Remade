import { auth } from "@clerk/nextjs/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";

/**
 * Fetches the IDs of items in the current user's wishlist on the server.
 * This helps avoid hydration flickers by providing initial wishlist state.
 */
export async function getServerWishlistIds() {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        const { data, error } = await supabaseServerClient
            .from("wishlist")
            .select("item_id")
            .eq("external_user_ref", userId);

        if (error) {
            console.error("Error fetching wishlist IDs on server:", error);
            return [];
        }

        return data?.map((item: { item_id: string }) => item.item_id) || [];
    } catch (error) {
        console.error("Unexpected error fetching wishlist IDs on server:", error);
        return [];
    }
}
