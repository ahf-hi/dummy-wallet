export default async function handler(req, res) {
    try {
        // 1. CLEAN AND PARSE THE INCOMING URL PATH
        // Handles standard paths and ampersand delimiters like: /online&signType=sha256
        let rawPath = req.url.split('?')[0];
        if (rawPath.includes('&')) {
            rawPath = rawPath.split('&')[0];
        }
        
        const urlParts = rawPath.split('/');
        const paymentIndex = urlParts.indexOf('payment');
        let path = "";
        
        if (paymentIndex !== -1) {
            path = urlParts.slice(paymentIndex + 1).join('/');
        }

        // Parse body if it arrives as an unparsed string
        let body = req.body;
        if (typeof body === 'string' && body.trim() !== '') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error("Failed to parse incoming body string:", e.message);
            }
        }

        // ==========================================
        // STEP A: Create Online Payment Intent
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
        // STEP B, C & D: Checkout Execution
        // ==========================================
        if (path === 'online/checkout') {
            // CRITICAL FIX: Extract checkoutId from POST body first, fallback to query parameters
            let checkoutId = body?.checkoutId || req.query?.checkoutId || "";

            // Absolute fallback manual parsing from the raw URL
            if (!checkoutId && req.url.includes('checkoutId=')) {
                const urlParams = new URL(req.url, `https://${req.headers.host}`);
                checkoutId = urlParams.searchParams.get('checkoutId') || "";
            }

            // Extract the original id back from the checkout token structure
            let currentOrderId = "";
            if (checkoutId && checkoutId.startsWith('DUMMY')) {
                currentOrderId = checkoutId.replace('DUMMY', 'DMYPAG');
            } else {
                currentOrderId = checkoutId || "DMYPAG" + Date.now();
            }

            // --- STEP C: Send GET Redirect Notification ---
            const redirectUrl = `https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect?merchantId=SYSSPC000000001&orderId=${currentOrderId}&status=SUCCESS&transId=${currentOrderId}`;

            try {
                await fetch(redirectUrl, { method: "GET" });
            } catch (e) {
                console.error("Redirect notification failed:", e.message);
            }

            // --- STEP D: Send Webhook Callback Notification via POST ---
            const webhookUrl = "https://devlinkv2.paydee.co/webhookv2/revenue-monster/payment-status/notify/SYSSPC000000001";
            const nowIso = new Date().toISOString(); 

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
                        id: currentOrderId, // Uses your mapped original transaction ID
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(webhookPayload)
                });
            } catch (e) {
                console.error("Webhook notification failed:", e.message);
            }

            // Return Step B Expected JSON Response Payload
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
