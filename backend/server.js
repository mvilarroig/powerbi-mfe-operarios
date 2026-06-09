// API de la página "Mano de Obra Directa / Indirecta".
// Traduce las medidas DAX del PBI a SQL sobre PostgreSQL (qplantreports).
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { query } from './db.js';
import { FROM_LABOUR, buildWhere } from './filters.js';

const app = express();
app.use(cors());

const PORT = Number(process.env.PORT ?? 4000);

// Niveles del drill del gráfico "Horas Directas por Niveles" (igual jerarquía que el PBI).
const LEVELS = [
  { key: 'region',   expr: 'p.region' },
  { key: 'country',  expr: 'p.country' },
  { key: 'city',     expr: 'p.city' },
  { key: 'area',     expr: 'ar.area_name' },
  { key: 'machine',  expr: 'mac.machine_name' },
  { key: 'material', expr: 'mat.material_name' },
];

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(`[ERROR] ${req.path}:`, e.message);
    res.status(500).json({ error: e.message });
  });

// ── KPIs: Horas Directas / Indirectas / Total (medidas DAX divididas /60) ────
app.get('/api/kpis', wrap(async (req, res) => {
  const { where, values } = buildWhere(req.query);
  const { rows } = await query(`
    select
      coalesce(sum(l.presence_minutes) filter (where l.is_direct), 0) / 60.0     as directas,
      coalesce(sum(l.presence_minutes) filter (where not l.is_direct), 0) / 60.0 as indirectas,
      coalesce(sum(l.presence_minutes), 0) / 60.0                                as total
    ${FROM_LABOUR} ${where}`, values);
  const r = rows[0];
  res.json({ directas: +r.directas, indirectas: +r.indirectas, total: +r.total });
}));

// ── Gráfico "Horas Directas por Niveles" (drill jerárquico) ──────────────────
app.get('/api/by-level', wrap(async (req, res) => {
  const idx = Math.max(0, Math.min(LEVELS.length - 1, Number(req.query.level ?? 0)));
  const level = LEVELS[idx];
  const { where, values } = buildWhere(req.query);
  const { rows } = await query(`
    select ${level.expr} as label,
           coalesce(sum(l.presence_minutes) filter (where l.is_direct), 0) / 60.0 as horas
    ${FROM_LABOUR} ${where}
    group by ${level.expr}
    having ${level.expr} is not null
    order by horas desc`, values);
  res.json({ level: level.key, levelIndex: idx, data: rows.map((r) => ({ label: r.label, horas: +r.horas })) });
}));

// ── Donut "Tipología de Mano de Obra Indirecta" (horas indirectas por actividad) ─
app.get('/api/typology', wrap(async (req, res) => {
  const { where, values } = buildWhere(req.query);
  const base = where ? `${where} and not l.is_direct` : 'where not l.is_direct';
  const { rows } = await query(`
    select act.activity_name as label,
           coalesce(sum(l.presence_minutes), 0) / 60.0 as horas
    ${FROM_LABOUR} ${base}
    group by act.activity_name
    having act.activity_name is not null
    order by horas desc`, values);
  res.json(rows.map((r) => ({ label: r.label, horas: +r.horas })));
}));

// ── Barras "Eficiencia por Persona" = Horas Estándar / Horas Presencia ───────
app.get('/api/efficiency', wrap(async (req, res) => {
  const { where, values } = buildWhere(req.query);
  const { rows } = await query(`
    select e.emp_name as label,
           sum(l.standard_minutes) / nullif(sum(l.presence_minutes), 0) as ef
    ${FROM_LABOUR} ${where}
    group by e.emp_name
    having e.emp_name is not null and sum(l.presence_minutes) > 0
    order by ef desc`, values);
  // "Total Empleados" = COUNTROWS(ALL tqt_employees) — sin filtrar.
  const { rows: tot } = await query(`select count(*)::int n from tqt_employees`);
  res.json({ totalEmployees: tot[0].n, data: rows.map((r) => ({ label: r.label, ef: +r.ef })) });
}));

// ── Evolución mensual de Horas (Directa vs Indirecta) ────────────────────────
app.get('/api/trend', wrap(async (req, res) => {
  const { where, values } = buildWhere(req.query);
  const { rows } = await query(`
    select to_char(date_trunc('month', l.production_date), 'YYYY-MM') as ym,
           coalesce(sum(l.presence_minutes) filter (where l.is_direct), 0) / 60.0     as directas,
           coalesce(sum(l.presence_minutes) filter (where not l.is_direct), 0) / 60.0 as indirectas
    ${FROM_LABOUR} ${where}
    group by 1 order by 1`, values);
  res.json(rows.map((r) => ({ ym: r.ym, directas: +r.directas, indirectas: +r.indirectas })));
}));

// ── Opciones para los slicers del panel de filtros ───────────────────────────
app.get('/api/options', wrap(async (_req, res) => {
  const [years, plants, areas, materials, activities, shifts, tenants] = await Promise.all([
    query(`select distinct extract(year from production_date)::int y from rpt_labour_summary order by y`),
    query(`select distinct region, country, name from tqt_plants order by region, country, name`),
    query(`select distinct area_name from tqt_areas where area_name is not null order by 1`),
    query(`select distinct material_name from tqt_materials where material_name is not null order by 1`),
    query(`select distinct activity_name from tqt_activity_types where activity_name is not null order by 1`),
    query(`select distinct shift_name from tqt_shifts where shift_name is not null order by 1`),
    query(`select distinct tenant_id from rpt_labour_summary where tenant_id is not null order by 1`),
  ]);
  res.json({
    years: years.rows.map((r) => r.y),
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    plants: plants.rows,
    areas: areas.rows.map((r) => r.area_name),
    materials: materials.rows.map((r) => r.material_name),
    activities: activities.rows.map((r) => r.activity_name),
    shifts: shifts.rows.map((r) => r.shift_name),
    tenants: tenants.rows.map((r) => r.tenant_id),
  });
}));

app.get('/api/health', wrap(async (_req, res) => {
  await query('select 1');
  res.json({ ok: true });
}));

app.listen(PORT, () => console.log(`✅ API Mano de Obra escuchando en http://localhost:${PORT}`));
