// Conexión a PostgreSQL (qplantreports). Un único pool reutilizado por todas las rutas.
import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

export const query = (text, params) => pool.query(text, params);
