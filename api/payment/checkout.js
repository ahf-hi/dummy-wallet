export default async function handler(req, res) {
    try {
        let body = req.body;
        if (typeof body === 'string' && body.trim() !== '') {
            body = JSON.parse(body);
        }

        const checkoutId = body?.checkoutId || req.query?.checkoutId || "";
        
        let currentOrderId = "";
        if (checkoutId && checkoutId.startsWith('DUMMY')) {
            currentOrderId = checkoutId.replace('DUMMY', 'DMYPAG');
        } else {
            currentOrderId = checkoutId || "DMYPAG" + Date.now();
        }

        // CONCURRENT FIRE-AND-FORGET CALL TO STEP C & D
        // We do NOT use 'await' here. This lets it run asynchronously in the background 
        // while STEP B immediately responds to the user.
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        
        fetch(`${protocol}://${host}/api/payment/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: currentOrderId })
        }).catch(err => console.error("Background notification trigger failed:", err.message));

        // IMMEDIATE RESPONSE FOR STEP B
        return res.status(200).json({
            "item": {
                "type": "URL",
                "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
            },
            "code": "SUCCESS"
        });
    } catch (err) {
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
}
