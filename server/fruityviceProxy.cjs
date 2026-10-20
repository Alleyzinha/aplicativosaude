const FRUITYVICE_URL = 'https://www.fruityvice.com/api/fruit/all';

async function fruityviceProxy(_request, response) {
  if (_request.method !== 'GET') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET');
    response.end();
    return;
  }
  try {
    const upstream = await fetch(FRUITYVICE_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    const body = await upstream.text();
    response.statusCode = upstream.status;
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(body);
  } catch {
    response.statusCode = 502;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ error: 'Não foi possível consultar Fruityvice.' }));
  }
}

module.exports = { fruityviceProxy };
