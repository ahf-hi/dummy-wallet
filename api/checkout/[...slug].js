export default async function handler(req, res) {
    const { slug } = req.query;
    const path = Array.isArray(slug) ? slug.join('/') : slug;

    // --- STEP 1: Catch /payment/online ---
    if (path === 'payment/online' && req.method === 'POST') {
        const orderId = req.body.order?.id || "";
        const redirectUrl = req.body.redirectUrl;

        // REPLACE "PAGUAT" with "DUMMY"
        const checkoutId = orderId.replace('PAGUAT', 'DUMMY');

        const targetUrl = new URL(redirectUrl);
        targetUrl.searchParams.append('checkoutId', checkoutId);
        targetUrl.searchParams.append('code', 'SUCCESS');

        // Redirect with GET method
        return res.redirect(302, targetUrl.toString());
    }

    // --- STEP 2: Catch /payment/online/checkout ---
    if (path === 'payment/online/checkout' && req.method === 'POST') {
        const receivedCheckoutId = req.body.checkoutId || "";
        
        // Revert "DUMMY" back to "PAGUAT" so the response is consistent with your app
        const originalOrderId = receivedCheckoutId.replace('DUMMY', 'PAGUAT');

        return res.status(200).json({
            "item": {
                "store": { "id": "1767688690703368016", "name": "Mock Wallet Provider", "status": "ACTIVE" },
                "referenceId": "REF_" + Date.now(),
                "transactionId": "TXN_" + Date.now(),
                "order": {
                    "id": originalOrderId, // This will be PAGUAT20260513105219
                    "title": "Payment to merchant",
                    "amount": 120
                },
                "currencyType": "MYR",
                "status": "SUCCESS",
                "transactionAt": new Date().toISOString(),
                "createdAt": new Date().toISOString()
            },
            "code": "SUCCESS"
        });
    }

    return res.status(404).json({ error: "Path not recognized", path });
}
