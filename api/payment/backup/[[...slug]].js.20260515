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
                    "url": `https://dummy-wallet.vercel.app/api/payment/online/checkout?checkoutId=${checkoutId}`
                },
                "code": "SUCCESS"
            });
        }

        // --- PATH B: online/checkout ---
        if (path === 'online/checkout') {
            const checkoutId = req.query.checkoutId || "";
            const currentOrderId = checkoutId.replace('DUMMY', 'DMYPAG');

            const callbackBody = {
                "item": {
                    "store": {
                        "id": "1767688690703368016",
                        "name": "paydee merchant 1",
                        "imageUrl": "https://storage.googleapis.com/rm-prod-asset/img/store.png",
                        "addressLine1": "", "addressLine2": "", "postCode": "", "city": "", "state": "", "country": "", "countryCode": "", "phoneNumber": "",
                        "geoLocation": { "latitude": 0, "longitude": 0 },
                        "status": "ACTIVE",
                        "createdAt": "2026-01-06T08:38:10Z",
                        "updatedAt": "2026-01-06T08:38:10Z"
                    },
                    "referenceId": "202605" + Date.now(),
                    "transactionId": "2605" + Date.now(),
                    "order": {
                        "id": currentOrderId,
                        "title": "Payment to merchant",
                        "detail": "",
                        "amount": 120
                    },
                    "terminalId": "",
                    "payee": { "userId": "1000009067743988", "subUserId": "" },
                    "currencyType": "MYR",
                    "balanceAmount": 120,
                    "finalAmount": 120,
                    "voucher": null,
                    "platform": "OPEN_API",
                    "method": "TNG",
                    "transactionAt": new Date().toISOString(),
                    "type": "WEB_PAYMENT",
                    "status": "SUCCESS",
                    "region": "MALAYSIA",
                    "extraInfo": {
                        "card": { "cardType": null, "provider": "", "isTokenization": false, "token": "", "maskNo": "", "inputType": "", "referenceId": "", "domain": "", "secondaryReferenceId": "" },
                        "onlineBanking": null,
                        "manualRefund": null
                    },
                    "extendInfo": {
                        "inHousePromo": { "amount": 0, "info": null },
                        "buyNowPayLater": { "isBuyNowPayLater": false, "installmentMonth": 0 },
                        "cardInfo": { "fundingMethod": "", "scheme": "", "alpha2": "" },
                        "paymentSource": ""
                    },
                    "source": "",
                    "createdAt": new Date().toISOString(),
                    "updatedAt": new Date().toISOString()
                },
                "code": "SUCCESS"
            };

            // CRITICAL CHANGE: We use 'await' here to force Vercel to stay awake 
            // until the callback is successfully delivered.
            try {
                await fetch("https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(callbackBody)
                });
            } catch (e) {
                console.error("Callback delivery failed:", e.message);
            }

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
