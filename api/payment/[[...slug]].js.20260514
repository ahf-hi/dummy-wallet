export default async function handler(req, res) {
    // 1. Get the slug (path)
    const { slug } = req.query;
    let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // 2. Clean the path in case the app sends "&" instead of "?" 
    // This ensures "online&signType=..." is treated as "online"
    if (path.includes('&')) {
        path = path.split('&')[0];
    }

    // --- STEP 0: Handshake / Sign Request ---
    // Detects if the path is empty or "sign"
    if (path === '' || path === 'sign') {
        const orderId = req.body.order?.id || "DMYPAG" + Date.now();
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
        // Try to find the ID in body first, then fallback to checkoutId from URL query
        const orderId = req.body.order?.id || req.query.checkoutId || "";
        const redirectUrl = req.body.redirectUrl;

        const checkoutId = orderId.includes('DMYPAG') 
            ? orderId.replace('DMYPAG', 'DUMMY') 
            : orderId;

        // If a redirectUrl exists, perform the 302 Redirect
        if (redirectUrl) {
            const targetUrl = new URL(redirectUrl);
            targetUrl.searchParams.append('checkoutId', checkoutId);
            targetUrl.searchParams.append('code', 'SUCCESS');
            return res.redirect(302, targetUrl.toString());
        }

        // If no redirectUrl (just a status check), return SUCCESS JSON
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
                    "id": originalOrderId, // Reverts DUMMY back to DMYPAG
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
