export default async function handler(req, res) {
    try {
        // 1. Get the path from slug OR manually parse from URL if slug is empty
        const { slug } = req.query;
        let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

        // If path is empty, manually extract it from the URL string
        if (!path) {
            const urlParts = req.url.split('?')[0].split('&')[0].split('/');
            // This looks for the parts after /api/payment/
            const paymentIndex = urlParts.indexOf('payment');
            if (paymentIndex !== -1) {
                path = urlParts.slice(paymentIndex + 1).join('/');
            }
        }

        // 2. Clean any remaining parameter noise (like &signtype)
        if (path.includes('&')) path = path.split('&')[0];
        if (path.includes('?')) path = path.split('?')[0];

        // 3. Logic based on the specific path
        
        // --- PATH A: online ---
        if (path === 'online') {
            const orderId = (req.body?.order?.id) || "DMYPAG";
            const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

            return res.status(200).json({
                "item": {
                    "checkoutId": checkoutId,
                    "url": `https://dummy-wallet.vercel.app/api/payment/online/checkout?checkoutId=${checkoutId}`
                },
                "code": "SUCCESS"
            });
        }

        // --- PATH B: online/checkout ---
        if (path === 'online/checkout') {
            // Extract the ID to use in the final redirect
            const checkoutId = req.query.checkoutId || "";
            const orderId = checkoutId.replace('DUMMY', 'DMYPAG');
            
            const finalUrl = `https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect?merchantId=000000000000006&orderId=${orderId}&status=SUCCESS&transId=${orderId}`;

            // We send an HTML response that looks like your JSON but redirects the browser
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(`
                <html>
                    <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
                        <pre style="text-align:left; display:inline-block; background:#f4f4f4; padding:20px;">
{
  "item": {
    "type": "URL",
    "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
  },
  "code": "SUCCESS"
}
                        </pre>
                        <p>Processing payment... redirecting in 0.2s</p>
                        <script>
                            setTimeout(function() {
                                window.location.href = "${finalUrl}";
                            }, 200);
                        </script>
                    </body>
                </html>
            `);
        }

        // Final Debug fallback if it still fails
        return res.status(404).json({ 
            "error": "Not Found", 
            "path": path, 
            "rawUrl": req.url 
        });

    } catch (err) {
        return res.status(500).json({ "error": "Server Error", "message": err.message });
    }
}
