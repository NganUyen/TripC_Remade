// Native fetch is available in recent Node versions
// Using details from User's latest log for Booking 43018825-7f30-4e87-95b1-8645888dff8a

//const crypto = require('crypto');
const fetch = require('node-fetch');

// Hardcoded for testing: match what's in your DB or the recent log
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PDdaPN54';

async function simulateWebhook() {
    const url = 'http://localhost:3000/api/payments/webhooks/momo';

    // Data from User's Log
    // Booking: e4860f3f-e4f2-4906-acb7-876919fa586d
    // Amount: 89799
    // OrderId: MOMOHHIY20251009_TEST1769587817975
    
    // Construct the payload MoMo would send
    const body = {
        partnerCode: 'MOMOHHIY20251009_TEST',
        orderId: 'MOMOHHIY20251009_TEST1769587817975', // Matches the log
        requestId: 'MOMOHHIY20251009_TEST1769587817975',
        amount: 89799,
        orderInfo: 'Booking e4860f3f-e4f2-4906-acb7-876919fa586d',
        orderType: 'momo_wallet',
        transId: '4656512590', // From log
        resultCode: 0,
        message: 'Thành công.',
        payType: 'qr',
        responseTime: 1769587833660,
        extraData: '',
        signature: ''
    };

    // Generate Signature
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;

    const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

    body.signature = signature;

    console.log('Simulating MoMo Webhook...');
    console.log('Target:', url);
    console.log('Payload:', JSON.stringify(body, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

simulateWebhook();
