require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres em server/.env.');
}

const cors = require('cors');
const express = require('express');
const db = require('./db');
const { fruityviceProxy } = require('../fruityviceProxy.cjs');
const authRouter = require('./auth');

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
app.get('/api/fruits', fruityviceProxy);
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
