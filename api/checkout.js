module.exports = (req, res) => {
    // Vercel only allows POST for this specific logic
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 1. Extract data from the request body
    const orderId = req.body.order?.id;
    const redirectUrl = req.body.redirectUrl;

    if (!orderId || !redirectUrl) {
        return res.status(400).json({ code: "ERROR", message: "Missing order.id or redirectUrl" });
    }

    // 2. Transform the ID (PAGUAT -> DUMMY)
    const checkoutId = orderId.replace('PAGUAT', 'DUMMY');

    // 3. Construct the target URL with query parameters
    const targetUrl = new URL(redirectUrl);
    targetUrl.searchParams.append('checkoutId', checkoutId);
    targetUrl.searchParams.append('code', 'SUCCESS');

    // 4. Redirect the user using GET method
    console.log(`Redirecting to: ${targetUrl.toString()}`);
    res.redirect(302, targetUrl.toString());
};
