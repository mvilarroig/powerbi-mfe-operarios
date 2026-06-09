import { useEffect, useRef, useState } from 'react';

// Slicer estilo Power BI: desplegable con checkboxes. Vacío = "Todas".
export default function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };

  const active = selected.length > 0;
  const summary = selected.length === 0 ? 'Todas'
    : selected.length === 1 ? selected[0]
    : `${selected.length} seleccionados`;

  return (
    <div className="slicer" ref={ref}>
      <div className="slicer-label">{label}</div>
      <button className={`slicer-btn ${active ? 'active' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="slicer-summary">{summary}</span>
        {active
          ? <span className="slicer-x" onClick={(e) => { e.stopPropagation(); onChange([]); }} title="Quitar">✕</span>
          : <span className="slicer-caret">{open ? '▲' : '▼'}</span>}
      </button>
      {open && (
        <div className="slicer-menu">
          {selected.length > 0 && (
            <button className="slicer-clear" onClick={() => onChange([])}>Limpiar selección</button>
          )}
          {options.map((opt) => (
            <label key={opt} className="slicer-option">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
