import { useEffect, useRef, useState } from 'react';

// Etiquetas legibles para cada tenant_id.
const LABELS = {
  TENANT_ALIM:  'Alimentación',
  TENANT_AUTO:  'Automoción',
  TENANT_FARMA: 'Farmacéutico',
};
const labelOf = (t) => LABELS[t] || t;

// Selector de SECTOR (tenant_id) en la barra superior. Se aplica al instante.
export default function SectorSelect({ tenants = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = (t) =>
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);

  const summary = selected.length === 0 ? 'Todos'
    : selected.length === 1 ? labelOf(selected[0])
    : `${selected.length} sectores`;

  return (
    <div className="sector-select" ref={ref}>
      <button className={`tool-btn sector-btn${selected.length ? ' active' : ''}`} onClick={() => setOpen((o) => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
        <span>Sector: {summary}</span>
        <span className="sector-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="sector-menu">
          {selected.length > 0 && (
            <button className="slicer-clear" onClick={() => onChange([])}>Todos los sectores</button>
          )}
          {tenants.map((t) => (
            <label key={t} className="slicer-option">
              <input type="checkbox" checked={selected.includes(t)} onChange={() => toggle(t)} />
              <span>{labelOf(t)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
