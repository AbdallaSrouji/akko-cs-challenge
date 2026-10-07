import { timingSafeEqual, createHash } from 'node:crypto';
import { redis, KEY_BOARD } from '../lib/redis.js';
import { send, body, clean, route } from '../lib/http.js';

function passwordOk(given) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const h = s => createHash('sha256').update(String(s)).digest();
  return timingSafeEqual(h(given), h(real));
}

// POST {password, action: 'verify' | 'delete' | 'clear' | 'import', id?, records?}
export default route('POST', async (req, res) => {
  const b = body(req);
  if (!process.env.ADMIN_PASSWORD) return send(res, 500, { error: 'ADMIN_PASSWORD לא הוגדר ב-Vercel.' });
  if (!passwordOk(b.password)) return send(res, 401, { error: 'סיסמה שגויה.' });

  switch (b.action) {
    case 'verify':
      return send(res, 200, { ok: true });
    case 'delete':
      await redis('HDEL', KEY_BOARD, String(b.id || ''));
      return send(res, 200, { ok: true });
    case 'clear':
      await redis('DEL', KEY_BOARD);
      return send(res, 200, { ok: true });
    case 'import': {
      // Merges results exported from the offline (laptop) version.
      let added = 0;
      for (const r of Array.isArray(b.records) ? b.records : []) {
        if (!r || !r.id || typeof r.score !== 'number' || !Array.isArray(r.per)) continue;
        const rec = {
          id: clean(r.id, 64), team: clean(r.team, 40), school: clean(r.school, 60), members: clean(r.members, 120),
          lang: r.lang === 'cs' ? 'cs' : 'java', score: Math.max(0, Math.min(100, Math.round(r.score))),
          time: Math.max(0, Math.round(Number(r.time) || 0)), date: Number(r.date) || Date.now(),
          per: r.per.slice(0, 10).map(n => Math.max(0, Math.min(10, Math.round(Number(n) || 0)))), offline: true
        };
        added += await redis('HSETNX', KEY_BOARD, rec.id, JSON.stringify(rec));
      }
      return send(res, 200, { ok: true, added });
    }
    default:
      return send(res, 400, { error: 'Unknown action' });
  }
});
