
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createServiceSupabaseClient } from "@/lib/supabase-server";

async function run() {
    console.log("Simulating voucher validation...");

    const code = "ACT_USD10";
    const serviceType = "activity";
    const cartTotal = 35; // User's scenario

    const supabase = createServiceSupabaseClient();

    // 1. Direct DB Lookup
    console.log(`Checking DB for code: '${code}'`);
    const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code)
        .single();

    if (error) {
        console.error("DB Lookup Error:", error);
    } else {
        console.log("DB Lookup Success:", voucher);
        // Check type manually
        const voucherCategory = (voucher.voucher_type || voucher.category || '').toLowerCase().trim();
        const currentCategory = serviceType.toLowerCase().trim();
        console.log(`Comparing: '${voucherCategory}' vs '${currentCategory}'`);
    }

    // 2. Simulate API Logic (mock)
    // ... copy paste logic if needed, but direct DB check is most important for "Invalid voucher code" error
}

run();
