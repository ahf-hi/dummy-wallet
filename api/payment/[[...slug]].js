export default async function handler(req, res) {
    // 1. Get the slug from the query
    const { slug } = req.query;

    /** 
     * IMPORTANT: Next.js '[[...slug]]' provides an array for nested paths.
     * URL: /api/payment/online/checkout -> slug: ["online", "checkout"]
     * We join them to match your 'if' conditions.
     */
    let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // 2. Intercept TNG Handshake / Sign Requests
    // This catches ANY path (online or online/checkout) if 'signType' is present
    const isSignRequest = req.url.toLowerCase().includes('signtype');

    if (isSignRequest) {
        return res.status(200).json({
            "item": {
                "type": "URL",
                "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
            },
            "code": "SUCCESS"
        });
    }

    // 3. Clean the path for standard logic (removes & signType if it wasn't caught above)
    if (path.includes('&')) {
        path = path.split('&')[0];
    }

    // --- STEP 0: Handshake / Sign Request (Internal Dummy) ---
    // Detects if the path is empty or exactly "sign"
    if (path === '' || path === 'sign') {
        const orderId = req.body.order?.id || "PAGUAT" + Date.now();
        const checkoutId = orderId.replace('PAGUAT', 'DUMMY');

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
        const orderId = req.body.order?.id || req.query.checkoutId || "";
        const redirectUrl = req.body.redirectUrl;

        // Maintain consistent checkoutId (Received ID or transformed ORDID)
        const checkoutId = orderId.includes('PAGUAT') 
            ? orderId.replace('PAGUAT', 'DUMMY') 
            : orderId;

        if (redirectUrl) {
            const targetUrl = new URL(redirectUrl);
            targetUrl.searchParams.append('checkoutId', checkoutId);
            targetUrl.searchParams.append('code', 'SUCCESS');
            return res.redirect(302, targetUrl.toString());
        }

        return res.status(200).json({ "code": "SUCCESS", "checkoutId": checkoutId });
    }

    // --- STEP 2: Final Confirmation (/api/payment/online/checkout) ---
    if (path === 'online/checkout') {
        const receivedId = req.body.checkoutId || "";
        const originalOrderId = receivedId.replace('DUMMY', 'PAGUAT');

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

    // 4. Fallback for unrecognized paths
    return res.status(404).json({ 
        error: "Path not recognized", 
        path,
        isArray: Array.isArray(slug)
    });
}
