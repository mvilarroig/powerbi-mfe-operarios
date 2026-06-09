import MultiSelect from './MultiSelect.jsx';
import CalendarPicker from './CalendarPicker.jsx';

export default function FilterPanel({ options, filters, setFilter, onApply, onClear, hasFilters, dirty }) {
  const arrActive = Object.values(filters).filter((v) => Array.isArray(v) && v.length).length;
  const dateActive = filters.dateFrom || filters.dateTo ? 1 : 0;
  const activeCount = arrActive + dateActive;

  return (
    <aside className="filter-panel">
      <div className="filter-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>Filtros</span>
        {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
      </div>

      <div className="slicers">
        {!options ? (
          <div className="slicer-loading">Cargando…</div>
        ) : (
          <>
            <CalendarPicker
              dateFrom={filters.dateFrom || null}
              dateTo={filters.dateTo || null}
              onDateFromChange={(v) => setFilter('dateFrom', v)}
              onDateToChange={(v) => setFilter('dateTo', v)}
            />

            <div className="slicer-divider" />

            <MultiSelect label="Planta / Región" options={options.plants.map((p) => p.name)}
              selected={filters.plant || []} onChange={(v) => setFilter('plant', v)} />

            <div className="slicer-divider" />

            <MultiSelect label="Área" options={options.areas}
              selected={filters.area || []} onChange={(v) => setFilter('area', v)} />
            <MultiSelect label="Producto" options={options.materials}
              selected={filters.material || []} onChange={(v) => setFilter('material', v)} />
            <MultiSelect label="Tipología" options={options.activities}
              selected={filters.activity || []} onChange={(v) => setFilter('activity', v)} />
            <MultiSelect label="Turnos" options={options.shifts}
              selected={filters.shift || []} onChange={(v) => setFilter('shift', v)} />
          </>
        )}
      </div>

      <div className="filter-actions">
        <button className={`filter-apply-btn${dirty ? ' dirty' : ''}`} onClick={onApply} disabled={!dirty}>
          {dirty ? '✓ Aplicar filtros' : 'Filtros aplicados'}
        </button>
        <button className="filter-clear-btn" onClick={onClear} disabled={!hasFilters}>
          ⨯ Limpiar todos los filtros
        </button>
      </div>
    </aside>
  );
}
