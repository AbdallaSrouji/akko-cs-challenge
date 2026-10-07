import { redis, getJSON, gameKey, KEY_BOARD } from '../lib/redis.js';
import { QUESTIONS, applyAnswer } from '../lib/questions.js';
import { send, body, route } from '../lib/http.js';

// POST {id, q, answers:[text|null, ...]} -> {earned, correct, right, explain, score, done}
// Repeating a submission returns the stored result, so the browser can safely retry after a network error.
export default route('POST', async (req, res) => {
  const b = body(req);
  const q = Number(b.q);
  if (!Number.isInteger(q) || q < 0 || q >= QUESTIONS.length) return send(res, 400, { error: 'Bad question' });

  const game = await getJSON(gameKey(String(b.id || '')));
  if (!game) return send(res, 404, { error: 'המשחק לא נמצא בשרת (ייתכן שפג תוקפו).' });

  const { result, record } = applyAnswer(game, q, b.answers);
  if (record) await redis('HSET', KEY_BOARD, game.id, JSON.stringify(record));
  await redis('SET', gameKey(game.id), JSON.stringify(game), 'KEEPTTL');
  send(res, 200, result);
});
