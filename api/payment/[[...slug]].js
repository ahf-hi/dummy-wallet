export default async function handler(req, res) {
    const { slug } = req.query;
    // slug for Request 1: ["online"]
    // slug for Request 2: ["online", "checkout"]
    const path = Array.isArray(slug) ? slug.join('/') : slug;

    // --- STEP 1: Catch /api/payment/online ---
    if (path === 'online' && req.method === 'POST') {
        const orderId = req.body.order?.id || "";
        const redirectUrl = req.body.redirectUrl;

        // Replace DMYPAG with DUMMY
        const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

        const targetUrl = new URL(redirectUrl);
        targetUrl.searchParams.append('checkoutId', checkoutId);
        targetUrl.searchParams.append('code', 'SUCCESS');

        // Redirect to merchant's redirectUrl
        return res.redirect(302, targetUrl.toString());
    }

    // --- STEP 2: Catch /api/payment/online/checkout ---
    if (path === 'online/checkout' && req.method === 'POST') {
        const receivedCheckoutId = req.body.checkoutId || "";
        
        // Convert DUMMY back to DMYPAG for the response body
        const originalOrderId = receivedCheckoutId.replace('DUMMY', 'DMYPAG');

        return res.status(200).json({
            "item": {
                "store": { 
                    "id": "1767688690703368016", 
                    "name": "Mock Wallet Provider", 
                    "status": "ACTIVE" 
                },
                "referenceId": "REF_" + Date.now(),
                "transactionId": "TXN_" + Date.now(),
                "order": {
                    "id": originalOrderId, // DMYPAG2026...
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

    // Fallback for testing or incorrect paths
    return res.status(404).json({ 
        error: "Path not recognized", 
        receivedPath: path 
    });
}
