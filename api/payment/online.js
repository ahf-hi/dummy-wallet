export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        let body = req.body;
        if (typeof body === 'string' && body.trim() !== '') {
            body = JSON.parse(body);
        }

        const orderId = body?.order?.id || "DMYPAG" + Date.now();
        const checkoutId = orderId.replace('DMYPAG', 'DUMMY');

        return res.status(200).json({
            "item": {
                "checkoutId": checkoutId,
                "url": `https://dummy-wallet.vercel.app/api/payment/checkout?checkoutId=${checkoutId}`
            },
            "code": "SUCCESS"
        });
    } catch (err) {
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
}
