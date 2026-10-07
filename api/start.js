import { randomUUID } from 'node:crypto';
import { redis, gameKey } from '../lib/redis.js';
import { publicQuestions } from '../lib/questions.js';
import { send, body, clean, route } from '../lib/http.js';

// POST {team, school, members, lang} -> {id, questions}
export default route('POST', async (req, res) => {
  const b = body(req);
  const team = clean(b.team, 40), school = clean(b.school, 60), members = clean(b.members, 120);
  const lang = b.lang === 'cs' ? 'cs' : 'java';
  if (!team || !school) return send(res, 400, { error: 'יש למלא שם צוות ושם בית ספר.' });

  const id = randomUUID();
  const game = { id, team, school, members, lang, started: Date.now(), results: {} };
  await redis('SET', gameKey(id), JSON.stringify(game), 'EX', 60 * 60 * 48);
  send(res, 200, { id, questions: publicQuestions() });
});
