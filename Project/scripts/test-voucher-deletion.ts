
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { CheckoutService } from "@/lib/checkout/services/checkout.service";

async function run() {
    const supabase = createServiceSupabaseClient();
    const checkoutService = new CheckoutService();

    const userId = "090c54d2-d27c-41c3-ac88-64be637aabd8";
    const voucherCode = "TRANS20";

    console.log("Setting up test environment...");

    // 1. Get Voucher ID
    const { data: voucher } = await supabase
        .from('vouchers')
        .select('id')
        .eq('code', voucherCode)
        .single();

    if (!voucher) {
        console.error("Voucher TRANS20 not found. Please seed it first.");
        process.exit(1);
    }

    // 2. Ensure user has the voucher in wallet (Insert if not exists)
    // First delete any existing to start clean
    await supabase.from('user_vouchers').delete().eq('user_id', userId).eq('voucher_id', voucher.id);

    const { error: insertError } = await supabase.from('user_vouchers').insert({
        user_id: userId,
        voucher_id: voucher.id,
        status: 'AVAILABLE',
        acquired_at: new Date().toISOString()
    });

    if (insertError) {
        console.error("Failed to insert user voucher:", insertError);
        process.exit(1);
    }
    console.log("Inserted test voucher record into wallet.");

    // 3. Execute Booking
    console.log("Executing checkout with voucher...");
    try {
        const payload = {
            serviceType: 'transport',
            userId: userId,
            currency: 'VND', // Code is TRANS20 (20k VND)
            discountAmount: 20000,
            voucherCode: voucherCode,
            items: [{ name: "Test Trip", price: 100000, quantity: 1 }],
            dates: { start: new Date().toISOString() },
            email: "test@example.com",
            metadata: { source: "test-script" }
        };

        // @ts-ignore
        await checkoutService.createBooking(payload);
        console.log("Checkout completed.");

    } catch (error) {
        console.error("Checkout failed:", error);
        process.exit(1);
    }

    // 4. Verify Deletion
    const { data: record, error: checkError } = await supabase
        .from('user_vouchers')
        .select('id')
        .eq('user_id', userId)
        .eq('voucher_id', voucher.id)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking verification:", checkError);
    }

    if (!record) {
        console.log("SUCCESS: Voucher record was deleted from wallet.");
    } else {
        console.error("FAILURE: Voucher record still exists:", record);
        // Cleanup if failed
        await supabase.from('user_vouchers').delete().eq('id', record.id);
    }
}

run();
