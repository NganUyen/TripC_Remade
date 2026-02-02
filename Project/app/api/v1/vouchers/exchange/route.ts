import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: "Voucher Exchange API",
    status: "ok",
    methods: ["POST"],
    description: "Redeem vouchers using Tcent balance",
  });
}

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body safely
    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { voucherId } = body;

    if (!voucherId) {
      return NextResponse.json({ error: "Missing voucherId" }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();

    // 2. Fetch User Profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, tcent_balance")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // 3. Fetch Voucher Details
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", voucherId)
      .single();

    if (voucherError || !voucher) {
      if (voucherError?.code === "PGRST205") {
        return NextResponse.json(
          { error: "Redemption unavailable (System update needed)" },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    // 4. Validation Checks

    // Check if user has already redeemed this voucher
    console.log('[EXCHANGE API] Checking for existing redemption:', {
      user_id: user.id,
      voucher_id: voucherId
    })

    const { data: existingRedemption, error: redemptionCheckError } = await supabase
      .from('user_vouchers')
      .select('id')
      .eq('user_id', user.id)
      .eq('voucher_id', voucherId)
      .maybeSingle()

    console.log('[EXCHANGE API] Redemption check result:', {
      existingRedemption,
      error: redemptionCheckError
    })

    if (existingRedemption) {
      console.log('[EXCHANGE API] BLOCKED: User has already redeemed this voucher')
      return NextResponse.json(
        { error: "You have already redeemed this voucher" },
        { status: 400 },
      );
    }

    console.log('[EXCHANGE API] Validation passed - proceeding with redemption')

    if (!voucher.is_purchasable || !voucher.is_active) {
      return NextResponse.json(
        { error: "This voucher is not available for purchase" },
        { status: 400 },
      );
    }

    if (user.tcent_balance < voucher.tcent_price) {
      return NextResponse.json(
        { error: "Insufficient Tcent balance" },
        { status: 400 },
      );
    }

    if (
      voucher.total_usage_limit &&
      voucher.current_usage_count >= voucher.total_usage_limit
    ) {
      return NextResponse.json(
        { error: "Voucher is out of stock" },
        { status: 400 },
      );
    }

    // 5. Execute Transaction (Sequential Updates)

    // A. Deduct Points
    // We do this first to prevent double-spending if concurrent (though simple update isn't fully race-condition proof without DB locking/functions)
    // Ideally: UPDATE users SET tcent_balance = tcent_balance - X WHERE id = Y AND tcent_balance >= X
    const { error: deductError } = await supabase.rpc("decrement_balance", {
      row_id: user.id,
      amount: voucher.tcent_price,
    });

    // Fallback since we didn't define that RPC yet, we do raw update
    // WARNING: Race condition possible in this basic implementation
    const { error: updateError } = await supabase
      .from("users")
      .update({ tcent_balance: user.tcent_balance - voucher.tcent_price })
      .eq("id", user.id)
      .eq("tcent_balance", user.tcent_balance); // Optimistic Locking attempt

    if (updateError) {
      return NextResponse.json(
        {
          error:
            "Transaction failed during balance deduction. Please try again.",
        },
        { status: 409 },
      );
    }

    // B. Issue Voucher
    const { error: issueError } = await supabase.from("user_vouchers").insert([
      {
        user_id: user.id,
        voucher_id: voucher.id,
        status: "AVAILABLE",
        acquired_at: new Date().toISOString(),
      },
    ]);

    if (issueError) {
      console.error("Failed to issue voucher:", issueError);
      return NextResponse.json(
        {
          error: "Balance deducted but voucher issue failed. Contact support.",
        },
        { status: 500 },
      );
    }

    // C. Record Ledger
    await supabase.from("tcent_ledger").insert([
      {
        user_id: user.id,
        amount: -voucher.tcent_price,
        transaction_type: "SPEND",
        status: "COMPLETED",
        description: `Redeemed: ${voucher.code || "Voucher"}`,
        reference_type: "voucher_exchange",
        reference_id: voucher.id,
      },
    ]);

    // D. Update Stock
    await supabase
      .from("vouchers")
      .update({ current_usage_count: (voucher.current_usage_count || 0) + 1 })
      .eq("id", voucher.id);

    return NextResponse.json({
      success: true,
      newBalance: user.tcent_balance - voucher.tcent_price,
    });
  } catch (err) {
    console.error("Internal error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
