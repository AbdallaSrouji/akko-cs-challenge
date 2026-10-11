/* Offline build only: stands in for the api/ endpoints, storing everything in this browser.
   Uses QUESTIONS / publicQuestions / applyAnswer from lib/questions.js and load/save from app.js. */
const LOCAL_API = (() => {
  const KB = 'akkoCS_board_v1', KG = 'akkoCS_local_games_v2';
  const board = () => load(KB, []);
  const sorted = b => b.sort((a, c) => c.score - a.score || a.time - c.time || a.date - c.date);
  return {
    async start(d) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const games = load(KG, {});
      games[id] = { id, team: d.team, school: d.school, members: d.members, lang: d.lang, started: Date.now(), results: {} };
      save(KG, games);
      return { id, questions: publicQuestions() };
    },
    async answer(d) {
      const games = load(KG, {}), game = games[d.id];
      if (!game) throw new Error('המשחק לא נמצא.');
      // `finish` ends the game early; otherwise one answer is scored (see api/answer.js).
      const { result, record, score } = d.finish ? finishGame(game) : applyAnswer(game, d.q, d.answers, !!d.skip);
      if (record) {
        // The row is saved after the main questions and updated after every bonus answer.
        save(KB, [...board().filter(r => r.id !== record.id), record]);
      }
      if (d.finish || result.done) delete games[d.id];
      save(KG, games);
      return d.finish ? { score } : result;
    },
    async scores() { return { board: sorted(board()) }; },
    async admin(d) {
      if (d.action === 'delete') save(KB, board().filter(r => r.id !== d.id));
      if (d.action === 'clear') save(KB, []);
      if (d.action === 'import') {
        const b = board(); let added = 0;
        (Array.isArray(d.records) ? d.records : []).forEach(r => {
          if (r && r.id && typeof r.score === 'number' && Array.isArray(r.per) && !b.some(x => x.id === r.id)) { b.push(r); added++; }
        });
        save(KB, b);
        return { ok: true, added };
      }
      return { ok: true };
    }
  };
})();
