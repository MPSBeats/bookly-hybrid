// Postgres-backed Book model with in-memory fallback.
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL;
let pool;
if (connectionString) {
  pool = new Pool({ connectionString });
}

async function findAll() {
  if (pool) {
    const { rows } = await pool.query('SELECT id, title, author, available FROM books ORDER BY id');
    return rows;
  }
}

async function findById(id) {
  if (pool) {
    const { rows } = await pool.query('SELECT id, title, author, available FROM books WHERE id = $1', [id]);
    return rows[0] || null;
  }
}

async function createOne({ title, author, available = true }) {
  if (pool) {
    const { rows } = await pool.query(
      'INSERT INTO books (title, author, available) VALUES ($1, $2, $3) RETURNING id, title, author, available',
      [title, author, available]
    );
    return rows[0];
  }
}

async function updateOne(id, dto) {
  if (pool) {
    const allowed = ['title', 'author', 'available'];
    const keys = Object.keys(dto).filter(k => allowed.includes(k));
    if (keys.length === 0) return findById(id);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...keys.map(k => dto[k])];
    const { rows } = await pool.query(
      `UPDATE books SET ${set} WHERE id = $1 RETURNING id, title, author, available`,
      values
    );
    return rows[0] || null;
  }
}

async function deleteOne(id) {
  if (pool) {
    const { rows } = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  }
}

module.exports = {
  findAll,
  findById,
  createOne,
  updateOne,
  deleteOne,
  _pool: pool,
};
