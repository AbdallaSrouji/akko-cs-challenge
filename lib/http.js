export function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(data);
}

export function body(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

export function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

// Wraps a handler: enforces the HTTP method and turns thrown errors into JSON 500s.
export function route(method, fn) {
  return async (req, res) => {
    if (req.method !== method) return send(res, 405, { error: 'Method not allowed' });
    try {
      await fn(req, res);
    } catch (e) {
      console.error(e);
      send(res, 500, { error: e.message || 'Server error' });
    }
  };
}
