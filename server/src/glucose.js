const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('./db');

const router = express.Router();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Faça login novamente.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = Number(payload.sub);
    next();
  } catch {
    return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
  }
}

const readingSchema = z.object({
  value: z.union([z.number(), z.string()]).transform((value) => Number(String(value).replace(',', '.')))
    .refine((value) => Number.isFinite(value) && value >= 20 && value <= 800, 'Informe uma glicemia válida.'),
  context: z.enum(['Jejum', 'Pré-refeição', 'Após refeição', 'Ao dormir', 'Outro']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().trim().max(300).optional().default(''),
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, value, context, date, time, note, created_at FROM glucose_readings WHERE user_id = ? ORDER BY date DESC, time DESC, id DESC',
      [req.userId]
    );
    res.json({ readings: rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const parsed = readingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Confira os dados da medida.' });
  try {
    const { value, context, date, time, note } = parsed.data;
    const [result] = await db.execute(
      'INSERT INTO glucose_readings (user_id, value, context, date, time, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, value, context, date, time, note]
    );
    const [rows] = await db.execute(
      'SELECT id, value, context, date, time, note, created_at FROM glucose_readings WHERE id = ? AND user_id = ?',
      [result.insertId, req.userId]
    );
    res.status(201).json({ reading: rows[0] });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const parsed = readingSchema.safeParse(req.body);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Medida inválida.' });
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Confira os dados da medida.' });
  try {
    const { value, context, date, time, note } = parsed.data;
    const [result] = await db.execute(
      'UPDATE glucose_readings SET value = ?, context = ?, date = ?, time = ?, note = ? WHERE id = ? AND user_id = ?',
      [value, context, date, time, note, id, req.userId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Medida não encontrada.' });
    const [rows] = await db.execute(
      'SELECT id, value, context, date, time, note, created_at FROM glucose_readings WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    res.json({ reading: rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    const [result] = await db.execute('DELETE FROM glucose_readings WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Medida não encontrada.' });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

module.exports = router;
