export default async function handler(req, res) {
    // 1. Get the slug (path)
    const { slug } = req.query;
    let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // 2. Clean the path
    if (path.includes('&')) {
        path = path.split('&')[0];
    }

    // --- STEP 0: Handshake / Sign Request ---
    if (path === '' || path === 'sign') {
        const orderId = req.body.order?.id || "DMYPAG" + Date.now();
        // Transformation happens ONLY here at the creation point
        const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

        return res.status(200).json({
            "item": {
                "checkoutId": checkoutId,
                "url": `https://dummy-wallet.vercel.app/api/payment/online?checkoutId=${checkoutId}`
            },
            "code": "SUCCESS"
        });
    }

    // --- STEP 1: Redirect Request (/api/payment/online) ---
    if (path === 'online') {
        // Simply capture the checkoutId as it was received (from body or query)
        const checkoutId = req.body.order?.id || req.query.checkoutId || "";
        const redirectUrl = req.body.redirectUrl;

        // If a redirectUrl exists, perform the 302 Redirect
        if (redirectUrl) {
            const targetUrl = new URL(redirectUrl);
            targetUrl.searchParams.append('checkoutId', checkoutId);
            targetUrl.searchParams.append('code', 'SUCCESS');
            return res.redirect(302, targetUrl.toString());
        }

        // Return the exact checkoutId received
        return res.status(200).json({ "code": "SUCCESS", "checkoutId": checkoutId });
    }

    // --- STEP 2: Final Confirmation (/api/payment/online/checkout) ---
    if (path === 'online/checkout') {
        const receivedId = req.body.checkoutId || "";
        const originalOrderId = receivedId.replace('DUMMY', 'DMYPAG');

        return res.status(200).json({
            "item": {
                "store": { "id": "1767688690703368016", "name": "Mock Provider", "status": "ACTIVE" },
                "referenceId": "REF_" + Date.now(),
                "transactionId": "TXN_" + Date.now(),
                "order": {
                    "id": originalOrderId, 
                    "title": "Payment to merchant",
                    "amount": 100
                },
                "currencyType": "MYR",
                "status": "SUCCESS",
                "transactionAt": new Date().toISOString()
            },
            "code": "SUCCESS"
        });
    }

    return res.status(404).json({ error: "Path not recognized", path });
}
