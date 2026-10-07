// Minimal Upstash Redis REST client (no dependencies).
// Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const KEY_BOARD = 'akko:board';
export const gameKey = id => `akko:game:${id}`;

export async function redis(...args) {
  if (!URL_ || !TOKEN) throw new Error('Redis is not configured: connect Upstash Redis in the Vercel Storage tab');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export async function getJSON(key) {
  const v = await redis('GET', key);
  return v ? JSON.parse(v) : null;
}

export async function readBoard() {
  const flat = (await redis('HGETALL', KEY_BOARD)) || [];
  const rows = [];
  for (let i = 1; i < flat.length; i += 2) {
    try { rows.push(JSON.parse(flat[i])); } catch {}
  }
  return rows.sort((a, b) => b.score - a.score || a.time - b.time || a.date - b.date);
}
