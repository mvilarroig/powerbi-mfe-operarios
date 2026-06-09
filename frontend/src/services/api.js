// Cliente HTTP mínimo contra la API de Mano de Obra.
// Convierte el objeto de filtros { region:[...], area:[...] } en query string CSV.

const BASE = '/api';

function toQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (Array.isArray(val) && val.length) params.set(key, val.join(','));
    else if (!Array.isArray(val) && val !== undefined && val !== null && val !== '') {
      params.set(key, String(val));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function get(path, filters) {
  const res = await fetch(`${BASE}${path}${toQuery(filters)}`);
  if (!res.ok) throw new Error(`API ${res.status} en ${path}`);
  return res.json();
}

export const getOptions    = ()        => get('/options');
export const getKpis       = (f)       => get('/kpis', f);
export const getByLevel    = (f, lvl)  => get('/by-level', { ...f, level: lvl });
export const getTypology   = (f)       => get('/typology', f);
export const getEfficiency = (f)       => get('/efficiency', f);
export const getTrend       = (f)       => get('/trend', f);
