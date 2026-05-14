export default async function handler(req, res) {
    // 1. Get the slug (path)
    const { slug } = req.query;
    let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // 2. Clean the path (ensures "online/checkout&signType" becomes "online/checkout")
    if (path.includes('&')) {
        path = path.split('&')[0];
    }

    // --- STEP 0: Handshake / Sign Request (Original & New Endpoint) ---
    // Added 'online/checkout' here because your app uses it as a sign request
    if (path === '' || path === 'sign' || path === 'online/checkout') {
        
        // Check if this is the specific TNG-style sign request
        // We can detect this by checking for signType or the specific URL requirement
        if (req.query.signType || path === 'online/checkout') {
            return res.status(200).json({
                "item": {
                    "type": "URL",
                    "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
                },
                "code": "SUCCESS"
            });
        }

        // Default Step 0 Handshake
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
        const checkoutId = req.body.order?.id || req.query.checkoutId || "";
        const redirectUrl = req.body.redirectUrl;

        if (redirectUrl) {
            const targetUrl = new URL(redirectUrl);
            targetUrl.searchParams.append('checkoutId', checkoutId);
            targetUrl.searchParams.append('code', 'SUCCESS');
            return res.redirect(302, targetUrl.toString());
        }

        return res.status(200).json({ "code": "SUCCESS", "checkoutId": checkoutId });
    }

    return res.status(404).json({ error: "Path not recognized", path });
}
