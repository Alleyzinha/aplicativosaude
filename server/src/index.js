require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres em server/.env.');
}

const cors = require('cors');
const express = require('express');
const db = require('./db');
const { fruityviceProxy } = require('../fruityviceProxy.cjs');
const authRouter = require('./auth');
const glucoseRouter = require('./glucose');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:8081')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origem não permitida.'));
} }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', async (_req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) { next(error); }
});
app.use('/api/auth', authRouter);
app.use('/api/glucose', glucoseRouter);
app.get('/api/fruits', fruityviceProxy);
app.get('/api/emergency/ubs', async (req, res, next) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Localização inválida.' });
    }
    const radius = Math.min(15000, Math.max(1000, Number(req.query.radius) || 5000));
    const query = `[out:json][timeout:20];(nwr[amenity=clinic](around:${radius},${latitude},${longitude});nwr[healthcare=clinic](around:${radius},${latitude},${longitude});nwr[amenity=hospital](around:${radius},${latitude},${longitude}););out center tags 30;`;
    const upstream = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(25000),
    });
    if (!upstream.ok) throw new Error('Overpass indisponível');
    const data = await upstream.json();
    const items = (data.elements || []).map((item) => {
      const lat = item.lat ?? item.center?.lat;
      const lon = item.lon ?? item.center?.lon;
      if (!lat || !lon) return null;
      const tags = item.tags || {};
      const latDiff = (Number(lat) - latitude) * Math.PI / 180;
      const lonDiff = (Number(lon) - longitude) * Math.PI / 180;
      const lat1 = latitude * Math.PI / 180;
      const lat2 = Number(lat) * Math.PI / 180;
      const a = Math.sin(latDiff / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDiff / 2) ** 2;
      const distanceMeters = Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      return {
        id: String(item.id), name: tags.name || tags['name:pt'] || 'Unidade de saúde',
        address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:suburb']].filter(Boolean).join(', ') || 'Endereço não informado',
        phone: tags.phone || tags['contact:phone'] || '', latitude: Number(lat), longitude: Number(lon),
        distanceMeters, isHospital: tags.amenity === 'hospital',
      };
    }).filter(Boolean).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 20);
    res.json({ units: items });
  } catch (error) { next(error); }
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Não foi possível concluir a solicitação.' });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => console.log(`API disponível na porta ${port}.`));

async function shutdown() {
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
