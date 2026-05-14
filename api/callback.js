export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { orderId } = req.body;

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
                "id": orderId,
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

    try {
        const response = await fetch("http://devlinkv2.paydee.co/mpigwv2/revenue-monster/payment-status/redirect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(callbackBody)
        });
        
        const result = await response.text();
        return res.status(200).json({ success: true, paydeeResponse: result });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
