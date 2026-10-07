import { readBoard } from '../lib/redis.js';
import { send, route } from '../lib/http.js';

// GET -> sorted leaderboard
export default route('GET', async (req, res) => {
  send(res, 200, { board: await readBoard() });
});
