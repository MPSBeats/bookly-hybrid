const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL;
let pool;
if (connectionString) {
  pool = new Pool({ connectionString });
}

async function findAll() {
  if (pool) {
    const { rows } = await pool.query('SELECT id, name, email FROM users ORDER BY id');
    return rows;
  }
}

async function findById(id) {
  if (pool) {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }
}

async function createOne({ name, email }) {
  if (pool) {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    return rows[0];
  }
}

async function updateOne(id, dto) {
  if (pool) {
    const allowed = ['name', 'email'];
    const keys = Object.keys(dto).filter(k => allowed.includes(k));
    if (keys.length === 0) return findById(id);
    const set = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...keys.map(k => dto[k])];
    const { rows } = await pool.query(
      `UPDATE users SET ${set} WHERE id = $1 RETURNING id, name, email`,
      values
    );
    return rows[0] || null;
  }
}

async function deleteOne(id) {
  if (pool) {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
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
