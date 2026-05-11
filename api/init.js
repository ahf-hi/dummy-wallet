export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { order, storeId } = req.body;
  const orderId = order.id;

  res.status(200).json({
    item: {
      checkoutId: orderId,
      // We pass the orderId in the URL to stay stateless
      url: `https://${req.headers.host}/api/checkout?checkoutId=${orderId}`
    },
    code: "SUCCESS"
  });
}
