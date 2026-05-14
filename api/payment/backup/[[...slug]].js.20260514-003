export default async function handler(req, res) {
    const { slug } = req.query;
    let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // --- DIAGNOSTIC CHECK ---
    // If you see this JSON response, it means the script IS reaching your code.
    // If you still see a generic "404 Page Not Found", the issue is your filename.
    if (req.query.debug === 'true') {
        return res.status(200).json({
            message: "Script reached!",
            detectedPath: path,
            fullUrl: req.url,
            query: req.query
        });
    }

    // 1. Clean path
    if (path.includes('&')) {
        path = path.split('&')[0];
    }

    // 2. Intercept signType (Handshake)
    if (req.url.includes('signType')) {
        return res.status(200).json({
            "item": {
                "type": "URL",
                "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973\u0026timestamp=1778663675918\u0026merchantId=217120000000025910811\u0026sign=jYnBmeOOLRkUDWmhQq4%252B1V0yntKuDpcmvb%252Fx0qtM%252Fx2XCBxX6unuN%252FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%252FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%252BS8MKNQqrEAJuIb1gq5%252BeVd0e2OTf2kbuN%252FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%252FQTCa4H9%252FExu%252FTYCfEYA2NguTiGt1ta0CzeyQC%252B64d3qjrNp7Tp2%252BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%252FQORshtIsXw4N0gQ%253D%253D\u0026forceInstallVer2=true"
            },
            "code": "SUCCESS"
        });
    }

    // --- STEP 0: Handshake / Sign Request ---
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
        const orderId = req.body.order?.id || req.query.checkoutId || "";
        const redirectUrl = req.body.redirectUrl;

        const checkoutId = orderId.includes('DMYPAG') 
            ? orderId.replace('DMYPAG', 'DUMMY') 
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

    // If it hits here, it's a logic mismatch
    return res.status(404).json({ 
        error: "Logic Fallthrough", 
        matchedPath: path,
        suggestion: "Check if path equals 'online/checkout' exactly."
    });
}
