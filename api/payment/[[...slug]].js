export default async function handler(req, res) {
    try {
        const { slug } = req.query;
        let path = Array.isArray(slug) ? slug.join('/') : (slug || '');

        if (!path) {
            const urlParts = req.url.split('?')[0].split('&')[0].split('/');
            const paymentIndex = urlParts.indexOf('payment');
            if (paymentIndex !== -1) {
                path = urlParts.slice(paymentIndex + 1).join('/');
            }
        }

        if (path.includes('&')) path = path.split('&')[0];
        if (path.includes('?')) path = path.split('?')[0];

        // --- PATH A: online ---
        if (path === 'online') {
            const orderId = (req.body?.order?.id) || "DMYPAG" + Date.now();
            const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

            return res.status(200).json({
                "item": {
                    "checkoutId": checkoutId,
                    // FIX: Pass both checkoutId AND the original orderId in the URL query string
                    "url": `https://dummy-wallet.vercel.app/api/payment/online/checkout?checkoutId=${checkoutId}&originalOrderId=${orderId}`
                },
                "code": "SUCCESS"
            });
        }

        // --- PATH B: online/checkout ---
        if (path === 'online/checkout') {
            // Parse the original orderId directly from the URL query strings
            let originalOrderId = req.query.originalOrderId || "";
            let checkoutId = req.query.checkoutId || "";

            // Fallback manual URL parser if Next.js query parsing fails
            if ((!originalOrderId || !checkoutId) && req.url.includes('?')) {
                const urlParams = new URL(req.url, `https://${req.headers.host}`);
                checkoutId = checkoutId || urlParams.searchParams.get('checkoutId') || "";
                originalOrderId = originalOrderId || urlParams.searchParams.get('originalOrderId') || "";
            }

            // Fallback recovery: reconstruct from checkoutId if somehow missing, or generate as absolute last resort
            const currentOrderId = originalOrderId || (checkoutId ? checkoutId.replace('DUMMY', 'DMYPAG') : "DMYPAG" + Date.now());

            // 1. Construct the GET redirect URL with the persistent original orderId
            const redirectUrl = `https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect?merchantId=000000000000006&orderId=${currentOrderId}&status=SUCCESS&transId=${currentOrderId}`;

            try {
                // Sent GET request to the redirect URL
                await fetch(redirectUrl, {
                    method: "GET"
                });
            } catch (e) {
                console.error("Redirect notification failed:", e.message);
            }

            // 2. Send POST Webhook Callback Notification
            const webhookUrl = "https://devlinkv2.paydee.co/webhookv2/revenue-monster/payment-status/notify/000000000000006";
            const nowIso = new Date().toISOString(); 

            const webhookPayload = {
                eventType: "PAYMENT_WEB_ONLINE",
                data: {
                    balanceAmount: 100,
                    createdAt: nowIso,
                    currencyType: "MYR",
                    method: "TNG",
                    order: {
                        amount: 100,
                        detail: "",
                        id: currentOrderId, // This now accurately matches your original path A ID
                        title: "Payment to merchant"
                    },
                    payee: {
                        userId: 1000009067743988
                    },
                    platform: "OPEN_API",
                    referenceId: "20260518111212800110171244405345740",
                    region: "MALAYSIA",
                    status: "SUCCESS",
                    store: {
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        country: "",
                        countryCode: "",
                        createdAt: "2026-01-06T08:38:10Z",
                        geoLocation: { latitude: 0, longitude: 0 },
                        id: 1767688690703368016,
                        imageUrl: "https://storage.googleapis.com/rm-prod-asset/img/store.png",
                        name: "paydee merchant 1",
                        phoneNumber: "",
                        postCode: "",
                        state: "",
                        status: "ACTIVE",
                        updatedAt: "2026-01-06T08:38:10Z"
                    },
                    terminalId: "",
                    transactionAt: nowIso,
                    transactionId: "260518030355300426755550",
                    type: "WEB_PAYMENT",
                    updatedAt: nowIso,
                    voucher: null
                }
            };

            try {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookPayload)
                });
            } catch (e) {
                console.error("Webhook notification failed:", e.message);
            }

            // Return the specific JSON response requested
            return res.status(200).json({
                "item": {
                    "type": "URL",
                    "url": "https://m-sd.tngdigital.com.my/s/cashier/index.html?bizNo=20260513111212800110171792505137973&timestamp=1778663675918&merchantId=217120000000025910811&sign=jYnBmeOOLRkUDWmhQq4%2B1V0yntKuDpcmvb%2Fx0qtM%2Fx2XCBxX6unuN%2FxRmwwakEX55IOF1dUvn0c5jEyWsaV1icsbvvesXhXNOx4uq%2FNa2wiXKuv3vrjBAPMbwIekjtwiZB77sSHpv7uRLdZgHk5yny%2BS8MKNQqrEAJuIb1gq5%2BeVd0e2OTf2kbuN%2FruFFSJQbD0AphXyCLbnZjR4bK0k2ah7Mjz8eHn%2FQTCa4H9%2FExu%2FTYCfEYA2NguTiGt1ta0CzeyQC%2B64d3qjrNp7Tp2%2BdmXSoOepVKkRsg9IjnkZ5xhkPNb2nIpDO7fjfpWWMG5Fl07NIY%2FQORshtIsXw4N0gQ%3D%3D&forceInstallVer2=true"
                },
                "code": "SUCCESS"
            });
        }

        return res.status(404).json({ "error": "Not Found", "path": path });

    } catch (err) {
        return res.status(500).json({ "error": "Server Error", "message": err.message });
    }
}
