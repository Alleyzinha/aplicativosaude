const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('./db');

const router = express.Router();
const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const accountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: z.string().min(6).max(128),
  age: z.union([z.string(), z.number()]).optional().nullable(),
  weight: z.union([z.string(), z.number()]).optional().nullable(),
  height: z.union([z.string(), z.number()]).optional().nullable(),
  bloodType: z.string().max(3).optional().nullable(),
});
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
const bloodTypes = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

function optionalNumber(value, min, max) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) && number >= min && number <= max ? number : NaN;
}

function publicUser(row) {
  return {
    id: String(row.id), name: row.name, email: row.email,
    age: row.age == null ? '' : String(row.age),
    weight: row.weight == null ? null : Number(row.weight),
    height: row.height == null ? null : Number(row.height),
    bloodType: row.blood_type || '',
  };
}

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', async (req, res, next) => {
  const parsed = accountSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Confira os dados do cadastro.' });
  const input = parsed.data;
  const age = optionalNumber(input.age, 1, 130);
  const weight = optionalNumber(input.weight, 0.01, 500);
  const height = optionalNumber(input.height, 40, 250);
  const bloodType = input.bloodType || null;
  if ([age, weight, height].some(Number.isNaN) || (bloodType && !bloodTypes.has(bloodType))) {
    return res.status(400).json({ message: 'Confira idade, peso, altura e tipo sanguíneo.' });
  }

  try {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, age, weight, height, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [input.name, input.email, passwordHash, age, weight, height, bloodType],
    );
    const user = { id: result.insertId, name: input.name, email: input.email, age, weight, height, blood_type: bloodType };
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Este e-mail já possui cadastro.' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Informe um e-mail e uma senha válidos.' });
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, password_hash, age, weight, height, blood_type FROM users WHERE email = ? LIMIT 1',
      [parsed.data.email],
    );
    if (!rows.length || !(await bcrypt.compare(parsed.data.password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }
    return res.json({ token: issueToken(rows[0]), user: publicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
