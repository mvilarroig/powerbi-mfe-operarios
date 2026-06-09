// Construcción del FROM + WHERE compartido por todos los endpoints de Mano de Obra.
// Cada filtro del panel del PBI se mapea aquí a una columna/expresión SQL.

// FROM con todas las dimensiones unidas por código + tenant (igual que las relaciones del PBI).
export const FROM_LABOUR = `
  from rpt_labour_summary l
  left join tqt_plants        p   on p.plant_code     = l.plant_code     and p.tenant_id   = l.tenant_id
  left join tqt_areas         ar  on ar.area_code     = l.area_code      and ar.tenant_id  = l.tenant_id
  left join tqt_machines      mac on mac.machine_code = l.machine_code   and mac.tenant_id = l.tenant_id
  left join tqt_materials     mat on mat.material_code= l.material_code  and mat.tenant_id = l.tenant_id
  left join tqt_activity_types act on act.activity_code = l.activity_code and act.tenant_id = l.tenant_id
  left join tqt_shifts        sh  on sh.shift_code    = l.shift_code     and sh.tenant_id  = l.tenant_id
  left join tqt_employees     e   on e.emp_code       = l.emp_code       and e.tenant_id   = l.tenant_id
`;

// Mapa: nombre de parámetro de la query → expresión SQL sobre la que filtrar.
const FIELD = {
  tenant:   'l.tenant_id',
  year:     'extract(year  from l.production_date)::int',
  month:    'extract(month from l.production_date)::int',
  day:      'extract(day   from l.production_date)::int',
  region:   'p.region',
  country:  'p.country',
  city:     'p.city',
  plant:    'p.name',
  area:     'ar.area_name',
  machine:  'mac.machine_name',
  material: 'mat.material_name',
  activity: 'act.activity_name',
  shift:    'sh.shift_name',
  employee: 'e.emp_name',
};

const NUMERIC = new Set(['year', 'month', 'day']);

// Devuelve { where, values } a partir de los query params (?region=Europa&area=A,B...).
export function buildWhere(qs) {
  const conditions = [];
  const values = [];

  for (const [key, expr] of Object.entries(FIELD)) {
    const raw = qs[key];
    if (raw === undefined || raw === '') continue;
    const list = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) continue;
    values.push(NUMERIC.has(key) ? list.map(Number) : list);
    const cast = NUMERIC.has(key) ? 'int[]' : 'text[]';
    conditions.push(`${expr} = any($${values.length}::${cast})`);
  }

  // Rango de fechas (dateFrom / dateTo) — del selector de calendario.
  // Comparamos por día completo (::date) para que el día final quede incluido
  // aunque production_date llevara hora.
  if (qs.dateFrom && String(qs.dateFrom).match(/^\d{4}-\d{2}-\d{2}$/)) {
    values.push(qs.dateFrom);
    conditions.push(`l.production_date::date >= $${values.length}::date`);
  }
  if (qs.dateTo && String(qs.dateTo).match(/^\d{4}-\d{2}-\d{2}$/)) {
    values.push(qs.dateTo);
    conditions.push(`l.production_date::date <= $${values.length}::date`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  return { where, values };
}
