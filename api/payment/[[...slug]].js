export default async function handler(req, res) {
    // 1. Get the slug from query
    const { slug } = req.query;

    // 2. IMPORTANT: Convert array to a string path
    // If URL is /api/payment/online/checkout, slug is ["online", "checkout"]
    // .join('/') turns it into "online/checkout"
    const path = Array.isArray(slug) ? slug.join('/') : (slug || '');

    // 3. Now your 'if' checks will work perfectly:
    if (path === 'online/checkout') {
        return res.status(200).json({ "status": "Nested Path Works!" });
    }

    if (path === 'online') {
        return res.status(200).json({ "status": "Main Path Works!" });
    }

    // This handles the TNG signature request 
    if (req.url.toLowerCase().includes('signtype')) {
        return res.status(200).json({ "item": { "type": "URL", "url": "..." }, "code": "SUCCESS" });
    }

    return res.status(404).json({ error: "Path not found", path });
}
