import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db';

const dir = fileURLToPath(new URL('./migrations/', import.meta.url));
const db = await pool.connect();
try {
  await db.query('SELECT pg_advisory_lock(873114)');
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const name of (await readdir(dir)).filter((x) => x.endsWith('.sql')).sort()) {
    if ((await db.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name])).rowCount) continue;
    await db.query('BEGIN');
    try {
      await db.query(await readFile(join(dir, name), 'utf8'));
      await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await db.query('COMMIT');
      process.stdout.write('Applied ' + name + '\n');
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    }
  }
} finally {
  await db.query('SELECT pg_advisory_unlock(873114)');
  db.release();
  await pool.end();
}
