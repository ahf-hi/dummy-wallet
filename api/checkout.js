export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { checkoutId } = req.body;

  res.status(200).json({
    item: {
      type: "URL",
      // Redirecting to the static HTML file in /public
      url: `https://${req.headers.host}/cashier.html?transId=${checkoutId}`
    },
    code: "SUCCESS"
  });
}
