// In-memory cache for serverless invocation
const serverlessStateCache: Record<string, any> = {};

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const account = (req.query?.account || 'worship-main').toLowerCase().trim();

  if (req.method === 'POST') {
    const updates = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const existing = serverlessStateCache[account] || {};
    const updated = {
      ...existing,
      ...updates,
      account,
      lastUpdated: Date.now(),
    };
    serverlessStateCache[account] = updated;
    return res.status(200).json({ success: true, state: updated });
  }

  const current = serverlessStateCache[account] || null;
  return res.status(200).json({ success: true, state: current });
}
