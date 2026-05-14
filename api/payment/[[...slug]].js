export default async function handler(req, res) {
    try {
        // 1. Get the path from the slug (e.g., "online" or "online/checkout")
        const { slug } = req.query;
        let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

        // 2. Clean path of query parameters if they got merged into the slug string
        if (path.includes('&')) path = path.split('&')[0];

        // 3. Logic based on the specific path
        
        // --- PATH A: /api/payment/online&signtype ---
        if (path === 'online') {
            const orderId = (req.body?.order?.id) || "PAGUAT" + Date.now();
            const checkoutId = orderId.replace('PAGUAT', 'DUMMY');

            return res.status(200).json({
                "item": {
                    "checkoutId": checkoutId,
                    "url": `https://dummy-wallet.vercel.app/api/payment/online?checkoutId=${checkoutId}`
                },
                "code": "SUCCESS"
            });
        }

        // --- PATH B: /api/payment/online/checkout&signtype ---
        if (path === 'online/checkout') {
            return res.status(200).json({
                "item": {
                    "type": "URL",
                    "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
                },
                "code": "SUCCESS"
            });
        }

        // Catch-all for any other path
        return res.status(404).json({ "error": "Not Found", "path": path });

    } catch (err) {
        return res.status(500).json({ "error": "Server Error", "message": err.message });
    }
}
