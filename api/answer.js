import { redis, getJSON, gameKey, KEY_BOARD } from '../lib/redis.js';
import { QUESTIONS } from '../lib/questions.js';
import { send, body, route } from '../lib/http.js';

// POST {id, q, answers:[text|null x3]} -> {earned, correct, right, explain, score, done}
// Each question can be scored once; repeating a submission returns the stored result,
// so the browser can safely retry after a network error.
export default route('POST', async (req, res) => {
  const b = body(req);
  const q = Number(b.q);
  if (!Number.isInteger(q) || q < 0 || q >= QUESTIONS.length) return send(res, 400, { error: 'Bad question' });

  const game = await getJSON(gameKey(String(b.id || '')));
  if (!game) return send(res, 404, { error: 'המשחק לא נמצא בשרת (ייתכן שפג תוקפו).' });

  const Q = QUESTIONS[q];
  let r = game.results[q];
  if (!r) {
    const answers = Array.isArray(b.answers) ? b.answers : [];
    const correct = Q.parts.map((p, i) => answers[i] === p.o[0]);
    const earned = Q.parts.reduce((s, p, i) => s + (correct[i] ? p.pts : 0), 0);
    r = game.results[q] = { earned, correct };
  }

  const score = Object.values(game.results).reduce((s, x) => s + x.earned, 0);
  const done = QUESTIONS.every((_, i) => game.results[i]);
  if (done && !game.finished) {
    game.finished = Date.now();
    const record = {
      id: game.id, team: game.team, school: game.school, members: game.members, lang: game.lang,
      score, time: Math.round((game.finished - game.started) / 1000), date: game.finished,
      per: QUESTIONS.map((_, i) => game.results[i].earned)
    };
    await redis('HSET', KEY_BOARD, game.id, JSON.stringify(record));
  }
  await redis('SET', gameKey(game.id), JSON.stringify(game), 'KEEPTTL');

  send(res, 200, {
    earned: r.earned, correct: r.correct,
    right: Q.parts.map(p => p.o[0]), explain: Q.explain,
    score, done
  });
});
