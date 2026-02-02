import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const category = searchParams.get('category');

        const supabase = createServiceSupabaseClient();
        let query = supabase.from("user_search_history").delete().eq("external_user_ref", user.id);

        if (id) {
            // Delete specific item
            query = query.eq("id", id);
        } else if (category) {
            // Delete all items in category
            query = query.eq("category", category);
        }
        // If neither id nor category, delete all user's history

        const { error } = await query;

        if (error) {
            console.error("Delete history error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
