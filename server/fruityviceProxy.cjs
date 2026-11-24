const fs = require('node:fs');
const path = require('node:path');

const FRUITYVICE_URL = 'https://www.fruityvice.com/api/fruit/all';
const LOCAL_FRUITS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'fruits.json'), 'utf8'));

function isValidFruit(fruit) {
  if (!fruit || typeof fruit.name !== 'string' || !fruit.nutritions) return false;
  return ['calories', 'carbohydrates', 'protein', 'fat', 'sugar']
    .every((key) => Number.isFinite(Number(fruit.nutritions[key])));
}

function sendLocalCatalog(response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Fruit-Catalog-Source', 'local-fallback');
  response.end(JSON.stringify(LOCAL_FRUITS));
}

async function fruityviceProxy(request, response) {
  if (request.method !== 'GET') {
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
    const fruits = upstream.ok ? JSON.parse(body) : null;

    if (!Array.isArray(fruits) || fruits.filter(isValidFruit).length < 41) {
      sendLocalCatalog(response);
      return;
    }

    response.statusCode = upstream.status;
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Fruit-Catalog-Source', 'fruityvice');
    response.end(body);
  } catch {
    sendLocalCatalog(response);
  }
}

module.exports = { fruityviceProxy };
