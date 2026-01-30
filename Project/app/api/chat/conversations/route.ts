/**
 * API Route: Manage Chat Conversations
 * List and bulk operations on conversations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/chat/conversations - List user's conversations
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get conversations with message count
    const { data: conversations, error } = await supabase
      .from("chat_conversations")
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        metadata
      `,
      )
      .eq("user_id", userData.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id);

        // Get last message
        const { data: lastMessage } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          message_count: count || 0,
          last_message: lastMessage || null,
        };
      }),
    );

    return NextResponse.json({
      conversations: conversationsWithCounts,
      total: conversationsWithCounts.length,
    });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      {
        error: "Failed to list conversations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/chat/conversations/cleanup - Cleanup old conversations
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { days, action } = await req.json();

    if (!days || !action) {
      return NextResponse.json(
        { error: "days and action are required" },
        { status: 400 },
      );
    }

    // Get user from database
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "preview") {
      // Preview what would be deleted
      const { data: conversations, error } = await supabase
        .from("chat_conversations")
        .select("id, title, updated_at")
        .eq("user_id", userData.id)
        .lt(
          "updated_at",
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (error) {
        throw error;
      }

      return NextResponse.json({
        action: "preview",
        conversations_to_delete: conversations?.length || 0,
        conversations: conversations || [],
      });
    } else if (action === "delete") {
      // Actually delete old conversations
      const cutoffDate = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Get count before deletion
      const { data: toDelete } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("user_id", userData.id)
        .lt("updated_at", cutoffDate);

      const deleteCount = toDelete?.length || 0;

      // Delete conversations
      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("user_id", userData.id)
        .lt("updated_at", cutoffDate);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        action: "delete",
        deleted_count: deleteCount,
        message: `Deleted ${deleteCount} conversation(s) older than ${days} days`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "preview" or "delete"' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Cleanup conversations error:", error);
    return NextResponse.json(
      {
        error: "Failed to cleanup conversations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/chat/conversations - Delete all user's conversations
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get count before deletion
    const { count } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.id);

    // Delete all conversations
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("user_id", userData.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      deleted_count: count || 0,
      message: `Deleted all ${count || 0} conversation(s)`,
    });
  } catch (error) {
    console.error("Delete all conversations error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete conversations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
