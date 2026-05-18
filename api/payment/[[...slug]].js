export default async function handler(req, res) {
    try {
        // 1. SANITIZE THE ROUTE INTERPRETATION
        // If the URL passes parameters via '&' instead of '?', clean it up
        let rawUrlPath = req.url.split('?')[0];
        if (rawUrlPath.includes('&')) {
            rawUrlPath = rawUrlPath.split('&')[0];
        }

        const urlParts = rawUrlPath.split('/');
        const paymentIndex = urlParts.indexOf('payment');
        let path = "";

        if (paymentIndex !== -1) {
            path = urlParts.slice(paymentIndex + 1).join('/');
        }

        // Standardize request body parsing
        let body = req.body;
        if (typeof body === 'string' && body.trim() !== '') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        // Common Gateway Security Headers for Steps C & D
        const gatewayHeaders = {
            "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMTgtMDMtMTMiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiYXBpX2NsaWVudEBFaGNLQzA5QmRYUm9RMnhwWlc1MEVMcUV0WjZEN0xfSUdBIl0sImV4cCI6MTc3ODk4NTQ3MCwiaWF0IjoxNzc2MzkzNDcwLCJpc3MiOiJodHRwczovL3NiLW9hdXRoLnJldmVudWVtb25zdGVyLm15IiwianRpIjoiRWh3S0VFOUJkWFJvUVdOalpYTnpWRzlyWlc0UXdvWFJ4N09Pd2RNWSIsIm5iZiI6MTc3NjM5MzQ3MCwic3ViIjoiRWhRS0NFMWxjbU5vWVc1MEVQenhxdl80NzRYRUdCSVFDZ1JWYzJWeUVNMnhyTjc2NzRYRUdBIn0.fMOsX3mXeZ00Z7NQKKTsiA9HopEuYNWLUtvtB8OV2ED3aILJaVTv0MMl80Fa8wPmnNJaPBRFg_9sVvEMMg6fKgeYvFVOI14vTwXCFKG7mXJ_VklaTaCUUnpFR3tRN2qXisLDHLmXKX6JH27fhmT57j00YYgj_gd0Yx-FqvxyBFkKY69kvj68dfMRrtTxye6bDOzFqR0YM1uSuxixwkdAagrd-iOChjtQTlenGa7yYVuFeJnZhBqC-Mb2TwWki0I6Rppy70gvvV5fiaxe8qb8VblPyLQJEcIg_udglNdJjblbeFm1eWiUz9qJqNjC9m3PR0A6I7UYTyWuceO8S3dSUA",
            "Content-Type": "application/json",
            "X-Nonce-Str": "11556D9590A2816892FE9B7814ABCDD7",
            "X-Signature": "sha256 LoslzYoD1765N6rLSguDe60nEJpNI3HJQWJXf7JKqVkffH0xp4LxpMPwi5SbRiPQYgnZk94D/wMS4vdqxQpn7yTvmZYqAYhGuxms5XkFJRzOsliWaU9X1GgMBR8HEA7J87cejR8ltmPPGZvMwDrbsngmkS6eA5Iu0S69MP3GAcusUEVzqOTILjiCGpmIds5G052qu5+nr0qu8dwktFbAwRXxjnPHDRSGkRwSqNKdiHYp3JGjF5U/CgbdsNDlXwfSxnUApfI1BZJENu0svkaEOie6GALNA2EpcE+hA7QuTEtGbu1aMSx+W29ISXLTksGPANGte5jG21ya97Es+Hr0Rg==",
            "X-Timestamp": "1779077815"
        };


        // ==========================================
        // STEP A: Initial Online Payment Intent Request
        // ==========================================
        if (path === 'online') {
            const orderId = body?.order?.id || "DMYPAG" + Date.now();
            const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

            return res.status(200).json({
                "item": {
                    "checkoutId": checkoutId,
                    "url": `https://dummy-wallet.vercel.app/api/payment/online/checkout?checkoutId=${checkoutId}`
                },
                "code": "SUCCESS"
            });
        }


        // ==========================================
        // STEP B, C & D: Checkout Execution Route
        // ==========================================
        if (path === 'online/checkout') {
            // Extract checkout token safely from body, query parameters, or raw string alternative
            let checkoutId = body?.checkoutId || req.query?.checkoutId || "";

            if (!checkoutId && req.url.includes('checkoutId=')) {
                // Manual extraction regex for cases where parameters are jammed behind an ampersand
                const match = req.url.match(/checkoutId=([^&]+)/);
                if (match) checkoutId = match[1];
            }

            // Reverse format processing mapping DUMMY token structures safely back to core system IDs
            let currentOrderId = "";
            if (checkoutId && checkoutId.startsWith('DUMMY')) {
                currentOrderId = checkoutId.replace('DUMMY', 'DMYPAG');
            } else {
                currentOrderId = checkoutId || "DMYPAG" + Date.now();
            }

            // --- STEP C: Send GET Redirect Notification Handshake ---
            const redirectUrl = `https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect?merchantId=SYSSPC000000001&orderId=${currentOrderId}&status=SUCCESS&transId=${currentOrderId}`;
            try {
                await fetch(redirectUrl, { 
                    method: "GET",
                    headers: gatewayHeaders 
                });
            } catch (e) {
                console.error("Redirect notification failed:", e.message);
            }

            // --- STEP D: Send Webhook Callback Notification via POST ---
            const webhookUrl = "https://devlinkv2.paydee.co/webhookv2/revenue-monster/payment-status/notify/SYSSPC000000001";
            const webhookPayload = {
                eventType: "PAYMENT_WEB_ONLINE",
                data: {
                    balanceAmount: 100,
                    createdAt: "2026-05-18T03:03:55Z",
                    currencyType: "MYR",
                    method: "TNG",
                    order: {
                        amount: 100,
                        detail: "",
                        id: currentOrderId, // Synchronized tracking value
                        title: "Payment to merchant"
                    },
                    payee: { userId: 1000009067743988 },
                    platform: "OPEN_API",
                    referenceId: "20260518111212800110171244405345740",
                    region: "MALAYSIA",
                    status: "SUCCESS",
                    store: {
                        addressLine1: "", addressLine2: "", city: "", country: "", countryCode: "",
                        createdAt: "2026-01-06T08:38:10Z",
                        geoLocation: { latitude: 0, longitude: 0 },
                        id: 1767688690703368016,
                        imageUrl: "https://storage.googleapis.com/rm-prod-asset/img/store.png",
                        name: "paydee merchant 1", phoneNumber: "", postCode: "", state: "",
                        status: "ACTIVE", updatedAt: "2026-01-06T08:38:10Z"
                    },
                    terminalId: "",
                    transactionAt: "2026-05-18T03:04:25Z",
                    transactionId: "260518030355300426755550",
                    type: "WEB_PAYMENT",
                    updatedAt: "2026-05-18T03:04:25Z",
                    voucher: null
                }
            };

            try {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: gatewayHeaders,
                    body: JSON.stringify(webhookPayload)
                });
            } catch (e) {
                console.error("Webhook notification failed:", e.message);
            }

            // Return immediate STEP B confirmation payload response
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
