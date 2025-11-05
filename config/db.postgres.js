import { Pool } from 'pg';
import { POSTGRES_URI } from '../env.js';

export const pool = new Pool({
    connectionString: POSTGRES_URI,
});

export async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Postgres connecté:', res.rows[0]);
    } catch (err) {
        console.error('Erreur connexion Postgres:', err);
        throw err;
    }
}