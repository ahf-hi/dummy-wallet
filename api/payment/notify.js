export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: "Missing orderId" });

        // --- STEP C: Send GET Redirect Notification ---
        const redirectUrl = `https://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect?merchantId=SYSSPC000000001&orderId=${orderId}&status=SUCCESS&transId=${orderId}`;
        try {
            await fetch(redirectUrl, { method: "GET" });
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
                    id: orderId, // Perfectly synchronized
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

        // Close background process connection safely
        return res.status(200).json({ status: "Notifications dispatched" });
    } catch (err) {
        return res.status(500).json({ error: "Notification process crashed", message: err.message });
    }
}
