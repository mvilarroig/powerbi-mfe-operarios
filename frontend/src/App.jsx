import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOptions, getKpis, getByLevel, getTypology, getEfficiency, getTrend } from './services/api.js';
import FilterPanel from './components/FilterPanel.jsx';
import SectorSelect from './components/SectorSelect.jsx';
import KpiCard from './components/KpiCard.jsx';
import LevelBar from './components/charts/LevelBar.jsx';
import TypologyDonut from './components/charts/TypologyDonut.jsx';
import EfficiencyBar from './components/charts/EfficiencyBar.jsx';
import TrendChart from './components/charts/TrendChart.jsx';
import './App.css';

const LEVEL_KEYS = ['region', 'country', 'city', 'area', 'machine', 'material'];

const isEmptyVal = (v) => !((Array.isArray(v) && v.length) || (typeof v === 'string' && v));

// Compara dos objetos de filtros ignorando claves vacías.
function sameFilters(a, b) {
  const norm = (o) => Object.entries(o).filter(([, v]) => !isEmptyVal(v))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? [...v].sort().join('|') : v}`).sort().join('&');
  return norm(a) === norm(b);
}

export default function App() {
  const [options, setOptions] = useState(null);
  const [draft, setDraft]     = useState({});    // edición en el panel izquierdo
  const [filters, setFilters] = useState({});    // filtros YA aplicados (alimentan la API)
  const [drillPath, setDrill] = useState([]);    // drill del gráfico por niveles
  const [sector, setSector]   = useState([]);    // SECTOR (tenant_id) — barra superior, instantáneo
  const [data, setData]       = useState({ kpis: null, level: null, typology: [], efficiency: null, trend: [] });
  const [error, setError]     = useState(null);
  const [theme, setTheme]     = useState(() => localStorage.getItem('mo-theme') || 'light');

  const dark = theme === 'dark';

  useEffect(() => { localStorage.setItem('mo-theme', theme); }, [theme]);

  const setFilter = useCallback((key, value) => {
    setDraft((f) => ({ ...f, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => { setFilters(draft); }, [draft]);
  const clearFilters = useCallback(() => { setDraft({}); setFilters({}); setDrill([]); setSector([]); }, []);

  const dirty = !sameFilters(draft, filters);          // hay cambios sin aplicar
  const hasFilters = Object.values(draft).some((v) => !isEmptyVal(v)) || drillPath.length > 0 || sector.length > 0;

  // Filtros aplicados + sector (instantáneo) + filtros acumulados por el drill.
  const combined = useMemo(() => {
    const merged = { ...filters };
    if (sector.length) merged.tenant = sector;
    for (const step of drillPath) merged[step.key] = [step.value];
    return merged;
  }, [filters, sector, drillPath]);

  const levelIndex = drillPath.length;

  useEffect(() => { getOptions().then(setOptions).catch((e) => setError(e.message)); }, []);

  useEffect(() => {
    let alive = true;
    setError(null);
    Promise.all([
      getKpis(combined),
      getByLevel(combined, levelIndex),
      getTypology(combined),
      getEfficiency(combined),
      getTrend(combined),
    ]).then(([kpis, level, typology, efficiency, trend]) => {
      if (alive) setData({ kpis, level, typology, efficiency, trend });
    }).catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [combined, levelIndex]);

  const drillDown = (value) => {
    if (levelIndex < LEVEL_KEYS.length - 1) setDrill((p) => [...p, { key: LEVEL_KEYS[levelIndex], value }]);
  };
  const drillUp = () => setDrill((p) => p.slice(0, -1));
  const drillTo = (len) => setDrill((p) => p.slice(0, len));

  return (
    <div className={`app ${dark ? 'dark' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-tai">tai</span>
          <span className="brand-sub">smart<br />factory</span>
        </div>
        <h1 className="topbar-title">MANO DE OBRA DIRECTA / INDIRECTA</h1>
        <div className="topbar-actions">
          <SectorSelect tenants={options?.tenants || []} selected={sector} onChange={setSector} />
          <button className="tool-btn" onClick={() => setTheme(dark ? 'light' : 'dark')} title="Cambiar tema">
            {dark ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
        </div>
      </header>

      <div className="layout">
        <FilterPanel options={options} filters={draft} setFilter={setFilter}
          onApply={applyFilters} onClear={clearFilters} hasFilters={hasFilters} dirty={dirty} />

        <main className="content">
          {error && <div className="error-banner">⚠ {error}</div>}

          <section className="kpi-row">
            <KpiCard title="Horas Directas"        value={data.kpis?.directas}   icon="🕒" accent="#4f7cff" />
            <KpiCard title="Horas Indirectas"      value={data.kpis?.indirectas} icon="⚙️" accent="#f59e0b" />
            <KpiCard title="Horas Totales (D + I)" value={data.kpis?.total}      icon="∑"  accent="#10b981" />
          </section>

          {data.level && (
            <LevelBar levelIndex={data.level.levelIndex} data={data.level.data}
              path={drillPath.map((s) => s.value)}
              onDrill={drillDown} onJump={drillTo} dark={dark} />
          )}

          {data.trend?.length > 0 && <TrendChart data={data.trend} dark={dark} />}

          <section className="bottom-row">
            <TypologyDonut data={data.typology} dark={dark} />
            {data.efficiency && (
              <EfficiencyBar data={data.efficiency.data} totalEmployees={data.efficiency.totalEmployees} dark={dark} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
