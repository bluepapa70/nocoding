const VALID = ['upvote', 'funny', 'love', 'surprised', 'angry', 'sad'];

export async function onRequest({ request, env }) {
  const kv = env.REACTIONS_KV;
  const headers = { 'Content-Type': 'application/json' };

  if (request.method === 'GET') {
    const entries = await Promise.all(
      VALID.map(async r => [r, parseInt((await kv.get(r)) || '0', 10)])
    );
    return new Response(JSON.stringify(Object.fromEntries(entries)), { headers });
  }

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return new Response('Bad Request', { status: 400, headers }); }
    const { reaction, action } = body;
    if (!VALID.includes(reaction) || !['add', 'remove'].includes(action)) {
      return new Response('Bad Request', { status: 400, headers });
    }
    const current = parseInt((await kv.get(reaction)) || '0', 10);
    await kv.put(reaction, String(action === 'add' ? current + 1 : Math.max(0, current - 1)));
    const entries = await Promise.all(
      VALID.map(async r => [r, parseInt((await kv.get(r)) || '0', 10)])
    );
    return new Response(JSON.stringify(Object.fromEntries(entries)), { headers });
  }

  return new Response('Method Not Allowed', { status: 405, headers });
}
