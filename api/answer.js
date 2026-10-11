import { redis, getJSON, gameKey, KEY_BOARD } from '../lib/redis.js';
import { ALL_QUESTIONS, applyAnswer, finishGame } from '../lib/questions.js';
import { send, body, route } from '../lib/http.js';

// POST {id, q, answers:[text|null, ...], skip?} -> {earned, correct, skipped, right, explain, score, mainDone, done}
// `skip` gives up a bonus question (0 points).
// POST {id, finish:true} -> {score}: ends the game early; unanswered main questions score 0.
// Repeating a submission returns the stored result, so the browser can safely retry after a network error.
export default route('POST', async (req, res) => {
  const b = body(req);
  const game = await getJSON(gameKey(String(b.id || '')));
  if (!game) return send(res, 404, { error: 'המשחק לא נמצא בשרת (ייתכן שפג תוקפו).' });

  const q = Number(b.q);
  if (!b.finish && (!Number.isInteger(q) || q < 0 || q >= ALL_QUESTIONS.length)) return send(res, 400, { error: 'Bad question' });

  const { result, record, score } = b.finish ? finishGame(game) : applyAnswer(game, q, b.answers, !!b.skip);
  if (record) await redis('HSET', KEY_BOARD, game.id, JSON.stringify(record));
  await redis('SET', gameKey(game.id), JSON.stringify(game), 'KEEPTTL');
  send(res, 200, b.finish ? { score } : result);
});
