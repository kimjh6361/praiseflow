let memoryStore = {};

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const channel = req.query.channel || 'praise_main_channel';

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body && typeof body === 'object') {
        if (!memoryStore[channel]) {
          memoryStore[channel] = { library: {}, slots: [], updatedAt: Date.now() };
        }
        if (body.library !== undefined) {
          memoryStore[channel].library = body.library;
        }
        if (body.slots !== undefined) {
          memoryStore[channel].slots = body.slots;
        }
        memoryStore[channel].updatedAt = Date.now();
        return res.status(200).json({
          success: true,
          channel,
          libraryCount: Object.keys(memoryStore[channel].library || {}).length,
          slotsCount: (memoryStore[channel].slots || []).filter(Boolean).length
        });
      }
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === 'GET') {
    const stored = memoryStore[channel];
    if (stored) {
      return res.status(200).json(stored);
    }
    return res.status(200).json({ library: {}, slots: [], updatedAt: 0 });
  }

  return res.status(405).end();
}
