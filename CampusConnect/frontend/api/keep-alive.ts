import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Only allow GET requests from Vercel Cron
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify this is a cron job request (optional security)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Get backend URL from environment variable
        const backendUrl = process.env.VITE_API_URL || 'https://campusconnect-backend-xang.onrender.com/api';

        // Ping the backend health endpoint
        const response = await fetch(backendUrl.replace('/api', ''), {
            method: 'GET',
            headers: {
                'User-Agent': 'Vercel-Cron-Keep-Alive'
            }
        });

        const data = await response.json();

        console.log(`[${new Date().toISOString()}] Backend ping successful:`, data);

        return res.status(200).json({
            success: true,
            message: 'Backend pinged successfully',
            timestamp: new Date().toISOString(),
            backendStatus: response.status,
            backendResponse: data
        });
    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Backend ping failed:`, error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
