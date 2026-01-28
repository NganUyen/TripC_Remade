/**
 * PayPal Transaction Verification Script
 * Usage: npx tsx scripts/verify-paypal.ts <ORDER_ID>
 * 
 * This script connects directly to PayPal's API to fetch the status of an order.
 * It proves that the transaction was actually captured on PayPal's side.
 */

import { config } from 'dotenv';
config(); // Load .env

async function getAccessToken(clientId: string, clientSecret: string, baseUrl: string) {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error(`Failed to get Access Token: ${await response.text()}`);
    }
    const data = await response.json();
    return data.access_token;
}

async function verifyOrder(orderId: string) {
    console.log(`\n🔍 Verifying PayPal Order: ${orderId}...\n`);

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret) {
        console.error('❌ Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET in .env');
        process.exit(1);
    }

    try {
        console.log('1️⃣  Authenticating with PayPal...');
        const accessToken = await getAccessToken(clientId, clientSecret, baseUrl);
        console.log('✅  Authenticated.');

        console.log(`2️⃣  Fetching Order Details from ${baseUrl}...`);
        const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌  Failed to fetch order:', data);
            return;
        }

        console.log('\n----------------------------------------');
        console.log('📄  ORDER DETAILS from PayPal Server');
        console.log('----------------------------------------');
        console.log(`🆔  ID:             ${data.id}`);
        console.log(`📊  Status:         ${data.status} ${data.status === 'COMPLETED' ? '✅' : '⚠️'}`);
        console.log(`Intent:             ${data.intent}`);
        console.log(`📅  Create Time:    ${data.create_time}`);
        console.log(`🔄  Update Time:    ${data.update_time}`);

        if (data.purchase_units && data.purchase_units.length > 0) {
            const unit = data.purchase_units[0];
            console.log(`💰  Amount:         ${unit.amount.value} ${unit.amount.currency_code}`);
            console.log(`📝  Reference ID:   ${unit.reference_id} (Booking ID)`);

            if (unit.payments?.captures) {
                console.log('\n--- Captures ---');
                unit.payments.captures.forEach((cap: any) => {
                    console.log(`   🔸 Capture ID: ${cap.id} | Status: ${cap.status} | Time: ${cap.create_time}`);
                });
            }
        }
        console.log('----------------------------------------\n');

        if (data.status === 'COMPLETED') {
            console.log('✅  CONCLUSION: This transaction is GENUINE and fully PAID on PayPal.');
        } else {
            console.log('⚠️  CONCLUSION: This transaction exists but is NOT completed (or PENDING).');
        }

    } catch (error) {
        console.error('❌  Verification Failed:', error);
    }
}

const orderId = process.argv[2];
if (!orderId) {
    console.log('Usage: npx tsx scripts/verify-paypal.ts <ORDER_ID>');
    console.log('Example: npx tsx scripts/verify-paypal.ts 0R4365561T163520L');
    process.exit(1);
}

verifyOrder(orderId);
